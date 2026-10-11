"""冒烟测试：锁住"软件能跑"这条底线。

- test_health：应用可启动、检测器就绪（trained_yolo / onnx）
- test_detect_end_to_end：合成底片 → /api/v1/detect 全链路返回结构合法

不追求判定准确性，只验证链路通、响应结构对。
运行：.venv-backend/Scripts/python.exe -m pytest
"""
from __future__ import annotations

import io
import struct
import zlib

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app


@pytest.fixture(scope="module")
def client() -> TestClient:
    with TestClient(app) as c:
        yield c


def _synthetic_film_png(width: int = 512, height: int = 512) -> bytes:
    """合成一张"底片感"灰度图：中段焊缝暗带 + 若干模拟气孔暗斑。"""
    import random

    rng = random.Random(7)
    rows: list[bytes] = []
    blobs = [(rng.randint(40, width - 40), height // 2 + rng.randint(-40, 40), rng.randint(4, 9))
             for _ in range(6)]

    def shade(x: int, y: int) -> int:
        v = 140
        if height * 0.42 < y < height * 0.58:
            v = 90  # 焊缝带
        for cx, cy, r in blobs:
            if (x - cx) ** 2 + (y - cy) ** 2 < r * r:
                v = 40
        return v

    for y in range(height):
        row = bytearray()
        for x in range(width):
            g = shade(x, y)
            row += bytes((g, g, g))
        rows.append(bytes([0]) + bytes(row))

    raw = b"".join(rows)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(
            ">I", zlib.crc32(tag + data) & 0xFFFFFFFF
        )

    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw))
        + chunk(b"IEND", b"")
    )


def test_health(client: TestClient) -> None:
    """应用启动后 status 从 starting 异步翻转为 ok，轮询等待完成。"""
    import time

    deadline = time.monotonic() + 60
    body = {}
    while time.monotonic() < deadline:
        resp = client.get("/api/v1/health")
        assert resp.status_code == 200
        body = resp.json()
        if body.get("status") == "ok":
            break
        time.sleep(1)
    assert body["status"] == "ok"
    assert body["detector"] == "trained_yolo"
    assert body["detector_degraded"] is False


def test_detect_end_to_end(client: TestClient) -> None:
    png = _synthetic_film_png()
    resp = client.post(
        "/api/v1/detect",
        files={"image": ("smoke.png", io.BytesIO(png), "image/png")},
    )
    assert resp.status_code == 200, resp.text[:300]
    body = resp.json()
    assert "defects" in body and isinstance(body["defects"], list)
    assert "annotated_image" in body
    for d in body["defects"]:
        assert {"class_name", "confidence", "bbox"} <= set(d.keys())
        assert 0.0 <= float(d["confidence"]) <= 1.0
