<script setup>
// 单幅评定上传面板——从 bundle 的 __name:"UploadPanel" 区块还原（9331–9543 行）。
// 选文件（点击/拖拽/菜单"打开文件"）→ 预览 → 工艺参数录入 → 组装 FormData 上抛。
// 上传本身不在这里做：submit 事件把 FormData 交给父级（单幅评定控制器）。
import { ref, computed, watch, nextTick, onUnmounted } from 'vue';
import { useWorkspaceStore } from '../stores/workspace.js';
import { ALLOWED_IMAGE_EXTENSIONS, IMAGE_ACCEPT, isPreviewableImage } from '../utils/mediaFormats.js';

const emit = defineEmits(['fileChanged', 'submit']);

// 单文件大小上限：50MB
const MAX_FILE_BYTES = 50 * 1024 * 1024;

// 《射线检测报告》首页汇总表分区（bundle 7310–7442 行，逐字保留）。
// ph 为输入框占位提示；仅非空项会进 report_meta。
const REPORT_META_GROUPS = [
  {
    title: '工程信息',
    fields: [
      { key: 'client_unit', label: '委托单位' },
      { key: 'project_name', label: '工程名称' },
      { key: 'project_category', label: '工程类别/检测时机', ph: '如 锅炉安装/焊后' },
      { key: 'test_address', label: '检测地址', ph: '如 施工现场' },
    ],
  },
  {
    title: '工件概况',
    fields: [
      { key: 'material', label: '材质', ph: '如 20G' },
      { key: 'part_no', label: '工件编号' },
      { key: 'groove_type', label: '坡口形式', ph: '如 V' },
      { key: 'surface_status', label: '表面状况', ph: '如 符合要求' },
      { key: 'weld_process', label: '焊接方式', ph: '如 GTAW' },
      { key: 'heat_treatment', label: '热处理状态' },
    ],
  },
  {
    title: '技术要求',
    fields: [
      { key: 'tech_level', label: '检测技术等级', ph: 'A / AB / B' },
      { key: 'accept_level', label: '合格级别（验收要求）', ph: 'Ⅰ / Ⅱ / Ⅲ / Ⅳ' },
      { key: 'record_no', label: '原始记录编号' },
      { key: 'scatter_control', label: '散射线控制' },
    ],
  },
  {
    title: '检测器材及工艺参数',
    fields: [
      { key: 'source_kind', label: '源种类', ph: 'X射线 / γ源' },
      { key: 'device_no', label: '设备型号/编号' },
      { key: 'focus_size', label: '焦点尺寸', ph: '如 2.0×2.0mm' },
      { key: 'film_model', label: '胶片型号' },
      { key: 'film_size', label: '胶片规格', ph: '如 180×80mm' },
      { key: 'film_class', label: '胶片分类等级', ph: '如 C5' },
      { key: 'screen_way', label: '增感方式', ph: '如 Pb' },
      { key: 'iqi_position', label: '像质计摆放', ph: '源侧 / 胶片侧' },
      { key: 'screens', label: '前屏/后屏', ph: '如 0.03/0.03mm' },
      { key: 'technique', label: '透照方式', ph: '如 双壁双影' },
      { key: 'focus_distance', label: 'F（焦距）' },
      { key: 'source_distance', label: 'f（源至工件）' },
      { key: 'film_distance', label: 'b（工件至胶片）' },
      { key: 'tube_voltage', label: '管电压', ph: '如 190kV' },
      { key: 'tube_current', label: '管电流', ph: '如 5mA' },
      { key: 'exposure_time', label: '曝光时间', ph: '如 1.5min' },
      { key: 'develop_method', label: '冲洗条件', ph: '手工 / 自动' },
      { key: 'developer', label: '显影液配方' },
      { key: 'develop_temp', label: '洗片温度', ph: '如 22℃' },
    ],
  },
];

const file = ref(null);
const objectUrl = ref(null);
const fileError = ref(null);
const submitError = ref(null);
const spacing = ref('0.1000');
const thickness = ref('');
const workpieceName = ref('');
const weldNo = ref('');
const allowPreliminary = ref(true);
const metaExpanded = ref(false);
const metaValues = ref({});
const filledMetaCount = computed(() => Object.values(metaValues.value).filter((v) => v.trim()).length);

function toggleMeta() {
  metaExpanded.value = !metaExpanded.value;
}

const previewable = computed(() => !!file.value && isPreviewableImage(file.value.name));
const fileExt = computed(() => ((file.value?.name.split('.').pop()) ?? '?').toUpperCase());
const previewFailed = ref(false);

// 导入一个文件：格式/大小校验通过后建预览 URL 并通知父级。
function acceptFile(candidate) {
  const ext = (candidate.name.split('.').pop() ?? '').toLowerCase() ?? '';
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    fileError.value = `不支持的格式${ext ? ` .${ext}` : ''}：请提供 DICOM(.dcm) 或常见图像格式（JPG/PNG/BMP/GIF/WebP/TIFF/HEIC 等）。`;
    return;
  }
  if (candidate.size > MAX_FILE_BYTES) {
    fileError.value = `文件 ${(candidate.size / 1024 / 1024).toFixed(1)}MB 超过 50MB 上限，请压缩后重新导入。`;
    return;
  }
  fileError.value = null;
  previewFailed.value = false;
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value);
  file.value = candidate;
  objectUrl.value = URL.createObjectURL(candidate);
  emit('fileChanged', candidate);
}

function onDrop(e) {
  e.preventDefault();
  const dropped = e.dataTransfer?.files?.[0];
  if (dropped) acceptFile(dropped);
}

function pickFile() {
  inputEl.value?.click();
}

function onInputChange(e) {
  const picked = e.target.files?.[0];
  if (picked) acceptFile(picked);
  e.target.value = '';
}

const inputEl = ref(null);

// 菜单栏"打开影像"（Ctrl+O）：workspace 发请求，这里弹出选择框。
const workspace = useWorkspaceStore();
watch(
  () => workspace.pendingFileOpen,
  (target) => {
    if (target === 'image') {
      workspace.pendingFileOpen = null;
      nextTick(() => inputEl.value?.click());
    }
  },
  { immediate: true },
);

// 组装提交：厚度必填；report_meta 仅收非空项。
function submit() {
  submitError.value = null;
  if (!file.value) {
    fileError.value = '请先导入射线底片影像。';
    return;
  }
  if (!thickness.value.trim()) {
    submitError.value = '母材公称厚度 T 为必填项（分级评定依据）；缺省时级别评定将被锁定。';
    return;
  }
  const formData = new FormData();
  formData.append('image', file.value);
  formData.append('pixel_spacing_mm', spacing.value || '');
  formData.append('base_metal_thickness_mm', thickness.value.trim());
  if (workpieceName.value.trim()) formData.append('workpiece_no', workpieceName.value.trim());
  if (weldNo.value.trim()) formData.append('weld_no', weldNo.value.trim());
  formData.append('allow_preliminary_grade', allowPreliminary.value ? 'true' : 'false');
  const reportMeta = {};
  for (const group of REPORT_META_GROUPS) {
    for (const field of group.fields) {
      const value = (metaValues.value[field.key] ?? '').trim();
      if (value) reportMeta[field.key] = value;
    }
  }
  if (Object.keys(reportMeta).length > 0) formData.append('report_meta', JSON.stringify(reportMeta));
  emit('submit', formData);
}

const fileSummary = computed(() => {
  if (!file.value) return '';
  const kb = (file.value.size / 1024).toFixed(0);
  return `${file.value.name} · ${kb} KB`;
});

function revokeObjectUrl() {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = null;
  }
}

// 供父级（评定完成后回上传页）整面板重置。
function reset() {
  revokeObjectUrl();
  file.value = null;
  fileError.value = null;
  submitError.value = null;
  previewFailed.value = false;
  spacing.value = '0.1000';
  thickness.value = '';
  workpieceName.value = '';
  weldNo.value = '';
  metaValues.value = {};
  metaExpanded.value = false;
  emit('fileChanged', null);
}

onUnmounted(revokeObjectUrl);
defineExpose({ reset });
</script>

<template>
  <div>
    <div class="guide">
      <div class="g">
        <div class="n"> 一 · 底片导入 </div>
        <div class="t"> 拖入或选择射线底片。支持 DICOM(.dcm) 及常见图像格式（JPG/PNG/BMP/GIF/WebP/TIFF/HEIC 等）。 </div>
      </div>
      <div class="g">
        <div class="n"> 二 · 工艺参数录入 </div>
        <div class="t"> 空间像素标定有默认值；母材公称厚度 T 为分级评定必备参数。可展开填写《射线检测报告》汇总表补充信息。 </div>
      </div>
      <div class="g">
        <div class="n"> 三 · 评定报告 </div>
        <div class="t"> 提交后由本地推理流水线评定（约 15–30 秒），输出《射线检测报告》与底片评定表。 </div>
      </div>
    </div>
    <div class="row">
      <div class="grow">
        <div class="chips">
          <span class="chip on">DICOM .dcm</span>
          <span class="chip on">JPG/PNG/BMP</span>
          <span class="chip on">TIFF/GIF/WebP</span>
          <span class="chip on">HEIC/AVIF</span>
        </div>
        <div class="hint"> 常见图像与 DICOM 均可导入，系统自动转换为灰度影像处理。单文件 ≤ 50MB。 </div>
        <div
          class="drop"
          role="button"
          tabindex="0"
          aria-label="拖入或选择射线底片"
          @click="pickFile"
          @keydown.enter.prevent="pickFile"
          @keydown.space.prevent="pickFile"
          @dragover.prevent
          @drop="onDrop"
        >
          <div class="big"> 拖入射线底片至此处，或点击选择文件 </div>
          <div class="hint"> 影像全程本机处理，不经任何外部网络传输 </div>
        </div>
        <input
          ref="inputEl"
          type="file"
          :accept="IMAGE_ACCEPT"
          style="display: none"
          @change="onInputChange"
        />
        <div v-if="file" class="preview show">
          <span
            v-if="previewable && previewFailed"
            class="thumb noimg"
            title="预览解码失败：文件可能损坏或扩展名与实际格式不符；仍可尝试提交评定"
          >预览失败</span>
          <img
            v-else-if="previewable"
            :src="objectUrl ?? undefined"
            alt="影像预览"
            class="thumb"
            @error="previewFailed = true"
          />
          <span
            v-else
            class="thumb noimg"
            title="该格式由后端转档处理，本机不做预览；可正常提交评定"
          >{{ fileExt }}</span>
          <div class="meta">{{ fileSummary }}</div>
          <div v-if="!previewable || previewFailed" class="hint"> 该格式本机不做缩略图预览（不影响评定）；评定结果页可查看完整报告。 </div>
        </div>
        <div v-if="fileError" class="err show"> ⚠ {{ fileError }}</div>
      </div>
      <div class="grow">
        <div class="field">
          <label for="spacing">空间像素标定（mm/px）</label>
          <input id="spacing" v-model="spacing" />
          <div class="why"> 默认 0.1000 mm/px；底片带影像标尺时可覆盖。用于将像素尺寸换算为缺陷实际当量。 </div>
        </div>
        <div class="field">
          <label for="thick">母材公称厚度 T（mm）<span class="req">*</span></label>
          <input id="thick" v-model="thickness" placeholder="如 20" />
          <div class="why"> 分级评定必备（NB/T 47013.2 依 T 划定评定区与各级限值）。 </div>
          <div v-if="submitError" class="err show"> ⚠ {{ submitError }}</div>
        </div>
        <div class="field">
          <label for="wp">工件名称（选填）</label>
          <input id="wp" v-model="workpieceName" placeholder="如 前水冷壁" />
        </div>
        <div class="field">
          <label for="wn">焊缝/管口编号（选填）</label>
          <input id="wn" v-model="weldNo" placeholder="如 QSB" />
        </div>
        <div class="field">
          <label class="check" for="prelim">
            <input id="prelim" v-model="allowPreliminary" type="checkbox" />
            <span> 底片质量不达标时仍输出 AI 预筛级别 <em>级别会标注为「AI 预筛·非正式级别」，仅供参考，不得作为验收结论；取消勾选则不合格底片不输出级别。</em></span>
          </label>
        </div>
        <button class="btn" type="button" :disabled="!file" @click="submit"> 提交评定 → </button>
      </div>
    </div>
    <div class="section-h">
      <span class="no">报告</span>《射线检测报告》补充信息（选填）
    </div>
    <div class="hint"> 按正式报告首页汇总表分区录入，出片时自动填入对应栏位；留空栏打印后可手工补填。 </div>
    <div class="meta-head">
      <button class="btn link" type="button" @click="toggleMeta">
        {{ metaExpanded ? '▾ 收起补充信息' : '▸ 展开补充信息' }}
        <template v-if="filledMetaCount > 0"> 　· 已填 {{ filledMetaCount }} 项 </template>
      </button>
    </div>
    <div v-if="metaExpanded" class="fgroups">
      <fieldset v-for="group in REPORT_META_GROUPS" :key="group.title" class="fset">
        <legend>{{ group.title }}</legend>
        <div class="fgrid">
          <div v-for="field in group.fields" :key="field.key" class="fitem">
            <label :for="`meta-${field.key}`">{{ field.label }}</label>
            <input
              :id="`meta-${field.key}`"
              v-model="metaValues[field.key]"
              :placeholder="field.ph ?? ''"
            />
          </div>
        </div>
      </fieldset>
    </div>
  </div>
</template>
