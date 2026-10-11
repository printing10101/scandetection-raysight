"""置信度校准 harness（技术规格 §15.4：期望校准误差 ECE ≤ 0.05）。

ECE：把检测置信度分桶，比较每桶"平均置信度 vs 实测准确率"的加权绝对差。
模型置信度若校准良好，conf=0.8 的检出应当约 80% 正确——校准失真直接
影响"按置信度分流人工复核"的可信度（review_conf 阈值语义）。

correct 的口径：预测框与同类真值框 IoU ≥ 阈值（每真值至多匹配一次）即记
正确；无真值可配的预测记不正确。漏检（真值无预测）不是一次置信度陈述，
不参与校准统计。
"""

from __future__ import annotations

from typing import Any

from backend.domain.detect.calibration import (  # noqa: F401  ECE 已下沉 domain，此处 re-export 保持旧导入路径可用
    DEFAULT_MAX_ECE,
    DEFAULT_N_BINS,
)
from backend.domain.detect.calibration import (
    expected_calibration_error as _domain_expected_calibration_error,
)

DEFAULT_MATCH_IOU = 0.5


def _iou(a: list[float], b: list[float]) -> float:
    ax1, ay1, ax2, ay2 = a[0], a[1], a[0] + a[2], a[1] + a[3]
    bx1, by1, bx2, by2 = b[0], b[1], b[0] + b[2], b[1] + b[3]
    iw = max(0.0, min(ax2, bx2) - max(ax1, bx1))
    ih = max(0.0, min(ay2, by2) - max(ay1, by1))
    inter = iw * ih
    union = a[2] * a[3] + b[2] * b[3] - inter
    return inter / union if union > 0 else 0.0


def match_confidences(
    preds: list[dict[str, Any]],
    gts: list[dict[str, Any]],
    *,
    iou_thr: float = DEFAULT_MATCH_IOU,
) -> list[tuple[float, bool]]:
    """单图预测 → (confidence, correct) 对。

    preds: [{class_id, score, bbox:[x,y,w,h]}]；gts: [{class_id, bbox}]。
    贪心匹配：预测按置信度降序，与未占用的同类真值取 IoU 最大者。
    """
    used: set[int] = set()
    out: list[tuple[float, bool]] = []
    for p in sorted(preds, key=lambda d: -float(d.get("score", 0.0))):
        best_iou, best_j = 0.0, -1
        for j, g in enumerate(gts):
            if j in used or int(g.get("class_id", -1)) != int(p.get("class_id", -2)):
                continue
            v = _iou(p["bbox"], g["bbox"])  # type: ignore[arg-type]
            if v > best_iou:
                best_iou, best_j = v, j
        if best_j >= 0 and best_iou >= iou_thr:
            used.add(best_j)
            out.append((float(p.get("score", 0.0)), True))
        else:
            out.append((float(p.get("score", 0.0)), False))
    return out


expected_calibration_error = _domain_expected_calibration_error
