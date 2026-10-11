// 会话凭据存取——从 bundle 原样还原（存储键名皆为原始字符串，可信）。
// - 操作员名：localStorage["scan_operator_name"]，缺省 "local"；
// - 登录令牌：sessionStorage["scan_auth_token"]（会话级，关窗即失效）；
// - 游客模式：sessionStorage["scan_guest_mode"] === "1"；
// - 登出原因：sessionStorage["scan_logout_reason"]（idle/expired/manual，跨页过渡用）。
const OPERATOR_KEY = 'scan_operator_name';
const AUTH_TOKEN_KEY = 'scan_auth_token';
const GUEST_MODE_KEY = 'scan_guest_mode';
const LOGOUT_REASON_KEY = 'scan_logout_reason';

export function getOperatorName() {
  return (localStorage.getItem(OPERATOR_KEY) ?? '').trim() || 'local';
}

export function setOperatorName(name) {
  const t = name.trim();
  if (t) localStorage.setItem(OPERATOR_KEY, t);
  else localStorage.removeItem(OPERATOR_KEY);
}

export function getAuthToken() {
  return (sessionStorage.getItem(AUTH_TOKEN_KEY) ?? '').trim();
}

export function setAuthToken(token) {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

export function isGuestMode() {
  return sessionStorage.getItem(GUEST_MODE_KEY) === '1';
}

export function setGuestMode() {
  sessionStorage.setItem(GUEST_MODE_KEY, '1');
}

export function clearGuestMode() {
  sessionStorage.removeItem(GUEST_MODE_KEY);
}

export function takeLogoutReason() {
  const reason = sessionStorage.getItem(LOGOUT_REASON_KEY);
  sessionStorage.removeItem(LOGOUT_REASON_KEY);
  return reason === 'idle' || reason === 'expired' || reason === 'manual' ? reason : null;
}

export function setLogoutReason(reason) {
  sessionStorage.setItem(LOGOUT_REASON_KEY, reason);
}
