<script setup>
// 人工复核面板（初评 / 复评 / 仲裁）——从 bundle __name:"ReviewPanel"（9808–10081 行）重建。
// 职责：提交复核结论（POST /review，返回对评一致性/κ/最终级别）；
// 展开缺陷管理区对检出缺陷补录 / 改判 / 删除（删除经 ConfirmDialog 确认），
// 所有变更理由审计必填，变更后重拉检出明细展示系统重新评级结果。
import { ref, watch } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import {
  submitReview,
  submitReviewDefects,
  patchReviewDefect,
  deleteReviewDefect,
  getReportDetections,
} from '../api/endpoints.js';
import ConfirmDialog from './ConfirmDialog.vue';

// 缺陷类别表（bundle 7309 行）：类别 id 即数组下标，ReportView 的样本回流同用此表。
const DEFECT_CLASSES = ['气孔', '夹渣', '未焊透', '未熔合', '裂纹', '咬边', '内凹'];

// 错误对象转用户可读文案（bundle 7095 行，原为模块级共享函数）。
function toErrorMessage(err) {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err.trim()) return err;
  return '操作失败，请重试；若持续出现请联系系统管理员查看服务日志。';
}

const props = defineProps(['imageId', 'reportId']);

const auth = useAuthStore();

// 复核记录归属当前登录账号：只读展示，登录态变化时跟随刷新（三员分岗防冒名）。
const reviewerName = ref(auth.username || '');
watch(
  () => auth.username,
  (name) => {
    if (name) reviewerName.value = name;
  },
);

const reviewRole = ref('initial'); // initial 初评 / secondary 复评 / arbitrator 仲裁
const qualityLevel = ref(''); // 复核质量级别，空串 = 不指定
const reviewNote = ref('');

const submitting = ref(false);
const reviewResult = ref(null); // POST /review 返回：consensus / kappa / joint_level 等
const reviewError = ref(null);

// ---- 缺陷管理（补录 / 改判 / 删除）----
const manageOpen = ref(false);
const defects = ref([]);
const mutating = ref(false); // 任一缺陷写操作进行中
const successMessage = ref(null);
const errorMessage = ref(null);
const changeReason = ref(''); // 变更理由，审计必填
const newClassId = ref(0);
const newBboxText = ref('');
const defectToDelete = ref(null); // 非 null 时弹出删除确认

const defectTypes = DEFECT_CLASSES.map((name, id) => ({ id, name }));

async function toggleManage() {
  manageOpen.value = !manageOpen.value;
  if (manageOpen.value && props.reportId) await refreshDefects();
}

async function refreshDefects() {
  if (!props.reportId) return;
  errorMessage.value = null;
  try {
    const data = await getReportDetections(props.reportId);
    defects.value = data.defects.map((d) => ({
      id: String(d.id),
      class_id: Number(d.class_id),
      bbox_px: d.bbox ?? [],
      source: d.source ?? null,
    }));
  } catch (err) {
    errorMessage.value = toErrorMessage(err);
  }
}

/** 变更理由审计必填；未填时置错误提示并返回 null（写操作统一走此闸）。 */
function requireAuditReason() {
  const reason = changeReason.value.trim();
  if (!reason) {
    errorMessage.value = '请先填写变更理由（审计必填）。';
    return null;
  }
  return reason;
}

async function addDefect() {
  const reason = requireAuditReason();
  if (reason === null) return;
  // 坐标串按逗号/空白拆分，如「120,30,20,20」（正则与原实现逐字一致）。
  const bboxPx = newBboxText.value.split(/[,,\s]+/).filter(Boolean).map(Number);
  if (bboxPx.length !== 4 || bboxPx.some((n) => !Number.isFinite(n) || n < 0)) {
    errorMessage.value = '检出框坐标格式应为 x,y,w,h（非负数字）。';
    return;
  }
  mutating.value = true;
  errorMessage.value = null;
  try {
    const res = await submitReviewDefects(props.imageId, {
      class_id: newClassId.value,
      bbox_px: bboxPx,
      reason,
    });
    successMessage.value = `已补录缺陷，综合评定级别 ${res.joint_level ?? '待人工评定'}（缺陷检出 ${res.defect_count} 处）`;
    await refreshDefects();
  } catch (err) {
    errorMessage.value = toErrorMessage(err);
  } finally {
    mutating.value = false;
  }
}

async function changeDefectClass(defect, nextClassId) {
  const reason = requireAuditReason();
  if (reason === null) return;
  mutating.value = true;
  errorMessage.value = null;
  try {
    const res = await patchReviewDefect(defect.id, { class_id: nextClassId, reason });
    successMessage.value = `已改判缺陷类别，综合评定级别 ${res.joint_level ?? '待人工评定'}`;
    await refreshDefects();
  } catch (err) {
    errorMessage.value = toErrorMessage(err);
  } finally {
    mutating.value = false;
  }
}

function requestDeleteDefect(defect) {
  defectToDelete.value = defect;
}

async function confirmDeleteDefect() {
  const target = defectToDelete.value;
  defectToDelete.value = null;
  if (!target) return;
  const reason = requireAuditReason();
  if (reason === null) return;
  mutating.value = true;
  errorMessage.value = null;
  try {
    const res = await deleteReviewDefect(target.id, reason);
    successMessage.value = `已删除缺陷记录，综合评定级别 ${res.joint_level ?? '待人工评定'}（缺陷检出 ${res.defect_count} 处）`;
    await refreshDefects();
  } catch (err) {
    errorMessage.value = toErrorMessage(err);
  } finally {
    mutating.value = false;
  }
}

async function submitReviewConclusion() {
  reviewError.value = null;
  reviewResult.value = null;
  if (!reviewerName.value.trim()) {
    reviewError.value = '评片人员姓名/工号不能为空。';
    return;
  }
  submitting.value = true;
  try {
    reviewResult.value = await submitReview({
      image_id: props.imageId,
      reviewer: reviewerName.value.trim(),
      role: reviewRole.value,
      overall_level: qualityLevel.value || null,
      note: reviewNote.value.trim() || null,
    });
  } catch (err) {
    reviewError.value = toErrorMessage(err);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="track" style="margin-top: 12px">
    <div class="stage-row">
      <span class="idx">·</span>
      <span class="nm" style="color: var(--amber)">人工复核（初评 / 复评 / 仲裁）</span>
      <span class="st" style="color: var(--amber)">待人工复核</span>
    </div>
    <div style="padding: 14px 16px">
      <div class="row">
        <div class="field grow" style="margin-top: 0">
          <label for="rv">评片人员（当前登录账号）<span class="req">*</span></label>
          <input
            id="rv"
            v-model="reviewerName"
            readonly
            title="复核记录归属当前登录账号（三员分岗防冒名）"
          />
        </div>
        <div class="field grow" style="margin-top: 0">
          <label for="rr">复核角色</label>
          <select id="rr" v-model="reviewRole">
            <option value="initial"> 初评 </option>
            <option value="secondary"> 复评 </option>
            <option value="arbitrator"> 仲裁 </option>
          </select>
        </div>
        <div class="field grow" style="margin-top: 0">
          <label for="rl">复核质量级别（选填）</label>
          <select id="rl" v-model="qualityLevel">
            <option value=""> 不指定 </option>
            <option value="I"> I 级 </option>
            <option value="II"> II 级 </option>
            <option value="III"> III 级 </option>
            <option value="IV"> IV 级 </option>
          </select>
        </div>
      </div>
      <div class="field">
        <label for="rn">复核意见（选填）</label>
        <input id="rn" v-model="reviewNote" style="max-width: 100%" />
      </div>
      <button class="btn" type="button" :disabled="submitting" @click="submitReviewConclusion">
        {{ submitting ? "提交中…" : "提交复核结论" }}
      </button>

      <div class="section-h"> 缺陷管理（增删改后系统自动重新评级） </div>
      <button class="btn" type="button" @click="toggleManage">
        {{ (manageOpen ? "收起" : "展开") + "缺陷管理 " }}
      </button>
      <div v-if="manageOpen" style="margin-top: 10px">
        <div class="field">
          <label for="dfr">变更理由（审计必填）<span class="req">*</span></label>
          <input
            id="dfr"
            v-model="changeReason"
            placeholder="如：复核确认为裂纹 / 补录漏检气孔 / 判定为伪影像"
          />
        </div>
        <table v-if="defects.length" class="dtable">
          <thead>
            <tr>
              <th>缺陷类型</th>
              <th>检出框 [x,y,w,h]</th>
              <th>来源</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="defect in defects" :key="defect.id">
              <td>
                <select
                  :value="defect.class_id"
                  :disabled="mutating"
                  @change="changeDefectClass(defect, Number($event.target.value))"
                >
                  <option v-for="t in defectTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
              </td>
              <td>{{ defect.bbox_px.map((v) => Math.round(v)).join(", ") }}</td>
              <td>{{ defect.source === "manual" ? "人工补录" : "系统检出" }}</td>
              <td>
                <button
                  class="btn danger"
                  type="button"
                  :disabled="mutating"
                  @click="requestDeleteDefect(defect)"> 删除 </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="lede"> 该影像暂无缺陷检出记录。 </div>
        <div class="row">
          <div class="field">
            <label for="dfc">新增缺陷类型</label>
            <select id="dfc" v-model.number="newClassId">
              <option v-for="t in defectTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="field grow">
            <label for="dfb">检出框坐标 x,y,w,h（像素）</label>
            <input id="dfb" v-model="newBboxText" placeholder="如 120,30,20,20" />
          </div>
          <button class="btn" type="button" :disabled="mutating" @click="addDefect"> 补录缺陷 </button>
        </div>
        <div v-if="successMessage" class="ok show">{{ successMessage }}</div>
        <div v-if="errorMessage" class="err show">{{ errorMessage }}</div>
      </div>

      <div v-if="reviewError" class="err show" style="margin-top: 10px"> ⚠ {{ reviewError }} </div>
      <div v-if="reviewResult" class="kv" style="margin-top: 16px">
        <div class="k"> 对评一致性 </div>
        <div class="v">{{ reviewResult.consensus ? "已达成" : "未达成" }}</div>
        <div class="k"> 一致性系数 κ </div>
        <div class="v">{{ reviewResult.kappa.toFixed(3) }}</div>
        <div class="k"> 复核阶段 </div>
        <div class="v">{{ reviewResult.stage }}</div>
        <div class="k"> 最终质量级别 </div>
        <div class="v">{{ reviewResult.joint_level ?? "—" }}</div>
        <div class="k"> 是否需仲裁 </div>
        <div class="v">{{ reviewResult.needs_arbitration ? "是" : "否" }}</div>
        <div class="k"> 累计复核次数 </div>
        <div class="v">{{ reviewResult.review_count }}</div>
        <div v-if="!reviewResult.training_pool_synced" class="err show" style="margin-top: 10px"> ⚠ 训练池自动回流失败：本次人工确认的缺陷未能进入训练样本库（详见服务端日志），需管理员手动补录 </div>
      </div>
    </div>
  </div>
  <ConfirmDialog
    :open="defectToDelete !== null"
    title="删除缺陷确认"
    message="删除该缺陷记录后将触发重新评级并重新签发报告；本操作记入审计链，不可撤销。确认删除？"
    confirm-text="删除"
    danger
    @confirm="confirmDeleteDefect"
    @cancel="defectToDelete = null"
  />
</template>
