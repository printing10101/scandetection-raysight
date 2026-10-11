// 共享小工具——从 bundle 原样还原（7095–7129 行）。

/** 任意抛出物 → 用户可读文案（Error.message 优先，兜底固定提示）。 */
export function errToMessage(err) {
  return err instanceof Error && err.message
    ? err.message
    : typeof err === 'string' && err.trim()
      ? err
      : '操作失败，请重试；若持续出现请联系系统管理员查看服务日志。';
}

/** 截断到 maxLen（默认 24）加省略号；空白返回空串。 */
export function truncate(text, maxLen = 24) {
  const t = (text ?? '').trim();
  if (!t) return '';
  return t.length > maxLen ? `${t.slice(0, maxLen)}…` : t;
}

/** 文件名净化：非法字符换下划线，限长 120。 */
export function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_').slice(0, 120);
}

/** 复制文本到剪贴板——从 bundle 原样还原（11092–11106 行）。
 * 优先 Clipboard API；失败或不可用时回退隐藏 textarea + execCommand。
 * 返回是否成功，由调用方决定"已复制/复制失败"文案。 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 落到 execCommand 兜底 */
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.remove();
    return ok;
  } catch {
    return false;
  }
}
