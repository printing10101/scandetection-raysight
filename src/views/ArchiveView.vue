<script setup>
// 检测档案视图——从 bundle 的 __name:"ArchiveView" 区块还原（7528–7948 行）。
// 主动学习训练样本库概览 + 归档记录检索（工件/密级/日期/缺陷类别/仅看待复核）
// + 分页表格；「查看影像」跳底片观察，「查看报告」走受控导出门禁打开 PDF/A。
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getActivePool, listRecords } from '../api/endpoints.js';
import { errToMessage } from '../utils/helpers.js';
import { stampBadge } from '../utils/reportHelpers.js';
import { usePdfGate } from '../composables/usePdfGate.js';
import PdfGateModal from '../components/PdfGateModal.vue';

// 密级代码 → 文案（后端 0–3）
const SECRET_LEVEL_NAMES = { 0: '非密', 1: '内部', 2: '秘密', 3: '机密' };
// 评定级别筛选项：空串表示全部
const LEVEL_FILTERS = ['', 'I', 'II', 'III', 'IV'];
// 缺陷类别名（按 class_id 下标对应；归档筛选用）
const DEFECT_CLASS_NAMES = ['气孔', '夹渣', '未焊透', '未熔合', '裂纹', '咬边', '内凹'];

const router = useRouter();
const pdfGate = usePdfGate();

const loading = ref(true);
const loadError = ref(null);
const pageData = ref(null);
const total = ref(0);

const filterLevel = ref('');
const filterWorkpiece = ref('');
const filterDateFrom = ref('');
const filterDateTo = ref('');
const filterClassId = ref(null);
const filterNeedReview = ref(false);

const pageNum = ref(1);
const pageSize = ref(50);

const hasActiveFilters = computed(
  () =>
    filterLevel.value !== '' ||
    filterWorkpiece.value.trim() !== '' ||
    filterDateFrom.value.trim() !== '' ||
    filterDateTo.value.trim() !== '' ||
    filterClassId.value !== null ||
    filterNeedReview.value,
);

function openImage(imageId) {
  router.push({ name: 'viewer', query: { image_id: imageId } });
}

function openReport(reportId) {
  pdfGate.openPdf(reportId);
}

// 主动学习训练样本库概览（加载失败按"不可用"呈现，不阻塞档案检索）
const poolLoading = ref(true);
const pool = ref(null);
async function loadPool() {
  poolLoading.value = true;
  try {
    pool.value = await getActivePool();
  } catch {
    pool.value = null;
  } finally {
    poolLoading.value = false;
  }
}

// 请求序号守卫：筛选快速连续变更时只采纳最后一次的结果
let requestSeq = 0;
async function loadRecords() {
  const seq = ++requestSeq;
  loading.value = true;
  loadError.value = null;
  try {
    const result = await listRecords({
      level: filterLevel.value || undefined,
      workpiece: filterWorkpiece.value || undefined,
      dateFrom: filterDateFrom.value.trim() || undefined,
      dateTo: filterDateTo.value.trim() || undefined,
      classId: filterClassId.value ?? undefined,
      needReview: filterNeedReview.value ? true : undefined,
      page: pageNum.value,
      size: pageSize.value,
    });
    if (seq !== requestSeq) return;
    pageData.value = result;
    total.value = result.total;
  } catch (err) {
    if (seq !== requestSeq) return;
    loadError.value = errToMessage(err);
  } finally {
    if (seq === requestSeq) loading.value = false;
  }
}

onMounted(() => {
  loadRecords();
  loadPool();
});

function applyFilters() {
  pageNum.value = 1;
  loadRecords();
}

function resetFilters() {
  filterLevel.value = '';
  filterWorkpiece.value = '';
  filterDateFrom.value = '';
  filterDateTo.value = '';
  filterClassId.value = null;
  filterNeedReview.value = false;
  applyFilters();
}

function goToPage(target) {
  const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value));
  if (target < 1 || target > maxPage) return;
  pageNum.value = target;
  loadRecords();
}
</script>

<template>
  <div>
    <h1 class="title-zine" data-t="检测档案"> 检测档案 </h1>
    <div class="lede"> 检索本地归档的检测评定记录（数据来自本地检测档案数据库） </div>

    <section class="pool">
      <h2 class="pool-title"> 主动学习训练样本库 </h2>
      <p v-if="poolLoading" class="hint"> 加载中… </p>
      <template v-else-if="pool">
        <div class="pool-meta">
          <span>样本总数：<b>{{ pool.sample_count }}</b></span>
          <span>数据集版本指纹：<code class="fp">{{ pool.fingerprint ?? '—' }}</code></span>
          <span v-if="pool.exported_at">最近导出：{{ pool.exported_at }}</span>
        </div>
        <p class="stat">
          经人工复核确认的缺陷样本将回流至训练样本库（§5.5 持续学习闭环），标注文件：
          {{ pool.files.length ? pool.files.join(' · ') : '暂无，完成一次样本导出后生成' }}
        </p>
      </template>
      <p v-else class="hint"> 训练样本库暂不可用（后端未装配或目录不存在）。 </p>
    </section>

    <div class="search">
      <input
        v-model="filterWorkpiece"
        placeholder="按工件编号检索…"
        @keyup.enter="applyFilters"
      />
      <select v-model="filterLevel" @change="applyFilters">
        <option v-for="lv in LEVEL_FILTERS" :key="lv" :value="lv">{{ lv ? `${lv} 级` : '全部级别' }}</option>
      </select>
      <input v-model="filterDateFrom" type="date" title="归档日期起" @change="applyFilters" />
      <input v-model="filterDateTo" type="date" title="归档日期止" @change="applyFilters" />
      <select v-model="filterClassId" @change="applyFilters">
        <option :value="null"> 全部缺陷类别 </option>
        <option v-for="(name, id) in DEFECT_CLASS_NAMES" :key="id" :value="id">含{{ name }}</option>
      </select>
      <label class="nr-check">
        <input v-model="filterNeedReview" type="checkbox" @change="applyFilters" /> 仅看待复核
      </label>
      <button class="btn ghost" type="button" style="margin-top: 0" @click="applyFilters"> 检索 </button>
      <button v-if="hasActiveFilters" class="btn link" type="button" style="margin-top: 0" @click="resetFilters"> 清除筛选 </button>
    </div>

    <p v-if="loading" class="hint"> 加载中… </p>
    <p v-else-if="loadError" class="err show">
      ⚠ 加载失败：{{ loadError }}　<button class="btn link" type="button" @click="applyFilters"> 重试 </button>
    </p>
    <template v-else-if="!pageData || pageData.items.length === 0">
      <p v-if="hasActiveFilters" class="empty">
        没有匹配当前筛选条件的归档记录。可调整筛选条件，或
        <a href="#" class="clr" @click.prevent="resetFilters">清除全部筛选</a>
        后重试。
      </p>
      <p v-else class="empty"> 暂无归档记录 —— 完成检测评定后，结果将自动归档至此。 </p>
    </template>
    <template v-else>
      <table>
        <thead>
          <tr>
            <th>影像编号</th>
            <th>工件编号</th>
            <th>底片印字</th>
            <th>密级</th>
            <th>评定级别</th>
            <th>可评片</th>
            <th>待复核</th>
            <th>归档时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in pageData.items" :key="item.image_id">
            <td>{{ item.image_id }}</td>
            <td>{{ item.workpiece_no ?? '—' }}</td>
            <td>
              <span
                v-if="stampBadge(item)"
                class="stamp"
                :class="`stamp-${stampBadge(item).cls}`"
                :title="stampBadge(item).title"
              >{{ stampBadge(item).label }}</span>
              <span v-else>—</span>
            </td>
            <td>
              <span class="lv" :class="{ secret: (item.secret_level ?? 0) >= 2 }">{{ SECRET_LEVEL_NAMES[item.secret_level ?? 0] ?? '非密' }}</span>
            </td>
            <td>
              <span v-if="item.joint_level" class="lv">{{ item.joint_level }}</span>
              <span v-else class="need">—</span>
            </td>
            <td>{{ item.evaluable ? '是' : '否' }}</td>
            <td>
              <span v-if="item.need_review" class="need">待复核</span>
              <span v-else>—</span>
            </td>
            <td>{{ item.created_at ?? '—' }}</td>
            <td class="ops">
              <button
                type="button"
                class="btn link"
                title="在「底片观察」中载入该影像"
                @click="openImage(item.image_id)"
              > 查看影像 </button>
              <button
                v-if="item.report_id"
                type="button"
                class="btn link"
                title="打开该底片的 PDF/A 检测报告（经受控导出通道）"
                @click="openReport(item.report_id)"
              > 查看报告 </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="stat">
        共 <b>{{ total }}</b> 条记录 · 级别分布：{{ Object.entries(pageData.stats.by_level).map(([lv, count]) => `${lv}:${count}`).join(' ') || '—' }}
      </p>
      <div v-if="total > pageSize" class="pager">
        <button class="btn ghost" type="button" :disabled="pageNum <= 1" @click="goToPage(pageNum - 1)"> ← 上一页 </button>
        <span class="pg">第 {{ pageNum }} / {{ Math.max(1, Math.ceil(total / pageSize)) }} 页</span>
        <button class="btn ghost" type="button" :disabled="pageNum >= Math.ceil(total / pageSize)" @click="goToPage(pageNum + 1)"> 下一页 → </button>
        <select v-model.number="pageSize" class="ps" @change="applyFilters">
          <option :value="50"> 50/页 </option>
          <option :value="100"> 100/页 </option>
        </select>
      </div>
    </template>

    <PdfGateModal :ctrl="pdfGate" />
  </div>
</template>
