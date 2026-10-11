"""把分批产出的交叉域矩阵 JSON 合并成一份全量矩阵。

用途：eval_cross_domain.py 每次只跑一部分模型（节省显存/时间），
本脚本把 matrix_T0_T1.json + matrix_T2.json 合并为 matrix_all.json，
并按「模型 × 评估域」顺序重排，供报告直接引用。

用法::

    python scripts/merge_matrix.py --in runs/eval-cross/matrix_T0_T1.json \
                                   --in runs/eval-cross/matrix_T2.json \
                                   --out runs/eval-cross/matrix_all.json
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

MODEL_ORDER = ["T0", "T1", "T2", "PROD"]
EVAL_ORDER = ["E0", "E1", "E2", "E2b"]


def _key(order: list[str], name: str) -> tuple[int, str]:
    return (order.index(name) if name in order else len(order), name)


def main() -> int:
    ap = argparse.ArgumentParser(description="合并交叉域矩阵")
    ap.add_argument("--in", dest="inputs", action="append", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    models: list[str] = []
    evals: list[str] = []
    cells: dict = {}
    meta: dict = {}

    for p in args.inputs:
        path = Path(p)
        if not path.exists():
            print(f"[SKIP] 不存在: {path}")
            continue
        d = json.loads(path.read_text(encoding="utf-8"))
        for m in d.get("models", []):
            if m not in models:
                models.append(m)
        for e in d.get("evals", []):
            if e not in evals:
                evals.append(e)
        cells.update(d.get("cells", {}))
        for k, v in d.items():
            if k not in ("models", "evals", "cells"):
                meta[k] = v
        print(f"[OK] 合并 {path}  ({len(d.get('cells', {}))} cells)")

    models.sort(key=lambda m: _key(MODEL_ORDER, m))
    evals.sort(key=lambda e: _key(EVAL_ORDER, e))

    out = {
        "models": models,
        "evals": evals,
        "cells": {f"{m}__{e}": cells[f"{m}__{e}"] for m in models for e in evals if f"{m}__{e}" in cells},
    }
    out.update(meta)

    outp = Path(args.out)
    outp.parent.mkdir(parents=True, exist_ok=True)
    outp.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n全量矩阵已写入: {outp}")

    print("\n" + "=" * 72)
    print("mAP50 矩阵（行=模型，列=评估域）")
    print("=" * 72)
    print("%-8s" % "模型" + "".join("%12s" % e for e in evals))
    for m in models:
        row = "%-8s" % m
        for e in evals:
            c = out["cells"].get(f"{m}__{e}")
            row += "%12s" % (f"{c['mAP50']:.4f}" if c else "-")
        print(row)

    print("\n" + "=" * 72)
    print("mAP50-95 矩阵")
    print("=" * 72)
    print("%-8s" % "模型" + "".join("%12s" % e for e in evals))
    for m in models:
        row = "%-8s" % m
        for e in evals:
            c = out["cells"].get(f"{m}__{e}")
            row += "%12s" % (f"{c['mAP50_95']:.4f}" if c else "-")
        print(row)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
