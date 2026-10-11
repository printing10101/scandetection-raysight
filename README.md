# ScanDetection / RaySight

射线焊缝缺陷智能检测系统（NDT/RT，NB/T 47013.2-2015 口径）。

- **后端**：Python 3.12 + FastAPI，DDD 分层（`backend/app` 31 routers / `backend/domain` / `backend/infra`），104 个 API
- **前端**：Vue3 + Vite + Electron 壳（`src/`、`electron/`）
- **检测**：ONNX YOLO（权重随包分发于 `models/weights/`，不入 git）+ 可选本地 LLM 报告叙述（GGUF）
- **离线**：全链路无外网依赖（egress guard 强制）

## 快速开始（后端）

```bash
# 1) 建虚拟环境（Python 3.12+；依赖版本锁定自打包内嵌 site-packages）
python -m venv .venv-backend
.venv-backend/Scripts/python.exe -m pip install -i https://mirrors.aliyun.com/pypi/simple/ -r backend/requirements.txt

# 2) 起服务（等价于桌面壳内部拉起方式）
.venv-backend/Scripts/python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 18773

# 3) 自检
curl http://127.0.0.1:18773/api/v1/health
```

## 测试

```bash
.venv-backend/Scripts/python.exe -m pip install -r requirements-dev.txt
.venv-backend/Scripts/python.exe -m pytest
```

冒烟测试（`tests/test_smoke.py`）覆盖：health 探活 + 合成底片端到端检测。

## 目录速览

| 路径 | 内容 |
|---|---|
| `backend/app/routers` | API 路由层（31 个） |
| `backend/domain` | 领域逻辑：判定/评级/标准/预处理/主动学习 |
| `backend/infra` | 基础设施：DB/模型仓/LLM/备份/审计/egress guard |
| `configs/training` | 训练配方体系（T2 交付基准，见 docs/TRAINING_RECIPE.md） |
| `scripts/` | 数据转换/训练/跨域评估/底片入库工具 |
| `docs/` | MODEL_CARD / TRAINING_RECIPE / REAL_FILM_COLLECTION |

## 质量门禁

push 前自动执行三关（`.git/hooks/pre-push` → `scripts/quality_gate.sh`）：

1. **ruff**：lint 清零（规则集锁定于 `ruff.toml`）
2. **import-linter**：分层契约（`app → infra → domain` 单向；domain 零外部依赖）
3. **pytest**：冒烟测试

## 纪律

- `data/`（底片、数据库、令牌）、`runs/`、`models/` 均不入 git——见 `.gitignore`
- 训推一致性由配方 guard 强制（产品 preprocess 参数 vs 配方 expect 比对）
- 模型事实与能力边界见 `docs/MODEL_CARD.md`
