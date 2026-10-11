<script setup>
// 受控导出（C-14）门禁弹窗——从 bundle 的 __name:"PdfGateModal" 区块还原（7264–7305 行）。
// 纯展示/交互层：申请导出审批 → 轮询审批状态 → 批准后领取一次性令牌下载 PDF。
// 全部状态（均为 ref）与动作来自 ctrl，即视图侧组合式函数（bundle 7131–7232 行的
// usePdfExportGate）返回的控制器对象，由使用方通过 props 传入。
//
// 注意：ctrl 里的字段是 ref 而非 reactive 属性，模板中需显式 .value 访问，
// 与原版编译产物一致（e.ctrl.gateOpen.value）。
defineProps({
  ctrl: { type: Object, required: true },
});
</script>

<template>
  <div v-if="ctrl.gateOpen.value" class="modal-mask" @click.self="ctrl.closeGate()">
    <div class="modal" role="dialog" aria-modal="true" aria-label="受控导出">
      <h3 class="m-title"> 受控导出（C-14） </h3>
      <p class="gate-hint">
        报告 PDF 受导出审批管控：需提交申请并由安全保密管理员批准后， 领取一次性导出令牌完成下载。全程留痕审计。
      </p>
      <label class="gate-lab">申请理由（选填）</label>
      <input
        class="gate-in"
        type="text"
        maxlength="200"
        placeholder="如：归档移交 / 质量复盘"
        :model-value="ctrl.gateReason.value"
        @update:model-value="ctrl.setReason"
      />
      <p v-if="ctrl.approval.value === 'pending'" class="gate-status" role="status">
        <span class="spin"></span> 审批状态：待安全保密管理员审批（本面板每 5 秒自动刷新， 批准后会提示，无需关闭重进）
      </p>
      <p v-else-if="ctrl.approval.value === 'approved'" class="gate-status ok" role="status"> ✓ 审批已通过，点击「领取令牌并下载」完成导出。 </p>
      <div v-if="ctrl.gateMsg.value" class="ok-msg"> ✓ {{ ctrl.gateMsg.value }}</div>
      <div v-if="ctrl.gateErr.value" class="err show"> ⚠ {{ ctrl.gateErr.value }}</div>
      <div class="gate-acts">
        <button class="g-btn" type="button" :disabled="ctrl.gateBusy.value" @click="ctrl.applyExportRequest()">
          {{ ctrl.requestId.value ? '重新申请' : '申请导出' }}
        </button>
        <button v-if="ctrl.requestId.value" class="g-btn primary" type="button" :disabled="ctrl.gateBusy.value" @click="ctrl.fetchTokenAndDownload()"> 领取令牌并下载 </button>
        <button class="g-btn ghost" type="button" @click="ctrl.closeGate()"> 关闭 </button>
      </div>
    </div>
  </div>
</template>
