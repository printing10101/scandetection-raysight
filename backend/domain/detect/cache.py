# -*- coding: utf-8 -*-
"""CachedDetector：推理结果 LRU 缓存（重复底片跳过模型前向，性能优化）。

场景：同一底片文件被重复评片/预检（撤销重评、批量去重、前端预览+正式评片
双请求）。模型前向是大底片的主要耗时（实测 8K 底片 48 瓦片 DML 1.5-2.6s），
内容相同 + 参数相同的结果直接复用。

失效语义（正确性优先）：
- 键 = 图像内容 sha256（含 dtype/shape）+ 模型标识 + 瓦片参数 + 温度校准表
  + conf/iou/class_conf + roi。任一变化 → 键不同 → 自然 miss。
- inner.load()（热切换/回退）→ 缓存整体清空：旧模型的缓存绝不喂给新模型。
- 命中返回深拷贝：调用方对检出的就地修改（重编号/标记）不会污染缓存。

并发：多线程共享（批量 worker ×2 与单张请求共用 Registry 检测器），锁保护
OrderedDict；键计算（sha256）在锁外，仅缓存表操作持锁。

缓存放置在 ResilientDetector **内侧**：Resilient 的异常计数/回退语义对缓存
透明（缓存命中不经过模型，不产生推理异常；load 透传清缓存）。
"""

from __future__ import annotations

import copy
import hashlib
import logging
import threading
from collections import OrderedDict
from typing import Any

import numpy as np

from backend.domain.dto import Detection

_LOG = logging.getLogger("scandetection.detector.cache")


class CachedDetector:
    """DefectDetector 装饰器：按内容哈希缓存 infer 结果（LRU）。"""

    def __init__(self, inner: Any, maxsize: int = 32) -> None:
        self._inner = inner
        self._maxsize = max(1, int(maxsize))
        self._cache: OrderedDict[tuple, list[Detection]] = OrderedDict()
        self._lock = threading.Lock()
        self.hits = 0
        self.misses = 0

    def load(self, model_uri: str, backend: str = "onnx") -> None:
        """透传加载；模型变化 → 缓存全清（旧模型结果绝不复用）。"""
        with self._lock:
            self._cache.clear()
        self._inner.load(model_uri, backend)

    def infer(
        self,
        image: np.ndarray,
        conf: float,
        iou: float,
        class_conf: dict[int, float] | None = None,
        *,
        roi: list[tuple[float, float, float, float]] | None = None,
    ) -> list[Detection]:
        key = self._make_key(image, conf, iou, class_conf, roi)
        if key is not None:
            with self._lock:
                if key in self._cache:
                    self._cache.move_to_end(key)
                    self.hits += 1
                    return copy.deepcopy(self._cache[key])
        dets = self._inner.infer(image, conf, iou, class_conf, roi=roi)
        if key is not None:
            with self._lock:
                self._cache[key] = copy.deepcopy(dets)
                self.misses += 1
                while len(self._cache) > self._maxsize:
                    self._cache.popitem(last=False)
        return dets

    def _make_key(
        self,
        image: np.ndarray,
        conf: float,
        iou: float,
        class_conf: dict[int, float] | None,
        roi: list[tuple[float, float, float, float]] | None,
    ) -> tuple | None:
        """缓存键；图像退化/不可哈希时返回 None（该次不缓存，只透传）。"""
        if image is None or image.size == 0:
            return None
        try:
            arr = np.ascontiguousarray(image)
            digest = hashlib.sha256(arr.tobytes()).hexdigest()
        except Exception:  # pragma: no cover - 防御：任何哈希异常都不阻断推理
            return None
        inner = self._inner
        model_id = getattr(inner, "model_uri", None) or type(inner).__name__
        tile_params = tuple(
            getattr(inner, a, None)
            for a in ("tile_size", "tile_overlap", "tile_trigger_side", "tile_max_count", "tile_merge_iou")
        )
        temp = getattr(inner, "class_temperature", None)
        temp_key = tuple(sorted(temp.items())) if temp else ()
        cc_key = tuple(sorted(class_conf.items())) if class_conf else ()
        roi_key = tuple(tuple(float(v) for v in r) for r in (roi or []))
        return (
            model_id,
            tile_params,
            temp_key,
            round(float(conf), 6),
            round(float(iou), 6),
            cc_key,
            roi_key,
            str(arr.dtype),
            arr.shape,
            digest,
        )

    def stats(self) -> dict[str, int]:
        with self._lock:
            return {
                "hits": self.hits,
                "misses": self.misses,
                "entries": len(self._cache),
            }
