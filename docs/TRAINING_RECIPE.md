# 训练配方（Training Recipe）

> 建立日期：2026-10-11
> 一句话：**把"怎么训出能交付的模型"从一次性手工命令变成可复现的配置文件。**

---

## 1. 为什么需要配方

在本配方建立之前，T1/T2 两个数据集是手工敲 `domain_align.py` 建出来的，
**构建命令没有留下任何记录**。后果很实在：

- 换台机器 / 换个人，**重建不出同样的训练集**；
- 产品侧改了预处理参数（`backend/configs/default.yaml` 的 `preprocess` 段），
  训练集不会跟着改 —— 于是悄悄回到"训推不一致"，而这是本项目第一大坑
  （实测：真实输入域 mAP50 掉 **−24.99 pt**，recall 0.9405→0.5946）。

配方把这两件事都解决：参数在 YAML、护栏在训练前、指纹在产物里。

---

## 2. 一条命令

```bash
# 完整链路：护栏 → 建集 → 指纹 → 训练 → 跨域评估 → 锁文件
python scripts/train_recipe.py --recipe configs/training/t2_recipe.yaml

# 只建集（不占 GPU）
python scripts/train_recipe.py --recipe configs/training/t2_recipe.yaml --stages guard,build,fp

# 只评估 + 出锁文件（复用已训好的权重）
python scripts/train_recipe.py --recipe configs/training/t2_recipe.yaml --stages eval,lock
```

阶段可任意组合，中间结果落 `runs/recipe/<name>/stages.json`，断点可续跑。

---

## 3. 配方为什么是"这个配方"

| 步骤 | 做法 | 证据 |
|---|---|---|
| **训推一致化** | 训练图过**产品同款**预处理（`import` 产品的 `OpencvPreprocessor`，不重写算法） | T0（原图训练）→ E1 掉 24.99 pt；T1（一致化）→ E1 **+25.88 pt** |
| **翻拍增强** | 在一致化之后再叠加翻拍模拟（方向光照梯度/对比压缩/失焦/噪声，strength 0.5±0.25） | T2 vs T1：E1 持平（−0.08 pt）、E2 **+2.82 pt**、E2b **+11.21 pt**、E0 **+10.60 pt** |
| **val 不抖动** | train 带强度抖动，val 用固定强度 | 自评必须确定性，否则指标不可比 |

完整矩阵与结论见 `runs/eval-cross/CROSS_DOMAIN_REPORT.md`。

---

## 4. 护栏（`guard` 阶段）

**这是配方最重要的部分。** 逻辑：

```
读 backend/configs/default.yaml 的 preprocess 段
  └─ 与 configs/training/*.yaml 的 build.align.expect 逐项比对
       ├─ 全部一致 → 放行
       └─ 任一不一致 → FATAL，拒绝训练
```

输出示例（负向测试）：

```
[FATAL] 训推一致化护栏未通过 —— 产品预处理已变，训练集必须同步重建：
        - clahe_clip: 产品=2.0 期望=3.0
        修法：改 configs/training/*.yaml 的 build.align.expect 与之一致后重跑 build。
```

**为什么值钱**：产品改了 CLAHE 的 `clipLimit`，训练集若不重建，模型会在推理时
遇到没见过的分布 —— 正是 T0 掉 25 点的那个 bug。护栏把它挡在训练之前，
而不是等交付后发现。

> 已验证双向：正向通过（7 项一致）；负向注入 `clahe_clip: 3.0` 时如实 FATAL。

---

## 5. 可复现性（`fp` + `lock` 阶段）

### 数据集指纹

对产出目录逐文件 sha256，汇总成一个 `fingerprint`，写入
`<dataset>/dataset_fingerprint.json` 与 `runs/recipe/<name>/stages.json`。

```json
{"n_files": 2501, "total_bytes": 176500000, "fingerprint": "3f31073a67bc97ab…"}
```

**用法**：重跑 `build,fp` 后指纹不变 ⇒ 数据集可复现；变了 ⇒ 有人在没改配置的情况下动了数据。

### 锁文件

`runs/recipe/<name>/recipe.lock.json` 汇总：

- 配方文件 sha256（知道"这次是用哪一版配方跑的"）
- 有效参数（seed / epochs / imgsz / batch）
- 数据集与代理域指纹
- 各评估域指标
- **与 `expected` 段的偏差校验**（默认容差 ±0.005）

```bash
# 首次全量跑（2026-10-11）后，把本次指标定为配方基准写入 expected 段；
# 再跑 `--stages eval,lock`（读 stages.json 断点，不重训），复验应全 OK：
[OK  ] E1  mAP50   got=0.9743  want=0.9743  Δ=+0.0000
[OK  ] E2b mAP50   got=0.9278  want=0.9278  Δ=+0.0000
```

> **教训（真实踩坑）**：第一版 `expected` 抄的是旧"临时构建"的指标（0.9705 / 0.8968），
> lock 直接 FAIL——但那不是复现失败，而是**参照值来源不对**。规则：
> **`expected` 只能取自配方自身产物的首次全量跑，且 `build` 是确定性的**（固定 seed、
> 固定文件顺序），换 seed / 改强度后必须重定基准并人工过目。

偏差超容差时的排查顺序（脚本会提示）：

1. 先比 `dataset_fingerprint.json` —— 一致则说明是训练侧非确定性（依赖版本/硬件）；
2. 不一致则说明数据侧变了，回查配方与源数据集。

---

## 6. 现有配方

| 配方 | 用途 | 状态 |
|---|---|---|
| `configs/training/t2_recipe.yaml` | **交付默认**：训推一致化 + 翻拍增强 | 已验证（E1 0.9743 / E2b 0.9278） |
| `configs/training/t1_recipe.yaml` | 消融：只做训推一致化（无翻拍增强） | 已提供，见文件内注释 |
| `configs/training/t3_synth_recipe.yaml` | T2 + 合成未焊透/内凹（build.mode=verify，像素由 `synth_root_defects.py` 产出） | 验证中 |

---

## 7. 已知限制

1. **源数据集不是配方的产物**：`data/datasets/converted/steel-tube-7cls`（7 类重映射版）
   由 `scripts/convert_steel_tube.py` 生成，配方只读不改。它的可复现性由该脚本保证。
2. **`expected` 段需要人工维护**：配方不会自动更新期望值，指标变化后需人工确认并改 YAML。
   这是**故意的** —— 指标悄悄漂移时必须有人过目，不能让脚本自己改基准。
3. **训练非确定性**：即便 `deterministic=True` + 固定 seed，cuDNN/驱动差异仍可能带来
   小数点后第 3–4 位的波动，故容差设 ±0.005。
4. 配方只覆盖"从公开数据训练"。**它补不上真实域覆盖与长尾类** —— 那是采数据的事，
   见 `runs/eval-cross/CROSS_DOMAIN_REPORT.md` §4.8 与 §六。
