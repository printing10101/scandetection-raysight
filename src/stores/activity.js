// 全局活动评定标记——从 bundle 原样还原（7881 行的模块级 Bt = w(null)）。
// 取值："batch"（批量评定进行中）/ "journey"（单幅评定进行中）/ null（空闲）。
// 消费方是 App 根组件的退出守护（bundle 13663–13703 行）：
//   - 桌面端据此 setBusy / 弹"关闭窗口确认"；
//   - 浏览器端挂 beforeunload 阻止误关。
// 注意：批量/单幅视图结束后必须把值清回 null（各视图自己负责）。
import { ref } from 'vue';

export const activeEvaluation = ref(null);
