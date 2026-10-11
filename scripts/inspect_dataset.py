"""扫描目录下任意 YOLO 格式数据集，输出结构与类别分布。

用途：下载完公开数据集后，先量化"到底拿到什么"，再决定是否值得混训。
纯标准库，不依赖 numpy/PIL/cv2 —— 可直接在任何 Python 3.10+ 上跑。

用法：
    python inspect_dataset.py <数据集根目录> [--top N]

判定逻辑：
- 自动寻找 images/labels 成对目录（常见布局：root/{train,val,test}/{images,labels}
  或 root/images + root/labels）；
- 类别名从 data.yaml / *.yaml / classes.txt 里读，读不到就只给 id；
- 统计图片数、标注框数、每类框数、每类出现过的图片数（衡量"类是否集中"）。
"""

from __future__ import annotations

import argparse
import sys
from collections import Counter
from pathlib import Path

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp", ".pgm"}


def _read_class_names(root: Path) -> dict[int, str]:
    """从常见位置读类别名；读不到返回空 dict。"""
    for cand in [root / "data.yaml", root / "dataset.yaml", root / "obj.data", root / "classes.txt"]:
        if not cand.exists():
            continue
        try:
            text = cand.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        if cand.suffix == ".txt":
            return {i: n.strip() for i, n in enumerate(text.splitlines()) if n.strip()}
        # YAML：抓 names: 下的 "- xxx" 或 "0: xxx" 两种写法
        names: dict[int, str] = {}
        in_names = False
        for line in text.splitlines():
            s = line.strip()
            if s.startswith("names"):
                in_names = True
                if ":" in s and s.split(":", 1)[1].strip():
                    continue
                continue
            if in_names:
                if s.startswith("-") and not s.startswith("--"):
                    names[len(names)] = s.lstrip("- ").strip()
                elif ":" in s and s.split(":", 1)[0].strip().isdigit():
                    idx = int(s.split(":", 1)[0].strip())
                    names[idx] = s.split(":", 1)[1].strip().strip("'\"")
                elif s and not s.startswith("#") and not s[0].isalnum():
                    continue
                elif s and not s.startswith("#") and in_names and ":" not in s and "-" not in s[:1]:
                    # names 块结束（遇到下一个顶层键）
                    if s.endswith(":") or ":" in s:
                        break
        if names:
            return names
    return {}


def _find_pairs(root: Path) -> list[tuple[str, Path, Path]]:
    """找出 (split名, images目录, labels目录)。"""
    pairs: list[tuple[str, Path, Path]] = []
    # 布局 A：root/<split>/images + root/<split>/labels
    for sub in sorted(p for p in root.iterdir() if p.is_dir()):
        img = sub / "images"
        lbl = sub / "labels"
        if img.is_dir() and lbl.is_dir():
            pairs.append((sub.name, img, lbl))
        elif (sub / "JPEGImages").is_dir() and (sub / "labels").is_dir():
            pairs.append((sub.name, sub / "JPEGImages", sub / "labels"))
    if not pairs:
        # 布局 B：root/images + root/labels
        if (root / "images").is_dir() and (root / "labels").is_dir():
            pairs.append(("all", root / "images", root / "labels"))
    if not pairs:
        # 布局 C：递归找
        for img in root.rglob("images"):
            lbl = img.parent / "labels"
            if lbl.is_dir():
                pairs.append((img.parent.name, img, lbl))
    return pairs


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("root", help="数据集根目录")
    ap.add_argument("--top", type=int, default=8, help="打印前 N 个最深的目录层级")
    args = ap.parse_args()

    root = Path(args.root)
    if not root.is_dir():
        print(f"[ERR] 不是目录: {root}")
        return 2

    names = _read_class_names(root)
    pairs = _find_pairs(root)
    if not pairs:
        print(f"[WARN] 未找到 images/labels 成对目录，先打印目录树（深度 {args.top}）：")
        for p in sorted(root.rglob("*"))[:200]:
            if p.is_dir():
                print("   ", p.relative_to(root))
        return 1

    total_img = total_box = 0
    cls_box: Counter[int] = Counter()
    cls_img: Counter[int] = Counter()
    per_split: list[tuple[str, int, int]] = []

    for split, img_dir, lbl_dir in pairs:
        imgs = [p for p in img_dir.rglob("*") if p.suffix.lower() in IMAGE_EXTS]
        n_img = len(imgs)
        n_box = 0
        for im in imgs:
            # images/ 下可能还有 train2021/val2021 之类子目录：按相对路径镜像找标签
            try:
                rel = im.relative_to(img_dir)
            except ValueError:
                rel = Path(im.name)
            lbl = lbl_dir / rel.parent / (im.stem + ".txt")
            if not lbl.exists():
                lbl = lbl_dir / (im.stem + ".txt")
            if not lbl.exists():
                continue
            try:
                lines = [l.strip() for l in lbl.read_text(encoding="utf-8", errors="ignore").splitlines()]
            except OSError:
                continue
            seen: set[int] = set()
            for l in lines:
                if not l:
                    continue
                parts = l.split()
                try:
                    cid = int(float(parts[0]))
                except (ValueError, IndexError):
                    continue
                cls_box[cid] += 1
                seen.add(cid)
                n_box += 1
            for c in seen:
                cls_img[c] += 1
        per_split.append((split, n_img, n_box))
        total_img += n_img
        total_box += n_box

    print("=" * 62)
    print(f"数据集: {root}")
    print(f"类别名: {names if names else '(未找到 data.yaml/classes.txt，仅显示 id)'}")
    print("=" * 62)
    print(f"{'split':<14}{'图片数':>10}{'标注框数':>12}{'框/图':>10}")
    for split, n_img, n_box in per_split:
        ratio = (n_box / n_img) if n_img else 0.0
        print(f"{split:<14}{n_img:>10}{n_box:>12}{ratio:>10.2f}")
    print("-" * 62)
    print(f"{'合计':<14}{total_img:>10}{total_box:>12}{(total_box/total_img if total_img else 0):>10.2f}")
    print("=" * 62)
    print("类别分布（YOLO id 排序）")
    print(f"{'id':<5}{'名称':<18}{'框数':>8}{'占比':>9}{'出现图数':>10}")
    for cid in sorted(cls_box):
        share = cls_box[cid] / total_box if total_box else 0
        print(f"{cid:<5}{names.get(cid, '-'):<18}{cls_box[cid]:>8}{share:>9.1%}{cls_img.get(cid, 0):>10}")
    print("=" * 62)
    if total_box == 0:
        print("[WARN] 一个框都没读到 —— 先确认标签格式是不是 YOLO txt。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
