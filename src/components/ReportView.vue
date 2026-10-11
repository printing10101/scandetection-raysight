<script setup>
// 检测报告视图——从 bundle __name:"ReportView"（10414–10997 行）重建。
// FilmViewer 的工作面子组件（不占路由）。职责：
// - 渲染与打印版式一致的报告首页预览、结论行、原始底片对比图；
// - 本地大模型评片结论（/report/{id}/narrative，180s 长超时，生成中/失败/重试态）；
// - need_review 时挂 ReviewPanel；处置区：PDF/A 导出（经受控导出门禁）、
//   档案查阅与新建任务（向上 emit）、数字签名校验、主动学习样本回流弹窗。
import { ref, computed } from 'vue';
import { usePdfGate } from '../composables/usePdfGate.js';
import {
  getReportNarrative,
  getReportDetections,
  exportActiveSamples,
  verifyReport,
} from '../api/endpoints.js';
import ResultBanner from './ResultBanner.vue';
import ReportNotices from './ReportNotices.vue';
import DispositionPanel from './DispositionPanel.vue';
import ReviewPanel from './ReviewPanel.vue';
import PdfGateModal from './PdfGateModal.vue';

// 缺陷类别表（bundle 7309 行）：id 即下标，与 ReviewPanel 同源。
const DEFECT_CLASSES = ['气孔', '夹渣', '未焊透', '未熔合', '裂纹', '咬边', '内凹'];

// 错误对象转用户可读文案（bundle 7095 行，原为模块级共享函数）。
function toErrorMessage(err) {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err.trim()) return err;
  return '操作失败，请重试；若持续出现请联系系统管理员查看服务日志。';
}

const props = defineProps(['result', 'sourceUrl', 'fileName']);
const emit = defineEmits(['archive', 'reset']);

// 受控导出门禁：openPdf 触发「直连下载 → 无令牌则弹门禁」流程，弹窗本体在模板末尾。
// gate 内的 ref 嵌在普通对象里，模板不自动解包，需显式 .value。
const gate = usePdfGate();

// ---- 本地大模型评片结论 ----
const narrative = ref(null);
const narrativeLoading = ref(false);
const narrativeError = ref(null);

async function generateNarrative() {
  if (narrativeLoading.value) return;
  narrativeLoading.value = true;
  narrativeError.value = null;
  try {
    narrative.value = await getReportNarrative(props.result.report_id);
  } catch (err) {
    narrativeError.value = toErrorMessage(err);
  } finally {
    narrativeLoading.value = false;
  }
}

/** 打开 PDF/A 归档报告；文件名优先「工件号_报告编号」，走门禁通道。 */
function openPdfReport() {
  const r = props.result;
  const displayName = r.workpiece_no ? `${r.workpiece_no}_${r.report_id}` : r.report_id;
  gate.openPdf(r.report_id, displayName);
}

// ---- 报告首页预览 ----
// 质量级别罗马数字展示：接口侧 I/II/III/IV，打印版式用 Ⅰ/Ⅱ/Ⅲ/Ⅳ。
const LEVEL_ROMAN = { I: 'Ⅰ', II: 'Ⅱ', III: 'Ⅲ', IV: 'Ⅳ' };
const LEVEL_TO_NUMBER = { I: 1, II: 2, III: 3, IV: 4, 'Ⅰ': 1, 'Ⅱ': 2, 'Ⅲ': 3, 'Ⅳ': 4 };

function metaField(key) {
  return props.result.report_meta?.[key] ?? '';
}

function toRomanLevel(level) {
  const normalized = (level ?? '').trim().toUpperCase();
  return LEVEL_ROMAN[normalized] ?? normalized;
}

function levelToNumber(level) {
  const normalized = (level ?? '').trim().toUpperCase();
  return LEVEL_TO_NUMBER[normalized] ?? null;
}

// 各级别（张）统计：本片级别对应格记 1，其余记「/」。
const gradeTally = computed(() => {
  const level = (props.result.joint_level ?? '').trim().toUpperCase();
  return {
    i: level === 'I' ? '1' : '/',
    ii: level === 'II' ? '1' : '/',
    iii: level === 'III' ? '1' : '/',
    iv: level === 'IV' ? '1' : '/',
    total: level ? '1' : '/',
  };
});

// 结论第 1 条：预筛 / 不可评片 / 对照合格级别判定 / 无级别，四类文案。
const conclusionLines = computed(() => {
  const r = props.result;
  if (r.grade_preliminary && r.joint_level) {
    return [
      `1、本片影像质量校验未通过（IQI/黑度不达标），不构成正式评定依据；AI 预筛级别为${toRomanLevel(r.joint_level)}级，仅供参考，不得作为验收结论，须由持证人依标准原文重新评定。`,
    ];
  }
  if (!r.evaluable) {
    return ['1、影像质量校验未通过（IQI/黑度不达标），本片不可评片，需人工复核处理。'];
  }
  const standard = r.standard_ref || '验收标准';
  if (r.joint_level) {
    const level = levelToNumber(r.joint_level);
    const acceptLevel = levelToNumber(metaField('accept_level'));
    if (level !== null && acceptLevel !== null) {
      const ok = level <= acceptLevel;
      return [
        `1、本工件（${r.workpiece_no || '—'}）焊缝质量经检测，依据${standard}评为${toRomanLevel(r.joint_level)}级，${ok ? '满足' : '未满足'}验收要求（合格级别${toRomanLevel(metaField('accept_level'))}级），结果${ok ? '合格' : '不合格'}。`,
      ];
    }
    // 合格级别无法解析时按惯例：Ⅱ 级及以下视为合格。
    const verdict = level !== null && level <= 2 ? '合格' : '不合格';
    return [
      `1、本工件（${r.workpiece_no || '—'}）焊缝质量经检测，依据${standard} 评为${toRomanLevel(r.joint_level)}级，结果${verdict}。`,
    ];
  }
  return ['1、本片暂无法自动评级（置信度不足或未标定），需人工评定。'];
});

// 签发/审核日期与印章日期：当天（打印当日手工签发）。
const todayText = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`;
});

// ---- 主动学习样本回流 ----
const learningModalOpen = ref(false);
const detectionsLoading = ref(false);
const detectionsError = ref(null);
const detectionsData = ref(null);
const samples = ref([]); // 每项含 checked（是否回流）与 override（人工改判，-1 = 维持原判）
const submittingSamples = ref(false);
const learnResult = ref(null);
const learnError = ref(null);

const checkedCount = computed(() => samples.value.filter((s) => s.checked).length);
const canSubmitSamples = computed(() => checkedCount.value > 0 && !submittingSamples.value);

async function openLearningModal() {
  learningModalOpen.value = true;
  detectionsLoading.value = true;
  detectionsError.value = null;
  learnResult.value = null;
  learnError.value = null;
  try {
    const data = await getReportDetections(props.result.report_id);
    detectionsData.value = data;
    samples.value = data.defects.map((d) => ({
      id: d.id,
      class_id: d.class_id,
      bbox: d.bbox,
      confidence: d.confidence,
      uncertainty: d.uncertainty,
      reviewed: d.reviewed,
      need_review: d.need_review,
      checked: true,
      override: -1,
    }));
  } catch (err) {
    detectionsError.value = toErrorMessage(err);
  } finally {
    detectionsLoading.value = false;
  }
}

async function confirmLearning() {
  if (!detectionsData.value || !canSubmitSamples.value) return;
  submittingSamples.value = true;
  learnError.value = null;
  const selected = samples.value.filter((s) => s.checked);
  try {
    learnResult.value = await exportActiveSamples({
      image_stem: detectionsData.value.image_stem,
      image_w: detectionsData.value.image_w,
      image_h: detectionsData.value.image_h,
      defects: selected.map((s) => ({
        id: s.id,
        class_id: s.override >= 0 ? s.override : s.class_id,
        bbox: s.bbox,
        confidence: s.confidence,
        uncertainty: s.uncertainty,
      })),
      class_overrides: {},
    });
  } catch (err) {
    learnError.value = toErrorMessage(err);
  } finally {
    submittingSamples.value = false;
  }
}

function closeLearningModal() {
  learningModalOpen.value = false;
}

// ---- 数字签名校验（§7.2）----
const verifyingSignature = ref(false);
const signatureResult = ref(null);
const signatureError = ref(null);

const signatureState = computed(() => {
  if (!signatureResult.value) return '';
  if (signatureResult.value.valid === true) return 'ok';
  if (signatureResult.value.valid === false) return 'bad';
  return 'na';
});

async function verifySignature() {
  verifyingSignature.value = true;
  signatureError.value = null;
  try {
    signatureResult.value = await verifyReport(props.result.report_id);
  } catch (err) {
    signatureError.value = toErrorMessage(err);
  } finally {
    verifyingSignature.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="title-zine" data-t="评片报告"> 射线检测报告 </h1>
    <div class="lede">
      报告编号 {{ result.report_id }} · 影像编号 {{ result.image_id }}
      <template v-if="result.standard_ref"> · {{ result.standard_ref }}</template>
    </div>

    <ResultBanner :result="result" />
    <ReportNotices :result="result" />
    <DispositionPanel :result="result" />

    <div class="section-h"><span class="no">报告</span>报告首页预览（与打印版式一致，空白栏以手工补填为准） </div>
    <div class="rt-wrap">
      <div class="rt-no"> NO:{{ result.report_id }}</div>
      <table class="rt">
        <tbody>
          <tr>
            <td class="lbl" colspan="3"> 委托单位 </td>
            <td colspan="7">{{ metaField("client_unit") }}</td>
            <td class="lbl" colspan="7"> 工程类别/检测时机 </td>
            <td colspan="4">{{ metaField("project_category") }}</td>
          </tr>
          <tr>
            <td class="lbl" colspan="3"> 工程名称 </td>
            <td colspan="7">{{ metaField("project_name") }}</td>
            <td class="lbl" colspan="7"> 检测地址 </td>
            <td colspan="4">{{ metaField("test_address") }}</td>
          </tr>
          <tr>
            <td class="sec" rowspan="3"> 工件概况 </td>
            <td class="lbl" colspan="3"> 工件名称 </td>
            <td colspan="3">{{ result.workpiece_no ?? "" }}</td>
            <td class="lbl" colspan="4"> 材　　质 </td>
            <td colspan="5">{{ metaField("material") }}</td>
            <td class="lbl" colspan="3"> 坡口形式 </td>
            <td colspan="2">{{ metaField("groove_type") }}</td>
          </tr>
          <tr>
            <td class="lbl" colspan="3"> 工件编号 </td>
            <td colspan="3">{{ metaField("part_no") }}</td>
            <td class="lbl" colspan="4"> 规　　格 </td>
            <td colspan="5"> — </td>
            <td class="lbl" colspan="3"> 表面状况 </td>
            <td colspan="2">{{ metaField("surface_status") }}</td>
          </tr>
          <tr>
            <td class="lbl" colspan="3"> 检测部位 </td>
            <td colspan="3"> 焊接接头 </td>
            <td class="lbl" colspan="4"> 焊接方式 </td>
            <td colspan="5">{{ metaField("weld_process") }}</td>
            <td class="lbl" colspan="3"> 热处理状态 </td>
            <td colspan="2">{{ metaField("heat_treatment") }}</td>
          </tr>
          <tr>
            <td class="sec" rowspan="3"> 技术要求 </td>
            <td class="lbl" colspan="3"> 验收标准 </td>
            <td colspan="3">{{ result.standard_ref ?? "" }}</td>
            <td class="lbl" colspan="4"> 检测标准 </td>
            <td colspan="5">{{ result.standard_ref ?? "" }}</td>
            <td class="lbl" colspan="3"> 检测比例 </td>
            <td colspan="2"> 100% </td>
          </tr>
          <tr>
            <td class="lbl" colspan="3"> 检测技术等级 </td>
            <td colspan="3">{{ metaField("tech_level") }}</td>
            <td class="lbl" colspan="4"> 合格级别 </td>
            <td colspan="5">{{ metaField("accept_level") }}</td>
            <td class="lbl" colspan="3"> 原始记录编号 </td>
            <td colspan="2">{{ metaField("record_no") }}</td>
          </tr>
          <tr>
            <td class="lbl" colspan="3"> 黑度范围 </td>
            <td colspan="3"> — </td>
            <td class="lbl" colspan="4"> 应识别丝号 </td>
            <td colspan="5"> — </td>
            <td class="lbl" colspan="3"> 散射线控制 </td>
            <td colspan="2">{{ metaField("scatter_control") }}</td>
          </tr>
          <tr>
            <td class="sec" rowspan="7"> 检测器材及工艺参数 </td>
            <td class="lbl" colspan="3"> 源种类 </td>
            <td colspan="3">{{ metaField("source_kind") }}</td>
            <td class="lbl" colspan="4"> 设备型号/编号 </td>
            <td colspan="5">{{ metaField("device_no") }}</td>
            <td class="lbl" colspan="3"> 焦点尺寸 </td>
            <td colspan="2">{{ metaField("focus_size") }}</td>
          </tr>
          <tr>
            <td class="lbl" colspan="3"> 胶片型号 </td>
            <td colspan="3">{{ metaField("film_model") }}</td>
            <td class="lbl" colspan="4"> 胶片规格 </td>
            <td colspan="5">{{ metaField("film_size") }}</td>
            <td class="lbl" colspan="3"> 胶片分类等级 </td>
            <td colspan="2">{{ metaField("film_class") }}</td>
          </tr>
          <tr>
            <td class="lbl" colspan="3"> 增感方式 </td>
            <td colspan="3">{{ metaField("screen_way") }}</td>
            <td class="lbl" colspan="4"> 像质计型号 </td>
            <td colspan="5"> — </td>
            <td class="lbl" colspan="3"> 像质计摆放 </td>
            <td colspan="2">{{ metaField("iqi_position") }}</td>
          </tr>
          <tr>
            <td class="lbl" colspan="3"> 前屏/后屏 </td>
            <td colspan="3">{{ metaField("screens") }}</td>
            <td class="lbl" colspan="4"> 透照方式 </td>
            <td colspan="5">{{ metaField("technique") }}</td>
            <td class="lbl" colspan="3"> 透照厚度 </td>
            <td colspan="2"> — </td>
          </tr>
          <tr>
            <td class="lbl" colspan="3"> F（焦距） </td>
            <td colspan="3">{{ metaField("focus_distance") }}</td>
            <td class="lbl" colspan="4"> f（源至工件） </td>
            <td colspan="5">{{ metaField("source_distance") }}</td>
            <td class="lbl" colspan="3"> 冲洗条件 </td>
            <td colspan="2">{{ metaField("develop_method") }}</td>
          </tr>
          <tr>
            <td class="lbl" colspan="3"> b（工件至胶片） </td>
            <td colspan="3">{{ metaField("film_distance") }}</td>
            <td class="lbl" colspan="4"> 管电压 </td>
            <td colspan="5">{{ metaField("tube_voltage") }}</td>
            <td class="lbl" colspan="3"> 显影液配方 </td>
            <td colspan="2">{{ metaField("developer") }}</td>
          </tr>
          <tr>
            <td class="lbl" colspan="3"> 管电流 </td>
            <td colspan="3">{{ metaField("tube_current") }}</td>
            <td class="lbl" colspan="4"> 曝光时间 </td>
            <td colspan="5">{{ metaField("exposure_time") }}</td>
            <td class="lbl" colspan="3"> 洗片温度 </td>
            <td colspan="2">{{ metaField("develop_temp") }}</td>
          </tr>
          <tr>
            <td class="sec" rowspan="3"> 检测情况 </td>
            <td class="lbl" colspan="3"> 焊缝总数 </td>
            <td colspan="3"> 1道 </td>
            <td class="sec2" rowspan="3"> 最终评定结果 </td>
            <td class="lbl" colspan="3" rowspan="2"> Ｉ级（张） </td>
            <td class="lbl" colspan="2" rowspan="2"> Ⅱ级（张） </td>
            <td class="lbl" rowspan="2"> Ⅲ级（张） </td>
            <td class="lbl" colspan="4" rowspan="2"> Ⅳ级（张） </td>
            <td class="lbl" rowspan="2"> 总计（张） </td>
            <td class="lbl" rowspan="2"> 返修数量（张） </td>
            <td class="lbl" rowspan="2"> 最高返修次数（次） </td>
          </tr>
          <tr>
            <td class="lbl" colspan="3"> 检测数量 </td>
            <td colspan="3"> 1道 </td>
          </tr>
          <tr>
            <td class="lbl" colspan="3"> 检测比例 </td>
            <td colspan="3"> 100% </td>
            <td colspan="3">{{ gradeTally.i }}</td>
            <td colspan="2">{{ gradeTally.ii }}</td>
            <td>{{ gradeTally.iii }}</td>
            <td colspan="4">{{ gradeTally.iv }}</td>
            <td>{{ gradeTally.total }}</td>
            <td> / </td>
            <td> / </td>
          </tr>
          <tr>
            <td class="concl" colspan="21">
              <div class="c-head"> 检测结论及说明： </div>
              <div v-for="line in conclusionLines" :key="line" class="c-line">{{ line }}</div>
              <div class="c-line"> 2、检测位置，返修部位，底片评定情况见射线检测位置示意图和底片评定表。 </div>
              <div class="c-line"> 3、缺陷代号 </div>
              <div class="c-line"> A裂纹、B未焊透、C未熔合、D圆形缺陷（气孔、夹渣、夹钨、夹铜等）、E条形缺陷、F内凹、G咬边 </div>
              <div class="c-line"> 4、本报告为AI辅助评定，级别须经责任工程师复核签核后方可采信。 </div>
            </td>
          </tr>
          <tr>
            <td class="lbl" colspan="2"> 检　测 </td>
            <td colspan="3">{{ result.signer ?? "" }}</td>
            <td class="lbl"> 资　格 </td>
            <td colspan="3"> — </td>
            <td class="lbl" colspan="3"> 日　期 </td>
            <td colspan="3">{{ todayText }}</td>
            <td class="seal" colspan="6" rowspan="2">
              <div class="seal-t"> 检测单位检测专用章 </div>
              <div class="seal-d"> 日期：{{ todayText }}</div>
            </td>
          </tr>
          <tr>
            <td class="lbl" colspan="2"> 审　核 </td>
            <td colspan="3"></td>
            <td class="lbl"> 资　格 </td>
            <td colspan="3"> — </td>
            <td class="lbl" colspan="3"> 日　期 </td>
            <td colspan="3">{{ todayText }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section-h"><span class="no">影像</span>送检原始底片（用户导入原图，未经标注） </div>
    <div class="compare">
      <div class="plate">
        <img v-if="sourceUrl" :src="sourceUrl" :alt="fileName ?? '导入影像'" />
        <span v-else class="ph">影像不可用</span>
        <div class="cap">{{ (fileName ?? "导入文件") + " · 未标注 " }}</div>
      </div>
      <div class="plate">
        <button
          type="button"
          class="plate-btn"
          :disabled="gate.gateBusy.value"
          style="display: block; width: 100%; border: 0; background: transparent; padding: 0; cursor: pointer; color: inherit; font-family: inherit"
          title="打开 PDF/A 归档报告（经受控导出通道）"
          @click="openPdfReport"
        >
          <span
            class="ph"
            style="display: grid; place-items: center; min-height: 160px; color: var(--accent); font-size: 11px"> 缺陷标注影像详见 PDF 报告 → </span>
          <div class="cap"> 打开 PDF/A 归档报告（含缺陷标注与检出明细） </div>
        </button>
      </div>
    </div>

    <div class="section-h"><span class="no">结果</span>本次评定结果 </div>
    <div class="kv">
      <div class="k"> 报告编号 </div>
      <div class="v">{{ result.report_id }}</div>
      <div class="k"> 影像编号 </div>
      <div class="v">{{ result.image_id }}</div>
      <div class="k"> 缺陷检出数 </div>
      <div class="v">{{ result.defect_count }} 处 </div>
      <div class="k"> 评片质量判定 </div>
      <div class="v">{{ result.evaluable ? "底片质量合格，可评定" : "不可评片（底片质量不满足评定要求）" }}</div>
      <div class="k"> 质量级别（综合评定） </div>
      <div class="v">
        {{ result.joint_level ?? "（待复核/未输出）" }}
        <span
          v-if="result.grade_preliminary"
          class="prelim-tag"
          title="底片质量未达标，该级别仅由算法预筛得出，不构成验收依据"
        >AI 预筛·非正式级别</span>
      </div>
    </div>

    <div class="section-h"><span class="no">AI</span>评片结论（本地大模型辅助撰述） </div>
    <div class="narr">
      <div v-if="narrativeLoading" class="narr-state"> 本地大模型生成中… </div>
      <template v-else-if="narrative">
        <p v-if="narrative.status === 'ok'" class="narr-text">{{ narrative.text }}</p>
        <p v-else class="narr-state"> AI 结论不可用：{{ narrative.reason }} </p>
        <div v-if="narrative.status === 'ok'" class="narr-meta">
          模型 {{ narrative.model || "—" }} · 生成耗时 {{ (narrative.elapsed_ms / 1000).toFixed(1) }}s
        </div>
        <p class="narr-disc">{{ narrative.disclaimer }}</p>
      </template>
      <template v-else>
        <p v-if="narrativeError" class="narr-state"> 生成失败：{{ narrativeError }} </p>
        <button class="act narr-btn" type="button" @click="generateNarrative">
          <div class="a">{{ narrativeError ? "重试生成评片结论" : "生成评片结论" }}</div>
          <div class="d"> 由本机部署的本地大模型把检测结果与门禁结论整理成可读结论（不参与评级） </div>
        </button>
      </template>
    </div>

    <div v-if="result.need_review" class="section-h"><span class="no">复核</span>人工复核（初评 / 复评 / 仲裁） </div>
    <ReviewPanel
      v-if="result.need_review"
      :image-id="result.image_id"
      :report-id="result.report_id"
    />

    <div class="section-h"><span class="no">处置</span>后续操作 </div>
    <div class="acts">
      <button class="act" type="button" @click="openPdfReport">
        <div class="a"> 导出 PDF/A 报告 </div>
        <div class="d"> 下载符合归档要求的检测报告（含缺陷标注、判定依据与检出明细） </div>
      </button>
      <button class="act" type="button" @click="emit('archive')">
        <div class="a"> 查阅检测档案 </div>
        <div class="d"> 在检测档案中查看该影像的归档记录与统计信息 </div>
      </button>
      <button class="act" type="button" @click="emit('reset')">
        <div class="a"> 新建评定任务 </div>
        <div class="d"> 返回底片导入步骤，提交下一份待检底片 </div>
      </button>
      <button class="act" type="button" :disabled="verifyingSignature" @click="verifySignature">
        <div class="a">{{ verifyingSignature ? "校验中…" : "校验报告数字签名" }}</div>
        <div class="d"> 比对报告内容指纹与签发记录，验证报告完整性与防篡改性（§7.2） </div>
      </button>
      <button
        class="act"
        type="button"
        :disabled="result.defect_count === 0"
        :title="result.defect_count === 0 ? '本片未检出缺陷，没有可回流的样本' : undefined"
        @click="openLearningModal"
      >
        <div class="a"> 样本回流（主动学习） </div>
        <div class="d">
          {{
            result.defect_count === 0
              ? "本片未检出缺陷，无可回流样本（该按钮不可用）"
              : "经人工复核确认的缺陷标注回流至主动学习训练样本库（§5.5 持续学习闭环）"
          }}
        </div>
      </button>
    </div>

    <!-- 主动学习样本回流弹窗 -->
    <div v-if="learningModalOpen" class="modal-mask" @click.self="closeLearningModal">
      <div class="modal" role="dialog" aria-modal="true" aria-label="主动学习样本回流">
        <h3 class="m-title"> 主动学习样本回流 · 人工确认 </h3>
        <p v-if="detectionsLoading" class="hint"> 正在载入缺陷检出明细… </p>
        <p v-else-if="detectionsError" class="err show"> ⚠ 载入失败：{{ detectionsError }} </p>
        <template v-else-if="detectionsData">
          <p class="stat">
            影像 <b>{{ detectionsData.image_stem }}</b> · {{ detectionsData.image_w }}×{{ detectionsData.image_h }}px · 共检出 {{ detectionsData.defects.length }} 处缺陷。请勾选需回流的样本，必要时对类别进行人工改判后确认。
          </p>
          <table class="exp">
            <thead>
              <tr>
                <th>回流</th>
                <th>检出类别</th>
                <th>人工改判</th>
                <th>置信度</th>
                <th>不确定度</th>
                <th>复核状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sample in samples" :key="sample.id">
                <td><input v-model="sample.checked" type="checkbox" /></td>
                <td>
                  {{ DEFECT_CLASSES[sample.class_id] }}
                  <span class="cid">({{ sample.class_id }})</span>
                </td>
                <td>
                  <select v-model.number="sample.override" class="ov">
                    <option :value="-1"> 维持原判（{{ DEFECT_CLASSES[sample.class_id] }}） </option>
                    <option v-for="(name, id) in DEFECT_CLASSES" :key="id" :value="id">{{ name }}</option>
                  </select>
                </td>
                <td>{{ (sample.confidence * 100).toFixed(0) }}%</td>
                <td><span :class="sample.uncertainty >= 0.5 ? 'warn' : ''">{{ (sample.uncertainty * 100).toFixed(0) }}%</span></td>
                <td>
                  <span v-if="sample.need_review" class="need">待复核</span>
                  <span v-else-if="sample.reviewed" class="ok">已复核</span>
                  <span v-else>—</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="m-actions">
            <button
              class="btn primary"
              type="button"
              :disabled="!canSubmitSamples"
              @click="confirmLearning"
            >
              {{ submittingSamples ? "回流中…" : `确认回流（${checkedCount} 项）` }}
            </button>
            <button class="btn ghost" type="button" @click="closeLearningModal"> 关闭 </button>
          </div>
          <p class="threshold-legend"> 判读口径：不确定度 ≥ <b>50%</b> 的检出（橙色）表示模型对该判定把握较低， 建议优先人工复核后再回流；置信度为该缺陷框的检出把握，仅作参考，不构成级别结论。 </p>
          <div v-if="learnResult" class="ok-msg"> ✓ 已回流至主动学习训练样本库，当前共 <b>{{ learnResult.total_in_pool }}</b> 个样本（数据集版本指纹 <code>{{ learnResult.fingerprint ?? "—" }}</code>） </div>
          <div v-if="learnError" class="err show"> ⚠ 回流失败：{{ learnError }} </div>
        </template>
      </div>
    </div>

    <div v-if="signatureResult" class="sig-state" :class="signatureState">
      <template v-if="signatureResult.valid === true"> ✓ 数字签名校验通过（签发者：{{ signatureResult.signer ?? "—" }}） </template>
      <template v-else-if="signatureResult.valid === false"> ⚠ 数字签名无效或报告内容已被篡改（{{ signatureResult.reason ?? "内容指纹不匹配" }}） </template>
      <template v-else> — 本报告未附数字签名（{{ signatureResult.reason ?? "无签发记录" }}） </template>
    </div>
    <div v-if="signatureError" class="err show"> ⚠ 签名校验请求失败：{{ signatureError }} </div>

    <div class="sig">
      评片人签署：____________　声明：本报告由系统自动生成，仅供质量追溯参考；状态为「待人工复核」或「不可评片」时，不作为正式评片结论依据。
    </div>

    <PdfGateModal :ctrl="gate" />
  </div>
</template>
