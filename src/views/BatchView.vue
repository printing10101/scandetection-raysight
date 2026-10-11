<script setup>
// 批量评定视图——从 bundle 的 __name:"BatchView" 区块还原（8302–8854 行）。
// 流程：上传（多文件/整卷文件夹，XHR 进度）→ 重复性核查决策（跳过/强制评定）
// → 异步执行（指数退避轮询，最多连败 3 次暂停轮询）→ 结果页（进度面板/打开报告/归档）。
// 印字识别结果与缺陷标注框写入 viewerFilms store，供「底片观察」复用；
// archive 事件上抛给 AppShell（RouterView 上绑定）跳转检测档案。
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import {
  uploadBatch,
  getBatch,
  listBatches,
  cancelBatch,
  pauseBatch,
  resumeBatch,
  retryBatch,
  resolveDedup,
  getReportDetections,
} from '../api/endpoints.js';
import { ApiRequestError } from '../api/http.js';
import { useViewerFilmsStore } from '../stores/viewerFilms.js';
import { useWorkspaceStore } from '../stores/workspace.js';
import { activeEvaluation } from '../stores/activity.js';
import { usePdfGate } from '../composables/usePdfGate.js';
import { errToMessage } from '../utils/helpers.js';
import { ALLOWED_IMAGE_EXTENSIONS, IMAGE_ACCEPT } from '../utils/mediaFormats.js';
import BatchProgress from '../components/BatchProgress.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import PdfGateModal from '../components/PdfGateModal.vue';

const emit = defineEmits(['archive']);

// 单批上限 100 幅；单文件 50MB；轮询起点 2s、指数退避封顶 8s、连败 3 次停轮询
const MAX_BATCH_IMAGES = 100;
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const POLL_BASE_INTERVAL_MS = 2000;
const MAX_POLL_FAILURES = 3;

const filmStore = useViewerFilmsStore();
const workspace = useWorkspaceStore();
const pdfGate = usePdfGate();

// ---- 页面阶段与批次状态 ------------------------------------------------------
const phase = ref('upload'); // upload | dedup | running | result
const batchStatus = ref(null);
const files = ref([]);
const batchId = ref(null);
const notice = ref(null); // 上传/操作类提示（可"知道了"关闭）
const uploading = ref(false);
const uploadProgress = ref(-1);
const statusError = ref(null); // 批次状态获取失败（可"重试"）
const historyBatches = ref([]);
const historyError = ref(null);

function openReport(reportId) {
  pdfGate.openPdf(reportId);
}

// ---- 重复性核查（去重决策）----------------------------------------------------
const duplicates = ref([]);
const decisions = ref({}); // task_id -> "skip" | "keep"
const resolving = ref(false);
const skipCount = computed(() => duplicates.value.filter((d) => (decisions.value[d.task_id] ?? 'skip') === 'skip').length);
const keepCount = computed(() => duplicates.value.length - skipCount.value);

function showDedup(list) {
  duplicates.value = list;
  const initial = {};
  for (const dup of list) initial[dup.task_id] = 'skip';
  decisions.value = initial;
  phase.value = 'dedup';
}

function setDecision(taskId, action) {
  decisions.value = { ...decisions.value, [taskId]: action };
}

function setAllDecisions(action) {
  const all = {};
  for (const dup of duplicates.value) all[dup.task_id] = action;
  decisions.value = all;
}

// ---- 公共工艺参数 -------------------------------------------------------------
const spacing = ref('0.1000');
const thickness = ref('');
const workpieceNo = ref('');
const weldNo = ref('');
const forceOutput = ref(true);

// ---- 轮询（指数退避）----------------------------------------------------------
let pollTimer = null;
let pollTargetId = null; // 当前轮询的批次 id（epoch 之外的二次防护）
let statusEpoch = 0; // 每次切批/回上传页自增，作废在途请求
const pollFailures = ref(0);
const pollingHalted = ref(false);
const pollError = ref(null);

function pollIntervalMs() {
  return Math.min(POLL_BASE_INTERVAL_MS * 2 ** pollFailures.value, 8000);
}

function stopPollTimer() {
  if (pollTimer !== null) {
    window.clearTimeout(pollTimer);
    pollTimer = null;
  }
}

function schedulePoll(id) {
  stopPollTimer();
  pollTimer = window.setTimeout(() => void pollOnce(id), pollIntervalMs());
}

function startPolling(id) {
  stopPolling();
  pollingHalted.value = false;
  pollFailures.value = 0;
  pollError.value = null;
  statusEpoch++;
  pollTargetId = id;
  activeEvaluation.value = 'batch'; // 根组件退出守护据此拦截关窗
  pollOnce(id);
}

function stopPolling() {
  pollTargetId = null;
  stopPollTimer();
  if (activeEvaluation.value === 'batch') activeEvaluation.value = null;
}

// ---- 历史批次 -----------------------------------------------------------------
async function refreshHistory() {
  try {
    historyBatches.value = await listBatches();
    historyError.value = null;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) return;
    historyError.value = `历史批次刷新失败：${errToMessage(err)}`;
  }
}

// 从历史/自动恢复入口打开一个批次：完结直接取状态，否则进入轮询。
function openBatch(batch) {
  stopPolling();
  batchId.value = batch.batch_id;
  if (batch.status === 'finished') loadFinishedBatch(batch.batch_id);
  else {
    phase.value = 'running';
    startPolling(batch.batch_id);
  }
}

// 完结批次一次性取状态（带 epoch 防串批）。
async function loadFinishedBatch(id) {
  const epoch = ++statusEpoch;
  try {
    const status = await getBatch(id);
    if (epoch !== statusEpoch) return;
    batchStatus.value = status;
    phase.value = 'result';
    statusError.value = null;
    collectAnnotations(status);
  } catch (err) {
    if (epoch !== statusEpoch || (err instanceof ApiRequestError && err.status === 401)) return;
    statusError.value = `批次状态获取失败：${errToMessage(err)}`;
  }
}

// ---- 文件导入 -----------------------------------------------------------------
function onFileInputChange(e) {
  acceptFiles(e.target.files);
  e.target.value = '';
}

function acceptFiles(fileList) {
  if (!fileList || fileList.length === 0) return;
  const accepted = [];
  const oversized = [];
  for (const file of Array.from(fileList)) {
    const ext = (file.name.split('.').pop() ?? '').toLowerCase() ?? '';
    if (ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      if (file.size > MAX_FILE_BYTES) {
        oversized.push(`${file.name}（${(file.size / 1024 / 1024).toFixed(1)}MB）`);
        continue;
      }
      accepted.push(file);
    }
  }
  if (oversized.length > 0) {
    notice.value =
      `以下 ${oversized.length} 个文件超过单文件 50MB 上限，已未导入：${oversized.slice(0, 5).join('、')}` +
      (oversized.length > 5 ? ' 等。' : '。请压缩或降分辨率后重新导入。');
  }
  if (accepted.length === 0) {
    if (oversized.length === 0) {
      notice.value = '所选文件/文件夹中未包含受支持的影像格式（DICOM .dcm / JPG / PNG / BMP / GIF / WebP / TIFF / HEIC 等）。';
    }
    return;
  }
  if (accepted.length > MAX_BATCH_IMAGES) {
    notice.value = `单批上限 ${MAX_BATCH_IMAGES} 幅，当前已选 ${accepted.length} 幅，请分批提交。`;
    return;
  }
  files.value = accepted;
  if (oversized.length === 0) notice.value = null;
  filmStore.add(accepted);
}

function selectionSummary() {
  const count = files.value.length;
  if (count === 0) return '';
  const totalMb = files.value.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024;
  return `${count} 幅 · ${totalMb.toFixed(1)} MB`;
}

// 隐藏 input 不在拖拽区内，用 id 直接点（与原实现一致）。
function pickFiles() {
  document.getElementById('pick-files')?.click();
}

function pickDir() {
  document.getElementById('pick-dir')?.click();
}

// 菜单栏"批量导入"（Ctrl+Shift+O）：workspace 发请求，这里弹出选择框。
watch(
  () => workspace.pendingFileOpen,
  (target) => {
    if (target === 'batch') {
      workspace.pendingFileOpen = null;
      nextTick(pickFiles);
    }
  },
  { immediate: true },
);

const dragOver = ref(false);

function onDrop(e) {
  dragOver.value = false;
  const dropped = e.dataTransfer?.files;
  if (dropped && dropped.length > 0) acceptFiles(dropped);
}

// ---- 提交与去重决策 -----------------------------------------------------------
function submitBatch() {
  notice.value = null;
  if (files.value.length === 0) {
    notice.value = '请先导入底片文件或文件夹。';
    return;
  }
  if (!thickness.value.trim()) {
    notice.value = '母材公称厚度 T 为必填项（分级评定依据）。';
    return;
  }
  const formData = new FormData();
  for (const file of files.value) formData.append('images', file);
  formData.append('pixel_spacing_mm', spacing.value || '');
  formData.append('base_metal_thickness_mm', thickness.value.trim());
  if (workpieceNo.value.trim()) formData.append('workpiece_no', workpieceNo.value.trim());
  if (weldNo.value.trim()) formData.append('weld_no', weldNo.value.trim());
  formData.append('force', forceOutput.value ? 'true' : 'false');
  doUpload(formData);
}

async function doUpload(formData) {
  if (uploading.value) return;
  uploading.value = true;
  uploadProgress.value = 0;
  try {
    const resp = await uploadBatch(formData, (pct) => {
      uploadProgress.value = pct;
    });
    batchId.value = resp.batch_id;
    if (resp.status === 'awaiting_review') {
      batchStatus.value = null;
      showDedup(resp.duplicates ?? []);
      refreshHistory();
    } else {
      phase.value = 'running';
      startPolling(resp.batch_id);
    }
  } catch (err) {
    if (err instanceof ApiRequestError && err.code === 'ABORTED') return;
    notice.value = errToMessage(err);
  } finally {
    uploading.value = false;
    uploadProgress.value = -1;
  }
}

async function confirmDedup() {
  if (!batchId.value || resolving.value) return;
  resolving.value = true;
  try {
    await resolveDedup(
      batchId.value,
      duplicates.value.map((dup) => ({
        task_id: dup.task_id,
        action: decisions.value[dup.task_id] ?? 'skip',
      })),
    );
    duplicates.value = [];
    decisions.value = {};
    batchStatus.value = null;
    phase.value = 'running';
    startPolling(batchId.value);
  } catch (err) {
    notice.value = errToMessage(err);
  } finally {
    resolving.value = false;
  }
}

// ---- 轮询一次 -----------------------------------------------------------------
function pollIntervalError(err) {
  // 401/403 停轮询静默（登录态问题由全局处理）；其余计数退避，连败 3 次暂停
  if (err instanceof ApiRequestError && (err.status === 401 || err.status === 403)) {
    stopPolling();
    return;
  }
  pollFailures.value += 1;
  pollError.value = errToMessage(err);
  if (pollFailures.value >= MAX_POLL_FAILURES) {
    pollingHalted.value = true;
    stopPolling();
  }
}

async function pollOnce(id) {
  try {
    const status = await getBatch(id);
    if (pollTargetId !== id) return;
    batchStatus.value = status;
    pollFailures.value = 0;
    pollingHalted.value = false;
    pollError.value = null;
    collectAnnotations(status);
    applyStamps(status);
    if (status.status === 'awaiting_review') {
      stopPolling();
      showDedup(status.duplicates ?? duplicatesFromTasks(status));
      return;
    }
    if (status.status === 'finished') {
      stopPolling();
      phase.value = 'result';
      refreshHistory();
      return;
    }
  } catch (err) {
    if (pollTargetId !== id) return;
    pollIntervalError(err);
  }
  if (pollTargetId === id) schedulePoll(id);
}

function retryPolling() {
  pollError.value = null;
  if (batchId.value) startPolling(batchId.value);
}

// 轮询响应缺 duplicates 字段时，从任务列表现场推导（与后端结构的兜底契约）。
function duplicatesFromTasks(status) {
  return (status.tasks ?? [])
    .filter((task) => task.dup_kind)
    .map((task) => ({
      task_id: task.task_id,
      image_name: task.image_name,
      content_sha256: task.content_sha256 ?? null,
      kind: task.dup_kind ?? 'batch',
      duplicate_of: task.dup_ref ?? null,
      history: null,
    }));
}

// ---- 结果回灌（标注框/印字 → viewerFilms）--------------------------------------
const annotatedReportIds = new Set(); // 会话内只拉一次的报告

function collectAnnotations(status) {
  for (const task of status.tasks ?? []) {
    if (task.status !== 'done' || !task.report_id || annotatedReportIds.has(task.report_id)) continue;
    annotatedReportIds.add(task.report_id);
    // 无缺陷且无需复核的底片不拉标注，省一次请求
    if (task.defect_count != null && task.defect_count <= 0 && !task.need_review) continue;
    fetchTaskAnnotations(task.report_id, task.image_name);
  }
}

function applyStamps(status) {
  for (const task of status.tasks ?? []) {
    if (task.status !== 'done' || !task.stamp_status) continue;
    const film = filmStore.films.find((f) => f.name === task.image_name);
    if (!film || filmStore.stampOf(film.id)) continue;
    filmStore.setStamp(film.id, {
      status: task.stamp_status,
      text: task.stamp_text ?? null,
      orientation: task.stamp_orientation ?? null,
      needReview: task.stamp_need_review === true,
    });
  }
}

async function fetchTaskAnnotations(reportId, imageName) {
  try {
    const detections = await getReportDetections(reportId);
    if (detections.defects.length === 0) return;
    const film = filmStore.films.find((f) => f.name === imageName);
    if (!film) return;
    filmStore.setAnnotations(film.id, {
      imageW: detections.image_w,
      imageH: detections.image_h,
      reportId,
      boxes: detections.defects.map((defect) => ({
        id: defect.id,
        classId: defect.class_id,
        bbox: defect.bbox,
        confidence: defect.confidence,
        needReview: defect.need_review,
      })),
    });
  } catch {
    /* 标注拉取失败不影响评定结果展示 */
  }
}

// ---- 暂停 / 恢复 / 取消 / 重试 --------------------------------------------------
const cancelConfirmOpen = ref(false);

function requestCancel() {
  if (batchId.value) cancelConfirmOpen.value = true;
}

async function pauseCurrentBatch() {
  if (!batchId.value) return;
  try {
    await pauseBatch(batchId.value);
    notice.value = null;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) return;
    notice.value = `暂停失败：${errToMessage(err)}`;
  }
}

async function resumeCurrentBatch() {
  if (!batchId.value) return;
  try {
    await resumeBatch(batchId.value);
    notice.value = null;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) return;
    notice.value = `恢复失败：${errToMessage(err)}`;
  }
}

async function confirmCancel() {
  cancelConfirmOpen.value = false;
  if (!batchId.value) return;
  try {
    await cancelBatch(batchId.value);
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) return;
    notice.value = `取消请求失败（批次可能仍在执行）：${errToMessage(err)}`;
  }
  // 去重决策页发起的取消：回到结果视图（决策清单已无意义）
  if (phase.value === 'dedup') {
    duplicates.value = [];
    loadFinishedBatch(batchId.value);
  }
}

async function retryFailedTasks() {
  if (!batchId.value) return;
  try {
    await retryBatch(batchId.value);
    phase.value = 'running';
    startPolling(batchId.value);
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) return;
    notice.value = `重试失败：${errToMessage(err)}`;
  }
}

function backToUpload() {
  stopPolling();
  statusEpoch++;
  phase.value = 'upload';
  batchStatus.value = null;
  batchId.value = null;
  files.value = [];
  notice.value = null;
  statusError.value = null;
  duplicates.value = [];
  decisions.value = {};
  refreshHistory();
}

// 进页自动恢复：有进行中/待核查/已暂停的批次则接续展示（不在上传/去重动作中途抢焦点）。
async function restoreActiveBatch() {
  try {
    const batches = await listBatches();
    const active =
      batches.find((batch) => batch.status === 'running') ??
      batches.find((batch) => batch.status === 'awaiting_review') ??
      batches.find((batch) => batch.status === 'paused');
    if (active && !batchId.value) openBatch(active);
  } catch {
    /* 启动恢复失败静默，用户可从历史列表手动进入 */
  }
}

onMounted(() => {
  refreshHistory();
  restoreActiveBatch();
});
onUnmounted(() => {
  stopPolling();
});
</script>

<template>
  <div>
    <h1 class="title-zine"> 批量评定 </h1>
    <div class="lede"> 多幅底片/整卷文件夹批量评定，支持异步队列调度、实时进度监视与历史批次管理 </div>

    <!-- 上传 -->
    <div v-if="phase === 'upload'">
      <div class="guide">
        <div class="g">
          <div class="n"> 一 · 底片导入 </div>
          <div class="t"> 支持多选文件或整卷文件夹导入（DICOM 及常见图像格式），单批上限 {{ MAX_BATCH_IMAGES }} 幅。 </div>
        </div>
        <div class="g">
          <div class="n"> 二 · 公共工艺参数 </div>
          <div class="t"> 母材公称厚度 T 为必填项，统一应用于批内全部底片；像质不合格底片默认强制出片并标记「待人工复核」。 </div>
        </div>
        <div class="g">
          <div class="n"> 三 · 异步批量执行 </div>
          <div class="t"> 提交后即返回批次编号，多推理进程并行调度，界面实时刷新进度。 </div>
        </div>
      </div>
      <div class="row">
        <div class="grow">
          <div class="chips">
            <span class="chip on">DICOM .dcm</span>
            <span class="chip on">JPG/PNG/BMP</span>
            <span class="chip on">TIFF/GIF/WebP</span>
            <span class="chip on">HEIC/AVIF</span>
          </div>
          <div class="hint"> 文件夹导入将递归收集子目录中的影像；非影像文件自动跳过。 </div>
          <div
            :class="['drop', { over: dragOver }]"
            role="button"
            tabindex="0"
            aria-label="点击或拖入底片文件"
            @click="pickFiles"
            @keydown.enter.prevent="pickFiles"
            @keydown.space.prevent="pickFiles"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="onDrop"
          >
            <div class="big"> 点击选择、拖入底片文件 </div>
            <div class="hint"> 支持 Ctrl/Shift 多选；影像全程本机处理，不经外部网络传输 </div>
          </div>
          <input id="pick-files" type="file" :accept="IMAGE_ACCEPT" multiple style="display: none" @change="onFileInputChange" />
          <button type="button" class="btn ghost" @click="pickDir"> 或导入整个文件夹… </button>
          <input id="pick-dir" type="file" webkitdirectory multiple style="display: none" @change="onFileInputChange" />
          <div v-if="files.length" class="preview show">
            <div class="meta">{{ selectionSummary() }}</div>
            <div class="meta faint">
              {{ files.slice(0, 8).map((file) => file.name).join('、') }}<span v-if="files.length > 8">…</span>
            </div>
          </div>
          <div v-if="notice" class="err show"> ⚠ {{ notice }}</div>
          <div v-if="uploading && uploadProgress >= 0" class="up-progress" role="status">
            <div class="up-bar">
              <div class="up-fill" :style="{ width: `${uploadProgress}%` }"></div>
            </div>
            <span class="up-pct">上传中 {{ uploadProgress }}%</span>
            <span class="up-hint">上传完成后即开始评定，可保持本页等待</span>
          </div>
        </div>
        <div class="grow">
          <div class="field">
            <label for="spacing">空间像素标定（mm/px）</label>
            <input id="spacing" v-model="spacing" />
            <div class="why"> 默认 0.1000 mm/px；用于将像素尺寸换算为缺陷实际当量。 </div>
          </div>
          <div class="field">
            <label for="thick">母材公称厚度 T（mm）<span class="req">*</span></label>
            <input id="thick" v-model="thickness" placeholder="如 20" />
            <div class="why"> 分级评定必备（NB/T 47013.2 依 T 划定评定区与各级限值），统一应用于批内全部底片。 </div>
          </div>
          <div class="field">
            <label for="wp">工件编号（选填）</label>
            <input id="wp" v-model="workpieceNo" placeholder="如 WP-7781" />
          </div>
          <div class="field">
            <label for="wn">焊缝编号（选填）</label>
            <input id="wn" v-model="weldNo" placeholder="如 W-12" />
          </div>
          <label class="check">
            <input v-model="forceOutput" type="checkbox" />
            强制出片（像质不合格底片标记「待人工复核」并继续处理，不阻断整批流程）
          </label>
          <button class="btn" type="button" :disabled="files.length === 0 || uploading" @click="submitBatch">
            {{ uploading ? '提交中…' : '提交批量评定 →' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 重复性核查 -->
    <div v-else-if="phase === 'dedup'">
      <div class="sec-label">
        批次 {{ batchId ? batchId.slice(0, 8) : '' }}
        <span class="sec-state hold">待重复性核查</span>
      </div>
      <div class="dedup-box">
        <div class="dd-head">
          检出 <b>{{ duplicates.length }}</b> 幅重复底片（与批内其他影像或历史已检影像内容指纹完全一致）。
          请逐项确认处置方式；非重复影像不受影响，确认后立即开始评定。
        </div>
        <div class="dd-list">
          <div v-for="dup in duplicates" :key="dup.task_id" class="dd-row">
            <div class="dd-info">
              <div class="dd-name">{{ dup.image_name }}</div>
              <div class="dd-meta">
                <span :class="['dd-kind', dup.kind]">{{ dup.kind === 'history' ? '与历史已检影像重复' : '批内重复' }}</span>
                <template v-if="dup.kind === 'batch'"> 与本批「{{ dup.duplicate_of }}」内容一致 </template>
                <template v-else-if="dup.history">
                  首检 {{ dup.history.image_id.slice(0, 8) }}
                  <template v-if="dup.history.created_at"> · {{ dup.history.created_at }}</template>
                  <template v-if="dup.history.joint_level"> · 级别 {{ dup.history.joint_level }}</template>
                </template>
              </div>
            </div>
            <div class="dd-actions">
              <button
                type="button"
                :class="['dd-btn', { on: (decisions[dup.task_id] ?? 'skip') === 'skip' }]"
                @click="setDecision(dup.task_id, 'skip')"
              >
                跳过（推荐）
              </button>
              <button
                type="button"
                :class="['dd-btn', { on: (decisions[dup.task_id] ?? 'skip') === 'keep' }]"
                @click="setDecision(dup.task_id, 'keep')"
              >
                强制评定
              </button>
            </div>
          </div>
        </div>
        <div class="dd-foot">
          <button type="button" class="btn ghost" @click="setAllDecisions('skip')"> 全部跳过 </button>
          <button type="button" class="btn ghost" @click="setAllDecisions('keep')"> 全部强制评定 </button>
          <span class="dd-hint">跳过的底片不重复评定、不出具报告；强制评定的底片正常评片并归档。</span>
          <button type="button" class="btn" :disabled="resolving" style="margin-left: auto" @click="confirmDedup">
            {{ resolving ? '提交中…' : `确认并继续（跳过 ${skipCount} · 强制评定 ${keepCount}）→` }}
          </button>
          <button type="button" class="btn ghost dd-danger" @click="requestCancel"> 取消整批 </button>
        </div>
        <div v-if="notice" class="err show"> ⚠ {{ notice }}</div>
      </div>
    </div>

    <!-- 执行中 / 结果 -->
    <div v-else>
      <div v-if="pollingHalted" class="err show">
        ⚠ {{ pollError ? `进度获取失败（${pollError}），` : '' }}推理服务可能无响应，已暂停进度轮询。
        <button class="btn link" type="button" @click="retryPolling"> 重试连接 </button>
      </div>
      <div v-if="notice" class="err show">
        ⚠ {{ notice }}
        <button class="btn link" type="button" @click="notice = null"> 知道了 </button>
      </div>
      <div v-if="statusError" class="err show">
        ⚠ {{ statusError }}
        <button class="btn link" type="button" @click="batchId && loadFinishedBatch(batchId)"> 重试 </button>
      </div>
      <div class="sec-label" :data-t="`BATCH ${batchId ? batchId.slice(0, 8) : ''}`">
        批次 {{ batchId ? batchId.slice(0, 8) : '' }}
        <span v-if="batchStatus && batchStatus.status === 'paused'" class="sec-state hold">已暂停</span>
        <span v-else-if="phase === 'running'" class="sec-state run">执行中</span>
        <span v-else class="sec-state fin">已完结</span>
      </div>
      <BatchProgress
        v-if="batchStatus"
        :status="batchStatus"
        @cancel="requestCancel"
        @retry="retryFailedTasks"
        @archive="emit('archive')"
        @open-report="openReport"
        @pause="pauseCurrentBatch"
        @resume="resumeCurrentBatch"
      />
      <div v-if="phase === 'result'" class="row" style="margin-top: 14px">
        <button type="button" class="btn" @click="backToUpload"> 新建批次 → </button>
        <button type="button" class="btn ghost" @click="emit('archive')"> 查阅检测档案 </button>
      </div>
    </div>

    <!-- 历史批次 -->
    <div v-if="historyBatches.length" class="hist">
      <div class="section-h"> 历史批次 </div>
      <p v-if="historyError" class="hint" role="alert"> ⚠ {{ historyError }}</p>
      <div class="hist-list">
        <button
          v-for="batch in historyBatches"
          :key="batch.batch_id"
          type="button"
          :class="['hist-row', { cur: batch.batch_id === batchId }]"
          @click="openBatch(batch)"
        >
          <span class="h-id">{{ batch.batch_id.slice(0, 8) }}</span>
          <span class="h-time">{{ batch.created_at }}</span>
          <span class="h-prog">{{ Math.round(batch.progress * 100) }}%</span>
          <span class="h-counts">
            {{ batch.done }}/{{ batch.total }}
            <em v-if="batch.failed" class="h-fail"> 失败{{ batch.failed }}</em>
          </span>
          <span :class="['h-status', batch.status === 'paused' ? 'paused' : batch.status]">
            {{ batch.status === 'finished' ? '已完成' : batch.status === 'awaiting_review' ? '待重复性核查' : batch.status === 'paused' ? '已暂停' : '进行中' }}
          </span>
        </button>
      </div>
    </div>
  </div>

  <ConfirmDialog
    :open="cancelConfirmOpen"
    title="取消批次确认"
    message="取消后，该批次尚未处理的底片将停止评定，已完成的结果予以保留；失败/已取消的任务后续可重试。确认取消？"
    confirm-text="取消批次"
    danger
    @confirm="confirmCancel"
    @cancel="cancelConfirmOpen = false"
  />
  <PdfGateModal :ctrl="pdfGate" />
</template>
