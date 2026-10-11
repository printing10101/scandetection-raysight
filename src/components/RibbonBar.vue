<script setup>
// 功能区工具条——从 bundle 的 __name:"RibbonBar" 区块还原（6925–6993 行）。
// 左侧两个大按钮（打开影像/批量导入）+ 中部四个工作区切换 + 右侧检测人员署名。
// 动作统一 emit("action", id)，切换工作区 emit("view", viewId)。
const props = defineProps({
  activeView: { type: String, default: '' },
  operator: { type: String, default: '' },
});
const emit = defineEmits(['action', 'view']);

// 四个常用工作区的切换按钮（icon 为 24×24 描边 path）
const viewButtons = [
  { id: 'journey', label: '单幅评定', icon: 'M4 3h16v14H4z M4 17l5-5 4 4 3-3 4 4' },
  { id: 'batch', label: '批量评定', icon: 'M3 4h8v8H3z M13 4h8v8h-8z M3 14h8v8H3z M13 14h8v8h-8z' },
  { id: 'archive', label: '检测档案', icon: 'M4 4h16v4H4z M4 10h16v10H4z M8 7h.01' },
  { id: 'device', label: '设备标定', icon: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v3 M12 19v3 M2 12h3 M19 12h3' },
];
</script>

<template>
  <div class="ribbon">
    <div class="group">
      <button type="button" class="big" title="导入单幅射线底片并提交评定 (Ctrl+O)" @click="emit('action', 'open-image')">
        <svg viewBox="0 0 24 24" class="ic"><path d="M12 3 5 9v12h14V9z M9 21v-7h6v7" /></svg>
        <span>打开影像</span>
      </button>
      <button type="button" class="big" title="多幅底片/整卷文件夹批量导入评定 (Ctrl+Shift+O)" @click="emit('action', 'open-batch')">
        <svg viewBox="0 0 24 24" class="ic"><path d="M3 5h7l2 2h9v12H3z M3 5v14" /></svg>
        <span>批量导入</span>
      </button>
    </div>
    <div class="divider"></div>
    <div class="group views">
      <button
        v-for="(btn, index) in viewButtons"
        :key="btn.id"
        type="button"
        :class="{ on: activeView === btn.id }"
        :title="`${btn.label} (Ctrl+${index + 1})`"
        @click="emit('view', btn.id)"
      >
        <svg viewBox="0 0 24 24" class="ic s"><path :d="btn.icon" /></svg>
        <span>{{ btn.label }}</span>
      </button>
    </div>
    <div class="spacer"></div>
    <button type="button" class="operator" title="点击修改检测人员姓名（用于报告签署与审计追溯）" @click="emit('action', 'operator')"> 检测人员：{{ operator }}</button>
  </div>
</template>
