<script setup>
// 底部状态栏——从 bundle 的 __name:"StatusBar" 区块还原（7062–7090 行）。
// 展示：连接灯（就绪/不可用/连接中）、服务端地址、评定模型状态、
//       本地化部署提示与实时时钟（每秒刷新）。
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { API_BASE } from '../api/http.js';
import { useBackendStore } from '../stores/backend.js';

const backend = useBackendStore();

// 连接灯三态：up（就绪）/ down（不可用）/ connecting（初始连接中）
const connState = computed(() => (backend.backendUp ? 'up' : backend.backendDown ? 'down' : 'connecting'));

// 评定模型状态文案：仅服务可达才算就绪
const modelStateText = computed(() =>
  connState.value === 'up' ? '就绪' : connState.value === 'down' ? '不可用' : '加载中',
);

const now = ref(new Date());
let clockTimer;
onMounted(() => {
  clockTimer = window.setInterval(() => (now.value = new Date()), 1000);
});
onUnmounted(() => {
  if (clockTimer !== undefined) window.clearInterval(clockTimer);
});

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDateTime(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 服务端地址展示：API_BASE 是绝对地址就取 host，否则说明走了同源代理。
// （对应 bundle 模块级函数 Bf，6140 行；此处仅状态栏使用，就地实现。）
function serverHost() {
  if (/^https?:\/\//.test(API_BASE)) {
    try {
      return new URL(API_BASE).host;
    } catch {
      /* 解析失败按同源代理处理 */
    }
  }
  return `${window.location.host || '127.0.0.1'}（同源代理）`;
}
const server = serverHost();
</script>

<template>
  <footer class="statusbar">
    <div class="cell">
      <span :class="['lamp', connState]"></span>
      {{ connState === 'up' ? '系统就绪' : connState === 'down' ? '推理服务未连接' : '正在连接推理服务' }}
    </div>
    <div class="cell sep"> 服务端 {{ server }}</div>
    <div class="cell sep"> 评定模型：<span :class="modelStateText === '就绪' ? 'ok' : 'warn'">{{ modelStateText }}</span></div>
    <div class="cell sep"> 本地化部署 · 数据不出机 </div>
    <div class="spacer"></div>
    <div class="cell">{{ formatDateTime(now) }}</div>
  </footer>
</template>
