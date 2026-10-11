<script setup>
// 顶部菜单栏——从 bundle 的 __name:"MenuBar" 区块还原（6743–6900 行）。
// 职责：品牌区 + 下拉菜单（文件/视图/工具/帮助）+ 当前工作区名 + 登录身份与注销。
// 菜单项本身不执行动作，统一 emit("action", itemId) 由 AppShell 分发。
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const props = defineProps({
  activeView: { type: String, default: '' },
});
const emit = defineEmits(['action']);

const router = useRouter();
const auth = useAuthStore();

// 工作区 id → 菜单栏展示名（含"系统评价/设备标定"等非路由视图）
const viewLabels = {
  journey: '单幅评定',
  batch: '批量评定',
  archive: '检测档案',
  viewer: '底片观察',
  'std-eval': '系统评价',
  device: '设备标定',
  admin: '账号管理',
  llm: '本地大模型',
};

// 三员角色 → 中文展示名
const roleLabels = {
  sysadmin: '系统管理员',
  secadmin: '安全保密管理员',
  auditor: '安全审计员',
  guest: '访客',
};

function handleLogout() {
  auth.logout().then(() => router.push('/login'));
}

// 视图菜单里"账号管理"仅系统管理员可见
const menus = computed(() => [
  {
    id: 'file',
    label: '文件',
    items: [
      { id: 'open-image', label: '打开射线影像…', shortcut: 'Ctrl+O' },
      { id: 'open-batch', label: '批量导入底片…', shortcut: 'Ctrl+Shift+O' },
      { id: 'sep1', label: '', separator: true },
      { id: 'exit', label: '退出', shortcut: 'Alt+F4' },
    ],
  },
  {
    id: 'view',
    label: '视图',
    items: [
      { id: 'view-journey', label: '单幅评定', shortcut: 'Ctrl+1' },
      { id: 'view-batch', label: '批量评定', shortcut: 'Ctrl+2' },
      { id: 'view-archive', label: '检测档案', shortcut: 'Ctrl+3' },
      { id: 'view-device', label: '设备标定', shortcut: 'Ctrl+4' },
      { id: 'view-viewer', label: '底片观察', shortcut: 'Ctrl+5' },
      { id: 'view-std-eval', label: '系统评价', shortcut: 'Ctrl+6' },
      { id: 'view-llm', label: '本地大模型', shortcut: 'Ctrl+7' },
      ...(auth.role === 'sysadmin' ? [{ id: 'view-admin', label: '账号管理', shortcut: '' }] : []),
    ],
  },
  {
    id: 'tools',
    label: '工具',
    items: [{ id: 'operator', label: '检测人员信息…' }],
  },
  {
    id: 'help',
    label: '帮助',
    items: [
      { id: 'shortcuts', label: '快捷键…' },
      { id: 'about', label: '关于…' },
    ],
  },
]);

// 当前展开的下拉菜单 id；null 表示全部收起
const openMenu = ref(null);

function toggleMenu(id) {
  openMenu.value = openMenu.value === id ? null : id;
}

// 已有菜单展开时，悬停切换到目标菜单（Windows 风格）
function hoverMenu(id) {
  if (openMenu.value !== null) openMenu.value = id;
}

function chooseItem(id) {
  openMenu.value = null;
  emit('action', id);
}

function closeMenus() {
  openMenu.value = null;
}

onMounted(() => document.addEventListener('click', closeMenus));
onUnmounted(() => document.removeEventListener('click', closeMenus));
</script>

<template>
  <div class="menubar" @click.stop>
    <div class="brand">
      <span class="mark" aria-hidden="true"></span>
      <span class="name">射线焊缝缺陷智能检测系统</span>
    </div>
    <div v-for="menu in menus" :key="menu.id" class="menu" @mouseenter="hoverMenu(menu.id)">
      <button type="button" :class="{ open: openMenu === menu.id }" @click="toggleMenu(menu.id)">{{ menu.label }}</button>
      <div v-if="openMenu === menu.id" class="dropdown">
        <template v-for="item in menu.items" :key="item.id">
          <div v-if="item.separator" class="sep"></div>
          <button v-else type="button" class="item" @click="chooseItem(item.id)">
            <span class="lab">{{ item.label }}</span>
            <span v-if="item.shortcut" class="key">{{ item.shortcut }}</span>
          </button>
        </template>
      </div>
    </div>
    <div class="spacer"></div>
    <div class="ctx"> 当前工作区：{{ viewLabels[activeView] ?? '' }}</div>
    <div v-if="auth.isLoggedIn" class="ctx user">
      {{ auth.username }}（{{ roleLabels[auth.role] ?? auth.role }}） <button type="button" class="logout" @click="handleLogout"> 注销 </button>
    </div>
  </div>
</template>
