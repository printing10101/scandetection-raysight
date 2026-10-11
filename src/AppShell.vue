<script setup>
// 应用布局壳——从 bundle 的 __name:"AppShell" 区块还原（13329–13627 行）。
// MenuBar + RibbonBar + 文档页签 + RouterView + StatusBar；
// 菜单/功能区动作统一经 handleMenuAction 分发；
// 内置三个弹层：帮助（快捷键/关于）、检测人员信息、浏览器端退出兜底提示。
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWorkspaceStore } from './stores/workspace.js';
import MenuBar from './components/MenuBar.vue';
import RibbonBar from './components/RibbonBar.vue';
import StatusBar from './components/StatusBar.vue';

const route = useRoute();
const router = useRouter();
const workspace = useWorkspaceStore();

const activeView = computed(() => normalizeViewName(route.name));
const operator = computed(() => workspace.operator);

// 应用版本（bundle 模块级 appInfo.version，与 package.json 一致）
const APP_VERSION = '0.1.0';

// 文档页签（admin 不在页签里，仅经菜单进入）
const navTabs = [
  { id: 'journey', label: '单幅评定' },
  { id: 'batch', label: '批量评定' },
  { id: 'archive', label: '检测档案' },
  { id: 'device', label: '设备标定' },
  { id: 'viewer', label: '底片观察' },
  { id: 'std-eval', label: '系统评价' },
  { id: 'llm', label: '本地大模型' },
];

// 路由名 → 页签高亮用的规范视图名（未知一律落到 journey）
function normalizeViewName(name) {
  return name === 'batch' || name === 'archive' || name === 'device' || name === 'journey'
    || name === 'viewer' || name === 'std-eval' || name === 'admin' || name === 'llm'
    ? name
    : 'journey';
}

function goView(view) {
  router.push({ name: view });
}

function openImage() {
  workspace.requestFileOpen('image');
  goView('journey');
}

function openBatch() {
  workspace.requestFileOpen('batch');
  goView('batch');
}

// ---- 帮助弹层：'none' | 'shortcuts' | 'about' ----
const helpOverlay = ref('none');
const helpOkBtn = ref(null);

// 弹层打开时把焦点移到"确定"按钮
watch(helpOverlay, (value) => {
  if (value !== 'none') nextTick(() => helpOkBtn.value?.focus());
});

// ---- 检测人员信息弹层 ----
const showOperatorDialog = ref(false);
const operatorDraft = ref('');
const operatorInput = ref(null);

function openOperatorDialog() {
  operatorDraft.value = operator.value;
  showOperatorDialog.value = true;
  nextTick(() => operatorInput.value?.focus());
}

function saveOperator() {
  workspace.setOperator(operatorDraft.value.trim());
  showOperatorDialog.value = false;
}

// ---- 退出：window.close() 不可用（浏览器环境）时给兜底提示 ----
const showBrowserCloseHint = ref(false);

function requestExit() {
  window.close();
  window.setTimeout(() => {
    showBrowserCloseHint.value = true;
  }, 300);
}

// ---- 菜单/功能区动作分发 ----
function handleMenuAction(action) {
  switch (action) {
    case 'open-image':
      openImage();
      break;
    case 'open-batch':
      openBatch();
      break;
    case 'view-journey':
      goView('journey');
      break;
    case 'view-batch':
      goView('batch');
      break;
    case 'view-archive':
      goView('archive');
      break;
    case 'view-device':
      goView('device');
      break;
    case 'view-viewer':
      goView('viewer');
      break;
    case 'view-std-eval':
      goView('std-eval');
      break;
    case 'view-llm':
      goView('llm');
      break;
    case 'view-admin':
      goView('admin');
      break;
    case 'operator':
      openOperatorDialog();
      break;
    case 'shortcuts':
      helpOverlay.value = 'shortcuts';
      break;
    case 'about':
      helpOverlay.value = 'about';
      break;
    case 'exit':
      requestExit();
      break;
  }
}

// Esc 关帮助层（全局兜底；弹层自身的关闭走各自的事件）
function onGlobalKeydown(e) {
  if (e.key === 'Escape' && helpOverlay.value !== 'none') {
    helpOverlay.value = 'none';
  }
}

// 全局快捷键：Ctrl/Cmd+1~7 切工作区，Ctrl+O 打开影像，Ctrl+Shift+O 批量导入
function onShortcutKeydown(e) {
  if (!(e.ctrlKey || e.metaKey)) return;
  const key = e.key.toLowerCase();
  if (key === '1') goView('journey');
  else if (key === '2') goView('batch');
  else if (key === '3') goView('archive');
  else if (key === '4') goView('device');
  else if (key === '5') goView('viewer');
  else if (key === '6') goView('std-eval');
  else if (key === '7') goView('llm');
  else if (key === 'o' && e.shiftKey) openBatch();
  else if (key === 'o') openImage();
  else return;
  e.preventDefault();
}

onMounted(() => {
  window.addEventListener('keydown', onShortcutKeydown);
  window.addEventListener('keydown', onGlobalKeydown);
});
onUnmounted(() => {
  window.removeEventListener('keydown', onShortcutKeydown);
  window.removeEventListener('keydown', onGlobalKeydown);
});
</script>

<template>
  <div class="app-shell">
    <MenuBar :active-view="activeView" @action="handleMenuAction" />
    <RibbonBar :active-view="activeView" :operator="operator" @action="handleMenuAction" @view="goView" />

    <div class="doctabs">
      <RouterLink
        v-for="tab in navTabs"
        :key="tab.id"
        :to="{ name: tab.id }"
        :class="['doctab', { on: activeView === tab.id }]"
      >{{ tab.label }}</RouterLink>
    </div>

    <main class="main">
      <RouterView v-slot="{ Component }">
        <component :is="Component" @archive="goView('archive')" />
      </RouterView>
    </main>

    <StatusBar />

    <!-- 帮助：键盘快捷键 / 关于 -->
    <div v-if="helpOverlay !== 'none'" class="overlay" @click.self="helpOverlay = 'none'">
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="helpOverlay === 'shortcuts' ? '键盘快捷键' : '关于'"
      >
        <div class="d-head">
          {{ helpOverlay === 'shortcuts' ? '键盘快捷键' : '关于' }}
          <button type="button" class="x" aria-label="关闭" @click="helpOverlay = 'none'"> × </button>
        </div>

        <div v-if="helpOverlay === 'shortcuts'" class="d-body">
          <table class="keys">
            <tbody>
              <tr><td>打开影像</td><td>Ctrl+O</td></tr>
              <tr><td>批量导入</td><td>Ctrl+Shift+O</td></tr>
              <tr><td>单幅评定</td><td>Ctrl+1</td></tr>
              <tr><td>批量评定</td><td>Ctrl+2</td></tr>
              <tr><td>检测档案</td><td>Ctrl+3</td></tr>
              <tr><td>设备标定</td><td>Ctrl+4</td></tr>
              <tr><td>底片观察</td><td>Ctrl+5</td></tr>
              <tr><td>系统评价</td><td>Ctrl+6</td></tr>
              <tr><td>本地大模型</td><td>Ctrl+7</td></tr>
              <tr><td>退出</td><td>Alt+F4 / 窗口关闭按钮</td></tr>
            </tbody>
          </table>
        </div>

        <div v-else class="d-body about">
          <div class="logo"></div>
          <p class="app-name"> 射线焊缝缺陷智能检测系统 </p>
          <p class="ver"> 版本 {{ APP_VERSION }} · 本地化部署 </p>
          <p class="ver">
            依据 NB/T 47013.2-2015 执行焊缝缺陷智能评定<br />
            检测数据全程本地化处理，不经外部网络传输
          </p>
        </div>

        <div class="d-foot">
          <button ref="helpOkBtn" type="button" class="ok" @click="helpOverlay = 'none'"> 确定 </button>
        </div>
      </div>
    </div>

    <!-- 检测人员信息 -->
    <div
      v-if="showOperatorDialog"
      class="overlay"
      @click.self="showOperatorDialog = false"
      @keydown.esc="showOperatorDialog = false"
    >
      <div class="dialog" role="dialog" aria-modal="true" aria-label="检测人员信息">
        <div class="d-head">
          检测人员信息
          <button type="button" class="x" aria-label="关闭" @click="showOperatorDialog = false"> × </button>
        </div>
        <div class="d-body">
          <label class="op-field" for="operator-name">检测人员姓名（用于报告签署与审计追溯）</label>
          <input
            id="operator-name"
            ref="operatorInput"
            v-model="operatorDraft"
            type="text"
            @keyup.enter="saveOperator"
          />
        </div>
        <div class="d-foot">
          <button type="button" class="ok" @click="showOperatorDialog = false"> 取消 </button>
          <button type="button" class="ok primary" @click="saveOperator"> 保存 </button>
        </div>
      </div>
    </div>

    <!-- window.close() 不可用时的兜底提示 -->
    <div v-if="showBrowserCloseHint" class="overlay" @click.self="showBrowserCloseHint = false">
      <div class="dialog" role="alertdialog" aria-modal="true" aria-label="退出应用">
        <div class="d-head"> 退出应用 </div>
        <div class="d-body"> 当前运行环境不允许本页自动关闭窗口。请点击窗口右上角的关闭按钮 ×，或按 Alt+F4 退出应用。 </div>
        <div class="d-foot">
          <button type="button" class="ok" @click="showBrowserCloseHint = false"> 知道了 </button>
        </div>
      </div>
    </div>
  </div>
</template>
