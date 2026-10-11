<script setup>
// 设备标定视图——从 bundle 的 __name:"DeviceView" 区块还原（8947–9235 行）。
// 左栏设备台账 + 设备登记；右栏选中设备的标定值录入与标定档案。
// 标定人员锁定为当前登录账号（三员分岗防冒名）；相对偏差 ≤5% 判达标，超差标「over」。
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { listDevices, createDevice, getDevice, addCalibration } from '../api/endpoints.js';
import { errToMessage } from '../utils/helpers.js';

const auth = useAuthStore();

const devices = ref([]);
const selectedDeviceId = ref(null);
const deviceDetail = ref(null);
const okMessage = ref(null);
const errorMessage = ref(null);

// 设备登记表单
const formName = ref('');
const formModel = ref('');
const formSerial = ref('');
const formNotes = ref('');

// 标定值表单：标定人员默认当前登录账号，登录态变化时跟随回填
const calibrator = ref(auth.username || '');
watch(
  () => auth.username,
  (name) => {
    if (name) calibrator.value = name;
  },
);
const pixelSpacing = ref('');
const referenceSpacing = ref('');
const densityValue = ref('');
const calNotes = ref('');

async function loadDevices() {
  try {
    devices.value = await listDevices();
  } catch (err) {
    errorMessage.value = errToMessage(err);
  }
}

async function selectDevice(deviceId) {
  selectedDeviceId.value = deviceId;
  errorMessage.value = null;
  okMessage.value = null;
  try {
    deviceDetail.value = await getDevice(deviceId);
  } catch (err) {
    deviceDetail.value = null;
    errorMessage.value = errToMessage(err);
  }
}

async function registerDevice() {
  errorMessage.value = null;
  okMessage.value = null;
  if (!formName.value.trim()) {
    errorMessage.value = '设备名称必填。';
    return;
  }
  try {
    const created = await createDevice({
      name: formName.value.trim(),
      model: formModel.value.trim() || null,
      serial_no: formSerial.value.trim() || null,
      notes: formNotes.value.trim() || null,
    });
    formName.value = '';
    formModel.value = '';
    formSerial.value = '';
    formNotes.value = '';
    await loadDevices();
    await selectDevice(created.device_id);
  } catch (err) {
    errorMessage.value = errToMessage(err);
  }
}

async function saveCalibration() {
  errorMessage.value = null;
  okMessage.value = null;
  if (!selectedDeviceId.value) return;
  if (!calibrator.value.trim()) {
    errorMessage.value = '标定人员不能为空。';
    return;
  }
  const spacing = Number(pixelSpacing.value);
  if (!Number.isFinite(spacing) || spacing <= 0) {
    errorMessage.value = '实测像素标定值必须为正数。';
    return;
  }
  const refSpacing = referenceSpacing.value.trim() ? Number(referenceSpacing.value) : null;
  if (refSpacing !== null && (!Number.isFinite(refSpacing) || refSpacing <= 0)) {
    errorMessage.value = '标定件参考值必须为正数。';
    return;
  }
  const density = densityValue.value.trim() ? Number(densityValue.value) : null;
  if (density !== null && !Number.isFinite(density)) {
    errorMessage.value = '黑度校验值必须为数字。';
    return;
  }
  try {
    await addCalibration(selectedDeviceId.value, {
      calibrator: calibrator.value.trim(),
      pixel_spacing_mm: spacing,
      ref_pixel_spacing_mm: refSpacing,
      density_ref: density,
      notes: calNotes.value.trim() || null,
    });
    calibrator.value = '';
    pixelSpacing.value = '';
    referenceSpacing.value = '';
    densityValue.value = '';
    calNotes.value = '';
    await selectDevice(selectedDeviceId.value);
    await loadDevices();
    okMessage.value = '标定记录已保存。';
  } catch (err) {
    errorMessage.value = errToMessage(err);
  }
}

const lastCalibration = computed(() => deviceDetail.value?.last_calibration ?? null);

onMounted(() => {
  loadDevices();
});
</script>

<template>
  <div>
    <h1 class="title-zine" data-t="设备标定"> 设备标定 </h1>
    <div class="lede"> 检测设备台账与空间像素标定管理，支持跨设备一致性核查（相对偏差 ≤ 5% 判定达标） </div>
    <div class="guide">
      <div class="g">
        <div class="n"> 一 · 设备登记 </div>
        <div class="t"> 登记检测设备信息（名称/型号/出厂编号），作为标定档案主体。 </div>
      </div>
      <div class="g">
        <div class="n"> 二 · 标定值录入 </div>
        <div class="t"> 实测像素标定与标定件参考值比对，系统自动计算相对偏差：≤5% 判定达标，超差标记「over」。 </div>
      </div>
      <div class="g">
        <div class="n"> 三 · 一致性档案 </div>
        <div class="t"> 每次标定均留档（标定人员/时间/偏差），批量筛查前可核对设备状态。 </div>
      </div>
    </div>

    <div v-if="errorMessage" class="err show"> ⚠ {{ errorMessage }}</div>
    <div v-if="okMessage" class="ok show">{{ okMessage }}</div>

    <div class="row">
      <div class="grow">
        <div class="section-h"> 设备台账 </div>
        <div class="dev-list">
          <button
            v-for="device in devices"
            :key="device.device_id"
            type="button"
            class="dev-row"
            :class="{ cur: device.device_id === selectedDeviceId }"
            @click="selectDevice(device.device_id)"
          >
            <span class="d-name">{{ device.name }}</span>
            <span class="d-model">{{ device.model || device.serial_no || '—' }}</span>
            <span
              v-if="device.last_calibration"
              class="cal-badge"
              :class="device.last_calibration.status === 'over' ? 'over' : 'ok'"
            >{{ device.last_calibration.status === 'over' ? '超差' : '达标' }}</span>
            <span v-else class="cal-badge none">未标定</span>
          </button>
          <div v-if="devices.length === 0" class="hint"> 暂无已登记设备。 </div>
        </div>
        <div class="section-h" style="margin-top: 18px"> 设备登记 </div>
        <div class="field">
          <label for="dn">设备名称 <span class="req">*</span></label>
          <input id="dn" v-model="formName" placeholder="如 CR-01" />
        </div>
        <div class="field">
          <label for="dm">型号</label>
          <input id="dm" v-model="formModel" placeholder="如 X-Ray 3000" />
        </div>
        <div class="field">
          <label for="ds">出厂编号</label>
          <input id="ds" v-model="formSerial" placeholder="如 SN-001" />
        </div>
        <div class="field">
          <label for="dnotes">备注</label>
          <input id="dnotes" v-model="formNotes" />
        </div>
        <button class="btn" type="button" @click="registerDevice"> 登记设备 → </button>
      </div>
      <div class="grow">
        <template v-if="deviceDetail">
          <div class="section-h">{{ deviceDetail.name }} <span class="sub">{{ deviceDetail.model || '' }} {{ deviceDetail.serial_no || '' }}</span></div>
          <div class="cal-status" :class="deviceDetail.calibration_count ? 'has' : ''">
            累计标定 {{ deviceDetail.calibration_count }} 次
            <template v-if="lastCalibration"> · 最近 {{ lastCalibration.calibrated_at }} 由 {{ lastCalibration.calibrator }} <span :class="lastCalibration.status === 'over' ? 'over' : 'ok'"> （{{ lastCalibration.status === 'over' ? '超差' : '达标' }}， 相对偏差 {{ lastCalibration.deviation_pct ?? '—' }}%） </span></template>
          </div>
          <div class="section-h" style="margin-top: 16px"> 录入标定值 </div>
          <div class="field">
            <label for="cal1">标定人员（当前登录账号）<span class="req">*</span></label>
            <input
              id="cal1"
              v-model="calibrator"
              readonly
              title="标定记录归属当前登录账号（三员分岗防冒名）"
            />
          </div>
          <div class="field">
            <label for="cal2">实测像素标定（mm/px）<span class="req">*</span></label>
            <input id="cal2" v-model="pixelSpacing" placeholder="如 0.1000" />
            <div class="why"> 本设备实测空间标定值；提交检测任务时作为像素标定的默认参考。 </div>
          </div>
          <div class="field">
            <label for="cal3">标定件参考值（mm/px）</label>
            <input id="cal3" v-model="referenceSpacing" placeholder="如 0.1000" />
            <div class="why"> 跨设备一致性核查基准；填写后自动计算相对偏差并按 ≤5% 判定。 </div>
          </div>
          <div class="field">
            <label for="cal4">黑度 D 校验值（选填）</label>
            <input id="cal4" v-model="densityValue" placeholder="如 2.4" />
          </div>
          <div class="field">
            <label for="cal5">备注</label>
            <input id="cal5" v-model="calNotes" />
          </div>
          <button class="btn" type="button" @click="saveCalibration"> 保存标定记录 → </button>
          <div class="section-h" style="margin-top: 18px"> 标定档案 </div>
          <div class="hist-list">
            <div v-for="cal in deviceDetail.calibrations" :key="cal.calibration_id" class="cal-row">
              <span class="c-time">{{ cal.calibrated_at }}</span>
              <span class="c-who">{{ cal.calibrator }}</span>
              <span class="c-val">{{ cal.pixel_spacing_mm }} mm/px</span>
              <span v-if="cal.deviation_pct !== null" class="c-dev" :class="cal.status"> 偏差 {{ cal.deviation_pct }}% </span>
              <span class="c-badge" :class="cal.status">{{ cal.status === 'over' ? '超差' : '达标' }}</span>
            </div>
            <div v-if="deviceDetail.calibrations.length === 0" class="hint"> 暂无标定记录。 </div>
          </div>
        </template>
        <div v-else class="hint" style="margin-top: 20px"> 请从左侧选择设备查看标定档案，或先登记设备。 </div>
      </div>
    </div>
  </div>
</template>
