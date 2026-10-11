"""真实底片核验可视化：① 检出叠加（放大）② 公开训练集 vs 真实底片检出的类别覆盖对比。

输入 runs/eval-cross/real_film.json（由 eval_real_film.py 产出）。
输出 runs/eval-cross/real_film_overlay.png、real_film_class_gap.png
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

import cv2
import matplotlib

matplotlib.use("Agg")
matplotlib.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei", "DejaVu Sans"]
matplotlib.rcParams["axes.unicode_minus"] = False

import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
NAMES = ["气孔", "夹渣", "未焊透", "未熔合", "裂纹", "咬边", "内凹"]
MODELS = ["T0", "T1", "T2", "PROD"]
TITLE = {"T0": "T0 原图基线", "T1": "T1 训推一致化", "T2": "T2 一致化+翻拍增强", "PROD": "产品模型 (YOLOv8n)"}
TRAIN_DIST = {"气孔": 1462, "夹渣": 120, "未焊透": 0, "未熔合": 408, "裂纹": 119, "咬边": 35, "内凹": 0}

def imread_unicode(path) -> np.ndarray:
    """cv2.imread 在 Windows 非 ASCII 路径下会静默返回 None，改走 imdecode。"""
    buf = np.fromfile(str(path), dtype=np.uint8)
    img = cv2.imdecode(buf, cv2.IMREAD_COLOR)
    if img is None:
        raise SystemExit(f"[FATAL] 无法解码图像: {path}")
    return img



def load() -> dict:
    return json.loads((ROOT / "runs/eval-cross/real_film.json").read_text(encoding="utf-8"))


def overlay(r: dict, conf: float, out: Path) -> None:
    img0 = r["images"][0]
    stem = img0.replace(".png", "")
    bgr = imread_unicode(ROOT / "data/datasets/_domain_ref/decrypted" / img0)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    import sys
    sys.path.insert(0, str(ROOT))
    from backend.domain.preprocess.pipeline import OpencvPreprocessor
    prep = OpencvPreprocessor(bilateral_d=9, bilateral_sigma_color=75.0, bilateral_sigma_space=75.0,
                              median_k=3, clahe_clip=2.0, clahe_grid=8)
    pipe = cv2.cvtColor(prep.enhance(prep.denoise(gray), 1.0), cv2.COLOR_GRAY2BGR)

    fig, axes = plt.subplots(2, 4, figsize=(17, 10.5), dpi=220)
    for row, (mode, im) in enumerate((("raw", bgr), ("pipe", pipe))):
        for col, tag in enumerate(MODELS):
            dets = [d for d in r["raw_dets"].get(f"{stem}|{mode}|{tag}", []) if d["conf"] >= conf]
            vis = cv2.cvtColor(im, cv2.COLOR_BGR2RGB).copy()
            for d in dets:
                x1, y1, x2, y2 = [int(v) for v in d["xyxy"]]
                color = (220, 30, 30) if d["conf"] >= 0.5 else (240, 150, 20)
                cv2.rectangle(vis, (x1, y1), (x2, y2), color, 6)
                cv2.putText(vis, f"{NAMES[d['cls']]}{d['conf']:.2f}", (x1, max(36, y1 - 12)),
                            cv2.FONT_HERSHEY_SIMPLEX, 2.4, color, 6)
            ax = axes[row][col]
            ax.imshow(vis)
            ax.set_title(f"{TITLE[tag]}\n检出 {len(dets)} 个 (conf≥{conf})", fontsize=12)
            ax.axis("off")
            if col == 0:
                ax.text(-0.06, 0.5, "原图输入" if mode == "raw" else "预处理管线输入",
                        transform=ax.transAxes, rotation=90, va="center", ha="center", fontsize=13)
    fig.suptitle(f"真实翻拍底片（{img0[:12]}… 2048×2448）· 同一输入下四个模型的响应", fontsize=15, y=0.98)
    fig.tight_layout(rect=(0.02, 0, 1, 0.95))
    fig.savefig(out, bbox_inches="tight")
    plt.close(fig)
    print(f"[OK] {out}")


def class_gap(r: dict, conf: float, out: Path) -> None:
    img0 = r["images"][0].replace(".png", "")
    fig, axes = plt.subplots(1, 2, figsize=(15, 5.4), dpi=220)

    # 左：公开训练集类别分布
    ax = axes[0]
    vals = [TRAIN_DIST[n] for n in NAMES]
    cols = ["#c0392b" if v == 0 else "#2980b9" for v in vals]
    bars = ax.bar(NAMES, vals, color=cols, edgecolor="white")
    for b, v in zip(bars, vals):
        ax.text(b.get_x() + b.get_width() / 2, v + max(vals) * 0.02,
                str(v), ha="center", va="bottom", fontsize=11,
                fontweight="bold", color="#c0392b" if v == 0 else "#222")
    ax.set_title("公开训练集（steel-tube 重映射后）类别实例数\n红色 = 0 实例，模型从未见过", fontsize=12)
    ax.set_ylabel("实例数", fontsize=11)
    ax.grid(axis="y", alpha=0.25)
    ax.set_axisbelow(True)

    # 右：真实底片上各模型检出的类别分布（pipe 模式）
    ax = axes[1]
    x = np.arange(len(NAMES))
    w = 0.8 / len(MODELS)
    cols2 = {"T0": "#7f8c8d", "T1": "#2980b9", "T2": "#e67e22", "PROD": "#8e44ad"}
    for i, tag in enumerate(MODELS):
        dets = [d for d in r["raw_dets"].get(f"{img0}|pipe|{tag}", []) if d["conf"] >= conf]
        c = Counter(d["cls"] for d in dets)
        ys = [c.get(k, 0) for k in range(7)]
        off = (i - (len(MODELS) - 1) / 2) * w
        bars = ax.bar(x + off, ys, w, label=TITLE[tag], color=cols2[tag], edgecolor="white", lw=0.6)
        for b, v in zip(bars, ys):
            if v:
                ax.text(b.get_x() + b.get_width() / 2, v + 0.5, str(v), ha="center", va="bottom", fontsize=9)
    ax.axvspan(1.5, 2.5, color="#c0392b", alpha=0.10, zorder=0)
    ax.text(2, ax.get_ylim()[1] * 0.92, "公开集 0 实例\n产品模型却主要输出此类", ha="center",
            fontsize=10, color="#c0392b")
    ax.set_xticks(x)
    ax.set_xticklabels(NAMES)
    ax.set_title(f"真实底片上各模型的检出类别分布（管线段输入, conf≥{conf}）", fontsize=12)
    ax.set_ylabel("检出数", fontsize=11)
    ax.legend(fontsize=9)
    ax.grid(axis="y", alpha=0.25)
    ax.set_axisbelow(True)

    fig.tight_layout()
    fig.savefig(out, bbox_inches="tight")
    plt.close(fig)
    print(f"[OK] {out}")


def main() -> None:
    r = load()
    outdir = ROOT / "runs/eval-cross"
    overlay(r, 0.25, outdir / "real_film_overlay.png")
    class_gap(r, 0.25, outdir / "real_film_class_gap.png")


if __name__ == "__main__":
    main()
