# -*- coding: utf-8 -*-
"""T2 vs T3 逐类 AP 对比（T3 = T2 + 合成未焊透/内凹）。

目的：验证"合成长尾类是否损害已有类"。逐类拆开看，比只看 mAP 更能定位损害源。
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from ultralytics import YOLO

NAMES = {0: "气孔", 1: "夹渣", 2: "未焊透", 3: "未熔合", 4: "裂纹", 5: "咬边", 6: "内凹"}
SETS = [
    ("E0", "data/datasets/converted/steel-tube-7cls/data.yaml"),
    ("E1", "data/datasets/converted/steel-tube-7cls-pipe/data.yaml"),
    ("E2b", "data/eval/steel-tube-photo-hard/data.yaml"),
]
MODELS = [
    ("T2", "runs/recipe/t2-photo/train/weights/best.pt"),
    ("T3", "runs/recipe/t3-photo-root/train/weights/best.pt"),
]


def main() -> None:
    res = {}
    for mt, mp in MODELS:
        m = YOLO(str(ROOT / mp))
        for et, y in SETS:
            r = m.val(data=str(ROOT / y), split="val", imgsz=640, batch=16,
                      device=0, plots=False, verbose=False)
            res[(mt, et)] = r

    print("=== 逐类 AP50 ===")
    hdr = "%-8s" % "类" + "".join("%14s" % f"{m}·{e}" for m, _ in MODELS for e, _ in SETS)
    print(hdr)
    for ci in range(7):
        row = "%-8s" % NAMES[ci]
        for m, _ in MODELS:
            for e, _ in SETS:
                r = res[(m, e)]
                idx = list(map(int, r.box.ap_class_index))
                ap50 = float(r.box.ap50[idx.index(ci)]) if ci in idx else None
                row += "%14s" % ("--" if ap50 is None else f"{ap50:.3f}")
        print(row)
    print()
    for m, _ in MODELS:
        for e, _ in SETS:
            r = res[(m, e)]
            print(f"{m}·{e}: mAP50={r.box.map50:.4f} mAP50-95={r.box.map:.4f} "
                  f"P={r.box.mp:.4f} R={r.box.mr:.4f}")


if __name__ == "__main__":
    main()
