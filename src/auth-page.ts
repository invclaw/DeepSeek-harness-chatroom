import type { ChatroomAuthState } from './types.js'

/** Render the standalone login surface used before the Harness browser bundle is reachable. */
export function renderAuthPage(prefix: string, state: ChatroomAuthState, returnTo: string): string {
  const registration = state.bootstrapRequired || state.allowSelfRegistration
  const initialMode = state.bootstrapRequired ? 'register' : 'login'
  const providerLinks = state.providers.map(provider => {
    const route = provider.type === 'oidc'
      ? `${prefix}/auth/oidc/${encodeURIComponent(provider.id)}/start`
      : `${prefix}/auth/dsh-auth/start`
    return `<a class="provider" href="${escapeHtml(route)}?returnTo=${encodeURIComponent(returnTo)}">使用 ${escapeHtml(provider.label)} 登录</a>`
  }).join('')
  const data = scriptJson({ prefix, returnTo, initialMode, bootstrapRequired: state.bootstrapRequired })
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>登录 · DeepSeek Harness</title>
<style>
:root{color-scheme:light dark;font-family:Inter,"PingFang SC","Microsoft YaHei",system-ui,sans-serif;background:#f4f6fb;color:#172033}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:28px;background:radial-gradient(circle at 20% 10%,#dce7ff 0,transparent 36%),#f4f6fb}
main{width:min(440px,100%);background:rgba(255,255,255,.94);border:1px solid #dce1eb;border-radius:24px;padding:34px;box-shadow:0 24px 70px rgba(31,50,92,.16)}
.brand{display:flex;align-items:center;gap:12px;margin-bottom:30px}.mark{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:#2f65e8;color:white;font-size:22px}.brand strong{display:block;font-size:19px}.brand span{color:#748096;font-size:13px}
h1{font-size:28px;margin:0 0 8px}p{margin:0 0 24px;color:#68748b;line-height:1.6}.tabs{display:grid;grid-template-columns:1fr 1fr;background:#edf1f8;border-radius:12px;padding:4px;margin-bottom:20px}.tabs button{border:0;border-radius:9px;padding:10px;background:transparent;color:#667086;font-weight:650}.tabs button[aria-selected=true]{background:white;color:#172033;box-shadow:0 2px 8px rgba(34,49,84,.1)}
form{display:grid;gap:14px}label{display:grid;gap:7px;font-size:14px;font-weight:650}input{width:100%;border:1px solid #cfd6e3;border-radius:12px;padding:12px 14px;background:white;color:#172033;font:inherit;outline:0}input:focus{border-color:#4a76e8;box-shadow:0 0 0 3px #dfe8ff}.primary{border:0;border-radius:12px;padding:13px;background:#3267e8;color:white;font:inherit;font-weight:700;cursor:pointer}.primary:disabled{opacity:.55;cursor:wait}.providers{display:grid;gap:10px;margin-top:22px;padding-top:22px;border-top:1px solid #e2e6ee}.providers>span{text-align:center;color:#8690a2;font-size:13px}.provider{text-decoration:none;text-align:center;border:1px solid #cfd6e3;border-radius:12px;padding:11px;color:#29354d;font-weight:650}.error{display:none;margin-top:16px;padding:11px 13px;border-radius:10px;background:#fff0f0;color:#c53434;font-size:14px}.error[data-open=true]{display:block}.bootstrap{padding:11px 13px;border-radius:10px;background:#fff8df;color:#795d10;font-size:13px;line-height:1.5}
@media(prefers-color-scheme:dark){:root{background:#101216;color:#f0f3f8}body{background:radial-gradient(circle at 20% 10%,#1c315e 0,transparent 36%),#101216}main{background:rgba(24,27,34,.96);border-color:#333945}.tabs{background:#252a34}.tabs button[aria-selected=true]{background:#373d49;color:white}input{background:#16191f;border-color:#454c5a;color:white}.provider{border-color:#454c5a;color:#e7ebf2}.providers{border-color:#383e49}}
</style>
</head>
<body>
<main>
  <div class="brand"><span class="mark">✦</span><span><strong>DeepSeek Harness</strong><span>团队协作平台</span></span></div>
  <h1>${state.bootstrapRequired ? '创建超级管理员' : '欢迎回来'}</h1>
  <p>${state.bootstrapRequired ? '使用部署时生成的初始化口令创建系统的第一位超级管理员。' : '登录后可进入群聊、AI 会话和私聊。'}</p>
  ${registration ? `<div class="tabs" role="tablist"><button type="button" data-mode="login" role="tab">登录</button><button type="button" data-mode="register" role="tab">${state.bootstrapRequired ? '初始化' : '注册'}</button></div>` : ''}
  <form id="auth-form">
    <label>账号<input name="username" autocomplete="username" minlength="3" maxlength="64" required autofocus></label>
    <label>密码<input name="password" type="password" autocomplete="current-password" minlength="12" maxlength="128" required></label>
    <div data-register hidden><label>显示名称<input name="displayName" maxlength="80"></label></div>
    ${state.bootstrapRequired ? '<div data-register hidden><label>超级管理员初始化口令<input name="bootstrapToken" type="password" autocomplete="off"></label></div><div class="bootstrap" data-register hidden>初始化口令只用于创建第一位超级管理员，创建成功后不会存入浏览器。</div>' : ''}
    <button class="primary" type="submit">继续</button>
  </form>
  ${providerLinks === '' ? '' : `<div class="providers"><span>或使用其他身份登录</span>${providerLinks}</div>`}
  <div class="error" id="error" role="alert"></div>
</main>
<script id="auth-data" type="application/json">${data}</script>
<script>
const data=JSON.parse(document.getElementById('auth-data').textContent);let mode=data.initialMode;
const form=document.getElementById('auth-form'),error=document.getElementById('error'),submit=form.querySelector('button[type=submit]');
function render(){document.querySelectorAll('[data-mode]').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.mode===mode)));document.querySelectorAll('[data-register]').forEach(node=>{node.hidden=mode!=='register'});form.password.autocomplete=mode==='login'?'current-password':'new-password';submit.textContent=mode==='login'?'登录':data.bootstrapRequired?'创建超级管理员':'注册并登录';error.dataset.open='false'}
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;render()}));
form.addEventListener('submit',async event=>{event.preventDefault();submit.disabled=true;error.dataset.open='false';const values=Object.fromEntries(new FormData(form));const body=mode==='login'?{username:values.username,password:values.password}:{username:values.username,password:values.password,displayName:values.displayName,bootstrapToken:values.bootstrapToken};try{const response=await fetch(data.prefix+'/auth/'+mode,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});if(!response.ok){const result=await response.json().catch(()=>({}));throw new Error(result.error||'登录失败，请稍后重试。')}location.replace(data.returnTo)}catch(reason){error.textContent=reason instanceof Error?reason.message:'登录失败，请稍后重试。';error.dataset.open='true';submit.disabled=false}});render();
</script>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/gu, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!)
}

function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</gu, '\\u003c').replace(/\u2028/gu, '\\u2028').replace(/\u2029/gu, '\\u2029')
}
