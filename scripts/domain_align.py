"""域对齐工具：把公开数据集（steel-tube，DR 扫描灰度片）推向本项目的现场域
（胶片翻拍），并复现产品推理输入分布。

两个正交变换（可单独或叠加使用）：

1. **训推一致化（pipeline）** —— 复现产品 run_inspection 的推理输入。
   产品链路（backend/app/pipelines.py:374-391）：
       detect_src = film_background_fill(gray, film)
       enhanced   = OpencvPreprocessor.enhance(OpencvPreprocessor.denoise(detect_src), gamma)
       detections = detector.infer(enhanced, ...)
   而本项目此前的 YOLOv11n 基线训练喂的是**原图** —— 训练输入分布与推理
   输入分布不一致。本变换让训练图也过同一管线，消除该 mismatch。
   为保证"真一致"，直接 import 产品的 OpencvPreprocessor，不重写算法。

2. **翻拍域模拟（photo）** —— 合成现场翻拍相对扫描片的结构性差异。
   依据 2 张真实翻拍样本的实测（data/datasets/_domain_ref/）：
       指标          现场翻拍      steel-tube 扫描
       mean           136.5        191.4
       std             74.8         25.9
       行均值 上/中/下 59.6/127.7/232.5   均匀
   即：方向性光照梯度 + 动态范围变化 + 失焦/低分辨率 + 噪声。
   注意**不合成硬黑框**：产品 film_background_fill 会把胶片区外背景填充为
   胶片中位灰阶，黑框在推理时已被抹平，模拟它属于多余域噪声。

所有变换均为逐像素/全局操作，**不改变图像尺寸与标注框坐标**，标签原样复制。

用法::

    # 训推一致化数据集
    python scripts/domain_align.py --mode pipeline \
        --src <in>/images/train --labels <in>/labels/train --dst <out> --split train

    # 翻拍域模拟（含训推一致化）
    python scripts/domain_align.py --mode photo --strength 0.6 --fixed-seed \
        --src <val>/images/val --labels <val>/labels/val --dst <eval_out> --split val
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

import cv2
import numpy as np

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

_IMG_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}

# 与 backend/configs/default.yaml 的 preprocess 段一致（冻结契约）
_PP_KW = dict(bilateral_d=9, median_k=3, clahe_clip=2.0, clahe_grid=8)
_GAMMA = 1.0


def _make_preprocessor():
    """构造产品同款预处理器（避免 import 失败时静默降级）。"""
    from backend.domain.preprocess.pipeline import OpencvPreprocessor

    return OpencvPreprocessor(**_PP_KW)


def to_inference_domain(gray: np.ndarray, pp) -> np.ndarray:
    """复现产品推理输入：denoise → enhance(CLAHE)。"""
    return pp.enhance(pp.denoise(gray), _GAMMA)


def simulate_photo(gray: np.ndarray, rng: np.random.Generator, strength: float = 0.6) -> np.ndarray:
    """合成现场翻拍特征（方向光照梯度 + 对比压缩 + 失焦 + 噪声）。

    strength=0 为恒等；1 为满强度。训练增强建议 0.25~0.8 随机，
    评估集建议固定 0.6（本函数在 --fixed-seed 下逐图确定性）。
    """
    if strength <= 0:
        return gray.copy()

    h, w = gray.shape[:2]
    img = gray.astype(np.float32)

    # 1) 方向性光照梯度（翻拍灯箱不均）：沿随机方向的线性坡
    ny, nx = np.mgrid[0:h, 0:w].astype(np.float32)
    ny /= max(h - 1, 1)
    nx /= max(w - 1, 1)
    ang = rng.uniform(0.0, 2.0 * np.pi)
    proj = np.cos(ang) * nx + np.sin(ang) * ny
    span = proj.max() - proj.min()
    proj = (proj - proj.min()) / (span if span > 1e-6 else 1.0)
    lo = rng.uniform(0.35, 0.70)
    hi = rng.uniform(1.05, 1.70)
    gain = 1.0 + strength * (lo + (hi - lo) * proj - 1.0)
    img = img * gain

    # 2) 边缘暗化（翻拍遮光；products 会填平胶片区外背景，此处仅留温和衰减）
    d = np.minimum(np.minimum(ny, 1.0 - ny), np.minimum(nx, 1.0 - nx))
    band = rng.uniform(0.06, 0.16)
    vig = np.clip(d / band, 0.0, 1.0) ** rng.uniform(0.5, 1.2)
    img = img * (1.0 - strength * 0.85 * (1.0 - vig))

    # 3) 亮度/对比度压缩（翻拍损失）
    m = float(img.mean())
    img = m + (img - m) * (1.0 - strength * rng.uniform(0.15, 0.45))
    img = img * (1.0 - strength * rng.uniform(0.0, 0.12)) + strength * rng.uniform(-8.0, 8.0)

    # 4) 失焦 + 分辨率损失（翻拍焦距/像素密度不足）
    k = int(rng.integers(3, 10))
    if k % 2 == 0:
        k += 1
    img = cv2.GaussianBlur(img, (k, k), 0)
    if rng.random() < 0.6 * strength:
        s = float(rng.uniform(0.55, 0.90))
        small = cv2.resize(img, (max(8, int(w * s)), max(8, int(h * s))), interpolation=cv2.INTER_AREA)
        img = cv2.resize(small, (w, h), interpolation=cv2.INTER_LINEAR)

    # 5) 噪声（传感器 + 压缩伪影近似）
    sigma = float(rng.uniform(1.0, 4.0)) * strength
    if sigma > 0:
        img = img + rng.normal(0.0, sigma, img.shape).astype(np.float32)

    return np.clip(np.rint(img), 0, 255).astype(np.uint8)


def _read_gray(p: Path) -> np.ndarray:
    """非 ASCII 路径安全读取（与产品 image_loader 同口径）。"""
    arr = cv2.imdecode(np.frombuffer(p.read_bytes(), dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    if arr is None:
        raise RuntimeError(f"图像读取失败: {p}")
    return arr


def _write_gray(path: Path, arr: np.ndarray) -> None:
    ok, buf = cv2.imencode(".jpg", arr, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
    if not ok:
        raise RuntimeError(f"编码失败: {path}")
    buf.tofile(str(path))


def main() -> int:
    ap = argparse.ArgumentParser(description="域对齐：训推一致化 + 翻拍域模拟")
    ap.add_argument("--mode", choices=("pipeline", "photo"), required=True,
                    help="pipeline=只做训推一致化；photo=训推一致化+翻拍模拟")
    ap.add_argument("--src", required=True, help="源图片目录")
    ap.add_argument("--dst", required=True, help="输出根目录（其下建 images/<split>）")
    ap.add_argument("--split", default="train", help="划分名（train/val）")
    ap.add_argument("--labels", default=None, help="源标签目录；给定时原样复制到 labels/<split>")
    ap.add_argument("--strength", type=float, default=0.6, help="翻拍模拟强度 0~1（photo 模式）")
    ap.add_argument("--jitter", type=float, default=0.0,
                    help="强度随机抖动幅度（训练增强用；0=固定）")
    ap.add_argument("--seed", type=int, default=0, help="随机种子")
    args = ap.parse_args()

    src = Path(args.src)
    dst = Path(args.dst) / "images" / args.split
    dst.mkdir(parents=True, exist_ok=True)
    pp = _make_preprocessor()
    rng = np.random.default_rng(args.seed)

    files = sorted(p for p in src.iterdir() if p.is_file() and p.suffix.lower() in _IMG_EXT)
    if not files:
        print(f"[ERR] 源目录无图片: {src}")
        return 1

    n_ok = 0
    for p in files:
        try:
            g = _read_gray(p)
        except RuntimeError as exc:
            print(f"[SKIP] {exc}")
            continue
        out = to_inference_domain(g, pp)
        if args.mode == "photo":
            s = args.strength
            if args.jitter > 0:
                s = float(np.clip(s + rng.uniform(-args.jitter, args.jitter), 0.0, 1.0))
            out = simulate_photo(out, rng, s)
        _write_gray(dst / (p.stem + ".jpg"), out)
        n_ok += 1

    print(f"[{args.mode}] {args.split}: {n_ok}/{len(files)} 张 -> {dst}")

    if args.labels:
        lsrc = Path(args.labels)
        ldst = Path(args.dst) / "labels" / args.split
        ldst.mkdir(parents=True, exist_ok=True)
        n_l = 0
        for f in sorted(lsrc.glob("*.txt")):
            shutil.copy2(f, ldst / f.name)
            n_l += 1
        print(f"[labels] {args.split}: {n_l} 个标签复制 -> {ldst}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
