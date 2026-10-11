#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
把 steel-tube 数据集转换为「项目 7 类口径」的 YOLO 数据集。

项目类别口径（backend/configs/default.yaml -> detect.class_conf）：
    0 气孔 / 1 夹渣 / 2 未焊透 / 3 未熔合 / 4 裂纹 / 5 咬边 / 6 内凹

steel-tube 原始 8 类 -> 项目 7 类映射：
    0 气孔      -> 0 气孔       （直接，但默认降采样）
    6 夹渣      -> 1 夹渣       （直接）
    7 未融合    -> 3 未熔合     （直接）
    3 裂缝      -> 4 裂纹       （直接）
    1 咬边      -> 5 咬边       （直接）
    2 断弧      -> 丢弃          （NB/T47013.2 无对应口径）
    4 夹珠      -> 丢弃          （口径存疑）
    5 焊瘤      -> 丢弃          （焊瘤 != 内凹）
    未焊透(2) / 内凹(6) 在 steel-tube 中不存在 -> 转换后为 0 框，但 names 仍保留 7 类顺序。

关键正确处理：
1. 含「未映射类」的图默认整张丢弃（--keep-partial 可关闭）。原因：只删框不删图，
   会让模型把真实缺陷区域学成背景，属于负向污染。
2. 气孔降采样默认只作用于 train，且优先保留「气孔+其他类」的混合图，
   只从「纯气孔图」里抽，最大限度保住罕见类信息。
3. 只读原数据，输出到独立目录；Golden Set 与本项目原始数据一概不动。

用法：
    python convert_steel_tube.py --dry-run          # 只看统计，不落盘
    python convert_steel_tube.py                    # 正式转换
    python convert_steel_tube.py --pore-cap 1200    # 自定义气孔框数上限
"""
from __future__ import annotations

import argparse
import random
import shutil
import sys
from collections import Counter
from pathlib import Path

# ---------------------------------------------------------------- 配置

STEEL_TO_PROJ: dict[int, int | None] = {
    0: 0,      # 气孔   -> 气孔
    6: 1,      # 夹渣   -> 夹渣
    7: 3,      # 未融合 -> 未熔合
    3: 4,      # 裂缝   -> 裂纹
    1: 5,      # 咬边   -> 咬边
    2: None,   # 断弧   -> 丢弃
    4: None,   # 夹珠   -> 丢弃
    5: None,   # 焊瘤   -> 丢弃
}

PROJ_NAMES = ["气孔", "夹渣", "未焊透", "未熔合", "裂纹", "咬边", "内凹"]
STEEL_NAMES = {0: "气孔", 1: "咬边", 2: "断弧", 3: "裂缝",
               4: "夹珠", 5: "焊瘤", 6: "夹渣", 7: "未融合"}
PORE_PROJ_ID = 0
IMG_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}
NAME_PREFIX = "steeltube_"


def read_label(path: Path) -> list[tuple[int, float, float, float, float]]:
    """读 YOLO label：返回 [(cid, x, y, w, h), ...]（归一化）。"""
    rows: list[tuple[int, float, float, float, float]] = []
    with open(path, encoding="utf-8", errors="ignore") as fh:
        for line in fh:
            parts = line.split()
            if len(parts) < 5:
                continue
            try:
                cid = int(float(parts[0]))
                x, y, w, h = (float(v) for v in parts[1:5])
            except ValueError:
                continue
            rows.append((cid, x, y, w, h))
    return rows


def collect_split(img_dir: Path, lbl_dir: Path) -> list[tuple[Path, Path]]:
    if not img_dir.is_dir():
        return []
    items: list[tuple[Path, Path]] = []
    for img in sorted(img_dir.rglob("*")):
        if img.suffix.lower() not in IMG_EXTS:
            continue
        rel = img.relative_to(img_dir)
        lbl = (lbl_dir / rel).with_suffix(".txt")
        if lbl.exists():
            items.append((img, lbl))
    return items


def map_split(items, keep_partial: bool):
    """做类别映射 + 未映射图过滤。返回 (保留项, 统计)。"""
    kept = []          # (img, rows_proj)
    stat = Counter()
    dropped_by_class = Counter()
    for img, lbl in items:
        raw = read_label(lbl)
        if not raw:
            stat["empty_label"] += 1
            continue
        mapped, unmapped = [], False
        for cid, x, y, w, h in raw:
            new_id = STEEL_TO_PROJ.get(cid)
            if new_id is None:
                unmapped = True
                dropped_by_class[cid] += 1
            else:
                mapped.append((new_id, x, y, w, h))
        if unmapped and not keep_partial:
            stat["dropped_partial_img"] += 1
            continue
        if not mapped:
            stat["dropped_empty_after_map"] += 1
            continue
        kept.append((img, mapped))
        stat["kept_img"] += 1
    return kept, stat, dropped_by_class


def downsample_pore(kept, cap: int | None, seed: int):
    """对训练集的「纯气孔图」降采样，使气孔框数不超过 cap。返回 (保留项, 信息)。"""
    if cap is None:
        others = sum(1 for _, rows in kept for r in rows if r[0] != PORE_PROJ_ID)
        cap = others  # 目标：气孔框数 ~= 其余类之和（占比约 50%）
    mixed, pure = [], []
    for img, rows in kept:
        has_pore = any(r[0] == PORE_PROJ_ID for r in rows)
        has_other = any(r[0] != PORE_PROJ_ID for r in rows)
        if has_pore and has_other:
            mixed.append((img, rows))
        elif has_pore:
            pure.append((img, rows))
        else:
            mixed.append((img, rows))  # 无气孔图原样保留（命名沿用 mixed 桶仅为承载）

    pore_mixed = sum(1 for _, rows in mixed for r in rows if r[0] == PORE_PROJ_ID)
    rng = random.Random(seed)
    rng.shuffle(pure)

    chosen_pure, pore_now = [], pore_mixed
    if pore_now < cap:
        for item in pure:
            n = sum(1 for r in item[1] if r[0] == PORE_PROJ_ID)
            if pore_now + n > cap:
                continue
            chosen_pure.append(item)
            pore_now += n
    info = {
        "cap": cap,
        "pore_in_mixed": pore_mixed,
        "pure_total": len(pure),
        "pure_chosen": len(chosen_pure),
        "pore_after": pore_now,
    }
    return mixed + chosen_pure, info


def write_label(path: Path, rows) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        for cid, x, y, w, h in rows:
            fh.write(f"{cid} {x:.6f} {y:.6f} {w:.6f} {h:.6f}\n")


def count_boxes(kept):
    c = Counter()
    for _, rows in kept:
        for r in rows:
            c[r[0]] += 1
    return c


def fmt_dist(cnt: Counter) -> str:
    total = sum(cnt.values()) or 1
    lines = []
    for i, name in enumerate(PROJ_NAMES):
        n = cnt.get(i, 0)
        lines.append(f"| {i} | {name} | {n} | {n / total * 100:.1f}% |")
    lines.append(f"| — | **合计** | **{total}** | 100% |")
    return "\n".join(lines)


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=r"D:\Projects\射线焊缝缺陷检测\data\datasets\steel-tube")
    ap.add_argument("--dst", default=r"D:\Projects\射线焊缝缺陷检测\data\datasets\converted\steel-tube-7cls")
    ap.add_argument("--pore-cap", type=int, default=None,
                    help="训练集气孔框数上限；默认 = 其余映射类框数之和（气孔占比约 50%%）")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--keep-partial", action="store_true",
                    help="保留含未映射类的图（默认整张丢弃，避免负向污染）")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    src, dst = Path(args.src), Path(args.dst)
    splits = [("train2021", "train"), ("val2021", "val")]
    report: list[str] = []

    print(f"源: {src}")
    print(f"目标: {dst}")
    print(f"策略: 未映射图{'保留' if args.keep_partial else '整张丢弃'} / "
          f"气孔降采样={'关闭' if args.pore_cap == 0 else ('自动' if args.pore_cap is None else args.pore_cap)}")
    print("=" * 72)

    report.append("# steel-tube -> 项目7类 转换报告\n")
    report.append(f"- 源目录：`{src}`\n- 目标目录：`{dst}`\n")
    report.append(f"- 未映射图处理：**{'保留（不推荐）' if args.keep_partial else '整张丢弃'}**\n")
    report.append("\n## 类别映射表\n\n| steel-tube | 中文 | -> 项目类 | 判定 |\n|---|---|---|---|\n")
    for sid in sorted(STEEL_TO_PROJ):
        tgt = STEEL_TO_PROJ[sid]
        tgt_s = f"{tgt} {PROJ_NAMES[tgt]}" if tgt is not None else "—"
        verdict = "✅ 映射" if tgt is not None else "❌ 丢弃（无对应口径）"
        report.append(f"| {sid} | {STEEL_NAMES[sid]} | {tgt_s} | {verdict} |\n")

    grand_src_img = grand_src_box = 0
    grand_out_img = 0
    grand_out_box = Counter()
    all_dropped = Counter()

    for src_split, out_split in splits:
        items = collect_split(src / "images" / src_split, src / "labels" / src_split)
        if not items:
            print(f"[{src_split}] 未找到图片，跳过")
            continue
        src_boxes = 0
        raw_box_class = Counter()
        for _, lbl in items:
            for cid, *_ in read_label(lbl):
                src_boxes += 1
                raw_box_class[cid] += 1

        kept, stat, dropped = map_split(items, args.keep_partial)
        before = count_boxes(kept)

        ds_info = None
        if out_split == "train" and args.pore_cap != 0:
            kept, ds_info = downsample_pore(kept, args.pore_cap, args.seed)
        after = count_boxes(kept)

        print(f"\n[{src_split} -> {out_split}]")
        print(f"  原始: {len(items)} 图 / {src_boxes} 框")
        print("  原始类分布: " + ", ".join(
            f"{STEEL_NAMES.get(k, k)}={v}" for k, v in sorted(raw_box_class.items())))
        print(f"  过滤后(映射完成): {stat['kept_img']} 图 / {sum(before.values())} 框"
              f" | 含未映射类丢弃 {stat['dropped_partial_img']} 图"
              f" | 空标注丢弃 {stat['empty_label']} 图")
        if dropped:
            print("  被丢弃的未映射框: " + ", ".join(
                f"{STEEL_NAMES.get(k, k)}={v}" for k, v in sorted(dropped.items())))
        if ds_info:
            print(f"  气孔降采样: cap={ds_info['cap']} 混合图内气孔={ds_info['pore_in_mixed']}"
                  f" 纯气孔图 {ds_info['pure_chosen']}/{ds_info['pure_total']} 保留"
                  f" -> 气孔 {ds_info['pore_after']} 框")
        print(f"  最终: {len(kept)} 图 / {sum(after.values())} 框")

        report.append(f"\n## {src_split} -> {out_split}\n\n")
        report.append(f"- 原始：**{len(items)} 图 / {src_boxes} 框**\n")
        report.append(f"- 过滤后：**{stat['kept_img']} 图 / {sum(before.values())} 框**"
                      f"（含未映射类丢弃 {stat['dropped_partial_img']} 图，空标注丢弃 {stat['empty_label']} 图）\n")
        if ds_info:
            report.append(f"- 气孔降采样：cap={ds_info['cap']}，混合图内气孔 {ds_info['pore_in_mixed']}，"
                          f"纯气孔图保留 {ds_info['pure_chosen']}/{ds_info['pure_total']}，"
                          f"降采样后气孔 {ds_info['pore_after']} 框\n")
        report.append(f"- **最终：{len(kept)} 图 / {sum(after.values())} 框**\n\n")
        report.append("| 项目 id | 类别 | 框数 | 占比 |\n|---|---|---|---|\n")
        report.append(fmt_dist(after) + "\n")

        grand_src_img += len(items)
        grand_src_box += src_boxes
        grand_out_img += len(kept)
        grand_out_box += after
        all_dropped += dropped

        if not args.dry_run:
            for img, rows in kept:
                new_name = NAME_PREFIX + img.name
                dst_img = dst / "images" / out_split / new_name
                dst_lbl = dst / "labels" / out_split / (Path(new_name).stem + ".txt")
                dst_img.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(img, dst_img)
                write_label(dst_lbl, rows)

    # ---- 汇总
    print("\n" + "=" * 72)
    print(f"总计: 原始 {grand_src_img} 图 / {grand_src_box} 框"
          f" -> 输出 {grand_out_img} 图 / {sum(grand_out_box.values())} 框")
    print("\n输出类别分布:")
    for i, name in enumerate(PROJ_NAMES):
        n = grand_out_box.get(i, 0)
        tot = sum(grand_out_box.values()) or 1
        print(f"  {i} {name:<5} {n:>6}  {n / tot * 100:5.1f}%")

    report.append("\n## 总计\n\n")
    report.append(f"- 原始：**{grand_src_img} 图 / {grand_src_box} 框**\n")
    report.append(f"- 输出：**{grand_out_img} 图 / {sum(grand_out_box.values())} 框**\n\n")
    report.append("| 项目 id | 类别 | 框数 | 占比 |\n|---|---|---|---|\n")
    report.append(fmt_dist(grand_out_box) + "\n")

    if all_dropped:
        report.append("\n### 被丢弃的未映射框（无 NB/T47013.2 对应口径）\n\n")
        report.append("| steel-tube 类 | 中文 | 丢弃框数 |\n|---|---|---|\n")
        for k, v in sorted(all_dropped.items()):
            report.append(f"| {k} | {STEEL_NAMES.get(k, k)} | {v} |\n")

    if not args.dry_run:
        dst.mkdir(parents=True, exist_ok=True)
        yaml_txt = (
            "# 由 convert_steel_tube.py 生成 —— steel-tube 映射到项目 7 类口径\n"
            "# 类别顺序必须与 backend/configs/default.yaml 的 DefectClass 保持一致\n"
            f"path: {dst.as_posix()}\n"
            "train: images/train\n"
            "val: images/val\n"
            "nc: 7\n"
            "names:\n"
            + "".join(f"  {i}: {n}\n" for i, n in enumerate(PROJ_NAMES))
        )
        (dst / "data.yaml").write_text(yaml_txt, encoding="utf-8")
        (dst / "CONVERSION_REPORT.md").write_text("".join(report), encoding="utf-8")
        print(f"\n已写入: {dst / 'data.yaml'}")
        print(f"已写入: {dst / 'CONVERSION_REPORT.md'}")
    else:
        print("\n[dry-run] 未落盘。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
