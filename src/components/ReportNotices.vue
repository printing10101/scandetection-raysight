<script setup>
// 报告注意事项列表——从 bundle 的 __name:"ReportNotices" 区块还原（9676–9692 行）。
// 渲染评定结果里的 warnings 数组（如"标准限值需授权"等提示），空列表不渲染。
import { computed } from 'vue';

const props = defineProps({
  result: { type: Object, required: true },
});

const warnings = computed(() => [...(props.result.warnings ?? [])]);
</script>

<template>
  <div v-if="warnings.length > 0" class="notices" role="alert">
    <div class="n-h"> ⚠ 需注意 </div>
    <ul>
      <li v-for="(warning, i) in warnings" :key="i">{{ warning }}</li>
    </ul>
  </div>
</template>
