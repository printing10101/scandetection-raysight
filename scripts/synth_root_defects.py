"""合成长尾类缺陷（未焊透 / 内凹）—— 物理形态由文献标定，参数外置可校准。

## 为什么需要合成

公开数据集里 **未焊透 = 0、内凹 = 0 实例**（见 `data/datasets/SOURCES.md`）。
后果不只是"这两类指标无法评估"，而是：**重训出来的模型在结构上不可能输出这两类**
——没有正样本，分类头学不到该类的判据。而产品模型在真实底片上有 **76% 的检出是未焊透**，
说明现场这两类是主力。合成是为了让重训模型至少保留这两个"类别槽位"。

## 形态依据（不凭想象，逐条给出处）

| 缺陷 | 底片影像特征 | 出处 |
|---|---|---|
| **未焊透** | 典型影像是**细直黑线**，两侧轮廓都很整齐（坡口钝边机械加工痕迹），宽度≈钝边间隙宽度；位于焊缝根部投影位置、一般在焊缝中部；呈**断续或连续**分布，有时贯穿整张底片；黑度均匀、轮廓清晰 | 泰阳检测《射线探伤下焊缝最常见缺陷都长啥样》；沃驰《未焊透底片影像特点》；河北美德《直缝钢管射线常见缺陷分析》 |
| **内凹** | 焊缝根部区域显示**不规则的边缘模糊黑影**，**中部黑度较大、逐渐向边缘变淡** | 泰阳检测 同上 |

⚠️ 注意**两者都是"暗影"**（黑度增加），不是亮带 —— 常见误解是把内凹当成亮带。

## 参数可校准（核心设计）

本脚本**不硬编码形态参数**，全部从 `configs/synthesis/root_defects.yaml` 读。
默认值是"文献比例 + 本项目图像尺度"的估计，**未经真实标注底片标定** ——
拿到真实底片后只需改 YAML 重跑，无需改代码。脚本会在产物里写入
`calibration_status: uncalibrated`，避免下游误当成真值。

## 焊缝位置估计

底片里焊缝是一条水平暗带。估计顺序：
1. 若有已标注框 → 取其中心 y 的**中位数**（现有缺陷必在焊缝上，这是最可靠的线索）；
2. 兜底 → 在图像中间半区找行均值最暗的位置；
3. 再在 ±5% 高度内局部精修，并按行均值显著低于整图均值的连续段估出**焊缝带高**。

用法::

    python scripts/synth_root_defects.py --config configs/synthesis/root_defects.yaml
    python scripts/synth_root_defects.py --config ... --dry-run       # 只统计不落盘
"""

from __future__ import annotations

import argparse
import hashlib
import json
import random
import shutil
import sys
from pathlib import Path

import cv2
import numpy as np
import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

_IMG_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}
CLASS_NAMES = ["气孔", "夹渣", "未焊透", "未熔合", "裂纹", "咬边", "内凹"]


def log(m: str) -> None:
    print(m, flush=True)


# ─────────────────────── 图像/标签 IO（中文路径安全） ───────────────────────

def imread_gray(p: Path) -> np.ndarray:
    a = cv2.imdecode(np.frombuffer(p.read_bytes(), np.uint8), cv2.IMREAD_GRAYSCALE)
    if a is None:
        raise RuntimeError(f"读取失败: {p}")
    return a


def imwrite_gray(p: Path, a: np.ndarray) -> None:
    ok, buf = cv2.imencode(".jpg", a, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
    if not ok:
        raise RuntimeError(f"编码失败: {p}")
    buf.tofile(str(p))


def read_labels(p: Path, W: int, H: int) -> list[tuple[int, float, float, float, float]]:
    """返回 [(cls, cx, cy, w, h)]，像素尺度。"""
    out = []
    if not p.exists():
        return out
    for line in p.read_text().splitlines():
        if not line.strip():
            continue
        t = line.split()
        c = int(t[0])
        cx, cy, w, h = (float(v) for v in t[1:5])
        out.append((c, cx * W, cy * H, w * W, h * H))
    return out


def write_labels(p: Path, labs: list[tuple[int, float, float, float, float]], W: int, H: int) -> None:
    lines = []
    for c, cx, cy, w, h in labs:
        lines.append(f"{c} {cx/W:.6f} {cy/H:.6f} {w/W:.6f} {h/H:.6f}")
    p.write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")


# ─────────────────────── 焊缝轴与带宽估计 ───────────────────────

def estimate_weld_line(gray: np.ndarray, boxes: list) -> tuple[float, float, float, bool]:
    """估计焊缝的**直线走向**，返回 (斜率 a, 截距 b, 垂直带厚 band_v, 是否可信)。

    这些底片里焊缝不是水平的 —— 实测倾斜 20–30°。若按"水平带"处理，合成的根部缺陷会
    **横穿**焊缝而不是顺着它走，物理上完全错误。

    做法：**Hough 式全局搜线**。对候选 (斜率 a, 截距 b) 沿直线采样灰度并取均值，
    选出最暗的那条。比"逐列找最暗行 + 最小二乘"稳得多 —— 后者的搜索窗容不下倾斜，
    列一旦偏离窗口就会锁到噪声上（这是个实测踩过的坑）。

    最后做**可信度判定**：拟合线的平均灰度必须显著低于整图均值，否则判定"没找到焊缝"，
    调用方应跳过该图 —— **宁可不合成，也不要合到错误位置。**
    """
    H, W = gray.shape
    if boxes:
        y_guess = float(np.median([cy for _, _, cy, _, _ in boxes]))
    else:
        row = gray.mean(axis=1)
        mid = row[H // 4: 3 * H // 4]
        y_guess = float(H // 4 + int(np.argmin(mid)))

    # ── 降采样加速 ──
    sc = max(1, min(H, W) // 260)
    small = cv2.resize(gray, (max(8, W // sc), max(8, H // sc)),
                       interpolation=cv2.INTER_AREA).astype(np.float32)
    h, w = small.shape
    xs = np.arange(0, w, 2)
    yg = y_guess / sc

    def score(a: float, b: float) -> float | None:
        ys = a * xs + b
        ok = (ys >= 0) & (ys < h - 1)
        if ok.sum() < 0.55 * len(xs):      # 线大部分跑出图外 → 无效
            return None
        return float(small[ys[ok].astype(int), xs[ok]].mean())

    # ── 粗搜 ──
    best = None
    for a in np.arange(-0.9, 0.91, 0.02):
        for b in np.arange(yg - 0.22 * h, yg + 0.22 * h + 1.0, 1.0):
            v = score(float(a), float(b))
            if v is not None and (best is None or v < best[0]):
                best = (v, float(a), float(b))
    if best is None:
        return 0.0, y_guess, float(max(8, int(0.10 * H))), False

    # ── 精修 ──
    _, a0, b0 = best
    for a in np.arange(a0 - 0.05, a0 + 0.0501, 0.005):
        for b in np.arange(b0 - 3.0, b0 + 3.01, 0.5):
            v = score(float(a), float(b))
            if v is not None and v < best[0]:
                best = (v, float(a), float(b))
    v_line, a, b_small = best

    b = b_small * sc                       # 回到全分辨率
    a = float(a)                           # 斜率与尺度无关

    # ── 可信度 ──
    ys_full = a * np.arange(0, W, max(1, W // 120)) + b
    ok = (ys_full >= 0) & (ys_full < H - 1)
    if ok.sum() < 5:
        return a, b, float(max(8, int(0.10 * H))), False
    px = gray[ys_full[ok].astype(int), np.arange(0, W, max(1, W // 120))[ok]].astype(np.float32)
    credible = float(px.mean()) < float(gray.mean()) - 0.20 * max(float(gray.std()), 1.0)

    # ── 垂直带厚：沿拟合线取若干列，量"明显暗于该列均值"的连续段高 ──
    exts = []
    xx = np.arange(0, W, max(1, W // 60))
    for x in xx:
        yc = int(round(a * x + b))
        if not (2 <= yc < H - 2):
            continue
        col = gray[:, x].astype(np.float32)
        thr = col[yc] + 0.5 * (col.mean() - col[yc])
        if col[yc] >= col.mean():
            continue
        lo = yc
        while lo > 0 and col[lo - 1] < thr:
            lo -= 1
        hi = yc
        while hi < H - 1 and col[hi + 1] < thr:
            hi += 1
        exts.append(float(hi - lo + 1))
    band_v = float(np.median(exts)) if exts else max(8.0, 0.10 * H)

    return a, b, max(6.0, band_v), credible


def draw_root_defect(gray: np.ndarray, a: float, b: float, band_v: float, spec: dict,
                     rng: random.Random) -> tuple[np.ndarray, tuple[int, int, int, int]]:
    """沿焊缝直线 y = a·x + b 绘制根部缺陷，返回 (新图, 实际绘制区域的 xyxy 像素框)。

    框用**实际被改动的像素**算，而不是理论范围 —— 保证标签与画面对得上。
    """
    H, W = gray.shape
    out = gray.astype(np.float32).copy()

    wf = spec["width_frac"]
    lf = spec["length_frac"]
    dk = spec["darken"]
    soft = float(spec.get("edge_soft", 1.0))
    profile = spec.get("profile", "line")

    thick = band_v * rng.uniform(*wf) * (2.0 if profile == "band" else 1.0)
    thick = max(float(spec.get("min_thickness_px", 3)), thick)
    length = max(12.0, W * rng.uniform(*lf))
    darken = rng.uniform(*dk)
    x0 = rng.uniform(0.0, max(0.0, W - length))
    # 沿焊缝方向做一点点抖动，但不改变总体走向
    a_use = a + rng.uniform(-0.03, 0.03)

    n = int(round(thick))
    if profile == "band":
        t = (np.arange(n, dtype=np.float32) + 0.5) / max(n, 1)
        prof = 0.5 * (1.0 - np.cos(2.0 * np.pi * t))       # 0→1→0
        if soft > 0:
            k = int(max(3, round(soft * 4)) | 1)
            prof = cv2.GaussianBlur(prof.reshape(1, -1), (k, 1), soft).ravel()
        prof = prof / max(prof.max(), 1e-6)
    else:
        prof = _edge_profile(n, soft)

    delta = np.zeros((H, W), np.float32)
    for sx0, sx1 in _segments(x0, length, rng, float(spec.get("dash_prob", 0.0))):
        xs = np.arange(int(round(sx0)), int(round(sx1)))
        if xs.size == 0:
            continue
        yc = a_use * xs + b
        for i, x in enumerate(xs):
            c = int(round(yc[i]))
            top = c - n // 2
            lo, hi = max(0, top), min(H, top + n)
            if hi > lo:
                delta[lo:hi, int(x)] += darken * prof[lo - top: hi - top]

    delta = np.clip(delta, 0.0, 255.0)
    ys_idx, xs_idx = np.nonzero(delta > 1.0)
    if ys_idx.size == 0:
        return gray.copy(), (0, 0, 0, 0)
    box = (int(xs_idx.min()), int(ys_idx.min()), int(xs_idx.max()) + 1, int(ys_idx.max()) + 1)
    out = np.clip(out - delta, 0, 255)
    return out.astype(np.uint8), box


# ─────────────────────── 缺陷绘制 ───────────────────────

def _edge_profile(n: int, soft: float) -> np.ndarray:
    """一维边缘剖面：矩形 + 指定柔和度的高斯过渡，峰值归一到 1。"""
    if n <= 0:
        return np.zeros(0, np.float32)
    prof = np.ones(n, np.float32)
    if soft > 0:
        k = int(max(3, round(soft * 4)) | 1)
        pad = k
        ext = np.concatenate([np.zeros(pad, np.float32), prof, np.zeros(pad, np.float32)])
        ext = cv2.GaussianBlur(ext.reshape(1, -1), (k, 1), soft).ravel()
        prof = ext[pad:pad + n]
    m = prof.max()
    return prof / m if m > 0 else prof


def _segments(x0: float, length: float, rng: random.Random, dash_prob: float):
    """连续 or 断续（未焊透"有连续和断续之分"）。"""
    if rng.random() >= dash_prob:
        return [(x0, x0 + length)]
    segs = []
    cur = x0
    end = x0 + length
    while cur < end:
        seg = min(end - cur, rng.uniform(0.10, 0.30) * length)
        segs.append((cur, cur + seg))
        cur += seg + rng.uniform(0.04, 0.14) * length
    return segs or [(x0, x0 + length)]


def iou(a, b) -> float:
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    iw = max(0, min(ax2, bx2) - max(ax1, bx1))
    ih = max(0, min(ay2, by2) - max(ay1, by1))
    inter = iw * ih
    ua = (ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter
    return inter / ua if ua > 0 else 0.0


# ─────────────────────── 主流程 ───────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(description="合成根部缺陷（未焊透/内凹）")
    ap.add_argument("--config", default="configs/synthesis/root_defects.yaml")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--vis", default="runs/synth/root_defects_grid.jpg")
    args = ap.parse_args()

    cfg_path = (ROOT / args.config).resolve()
    cfg = yaml.safe_load(cfg_path.read_text(encoding="utf-8"))
    src = ROOT / cfg["source"]
    dst = ROOT / cfg["output"]
    seed = int(cfg.get("seed", 0))
    fraction = float(cfg.get("fraction", 0.3))
    per_image = int(cfg.get("per_image", 1))
    classes = cfg["classes"]

    for tag, spec in classes.items():
        if spec["id"] >= len(CLASS_NAMES):
            raise SystemExit(f"[FATAL] {tag} 的 id={spec['id']} 超出 7 类")
        if CLASS_NAMES[spec["id"]] != tag:
            raise SystemExit(f"[FATAL] {tag} 的 id={spec['id']} 与口径不符"
                             f"（权威口径 id={spec['id']} 应为 {CLASS_NAMES[spec['id']]}）")
    log(f"配方: {cfg_path.name}  源: {src.name}  输出: {dst.name}")
    log(f"合成类: {list(classes)}  命中率 {fraction:.0%}  每图 {per_image} 个")

    all_imgs = sorted(p for p in (src / "images" / "train").iterdir()
                      if p.is_file() and p.suffix.lower() in _IMG_EXT)
    if not all_imgs:
        raise SystemExit(f"[FATAL] 源为空: {src/'images'/'train'}")

    rng = random.Random(seed)
    picked = [p for p in all_imgs if rng.random() < fraction]
    log(f"命中 {len(picked)}/{len(all_imgs)} 张")

    if not args.dry_run:
        for split in ("train", "val"):
            (dst / "images" / split).mkdir(parents=True, exist_ok=True)
            (dst / "labels" / split).mkdir(parents=True, exist_ok=True)
        # val 原样复制（不在 val 上合成 —— 保持自评可比）
        for split in ("val",):
            for p in sorted((src / "images" / split).iterdir()):
                if p.is_file() and p.suffix.lower() in _IMG_EXT:
                    shutil.copy2(p, dst / "images" / split / p.name)
            for f in sorted((src / "labels" / split).glob("*.txt")):
                shutil.copy2(f, dst / "labels" / split / f.name)

    counts = {t: 0 for t in classes}
    slopes: list[float] = []
    n_skip = 0
    vis_pairs = []
    for p in all_imgs:
        g = imread_gray(p)
        H, W = g.shape
        lp = src / "labels" / "train" / (p.stem + ".txt")
        labs = read_labels(lp, W, H)

        do = p in picked
        new_labs = list(labs)
        before = g
        after = g
        if do:
            wa, wb, band_v, ok_line = estimate_weld_line(g, labs)
            if not ok_line:
                n_skip += 1
            else:
                slopes.append(wa)
            after = g
            for _ in range(per_image if ok_line else 0):
                tag = rng.choice(list(classes))
                spec = classes[tag]
                after, box = draw_root_defect(after, wa, wb, band_v, spec, rng)
                bx1, by1, bx2, by2 = box
                if bx2 - bx1 < 4 or by2 - by1 < 1:
                    continue
                new_labs.append((spec["id"], (bx1 + bx2) / 2, (by1 + by2) / 2,
                                 bx2 - bx1, by2 - by1))
                counts[tag] += 1
                if len(vis_pairs) < 8:
                    vis_pairs.append((before, after, box, tag))

        if not args.dry_run:
            imwrite_gray(dst / "images" / "train" / p.name, after)
            write_labels(dst / "labels" / "train" / (p.stem + ".txt"), new_labs, W, H)

    if not args.dry_run:
        names_txt = (
            f"# 合成数据集：{cfg.get('title', 'root defects')}\n"
            f"# 由 scripts/synth_root_defects.py 按 {cfg_path.name} 生成 —— 请勿手工编辑。\n"
            f"# 形态参数**未经真实标注底片标定**，见同目录 SYNTH_REPORT.json 的 calibration_status。\n"
            f"path: {dst.as_posix()}\n"
            f"train: images/train\nval: images/val\nnc: {len(CLASS_NAMES)}\n"
            f"names:\n" + "".join(f"  {i}: {n}\n" for i, n in enumerate(CLASS_NAMES))
        )
        (dst / "data.yaml").write_text(names_txt, encoding="utf-8")

        # 可视化（失败不影响数据集产物 —— 数据集才是交付物）
        try:
            if vis_pairs:
                tiles = []
                TW = 560
                for before, after, box, tag in vis_pairs[:8]:
                    a = cv2.cvtColor(before, cv2.COLOR_GRAY2BGR)
                    b = cv2.cvtColor(after, cv2.COLOR_GRAY2BGR)
                    x1, y1, x2, y2 = box
                    cv2.rectangle(b, (x1, y1), (x2, y2), (0, 0, 255), 3)
                    cv2.putText(b, tag, (max(4, min(x1, TW - 90)), max(26, y1 - 8)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
                    for im in (a, b):
                        s = TW / max(im.shape[:2])
                        tiles.append(cv2.resize(im, (int(im.shape[1] * s), int(im.shape[0] * s)),
                                                interpolation=cv2.INTER_AREA))
                # 统一高度后再拼，否则不同尺寸的片子 hstack 会炸
                TH = max(t.shape[0] for t in tiles)
                tiles = [cv2.copyMakeBorder(t, 0, TH - t.shape[0], 0, 0,
                                            cv2.BORDER_CONSTANT, value=(40, 40, 40)) for t in tiles]
                rows = [np.hstack(tiles[i:i + 2]) for i in range(0, len(tiles), 2)]
                wmax = max(r.shape[1] for r in rows)
                rows = [cv2.copyMakeBorder(r, 0, 0, 0, wmax - r.shape[1],
                                           cv2.BORDER_CONSTANT, value=(40, 40, 40)) for r in rows]
                grid = np.vstack(rows)
                vp = ROOT / args.vis
                vp.parent.mkdir(parents=True, exist_ok=True)
                ok, buf = cv2.imencode(".jpg", grid, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
                if ok:
                    buf.tofile(str(vp))
                    log(f"可视化 -> {vp}")
        except Exception as exc:  # noqa: BLE001 - 可视化只是辅助
            log(f"[WARN] 可视化失败（不影响数据集）: {type(exc).__name__}: {exc}")

        # 指纹 + 报告（排除自生成的说明文件，否则重建时指纹会自包含、不可复现）
        _EXCL = {"SYNTH_REPORT.json", "README.md", "dataset_fingerprint.json"}
        fp = hashlib.sha256()
        n_files = 0
        for f in sorted(dst.rglob("*")):
            if f.is_file() and f.suffix.lower() != ".cache" and f.name not in _EXCL:
                fp.update(f"{f.relative_to(dst)}\t{hashlib.sha256(f.read_bytes()).hexdigest()}\n".encode())
                n_files += 1
        rep = {
            "config": str(cfg_path.relative_to(ROOT)).replace("\\", "/"),
            "seed": seed, "fraction": fraction, "per_image": per_image,
            "synthesized": counts, "total_synth_boxes": sum(counts.values()),
            "images_total": len(all_imgs), "images_touched": len(picked),
            "images_skipped_no_weld": n_skip,
            "dataset_files": n_files, "dataset_fingerprint": fp.hexdigest(),
            "calibration_status": "uncalibrated",
            "calibration_note": "形态参数来自文献比例 + 本项目图像尺度估计，未经真实标注底片标定。"
                                "拿到真实底片标注后改 configs/synthesis/root_defects.yaml 重跑即可。",
            # 焊缝走向诊断：斜率分布是**双峰**的（部分底片焊缝水平、多数倾斜 ~29°），
            # 所以用中位数会误导；改报 |斜率| 中位数 + 直方图，并给出"拟合是否落在暗带内"的可信率。
            "weld_slope_abs_median": round(float(np.median(np.abs(slopes))), 4) if slopes else None,
            "weld_slope_signed_median": round(float(np.median(slopes)), 4) if slopes else None,
            "weld_slope_histogram": (np.histogram(slopes, bins=[-1.2, -0.6, -0.3, -0.1,
                                                                0.1, 0.3, 0.6, 1.2])[0].tolist()
                                     if slopes else None),
            "weld_slope_histogram_bins": [-1.2, -0.6, -0.3, -0.1, 0.1, 0.3, 0.6, 1.2],
            "weld_fit_credible_rate": round(1.0 - n_skip / max(1, len(picked)), 4),
            "weld_slope_note": "|斜率| 中位 + 直方图（分布双峰，中位数具误导性）；"
                               "credible = 拟合线的平均灰度显著低于整图均值的比例",
            "morphology_sources": {
                "未焊透": "细直黑线，两侧轮廓整齐（钝边加工痕迹），位于焊缝根部投影、多在焊缝中部，断续或连续，黑度均匀轮廓清晰",
                "内凹": "焊缝根部区域不规则、边缘模糊黑影，中部黑度较大、逐渐向边缘变淡",
            },
        }
        (dst / "SYNTH_REPORT.json").write_text(json.dumps(rep, ensure_ascii=False, indent=2), encoding="utf-8")
        (dst / "README.md").write_text(
            "# 合成数据集说明（未焊透 / 内凹）\n\n"
            "> ⚠️ **本数据集为合成，非真实缺陷影像。**\n"
            f"> 形态参数状态：**{rep['calibration_status']}**\n\n"
            "## 用途\n\n"
            "只用于给重训模型保留「未焊透 / 内凹」的**类别槽位** —— 公开数据里这两类为 0 实例，\n"
            "不补的话模型结构上无法输出它们，而现场底片上这两类是主力。\n\n"
            "**不得**用于：评估这两类的精度、宣称模型已支持这两类、替代真实标注。\n\n"
            "## 形态依据\n\n"
            f"- 未焊透：{rep['morphology_sources']['未焊透']}\n"
            f"- 内凹：{rep['morphology_sources']['内凹']}\n\n"
            "## 构成\n\n"
            f"- 源：`{cfg['source']}`（已训推一致化 + 翻拍增强，与产品推理输入同分布）\n"
            f"- 合成框：{[f'{k} {v}' for k, v in counts.items()]}\n"
            f"- 命中图像：{len(picked)}/{len(all_imgs)}；val 划分**未合成**（保持自评可比）\n"
            f"- 数据集指纹：`{fp.hexdigest()[:16]}…`\n\n"
            "## 重新生成\n\n"
            "```bash\npython scripts/synth_root_defects.py --config configs/synthesis/root_defects.yaml\n```\n",
            encoding="utf-8")

    log("\n合成统计:")
    for t, n in counts.items():
        log(f"  {t}: {n} 个")
    log(f"  合计 {sum(counts.values())} 个")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
