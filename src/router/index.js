// 路由表与守卫——按 bundle 路由注册处原样还原（docs/bundle-pretty-reference.js 13269–13323 行）。
// 平铺路由（非嵌套布局）：登录页与 AppShell 由 App 根组件按 route.name 二选一直接渲染，
// AppShell 内部自带 RouterView，因此根路由不能把 AppShell 挂成父级（否则无限嵌套自身）。
// history 用 hash 模式（bundle 的 vf() 即 createWebHashHistory，app:// 协议下最稳妥）。
import { createRouter, createWebHashHistory } from 'vue-router';
import { getAuthToken, isGuestMode } from '../api/session.js';
import LoginView from '../views/LoginView.vue';
import JourneyView from '../views/JourneyView.vue';
import BatchView from '../views/BatchView.vue';
import ArchiveView from '../views/ArchiveView.vue';
import DeviceView from '../views/DeviceView.vue';
import ViewerView from '../views/ViewerView.vue';
import StdEvalView from '../views/StdEvalView.vue';
import AdminView from '../views/AdminView.vue';
import LlmView from '../views/LlmView.vue';

const routes = [
  { path: '/', redirect: '/journey' },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/journey', name: 'journey', component: JourneyView },
  { path: '/batch', name: 'batch', component: BatchView },
  { path: '/archive', name: 'archive', component: ArchiveView },
  { path: '/device', name: 'device', component: DeviceView },
  { path: '/viewer', name: 'viewer', component: ViewerView },
  { path: '/std-eval', name: 'std-eval', component: StdEvalView },
  { path: '/admin', name: 'admin', component: AdminView },
  { path: '/llm', name: 'llm', component: LlmView },
];

const router = createRouter({ history: createWebHashHistory(), routes });

// 与 bundle 一致：有令牌或游客模式即视为已登录，否则压到登录页；
// 已登录访问 /login 弹回 /journey。
router.beforeEach((to) => {
  const authed = getAuthToken() !== '' || isGuestMode();
  if (!authed && to.name !== 'login') return { name: 'login' };
  if (authed && to.name === 'login') return { name: 'journey' };
  return true;
});

export default router;
