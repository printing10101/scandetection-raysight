<script setup>
// 本地大模型——从 bundle 的 __name:"LlmView" 区块还原（12861–13268 行）。
// 四段：引擎状态 / 本机推理服务 / 可选模型（含显存预估）/ 模型目录登记。
// 每 3s 轮询 /llm/status：扫描中或引擎启动中时只刷新状态自身，
// 扫描结束（state=done）再触发一次全量刷新；非系统管理员整页只读。
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import {
  getLlmStatus,
  getLlmModels,
  startLlmScan,
  cancelLlmScan,
  selectLlmModel,
  clearLlmSelection,
  addLlmDir,
  removeLlmDir,
} from '../api/endpoints.js';
import { errToMessage } from '../utils/helpers.js';

const auth = useAuthStore();
const isSysadmin = computed(() => auth.role === 'sysadmin');

// ---- 状态 ----
const status = ref(null); // /llm/status：{ engine, scan, selection, gpu, model_dirs }
const models = ref([]); // /llm/models 的 models
const services = ref([]); // /llm/models 的 services
const counts = ref({ total: 0, local: 0, service: 0, infeasible: 0 });
const loading = ref(false); // 首次全量加载
const acting = ref(false); // 任一写操作进行中（按钮统一禁用）
const error = ref(null);
const notice = ref(null);
const newDir = ref('');
const onlyRunnable = ref(false); // "只显示当前跑得动的" 过滤

let pollTimer = null;

// 引擎状态 / 显存结论 → 展示文案与 chip 配色（未知值兜底原样展示）
const engineStateText = {
  starting: '启动中',
  ready: '就绪',
  error: '故障',
  unavailable: '端点未运行',
  auth_required: '需要 API Key',
  disabled: '已关闭',
  stopped: '已停止',
};
const engineStateChip = {
  ready: 'ok',
  starting: 'warn',
  unavailable: 'warn',
  auth_required: 'warn',
  error: 'bad',
  disabled: 'muted',
  stopped: 'muted',
};
const vramVerdictText = {
  full_gpu: '可全量上卡',
  tight: '余量紧张',
  partial_offload: '需部分 offload',
  infeasible: '跑不动（走 CPU）',
  unknown: '未知',
};
const vramVerdictChip = {
  full_gpu: 'ok',
  tight: 'warn',
  partial_offload: 'warn',
  infeasible: 'bad',
  unknown: 'muted',
};

const scan = computed(() => status.value?.scan ?? null);
const scanning = computed(() => scan.value?.state === 'running');
const engine = computed(() => status.value?.engine ?? null);
const selection = computed(() => status.value?.selection ?? null);
const visibleModels = computed(() =>
  onlyRunnable.value
    ? models.value.filter((m) => m.available && m.vram?.verdict !== 'infeasible')
    : models.value,
);

function formatBytes(bytes) {
  return !bytes || bytes <= 0 ? '—' : `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function formatMaxCtx(model) {
  return model.max_ctx ? `${(model.max_ctx / 1024).toFixed(0)}K` : '—';
}

// ---- 数据加载 ----
async function loadAll() {
  loading.value = true;
  error.value = null;
  try {
    const [nextStatus, modelList] = await Promise.all([getLlmStatus(), getLlmModels(true)]);
    status.value = nextStatus;
    models.value = modelList.models;
    services.value = modelList.services;
    counts.value = {
      total: modelList.counts.total,
      local: modelList.counts.local,
      service: modelList.counts.service,
      infeasible: modelList.counts.infeasible,
    };
  } catch (err) {
    error.value = errToMessage(err);
  } finally {
    loading.value = false;
  }
}

// 写操作统一包装：执行 → 成功提示 → 全量刷新
async function runAction(action, successText) {
  acting.value = true;
  error.value = null;
  notice.value = null;
  try {
    await action();
    notice.value = successText;
    await loadAll();
  } catch (err) {
    error.value = errToMessage(err);
  } finally {
    acting.value = false;
  }
}

function selectModel(model) {
  runAction(() => selectLlmModel(model.id), `已选中「${model.display_name}」（引擎热应用，加载需数秒到数十秒）`);
}

function clearSelection() {
  runAction(clearLlmSelection, '已回落到配置文件默认');
}

function startScan() {
  runAction(startLlmScan, '已启动模型扫描（后台进行，可继续操作）');
}

function cancelScan() {
  runAction(cancelLlmScan, '已请求取消扫描（已扫到的结果保留）');
}

function addDir() {
  const dir = newDir.value.trim();
  dir &&
    runAction(async () => {
      await addLlmDir(dir);
      newDir.value = '';
    }, `已添加模型目录：${dir}`);
}

function removeDir(dir) {
  runAction(() => removeLlmDir(dir), `已移除目录登记（磁盘文件未动）：${dir}`);
}

onMounted(() => {
  loadAll();
  let inFlight = false;
  pollTimer = setInterval(async () => {
    if (acting.value || inFlight) return;
    inFlight = true;
    try {
      status.value = await getLlmStatus();
      // 扫描/启动中的进度由 status 自身刷新；扫描收尾后再做一次全量
      if (scanning.value || engine.value?.state === 'starting') return;
      if (scan.value?.state === 'done') loadAll();
    } catch {
      /* 单次轮询失败静默，下个周期重试 */
    } finally {
      inFlight = false;
    }
  }, 3000);
});

onUnmounted(() => {
  if (pollTimer !== null) clearInterval(pollTimer);
});
</script>

<template>
  <div>
    <h1 class="title-zine" data-t="本地大模型"> 本地大模型 </h1>
    <div class="lede"> 发现本机已有的 GGUF 模型与在跑的推理服务，选中后热应用为本次会话的本地模型（全程只读扫描，不复制、不上传） </div>

    <p v-if="error" class="err show"> ⚠ {{ error }} </p>
    <p v-else-if="notice" class="ok-msg"> ✓ {{ notice }} </p>

    <div class="section-h"><span class="no">1</span>引擎状态 </div>
    <div v-if="engine" class="cards">
      <div class="card">
        <div class="card-t"> 运行状态 </div>
        <div class="rowline">
          <span :class="['chip', engineStateChip[engine.state] ?? 'muted']">{{ engineStateText[engine.state] ?? engine.state }}</span>
          <span class="kv">方式：{{ engine.mode === 'managed' ? '本进程拉起' : '连接已有服务' }}</span>
        </div>
        <div class="kv">
          端点：{{ engine.endpoint || '—' }}
          <span v-if="engine.adopted">（复用外部实例，退出时不回收）</span>
        </div>
        <p v-if="engine.error" class="hint errline">{{ engine.error }}</p>
        <p v-if="engine.advice" class="hint">{{ engine.advice }}</p>
      </div>

      <div class="card">
        <div class="card-t"> 本机显存 </div>
        <template v-if="status?.gpu">
          <div class="kv">{{ status.gpu.name }}</div>
          <div class="kv"> 空闲 {{ formatBytes(status.gpu.free_bytes) }} / 共 {{ formatBytes(status.gpu.total_bytes) }} </div>
        </template>
        <div v-else class="kv"> 未检测到 GPU 信息 </div>
      </div>

      <div class="card">
        <div class="card-t"> 已选中 </div>
        <template v-if="selection?.active_id">
          <div class="kv">{{ selection.model_path || selection.endpoint || selection.active_id }}</div>
          <button class="btn" type="button" :disabled="acting || !isSysadmin" @click="clearSelection"> 回落到配置默认 </button>
        </template>
        <div v-else class="kv"> 未显式选中（按配置文件默认运行） </div>
      </div>
    </div>

    <div class="section-h"><span class="no">2</span>本机推理服务 </div>
    <div class="svc">
      <div v-for="service in services" :key="service.base_url" class="svc-row">
        <span :class="['chip', service.reachable && service.health_ok ? 'ok' : 'muted']">{{ service.reachable && service.health_ok ? '在线' : '未运行' }}</span>
        <code>{{ service.base_url }}</code>
        <span class="kv">{{ service.models.length }} 个模型</span>
        <span v-if="service.needs_auth" class="chip warn">需要 Key</span>
        <span v-if="service.error && !service.models.length" class="kv muted">{{ service.error }}</span>
      </div>
      <div v-if="!services.length" class="empty"> 未探测到可用的本机推理服务。 </div>
    </div>

    <div class="section-h">
      <span class="no">3</span> 可选模型（{{ counts.total }} 个：本地 {{ counts.local }} / 服务 {{ counts.service }}）
    </div>
    <div class="actions">
      <button class="btn" type="button" :disabled="acting || !isSysadmin || scanning" @click="startScan">
        {{ scanning ? '扫描中…' : '开始扫描本机模型' }}
      </button>
      <button v-if="scanning" class="btn" type="button" :disabled="acting" @click="cancelScan"> 取消扫描 </button>
      <label class="kv inline">
        <input v-model="onlyRunnable" type="checkbox" /> 只显示当前跑得动的
      </label>
      <span v-if="scanning && scan" class="kv">
        {{ scan.progress.current || '遍历中…' }}（已扫 {{ scan.progress.dirs }} 个目录 / 命中 {{ scan.found }}）
      </span>
    </div>

    <p v-if="counts.infeasible > 0" class="hint"> 其中 {{ counts.infeasible }} 个在所有本机显存条件下都无法全量上卡（会退回 CPU 推理）——仍会列出，不做隐藏。 </p>

    <div v-if="loading && !models.length" class="empty"> 正在读取模型清单… </div>
    <table v-else-if="visibleModels.length" class="mlist">
      <thead>
        <tr>
          <th>模型</th>
          <th>来源</th>
          <th>量化</th>
          <th title="权重文件声明的能力上限，不等于服务实际启动的 -c"> 上限 ctx </th>
          <th title="按当前空闲显存估算的运行占用"> 显存 </th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="model in visibleModels" :key="model.id" :class="{ active: model.active }">
          <td>
            <div class="mname">
              {{ model.display_name }}
              <span v-if="model.is_embedding" class="chip muted">向量</span>
              <span v-if="model.duplicate_count" class="chip muted">另有 {{ model.duplicate_count }} 份副本</span>
              <span v-if="!model.available" class="chip bad">不可用</span>
            </div>
            <div class="mpath">{{ model.source === 'local' ? model.path : model.endpoint }}</div>
            <div v-if="model.error" class="hint errline">{{ model.error }}</div>
          </td>
          <td>{{ model.source === 'local' ? '本地文件' : '已有服务' }}</td>
          <td>{{ model.quant || '—' }}</td>
          <td>{{ formatMaxCtx(model) }}</td>
          <td>
            <template v-if="model.vram">
              <span :class="['chip', vramVerdictChip[model.vram.verdict] ?? 'muted']">{{ vramVerdictText[model.vram.verdict] ?? model.vram.verdict }}</span>
              <div class="hint">{{ formatBytes(model.vram.needed_bytes) }} / 可用 {{ formatBytes(model.vram.free_vram_bytes) }}</div>
            </template>
            <span v-else class="kv">不占本机显存</span>
          </td>
          <td>
            <button
              class="btn"
              type="button"
              :disabled="acting || !isSysadmin || !model.available || model.active"
              @click="selectModel(model)"
            >{{ model.active ? '使用中' : '选中' }}</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="empty"> 未发现模型。可在下方添加模型目录，或先启动本机的推理服务。 </div>

    <div class="section-h"><span class="no">4</span>模型目录 </div>
    <div class="actions">
      <input v-model="newDir" placeholder="添加目录，如 E:\llama-cpp\models" @keyup.enter="addDir" />
      <button class="btn" type="button" :disabled="acting || !isSysadmin || !newDir.trim()" @click="addDir"> 添加目录 </button>
    </div>
    <div class="dirs">
      <div v-for="dir in status?.model_dirs ?? []" :key="dir" class="dir-row">
        <code>{{ dir }}</code>
        <button class="btn" type="button" :disabled="acting || !isSysadmin" @click="removeDir(dir)"> 移除登记 </button>
      </div>
      <div v-if="!status?.model_dirs?.length" class="kv"> 未添加额外目录（扫描范围默认覆盖本机全部固定盘）。 </div>
    </div>

    <p v-if="!isSysadmin" class="hint"> 当前身份只读：选中模型、增删目录与扫描需系统管理员权限。 </p>
  </div>
</template>
