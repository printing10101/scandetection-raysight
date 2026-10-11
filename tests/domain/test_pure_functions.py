"""domain 纯函数单元测试：ECE 校准与黑度密度。"""
from __future__ import annotations

import pytest

from backend.domain.density import check_density
from backend.domain.detect.calibration import expected_calibration_error


def test_ece_perfectly_calibrated() -> None:
    """conf=0.75 且准确率恰为 75% → gap=0 → ece=0，verdict 通过。"""
    conf = [0.75, 0.75, 0.75, 0.75]
    ok = [True, True, True, False]
    r = expected_calibration_error(conf, ok)
    assert r["ece"] == 0.0
    assert r["verdict"]["passed"] is True


def test_ece_overconfident_fails() -> None:
    """conf=0.9 而实际一半正确 → gap=0.4 → 远超 0.05 门禁。"""
    conf = [0.9, 0.9, 0.9, 0.9]
    ok = [True, False, True, False]
    r = expected_calibration_error(conf, ok)
    assert r["ece"] > 0.3
    assert r["verdict"]["passed"] is False


def test_ece_length_mismatch_raises() -> None:
    with pytest.raises(ValueError):
        expected_calibration_error([0.5, 0.6], [True])


def test_ece_empty_input_fails_verdict() -> None:
    r = expected_calibration_error([], [])
    assert r["verdict"]["passed"] is False


def test_density_check_boundaries() -> None:
    assert check_density(2.0) is True
    assert check_density(4.5) is True
    assert check_density(3.0) is True
    assert check_density(1.9) is False
    assert check_density(4.6) is False
