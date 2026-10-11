<script setup>
// 底片查看器（单张影像的画布工作面）——从 bundle 的 __name:"FilmViewer" 区块还原
//（11861–12327 行，原 Zi；样式挂全局 original.css 的 .film-viewer 系 class）。
// 结构：工具栏（缩放/旋转/镜像/反相/窗宽窗位/还原）+ 画布舞台（缺陷框叠加）+
// 滤波滑杆区 + 状态行。像素处理流程：底图按当前旋转/镜像/分辨率因子绘入离屏 canvas，
// 经 256 级灰度 LUT（亮度/对比度/窗宽窗位/反相）与锐化/浮雕 3×3 卷积，再按
// transform（scale/tx/ty）贴到显示 canvas；缺陷框按同一旋转/镜像矩阵投影后叠加。
// 渲染做 rAF 合帧：连续变动（拖拽平移、滑杆）只在下一帧重绘一次。
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

// 缺陷类别名（bundle 模块级常量，原 dl），与 ReviewPanel/ReportView 中的顺序一致。
const DEFECT_CLASSES = ['气孔', '夹渣', '未焊透', '未熔合', '裂纹', '咬边', '内凹'];

const props = defineProps({
  src: {},
  syncTransform: {
    default: null,
  },
  height: {
    default: '62vh',
  },
  label: {
    default: '',
  },
  annotations: {
    default: null,
  },
});
const emit = defineEmits(['transformChanged']);

// —— 显示画布与视图变换 ——
const canvas = ref(null); // 显示用 <canvas>
const stage = ref(null); // 画布外层舞台（保留原始 ref_key:"wrap" 绑定）
const scale = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);
const rotation = ref(0); // 度数，始终为 90 的倍数
const flipH = ref(false);
const flipV = ref(false);
// 「适应窗口」基准比例：2×/4×/8× 按钮与快捷键 f 都以它为倍数
const fitScale = ref(1);

// —— 预处理参数（原始 _ P E N M L K）——
const invert = ref(false); // 正反片转换 / 反相
const brightness = ref(100);
const contrast = ref(100);
const windowingOn = ref(false); // 窗宽窗位调节开关
const windowWidth = ref(255);
const windowCenter = ref(128);
const sharpen = ref(0); // 锐化强度 0–100
const embossOn = ref(false); // 浮雕

// —— 加载与交互状态 ——
const image = ref(null); // 已解码的 HTMLImageElement
const loadError = ref(null);
const hovered = ref(false); // 鼠标在查看器内（快捷键生效条件之一）
const canvasFocused = ref(false); // 画布聚焦（快捷键生效条件之二）

// —— 渲染管线（原始 x W te de b / g R F）——
// 离屏 canvas 缓存预处理结果；renderedKey 记录离屏内容对应的参数签名，
// 变换（缩放/平移）不重算像素，只有参数变化才重绘离屏。
const offscreen = document.createElement('canvas');
let drawW = 0; // 旋转后的绘制宽（原始 W）
let drawH = 0; // 旋转后的绘制高（原始 te）
let renderedKey = ''; // 离屏缓存键（原始 de）
let rafId = 0; // rAF 合帧句柄（原始 b）
let panning = false; // 平移拖拽中（原始 g）
let panLastX = 0; // （原始 R）
let panLastY = 0; // （原始 F）

// 当前视图变换快照（同步给外层/另一片用）
const transform = computed(() => ({
  scale: scale.value,
  tx: offsetX.value,
  ty: offsetY.value,
  rotation: rotation.value,
  flipH: flipH.value,
  flipV: flipV.value,
}));

// 状态行文案：缩放比例、旋转角、原图尺寸与各项处理标记
const statusText = computed(() =>
  [
    `${Math.round(scale.value * 100)}% · ${rotation.value}°`,
    image.value ? `原图 ${image.value.naturalWidth}×${image.value.naturalHeight}px` : '',
    flipH.value ? '· 水平镜像' : '',
    flipV.value ? '· 垂直镜像' : '',
    invert.value ? '· 反相' : '',
    windowingOn.value ? `· 窗宽${windowWidth.value}/窗位${windowCenter.value}` : '',
  ]
    .filter(Boolean)
    .join(' '),
);

// 影响「离屏像素内容」的全部参数签名；显示 canvas 靠它判断离屏缓存是否可复用。
// 注意含 image.src：换图必然换缓存键。
const paramSignature = computed(
  () =>
    `${image.value?.src ?? ''}|${rotation.value}|${flipH.value}|${flipV.value}|${invert.value}|${brightness.value}|${contrast.value}|${windowingOn.value}|${windowWidth.value}|${windowCenter.value}|${sharpen.value}|${embossOn.value}`,
);

// 外部换 src：重新解码；仅当 src 未被再次变更时才生效（竞态保护）。
watch(
  () => props.src,
  (val) => {
    loadError.value = null;
    if (!val) {
      image.value = null;
      return;
    }
    const wantedSrc = val;
    const img = new Image();
    img.onload = () => {
      if (props.src === wantedSrc) {
        image.value = img;
        fitToWindow();
      }
    };
    img.onerror = () => {
      if (props.src === wantedSrc) {
        loadError.value = '影像载入失败（TIFF/DICOM 格式请先经后端转档为 PNG/JPG 预览格式）';
        image.value = null;
      }
    };
    img.src = val;
  },
  { immediate: true },
);

// 任一影响像素的参数变化：离屏缓存失效，下一帧重绘
watch(paramSignature, () => {
  renderedKey = '';
  scheduleRender();
});
// 标注变化同理（缺陷框画进离屏）
watch(() => props.annotations, () => {
  renderedKey = '';
  scheduleRender();
});
// 双片对比「视图联动」：接受外层下发的变换（不回 emit，避免环路）
watch(() => props.syncTransform, (t) => {
  if (!t) return;
  scale.value = t.scale;
  offsetX.value = t.tx;
  offsetY.value = t.ty;
  rotation.value = t.rotation;
  flipH.value = t.flipH;
  flipV.value = t.flipV;
  scheduleRender();
});

function emitTransform() {
  emit('transformChanged', { ...transform.value });
}

// 分辨率因子吸附：把缩放×DPR 吸附到最近的 2^(k/2)（≈√2 步进），
// 避免任意倍率下离屏反复重采样导致的模糊/锯齿（原始 B）。
function snapScaleFactor(value) {
  return 2 ** (Math.ceil(Math.log2(Math.max(value, 0.001)) * 2) / 2);
}

// 当前离屏渲染应采用的缓存键：参数签名 + 分辨率因子（原始 k）
function currentRenderKey() {
  const dpr = window.devicePixelRatio || 1;
  const resFactor = snapScaleFactor(Math.min(1, Math.max(scale.value * dpr, 0.02)));
  return `${paramSignature.value}|res${resFactor}`;
}

// 3×3 卷积，就地写回 imageData；divisor 归一、offset 偏移（浮雕用 128）。（原始 ne）
function convolve3x3(frame, kernel, divisor, offset = 0) {
  const source = new Uint8ClampedArray(frame.data);
  const pixels = frame.data;
  const width = frame.width;
  const height = frame.height;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let ch = 0; ch < 3; ch++) {
        let sum = 0;
        let k = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++, k++) {
            sum += source[((y + dy) * width + (x + dx)) * 4 + ch] * kernel[k];
          }
        }
        pixels[(y * width + x) * 4 + ch] = sum / divisor + offset;
      }
    }
  }
}

// 把「以原图中心为原点」的坐标点经翻转/旋转矩阵映射到离屏像素坐标。（原始 Qi）
function projectPoint(x, y, geo) {
  let px = (x - geo.natW / 2) * geo.factor;
  let py = (y - geo.natH / 2) * geo.factor;
  if (geo.flipH) px = -px;
  if (geo.flipV) py = -py;
  const rot = ((geo.rot % 360) + 360) % 360;
  let rx = px;
  let ry = py;
  if (rot === 90) {
    rx = -py;
    ry = px;
  } else if (rot === 180) {
    rx = -px;
    ry = -py;
  } else if (rot === 270) {
    rx = py;
    ry = -px;
  }
  return [rx + geo.w / 2, ry + geo.h / 2];
}

// 缺陷框（原图坐标 [x, y, w, h]×缩放）投影成离屏上的正置矩形（取对角极值）。（原始 t0）
function projectBox(bbox, scaleX, scaleY, geo) {
  const [x1, y1] = projectPoint(bbox[0] * scaleX, bbox[1] * scaleY, geo);
  const [x2, y2] = projectPoint((bbox[0] + bbox[2]) * scaleX, (bbox[1] + bbox[3]) * scaleY, geo);
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    w: Math.abs(x2 - x1),
    h: Math.abs(y2 - y1),
  };
}

// 在离屏画布上叠加缺陷框与「类别 置信%[ · 待复核]」标签。（原始 Ne）
function drawAnnotations(ctx, natW, natH, rot, outW, outH, factor) {
  const ann = props.annotations;
  if (!ann || ann.boxes.length === 0) return;
  const scaleX = outW / Math.max(1, ann.imageW);
  const scaleY = outH / Math.max(1, ann.imageH);
  const geo = {
    natW,
    natH,
    rot,
    w: outW,
    h: outH,
    factor,
    flipH: flipH.value,
    flipV: flipV.value,
  };
  const minSide = Math.min(outW, outH);
  const lineWidth = Math.max(1.5, minSide / 400);
  const fontSize = Math.max(12, Math.min(30, Math.round(minSide / 30)));
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.textBaseline = 'top';
  ctx.font = `600 ${fontSize}px system-ui, "Segoe UI", sans-serif`;
  for (const box of ann.boxes) {
    const rect = projectBox(box.bbox, scaleX, scaleY, geo);
    ctx.strokeStyle = '#ff453a';
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(rect.x, rect.y, Math.max(rect.w, lineWidth), Math.max(rect.h, lineWidth));
    const text =
      `${DEFECT_CLASSES[box.classId] ?? '缺陷'} ${Math.round(box.confidence * 100)}%` +
      (box.needReview ? ' · 待复核' : '');
    const padX = fontSize * 0.35;
    const padY = fontSize * 0.22;
    const tagW = ctx.measureText(text).width + padX * 2;
    const tagH = fontSize + padY * 2;
    let tagY = rect.y - tagH - lineWidth;
    if (tagY < 2) tagY = rect.y + lineWidth; // 框太靠上时标签画到框内
    let tagX = rect.x;
    if (tagX + tagW > outW - 2) tagX = outW - 2 - tagW;
    ctx.fillStyle = 'rgba(155, 22, 12, 0.85)';
    ctx.fillRect(tagX, tagY, tagW, tagH);
    ctx.fillStyle = '#fff';
    ctx.fillText(text, tagX + padX, tagY + padY);
  }
  ctx.restore();
}

// 离屏重绘：旋转/镜像绘制底图 → 灰度 LUT（窗宽窗位/亮度对比/反相）→ 锐化/浮雕卷积
// → 叠加缺陷框 → 记录缓存键。（原始 se）
function renderOffscreen() {
  const img = image.value;
  if (!img) return;
  const rot = ((rotation.value % 360) + 360) % 360;
  const swapped = rot === 90 || rot === 270;
  const natW = img.naturalWidth;
  const natH = img.naturalHeight;
  drawW = swapped ? natH : natW;
  drawH = swapped ? natW : natH;
  const dpr = window.devicePixelRatio || 1;
  const factor = snapScaleFactor(Math.min(1, Math.max(scale.value * dpr, 0.02)));
  const outW = Math.max(1, Math.round(drawW * factor));
  const outH = Math.max(1, Math.round(drawH * factor));
  offscreen.width = outW;
  offscreen.height = outH;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return;
  ctx.save();
  ctx.translate(outW / 2, outH / 2);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.scale(factor * (flipH.value ? -1 : 1), factor * (flipV.value ? -1 : 1));
  ctx.drawImage(img, -natW / 2, -natH / 2);
  ctx.restore();
  // 256 级灰度 LUT：窗宽窗位拉伸 → 亮度/对比度 → 反相
  const frame = ctx.getImageData(0, 0, outW, outH);
  const lut = new Uint8ClampedArray(256);
  const bGain = brightness.value / 100;
  const cGain = contrast.value / 100;
  for (let v = 0; v < 256; v++) {
    let out = v;
    if (windowingOn.value) {
      const winLow = windowCenter.value - windowWidth.value / 2;
      out = ((out - winLow) / Math.max(windowWidth.value, 1)) * 255;
    }
    out = (out - 128) * cGain + 128 * bGain;
    if (invert.value) out = 255 - out;
    lut[v] = Math.min(255, Math.max(0, out));
  }
  const pixels = frame.data;
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = lut[pixels[i]];
    pixels[i + 1] = lut[pixels[i + 1]];
    pixels[i + 2] = lut[pixels[i + 2]];
  }
  if (sharpen.value > 0) {
    const amount = sharpen.value / 100;
    convolve3x3(frame, [0, -amount, 0, -amount, 1 + 4 * amount, -amount, 0, -amount, 0], 1);
  }
  if (embossOn.value) convolve3x3(frame, [-2, -1, 0, -1, 1, 1, 0, 1, 2], 1, 128);
  ctx.putImageData(frame, 0, 0);
  drawAnnotations(ctx, natW, natH, rot, outW, outH, factor);
  renderedKey = currentRenderKey();
}

// rAF 合帧：一帧内多次触发只重绘一次（原始 ve）
function scheduleRender() {
  if (!rafId) {
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      draw();
    });
  }
}

// 显示画布重绘：按舞台尺寸×DPR 调整后备存储，清屏后把离屏内容按 transform 贴上。（原始 De）
function draw() {
  const canvasEl = canvas.value;
  if (!canvasEl) return;
  const rect = canvasEl.parentElement?.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const cssW = Math.max(1, Math.floor(rect?.width ?? 640));
  const cssH = Math.max(1, Math.floor(rect?.height ?? 480));
  if (canvasEl.width !== cssW * dpr || canvasEl.height !== cssH * dpr) {
    canvasEl.width = cssW * dpr;
    canvasEl.height = cssH * dpr;
  }
  const ctx = canvasEl.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  if (image.value) {
    if (renderedKey !== currentRenderKey()) renderOffscreen();
    ctx.save();
    ctx.translate(cssW / 2 + offsetX.value, cssH / 2 + offsetY.value);
    ctx.scale(scale.value, scale.value);
    ctx.drawImage(offscreen, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }
}

// 适应窗口：留 6% 边距，按旋转后的宽高比计算基准缩放。（原始 qe）
function fitToWindow() {
  const canvasEl = canvas.value;
  if (!canvasEl || !image.value) return;
  const rect = canvasEl.parentElement?.getBoundingClientRect();
  const cssW = rect?.width ?? 640;
  const cssH = rect?.height ?? 480;
  const margin = 0.94;
  const swapped = (((rotation.value % 360) + 360) % 360) % 180 !== 0;
  const fitW = swapped ? image.value.naturalHeight : image.value.naturalWidth;
  const fitH = swapped ? image.value.naturalWidth : image.value.naturalHeight;
  scale.value = Math.min(cssW / fitW, cssH / fitH) * margin;
  fitScale.value = scale.value;
  offsetX.value = 0;
  offsetY.value = 0;
  scheduleRender();
  emitTransform();
}

// 1:1 实际像素尺寸。（原始 Ge）
function actualSize() {
  scale.value = 1;
  offsetX.value = 0;
  offsetY.value = 0;
  scheduleRender();
  emitTransform();
}

// 还原初始视图与全部滤波参数。（原始 z）
function resetAll() {
  rotation.value = 0;
  flipH.value = false;
  flipV.value = false;
  invert.value = false;
  brightness.value = 100;
  contrast.value = 100;
  windowingOn.value = false;
  windowWidth.value = 255;
  windowCenter.value = 128;
  sharpen.value = 0;
  embossOn.value = false;
  fitToWindow();
}

// 以 (px, py) 为锚点缩放到指定倍率（锚点保持不动）。（原始 ce）
function applyZoom(nextScale, px = 0, py = 0) {
  const clamped = Math.min(32, Math.max(0.02, nextScale));
  const ratio = clamped / scale.value;
  offsetX.value = px + (offsetX.value - px) * ratio;
  offsetY.value = py + (offsetY.value - py) * ratio;
  scale.value = clamped;
  scheduleRender();
  emitTransform();
}

function zoomBy(factor, px = 0, py = 0) {
  applyZoom(scale.value * factor, px, py);
}

// 按「适应窗口」比例的倍数缩放（2×/4×/8× 按钮）。（原始 J）
function zoomFitMultiple(multiple) {
  if (image.value) applyZoom(fitScale.value * multiple);
}

// 旋转 steps 个 90°（正数顺时针）。（原始 D）
function rotateBy(steps) {
  rotation.value = (((rotation.value + steps * 90) % 360) + 360) % 360;
  scheduleRender();
  emitTransform();
}

// 窗宽窗位开关：开启时复位为默认窗（255/128）。（原始 y）
function toggleWindowing() {
  windowingOn.value = !windowingOn.value;
  if (windowingOn.value) {
    windowWidth.value = 255;
    windowCenter.value = 128;
  }
}

// 滚轮缩放：以光标相对画布中心的偏移为锚点。（原始 Y）
function onWheel(e) {
  e.preventDefault();
  const rect = canvas.value?.getBoundingClientRect();
  const anchorX = rect ? e.clientX - rect.left - rect.width / 2 : 0;
  const anchorY = rect ? e.clientY - rect.top - rect.height / 2 : 0;
  zoomBy(e.deltaY < 0 ? 1.1 : 1 / 1.1, anchorX, anchorY);
}

function startPan(e) {
  panning = true;
  panLastX = e.clientX;
  panLastY = e.clientY;
}

function panMove(e) {
  if (!panning) return;
  offsetX.value += e.clientX - panLastX;
  offsetY.value += e.clientY - panLastY;
  panLastX = e.clientX;
  panLastY = e.clientY;
  scheduleRender();
}

function panEnd() {
  if (panning) {
    panning = false;
    emitTransform();
  }
}

// 焦点在可编辑控件上时不劫持按键。（原始 oe）
function isEditableTarget(target) {
  const el = target;
  if (!el || !el.tagName) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
}

// 快捷键：悬停或画布聚焦时生效；+/- 缩放、方向键平移（步长 24px）、
// r/R 旋转、i 反相、f 适应、1 原始尺寸、0 全还原。（原始 Z）
function onKeydown(e) {
  if (isEditableTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
  if (!hovered.value && !canvasFocused.value) return;
  if (!canvas.value || !image.value) return;
  const step = 24;
  switch (e.key) {
    case '+':
    case '=':
      zoomBy(1.15);
      break;
    case '-':
      zoomBy(1 / 1.15);
      break;
    case 'ArrowLeft':
      offsetX.value -= step;
      scheduleRender();
      emitTransform();
      break;
    case 'ArrowRight':
      offsetX.value += step;
      scheduleRender();
      emitTransform();
      break;
    case 'ArrowUp':
      offsetY.value -= step;
      scheduleRender();
      emitTransform();
      break;
    case 'ArrowDown':
      offsetY.value += step;
      scheduleRender();
      emitTransform();
      break;
    case 'r':
      rotateBy(1);
      break;
    case 'R':
      rotateBy(-1);
      break;
    case 'i':
      invert.value = !invert.value;
      break;
    case 'f':
      fitToWindow();
      break;
    case '1':
      actualSize();
      break;
    case '0':
      resetAll();
      break;
    default:
      return;
  }
  e.preventDefault();
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  window.addEventListener('resize', scheduleRender);
  scheduleRender();
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  window.removeEventListener('resize', scheduleRender);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div class="film-viewer" :style="{ height }" @mouseenter="hovered = true" @mouseleave="hovered = false">
    <div class="fv-toolbar">
      <button title="放大（+）" @click="zoomBy(1.2)">
        ＋
      </button>
      <button title="缩小（-）" @click="zoomBy(1 / 1.2)">
        －
      </button>
      <button title="适应窗口（f）" @click="fitToWindow">
        适应
      </button>
      <button title="1:1 实际像素尺寸（1）" @click="actualSize">
        1:1
      </button>
      <button title="适应比例的 2 倍放大" @click="zoomFitMultiple(2)">
        2×
      </button>
      <button title="适应比例的 4 倍放大（细节判读）" @click="zoomFitMultiple(4)">
        4×
      </button>
      <button title="适应比例的 8 倍放大" @click="zoomFitMultiple(8)">
        8×
      </button>
      <button title="逆时针旋转 90°（R）" @click="rotateBy(-1)">
        ↺
      </button>
      <button title="顺时针旋转 90°（r）" @click="rotateBy(1)">
        ↻
      </button>
      <button title="水平镜像" :class="{ on: flipH }" @click="flipH = !flipH">
        ⇋
      </button>
      <button title="垂直镜像" :class="{ on: flipV }" @click="flipV = !flipV">
        ⇅
      </button>
      <button title="正反片转换 / 反相（i）" :class="{ on: invert }" @click="invert = !invert">
        ◐
      </button>
      <button title="窗宽窗位调节（灰度映射）" :class="{ on: windowingOn }" @click="toggleWindowing">
        窗
      </button>
      <button title="还原初始视图与滤波参数（0）" @click="resetAll">
        还原
      </button>
    </div>
    <div ref="stage" class="fv-stage">
      <canvas
        ref="canvas"
        tabindex="0"
        aria-label="底片查看区：+/- 缩放，方向键平移，r 旋转，i 反相，f 适应，1 原始尺寸，0 还原"
        @wheel="onWheel"
        @mousedown="startPan"
        @mousemove="panMove"
        @mouseup="panEnd"
        @mouseleave="panEnd"
        @focus="canvasFocused = true"
        @blur="canvasFocused = false"
      ></canvas>
      <div v-if="loadError" class="fv-error">{{ loadError }}</div>
      <template v-else-if="image">
        <div v-if="label" class="fv-label">{{ label }}</div>
      </template>
      <div v-else class="fv-hint">{{ label || '未载入影像' }}</div>
    </div>
    <div class="fv-filters">
      <label>亮度<input v-model.number="brightness" type="range" min="20" max="300" step="5" /></label>
      <label>对比度<input v-model.number="contrast" type="range" min="20" max="300" step="5" /></label>
      <template v-if="windowingOn">
        <label>窗宽<input v-model.number="windowWidth" type="range" min="1" max="512" step="1" /></label>
        <label>窗位<input v-model.number="windowCenter" type="range" min="0" max="255" step="1" /></label>
      </template>
      <label>锐化<input v-model.number="sharpen" type="range" min="0" max="100" step="5" /></label>
      <label class="chk"><input v-model="embossOn" type="checkbox" />浮雕</label>
    </div>
    <div class="fv-status">{{ statusText }}</div>
  </div>
</template>
