"""在 steel-tube-7cls 上训练 YOLOv11n 基线。

路径 A 目标：①恢复"能训练"的能力 ②验证 convert_steel_tube.py 的转换是否正确
③得到一个以后可对比的公开数据基线。

纪律：
  - 只读 data/datasets/converted/steel-tube-7cls，绝不修改原数据与 Golden Set
  - 固定 seed + deterministic，保证可复现
  - 产物落在 runs/detect/<name>/，另存 summary.json

用法：
  python scripts/train_steel_tube_baseline.py --epochs 100 --batch 16 --imgsz 640
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

PROJ = Path(__file__).resolve().parents[1]

# torch>=2.6 默认 weights_only=True，老 ckpt 需要放开（新版 ultralytics 亦兼容）
os.environ.setdefault("TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD", "1")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="YOLOv11n baseline on steel-tube-7cls")
    p.add_argument("--data", default=str(PROJ / "data/datasets/converted/steel-tube-7cls/data.yaml"))
    p.add_argument("--model", default=str(PROJ / "models/pretrained/yolo11n.pt"))
    p.add_argument("--epochs", type=int, default=100)
    p.add_argument("--imgsz", type=int, default=640)
    p.add_argument("--batch", type=int, default=16)
    p.add_argument("--workers", type=int, default=4)
    p.add_argument("--patience", type=int, default=30)
    p.add_argument("--seed", type=int, default=0)
    p.add_argument("--device", default="0")
    p.add_argument("--name", default="steel-tube-7cls-yolo11n")
    p.add_argument("--runs-root", default=str(PROJ / "runs/detect"))
    return p.parse_args()


def preflight(data_yaml: Path, model: Path) -> None:
    """开训前把能炸的地方先炸掉。"""
    if not data_yaml.exists():
        sys.exit(f"[FATAL] data.yaml 不存在: {data_yaml}")
    if not model.exists():
        sys.exit(f"[FATAL] 预训练权重不存在: {model}")

    import yaml

    cfg = yaml.safe_load(data_yaml.read_text(encoding="utf-8"))
    root = Path(cfg["path"])
    for split in ("train", "val"):
        d = root / cfg[split]
        n = len([x for x in d.iterdir() if x.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp"}]) if d.is_dir() else 0
        if n == 0:
            sys.exit(f"[FATAL] {split} 目录无图片: {d}")
        print(f"[preflight] {split:5s}: {n} 张  ({d})")
    print(f"[preflight] nc={cfg['nc']}  names={list(cfg['names'].values())}")

    # 中文路径在 Windows + cv2 上是经典坑，提前验证 ultralytics 的 imread 补丁是否生效
    import cv2
    from ultralytics.utils.patches import imread

    first = next(x for x in (root / cfg["train"]).iterdir() if x.suffix.lower() in {".jpg", ".jpeg", ".png"})
    img = imread(str(first))
    if img is None:
        sys.exit(f"[FATAL] 无法读取图片（疑似中文路径问题）: {first}")
    print(f"[preflight] 图片读取 OK: shape={img.shape}  cv2={cv2.__version__}")
    print("[preflight] GPU: ", end="")
    import torch

    print(f"{torch.cuda.get_device_name(0)}  cuda={torch.cuda.is_available()}")


def main() -> None:
    args = parse_args()
    data_yaml = Path(args.data)
    model = Path(args.model)

    import matplotlib
    import torch

    # 让 PR 曲线/混淆矩阵里的中文类名正常显示（否则是方块）
    matplotlib.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei", "DejaVu Sans"]
    matplotlib.rcParams["axes.unicode_minus"] = False

    from ultralytics import YOLO

    torch.manual_seed(args.seed)
    print("=" * 78)
    print("YOLOv11n baseline | steel-tube-7cls -> 项目 7 类口径")
    print("=" * 78)
    preflight(data_yaml, model)

    print("\n[info] ultralytics 版本:", __import__("ultralytics").__version__)
    print(f"[info] 开始训练 epochs={args.epochs} imgsz={args.imgsz} batch={args.batch}\n")

    m = YOLO(str(model))
    results = m.train(
        data=str(data_yaml),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        workers=args.workers,
        device=args.device,
        patience=args.patience,
        seed=args.seed,
        deterministic=True,
        project=args.runs_root,
        name=args.name,
        exist_ok=True,
        pretrained=True,
        val=True,
        plots=True,
        verbose=True,
    )

    save_dir = Path(results.save_dir)
    best = save_dir / "weights" / "best.pt"
    print(f"\n[train] 完成，产物目录: {save_dir}")

    # 用最佳权重在 val 上复评一次，拿到每类 AP
    print("\n[validate] 用 best.pt 复评 val ...")
    metrics = YOLO(str(best)).val(data=str(data_yaml), imgsz=args.imgsz, batch=args.batch,
                                  device=args.device, split="val", plots=True,
                                  project=args.runs_root, name=args.name, exist_ok=True)

    import yaml as _yaml
    names = _yaml.safe_load(data_yaml.read_text(encoding="utf-8"))["names"]
    per_class = {}
    if getattr(metrics, "box", None) is not None and getattr(metrics.box, "ap_class_index", None) is not None:
        for i, ci in enumerate(metrics.box.ap_class_index):
            ci = int(ci)
            per_class[str(ci)] = {
                "name": names.get(ci, str(ci)),
                "ap50": float(metrics.box.ap50[i]),
                "ap50_95": float(metrics.box.ap[i]),
            }

    summary = {
        "run": args.name,
        "model": Path(args.model).name,
        "data": str(data_yaml),
        "epochs_requested": args.epochs,
        "epochs_done": (int(getattr(m.trainer, "epoch", -1)) + 1) if getattr(m, "trainer", None) is not None else None,
        "imgsz": args.imgsz,
        "batch": args.batch,
        "seed": args.seed,
        "gpu": torch.cuda.get_device_name(0),
        "torch": torch.__version__,
        "ultralytics": __import__("ultralytics").__version__,
        "overall": {
            "mAP50": float(metrics.box.map50),
            "mAP50_95": float(metrics.box.map),
            "precision": float(metrics.box.mp),
            "recall": float(metrics.box.mr),
        },
        "per_class": per_class,
        "weights": {"best": str(best), "last": str(save_dir / "weights" / "last.pt")},
    }

    out = save_dir / "summary.json"
    out.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n" + "=" * 78)
    print("最终结果")
    print("=" * 78)
    print(f"mAP50     : {summary['overall']['mAP50']:.4f}")
    print(f"mAP50-95  : {summary['overall']['mAP50_95']:.4f}")
    print(f"precision : {summary['overall']['precision']:.4f}")
    print(f"recall    : {summary['overall']['recall']:.4f}")
    print("-" * 78)
    for k in sorted(per_class, key=lambda x: int(x)):
        v = per_class[k]
        print(f"  [{k}] {v['name']:6s} AP50={v['ap50']:.4f}  AP50-95={v['ap50_95']:.4f}")
    print("-" * 78)
    print(f"summary   : {out}")
    print(f"best.pt   : {best}")


if __name__ == "__main__":
    main()
