<script setup>
// 评定结果横幅——从 bundle 的 __name:"ResultBanner" 区块还原（9641–9669 行）。
// 三态：ok（正常出片）/ review（待人工复核）/ fail（不可评片），
// 附底片印字徽标与"为什么是这个结论"的保守判定说明。
import { computed } from 'vue';
import { stampBadge } from '../utils/reportHelpers.js';

const props = defineProps({
  result: { type: Object, required: true },
});

const levelClass = computed(() => (props.result.evaluable ? (props.result.need_review ? 'review' : 'ok') : 'fail'));

const badge = computed(() => stampBadge(props.result.stamp ?? null));

const levelText = computed(() =>
  props.result.evaluable
    ? props.result.need_review && !props.result.joint_level
      ? '待复核'
      : props.result.joint_level ?? '待复核'
    : '不可评片',
);

const mainText = computed(() => {
  const defectCount = props.result.defect_count;
  if (levelClass.value === 'fail') {
    return '底片质量未达标准要求（像质计灵敏度/黑度 D 校验未通过），系统按保守原则未输出级别结论。';
  }
  const levelSentence =
    props.result.need_review && props.result.joint_level
      ? `综合评定 ${props.result.joint_level} 级，本报告须经人工复核确认。`
      : props.result.joint_level
        ? `综合评定 ${props.result.joint_level} 级。`
        : '本报告待人工复核，暂无自动评级结论。';
  const defectSentence = defectCount > 0 ? `共检出 ${defectCount} 处缺陷，明细见 PDF/A 报告。` : '未检出缺陷。';
  return levelSentence + defectSentence;
});

const whyText = computed(() => {
  if (levelClass.value === 'fail') {
    return '可能原因：像质计（IQI）丝号未达要求，或黑度 D 超出 AB 级规定范围。可调整曝光参数或补加像质计后重新透照；必要时转人工评片。';
  }
  if (levelClass.value === 'review') {
    return '可能原因：本报告依据的评级标准限值需要授权后使用，或初评与对评结论存在分歧。系统已按 §12.2 转入人工仲裁流程——此为「宁保守、不误放行」的保守判定策略，并非系统误报。';
  }
  return '像质计灵敏度与黑度 D 校验均通过；如需归档，请导出 PDF/A 检测报告。';
});
</script>

<template>
  <div :class="['banner', levelClass]">
    <div class="lv">{{ levelText }}</div>
    <div class="con">
      <b>{{ mainText }}</b>
      <span v-if="badge" :class="['stamp-line', `stamp-${badge.cls}`]" :title="badge.title">底片印字：{{ badge.label }}</span>
      <span class="why">{{ whyText }}</span>
    </div>
  </div>
</template>
