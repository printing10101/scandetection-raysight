<script setup>
// 登录视图——从 bundle 的 __name:"LoginView" 区块还原（11151–11427 行）。
// SM2 挑战—响应登录（选私钥证书文件 → auth.login）；游客模式（服务端开关 guest_mode）；
// 首次部署引导窗口（needs_bootstrap 时默认展开）：创建账号并签发 SM2 软证书，
// 私钥仅此一次展示，提供复制（剪贴板 API 失败退回 execCommand）。
// 进入页面读一次登出原因（idle/expired），展示"为何回到登录页"提示。
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { takeLogoutReason } from '../api/session.js';
import { bootstrapAdmin, getBootstrapStatus } from '../api/endpoints.js';
import { ApiRequestError } from '../api/http.js';
import { copyToClipboard } from '../utils/helpers.js';

const router = useRouter();
const auth = useAuthStore();

const username = ref('');
const privateKey = ref('');
const keyFileName = ref('');
const busy = ref(false);
const error = ref('');

// 引导窗口：服务端 needs_bootstrap 时默认展开
const needsBootstrap = ref(false);
const bootstrapName = ref('');
const bootstrapRole = ref('sysadmin');
const issuedKey = ref('');

// 游客模式开关（服务端 guest_mode；状态获取失败时按可用呈现）
const guestAllowed = ref(true);
const logoutNotice = ref(null);

onMounted(async () => {
  const reason = takeLogoutReason();
  if (reason === 'idle') {
    logoutNotice.value = '因长时间无操作，会话已自动退出，请重新登录。';
  } else if (reason === 'expired') {
    logoutNotice.value = '登录状态已过期，请重新登录。';
  }
  try {
    const status = await getBootstrapStatus();
    guestAllowed.value = status.guest_mode;
    if (status.needs_bootstrap) needsBootstrap.value = true;
  } catch {
    /* 引导状态不可得时按默认界面呈现 */
  }
});

async function onKeyFileChange(e) {
  const picked = e.target.files?.[0];
  if (!picked) return;
  keyFileName.value = picked.name;
  privateKey.value = (await picked.text()).trim();
}

function goJourney() {
  router.push('/journey');
}

function enterGuest() {
  auth.enterGuest();
  goJourney();
}

async function doLogin() {
  error.value = '';
  if (!username.value.trim()) {
    error.value = '请输入账号名';
    return;
  }
  if (!privateKey.value) {
    error.value = '请选择私钥证书文件（管理员签发的 .key / .pem 文本）';
    return;
  }
  busy.value = true;
  try {
    await auth.login(username.value.trim(), privateKey.value);
    goJourney();
  } catch (err) {
    error.value = err instanceof ApiRequestError ? err.message : '鉴权失败，请重试';
  } finally {
    busy.value = false;
  }
}

async function doBootstrap() {
  error.value = '';
  if (!bootstrapName.value.trim()) {
    error.value = '请输入初始化账号名';
    return;
  }
  busy.value = true;
  try {
    const created = await bootstrapAdmin({
      username: bootstrapName.value.trim(),
      role: bootstrapRole.value,
    });
    issuedKey.value = created.private_key ?? '';
    username.value = created.username;
  } catch (err) {
    error.value = err instanceof ApiRequestError ? err.message : '账号初始化失败';
  } finally {
    busy.value = false;
  }
}

const copyState = ref('');
async function copyIssuedKey() {
  copyState.value = (await copyToClipboard(issuedKey.value)) ? 'ok' : 'fail';
}
</script>

<template>
  <div class="login-wrap">
    <form class="login-card" @submit.prevent="doLogin">
      <h1 class="title"> 射线焊缝缺陷智能检测系统 </h1>
      <p class="subtitle"> 三员分岗身份认证（SM2 挑战—响应协议） </p>
      <p v-if="logoutNotice" class="notice" role="alert">{{ logoutNotice }}</p>
      <label class="field">
        <span>账号名</span>
        <input
          v-model="username"
          type="text"
          autocomplete="username"
          placeholder="系统管理员 / 保密管理员 / 审计员 账号"
        />
      </label>
      <label class="field">
        <span>SM2 私钥证书文件</span>
        <input type="file" accept=".key,.pem,.txt,.json" @change="onKeyFileChange" />
      </label>
      <p v-if="keyFileName" class="hint"> 已选择：{{ keyFileName }} </p>
      <button class="primary" type="submit" :disabled="busy">{{ busy ? '正在鉴权…' : '登 录' }}</button>
      <button v-if="guestAllowed" class="guest" type="button" @click="enterGuest">
        访客模式（免鉴权进入，操作以访客身份审计）
      </button>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <details class="boot" :open="needsBootstrap" @toggle="needsBootstrap = $event.target.open">
        <summary>首次部署？初始化系统账号（引导窗口）</summary>
        <template v-if="issuedKey">
          <p class="warn">
            请立即妥善保存私钥（仅此一次展示，系统不留存副本）：
            <button type="button" @click="copyIssuedKey"> 复制私钥 </button>
            <span v-if="copyState === 'ok'" class="copy-ok">✓ 已复制到剪贴板</span>
            <span v-else-if="copyState === 'fail'" class="copy-fail">复制失败，请直接在下方文本框手动全选复制——关闭页面后将无法再次查看</span>
          </p>
          <textarea class="keyout" readonly :value="issuedKey" rows="3" @focus="$event.target.select()"></textarea>
        </template>
        <template v-else>
          <label class="field">
            <span>初始化账号名</span>
            <input v-model="bootstrapName" type="text" />
          </label>
          <label class="field">
            <span>岗位角色（一人一岗，三员分立）</span>
            <select v-model="bootstrapRole">
              <option value="sysadmin">系统管理员</option>
              <option value="secadmin">安全保密管理员</option>
              <option value="auditor">安全审计员</option>
            </select>
          </label>
          <button type="button" :disabled="busy" @click="doBootstrap"> 创建账号并签发 SM2 软证书 </button>
        </template>
      </details>
    </form>
  </div>
</template>
