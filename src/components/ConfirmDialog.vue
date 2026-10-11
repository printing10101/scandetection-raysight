<script setup>
// 通用确认弹窗——从 bundle 的 __name:"ConfirmDialog" 区块还原（8066–8134 行）。
// Teleport 到 body；遮罩点击/Esc 触发 cancel，确认按钮触发 confirm。
// 打开时焦点落到取消按钮，并用 Tab 循环把焦点困在面板内（alertdialog 可达性）。
import { ref, watch, nextTick, onUnmounted } from 'vue';

// 均为可选 props：confirmText 缺省时模板里用 ?? 兜底为「确认」，
// 所以这里不能给空串默认值（空串不是 nullish，会短路兜底）。
const props = defineProps({
  open: { type: Boolean },
  title: { type: String },
  message: { type: String },
  confirmText: { type: String },
  danger: { type: Boolean },
});
const emit = defineEmits(['confirm', 'cancel']);

const panel = ref(null);
const cancelBtn = ref(null);

// 捕获阶段监听：Esc 关闭；Tab 在面板首尾按钮间循环（焦点陷阱）
function onKeydown(e) {
  if (!props.open) return;
  if (e.key === 'Escape') {
    e.stopPropagation();
    emit('cancel');
    return;
  }
  if (e.key === 'Tab' && panel.value) {
    const buttons = panel.value.querySelectorAll('button');
    if (buttons.length === 0) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      window.addEventListener('keydown', onKeydown, true);
      nextTick(() => cancelBtn.value?.focus());
    } else {
      window.removeEventListener('keydown', onKeydown, true);
    }
  },
);
onUnmounted(() => window.removeEventListener('keydown', onKeydown, true));
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="cd-mask" @click.self="emit('cancel')">
      <div ref="panel" class="cd-panel" role="alertdialog" aria-modal="true" :aria-label="title">
        <p class="cd-title">{{ title }}</p>
        <p class="cd-msg">{{ message }}</p>
        <div class="cd-foot">
          <button ref="cancelBtn" type="button" class="cd-btn" @click="emit('cancel')"> 取消 </button>
          <button type="button" :class="['cd-btn', { danger }]" @click="emit('confirm')">{{ confirmText ?? '确认' }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
