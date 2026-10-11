"""7 类 YOLO 标注校验器 —— 训练前挡掉脏标签。

## 为什么需要

训练数据里的坏标签不会报错，只会让模型悄悄变差：
- **越界框**：坐标 <0 或 >1，ultralytics 会裁剪或丢弃，你以为标了其实没标；
- **类别越界**：`class_id >= 7`，会让 loss 里出现无效索引，可能静默崩溃或学歪；
- **极小框**：宽或高不足 ~2 px，模型学不到任何东西，纯噪声；
- **图片/标签失配**：有图无标（＝告诉模型"这里没缺陷"，是**负向污染**），有标无图（直接崩）；
- **重复框**：同一目标标两次，评估时会重复计入。

## 严重度分级

| 级别 | 含义 | 处理 |
|---|---|---|
| **ERROR** | 会让训练崩或产生负向污染 | 必须修 |
| **WARN** | 不影响训练但不合理 | 建议人工看一眼 |
| **INFO** | 统计信息 | 参考 |

退出码：有 ERROR → 1（可用于 CI / 训练前置门禁）；否则 0。

用法::

    python scripts/validate_labels.py --labels data/real/labels --images data/real/images
    python scripts/validate_labels.py --data data/datasets/converted/steel-tube-7cls/data.yaml
    python scripts/validate_labels.py --data <...>/data.yaml --json runs/validate.json
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

import numpy as np
import yaml

ROOT = Path(__file__).resolve().parents[1]
CLASS_NAMES = ["气孔", "夹渣", "未焊透", "未熔合", "裂纹", "咬边", "内凹"]
_IMG_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}

MIN_BOX_PX = 2.0        # 宽或高低于此像素数即为"极小框"
DUP_IOU = 0.85          # 同类框 IoU 超过此值判为重复


def log(m: str) -> None:
    print(m, flush=True)


def iou(a, b) -> float:
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    iw = max(0.0, min(ax2, bx2) - max(ax1, bx1))
    ih = max(0.0, min(ay2, by2) - max(ay1, by1))
    inter = iw * ih
    ua = (ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter
    return inter / ua if ua > 0 else 0.0


def check_split(img_dir: Path, lab_dir: Path, imgsz_hint: tuple[int, int] | None,
                split: str, findings: list) -> dict:
    """校验一个 split，把问题 append 到 findings。返回统计。"""
    imgs = {p.stem: p for p in img_dir.iterdir() if p.is_file() and p.suffix.lower() in _IMG_EXT} \
        if img_dir.is_dir() else {}
    labs = {p.stem: p for p in lab_dir.glob("*.txt")} if lab_dir.is_dir() else {}

    stats = {
        "split": split, "n_images": len(imgs), "n_labels": len(labs),
        "n_boxes": 0, "per_class": Counter(),
        "n_empty_labels": 0, "n_images_without_label": 0, "n_labels_without_image": 0,
    }

    for stem, p in imgs.items():
        if stem not in labs:
            stats["n_images_without_label"] += 1
            findings.append({"severity": "ERROR", "split": split, "file": str(p),
                             "code": "IMAGE_WITHOUT_LABEL",
                             "msg": "有图无标 —— 等于告诉模型「这里没缺陷」，属负向污染"})
    for stem, p in labs.items():
        if stem not in imgs:
            stats["n_labels_without_image"] += 1
            findings.append({"severity": "ERROR", "split": split, "file": str(p),
                             "code": "LABEL_WITHOUT_IMAGE", "msg": "有标无图，训练时会失败"})

    W = H = 640  # 归一化坐标下的像素换算用真实尺寸；未知时用 640 提示
    for stem, lp in sorted(labs.items()):
        txt = lp.read_text(encoding="utf-8")
        rows = [r for r in (l.strip() for l in txt.splitlines()) if r]
        if not rows:
            stats["n_empty_labels"] += 1
            findings.append({"severity": "WARN", "split": split, "file": str(lp),
                             "code": "EMPTY_LABEL",
                             "msg": "空标签文件（若该图确实无缺陷可忽略，否则说明漏标）"})
            continue

        boxes: list[tuple[int, tuple[float, float, float, float]]] = []
        for ln, row in enumerate(rows, 1):
            parts = row.split()
            if len(parts) != 5:
                findings.append({"severity": "ERROR", "split": split, "file": str(lp),
                                 "code": "BAD_COLUMN_COUNT",
                                 "msg": f"第 {ln} 行应有 5 列，实得 {len(parts)}"})
                continue
            try:
                c = int(float(parts[0]))
                cx, cy, w, h = (float(v) for v in parts[1:])
            except ValueError:
                findings.append({"severity": "ERROR", "split": split, "file": str(lp),
                                 "code": "NON_NUMERIC", "msg": f"第 {ln} 行含非数值"})
                continue

            if not (0 <= c < len(CLASS_NAMES)):
                findings.append({"severity": "ERROR", "split": split, "file": str(lp),
                                 "code": "CLASS_OUT_OF_RANGE",
                                 "msg": f"第 {ln} 行 class_id={c} 超出 0–{len(CLASS_NAMES)-1}"})
                continue

            if not all(0.0 <= v <= 1.0 for v in (cx, cy, w, h)):
                findings.append({"severity": "ERROR", "split": split, "file": str(lp),
                                 "code": "COORD_OUT_OF_RANGE",
                                 "msg": f"第 {ln} 行坐标未归一化到 0–1（{cx},{cy},{w},{h}）"})
            if w <= 0 or h <= 0:
                findings.append({"severity": "ERROR", "split": split, "file": str(lp),
                                 "code": "NONPOSITIVE_SIZE", "msg": f"第 {ln} 行宽高非正"})
                continue

            x1, y1 = (cx - w / 2) * W, (cy - h / 2) * H
            x2, y2 = (cx + w / 2) * W, (cy + h / 2) * H
            if w * W < MIN_BOX_PX or h * H < MIN_BOX_PX:
                findings.append({"severity": "WARN", "split": split, "file": str(lp),
                                 "code": "TINY_BOX",
                                 "msg": f"第 {ln} 行极小框 {w*W:.1f}×{h*H:.1f} px（<{MIN_BOX_PX}）"})
            boxes.append((c, (x1, y1, x2, y2)))
            stats["n_boxes"] += 1
            stats["per_class"][CLASS_NAMES[c]] += 1

        for i in range(len(boxes)):
            for j in range(i + 1, len(boxes)):
                if boxes[i][0] == boxes[j][0] and iou(boxes[i][1], boxes[j][1]) >= DUP_IOU:
                    findings.append({"severity": "WARN", "split": split, "file": str(lp),
                                     "code": "DUPLICATE_BOX",
                                     "msg": f"同类「{CLASS_NAMES[boxes[i][0]]}」存在重复框（IoU≥{DUP_IOU}）"})
    return stats


def main() -> int:
    ap = argparse.ArgumentParser(description="7 类 YOLO 标注校验")
    ap.add_argument("--data", help="data.yaml（自动取 train/val 两个 split）")
    ap.add_argument("--images", help="图像目录（与 --labels 配对，单 split 模式）")
    ap.add_argument("--labels", help="标签目录（与 --images 配对，单 split 模式）")
    ap.add_argument("--json", dest="json_out", help="问题清单输出 JSON 路径")
    ap.add_argument("--max-print", type=int, default=30, help="最多打印多少条问题")
    args = ap.parse_args()

    findings: list[dict] = []
    all_stats: list[dict] = []

    if args.data:
        cfg = yaml.safe_load(Path(args.data).read_text(encoding="utf-8"))
        root = Path(cfg["path"])
        for split in ("train", "val"):
            if split not in cfg:
                continue
            all_stats.append(check_split(root / cfg[split], root / "labels" / split,
                                         None, split, findings))
    elif args.images and args.labels:
        all_stats.append(check_split(Path(args.images), Path(args.labels), None,
                                     "single", findings))
    else:
        raise SystemExit("[FATAL] 要么给 --data，要么同时给 --images 与 --labels")

    # ── 报告 ──
    print("=" * 78)
    print("标注校验报告")
    print("=" * 78)
    for st in all_stats:
        print(f"\n[{st['split']}] 图 {st['n_images']} / 标 {st['n_labels']} / 框 {st['n_boxes']}")
        print(f"  有图无标 {st['n_images_without_label']}  有标无图 {st['n_labels_without_image']}"
              f"  空标签 {st['n_empty_labels']}")
        if st["n_boxes"]:
            tot = sum(st["per_class"].values())
            dist = "  ".join(f"{k} {v}({v/tot:.1%})" for k, v in st["per_class"].most_common())
            print(f"  类别分布: {dist}")

    errs = [f for f in findings if f["severity"] == "ERROR"]
    warns = [f for f in findings if f["severity"] == "WARN"]
    print(f"\n问题：ERROR {len(errs)}  WARN {len(warns)}")
    for f in (errs + warns)[:args.max_print]:
        print(f"  [{f['severity']:5s}] {Path(f['file']).name} · {f['code']}: {f['msg']}")
    if len(errs) + len(warns) > args.max_print:
        print(f"  … 其余 {len(errs)+len(warns)-args.max_print} 条见 JSON")

    if args.json_out:
        p = Path(args.json_out)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps({"stats": [{**s, "per_class": dict(s["per_class"])}
                                           for s in all_stats],
                                 "findings": findings}, ensure_ascii=False, indent=2),
                     encoding="utf-8")
        print(f"\nJSON: {p}")

    print(f"\n结论: {'FAIL（有 ERROR，禁止用于训练）' if errs else 'PASS'}")
    return 1 if errs else 0


if __name__ == "__main__":
    raise SystemExit(main())
