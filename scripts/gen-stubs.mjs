// 生成 src/views/ 下的视图桩组件与 AppShell 布局桩。
// 用途：让还原工程的 `npm run dev` 立即可跑；每个桩标注了从 bundle 恢复的
// 原始组件名，重建真正的 UI 时直接在桩内填充。
// 用法：node scripts/gen-stubs.mjs（幂等：已存在的文件不覆盖）
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const viewsDir = join(root, 'src', 'views');
mkdirSync(viewsDir, { recursive: true });

const views = [
  ['LoginView', '登录（challenge → /auth/login，含游客模式 scan_guest_mode）'],
  ['FilmViewer', '胶片影像查看器（上传/预处理/检测/评定/报告的主工作面）'],
  ['BatchView', '批量检测队列（POST /batch 上传，含进度回调）'],
  ['ArchiveView', '档案/记录检索'],
  ['DeviceView', '设备管理（含 /devices/{id}/calibrations 校准）'],
  ['StdEvalView', '标准评定（std-eval）'],
  ['LlmView', 'LLM 叙述报告（/llm/status、/llm/models）'],
  ['JourneyView', '历程/追溯视图'],
  ['AdminView', '系统管理（用户/审计）'],
];

for (const [name, hint] of views) {
  const file = join(viewsDir, `${name}.vue`);
  if (existsSync(file)) continue;
  writeFileSync(
    file,
    `<script setup>
// 【还原桩】原始组件随源码删除，此处为占位。
// 重建线索：${hint}
// 完整逻辑参考 dist/assets/index.pretty.js（美化后的原始构建产物）。
</script>

<template>
  <section class="view">
    <h2>${name}</h2>
    <p>视图源码待从 bundle 重建。线索见文件头注释与 docs/恢复报告.md。</p>
  </section>
</template>
`,
    'utf8',
  );
  console.log('stub:', file);
}

const shell = join(root, 'src', 'AppShell.vue');
if (!existsSync(shell)) {
  writeFileSync(
    shell,
    `<script setup>
// 【还原桩】应用布局壳：bundle 中的组件清单显示 Chrome 区由
// MenuBar / RibbonBar / StatusBar 三个组件构成，此处先给最小布局。
</script>

<template>
  <div class="app-shell">
    <nav class="nav">
      <RouterLink to="/viewer">影像</RouterLink>
      <RouterLink to="/batch">批量</RouterLink>
      <RouterLink to="/archive">档案</RouterLink>
      <RouterLink to="/device">设备</RouterLink>
      <RouterLink to="/std-eval">标准评定</RouterLink>
      <RouterLink to="/llm">LLM</RouterLink>
      <RouterLink to="/journey">历程</RouterLink>
      <RouterLink to="/admin">管理</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>
`,
    'utf8',
  );
  console.log('stub:', shell);
}

// 从 bundle 恢复的共享组件清单，重建时按名对齐。
const componentsNote = `# 从 bundle 恢复的共享组件名（变量名已混淆，名字可信）

AppShell, MenuBar, RibbonBar, StatusBar, Stepper, UploadPanel, PipelineTrack,
BatchProgress, ResultBanner, DispositionPanel, ReviewPanel, ReportNotices,
ConfirmDialog, PdfGateModal, FilmViewer(含 ReportView 子视图,不占路由)
`;
const noteFile = join(root, 'src', 'components', 'COMPONENTS.md');
mkdirSync(dirname(noteFile), { recursive: true });
if (!existsSync(noteFile)) writeFileSync(noteFile, componentsNote, 'utf8');
console.log('done');
