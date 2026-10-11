<script setup>
// 流水线阶段条——从 bundle 的 __name:"PipelineTrack" 区块还原（9586–9629 行）。
// 单幅评定提交后的等待页：运行计时、六个流水线阶段、慢耗时提示与返回按钮。
// 阶段清单为 bundle 7443 行的模块级常量（原 xp），仅此组件使用，故内联于此。
import { computed } from 'vue';

const props = defineProps({
  status: { type: String, required: true },
  elapsedMs: { type: Number, required: true },
  errorMessage: { type: String, default: '' },
});
const emit = defineEmits(['retry']);

// 原始流水线阶段名（bundle 7443 行，逐字保留）
const PIPELINE_STAGES = [
  '底片影像加载',
  '影像质量校验（黑度 D · 像质计 IQI）',
  '缺陷检出与当量测定',
  '标准符合性判定（NB/T 47013.2）',
  '检测数据归档',
  '评片报告签发（PDF/A）',
];

// 毫秒 → mm:ss
function formatClock(ms) {
  const seconds = Math.floor(ms / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

const isRunning = computed(() => props.status === 'running');
// 常规耗时 15–30 秒，超过 1 分钟提示"仍属正常范围"
const isSlow = computed(() => props.elapsedMs > 60000);
</script>

<template>
  <div>
    <div class="proc-head">
      <div>
        <span style="font-size: 11px; color: var(--ink-faint)">已运行</span>
        <span class="clock">{{ formatClock(elapsedMs) }}</span>
      </div>
      <div class="expect"> 预计耗时 15–30 秒 · 评定进行中，请勿关闭窗口 </div>
    </div>
    <div class="track">
      <div v-for="(stage, i) in PIPELINE_STAGES" :key="stage" :class="['stage-row', isRunning ? 'run' : 'fail']">
        <span class="idx">{{ String(i + 1).padStart(2, '0') }}</span>
        <span class="nm">{{ stage }}</span>
        <span v-if="isRunning" class="st">{{ i === 0 ? '提交后依序执行' : '排队' }}</span>
        <span v-else class="st">已中断</span>
      </div>
    </div>
    <p v-if="isRunning" class="tip">
      <span class="spin"></span>正在向本地推理服务提交底片并等待评定结果…
    </p>
    <p v-else class="tip">
      <span style="color: var(--signal)">✕ 评定失败：{{ errorMessage }}</span>
    </p>
    <p v-if="isRunning && isSlow" class="tip slow-hint" role="status">
      已超过常规耗时。大尺寸底片或机械硬盘场景下 1–3 分钟属正常范围，计时仍在走动即说明请求未挂起；若超过 3 分钟无响应，可返回检查服务状态后重新提交。
    </p>
    <div class="leave"> 等待期间可切换至「检测档案」查阅历史记录；评定结果将自动归档至本地数据库。 </div>
    <button v-if="!isRunning" class="btn ghost" type="button" @click="emit('retry')"> ← 返回修改（保留已选底片与参数） </button>
  </div>
</template>
