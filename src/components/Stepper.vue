<script setup>
// 步骤条——从 bundle 的 __name:"Stepper" 区块还原（9235–9255 行）。
// 三步固定流程：底片导入 → 自动评定 → 报告签发；
// current 从 1 计数，连接条在上一阶段完成（current > i）后点亮。
defineProps({
  current: { type: Number, required: true },
});

const steps = ['底片导入', '自动评定', '报告签发'];
</script>

<template>
  <div class="stepper" aria-label="评定流程步骤">
    <template v-for="(label, i) in steps" :key="label">
      <div v-if="i > 0" :class="['bar', { done: current > i }]"></div>
      <div :class="['step', { active: current === i + 1, done: current > i + 1 }]">
        <span class="num">{{ `0${i + 1}` }}</span>{{ label }}
      </div>
    </template>
  </div>
</template>
