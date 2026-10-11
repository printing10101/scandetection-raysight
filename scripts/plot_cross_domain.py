"""把交叉域矩阵画成两张图：① mAP50 热力图 ② 各域模型对比柱状图。

输入 runs/eval-cross/matrix_all.json（由 merge_matrix.py 产出）。
输出 runs/eval-cross/cross_domain.png / cross_domain_bars.png

中文标注，色盲安全配色（蓝-灰-橙），300 DPI。
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
matplotlib.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei", "DejaVu Sans"]
matplotlib.rcParams["axes.unicode_minus"] = False

import matplotlib.pyplot as plt
import numpy as np

EVAL_LABEL = {
    "E0": "E0 源域\n(公开集原生)",
    "E1": "E1 产品真实输入\n(管线一致化)",
    "E2": "E2 翻拍·中偏移\n(strength 0.6)",
    "E2b": "E2b 翻拍·强偏移\n(strength 1.0)",
}
MODEL_LABEL = {
    "T0": "T0 原图基线",
    "T1": "T1 训推一致化",
    "T2": "T2 一致化+翻拍增强",
    "PROD": "PROD 产品模型",
}


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def plot_heatmap(d: dict, out: Path) -> None:
    models, evals = d["models"], d["evals"]
    M = np.full((len(models), len(evals)), np.nan)
    for i, m in enumerate(models):
        for j, e in enumerate(evals):
            c = d["cells"].get(f"{m}__{e}")
            if c:
                M[i, j] = c["mAP50"]

    fig, ax = plt.subplots(figsize=(9.5, 1.4 * len(models) + 2.2), dpi=300)
    cmap = plt.get_cmap("RdYlGn")
    im = ax.imshow(M, cmap=cmap, vmin=0.70, vmax=1.00, aspect="auto")

    ax.set_xticks(range(len(evals)))
    ax.set_xticklabels([EVAL_LABEL.get(e, e) for e in evals], fontsize=9)
    ax.set_yticks(range(len(models)))
    ax.set_yticklabels([MODEL_LABEL.get(m, m) for m in models], fontsize=10)

    for i in range(len(models)):
        for j in range(len(evals)):
            if np.isnan(M[i, j]):
                ax.text(j, i, "待补", ha="center", va="center", color="#888", fontsize=10)
            else:
                v = M[i, j]
                # 深色底用白字
                col = "white" if v < 0.80 or v > 0.965 else "black"
                ax.text(j, i, f"{v:.4f}", ha="center", va="center",
                        color=col, fontsize=11, fontweight="bold")

    ax.set_title("跨域评估矩阵 · mAP50\n（行=训练方式，列=评估域；红线=各自最优点）",
                 fontsize=12, pad=14)
    # 标出每行最优
    for i in range(len(models)):
        row = M[i]
        if not np.all(np.isnan(row)):
            j = int(np.nanargmax(row))
            ax.add_patch(plt.Rectangle((j - 0.5, i - 0.5), 1, 1, fill=False,
                                       edgecolor="#c0392b", lw=2.4))
    fig.colorbar(im, ax=ax, shrink=0.8, label="mAP50")
    fig.tight_layout()
    fig.savefig(out, bbox_inches="tight")
    plt.close(fig)
    print(f"[OK] {out}")


def plot_bars(d: dict, out: Path) -> None:
    models, evals = d["models"], d["evals"]
    colors = {"T0": "#7f8c8d", "T1": "#2980b9", "T2": "#e67e22", "PROD": "#8e44ad"}

    fig, ax = plt.subplots(figsize=(10.5, 5.0), dpi=300)
    x = np.arange(len(evals))
    w = 0.8 / len(models)
    for i, m in enumerate(models):
        vals = []
        for e in evals:
            c = d["cells"].get(f"{m}__{e}")
            vals.append(c["mAP50"] if c else 0)
        off = (i - (len(models) - 1) / 2) * w
        bars = ax.bar(x + off, vals, w, label=MODEL_LABEL.get(m, m),
                      color=colors.get(m, "#333"), edgecolor="white", lw=0.6)
        for b, v in zip(bars, vals):
            if v > 0:
                ax.text(b.get_x() + b.get_width() / 2, v + 0.006, f"{v:.3f}",
                        ha="center", va="bottom", fontsize=7.2)

    ax.set_xticks(x)
    ax.set_xticklabels([EVAL_LABEL.get(e, e) for e in evals], fontsize=9)
    ax.set_ylabel("mAP50", fontsize=11)
    ax.set_ylim(0.60, 1.03)
    ax.axhline(0.75, color="#bbb", ls="--", lw=0.8)
    ax.set_title("同一批 val 图像（523 张 / 1086 框）在不同成像域下的 mAP50",
                 fontsize=12, pad=12)
    ax.legend(loc="lower right", fontsize=9, framealpha=0.95)
    ax.grid(axis="y", alpha=0.25)
    ax.set_axisbelow(True)
    fig.tight_layout()
    fig.savefig(out, bbox_inches="tight")
    plt.close(fig)
    print(f"[OK] {out}")


def main() -> int:
    ap = argparse.ArgumentParser(description="交叉域矩阵可视化")
    ap.add_argument("--in", dest="inp", default="runs/eval-cross/matrix_all.json")
    ap.add_argument("--outdir", default="runs/eval-cross")
    args = ap.parse_args()

    d = load(Path(args.inp))
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    plot_heatmap(d, outdir / "cross_domain_heatmap.png")
    plot_bars(d, outdir / "cross_domain_bars.png")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
