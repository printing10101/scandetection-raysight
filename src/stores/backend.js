// 后端连接状态 store——从 bundle 的 defineStore("backend") 区块还原（6997–7045 行）。
//
// 事件源：api/http.js 在网络层失败/恢复时广播 backend:down / backend:up。
// 收到 down 后每 1s 轮询 GET /health：
//   - status === "starting"（模型加载中）→ 点亮 modelLoading，继续轮询；
//   - 可达 → backendUp 置真并停止轮询；查询异常 → 1s 后重试。
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getHealth } from '../api/endpoints.js';
import { EVT_BACKEND_DOWN, EVT_BACKEND_UP } from '../api/http.js';

const POLL_INTERVAL_MS = 1000;

export const useBackendStore = defineStore('backend', () => {
  const backendDown = ref(false);
  const backendUp = ref(false);
  const modelLoading = ref(false);
  let pollTimer;

  function stopPolling() {
    if (pollTimer !== undefined) {
      window.clearTimeout(pollTimer);
      pollTimer = undefined;
    }
  }

  function poll() {
    stopPolling();
    pollTimer = window.setTimeout(async () => {
      try {
        if ((await getHealth()).status === 'starting') {
          modelLoading.value = true;
          poll();
        } else {
          modelLoading.value = false;
          backendUp.value = true;
        }
      } catch {
        poll();
      }
    }, POLL_INTERVAL_MS);
  }

  function markDown() {
    backendDown.value = true;
    backendUp.value = false;
    poll();
  }

  function markUp() {
    backendDown.value = false;
    backendUp.value = true;
    modelLoading.value = false;
    stopPolling();
  }

  function bind() {
    window.addEventListener(EVT_BACKEND_DOWN, markDown);
    window.addEventListener(EVT_BACKEND_UP, markUp);
  }

  function unbind() {
    stopPolling();
    window.removeEventListener(EVT_BACKEND_DOWN, markDown);
    window.removeEventListener(EVT_BACKEND_UP, markUp);
  }

  function start() {
    poll();
  }

  return { backendDown, backendUp, modelLoading, bind, unbind, start, stopPolling };
});
