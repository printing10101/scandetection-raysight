<script setup>
// 应用根组件——从 bundle 的 __name:"App" 区块还原（13643–13708 行）。
// 职责：按路由切登录页 / 布局壳；后端连接与模型加载横幅；空闲登出预警横幅；
//       退出守护——桌面端经 window.desktop 桥（onCloseRequested / setBusy / confirmQuit）
//       拦截关窗并二次确认，浏览器端挂 beforeunload；
//       评定进行中（activeEvaluation 非空）时的关闭文案区分批量/单幅。
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBackendStore } from './stores/backend.js';
import { useAuthStore } from './stores/auth.js';
import { activeEvaluation } from './stores/activity.js';
import LoginView from './views/LoginView.vue';
import AppShell from './AppShell.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';

const backend = useBackendStore();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

onMounted(() => {
  backend.bind();
  backend.start();
  auth.bindIdleWatch();
  auth.restore();
  registerCloseGuard();
});

// 桌面壳桥（electron preload 注入；浏览器环境为 undefined）
const desktop = window.desktop;

function registerCloseGuard() {
  desktop && desktop.onCloseRequested(() => {
    showQuitConfirm.value = true;
  });
}

const showQuitConfirm = ref(false);

function confirmQuit() {
  showQuitConfirm.value = false;
  activeEvaluation.value = null;
  desktop?.confirmQuit();
}

// 评定进行中：桌面端置忙碌态（关窗交给 onCloseRequested 拦截），
// 浏览器端挂 beforeunload 提示；空闲时必须清掉，避免残留拦截。
watch(activeEvaluation, (busy) => {
  if (desktop) {
    desktop.setBusy(!!busy);
    window.onbeforeunload = null;
    return;
  }
  window.onbeforeunload = busy
    ? (e) => {
        e.preventDefault();
        e.returnValue = '评定任务正在进行中，关闭将中断任务。';
        return e.returnValue;
      }
    : null;
});

// 登出（手动/空闲/过期）后回登录页
watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (!loggedIn && route.name !== 'login') router.push('/login');
  },
);

onUnmounted(() => {
  backend.unbind();
  auth.unbindIdleWatch();
});
</script>

<template>
  <LoginView v-if="route.name === 'login'" />
  <AppShell v-else />

  <Transition name="fade">
    <div v-if="backend.backendDown" class="offline-banner" role="alert">
      <span class="dot"></span> 推理服务正在启动或未连接，系统自动重试中…（冷启动需导入推理依赖，可能需要 1~3 分钟，请保持窗口开启）
    </div>
    <div v-else-if="backend.modelLoading" class="offline-banner loading" role="status">
      <span class="dot"></span> 评定模型加载中，评定功能稍后可用（档案查阅不受影响）…
    </div>
  </Transition>

  <Transition name="fade">
    <div v-if="auth.isLoggedIn && auth.idleWarning" class="offline-banner idle-warn" role="alert">
      <span class="dot"></span> 已空闲较久，即将自动退出登录（约 1 分钟内）；移动鼠标或按任意键可继续保持登录
    </div>
  </Transition>

  <ConfirmDialog
    :open="showQuitConfirm"
    title="退出确认"
    :message="activeEvaluation === 'batch'
      ? '批量评定正在进行中，关闭窗口将中断本机评定任务（已完成的结果已保存，未完成的可重新提交）。确定要关闭吗？'
      : '单幅评定正在进行中，关闭窗口将放弃本次评定。确定要关闭吗？'"
    confirm-text="关闭窗口"
    danger
    @confirm="confirmQuit"
    @cancel="showQuitConfirm = false"
  />
</template>
