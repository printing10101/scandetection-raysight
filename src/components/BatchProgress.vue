<script setup>
// 批量评定进度面板——从 bundle 的 __name:"BatchProgress" 区块还原（7948–8050 行）。
// 展示整批进度条/计数/预计剩余、逐张任务明细（级别/缺陷/重复/印字/错误/报告入口）
// 与整批操作按钮，动作全部上抛：cancel/retry/archive/pause/resume/openReport。
import { stampBadge } from '../utils/reportHelpers.js';

const props = defineProps({
  status: { type: Object, required: true },
});
const emit = defineEmits(['cancel', 'retry', 'archive', 'pause', 'resume', 'openReport']);

// 任务状态 → 文案
const statusLabels = {
  pending: '排队中',
  running: '评定中',
  done: '已完成',
  failed: '已失败',
  cancelled: '已取消',
};

// 失败信息里的重启中断改为可读提示
function errorHint(text) {
  if (!text) return '';
  return text.includes('interrupted by restart') ? '因程序重启中断，可整批重试' : text;
}

// 任务状态 → 徽标配色
const statusBadgeClass = {
  pending: 'badge-muted',
  running: 'badge-run',
  done: 'badge-ok',
  failed: 'badge-err',
  cancelled: 'badge-muted',
};

// 批次阶段 → 文案（不在表内的阶段一律按"已完结"显示）
const stageLabels = {
  running: '评定中',
  paused: '已暂停',
  awaiting_review: '待重复性核查',
  finished: '已完结',
};

// 已完成任务可显示印字徽标。
// 与 bundle 保持一致：把整条任务对象传给 stampBadge；任务对象自身的 status
// 是 done/failed 等而非 present/missing，因此徽标实际不会渲染——按原样保留，
// 等后端任务字段确认后再决定是否改为传 stamp 摘要对象。
function stampBadgeOf(task) {
  return task.status === 'done' ? stampBadge(task) : null;
}

// 批次级印字汇总一句话
function stampSummaryText(batch) {
  const summary = batch.stamp_summary;
  if (!summary) return '';
  const base = `底片印字：${summary.present}/${summary.evaluated} 张识别到日期/编号印字（${Math.round(summary.ratio * 100)}%）`;
  return summary.suppressed
    ? `${base} —— 该批普遍无印字，缺印字已按规则豁免人工复核`
    : `${base} —— 缺印字底片已转人工复核 ${summary.flagged} 张`;
}
</script>

<template>
  <div class="bp">
    <div class="bp-head">
      <div class="bp-bar">
        <div class="bp-fill" :style="{ width: `${Math.round(status.progress * 100)}%` }"></div>
      </div>
      <div class="bp-meta">
        <span class="bp-pct">{{ Math.round(status.progress * 100) }}%</span>
        <span class="bp-counts">
          已完成 {{ status.done }} / {{ status.total }}
          <em v-if="status.failed" class="bp-fail">失败 {{ status.failed }}</em>
          <em v-if="status.cancelled">取消 {{ status.cancelled }}</em>
        </span>
        <span v-if="status.status === 'running'" class="bp-est"> 预计剩余 ≈ {{ status.estimated_sec }} 秒 </span>
        <span v-else-if="status.status === 'paused'" class="bp-paused">已暂停 · 点击「继续评定」恢复</span>
        <span v-else class="bp-fin">{{ stageLabels[status.status] ?? '已完结' }}</span>
      </div>
    </div>
    <div class="bp-tasks">
      <div v-for="task in status.tasks" :key="task.task_id" class="bp-task">
        <span class="bp-name" :title="task.error">{{ task.image_name }}</span>
        <span v-if="task.joint_level" class="bp-level">评定级别 {{ task.joint_level }}</span>
        <span v-else-if="task.need_review" class="bp-rev">待人工复核</span>
        <span v-if="task.status === 'done' && (task.defect_count ?? 0) > 0" class="bp-defect" title="该底片检出缺陷，已在「底片观察」中叠加标注框">缺陷 {{ task.defect_count }} 处</span>
        <span v-if="task.dup_kind" class="bp-dup" :title="task.dup_kind === 'history' ? `与历史影像 ${task.dup_ref ?? ''} 内容指纹重复` : `与批内 ${task.dup_ref ?? ''} 内容指纹重复`">重复</span>
        <span v-if="stampBadgeOf(task)" :class="['bp-stamp', `stamp-${stampBadgeOf(task).cls}`]" :title="stampBadgeOf(task).title">{{ stampBadgeOf(task).label }}</span>
        <span :class="['badge', statusBadgeClass[task.status] ?? 'badge-muted']">{{ statusLabels[task.status] ?? task.status }}</span>
        <span v-if="task.error" class="bp-err" :title="errorHint(task.error)">⚠ {{ errorHint(task.error) }}</span>
        <button v-if="task.status === 'done' && task.report_id" type="button" class="bp-report" title="打开该底片的 PDF/A 检测报告（含缺陷标注与检出明细）" @click="emit('openReport', task.report_id)"> 报告 </button>
      </div>
    </div>
    <p v-if="status.stamp_summary" class="bp-stamp-summary">{{ stampSummaryText(status) }}</p>
    <div class="bp-ops">
      <button v-if="status.status === 'running'" type="button" class="btn ghost" title="未启动的底片暂停派发，正在评定的底片会正常完成；可随时恢复" @click="emit('pause')"> 暂停评定 </button>
      <button v-if="status.status === 'paused'" type="button" class="btn" title="把暂停时未启动的底片重新投入评定" @click="emit('resume')"> 继续评定 → </button>
      <button v-if="status.status === 'running' || status.status === 'paused'" type="button" class="btn ghost" @click="emit('cancel')"> 取消批次 </button>
      <button v-if="status.status === 'finished' && status.failed > 0" type="button" class="btn" @click="emit('retry')"> 重试失败任务（{{ status.failed }} 项）→ </button>
      <button type="button" class="btn ghost" @click="emit('archive')"> 查阅检测档案 </button>
    </div>
  </div>
</template>
