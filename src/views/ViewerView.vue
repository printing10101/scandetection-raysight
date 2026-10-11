<script setup>
// 底片观察页（/viewer 路由视图）——从 bundle 的 __name:"ViewerView" 区块还原
//（12387–12632 行，原 I0；内嵌 FilmViewer 画布组件做实际渲染）。
// 「单幅评定」「批量评定」导入的底片经 viewerFilms store 自动同步到本页（最新优先）；
// 主片（A）/对比片（B）双槽查看，开启「视图联动」后 B 片复用 A 片上报的变换；
// 也支持按档案影像编号从「检测档案」拉取历史底片（/images/{id}/preview.png）。
// 槽位 URL 分「自有」（本页创建的 ObjectURL，换片/卸载时回收）与「借用」（store 的）。
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import FilmViewer from './FilmViewer.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { fetchImagePreview } from '../api/endpoints.js';
import { ApiRequestError } from '../api/http.js';
import { errToMessage } from '../utils/helpers.js';
import { stampBadge } from '../utils/reportHelpers.js';
import { useViewerFilmsStore } from '../stores/viewerFilms.js';
import { IMAGE_ACCEPT } from '../utils/mediaFormats.js';

const route = useRoute();
const filmStore = useViewerFilmsStore();

// —— 双槽查看状态（原始 s o i a r u c）——
const mainSlot = ref(null); // { url, name, owned, filmId? }，filmId=来自 store 的底片
const compareSlot = ref(null);
const dualMode = ref(false); // 双片对比开关
const linkViews = ref(true); // 视图联动：B 片跟随 A 片变换
const lastTransform = ref(null); // A 片上报的最新变换（联动时下发给两片）
const archiveIdInput = ref(''); // 档案影像编号输入
const archiveError = ref(null);
const archiveLoading = ref(false);

// 槽位赋值：旧槽位若是本页自建的 ObjectURL 先回收（原始 d）
function setSlot(which, slot) {
  const current = which === 'A' ? mainSlot.value : compareSlot.value;
  if (current?.owned) URL.revokeObjectURL(current.url);
  if (which === 'A') mainSlot.value = slot;
  else compareSlot.value = slot;
}

onBeforeUnmount(() => {
  if (mainSlot.value?.owned) URL.revokeObjectURL(mainSlot.value.url);
  if (compareSlot.value?.owned) URL.revokeObjectURL(compareSlot.value.url);
});

// 上屏 store 里的底片：借用其 URL；选 B 槽自动开双片对比（原始 f）
function showFilm(film, which = 'A') {
  setSlot(which, {
    url: film.url,
    name: film.name,
    owned: false,
    filmId: film.id,
  });
  if (which === 'B') dualMode.value = true;
}

onMounted(() => {
  // 路由带 image_id（如从检测档案跳转）：直接按编号载入
  const imageId = route.query.image_id;
  if (typeof imageId === 'string' && imageId.trim()) {
    archiveIdInput.value = imageId.trim();
    loadFromArchive();
    return;
  }
  if (mainSlot.value) return;
  const first = filmStore.films.find((film) => film.decodable);
  if (first) showFilm(first);
});

// 单幅/批量评定新导入底片：双片对比开着且 B 槽空则填 B，否则换 A 片
watch(
  () => filmStore.lastAddedId,
  (id) => {
    if (id < 0) return;
    const film = filmStore.films.find((f) => f.id === id);
    if (!film || !film.decodable) return;
    if (dualMode.value && !compareSlot.value) showFilm(film, 'B');
    else showFilm(film);
  },
);

// store 里的底片被移除/淘汰：同步清空引用它的槽位
watch(
  () => filmStore.films.map((film) => film.id),
  (ids) => {
    if (mainSlot.value?.filmId && !ids.includes(mainSlot.value.filmId)) setSlot('A', null);
    if (compareSlot.value?.filmId && !ids.includes(compareSlot.value.filmId)) setSlot('B', null);
  },
);

// 从「检测档案」按编号载入历史底片（后端转档出 PNG 预览）
async function loadFromArchive() {
  const imageId = archiveIdInput.value.trim();
  archiveError.value = null;
  if (!imageId) {
    archiveError.value = '请输入影像编号（可在「检测档案」中复制）。';
    return;
  }
  archiveLoading.value = true;
  try {
    const blob = await fetchImagePreview(imageId);
    const url = URL.createObjectURL(blob);
    setSlot('A', { url, name: `档案影像 ${imageId}`, owned: true });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      if (err.status === 404) {
        archiveError.value = `未找到影像「${imageId}」：请确认编号是否来自「检测档案」列表。`;
      } else if (err.status === 401) {
        archiveError.value = '登录状态已失效，请重新登录后再试。';
      } else {
        archiveError.value = `影像载入失败：${err.message}`;
      }
    } else {
      archiveError.value = `影像载入失败：${errToMessage(err)}`;
    }
  } finally {
    archiveLoading.value = false;
  }
}

// 本机文件选择：直接建 ObjectURL 上屏（原始 P）
function pickLocalFile(which) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = IMAGE_ACCEPT;
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    setSlot(which, { url: URL.createObjectURL(file), name: file.name, owned: true });
    if (which === 'B') dualMode.value = true;
  };
  input.click();
}

// A/B 片变换上报：存起来供「视图联动」回灌两片（原始 E）
function onTransformChanged(t) {
  lastTransform.value = t;
}

// —— 清空/移除的确认弹窗状态（原始 M L K I A C）——
const confirmMode = ref(null); // null | 'clear' | 'remove'
const pendingRemoveFilm = ref(null);

function askClearAll() {
  confirmMode.value = 'clear';
}

function askRemoveFilm(film) {
  pendingRemoveFilm.value = film;
  confirmMode.value = 'remove';
}

function confirmRemoval() {
  if (confirmMode.value === 'clear') filmStore.clear();
  else if (confirmMode.value === 'remove' && pendingRemoveFilm.value) filmStore.remove(pendingRemoveFilm.value.id);
  confirmMode.value = null;
  pendingRemoveFilm.value = null;
}

function cancelRemoval() {
  confirmMode.value = null;
  pendingRemoveFilm.value = null;
}

// 不可解码底片的缩略图占位：显示大写扩展名（原始 T）
function extLabel(name) {
  return (name.split('.').pop() ?? '?').toUpperCase();
}

// —— 缩略图徽标/标注信息 ——
const mainAnnotations = computed(() => filmStore.annotationsOf(mainSlot.value?.filmId));
const compareAnnotations = computed(() => filmStore.annotationsOf(compareSlot.value?.filmId));

function defectCount(filmId) {
  return filmStore.annotationsOf(filmId)?.boxes.length ?? 0;
}

const mainStampBadge = computed(() => stampBadge(filmStore.stampOf(mainSlot.value?.filmId)));

function filmStampBadge(filmId) {
  const stamp = filmStore.stampOf(filmId);
  return stamp ? stampBadge(stamp) : null;
}
</script>

<template>
  <div>
    <h1 class="title-zine">
      底片观察
    </h1>
    <div class="lede">
      单幅/批量导入的影像自动同步至本工作区；支持缩放、平移、旋转、镜像、正反片（反相）转换、窗宽窗位调节、锐化与浮雕增强 （DB50/T 1807 §6.1.5）；快捷键：+ − r R i f 1 0 方向键
    </div>
    <div class="viewer-controls">
      <button @click="pickLocalFile('A')">
        {{ mainSlot ? '更换' : '载入' }}主片…
      </button>
      <span v-if="mainSlot" class="fname">
        {{ mainSlot.name }}
        <em v-if="mainStampBadge" :class="['fstamp', `fstamp-${mainStampBadge.cls}`]" :title="mainStampBadge.title">{{ mainStampBadge.label }}</em>
        <em v-if="mainAnnotations" class="fdef">检出缺陷 {{ mainAnnotations.boxes.length }} 处（已标注）</em>
        <a href="#" @click.prevent="setSlot('A', null)">移除</a>
      </span>
      <input v-model="archiveIdInput" class="aid" placeholder="档案影像编号…" @keyup.enter="loadFromArchive" />
      <button :disabled="archiveLoading" @click="loadFromArchive">
        {{ archiveLoading ? '载入中…' : '从检测档案载入' }}
      </button>
      <span v-if="archiveError" class="aerr" role="alert">{{ archiveError }}</span>
      <button :class="{ on: dualMode }" @click="dualMode = !dualMode">
        双片对比
      </button>
      <template v-if="dualMode">
        <button @click="pickLocalFile('B')">
          {{ compareSlot ? '更换' : '载入' }}对比片…
        </button>
        <label class="chk"><input v-model="linkViews" type="checkbox" />视图联动</label>
      </template>
    </div>
    <div v-if="filmStore.count === 0" class="empty-guide">
      <p class="eg-title">
        尚未同步任何底片
      </p>
      <p class="eg-line">
        · 在「单幅评定」或「批量评定」中导入的底片会自动同步到本页（本会话内有效）；
      </p>
      <p class="eg-line">
        · 或在上方输入档案影像编号，从「检测档案」载入历史底片（支持 TIFF/DICOM 转档预览）；
      </p>
      <p class="eg-line">
        · 也可点击「载入主片…」直接选择本机影像文件。
      </p>
    </div>
    <div v-if="filmStore.count" class="strip-wrap">
      <div class="strip-head">
        已同步影像 {{ filmStore.count }} 幅
        <span class="faint">（来自单幅/批量导入，最新优先）</span>
        <a href="#" class="clear" @click.prevent="askClearAll">清空</a>
      </div>
      <div class="strip">
        <div
          v-for="film in filmStore.films"
          :key="film.id"
          class="thumb"
          :class="{ active: mainSlot?.filmId === film.id || compareSlot?.filmId === film.id }"
          :title="film.name"
          @click="showFilm(film)"
        >
          <span class="timg">
            <img v-if="film.decodable" :src="film.url" loading="lazy" decoding="async" alt="" />
            <span v-else class="noimg" title="该格式需经后端转档后预览（WebView 不支持直接解码）">{{ extLabel(film.name) }}</span>
          </span>
          <span class="tname">{{ film.name }}</span>
          <span v-if="filmStampBadge(film.id)" :class="['tstamp', `tstamp-${filmStampBadge(film.id).cls}`]" :title="filmStampBadge(film.id).title">{{ filmStampBadge(film.id).label }}</span>
          <span v-if="defectCount(film.id) > 0" class="tdef" title="批量检出缺陷，上屏后叠加标注框">缺陷 {{ defectCount(film.id) }}</span>
          <button v-if="dualMode" class="tb" title="设为对比片（B）" @click.stop="showFilm(film, 'B')">
            对比
          </button>
          <button class="tx" title="从列表移除" @click.stop="askRemoveFilm(film)">
            ✕
          </button>
        </div>
      </div>
    </div>
    <div :class="dualMode ? 'dual' : 'single'">
      <FilmViewer
        :src="mainSlot?.url ?? null"
        :label="mainSlot?.name || '未载入影像'"
        :annotations="mainAnnotations"
        :sync-transform="linkViews ? lastTransform : null"
        @transform-changed="onTransformChanged"
      />
      <FilmViewer
        v-if="dualMode"
        :src="compareSlot?.url ?? null"
        :label="compareSlot?.name || '未载入对比片'"
        :annotations="compareAnnotations"
        :sync-transform="linkViews ? lastTransform : null"
        @transform-changed="onTransformChanged"
      />
    </div>
    <ConfirmDialog
      :open="confirmMode !== null"
      :title="confirmMode === 'clear' ? '清空已同步影像' : '移除影像'"
      :message="confirmMode === 'clear' ? `将移除已同步的全部 ${filmStore.count} 幅影像及其缺陷标注（不影响已归档的检测结果），本会话内无法找回。确认清空？` : `将移除「${pendingRemoveFilm?.name ?? ''}」及其缺陷标注（不影响已归档的检测结果）。确认移除？`"
      confirm-text="确认移除"
      danger
      @confirm="confirmRemoval"
      @cancel="cancelRemoval"
    />
  </div>
</template>
