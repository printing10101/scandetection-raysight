"""复现「85 缺陷」：对真实翻拍底片跑后端全链路评定（隔离数据目录）。

用法：
    .venv-backend/Scripts/python.exe scripts/repro_85.py <明文图片路径>

输出：detect_mode、defect_count、逐缺陷 (class, conf, bbox)，以及
气孔/内凹是否越过各自有效阈值的对照表。
"""
from __future__ import annotations

import io
import os
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO))

# 隔离数据目录：不污染真实 scan.db
tmp_data = Path(tempfile.mkdtemp(prefix="sd_repro_data_"))
os.environ["SCANDETECTION_USER_DATA_DIR"] = str(tmp_data)

import json  # noqa: E402

from fastapi.testclient import TestClient  # noqa: E402

from backend.app.main import app  # noqa: E402

img_path = Path(sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\Lenovo\AppData\Local\Temp\sdc2_out\455a97cd8e9848928e43a15ed56136d1.png")

with TestClient(app, raise_server_exceptions=False) as client:
    resp = client.post(
        "/api/v1/report",
        files={"image": (img_path.name, io.BytesIO(img_path.read_bytes()), "image/png")},
        data={"force": "true", "allow_preliminary_grade": "true"},
    )
    print("HTTP", resp.status_code)
    body = resp.json()
    if resp.status_code != 200:
        print(json.dumps(body, ensure_ascii=False, indent=1)[:2000])
        sys.exit(1)
    print("detect_mode =", body.get("detect_mode"))
    print("defect_count =", body.get("defect_count"))
    print("photo_mode =", body.get("photo_mode"), " joint_level =", body.get("joint_level"))
    image_id = body["image_id"]

    # 拉缺陷明细
    resp2 = client.get(f"/api/v1/report/{body['report_id']}/detections")
    if resp2.status_code == 200:
        defects = resp2.json().get("defects", [])
    else:
        # 回退：直接查隔离库
        import sqlite3
        con = sqlite3.connect(tmp_data / "data" / "scan.db")
        rows = con.execute(
            "select class_id, confidence, bbox_px from defects where image_id=? and deleted_at is null",
            (image_id,),
        ).fetchall()
        defects = [{"class_id": r[0], "confidence": r[1], "bbox_px": json.loads(r[2])} for r in rows]

    import collections
    cnt = collections.Counter(d["class_id"] for d in defects)
    print("类别分布:", dict(sorted(cnt.items())))
    print("---- 逐条 (class, conf, bbox) ----")
    for d in sorted(defects, key=lambda x: (x["class_id"], -x["confidence"])):
        b = d.get("bbox_px") or d.get("bbox")
        print(f'cls={d["class_id"]} conf={d["confidence"]:.4f} bbox={b}')

    # 阈值对照（recall_first ×0.5）
    print("---- 阈值对照（校准分尺度） ----")
    base = {0: 0.30, 1: 0.12, 2: 0.12, 3: 0.08, 4: 0.05, 5: 0.18, 6: 0.10}
    for cid, thr_base in sorted(base.items()):
        print(f"class {cid}: balanced={thr_base:.2f} recall_first={thr_base*0.5:.2f}")
print("\n隔离数据目录:", tmp_data)
