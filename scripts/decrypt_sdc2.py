"""解密 ScanDetection SDC2 影像密文（SM4-CTR + HMAC-SM3 国密信封）。

用途：把 data/ 下加密存档的原始底片还原为明文图，供数据集盘点 / 域分析使用。
复用产品自身的 provider 实现（backend/infra/crypto.py），不重新实现密码学。

信封格式（见 backend/infra/crypto.py 模块 docstring）：
    SDC2 = magic(4B) || nonce(16B) || ciphertext || mac(HMAC-SM3, 32B)
历史 SDC1（AES-256-GCM）由同一 decrypt 按魔数自动分流。

用法::

    python scripts/decrypt_sdc2.py --key-file <data/.crypto_key> \
        --src <密文文件或目录> --dst <输出目录>
"""

from __future__ import annotations

import argparse
import base64
import json
import sys
from pathlib import Path

import numpy as np


def _load_provider(key_file: Path):
    """按密钥文件构造 provider（与产品 SoftSmProvider 同一实现）。"""
    root = Path(__file__).resolve().parent.parent
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
    from backend.infra.crypto import AesCrypto, CryptoKeyError

    key = base64.b64decode(key_file.read_text(encoding="utf-8").strip())
    if len(key) != 32:
        raise CryptoKeyError(f"主密钥应为 32 字节，实得 {len(key)}")
    return AesCrypto(key)


def _write_png(path: Path, arr: np.ndarray) -> None:
    import cv2

    ok, buf = cv2.imencode(".png", arr)
    if not ok:
        raise RuntimeError(f"PNG 编码失败: {path}")
    buf.tofile(str(path))


def main() -> int:
    ap = argparse.ArgumentParser(description="解密 SDC2 影像密文")
    ap.add_argument("--key-file", required=True, help="data/.crypto_key 路径")
    ap.add_argument("--src", required=True, help="密文文件或含密文的目录")
    ap.add_argument("--dst", required=True, help="明文输出目录")
    ap.add_argument("--stats", action="store_true", help="输出灰度统计并落 JSON")
    args = ap.parse_args()

    import cv2

    key_file = Path(args.key_file)
    src = Path(args.src)
    dst = Path(args.dst)
    dst.mkdir(parents=True, exist_ok=True)

    provider = _load_provider(key_file)
    files = sorted([src]) if src.is_file() else sorted(p for p in src.iterdir() if p.is_file())

    report = []
    for p in files:
        raw = p.read_bytes()
        try:
            plain = provider.decrypt(raw)
        except Exception as exc:  # noqa: BLE001 - 逐文件容错，坏一个不中断整批
            print(f"[FAIL] {p.name}: {type(exc).__name__}: {exc}")
            report.append({"file": p.name, "ok": False, "error": f"{type(exc).__name__}: {exc}"})
            continue

        arr = cv2.imdecode(np.frombuffer(plain, dtype=np.uint8), cv2.IMREAD_UNCHANGED)
        if arr is None:
            print(f"[FAIL] {p.name}: 解密成功但图像解码失败（明文 {len(plain)} 字节，"
                  f"magic={plain[:4]!r}）")
            report.append({"file": p.name, "ok": False, "error": "decode-failed",
                           "plain_bytes": len(plain), "plain_magic": plain[:4].hex()})
            continue

        g = arr if arr.ndim == 2 else cv2.cvtColor(arr, cv2.COLOR_BGR2GRAY)
        out = dst / (p.stem + ".png")
        _write_png(out, g)

        item = {
            "file": p.name,
            "ok": True,
            "out": str(out),
            "cipher_bytes": len(raw),
            "plain_bytes": len(plain),
            "shape": list(g.shape),
            "dtype": str(g.dtype),
            "min": int(g.min()),
            "max": int(g.max()),
            "mean": round(float(g.mean()), 3),
            "std": round(float(g.std()), 3),
            "p1": int(np.percentile(g, 1)),
            "p50": int(np.percentile(g, 50)),
            "p99": int(np.percentile(g, 99)),
        }
        print(f"[OK]   {p.name} -> {out.name}  shape={g.shape} "
              f"min/max={g.min()}/{g.max()} mean={g.mean():.1f} std={g.std():.1f} "
              f"p1/p50/p99={item['p1']}/{item['p50']}/{item['p99']}")
        report.append(item)

    if args.stats:
        rp = dst / "decrypt_report.json"
        rp.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\n报告: {rp}")
    print(f"\n完成: {sum(1 for r in report if r['ok'])}/{len(report)} 解密成功")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
