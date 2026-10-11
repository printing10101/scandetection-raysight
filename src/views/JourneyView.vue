<script setup>
// 单幅评定视图——从 bundle 的 __name:"JourneyView" 区块还原（11008–11091 行）。
// 顶部步骤条 + 三阶段面板：upload（上传面板，v-show 保留状态）/ processing /
// result（失败走 PipelineTrack 的 error 态，成功交给 ReportView）。
// 已选底片同步写入 viewerFilms store（「底片观察」可复用）；archive 事件上抛外壳跳检测档案。
import { ref, computed } from 'vue';
import { useViewerFilmsStore } from '../stores/viewerFilms.js';
import { useJourney } from '../composables/useJourney.js';
import Stepper from '../components/Stepper.vue';
import UploadPanel from '../components/UploadPanel.vue';
import PipelineTrack from '../components/PipelineTrack.vue';
import ReportView from '../components/ReportView.vue';

const emit = defineEmits(['archive']);

const filmStore = useViewerFilmsStore();
const uploadPanel = ref(null);
const {
  phase,
  sourceUrl,
  file,
  elapsedMs,
  error,
  result,
  setFile,
  submit,
  backToUpload,
  reset,
} = useJourney();

// 步骤条：upload=1 底片导入；processing=2 自动评定；result=3 报告签发
const stepIndex = computed(() => (phase.value === 'upload' ? 1 : phase.value === 'processing' ? 2 : 3));

function onFileChanged(chosen) {
  setFile(chosen);
  if (chosen) filmStore.add([chosen]);
}

function onSubmit(formData) {
  submit(formData);
}

function onRetry() {
  backToUpload();
}

// 回到上传页：任务状态机与上传面板（表单/预览）一并复位
function onReset() {
  reset();
  uploadPanel.value?.reset();
}
</script>

<template>
  <div>
    <Stepper :current="stepIndex" />
    <div v-show="phase === 'upload'">
      <h1 class="title-zine" data-t="开始一次检测"> 新建单幅评定任务 </h1>
      <div class="lede"> 导入射线底片 → 本地推理流水线评定 → 签发评片报告（数据全程本地化处理） </div>
      <UploadPanel ref="uploadPanel" @file-changed="onFileChanged" @submit="onSubmit" />
    </div>
    <div v-if="phase === 'processing'">
      <h1 class="title-zine" data-t="正在处理"> 自动评定进行中 </h1>
      <div class="lede"> 底片已提交至本地推理流水线，正在执行缺陷检出与标准符合性评定 </div>
      <PipelineTrack status="running" :elapsed-ms="elapsedMs" :error-message="null" />
    </div>
    <div v-else-if="phase === 'result' && error !== null">
      <h1 class="title-zine" data-t="处理失败"> 评定任务失败 </h1>
      <div class="lede"> 本次评定未完成；已选底片与参数仍保留，可修改后重新提交 </div>
      <PipelineTrack status="error" :elapsed-ms="elapsedMs" :error-message="error" @retry="onRetry" />
    </div>
    <ReportView
      v-else-if="phase === 'result' && result !== null"
      :result="result"
      :source-url="sourceUrl"
      :file-name="file?.name ?? null"
      @archive="emit('archive')"
      @reset="onReset"
    />
  </div>
</template>
