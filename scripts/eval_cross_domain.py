"""交叉域评估：把 N 个模型在 M 个评估域上两两评估，输出矩阵。

用途：回答「域偏移让基线掉多少点」「训推一致化/翻拍增强能否把点捡回来」。
每个模型只加载一次（外层循环），依次跑全部评估域。

评估域（--eval name=path）：
  E0  源域        data/datasets/converted/steel-tube-7cls/data.yaml
  E1  训推一致域  data/datasets/converted/steel-tube-7cls-pipe/data.yaml
  E2  翻拍模拟域  data/eval/steel-tube-photo/data.yaml   （proxy 目标域）

用法::

    python scripts/eval_cross_domain.py \
        --model "T0=.../steel-tube-7cls-yolo11n/weights/best.pt" \
        --model "T1=.../steel-tube-7cls-pipe-yolo11n/weights/best.pt" \
        --eval  "E0=<...>/steel-tube-7cls/data.yaml" \
        --eval  "E2=<...>/eval/steel-tube-photo/data.yaml" \
        --out    runs/eval-cross/matrix.json
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib

matplotlib.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei", "DejaVu Sans"]
matplotlib.rcParams["axes.unicode_minus"] = False


def _kv(items: list[str]) -> list[tuple[str, str]]:
    out = []
    for it in items:
        name, _, path = it.partition("=")
        if not path:
            raise SystemExit(f"[FATAL] 参数应形如 name=path，实得: {it}")
        out.append((name.strip(), path.strip()))
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="交叉域评估矩阵")
    ap.add_argument("--model", action="append", required=True, help="name=path (.pt)")
    ap.add_argument("--eval", action="append", required=True, help="name=path (data.yaml)")
    ap.add_argument("--out", required=True, help="输出 JSON 路径")
    ap.add_argument("--imgsz", type=int, default=640)
    ap.add_argument("--batch", type=int, default=16)
    ap.add_argument("--device", default="0")
    ap.add_argument("--project", default=None, help="ultralytics val 输出根（默认 runs/eval-cross）")
    args = ap.parse_args()

    models = _kv(args.model)
    evals = _kv(args.eval)
    out_path = Path(args.out)
    project = Path(args.project) if args.project else out_path.parent
    project.mkdir(parents=True, exist_ok=True)

    from ultralytics import YOLO

    matrix: dict = {"models": [m[0] for m in models], "evals": [e[0] for e in evals], "cells": {}}

    for mname, mpath in models:
        p = Path(mpath)
        if not p.exists():
            print(f"[SKIP] 模型不存在: {p}")
            continue
        print(f"\n===== 模型 {mname}  ({p.name}) =====")
        model = YOLO(str(p))
        for ename, epath in evals:
            y = Path(epath)
            if not y.exists():
                print(f"  [SKIP] 评估集不存在: {y}")
                continue
            mt = model.val(
                data=str(y), split="val", imgsz=args.imgsz, batch=args.batch,
                device=args.device, plots=False, verbose=False,
                project=str(project), name=f"{mname}__{ename}", exist_ok=True,
            )
            import yaml as _yaml

            names = _yaml.safe_load(y.read_text(encoding="utf-8"))["names"]
            per_class = {}
            if getattr(mt, "box", None) is not None and getattr(mt.box, "ap_class_index", None) is not None:
                for i, ci in enumerate(mt.box.ap_class_index):
                    ci = int(ci)
                    per_class[str(ci)] = {
                        "name": names.get(ci, str(ci)),
                        "ap50": round(float(mt.box.ap50[i]), 4),
                        "ap50_95": round(float(mt.box.ap[i]), 4),
                    }
            cell = {
                "mAP50": round(float(mt.box.map50), 4),
                "mAP50_95": round(float(mt.box.map), 4),
                "precision": round(float(mt.box.mp), 4),
                "recall": round(float(mt.box.mr), 4),
                "per_class": per_class,
            }
            matrix["cells"][f"{mname}__{ename}"] = cell
            print(f"  [{ename}] mAP50={cell['mAP50']:.4f}  mAP50-95={cell['mAP50_95']:.4f}  "
                  f"P={cell['precision']:.4f}  R={cell['recall']:.4f}")

    out_path.write_text(json.dumps(matrix, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n矩阵已写入: {out_path}")

    # 打印可读矩阵
    print("\n" + "=" * 72)
    print("mAP50 矩阵（行=模型，列=评估域）")
    print("=" * 72)
    header = "%-6s" % "模型" + "".join("%12s" % e for e, _ in evals)
    print(header)
    for m, _ in models:
        row = "%-6s" % m
        for e, _ in evals:
            c = matrix["cells"].get(f"{m}__{e}")
            row += "%12s" % (f"{c['mAP50']:.4f}" if c else "-")
        print(row)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
