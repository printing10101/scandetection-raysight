# 模型卡 · 产品推理模型 `best.onnx`

> 归档日期：2026-10-11
> 证据来源：**onnx metadata 直读**（黑盒探测，见 `scripts/eval_real_film.py` 与 `runs/eval-cross/real_film.json`）
> 用途：防止后续文档再凭印象误述产品模型规格

---

## 1. 事实表（实测，非推断）

| 项 | 值 | 证据 |
|---|---|---|
| 文件 | `backend/models/weights/best.onnx` | `backend/configs/default.yaml` → `default_uri` |
| 大小 | 12.2 MB | `ls -lh` |
| **架构** | **Ultralytics YOLOv8n** | onnx metadata `description` 原文：<br>`Ultralytics YOLOv8n model trained on D:\扫描检测软件\data\training\data.yaml` |
| 训练框架版本 | ultralytics **8.4.142** | metadata `version` |
| 导出日期 | **2026-09-07T05:49:45+08:00** | metadata `date` |
| 许可 | **AGPL-3.0** | metadata `license` |
| task / head / stride | `detect` / `Detect` / 32 | metadata |
| 输入 | `[1, 3, 640, 640]` tensor(float)，RGB，0–1 归一化 | 图输入签名 |
| 输出 | `[1, 11, 8400]` = `4 + 7` 类 × 8400 锚点，`end2end=False`（需外部 NMS） | 图输出签名 |
| 类别数 | `nc = 7` | 输出维度 |
| 类别名 | `{0气孔, 1夹渣, 2未焊透, 3未熔合, 4裂纹, 5咬边, 6内凹}` | metadata `names` |
| **训练数据路径** | `D:\扫描检测软件\data\training\data.yaml` | metadata `description`（**该路径已随目录消失**） |
| 推理后端 | onnxruntime（默认 CPU） | `backend/configs/default.yaml` → `backend: onnx` |
| 统一置信阈值 | `infer_conf = 0.3` | `default.yaml` |
| 逐类阈值 | `{0:0.30, 1:0.12, 2:0.12, 3:0.08, 4:0.05, 5:0.18, 6:0.10}` | `default.yaml`（2/3/4 类低阈值优先召回） |
| NMS IoU | 0.5 | `default.yaml` → `infer_iou` |

> **AGPL-3.0 提示**：产品模型的原始导出受 AGPL-3.0 约束。对外交付/闭源分发前需法务确认，
> 或改用自训权重（本项目的 T0/T1/T2 系列为自训，无此约束）。

**复现命令**（任何人可在本项目下 1 分钟复现上表）：

```bash
python -c "import onnxruntime as ort; s=ort.InferenceSession('backend/models/weights/best.onnx',providers=['CPUExecutionProvider']); m=s.get_modelmeta().custom_metadata_map; print(m['description'],m['version'],m['names'])"
```

---

## 2. 类别口径（权威源）

**唯一权威**：`backend/domain/dto.py` → `class DefectClass(Enum)`

```
0 POROSITY                 气孔
1 SLAG                     夹渣/夹杂
2 INCOMPLETE_PENETRATION   未焊透
3 LACK_OF_FUSION           未熔合
4 CRACK                    裂纹
5 UNDERCUT                 咬边
6 CONCAVITY                内凹   ← DB50/T 1807 单面焊重点关注缺陷
```

**第 7 类的中文名是「内凹」，不是「内凸」。**

> **勘误记录（2026-10-11）**：早期由本项目的公开数据集转换脚本（`scripts/convert_steel_tube.py`）
> 及配套文档误写为「内凸」，已全项目更正 **27 处**（脚本 7 / 文档 20）。
> 计数依据：更正前 `backend/` + `src/` 中「内凸」出现 **0** 次、「内凹」出现 **23** 次 ——
> 即错的是脚本侧，产品侧一直是对的。
> ⚠️ 已训练权重的 `.pt` 内嵌 `names` 仍含旧字符串（只影响显示标签，**不影响类别索引**）；
> 用新配方重训会自动修正（见 `docs/TRAINING_RECIPE.md`）。

---

## 3. 已实测的响应特性（用于回归对照）

单图推理，conf 阈值扫描，真实翻拍底片（2048×2448，由 SDC2 解密还原）：

| 输入分布 | @0.05 | @0.25 | @0.30 | @0.50 |
|---|---|---|---|---|
| 真实底片 **原图** | 206 | 28 | 13 | 1 |
| 真实底片 **+ 预处理管线** | 245 | 58 | 7 | 1 |
| steel-tube **原图** | **0** | 0 | 0 | 0 |
| steel-tube **+ 预处理管线** | 1–11 | — | — | — |

**两条推论**：
1. 模型只在「**翻拍 + 预处理管线**」的分布上强响应 → **训练分布是"预处理后"的，产品本身训推一致**。
   故训练必须以「同一预处理管线」产出数据（本项目的 **T1/T2** 方案），原图训练（T0）不可交付。
2. 真实底片上 conf 0.05→0.30 检出由 245 骤降到 7 → **绝大部分是量化噪声**，误检抑制实际靠
   `infer_conf` 阈值 + `filter_stamp_zone`（印字区过滤），而非模型本身。

---

## 4. 已记录的脆弱性

| 现象 | 观测 | 风险 | 建议 |
|---|---|---|---|
| 非图片输入 | 误传入 `decrypt_report.json` → 输出 **300** 个检出、置信 **0.87–0.91** | 无结构强噪声会触发高置信误报 | 加输入分布校验（黑度直方图/方差门禁） |
| 印字/铅字区 | 真实底片密集检出堆在左上印字区 | 首要误检源 | 依赖 `filter_stamp_zone`，建议同时补数据 |

---

## 5. 缺口（本模型无法覆盖的部分）

1. **无 `.pt`，无法微调** → 只能整体重训。
2. **训练数据已遗失** → 原模型的训练分布无法复现，只能以公开数据从零训（见 `docs/TRAINING_RECIPE.md`）。
3. **无 Golden Set**（136 图 / 719 框已丢失）→ **无法回答"新模型相对本模型是否提升"**。
4. 长尾类 **未焊透 / 内凹** 在全部公开数据源中 **0 实例**（见 `runs/eval-cross/CROSS_DOMAIN_REPORT.md` §4.8）。
