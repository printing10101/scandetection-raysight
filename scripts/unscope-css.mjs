// 将原始构建 CSS 的 scoped 属性选择器（[data-v-xxxxxxxx]）剥离为全局规则。
// 原因：作用域哈希源自原始构建的源文件，重建组件无法复现相同 data-v 属性；
// 重建组件已逐字保留原始 class 名，去属性后规则即可精确命中。
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../src/styles/original.css', import.meta.url);
const css = readFileSync(file, 'utf8');
const stripped = css.replace(/\[data-v-[a-f0-9]+\]/g, '');
writeFileSync(file, stripped);
console.log('stripped', (css.length - stripped.length) / '[data-v-xxxxxxxx]'.length, 'scoped attrs');
