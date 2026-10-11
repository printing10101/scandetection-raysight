// 全部后端端点——从 bundle 的 API 函数区（docs/bundle-pretty-reference.js 6242–6617 行）
// 逐个还原。端点路径与查询参数为原始字符串；函数名为重建时的语义命名。
// 超时档位：默认 30s、写入/评定 120s、叙述 180s。
import * as session from './session.js';
import {
  request,
  post,
  downloadBlob,
  withAccessToken,
  buildHeaders,
  throwForResponse,
  ApiRequestError,
  API_BASE,
  WRITE_TIMEOUT_MS,
  NARRATIVE_TIMEOUT_MS,
  EVT_AUTH_UNAUTHORIZED,
  EVT_BACKEND_DOWN,
} from './http.js';

// ---- 健康 / 报告 ------------------------------------------------------------
export const getHealth = () => request('/health');

/** 创建检测报告。原实现 body 原样透传（由调用方序列化），超时 120s。 */
export const createReport = (body) => request('/report', { method: 'POST', body }, WRITE_TIMEOUT_MS);
export const verifyReport = (reportId) => request(`/report/${reportId}/verify`, { method: 'POST' });
export const getReportDetections = (reportId) => request(`/report/${reportId}/detections`);
/** LLM 叙述生成，180s 长超时。 */
export const getReportNarrative = (reportId) => request(`/report/${reportId}/narrative`, {}, NARRATIVE_TIMEOUT_MS);
export const downloadReportPdf = (reportId) => downloadBlob(`/report/${encodeURIComponent(reportId)}/pdf`);

// ---- 记录检索（档案页）-------------------------------------------------------
export function listRecords({ level, workpiece, classId, dateFrom, dateTo, needReview, page = 1, size = 50 } = {}) {
  const params = new URLSearchParams();
  if (level) params.set('level', level);
  if (workpiece) params.set('workpiece', workpiece);
  if (classId !== undefined) params.set('class', String(classId));
  if (dateFrom) params.set('from', dateFrom);
  if (dateTo) params.set('to', dateTo);
  if (needReview !== undefined) params.set('need_review', needReview ? 'true' : 'false');
  params.set('page', String(page));
  params.set('size', String(size));
  return request(`/records?${params}`);
}

// ---- 评定 / 主动学习 ---------------------------------------------------------
export const submitReview = (body) => post('/review', body);
export const exportActiveSamples = (body) => post('/active/export', body);
export const getActivePool = () => request('/active/pool');

// ---- 批量检测 ----------------------------------------------------------------
/** 批量上传：原实现用 XHR 以支持上传进度回调，10 分钟超时。 */
export function uploadBatch(formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/batch`);
    xhr.timeout = 600_000;
    const token = session.getAuthToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('X-Operator-Name', session.getOperatorName());
    const ipc = window.__IPC_TOKEN__ ?? null;
    if (ipc) xhr.setRequestHeader('X-IPC-Token', ipc);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new ApiRequestError(0, 'BAD_RESPONSE', '服务响应格式异常', null));
        }
        return;
      }
      let code = 'HTTP_ERROR';
      let message = `提交失败（HTTP ${xhr.status}）`;
      try {
        const body = JSON.parse(xhr.responseText);
        code = body?.error?.code ?? body?.detail?.code ?? code;
        message = body?.error?.message ?? body?.detail?.message ?? message;
      } catch {
        /* 保底文案 */
      }
      if (xhr.status === 401) {
        session.clearAuthToken();
        window.dispatchEvent(new CustomEvent(EVT_AUTH_UNAUTHORIZED));
      }
      reject(new ApiRequestError(xhr.status, code, message, null));
    };
    xhr.onerror = () => {
      window.dispatchEvent(new CustomEvent(EVT_BACKEND_DOWN));
      reject(new ApiRequestError(0, 'BACKEND_UNREACHABLE', '无法连接本地推理服务，请确认服务已启动', null));
    };
    xhr.ontimeout = () => {
      reject(new ApiRequestError(0, 'TIMEOUT', '上传超时（>10 分钟），请减少单批数量后重试', null));
    };
    xhr.send(formData);
  });
}
export const getBatch = (batchId) => request(`/batch/${batchId}`);
export const listBatches = () => request('/batches');
export const cancelBatch = (batchId) => request(`/batch/${batchId}/cancel`, { method: 'POST' });
export const pauseBatch = (batchId) => request(`/batch/${batchId}/pause`, { method: 'POST' });
export const resumeBatch = (batchId) => request(`/batch/${batchId}/resume`, { method: 'POST' });
export const retryBatch = (batchId) => request(`/batch/${batchId}/retry`, { method: 'POST' });
export const resolveDedup = (batchId, decisions) =>
  request(`/batch/${batchId}/dedup/resolve`, { method: 'POST', body: JSON.stringify({ decisions }) });

// ---- 设备管理 ----------------------------------------------------------------
export const listDevices = () => request('/devices');
export const createDevice = (body) => post('/devices', body);
export const getDevice = (deviceId) => request(`/devices/${deviceId}`);
export const addCalibration = (deviceId, body) =>
  request(`/devices/${deviceId}/calibrations`, { method: 'POST', body: JSON.stringify(body) });

// ---- 缺陷复核 ----------------------------------------------------------------
export const submitReviewDefects = (reviewId, body) =>
  request(`/review/${reviewId}/defects`, { method: 'POST', body: JSON.stringify(body) }, WRITE_TIMEOUT_MS);
export const patchReviewDefect = (defectId, body) =>
  request(`/review/defects/${defectId}`, { method: 'PATCH', body: JSON.stringify(body) }, WRITE_TIMEOUT_MS);
/** 删除复核缺陷；reason 必填（审计）。 */
export const deleteReviewDefect = (defectId, reason) =>
  request(`/review/defects/${defectId}?${new URLSearchParams({ reason })}`, { method: 'DELETE' }, WRITE_TIMEOUT_MS);

// ---- 标准评定 ----------------------------------------------------------------
export const getStdEvalPersonnel = () => request('/std-eval/personnel');
export const putStdEvalPersonnel = (people) =>
  request('/std-eval/personnel', { method: 'PUT', body: JSON.stringify({ people }) });
export const createStdEvalRecord = (body) => post('/std-eval/record', body);
export const downloadStdEvalPdf = (recordName) =>
  downloadBlob(`/std-eval/record/pdf?record_name=${encodeURIComponent(recordName)}`);
export const getStdEvalHistory = () => request('/std-eval/history');

// ---- 受控导出（PdfGateModal 流程）---------------------------------------------
export const requestExport = (subject, reason) => post('/export/requests', { subject, reason: reason || null });
export const getExportToken = (requestId) => post(`/export/requests/${encodeURIComponent(requestId)}/token`, {});
export const getExportRequest = (requestId) => request(`/export/requests/${encodeURIComponent(requestId)}`);

// ---- 账户 / 认证（challenge + 私钥签名）----------------------------------------
export const getAuthChallenge = () => request('/auth/challenge');
export const login = (username, challengeId, privateKey) =>
  request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, challenge_id: challengeId, private_key: privateKey }),
  });
export const bootstrapAdmin = (body) => post('/auth/bootstrap', body);
export const logout = () => request('/auth/logout', { method: 'POST' });
export const getAuthMe = () => request('/auth/me');
export const listAccounts = () => request('/auth/accounts');
export const createAccount = (body) => post('/auth/accounts', body);
export const createAccountKeypair = (username) =>
  request(`/auth/accounts/${encodeURIComponent(username)}/keypair`, { method: 'POST' });
export const setAccountStatus = (username, status) =>
  request(`/auth/accounts/${encodeURIComponent(username)}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
export const getBootstrapStatus = () => request('/auth/bootstrap/status');

// ---- 图像 ----------------------------------------------------------------------
export async function fetchImagePreview(imageId) {
  const res = await fetch(`${API_BASE}/images/${encodeURIComponent(imageId)}/preview.png`, {
    headers: buildHeaders(),
  });
  if (!res.ok) await throwForResponse(res);
  return res.blob();
}

// ---- 本地模型（LLM 页）----------------------------------------------------------
export const getLlmStatus = () => request('/llm/status', { method: 'GET' }, 30_000);
export const getLlmModels = (includeServices = true) =>
  request(`/llm/models?include_services=${includeServices ? 'true' : 'false'}`, { method: 'GET' }, 60_000);
export const startLlmScan = () => request('/llm/scan', { method: 'POST' });
export const cancelLlmScan = () => request('/llm/scan/cancel', { method: 'POST' });
export const selectLlmModel = (modelId) =>
  request(`/llm/models/${encodeURIComponent(modelId)}/select`, { method: 'POST' }, 60_000);
export const clearLlmSelection = () => request('/llm/selection', { method: 'DELETE' }, 60_000);
export const addLlmDir = (path) => request('/llm/dirs', { method: 'POST', body: JSON.stringify({ path }) });
export const removeLlmDir = (path) => request(`/llm/dirs?path=${encodeURIComponent(path)}`, { method: 'DELETE' });

// 媒体 URL（img/video 标签无法带请求头）：追加 access_token 查询参数。
export { withAccessToken as mediaUrl };
