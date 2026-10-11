<script setup>
// 账号管理——从 bundle 的 __name:"AdminView" 区块还原（12633–12860 行）。
// 三员账号全生命周期：列表、创建并签发 SM2 密钥、重新签发、启停。
// 私钥仅在创建/重签时一次性展示（系统不留存副本）；停用即时吊销会话，
// 走 ConfirmDialog 二次确认，启用无破坏性直接执行。
// 仅系统管理员可见完整页面，其余身份显示无权限提示。
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import {
  listAccounts,
  createAccount,
  createAccountKeypair,
  setAccountStatus,
} from '../api/endpoints.js';
import { errToMessage, copyToClipboard } from '../utils/helpers.js';
import ConfirmDialog from '../components/ConfirmDialog.vue';

const auth = useAuthStore();
const isSysadmin = computed(() => auth.role === 'sysadmin');

// ---- 账号列表 ----
const accounts = ref([]);
const loading = ref(false);
const error = ref(null); // 各操作共享的错误位（bundle 原实现如此）
const notice = ref(null); // 操作成功提示

// 岗位角色 → 中文展示名（未知角色原样兜底展示）
const roleLabels = {
  sysadmin: '系统管理员',
  secadmin: '安全保密管理员',
  auditor: '安全审计员',
};

async function loadAccounts() {
  loading.value = true;
  error.value = null;
  try {
    accounts.value = await listAccounts();
  } catch (err) {
    error.value = errToMessage(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (isSysadmin.value) loadAccounts();
});

// ---- 新建账号并签发密钥 ----
const newUsername = ref('');
const newRole = ref('auditor');
const creating = ref(false);
const keyInfo = ref(null); // { username, privateKey }
const copyState = ref(''); // '' | 'ok' | 'fail'

async function createAndIssueKey() {
  notice.value = null;
  const name = newUsername.value.trim();
  if (!name) {
    error.value = '请输入新账号名。';
    return;
  }
  creating.value = true;
  error.value = null;
  try {
    const created = await createAccount({ username: name, role: newRole.value });
    const keypair = await createAccountKeypair(created.account_id);
    keyInfo.value = { username: created.username, privateKey: keypair.private_key };
    copyState.value = '';
    newUsername.value = '';
    await loadAccounts();
  } catch (err) {
    error.value = errToMessage(err);
  } finally {
    creating.value = false;
  }
}

// ---- 重新签发密钥（旧私钥立即失效）----
async function reissueKey(account) {
  notice.value = null;
  error.value = null;
  try {
    const keypair = await createAccountKeypair(account.account_id);
    keyInfo.value = { username: account.username, privateKey: keypair.private_key };
    copyState.value = '';
  } catch (err) {
    error.value = errToMessage(err);
  }
}

async function copyKey() {
  if (!keyInfo.value) return;
  copyState.value = (await copyToClipboard(keyInfo.value.privateKey)) ? 'ok' : 'fail';
}

// ---- 启用 / 停用 ----
const confirmTarget = ref(null); // 待停用的账号
const toggling = ref(false);

function requestToggle(account) {
  if (account.status === 'disabled') {
    toggleStatus(account);
  } else {
    confirmTarget.value = account;
  }
}

async function toggleStatus(account) {
  toggling.value = true;
  error.value = null;
  try {
    const next = account.status === 'disabled' ? 'active' : 'disabled';
    await setAccountStatus(account.account_id, next);
    notice.value = next === 'disabled'
      ? `账号「${account.username}」已停用并吊销其全部会话。`
      : `账号「${account.username}」已启用。`;
    await loadAccounts();
  } catch (err) {
    error.value = errToMessage(err);
  } finally {
    toggling.value = false;
    confirmTarget.value = null;
  }
}
</script>

<template>
  <div>
    <h1 class="title-zine" data-t="账号管理"> 账号管理 </h1>
    <div class="lede"> 三员账号全生命周期管理（一人一岗）；账号停用即时吊销会话，私钥可重新签发（一次性展示） </div>

    <template v-if="isSysadmin">
      <p v-if="error" class="err show"> ⚠ {{ error }} </p>
      <p v-else-if="notice" class="ok-msg"> ✓ {{ notice }} </p>

      <div class="section-h"><span class="no">1</span>新建账号 </div>
      <div class="create-row">
        <input
          v-model="newUsername"
          placeholder="新账号名（如 zhangsan）"
          @keyup.enter="createAndIssueKey"
        />
        <select v-model="newRole">
          <option value="sysadmin"> 系统管理员 </option>
          <option value="secadmin"> 安全保密管理员 </option>
          <option value="auditor"> 安全审计员 </option>
        </select>
        <button class="btn" type="button" :disabled="creating" @click="createAndIssueKey">
          {{ creating ? '创建中…' : '创建并签发密钥 →' }}
        </button>
      </div>

      <div v-if="keyInfo" class="key-panel" role="alert">
        <p class="kp-title"> ⚠ 账号「{{ keyInfo.username }}」的 SM2 私钥（仅此一次展示，系统不留存副本） </p>
        <textarea
          class="keyout"
          readonly
          :value="keyInfo.privateKey"
          rows="4"
          @focus="(e) => e.target.select()"
        ></textarea>
        <div class="kp-acts">
          <button type="button" class="btn" @click="copyKey"> 复制私钥 </button>
          <span v-if="copyState === 'ok'" class="cp-ok">✓ 已复制到剪贴板</span>
          <span v-else-if="copyState === 'fail'" class="cp-fail">复制失败：请在上面的文本框内手动全选复制，关闭本面板后将无法再次查看。</span>
          <button type="button" class="btn ghost" style="margin-left: auto" @click="keyInfo = null"> 我已妥善保存，关闭 </button>
        </div>
      </div>

      <div class="section-h"><span class="no">2</span>账号列表 </div>
      <p v-if="loading" class="hint"> 加载中… </p>
      <p v-else-if="accounts.length === 0" class="empty"> 暂无账号。 </p>
      <table v-else>
        <thead>
          <tr>
            <th>账号名</th>
            <th>岗位角色</th>
            <th>状态</th>
            <th>连续失败次数</th>
            <th>锁定至</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in accounts" :key="account.account_id">
            <td>{{ account.username }}</td>
            <td>{{ roleLabels[account.role] ?? account.role }}</td>
            <td>
              <span :class="['lv', { disabled: account.status !== 'active' }]">{{ account.status === 'active' ? '启用' : '停用' }}</span>
            </td>
            <td>{{ account.failed_attempts }}</td>
            <td>{{ account.locked_until ?? '—' }}</td>
            <td>{{ account.created_at ?? '—' }}</td>
            <td class="ops">
              <button type="button" class="btn link" :disabled="toggling" @click="requestToggle(account)">{{ account.status === 'active' ? '停用' : '启用' }}</button>
              <button type="button" class="btn link" :disabled="toggling" @click="reissueKey(account)"> 重新签发密钥… </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="hint"> 「重新签发密钥」会使旧私钥立即失效（私钥丢失或疑似泄露时使用）；新私钥仅展示一次。 </p>
    </template>

    <div v-else class="empty"> 本页面仅系统管理员可用。当前登录身份无权限查看账号管理。 </div>

    <ConfirmDialog
      :open="confirmTarget !== null"
      title="停用账号确认"
      :message="`停用后账号「${confirmTarget?.username ?? ''}」将立即无法登录，其全部会话被吊销；可随时再启用。确认停用？`"
      confirm-text="停用账号"
      danger
      @confirm="confirmTarget && toggleStatus(confirmTarget)"
      @cancel="confirmTarget = null"
    />
  </div>
</template>
