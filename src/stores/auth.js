// 认证与空闲看门狗——从 bundle 的 defineStore("auth") 区块还原（6630–6716 行）。
// 登录流：GET /auth/challenge → POST /auth/login{username, challenge_id, private_key}
//   → {token, username, role, account_id, idle_timeout_min}。
// 空闲策略：每 30s 检查一次；无操作超过 idle_timeout_min（默认 15 分钟）自动登出
//   并记录原因 idle；剩最后 90s 时 idleWarning 置真供 UI 提示；401 广播走 expired。
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as session from '../api/session.js';
import { getAuthChallenge, login as apiLogin, logout as apiLogout, getAuthMe } from '../api/endpoints.js';

const IDLE_CHECK_INTERVAL_MS = 30_000;
const IDLE_WARNING_WINDOW_MS = 90_000;

export const useAuthStore = defineStore('auth', () => {
  const token = ref(session.getAuthToken());
  const username = ref('');
  const role = ref('');
  const accountId = ref('');
  const guest = ref(session.isGuestMode());
  const isLoggedIn = computed(() => token.value !== '' || guest.value);

  let idleTimer;
  let lastActivityAt = Date.now();
  let idleTimeoutMs = 15 * 60_000;
  const idleWarning = ref(false);

  async function login(name, privateKey) {
    const challenge = await getAuthChallenge();
    const result = await apiLogin(name, challenge.challenge_id, privateKey);
    token.value = result.token;
    username.value = result.username;
    role.value = result.role;
    accountId.value = result.account_id;
    session.setAuthToken(result.token);
    idleTimeoutMs = Math.max(1, result.idle_timeout_min) * 60_000;
    lastActivityAt = Date.now();
  }

  function enterGuest() {
    guest.value = true;
    username.value = 'guest';
    role.value = 'guest';
    accountId.value = 'guest';
    session.setGuestMode();
  }

  /** 会话恢复：游客直接算已登录；有 token 则经 /auth/me 校验并回填身份。 */
  async function restore() {
    if (guest.value && !token.value) return true;
    if (!token.value) return false;
    try {
      const me = await getAuthMe();
      username.value = me.username;
      role.value = me.role;
      accountId.value = me.account_id;
      return true;
    } catch {
      return false;
    }
  }

  async function logout(reason = 'manual') {
    try {
      if (token.value) await apiLogout();
    } catch {
      /* 后端不在也要完成本地登出 */
    }
    if (reason !== 'manual') session.setLogoutReason(reason);
    reset();
  }

  function reset() {
    token.value = '';
    username.value = '';
    role.value = '';
    accountId.value = '';
    guest.value = false;
    idleWarning.value = false;
    session.clearAuthToken();
    session.clearGuestMode();
    unbindIdleWatch();
  }

  function touchActivity() {
    lastActivityAt = Date.now();
    idleWarning.value = false;
  }

  function checkIdle() {
    if (!token.value) return;
    const elapsed = Date.now() - lastActivityAt;
    if (elapsed > idleTimeoutMs) {
      logout('idle');
      return;
    }
    idleWarning.value = idleTimeoutMs - elapsed <= IDLE_WARNING_WINDOW_MS;
  }

  function onUnauthorized() {
    session.setLogoutReason('expired');
    reset();
  }

  function bindIdleWatch() {
    window.addEventListener('mousemove', touchActivity, { passive: true });
    window.addEventListener('keydown', touchActivity);
    window.addEventListener('auth:unauthorized', onUnauthorized);
    idleTimer = window.setInterval(checkIdle, IDLE_CHECK_INTERVAL_MS);
  }

  function unbindIdleWatch() {
    if (idleTimer !== undefined) {
      window.clearInterval(idleTimer);
      idleTimer = undefined;
    }
    window.removeEventListener('mousemove', touchActivity);
    window.removeEventListener('keydown', touchActivity);
    window.removeEventListener('auth:unauthorized', onUnauthorized);
  }

  return {
    token,
    username,
    role,
    accountId,
    guest,
    isLoggedIn,
    idleWarning,
    login,
    enterGuest,
    restore,
    logout,
    bindIdleWatch,
    unbindIdleWatch,
  };
});