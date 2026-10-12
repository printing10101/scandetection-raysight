"""检测器后处理单测：越界框过滤（OOB）+ 内凹阈值防回归。

背景（2026-10-12「85 缺陷」事故）：
- 过曝翻拍底片上模型对「内凹」（训练 0 实例类）产生 73 个 66×596 条状幻觉
  检出，其中大量框 y=-442（大部分面积在图像外）；letterbox padding 区还
  产生了 y<-14 的低分气孔框。
- 修复：① class_conf[6] 0.10→0.50（幻觉原始分挤在 0.075-0.085，0.50 全灭）；
  ② infer() 出口统一做越界过滤（交集 < 40% 丢弃，否则裁剪到边界）。

本文件锁住：过滤的数学行为（丢弃/裁剪/保留三态）与边界情形。
运行：.venv-backend/Scripts/python.exe -m pytest tests/domain/test_detector_oob.py
"""
from __future__ import annotations

import pytest

from backend.domain.detect import yolo_detector as yd
from backend.domain.dto import BBox, DefectClass, Detection


def _det(x: float, y: float, w: float, h: float) -> Detection:
    return Detection(
        id="t",
        bbox=BBox(x=x, y=y, w=w, h=h),
        class_id=DefectClass.POROSITY,
        score=0.9,
        uncertainty=0.1,
    )


class TestFilterOutOfBounds:
    """_filter_out_of_bounds：丢弃 / 裁剪 / 保留三态。"""

    def test_completely_outside_dropped(self) -> None:
        """框完全在图像外（y > 图高）→ 丢弃。"""
        dets = [_det(30, 671, 24, 24)]  # 实测复现：气孔 y=671 图高 392
        assert yd.YoloDetector._filter_out_of_bounds(dets, (392, 1006)) == []

    def test_mostly_outside_dropped(self) -> None:
        """有效交集 < 40% → 丢弃（实测条带 y=-442 h=596，图内仅 26%）。"""
        dets = [_det(100, -442, 66, 596)]  # 图内 0..154 = 154/596 ≈ 26%
        assert yd.YoloDetector._filter_out_of_bounds(dets, (392, 1006)) == []

    def test_edge_sliver_dropped(self) -> None:
        """只露一条边（实测气孔 y=-14 h≈17，图内 3px ≈ 18%）→ 丢弃。"""
        dets = [_det(586, -14.4, 21.2, 17.1)]
        assert yd.YoloDetector._filter_out_of_bounds(dets, (392, 1006)) == []

    def test_mostly_inside_clipped(self) -> None:
        """交集 ≥ 40% → 裁剪到图像边界，保留图内部分。"""
        dets = [_det(100, 300, 50, 200)]  # 图内 300..392 = 92/200 = 46%
        out = yd.YoloDetector._filter_out_of_bounds(dets, (392, 1006))
        assert len(out) == 1
        assert (out[0].bbox.x, out[0].bbox.y) == (100, 300)
        assert out[0].bbox.w == 50
        assert out[0].bbox.h == pytest.approx(92)

    def test_fully_inside_untouched(self) -> None:
        """完全在图内的框原样保留（不裁剪、不改坐标）。"""
        dets = [_det(10, 20, 30, 40)]
        out = yd.YoloDetector._filter_out_of_bounds(dets, (392, 1006))
        assert len(out) == 1
        assert out[0] is dets[0]

    def test_exact_boundary_kept(self) -> None:
        """交集恰好 40%（边界值，>= 保留）。"""
        dets = [_det(0, 392 - 40, 100, 100)]  # 图内 40/100 = 40%
        out = yd.YoloDetector._filter_out_of_bounds(dets, (392, 1006))
        assert len(out) == 1
        assert out[0].bbox.h == pytest.approx(40)

    def test_negative_width_guard(self) -> None:
        """退化框（w/h≤0）安全丢弃，不抛异常。"""
        assert yd.YoloDetector._filter_out_of_bounds([_det(0, 0, 0, 10)], (392, 1006)) == []

    def test_real_incident_signature_all_dropped(self) -> None:
        """「85 缺陷」事故签名回归：73 个条带 + 顶部低分气孔 → 全部为 0。"""
        strips = [_det(20 + 25 * i, 211, 66, 596) for i in range(20)]  # 图内 181/596=30%
        strips += [_det(20 + 25 * i, -442, 66, 596) for i in range(20)]  # 图内 154/596=26%
        pores = [_det(586, -14.4, 21.2, 17.1), _det(3.8, 671.8, 24.2, 24.0)]
        out = yd.YoloDetector._filter_out_of_bounds(strips + pores, (392, 1006))
        assert out == []
