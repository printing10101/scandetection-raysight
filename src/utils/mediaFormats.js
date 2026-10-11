// 影像格式常量与判断——从 bundle 原样还原（7748–7756 行）。
// 允许导入的扩展名清单、<input type="file"> 的 accept 值、
// 以及"本机能直接解码预览"的扩展名清单（DICOM/HEIC 等由后端转档，不做本机预览）。

/** 系统支持的影像扩展名（批量/单幅导入共用）。 */
export const ALLOWED_IMAGE_EXTENSIONS = [
  'dcm', 'dicom', 'ima', 'png', 'jpg', 'jpeg', 'jfif', 'bmp', 'gif', 'webp',
  'tif', 'tiff', 'avif', 'heic', 'heif', 'pgm', 'ppm', 'pnm', 'ico',
];

/** 文件选择框 accept 属性值（".dcm,.dicom,..."）。 */
export const IMAGE_ACCEPT = ALLOWED_IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(',');

/** 本机可直接解码出缩略图的扩展名；其余格式交给后端转档。 */
const PREVIEWABLE_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'jfif', 'bmp', 'gif', 'webp', 'avif', 'ico'];

/** 按文件名扩展名判断是否可本机预览。 */
export function isPreviewableImage(name) {
  const ext = (name.split('.').pop() ?? '').toLowerCase() ?? '';
  return PREVIEWABLE_IMAGE_EXTENSIONS.includes(ext);
}
