"""影像质量自动修复（进入解析流程前的宽容度扩展）。纯算法，无 I/O。

设计约束（与 backend/domain/preprocess/pipeline.py 同一纪律）：
- 以"不损害缺陷边缘/不伪造影像信息"为第一约束；
- 所有阈值经构造器注入（来自 configs，禁硬编码）；
- 每一步修复只在对应质量问题被检测到时执行，动作全部留痕（可审计）；
- 超出可修复范围的问题进入 unrepaired，由调用方给出明确失败提示。

七类质量问题与对应校正：
1. 过曝   → 自动伽马（按均值推导，压暗高光）
2. 欠曝   → 自动伽马（提亮暗部）
3. 低对比度 → 1%/99% 分位数拉伸
4. 模糊   → 非锐化掩模（unsharp mask，轻度）
5. 噪点   → 双边滤波（保边去噪）
6. 倾斜   → Hough 直线主方向估计 + 仿射纠偏（画布不变）
7. 裁剪不当 → 均匀边框（纯黑/纯白留白）自动裁除

不可修复（信息不可恢复，unrepaired 非空）判定：
- 过曝面积超上限（高亮像素成片，信息已丢失）；
- 欠曝面积超上限（暗部成片，信息已丢失）；
- 梯度低于硬下限（严重模糊，锐化无信息可用）；
- 倾斜角超上限（超出自动纠偏安全范围，需人工处理）。

坐标系契约（调用方须遵守）：
- 纠偏/裁剪会改变几何 → 调用方（pipelines）必须用修复后的帧重新渲染
  落库副本，保证缺陷框与报告附图同坐标系；
- allow_geometry=False 时跳过几何修复（如 DICOM 有原始密度数组、或调用方
  提供了原图坐标系的 IQI ROI），只做像素级修复。
"""

from __future__ import annotations

from dataclasses import dataclass, field

import cv2
import numpy as np

from backend.domain.preprocess.metrics import estimate_noise


@dataclass
class RepairCfg:
    """修复阈值与强度（全部可经 configs 注入）。"""

    # —— 过曝：饱和灰阶与面积占比 ——
    overexposed_sat_gray: int = 250
    overexposed_frac: float = 0.30
    overexposed_unrecoverable_frac: float = 0.60
    # —— 欠曝：暗部灰阶与面积占比 ——
    underexposed_dark_gray: int = 8
    underexposed_frac: float = 0.40
    underexposed_unrecoverable_frac: float = 0.75
    # —— 均值区间：区间内不做伽马（避免对正常影像乱校正）——
    mean_lo: float = 60.0
    mean_hi: float = 200.0
    # —— 对比度：p1–p99 灰阶跨度下限 ——
    low_contrast_spread: float = 20.0
    # —— 模糊：平均梯度幅值（Sobel）阈值 ——
    blur_gradient_min: float = 0.9
    blur_unrecoverable: float = 0.25
    # —— 噪声：MSCN σ 上限（metrics.estimate_noise 同量纲）——
    noise_sigma_max: float = 12.0
    # —— 倾斜：触发阈值与安全上限（度）——
    tilt_min_deg: float = 0.6
    tilt_max_deg: float = 15.0
    # —— 裁剪：均匀边框判定与每侧最大裁除比例 ——
    border_uniform_std: float = 2.0
    border_trim_max_frac: float = 0.10
    border_trim_min_px: int = 8
    # —— 校正强度 ——
    gamma_min: float = 0.35
    gamma_max: float = 2.8
    denoise_bilateral_d: int = 9
    sharpen_amount: float = 0.6


@dataclass
class RepairOutcome:
    """修复结果：图 + 全部留痕。

    image          : 修复后影像（uint8 单通道，几何与输入同系或已纠偏/裁边）
    metrics        : 修复前质量度量（sat_frac/dark_frac/spread/gradient/noise/tilt_deg）
    issues         : 检测到的问题（中文，可进报告/告警）
    actions        : 已执行的修复动作（中文，可进报告/告警）
    unrepaired     : 不可修复的问题（非空 = 调用方应给出明确失败提示）
    deskew_angle   : 实际纠偏角度（度，0 = 未纠偏）
    crop_offset    : 裁剪保留区在原图的 (x, y)；None = 未裁剪
    geometry_applied: 是否发生过几何修复（调用方据此决定是否重渲染落库副本）
    """

    image: np.ndarray
    metrics: dict[str, float] = field(default_factory=dict)
    issues: list[str] = field(default_factory=list)
    actions: list[str] = field(default_factory=list)
    unrepaired: list[str] = field(default_factory=list)
    deskew_angle: float = 0.0
    crop_offset: tuple[int, int] | None = None
    geometry_applied: bool = False


# ---------------------------------------------------------------- 度量


def _measure(gray: np.ndarray, cfg: RepairCfg) -> dict[str, float]:
    sat = float(np.count_nonzero(gray >= cfg.overexposed_sat_gray)) / gray.size
    dark = float(np.count_nonzero(gray <= cfg.underexposed_dark_gray)) / gray.size
    p1, p99 = np.percentile(gray, 1.0), np.percentile(gray, 99.0)
    try:
        noise = float(estimate_noise(gray))
    except Exception:  # noqa: BLE001 — 噪声估计失败不阻断修复主链路
        noise = 0.0
    if not np.isfinite(noise):  # 平坦图（全黑/全白）MSCN 除零 → NaN，按无噪声处理
        noise = 0.0
    return {
        "mean": float(gray.mean()),
        "sat_frac": sat,
        "dark_frac": dark,
        "spread": float(p99 - p1),
        "gradient": _mean_gradient(gray),
        "noise": noise,
        "tilt_deg": _estimate_tilt(gray),
    }


def _mean_gradient(gray: np.ndarray) -> float:
    g = gray if gray.dtype == np.uint8 else cv2.normalize(gray, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
    mag = cv2.magnitude(gx, gy)
    return float(mag.mean())


def _estimate_tilt(gray: np.ndarray) -> float:
    """Hough 直线主方向估计倾斜角（度，正值=顺时针倾斜）。

    底片/焊缝边缘是长直线的强主方向，取"最接近水平/垂直"的长度加权
    中位角。无直线（纯背景/严重模糊）返回 0（不判倾斜——模糊另有门控）。
    """
    h, w = gray.shape[:2]
    if min(h, w) < 64:
        return 0.0
    scale = max(1.0, max(h, w) / 1024.0)  # 大图降采样后做边缘，省 CPU
    small = cv2.resize(gray, (max(1, round(w / scale)), max(1, round(h / scale))), interpolation=cv2.INTER_AREA)
    edges = cv2.Canny(small, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 360, threshold=80, minLineLength=min(small.shape) // 3, maxLineGap=12)
    if lines is None or len(lines) == 0:
        return 0.0
    angles: list[float] = []
    weights: list[float] = []
    for x1, y1, x2, y2 in lines.reshape(-1, 4):
        ang = np.degrees(np.arctan2(float(y2 - y1), float(x2 - x1)))  # 图像 y 向下，正值=顺时针
        a = ang % 180.0
        if a > 90.0:
            a -= 180.0
        if a > 45.0:  # 主方向应接近水平(0)或垂直(90)，对称折叠到 [-45, 45]
            a -= 90.0
        elif a < -45.0:
            a += 90.0
        angles.append(a)
        weights.append(float(np.hypot(x2 - x1, y2 - y1)))
    if not angles:
        return 0.0
    angles_arr = np.asarray(angles)
    weights_arr = np.asarray(weights)
    order = np.argsort(angles_arr)
    cum = np.cumsum(weights_arr[order])
    return float(angles_arr[order][int(np.searchsorted(cum, cum[-1] / 2.0))])


# ---------------------------------------------------------------- 校正


def _apply_gamma(gray: np.ndarray, gamma: float) -> np.ndarray:
    lut = (
        np.rint(np.power(np.arange(256, dtype=np.float32) / 255.0, gamma) * 255.0)
        .clip(0, 255)
        .astype(np.uint8)
    )
    return cv2.LUT(gray, lut)


def _auto_gamma(mean: float, cfg: RepairCfg) -> float | None:
    """按均值推导伽马：把均值拉回 120（0.47 满量程），越界则夹紧。"""
    target = 120.0 / 255.0
    m = mean / 255.0
    if m <= 1e-3 or m >= 0.999:
        return None  # 全黑/全白：伽马无意义（不可修复路径处理）
    gamma = float(np.log(target) / np.log(m))
    return float(np.clip(gamma, cfg.gamma_min, cfg.gamma_max))


def _stretch_contrast(gray: np.ndarray) -> np.ndarray:
    p1, p99 = np.percentile(gray, 1.0), np.percentile(gray, 99.0)
    if p99 - p1 < 1.0:
        return gray
    out = (gray.astype(np.float32) - p1) / (p99 - p1) * 255.0
    return np.clip(np.rint(out), 0, 255).astype(np.uint8)


def _denoise(gray: np.ndarray, cfg: RepairCfg) -> np.ndarray:
    d = max(3, int(cfg.denoise_bilateral_d))
    if d % 2 == 0:
        d += 1
    return cv2.bilateralFilter(gray, d, 75.0, 75.0)


def _sharpen(gray: np.ndarray, amount: float) -> np.ndarray:
    blur = cv2.GaussianBlur(gray, (0, 0), 2.0)
    return cv2.addWeighted(gray, 1.0 + amount, blur, -amount, 0)


def _deskew(gray: np.ndarray, angle_deg: float) -> np.ndarray:
    h, w = gray.shape[:2]
    center = (w / 2.0, h / 2.0)
    m = cv2.getRotationMatrix2D(center, angle_deg, 1.0)  # cv2 正角=逆时针；传入 -tilt 摆正
    return cv2.warpAffine(
        gray, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE
    )


def _auto_crop(gray: np.ndarray, cfg: RepairCfg) -> tuple[np.ndarray, tuple[int, int]] | None:
    """从四边向内扫描并裁除连续均匀边框（扫描留白/纯黑边）。

    只裁"紧贴边缘的连续均匀带"（std ≤ border_uniform_std），每侧最多裁
    border_trim_max_frac 比例；内部平滑区域（渐变内容）不会被误裁。
    返回 (裁后图, 保留区原点 (x, y))；无边框可裁返回 None。
    """
    h, w = gray.shape[:2]
    limit_x = max(cfg.border_trim_min_px, int(w * cfg.border_trim_max_frac))
    limit_y = max(cfg.border_trim_min_px, int(h * cfg.border_trim_max_frac))
    row_std = gray.std(axis=1)
    col_std = gray.std(axis=0)
    top = 0
    while top < limit_y and row_std[top] <= cfg.border_uniform_std:
        top += 1
    bottom = 0
    while bottom < limit_y and row_std[h - 1 - bottom] <= cfg.border_uniform_std:
        bottom += 1
    left = 0
    while left < limit_x and col_std[left] <= cfg.border_uniform_std:
        left += 1
    right = 0
    while right < limit_x and col_std[w - 1 - right] <= cfg.border_uniform_std:
        right += 1
    # 低于最小裁除宽度视为噪声边缘，不裁（防 1-2px 抖动造成坐标偏移）
    if top < cfg.border_trim_min_px:
        top = 0
    if bottom < cfg.border_trim_min_px:
        bottom = 0
    if left < cfg.border_trim_min_px:
        left = 0
    if right < cfg.border_trim_min_px:
        right = 0
    if (top, bottom, left, right) == (0, 0, 0, 0):
        return None
    if h - top - bottom < 32 or w - left - right < 32:  # 保留区过小：防误裁
        return None
    return gray[top : h - bottom, left : w - right], (left, top)


# ---------------------------------------------------------------- 主入口


def auto_repair(
    gray: np.ndarray,
    cfg: RepairCfg,
    *,
    allow_geometry: bool = True,
    allow_tonal: bool = True,
) -> RepairOutcome:
    """检测质量问题并应用自动校正；不可修复项进 unrepaired（调用方给出失败提示）。

    allow_tonal=False（16bit/DICOM 专业扫描件）：只检测与留痕，不做任何
    校正——专业底片的暗底/高对比直方图是合法成像结果，自动伽马/拉伸会
    污染 IQI 与质量门禁的评估输入（宽容度扩展只面向 8bit 通用图/翻拍件）。
    """
    if not isinstance(gray, np.ndarray) or gray.ndim != 2:
        raise ValueError("自动修复仅接受单通道二维灰度图")
    if gray.size == 0:
        raise ValueError("输入影像为空")
    if gray.dtype != np.uint8:
        gray = cv2.normalize(gray, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)

    m = _measure(gray, cfg)
    issues: list[str] = []
    unrepaired: list[str] = []
    actions: list[str] = []
    out = gray
    geometry_applied = False
    deskew_angle = 0.0
    crop_offset: tuple[int, int] | None = None

    # —— 不可修复判定（信息不可恢复，先于修复）——
    if m["sat_frac"] >= cfg.overexposed_unrecoverable_frac:
        unrepaired.append(
            f"过曝面积 {m['sat_frac'] * 100:.0f}%（≥{cfg.overexposed_unrecoverable_frac * 100:.0f}%），高亮信息已丢失无法恢复"
        )
    if m["dark_frac"] >= cfg.underexposed_unrecoverable_frac:
        unrepaired.append(
            f"欠曝面积 {m['dark_frac'] * 100:.0f}%（≥{cfg.underexposed_unrecoverable_frac * 100:.0f}%），暗部信息已丢失无法恢复"
        )
    if m["gradient"] < cfg.blur_unrecoverable:
        unrepaired.append(
            f"严重模糊（平均梯度 {m['gradient']:.2f} < {cfg.blur_unrecoverable:.2f}），无可用边缘信息"
        )
    if abs(m["tilt_deg"]) > cfg.tilt_max_deg:
        unrepaired.append(
            f"倾斜 {abs(m['tilt_deg']):.1f}° 超过自动纠偏上限 {cfg.tilt_max_deg:.0f}°，请人工摆正后重拍/重扫"
        )

    # —— 问题登记 ——
    if m["sat_frac"] >= cfg.overexposed_frac or m["mean"] >= cfg.mean_hi:
        issues.append(f"过曝（饱和像素 {m['sat_frac'] * 100:.0f}%，均值 {m['mean']:.0f}）")
    if m["dark_frac"] >= cfg.underexposed_frac or m["mean"] <= 45.0:
        issues.append(f"欠曝（暗部像素 {m['dark_frac'] * 100:.0f}%，均值 {m['mean']:.0f}）")
    if m["spread"] < cfg.low_contrast_spread:
        issues.append(f"对比度异常（灰阶跨度 {m['spread']:.0f}）")
    if m["gradient"] < cfg.blur_gradient_min:
        issues.append(f"模糊（平均梯度 {m['gradient']:.2f}）")
    if m["noise"] > cfg.noise_sigma_max:
        issues.append(f"噪点（σ={m['noise']:.1f}）")
    if abs(m["tilt_deg"]) > cfg.tilt_min_deg:
        note = f"倾斜 {m['tilt_deg']:.1f}°"
        if not allow_geometry:
            note += "（本轮未纠偏：几何修复被调用方禁用）"
        issues.append(note)

    # —— 几何修复：纠偏 → 裁边 ——
    if allow_geometry and cfg.tilt_min_deg <= abs(m["tilt_deg"]) <= cfg.tilt_max_deg:
        out = _deskew(out, -m["tilt_deg"])
        deskew_angle = m["tilt_deg"]
        geometry_applied = True
        actions.append(f"纠偏 {abs(m['tilt_deg']):.1f}°")
    if allow_geometry:
        cropped = _auto_crop(out, cfg)
        if cropped is not None:
            out, crop_offset = cropped
            geometry_applied = True
            actions.append("裁除均匀边框")

    # —— 像素级修复（仅 allow_tonal）：伽马 → 拉伸 → 去噪 → 锐化 ——
    if allow_tonal:
        # 曝光触发：均值越界且饱和/暗部成片（两者同时成立才动手，
        # 防止把"偏暗但正常的底片直方图"误判为欠曝而乱校正）。
        over_trigger = m["mean"] > cfg.mean_hi and m["sat_frac"] >= cfg.overexposed_frac
        under_trigger = m["mean"] < cfg.mean_lo and m["dark_frac"] >= cfg.underexposed_frac
        if over_trigger or under_trigger:
            g = _auto_gamma(float(out.mean()), cfg)
            if g is not None and abs(g - 1.0) > 0.03:
                out = _apply_gamma(out, g)
                actions.append(f"亮度校正（伽马 {g:.2f}）")
                mean_after = float(out.mean())
                if mean_after > cfg.mean_hi:
                    unrepaired.append(
                        f"过曝超出可校正范围（伽马校正后均值仍 {mean_after:.0f} > {cfg.mean_hi:.0f}），建议重拍"
                    )
                elif mean_after < cfg.mean_lo:
                    unrepaired.append(
                        f"欠曝超出可校正范围（伽马校正后均值仍 {mean_after:.0f} < {cfg.mean_lo:.0f}），建议重拍"
                    )
        if m["spread"] < cfg.low_contrast_spread:
            out = _stretch_contrast(out)
            actions.append("对比度拉伸")
        if m["noise"] > cfg.noise_sigma_max:
            out = _denoise(out, cfg)
            actions.append("保边去噪")
        if cfg.blur_unrecoverable <= m["gradient"] < cfg.blur_gradient_min:
            out = _sharpen(out, cfg.sharpen_amount)
            actions.append("锐化")

    return RepairOutcome(
        image=out,
        metrics=m,
        issues=issues,
        actions=actions,
        unrepaired=unrepaired,
        deskew_angle=deskew_angle,
        crop_offset=crop_offset,
        geometry_applied=geometry_applied,
    )
