// 应用入口——最小重建。Pinia 是否启用为高置信推断：asar 的 package.json
// 依赖里有 pinia ^2.3.1，bundle 内含 pinia 运行时。
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
// 原始构建的全部样式（vite 从各 SFC 抽取合并，class 名未混淆），重建组件直接复用。
import './styles/original.css';

createApp(App).use(createPinia()).use(router).mount('#app');
