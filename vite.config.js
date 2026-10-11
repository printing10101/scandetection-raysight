// 从构建产物逆向还原的 Vite 配置。原文件已随源码删除，此处按证据重建：
// - 使用 @vitejs/plugin-vue（bundle 为标准 Vue3 SFC 编译产物）；
// - base 保持默认 "/"（dist/index.html 以根绝对路径 /assets/... 引用资源，
//   生产经 app://scandetection 协议伺服，路径从协议根解析）；
// - VITE_API_BASE 在生产构建时被内联为 http://127.0.0.1:18773/api/v1
//   （见 electron/main.cjs 的 PROD_CSP 注释），开发态经 .env.development 覆盖。
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
