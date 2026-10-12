# 架构文档（ARCHITECTURE）

> 面向维护者。改架构前先读这里的"关键决策"——多数约束来自踩坑，不是偏好。

## 总体形态

桌面单机离线应用，三段式：

```
┌─────────────────────────────────────────────┐
│ Electron 壳（electron/main.cjs）             │
│  · 单实例锁 → 单写锁 → 后台拉起后端           │
│  · 监督循环探测 /api/v1/health，崩溃秒级重生   │
│  · 经 SCANDETECTION_USER_DATA_DIR 告知数据目录│
├─────────────────────────────────────────────┤
│ 前端 Vue3 + Vite（src/，打包进 app.asar）     │
│  · 只与 http://127.0.0.1:18773/api/v1 通信    │
├─────────────────────────────────────────────┤
│ 后端 Python/FastAPI（backend/，DDD 四层）     │
│  uvicorn @ 127.0.0.1:18773，无外网依赖        │
└─────────────────────────────────────────────┘
```

## 后端分层与依赖规则（import-linter 强制）

```
backend.app  ──▶  backend.infra  ──▶  backend.domain
（31 routers）      （实现层）           （纯领域层）
```

- **domain 零外部依赖**：不 import app / infra / evaluation。标准数值经
  `TableSource` 端口注入（生产=infra.FileTableSource，测试=域内 bootstrap 源）。
- **infra 实现 domain 的接口**（`domain/interfaces.py`）：repository、sync_io、
  pool_store 等均为此关系——infra→domain 是正当方向，勿"纠正"。
- 两契约见 `.importlinter`，push 时强制（`scripts/quality_gate.sh`）。

### 各层职责

| 层 | 内容 | 规则 |
|---|---|---|
| `app/routers` | 31 个 API 路由（detect/report/batch/review/llm/audit/...） | 只做协议转换，业务在 domain |
| `app` 根 | auth/pipelines/batch_queue/dependencies（装配根） | 依赖注入在此，不在别处 |
| `domain` | 判定（grade/ 5 标准）、检测（detect/）、预处理（preprocess/）、量化/评级/主动学习 | 纯逻辑；数值表经端口加载 |
| `infra` | DB(alembic)/模型仓/LLM(gguf)/备份/审计/egress guard/加密 | 唯一接触 IO 的层 |
| `evaluation/` | 离线评估 harness（规格 §15.4 ECE 门禁等） | 不在运行时关键路径 |

## 关键决策（ADR 摘要）

1. **判定熔断优先于可用性**：标准表 `authorized=false`、缺 T、缺像素标定
   → 抛 `GradingAmbiguousError`（422 需人工复核），**绝不降级输出猜测级别**。
2. **零容忍类硬编码在领域层**：裂纹/未熔合/未焊透 → IV；深孔直判 IV；
   内凹深度未测 → 保守 III + 强制复核。改动必须过 `tests/domain/test_nb47013.py`。
3. **数据与程序分离**：`data/` 前缀路径经 `SCANDETECTION_USER_DATA_DIR`
   重锚到用户数据目录——NSIS 卸载清安装目录时检查记录/密钥不丢。
4. **训推一致性**：产品 preprocess 参数（`backend/configs/default.yaml`）与
   训练配方 expect 双向 guard 比对，不一致拒绝训练。
5. **离线强制**：egress guard patch `socket.connect`，allow_cidrs 为空即全禁；
   LLM 走本地 llama-server（gguf 随包分发）。
6. **一次性 IPC 令牌**：`data/ipc_token` 运行时签发（已从 git 移除），
   前端经 `?access_token=` 携带；访问日志因此关闭。

## 质量门禁

push 前三关（pre-push 钩子）：ruff（`ruff.toml`）→ import-linter（`.importlinter`）→
pytest（`tests/`）。规则集与豁免的变更须在 commit message 说明理由。

## 已知边界

- 检测模型为公开数据训练（best.onnx，YOLOv8n ONNX）：未焊透/内凹零实例、
  真实翻拍域覆盖未验证——能力边界详见 `docs/MODEL_CARD.md`。
- 标准数值表为公开解读转录（`authorized: true` 表数值可运行，
  `authorized_copy=false` 表示未持有授权正本，报告带强免责声明）。
