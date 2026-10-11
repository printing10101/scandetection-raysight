// 报告/印字共享小工具——从 bundle 模块级函数还原（原变量名混淆，按语义重命名）。
// 印字徽标 stampBadge：bundle 7104–7125 行（原 tn）；文本截断：7099–7102 行（原 hp）。
// 后续视图（ArchiveView/ResultBanner 等）重建时复用本文件；
// 错误文案兜底（原 Ae）与文件名清洗（原 zi）留给对应流程重建时补齐。

/** 文本截断：首尾去空白后超过 max 位以省略号结尾；空白串返回 ""。 */
function truncateText(text, max = 24) {
  const trimmed = (text ?? '').trim();
  if (!trimmed) return '';
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

/**
 * 底片印字识别徽标：入参为印字摘要对象
 * { status: 'present'|'missing', text, orientation, need_review|needReview }。
 * status 不是 present/missing（或对象为空）时返回 null，调用方不渲染徽标。
 */
export function stampBadge(stamp) {
  if (!stamp || !stamp.status) return null;
  const text = truncateText(stamp.text);
  const titleWithText = (prefix) => (text ? `${prefix}（${text}）` : prefix);
  if (stamp.status === 'present') {
    if (stamp.orientation === 'mirrored') {
      return {
        label: text ? `镜像 ${text}` : '印字·镜像',
        cls: 'ok',
        title: titleWithText('识别到印字（镜像：底片背面扫描，文字左右翻转）'),
      };
    }
    return {
      label: text ? `正向 ${text}` : '印字·正向',
      cls: 'ok',
      title: titleWithText('识别到印字（正向）'),
    };
  }
  if (stamp.status === 'missing') {
    if (stamp.need_review || stamp.needReview) {
      return {
        label: '无印字·待复核',
        cls: 'warn',
        title: '未识别到日期/编号印字，需人工复核确认底片身份',
      };
    }
    return {
      label: '无印字',
      cls: 'muted',
      title: '未识别到日期/编号印字（未触发人工复核：小批量未裁决或该批已按印字占比豁免）',
    };
  }
  return null;
}
