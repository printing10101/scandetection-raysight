# 运维手册（RUNBOOK）

> 面向"半年后的自己"。按场景索引，每节给可复制的命令。

## 场景 1：在新机器上把开发环境跑起来

```bash
# 前置：Python 3.12+（3.13 已验证）、Node 22+、git
git clone https://github.com/printing10101/scandetection-raysight.git
cd scandetection-raysight

python -m venv .venv-backend
.venv-backend/Scripts/python.exe -m pip install -i https://mirrors.aliyun.com/pypi/simple/ -r backend/requirements.txt -r requirements-dev.txt

# 验证：三关门禁（ruff → 分层契约 → 测试）
sh scripts/quality_gate.sh
# 期望输出：[gate] ALL GREEN

# 起后端（模型权重需另行放置，见场景 2）
.venv-backend/Scripts/python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 18773
curl http://127.0.0.1:18773/api/v1/health
```

前端：`npm install && npm run dev`（开发）；桌面壳整包见场景 4。

## 场景 2：放置 / 更换检测模型

- 权重位置：`models/weights/best.onnx`（dev 布局）或 `backend/models/weights/`（打包布局），
  双锚点解析见 `backend/infra/paths.py:resolve_model_uri`。
- 伴生的温度校准表 `best.calibration.json` 存在即自动启用（否则日志提示"跳过校准"）。
- 更换后自检：

```bash
curl http://127.0.0.1:18773/api/v1/health
# 检查 detector=trained_yolo、active_version=best::<hash>
```

- 历史模型激活/回滚走模型注册表（`infra/model_registry.py`，`data/model_registry.json`
  记录 active_id）。

## 场景 3：数据在哪、怎么备份

| 内容 | 开发布局 | 打包布局 |
|---|---|---|
| 数据库/影像副本/密钥 | `<安装根>/data/` | `%APPDATA%/<identifier>/data/`（壳经 env 告知） |
| 日志 | `logs/` | `%LOCALAPPDATA%/ScanDetection/logs/` |

- 内置备份：`BackupScheduler` 每 24h 自动把关键状态打成带 manifest 的 zip
  （`infra/backup.py`；API：`POST /api/v1/system/backup`、`/restore`）。
- 手动备份：直接整目录拷贝 `data/`（停机状态下拷，WAL 才一致）。
- **纪律：`data/` 不入 git**（含底片、令牌、数据库——gitignore 已锁定）。

## 场景 4：打包桌面安装包

布局对齐打包产物：`backend/` + `app.asar`（前端）+ `python_embed/`（3.12 内嵌
运行时）+ `models/weights/`。壳入口 `resources/main.cjs`（拉起 uvicorn 并监督）。
打包后必须实机验证：安装 → 启动 → health OK → 卸载 → **用户数据目录留存**。

## 场景 5：改了判定规则 / 标准数值表

1. 数值表：`backend/domain/standards/tables/*.yaml`（authorized/authorized_copy
   语义见文件头注释与 ARCHITECTURE.md 决策 1）。
2. 改完必跑：`pytest tests/domain -v` —— 判定语义被 19 个用例锁定，
   级别断言写的是具体值（如 T=10 圆形 2 点 → II），不是"不报错"。
3. commit + push 会自动过三关门禁。

## 场景 6：故障排查速查

| 症状 | 先查 |
|---|---|
| 壳起来但页面空白 | 后端 18773 是否监听；`logs/backend.log` 尾部 |
| health 返回 degraded | `detector_degraded` 字段 + 日志中 detector 加载行 |
| 判定接口 422 | 属预期熔断（GradingAmbiguousError）：查表 authorized、T、spacing |
| 中文路径图片读出 None | 必须 `np.fromfile + cv2.imdecode`（裸 imread 静默失败） |
| LLM 叙述不可用 | 本地 llama-server 127.0.0.1:8080；`/api/v1/llm/status` |

## 场景 7：训练相关（不在本仓运行时路径）

配方体系、跨域评估、底片入库见 `docs/TRAINING_RECIPE.md`、
`docs/REAL_FILM_COLLECTION.md`、`scripts/train_recipe.py`。
**训推一致性 guard 不一致时训练直接 FATAL，属预期。**
