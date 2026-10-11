<script setup>
// 缺陷处置面板——从 bundle __name:"DispositionPanel"（10093–10121 行）重建。
// 纯展示组件：按 disposition 渲染处置徽标、操作清单与免责说明；
// disposition 缺失时整块不渲染，未知值回落到 recheck 样式。
import { computed } from 'vue';

const props = defineProps(['result']);

// 供样式的类别键：accept / conditional / rework，其余（含空）一律 recheck。
const dispositionClass = computed(() => {
  switch (props.result.disposition) {
    case 'accept':
      return 'accept';
    case 'conditional':
      return 'conditional';
    case 'rework':
      return 'rework';
    default:
      return 'recheck';
  }
});
</script>

<template>
  <div v-if="result.disposition" :class="['disp', dispositionClass]">
    <div class="badge">{{ result.disposition_label ?? result.disposition }}</div>
    <ul class="actions">
      <li v-for="(action, idx) in result.disposition_actions" :key="idx">{{ action }}</li>
    </ul>
    <div v-if="result.disclaimer" class="disc">{{ result.disclaimer }}</div>
  </div>
</template>
