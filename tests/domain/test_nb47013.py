"""NB/T47013.2-2015 评级引擎单元测试。

锁定判定引擎的核心语义（改规则必须显式过这些用例）：
- 熔断：authorized=false / 缺 T / 缺像素标定 → GradingAmbiguousError，绝不输出级别
- 零容忍：裂纹/未熔合/未焊透 → IV
- 深孔直判 IV；内凹保守 III + 强制人工复核
- 圆形缺陷点数分级（T=10 档：I/1 II/2 III/3）
- 条形缺陷单条限值（T=10：II≤4mm，III≤6.67mm）
- 综合评级：圆形级别 + 条形级别 − 1
"""
from __future__ import annotations

import dataclasses

import pytest

from backend.domain.dto import (
    BBox,
    DefectClass,
    DefectShape,
    Detection,
    ImageMeta,
    JointLevel,
    Modality,
)
from backend.domain.errors import GradingAmbiguousError
from backend.domain.grade.nb47013 import Nb47013Grader
from backend.domain.standards.tables.loader import load_standard_tables

SPACING = 0.1  # mm/px：像素坐标 × 0.1 = 物理尺寸


@pytest.fixture(scope="module")
def tables():
    return load_standard_tables("NB/T47013.2-2015", "nb47013.yaml")


@pytest.fixture(scope="module")
def grader(tables) -> Nb47013Grader:
    return Nb47013Grader(tables)


@pytest.fixture()
def ctx() -> ImageMeta:
    return ImageMeta(
        modality=Modality.DR, pixel_spacing_mm=SPACING, base_metal_thickness_mm=10.0
    )


def _det(cls: DefectClass, w_px: float, h_px: float, *, x: float = 0.0, y: float = 0.0,
         shape: DefectShape | None = None, score: float = 0.95,
         deep_hole: bool = False) -> Detection:
    return Detection(
        id="d1",
        bbox=BBox(x=x, y=y, w=w_px, h=h_px),
        class_id=cls,
        score=score,
        uncertainty=0.1,
        shape=shape,
        deep_hole=deep_hole,
    )


# ---- 熔断路径：任何情况下不得无授权输出级别 -------------------------------


def test_unauthorized_tables_circuit_break(tables, ctx) -> None:
    grader = Nb47013Grader(dataclasses.replace(tables, authorized=False))
    with pytest.raises(GradingAmbiguousError):
        grader.grade([], ctx)


@pytest.mark.parametrize("kwargs", [
    {"base_metal_thickness_mm": None},
    {"base_metal_thickness_mm": 0.0},
    {"pixel_spacing_mm": None},
    {"pixel_spacing_mm": 0.0},
])
def test_missing_context_rejected(tables, kwargs) -> None:
    grader = Nb47013Grader(tables)
    ctx = ImageMeta(modality=Modality.DR, **kwargs)
    with pytest.raises(GradingAmbiguousError):
        grader.grade([], ctx)


# ---- 核心判定语义 ---------------------------------------------------------


def test_clean_image_is_level_i(grader, ctx) -> None:
    r = grader.grade([], ctx)
    assert r.joint_level is JointLevel.I
    assert r.need_review is False


@pytest.mark.parametrize("cls", [
    DefectClass.CRACK,
    DefectClass.LACK_OF_FUSION,
    DefectClass.INCOMPLETE_PENETRATION,
])
def test_zero_tolerance_classes_are_iv(grader, ctx, cls) -> None:
    r = grader.grade([_det(cls, 10, 4)], ctx)
    assert r.joint_level is JointLevel.IV
    assert r.need_review is True
    assert any("零容忍" in b for b in r.basis)


def test_deep_hole_direct_iv(grader, ctx) -> None:
    r = grader.grade([_det(DefectClass.POROSITY, 10, 10, deep_hole=True)], ctx)
    assert r.joint_level is JointLevel.IV
    assert any("深孔" in b for b in r.basis)


def test_concavity_conservative_iii_and_review(grader, ctx) -> None:
    r = grader.grade([_det(DefectClass.CONCAVITY, 30, 8)], ctx)
    assert r.joint_level is JointLevel.III
    assert r.need_review is True


def test_round_defect_point_grading(grader, ctx) -> None:
    """T=10 档限值 I/1 II/2 III/3：直径 2mm=2 点 → II 级。"""
    r = grader.grade([_det(DefectClass.POROSITY, 20, 20, shape=DefectShape.ROUND)], ctx)
    assert r.joint_level is JointLevel.II


def test_round_defect_over_half_t_is_iv(grader, ctx) -> None:
    """长径 > T/2（6mm > 5mm）直判 IV。"""
    r = grader.grade([_det(DefectClass.POROSITY, 60, 60, shape=DefectShape.ROUND)], ctx)
    assert r.joint_level is JointLevel.IV


def test_round_small_diameter_level_i(grader, ctx) -> None:
    """直径 1mm = 1 点 → T=10 档 I 级上限 1 点 → I。"""
    r = grader.grade([_det(DefectClass.POROSITY, 10, 10, shape=DefectShape.ROUND)], ctx)
    assert r.joint_level is JointLevel.I


def test_linear_defect_single_limit(grader, ctx) -> None:
    """T=10：条形 3mm ≤ II 限值 4mm → II；5mm 落 III 档。"""
    short = grader.grade([_det(DefectClass.SLAG, 30, 5, shape=DefectShape.LINEAR)], ctx)
    assert short.joint_level is JointLevel.II

    mid = grader.grade([_det(DefectClass.SLAG, 50, 5, shape=DefectShape.LINEAR)], ctx)
    assert mid.joint_level is JointLevel.III


def test_linear_over_limit_is_iv(grader, ctx) -> None:
    """条形 8mm > III 限值 6.67mm → IV。"""
    r = grader.grade([_det(DefectClass.SLAG, 80, 5, shape=DefectShape.LINEAR)], ctx)
    assert r.joint_level is JointLevel.IV


def test_combined_rating_round_plus_linear_minus_one(grader, ctx) -> None:
    """圆形 II(2点) + 条形 II(3mm) → 2+2−1=III。"""
    r = grader.grade([
        _det(DefectClass.POROSITY, 20, 20, shape=DefectShape.ROUND),
        _det(DefectClass.SLAG, 30, 5, shape=DefectShape.LINEAR),
    ], ctx)
    assert r.joint_level is JointLevel.III


def test_aspect_ratio_fallback_when_shape_missing(grader, ctx) -> None:
    """无 shape 标注时按 L/W≤3 判圆形：30/10=3 → 圆形路径。"""
    r = grader.grade([_det(DefectClass.POROSITY, 30, 10)], ctx)
    # 3mm 直径 = 3 点 → III
    assert r.joint_level is JointLevel.III


def test_per_defect_grades_are_individual(grader, ctx) -> None:
    """逐缺陷级别不得统一复制：1mm 气孔(I) 与 3mm 气孔(III) 并存。"""
    r = grader.grade([
        _det(DefectClass.POROSITY, 10, 10, shape=DefectShape.ROUND),
        _det(DefectClass.POROSITY, 30, 30, shape=DefectShape.ROUND),
    ], ctx)
    assert r.per_defect_grade == (JointLevel.I, JointLevel.III)
