"""训练配方编排器：一条命令跑完「护栏 → 建集 → 指纹 → 训练 → 跨域评估 → 锁文件」。

设计目标：把 T2（训推一致化 + 翻拍增强）从"一次性手工命令"变成**可复现配方**。
在它之前，T1/T2 数据集的构建命令没有任何记录 —— 换台机器就重建不出来。

六个阶段（`--stages` 可选子集）：

  guard   从 `backend/configs/default.yaml` 读产品预处理参数，与配方期望值断言。
          **不一致直接 FATAL** —— 训推不一致是本项目第一大坑，必须挡在训练前。
  build   按配方重建数据集（train/val）+ 代理评估域（E2/E2b），全部确定性。
  fp      对产出目录做 sha256 指纹（逐文件 + 汇总），写 dataset_fingerprint.json。
  train   ultralytics 训练，产物落 runs/recipe/<name>/。
  eval    跨域矩阵（复用 eval_cross_domain 的评估语义）。
  lock    汇总「配方哈希 + 有效参数 + 数据集指纹 + 指标 + 与期望值的偏差」写 recipe.lock.json。

用法::

    python scripts/train_recipe.py --recipe configs/training/t2_recipe.yaml
    python scripts/train_recipe.py --recipe ... --stages guard,build,fp     # 只建集
    python scripts/train_recipe.py --recipe ... --stages eval,lock          # 只评已训好的
    python scripts/train_recipe.py --recipe ... --out-suffix _v1            # 输出目录加后缀
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

import numpy as np
import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "scripts"))

_IMG_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}
ALL_STAGES = ["guard", "build", "fp", "train", "eval", "lock"]


def log(msg: str) -> None:
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


# ─────────────────────────── guard ───────────────────────────

def stage_guard(recipe: dict) -> dict:
    """从产品配置读预处理参数，与配方期望值比对。不一致 = 训推会不一致 = FATAL。"""
    align = recipe["build"]["align"]
    cfg_path = ROOT / align["expect_product_config"]
    if not cfg_path.exists():
        raise SystemExit(f"[FATAL] 产品配置不存在: {cfg_path}")
    prod = yaml.safe_load(cfg_path.read_text(encoding="utf-8"))
    pp = prod.get("preprocess")
    if not isinstance(pp, dict):
        raise SystemExit(f"[FATAL] {cfg_path} 缺 preprocess 段")

    expect = align["expect"]
    mismatches = []
    for k, v in expect.items():
        got = pp.get(k)
        if got is None:
            mismatches.append(f"{k}: 产品配置缺该键（期望 {v}）")
        elif abs(float(got) - float(v)) > 1e-9:
            mismatches.append(f"{k}: 产品={got} 期望={v}")

    if mismatches:
        print("[FATAL] 训推一致化护栏未通过 —— 产品预处理已变，训练集必须同步重建：")
        for m in mismatches:
            print(f"        - {m}")
        print("        修法：改 configs/training/*.yaml 的 build.align.expect 与之一致后重跑 build。")
        raise SystemExit(2)

    log(f"guard OK · 产品预处理参数与配方一致（{len(expect)} 项）")
    return {"product_config": str(cfg_path), "checked": expect}


# ─────────────────────────── build ───────────────────────────

def _fingerprint_dir(root: Path, exclude_suffixes=(".cache",)) -> dict:
    """逐文件 sha256 + 汇总指纹。忽略 ultralytics 生成的 *.cache。"""
    files = []
    for p in sorted(root.rglob("*")):
        if not p.is_file() or p.suffix.lower() in exclude_suffixes:
            continue
        h = hashlib.sha256(p.read_bytes()).hexdigest()
        files.append((str(p.relative_to(root)).replace("\\", "/"), h, p.stat().st_size))

    lines = [f"{rel}\t{h}\t{sz}" for rel, h, sz in files]
    digest = hashlib.sha256("\n".join(lines).encode("utf-8")).hexdigest()
    return {
        "n_files": len(files),
        "total_bytes": sum(sz for _, _, sz in files),
        "fingerprint": digest,
        "files": {rel: h for rel, h, _ in files},
    }


def _build_split(src_root: Path, out_root: Path, split: str, mode: str,
                 strength: float, jitter: float, seed: int) -> None:
    """生成一个 split 的图片（+ 原样复制标签）。

    mode:
      pipeline  训推一致化（过产品同款预处理管线）
      photo     一致化 + 翻拍模拟
      copy      原样复制 —— 用于"数据集由别的脚本产出"的场景
                （如 `synth_root_defects.py` 在 T2 之上叠加合成长尾类）。
                **仍会走 guard/指纹/训练/评估**，只是不再改像素。
    """
    from domain_align import _make_preprocessor, _read_gray, _write_gray, simulate_photo, to_inference_domain

    src_img = src_root / "images" / split
    src_lab = src_root / "labels" / split
    dst_img = out_root / "images" / split
    dst_lab = out_root / "labels" / split
    dst_img.mkdir(parents=True, exist_ok=True)
    dst_lab.mkdir(parents=True, exist_ok=True)

    files = sorted(p for p in src_img.iterdir() if p.is_file() and p.suffix.lower() in _IMG_EXT)
    if not files:
        raise SystemExit(f"[FATAL] 源图片为空: {src_img}")

    if mode == "copy":
        for p in files:
            shutil.copy2(p, dst_img / p.name)
    else:
        pp = _make_preprocessor()
        rng = np.random.default_rng(seed)
        for p in files:
            g = _read_gray(p)
            out = to_inference_domain(g, pp)
            if mode == "photo":
                s = strength
                if jitter > 0:
                    s = float(np.clip(strength + rng.uniform(-jitter, jitter), 0.0, 1.0))
                out = simulate_photo(out, rng, s)
            _write_gray(dst_img / (p.stem + ".jpg"), out)

    n_lab = 0
    for f in sorted(src_lab.glob("*.txt")):
        shutil.copy2(f, dst_lab / f.name)
        n_lab += 1
    log(f"  build {split} ({mode}): {len(files)} 图 / {n_lab} 标签 -> {out_root}")


def _write_data_yaml(out_root: Path, recipe: dict, title: str) -> None:
    names = ["气孔", "夹渣", "未焊透", "未熔合", "裂纹", "咬边", "内凹"]
    txt = (
        f"# {title}\n"
        f"# 由 scripts/train_recipe.py 按 configs/training/*.yaml 生成 —— 请勿手工编辑。\n"
        f"# 类别顺序对齐 backend/domain/dto.py 的 DefectClass（权威口径）。\n"
        f"path: {out_root.as_posix()}\n"
        f"train: images/train\n"
        f"val: images/val\n"
        f"nc: {len(names)}\n"
        f"names:\n" + "".join(f"  {i}: {n}\n" for i, n in enumerate(names))
    )
    (out_root / "data.yaml").write_text(txt, encoding="utf-8")


def stage_build(recipe: dict) -> dict:
    b = recipe["build"]
    src = ROOT / b["source"]
    out = ROOT / b["output"]
    mode = b["align"]["mode"]
    strength = float(b["photo"]["strength"])
    jitter = float(b["photo"]["jitter"])
    seed = int(b["photo"]["train_seed"])

    # ── verify：数据集由别的脚本产出（如 synth_root_defects.py），本步只校验不改动 ──
    # 若误用 copy 会**覆盖掉**那些脚本刚加进去的内容，所以单列一个模式。
    if mode == "verify":
        need = ["data.yaml", "images/train", "labels/train", "images/val", "labels/val"]
        missing = [n for n in need if not (out / n).exists()]
        if missing:
            raise SystemExit(f"[FATAL] 数据集不完整（缺 {missing}）: {out}\n"
                             f"        若是合成集，请先跑 scripts/synth_root_defects.py")
        for split in ("train", "val"):
            n = sum(1 for x in (out / "images" / split).iterdir() if x.suffix.lower() in _IMG_EXT)
            nl = len(list((out / "labels" / split).glob("*.txt")))
            if n == 0:
                raise SystemExit(f"[FATAL] {split} 图像为空: {out / 'images' / split}")
            log(f"  build verify {split}: {n} 图 / {nl} 标签（原样保留）")
        log(f"build 完成（verify，未改动）-> {out}")
        return {"output": str(out), "mode": mode, "strength": strength,
                "jitter": jitter, "seed": seed, "proxies": {}}

    if not (src / "images" / "train").exists():
        raise SystemExit(f"[FATAL] 源数据集不完整: {src}")

    # 主数据集：train 带强度抖动，val 用固定强度（自评需确定性）
    _build_split(src, out, "train", mode, strength, jitter, seed)
    _build_split(src, out, "val", mode, strength, 0.0, seed)
    _write_data_yaml(out, recipe, f"{recipe['name']} · 训推一致化+翻拍增强")

    # 代理评估域（确定性：固定强度、固定 seed）
    proxies = {}
    for tag, spec in (b.get("proxy_domains") or {}).items():
        pout = ROOT / spec["output"]
        _build_split(src, pout, "val", "photo", float(spec["strength"]), 0.0, int(spec["seed"]))
        _write_data_yaml(pout, recipe, f"{recipe['name']} · 代理域 {tag}")
        proxies[tag] = str(pout)
        log(f"  proxy {tag}: strength={spec['strength']} -> {pout}")

    log(f"build 完成 -> {out}")
    return {"output": str(out), "mode": mode, "strength": strength,
            "jitter": jitter, "seed": seed, "proxies": proxies}


def stage_fp(recipe: dict, build_info: dict) -> dict:
    targets = {"dataset": Path(build_info["output"])}
    for tag, p in (build_info.get("proxies") or {}).items():
        targets[f"proxy_{tag}"] = Path(p)

    out = {}
    for name, d in targets.items():
        if not d.exists():
            log(f"  [SKIP] {name} 不存在: {d}")
            continue
        fp = _fingerprint_dir(d)
        (d / "dataset_fingerprint.json").write_text(
            json.dumps({"fingerprint": fp["fingerprint"], "n_files": fp["n_files"],
                        "total_bytes": fp["total_bytes"]}, ensure_ascii=False, indent=2),
            encoding="utf-8")
        out[name] = {"path": str(d), "fingerprint": fp["fingerprint"],
                     "n_files": fp["n_files"], "total_bytes": fp["total_bytes"]}
        log(f"  fp {name}: {fp['n_files']} 文件, {fp['total_bytes']/1e6:.1f} MB, "
            f"sha256={fp['fingerprint'][:16]}…")
    return out


# ─────────────────────────── train ───────────────────────────

def _resolve_model_weights(spec: str) -> Path:
    """把配方里的 model 字段解析成本地权重路径。

    本沙箱/内网**连不上 github.com**（SSL 证书链不通），ultralytics 会自动尝试下载
    `yolo11n.pt` 并抛 SSLError。所以这里坚持本地优先，找不到就 FATAL 并给出可用的下法，
    避免"训练跑到一半才发现要联网"。
    """
    p = Path(spec)
    candidates = []
    if p.is_absolute():
        candidates.append(p)
    else:
        candidates += [ROOT / p, ROOT / "models" / "pretrained" / p.name, ROOT / p.name]
    for c in candidates:
        if c.exists() and c.suffix == ".pt":
            return c
    raise SystemExit(
        f"[FATAL] 找不到预训练权重: {spec}\n"
        f"        已找过: {[str(c) for c in candidates]}\n"
        f"        手动下载（走本沙箱已验证可用的路径）:\n"
        f"          curl -L --ssl-no-revoke -o models/pretrained/yolo11n.pt \\\n"
        f"            https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt\n"
        f"        然后在配方里把 model 写成 'models/pretrained/yolo11n.pt'。"
    )


def _preflight(data_yaml: Path, imgsz: int) -> None:
    """开训前把能炸的地方先炸掉（参照 train_steel_tube_baseline.py 的做法）。"""
    if not data_yaml.exists():
        raise SystemExit(f"[FATAL] data.yaml 不存在: {data_yaml}")
    cfg = yaml.safe_load(data_yaml.read_text(encoding="utf-8"))
    root = Path(cfg["path"])
    for split in ("train", "val"):
        d = root / cfg[split]
        if not d.is_dir():
            raise SystemExit(f"[FATAL] {split} 图像目录不存在: {d}")
        n = sum(1 for x in d.iterdir() if x.suffix.lower() in _IMG_EXT)
        if n == 0:
            raise SystemExit(f"[FATAL] {split} 图像为空: {d}")
        log(f"  preflight {split}: {n} 张图 OK")


def stage_train(recipe: dict, build_info: dict, run_root: Path) -> dict:
    os.environ.setdefault("TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD", "1")
    t = recipe["train"]
    data_yaml = Path(build_info["output"]) / "data.yaml"
    weights = _resolve_model_weights(t["model"])
    log(f"  权重: {weights}")
    _preflight(data_yaml, int(t["imgsz"]))

    from ultralytics import YOLO

    model = YOLO(str(weights))
    res = model.train(
        data=str(data_yaml), epochs=int(t["epochs"]), imgsz=int(t["imgsz"]),
        batch=int(t["batch"]), workers=int(t["workers"]), patience=int(t["patience"]),
        device=t["device"], seed=int(recipe["seed"]), deterministic=bool(t["deterministic"]),
        amp=bool(t["amp"]), project=str(run_root), name="train", exist_ok=True, plots=True,
    )
    best = run_root / "train" / "weights" / "best.pt"
    if not best.exists():
        raise SystemExit(f"[FATAL] 训练未产出 best.pt: {best}")
    log(f"train 完成 -> {best}")
    return {"best_pt": str(best), "run_dir": str(run_root / "train"),
            "weights_source": str(weights),
            "epochs": int(t["epochs"]), "imgsz": int(t["imgsz"]), "batch": int(t["batch"])}


# ─────────────────────────── eval ───────────────────────────

def stage_eval(recipe: dict, train_info: dict, run_root: Path) -> dict:
    from ultralytics import YOLO

    best = Path(train_info["best_pt"])
    model = YOLO(str(best))
    cells = {}
    for tag, y in recipe["eval"]["domains"].items():
        yp = ROOT / y
        if not yp.exists():
            log(f"  [SKIP] 评估集不存在: {yp}")
            continue
        mt = model.val(data=str(yp), split="val", imgsz=int(recipe["train"]["imgsz"]),
                       batch=int(recipe["train"]["batch"]), device=recipe["train"]["device"],
                       plots=False, verbose=False, project=str(run_root), name=f"eval__{tag}",
                       exist_ok=True)
        names = yaml.safe_load(yp.read_text(encoding="utf-8"))["names"]
        per_class = {}
        if getattr(mt, "box", None) is not None and getattr(mt.box, "ap_class_index", None) is not None:
            for i, ci in enumerate(mt.box.ap_class_index):
                ci = int(ci)
                per_class[str(ci)] = {"name": names.get(ci, str(ci)),
                                      "ap50": round(float(mt.box.ap50[i]), 4),
                                      "ap50_95": round(float(mt.box.ap[i]), 4)}
        cells[tag] = {"mAP50": round(float(mt.box.map50), 4),
                      "mAP50_95": round(float(mt.box.map), 4),
                      "precision": round(float(mt.box.mp), 4),
                      "recall": round(float(mt.box.mr), 4),
                      "per_class": per_class}
        log(f"  eval [{tag}] mAP50={cells[tag]['mAP50']:.4f} "
            f"mAP50-95={cells[tag]['mAP50_95']:.4f} "
            f"P={cells[tag]['precision']:.4f} R={cells[tag]['recall']:.4f}")
    return cells


# ─────────────────────────── lock ───────────────────────────

def stage_lock(recipe: dict, recipe_path: Path, results: dict, run_root: Path) -> dict:
    exp = recipe.get("expected") or {}
    tol = float(exp.get("tolerance", 0.005))
    cells = results.get("eval", {})
    checks = []

    def _chk(label: str, got: float | None, want: float | None) -> None:
        if got is None or want is None:
            checks.append({"label": label, "got": got, "want": want, "delta": None, "pass": None})
            return
        d = round(got - want, 4)
        checks.append({"label": label, "got": got, "want": want, "delta": d, "pass": abs(d) <= tol})

    _chk("E0 mAP50", cells.get("E0", {}).get("mAP50"), exp.get("E0_mAP50"))
    _chk("E1 mAP50", cells.get("E1", {}).get("mAP50"), exp.get("E1_mAP50"))
    _chk("E2b mAP50", cells.get("E2b", {}).get("mAP50"), exp.get("E2b_mAP50"))

    lock = {
        "recipe": str(recipe_path.relative_to(ROOT)).replace("\\", "/"),
        "recipe_sha256": hashlib.sha256(recipe_path.read_bytes()).hexdigest(),
        "name": recipe["name"],
        "version": recipe.get("version"),
        "seed": recipe.get("seed"),
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "results": results,
        "reproducibility_checks": checks,
        "all_pass": all(c["pass"] is not False for c in checks),
    }
    p = run_root / "recipe.lock.json"
    p.write_text(json.dumps(lock, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n" + "=" * 74)
    print("复现校验（容差 ±%.3f）" % tol)
    print("=" * 74)
    for c in checks:
        mark = "OK  " if c["pass"] else ("N/A " if c["pass"] is None else "FAIL")
        d = "—" if c["delta"] is None else f"{c['delta']:+.4f}"
        print(f"  [{mark}] {c['label']:12s} got={c['got']}  want={c['want']}  Δ={d}")
    print(f"\n结论: {'全部通过' if lock['all_pass'] else '存在偏差，需核查'}")
    if not lock["all_pass"]:
        print("  → 偏差可能来自：依赖版本变化 / 数据集重建差异 / 硬件非确定性。")
        print("    先比对 dataset_fingerprint.json，一致则多为训练非确定性。")
    print(f"\n锁文件: {p}")
    return lock


# ─────────────────────────── main ───────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(description="训练配方编排器")
    ap.add_argument("--recipe", default="configs/training/t2_recipe.yaml")
    ap.add_argument("--stages", default=",".join(ALL_STAGES))
    ap.add_argument("--out-suffix", default="", help="runs/recipe/<name><suffix>")
    args = ap.parse_args()

    recipe_path = (ROOT / args.recipe).resolve()
    if not recipe_path.exists():
        raise SystemExit(f"[FATAL] 配方不存在: {recipe_path}")
    recipe = yaml.safe_load(recipe_path.read_text(encoding="utf-8"))

    stages = [s.strip() for s in args.stages.split(",") if s.strip()]
    bad = [s for s in stages if s not in ALL_STAGES]
    if bad:
        raise SystemExit(f"[FATAL] 未知阶段 {bad}，可选 {ALL_STAGES}")

    run_root = ROOT / "runs" / "recipe" / (recipe["name"] + args.out_suffix)
    run_root.mkdir(parents=True, exist_ok=True)

    print("=" * 74)
    print(f"训练配方: {recipe['name']} v{recipe.get('version')}  阶段: {','.join(stages)}")
    print(f"输出: {run_root}")
    print("=" * 74)

    results: dict = {"recipe_name": recipe["name"]}
    # 断点续跑：读回已有中间产物
    prev_path = run_root / "stages.json"
    if prev_path.exists():
        try:
            prev = json.loads(prev_path.read_text(encoding="utf-8"))
            for k in ("guard", "build", "fingerprints", "train", "eval"):
                if k in prev:
                    results[k] = prev[k]
        except Exception:
            pass

    if "guard" in stages:
        results["guard"] = stage_guard(recipe)
    elif "guard" not in results:
        raise SystemExit("[FATAL] 未执行 guard 且无历史结果 —— 必须先过护栏。")

    if "build" in stages:
        results["build"] = stage_build(recipe)
    if "fp" in stages:
        if "build" not in results:
            raise SystemExit("[FATAL] fp 需要 build 结果。")
        results["fingerprints"] = stage_fp(recipe, results["build"])
    if "train" in stages:
        if "build" not in results:
            raise SystemExit("[FATAL] train 需要 build 结果。")
        results["train"] = stage_train(recipe, results["build"], run_root)
    if "eval" in stages:
        if "train" not in results:
            raise SystemExit("[FATAL] eval 需要 train 结果。")
        results["eval"] = stage_eval(recipe, results["train"], run_root)

    prev_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    if "lock" in stages:
        stage_lock(recipe, recipe_path, results, run_root)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
