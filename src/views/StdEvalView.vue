<script setup>
// 标准评定视图——从 bundle 的 __name:"StdEvalView" 区块还原（11427–11861 行）。
// 四个分区：1 评价/标注人员资质（录入/移除/保存校验）；2 记录表基本信息（生成附录 A）；
// 3 评价结果（KDR/WDR/TDR/FRR 与分级）；4 评价历史与分级曲线（SVG 折线）。
// 记录表编号改动后需按新编号重新生成才能下载（recordNameDirty 守卫）。
import { ref, computed, onMounted } from 'vue';
import {
  getStdEvalPersonnel,
  putStdEvalPersonnel,
  createStdEvalRecord,
  getStdEvalHistory,
  mediaUrl,
} from '../api/endpoints.js';
import { API_BASE } from '../api/http.js';
import { errToMessage } from '../utils/helpers.js';
import ConfirmDialog from '../components/ConfirmDialog.vue';

// 分级曲线画布常量（viewBox 720×240 与四边留白）
const CHART_W = 720;
const CHART_H = 240;
const CHART_PAD_LEFT = 44;
const CHART_PAD_RIGHT = 16;
const CHART_PAD_TOP = 28;
const CHART_PAD_BOTTOM = 46;

// ---- 1. 人员资质 ------------------------------------------------------------
const qualifyStatus = ref(null); // null 未知 / true 通过 / false 有问题
const issues = ref([]);
const evaluators = ref([]);
const labelers = ref([]);
const saving = ref(false);
const okMessage = ref(null);
const errorMessage = ref(null);

const personName = ref('');
const certType = ref('');
const personRole = ref('labeler');
const certNo = ref('');
const validUntil = ref('');

async function loadStatus() {
  try {
    const status = await getStdEvalPersonnel();
    qualifyStatus.value = status.qualified;
    issues.value = status.issues;
    evaluators.value = status.evaluators;
    labelers.value = status.labelers;
  } catch (err) {
    errorMessage.value = errToMessage(err);
  }
}

// 保存口径：两类人员合并回传，缺失字段补空串
function collectPeople() {
  return [...evaluators.value, ...labelers.value].map((p) => ({
    name: p.name,
    cert_type: p.cert_type,
    role: p.role,
    cert_no: p.cert_no ?? '',
    valid_until: p.valid_until ?? '',
  }));
}

function addPerson() {
  errorMessage.value = null;
  if (!personName.value.trim() || !certType.value.trim()) {
    errorMessage.value = '姓名与持证类型必填（如 张三 / RT(D)-II）。';
    return;
  }
  const person = {
    name: personName.value.trim(),
    cert_type: certType.value.trim(),
    role: personRole.value,
    cert_no: certNo.value.trim(),
    valid_until: validUntil.value.trim(),
  };
  if (personRole.value === 'evaluator') {
    evaluators.value = [...evaluators.value, person];
  } else {
    labelers.value = [...labelers.value, person];
  }
  personName.value = '';
  certType.value = '';
  certNo.value = '';
  validUntil.value = '';
}

// 移除需确认：先记 pendingRemove，ConfirmDialog 确认后才真正删
const pendingRemove = ref(null);

function requestRemove(role, idx) {
  const list = role === 'evaluator' ? evaluators.value : labelers.value;
  pendingRemove.value = {
    role,
    idx,
    name: list[idx]?.name ?? '',
  };
}

function confirmRemove() {
  const target = pendingRemove.value;
  if (!target) return;
  if (target.role === 'evaluator') {
    evaluators.value = evaluators.value.filter((_, i) => i !== target.idx);
  } else {
    labelers.value = labelers.value.filter((_, i) => i !== target.idx);
  }
  pendingRemove.value = null;
  okMessage.value = '已从列表移除；如需生效到已保存的资质档案，请点击「保存并校验资质」。';
}

async function savePeople() {
  saving.value = true;
  errorMessage.value = null;
  okMessage.value = null;
  try {
    const result = await putStdEvalPersonnel(collectPeople());
    qualifyStatus.value = result.qualified;
    issues.value = result.issues;
    okMessage.value = result.qualified ? '资质校验通过。' : '已保存，但存在资质问题（详见下方列表）。';
  } catch (err) {
    errorMessage.value = errToMessage(err);
  } finally {
    saving.value = false;
  }
}

// ---- 2. 记录表基本信息 ------------------------------------------------------
const recordName = ref('std_record');
const record = ref(null);
const savedRecordName = ref(null);
// 编号在生成后被改动：旧链接已失效，需重新生成
const recordNameDirty = computed(
  () => record.value !== null && savedRecordName.value !== null && recordName.value.trim() !== savedRecordName.value,
);

const systemName = ref('承压设备射线检测缺陷自动识别系统');
const systemVersion = ref('');
const developer = ref('');
const filmKind = ref('RT');
const exposureLayout = ref('');
const weldForm = ref('single');
const weldMethod = ref('manual');

async function generateRecord() {
  saving.value = true;
  errorMessage.value = null;
  okMessage.value = null;
  try {
    record.value = await createStdEvalRecord({
      system_name: systemName.value.trim() || '承压设备射线检测缺陷自动识别系统',
      system_version: systemVersion.value.trim(),
      developer: developer.value.trim(),
      film_kind: filmKind.value,
      exposure_layout: exposureLayout.value.trim(),
      weld_form: weldForm.value,
      weld_method: weldMethod.value,
      record_name: recordName.value.trim() || 'std_record',
    });
    savedRecordName.value = recordName.value.trim() || 'std_record';
    okMessage.value = record.value.grading.official
      ? '附录 A 记录表已生成（正式分级结论）。'
      : '附录 A 记录表已生成（人员资质或 FRR 未满足要求，分级数据仅作参考）。';
  } catch (err) {
    errorMessage.value = errToMessage(err);
  } finally {
    saving.value = false;
  }
}

// 下载走带 access_token 的 URL（img/a 标签带不了请求头）
function pdfUrl(name) {
  return mediaUrl(`${API_BASE}/std-eval/record/pdf?record_name=${encodeURIComponent(name)}`);
}

const pct = (v) => `${(v * 100).toFixed(2)}%`;

// ---- 4. 评价历史与分级曲线 ----------------------------------------------------
const history = ref([]);
const historyError = ref(null);

async function loadHistory() {
  try {
    const result = await getStdEvalHistory();
    history.value = [...result.items].reverse();
  } catch (err) {
    historyError.value = errToMessage(err);
  }
}

onMounted(() => {
  loadStatus();
  loadHistory();
});

// 只画至少有一项指标的历史点
const chartedHistory = computed(() =>
  history.value
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) => item.tdr != null || item.wdr != null || item.frr != null),
);

function xAt(idx, count) {
  return count <= 1 ? CHART_PAD_LEFT : CHART_PAD_LEFT + (idx * (CHART_W - CHART_PAD_LEFT - CHART_PAD_RIGHT)) / (count - 1);
}

function yAt(value) {
  return CHART_PAD_TOP + (1 - value) * (CHART_H - CHART_PAD_TOP - CHART_PAD_BOTTOM);
}

// 指标折线路径：空值断线（回到落笔起点 M）
function buildMetricPath(metricKey) {
  const count = history.value.length;
  if (count === 0) return '';
  let d = '';
  let penDown = false;
  chartedHistory.value.forEach(({ item, idx }) => {
    const value = item[metricKey];
    if (value == null) {
      penDown = false;
      return;
    }
    d += `${penDown ? 'L' : 'M'}${xAt(idx, count).toFixed(1)},${yAt(value).toFixed(1)} `;
    penDown = true;
  });
  return d.trim();
}

const tdrPath = computed(() => buildMetricPath('tdr'));
const wdrPath = computed(() => buildMetricPath('wdr'));
const frrPath = computed(() => buildMetricPath('frr'));

const yTicks = computed(() => [0, 0.25, 0.5, 0.75, 1].map((v) => ({ v, y: yAt(v) })));

// 横轴时间标签：按总数自适应抽样（约 8 个），末点必画
const xLabels = computed(() => {
  const count = history.value.length;
  const step = Math.max(1, Math.ceil(count / 8));
  return history.value
    .map((item, idx) => ({
      i: idx,
      text: (item.evaluated_at ?? '').replace('T', ' ').slice(0, 16),
    }))
    .filter((lab) => lab.i % step === 0 || lab.i === count - 1);
});

const levelMarks = computed(() => {
  const count = history.value.length;
  return history.value
    .map((item, idx) => ({ i: idx, level: item.level ?? '' }))
    .filter((mark) => mark.level)
    .map((mark) => ({ ...mark, x: xAt(mark.i, count) }));
});
</script>

<template>
  <div>
    <h1 class="title-zine"> 系统评价（DB50/T 1807-2025） </h1>
    <div class="lede"> 评价指标由系统管理员在服务端运行标准评价任务产出；本页用于检测人员资质录入与附录 A 记录表生成。 </div>

    <div class="section-h"><span class="no">1</span>评价/标注人员资质 </div>
    <div class="panel">
      <div class="row">
        <div class="field">
          <label for="spn">姓名</label>
          <input id="spn" v-model="personName" placeholder="张三" />
        </div>
        <div class="field">
          <label for="spc">持证类型</label>
          <input id="spc" v-model="certType" placeholder="RT(D)-II / RT-Ⅱ" />
        </div>
        <div class="field">
          <label for="spr">岗位</label>
          <select id="spr" v-model="personRole">
            <option value="evaluator"> 评价人员 </option>
            <option value="labeler"> 标注人员 </option>
          </select>
        </div>
        <div class="field">
          <label for="spv">证书有效期（选填）</label>
          <input id="spv" v-model="validUntil" placeholder="2099-12-31" />
        </div>
        <button class="btn" type="button" @click="addPerson"> 添加 </button>
      </div>
      <ul v-if="evaluators.length || labelers.length" class="plist">
        <li v-for="(p, i) in evaluators" :key="`e${i}`">
          评价人员：{{ p.name }}（{{ p.cert_type }}{{ p.valid_until ? `，至 ${p.valid_until}` : '' }}）
          <a href="#" @click.prevent="requestRemove('evaluator', i)">移除</a>
        </li>
        <li v-for="(p, i) in labelers" :key="`l${i}`">
          标注人员：{{ p.name }}（{{ p.cert_type }}）
          <a href="#" @click.prevent="requestRemove('labeler', i)">移除</a>
        </li>
      </ul>
      <div v-if="qualifyStatus === false" class="err show"> 资质问题：{{ issues.join('；') }} </div>
      <button class="btn" type="button" :disabled="saving" @click="savePeople"> 保存并校验资质 </button>
      <span v-if="qualifyStatus === true" class="ok show">资质校验通过</span>
    </div>

    <div class="section-h"><span class="no">2</span>记录表基本信息 </div>
    <div class="panel">
      <div class="row">
        <div class="field grow">
          <label for="sen">系统名称</label>
          <input id="sen" v-model="systemName" />
        </div>
        <div class="field">
          <label for="sev">系统版本</label>
          <input id="sev" v-model="systemVersion" placeholder="1.0.0" />
        </div>
        <div class="field">
          <label for="sed">研制单位</label>
          <input id="sed" v-model="developer" />
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label for="sek">检测方法</label>
          <select id="sek" v-model="filmKind">
            <option>RT</option>
            <option>DR</option>
            <option>CR</option>
          </select>
        </div>
        <div class="field">
          <label for="sef">焊缝形式</label>
          <select id="sef" v-model="weldForm">
            <option value="single"> 单面焊 </option>
            <option value="double"> 双面焊 </option>
          </select>
        </div>
        <div class="field">
          <label for="sem">焊接方法</label>
          <select id="sem" v-model="weldMethod">
            <option value="manual"> 手工焊 </option>
            <option value="auto"> 自动焊 </option>
          </select>
        </div>
        <div class="field">
          <label for="ser">记录表编号</label>
          <input id="ser" v-model="recordName" />
        </div>
      </div>
      <button class="btn" type="button" :disabled="saving" @click="generateRecord"> 生成附录 A 记录表 </button>
      <a
        v-if="record && !recordNameDirty"
        class="btn"
        :href="pdfUrl(savedRecordName ?? 'std_record')"
        target="_blank"
      > 下载 PDF </a>
      <span v-else-if="recordNameDirty" class="hint"> 记录表编号已修改，请点击「生成附录 A 记录表」以新编号重新生成后再下载。 </span>
    </div>

    <template v-if="record">
      <div class="section-h"><span class="no">3</span>评价结果 </div>
      <div class="panel">
        <table class="dtable">
          <tbody>
            <tr>
              <th>KDR（关键缺陷检出率）</th>
              <td>{{ pct(record.metrics.kdr) }}（严格口径 {{ pct(record.metrics.kdr_strict) }}）</td>
              <th>WDR（综合检出率）</th>
              <td>{{ pct(record.metrics.wdr) }}（{{ pct(record.metrics.wdr_strict) }}）</td>
            </tr>
            <tr>
              <th>TDR（正确检出率）</th>
              <td>{{ pct(record.metrics.tdr) }}（{{ pct(record.metrics.tdr_strict) }}）</td>
              <th>FRR（整片误报率）</th>
              <td>{{ pct(record.metrics.frr) }}（{{ pct(record.metrics.frr_strict) }}）</td>
            </tr>
            <tr>
              <th>系统分级</th>
              <td colspan="3">
                {{ record.grading.level ?? '未定级' }}（标准口径 {{ record.grading.level_standard ?? '未定级' }} / 严格口径 {{ record.grading.level_strict ?? '未定级' }}）
                <span v-if="!record.grading.official">（参考值）</span>
              </td>
            </tr>
            <tr>
              <th>风险分析</th>
              <td colspan="3"> 漏检 {{ record.risks.miss }}；误检 {{ record.risks.false_detect }}；误报 {{ record.risks.false_report }} </td>
            </tr>
            <tr>
              <th>逐类别指标</th>
              <td colspan="3">
                TDRn：{{ record.metrics.tdr_row }}<br />
                FDRn：{{ record.metrics.fdr_row }}<br />
                MDRn：{{ record.metrics.mdr_row }}<br />
                FRRn：{{ record.metrics.frr_row }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="record.grading.note" class="err show">{{ record.grading.note }}</div>
      </div>
    </template>

    <div class="section-h"><span class="no">4</span>评价历史与分级曲线 </div>
    <div class="panel">
      <div v-if="historyError" class="err show"> 评价历史读取失败：{{ historyError }} </div>
      <div v-else-if="history.length === 0" class="hint"> 暂无评价历史 —— 先经 CLI 产出指标或生成记录表，历史记录将自动汇聚至此。 </div>
      <template v-else>
        <svg
          class="curve"
          :viewBox="`0 0 ${CHART_W} ${CHART_H}`"
          role="img"
          aria-label="评价等级曲线"
        >
          <g v-for="tick in yTicks" :key="`g${tick.v}`">
            <line
              :x1="CHART_PAD_LEFT"
              :y1="tick.y"
              :x2="CHART_W - CHART_PAD_RIGHT"
              :y2="tick.y"
              class="grid"
            />
            <text :x="CHART_PAD_LEFT - 6" :y="tick.y + 4" class="axis" text-anchor="end">{{ Math.round(tick.v * 100) }}%</text>
          </g>
          <path v-if="tdrPath" :d="tdrPath" class="line line-tdr" />
          <path v-if="wdrPath" :d="wdrPath" class="line line-wdr" />
          <path v-if="frrPath" :d="frrPath" class="line line-frr" />
          <g v-for="mark in levelMarks" :key="`lv${mark.i}`">
            <text :x="mark.x" :y="CHART_PAD_TOP - 8" class="lvl" text-anchor="middle">{{ mark.level }}</text>
          </g>
          <text
            v-for="lab in xLabels"
            :key="`x${lab.i}`"
            :x="xAt(lab.i, history.length)"
            :y="CHART_H - 8"
            class="axis"
            text-anchor="middle"
          >{{ lab.text }}</text>
        </svg>
        <div class="legend">
          <span class="key key-tdr">TDR</span>
          <span class="key key-wdr">WDR</span>
          <span class="key key-frr">FRR</span>
          <span class="key key-lvl">L1–L4 = 系统分级</span>
          <span class="key">共 {{ history.length }} 条评价记录</span>
        </div>
      </template>
    </div>

    <div v-if="okMessage" class="ok show">{{ okMessage }}</div>
    <div v-if="errorMessage" class="err show">{{ errorMessage }}</div>
    <ConfirmDialog
      :open="pendingRemove !== null"
      title="移除人员确认"
      :message="`将从列表移除「${pendingRemove?.name ?? ''}」。如该人员此前已保存过，还需点击「保存并校验资质」才会生效。确认移除？`"
      confirm-text="移除"
      danger
      @confirm="confirmRemove"
      @cancel="pendingRemove = null"
    />
  </div>
</template>
