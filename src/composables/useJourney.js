// 单幅评定任务状态机——从 bundle 模块级组合式函数还原（9177–9226 行）。
// 三阶段：upload → processing → result（result 内按 error/result 区分失败与成功面板）。
// processing 期间：
//   - 每 200ms 刷新 elapsedMs 计时；
//   - 置全局活动标记 activeEvaluation="journey"，供根组件退出守护拦截关窗（结束后清回）。
// sourceUrl 为已选底片的本地预览对象 URL：换文件/作用域销毁时 revoke，防泄漏。
import { ref, readonly, getCurrentScope, onScopeDispose } from 'vue';
import { createReport } from '../api/endpoints.js';
import { errToMessage } from '../utils/helpers.js';
import { activeEvaluation } from '../stores/activity.js';

const ELAPSED_TICK_MS = 200;

export function useJourney() {
  const phase = ref('upload');
  const file = ref(null);
  const sourceUrl = ref(null);
  const result = ref(null);
  const error = ref(null);
  const elapsedMs = ref(0);
  let elapsedTimer;

  if (getCurrentScope()) {
    onScopeDispose(() => {
      if (elapsedTimer) clearInterval(elapsedTimer);
      elapsedTimer = undefined;
      if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value);
    });
  }

  function setFile(next) {
    if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value);
    sourceUrl.value = null;
    file.value = next;
    if (next) sourceUrl.value = URL.createObjectURL(next);
  }

  async function submit(formData) {
    phase.value = 'processing';
    error.value = null;
    result.value = null;
    activeEvaluation.value = 'journey';
    const startedAt = performance.now();
    elapsedTimer = setInterval(() => {
      elapsedMs.value = Math.round(performance.now() - startedAt);
    }, ELAPSED_TICK_MS);
    try {
      result.value = await createReport(formData);
      phase.value = 'result';
    } catch (err) {
      error.value = errToMessage(err);
      phase.value = 'result';
    } finally {
      if (elapsedTimer) clearInterval(elapsedTimer);
      elapsedTimer = undefined;
      if (activeEvaluation.value === 'journey') activeEvaluation.value = null;
    }
  }

  function backToUpload() {
    error.value = null;
    result.value = null;
    elapsedMs.value = 0;
    phase.value = 'upload';
  }

  function reset() {
    if (elapsedTimer) clearInterval(elapsedTimer);
    elapsedTimer = undefined;
    setFile(null);
    phase.value = 'upload';
    error.value = null;
    result.value = null;
    elapsedMs.value = 0;
  }

  return {
    phase: readonly(phase),
    file: readonly(file),
    sourceUrl: readonly(sourceUrl),
    result: readonly(result),
    error: readonly(error),
    elapsedMs: readonly(elapsedMs),
    setFile,
    submit,
    backToUpload,
    reset,
  };
}
