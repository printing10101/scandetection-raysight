// HTTP 核心——从 bundle 逐行对照还原（原变量名混淆，此处按语义重命名，逻辑等价）。
//
// 还原要点（字符串字面量均来自原始 bundle，未做臆测）：
// - 超时三档：默认 30s、评定/缺陷写入 120s、LLM 叙述 180s；
// - 仅"后端不可达"类错误重试：最多 2 次，退避 400ms * 2^attempt；
// - 全局事件：backend:down / backend:up（连接状态广播）、auth:unauthorized（401 时代币清理后广播）；
// - 错误统一为 ApiRequestError{status, code, detail}，message 为面向用户的中文文案。
import * as session from './session.js';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:18773/api/v1';

export const DEFAULT_TIMEOUT_MS = 30_000;
export const WRITE_TIMEOUT_MS = 120_000;
export const NARRATIVE_TIMEOUT_MS = 180_000;

const MAX_RETRIES = 2;
const RETRY_BACKOFF_MS = 400;

export const EVT_BACKEND_DOWN = 'backend:down';
export const EVT_BACKEND_UP = 'backend:up';
export const EVT_AUTH_UNAUTHORIZED = 'auth:unauthorized';

/** 桌面壳注入的受信令牌（electron/main.cjs 就绪后写入 window.__IPC_TOKEN__）。 */
function ipcToken() {
  return window.__IPC_TOKEN__ ?? null;
}

/** API 错误：status=0 表示网络层失败（code 为 TIMEOUT / BACKEND_UNREACHABLE）。 */
export class ApiRequestError extends Error {
  constructor(status, code, message, detail) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** 非成功响应 → 抛 ApiRequestError；401 额外清会话并广播 auth:unauthorized。 */
export async function throwForResponse(res) {
  const httpMessages = {
    400: '请求参数有误',
    401: '登录状态已失效，请重新登录',
    403: '当前账号无权限执行此操作',
    404: '请求的资源不存在',
    409: '与当前状态冲突，请刷新后重试',
    413: '文件超过大小上限',
    422: '提交的内容未通过校验',
    429: '请求过于频繁，请稍后再试',
    500: '服务内部错误',
    502: '推理服务不可用',
    503: '服务暂不可用，正在处理中',
  };
  let code = 'HTTP_ERROR';
  let message = httpMessages[res.status] ?? `请求失败（HTTP ${res.status}）`;
  let detail = null;
  try {
    const body = await res.json();
    if (body?.error) {
      code = body.error.code ?? code;
      message = body.error.message ?? message;
      detail = body.error.detail ?? null;
    } else if (body?.detail) {
      code = body.detail.code ?? code;
      message = body.detail.message ?? message;
    }
  } catch {
    /* 非 JSON 响应体，用默认文案 */
  }
  if (res.status === 401) {
    session.clearAuthToken();
    window.dispatchEvent(new CustomEvent(EVT_AUTH_UNAUTHORIZED));
  }
  throw new ApiRequestError(res.status, code, message, detail);
}

/** 公共请求头：操作员名恒带；已登录带 Bearer；桌面壳带 X-IPC-Token。 */
export function buildHeaders() {
  const headers = { 'X-Operator-Name': session.getOperatorName() };
  const token = session.getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const ipc = ipcToken();
  if (ipc) headers['X-IPC-Token'] = ipc;
  return headers;
}

/** 单次 fetch（带 AbortController 超时）。网络失败区分超时与不可达。 */
async function fetchOnce(path, options, timeoutMs) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiRequestError(0, 'TIMEOUT', `请求超时（>${timeoutMs / 1000}s），后端可能未响应或正在处理`, null);
    }
    window.dispatchEvent(new CustomEvent(EVT_BACKEND_DOWN));
    throw new ApiRequestError(0, 'BACKEND_UNREACHABLE', '无法连接本地推理服务，请确认服务已启动（默认地址 127.0.0.1:18773）', null);
  } finally {
    window.clearTimeout(timer);
  }
  window.dispatchEvent(new CustomEvent(EVT_BACKEND_UP));
  if (!res.ok) await throwForResponse(res);
  return res.json();
}

/**
 * 请求核心：组装公共头，仅对 BACKEND_UNREACHABLE 指数退避重试。
 * timeoutMs 见三档常量；options.body 由调用方决定是否已序列化。
 */
export async function request(path, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const headers = { ...buildHeaders(), ...options?.headers };
  const merged = { ...options, headers };
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetchOnce(path, merged, timeoutMs);
    } catch (err) {
      lastError = err;
      const retryable = err instanceof ApiRequestError && err.code === 'BACKEND_UNREACHABLE';
      if (!retryable || attempt === MAX_RETRIES) break;
      await sleep(RETRY_BACKOFF_MS * 2 ** attempt);
    }
  }
  throw lastError;
}

/** JSON POST 快捷方式。 */
export function post(path, body, timeoutMs) {
  return request(
    path,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    timeoutMs,
  );
}

/**
 * 下载任意后端文件为 Blob（报告 PDF、图像、导出包等）。
 * 可选 exportToken 走受控导出（X-Export-Token 头，由 PdfGateModal 流程签发）。
 */
export async function downloadBlob(path, { exportToken } = {}) {
  const headers = buildHeaders();
  const token = exportToken?.trim();
  if (token) headers['X-Export-Token'] = token;
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { headers });
  } catch {
    window.dispatchEvent(new CustomEvent(EVT_BACKEND_DOWN));
    throw new ApiRequestError(0, 'BACKEND_UNREACHABLE', '无法连接本地推理服务，请确认服务已启动（默认地址 127.0.0.1:18773）', null);
  }
  window.dispatchEvent(new CustomEvent(EVT_BACKEND_UP));
  if (!res.ok) await throwForResponse(res);
  return res.blob();
}

/** 给媒体 URL 追加 access_token 查询参数（img/video 标签无法自定义请求头）。 */
export function withAccessToken(url) {
  const token = session.getAuthToken();
  if (!token) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}access_token=${encodeURIComponent(token)}`;
}
