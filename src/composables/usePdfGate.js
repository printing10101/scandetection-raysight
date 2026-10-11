// 受控导出门禁控制器——从 bundle 的 xo 组合式函数（7131–7232 行）还原。
// 流程：视图调 openPdf(reportId, name) → 无密级限制时直接下载；后端要求审批时
// 抛 EXPORT_TOKEN_REQUIRED → 打开门禁面板（PdfGateModal 经 ctrl prop 接收这些状态），
// 每 5s 轮询申请状态，批准后 fetchTokenAndDownload 换一次性令牌完成下载。
// secadmin（安全保密管理员）不受门禁限制，直接经带 access_token 的 URL 打开。
import { ref, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { downloadBlob, ApiRequestError } from '../api/http.js';
import { requestExport, getExportToken, getExportRequest, mediaUrl } from '../api/endpoints.js';
import { API_BASE } from '../api/http.js';
import { errToMessage, sanitizeFilename } from '../utils/helpers.js';

const POLL_INTERVAL_MS = 5000;
const REVOKE_DELAY_MS = 4000;

/** 每个报告的导出申请编号记忆（会话级，重开面板可续查进度）。 */
function requestKey(reportId) {
  return `export_req_${reportId}`;
}

/** 触发浏览器下载。 */
function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

export function usePdfGate() {
  const auth = useAuthStore();
  const gateOpen = ref(false);
  const gateBusy = ref(false);
  const gateMsg = ref(null);
  const gateErr = ref(null);
  const gateReason = ref('');
  const reportId = ref(null);
  const requestId = ref(null);
  const approval = ref(null);
  let pollTimer;

  async function pollApproval() {
    if (!requestId.value || !gateOpen.value) return;
    try {
      const req = await getExportRequest(requestId.value);
      if (req.status !== approval.value) {
        approval.value =
          req.status === 'approved' ? 'approved' : req.status === 'rejected' ? 'rejected' : 'pending';
        if (approval.value === 'approved') {
          gateMsg.value = '申请已批准，点击「领取令牌并下载」完成导出。';
        } else if (approval.value === 'rejected') {
          gateErr.value = '导出申请被安全保密管理员驳回，如需导出请重新申请并补充理由。';
        }
      }
    } catch {
      /* 轮询失败静默，下一轮再试 */
    }
  }

  function startPolling() {
    stopPolling();
    pollTimer = window.setInterval(() => void pollApproval(), POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer !== undefined) {
      window.clearInterval(pollTimer);
      pollTimer = undefined;
    }
  }

  async function openPdf(id, name) {
    reportId.value = id;
    const filename = `${sanitizeFilename(name ?? id)}.pdf`;
    if (auth.role === 'secadmin') {
      // 安全保密管理员：免门禁，直接经带会话令牌的 URL 打开
      window.open(mediaUrl(`${API_BASE}/report/${encodeURIComponent(id)}/pdf`), '_blank', 'noopener');
      reportId.value = null;
      return;
    }
    gateBusy.value = true;
    gateErr.value = null;
    gateMsg.value = null;
    try {
      saveBlob(await downloadBlob(`/report/${encodeURIComponent(id)}/pdf`), filename);
      reportId.value = null;
      return;
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'EXPORT_TOKEN_REQUIRED') {
        requestId.value = sessionStorage.getItem(requestKey(id));
        approval.value = null;
        gateOpen.value = true;
        startPolling();
      } else {
        gateOpen.value = true;
        gateErr.value = errToMessage(err);
      }
    } finally {
      gateBusy.value = false;
    }
  }

  async function applyExportRequest() {
    if (!reportId.value) return;
    gateBusy.value = true;
    gateErr.value = null;
    gateMsg.value = null;
    try {
      const req = await requestExport(`report:${reportId.value}`, gateReason.value.trim() || undefined);
      requestId.value = req.request_id;
      sessionStorage.setItem(requestKey(reportId.value), req.request_id);
      approval.value = 'pending';
      gateMsg.value = '申请已提交，等待安全保密管理员审批；批准后本面板会提示，届时点击「领取令牌并下载」。';
      startPolling();
    } catch (err) {
      gateErr.value = errToMessage(err);
    } finally {
      gateBusy.value = false;
    }
  }

  async function fetchTokenAndDownload() {
    if (!requestId.value || !reportId.value) return;
    gateBusy.value = true;
    gateErr.value = null;
    gateMsg.value = null;
    try {
      const result = await getExportToken(requestId.value);
      saveBlob(
        await downloadBlob(`/report/${encodeURIComponent(reportId.value)}/pdf`, { exportToken: result.token }),
        `${sanitizeFilename(reportId.value)}.pdf`,
      );
      sessionStorage.removeItem(requestKey(reportId.value));
      requestId.value = null;
      gateOpen.value = false;
      stopPolling();
      reportId.value = null;
    } catch (err) {
      gateErr.value = errToMessage(err);
    } finally {
      gateBusy.value = false;
    }
  }

  function setReason(reason) {
    gateReason.value = reason;
  }

  function closeGate() {
    gateOpen.value = false;
    stopPolling();
    gateErr.value = null;
    gateMsg.value = null;
    gateReason.value = '';
    reportId.value = null;
  }

  onUnmounted(stopPolling);

  return {
    gateOpen,
    gateBusy,
    gateMsg,
    gateErr,
    gateReason,
    reportId,
    requestId,
    approval,
    openPdf,
    applyExportRequest,
    fetchTokenAndDownload,
    setReason,
    closeGate,
  };
}
