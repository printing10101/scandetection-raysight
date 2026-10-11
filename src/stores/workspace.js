// 工作区 store——从 bundle 的 defineStore("workspace") 区块还原（7863–7880 行，
// 操作员持久化 helpers 在 6102–6111 行）。
// operator：检测人员姓名（localStorage 持久化，缺省 "local"）。
// pendingFileOpen / requestFileOpen：菜单栏"打开文件"动作的中转——
// 菜单发出请求（"image"/"batch"），目标视图监听到后自动弹出文件选择框。
import { defineStore } from 'pinia';
import { ref } from 'vue';

const OPERATOR_STORAGE_KEY = 'scan_operator_name';

function readOperator() {
  return (localStorage.getItem(OPERATOR_STORAGE_KEY) ?? '').trim() || 'local';
}

function persistOperator(name) {
  const trimmed = name.trim();
  if (trimmed) localStorage.setItem(OPERATOR_STORAGE_KEY, trimmed);
  else localStorage.removeItem(OPERATOR_STORAGE_KEY);
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const operator = ref(readOperator());

  function setOperator(name) {
    persistOperator(name);
    operator.value = readOperator();
  }

  const pendingFileOpen = ref(null);

  function requestFileOpen(target) {
    pendingFileOpen.value = target;
  }

  return { operator, setOperator, pendingFileOpen, requestFileOpen };
});
