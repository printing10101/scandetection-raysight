"""真实底片入库：把新采集的底片（SDC2 密文 或 普通图片）规范化进 `data/real/`。

## 为什么需要它

2026-10-11 盘点发现：全项目真实底片**只剩 2 个文件、且内容完全相同**（md5 一致），
即**唯一真实样本仅 1 张**。公开数据榨不出真实域覆盖（见
`runs/eval-cross/CROSS_DOMAIN_REPORT.md` §4.8），所以采集真实底片是 P0。

采集是人工动作，本脚本负责把"采回来的东西"变成"能直接进训练/评估的资产"：
解密 → 去重 → 归档 → 缩略图 → 台账 → 待标注清单。

## 目录约定（`data/real/`）

```
data/real/
  raw/<chash><ext>      原始文件（密文或原图），只读留存，便于追溯
  images/<chash>.png    解码后的单通道灰度底片（真正参与训练/评估的）
  thumbs/<chash>.jpg    缩略图（长边 900），供人工标注与快速核验
  labels/<chash>.txt    7 类 YOLO 标注（人工产出；本脚本只读不写）
  INDEX.csv             人读台账（可进 Excel）
  registry.json         机读台账（含灰度统计、标注状态、去重别名）
  WORKLIST_YYYY-MM-DD.md 待标注清单
```

## 去重口径

**按"解码后像素"算 hash，不是按文件字节。** 换名字、换格式（jpg↔png）、重新加密
都不会产生重复条目；只有图像内容真的不同才算新样本。

用法::

    # 采集目录丢进一批文件（可以是 .sdc2 密文，也可以是直接拍的 .jpg）
    python scripts/ingest_real_films.py --src D:/新采底片 --key-file data/.crypto_key

    # 只看会入库什么，不落盘
    python scripts/ingest_real_films.py --src D:/新采底片 --dry-run
"""

from __future__ import annotations

import argparse
import base64
import csv
import hashlib
import json
import shutil
import sys
import time
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

_IMG_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}
CLASS_NAMES = ["气孔", "夹渣", "未焊透", "未熔合", "裂纹", "咬边", "内凹"]
THUMB_LONG_EDGE = 900


def log(m: str) -> None:
    print(m, flush=True)


# ─────────────────────── 解码 / 解密 ───────────────────────

def _load_crypto(key_file: Path):
    from backend.infra.crypto import AesCrypto

    key = base64.b64decode(key_file.read_text(encoding="utf-8").strip())
    if len(key) != 32:
        raise SystemExit(f"[FATAL] 主密钥应为 32 字节，实得 {len(key)}")
    return AesCrypto(key)


def decode_any(p: Path, crypto=None) -> tuple[np.ndarray | None, str]:
    """返回 (灰度图, 来源说明)。先按普通图片解，失败再按 SDC2 密文解。"""
    raw = p.read_bytes()
    arr = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_UNCHANGED)
    if arr is not None:
        src = "plain"
    elif crypto is not None:
        try:
            plain = crypto.decrypt(raw)
        except Exception as exc:  # noqa: BLE001
            return None, f"decrypt-failed:{type(exc).__name__}"
        arr = cv2.imdecode(np.frombuffer(plain, np.uint8), cv2.IMREAD_UNCHANGED)
        if arr is None:
            return None, "decrypted-but-undecodable"
        src = "sdc2"
    else:
        return None, "not-an-image-and-no-key"

    g = arr if arr.ndim == 2 else cv2.cvtColor(arr, cv2.COLOR_BGR2GRAY)
    return g, src


def pixel_hash(g: np.ndarray) -> str:
    """按像素内容算 hash：换名/换格式/重加密都视为同一张。"""
    h = hashlib.sha256()
    h.update(str(g.shape).encode())
    h.update(str(g.dtype).encode())
    h.update(np.ascontiguousarray(g).tobytes())
    return h.hexdigest()[:32]


# ─────────────────────── 统计与启发式 ───────────────────────

def film_stats(g: np.ndarray) -> dict:
    """灰度统计 + 几条用于人工分诊的启发式指标（不做判定，只供参考）。"""
    H, W = g.shape
    band = max(3, int(0.03 * min(H, W)))
    border = np.concatenate([
        g[:band, :].ravel(), g[-band:, :].ravel(),
        g[:, :band].ravel(), g[:, -band:].ravel(),
    ])
    return {
        "shape": [int(H), int(W)],
        "mean": round(float(g.mean()), 2),
        "std": round(float(g.std()), 2),
        "p1": int(np.percentile(g, 1)),
        "p50": int(np.percentile(g, 50)),
        "p99": int(np.percentile(g, 99)),
        "border_mean": round(float(border.mean()), 2),
        # 边缘比中心暗很多 → 像"带黑框的翻拍片"；接近 → 像"规整扫描片"
        "border_vs_center": round(float(border.mean() - g.mean()), 2),
        "hint": ("像翻拍片（边缘显著偏暗）" if border.mean() < g.mean() - 12
                 else "像规整扫描/DR 片"),
    }


def make_thumb(g: np.ndarray) -> np.ndarray:
    H, W = g.shape
    s = THUMB_LONG_EDGE / max(H, W, 1)
    if s < 1.0:
        return cv2.resize(g, (max(1, int(W * s)), max(1, int(H * s))), interpolation=cv2.INTER_AREA)
    return g


# ─────────────────────── 台账 ───────────────────────

def load_registry(p: Path) -> dict:
    if p.exists():
        return json.loads(p.read_text(encoding="utf-8"))
    return {"created": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "items": {}}


def save_registry(p: Path, reg: dict) -> None:
    p.write_text(json.dumps(reg, ensure_ascii=False, indent=2), encoding="utf-8")


def write_index_csv(store: Path, reg: dict) -> None:
    cols = ["chash", "n_files", "shape", "mean", "std", "border_vs_center", "hint",
            "source_kind", "annotated", "n_boxes", "first_seen", "aliases"]
    with (store / "INDEX.csv").open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(cols)
        for ch, it in sorted(reg["items"].items()):
            w.writerow([
                ch, it.get("n_files", 1),
                "x".join(str(v) for v in it.get("stats", {}).get("shape", [])),
                it.get("stats", {}).get("mean"), it.get("stats", {}).get("std"),
                it.get("stats", {}).get("border_vs_center"), it.get("stats", {}).get("hint", ""),
                it.get("source_kind"), it.get("annotated", False), it.get("n_boxes", 0),
                it.get("first_seen", ""), "; ".join(it.get("aliases", [])),
            ])


def count_boxes(label_path: Path) -> int:
    if not label_path.exists():
        return 0
    return sum(1 for line in label_path.read_text().splitlines() if line.strip())


def write_worklist(store: Path, reg: dict, date: str) -> Path | None:
    todo = [(ch, it) for ch, it in sorted(reg["items"].items()) if not it.get("annotated")]
    out = store / f"WORKLIST_{date}.md"
    lines = [
        f"# 真实底片待标注清单 · {date}",
        "",
        f"- 库内合计：**{len(reg['items'])} 张**（唯一内容）",
        f"- 待标注：**{len(todo)} 张**",
        f"- 已标注：{len(reg['items']) - len(todo)} 张",
        "",
        "## 标注规范",
        "",
        "YOLO 格式，每行 `类别id 中心x 中心y 宽 高`，坐标**归一化到 0–1**：",
        "",
        "| id | 类别 | 备注 |",
        "|---|---|---|",
    ]
    for i, n in enumerate(CLASS_NAMES):
        note = ""
        if i == 2:
            note = "细直黑线、两侧轮廓整齐、位于焊缝根部投影（常在焊缝中部）、可断续可连续"
        if i == 6:
            note = "焊缝根部不规则、边缘模糊黑影，中部黑度较大、向边缘渐淡"
        lines.append(f"| {i} | {n} | {note} |")
    lines += [
        "",
        "> **只标「看得准」的框。** 拿不准的不标 —— 错标比少标伤害大得多。",
        "> 漏标会让模型学到「这里没东西」，是负向污染。",
        "",
        "## 待办",
        "",
        "| # | chash | 尺寸 | 灰度 mean/std | 分诊提示 | 缩略图 | 标注文件 |",
        "|---|---|---|---|---|---|---|",
    ]
    for i, (ch, it) in enumerate(todo, 1):
        st = it.get("stats", {})
        lines.append(
            f"| {i} | `{ch[:12]}` | {'x'.join(str(v) for v in st.get('shape', []))} "
            f"| {st.get('mean')}/{st.get('std')} | {st.get('hint', '')} "
            f"| `thumbs/{ch}.jpg` | `labels/{ch}.txt` |"
        )
    lines += [
        "",
        "## 标注完成后",
        "",
        "```bash",
        "# 校验（越界/类别/空标/极小框/重复框）",
        "python scripts/validate_labels.py --labels data/real/labels --images data/real/images",
        "# 刷新台账",
        "python scripts/ingest_real_films.py --src data/real/raw --refresh-only",
        "```",
        "",
    ]
    out.write_text("\n".join(lines), encoding="utf-8")
    return out


# ─────────────────────── 主流程 ───────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(description="真实底片入库")
    ap.add_argument("--src", required=True, help="采集目录或单个文件")
    ap.add_argument("--store", default="data/real", help="底片库根目录")
    ap.add_argument("--key-file", default="data/.crypto_key", help="SDC2 主密钥（可选）")
    ap.add_argument("--dry-run", action="store_true", help="只报告，不落盘")
    ap.add_argument("--refresh-only", action="store_true",
                    help="不扫新文件，只刷新标注状态/台账/清单")
    args = ap.parse_args()

    store = ROOT / args.store
    reg_path = store / "registry.json"
    reg = load_registry(reg_path)
    date = time.strftime("%Y-%m-%d")

    crypto = None
    kf = ROOT / args.key_file
    if kf.exists():
        crypto = _load_crypto(kf)
        log(f"密钥已加载: {kf.name}")
    else:
        log(f"[WARN] 无密钥文件 {kf}，只能处理普通图片（SDC2 密文会失败）")

    if not args.refresh_only:
        src = Path(args.src)
        if not src.exists():
            raise SystemExit(f"[FATAL] 源不存在: {src}")
        files = sorted([src]) if src.is_file() else sorted(p for p in src.rglob("*") if p.is_file())
        log(f"扫描 {len(files)} 个文件")

        if not args.dry_run:
            for sub in ("raw", "images", "thumbs", "labels"):
                (store / sub).mkdir(parents=True, exist_ok=True)

        n_new = n_dup = n_fail = 0
        for p in files:
            g, kind = decode_any(p, crypto)
            if g is None:
                log(f"  [SKIP] {p.name}: {kind}")
                n_fail += 1
                continue
            ch = pixel_hash(g)
            it = reg["items"].get(ch)
            if it is not None:
                n_dup += 1
                if p.name not in it.setdefault("aliases", []):
                    it["aliases"].append(p.name)
                continue

            st = film_stats(g)
            it = {
                "chash": ch, "source_kind": kind, "stats": st,
                "first_seen": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
                "aliases": [p.name], "n_files": 1,
            }
            if not args.dry_run:
                ok, buf = cv2.imencode(".png", g)
                if not ok:
                    log(f"  [SKIP] {p.name}: PNG 编码失败")
                    n_fail += 1
                    continue
                buf.tofile(str(store / "images" / f"{ch}.png"))
                shutil.copy2(p, store / "raw" / f"{ch}{p.suffix.lower()}")
                ok, tb = cv2.imencode(".jpg", make_thumb(g), [int(cv2.IMWRITE_JPEG_QUALITY), 88])
                if ok:
                    tb.tofile(str(store / "thumbs" / f"{ch}.jpg"))
            reg["items"][ch] = it
            n_new += 1
            log(f"  [NEW ] {p.name} ({kind}) {st['shape']} mean/std={st['mean']}/{st['std']} → {ch[:12]}")

        log(f"\n新增 {n_new} / 重复 {n_dup} / 失败 {n_fail}")

    # 刷新标注状态
    for ch, it in reg["items"].items():
        lp = store / "labels" / f"{ch}.txt"
        nb = count_boxes(lp)
        it["annotated"] = nb > 0
        it["n_boxes"] = nb

    if not args.dry_run:
        save_registry(reg_path, reg)
        write_index_csv(store, reg)
        wl = write_worklist(store, reg, date)
        tot = len(reg["items"])
        done = sum(1 for it in reg["items"].values() if it["annotated"])
        log(f"\n底片库: {tot} 张唯一内容，已标注 {done} 张")
        if tot:
            log(f"[!] 评估统计力提示: 真实样本 {tot} 张 —— "
                f"{'尚不足以做任何精度断言（需 ≥30 张且覆盖各类）' if tot < 30 else '可用于初步评估'}")
        if wl:
            log(f"台账: {store/'INDEX.csv'} / {reg_path}")
            log(f"待标注清单: {wl}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
