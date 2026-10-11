"""真实翻拍底片核验：把 T0/T1/T2 与产品模型放在**完全相同的输入**上对比响应。

背景：项目原始训练数据已遗失，全项目仅存 2 张现场翻拍底片（由 SDC2 密文解密还原，
2048×2448）。本脚本用它们做定性核验，回答：

  1. 在产品关心的工作点上（conf≈0.3），各模型在真实底片上有多少响应？
  2. 响应是否"互相印证"（把产品模型当伪参考，看 T1/T2 的检出能否与之重合）？
  3. T0（原图训练）在真实底片上是否如预期般不工作？

因为**无标注**，这里只做"检出数 / 置信分布 / 跨模型 IoU 一致率"三个代理指标，
不做精度断言（见报告「局限」）。

输入模式（对所有模型完全一致，保证可比）：
  raw   原图（含黑框/印字/光照梯度）
  pipe  film_bg 无关的纯预处理管线（bilateral9+median3 → CLAHE 2.0/8）

用法::

    python scripts/eval_real_film.py --conf-sweep 0.05 0.25 0.30 0.50 \
        --out runs/eval-cross/real_film.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

REAL_DIR = ROOT / "data" / "datasets" / "_domain_ref" / "decrypted"
MODELS = {
    "T0": ROOT / "runs" / "detect" / "steel-tube-7cls-yolo11n" / "weights" / "best.pt",
    "T1": ROOT / "runs" / "detect" / "steel-tube-7cls-pipe-yolo11n" / "weights" / "best.pt",
    "T2": ROOT / "runs" / "detect" / "steel-tube-7cls-photo-yolo11n" / "weights" / "best.pt",
    "PROD": ROOT / "backend" / "models" / "weights" / "best.onnx",
}
CLASS_NAMES = ["气孔", "夹渣", "未焊透", "未熔合", "裂纹", "咬边", "内凹"]


def imread_unicode(path: str | Path) -> np.ndarray:
    """cv2.imread 在 Windows 非 ASCII 路径下会静默返回 None，改走 imdecode。"""
    buf = np.fromfile(str(path), dtype=np.uint8)
    img = cv2.imdecode(buf, cv2.IMREAD_COLOR)
    if img is None:
        raise SystemExit(f"[FATAL] 无法解码图像: {path}")
    return img


def build_preprocessor():
    """直接复用产品实现，保证与推理链路同款。"""
    from backend.domain.preprocess.pipeline import OpencvPreprocessor

    return OpencvPreprocessor(
        bilateral_d=9, bilateral_sigma_color=75.0, bilateral_sigma_space=75.0,
        median_k=3, clahe_clip=2.0, clahe_grid=8,
    )


def to_pipe(gray: np.ndarray, prep) -> np.ndarray:
    """denoise → enhance(gamma=1.0)，与 domain_align.py --mode pipeline 一致。"""
    out = prep.denoise(gray)
    out = prep.enhance(out, 1.0)
    return out


def iou(a: np.ndarray, b: np.ndarray) -> float:
    """xyxy 框 IoU。"""
    x1 = max(a[0], b[0]); y1 = max(a[1], b[1])
    x2 = min(a[2], b[2]); y2 = min(a[3], b[3])
    iw = max(0.0, x2 - x1); ih = max(0.0, y2 - y1)
    inter = iw * ih
    ua = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
    return float(inter / ua) if ua > 0 else 0.0


def match_rate(dets: list[dict], ref: list[dict], thr: float = 0.3) -> float:
    """dets 中能被 ref 以 IoU>=thr 命中的比例（同类）。"""
    if not dets:
        return float("nan")
    hit = 0
    for d in dets:
        for r in ref:
            if d["cls"] == r["cls"] and iou(np.array(d["xyxy"]), np.array(r["xyxy"])) >= thr:
                hit += 1
                break
    return hit / len(dets)


def detect_pt(model, img_bgr: np.ndarray, conf: float, imgsz: int) -> list[dict]:
    res = model.predict(img_bgr, conf=conf, imgsz=imgsz, device="0", verbose=False)[0]
    out = []
    if res.boxes is None or len(res.boxes) == 0:
        return out
    xyxy = res.boxes.xyxy.cpu().numpy()
    clss = res.boxes.cls.cpu().numpy().astype(int)
    cfs = res.boxes.conf.cpu().numpy()
    for b, c, s in zip(xyxy, clss, cfs):
        out.append({"cls": int(c), "conf": round(float(s), 4),
                    "xyxy": [round(float(v), 1) for v in b]})
    return out


def detect_onnx(sess, img_bgr: np.ndarray, conf: float, imgsz: int = 640) -> list[dict]:
    """极简 YOLOv8 onnx 后处理（单类无关，输出 [1, 4+nc, N]）。"""
    h0, w0 = img_bgr.shape[:2]
    scale = min(imgsz / w0, imgsz / h0)
    nw, nh = int(round(w0 * scale)), int(round(h0 * scale))
    resized = cv2.resize(img_bgr, (nw, nh), interpolation=cv2.INTER_LINEAR)
    canvas = np.full((imgsz, imgsz, 3), 114, np.uint8)
    dx, dy = (imgsz - nw) // 2, (imgsz - nh) // 2
    canvas[dy:dy + nh, dx:dx + nw] = resized
    blob = cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    blob = np.transpose(blob, (2, 0, 1))[None]
    name = sess.get_inputs()[0].name
    pred = sess.run(None, {name: blob})[0]
    pred = np.squeeze(pred, 0).T  # [N, 4+nc]
    boxes, scores = pred[:, :4], pred[:, 4:]
    cls_ids = scores.argmax(1)
    confs = scores[np.arange(len(scores)), cls_ids]
    keep = confs >= conf
    boxes, cls_ids, confs = boxes[keep], cls_ids[keep], confs[keep]
    if len(boxes) == 0:
        return []
    # xywh(cx,cy,w,h) @ letterbox → 原图 xyxy
    cx, cy, bw, bh = boxes.T
    x1 = (cx - bw / 2 - dx) / scale; y1 = (cy - bh / 2 - dy) / scale
    x2 = (cx + bw / 2 - dx) / scale; y2 = (cy + bh / 2 - dy) / scale
    out = []
    for i in range(len(boxes)):
        out.append({"cls": int(cls_ids[i]), "conf": round(float(confs[i]), 4),
                    "xyxy": [round(float(max(x1[i], 0)), 1), round(float(max(y1[i], 0)), 1),
                             round(float(min(x2[i], w0)), 1), round(float(min(y2[i], h0)), 1)]})
    return out


def draw(img_bgr: np.ndarray, dets: list[dict], title: str) -> np.ndarray:
    vis = img_bgr.copy()
    for d in dets:
        x1, y1, x2, y2 = [int(v) for v in d["xyxy"]]
        color = (0, 0, 255) if d["conf"] >= 0.5 else (0, 165, 255) if d["conf"] >= 0.3 else (0, 255, 0)
        cv2.rectangle(vis, (x1, y1), (x2, y2), color, 3)
        cv2.putText(vis, f"{CLASS_NAMES[d['cls']]}{d['conf']:.2f}", (x1, max(24, y1 - 8)),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 2)
    cv2.putText(vis, f"{title}  n={len(dets)}", (20, 48), cv2.FONT_HERSHEY_SIMPLEX, 2.0, (255, 0, 0), 4)
    return vis


def main() -> int:
    ap = argparse.ArgumentParser(description="真实翻拍底片跨模型核验")
    ap.add_argument("--conf-sweep", type=float, nargs="+", default=[0.05, 0.25, 0.30, 0.50])
    ap.add_argument("--imgsz", type=int, default=640)
    ap.add_argument("--out", default="runs/eval-cross/real_film.json")
    ap.add_argument("--vis", default="runs/eval-cross/real_film_grid.png")
    ap.add_argument("--thumbs", default="runs/eval-cross/real_film_thumbs.png")
    args = ap.parse_args()

    imgs = sorted(p for p in REAL_DIR.glob("*.png"))
    if not imgs:
        raise SystemExit(f"[FATAL] 未找到真实底片: {REAL_DIR}")
    print(f"[INFO] 真实底片 {len(imgs)} 张: {[p.name for p in imgs]}")

    prep = build_preprocessor()
    import onnxruntime as ort
    from ultralytics import YOLO

    pt_models = {}
    for tag in ("T0", "T1", "T2"):
        p = MODELS[tag]
        if p.exists():
            pt_models[tag] = YOLO(str(p))
        else:
            print(f"[SKIP] {tag} 缺失 {p}")
    onnx_sess = None
    if MODELS["PROD"].exists():
        onnx_sess = ort.InferenceSession(str(MODELS["PROD"]), providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
        print(f"[INFO] PROD onnx providers: {onnx_sess.get_providers()}")

    lo = min(args.conf_sweep)
    results: dict = {"images": [p.name for p in imgs], "conf_sweep": args.conf_sweep, "inputs": {}, "raw_dets": {}}

    for img_path in imgs:
        bgr = imread_unicode(img_path)
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        pipe_gray = to_pipe(gray, prep)
        pipe_bgr = cv2.cvtColor(pipe_gray, cv2.COLOR_GRAY2BGR)
        inputs = {"raw": bgr, "pipe": pipe_bgr}

        for mode, im in inputs.items():
            for tag, m in pt_models.items():
                d = detect_pt(m, im, lo, args.imgsz)
                results.setdefault("raw_dets", {}).setdefault(f"{img_path.stem}|{mode}|{tag}", d)
            if onnx_sess is not None:
                d = detect_onnx(onnx_sess, im, lo)
                results["raw_dets"][f"{img_path.stem}|{mode}|PROD"] = d

    # ---- 汇总：各 conf 阈值的检出数 ----
    summary: dict = {}
    for key, dets in results["raw_dets"].items():
        row = {}
        for c in args.conf_sweep:
            sel = [d for d in dets if d["conf"] >= c]
            row[f"n@{c}"] = len(sel)
            row[f"meanconf@{c}"] = round(float(np.mean([d["conf"] for d in sel])), 3) if sel else None
        summary[key] = row
    results["summary"] = summary

    # ---- 跨模型一致率：以 PROD(conf>=0.30) 为伪参考 ----
    agree: dict = {}
    for img_path in imgs:
        for mode in ("raw", "pipe"):
            ref = [d for d in results["raw_dets"].get(f"{img_path.stem}|{mode}|PROD", []) if d["conf"] >= 0.30]
            for tag in ("T0", "T1", "T2"):
                dets = [d for d in results["raw_dets"].get(f"{img_path.stem}|{mode}|{tag}", []) if d["conf"] >= 0.30]
                agree[f"{img_path.stem}|{mode}|{tag}"] = {
                    "n_det@0.30": len(dets), "n_ref@0.30": len(ref),
                    "matched": sum(1 for d in dets if any(d["cls"] == r["cls"] and
                                   iou(np.array(d["xyxy"]), np.array(r["xyxy"])) >= 0.3 for r in ref)),
                    "agree_rate": None if not dets else round(match_rate(dets, ref), 3),
                }
    results["cross_model_agreement"] = agree

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n[OK] {out}")

    # ---- 打印表 ----
    print("\n" + "=" * 100)
    print("真实翻拍底片 · 各模型检出数（conf 阈值扫描）")
    print("=" * 100)
    tags = list(pt_models) + (["PROD"] if onnx_sess is not None else [])
    hdr = "%-46s" % "图|输入|模型" + "".join("%10s" % f"@{c}" for c in args.conf_sweep)
    print(hdr)
    for key in sorted(summary):
        row = "%-46s" % key
        for c in args.conf_sweep:
            row += "%10s" % summary[key][f"n@{c}"]
        print(row)

    print("\n" + "=" * 100)
    print("跨模型一致率（以 PROD@conf0.30 为伪参考，IoU>=0.3 同类算命中）")
    print("=" * 100)
    for k, v in agree.items():
        print(f"{k:46s} det={v['n_det@0.30']:4d}  ref={v['n_ref@0.30']:4d}  "
              f"matched={v['matched']:4d}  agree={v['agree_rate']}")

    # ---- 拼图 ----
    try:
        tiles = []
        for img_path in imgs:
            bgr = imread_unicode(img_path)
            gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
            pipe_bgr = cv2.cvtColor(to_pipe(gray, prep), cv2.COLOR_GRAY2BGR)
            for mode, im in (("raw", bgr), ("pipe", pipe_bgr)):
                for tag in tags:
                    dets = results["raw_dets"].get(f"{img_path.stem}|{mode}|{tag}", [])
                    t = draw(im, dets, f"{img_path.stem[:8]} {mode} {tag}")
                    t = cv2.resize(t, (600, 720))
                    tiles.append(t)
        cols = len(tags) * 2
        rows = []
        for i in range(0, len(tiles), cols):
            rows.append(np.hstack(tiles[i:i + cols]))
        grid = np.vstack(rows) if rows else np.zeros((10, 10, 3), np.uint8)
        cv2.imwrite(str(args.vis), grid)
        print(f"[OK] {args.vis}")
    except Exception as e:  # 可视化失败不影响主结论
        print(f"[WARN] 拼图失败: {e}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
