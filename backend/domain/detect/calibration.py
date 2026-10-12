"""置信度温度校准（逐类温度缩放，纯函数、模型无关）。

背景：部署后评估（training/post_deploy_eval）实测部署权重 ECE=0.2726，远超
规格书 §15.4 的 0.05 门槛——模型显著过度自信，"按置信度分流人工复核"的
阈值语义失真。温度缩放（Guo et al. 2017）是后验校准的标准手段：对 sigmoid
输出 p，p' = σ(logit(p)/T)；T>1 软化（降置信），T=1 恒等，逐类拟合可吸收
类间校准差异（气孔过燃 vs 稀有类欠燃）。

分层约定：本模块只做数学与数据校验（文件 IO / 哈希校验在 app/infra/
training 层完成），全部函数可离线单测。
"""

from __future__ import annotations

from typing import Any

import numpy as np

# 逐类拟合所需最少 (score, correct) 样本对：低于此数的类不拟合（T=1 恒等），
# 避免小样本网格搜索过拟合分桶噪声。
MIN_PAIRS_PER_CLASS = 30

# 温度搜索网格：0.25（强锐化）到 8.0（强软化），步长 0.25。T<1 必须保留：
# 部署同参评估（逐类阈值过滤后）实测显示模型在合成域上**欠自信**
# （accuracy > mean confidence），仅向上搜索会漏掉最优解。
DEFAULT_TEMP_GRID = tuple(np.arange(0.25, 8.01, 0.25).tolist())


def temperature_transform(probs: np.ndarray, temp: float) -> np.ndarray:
    """对 sigmoid 概率做温度缩放（数值稳定实现）。

    p' = p^a / (p^a + (1-p)^a)，其中 a = 1/T。T=1 恒等；T>1 软化
    （高置信下调），T<1 锐化。输入应为 (0,1) 开区间外的值会被裁剪。
    """
    if temp <= 0:
        raise ValueError(f"温度必须为正数，收到 {temp}")
    p = np.clip(np.asarray(probs, dtype=np.float64), 1e-6, 1.0 - 1e-6)
    if abs(temp - 1.0) < 1e-9:
        return np.asarray(probs, dtype=np.float64)
    a = 1.0 / temp
    pa = np.power(p, a)
    return pa / (pa + np.power(1.0 - p, a))


def apply_class_temperature(
    scores: np.ndarray, temps: dict[int, float], *, class_axis: int = -1
) -> np.ndarray:
    """按类通道对分数矩阵做温度缩放（其余维度原样保留）。

    scores     : 分数矩阵（sigmoid 概率），class_axis 指向类别维；
    temps      : {class_id: T}；未列出的类保持原值，空映射恒等返回。

    用于检测头的逐锚框分数矩阵 [anchors, nc]（class_axis=-1）或 [nc, anchors]
    （class_axis=0）：在校准分数上做 argmax/阈值比较，使 infer_conf/class_conf
    的语义统一落在校准尺度上。
    """
    if not temps:
        return scores
    out = np.asarray(scores, dtype=np.float64).copy()
    # moveaxis 返回视图：对 moved 的原位赋值直接落到 out 上
    moved = np.moveaxis(out, class_axis, -1)
    n_classes = moved.shape[-1]
    for cid, temp in temps.items():
        if not 0 <= int(cid) < n_classes:
            continue  # 模型类数与校准表不一致时跳过多余类（防旧表污染新模型）
        if abs(temp - 1.0) < 1e-9:
            continue
        moved[..., int(cid)] = temperature_transform(moved[..., int(cid)], temp)
    return out


# ---- ECE（期望校准误差，§15.4 门禁同口径）---------------------------------
# 2026-10-12 自 evaluation/calibration 下沉到 domain（分层契约：domain 零外部
# 依赖；grid_search_temperature 此前经 lazy import 反向依赖 evaluation）。
# evaluation/calibration 保持 re-export 旧路径兼容。
DEFAULT_N_BINS = 15
DEFAULT_MAX_ECE = 0.05


def expected_calibration_error(
    confidences: list[float],
    correct: list[bool],
    *,
    n_bins: int = DEFAULT_N_BINS,
    max_ece: float = DEFAULT_MAX_ECE,
) -> dict[str, Any]:
    """ECE 主计算（等宽分桶）+ 阈值判定。

    返回 ece、分桶明细（可靠性图数据）、最大校准误差（MCE）与 verdict。
    """
    if len(confidences) != len(correct):
        raise ValueError("confidences 与 correct 长度必须一致")
    n = len(confidences)
    bins: list[dict[str, float]] = [
        {"lo": i / n_bins, "hi": (i + 1) / n_bins, "n": 0, "conf_sum": 0.0, "n_correct": 0}
        for i in range(n_bins)
    ]
    for c, ok in zip(confidences, correct):
        b = min(n_bins - 1, max(0, int(c * n_bins)))
        bins[b]["n"] += 1
        bins[b]["conf_sum"] += float(c)
        bins[b]["n_correct"] += 1 if ok else 0

    ece = 0.0
    mce = 0.0
    table: list[dict[str, float]] = []
    for b in bins:
        cnt = int(b["n"])
        if cnt:
            # 先用原始值算 gap，再在展示层 round——用已 round 的行值算 ECE
            # 会引入最高 1e-4 的舍入噪声。
            conf_mean = b["conf_sum"] / cnt
            accuracy = b["n_correct"] / cnt
            gap = abs(accuracy - conf_mean)
            ece += cnt / n * gap
            mce = max(mce, gap)
        else:
            conf_mean = 0.0
            accuracy = 0.0
            gap = 0.0
        row: dict[str, float] = {
            "lo": round(b["lo"], 4),
            "hi": round(b["hi"], 4),
            "n": cnt,
            "conf_mean": round(conf_mean, 4),
            "accuracy": round(accuracy, 4),
            "gap": round(gap, 4),
        }
        table.append(row)

    ece = round(ece, 4)
    return {
        "n_samples": n,
        "n_bins": n_bins,
        "ece": ece,
        "mce": round(mce, 4),
        "bins": table,
        "thresholds": {"max_ece": max_ece},
        "verdict": {"passed": n > 0 and ece <= max_ece},
    }


def grid_search_temperature(
    confidences: list[float],
    correct: list[bool],
    *,
    grid: tuple[float, ...] = DEFAULT_TEMP_GRID,
    n_bins: int = 15,
) -> dict[str, Any]:
    """网格搜索最小化 ECE 的温度（校准目标与 §15.4 门禁同口径）。

    返回 {best_temp, ece_before, ece_after, n}；样本不足（< MIN_PAIRS_PER_CLASS）
    时返回 best_temp=1.0 并标记 skipped——诚实不拟合优于小样本过拟合。
    """
    n = len(confidences)
    if n == 0 or n != len(correct):
        return {"best_temp": 1.0, "ece_before": None, "ece_after": None, "n": n, "skipped": True}
    ece_before = expected_calibration_error(confidences, correct, n_bins=n_bins)["ece"]
    if n < MIN_PAIRS_PER_CLASS:
        return {
            "best_temp": 1.0,
            "ece_before": ece_before,
            "ece_after": ece_before,
            "n": n,
            "skipped": True,
        }
    best_t, best_ece = 1.0, float(ece_before)
    for t in grid:
        cal = [float(temperature_transform(np.array([c]), t)[0]) for c in confidences]
        ece = expected_calibration_error(cal, correct, n_bins=n_bins)["ece"]
        if ece < best_ece:
            best_t, best_ece = float(t), float(ece)
    return {
        "best_temp": best_t,
        "ece_before": ece_before,
        "ece_after": best_ece,
        "n": n,
        "skipped": False,
    }


def parse_calibration_payload(payload: object, expected_model_id: str) -> dict[int, float] | None:
    """校验并提取校准表（app/training 层读文件后调用，本函数只做纯校验）。

    payload 为外部 JSON 反序列化结果，类型放宽为 object 由本函数自行甄别；
    须含 model_id（与当前权重指纹一致）与 temperatures（{class: T}）；
    model_id 不匹配 / 结构非法 / 温度非正 → 返回 None（调用方静默不启用校准，
    绝不让过期校准表污染新权重）。
    """
    if not isinstance(payload, dict):
        return None
    if payload.get("model_id") != expected_model_id:
        return None
    raw = payload.get("temperatures")
    if not isinstance(raw, dict) or not raw:
        return None
    temps: dict[int, float] = {}
    for k, v in raw.items():
        try:
            cid, t = int(k), float(v)
        except (TypeError, ValueError):
            return None
        if t <= 0:
            return None
        temps[cid] = t
    return temps or None
