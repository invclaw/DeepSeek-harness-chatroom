window.__ModuleLoader__.load({id:`deepseek-harness-chatroom`,factory:e=>{var t={exports:{}},n=t.exports;Object.defineProperties(n,{__esModule:{value:!0},[Symbol.toStringTag]:{value:`Module`}});var r=Object.create,i=Object.defineProperty,a=Object.getOwnPropertyDescriptor,o=Object.getOwnPropertyNames,s=Object.getPrototypeOf,c=Object.prototype.hasOwnProperty,l=(e,t,n,r)=>{if(t&&typeof t==`object`||typeof t==`function`)for(var s=o(t),l=0,u=s.length,d;l<u;l++)d=s[l],!c.call(e,d)&&d!==n&&i(e,d,{get:(e=>t[e]).bind(null,d),enumerable:!(r=a(t,d))||r.enumerable});return e},u=(e,t,n)=>(n=e==null?{}:r(s(e)),l(t||!e||!e.__esModule||!c.call(e,`default`)?i(n,`default`,{value:e,enumerable:!0}):n,e));let d=e("react");d=u(d,1);let f=e("react-dom"),p=e("react/jsx-runtime"),m=[{id:`whale`,emoji:`🐳`,label:`鲸鱼`},{id:`panda`,emoji:`🐼`,label:`熊猫`},{id:`fox`,emoji:`🦊`,label:`狐狸`},{id:`cat`,emoji:`🐱`,label:`猫咪`},{id:`dog`,emoji:`🐶`,label:`狗狗`},{id:`rabbit`,emoji:`🐰`,label:`兔子`},{id:`octopus`,emoji:`🐙`,label:`章鱼`},{id:`unicorn`,emoji:`🦄`,label:`独角兽`}];function h(e){return typeof e==`string`&&m.some(t=>t.id===e)}function g(e){let t=0;for(let n of e)t=t*31+n.codePointAt(0)>>>0;return m[t%m.length].id}function _(e,t){let n=h(e)?e:g(t);return m.find(e=>e.id===n)}function v(e,t,n){return`${t.type===`oidc`?`${e}/auth/oidc/${encodeURIComponent(t.id)}/start`:`${e}/auth/dsh-auth/start`}?returnTo=${encodeURIComponent(n)}`}let y=`/plugins/deepseek-harness-chatroom/api`,b=`dsh-chatroom-thread`,x=`dsh-chatroom-thread-session`,S=`dsh-chatroom-room`,C=`dsh-chatroom-parent-session`,w=`data-dsh-chatroom-branch-session-ready`;function T(e){let t=new URLSearchParams(e.search),n=t.get(b),r=t.get(x),i=t.get(S),a=t.get(C);if(![n,r,i,a].some(e=>e===null||e===``))return{threadId:n,sessionId:r,roomId:i,parentSessionId:a}}function E(e,t){if(t!==void 0)return;let n=new URLSearchParams(e.search).get(S);return n===null||n===``?void 0:n}function D(e,t,n){let r=new URL(globalThis.location.href);return r.searchParams.set(b,e.id),r.searchParams.set(x,e.sessionId),r.searchParams.set(S,e.roomId),r.searchParams.set(C,t),n!==void 0&&r.searchParams.set(`dsh-chatroom-frame-load`,n),r.hash=``,r.toString()}function O(e,t){return{threadId:e.id,sessionId:e.sessionId,roomId:e.roomId,parentSessionId:t}}function ee(e,t){e.postMessage({type:`dsh-chatroom-branch-switch`,frame:t},globalThis.location.origin)}function k(e){if(typeof e!=`object`||!e||Array.isArray(e))return;let t=e;if(t.type!==`dsh-chatroom-branch-switch`||typeof t.frame!=`object`||t.frame===null||Array.isArray(t.frame))return;let n=t.frame;if([`threadId`,`sessionId`,`roomId`,`parentSessionId`].every(e=>typeof n[e]==`string`&&n[e]!==``))return n}function te(e,t){return e.threadId===t.threadId&&e.sessionId===t.sessionId&&e.roomId===t.roomId&&e.parentSessionId===t.parentSessionId}function ne(e){ie(e)}function re(e){ie(e)}function ie(e){try{localStorage.setItem(`dsh.sessions.current`,JSON.stringify({sessionId:e}))}catch{}}function ae(e,t,n){return t.byId[e.sessionId]===void 0?!1:t.current===e.sessionId||(n(e.sessionId),!1)}function oe(e){se(globalThis.document,e.sessionId),globalThis.parent!==globalThis.window&&globalThis.parent.postMessage({type:`dsh-chatroom-branch-ready`,threadId:e.threadId},globalThis.location.origin)}function se(e,t){e.documentElement.setAttribute(w,t)}function ce(e,t,n){let r=e.querySelector(`[data-dsh-chatroom-branch-shell]`)?.children.item(1),i=`分支：${[...n].slice(0,12).join(``)}`;return e.documentElement.getAttribute(w)===t&&(r?.textContent??``).includes(i)&&r?.querySelector(`textarea`)!==null}function le(){globalThis.document.documentElement.removeAttribute(w)}function A({avatarId:e,avatarUrl:t,seed:n,className:r=`dsh-chatroom-avatar`,title:i}){let[a,o]=(0,d.useState)(!1),s=_(e,n),c=j(t)?t:void 0;return(0,d.useEffect)(()=>{o(!1)},[c]),(0,p.jsxs)(`span`,{className:r,"data-avatar":s.id,title:i??s.label,"aria-label":i??s.label,children:[c!==void 0&&!a&&(0,p.jsx)(`img`,{src:c,alt:``,referrerPolicy:`no-referrer`,onError:()=>{o(!0)}}),(0,p.jsx)(`span`,{"aria-hidden":!0,children:s.emoji})]})}function j(e){if(e===void 0)return!1;try{let t=new URL(e);return t.protocol===`https:`&&t.username===``&&t.password===``&&t.hash===``}catch{return!1}}function M(e){let[t,n]=(0,d.useState)(!1),r=_(e.avatarId,e.participantId);return(0,d.useEffect)(()=>{n(!1)},[e.avatarUrl]),(0,p.jsx)(`span`,{className:e.className,"data-avatar":r.id,"data-avatar-source":e.avatarUrl===void 0||t?`fallback`:`enterprise`,title:e.title??r.label,"aria-hidden":!0,children:e.avatarUrl!==void 0&&!t?(0,p.jsx)(`img`,{src:e.avatarUrl,alt:``,referrerPolicy:`no-referrer`,onError:()=>{n(!0)}}):r.emoji})}function N({card:e}){return e.kind===`meeting`?(0,p.jsx)(ue,{card:e}):(0,p.jsxs)(`article`,{className:`dsh-chatroom-external-card dsh-chatroom-document-card`,children:[(0,p.jsx)(`div`,{className:`dsh-chatroom-external-icon`,"aria-hidden":!0,children:`📄`}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-external-copy`,children:[(0,p.jsxs)(`small`,{children:[`企业微信 · `,P(e.documentType)]}),(0,p.jsx)(`strong`,{children:e.title}),e.owner!==void 0&&(0,p.jsxs)(`span`,{children:[`创建者 · `,e.owner]}),e.modifiedAt!==void 0&&(0,p.jsxs)(`span`,{children:[`更新于 `,e.modifiedAt]})]}),e.url!==void 0&&(0,p.jsx)(`a`,{href:e.url,target:`_blank`,rel:`noreferrer`,children:`打开文档`})]})}function ue({card:e}){let[t,n]=(0,d.useState)();(0,d.useEffect)(()=>{if(n(void 0),e.id===void 0)return;let t=!0,r,i=async()=>{let a=!1;try{let r=await fetch(`${y}/meetings/${encodeURIComponent(e.id)}`,{credentials:`same-origin`,headers:{Accept:`application/json`}});if(!r.ok)return;let i=await r.json();t&&n(i),a=i.status===`end`&&i.summaryStatus===`completed`}catch{}finally{t&&!a&&(r=window.setTimeout(()=>{i()},3e4))}};return i(),()=>{t=!1,r!==void 0&&window.clearTimeout(r)}},[e.id]);let r=t?.status??e.status,i=t?.summaryStatus;return(0,p.jsxs)(`article`,{className:`dsh-chatroom-external-card dsh-chatroom-meeting-card`,children:[(0,p.jsx)(`div`,{className:`dsh-chatroom-external-icon`,"aria-hidden":!0,children:`🎥`}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-external-copy`,children:[(0,p.jsxs)(`small`,{children:[`企业微信会议 `,r!==void 0&&(0,p.jsx)(`em`,{children:de(r)})]}),(0,p.jsx)(`strong`,{children:t?.title??e.title}),(t?.beginTime!==void 0||t?.endTime!==void 0||e.beginTime!==void 0||e.endTime!==void 0)&&(0,p.jsx)(`span`,{children:[t?.beginTime??e.beginTime,t?.endTime??e.endTime].filter(Boolean).join(` — `)}),e.location!==void 0&&(0,p.jsxs)(`span`,{children:[`地点 · `,e.location]}),e.attendees!==void 0&&e.attendees.length>0&&(0,p.jsxs)(`span`,{children:[`参与人 · `,e.attendees.join(`、`)]}),r===`end`&&i===`pending`&&(0,p.jsx)(`span`,{children:`AI 会议总结生成中…`}),r===`end`&&i===`failed`&&(0,p.jsx)(`span`,{children:`AI 会议总结将在稍后重试`})]}),e.url!==void 0&&(0,p.jsx)(`a`,{href:e.url,target:`_blank`,rel:`noreferrer`,children:r===`end`?`查看会议`:`加入会议`})]})}function de(e){return e===`started`?`进行中`:e===`end`?`已结束`:e===`init`?`未开始`:e}function P(e){switch(e){case`sheet`:return`在线表格`;case`smartsheet`:return`智能表格`;case`smartpage`:return`智能文档`;case`doc`:return`在线文档`;default:return e??`文档`}}let F=[`😀`,`😄`,`😂`,`🥰`,`😍`,`🤔`,`😮`,`😭`,`👍`,`👏`,`🙏`,`🎉`,`❤️`,`🔥`,`✨`,`✅`,`👀`,`🚀`];function fe(e){return(0,p.jsx)(p.Fragment,{children:e.room.directOpen&&(0,p.jsx)(be,{...e})})}function pe(e){let t=e.useChatroom(e=>e),n={...e,room:t},r=t.auth.account?.role===`super-admin`;return(0,d.useEffect)(()=>{r&&e.openAdmin()},[r]),(0,d.useEffect)(()=>{e.loadAutomation?.(),e.loadWecomAuthorization?.()},[]),(0,p.jsxs)(`div`,{className:`dsh-chatroom-settings`,"data-testid":`chatroom-settings`,children:[(0,p.jsx)(`header`,{className:`dsh-chatroom-settings-header`,children:(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`h2`,{children:`群聊与账号`}),(0,p.jsx)(`p`,{children:`管理个人账号、平台成员和企业统一登录。`})]})}),(0,p.jsx)(he,{...n}),(0,p.jsx)(ge,{...n}),(0,p.jsx)(me,{...n}),(0,p.jsx)(ve,{...n,embedded:!0}),r&&(0,p.jsx)(ye,{...n,embedded:!0})]})}function me(e){let t=e.room.wecomAuthorization,[n,r]=(0,d.useState)(()=>Date.now());return(0,d.useEffect)(()=>{if(t?.status!==`pending`)return;let n=globalThis.setInterval(()=>{e.loadWecomAuthorization?.()},1500);return()=>{globalThis.clearInterval(n)}},[t?.status]),(0,d.useEffect)(()=>{t?.qrAvailable===!0&&r(Date.now())},[t?.qrAvailable]),(0,p.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-wecom-account`,"aria-label":`企业微信账号`,children:[(0,p.jsx)(`header`,{children:(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`h2`,{children:`企业微信账号`}),(0,p.jsx)(`p`,{children:`全站共用一个企业微信授权；任何成员发起的会议和文档操作都使用这份部署账号。`})]})}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-wecom-account-row`,children:[(0,p.jsx)(`span`,{children:t?.enabled===!0?t.status===`authorized`?`已连接`:t.status===`pending`?`等待扫码确认`:`尚未连接`:`当前服务未启用企业微信 CLI`}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-wecom-actions`,children:[t?.enabled===!0&&t.canManage&&t.status===`authorized`&&(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(`button`,{type:`button`,disabled:e.room.wecomBusy,onClick:()=>{globalThis.confirm(`解绑后，全站的快速会议和企业微信 Agent 工具都会暂停。确定解绑吗？`)&&e.disconnectWecomAuthorization?.()},children:`解绑`}),(0,p.jsx)(`button`,{type:`button`,disabled:e.room.wecomBusy,onClick:()=>{globalThis.confirm(`重新绑定会先清除当前共享授权。确定继续吗？`)&&e.rebindWecomAuthorization?.()},children:`重新绑定`})]}),t?.enabled===!0&&t.canManage&&t.status!==`authorized`&&(0,p.jsx)(`button`,{type:`button`,disabled:e.room.wecomBusy,onClick:()=>{e.startWecomAuthorization?.()},children:t.status===`pending`?`重新生成二维码`:`扫码连接`})]})]}),t?.enabled===!0&&!t.canManage&&t.status!==`authorized`&&(0,p.jsx)(`p`,{className:`dsh-chatroom-panel-status`,children:`请联系设置管理员连接共享企业微信账号。`}),t?.status===`pending`&&t.canManage&&(t.qrAvailable?(0,p.jsxs)(`div`,{className:`dsh-chatroom-wecom-inline-qr`,children:[(0,p.jsx)(`img`,{src:`/plugins/deepseek-harness-chatroom/api/wecom/auth/qr?v=${n}`,alt:`企业微信登录二维码`}),(0,p.jsx)(`p`,{children:`请使用企业微信扫码并在手机上确认。全站只需绑定一次。`})]}):(0,p.jsx)(`div`,{className:`dsh-chatroom-panel-status`,children:e.room.wecomBusy?`正在生成登录二维码…`:`等待二维码…`})),e.room.wecomError!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.wecomError})]})}function he(e){let t=e.room.automationOverview,[n,r]=(0,d.useState)(``),[i,a]=(0,d.useState)(``);return(0,d.useEffect)(()=>{t!==void 0&&r(_e(t.provider,t.model)),t!==void 0&&a(_e(t.meetingSummaryProvider,t.meetingSummaryModel))},[t?.provider,t?.model,t?.meetingSummaryProvider,t?.meetingSummaryModel]),e.room.automationBusy&&t===void 0?(0,p.jsx)(`section`,{className:`dsh-chatroom-card dsh-chatroom-automation-card`,children:(0,p.jsx)(`div`,{className:`dsh-chatroom-panel-status`,children:`正在加载 AI 自动响应设置…`})}):t===void 0?(0,p.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-automation-card`,children:[(0,p.jsx)(`header`,{children:(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`h2`,{children:`AI 自动响应`}),(0,p.jsx)(`p`,{children:`加载判断模型失败。`})]})}),e.room.automationError!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.automationError})]}):(0,p.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-automation-card`,"aria-label":`AI 自动响应设置`,children:[(0,p.jsx)(`header`,{children:(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`h2`,{children:`AI 自动响应`}),(0,p.jsx)(`p`,{children:`各群开启自动响应后，由这个模型判断普通消息是否需要唤起 AI。`})]})}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-automation-form`,children:[(0,p.jsxs)(`label`,{children:[`判断模型`,(0,p.jsx)(`select`,{value:n,disabled:!t.canManage||e.room.automationBusy,onChange:e=>{r(e.target.value)},children:t.models.map(e=>(0,p.jsx)(`option`,{value:_e(e.provider,e.model),children:e.label},_e(e.provider,e.model)))})]}),(0,p.jsxs)(`label`,{children:[`会议总结模型`,(0,p.jsx)(`select`,{value:i,disabled:!t.canManage||e.room.automationBusy,onChange:e=>{a(e.target.value)},children:t.models.map(e=>(0,p.jsx)(`option`,{value:_e(e.provider,e.model),children:e.label},`summary:${_e(e.provider,e.model)}`))})]}),t.canManage&&(0,p.jsx)(`button`,{type:`button`,disabled:e.room.automationBusy||n===_e(t.provider,t.model),onClick:()=>{let r=t.models.find(e=>_e(e.provider,e.model)===n);r!==void 0&&e.saveAutomation?.(r.provider,r.model,t.meetingSummaryProvider,t.meetingSummaryModel,t.mainAgentPrompt,t.controllerPrompt)},children:`保存判断模型`}),t.canManage&&(0,p.jsx)(`button`,{type:`button`,disabled:e.room.automationBusy||i===_e(t.meetingSummaryProvider,t.meetingSummaryModel),onClick:()=>{let n=t.models.find(e=>_e(e.provider,e.model)===i);n!==void 0&&e.saveAutomation?.(t.provider,t.model,n.provider,n.model,t.mainAgentPrompt,t.controllerPrompt)},children:`保存会议总结模型`}),!t.canManage&&(0,p.jsx)(`small`,{children:`只有超级管理员可以修改判断模型。`})]}),e.room.automationError!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.automationError})]})}function ge(e){let t=e.room.automationOverview,[n,r]=(0,d.useState)(``),[i,a]=(0,d.useState)(``);if((0,d.useEffect)(()=>{t!==void 0&&(r(t.mainAgentPrompt),a(t.controllerPrompt))},[t?.mainAgentPrompt,t?.controllerPrompt]),t===void 0)return null;let o=n===t.mainAgentPrompt&&i===t.controllerPrompt;return(0,p.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-prompt-card`,"aria-label":`Agent 系统提示词设置`,children:[(0,p.jsx)(`header`,{children:(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`h2`,{children:`Agent 系统提示词`}),(0,p.jsx)(`p`,{children:`仅影响聊天室主会话、分支会话和未 @AI 消息的唤起判断。`})]})}),t.canManage?(0,p.jsxs)(`div`,{className:`dsh-chatroom-prompt-form`,children:[(0,p.jsxs)(`label`,{children:[`群聊主 Agent`,(0,p.jsx)(`textarea`,{"aria-label":`群聊主 Agent 系统提示词`,value:n,onChange:e=>{r(e.target.value)}}),(0,p.jsx)(`small`,{children:`作为真正的 system prompt 注入每个聊天室主会话和分支 Agent；下一轮对话生效。`})]}),(0,p.jsxs)(`label`,{children:[`自动回复判断 Agent`,(0,p.jsx)(`textarea`,{"aria-label":`自动回复判断 Agent 系统提示词`,value:i,onChange:e=>{a(e.target.value)}}),(0,p.jsx)(`small`,{children:`用于判断未明确 @AI 的普通消息是否需要唤起；明确 @AI 始终跳过判断并直接唤起。`})]}),(0,p.jsx)(`button`,{type:`button`,disabled:e.room.automationBusy||o,onClick:()=>{e.saveAutomation?.(t.provider,t.model,t.meetingSummaryProvider,t.meetingSummaryModel,n,i)},children:`保存系统提示词`})]}):(0,p.jsx)(`small`,{children:`只有超级管理员可以修改系统提示词。`}),e.room.automationError!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.automationError})]})}function _e(e,t){return`${e}\u0000${t}`}function ve(e){let[t,n]=(0,d.useState)(``),[r,i]=(0,d.useState)(``),[a,o]=(0,d.useState)(``),s=e.room.auth.account,c=(0,p.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-account-card`,"aria-label":`账号设置`,children:[(0,p.jsxs)(`header`,{children:[(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`h2`,{children:`账号设置`}),(0,p.jsx)(`p`,{children:s===void 0?``:`${s.displayName} · @${s.username}`})]}),!e.embedded&&(0,p.jsx)(`button`,{"aria-label":`关闭账号设置`,type:`button`,onClick:e.closeAccount,children:`×`})]}),s?.passwordManaged!==!1&&(0,p.jsxs)(`form`,{className:`dsh-chatroom-admin-form`,onSubmit:async s=>{s.preventDefault(),r===a&&await e.changePassword(t,r)&&(n(``),i(``),o(``))},children:[(0,p.jsxs)(`label`,{children:[`当前密码`,(0,p.jsx)(`input`,{type:`password`,autoComplete:`current-password`,value:t,onChange:e=>{n(e.target.value)}})]}),(0,p.jsxs)(`label`,{children:[`新密码`,(0,p.jsx)(`input`,{type:`password`,autoComplete:`new-password`,minLength:12,value:r,onChange:e=>{i(e.target.value)}})]}),(0,p.jsxs)(`label`,{children:[`确认新密码`,(0,p.jsx)(`input`,{type:`password`,autoComplete:`new-password`,minLength:12,value:a,onChange:e=>{o(e.target.value)}})]}),a!==``&&a!==r&&(0,p.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:`两次输入的新密码不一致。`}),(0,p.jsx)(`button`,{type:`submit`,disabled:e.room.accountBusy||t===``||r.length<12||r!==a,children:`修改密码`})]}),s?.passwordManaged===!1&&(0,p.jsx)(`p`,{className:`dsh-chatroom-panel-status`,children:`此账号由企业统一登录管理，密码请在企业登录系统中修改。`}),e.room.accountError!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.accountError})]});return e.embedded?c:(0,p.jsx)(`div`,{className:`dsh-chatroom-dialog-layer dsh-chatroom-account-layer`,"data-testid":`chatroom-account`,children:c})}function ye(e){let t=e.room.adminOverview,n=e.room.auth.authMode===`dsh-auth-only`,[r,i]=(0,d.useState)(``),[a,o]=(0,d.useState)(``),[s,c]=(0,d.useState)(``),[l,u]=(0,d.useState)(`member`),[f,h]=(0,d.useState)(m[0].id),[g,_]=(0,d.useState)(Se()),v=(0,p.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-admin-card`,"aria-label":`系统管理`,children:[(0,p.jsxs)(`header`,{children:[(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`h2`,{children:`系统管理`}),(0,p.jsx)(`p`,{children:`账号、注册策略和企业身份提供方`})]}),!e.embedded&&(0,p.jsx)(`button`,{"aria-label":`关闭系统管理`,type:`button`,onClick:e.closeAdmin,children:`×`})]}),e.room.adminBusy&&t===void 0?(0,p.jsx)(`div`,{className:`dsh-chatroom-panel-status`,children:`正在载入管理数据…`}):t!==void 0&&(0,p.jsxs)(`div`,{className:`dsh-chatroom-admin-layout`,children:[(0,p.jsxs)(`section`,{children:[(0,p.jsx)(`h3`,{children:`注册策略`}),(0,p.jsxs)(`label`,{className:`dsh-chatroom-toggle`,children:[(0,p.jsx)(`input`,{type:`checkbox`,checked:t.allowSelfRegistration,disabled:e.room.adminBusy||n,onChange:t=>{e.adminSetSelfRegistration(t.target.checked)}}),`允许用户使用账号密码自主注册`]}),!n&&(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(`h3`,{children:`统一创建账号`}),(0,p.jsxs)(`form`,{className:`dsh-chatroom-admin-form`,onSubmit:async t=>{t.preventDefault(),await e.adminCreateUser({username:r,password:s,displayName:a,avatarId:f,role:l})&&(i(``),c(``),o(``))},children:[(0,p.jsxs)(`label`,{children:[`账号名`,(0,p.jsx)(`input`,{placeholder:`例如 alice`,value:r,onChange:e=>{i(e.target.value)}})]}),(0,p.jsxs)(`label`,{children:[`显示名称`,(0,p.jsx)(`input`,{placeholder:`成员看到的名称`,value:a,onChange:e=>{o(e.target.value)}})]}),(0,p.jsxs)(`label`,{children:[`初始密码`,(0,p.jsx)(`input`,{placeholder:`至少 12 位`,type:`password`,value:s,onChange:e=>{c(e.target.value)}})]}),(0,p.jsxs)(`label`,{children:[`角色`,(0,p.jsxs)(`select`,{value:l,onChange:e=>{u(e.target.value)},children:[(0,p.jsx)(`option`,{value:`member`,children:`成员`}),(0,p.jsx)(`option`,{value:`admin`,children:`管理员`}),(0,p.jsx)(`option`,{value:`super-admin`,children:`超级管理员`})]})]}),(0,p.jsxs)(`fieldset`,{className:`dsh-chatroom-settings-avatar-field`,children:[(0,p.jsx)(`legend`,{children:`头像`}),(0,p.jsx)(`div`,{className:`dsh-chatroom-mini-avatars`,children:m.map(e=>(0,p.jsx)(`button`,{type:`button`,"aria-label":e.label,"aria-pressed":e.id===f,"data-selected":e.id===f,onClick:()=>{h(e.id)},children:e.emoji},e.id))})]}),(0,p.jsx)(`button`,{type:`submit`,disabled:e.room.adminBusy||r===``||a===``||s===``,children:`创建账号`})]})]})]}),(0,p.jsxs)(`section`,{children:[(0,p.jsxs)(`h3`,{children:[`用户 · `,t.users.length]}),(0,p.jsx)(`div`,{className:`dsh-chatroom-user-table`,children:t.users.map(t=>(0,p.jsxs)(`div`,{"data-disabled":t.status===`disabled`,children:[(0,p.jsx)(A,{avatarId:t.avatarId,avatarUrl:t.avatarUrl,seed:t.participantId}),(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`strong`,{children:t.displayName}),(0,p.jsxs)(`small`,{children:[`@`,t.username]})]}),(0,p.jsxs)(`span`,{className:`dsh-chatroom-user-actions`,children:[(0,p.jsxs)(`select`,{"aria-label":`${t.username} 的角色`,value:t.role,disabled:e.room.adminBusy,onChange:n=>{e.adminUpdateUser(t.participantId,{role:n.target.value})},children:[(0,p.jsx)(`option`,{value:`member`,children:`成员`}),(0,p.jsx)(`option`,{value:`admin`,children:`管理员`}),(0,p.jsx)(`option`,{value:`super-admin`,children:`超级管理员`})]}),(0,p.jsx)(`button`,{type:`button`,disabled:e.room.adminBusy,onClick:()=>{e.adminUpdateUser(t.participantId,{status:t.status===`active`?`disabled`:`active`})},children:t.status===`active`?`停用`:`启用`})]})]},t.participantId))})]}),(0,p.jsx)(`section`,{className:`dsh-chatroom-provider-section`,children:n?(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(`h3`,{children:`企业统一登录`}),(0,p.jsx)(`p`,{className:`dsh-chatroom-panel-status`,children:`当前部署固定使用 dsh-auth 企业登录；本地密码和 OIDC 提供方已关闭。`})]}):(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(`h3`,{children:`企业 SSO / OIDC`}),(0,p.jsxs)(`label`,{className:`dsh-chatroom-admin-field`,children:[`未登录用户入口`,(0,p.jsxs)(`select`,{"aria-label":`未登录用户入口`,value:t.autoRedirectProviderId??``,disabled:e.room.adminBusy,onChange:t=>{e.adminSetAutoRedirectProvider(t.target.value||void 0)},children:[(0,p.jsx)(`option`,{value:``,children:`显示登录与认证选择页`}),t.loginProviders.map(e=>(0,p.jsxs)(`option`,{value:e.id,children:[`自动跳转到 `,e.label]},e.id))]})]}),(0,p.jsxs)(`p`,{className:`dsh-chatroom-callback`,children:[`自动跳转启用后，可在访问地址增加 `,(0,p.jsx)(`code`,{children:`local=1`}),` 打开本地账号应急入口。`]}),t.oidcCallbackBase!==``&&(0,p.jsxs)(`p`,{className:`dsh-chatroom-callback`,children:[`回调地址：`,(0,p.jsxs)(`code`,{children:[t.oidcCallbackBase,g.id||`{providerId}`,`/callback`]})]}),(0,p.jsxs)(`form`,{className:`dsh-chatroom-admin-form dsh-chatroom-provider-form`,onSubmit:async t=>{t.preventDefault(),await e.adminSaveProvider(g)&&_(Se())},children:[(0,p.jsxs)(`label`,{children:[`Provider ID`,(0,p.jsx)(`input`,{placeholder:`例如 company`,value:g.id,onChange:e=>{_({...g,id:e.target.value})}})]}),(0,p.jsxs)(`label`,{children:[`登录按钮名称`,(0,p.jsx)(`input`,{placeholder:`例如 企业统一登录`,value:g.label,onChange:e=>{_({...g,label:e.target.value})}})]}),(0,p.jsxs)(`label`,{children:[`Issuer URL`,(0,p.jsx)(`input`,{placeholder:`https://id.example.com`,value:g.issuer,onChange:e=>{_({...g,issuer:e.target.value})}})]}),(0,p.jsxs)(`label`,{children:[`Client ID`,(0,p.jsx)(`input`,{value:g.clientId,onChange:e=>{_({...g,clientId:e.target.value})}})]}),(0,p.jsxs)(`label`,{children:[`Client Secret`,(0,p.jsx)(`input`,{placeholder:`编辑时可留空`,type:`password`,value:g.clientSecret??``,onChange:e=>{_({...g,clientSecret:e.target.value})}})]}),(0,p.jsxs)(`label`,{children:[`Scopes`,(0,p.jsx)(`input`,{value:g.scopes,onChange:e=>{_({...g,scopes:e.target.value})}})]}),(0,p.jsxs)(`label`,{children:[`账号 Claim`,(0,p.jsx)(`input`,{value:g.usernameClaim,onChange:e=>{_({...g,usernameClaim:e.target.value})}})]}),(0,p.jsxs)(`label`,{children:[`名称 Claim`,(0,p.jsx)(`input`,{value:g.displayNameClaim,onChange:e=>{_({...g,displayNameClaim:e.target.value})}})]}),(0,p.jsxs)(`label`,{className:`dsh-chatroom-toggle`,children:[(0,p.jsx)(`input`,{type:`checkbox`,checked:g.enabled,onChange:e=>{_({...g,enabled:e.target.checked})}}),`启用`]}),(0,p.jsxs)(`label`,{className:`dsh-chatroom-toggle`,children:[(0,p.jsx)(`input`,{type:`checkbox`,checked:g.autoCreateUsers,onChange:e=>{_({...g,autoCreateUsers:e.target.checked})}}),`首次 SSO 登录自动创建账号`]}),(0,p.jsx)(`button`,{type:`submit`,disabled:e.room.adminBusy,children:`保存提供方`})]}),(0,p.jsx)(`div`,{className:`dsh-chatroom-provider-list`,children:t.providers.map(t=>(0,p.jsxs)(`div`,{children:[(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`strong`,{children:t.label}),(0,p.jsxs)(`small`,{children:[t.id,` · `,t.enabled?`已启用`:`已停用`,` · `,t.issuer]})]}),(0,p.jsxs)(`span`,{className:`dsh-chatroom-provider-actions`,children:[(0,p.jsx)(`button`,{type:`button`,onClick:()=>{_({id:t.id,label:t.label,enabled:t.enabled,issuer:t.issuer,clientId:t.clientId,scopes:t.scopes,usernameClaim:t.usernameClaim,displayNameClaim:t.displayNameClaim,autoCreateUsers:t.autoCreateUsers})},children:`编辑`}),(0,p.jsx)(`button`,{type:`button`,onClick:()=>{e.adminDeleteProvider(t.id)},children:`删除`})]})]},t.id))})]})})]}),e.room.adminError!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.adminError})]});return e.embedded?v:(0,p.jsx)(`div`,{className:`dsh-chatroom-dialog-layer dsh-chatroom-admin-layer`,"data-testid":`chatroom-admin`,children:v})}function be(e){let[t,n]=(0,d.useState)(``),[r,i]=(0,d.useState)([]),[a,o]=(0,d.useState)(!1),[s]=(0,d.useState)(()=>I()),c=(0,d.useRef)(null),l=(0,d.useRef)(null),u=(0,d.useRef)(null),m=(0,d.useRef)(null),h=(0,d.useRef)(null),g=e.room.directConversation;(0,d.useLayoutEffect)(()=>{if(s!==void 0)return s.setAttribute(`data-dsh-chatroom-direct-host`,``),()=>{s.removeAttribute(`data-dsh-chatroom-direct-host`)}},[s]),(0,d.useEffect)(()=>{let e=c.current;e!==null&&(e.scrollTop=e.scrollHeight)},[g?.id,e.room.directMessages.length]),(0,d.useEffect)(()=>{n(``),i([]),o(!1)},[g?.id]),(0,d.useEffect)(()=>{if(!a)return;let e=e=>{h.current?.contains(e.target)||o(!1)};return document.addEventListener(`pointerdown`,e),()=>{document.removeEventListener(`pointerdown`,e)}},[a]);let _=!e.room.directBusy&&(t.trim()!==``||r.length>0),v=(0,p.jsxs)(`main`,{className:`dsh-chatroom-direct-panel`,"aria-label":`私聊`,"data-testid":`chatroom-direct`,children:[(0,p.jsxs)(`header`,{children:[g!==void 0&&(0,p.jsx)(M,{className:`dsh-chatroom-direct-header-avatar`,...g.peer}),(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`strong`,{children:g?.peer.displayName??`私聊`}),(0,p.jsx)(`small`,{children:g===void 0?`从左侧通讯录选择联系人`:`@${g.peer.username}`})]}),(0,p.jsx)(`button`,{"aria-label":`关闭私聊`,type:`button`,onClick:e.closeDirect,children:`×`})]}),g===void 0?(0,p.jsx)(`div`,{className:`dsh-chatroom-direct-empty`,children:`从左侧“私聊”通讯录选择一位联系人`}):(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(`div`,{ref:c,className:`dsh-chatroom-direct-messages`,children:e.room.directMessages.map(t=>{let n=t.senderId===e.room.identity?.participantId,r=n?e.room.identity:g.peer;return(0,p.jsxs)(`article`,{"data-own":n,children:[r!==void 0&&(0,p.jsx)(M,{className:`dsh-chatroom-direct-message-avatar`,...r}),(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`strong`,{children:n?`我`:g.peer.displayName}),t.text!==``&&(0,p.jsx)(`p`,{children:t.text}),t.card!==void 0&&(0,p.jsx)(N,{card:t.card}),t.files!==void 0&&t.files.length>0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-direct-media`,children:t.files.map(e=>{let t=`/plugins/deepseek-harness-chatroom/api/files/${encodeURIComponent(e.id)}`;return e.mediaType.startsWith(`image/`)?(0,p.jsx)(`a`,{href:t,target:`_blank`,rel:`noreferrer`,children:(0,p.jsx)(`img`,{src:t,alt:e.name})},e.id):(0,p.jsxs)(`a`,{className:`dsh-chatroom-direct-file`,href:t,download:e.name,children:[(0,p.jsx)(`span`,{"aria-hidden":!0,children:`📎`}),(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`strong`,{children:e.name}),(0,p.jsx)(`small`,{children:xe(e.bytes)})]}),(0,p.jsx)(`span`,{"aria-hidden":!0,children:`↓`})]},e.id)})}),(0,p.jsx)(`time`,{children:new Date(t.createdAt).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})})]})]},t.id)})}),(0,p.jsxs)(`form`,{ref:l,className:`dsh-chatroom-direct-composer`,onSubmit:async a=>{a.preventDefault(),_&&await e.sendDirect(t,r)&&(n(``),i([]))},children:[(0,p.jsx)(`textarea`,{ref:u,"data-dsh-chatroom-direct-input":!0,rows:2,placeholder:`给 ${g.peer.displayName} 发消息`,value:t,onChange:e=>{n(e.target.value)},onKeyDown:e=>{e.key!==`Enter`||e.shiftKey||e.nativeEvent.isComposing||(e.preventDefault(),_&&l.current?.requestSubmit())},onPaste:e=>{let t=[...e.clipboardData.files];t.length>0&&i(e=>[...e,...t])},enterKeyHint:`send`}),r.length>0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-direct-pending-files`,children:r.map((e,t)=>(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`span`,{"aria-hidden":!0,children:e.type.startsWith(`image/`)?`🖼️`:`📎`}),(0,p.jsx)(`span`,{title:e.name,children:e.name}),(0,p.jsx)(`button`,{type:`button`,"aria-label":`移除 ${e.name}`,onClick:()=>{i(e=>e.filter((e,n)=>n!==t))},children:`×`})]},`${e.name}-${e.lastModified}-${t}`))}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-direct-composer-tools`,children:[(0,p.jsxs)(`div`,{ref:h,className:`dsh-chatroom-direct-emoji-root`,children:[(0,p.jsxs)(`button`,{type:`button`,"aria-label":`选择私聊表情`,"aria-expanded":a,onClick:()=>{o(e=>!e)},children:[`☺ `,(0,p.jsx)(`span`,{children:`表情`})]}),a&&(0,p.jsx)(`div`,{className:`dsh-chatroom-direct-emoji-picker`,role:`dialog`,"aria-label":`选择私聊表情`,children:F.map(e=>(0,p.jsx)(`button`,{type:`button`,"aria-label":`插入 ${e}`,onClick:()=>{n(t=>`${t}${e}`),o(!1),u.current?.focus()},children:e},e))})]}),(0,p.jsxs)(`button`,{type:`button`,"aria-label":`选择私聊图片或文件`,onClick:()=>{m.current?.click()},children:[`📎 `,(0,p.jsx)(`span`,{children:`附件`})]}),(0,p.jsxs)(`button`,{type:`button`,className:`dsh-chatroom-direct-meeting`,disabled:e.room.wecomBusy,onClick:()=>{e.quickDirectMeeting?.(g.id)},children:[`⚡ `,(0,p.jsx)(`span`,{children:`快速会议`})]}),(0,p.jsx)(`input`,{ref:m,"aria-label":`选择私聊文件`,type:`file`,multiple:!0,onChange:e=>{let t=e.currentTarget.files;t!==null&&i(e=>[...e,...t]),e.currentTarget.value=``}}),(0,p.jsx)(`small`,{children:`Enter 发送 · Shift+Enter 换行`}),(0,p.jsx)(`button`,{className:`dsh-chatroom-direct-send`,"aria-label":`发送私聊消息`,type:`submit`,disabled:!_,children:`↑`})]})]})]}),e.room.directError!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.directError})]});return s===void 0?v:(0,f.createPortal)(v,s)}function xe(e){return e<1024?`${e} B`:e<1048576?`${(e/1024).toFixed(1)} KB`:`${(e/1024/1024).toFixed(1)} MB`}function I(){if(typeof document>`u`)return;let e=document.querySelector(`[data-shell-overlay]`),t=e?.parentElement;if(e==null||t==null)return;let n=[...document.querySelectorAll(`textarea`)].find(e=>!e.hasAttribute(`data-dsh-chatroom-direct-input`));for(;n!==void 0&&n.parentElement!==null&&n.parentElement!==t;)n=n.parentElement;return n?.parentElement===t?n:[...t.children].filter(t=>t instanceof HTMLElement&&t!==e&&!t.hasAttribute(`data-side`)).map(e=>({element:e,area:e.clientWidth*e.clientHeight})).sort((e,t)=>t.area-e.area)[0]?.element}function Se(){return{id:``,label:``,enabled:!0,issuer:``,clientId:``,scopes:`openid profile email`,usernameClaim:`preferred_username`,displayNameClaim:`name`,autoCreateUsers:!0}}var L={af:`⁡`,applyfunction:`⁡`,ic:`⁣`,invisiblecomma:`⁣`,invisibletimes:`⁢`,it:`⁢`,lrm:`‎`,negativemediumspace:`​`,negativethickspace:`​`,negativethinspace:`​`,negativeverythinspace:`​`,nobreak:`⁠`,rlm:`‏`,shy:`­`,zerowidthspace:`​`,zwj:`‍`,zwnj:`‌`,downbreve:`̑`,tdot:`⃛`,tripledot:`⃛`,dotdot:`⃜`,tab:`	`,newline:`
`,emsp:` `,emsp13:` `,emsp14:` `,ensp:` `,hairsp:` `,mediumspace:` `,puncsp:` `,thinsp:` `,thinspace:` `,verythinspace:` `,nbsp:`\xA0`,nonbreakingspace:`\xA0`,numsp:` `,thickspace:`  `,oline:`‾`,overbar:`‾`,lowbar:`_`,underbar:`_`,dash:`‐`,hyphen:`‐`,ndash:`–`,mdash:`—`,horbar:`―`,comma:`,`,semi:`;`,bsemi:`⁏`,colon:`:`,Colone:`⩴`,excl:`!`,iexcl:`¡`,quest:`?`,iquest:`¿`,period:`.`,nldr:`‥`,hellip:`…`,mldr:`…`,centerdot:`·`,middot:`·`,apos:`'`,lsquo:`‘`,opencurlyquote:`‘`,closecurlyquote:`’`,rsquo:`’`,rsquor:`’`,lsquor:`‚`,sbquo:`‚`,lsaquo:`‹`,rsaquo:`›`,quot:`"`,ldquo:`“`,opencurlydoublequote:`“`,closecurlydoublequote:`”`,rdquo:`”`,rdquor:`”`,bdquo:`„`,ldquor:`„`,laquo:`«`,raquo:`»`,lpar:`(`,rpar:`)`,lbrack:`[`,lsqb:`[`,rbrack:`]`,rsqb:`]`,lbrace:`{`,lcub:`{`,rbrace:`}`,rcub:`}`,lceil:`⌈`,leftceiling:`⌈`,rceil:`⌉`,rightceiling:`⌉`,leftfloor:`⌊`,lfloor:`⌊`,rfloor:`⌋`,rightfloor:`⌋`,lopar:`⦅`,ropar:`⦆`,lbrke:`⦋`,rbrke:`⦌`,lbrkslu:`⦍`,rbrksld:`⦎`,lbrksld:`⦏`,rbrkslu:`⦐`,langd:`⦑`,rangd:`⦒`,lparlt:`⦓`,rpargt:`⦔`,gtlpar:`⦕`,ltrpar:`⦖`,leftdoublebracket:`⟦`,lobrk:`⟦`,rightdoublebracket:`⟧`,robrk:`⟧`,lang:`⟨`,langle:`⟨`,leftanglebracket:`⟨`,rang:`⟩`,rangle:`⟩`,rightanglebracket:`⟩`,Lang:`⟪`,Rang:`⟫`,loang:`⟬`,roang:`⟭`,lbbrk:`❲`,rbbrk:`❳`,Verbar:`‖`,Vert:`‖`,sect:`§`,para:`¶`,commat:`@`,ast:`*`,midast:`*`,sol:`/`,bsol:`\\`,amp:`&`,num:`#`,percnt:`%`,permil:`‰`,pertenk:`‱`,dagger:`†`,Dagger:`‡`,ddagger:`‡`,bull:`•`,bullet:`•`,hybull:`⁃`,prime:`′`,Prime:`″`,tprime:`‴`,qprime:`⁗`,backprime:`‵`,bprime:`‵`,caret:`⁁`,diacriticalgrave:"`",grave:"`",acute:`´`,diacriticalacute:`´`,diacriticaltilde:`˜`,tilde:`˜`,hat:`^`,macr:`¯`,strns:`¯`,breve:`˘`,diacriticaldot:`˙`,dot:`˙`,die:`¨`,Dot:`¨`,doubledot:`¨`,uml:`¨`,ring:`˚`,dblac:`˝`,diacriticaldoubleacute:`˝`,cedil:`¸`,cedilla:`¸`,ogon:`˛`,circ:`ˆ`,caron:`ˇ`,hacek:`ˇ`,deg:`°`,copy:`©`,circledr:`®`,reg:`®`,copysr:`℗`,weierp:`℘`,wp:`℘`,rx:`℞`,mho:`℧`,iiota:`℩`,larr:`←`,leftarrow:`←`,shortleftarrow:`←`,slarr:`←`,nlarr:`↚`,nleftarrow:`↚`,rarr:`→`,rightarrow:`→`,shortrightarrow:`→`,srarr:`→`,nrarr:`↛`,nrightarrow:`↛`,shortuparrow:`↑`,uarr:`↑`,uparrow:`↑`,darr:`↓`,downarrow:`↓`,shortdownarrow:`↓`,harr:`↔`,leftrightarrow:`↔`,nharr:`↮`,nleftrightarrow:`↮`,updownarrow:`↕`,varr:`↕`,nwarr:`↖`,nwarrow:`↖`,upperleftarrow:`↖`,nearr:`↗`,nearrow:`↗`,upperrightarrow:`↗`,lowerrightarrow:`↘`,searr:`↘`,searrow:`↘`,lowerleftarrow:`↙`,swarr:`↙`,swarrow:`↙`,rarrw:`↝`,rightsquigarrow:`↝`,nrarrw:`↝̸`,Larr:`↞`,twoheadleftarrow:`↞`,Uarr:`↟`,Rarr:`↠`,twoheadrightarrow:`↠`,Darr:`↡`,larrtl:`↢`,leftarrowtail:`↢`,rarrtl:`↣`,rightarrowtail:`↣`,leftteearrow:`↤`,mapstoleft:`↤`,mapstoup:`↥`,upteearrow:`↥`,map:`↦`,mapsto:`↦`,rightteearrow:`↦`,downteearrow:`↧`,mapstodown:`↧`,hookleftarrow:`↩`,larrhk:`↩`,hookrightarrow:`↪`,rarrhk:`↪`,larrlp:`↫`,looparrowleft:`↫`,looparrowright:`↬`,rarrlp:`↬`,harrw:`↭`,leftrightsquigarrow:`↭`,lsh:`↰`,rsh:`↱`,ldsh:`↲`,rdsh:`↳`,crarr:`↵`,cularr:`↶`,curvearrowleft:`↶`,curarr:`↷`,curvearrowright:`↷`,circlearrowleft:`↺`,olarr:`↺`,circlearrowright:`↻`,orarr:`↻`,leftharpoonup:`↼`,leftvector:`↼`,lharu:`↼`,downleftvector:`↽`,leftharpoondown:`↽`,lhard:`↽`,rightupvector:`↾`,uharr:`↾`,upharpoonright:`↾`,leftupvector:`↿`,uharl:`↿`,upharpoonleft:`↿`,rharu:`⇀`,rightharpoonup:`⇀`,rightvector:`⇀`,downrightvector:`⇁`,rhard:`⇁`,rightharpoondown:`⇁`,dharr:`⇂`,downharpoonright:`⇂`,rightdownvector:`⇂`,dharl:`⇃`,downharpoonleft:`⇃`,leftdownvector:`⇃`,rightarrowleftarrow:`⇄`,rightleftarrows:`⇄`,rlarr:`⇄`,udarr:`⇅`,uparrowdownarrow:`⇅`,leftarrowrightarrow:`⇆`,leftrightarrows:`⇆`,lrarr:`⇆`,leftleftarrows:`⇇`,llarr:`⇇`,upuparrows:`⇈`,uuarr:`⇈`,rightrightarrows:`⇉`,rrarr:`⇉`,ddarr:`⇊`,downdownarrows:`⇊`,leftrightharpoons:`⇋`,lrhar:`⇋`,reverseequilibrium:`⇋`,equilibrium:`⇌`,rightleftharpoons:`⇌`,rlhar:`⇌`,doubleleftarrow:`⇐`,lArr:`⇐`,Leftarrow:`⇐`,nlArr:`⇍`,nLeftarrow:`⇍`,doubleuparrow:`⇑`,uArr:`⇑`,Uparrow:`⇑`,doublerightarrow:`⇒`,implies:`⇒`,rArr:`⇒`,Rightarrow:`⇒`,nrArr:`⇏`,nRightarrow:`⇏`,dArr:`⇓`,doubledownarrow:`⇓`,Downarrow:`⇓`,doubleleftrightarrow:`⇔`,hArr:`⇔`,iff:`⇔`,Leftrightarrow:`⇔`,nhArr:`⇎`,nLeftrightarrow:`⇎`,doubleupdownarrow:`⇕`,Updownarrow:`⇕`,vArr:`⇕`,nwArr:`⇖`,neArr:`⇗`,seArr:`⇘`,swArr:`⇙`,laarr:`⇚`,lleftarrow:`⇚`,raarr:`⇛`,rrightarrow:`⇛`,zigrarr:`⇝`,larrb:`⇤`,leftarrowbar:`⇤`,rarrb:`⇥`,rightarrowbar:`⇥`,downarrowuparrow:`⇵`,duarr:`⇵`,loarr:`⇽`,roarr:`⇾`,hoarr:`⇿`,forall:`∀`,comp:`∁`,complement:`∁`,part:`∂`,partiald:`∂`,npart:`∂̸`,exist:`∃`,exists:`∃`,nexist:`∄`,nexists:`∄`,notexists:`∄`,empty:`∅`,emptyset:`∅`,emptyv:`∅`,varnothing:`∅`,del:`∇`,nabla:`∇`,element:`∈`,in:`∈`,isin:`∈`,isinv:`∈`,notelement:`∉`,notin:`∉`,notinva:`∉`,ni:`∋`,niv:`∋`,reverseelement:`∋`,suchthat:`∋`,notni:`∌`,notniva:`∌`,notreverseelement:`∌`,backepsilon:`϶`,bepsi:`϶`,prod:`∏`,product:`∏`,coprod:`∐`,coproduct:`∐`,sum:`∑`,plus:`+`,plusminus:`±`,plusmn:`±`,pm:`±`,div:`÷`,divide:`÷`,times:`×`,lt:`<`,nless:`≮`,nlt:`≮`,notless:`≮`,nvlt:`<⃒`,equals:`=`,ne:`≠`,notequal:`≠`,bne:`=⃥`,equal:`⩵`,gt:`>`,ngt:`≯`,ngtr:`≯`,notgreater:`≯`,nvgt:`>⃒`,not:`¬`,verbar:`|`,vert:`|`,verticalline:`|`,brvbar:`¦`,minus:`−`,minusplus:`∓`,mnplus:`∓`,mp:`∓`,dotplus:`∔`,plusdo:`∔`,frasl:`⁄`,backslash:`∖`,setminus:`∖`,setmn:`∖`,smallsetminus:`∖`,ssetmn:`∖`,lowast:`∗`,compfn:`∘`,smallcircle:`∘`,radic:`√`,sqrt:`√`,prop:`∝`,proportional:`∝`,propto:`∝`,varpropto:`∝`,vprop:`∝`,infin:`∞`,angrt:`∟`,ang:`∠`,angle:`∠`,nang:`∠⃒`,angmsd:`∡`,measuredangle:`∡`,angsph:`∢`,mid:`∣`,shortmid:`∣`,smid:`∣`,verticalbar:`∣`,nmid:`∤`,notverticalbar:`∤`,nshortmid:`∤`,nsmid:`∤`,doubleverticalbar:`∥`,par:`∥`,parallel:`∥`,shortparallel:`∥`,spar:`∥`,notdoubleverticalbar:`∦`,npar:`∦`,nparallel:`∦`,nshortparallel:`∦`,nspar:`∦`,and:`∧`,wedge:`∧`,or:`∨`,vee:`∨`,cap:`∩`,caps:`∩︀`,cup:`∪`,cups:`∪︀`,int:`∫`,integral:`∫`,Int:`∬`,iiint:`∭`,tint:`∭`,iiiint:`⨌`,qint:`⨌`,conint:`∮`,contourintegral:`∮`,oint:`∮`,Conint:`∯`,doublecontourintegral:`∯`,cconint:`∰`,cwint:`∱`,clockwisecontourintegral:`∲`,cwconint:`∲`,awconint:`∳`,counterclockwisecontourintegral:`∳`,there4:`∴`,therefore:`∴`,becaus:`∵`,because:`∵`,ratio:`∶`,Colon:`∷`,proportion:`∷`,dotminus:`∸`,minusd:`∸`,mddot:`∺`,homtht:`∻`,sim:`∼`,thicksim:`∼`,thksim:`∼`,Tilde:`∼`,nottilde:`≁`,nsim:`≁`,nvsim:`∼⃒`,backsim:`∽`,bsim:`∽`,race:`∽̱`,ac:`∾`,mstpos:`∾`,ace:`∾̳`,acd:`∿`,verticaltilde:`≀`,wr:`≀`,wreath:`≀`,eqsim:`≂`,equaltilde:`≂`,esim:`≂`,nesim:`≂̸`,notequaltilde:`≂̸`,sime:`≃`,simeq:`≃`,tildeequal:`≃`,nottildeequal:`≄`,nsime:`≄`,nsimeq:`≄`,cong:`≅`,tildefullequal:`≅`,ncong:`≇`,nottildefullequal:`≇`,simne:`≆`,ap:`≈`,approx:`≈`,asymp:`≈`,thickapprox:`≈`,thkap:`≈`,tildetilde:`≈`,nap:`≉`,napprox:`≉`,nottildetilde:`≉`,ape:`≊`,approxeq:`≊`,apid:`≋`,napid:`≋̸`,backcong:`≌`,bcong:`≌`,asympeq:`≍`,CupCap:`≍`,notcupcap:`≭`,nvap:`≍⃒`,bump:`≎`,Bumpeq:`≎`,humpdownhump:`≎`,nbump:`≎̸`,nothumpdownhump:`≎̸`,bumpe:`≏`,bumpeq:`≏`,humpequal:`≏`,nbumpe:`≏̸`,nothumpequal:`≏̸`,doteq:`≐`,dotequal:`≐`,esdot:`≐`,nedot:`≐̸`,doteqdot:`≑`,eDot:`≑`,efdot:`≒`,fallingdotseq:`≒`,erdot:`≓`,risingdotseq:`≓`,assign:`≔`,colone:`≔`,coloneq:`≔`,ecolon:`≕`,eqcolon:`≕`,ecir:`≖`,eqcirc:`≖`,circeq:`≗`,cire:`≗`,wedgeq:`≙`,veeeq:`≚`,triangleq:`≜`,trie:`≜`,equest:`≟`,questeq:`≟`,congruent:`≡`,equiv:`≡`,nequiv:`≢`,notcongruent:`≢`,bnequiv:`≡⃥`,le:`≤`,leq:`≤`,nle:`≰`,nleq:`≰`,notlessequal:`≰`,nvle:`≤⃒`,ge:`≥`,geq:`≥`,greaterequal:`≥`,nge:`≱`,ngeq:`≱`,notgreaterequal:`≱`,nvge:`≥⃒`,lE:`≦`,leqq:`≦`,lessfullequal:`≦`,nlE:`≦̸`,nleqq:`≦̸`,gE:`≧`,geqq:`≧`,greaterfullequal:`≧`,ngE:`≧̸`,ngeqq:`≧̸`,notgreaterfullequal:`≧̸`,lnE:`≨`,lneqq:`≨`,lvertneqq:`≨︀`,lvne:`≨︀`,gnE:`≩`,gneqq:`≩`,gvertneqq:`≩︀`,gvne:`≩︀`,ll:`≪`,Lt:`≪`,nestedlessless:`≪`,nltv:`≪̸`,notlessless:`≪̸`,nLt:`≪⃒`,gg:`≫`,Gt:`≫`,nestedgreatergreater:`≫`,ngtv:`≫̸`,notgreatergreater:`≫̸`,nGt:`≫⃒`,between:`≬`,twixt:`≬`,lesssim:`≲`,lesstilde:`≲`,lsim:`≲`,nlsim:`≴`,notlesstilde:`≴`,greatertilde:`≳`,gsim:`≳`,gtrsim:`≳`,ngsim:`≵`,notgreatertilde:`≵`,lessgreater:`≶`,lessgtr:`≶`,lg:`≶`,notlessgreater:`≸`,ntlg:`≸`,gl:`≷`,greaterless:`≷`,gtrless:`≷`,notgreaterless:`≹`,ntgl:`≹`,pr:`≺`,prec:`≺`,precedes:`≺`,notprecedes:`⊀`,npr:`⊀`,nprec:`⊀`,sc:`≻`,succ:`≻`,succeeds:`≻`,notsucceeds:`⊁`,nsc:`⊁`,nsucc:`⊁`,prcue:`≼`,preccurlyeq:`≼`,precedesslantequal:`≼`,notprecedesslantequal:`⋠`,nprcue:`⋠`,sccue:`≽`,succcurlyeq:`≽`,succeedsslantequal:`≽`,notsucceedsslantequal:`⋡`,nsccue:`⋡`,precedestilde:`≾`,precsim:`≾`,prsim:`≾`,scsim:`≿`,succeedstilde:`≿`,succsim:`≿`,notsucceedstilde:`≿̸`,sub:`⊂`,subset:`⊂`,nsub:`⊄`,notsubset:`⊂⃒`,nsubset:`⊂⃒`,vnsub:`⊂⃒`,sup:`⊃`,superset:`⊃`,supset:`⊃`,nsup:`⊅`,notsuperset:`⊃⃒`,nsupset:`⊃⃒`,vnsup:`⊃⃒`,sube:`⊆`,subseteq:`⊆`,subsetequal:`⊆`,notsubsetequal:`⊈`,nsube:`⊈`,nsubseteq:`⊈`,supe:`⊇`,supersetequal:`⊇`,supseteq:`⊇`,notsupersetequal:`⊉`,nsupe:`⊉`,nsupseteq:`⊉`,subne:`⊊`,subsetneq:`⊊`,varsubsetneq:`⊊︀`,vsubne:`⊊︀`,supne:`⊋`,supsetneq:`⊋`,varsupsetneq:`⊋︀`,vsupne:`⊋︀`,cupdot:`⊍`,unionplus:`⊎`,uplus:`⊎`,sqsub:`⊏`,sqsubset:`⊏`,squaresubset:`⊏`,notsquaresubset:`⊏̸`,sqsup:`⊐`,sqsupset:`⊐`,squaresuperset:`⊐`,notsquaresuperset:`⊐̸`,sqsube:`⊑`,sqsubseteq:`⊑`,squaresubsetequal:`⊑`,notsquaresubsetequal:`⋢`,nsqsube:`⋢`,sqsupe:`⊒`,sqsupseteq:`⊒`,squaresupersetequal:`⊒`,notsquaresupersetequal:`⋣`,nsqsupe:`⋣`,sqcap:`⊓`,sqcaps:`⊓︀`,squareintersection:`⊓`,sqcup:`⊔`,sqcups:`⊔︀`,squareunion:`⊔`,circleplus:`⊕`,oplus:`⊕`,circleminus:`⊖`,ominus:`⊖`,circletimes:`⊗`,otimes:`⊗`,osol:`⊘`,circledot:`⊙`,odot:`⊙`,circledcirc:`⊚`,ocir:`⊚`,circledast:`⊛`,oast:`⊛`,circleddash:`⊝`,odash:`⊝`,boxplus:`⊞`,plusb:`⊞`,boxminus:`⊟`,minusb:`⊟`,boxtimes:`⊠`,timesb:`⊠`,dotsquare:`⊡`,sdotb:`⊡`,righttee:`⊢`,vdash:`⊢`,nvdash:`⊬`,dashv:`⊣`,lefttee:`⊣`,downtee:`⊤`,top:`⊤`,bot:`⊥`,bottom:`⊥`,perp:`⊥`,uptee:`⊥`,models:`⊧`,doublerighttee:`⊨`,vDash:`⊨`,nvDash:`⊭`,Vdash:`⊩`,nVdash:`⊮`,vvdash:`⊪`,VDash:`⊫`,nVDash:`⊯`,prurel:`⊰`,lefttriangle:`⊲`,vartriangleleft:`⊲`,vltri:`⊲`,nltri:`⋪`,notlefttriangle:`⋪`,ntriangleleft:`⋪`,righttriangle:`⊳`,vartriangleright:`⊳`,vrtri:`⊳`,notrighttriangle:`⋫`,nrtri:`⋫`,ntriangleright:`⋫`,lefttriangleequal:`⊴`,ltrie:`⊴`,trianglelefteq:`⊴`,nltrie:`⋬`,notlefttriangleequal:`⋬`,ntrianglelefteq:`⋬`,nvltrie:`⊴⃒`,righttriangleequal:`⊵`,rtrie:`⊵`,trianglerighteq:`⊵`,notrighttriangleequal:`⋭`,nrtrie:`⋭`,ntrianglerighteq:`⋭`,nvrtrie:`⊵⃒`,origof:`⊶`,imof:`⊷`,multimap:`⊸`,mumap:`⊸`,hercon:`⊹`,intcal:`⊺`,intercal:`⊺`,veebar:`⊻`,barvee:`⊽`,angrtvb:`⊾`,lrtri:`⊿`,bigwedge:`⋀`,Wedge:`⋀`,xwedge:`⋀`,bigvee:`⋁`,Vee:`⋁`,xvee:`⋁`,bigcap:`⋂`,intersection:`⋂`,xcap:`⋂`,bigcup:`⋃`,union:`⋃`,xcup:`⋃`,diam:`⋄`,diamond:`⋄`,sdot:`⋅`,sstarf:`⋆`,Star:`⋆`,divideontimes:`⋇`,divonx:`⋇`,bowtie:`⋈`,ltimes:`⋉`,rtimes:`⋊`,leftthreetimes:`⋋`,lthree:`⋋`,rightthreetimes:`⋌`,rthree:`⋌`,backsimeq:`⋍`,bsime:`⋍`,curlyvee:`⋎`,cuvee:`⋎`,curlywedge:`⋏`,cuwed:`⋏`,Sub:`⋐`,Subset:`⋐`,Sup:`⋑`,Supset:`⋑`,Cap:`⋒`,Cup:`⋓`,fork:`⋔`,pitchfork:`⋔`,epar:`⋕`,lessdot:`⋖`,ltdot:`⋖`,gtdot:`⋗`,gtrdot:`⋗`,Ll:`⋘`,nll:`⋘̸`,Gg:`⋙`,ggg:`⋙`,ngg:`⋙̸`,leg:`⋚`,lesg:`⋚︀`,lesseqgtr:`⋚`,lessequalgreater:`⋚`,gel:`⋛`,gesl:`⋛︀`,greaterequalless:`⋛`,gtreqless:`⋛`,cuepr:`⋞`,curlyeqprec:`⋞`,cuesc:`⋟`,curlyeqsucc:`⋟`,lnsim:`⋦`,gnsim:`⋧`,precnsim:`⋨`,prnsim:`⋨`,scnsim:`⋩`,succnsim:`⋩`,vellip:`⋮`,ctdot:`⋯`,utdot:`⋰`,dtdot:`⋱`,disin:`⋲`,isinsv:`⋳`,isins:`⋴`,isindot:`⋵`,notindot:`⋵̸`,notinvc:`⋶`,notinvb:`⋷`,isine:`⋹`,notine:`⋹̸`,nisd:`⋺`,xnis:`⋻`,nis:`⋼`,notnivc:`⋽`,notnivb:`⋾`,barwed:`⌅`,barwedge:`⌅`,Barwed:`⌆`,doublebarwedge:`⌆`,drcrop:`⌌`,dlcrop:`⌍`,urcrop:`⌎`,ulcrop:`⌏`,bnot:`⌐`,profline:`⌒`,profsurf:`⌓`,telrec:`⌕`,target:`⌖`,ulcorn:`⌜`,ulcorner:`⌜`,urcorn:`⌝`,urcorner:`⌝`,dlcorn:`⌞`,llcorner:`⌞`,drcorn:`⌟`,lrcorner:`⌟`,frown:`⌢`,sfrown:`⌢`,smile:`⌣`,ssmile:`⌣`,cylcty:`⌭`,profalar:`⌮`,topbot:`⌶`,ovbar:`⌽`,solbar:`⌿`,angzarr:`⍼`,lmoust:`⎰`,lmoustache:`⎰`,rmoust:`⎱`,rmoustache:`⎱`,overbracket:`⎴`,tbrk:`⎴`,bbrk:`⎵`,underbracket:`⎵`,bbrktbrk:`⎶`,overparenthesis:`⏜`,underparenthesis:`⏝`,overbrace:`⏞`,underbrace:`⏟`,trpezium:`⏢`,elinters:`⏧`,blank:`␣`,boxh:`─`,horizontalline:`─`,boxv:`│`,boxdr:`┌`,boxdl:`┐`,boxur:`└`,boxul:`┘`,boxvr:`├`,boxvl:`┤`,boxhd:`┬`,boxhu:`┴`,boxvh:`┼`,boxH:`═`,boxV:`║`,boxdR:`╒`,boxDr:`╓`,boxDR:`╔`,boxdL:`╕`,boxDl:`╖`,boxDL:`╗`,boxuR:`╘`,boxUr:`╙`,boxUR:`╚`,boxuL:`╛`,boxUl:`╜`,boxUL:`╝`,boxvR:`╞`,boxVr:`╟`,boxVR:`╠`,boxvL:`╡`,boxVl:`╢`,boxVL:`╣`,boxHd:`╤`,boxhD:`╥`,boxHD:`╦`,boxHu:`╧`,boxhU:`╨`,boxHU:`╩`,boxvH:`╪`,boxVh:`╫`,boxVH:`╬`,uhblk:`▀`,lhblk:`▄`,block:`█`,blk14:`░`,blk12:`▒`,blk34:`▓`,squ:`□`,square:`□`,blacksquare:`▪`,filledverysmallsquare:`▪`,squarf:`▪`,squf:`▪`,emptyverysmallsquare:`▫`,rect:`▭`,marker:`▮`,fltns:`▱`,bigtriangleup:`△`,xutri:`△`,blacktriangle:`▴`,utrif:`▴`,triangle:`▵`,utri:`▵`,blacktriangleright:`▸`,rtrif:`▸`,rtri:`▹`,triangleright:`▹`,bigtriangledown:`▽`,xdtri:`▽`,blacktriangledown:`▾`,dtrif:`▾`,dtri:`▿`,triangledown:`▿`,blacktriangleleft:`◂`,ltrif:`◂`,ltri:`◃`,triangleleft:`◃`,loz:`◊`,lozenge:`◊`,cir:`○`,tridot:`◬`,bigcirc:`◯`,xcirc:`◯`,ultri:`◸`,urtri:`◹`,lltri:`◺`,emptysmallsquare:`◻`,filledsmallsquare:`◼`,bigstar:`★`,starf:`★`,star:`☆`,phone:`☎`,female:`♀`,male:`♂`,spades:`♠`,spadesuit:`♠`,clubs:`♣`,clubsuit:`♣`,hearts:`♥`,heartsuit:`♥`,diamondsuit:`♦`,diams:`♦`,sung:`♪`,check:`✓`,checkmark:`✓`,cross:`✗`,malt:`✠`,maltese:`✠`,sext:`✶`,verticalseparator:`❘`,bsolhsub:`⟈`,suphsol:`⟉`,longleftarrow:`⟵`,xlarr:`⟵`,longrightarrow:`⟶`,xrarr:`⟶`,longleftrightarrow:`⟷`,xharr:`⟷`,doublelongleftarrow:`⟸`,Longleftarrow:`⟸`,xlArr:`⟸`,doublelongrightarrow:`⟹`,Longrightarrow:`⟹`,xrArr:`⟹`,doublelongleftrightarrow:`⟺`,Longleftrightarrow:`⟺`,xhArr:`⟺`,longmapsto:`⟼`,xmap:`⟼`,dzigrarr:`⟿`,nvlarr:`⤂`,nvrarr:`⤃`,nvharr:`⤄`,Map:`⤅`,lbarr:`⤌`,bkarow:`⤍`,lBarr:`⤎`,dbkarow:`⤏`,rBarr:`⤏`,drbkarow:`⤐`,rbarr:`⤐`,RBarr:`⤐`,ddotrahd:`⤑`,uparrowbar:`⤒`,downarrowbar:`⤓`,Rarrtl:`⤖`,latail:`⤙`,ratail:`⤚`,lAtail:`⤛`,rAtail:`⤜`,larrfs:`⤝`,rarrfs:`⤞`,larrbfs:`⤟`,rarrbfs:`⤠`,nwarhk:`⤣`,nearhk:`⤤`,hksearow:`⤥`,searhk:`⤥`,hkswarow:`⤦`,swarhk:`⤦`,nwnear:`⤧`,nesear:`⤨`,toea:`⤨`,seswar:`⤩`,tosa:`⤩`,swnwar:`⤪`,rarrc:`⤳`,nrarrc:`⤳̸`,cudarrr:`⤵`,ldca:`⤶`,rdca:`⤷`,cudarrl:`⤸`,larrpl:`⤹`,curarrm:`⤼`,cularrp:`⤽`,rarrpl:`⥅`,harrcir:`⥈`,uarrocir:`⥉`,lurdshar:`⥊`,ldrushar:`⥋`,leftrightvector:`⥎`,rightupdownvector:`⥏`,downleftrightvector:`⥐`,leftupdownvector:`⥑`,leftvectorbar:`⥒`,rightvectorbar:`⥓`,rightupvectorbar:`⥔`,rightdownvectorbar:`⥕`,downleftvectorbar:`⥖`,downrightvectorbar:`⥗`,leftupvectorbar:`⥘`,leftdownvectorbar:`⥙`,leftteevector:`⥚`,rightteevector:`⥛`,rightupteevector:`⥜`,rightdownteevector:`⥝`,downleftteevector:`⥞`,downrightteevector:`⥟`,leftupteevector:`⥠`,leftdownteevector:`⥡`,lhar:`⥢`,uhar:`⥣`,rhar:`⥤`,dhar:`⥥`,luruhar:`⥦`,ldrdhar:`⥧`,ruluhar:`⥨`,rdldhar:`⥩`,lharul:`⥪`,llhard:`⥫`,rharul:`⥬`,lrhard:`⥭`,udhar:`⥮`,upequilibrium:`⥮`,duhar:`⥯`,reverseupequilibrium:`⥯`,roundimplies:`⥰`,erarr:`⥱`,simrarr:`⥲`,larrsim:`⥳`,rarrsim:`⥴`,rarrap:`⥵`,ltlarr:`⥶`,gtrarr:`⥸`,subrarr:`⥹`,suplarr:`⥻`,lfisht:`⥼`,rfisht:`⥽`,ufisht:`⥾`,dfisht:`⥿`,vzigzag:`⦚`,vangrt:`⦜`,angrtvbd:`⦝`,ange:`⦤`,range:`⦥`,dwangle:`⦦`,uwangle:`⦧`,angmsdaa:`⦨`,angmsdab:`⦩`,angmsdac:`⦪`,angmsdad:`⦫`,angmsdae:`⦬`,angmsdaf:`⦭`,angmsdag:`⦮`,angmsdah:`⦯`,bemptyv:`⦰`,demptyv:`⦱`,cemptyv:`⦲`,raemptyv:`⦳`,laemptyv:`⦴`,ohbar:`⦵`,omid:`⦶`,opar:`⦷`,operp:`⦹`,olcross:`⦻`,odsold:`⦼`,olcir:`⦾`,ofcir:`⦿`,olt:`⧀`,ogt:`⧁`,cirscir:`⧂`,cirE:`⧃`,solb:`⧄`,bsolb:`⧅`,boxbox:`⧉`,trisb:`⧍`,rtriltri:`⧎`,lefttrianglebar:`⧏`,notlefttrianglebar:`⧏̸`,righttrianglebar:`⧐`,notrighttrianglebar:`⧐̸`,iinfin:`⧜`,infintie:`⧝`,nvinfin:`⧞`,eparsl:`⧣`,smeparsl:`⧤`,eqvparsl:`⧥`,blacklozenge:`⧫`,lozf:`⧫`,ruledelayed:`⧴`,dsol:`⧶`,bigodot:`⨀`,xodot:`⨀`,bigoplus:`⨁`,xoplus:`⨁`,bigotimes:`⨂`,xotime:`⨂`,biguplus:`⨄`,xuplus:`⨄`,bigsqcup:`⨆`,xsqcup:`⨆`,fpartint:`⨍`,cirfnint:`⨐`,awint:`⨑`,rppolint:`⨒`,scpolint:`⨓`,npolint:`⨔`,pointint:`⨕`,quatint:`⨖`,intlarhk:`⨗`,pluscir:`⨢`,plusacir:`⨣`,simplus:`⨤`,plusdu:`⨥`,plussim:`⨦`,plustwo:`⨧`,mcomma:`⨩`,minusdu:`⨪`,loplus:`⨭`,roplus:`⨮`,Cross:`⨯`,timesd:`⨰`,timesbar:`⨱`,smashp:`⨳`,lotimes:`⨴`,rotimes:`⨵`,otimesas:`⨶`,Otimes:`⨷`,odiv:`⨸`,triplus:`⨹`,triminus:`⨺`,tritime:`⨻`,intprod:`⨼`,iprod:`⨼`,amalg:`⨿`,capdot:`⩀`,ncup:`⩂`,ncap:`⩃`,capand:`⩄`,cupor:`⩅`,cupcap:`⩆`,capcup:`⩇`,cupbrcap:`⩈`,capbrcup:`⩉`,cupcup:`⩊`,capcap:`⩋`,ccups:`⩌`,ccaps:`⩍`,ccupssm:`⩐`,And:`⩓`,Or:`⩔`,andand:`⩕`,oror:`⩖`,orslope:`⩗`,andslope:`⩘`,andv:`⩚`,orv:`⩛`,andd:`⩜`,ord:`⩝`,wedbar:`⩟`,sdote:`⩦`,simdot:`⩪`,congdot:`⩭`,ncongdot:`⩭̸`,easter:`⩮`,apacir:`⩯`,apE:`⩰`,nape:`⩰̸`,eplus:`⩱`,pluse:`⩲`,Esim:`⩳`,ddotseq:`⩷`,eddot:`⩷`,equivdd:`⩸`,ltcir:`⩹`,gtcir:`⩺`,ltquest:`⩻`,gtquest:`⩼`,leqslant:`⩽`,les:`⩽`,lessslantequal:`⩽`,nleqslant:`⩽̸`,nles:`⩽̸`,notlessslantequal:`⩽̸`,geqslant:`⩾`,ges:`⩾`,greaterslantequal:`⩾`,ngeqslant:`⩾̸`,nges:`⩾̸`,notgreaterslantequal:`⩾̸`,lesdot:`⩿`,gesdot:`⪀`,lesdoto:`⪁`,gesdoto:`⪂`,lesdotor:`⪃`,gesdotol:`⪄`,lap:`⪅`,lessapprox:`⪅`,gap:`⪆`,gtrapprox:`⪆`,lne:`⪇`,lneq:`⪇`,gne:`⪈`,gneq:`⪈`,lnap:`⪉`,lnapprox:`⪉`,gnap:`⪊`,gnapprox:`⪊`,lEg:`⪋`,lesseqqgtr:`⪋`,gEl:`⪌`,gtreqqless:`⪌`,lsime:`⪍`,gsime:`⪎`,lsimg:`⪏`,gsiml:`⪐`,lge:`⪑`,gle:`⪒`,lesges:`⪓`,gesles:`⪔`,els:`⪕`,eqslantless:`⪕`,egs:`⪖`,eqslantgtr:`⪖`,elsdot:`⪗`,egsdot:`⪘`,el:`⪙`,eg:`⪚`,siml:`⪝`,simg:`⪞`,simle:`⪟`,simge:`⪠`,lessless:`⪡`,notnestedlessless:`⪡̸`,greatergreater:`⪢`,notnestedgreatergreater:`⪢̸`,glj:`⪤`,gla:`⪥`,ltcc:`⪦`,gtcc:`⪧`,lescc:`⪨`,gescc:`⪩`,smt:`⪪`,lat:`⪫`,smte:`⪬`,smtes:`⪬︀`,late:`⪭`,lates:`⪭︀`,bumpE:`⪮`,pre:`⪯`,precedesequal:`⪯`,preceq:`⪯`,notprecedesequal:`⪯̸`,npre:`⪯̸`,npreceq:`⪯̸`,sce:`⪰`,succeedsequal:`⪰`,succeq:`⪰`,notsucceedsequal:`⪰̸`,nsce:`⪰̸`,nsucceq:`⪰̸`,prE:`⪳`,scE:`⪴`,precneqq:`⪵`,prne:`⪵`,scne:`⪶`,succneqq:`⪶`,prap:`⪷`,precapprox:`⪷`,scap:`⪸`,succapprox:`⪸`,precnapprox:`⪹`,prnap:`⪹`,scnap:`⪺`,succnapprox:`⪺`,Pr:`⪻`,Sc:`⪼`,subdot:`⪽`,supdot:`⪾`,subplus:`⪿`,supplus:`⫀`,submult:`⫁`,supmult:`⫂`,subedot:`⫃`,supedot:`⫄`,subE:`⫅`,subseteqq:`⫅`,nsubE:`⫅̸`,nsubseteqq:`⫅̸`,supE:`⫆`,supseteqq:`⫆`,nsupE:`⫆̸`,nsupseteqq:`⫆̸`,subsim:`⫇`,supsim:`⫈`,subnE:`⫋`,subsetneqq:`⫋`,varsubsetneqq:`⫋︀`,vsubnE:`⫋︀`,supnE:`⫌`,supsetneqq:`⫌`,varsupsetneqq:`⫌︀`,vsupnE:`⫌︀`,csub:`⫏`,csup:`⫐`,csube:`⫑`,csupe:`⫒`,subsup:`⫓`,supsub:`⫔`,subsub:`⫕`,supsup:`⫖`,suphsub:`⫗`,supdsub:`⫘`,forkv:`⫙`,topfork:`⫚`,mlcp:`⫛`,Dashv:`⫤`,doublelefttee:`⫤`,vdashl:`⫦`,barv:`⫧`,vbar:`⫨`,vbarv:`⫩`,Vbar:`⫫`,Not:`⫬`,bNot:`⫭`,rnmid:`⫮`,cirmid:`⫯`,midcir:`⫰`,topcir:`⫱`,nhpar:`⫲`,parsim:`⫳`,parsl:`⫽`,nparsl:`⫽⃥`,flat:`♭`,natur:`♮`,natural:`♮`,sharp:`♯`,curren:`¤`,cent:`¢`,dollar:`$`,pound:`£`,yen:`¥`,euro:`€`,sup1:`¹`,frac12:`½`,half:`½`,frac13:`⅓`,frac14:`¼`,frac15:`⅕`,frac16:`⅙`,frac18:`⅛`,sup2:`²`,frac23:`⅔`,frac25:`⅖`,sup3:`³`,frac34:`¾`,frac35:`⅗`,frac38:`⅜`,frac45:`⅘`,frac56:`⅚`,frac58:`⅝`,frac78:`⅞`,afr:`𝔞`,aopf:`𝕒`,ascr:`𝒶`,Afr:`𝔄`,Aopf:`𝔸`,Ascr:`𝒜`,ordf:`ª`,aacute:`á`,Aacute:`Á`,agrave:`à`,Agrave:`À`,abreve:`ă`,Abreve:`Ă`,acirc:`â`,Acirc:`Â`,aring:`å`,angst:`Å`,Aring:`Å`,auml:`ä`,Auml:`Ä`,atilde:`ã`,Atilde:`Ã`,aogon:`ą`,Aogon:`Ą`,amacr:`ā`,Amacr:`Ā`,aelig:`Æ`,AElig:`Æ`,bfr:`𝔟`,bopf:`𝕓`,bscr:`𝒷`,bernou:`ℬ`,bernoullis:`ℬ`,Bfr:`𝔅`,Bopf:`𝔹`,Bscr:`ℬ`,cfr:`𝔠`,copf:`𝕔`,cscr:`𝒸`,cayleys:`ℭ`,Cfr:`ℭ`,complexes:`ℂ`,Copf:`ℂ`,Cscr:`𝒞`,cacute:`ć`,Cacute:`Ć`,ccirc:`ĉ`,Ccirc:`Ĉ`,ccaron:`č`,Ccaron:`Č`,cdot:`ċ`,Cdot:`Ċ`,ccedil:`ç`,Ccedil:`Ç`,incare:`℅`,dfr:`𝔡`,differentiald:`ⅆ`,dopf:`𝕕`,dscr:`𝒹`,capitaldifferentiald:`ⅅ`,dd:`ⅅ`,DD:`ⅅ`,Dfr:`𝔇`,Dopf:`𝔻`,Dscr:`𝒟`,dcaron:`ď`,Dcaron:`Ď`,dstrok:`đ`,Dstrok:`Đ`,eth:`ð`,ETH:`Ð`,ee:`ⅇ`,efr:`𝔢`,eopf:`𝕖`,escr:`ℯ`,exponentiale:`ⅇ`,Efr:`𝔈`,Eopf:`𝔼`,Escr:`ℰ`,expectation:`ℰ`,eacute:`é`,Eacute:`É`,egrave:`è`,Egrave:`È`,ecirc:`ê`,Ecirc:`Ê`,ecaron:`ě`,Ecaron:`Ě`,euml:`ë`,Euml:`Ë`,edot:`ė`,Edot:`Ė`,eogon:`ę`,Eogon:`Ę`,emacr:`ē`,Emacr:`Ē`,ffr:`𝔣`,fopf:`𝕗`,fscr:`𝒻`,Ffr:`𝔉`,Fopf:`𝔽`,fouriertrf:`ℱ`,Fscr:`ℱ`,fflig:`ﬀ`,ffilig:`ﬃ`,ffllig:`ﬄ`,filig:`ﬁ`,fjlig:`fj`,fllig:`ﬂ`,fnof:`ƒ`,gfr:`𝔤`,gopf:`𝕘`,gscr:`ℊ`,Gfr:`𝔊`,Gopf:`𝔾`,Gscr:`𝒢`,gacute:`ǵ`,gbreve:`ğ`,Gbreve:`Ğ`,gcirc:`ĝ`,Gcirc:`Ĝ`,gdot:`ġ`,Gdot:`Ġ`,gcedil:`Ģ`,hfr:`𝔥`,hopf:`𝕙`,hscr:`𝒽`,planckh:`ℎ`,hamilt:`ℋ`,Hfr:`ℌ`,hilbertspace:`ℋ`,Hopf:`ℍ`,Hscr:`ℋ`,poincareplane:`ℌ`,quaternions:`ℍ`,hcirc:`ĥ`,Hcirc:`Ĥ`,hbar:`ℏ`,hslash:`ℏ`,hstrok:`ħ`,planck:`ℏ`,plankv:`ℏ`,Hstrok:`Ħ`,ifr:`𝔦`,ii:`ⅈ`,imaginaryi:`ⅈ`,iopf:`𝕚`,iscr:`𝒾`,Ifr:`ℑ`,im:`ℑ`,image:`ℑ`,imagline:`ℐ`,imagpart:`ℑ`,Iopf:`𝕀`,Iscr:`ℐ`,iacute:`í`,Iacute:`Í`,igrave:`ì`,Igrave:`Ì`,icirc:`î`,Icirc:`Î`,iuml:`ï`,Iuml:`Ï`,itilde:`ĩ`,Itilde:`Ĩ`,idot:`İ`,iogon:`į`,Iogon:`Į`,imacr:`ī`,Imacr:`Ī`,ijlig:`Ĳ`,IJlig:`Ĳ`,imath:`ı`,inodot:`ı`,jfr:`𝔧`,jopf:`𝕛`,jscr:`𝒿`,Jfr:`𝔍`,Jopf:`𝕁`,Jscr:`𝒥`,jcirc:`ĵ`,Jcirc:`Ĵ`,jmath:`ȷ`,kfr:`𝔨`,kopf:`𝕜`,kscr:`𝓀`,Kfr:`𝔎`,Kopf:`𝕂`,Kscr:`𝒦`,kcedil:`ķ`,Kcedil:`Ķ`,ell:`ℓ`,lfr:`𝔩`,lopf:`𝕝`,lscr:`𝓁`,lagran:`ℒ`,laplacetrf:`ℒ`,Lfr:`𝔏`,Lopf:`𝕃`,Lscr:`ℒ`,lacute:`ĺ`,Lacute:`Ĺ`,lcaron:`ľ`,Lcaron:`Ľ`,lcedil:`ļ`,Lcedil:`Ļ`,lstrok:`ł`,Lstrok:`Ł`,lmidot:`ŀ`,Lmidot:`Ŀ`,mfr:`𝔪`,mopf:`𝕞`,mscr:`𝓂`,mellintrf:`ℳ`,Mfr:`𝔐`,Mopf:`𝕄`,Mscr:`ℳ`,phmmat:`ℳ`,nfr:`𝔫`,nopf:`𝕟`,nscr:`𝓃`,naturals:`ℕ`,Nfr:`𝔑`,Nopf:`ℕ`,Nscr:`𝒩`,nacute:`ń`,Nacute:`Ń`,ncaron:`ň`,Ncaron:`Ň`,ntilde:`ñ`,Ntilde:`Ñ`,ncedil:`ņ`,Ncedil:`Ņ`,numero:`№`,eng:`ŋ`,ENG:`Ŋ`,ofr:`𝔬`,oopf:`𝕠`,order:`ℴ`,orderof:`ℴ`,oscr:`ℴ`,Ofr:`𝔒`,Oopf:`𝕆`,Oscr:`𝒪`,ordm:`º`,oacute:`ó`,Oacute:`Ó`,ograve:`ò`,Ograve:`Ò`,ocirc:`ô`,Ocirc:`Ô`,ouml:`ö`,Ouml:`Ö`,odblac:`ő`,Odblac:`Ő`,otilde:`õ`,Otilde:`Õ`,oslash:`ø`,Oslash:`Ø`,omacr:`ō`,Omacr:`Ō`,oelig:`Œ`,OElig:`Œ`,pfr:`𝔭`,popf:`𝕡`,pscr:`𝓅`,Pfr:`𝔓`,Popf:`ℙ`,primes:`ℙ`,Pscr:`𝒫`,qfr:`𝔮`,qopf:`𝕢`,qscr:`𝓆`,Qfr:`𝔔`,Qopf:`ℚ`,Qscr:`𝒬`,rationals:`ℚ`,kgreen:`ĸ`,rfr:`𝔯`,ropf:`𝕣`,rscr:`𝓇`,re:`ℜ`,real:`ℜ`,realine:`ℛ`,realpart:`ℜ`,reals:`ℝ`,Rfr:`ℜ`,Ropf:`ℝ`,Rscr:`ℛ`,racute:`ŕ`,Racute:`Ŕ`,rcaron:`ř`,Rcaron:`Ř`,rcedil:`ŗ`,Rcedil:`Ŗ`,sfr:`𝔰`,sopf:`𝕤`,sscr:`𝓈`,Sfr:`𝔖`,Sopf:`𝕊`,Sscr:`𝒮`,circleds:`Ⓢ`,os:`Ⓢ`,sacute:`ś`,Sacute:`Ś`,scirc:`ŝ`,Scirc:`Ŝ`,scaron:`š`,Scaron:`Š`,scedil:`ş`,Scedil:`Ş`,szlig:`ß`,tfr:`𝔱`,topf:`𝕥`,tscr:`𝓉`,Tfr:`𝔗`,Topf:`𝕋`,Tscr:`𝒯`,tcaron:`ť`,Tcaron:`Ť`,tcedil:`ţ`,Tcedil:`Ţ`,trade:`™`,tstrok:`ŧ`,Tstrok:`Ŧ`,ufr:`𝔲`,uopf:`𝕦`,uscr:`𝓊`,Ufr:`𝔘`,Uopf:`𝕌`,Uscr:`𝒰`,uacute:`ú`,Uacute:`Ú`,ugrave:`ù`,Ugrave:`Ù`,ubreve:`ŭ`,Ubreve:`Ŭ`,ucirc:`û`,Ucirc:`Û`,uring:`ů`,Uring:`Ů`,uuml:`ü`,Uuml:`Ü`,udblac:`ű`,Udblac:`Ű`,utilde:`ũ`,Utilde:`Ũ`,uogon:`ų`,Uogon:`Ų`,umacr:`ū`,Umacr:`Ū`,vfr:`𝔳`,vopf:`𝕧`,vscr:`𝓋`,Vfr:`𝔙`,Vopf:`𝕍`,Vscr:`𝒱`,wfr:`𝔴`,wopf:`𝕨`,wscr:`𝓌`,Wfr:`𝔚`,Wopf:`𝕎`,Wscr:`𝒲`,wcirc:`ŵ`,Wcirc:`Ŵ`,xfr:`𝔵`,xopf:`𝕩`,xscr:`𝓍`,Xfr:`𝔛`,Xopf:`𝕏`,Xscr:`𝒳`,yfr:`𝔶`,yopf:`𝕪`,yscr:`𝓎`,Yfr:`𝔜`,Yopf:`𝕐`,Yscr:`𝒴`,yacute:`ý`,Yacute:`Ý`,ycirc:`ŷ`,Ycirc:`Ŷ`,yuml:`ÿ`,Yuml:`Ÿ`,zfr:`𝔷`,zopf:`𝕫`,zscr:`𝓏`,integers:`ℤ`,zeetrf:`ℨ`,Zfr:`ℨ`,Zopf:`ℤ`,Zscr:`𝒵`,zacute:`ź`,Zacute:`Ź`,zcaron:`ž`,Zcaron:`Ž`,zdot:`ż`,Zdot:`Ż`,imped:`Ƶ`,thorn:`þ`,THORN:`Þ`,napos:`ŉ`,alpha:`α`,Alpha:`Α`,beta:`β`,Beta:`Β`,gamma:`γ`,Gamma:`Γ`,delta:`δ`,Delta:`Δ`,epsi:`ε`,epsilon:`ε`,epsiv:`ϵ`,straightepsilon:`ϵ`,varepsilon:`ϵ`,Epsilon:`Ε`,digamma:`ϝ`,gammad:`ϝ`,Gammad:`Ϝ`,zeta:`ζ`,Zeta:`Ζ`,eta:`η`,Eta:`Η`,theta:`θ`,thetasym:`ϑ`,thetav:`ϑ`,vartheta:`ϑ`,Theta:`Θ`,iota:`ι`,Iota:`Ι`,kappa:`κ`,kappav:`ϰ`,varkappa:`ϰ`,Kappa:`Κ`,lambda:`λ`,Lambda:`Λ`,mu:`μ`,micro:`µ`,Mu:`Μ`,nu:`ν`,Nu:`Ν`,xi:`ξ`,Xi:`Ξ`,omicron:`ο`,Omicron:`Ο`,pi:`π`,piv:`ϖ`,varpi:`ϖ`,Pi:`Π`,rho:`ρ`,rhov:`ϱ`,varrho:`ϱ`,Rho:`Ρ`,sigma:`σ`,Sigma:`Σ`,sigmaf:`ς`,sigmav:`ς`,varsigma:`ς`,tau:`τ`,Tau:`Τ`,upsi:`υ`,upsilon:`υ`,Upsilon:`Υ`,Upsi:`ϒ`,upsih:`ϒ`,phi:`φ`,phiv:`ϕ`,straightphi:`ϕ`,varphi:`ϕ`,Phi:`Φ`,chi:`χ`,Chi:`Χ`,psi:`ψ`,Psi:`Ψ`,omega:`ω`,ohm:`Ω`,Omega:`Ω`,acy:`а`,Acy:`А`,bcy:`б`,Bcy:`Б`,vcy:`в`,Vcy:`В`,gcy:`г`,Gcy:`Г`,gjcy:`Ѓ`,GJcy:`Ѓ`,dcy:`д`,Dcy:`Д`,djcy:`Ђ`,DJcy:`Ђ`,iecy:`Е`,IEcy:`Е`,iocy:`Ё`,IOcy:`Ё`,jukcy:`є`,Jukcy:`Є`,zhcy:`Ж`,ZHcy:`Ж`,zcy:`з`,Zcy:`З`,dscy:`Ѕ`,DScy:`Ѕ`,icy:`и`,Icy:`И`,iukcy:`і`,Iukcy:`І`,yicy:`Ї`,YIcy:`Ї`,jcy:`й`,Jcy:`Й`,jsercy:`ј`,Jsercy:`Ј`,kcy:`к`,Kcy:`К`,kjcy:`Ќ`,KJcy:`Ќ`,lcy:`л`,Lcy:`Л`,ljcy:`Љ`,LJcy:`Љ`,mcy:`м`,Mcy:`М`,ncy:`н`,Ncy:`Н`,njcy:`Њ`,NJcy:`Њ`,ocy:`о`,Ocy:`О`,pcy:`п`,Pcy:`П`,rcy:`р`,Rcy:`Р`,scy:`с`,Scy:`С`,tcy:`т`,Tcy:`Т`,tshcy:`ћ`,TSHcy:`Ћ`,ucy:`у`,Ucy:`У`,ubrcy:`ў`,Ubrcy:`Ў`,fcy:`ф`,Fcy:`Ф`,khcy:`Х`,KHcy:`Х`,tscy:`Ц`,TScy:`Ц`,chcy:`Ч`,CHcy:`Ч`,dzcy:`Џ`,DZcy:`Џ`,shcy:`Ш`,SHcy:`Ш`,shchcy:`щ`,SHCHcy:`Щ`,hardcy:`ъ`,HARDcy:`Ъ`,ycy:`ы`,Ycy:`Ы`,softcy:`ь`,SOFTcy:`Ь`,ecy:`э`,Ecy:`Э`,yucy:`Ю`,YUcy:`Ю`,yacy:`Я`,YAcy:`Я`,alefsym:`ℵ`,aleph:`ℵ`,beth:`ℶ`,gimel:`ℷ`,daleth:`ℸ`};function Ce(e){return L[e]||L[e.toLowerCase()]}var R=32,z=9,we=13,B=10,V=96,Te=126,Ee=91,De=94,H=62,Oe=35,ke=37,U=45,Ae=61,je=92,Me=42,Ne=95,Pe=60,Fe=64,Ie=93,Le=33,Re=38,ze=58,Be=70,Ve=102,He=104,Ue=119,We=116,Ge=112,Ke=115,qe=160,Je=12,Ye=44,Xe=59,Ze=63,Qe=46,$e=47,et=39,tt=34,nt=43,rt=124,it=123,at=125,ot=40,st=41,ct=78,lt=110,ut=79,dt=111,ft=120,pt=88,mt=30,W=48,G=57,K=65,q=90,J=97,ht=122,gt=128,_t=32,Y={blockQuote:0,breakLine:1,breakThematic:2,codeBlock:3,codeInline:4,footnote:5,footnoteReference:6,frontmatter:7,gfmTask:8,heading:9,htmlBlock:10,htmlComment:11,htmlSelfClosing:12,image:13,link:14,orderedList:15,paragraph:16,ref:17,refCollection:18,table:19,text:20,textFormatted:21,unorderedList:22};function vt(e){if(!jt(e,`---`))return null;let t=3;for(;t<e.length&&(e[t]===` `||e[t]===`	`);)t++;if(t<e.length&&e[t]===`\r`&&t++,t>=e.length||e[t]!==`
`)return null;t++;let n=!1;for(;t<e.length;){let r=t;for(;t<e.length&&e[t]!==`
`&&e[t]!==`\r`;)t++;if(t>=e.length)break;let i=t;if(e[t]===`\r`&&t++,t<e.length&&e[t]===`
`&&t++,jt(e,`---`,r))return{endPos:t,hasValidYaml:n};if(!n){let t=qt(e,r,i);if(t<i){let r=e.charCodeAt(t);if(r>=J&&r<=ht||r>=K&&r<=q||r>=W&&r<=G||r===Ne){for(t++;t<i&&(r=e.charCodeAt(t),r>=J&&r<=ht||r>=K&&r<=q||r>=W&&r<=G||r===Ne||r===U||r===Qe);)t++;t<i&&e.charCodeAt(t)===ze&&(t++,t>=i?n=!0:(r=e.charCodeAt(t),(r===R||r===z)&&(n=!0)))}}}}return null}var yt=/&([a-zA-Z0-9]+|#[0-9]{1,7}|#x[0-9a-fA-F]{1,6});/gi,bt={class:`className`,for:`htmlFor`,allowfullscreen:`allowFullScreen`,allowtransparency:`allowTransparency`,autocomplete:`autoComplete`,autofocus:`autoFocus`,autoplay:`autoPlay`,cellpadding:`cellPadding`,cellspacing:`cellSpacing`,charset:`charSet`,classid:`classId`,colspan:`colSpan`,contenteditable:`contentEditable`,contextmenu:`contextMenu`,crossorigin:`crossOrigin`,enctype:`encType`,formaction:`formAction`,formenctype:`formEncType`,formmethod:`formMethod`,formnovalidate:`formNoValidate`,formtarget:`formTarget`,frameborder:`frameBorder`,hreflang:`hrefLang`,inputmode:`inputMode`,keyparams:`keyParams`,keytype:`keyType`,marginheight:`marginHeight`,marginwidth:`marginWidth`,maxlength:`maxLength`,mediagroup:`mediaGroup`,minlength:`minLength`,novalidate:`noValidate`,radiogroup:`radioGroup`,readonly:`readOnly`,rowspan:`rowSpan`,spellcheck:`spellCheck`,srcdoc:`srcDoc`,srclang:`srcLang`,srcset:`srcSet`,tabindex:`tabIndex`,usemap:`useMap`,viewbox:`viewBox`},xt={};function St(e){if(!e)return xt;var t={};for(var n in e){var r=bt[n.toLowerCase()];if(r)t[r]=e[n];else{var i=n.indexOf(`:`);i===-1?t[n]=e[n]:t[n.slice(0,i)+n[i+1].toUpperCase()+n.slice(i+2)]=e[n]}}return t}var Ct=/(\n|^[-*]\s|^#|^ {2,}|^-{2,}|^>\s|^<(div|p|h[1-6]|ul|ol|li|blockquote|pre|table|thead|tbody|tr|td|th|dl|dt|dd|hr|address|article|aside|details|dialog|figure|figcaption|footer|form|header|main|menu|nav|section|summary|textarea|fieldset|legend|center|dir|hgroup|marquee|search|output|template)\b)/i;function wt(e){return e.indexOf(`&`)===-1?e:e.replace(yt,(e,t)=>{var n=Ce(t);if(n)return n;if(t[0]===`#`){var r=t[1]===`x`||t[1]===`X`?Number.parseInt(t.slice(2),16):Number.parseInt(t.slice(1),10);return r===0||r>=55296&&r<=57343||r>1114111?`�`:r<=65535?String.fromCharCode(r):String.fromCharCode(55296+(r-65536>>10),56320+(r-65536&1023))}return e})}var Tt=/(javascript|vbscript|data(?!:image)):/i;function Et(e){if(Tt.test(e))return null;if(e.indexOf(`%`)===-1)return e;try{let t=decodeURIComponent(e).replace(/[^A-Za-z0-9/:]/g,``);if(Tt.test(t))return null}catch{return null}return e}var Dt={},Ot,kt;for(Ot=[192,193,194,195,196,197,224,225,226,227,228,229,230,198],kt=0;kt<Ot.length;kt++)Dt[Ot[kt]]=`a`;for(Dt[231]=Dt[199]=`c`,Dt[240]=Dt[208]=`d`,Ot=[200,201,202,203,233,232,234,235],kt=0;kt<Ot.length;kt++)Dt[Ot[kt]]=`e`;for(Ot=[207,239,206,238,205,237,204,236],kt=0;kt<Ot.length;kt++)Dt[Ot[kt]]=`i`;for(Dt[209]=Dt[241]=`n`,Ot=[248,216,339,338,213,245,212,244,211,243,210,242],kt=0;kt<Ot.length;kt++)Dt[Ot[kt]]=`o`;for(Ot=[220,252,219,251,218,250,217,249],kt=0;kt<Ot.length;kt++)Dt[Ot[kt]]=`u`;Dt[376]=Dt[255]=Dt[221]=Dt[253]=`y`;function At(e){for(var t=``,n=-1,r=e.length,i=0;i<r;i++){var a=e.charCodeAt(i);if(a>=J&&a<=ht||a>=W&&a<=G){n<0&&(n=i);continue}if(a>=K&&a<=q){n>=0&&(t+=e.slice(n,i),n=-1),t+=String.fromCharCode(a+_t);continue}if(a===R||a===U){n>=0&&(t+=e.slice(n,i),n=-1),t+=`-`;continue}n>=0&&(t+=e.slice(n,i),n=-1);var o=Dt[a];o&&(t+=o)}return n>=0&&(t+=e.slice(n)),t}function jt(e,t,n){return e.startsWith(t,n)}var Mt=new Set([`area`,`base`,`br`,`col`,`embed`,`hr`,`img`,`input`,`link`,`meta`,`param`,`source`,`track`,`wbr`,`circle`,`ellipse`,`line`,`path`,`polygon`,`polyline`,`rect`,`use`,`stop`,`animate`,`set`]);function Nt(e){let t=e.toLowerCase();if(Mt.has(t))return!0;let n=t.indexOf(`:`);return n!==-1&&(t=t.slice(n+1),Mt.has(t))}var Pt=1,Ft=2,It=4,Lt=8,Rt=16,zt=32,Bt=64,Vt=(()=>{var e=new Uint8Array(128),t;for(e[z]=Pt,e[B]=Pt|Ft,e[Je]=Pt,e[we]=Pt|Ft,e[R]=Pt,t=Le;t<=$e;t++)e[t]=It;for(t=ze;t<=Fe;t++)e[t]=It;for(t=Ee;t<=V;t++)e[t]=It;for(t=it;t<=Te;t++)e[t]=It;for(t=W;t<=G;t++)e[t]=Rt;for(t=K;t<=q;t++)e[t]=Lt;for(t=J;t<=ht;t++)e[t]=Lt;return e})(),Ht=/[\p{P}\p{S}]/u,Ut=/\p{Zs}/u,Wt=[];function Gt(e){var t=e.indexOf(`\r`),n=e.indexOf(`\0`);if(t===-1&&n===-1)return e;var r=e.length;Wt.length=0;var i=0,a=0;for(a=t===-1?n:n===-1||t<n?t:n;a<r;a++){var o=e.charCodeAt(a);o===we?(i<a&&Wt.push(e.slice(i,a)),a+1<r&&e.charCodeAt(a+1)===B&&a++,Wt.push(`
`),i=a+1):o===0&&(i<a&&Wt.push(e.slice(i,a)),Wt.push(`�`),i=a+1)}return i<r&&Wt.push(e.slice(i)),Wt.join(``)}function Kt(e){return e.replace(/>\s+</g,`><`).replace(/\n+/g,` `).trim()}function qt(e,t,n){let r=n??e.length;for(;t<r&&(e[t]===` `||e[t]===`	`);)t++;return t}function Jt(e){if(!e)return!1;for(var t in e)return!0;return!1}function Yt(e){return{attrs:{},children:[{type:Y.text,text:e}],c:!0,type:Y.htmlBlock,tag:`header`}}var Xt=/^\n+/;function Zt(e){for(var t=e.length;t>0&&(e[t-1]===`
`||e[t-1]===`\r`);)t--;return`${e.slice(0,t).replace(Xt,``)}

`}function Qt(e){if((e.type===Y.htmlSelfClosing||e.type===Y.htmlBlock)&&e.a)return[];if(e.type===Y.paragraph){var t=e.children;return t?t.flatMap(Qt):[]}return e.type===Y.text?e.text?.trim()?[e]:[]:e.type===Y.htmlBlock&&e.children?[{...e,children:e.children?.flatMap(Qt)}]:[e]}function $t(e){for(var t=0;t<e.length;t++){if(e[t].type===Y.htmlBlock){var n=e[t],r=!1;if(n.c&&t===e.length-1){var i=n.j===void 0?n.a?n.e||``:(n.e||``)+(n.h||``):n.j,a=`</${String(n.tag).toLowerCase()}>`,o=i.toLowerCase().indexOf(a);o!==-1&&i.slice(o+a.length).replace(/<\/[a-z][a-z0-9-]*\s*>/gi,``).trim()&&(r=!0)}r||(n.c=!1)}`children`in e[t]&&e[t].children&&$t(e[t].children)}}function en(e,t){for(var n=0;n<e.length;n++){var r=e[n];if(r.type===Y.paragraph&&r.children)for(var i=r.children,a=0;a<i.length;a++){var o=i[a];if(o.type===Y.htmlSelfClosing&&o.a&&o.tag.toLowerCase()===t){var s=e.slice(0,n);a>0&&s.push({type:Y.paragraph,children:i.slice(0,a)});var c=[];if(a+1<i.length){var l=i.slice(a+1).filter(e=>!(e.type===Y.htmlSelfClosing&&e.a));l.length>0&&(c=l)}return c=c.concat(e.slice(n+1)),{found:!0,beforeClose:s,afterClose:c}}}if((r.type===Y.htmlSelfClosing||r.type===Y.htmlBlock)&&r.a&&r.tag.toLowerCase()===t)return{found:!0,beforeClose:e.slice(0,n),afterClose:e.slice(n+1)}}return{found:!1,beforeClose:e,afterClose:[]}}function tn(e){var t=``;for(var n in e){var r=e[n];r===!0?t+=` ${n}`:r!==void 0&&r!=null&&r!==!1&&(t+=` ${n}="${String(r)}"`)}return t}function nn(e,t,n,r){var i;return i=t===void 0?tn(n):t.length>0&&t.charCodeAt(0)>R?` ${t}`:t,`<${e}${i}${r}`}function rn(e){var t=e.tag,n=e.type===Y.htmlSelfClosing,r=e,i=r.b,a=`</${t}>`;if(!n&&r.a)return{kind:`literal`,literal:(r.h||a)+(r.e||``)};if(n){var o=e;return o.a?{kind:`literal`,literal:o.h||a}:o.m?{kind:`literal`,literal:o.m}:{kind:`literal`,literal:nn(t,i,e.attrs,` />`)}}var s=nn(t,i,e.attrs,`>`),c=r.children,l=c!=null&&c.length>0;if(r.c&&r.j!==void 0)return l?{kind:`sandwich`,open:s,close:a}:{kind:`literal`,literal:r.j};if(r.c&&!l)return{kind:`literal`,literal:s+(r.e||``)+(r.h||a)};if(c!=null&&c.length>0){for(var u=``,d=0;d<c.length;d++){var f=c[d];if(f.type!==Y.text)return{kind:`sandwich`,open:s,close:a};u+=f.text}return{kind:`literal`,literal:s+u+a}}var p=r.e||``;return p&&p.indexOf(a)!==-1?{kind:`literal`,literal:s+p}:{kind:`literal`,literal:s+p+a}}function an(e,t,n){var r=[],i=e,a=n;if(i&&r.push(i),Array.isArray(t))for(var o=0;o<t.length;o++)r.push(t[o]);else t!=null&&r.push(t);a&&r.push(a);for(var s=[],c=0;c<r.length;c++){var l=r[c];typeof l==`string`&&s.length>0&&typeof s.at(-1)==`string`?s[s.length-1]=s.at(-1)+l:s.push(l)}return s}function on(e){return e==null||e.tagfilter!==!1}function sn(e,t,n,r){var i=t(e,n,r);return i===null?null:un(i)}function cn(e){var t=[];if(!e)return t;for(var n in e)n.charCodeAt(0)===94&&t.push({identifier:n,footnote:e[n].target});return t}function ln(e,t,n){if(t.indexOf(`.`)===-1)return e?.[t]||n;for(var r=e,i=t.split(`.`),a=0;a<i.length&&(r=r?.[i[a]],r!==void 0);)a++;return r||n}function un(e){for(var t=!1,n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<=R||r===tt||r===ke||r===Pe||r===H||r===Ee||r===je||r===Ie||r===De||r===V||r>=123){t=!0;break}}if(!t)return e;for(var i=``,n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r===ke&&n+2<e.length){var a=e.charCodeAt(n+1),o=e.charCodeAt(n+2);if((a>=W&&a<=G||a>=K&&a<=Be||a>=J&&a<=Ve)&&(o>=W&&o<=G||o>=K&&o<=Be||o>=J&&o<=Ve)){i+=e[n]+e[n+1]+e[n+2],n+=2;continue}}if(r>=55296&&r<=57343){if(r<=56319&&n+1<e.length){var s=e.charCodeAt(n+1);if(s>=56320&&s<=57343){i+=encodeURI(e[n]+e[n+1]),n++;continue}}i+=e[n];continue}i+=encodeURI(e[n])}return i}function dn(...e){return e.filter(Boolean).join(` `)}var fn=new Set([`title`,`textarea`,`style`,`xmp`,`iframe`,`noembed`,`noframes`,`script`,`plaintext`]),pn=/<(\/?)(title|textarea|style|xmp|iframe|noembed|noframes|script|plaintext)(\s|>|\/)/gi;function mn(e){return fn.has(e.toLowerCase())}function hn(e){return pn.lastIndex=0,pn.test(e)}function gn(e){return pn.lastIndex=0,e.replace(pn,(e,t,n,r)=>`&lt;${t}${n}${r}`)}function _n(e,t){var n=e||{},r=n.slugify,i;if(r){var a=r;i=e=>a(e,At)}else i=At;return{disableAutoLink:n.disableAutoLink,disableFrontmatter:n.disableFrontmatter,disableParsingRawHTML:n.disableParsingRawHTML,enforceAtxHeadings:n.enforceAtxHeadings,evalUnserializableExpressions:n.evalUnserializableExpressions,forceBlock:n.forceBlock,forceInline:t===void 0?n.forceInline:t,ignoreHTMLBlocks:n.ignoreHTMLBlocks,optimizeForStreaming:n.optimizeForStreaming,preserveFrontmatter:n.preserveFrontmatter,sanitizer:n.sanitizer||Et,slugify:i,tagfilter:on(n)}}var vn=/^<([a-zA-Z][a-zA-Z0-9-]*)\s[^>]*>/,yn=/^<[A-Z]/,bn=[`script`,`pre`,`style`,`textarea`],xn=new Set(bn),Sn=/<(?:pre|script|style|textarea)\b/i,Cn=/<(?:pre|script|style|textarea)\b/iy,wn=/^(\s{0,3}#[#\s]|\s{0,3}[-*+]\s|\s{0,3}\d+\.\s|\s{0,3}>\s|\s{0,3}```)/m,Tn=/^<([a-z][^ >/\n\r]*) ?([^>]*?)>/im,En=new Uint8Array(128);(()=>{for(var e=[V,Me,Ne,Te,Ae,Ee,Le,Pe,je,Re,B,He,Ue,Ve],t=0;t<e.length;t++)En[e[t]]=1})();var Dn=/([a-zA-Z_][a-zA-Z0-9_-]*)=(?:"([^"]*)"|'([^']*)')/g;function On(e){return xn.has(e)}function kn(e){return Sn.test(e)}function An(e,t,n){for(var r=t,i=n;r<i&&(e.charCodeAt(r)===R||e.charCodeAt(r)===z);)r++;if(r>=i)return!1;e.charCodeAt(r)===rt&&r++;for(var a=0;r<i;){for(;r<i&&(e.charCodeAt(r)===R||e.charCodeAt(r)===z);)r++;if(r>=i)break;if(e.charCodeAt(r)===rt&&a>0){for(var o=r+1;o<i&&(e.charCodeAt(o)===R||e.charCodeAt(o)===z);)o++;if(o>=i)return!0}if(e.charCodeAt(r)===ze&&r++,r>=i||e.charCodeAt(r)!==U)return!1;for(;r<i&&e.charCodeAt(r)===U;)r++;for(r<i&&e.charCodeAt(r)===ze&&r++,a++;r<i&&(e.charCodeAt(r)===R||e.charCodeAt(r)===z);)r++;if(r<i){if(e.charCodeAt(r)===rt)r++;else return!1}}return a>0}var jn=/[\u0000-\u001F\u007F]/g,Mn={action:1,background:1,cite:1,data:1,formaction:1,href:1,longdesc:1,poster:1,src:1,"xlink:href":1},Nn=/&#(x[0-9a-f]+|[0-9]+);?/gi;function Pn(e){return e.indexOf(`&#`)===-1?e:e.replace(Nn,(e,t)=>{var n=t.charCodeAt(0)===ft||t.charCodeAt(0)===pt?Number.parseInt(t.slice(1),16):Number.parseInt(t,10);return n>0&&n<=1114111?String.fromCodePoint(n):e})}function Fn(e,t,n){if(n&&t.charCodeAt(0)===it)return!1;var r=e.charCodeAt(0),i=e.charCodeAt(1);if((r===dt||r===ut)&&(i===lt||i===ct))return!(n&&t===``);var a=e.toLowerCase();if(a===`srcdoc`)return!0;if(a===`style`)return/url\s*\(\s*(javascript|vbscript|data:(?!image\/))/i.test(t);if(Mn[a]===1){var o=Pn(wt(t));if(Et(o)===null)return!0;var s=o.replace(jn,``);return s!==o&&Et(s)===null}return!1}function In(e){return`<`+(e.f?`/`:``)+e.tag+e.g+e.b+(e.n?e.r?` />`:`/>`:`>`)}function Ln(e,t,n,r){for(var i=[],a=t,o=0;o<r.length;o+=2){var s=r[o];if(s>a){var c=e.slice(a,s).trim();c&&i.push(c)}a=r[o+1]}if(a<n){var l=e.slice(a,n).trim();l&&i.push(l)}return i.join(` `)}function Rn(e,t){if(e.charCodeAt(t)!==Pe)return null;let n=t+1,r=e.length,i=!1;e.charCodeAt(n)===$e&&(n++,i=!0);let a=n,o=e.charCodeAt(n);if(!(o>=J&&o<=ht||o>=K&&o<=q))return null;for(;n<r&&(e.charCodeAt(n)>=J&&e.charCodeAt(n)<=ht||e.charCodeAt(n)>=K&&e.charCodeAt(n)<=q||e.charCodeAt(n)>=W&&e.charCodeAt(n)<=G||e.charCodeAt(n)===U);)n++;let s=e.slice(a,n);if(!s)return null;let c=s.charCodeAt(0),l=c>=K&&c<=q||s.indexOf(`-`)!==-1,u=n;for(;n<r&&(e.charCodeAt(n)===R||e.charCodeAt(n)===z||e.charCodeAt(n)===B);)n++;let d=e.slice(u,n);if(n===u&&n<r){var f=e.charCodeAt(n);if(f!==H&&f!==$e)return null}let p=n,m={},h=!1;for(var g=null;n<r;){let t=e.charCodeAt(n);if(t===H){let t=g?Ln(e,p,n,g):e.slice(p,n);return{r:h,u:l,f:i,b:t,q:g!=null,n:!1,g:d,attrs:m,end:n+1,tag:s}}if(t===R||t===z||t===B){n++;continue}if(t===$e&&n+1<r&&e.charCodeAt(n+1)===H){h=n>p&&e.charCodeAt(n-1)===R;let t=g?Ln(e,p,n,g):e.slice(p,n);return{r:h,u:l,f:i,b:t,q:g!=null,n:!0,g:d,attrs:m,end:n+2,tag:s}}var _=n,v=e.charCodeAt(n);if(!(v>=J&&v<=ht||v>=K&&v<=q||v===Ne||v===ze))return null;for(n++;n<r;){var y=e.charCodeAt(n);if(y>=J&&y<=ht||y>=K&&y<=q||y>=W&&y<=G||y===Ne||y===Qe||y===ze||y===U)n++;else break}for(var b=e.slice(_,n),x=n;n<r&&(e.charCodeAt(n)===R||e.charCodeAt(n)===z);)n++;var S,C;if(e.charCodeAt(n)===Ae){for(n++;n<r&&(e.charCodeAt(n)===R||e.charCodeAt(n)===z);)n++;var w=e.charCodeAt(n);if(w===tt||w===et){n++;for(var T=n;n<r&&e.charCodeAt(n)!==w;)n++;if(n>=r)return null;if(S=e.slice(T,n),n++,n<r){var E=e.charCodeAt(n);if(E!==R&&E!==z&&E!==B&&E!==H&&E!==$e)return null}C=n}else if(w===it){var D=1,T=n;for(n++;n<r&&D>0;){var y=e.charCodeAt(n);y===it?D++:y===at&&D--,n++}S=e.slice(T,n),C=n}else{for(var T=n;n<r;){var O=e.charCodeAt(n);if(O===R||O===z||O===H||O===B||O===tt||O===et||O===Ae||O===Pe||O===V)break;n++}if(n===T)return null;S=e.slice(T,n),C=n}}else S=``,C=x;Fn(b,S,l)?(g===null&&(g=[]),g.push(_,C)):m[b]=S}return null}function zn(e){var t=e.indexOf(`<`);if(t===-1)return e;for(var n=``,r=0,i=!1;t!==-1;){var a=Rn(e,t);a?(a.q&&(n+=e.slice(r,t)+In(a),r=a.end,i=!0),t=e.indexOf(`<`,a.end)):t=e.indexOf(`<`,t+1)}return i?n+e.slice(r):e}function Bn(e,t,n){if(!n.optimizeForStreaming&&e.indexOf(`[`)===-1)return!1;for(var r=0,i=e.length,a=!1,o=!1;r<i;){for(var s=e.indexOf(`
`,r),c=s<0?i:s,l=r,u=0;l<c&&u<4;)if(e.charCodeAt(l)===R)u++,l++;else if(e.charCodeAt(l)===z)u+=4,l++;else break;if(l>=c){a=!1,r=s<0?i:s+1;continue}if(u<4){var d=e.charCodeAt(l);if(d===V||d===Te){for(var f=d,p=0,m=l;m<c&&e.charCodeAt(m)===f;)p++,m++;if(p>=3){var h=!0;if(f===V){for(var g=m;g<c;g++)if(e.charCodeAt(g)===V){h=!1;break}}if(h){a=!1;for(var _=s<0?i:s+1;_<i;){for(var v=_,y=0;v<i&&y<4;){var b=e.charCodeAt(v);if(b===R)y++,v++;else if(b===z)y+=4,v++;else break}if(y<4&&v<i&&e.charCodeAt(v)===f){for(var x=0;v<i&&e.charCodeAt(v)===f;)x++,v++;if(x>=p){for(;v<i&&(e.charCodeAt(v)===R||e.charCodeAt(v)===z);)v++;if(v>=i||e.charCodeAt(v)===B){r=v>=i?i:v+1;break}}}for(;_<i&&e.charCodeAt(_)!==B;)_++;_<i&&_++}_>=i&&(r=i,o=!0);continue}}}}for(var S=l;S<c&&e.charCodeAt(S)===H;){S++,S<c&&e.charCodeAt(S)===R&&S++;for(var C=0;S<c&&C<4;)if(e.charCodeAt(S)===R)C++,S++;else if(e.charCodeAt(S)===z)C+=4,S++;else break;if(C>=4)break;a=!1}if(!a&&u<4&&S<c&&e.charCodeAt(S)===Ee&&!(S+1<i&&e.charCodeAt(S+1)===De)){var w=Vn(e,S,t);if(w){r=w,a=!1;continue}}var T=e.charCodeAt(l);if(T===Oe&&u<4)a=!1;else if(u<4&&(T===U||T===Me||T===Ne)){for(var E=l,D=0;E<c;){var O=e.charCodeAt(E);if(O===T)D++;else if(O!==R&&O!==z)break;E++}a=!(D>=3&&E>=c)}else a=!0;r=s<0?i:s+1}return o}function Vn(e,t,n){let r=e.length;if(e.charCodeAt(t)!==Ee)return null;let i=t+1<r&&e.charCodeAt(t+1)===De,a=t+1;for(;a<r;){var o=e.charCodeAt(a);if(o===Ie){a++;break}if(o===Ee)return null;o===je&&a+1<r&&a++,a++}if(a>r||e.charCodeAt(a-1)!==Ie)return null;let s=e.slice(t+1,a-1);if(s.length>999)return null;let c=Gn(s);if(!c||a>=r||e.charCodeAt(a)!==ze)return null;a++;let l=!1;for(;a<r;){let t=e.charCodeAt(a);if(t===R||t===z)a++;else if(t===B&&!l)l=!0,a++;else break}if(i){let t=e.indexOf(`
`,a),i=t<0?r:t;return n[c]={target:e.slice(a,i).trim(),title:void 0},t<0?r:t+1}var u;if(a<r&&e.charCodeAt(a)===Pe){a++;for(var d=a;a<r&&e.charCodeAt(a)!==H&&e.charCodeAt(a)!==B;)e.charCodeAt(a)===je&&a+1<r&&a++,a++;if(a>=r||e.charCodeAt(a)!==H)return null;u=e.slice(d,a),a++;for(var f=e.indexOf(`
`,a),p=f<0?r:f,m=a;m<p&&(e.charCodeAt(m)===R||e.charCodeAt(m)===z);)m++;if(m<p){if(m===a)return null;var h=e.charCodeAt(m);if(h!==tt&&h!==et&&h!==ot)return null}}else{for(var d=a,g=0;a<r;){var o=e.charCodeAt(a);if(o===ot)g++;else if(o===st){if(g===0)break;g--}else{if(o===R||o===z||o===B)break;o===je&&a+1<r&&a++}a++}if(u=e.slice(d,a),!u)return null}for(;a<r&&(e.charCodeAt(a)===R||e.charCodeAt(a)===z);)a++;var _=e.indexOf(`
`,a),v=_<0?r:_,y,b=!1,x=a,S=a;if(a===v&&a<r)for(S=a+1;S<r&&(e.charCodeAt(S)===R||e.charCodeAt(S)===z);)S++;if(S<r){var C=e.charCodeAt(S);if(C===tt||C===et||C===ot){for(var w=C===ot?41:C,T=S+1,E=T;T<r;){var D=e.charCodeAt(T);if(D===w){for(var O=T+1;O<r&&(e.charCodeAt(O)===R||e.charCodeAt(O)===z);)O++;(O>=r||e.charCodeAt(O)===B)&&(y=e.slice(E,T),b=!0,x=O<r?O+1:r);break}if(D===je&&T+1<r){T+=2;continue}if(D===B&&T+1<r&&e.charCodeAt(T+1)===B)break;T++}if(!b&&S===a)return null}}if(b)return n[c]||(n[c]={target:wt(qn(u)),title:y===void 0?y:wt(qn(y))}),x;for(;a<v&&(e.charCodeAt(a)===R||e.charCodeAt(a)===z);)a++;return a<v?null:(n[c]||(n[c]={target:wt(qn(u)),title:y}),_<0?r:_+1)}var Hn=new Uint8Array(Vt);for(Hn[Oe]|=zt,Hn[H]|=zt,Hn[U]|=zt|Bt,Hn[nt]|=zt,Hn[Me]|=zt|Bt,Hn[Ne]|=zt|Bt,Hn[V]|=zt|Bt,Hn[Te]|=zt|Bt,Hn[Pe]|=zt|Bt,Hn[Ee]|=Bt,Hn[Le]|=Bt,Hn[rt]|=zt,Un=W;Un<=G;Un++)Hn[Un]|=zt;var Un;function Wn(e){if(e.indexOf(`[`)<0&&e.indexOf(`]`)<0)return!1;for(var t=0;t<e.length;t++){if(e.charCodeAt(t)===je){t++;continue}if(e.charCodeAt(t)===Ee||e.charCodeAt(t)===Ie)return!0}return!1}function Gn(e){for(var t=e.length,n=!0,r=t>0,i=0;i<t;i++){var a=e.charCodeAt(i);if(a===R){if(n){r=!1;break}n=!0}else if(a<33||a>126||a>=K&&a<=q){r=!1;break}else n=!1}if(r&&!n)return e;var o=e.replace(/\s+/g,` `).trim();return o.indexOf(`ẞ`)===-1?o.toLowerCase():o.replace(/\u1E9E/g,`ss`).toLowerCase()}function Kn(e){return e<gt?Hn[e]:e===qe?Pt:0}function qn(e){return e.indexOf(`\\`)===-1?e:e.replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g,`$1`)}var Jn=null,Yn=-1,Xn=-1;function Zn(e,t){if(t>=Yn&&t<=Xn&&e===Jn)return Xn;var n=e.indexOf(`
`,t),r=n<0?e.length:n;return Jn=e,Yn=t,Xn=r,r}function X(e,t){let n=Zn(e,t);return n<e.length?n+1:n}function Qn(e,t,n){for(;t<n;){let n=e.charCodeAt(t);if(n!==R&&n!==z)break;t++}return t}function $n(e,t){let n=X(e,t);for(;n<e.length;){let t=Zn(e,n);if(rr(e,n,t))return n;n=X(e,n)}return e.length}function er(e,t,n,r){let i=0;for(;t+i<n&&e.charCodeAt(t+i)===r;)i++;return i}var tr=0,Z=0;function nr(e,t,n){for(tr=0,Z=0;t+Z<n;){let n=e.charCodeAt(t+Z);if(n===z)tr+=4-tr%4;else if(n===R)tr++;else break;Z++}}function rr(e,t,n){return Qn(e,t,n)>=n}function ir(e,t){if(!e)return e;var n=t.v||=Object.create(null),r=n[e];if(r===void 0)return n[e]=0,e;for(var i=r+1,a=`${e}-${i}`;n[a]!==void 0;)i++,a=`${e}-${i}`;return n[e]=i,n[a]=0,a}function ar(e,t,n,r){let i=Zn(e,t);if(nr(e,t,i),tr>3)return null;let a=t+Z;if(e.charCodeAt(a)!==Oe)return null;let o=er(e,a,i,35);if(o<1||o>6||(a+=o,a<i&&e.charCodeAt(a)!==R&&e.charCodeAt(a)!==z))return null;a=Qn(e,a,i);for(var s=i;s>a&&e.charCodeAt(s-1)===R;)s--;for(var c=s;s>a&&e.charCodeAt(s-1)===Oe;)s--;if(s<c){if(s===a||e.charCodeAt(s-1)===R)for(;s>a&&e.charCodeAt(s-1)===R;)s--;else s=c}let l=Nr(e.slice(a,s),!1,n,r);return{node:{type:Y.heading,level:o,children:l,id:``},end:X(e,i)}}function or(e,t,n){var r=e.charCodeAt(t);if(r!==Ae&&r!==U)return!1;for(var i=t;i<n&&e.charCodeAt(i)===r;)i++;for(;i<n&&(e.charCodeAt(i)===R||e.charCodeAt(i)===z);)i++;return i>=n}function sr(e,t){let n=Zn(e,t);if(nr(e,t,n),tr>3)return null;let r=t+Z,i=e.charCodeAt(r);if(i!==U&&i!==Me&&i!==Ne)return null;let a=0;for(;r<n;){let t=e.charCodeAt(r);if(t===i)a++;else if(t!==R&&t!==z)return null;r++}return a<3?null:{node:{type:Y.breakThematic},end:X(e,n)}}var cr=0,lr=0,ur=``;function dr(e,t,n){let r=Zn(e,t);if(nr(e,t,r),tr>3)return null;let i=tr,a=t+Z,o=e.charCodeAt(a);if(o!==V&&o!==Te)return null;let s=er(e,a,r,o);if(s<3)return null;a+=s;let c=Qn(e,a,r),l=r;if(o===V){for(let t=c;t<r;t++)if(e.charCodeAt(t)===V)return null}for(;l>c&&(e.charCodeAt(l-1)===R||e.charCodeAt(l-1)===z);)l--;let u=e.slice(c,l),d=``,f=``,p=u.indexOf(` `);p===-1?d=u:(d=u.slice(0,p),f=u.slice(p+1).trim()),d=qn(d);var m;if(f){Dn.lastIndex=0;for(var h;(h=Dn.exec(f))!=null;)m||={},m[h[1]]=h[2]===void 0?h[3]:h[2]}let g=X(e,r),_=e.length,v=e.length;var y;o===cr&&s===lr?y=ur:(y=String.fromCharCode(o).repeat(s),cr=o,lr=s,ur=y);for(var b=g;b<e.length;){var x=e.indexOf(y,b);if(x===-1)break;for(var S=x,C=0;S>0&&C<4&&e.charCodeAt(S-1)===R;)S--,C++;if(C<=3&&(S===0||e.charCodeAt(S-1)===B)){for(var w=x+s;w<e.length&&e.charCodeAt(w)===o;)w++;var T=Zn(e,w);if(rr(e,w,T)){_=S,v=X(e,T);break}}b=x+1}var E;if(i===0)E=_>g&&e.charCodeAt(_-1)===B?e.slice(g,_-1):e.slice(g,_);else{E=``;for(var D=g;D<_;){var O=Zn(e,D);nr(e,D,O);var ee=Math.min(Z,i);E+=`${e.slice(D+ee,O)}
`,D=X(e,O)}E.length>0&&E.charCodeAt(E.length-1)===B&&(E=E.slice(0,-1))}return{node:{type:Y.codeBlock,lang:d||void 0,text:E,infoString:f||void 0,attrs:m},end:v}}function fr(e,t,n){for(var r=0,i=t;i<n&&r<4;)e.charCodeAt(i)===z?r+=4-r%4:r++,i++;if(r<4)return``;for(var a=``,o=4;o<r;o++)a+=` `;return a+e.slice(i,n)}function pr(e,t){if(nr(e,t,Zn(e,t)),tr<4)return null;let n=``,r=t;for(;r<e.length;){let t=Zn(e,r);if(nr(e,r,t),rr(e,r,t)){for(var i=`${fr(e,r,t)}
`,a=X(e,t);a<e.length;){var o=Zn(e,a);if(rr(e,a,o)){i+=`${fr(e,a,o)}
`,a=X(e,o);continue}nr(e,a,o),tr>=4&&(n+=i,r=a);break}if(r!==a)break;continue}if(tr<4)break;let d=0,f=0;var s=0;for(let n=r;n<t&&f<4;n++){if(e.charCodeAt(n)===z){var c=4-f%4;f+c>4&&(s=f+c-4),f+=c}else f++;d++}var l=``;if(s>0)for(var u=0;u<s;u++)l+=` `;l+=e.slice(r+d,t),n+=`${l}
`,r=X(e,t)}for(;n.length>0&&n.charCodeAt(n.length-1)===B;)n=n.slice(0,-1);return n?{node:{type:Y.codeBlock,lang:void 0,text:n,infoString:void 0,attrs:void 0},end:r}:null}function mr(e,t,n,r){if(nr(e,t,Zn(e,t)),tr>3)return null;let i=t+Z;if(e.charCodeAt(i)!==H)return null;let a=``,o=t,s,c=!1,l=!1,u=!1;for(;o<e.length;){let t=Zn(e,o);nr(e,o,t);let n=o+Z;if(e.charCodeAt(n)===H){let r=n+1;var d=tr+1,f=!1;if(r<t){var p=e.charCodeAt(r);p===R?(r++,d++,f=!0):p===z&&(f=!0)}for(var m=``,h=!1,g=r;g<t;g++)if(e.charCodeAt(g)===z){h=!0;break}if(h){var _=d;if(f&&r<t&&e.charCodeAt(r)===z){for(var v=4-_%4,y=0;y<v-1;y++)m+=` `;_+=v,r++}for(var b=r;b<t;b++)if(e.charCodeAt(b)===z){for(var x=4-_%4,S=0;S<x;S++)m+=` `;_+=x}else m+=e[b],_++}else m=e.slice(r,t);if(!(a||s)){let n=m.match(/^\[!([A-Za-z]+)\]\s*$/);if(n){s=n[1].toUpperCase(),o=X(e,t);continue}}a+=`${m}
`;var C=m.trimStart();C.startsWith("```")||C.startsWith(`~~~`)?u=!u:(m.startsWith(`    `)||m.startsWith(`	`))&&(u=!0),l=C.length>0,o=X(e,t)}else if(a&&!rr(e,o,t)&&l){if(tr<4){var w=o+Z,T=w<t?e.charCodeAt(w):0;if(T===Oe||T===H||T===V||T===Te||T===Pe||(T===U||T===Me||T===Ne)&&sr(e,o)||(T===U||T===Me||T===nt)&&w+1<t&&(e.charCodeAt(w+1)===R||e.charCodeAt(w+1)===z))break;if(T>=W&&T<=G){for(var E=w;E<t&&e.charCodeAt(E)>=W&&e.charCodeAt(E)<=G;)E++;if(E<t&&(e.charCodeAt(E)===Qe||e.charCodeAt(E)===st))break}}if(u)break;a+=`${e.slice(o,t)}
`,c=!0,o=X(e,t)}else break}if(!(a||s))return null;var{inBlockQuote:D,l:O}=n;n.inBlockQuote=!0,c&&(n.l=!0);var ee=n.i;n.i=ee||!rr(e,o,e.length);let k=vi(a||``,n,r);return n.i=ee,n.inBlockQuote=D,n.l=O,{node:{type:Y.blockQuote,children:k,alert:s||void 0},end:o}}function hr(e,t,n){for(var r=0,i=t;i<n;i++)e.charCodeAt(i)===z?r+=4-r%4:r++;return r}function gr(e,t,n){if(nr(e,t,n),tr>3)return null;var r=t+Z;if(r>=n)return null;var i=e.charCodeAt(r),a=tr,o=r,s=r;if(i===U||i===Me||i===nt){if(o=r+1,o<n&&e.charCodeAt(o)!==R&&e.charCodeAt(o)!==z&&e.charCodeAt(o)!==B)return null}else if(i>=W&&i<=G){for(;s<n&&s-r<9;){var c=e.charCodeAt(s);if(c<W||c>G)break;s++}if(s>r&&s<n){var l=e.charCodeAt(s);if(l===Qe||l===st){if(o=s+1,o<n&&e.charCodeAt(o)!==R&&e.charCodeAt(o)!==z&&e.charCodeAt(o)!==B)return null}else return null}else return null}else return null;var u=o,d=hr(e,t,o),f=0,p=u,m=d;if(u>=n)return{ordered:i>=W&&i<=G,marker:i>=W&&i<=G?e[s]:e[r],start:i>=W&&i<=G?Number.parseInt(e.slice(r,s),10):void 0,contentStart:u,contentCol:d+1,markerCol:a,isEmpty:!0};for(;p<n&&(e.charCodeAt(p)===R||e.charCodeAt(p)===z);){if(e.charCodeAt(p)===z){var h=4-m%4;m+=h}else m++;p++,f++}var g=p>=n,_=m-d;return g||_>4?(m=d+1,p=u+1,f=1):f===0&&(m=d+1,p=u,f=1),{ordered:i>=W&&i<=G,marker:i>=W&&i<=G?e[s]:e[r],start:i>=W&&i<=G?Number.parseInt(e.slice(r,s),10):void 0,contentStart:p,contentCol:m,markerCol:a,isEmpty:g}}var _r=0;function vr(e,t,n,r){var i=0,a=t;for(_r=0;a<n&&i<r;){var o=e.charCodeAt(a);if(o===z){var s=4-i%4;if(i+s>r){_r=i+s-r,a++,i=r;break}i+=s}else if(o===R)i++;else break;a++}return a}function yr(e,t,n,r){var i=Zn(e,t),a=gr(e,t,i);if(!a)return null;var o=[],s=t,c=a.contentCol,l=``,u=a.isEmpty,d=!1,f=!1;if(!a.isEmpty){for(var p=!1,m=a.contentStart;m<i;m++)if(e.charCodeAt(m)===z){p=!0;break}if(p){var h=``,g=hr(e,t,a.contentStart),_=g-a.contentCol;if(_>0)for(var v=0;v<_;v++)h+=` `;for(var y=a.contentStart;y<i;y++)if(e.charCodeAt(y)===z){for(var b=4-g%4,x=0;x<b;x++)h+=` `;g+=b}else h+=e[y],g++;l=`${h}
`}else l=`${e.slice(a.contentStart,i)}
`}for(s=X(e,i);s<e.length;){var S=Zn(e,s);nr(e,s,S);var C=e.charCodeAt(s+Z);if(tr<c&&(C===U||C===Me||C===Ne)&&tr<=3&&sr(e,s))break;var w=gr(e,s,S);if(w&&w.ordered===a.ordered&&w.marker===a.marker&&w.markerCol<c){o.push({contentCol:c,raw:l,hasBlankAfter:d,isEmpty:u}),d&&(f=!0),c=w.contentCol,u=w.isEmpty,d=!1,l=w.isEmpty?``:`${e.slice(w.contentStart,S)}
`,s=X(e,S);continue}if(rr(e,s,S)){var T=vr(e,s,S,c);if(_r>0||T<S){for(var E=``,D=0;D<_r;D++)E+=` `;l+=`${E+e.slice(T,S)}
`}else l+=`
`;s=X(e,S);for(var O=!1,ee=0;ee<l.length;ee++){var k=l.charCodeAt(ee);if(k!==B&&k!==we&&k!==R&&k!==z){O=!0;break}}if(u&&!O){if(s<e.length){var te=Zn(e,s),ne=gr(e,s,te);if(!ne||ne.ordered!==a.ordered||ne.marker!==a.marker)break;d=!0}else break}if(s<e.length){var re=Zn(e,s);nr(e,s,re);var ie=e.charCodeAt(s+Z);if((ie===U||ie===Me||ie===Ne)&&tr<=3&&sr(e,s))break;var ae=gr(e,s,re);if(ae&&ae.ordered===a.ordered&&ae.marker===a.marker&&ae.markerCol<c){d=!0;continue}if(!rr(e,s,re)&&tr<c)break}continue}if(tr>=c){var oe=vr(e,s,S,c);if(_r>0){for(var se=``,ce=c,le=0;le<_r;le++)se+=` `,ce++;for(var A=oe;A<S;A++)if(e.charCodeAt(A)===z){for(var j=4-ce%4,M=0;M<j;M++)se+=` `;ce+=j}else se+=e[A],ce++;l+=`${se}
`}else l+=`${e.slice(oe,S)}
`;s=X(e,S);continue}for(var N=!1,ue=0;ue<l.length;ue++){var de=l.charCodeAt(ue);if(de!==B&&de!==we&&de!==R&&de!==z){N=!0;break}}if(!d&&N&&!u){var P=s+Z,F=e.charCodeAt(P);if(!(F===Oe||F===H||F===Pe||F===V||F===Te||(F===U||F===Me||F===Ne||F===nt)&&(sr(e,s)!=null||gr(e,s,S)!=null)||F>=W&&F<=G&&gr(e,s,S)!=null)){l+=`${e.slice(P,S)}
`,s=X(e,S);continue}}break}if(o.push({contentCol:c,raw:l,hasBlankAfter:d,isEmpty:u}),o.length===0)return null;var fe=f;if(!fe)for(var pe=0;pe<o.length;pe++){if(o[pe].hasBlankAfter&&pe<o.length-1){fe=!0;break}if(!o[pe].isEmpty){for(var me=o[pe].raw,he=me.length,ge=0,_e=!1,ve=!1,ye=!1,be=!1,xe=0,I=0,Se=-1;ge<he;){var L=me.indexOf(`
`,ge);if(L<0&&(L=he),be){nr(me,ge,L);for(var Ce=me.slice(ge+Z,L),De=0;De<Ce.length&&Ce.charCodeAt(De)===xe;)De++;De>=I&&Ce.slice(De).trim()===``&&(be=!1),ge=L<he?L+1:he;continue}if(rr(me,ge,L)){Se>=0?ye=!0:_e&&(ve=!0),ge=L<he?L+1:he;continue}if(nr(me,ge,L),Se>=0){if(tr>=Se){ge=L<he?L+1:he;continue}var ke=gr(me,ge,L);if(ke&&ke.markerCol<Se&&ke.contentCol<=Se){ge=L<he?L+1:he;continue}if(ke){ge=L<he?L+1:he;continue}Se=-1,ye&&=(ve=!0,!1)}var Ae=me.slice(ge+Z,L),je=Ae.charCodeAt(0);if((je===V||je===Te)&&tr<=3){for(var Fe=0;Fe<Ae.length&&Ae.charCodeAt(Fe)===je;)Fe++;if(Fe>=3){if(ve&&_e){fe=!0;break}be=!0,xe=je,I=Fe,_e=!0,ge=L<he?L+1:he;continue}}var Le=tr<=3?gr(me,ge,L):null;if(Le&&_e){if(ve){fe=!0;break}Se=Le.contentCol,ye=!1,ge=L<he?L+1:he,_e=!0;continue}if(ve){fe=!0;break}_e=!0,ge=L<he?L+1:he}if(fe)break}}for(var Re=[],ze=0;ze<o.length;ze++){for(var Be=o[ze],Ve=Be.raw,He=Ve.length;He>0&&Ve.charCodeAt(He-1)===B;)He--;var Ue=He<Ve.length?Ve.slice(0,He):Ve,We=null;if(Ue.length>=3&&Ue.charCodeAt(0)===Ee){var Ge=Ue[1];(Ge===` `||Ge===`x`||Ge===`X`)&&Ue.charCodeAt(2)===Ie&&(We={type:Y.gfmTask,completed:Ge===`x`||Ge===`X`},Ue=Ue.slice(3))}var Ke;if(Be.isEmpty&&Ue.trim()===``)Ke=[];else if(fe){var qe=n.inList;n.inList=!0;var Je=n.i;n.i=Je||ze!==o.length-1,Ke=vi(Ue,n,r),n.i=Je,n.inList=qe}else{var Ye=n.inList;n.inList=!0;var Xe=n.i;if(n.i=Xe||ze!==o.length-1,Ke=vi(Ue,n,r),n.i=Xe,n.inList=Ye,Ke.length===1&&Ke[0].type===Y.paragraph)Ke=Ke[0].children;else if(n.p){var Ze=[];n.p.push({src:Ke,dest:Ze,unwrap:!0}),Ke=Ze}else{for(var Qe=[],$e=0;$e<Ke.length;$e++)if(Ke[$e].type===Y.paragraph)for(var et=Ke[$e].children,tt=0;tt<et.length;tt++)Qe.push(et[tt]);else Qe.push(Ke[$e]);Ke=Qe}}if(We){var rt=[We,{type:Y.text,text:` `}];if(n.p)n.p.push({src:Ke,dest:rt,unwrap:!1});else for(var it=0;it<Ke.length;it++)rt.push(Ke[it]);Re.push(rt)}else Re.push(Ke)}return{node:{type:a.ordered?Y.orderedList:Y.unorderedList,start:a.ordered?a.start:void 0,items:Re},end:s}}var br=new Set(`address.article.aside.base.basefont.blockquote.body.caption.center.col.colgroup.dd.details.dialog.dir.div.dl.dt.fieldset.figcaption.figure.footer.form.frame.frameset.h1.h2.h3.h4.h5.h6.head.header.hr.html.iframe.legend.li.link.main.menu.menuitem.nav.noframes.ol.optgroup.option.p.param.search.section.summary.table.tbody.td.tfoot.th.thead.title.tr.track.ul`.split(`.`));function xr(e,t,n){let r={};for(let[o,s]of Object.entries(e)){let e=o.toLowerCase();if(e===`style`&&typeof s==`string`){let e={},t=[],n=0,i=0;for(let e=0;e<s.length;e++){let r=s.charCodeAt(e);r===ot?n++:r===st?n--:r===Xe&&n===0&&(t.push(s.slice(i,e)),i=e+1)}i<s.length&&t.push(s.slice(i));let a=!1;t.forEach(t=>{let n=t.indexOf(`:`);if(n===-1)return;let r=t.slice(0,n).trim(),i=t.slice(n+1).trim();if(r&&i){if(/url\s*\(\s*(javascript|vbscript|data:(?!image\/))/i.test(i)){a=!0;return}let t=r.indexOf(`-`)===-1?r:r.replace(/-([a-z])/g,(e,t)=>t.toUpperCase());e[t]=i}}),!a&&Object.keys(e).length>0&&(r[o]=e)}else if((e===`href`||e===`src`)&&n?.sanitizer){let i=n.sanitizer(s,t,e);i!=null&&(r[o]=i)}else if(s===``)r[o]=!0;else if(s.length>=2&&s.charCodeAt(0)===it&&s.charCodeAt(s.length-1)===at){var i=s.slice(1,-1);if(i.length>0){var a=i.charCodeAt(0);if(a===Ee||a===it)try{r[o]=JSON.parse(i);continue}catch{}}if(i===`true`){r[o]=!0;continue}if(i===`false`){r[o]=!1;continue}if(n?.evalUnserializableExpressions)try{r[o]=(0,eval)(`(${i})`);continue}catch{}r[o]=i}else r[o]=s}return r}function Sr(e,t,n){let r=t.length;if(r===0)return n;var i=t.charCodeAt(0);if(!(i>=K&&i<=q||i>=J&&i<=ht)){for(var a=String.fromCharCode(i),o=e.length-r,s=n;s<=o;){var c=e.indexOf(a,s);if(c===-1||c>o)return-1;for(var l=!0,u=1;u<r;u++){var d=e.charCodeAt(c+u),f=t.charCodeAt(u);if(d>=K&&d<=q&&(d+=_t),f>=K&&f<=q&&(f+=_t),d!==f){l=!1;break}}if(l)return c;s=c+1}return-1}i>=K&&i<=q&&(i+=_t);for(let a=n;a<=e.length-r;a++){var p=e.charCodeAt(a);if(p>=K&&p<=q&&(p+=_t),p!==i)continue;let n=!0;for(let i=1;i<r;i++){let r=e.charCodeAt(a+i),o=t.charCodeAt(i);if(r>=K&&r<=q&&(r+=_t),o>=K&&o<=q&&(o+=_t),r!==o){n=!1;break}}if(n)return a}return-1}function Cr(e,t,n){let r=t.length;var i=t.charCodeAt(0);i>=K&&i<=q&&(i+=_t);for(let o=Math.min(n,e.length-r);o>=0;o--){var a=e.charCodeAt(o);if(a>=K&&a<=q&&(a+=_t),a!==i)continue;let n=!0;for(let i=1;i<r;i++){let r=e.charCodeAt(o+i),a=t.charCodeAt(i);if(r>=K&&r<=q&&(r+=_t),a>=K&&a<=q&&(a+=_t),r!==a){n=!1;break}}if(n)return o}return-1}var wr=-1;function Tr(e,t,n){let r=n.toLowerCase(),i=`<${r}`,a=`</${r}`,o=1,s=t,c=e.length;for(wr=-1;s<c&&o>0;){let t=Sr(e,i,s),n=Sr(e,a,s);if(n===-1)return-1;if(t!==-1&&t<n){let n=Rn(e,t);n?(n.tag.toLowerCase()===r&&!n.f&&!n.n&&!Nt(n.tag)&&o++,s=n.end):s=t+1}else{var l=n+a.length,u=l<c?e.charCodeAt(l):62;if((u===H||u===R||u===z||u===B)&&(o--,o===0)){wr=n;let t=n+a.length;for(;t<c&&e.charCodeAt(t)!==H;)t++;return t+1}s=n+1}}return-1}function Er(e,t,n,r){if(r.ignoreHTMLBlocks||r.disableParsingRawHTML)return null;var i=Zn(e,t);if(nr(e,t,i),tr>3&&!n.inHTML)return null;var a=t+Z;if(e.charCodeAt(a)!==Pe)return null;var o=e.indexOf(`>`,a+1);if(o!==-1&&o<i){var s=e.slice(a+1,o);if(/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)||/^[^\s@]+@[^\s@]+$/.test(s))return null}var c=Dr(e,a);if(c>=1&&c<=5){var l=e.length;if(c===1){for(var u=e.length,d=0;d<bn.length;d++){var f=Sr(e,`</${bn[d]}>`,a);f>=0&&f<u&&(u=f)}if(u<e.length){var p=e.indexOf(`>`,u);l=p>=0?X(e,p+1):e.length}}else{var m=c===2?`-->`:c===3?`?>`:c===4?`>`:`]]>`,h=e.indexOf(m,a);h>=0&&(l=X(e,h+m.length))}var g=e.slice(a,l);if(c>=2)return{node:{type:Y.htmlComment,text:g,s:!1,raw:!0},end:l};var _=`div`,v=g.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)/);v&&(_=v[1]);var y=Rn(e,a),b={},x;y&&!y.f&&(b=xr(y.attrs,_,r),x=y.g+y.b);var S=[],C=Sr(g,`</${_.toLowerCase()}`,0),w=``,T,E,D;if(y?.f){D=g.slice(0,y.end-a);for(var O=g.slice(y.end-a);O.length>0&&O.charCodeAt(O.length-1)===B;)O=O.slice(0,-1);O&&(E=zn(O))}else if(y&&!y.f){var ee=y.end-a;if(C===-1){for(var k=g;k.length>0&&k.charCodeAt(k.length-1)===B;)k=k.slice(0,-1);T=zn(k)}else{var te=ee;g.charCodeAt(te)===B&&te++;for(var ne=C;ne>te;){var re=g.charCodeAt(ne-1);if(re!==R&&re!==z&&re!==B&&re!==we)break;ne--}var ie=g.slice(te,ne);ie&&(E=zn(ie));for(var ae=g.slice(C);ae.length>0&&ae.charCodeAt(ae.length-1)===B;)ae=ae.slice(0,-1);D=zn(ae),w=g.slice(ee,C).trim()}}var oe=y?y.f:!1;return{node:{type:Y.htmlBlock,tag:_,attrs:b,b:x,children:S,e:E,h:D,j:T,text:w,c:!0,a:oe},end:l}}if(c===6||c===7){var se=$n(e,t),ce=se<e.length?se:e.length,le=e.slice(a,ce),A=se<e.length?X(e,se):e.length,j=Rn(e,a);if(j){var M=j.tag,N=M.toLowerCase();if(j.f){var ue=e.slice(j.end,ce);return{node:{type:Y.htmlBlock,tag:M,attrs:{},children:[],h:e.slice(a,j.end),e:ue?zn(ue):void 0,text:ue,c:!0,a:!0},end:A}}if(j.n||Nt(M))return{node:{type:Y.htmlBlock,tag:M,attrs:xr(j.attrs,M,r),b:j.g+j.b,children:[],text:``,c:!1,a:!1},end:j.end<e.length&&e.charCodeAt(j.end)===B?j.end+1:j.end};var de=n.d||0,P=e.slice(a,ce),F=-1,fe=-1,pe=!1;if(de<10){for(var me=`</${N}`,he=j.end-a,ge=1,_e=he;_e<P.length&&ge>0;){var ve=Sr(P,`<${N}`,_e),ye=Sr(P,me,_e);if(ye===-1)break;if(ve!==-1&&ve<ye){var be=ve+N.length+1;if(be<P.length){var xe=P.charCodeAt(be);(xe===R||xe===z||xe===B||xe===H||xe===$e)&&ge++}_e=ve+1}else{var I=ye+me.length;if(I<P.length){var Se=P.charCodeAt(I);if((Se===H||Se===R||Se===z||Se===B)&&(ge--,ge===0)){F=ye;for(var L=I;L<P.length&&P.charCodeAt(L)!==H;)L++;fe=L+1;break}}else if(ge--,ge===0){F=ye,fe=P.length;break}_e=ye+1}}if(F===-1&&!j.f&&(c===6||j.u)){var Ce=Tr(e,j.end,N);if(Ce!==-1){for(var V=wr,Te=j.end,Ee=!1,De=!1,Oe=!1,ke=0,U=!1,Ae=!1,je=Te;je<V;){var Me=e.charCodeAt(je);if(Me===B)Ae&&(Ee=!0),U||ke++,Ae=!0,je++;else if(Me===R||Me===z)je++;else{if(!U&&(U=!0,ke>=2&&Me===Pe)){Oe=!0;break}if(Ae=!1,Me===Pe){var Ne=e.charCodeAt(je+1)|32;if((Ne===Ge||Ne===Ke||Ne===We)&&(Cn.lastIndex=je,Cn.test(e))){De=!0;break}}je++}}if(Ee&&!Oe&&!De){var Fe=Zn(e,Ce);ce=Fe,A=X(e,Fe),P=e.slice(a,ce),le=e.slice(a,ce),F=V-a,fe=Ce-a,pe=!0}}}}var Ie=j.b.indexOf(`
`)!==-1||j.g.indexOf(`
`)!==-1,Le=!1;F!==-1&&(Le=P.slice(fe).trim().length===0);var Re=!1,ze=ce,Be=A;if(F!==-1){var Ve=a+fe,He=Zn(e,Ve-1);if(Ve<He){for(var Ue=Ve;Ue<He&&(e.charCodeAt(Ue)===R||e.charCodeAt(Ue)===z);)Ue++;if(Ue<He&&e.charCodeAt(Ue)===Pe){var qe=Rn(e,Ue);qe&&!qe.f&&(Re=!0,ze=Ve,Be=Ve,Le=!0)}}if(!Re){var Je=X(e,He);if(Je<ce){for(var Ye=Je;Ye<ce&&(e.charCodeAt(Ye)===R||e.charCodeAt(Ye)===z);)Ye++;Ye<ce&&e.charCodeAt(Ye)===Pe&&Rn(e,Ye)&&(Re=!0,ze=He,Be=Je,Le=!0)}}!Re&&n.inHTML&&(Re=!0,ze=He,Be=X(e,He),Le=e.slice(Ve,He).trim().length===0)}var Xe=[],Ze=``;if(F!==-1){Ze=P.slice(j.end-a,F);var Qe=Ze.trim();if(Qe){var{inline:et,inHTML:tt,d:nt}=n;if(n.inHTML=!0,n.d=de+1,N===`p`)n.inline=!0,Xe=Nr(Qe,!1,n,r);else{var rt=Ze.indexOf(`

`)!==-1,it=wn.test(Qe),at=Tn.test(Qe),ot=rt||it||n.inHTML&&at;Ze.length>=2&&Ze.charCodeAt(0)===B&&Ze.charCodeAt(Ze.length-1)===B&&!rt&&!it&&!at?Xe=[{type:Y.text,text:Qe}]:ot||at?(n.inline=!1,Xe=vi(Ze,n,r)):(n.inline=!0,Xe=Nr(Qe,!1,n,r))}n.inline=et,n.inHTML=tt,n.d=nt}}var st=!1;if(c===6&&F!==-1&&!n.inHTML&&!Ie){var ct=/<[a-zA-Z][^>]*>/.test(Ze),lt=Ze.indexOf(`

`)!==-1||wn.test(Ze);ct&&!lt&&(st=!0)}if(!pe&&(n.inHTML||c===7||Ie||!Le||st)){var ut,dt,ft=!1;if(F!==-1&&Re){var pt=!1;if(n.inHTML&&fe<P.length){for(var mt=fe;mt<P.length&&P.charCodeAt(mt)!==B;)mt++;var W=P.slice(fe,mt).trim();pt=W.length>1&&W.charCodeAt(0)===Pe&&W.charCodeAt(1)!==$e}dt=pt?P.slice(j.end-a):Ze,ft=!0}else(c===7||n.inHTML)&&F!==-1?(dt=P.slice(j.end-a),dt.charCodeAt(0)===B&&(dt=dt.slice(1))):Re?ut=e.slice(a,ze):Ie?ut=le:(dt=P.slice(j.end-a),dt.charCodeAt(0)===B&&(dt=dt.slice(1)));var G=ut!==void 0,J=zn(ut===void 0?dt||``:ut),ht={type:Y.htmlBlock,tag:M,attrs:xr(j.attrs,M,r),b:j.g+j.b,children:Xe,e:G?void 0:J,j:G?J:void 0,text:J,c:!0,a:!1};return ft&&(ht.x=!0),{node:ht,end:Be}}var gt=zn(Ze);return{node:{type:Y.htmlBlock,tag:M,attrs:xr(j.attrs,M,r),b:j.g+j.b,children:Xe,e:pe?void 0:gt,text:gt,c:!1,a:!1},end:Be}}var _t=le.match(/^<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/),vt=_t?_t[2]:`div`,yt=_t?_t[1]===`/`:!1,bt,xt,St,Ct=``;if(yt){var wt=le.indexOf(`>`);wt===-1?bt=le:(bt=le.slice(0,wt+1),Ct=le.slice(wt+1),Ct&&(xt=zn(Ct)))}else St=zn(le);return{node:{type:Y.htmlBlock,tag:vt,attrs:{},children:[],e:xt,h:bt,j:St,text:yt?Ct:le,c:!0,a:yt},end:A}}var Tt=Rn(e,a);if(!Tt)return null;var Et=Tt.tag,Dt=Et.toLowerCase(),Ot=Et.charCodeAt(0),kt=Ot>=K&&Ot<=q;if(!(kt||br.has(Dt)||xn.has(Dt)||Dt.includes(`-`)))return null;if(Tt.f)return{node:{type:Y.htmlSelfClosing,tag:Et,attrs:{},h:e.slice(a,Tt.end),a:!0},end:Tt.end};var At=Tr(e,Tt.end,Et),jt=[];if(At!==-1){var Mt=wr,Pt=e.slice(Tt.end,Mt),Ft=Pt.trim();if(Ft){var It=Pt.indexOf(`

`)!==-1,Lt=wn.test(Ft),Rt=Tn.test(Ft),zt=n.inline,Bt=n.inHTML,Vt=n.d;n.inHTML=!0,n.d=(n.d||0)+1,It||Lt||Rt?(n.inline=!1,jt=vi(Pt,n,r)):(n.inline=!0,jt=Nr(Ft,!1,n,r)),n.inline=zt,n.inHTML=Bt,n.d=Vt}var Ht=Zn(e,At),Ut=e.slice(At,Ht).trim()?At:X(e,At),Wt=kt?e.slice(a,At):e.slice(a,Ut);return{node:{type:Y.htmlBlock,tag:Et,attrs:xr(Tt.attrs,Et,r),b:Tt.g+Tt.b,children:jt,j:zn(Wt),text:kt?Pt:Wt,c:!0,a:!1},end:Ut}}var Gt=$n(e,Tt.end),Kt=Gt<e.length?X(e,Gt):Gt,qt=e.slice(Tt.end,Gt);if(qt.trim()){var{inline:Jt,inHTML:Yt,d:Xt}=n;n.inline=!1,n.inHTML=!0,n.d=(n.d||0)+1,jt=vi(qt,n,r),n.inline=Jt,n.inHTML=Yt,n.d=Xt}var Zt=e.slice(Tt.end,Gt);return{node:{type:Y.htmlBlock,tag:Et,attrs:xr(Tt.attrs,Et,r),b:Tt.g+Tt.b,children:jt,e:zn(Zt),text:qt,c:!0,a:!1},end:Kt}}function Dr(e,t){if(e.charCodeAt(t)!==Pe)return 0;var n=t+1,r=e.length;if(e.charCodeAt(n)===Le&&e.charCodeAt(n+1)===U&&e.charCodeAt(n+2)===U)return 2;if(e.charCodeAt(n)===Ze)return 3;if(e.charCodeAt(n)===Le){var i=e.charCodeAt(n+1);if(i>=K&&i<=q)return 4;if(e.slice(n+1,n+8)===`[CDATA[`)return 5}for(var a=e.charCodeAt(n)===$e,o=a?n+1:n,s=o;s<r;){var c=e.charCodeAt(s);if(c>=K&&c<=q||c>=J&&c<=ht||c>=W&&c<=G||c===U)s++;else break}if(s===o)return 0;var l=e.slice(o,s);if(xn.has(l.toLowerCase())){if(a)return 0;var u=e.charCodeAt(s);return+(u===R||u===z||u===H||u===B||s>=r)}if(br.has(l.toLowerCase())){if(a){for(var d=s;d<r&&(e.charCodeAt(d)===R||e.charCodeAt(d)===z);)d++;return d<r&&e.charCodeAt(d)===H?6:0}var f=s<r?e.charCodeAt(s):-1;return f===R||f===z||f===H||f===B||f===$e||f===-1?6:0}if(a){for(var p=s;p<r&&(e.charCodeAt(p)===R||e.charCodeAt(p)===z);)p++;if(p<r&&e.charCodeAt(p)===H){var m=Zn(e,t);if(e.slice(p+1,m).trim()===``)return 7}}else{var h=Zn(e,t),g=Rn(e,t);if(g&&g.end<=h&&e.slice(g.end,h).trim()===``)return 7}return 0}function Or(e,t,n){for(var r=0,i=e.length;r<i&&(e.charCodeAt(r)===R||e.charCodeAt(r)===z);)r++;for(;i>r&&(e.charCodeAt(i-1)===R||e.charCodeAt(i-1)===z);)i--;r<i&&e.charCodeAt(r)===rt&&r++,i>r&&e.charCodeAt(i-1)===rt&&(i-2<r||e.charCodeAt(i-2)!==je)&&i--;for(var a=[],o=r,s=!1,c=[],l=r;l<i;){var u=e.charCodeAt(l);if(u===je&&l+1<i){e.charCodeAt(l+1)===rt?(s||(s=!0,c=[]),c.push(e.slice(o,l)),c.push(`|`),l+=2,o=l):l+=2;continue}if(u===V){for(var d=0;l<i&&e.charCodeAt(l)===V;)d++,l++;for(var f=!1;l<i&&!f;){for(var p=0;l<i&&e.charCodeAt(l)===V;)p++,l++;p===d?f=!0:p===0&&l++}continue}if(u===rt){var m=s?(c.push(e.slice(o,l)),c.join(``)):e.slice(o,l);a.push(m.trim()),l++,o=l,s=!1,c=[];continue}l++}var h=s?(c.push(e.slice(o,i)),c.join(``)):e.slice(o,i);return a.push(h.trim()),a.map(e=>{var r=e.indexOf(`\\|`)===-1?e:e.replace(/\\\|/g,`|`);return r?Nr(r,!1,t,n):[]})}function kr(e,t,n,r){let i=Zn(e,t);var a=e.indexOf(`|`,t);if(a<0||a>=i)return null;let o=X(e,i);if(o>=e.length)return null;let s=Zn(e,o);if(!An(e,o,s))return null;let c=e.slice(t,i),l=e.slice(o,s);for(var u=[],d=0,f=l.length;d<f&&(l.charCodeAt(d)===R||l.charCodeAt(d)===z);)d++;for(d<f&&l.charCodeAt(d)===rt&&d++;d<f;){for(;d<f&&(l.charCodeAt(d)===R||l.charCodeAt(d)===z);)d++;if(d>=f||l.charCodeAt(d)===rt)break;var p=l.charCodeAt(d)===ze;for(p&&d++;d<f&&l.charCodeAt(d)===U;)d++;var m=d<f&&l.charCodeAt(d)===ze;for(m&&d++,u.push(p&&m?`center`:m?`right`:p?`left`:null);d<f&&(l.charCodeAt(d)===R||l.charCodeAt(d)===z);)d++;d<f&&l.charCodeAt(d)===rt&&d++}let h=Or(c,n,r);if(u.length!==h.length)return null;let g=[],_=X(e,s);for(;_<e.length;){let t=Zn(e,_),i=e.slice(_,t);if(rr(e,_,t))break;if(nr(e,_,t),tr<4){var v=e.charCodeAt(_+Z);if(v===H||v===Oe||(v===U||v===Me||v===Ne)&&sr(e,_))break;if(v===V||v===Te){for(var y=_+Z,b=0;y<t&&e.charCodeAt(y)===v;)b++,y++;if(b>=3)break}}g.push(Or(i,n,r)),_=X(e,t)}if(r.optimizeForStreaming&&g.length===0)return null;for(var x=h.length,S=0;S<g.length;S++)if(g[S].length<x)for(;g[S].length<x;)g[S].push([]);else g[S].length>x&&(g[S].length=x);return{node:{type:Y.table,header:h,cells:g,align:u},end:_}}function Ar(e,t,n){if(nr(e,t,Zn(e,t)),tr>3)return null;var r=t+Z;if(e.charCodeAt(r)!==Ee)return null;if(r+1<e.length&&e.charCodeAt(r+1)===De)return jr(e,r,n)||null;n.refs||={};var i=Vn(e,r,n.refs);return i===null?null:{node:{type:Y.refCollection},end:i}}function jr(e,t,n){var r=e.length;if(e.charCodeAt(t)!==Ee||t+1>=r||e.charCodeAt(t+1)!==De)return null;for(var i=t+2,a=i;i<r&&e.charCodeAt(i)!==Ie;){if(e.charCodeAt(i)===B)return null;i++}if(i>=r)return null;var o=`^${e.slice(a,i)}`.toLowerCase();if(i++,i>=r||e.charCodeAt(i)!==ze)return null;for(i++;i<r&&(e.charCodeAt(i)===R||e.charCodeAt(i)===z);)i++;if(i<r&&e.charCodeAt(i)===B)for(i++;i<r&&(e.charCodeAt(i)===R||e.charCodeAt(i)===z);)i++;var s=e.indexOf(`
`,i);s<0&&(s=r);for(var c=e.slice(i,s).trim(),l=s<r?s+1:r;l<r;){var u=Zn(e,l);if(nr(e,l,u),tr>=2&&!rr(e,l,u))c+=`
${e.slice(l,u)}`,l=X(e,u);else if(rr(e,l,u)){var d=X(e,u);if(d<r&&(nr(e,d,Zn(e,d)),tr>=2)){c+=`
`,l=X(e,u);continue}break}else break}var f=n.refs;return f&&!f[o]&&(f[o]={target:c,title:void 0}),{node:{type:Y.footnote},end:l}}function Mr(e,t,n,r){let i=t,a=0,o=0,s=-1;for(;i<e.length;){let t=s>=0?s:Zn(e,i);if(s=-1,rr(e,i,t))break;if(nr(e,i,t),tr<4&&o>0&&!n.l){let n=e.charCodeAt(i+Z);if(n===Ae||n===U){let r=i+Z;for(;r<t&&e.charCodeAt(r)===n;)r++;for(;r<t&&(e.charCodeAt(r)===R||e.charCodeAt(r)===z);)r++;if(r>=t){a=n===Ae?1:2,i=X(e,t);break}}}o=t;let x=X(e,t);if(x<e.length){if(e.charCodeAt(x)===mt){var c=Zn(e,x);i=X(e,c),o=c;continue}let t=Zn(e,x);if(s=t,nr(e,x,t),tr<4){let a=e.charCodeAt(x+Z);if(a===H){i=x;break}if(a===Oe){for(var l=x+Z,u=0;l<t&&e.charCodeAt(l)===Oe&&u<=6;)u++,l++;if(u>=1&&u<=6&&(l>=t||e.charCodeAt(l)===R||e.charCodeAt(l)===z)){i=x;break}}if(a===V||a===Te){for(var d=x+Z,f=0;d<t&&e.charCodeAt(d)===a;)f++,d++;if(f>=3){i=x;break}}if(a===Pe){var p=x+Z+1,m=p<t?e.charCodeAt(p):0,h=m===Le||m===Ze;if(!h&&m===$e){for(var g=p+1,_=g;_<t&&(e.charCodeAt(_)>=K&&e.charCodeAt(_)<=q||e.charCodeAt(_)>=J&&e.charCodeAt(_)<=ht||e.charCodeAt(_)>=W&&e.charCodeAt(_)<=G||e.charCodeAt(_)===U);)_++;_>g&&(h=br.has(e.slice(g,_).toLowerCase()))}else if(!h){for(var v=p;v<t&&(e.charCodeAt(v)>=K&&e.charCodeAt(v)<=q||e.charCodeAt(v)>=J&&e.charCodeAt(v)<=ht||e.charCodeAt(v)>=W&&e.charCodeAt(v)<=G||e.charCodeAt(v)===U);)v++;if(v>p){var y=e.slice(p,v).toLowerCase();h=br.has(y)||xn.has(y)}}if(h&&Er(e,x,n,r)){i=x;break}}if(a===U||a===Me||a===nt){let n=x+Z+1;if(n<t&&(e.charCodeAt(n)===R||e.charCodeAt(n)===z)&&Qn(e,n,t)<t&&!sr(e,x)){i=x;break}}if(a>=W&&a<=G){let n=x+Z;for(;n<t&&e.charCodeAt(n)>=W&&e.charCodeAt(n)<=G;)n++;if(n<t&&(e.charCodeAt(n)===Qe||e.charCodeAt(n)===st)&&n-(x+Z)===1&&e.charCodeAt(x+Z)===49){var b=n+1;if(b<t&&(e.charCodeAt(b)===R||e.charCodeAt(b)===z)&&Qn(e,b,t)<t){i=x;break}}}if(a===rt){let n=X(e,t);if(n<e.length&&An(e,n,Zn(e,n))){i=x;break}}if((a===U||a===Me||a===Ne)&&sr(e,x)){if(a!==U){i=x;break}let n=0,r=x+Z;for(;r<t&&e.charCodeAt(r)===U;)n++,r++;for(;r<t&&(e.charCodeAt(r)===R||e.charCodeAt(r)===z);)r++;if(r<t){i=x;break}}}}i=X(e,t)}for(var x=a?o:i;x>t&&(e.charCodeAt(x-1)===B||e.charCodeAt(x-1)===we||e.charCodeAt(x-1)===R||e.charCodeAt(x-1)===z);)x--;for(var S=t;S<x&&(e.charCodeAt(S)===R||e.charCodeAt(S)===z);)S++;if(S>=x)return null;for(var C=!1,w=S;w<x;w++)if(e.charCodeAt(w)===mt){C=!0;break}var T=C?e.slice(S,x).replace(/\u001E/g,``):e.slice(S,x);if(!T)return null;let E=Nr(T,!0,n,r);return a?{node:{type:Y.heading,level:a,children:E,id:``},end:i}:{node:{type:Y.paragraph,children:E},end:i}}function Nr(e,t,n,r){var i=n.t;if(!i){var a=n.k;n.k=t;var o=gi(e,0,e.length,n,r);return n.k=a,o}var s=[];return i.push({dest:s,text:e,breaks:t,inline:n.inline,inAnchor:n.inAnchor,inHTML:n.inHTML,htmlDepth:n.d,inList:n.inList,inBlockQuote:n.inBlockQuote,noSetext:n.l,depth:n.o}),s}function Pr(e,t,n){if(e.charCodeAt(t)!==V)return null;let r=er(e,t,n,96),i=t+r;for(;i<n;){let a=e.indexOf("`",i);if(a<0||a>=n)return null;let o=er(e,a,n,96);if(o===r){let n=e.slice(t+r,a);return n.indexOf(`
`)!==-1&&(n=n.replace(/\n/g,` `)),n.length>0&&n[0]===` `&&n.at(-1)===` `&&n.trim().length>0&&(n=n.slice(1,-1)),{node:{type:Y.codeInline,text:n},end:a+o}}i=a+o}return null}function Fr(e,t,n){if(e.charCodeAt(t)!==V)return t;let r=er(e,t,n,96),i=t+r;for(;i<n;){let a=e.indexOf("`",i);if(a<0||a>=n)return t;let o=er(e,a,n,96);if(o===r)return a+o;i=a+o}return t}function Ir(e,t,n){if(e.charCodeAt(t)!==Pe)return t;if(t+1<n&&e.charCodeAt(t+1)===$e){let r=t+2;for(;r<n&&e.charCodeAt(r)!==H;)r++;return r<n?r+1:t}if(t+3<n&&e.charCodeAt(t+1)===Le&&e.charCodeAt(t+2)===U&&e.charCodeAt(t+3)===U){let n=e.indexOf(`-->`,t+4);return n>=0?n+3:t}let r=t+1,i=r;for(;r<n;){let t=e.charCodeAt(r);if(t>=K&&t<=q||t>=J&&t<=ht||t>=W&&t<=G||t===U)r++;else break}if(r===i)return t;let a=e.slice(i,r).toLowerCase(),o=!1;for(;r<n;){let i=e.charCodeAt(r);if(i===H){r++;break}if(i===$e&&r+1<n&&e.charCodeAt(r+1)===H){r+=2,o=!0;break}if(i===tt||i===et){var s=i;for(r++;r<n&&e.charCodeAt(r)!==s;)r++;r<n&&r++;continue}if(i===B)return t;r++}if(o||Nt(a))return r;let c=1;for(;r<n&&c>0;)if(e.charCodeAt(r)===Pe){if(r+1<n&&e.charCodeAt(r+1)===$e){let t=r+2,i=t;for(;i<n&&(e.charCodeAt(i)>=K&&e.charCodeAt(i)<=q||e.charCodeAt(i)>=J&&e.charCodeAt(i)<=ht);)i++;if(e.slice(t,i).toLowerCase()===a){for(;i<n&&e.charCodeAt(i)!==H;)i++;if(i<n&&i++,c--,c===0)return i}r=i}else{let t=r+1,i=t;for(;i<n&&(e.charCodeAt(i)>=K&&e.charCodeAt(i)<=q||e.charCodeAt(i)>=J&&e.charCodeAt(i)<=ht);)i++;e.slice(t,i).toLowerCase()===a&&c++,r++}}else r++;return r}function Lr(e,t,n,r,i){if(e.charCodeAt(t)!==Te||t+1>=n||e.charCodeAt(t+1)!==Te)return null;let a=t+2;for(;a+1<n;){let o=e.charCodeAt(a);if(o===V){let t=Fr(e,a,n);if(t>a){a=t;continue}}if(o===Te&&e.charCodeAt(a+1)===Te){let n=e.slice(t+2,a),o=gi(n,0,n.length,r,i);return{node:{type:Y.textFormatted,tag:`del`,children:o},end:a+2}}o===je&&a+1<n&&a++,a++}return null}function Rr(e,t,n,r,i){if(e.charCodeAt(t)!==Ae||t+1>=n||e.charCodeAt(t+1)!==Ae)return null;let a=t+2;for(;a+1<n;){let o=e.charCodeAt(a);if(o===V){let t=Fr(e,a,n);if(t>a){a=t;continue}}if(o===Ae&&e.charCodeAt(a+1)===Ae&&a>t+2){let n=e.slice(t+2,a),o=gi(n,0,n.length,r,i);return{node:{type:Y.textFormatted,tag:`mark`,children:o},end:a+2}}o===je&&a+1<n&&a++,a++}return null}function zr(e,t,n){return e<gt?!!(Kn(e)&It):Ht.test(t[n])}function Br(e,t,n){return e<gt?!!(Kn(e)&Pt):Ut.test(t[n])}function Vr(e,t,n){var r=e.charCodeAt(t);if(r!==Me&&r!==Ne)return null;var i=er(e,t,n,r);if(i===0)return null;var a=t>0?e.charCodeAt(t-1):32,o=t+i<n?e.charCodeAt(t+i):32,s=Br(a,e,t-1),c=Br(o,e,t+i),l=t>0&&zr(a,e,t-1),u=t+i<n&&zr(o,e,t+i),d=!c&&(!u||s||l),f=!s&&(!l||c||u),p,m;return r===Me?(p=d,m=f):(p=d&&(!f||l),m=f&&(!d||u)),{len:i,canOpen:p,canClose:m}}function Hr(e,t,n,r){if(t.length!==0){for(var i=e.length,a=Array(i),o=null,s=null,c=0;c<i;c++){var l={node:e[c],prev:s,next:null};s?s.next=l:o=l,a[c]=l,s=l}for(var u=Array(t.length),d=0;d<t.length;d++)u[d]=a[t[d].idx];for(var f=[],p=0;p<12;p++)f[p]=-1;for(var m=0;m<t.length;){var h=t[m];if(!(h.active&&h.canClose)){m++;continue}for(var g=(h.ch===Me?0:1)*6+h.len%3*2+ +!!h.canOpen,_=f[g]===void 0?-1:f[g],v=-1,y=m-1;y>_;y--){var b=t[y];if(!(!b.active||b.ch!==h.ch||!b.canOpen)&&!((h.canOpen||b.canClose)&&(b.len+h.len)%3==0&&b.len%3!=0)){v=y;break}}if(v<0){f[g]=m-1,!h.canOpen&&(h.active=!1),m++;continue}var x=t[v],S=x.len>=2&&h.len>=2,C=S?2:1;x.len-=C,h.len-=C;var w=u[v],T=u[m],E=w.node,D=T.node;E.text=E.text.slice(0,E.text.length-C),D.text=D.text.slice(C);for(var O=[],ee=w.next;ee&&ee!==T;)O.push(ee.node),ee=ee.next;var k={node:{type:Y.textFormatted,tag:S?`strong`:`em`,children:O},prev:w,next:T};w.next=k,T.prev=k;for(var te=v+1;te<m;te++)t[te].active=!1;if(x.len===0&&(x.active=!1,E.text===``)){var ne=w.prev;k.prev=ne,ne?ne.next=k:o=k}if(h.len===0){if(h.active=!1,D.text===``){var re=T.next;k.next=re,re&&(re.prev=k)}}else continue;m++}for(var ie=0,ae=o;ae;){var oe=ae.node;if(oe.type===Y.text){var se=oe;if(se.text===``){ae=ae.next;continue}if(ie>0&&e[ie-1].type===Y.text){e[ie-1].text+=se.text,ae=ae.next;continue}}e[ie++]=oe,ae=ae.next}e.length=ie}}function Ur(e,t,n,r){return t(e,n,r)===null?null:e}var Wr=0,Gr=0,Kr=0,qr=0,Jr=0,Yr=0,Xr=0,Zr=0;function Qr(){return Xr===2147483647&&(Gr=0,qr=0,Yr=0,ei=0,Xr=0),++Xr}var $r=null,ei=0,ti=[],ni=256;function ri(e,t,n,r,i){let a=e.charCodeAt(t)===Le,o=a?t+1:t;if(e.charCodeAt(o)!==Ee||qr===Zr&&o>=Kr)return null;var s=ei===Zr?$r:null,c=s===null?0:s[o];if(c<0)return null;var l=c;if(c===0){var u=e.indexOf(`]`,o+1);if(u<0||u>=n)return Kr=o,qr=Zr,null;l=o+1;var d=0;ti[d++]=o;for(var f=n-o>=ni;l<n&&d>0;){var p=e.charCodeAt(l);if(p===je&&l+1<n){l+=2;continue}if(p===V){var m=Fr(e,l,n);if(m>l){l=m;continue}}if(p===Pe){var h=ii(e,l,n);if(h){l=h.end;continue}var g=Ir(e,l,n);if(g>l){l=g;continue}}if(p===Ee)ti[d++]=l;else if(p===Ie){var _=ti[--d];s===null&&f&&l-o>=ni&&(s=$r=new Int32Array(n),ei=Zr),s!==null&&(s[_]=l+1)}l++}if(d>0){if(s===null&&f&&l-o>=ni&&(s=$r=new Int32Array(n),ei=Zr),s!==null)for(;d>0;)s[ti[--d]]=-1;return null}}var v=l-1,y=e.slice(o+1,v),b=l<n?e.charCodeAt(l):0,x=!1;if(b===ot){var S=!0;for(l++;l<n&&(e.charCodeAt(l)===R||e.charCodeAt(l)===B);)l++;var C=``,w=l;if(l<n&&e.charCodeAt(l)===Pe){for(l++,w=l;w<n&&e.charCodeAt(w)!==H;){if(e.charCodeAt(w)===je&&w+1<n){w+=2;continue}if(e.charCodeAt(w)===B){S=!1;break}w++}S&&(w>=n||e.charCodeAt(w)!==H)&&(S=!1),S&&(C=e.slice(l,w),w++)}else if(S){var T=Gr===Zr?Wr:-1;if(T>=0&&l>=T)S=!1;else{for(var E=0,D=!1;w<n;){var O=e.charCodeAt(w);if(O===je&&w+1<n){w+=2;continue}if(O===ot)E++;else if(O===st){if(D=!0,E===0)break;E--}else if(O===R||O===B)break;w++}w>=n&&!D&&(T<0||l<T)&&(Wr=l,Gr=Zr),C=e.slice(l,w)}}if(S){for(l=w;l<n&&(e.charCodeAt(l)===R||e.charCodeAt(l)===B);)l++;var ee;if(l<n){var k=e.charCodeAt(l);if(k===tt||k===et||k===ot){var te=k===ot?41:k;l++;for(var ne=l;l<n&&e.charCodeAt(l)!==te;)e.charCodeAt(l)===je&&l+1<n&&l++,l++;l>=n?S=!1:(ee=e.slice(ne,l),l++)}}if(S){for(;l<n&&(e.charCodeAt(l)===R||e.charCodeAt(l)===B);)l++;(l>=n||e.charCodeAt(l)!==st)&&(S=!1)}}if(S){if(l++,C=wt(qn(C)),ee!==void 0&&(ee=wt(qn(ee))),a){var re=li(gi(y,0,y.length,r,i));return{node:{type:Y.image,target:Ur(C,i?.sanitizer||Et,`img`,`src`),alt:re,title:ee},end:l}}var ie=r.inAnchor;r.inAnchor=!0;var ae=ie?[{type:Y.text,text:y}]:gi(y,0,y.length,r,i);return r.inAnchor=ie,!r.inAnchor&&ci(ae)?null:{node:{type:Y.link,target:Ur(C,i?.sanitizer||Et,`a`,`href`),title:ee,children:ae},end:l}}l=v+1,x=!0}var oe=``,se=l;if(!x&&b===Ee){var ce=l+1;se=ce;for(var le=!1;se<n&&e.charCodeAt(se)!==Ie;){if(e.charCodeAt(se)===je&&se+1<n){se+=2;continue}if(e.charCodeAt(se)===Ee){le=!0;break}se++}if(le||se>=n)return null;var A=e.slice(ce,se);if(A.trim())oe=Gn(A);else{if(Wn(y))return null;oe=Gn(y)}se+=1}else{if(Wn(y))return null;oe=Gn(y)}var j=r.refs?.[oe];if(!j)return null;if(a)return{node:{type:Y.image,target:Ur(j.target,i?.sanitizer||Et,`img`,`src`),alt:li(gi(y,0,y.length,r,i)),title:j.title},end:se};var M=r.inAnchor;r.inAnchor=!0;var ae=M?[{type:Y.text,text:y}]:gi(y,0,y.length,r,i);return r.inAnchor=M,!r.inAnchor&&ci(ae)?null:{node:{type:Y.link,target:Ur(j.target,i?.sanitizer||Et,`a`,`href`),title:j.title,children:ae},end:se}}function ii(e,t,n){if(e.charCodeAt(t)!==Pe)return null;for(var r=t+1;r<n;){var i=e.charCodeAt(r);if(i===H)break;if(i===R||i===B||i===we||i===Pe)return null;r++}if(r>=n||e.charCodeAt(r)!==H)return null;var a=e.slice(t+1,r);return a.match(/^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^\x00-\x20]*)$/)?{node:{type:Y.link,target:a,title:void 0,children:[{type:Y.text,text:a}]},end:r+1}:a.indexOf(`@`)!==-1&&/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(a)?{node:{type:Y.link,target:`mailto:${a}`,title:void 0,children:[{type:Y.text,text:a}]},end:r+1}:null}function ai(e,t,n,r){if(e.charCodeAt(t)!==Ee||t+1>=n||e.charCodeAt(t+1)!==De||Yr===Zr&&t>=Jr)return null;let i=t+2;for(;i<n&&e.charCodeAt(i)!==Ie&&e.charCodeAt(i)!==B;)i++;if(i>=n)return Jr=t,Yr=Zr,null;if(e.charCodeAt(i)!==Ie)return null;let a=e.slice(t+2,i);return a?{node:{type:Y.footnoteReference,target:`#${At(a)}`,text:a},end:i+1}:null}function oi(e,t,n,r){if(r.disableBareUrls)return null;var i=``,a=!1,o=e.charCodeAt(t);if(o===He||o===72?t+8<=n&&e.charCodeAt(t+1)===We&&e.charCodeAt(t+2)===We&&e.charCodeAt(t+3)===Ge&&(e.charCodeAt(t+4)===Ke&&e.charCodeAt(t+5)===ze&&e.charCodeAt(t+6)===$e&&e.charCodeAt(t+7)===$e?i=`https://`:e.charCodeAt(t+4)===ze&&e.charCodeAt(t+5)===$e&&e.charCodeAt(t+6)===$e&&(i=`http://`)):o===Ve||o===70?t+6<=n&&e.charCodeAt(t+1)===We&&e.charCodeAt(t+2)===Ge&&e.charCodeAt(t+3)===ze&&e.charCodeAt(t+4)===$e&&e.charCodeAt(t+5)===$e&&(i=`ftp://`):(o===Ue||o===87)&&t+4<=n&&e.charCodeAt(t+1)===Ue&&e.charCodeAt(t+2)===Ue&&e.charCodeAt(t+3)===Qe&&(i=`www.`,a=!0),!i)return null;let s=t+i.length;for(;s<n;){let t=e.charCodeAt(s);if(t===R||t===B||t===z||t===we||t===Pe||t===H)break;s++}for(var c=0,l=0,u=t;u<s;u++){var d=e.charCodeAt(u);d===ot?c++:d===st&&l++}let f=s;for(;f>t+i.length;){let n=e.charCodeAt(f-1);if(n===Qe||n===Ye||n===ze||n===Le||n===Ze||n===st||n===Me||n===Ne||n===Te){if(n===st){if(c>=l)break;l--}f--}else if(n===Xe){for(var p=f-2;p>t&&(e.charCodeAt(p)>=K&&e.charCodeAt(p)<=q||e.charCodeAt(p)>=J&&e.charCodeAt(p)<=ht||e.charCodeAt(p)>=W&&e.charCodeAt(p)<=G);)p--;p>=t&&e.charCodeAt(p)===Re?f=p:f--}else break}if(f<=t+i.length)return null;var m=t+(a?4:i.length),h=e.indexOf(`/`,m);if((h<0||h>f)&&(h=f),a&&e.indexOf(`.`,m)===-1)return null;for(var g=-1,_=-1,v=h-1;v>=m;v--)if(e.charCodeAt(v)===Qe){if(g<0)g=v;else{_=v;break}}for(var v=_>=0?_+1:m;v<h;v++)if(e.charCodeAt(v)===Ne)return null;var y=e.slice(t,f),b=a?`http://${y}`:y;return{node:{type:Y.link,target:b,title:void 0,children:[{type:Y.text,text:y}]},end:f}}function si(e,t,n,r){if(r.disableBareUrls)return null;for(var i=t,a=i;i<n;){var o=e.charCodeAt(i);if(o>=K&&o<=q||o>=J&&o<=ht||o>=W&&o<=G||o===Qe||o===Le||o===Oe||o===36||o===ke||o===Re||o===et||o===Me||o===nt||o===$e||o===Ae||o===Ze||o===De||o===Ne||o===V||o===it||o===rt||o===at||o===Te||o===U)i++;else break}if(i===a||i>=n||e.charCodeAt(i)!==Fe)return null;i++;for(var s=i,c=-1,l=i;i<n;){var o=e.charCodeAt(i);if(o>=K&&o<=q||o>=J&&o<=ht||o>=W&&o<=G)i++;else if((o===U||o===Ne)&&i>s)i++;else if(o===Qe){if(i===s)break;var u=e.charCodeAt(i-1);if(u===U||u===Ne||i-l>63)break;if(i+1<n){var d=e.charCodeAt(i+1);if(d>=K&&d<=q||d>=J&&d<=ht||d>=W&&d<=G)c=i,l=i+1,i++;else break}else break}else break}if(i-l>63||c<0)return null;var f=e.charCodeAt(i-1);if(!(f>=K&&f<=q||f>=J&&f<=ht||f>=W&&f<=G)||i<=c+1)return null;for(var p=-1,m=c-1;m>=s;m--)if(e.charCodeAt(m)===Qe){p=m;break}for(var m=p>=0?p+1:s;m<i;m++)if(e.charCodeAt(m)===Ne)return null;var h=e.slice(t,i);return{node:{type:Y.link,target:`mailto:${h}`,title:void 0,children:[{type:Y.text,text:h}]},end:i}}function ci(e){for(var t=0;t<e.length;t++)if(e[t].type===Y.link||`children`in e[t]&&Array.isArray(e[t].children)&&ci(e[t].children))return!0;return!1}function li(e,t){for(var n=``,r=0;r<e.length;r++){var i=e[r];i.type===Y.text?n+=i.text:i.type===Y.breakLine?n+=` `:i.type===Y.codeInline||i.type===Y.footnoteReference?n+=i.text:`children`in i&&Array.isArray(i.children)?n+=li(i.children,t):!t&&i.type===Y.image&&(n+=i.alt||``)}return n}function ui(e,t,n){for(var r=0;r<e.length;r++){var i=e[r];if(i.type===Y.heading){var a=i;a.id=ir(n(li(a.children,!0)),t)}if(`children`in i){var o=i.children;Array.isArray(o)&&ui(o,t,n)}if((i.type===Y.orderedList||i.type===Y.unorderedList)&&Array.isArray(i.items))for(var s=i.items,c=0;c<s.length;c++)ui(s[c],t,n)}}function di(e){return{type:Y.text,text:e}}function fi(e,t,n){var r=t+1;if(r>=n)return-1;if(e.charCodeAt(r)===Oe){r++;var i=r<n&&(e.charCodeAt(r)===ft||e.charCodeAt(r)===pt);i&&r++;for(var a=r,o=i?6:7;r<n&&r-a<=o;){var s=e.charCodeAt(r);if(!(s>=W&&s<=G||i&&(s>=K&&s<=Be||s>=J&&s<=Ve)))break;r++}return r===a||r-a>o?-1:r<n&&e.charCodeAt(r)===Xe?r+1:-1}for(var c=r;r<n&&r-c<48;){var l=e.charCodeAt(r);if(l>=K&&l<=q||l>=J&&l<=ht||l>=W&&l<=G){r++;continue}break}return r===c?-1:r<n&&e.charCodeAt(r)===Xe?r+1:-1}function pi(e,t,n,r,i){if(e.charCodeAt(t)!==Pe)return null;var a=t+1;if(a>=n)return null;var o=e.charCodeAt(a);if(o===Le&&a+1<n&&e.charCodeAt(a+1)===U&&a+2<n&&e.charCodeAt(a+2)===U){var s=a+3;if(s<n&&e.charCodeAt(s)===H)return{node:{type:Y.htmlComment,text:``,s:!0},end:s+1};if(s+1<n&&e.charCodeAt(s)===U&&e.charCodeAt(s+1)===H)return{node:{type:Y.htmlComment,text:`-`,s:!0},end:s+2};var c=e.indexOf(`-->`,s);return c!==-1&&c<=n-3?{node:{type:Y.htmlComment,text:e.slice(t+4,c),s:!1},end:c+3}:null}if(o===Ze){var l=e.indexOf(`?>`,a+1);return l!==-1&&l<n?{node:{type:Y.htmlSelfClosing,tag:`?`,attrs:{},m:e.slice(t,l+2),a:!1},end:l+2}:null}if(o===Le&&a+1<n){var u=e.charCodeAt(a+1);if(u===Ee&&e.slice(a+1,a+8)===`[CDATA[`){var d=e.indexOf(`]]>`,a+8);return d!==-1&&d<n?{node:{type:Y.htmlSelfClosing,tag:`![CDATA[`,attrs:{},m:e.slice(t,d+3),a:!1},end:d+3}:null}if(u>=K&&u<=q){var f=e.indexOf(`>`,a+2);return f!==-1&&f<n?{node:{type:Y.htmlSelfClosing,tag:`!${e.slice(a+1,f)}`,attrs:{},m:e.slice(t,f+1),a:!1},end:f+1}:null}}if(o===$e){var p=a+1;if(p>=n)return null;var m=e.charCodeAt(p);if(!(m>=K&&m<=q||m>=J&&m<=ht))return null;for(p++;p<n;){var h=e.charCodeAt(p);if(h>=K&&h<=q||h>=J&&h<=ht||h>=W&&h<=G||h===U)p++;else break}for(;p<n&&(e.charCodeAt(p)===R||e.charCodeAt(p)===z||e.charCodeAt(p)===B);)p++;if(p<n&&e.charCodeAt(p)===H){var g=e.slice(a+1,p).trim();return{node:{type:Y.htmlSelfClosing,tag:g,attrs:{},h:e.slice(t,p+1),a:!0},end:p+1}}return null}if(!(o>=K&&o<=q||o>=J&&o<=ht))return null;var _=Rn(e,t);if(!_)return null;var v=_.tag,y=v.toLowerCase();if(_.n||Nt(v))return{node:{type:Y.htmlSelfClosing,tag:v,attrs:xr(_.attrs,v,i),m:_.q?In(_):e.slice(t,_.end),a:!1},end:_.end};var b=xn.has(y),x=Tr(e.slice(0,n),_.end,v);if(x===-1)return{node:{type:Y.htmlSelfClosing,tag:v,attrs:xr(_.attrs,v,i),m:_.q?In(_):e.slice(t,_.end),a:!1},end:_.end};var S=Cr(e,`</${y}`,x),C=e.slice(_.end,S);if(b){var w=zn(C);return{node:{type:Y.htmlBlock,tag:v,attrs:xr(_.attrs,v,i),b:_.g+_.b,children:[],e:w||void 0,h:e.slice(S,x),text:w,c:!0,a:!1},end:x}}var T=[],E=C.trim();if(E){var{inAnchor:D,inline:O,k:ee}=r;y===`a`&&(r.inAnchor=!0),r.k=!1,E.indexOf(`

`)!==-1||/^#{1,6}\s/.test(E)?(r.inline=!1,T=vi(E,r,i)):T=gi(E,0,E.length,r,i),r.inAnchor=D,r.inline=O,r.k=ee}return{node:{type:Y.htmlBlock,tag:v,attrs:xr(_.attrs,v,i),b:_.b,children:T,text:zn(C),c:!1,a:!1},end:x}}var mi=200,hi=0;function gi(e,t,n,r,i){if(hi++,hi>mi)return hi--,[{type:Y.text,text:e.slice(t,n)}];var a=Zr;Zr=Qr();let o=r;if(i.optimizeForStreaming){let r=function(e,t){for(var n=1,r=t+1;r<e.length;r++){var i=e.charCodeAt(r);if(i===Ee)n++;else if(i===Ie&&(n--,n===0))return r}return-1},i=e.slice(t,n),a=i;for(var s=0,c=0,l=0,u=0,d=0,f=-1,p=-1,m=-1,h=-1,g=-1,_=0;_<i.length;_++){var v=i.charCodeAt(_);v===Me?_+1<i.length&&i.charCodeAt(_+1)===Me?(s++,f=_,_++):(c++,p=_):v===Ne?_+1<i.length&&i.charCodeAt(_+1)===Ne?(l++,m=_,_++):(u++,h=_):v===Te&&_+1<i.length&&i.charCodeAt(_+1)===Te&&(d++,g=_,_++)}var y=[];d%2==1&&g>=0&&y.push([g,2]),l%2==1&&m>=0&&y.push([m,2]),u%2==1&&h>=0&&y.push([h,1]),s%2==1&&f>=0&&y.push([f,2]),c%2==1&&p>=0&&y.push([p,1]),y.sort((e,t)=>t[0]-e[0]);for(var b=0;b<y.length;b++){var x=y[b][0],S=y[b][1];i=i.slice(0,x)+i.slice(x+S)}let o=0,A=-1;for(let e=0;e<i.length;e++)i.charCodeAt(e)===V&&(o++,A=e);if(o%2==1&&A!==-1){let e=!1,t=-1,n=0;for(;n<i.length;)i.charCodeAt(n)===V&&(e?(e=!1,t=-1):(t=n,e=!0)),n++;e&&t!==-1&&(i=i.slice(0,t))}for(var C=!0;C;){C=!1;for(var w=-1,T=-1,E=-1,D=!1,O=0;O<i.length;O++)if(i.charCodeAt(O)===Ee&&(O===0||i.charCodeAt(O-1)!==je)){var ee=O>0&&i.charCodeAt(O-1)===Le,k=ee?O-1:O,te=r(i,O);if(te===-1)w=k,D=ee,T=O+1,E=i.length;else{var ne=te+1;if(ne>=i.length)w=k,D=ee,T=O+1,E=te;else if(i.charCodeAt(ne)===ot){var re=i.indexOf(`)`,ne+1);re===-1?(w=k,D=ee,T=O+1,E=te,O=i.length):O=re}else if(i.charCodeAt(ne)===Ee){var ie=i.indexOf(`]`,ne+1);ie===-1?(w=k,D=ee,T=O+1,E=te,O=i.length):O=ie}else O=te}}if(w>=0){var ae=D?``:i.slice(T,E);i=i.slice(0,w)+ae,C=!0}}let j=i.match(/<([A-Z][A-Za-z0-9]*)(?:\s[^>]*)?>([^<]*)$/);if(j&&j.index!==void 0){var oe=j[0].length-j[2].length;if(!(oe>=2&&j[0].charCodeAt(oe-2)===$e)){for(var se=!1,ce=0,le=0;le<j.index;le++)i.charCodeAt(le)===V&&ce++;if(se=ce%2==1,!se){let e=j[1];Sr(i,`</${e}`,0)===-1&&(i=i.slice(0,j.index)+j[2])}}}i!==a&&(e=e.slice(0,t)+i,n=t+i.length)}let A=[];var j=[];let M=t;var N=``,ue=i.disableAutoLink||i.disableBareUrls||o.inAnchor?-1:e.indexOf(`@`,t);for(ue>=n&&(ue=-1);t<n;){let r=e.charCodeAt(t),a=null;if(r===V){if(a=Pr(e,t,n),!a){var de=er(e,t,n,V);t+=de-1}}else if(r===Me||r===Ne){var P=Vr(e,t,n);if(P){if(P.canOpen||P.canClose){(N||t>M)&&(A.push(di(N+e.slice(M,t))),N=``);var F=di(e.slice(t,t+P.len));j.push({idx:A.length,ch:r,len:P.len,canOpen:P.canOpen,canClose:P.canClose,active:!0}),A.push(F),t+=P.len,M=t;continue}t+=P.len-1}}else if(r===Te)a=Lr(e,t,n,o,i);else if(r===Ae)a=Rr(e,t,n,o,i);else if(r===Ee)t+1<n&&e.charCodeAt(t+1)===De&&(a=ai(e,t,n,o)),a||=ri(e,t,n,o,i);else if(r===Le&&t+1<n&&e.charCodeAt(t+1)===Ee)a=ri(e,t,n,o,i);else if(r===Pe)a=ii(e,t,n),!(a||i.disableParsingRawHTML||i.ignoreHTMLBlocks)&&(a=pi(e,t,n,o,i));else if(r===Re){var fe=fi(e,t,n);if(fe!==-1){var pe=e.slice(t,fe),me=wt(pe);if(me!==pe){N=N+e.slice(M,t)+me,t=fe,M=fe;continue}}}else if((r===He||r===Ue||r===Ve)&&!o.inAnchor&&!i.disableAutoLink&&(t===0||e.charCodeAt(t-1)!==Pe)){var he=t+1<n?e.charCodeAt(t+1):0;(r===He&&he===We||r===Ve&&he===We||r===Ue&&he===Ue)&&(a=oi(e,t,n,i))}if(!a&&ue>=0&&ue-t<=64&&!o.inAnchor&&!i.disableAutoLink&&!i.disableBareUrls&&(r>=K&&r<=q||r>=J&&r<=ht||r>=W&&r<=G)&&(a=si(e,t,n,i),!a&&t>=ue&&(ue=e.indexOf(`@`,t+1),ue>=n&&(ue=-1))),r===B&&o.k){var ge=!1,_e=0;if(t>M&&e.charCodeAt(t-1)===je)ge=!0,_e=1;else{for(var ve=0,ye=t-1;ye>=M&&e.charCodeAt(ye)===R;)ve++,ye--;ve>=2&&(ge=!0,_e=ve)}if(ge){for((N||t-_e>M)&&(A.push(di(N+e.slice(M,t-_e))),N=``),A.push({type:Y.breakLine}),t++;t<n&&e.charCodeAt(t)===R;)t++;M=t;continue}var be=t>M&&e.charCodeAt(t-1)===R,xe=t+1<n&&e.charCodeAt(t+1)===R;if(be||xe){for(var I=t;I>M&&e.charCodeAt(I-1)===R;)I--;for(N+=`${e.slice(M,I)}
`,t++;t<n&&e.charCodeAt(t)===R;)t++;M=t;continue}}if(a)(N||t>M)&&(A.push(di(N+e.slice(M,t))),N=``),A.push(a.node),t=a.end,M=t;else{if(r===je&&t+1<n&&Kn(e.charCodeAt(t+1))&It){(N||t>M)&&(A.push(di(N+e.slice(M,t))),N=``),A.push(di(e[t+1])),t+=2,M=t;continue}if(t++,ue<0||ue-t>64)for(;t<n&&!(ue>=0&&ue-t<=64);){var Se=e.charCodeAt(t);if(Se<gt&&!En[Se])t++;else break}}}return(N||n>M)&&(A.push(di(N+e.slice(M,n))),N=``),j.length>0&&Hr(A,j,r,i),Zr=a,hi--,A}var _i=500;function vi(e,t,n){var r=t.o||0;if(r>_i)return[{type:Y.text,text:e}];if(t.o=r+1,n.optimizeForStreaming&&!(t.i||t.w)){for(var i=e.length;i>0&&e.charCodeAt(i-1)===B;)i--;for(var a=i;a>0&&e.charCodeAt(a-1)!==B;)a--;if(i>a&&e.charCodeAt(a)===rt){for(var o=!1,s=a+1;s<i;s++){var c=e.charCodeAt(s);if(c!==R&&c!==z&&c!==rt&&c!==ze&&c!==U){o=!0;break}}for(var l=!1,u=!1,d=0,f=a,p=a-1;p>0;){for(var m=p;m>0&&e.charCodeAt(m-1)!==B;)m--;if(e.charCodeAt(m)!==rt)break;f=m;for(var h=!0,g=!1,_=m;_<p;_++){var v=e.charCodeAt(_);if(v===U)g=!0;else if(v!==R&&v!==z&&v!==ze&&v!==rt){h=!1;break}}h&&g?(l=!0,u=!0):u||d++,p=m-1}o?l||(e=e.slice(0,a).trimEnd()):e=l&&d>0?e.slice(0,a).trimEnd():e.slice(0,f).trimEnd()}for(var y=-1,b=-1,x=-1,S=!1,C=e.length-1;C>=0;C--)if(e.charCodeAt(C)===Pe){for(var w=C+1<e.length?e.charCodeAt(C+1):0,T=w>=K&&w<=q||w>=J&&w<=ht,E=w===$e&&C+2<e.length&&(e.charCodeAt(C+2)>=K&&e.charCodeAt(C+2)<=q||e.charCodeAt(C+2)>=J&&e.charCodeAt(C+2)<=ht),D=w===Le||w===Ze,O=e.length;O>C+1&&e.charCodeAt(O-1)===B;)O--;var ee=C+1>=O;if(T||E||D||ee){var k=C+1;if((E||T)&&(k=C+2),T||E)for(;k<e.length;){var te=e.charCodeAt(k);if(te>=K&&te<=q||te>=J&&te<=ht||te>=W&&te<=G)k++;else break}for(var ne=T||E?k:C+2;ne<e.length&&e.charCodeAt(ne)!==H;)ne++;if(ne>=e.length)y=C,S=!0;else if((T||E)&&e.charCodeAt(ne-1)!==$e){for(var re=!1,ie=ne+1;ie<e.length;ie++)if(e.charCodeAt(ie)===Pe){re=!0;break}re||(y=C,b=k,x=ne+1)}}break}if(y>=0){for(var ae=0,oe=0;oe<y;oe++)e.charCodeAt(oe)===V&&ae++;if(ae%2==0){if(S)e=e.slice(0,y);else{var se=e.slice(y+1,b);Sr(e,`</${se}`,0)===-1&&(e=e.slice(0,y)+e.slice(x))}}}for(var ce=e.length;ce>0&&e.charCodeAt(ce-1)===B;)ce--;if(ce>0){for(var le=ce;le>0&&e.charCodeAt(le-1)!==B;)le--;for(var A=le,j=0;A<ce&&e.charCodeAt(A)===R&&j<3;)A++,j++;if(le>0&&A<ce&&or(e,A,ce)){for(var M=le-1,N=M;N>0&&e.charCodeAt(N-1)!==B;)N--;rr(e,N,M)||(e=e.slice(0,le).trimEnd())}}var ue=e.length;if(ue>0){for(var de=e.lastIndexOf(`
`),P=de===-1?0:de+1,F=ue,fe=P,pe=0;fe<F&&e.charCodeAt(fe)===R&&pe<3;)fe++,pe++;if(fe<F){var me=e.charCodeAt(fe),he=!1;if(me===Me||me===U||me===nt){var ge=fe+1;if(ge>=F||e.charCodeAt(ge)===R||e.charCodeAt(ge)===z){for(var _e=ge;_e<F&&(e.charCodeAt(_e)===R||e.charCodeAt(_e)===z);)_e++;_e>=F&&(he=!0)}}else if(me>=W&&me<=G){for(var ve=fe;ve<F&&e.charCodeAt(ve)>=W&&e.charCodeAt(ve)<=G;)ve++;if(ve<F&&(e.charCodeAt(ve)===Qe||e.charCodeAt(ve)===st)){var ye=ve+1;if(ye>=F||e.charCodeAt(ye)===R||e.charCodeAt(ye)===z){for(var be=ye;be<F&&(e.charCodeAt(be)===R||e.charCodeAt(be)===z);)be++;be>=F&&(he=!0)}}}he&&(e=e.slice(0,P).trimEnd())}}}if(t.inline)return gi(e,0,e.length,t,n);let xe=[],I=0,Se=e.length;if(I===0&&!n.disableFrontmatter&&e.startsWith(`---`)){let t=vt(e);if(t?.hasValidYaml){if(n.preserveFrontmatter!==!1){let n=e.slice(0,t.endPos).trimEnd();xe.push({type:Y.frontmatter,text:n})}I=t.endPos}}for(;I<Se;){for(var L=e.indexOf(`
`,I),Ce=L<0?Se:L;I<Se&&rr(e,I,Ce);)I=Ce<Se?Ce+1:Ce,I<Se&&(L=e.indexOf(`
`,I),Ce=L<0?Se:L);if(I>=Se)break;var we=e.charCodeAt(I)===mt;nr(e,I,Ce);let r=null;if(Jn=e,Yn=I,Xn=Ce,!we&&tr>=4&&!t.inHTML)r=pr(e,I);else if(!we){let i=I+Z,a=e.charCodeAt(i);a===Oe?r=ar(e,I,t,n):a===H?r=mr(e,I,t,n):a===V||a===Te?r=dr(e,I,t):a===U||a===Me||a===Ne?(r=sr(e,I),!r&&(r=yr(e,I,t,n))):a===nt||a>=W&&a<=G?r=yr(e,I,t,n):a===Pe?r=Er(e,I,t,n):a===rt?r=kr(e,I,t,n):a===Ee&&(r=Ar(e,I,t))}if(!r){for(var De=!1,ke=I;ke<Ce;ke++)if(e.charCodeAt(ke)===rt){De=!0;break}De&&(r=kr(e,I,t,n))}if(r||=Mr(e,I,t,n),r)r.node.type!==Y.refCollection&&xe.push(r.node),I=r.end;else{var Ae=e.indexOf(`
`,I);I=Ae<0?Se:Ae+1}}return t.o=r,xe}function yi(e,t,n,r){var i=Rn(e,t);return i?{tagName:i.tag,tagLower:i.tag.toLowerCase(),attrs:i.b,whitespaceBeforeAttrs:i.g,isSelfClosing:i.n,hasSpaceBeforeSlash:i.r,isClosing:i.f,hasNewline:i.g.includes(`
`)||i.b.includes(`
`),endPos:i.end}:null}function bi(e,t,n){hi=0,e=Gt(e),!t.refs&&(t.refs={}),(n.optimizeForStreaming||t.inline)&&(t.w=Bn(e,t.refs,n));var r,i;t.t||(t.t=r=[],t.p=i=[]);let a=vi(e,t,n);if(r&&i){for(var o=r,s={inline:t.inline,inAnchor:t.inAnchor,inHTML:t.inHTML,htmlDepth:t.d,inList:t.inList,inBlockQuote:t.inBlockQuote,noSetext:t.l,depth:t.o},c=0;c<o.length;c++){var l=o[c];t.inline=l.inline,t.inAnchor=l.inAnchor,t.inHTML=l.inHTML,t.d=l.htmlDepth,t.inList=l.inList,t.inBlockQuote=l.inBlockQuote,t.l=l.noSetext,t.o=l.depth,t.k=l.breaks;var u=gi(l.text,0,l.text.length,t,n);t.k=!1;for(var d=0;d<u.length;d++)l.dest.push(u[d])}t.inline=s.inline,t.inAnchor=s.inAnchor,t.inHTML=s.inHTML,t.d=s.htmlDepth,t.inList=s.inList,t.inBlockQuote=s.inBlockQuote,t.l=s.noSetext,t.o=s.depth;for(var f=i,p=0;p<f.length;p++)for(var m=f[p],h=0;h<m.src.length;h++){var g=m.src[h];if(m.unwrap&&g.type===Y.paragraph)for(var _=g.children,v=0;v<_.length;v++)m.dest.push(_[v]);else m.dest.push(g)}t.t=void 0,t.p=void 0,ui(a,t,n.slugify)}return Jt(t.refs)?[{type:Y.refCollection,refs:t.refs},...a]:a}var xi;try{Si=d.createElement(`div`),xi=typeof Si==`object`&&Si&&`$$typeof`in Si&&typeof Si.$$typeof==`symbol`?Si.$$typeof:Symbol.for(`react.transitional.element`)}catch{xi=Symbol.for(`react.transitional.element`)}var Si;function Ci(e,t,n){return{$$typeof:xi,type:e,key:n==null?null:String(n),ref:null,props:t,_owner:null,_store:{},_debugStack:null,_debugTask:null}}function wi(e,t){var n={key:e};if(t){var r=St(t);for(var i in r)n[i]=r[i]}return n}var Ti=typeof d.createContext>`u`?void 0:d.createContext(void 0);function Ei(e,t,n,r,i,a,o,s,c){switch(e.type){case Y.blockQuote:{let i={key:n.key};return e.alert&&(i.className=`markdown-alert-${a(e.alert.toLowerCase(),At)}`,e.children.unshift(Yt(e.alert))),r(`blockquote`,i,t(e.children,n))}case Y.breakLine:return r(`br`,{key:n.key});case Y.breakThematic:return r(`hr`,{key:n.key});case Y.frontmatter:return s.preserveFrontmatter?r(`pre`,{key:n.key},e.text):null;case Y.codeBlock:{let t=e.lang?wt(e.lang):``;var l=e.attrs?St(e.attrs):{};return l.className=t?`language-${t} lang-${t}`:``,r(`pre`,{key:n.key},r(`code`,l,e.text))}case Y.codeInline:return r(`code`,{key:n.key},e.text);case Y.footnoteReference:return r(`a`,{key:n.key,href:i(e.target,`a`,`href`)||void 0},r(`sup`,null,e.text));case Y.gfmTask:return r(`input`,{checked:e.completed,key:n.key,readOnly:!0,type:`checkbox`});case Y.heading:return r(`h${e.level}`,{id:e.id,key:n.key},t(e.children,n));case Y.htmlBlock:{let a=e;if(on(s)&&mn(a.tag)){var u=rn(a);return u.kind===`literal`?r(`span`,{key:n.key},u.literal):r(`span`,{key:n.key},...an(u.open,a.children?t(a.children,n):null,u.close))}let l=a.j,_=l!==void 0,v=_?l:a.a?a.e||``:(a.e||``)+(a.h||``);if(v&&a.c){let r=On(a.tag.toLowerCase()),u=a.children,y=u!=null&&u.length>0;if(r){let t=_?l:a.e||``,r=on(s)?gn(t):t;if(/<[a-z][^>]{0,100}>/i.test(v)){var f=wi(n.key,e.attrs);return f.dangerouslySetInnerHTML={__html:r},c(e.tag,f)}return c(e.tag,wi(n.key,e.attrs),r)}let b=RegExp(`^<${a.tag}(\\s|>)`,`i`);if(y&&!b.test(v)&&on(s)&&hn(v))return c(e.tag,wi(n.key,e.attrs),t(u,n));if(kn(v)){let t=on(s)?gn(v):v;var p=wi(n.key,e.attrs);return p.dangerouslySetInnerHTML={__html:t},c(e.tag,p)}let x=_n({slugify:s.slugify,sanitizer:i,tagfilter:!0}),S=Kt(v);if(RegExp(`^<${a.tag}(\\s[^>]*)?>(\\s*</${a.tag}>)?$`,`i`).test(S))return a.children&&a.children.length>0?c(e.tag,wi(n.key,e.attrs),t(a.children,n)):c(e.tag,wi(n.key,e.attrs));let C=bi(S,{inline:!1,refs:o,inHTML:!1},x);$t(C);let w=a.tag.toLowerCase(),T=_;if(T&&y)return c(e.tag,wi(n.key,e.attrs),t(u,n));if(T)return t(C.flatMap(Qt),n);var m=en(C,w);if(m.found&&m.afterClose.length>0){var h=m.beforeClose.flatMap(Qt),g=m.afterClose.flatMap(Qt);return Ci(d.Fragment,{children:[c(e.tag,wi(n.key,e.attrs),t(h,n)),t(g,n)]},n.key)}return c(e.tag,wi(n.key,e.attrs),t(C.flatMap(Qt),n))}return Nt(e.tag)?c(e.tag,wi(n.key,e.attrs)):c(e.tag,wi(n.key,e.attrs),e.children?t(e.children,n):``)}case Y.htmlSelfClosing:{let t=e;if(on(s)&&mn(t.tag)){var _=rn(t);return r(`span`,{key:n.key},_.kind===`literal`?_.literal:_.open+(_.close||``))}return c(e.tag,wi(n.key,e.attrs))}case Y.image:{let t=e.target===null?null:i(e.target,`img`,`src`);return r(`img`,{key:n.key,alt:e.alt&&e.alt.length>0?e.alt:void 0,title:e.title||void 0,src:t||void 0})}case Y.link:{let a={key:n.key};if(e.target!=null){let t=sn(e.target,i,`a`,`href`);t!=null&&(a.href=t)}return e.title&&(a.title=e.title),r(`a`,a,t(e.children,n))}case Y.table:{let i=e;return r(`table`,{key:n.key},r(`thead`,{key:`thead`},r(`tr`,null,i.header.map(function(e,a){return r(`th`,{key:a,style:i.align[a]===null?{}:{textAlign:i.align[a]}},t(e,n))}))),i.cells.length>0&&r(`tbody`,{key:`tbody`},i.cells.map(function(e,a){return r(`tr`,{key:a},e.map(function(e,a){return r(`td`,{key:a,style:i.align[a]===null?{}:{textAlign:i.align[a]}},t(e,n))}))})))}case Y.text:return e.text;case Y.textFormatted:return r(e.tag,{key:n.key},t(e.children,n));case Y.orderedList:case Y.unorderedList:return r(e.type===Y.orderedList?`ol`:`ul`,{key:n.key,start:e.type===Y.orderedList?e.start:void 0},e.items.map(function(e,i){return r(`li`,{key:i},t(e,n))}));case Y.paragraph:return r(`p`,{key:n.key},t(e.children,n));case Y.ref:return null;default:return null}}var Di=(e,t,n,r,i,a,o)=>{var s=e=>e.map(e=>`text`in e?e.text:``),c=(l,u={})=>{var d=Array.isArray(l)?l:[l],f=(u.renderDepth||0)+1;if(f>2500)return s(d);u.renderDepth=f;for(var p=u.key,m=[],h=!1,g=0;g<d.length;g++){u.key=g;var _=e?e(Ei.bind(null,d[g],c,u,t,n,r,i,a,o),d[g],c,u):Ei(d[g],c,u,t,n,r,i,a,o),v=typeof _==`string`;if(h&&typeof _==`string`){var y=m.at(-1);m[m.length-1]=(typeof y==`string`?y:``)+_}else if(_!=null){if(Array.isArray(_))for(var b=0;b<_.length;b++)m.push(_[b]);else m.push(_)}h=v}return u.key=p,u.renderDepth=f-1,m};return c},Oi=(e,t)=>{let n=ln(t,e,void 0);return n?typeof n==`function`||typeof n==`object`&&`render`in n?n:ln(t,`${e}.component`,e):e};function ki(e,t){let n={...t||{}};n.overrides=n.overrides||{};let r=n.slugify||At,i=n.sanitizer||Et,a=n.createElement,o=Jt(n.overrides),s=e=>Ai(e,{...n,wrapper:null});function c(e){for(var t in e){var n=e[t];if(typeof n==`string`&&n.length>0&&n.charCodeAt(0)===Pe&&(vn.test(n)||yn.test(n)||yi(n,0))){var r=s(n.trim());e[t]=t===`innerHTML`&&Array.isArray(r)?r[0]:r}}}function l(e,t,...r){var i=t||{},s=e;if(o){var c=ln(n.overrides,`${e}.props`,{});s=Oi(e,n.overrides),i={...i,...c,className:dn(i.className,c.className)||void 0}}if(!a){var l=i.key;return l!=null&&delete i.key,r.length===1?i.children=r[0]:r.length>1&&(i.children=r),Ci(s,i,l)}return a(s,i,...r)}function u(e,t,...n){return t&&c(t),l(e,t,...n)}let d=_n(n,n.forceInline),f=e[0]&&e[0].type===Y.refCollection?e[0].refs:{},p=Di(n.renderRule,l,i,r,f,n,u),m=p(e,{inline:n.forceInline,refs:f}),h=cn(f);if(h.length>0&&m.push(l(`footer`,{key:`footer`},h.map(function(e){let t=e.identifier.charCodeAt(0)===De?e.identifier.slice(1):e.identifier,n=bi(e.footnote,{inline:!0,refs:f},d);return l(`div`,{id:r(t,At),key:e.identifier},`${t}: `,p(n,{inline:!0,refs:f}))}))),n.wrapper===null)return m;let g=n.wrapper||(n.forceInline?`span`:`div`),_;if(m.length>1||n.forceWrapper)_=m;else return m.length===1?m[0]:null;var v=n.wrapperProps?{...n.wrapperProps}:{};return v.children=_,Ci(g,v,`outer`)}function Ai(e=``,t={}){let n={...t||{}};n.overrides=n.overrides||{},n.slugify,n.sanitizer;function r(e){let t=n.forceInline||!(n.forceBlock||Ct.test(e)),r=_n(n,t);return ki(bi(t?e:Zt(e),{inline:t,refs:i},r),{...n,forceInline:t})}let i={};return r(e)}function ji(e){let t=d.useRef(e),n=t.current;if(n!==e){var r=!0,i=0;for(var a in e)if(i++,!Object.is(n[a],e[a])){r=!1;break}if(r){var o=0;for(var s in n)o++;r=o===i}r||(t.current=e)}return t.current}var Mi=({children:e,options:t,...n})=>{if(!(typeof d.useContext<`u`)){let r={...t,overrides:{...t?.overrides},wrapperProps:{...t?.wrapperProps,...n}};return Ai(e??``,r)}let r=Ti?d.useContext(Ti):void 0,i=ji(n),a=d.useMemo(()=>({...r,...t,overrides:{...r?.overrides,...t?.overrides},wrapperProps:{...r?.wrapperProps,...t?.wrapperProps,...i}}),[r,t,i]),o=e??``;return d.useMemo(()=>Ai(o,a),[o,a])};function Ni({text:e}){return(0,p.jsx)(Mi,{options:{disableParsingRawHTML:!0,forceBlock:!0},children:e})}let Pi=[`👍`,`❤️`,`😂`,`😮`,`😢`,`🎉`];async function Fi(e){if(navigator.clipboard?.writeText!==void 0)try{return await navigator.clipboard.writeText(e),!0}catch{return!1}if(typeof document.execCommand!=`function`)return!1;let t=document.createElement(`textarea`);t.value=e,t.style.position=`fixed`,t.style.left=`-9999px`,document.body.append(t),t.select();try{return document.execCommand(`copy`)}catch{return!1}finally{t.remove()}}function Ii({tools:e}){let[t,n]=(0,d.useState)(!1),[r,i]=(0,d.useState)(!1),a=e.copyText;if((0,d.useEffect)(()=>{if(!r)return;let e=()=>{i(!1)},t=t=>{t.key===`Escape`&&e()};return document.addEventListener(`pointerdown`,e),document.addEventListener(`keydown`,t),()=>{document.removeEventListener(`pointerdown`,e),document.removeEventListener(`keydown`,t)}},[r]),e.recalled)return null;let o=e.identity!==void 0,s=e.reactions.some(t=>t.messageId===e.message.messageId&&t.emoji===`👍`&&t.participantIds.includes(e.identity?.participantId??``));if(a===void 0&&!o)return null;let c=()=>{a===void 0||t||Fi(a).then(e=>{e&&(n(!0),globalThis.setTimeout(()=>{n(!1)},1e3))})};return(0,p.jsxs)(`div`,{className:`dsh-chatroom-message-actions`,children:[e.onReply!==void 0&&(0,p.jsxs)(`button`,{type:`button`,"aria-label":`回复`,onClick:e.onReply,children:[`↩ `,(0,p.jsx)(`span`,{className:`dsh-chatroom-action-label`,children:`回复`})]}),o&&(0,p.jsxs)(`button`,{type:`button`,"aria-label":s?`取消点赞`:`点赞`,"aria-pressed":s,onClick:()=>{e.toggleReaction(e.roomId,e.message.messageId,`👍`)},children:[`👍 `,(0,p.jsx)(`span`,{className:`dsh-chatroom-action-label`,children:s?`已赞`:`点赞`})]}),e.onBranch!==void 0&&(0,p.jsxs)(`button`,{type:`button`,"aria-label":`分支`,onClick:e.onBranch,children:[`⑂ `,(0,p.jsx)(`span`,{className:`dsh-chatroom-action-label`,children:`分支`})]}),o&&(0,p.jsxs)(`button`,{type:`button`,"aria-label":`转发`,onClick:()=>{e.openForward(e.roomId,e.message)},children:[`↗ `,(0,p.jsx)(`span`,{className:`dsh-chatroom-action-label`,children:`转发`})]}),(o||a!==void 0||e.onBranch!==void 0)&&(0,p.jsxs)(`span`,{className:`dsh-chatroom-inline-reaction-control`,children:[(0,p.jsx)(`button`,{type:`button`,"aria-label":`更多消息操作`,"aria-expanded":r,onClick:()=>{i(e=>!e)},children:`•••`}),r&&(0,p.jsxs)(`span`,{className:`dsh-chatroom-action-overflow`,role:`menu`,"aria-label":`更多消息操作`,onPointerDown:e=>{e.stopPropagation()},children:[o&&(0,p.jsx)(`span`,{className:`dsh-chatroom-inline-reactions`,"aria-label":`贴表情`,children:Pi.map(t=>(0,p.jsx)(`button`,{type:`button`,"aria-label":`贴表情 ${t}`,title:`贴表情 ${t}`,onClick:()=>{e.toggleReaction(e.roomId,e.message.messageId,t),i(!1)},children:t},t))}),a!==void 0&&(0,p.jsx)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{c(),i(!1)},children:t?`✓ 已复制`:`▣ 复制`}),o&&(0,p.jsx)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{e.toggleSelection(e.roomId,e.message),i(!1)},children:e.selected?`✓ 取消选择`:`☑ 多选`}),e.canRecall&&(0,p.jsx)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{e.recallMessage(e.roomId,e.message.messageId),i(!1)},children:`↶ 撤回`})]})]})]})}function Li({tools:e}){return!e.selecting||e.recalled?null:(0,p.jsxs)(`label`,{className:`dsh-chatroom-selection-checkbox`,title:e.selected?`取消选择`:`选择消息`,children:[(0,p.jsx)(`input`,{type:`checkbox`,"aria-label":`${e.selected?`取消选择`:`选择`} ${e.message.displayName} 的消息`,checked:e.selected,onChange:()=>{e.toggleSelection(e.roomId,e.message)}}),(0,p.jsx)(`span`,{"aria-hidden":!0,children:e.selected?`✓`:``})]})}function Ri(){let[e,t]=(0,d.useState)();return(0,d.useEffect)(()=>{if(e===void 0)return;let n=()=>{t(void 0)},r=e=>{e.key===`Escape`&&n()};return document.addEventListener(`pointerdown`,n),document.addEventListener(`keydown`,r),()=>{document.removeEventListener(`pointerdown`,n),document.removeEventListener(`keydown`,r)}},[e]),{position:e,open:e=>{e.preventDefault(),e.stopPropagation(),t({x:Math.max(8,Math.min(e.clientX,globalThis.innerWidth-248)),y:Math.max(8,Math.min(e.clientY,globalThis.innerHeight-248))})},close:()=>{t(void 0)}}}function zi(e){if(e.recalled)return null;let t=e.reactions.filter(t=>t.messageId===e.message.messageId&&t.participantIds.length>0);return t.length===0?null:(0,p.jsx)(`div`,{className:`dsh-chatroom-reaction-bar`,children:t.map(t=>(0,p.jsxs)(`button`,{type:`button`,"aria-label":`${t.emoji} ${t.participantIds.length}`,"aria-pressed":t.participantIds.includes(e.identity?.participantId??``),disabled:e.identity===void 0,onClick:()=>{e.toggleReaction(e.roomId,e.message.messageId,t.emoji)},children:[(0,p.jsx)(`span`,{children:t.emoji}),(0,p.jsx)(`small`,{children:t.participantIds.length})]},t.emoji))})}function Bi({tools:e,position:t,close:n}){if(t===void 0||e.identity===void 0||e.recalled)return null;let r=e.copyText;return(0,p.jsxs)(`div`,{className:`dsh-chatroom-context-menu`,style:{left:t.x,top:t.y},role:`menu`,onPointerDown:e=>{e.stopPropagation()},children:[(0,p.jsx)(`div`,{className:`dsh-chatroom-context-reactions`,"aria-label":`贴表情`,children:Pi.map(t=>(0,p.jsx)(`button`,{type:`button`,title:`贴表情 ${t}`,onClick:()=>{e.toggleReaction(e.roomId,e.message.messageId,t),n()},children:t},t))}),r!==void 0&&(0,p.jsxs)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{Fi(r),n()},children:[(0,p.jsx)(`span`,{"aria-hidden":!0,children:`▣`}),` 复制`]}),e.onReply!==void 0&&(0,p.jsxs)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{e.onReply?.(),n()},children:[(0,p.jsx)(`span`,{"aria-hidden":!0,children:`↩`}),` 回复`]}),(0,p.jsxs)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{e.openForward(e.roomId,e.message),n()},children:[(0,p.jsx)(`span`,{"aria-hidden":!0,children:`↗`}),` 转发`]}),(0,p.jsxs)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{e.toggleSelection(e.roomId,e.message),n()},children:[(0,p.jsx)(`span`,{"aria-hidden":!0,children:e.selected?`✓`:`☑`}),` `,e.selected?`取消选择`:`多选`]}),e.onBranch!==void 0&&(0,p.jsxs)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{e.onBranch?.(),n()},children:[(0,p.jsx)(`span`,{"aria-hidden":!0,children:`⑂`}),` 分支`]}),e.canRecall&&(0,p.jsxs)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{e.recallMessage(e.roomId,e.message.messageId),n()},children:[(0,p.jsx)(`span`,{"aria-hidden":!0,children:`↶`}),` 撤回`]})]})}let Vi=0,Hi=`dsh-chatroom:branch-frame-compatibility`;function Ui(e){let[t,n]=(0,d.useState)(),r=e.room.thread,i=r??t;return(0,d.useEffect)(()=>{r!==void 0&&n(r)},[r]),(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(Ki,{toasts:e.room.toasts,dismiss:e.dismissToast}),(0,p.jsx)(fe,{...e}),e.room.membersOpen&&(0,p.jsx)(qi,{...e}),i!==void 0&&(0,p.jsx)(Ji,{...e,thread:i,open:r?.id===i.id}),e.room.selectionRoomId!==void 0&&(0,p.jsx)(Wi,{...e}),e.room.forwardOpen&&(0,p.jsx)(Gi,{...e})]})}function Wi(e){let t=e.room.selectionRoomId;return(0,p.jsxs)(`div`,{className:`dsh-chatroom-selection-bar`,role:`toolbar`,"aria-label":`消息多选`,children:[(0,p.jsxs)(`strong`,{children:[`已选择 `,e.room.selectedMessages.length,` 条消息`]}),(0,p.jsx)(`button`,{type:`button`,disabled:e.room.selectedMessages.length===0,onClick:()=>{t!==void 0&&e.openForward(t)},children:`合并转发`}),(0,p.jsx)(`button`,{type:`button`,onClick:e.clearMessageSelection,children:`取消`})]})}function Gi(e){let t=e.room.rooms.filter(t=>t.id!==e.room.selectionRoomId);return(0,p.jsx)(`div`,{className:`dsh-chatroom-dialog-layer dsh-chatroom-forward-layer`,"data-testid":`chatroom-forward-dialog`,children:(0,p.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-forward-dialog`,"aria-label":`转发到群聊`,children:[(0,p.jsx)(`button`,{className:`dsh-chatroom-close`,"aria-label":`关闭转发`,type:`button`,onClick:e.closeForward,children:`×`}),(0,p.jsx)(`h2`,{children:`转发到群聊`}),(0,p.jsxs)(`p`,{children:[`将选中的 `,e.room.selectedMessages.length,` 条消息合并成一张聊天记录卡片。`]}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-forward-targets`,children:[t.map(t=>(0,p.jsxs)(`button`,{type:`button`,disabled:e.room.forwardBusy,onClick:()=>{e.forwardSelected(t.id)},children:[(0,p.jsx)(`span`,{children:`＃`}),(0,p.jsx)(`strong`,{children:t.title}),(0,p.jsxs)(`small`,{children:[`@`,t.aiDisplayName]})]},t.id)),t.length===0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-forward-empty`,children:`请先新建另一个群聊，再进行转发。`})]}),e.room.forwardError!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.forwardError})]})})}function Ki({toasts:e,dismiss:t}){return e.length===0?null:(0,p.jsx)(`div`,{className:`dsh-chatroom-toast-stack`,role:`status`,"aria-live":`polite`,children:e.map(e=>(0,p.jsxs)(`button`,{className:`dsh-chatroom-toast`,type:`button`,onClick:()=>{t(e.id)},children:[(0,p.jsxs)(`strong`,{children:[e.displayName,` `,(0,p.jsxs)(`small`,{children:[`· `,e.roomTitle,e.threadId===void 0?``:` · 分支`]})]}),(0,p.jsx)(`span`,{children:e.text})]},e.id))})}function qi(e){let[t,n]=(0,d.useState)(e.room.room?.title??``),[r,i]=(0,d.useState)(``),[a,o]=(0,d.useState)([]),s=e.room.members.find(t=>t.participantId===e.room.identity?.participantId)?.role??`member`,c=s===`owner`||s===`admin`,l=c||e.room.auth.account?.role===`super-admin`,u=r.trim().toLocaleLowerCase(`zh-CN`),f=e.room.memberCandidates.filter(e=>u===``||e.displayName.toLocaleLowerCase(`zh-CN`).includes(u)||e.username.toLocaleLowerCase(`zh-CN`).includes(u));return(0,d.useEffect)(()=>{let t=new Set(e.room.memberCandidates.map(e=>e.participantId));o(e=>e.filter(e=>t.has(e)))},[e.room.memberCandidates]),(0,p.jsxs)(`aside`,{className:`dsh-chatroom-member-card`,"data-testid":`chatroom-members`,"aria-label":`群管理`,children:[(0,p.jsx)(`button`,{className:`dsh-chatroom-close`,"aria-label":`关闭群管理`,type:`button`,onClick:e.closeMembers,children:`×`}),(0,p.jsx)(`h2`,{children:`群管理`}),(0,p.jsxs)(`p`,{children:[e.room.room?.title,` · `,e.room.members.length,` 位成员 · `,e.room.online,` 人在线`]}),l&&(0,p.jsxs)(`section`,{className:`dsh-chatroom-invite`,"aria-label":`添加群成员`,children:[(0,p.jsxs)(`div`,{className:`dsh-chatroom-invite-heading`,children:[(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`strong`,{children:`添加成员`}),(0,p.jsx)(`small`,{children:`从系统中尚未加入本群的启用账号里选择。`})]}),(0,p.jsxs)(`span`,{children:[a.length,` 位已选`]})]}),(0,p.jsx)(`input`,{type:`search`,value:r,placeholder:`搜索姓名或账号`,"aria-label":`搜索系统用户`,onChange:e=>{i(e.target.value)}}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-invite-list`,children:[f.map(t=>{let n=a.includes(t.participantId);return(0,p.jsxs)(`label`,{children:[(0,p.jsx)(`input`,{type:`checkbox`,checked:n,disabled:e.room.managementBusy,onChange:()=>{o(e=>n?e.filter(e=>e!==t.participantId):[...e,t.participantId])}}),(0,p.jsx)(M,{className:`dsh-chatroom-member-avatar`,...t}),(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`strong`,{children:t.displayName}),(0,p.jsxs)(`small`,{children:[`@`,t.username]})]})]},t.participantId)}),f.length===0&&(0,p.jsx)(`p`,{children:e.room.managementBusy?`正在加载系统用户…`:u===``?`所有启用账号都已在群聊中。`:`没有匹配的系统用户。`})]}),(0,p.jsxs)(`button`,{type:`button`,disabled:e.room.managementBusy||a.length===0,onClick:async()=>{await e.addRoomMembers?.(a)&&o([])},children:[`添加选中的 `,a.length,` 位`]})]}),c&&(0,p.jsxs)(`form`,{className:`dsh-chatroom-manage-title`,onSubmit:n=>{n.preventDefault(),e.renameRoom?.(t)},children:[(0,p.jsx)(`input`,{value:t,maxLength:160,"aria-label":`群聊名称`,onChange:e=>{n(e.target.value)}}),(0,p.jsx)(`button`,{type:`submit`,disabled:e.room.managementBusy||t.trim()===``||t.trim()===e.room.room?.title,children:`保存名称`})]}),(0,p.jsxs)(`section`,{className:`dsh-chatroom-auto-trigger`,"aria-label":`AI 自动回复`,children:[(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`strong`,{children:`无需 @AI 自动回复`}),(0,p.jsx)(`small`,{children:`开启后，由设置中选择的判断模型决定普通消息是否需要 AI 回复。群内所有成员都可以修改。`})]}),(0,p.jsxs)(`label`,{className:`dsh-chatroom-switch`,children:[(0,p.jsx)(`input`,{type:`checkbox`,"aria-label":`无需 @AI 自动回复`,checked:e.room.room?.autoTriggerEnabled??!1,disabled:e.room.managementBusy,onChange:t=>{e.setRoomAutoTrigger?.(t.target.checked)}}),(0,p.jsx)(`span`,{"aria-hidden":!0})]})]}),(0,p.jsx)(`div`,{className:`dsh-chatroom-member-list`,children:e.room.members.map(t=>(0,p.jsxs)(`div`,{className:`dsh-chatroom-member`,children:[(0,p.jsx)(M,{className:`dsh-chatroom-member-avatar`,...t}),(0,p.jsxs)(`span`,{children:[(0,p.jsxs)(`strong`,{children:[t.displayName,` `,(0,p.jsx)(`em`,{children:t.role===`owner`?`群主`:t.role===`admin`?`管理员`:``})]}),(0,p.jsx)(`small`,{children:t.online?`在线`:`最近活跃 ${ia(t.lastSeenAt)}`})]}),s===`owner`&&t.role!==`owner`?(0,p.jsx)(`button`,{className:`dsh-chatroom-member-role`,type:`button`,disabled:e.room.managementBusy,onClick:()=>{e.setMemberRole?.(t.participantId,t.role===`admin`?`member`:`admin`)},children:t.role===`admin`?`取消管理员`:`设为管理员`}):(0,p.jsx)(`i`,{"data-online":t.online})]},t.participantId))}),e.room.managementError!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.managementError}),(0,p.jsx)(`button`,{className:`dsh-chatroom-notification-button`,type:`button`,disabled:e.room.notificationsEnabled,onClick:()=>{e.enableSystemNotifications()},children:e.room.notificationsEnabled?`✓ 系统消息提醒已开启`:`开启系统消息提醒`})]})}function Ji(e){let{thread:t}=e,n=e.room.room?.sessionId,r=(0,d.useRef)(null),[i]=(0,d.useState)(()=>++Vi),[a,o]=(0,d.useState)(0),[s,c]=(0,d.useState)(-1),[l,u]=(0,d.useState)(!1),[f,m]=(0,d.useState)(ea);(0,d.useLayoutEffect)(()=>{if(n===void 0)return;if(f){ne(n);return}re(t.sessionId),c(a);let e=globalThis.setTimeout(()=>{ne(n)},3e4);return()=>{globalThis.clearTimeout(e),ne(n)}},[a,f,n,t.sessionId]),(0,d.useEffect)(()=>{e.open||n===void 0||ne(n)},[n,e.open]),(0,d.useEffect)(()=>{if(f)return;u(!1);let e=!1,i,a,o=()=>{if(e)return;let o=r.current?.contentWindow;o!=null&&n!==void 0&&ee(o,O(t,n));try{let e=r.current?.contentDocument;if(e==null||!ce(e,t.sessionId,t.root.text))return}catch{return}e=!0,globalThis.clearInterval(i),globalThis.clearTimeout(a),u(!0)},s=e=>{e.origin===globalThis.location.origin&&e.source===r.current?.contentWindow&&ra(e.data,t.id)&&o()};return globalThis.addEventListener(`message`,s),i=globalThis.setInterval(o,150),a=globalThis.setTimeout(()=>{e||(globalThis.clearInterval(i),n!==void 0&&ne(n),ta(),m(!0))},8e3),o(),()=>{e=!0,globalThis.removeEventListener(`message`,s),globalThis.clearInterval(i),globalThis.clearTimeout(a)}},[a,f,n,t.id,t.root.text,t.sessionId]);let h=$i(t.root.text),g=n===void 0?void 0:D(t,n,`${i}:${a}`);return(0,p.jsxs)(`aside`,{className:`dsh-chatroom-thread-panel`,"data-testid":`chatroom-thread-panel`,"data-open":e.open,"aria-hidden":!e.open,"aria-label":`分支回复`,children:[(0,p.jsxs)(`header`,{children:[(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`strong`,{children:`分支回复`}),(0,p.jsxs)(`small`,{children:[`来自 `,e.room.room?.title??`群聊`,` · `,t.root.displayName,`：`,h]})]}),(0,p.jsx)(`button`,{"aria-label":`关闭分支`,type:`button`,onClick:e.closeThread,children:`×`})]}),n===void 0?(0,p.jsx)(`div`,{className:`dsh-chatroom-thread-frame-error`,children:`无法确定父群聊会话。`}):f?(0,p.jsx)(Yi,{...e,thread:t,frameUrl:g,retry:()=>{na(),m(!1),o(e=>e+1)}}):(0,p.jsxs)(`div`,{className:`dsh-chatroom-thread-frame-shell`,children:[s===a&&(0,p.jsx)(`iframe`,{className:`dsh-chatroom-thread-frame`,ref:r,title:`分支回复：${h}`,src:g,onLoad:()=>{try{if(r.current?.contentDocument!==null)return}catch{}ne(n),ta(),m(!0)}},`${i}:${a}`),!l&&(0,p.jsxs)(`div`,{className:`dsh-chatroom-thread-frame-status`,role:`status`,children:[(0,p.jsx)(`span`,{children:a===0?`正在加载分支…`:`正在重新加载分支…`}),(0,p.jsx)(`small`,{children:`正在初始化原生 Harness 分支会话`})]})]}),e.room.threadError!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.threadError})]})}function Yi(e){let[t,n]=(0,d.useState)(``),[r,i]=(0,d.useState)(),[a,o]=(0,d.useState)(0),s=(0,d.useRef)(null),c=(0,d.useRef)(null),l=(0,d.useMemo)(()=>[...[...new Set([`AI`,e.room.room?.aiDisplayName].filter(e=>e!==void 0))].map(e=>({name:e,description:`提及后在本分支触发 AI`,ai:!0})),...e.room.members.filter(t=>t.participantId!==e.room.identity?.participantId).map(e=>({name:e.displayName,description:e.online?`在线成员`:`群成员`,ai:!1}))].filter((e,t,n)=>n.findIndex(t=>t.name===e.name)===t),[e.room.identity?.participantId,e.room.members,e.room.room?.aiDisplayName]),u=r===void 0?[]:l.filter(e=>e.name.toLocaleLowerCase().includes(r.query.toLocaleLowerCase()));(0,d.useEffect)(()=>{typeof s.current?.scrollIntoView==`function`&&s.current.scrollIntoView({block:`end`})},[e.room.threadMessages.length]),(0,d.useEffect)(()=>{o(0)},[r?.query]);let f=(e,t)=>{i(Qi(e,t))},m=e=>{if(r===void 0)return;let a=c.current?.selectionStart??t.length,o=`${t.slice(0,r.start)}@${e} ${t.slice(a)}`,s=r.start+e.length+2;n(o),i(void 0),queueMicrotask(()=>{c.current?.focus(),c.current?.setSelectionRange(s,s)})};return(0,p.jsxs)(`div`,{className:`dsh-chatroom-thread-compatibility`,children:[(0,p.jsxs)(`div`,{className:`dsh-chatroom-thread-compatibility-notice`,role:`status`,children:[(0,p.jsx)(`span`,{children:`当前访问入口不允许嵌入完整 Agent，已切换到分支兼容模式。`}),(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`a`,{href:e.frameUrl,target:`_blank`,rel:`noreferrer`,children:`在新标签打开完整 Agent`}),(0,p.jsx)(`button`,{type:`button`,onClick:e.retry,children:`重试嵌入`})]})]}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-thread-root`,children:[(0,p.jsx)(`strong`,{children:e.thread.root.displayName}),(0,p.jsx)(`div`,{children:e.thread.root.role===`ai`?(0,p.jsx)(Ni,{text:e.thread.root.text}):e.thread.root.text})]}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-thread-messages`,children:[e.room.threadMessages.length===0&&(0,p.jsxs)(`p`,{className:`dsh-chatroom-thread-empty`,children:[`从这里开始分支讨论。输入 `,(0,p.jsx)(`code`,{children:`@AI`}),` 只会在本分支触发 AI。`]}),e.room.threadMessages.map(t=>(0,p.jsx)(Xi,{message:t,roomId:e.thread.roomId,props:e},t.id)),(0,p.jsx)(`div`,{ref:s})]}),(0,p.jsxs)(`form`,{className:`dsh-chatroom-thread-composer`,onSubmit:r=>{r.preventDefault();let i=t.trim();i!==``&&e.sendThreadMessage(i).then(e=>{e&&n(``)})},children:[e.room.threadReply!==void 0&&(0,p.jsxs)(`div`,{className:`dsh-chatroom-thread-composer-reply`,children:[(0,p.jsxs)(`span`,{children:[(0,p.jsxs)(`strong`,{children:[`回复 `,e.room.threadReply.displayName]}),e.room.threadReply.text]}),(0,p.jsx)(`button`,{type:`button`,"aria-label":`取消引用`,onClick:e.clearThreadReply,children:`×`})]}),(0,p.jsx)(`textarea`,{ref:c,rows:3,placeholder:`回复分支；输入 @AI 让 AI 在本分支回答`,value:t,"aria-expanded":u.length>0,"aria-controls":`dsh-chatroom-thread-mentions`,onChange:e=>{n(e.target.value),f(e.target.value,e.target.selectionStart)},onClick:e=>{f(e.currentTarget.value,e.currentTarget.selectionStart)},onKeyDown:e=>{if(u.length>0){if(e.key===`ArrowDown`||e.key===`ArrowUp`){e.preventDefault();let t=e.key===`ArrowDown`?1:-1;o(e=>(e+t+u.length)%u.length);return}if(e.key===`Escape`){e.preventDefault(),i(void 0);return}if(e.key===`Tab`){e.preventDefault(),m(u[a]?.name??u[0].name);return}}if(!(e.key!==`Enter`||e.shiftKey)){if(u.length>0&&r?.query===``){e.preventDefault(),m(u[a]?.name??u[0].name);return}e.preventDefault(),e.currentTarget.form?.requestSubmit()}}}),u.length>0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-thread-mentions`,id:`dsh-chatroom-thread-mentions`,role:`listbox`,"aria-label":`提及成员`,children:u.map((e,t)=>(0,p.jsxs)(`button`,{type:`button`,role:`option`,"aria-label":e.name,"aria-selected":t===a,"data-active":t===a,onMouseDown:e=>{e.preventDefault()},onClick:()=>{m(e.name)},children:[(0,p.jsx)(`i`,{children:e.ai?`✦`:`●`}),(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`strong`,{children:e.name}),(0,p.jsx)(`small`,{children:e.description})]})]},e.name))}),(0,p.jsx)(`button`,{type:`submit`,disabled:e.room.threadBusy||t.trim()===``,children:`发送`})]})]})}function Xi({message:e,roomId:t,props:n}){let r=e.participantId===n.room.identity?.participantId,i=n.room.members.find(t=>t.participantId===e.participantId),a=i?.avatarId??e.avatarId??g(e.participantId),o=i?.avatarUrl??e.avatarUrl,s=e.role===`ai`?{id:`ai`,emoji:`✦`}:_(a,e.participantId),c=Zi(e),l=n.room.identity===void 0?void 0:()=>{n.setThreadReply(c)},u={roomId:t,message:{...c,role:e.role,createdAt:e.createdAt},reactions:n.room.reactions,identity:n.room.identity,selecting:n.room.selectionRoomId===t,selected:n.room.selectionRoomId===t&&n.room.selectedMessages.some(t=>t.messageId===e.id),recalled:n.room.recalls.some(t=>t.messageId===e.id),canRecall:r&&e.role===`human`,copyText:e.text,onReply:l,toggleReaction:n.toggleReaction,openForward:n.openForward,toggleSelection:n.toggleMessageSelection,recallMessage:n.recallMessage},d=Ri();return(0,p.jsxs)(`article`,{className:`dsh-chatroom-thread-message`,"data-own":r,"data-role":e.role,"data-dsh-chatroom-selection-mode":u.selecting||void 0,"data-dsh-chatroom-selected":u.selected||void 0,onContextMenu:d.open,children:[(0,p.jsx)(Li,{tools:u}),e.role===`ai`?(0,p.jsx)(`span`,{className:`dsh-chatroom-member-avatar`,"data-avatar":s.id,"aria-hidden":!0,children:s.emoji}):(0,p.jsx)(M,{className:`dsh-chatroom-member-avatar`,participantId:e.participantId,avatarId:a,...o===void 0?{}:{avatarUrl:o}}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-thread-message-column`,children:[(0,p.jsxs)(`strong`,{children:[e.displayName,(0,p.jsx)(`time`,{children:aa(e.createdAt)})]}),!u.recalled&&e.reply!==void 0&&(0,p.jsxs)(`div`,{className:`dsh-chatroom-thread-reply-quote`,children:[(0,p.jsxs)(`strong`,{children:[`回复 `,e.reply.displayName]}),(0,p.jsx)(`span`,{children:e.reply.text})]}),(0,p.jsx)(`div`,{className:`dsh-chatroom-thread-message-body`,children:u.recalled?(0,p.jsx)(`div`,{className:`dsh-chatroom-recalled-message`,children:`消息已撤回`}):e.role===`ai`?(0,p.jsx)(Ni,{text:e.text}):(0,p.jsx)(`div`,{className:`dsh-chatroom-thread-literal-text`,children:e.text})}),(0,p.jsx)(zi,{...u}),(0,p.jsx)(Ii,{tools:u})]}),(0,p.jsx)(Bi,{tools:u,position:d.position,close:d.close})]})}function Zi(e){return{messageId:e.id,displayName:e.displayName,text:$i(e.text,120)}}function Qi(e,t){let n=e.slice(0,t),r=/(?:^|\s)@([^\s@]*)$/u.exec(n);if(r!==null)return{start:n.length-r[1].length-1,query:r[1]}}function $i(e,t=48){let n=e.replace(/```[\s\S]*?```/gu,` `).replace(/[`*_#>|\[\]]/gu,``).replace(/\s+/gu,` `).trim(),r=[...n];return r.length===0?`分支消息`:r.length<=t?n:`${r.slice(0,t).join(``)}…`}function ea(){try{return globalThis.sessionStorage?.getItem(Hi)===`1`}catch{return!1}}function ta(){try{globalThis.sessionStorage?.setItem(Hi,`1`)}catch{}}function na(){try{globalThis.sessionStorage?.removeItem(Hi)}catch{}}function ra(e,t){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let n=e;return n.type===`dsh-chatroom-branch-ready`&&n.threadId===t}function ia(e){let t=Math.max(0,Math.floor((Date.now()-e)/6e4));return t<1?`刚刚`:t<60?`${t} 分钟前`:t<1440?`${Math.floor(t/60)} 小时前`:`${Math.floor(t/1440)} 天前`}function aa(e){return new Date(e).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})}function oa(e){let t=e.useChatroom(e=>e);if(t.branchFrame!==void 0)return null;let n=(0,p.jsx)(Ui,{room:t,...e});return t.open?(0,p.jsxs)(p.Fragment,{children:[(0,p.jsxs)(`div`,{className:`dsh-chatroom-dialog-layer`,"data-dsh-chatroom-entry":!0,"data-testid":`chatroom-dialog`,children:[t.phase===`auth-required`&&(0,p.jsx)(sa,{room:t,login:e.login,register:e.register}),t.phase===`identity-required`&&(0,p.jsx)(la,{room:t,join:e.join,close:e.closeRoom}),t.phase===`loading`&&(0,p.jsx)(da,{title:`正在载入共享会话`,detail:`正在恢复此浏览器的身份与会话目录…`,close:e.closeRoom}),t.phase===`ready`&&t.identity!==void 0&&(0,p.jsx)(ua,{room:t,selectRoom:e.selectRoom,createRoom:e.createRoom,resetIdentity:e.resetIdentity,logout:e.logout,openAccount:e.openAccount,openAdmin:e.openAdmin,openDirect:e.openDirect,close:e.closeRoom}),t.phase===`error`&&(0,p.jsx)(da,{title:`共享会话暂时不可用`,detail:t.error??`请稍后重试。`,action:`重试`,onAction:e.retry,close:e.closeRoom})]}),n]}):n}function sa({room:e,login:t,register:n}){let r=e.auth.bootstrapRequired||e.auth.allowSelfRegistration,[i,a]=(0,d.useState)(e.auth.bootstrapRequired?`register`:`login`),[o,s]=(0,d.useState)(``),[c,l]=(0,d.useState)(``),[u,f]=(0,d.useState)(``),[h,g]=(0,d.useState)(``),[_,v]=(0,d.useState)(m[0].id),y=typeof location>`u`?`/`:`${location.pathname}${location.search}`,b=e.auth.bootstrapRequired?void 0:e.auth.autoRedirectProvider,x=e.auth.authMode!==`dsh-auth-only`&&typeof location<`u`&&new URLSearchParams(location.search).get(`local`)===`1`;return(0,d.useEffect)(()=>{b===void 0||x||typeof location>`u`||location.assign(ca(b,y))},[b,x,y]),b!==void 0&&!x?(0,p.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-auth-card`,role:`status`,children:[(0,p.jsxs)(`h2`,{children:[`正在前往 `,b.label]}),(0,p.jsx)(`p`,{children:`正在打开企业统一登录…`})]}):(0,p.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-auth-card`,"aria-label":`系统登录`,children:[(0,p.jsxs)(`div`,{className:`dsh-chatroom-auth-brand`,children:[(0,p.jsx)(`strong`,{children:`DeepSeek Harness`}),(0,p.jsx)(`span`,{children:`团队协作平台`})]}),(0,p.jsx)(`h2`,{children:i===`login`?`登录`:e.auth.bootstrapRequired?`创建超级管理员`:`注册账号`}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-auth-tabs`,children:[(0,p.jsx)(`button`,{type:`button`,"data-active":i===`login`,onClick:()=>{a(`login`)},children:`登录`}),r&&(0,p.jsx)(`button`,{type:`button`,"data-active":i===`register`,onClick:()=>{a(`register`)},children:`注册`})]}),(0,p.jsxs)(`form`,{onSubmit:r=>{r.preventDefault(),i===`login`?t(o,c):n({username:o,password:c,displayName:u,avatarId:_,...e.auth.bootstrapRequired?{bootstrapToken:h}:{}})},children:[(0,p.jsxs)(`label`,{children:[`账号`,(0,p.jsx)(`input`,{autoFocus:!0,autoComplete:`username`,value:o,onChange:e=>{s(e.target.value)}})]}),(0,p.jsxs)(`label`,{children:[`密码`,(0,p.jsx)(`input`,{type:`password`,autoComplete:i===`login`?`current-password`:`new-password`,value:c,onChange:e=>{l(e.target.value)}})]}),i===`register`&&(0,p.jsxs)(p.Fragment,{children:[(0,p.jsxs)(`label`,{children:[`显示名称`,(0,p.jsx)(`input`,{value:u,onChange:e=>{f(e.target.value)}})]}),e.auth.bootstrapRequired&&(0,p.jsxs)(`label`,{children:[`初始化口令`,(0,p.jsx)(`input`,{type:`password`,value:h,onChange:e=>{g(e.target.value)}})]}),(0,p.jsxs)(`fieldset`,{className:`dsh-chatroom-avatar-fieldset`,children:[(0,p.jsx)(`legend`,{children:`选择头像`}),(0,p.jsx)(`div`,{className:`dsh-chatroom-avatar-grid`,role:`radiogroup`,"aria-label":`选择头像`,children:m.map(e=>(0,p.jsx)(`button`,{className:`dsh-chatroom-avatar-choice`,"data-avatar":e.id,"data-selected":e.id===_,type:`button`,role:`radio`,"aria-checked":e.id===_,onClick:()=>{v(e.id)},children:e.emoji},e.id))})]})]}),(0,p.jsx)(`button`,{className:`dsh-chatroom-button`,type:`submit`,disabled:o.trim()===``||c===``||i===`register`&&u.trim()===``,children:i===`login`?`登录`:`创建账号`})]}),e.auth.providers.length>0&&(0,p.jsxs)(`div`,{className:`dsh-chatroom-sso-list`,children:[(0,p.jsx)(`span`,{children:`或使用企业账号`}),e.auth.providers.map(e=>(0,p.jsxs)(`a`,{href:ca(e,y),children:[`使用 `,e.label,` 登录`]},e.id))]}),e.error!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.error})]})}function ca(e,t){return v(y,e,t)}function la({room:e,join:t,close:n}){let[r,i]=(0,d.useState)(e.identity?.displayName??``),[a,o]=(0,d.useState)(e.identity?.avatarId??m[0].id);return(0,p.jsxs)(`form`,{className:`dsh-chatroom-card`,onSubmit:e=>{e.preventDefault(),t(r,a)},children:[(0,p.jsx)(`button`,{className:`dsh-chatroom-close`,"aria-label":`关闭`,type:`button`,onClick:n,children:`×`}),(0,p.jsx)(`h2`,{children:`共享会话`}),(0,p.jsx)(`p`,{children:`选择你在共享会话中显示的名字和头像。进入后继续使用 Harness 原生对话界面。`}),(0,p.jsx)(`input`,{className:`dsh-chatroom-name`,"data-testid":`chatroom-identity-input`,autoFocus:!0,maxLength:80,placeholder:`你的名字`,value:r,onChange:e=>{i(e.target.value)}}),(0,p.jsxs)(`fieldset`,{className:`dsh-chatroom-avatar-fieldset`,children:[(0,p.jsx)(`legend`,{children:`选择头像`}),(0,p.jsx)(`div`,{className:`dsh-chatroom-avatar-grid`,role:`radiogroup`,"aria-label":`选择头像`,children:m.map(e=>(0,p.jsx)(`button`,{className:`dsh-chatroom-avatar-choice`,"data-avatar":e.id,"data-selected":e.id===a,type:`button`,role:`radio`,"aria-checked":e.id===a,"aria-label":e.label,onClick:()=>{o(e.id)},children:e.emoji},e.id))})]}),(0,p.jsx)(`button`,{className:`dsh-chatroom-button`,"data-testid":`chatroom-join`,type:`submit`,disabled:r.trim()===``,children:`继续`}),e.error!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.error})]})}function ua({room:e,selectRoom:t,createRoom:n,resetIdentity:r,logout:i,openAccount:a,openAdmin:o,openDirect:s,close:c}){let[l,u]=(0,d.useState)(``);return(0,p.jsxs)(`div`,{className:`dsh-chatroom-card dsh-chatroom-room-card`,children:[(0,p.jsx)(`button`,{className:`dsh-chatroom-close`,"aria-label":`关闭`,type:`button`,onClick:c,children:`×`}),(0,p.jsx)(`h2`,{children:`共享会话`}),(0,p.jsxs)(`p`,{children:[`普通消息只在人类之间聊天；输入 `,(0,p.jsx)(`code`,{children:`@AI`}),` 或 `,(0,p.jsxs)(`code`,{children:[`@`,e.rooms[0]?.aiDisplayName??`DeepSeek`]}),` 才会触发 AI 回复。`]}),(0,p.jsx)(`div`,{className:`dsh-chatroom-room-list`,"data-testid":`chatroom-room-list`,children:e.rooms.map(n=>(0,p.jsxs)(`button`,{className:`dsh-chatroom-room-item`,"data-active":n.id===e.room?.id,"data-testid":`chatroom-room-${n.id}`,type:`button`,onClick:()=>{t(n.id)},children:[(0,p.jsx)(`span`,{children:n.title}),(0,p.jsxs)(`small`,{children:[`@`,n.aiDisplayName]})]},n.id))}),(0,p.jsxs)(`form`,{className:`dsh-chatroom-create`,onSubmit:e=>{e.preventDefault(),l.trim()!==``&&n(l)},children:[(0,p.jsx)(`input`,{className:`dsh-chatroom-name`,"data-testid":`chatroom-title-input`,maxLength:160,placeholder:`新共享会话名称`,value:l,onChange:e=>{u(e.target.value)}}),(0,p.jsx)(`button`,{className:`dsh-chatroom-create-button`,"data-testid":`chatroom-create`,type:`submit`,disabled:l.trim()===``,children:`新建`})]}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-card-footer`,children:[(0,p.jsxs)(`span`,{children:[`当前身份：`,e.identity===void 0?``:(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(A,{className:`dsh-chatroom-member-avatar`,avatarId:e.identity.avatarId,avatarUrl:e.identity.avatarUrl,seed:e.identity.participantId}),` `,e.identity.displayName]})]}),(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`button`,{type:`button`,onClick:()=>{s()},children:`私聊`}),e.auth.enabled&&(0,p.jsx)(`button`,{type:`button`,onClick:a,children:`账号设置`}),e.auth.account?.role===`super-admin`&&(0,p.jsx)(`button`,{type:`button`,onClick:()=>{o()},children:`系统管理`}),e.auth.enabled?(0,p.jsx)(`button`,{type:`button`,onClick:()=>{i()},children:`退出登录`}):(0,p.jsx)(`button`,{type:`button`,onClick:()=>{r()},children:`更换身份`})]})]}),e.error!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.error})]})}function da({title:e,detail:t,action:n,onAction:r,close:i}){return(0,p.jsxs)(`div`,{className:`dsh-chatroom-card`,role:`status`,children:[(0,p.jsx)(`button`,{className:`dsh-chatroom-close`,"aria-label":`关闭`,type:`button`,onClick:i,children:`×`}),(0,p.jsx)(`h2`,{children:e}),(0,p.jsx)(`p`,{children:t}),n!==void 0&&(0,p.jsx)(`button`,{className:`dsh-chatroom-button`,type:`button`,onClick:()=>{r?.()},children:n})]})}function fa({preview:e,open:t}){return e===void 0?null:(0,p.jsxs)(`button`,{className:`dsh-chatroom-thread-activity`,type:`button`,"aria-label":`打开分支，${e.totalMessages} 条回复`,disabled:t===void 0,onClick:t,children:[(0,p.jsxs)(`span`,{className:`dsh-chatroom-thread-activity-heading`,children:[(0,p.jsx)(`span`,{"aria-hidden":!0,children:`⑂`}),` 分支 · `,e.totalMessages,` 条回复`]}),(0,p.jsx)(`span`,{className:`dsh-chatroom-thread-activity-list`,children:e.recentMessages.map(e=>(0,p.jsxs)(`span`,{children:[(0,p.jsx)(A,{className:`dsh-chatroom-member-avatar`,avatarId:e.avatarId,avatarUrl:e.avatarUrl,seed:e.participantId}),(0,p.jsx)(`strong`,{children:e.displayName}),(0,p.jsx)(`span`,{children:e.text})]},e.id))})]})}function pa(e){let t=e.useChatroom(e=>e),n=t.rooms.find(t=>t.sessionId===String(e.sessionId)),r=e.resolveTarget?.(String(e.sessionId))??(n===void 0?void 0:{kind:`room`,room:n}),i=r?.room,a=e.useSession(t=>t.nodes.find(t=>t.kind===`assistant`&&t.messageId===e.messageId)),o=(0,d.useRef)(null),s=Ri(),c=t.selectionRoomId===i?.id&&t.selectedMessages.some(t=>t.messageId===String(e.messageId)),l=t.selectionRoomId===i?.id;if((0,d.useEffect)(()=>{let e=o.current?.closest(`[data-time-hover-root]`);if(e==null||i===void 0)return;let t=o.current?.parentElement;for(;t!=null&&t.parentElement!==null&&t.parentElement!==e;)t=t.parentElement;t?.setAttribute(`data-dsh-chatroom-native-actions`,``);let n=e=>{s.open(e)};return e.addEventListener(`contextmenu`,n),e.toggleAttribute(`data-dsh-chatroom-selected`,c),e.toggleAttribute(`data-dsh-chatroom-selection-mode`,l),()=>{e.removeEventListener(`contextmenu`,n),e.removeAttribute(`data-dsh-chatroom-selected`),e.removeAttribute(`data-dsh-chatroom-selection-mode`),t?.removeAttribute(`data-dsh-chatroom-native-actions`)}},[s.open,i,c,l]),i===void 0||a?.kind!==`assistant`)return null;let u=a.blocks.flatMap(e=>e.kind===`text`?[e.text]:[]).join(``).trim().replace(/\s+/gu,` `),f={messageId:String(e.messageId),displayName:i.aiDisplayName,text:[...u||`AI 回复`].slice(0,120).join(``)},m={...f,sourceSessionId:String(e.sessionId),sourceSeq:a.seq,role:`ai`,createdAt:a.time,content:a.blocks.reduce((e,t)=>(t.kind===`text`&&e.push({type:`text`,text:t.text,markdown:!0}),t.kind===`image`&&e.push({type:`image`,image:{...t.attachment,attachmentId:String(t.attachment.attachmentId)}}),e),[])},h={...f,role:`ai`,sourceSessionId:m.sourceSessionId,sourceSeq:m.sourceSeq},g={roomId:i.id,message:m,reactions:t.reactions,identity:t.identity,selecting:l,selected:c,recalled:!1,canRecall:!1,copyText:u||`AI 回复`,onReply:()=>{e.setReply(i.id,f)},onBranch:r?.kind===`thread`?void 0:()=>{e.openThread(i.id,h)},toggleReaction:e.toggleReaction,openForward:e.openForward,toggleSelection:e.toggleMessageSelection,recallMessage:e.recallMessage},_=t.threadPreviews.find(e=>e.thread.root.messageId===m.messageId&&e.thread.root.role===`ai`);return(0,p.jsxs)(`div`,{className:`dsh-chatroom-assistant-tools`,ref:o,children:[(0,p.jsx)(Li,{tools:g}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-assistant-actions`,children:[(0,p.jsx)(zi,{...g}),(0,p.jsx)(Ii,{tools:g})]}),r?.kind!==`thread`&&(0,p.jsx)(fa,{preview:_,open:()=>{e.openThread(i.id,h)}}),(0,p.jsx)(Bi,{tools:g,position:s.position,close:s.close})]})}function ma(e){if(!e.startsWith(`⁣dsh-chatroom:`))return;let t=e.indexOf(`⁣`,14);if(t<0)return;let n=e.slice(14,t),r=n.indexOf(`|`),i=r<0?n:n.slice(0,r);if(i===``)return;let a=r<0?void 0:n.slice(r+1);return{participantId:i,avatarId:h(a)?a:g(i),length:t+1}}function ha(e){if(!e.startsWith(`⁣dsh-chatroom-reply:`))return{text:e};let t=e.indexOf(`⁣`,20);if(t<0)return{text:e};let n=Ea(e.slice(20,t));if(!Da(n))return{text:e};let r=e.slice(t+1),i=Sa(n);return r.startsWith(i)&&(r=r.slice(i.length)),{text:r,reply:n}}function ga(e){let t=[],n=e;for(;;){let e=n.indexOf(`⁣dsh-chatroom-file:`);if(e<0)break;let r=n.indexOf(`⁣`,e+19);if(r<0)break;let i=Ea(n.slice(e+19,r));if(!Oa(i))break;t.push(i);let a=n.slice(0,e).replace(/\n$/u,``),o=n.slice(r+1),s=Ca(i);o.startsWith(s)&&(o=o.slice(s.length)),n=`${a}${o}`}return{text:n,files:t}}function _a(e){if(!e.startsWith(`⁣dsh-chatroom-forward:`))return{text:e};let t=e.indexOf(`⁣`,22);if(t<0)return{text:e};let n=Ea(e.slice(22,t));if(!ka(n))return{text:e};let r=e.slice(t+1),i=wa(n);return r.startsWith(i)&&(r=r.slice(i.length)),{text:r,forward:n}}function va(e){let t=[],n=e;for(;;){let e=n.indexOf(`⁣dsh-chatroom-card:`);if(e<0)break;let r=n.indexOf(`⁣`,e+19);if(r<0)break;let i=Ea(n.slice(e+19,r));if(!ja(i))break;t.push(i);let a=n.slice(0,e).replace(/\n$/u,``),o=n.slice(r+1),s=Ta(i);o.startsWith(s)&&(o=o.slice(s.length)),n=`${a}${o}`}return{text:n,cards:t}}function ya(e,t){let n=e.filter(e=>e.type===`text`).map(e=>e.text).join(`
`);return xa(t).test(n)}function ba(e){return e.find(e=>e.type===`text`)?.text.trimStart().startsWith(`/`)??!1}function xa(e){let t=e.replace(/[.*+?^${}()|[\]\\]/gu,`\\$&`);return RegExp(`@${t}(?=$|[^\\p{L}\\p{N}_])`,`iu`)}function Sa(e){return`回复 ${e.displayName}「${e.text}」\n`}function Ca(e){return`文件：${e.name}`}function wa(e){let t=e.items.map(e=>`${e.displayName}：${e.text}`);return`合并转发（${e.items.length} 条）\n${t.join(`
`)}`}function Ta(e){if(e.kind===`meeting`){let t=[e.beginTime,e.endTime].filter(e=>e!==void 0).join(` - `);return`企微会议：${e.title}${t===``?``:`（${t}）`}`}return`企微${e.documentType??`文档`}：${e.title}`}function Ea(e){try{return JSON.parse(decodeURIComponent(e))}catch{return}}function Da(e){if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.messageId==`string`&&typeof t.displayName==`string`&&typeof t.text==`string`}function Oa(e){if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.id==`string`&&typeof t.name==`string`&&typeof t.mediaType==`string`&&typeof t.bytes==`number`}function ka(e){if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.sourceRoomId!=`string`||typeof t.sourceRoomTitle!=`string`||!Array.isArray(t.items)||t.items.length===0?!1:t.items.every(e=>{if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.messageId==`string`&&(t.role===`human`||t.role===`ai`)&&typeof t.displayName==`string`&&typeof t.text==`string`&&typeof t.createdAt==`number`&&(t.sourceSessionId===void 0||typeof t.sourceSessionId==`string`)&&(t.sourceSeq===void 0||typeof t.sourceSeq==`number`)&&(t.content===void 0||Array.isArray(t.content)&&t.content.every(Aa))&&(t.reply===void 0||Da(t.reply))&&(t.reactions===void 0||Array.isArray(t.reactions)&&t.reactions.every(e=>typeof e==`object`&&!!e&&typeof e.emoji==`string`&&typeof e.count==`number`))})}function Aa(e){if(typeof e!=`object`||!e)return!1;let t=e;if(t.type===`text`)return typeof t.text==`string`&&typeof t.markdown==`boolean`;if(t.type===`file`)return Oa(t.file);if(t.type!==`image`||t.image===null||typeof t.image!=`object`)return!1;let n=t.image;return typeof n.attachmentId==`string`&&typeof n.mediaType==`string`&&typeof n.bytes==`number`&&typeof n.width==`number`&&typeof n.height==`number`}function ja(e){if(typeof e!=`object`||!e)return!1;let t=e;if(t.kind!==`meeting`&&t.kind!==`document`||typeof t.title!=`string`||t.title.trim()===``)return!1;if(t.kind===`meeting`){if(t.id!==void 0&&typeof t.id!=`string`)return!1;let n=e;return Ma(n.beginTime,n.endTime,n.url,n.location,n.status)&&(n.attendees===void 0||Array.isArray(n.attendees)&&n.attendees.every(e=>typeof e==`string`))}let n=e;return Ma(n.documentType,n.url,n.modifiedAt,n.owner)}function Ma(...e){return e.every(e=>e===void 0||typeof e==`string`)}let Na=new Set([`assistant-step`,`context`,`retry`,`tool-call`]);function Pa(e){let t=e.nativeMessageView,n=(0,d.useRef)(null),[r,i]=(0,d.useState)(!1),a=e.node.data.finalNode,o=e.useTurnData(`turn-tail`),s=e.resolveTarget?.(String(e.sessionId))!==void 0&&a!==void 0&&o?.closing?.finalNode.seq===a.seq,c=e.useSession(t=>{if(!s)return``;let n=e.node.data.turn;return t.chat.order.flatMap(r=>{let i=t.chat.nodes.get(r);if(i===void 0||i.key===e.node.key)return[];let a=i.location;return(a.kind===`turn`||a.kind===`step`?a.turn.turn:void 0)===n&&Na.has(i.kind)?[i.key]:[]}).join(`\0`)}),l=(0,d.useMemo)(()=>c===``?[]:c.split(`\0`),[c]),u=s?e.node.data.blocks.filter(e=>e.kind===`reasoning`&&e.text.trim()!==``).length:0,f=l.length+u,m=e.node.data.blocks.flatMap(e=>e.kind===`text`?va(e.text).cards:[]),h=[];for(let t of e.node.data.blocks){if(t.kind!==`text`){h.push(t);continue}let e=va(t.text);e.text.trim()!==``&&h.push({...t,text:e.text})}let g=m.length===0?e.node:{...e.node,data:{...e.node.data,blocks:h}};return(0,d.useEffect)(()=>{let e=n.current,t=e?.closest(`[data-chat-flow]`);if(e===null||!s)return;let i=new Set(l),a=t==null?[]:[...t.querySelectorAll(`[data-chat-flow-key]`)].filter(e=>i.has(e.dataset.chatFlowKey??``)),o=[...e.querySelectorAll(`[data-variant="think"]`)],c=[...a,...o].map(e=>({row:e,hidden:e.hidden}));for(let{row:e}of c)e.dataset.dshChatroomProcessRow=``,e.hidden=!r;return()=>{for(let{row:e,hidden:t}of c)e.hidden=t,delete e.dataset.dshChatroomProcessRow}},[s,r,l]),(0,p.jsxs)(`div`,{className:`dsh-chatroom-assistant-turn`,ref:n,children:[s&&f>0&&(0,p.jsxs)(`button`,{type:`button`,className:`dsh-chatroom-process-toggle`,"aria-expanded":r,onClick:()=>{i(e=>!e)},children:[(0,p.jsx)(`span`,{"aria-hidden":!0,className:`dsh-chatroom-process-chevron`,children:`⌄`}),(0,p.jsxs)(`span`,{children:[r?`收起执行过程`:`执行过程`,` · `,f,` 项`]})]}),(0,p.jsx)(t,{...e,node:g}),m.map((e,t)=>(0,p.jsx)(N,{card:e},`${e.kind}:${e.title}:${t}`))]})}let Fa=[`😀`,`😄`,`😂`,`🥰`,`😍`,`🤔`,`😮`,`😭`,`😡`,`👍`,`👏`,`🙏`,`🎉`,`❤️`,`🔥`,`✨`,`✅`,`👀`];function Ia(e){e.useChatroom(e=>e);let t=e.resolveTarget(String(e.sessionId))?.room,n=(0,d.useRef)(null),r=(0,d.useRef)(null),[i,a]=(0,d.useState)(!1);return(0,d.useEffect)(()=>{if(!i)return;let e=e=>{r.current?.contains(e.target)||a(!1)};return document.addEventListener(`pointerdown`,e),()=>{document.removeEventListener(`pointerdown`,e)}},[i]),t===void 0?null:(0,p.jsxs)(`div`,{className:`dsh-chatroom-composer-actions`,ref:r,children:[(0,p.jsxs)(`button`,{className:`dsh-chatroom-file-button`,type:`button`,title:`发送表情`,"aria-label":`发送表情`,"aria-expanded":i,onClick:()=>{a(e=>!e)},children:[(0,p.jsx)(`span`,{"aria-hidden":!0,children:`☺`}),(0,p.jsx)(`span`,{children:`表情`})]}),i&&(0,p.jsx)(`div`,{className:`dsh-chatroom-emoji-picker`,role:`dialog`,"aria-label":`选择表情`,children:Fa.map(t=>(0,p.jsx)(`button`,{type:`button`,"aria-label":`插入 ${t}`,onClick:()=>{e.inputActions.setDraft(`${e.input.draft}${t}`),a(!1)},children:t},t))}),(0,p.jsxs)(`button`,{className:`dsh-chatroom-file-button`,type:`button`,title:`发送图片或文件`,"aria-label":`发送图片或文件`,onClick:()=>{n.current?.click()},children:[(0,p.jsx)(`span`,{"aria-hidden":!0,children:`📎`}),(0,p.jsx)(`span`,{children:`附件`})]}),(0,p.jsx)(`input`,{ref:n,className:`dsh-chatroom-file-input`,"data-testid":`chatroom-file-input`,type:`file`,multiple:!0,onChange:n=>{let r=n.currentTarget.files;r!==null&&e.addFiles(t.id,[...r]),n.currentTarget.value=``}})]})}function La(e){let t=e.useChatroom(e=>e),n=e.resolveTarget(String(e.sessionId));return n?.kind===`room`?(0,p.jsxs)(`div`,{className:`dsh-chatroom-session-controls`,children:[(0,p.jsx)(`button`,{type:`button`,disabled:!e.session.running||t.sessionControlBusy,onClick:()=>{e.stopRoomSession(n.room.id)},children:`■ 停止`}),(0,p.jsx)(`button`,{type:`button`,disabled:t.sessionControlBusy,onClick:()=>{e.newRoomSession(n.room.id)},children:`＋ 新会话`}),(0,p.jsx)(`button`,{type:`button`,className:`dsh-chatroom-quick-meeting`,disabled:t.wecomBusy,onClick:()=>{e.quickMeeting(n.room.id)},children:`⚡ 快速会议`}),t.sessionControlError!==void 0&&(0,p.jsx)(`span`,{className:`dsh-chatroom-control-error`,role:`alert`,title:t.sessionControlError,children:t.sessionControlError}),t.wecomError!==void 0&&(0,p.jsx)(`span`,{className:`dsh-chatroom-control-error`,role:`alert`,title:t.wecomError,children:t.wecomError})]}):null}function Ra(e){let t=e.useChatroom(e=>e),n=e.resolveTarget(String(e.sessionId)),r=n?.room;if(r===void 0)return null;let i=t.composerRoomId===r.id,a=i&&t.pendingFiles.length>0,o=n?.kind===`room`&&r.aiContextResetSeq!==void 0&&r.aiContextStartSeq===void 0;if(!a&&!o&&(!i||t.composerError===void 0))return null;let s=a&&e.input.draft.trim()===``&&e.input.imageIds.length===0;return(0,p.jsxs)(`div`,{className:`dsh-chatroom-composer-dock`,"data-testid":`chatroom-composer-dock`,children:[o&&(0,p.jsx)(za,{}),a&&(0,p.jsxs)(`div`,{className:`dsh-chatroom-pending-files`,children:[t.pendingFiles.map(t=>(0,p.jsxs)(`span`,{className:`dsh-chatroom-pending-file`,children:[(0,p.jsx)(`span`,{"aria-hidden":!0,children:t.file.type.startsWith(`image/`)?`🖼️`:`📎`}),(0,p.jsx)(`span`,{title:t.file.name,children:t.file.name}),(0,p.jsx)(`button`,{type:`button`,"aria-label":`移除 ${t.file.name}`,onClick:()=>{e.removeFile(r.id,t.id)},children:`×`})]},t.id)),s?(0,p.jsx)(`button`,{className:`dsh-chatroom-send-files`,type:`button`,disabled:t.composerBusy,onClick:()=>{e.sendFiles(r.id)},children:t.composerBusy?`正在发送…`:`发送`}):(0,p.jsx)(`small`,{className:`dsh-chatroom-file-hint`,children:`文件将随当前消息发送`})]}),i&&t.composerError!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-composer-error`,role:`alert`,children:t.composerError})]})}function za(){return(0,p.jsxs)(`div`,{className:`dsh-chatroom-context-reset`,role:`status`,children:[(0,p.jsx)(`span`,{children:`新的 AI 会话`}),(0,p.jsx)(`small`,{children:`此前群聊消息继续保留`})]})}function Ba(e){let t=e.useChatroom(e=>e),n=e.resolveTarget(String(e.sessionId))?.room?.id,r=e.nativeAttachmentsView,i=n!==void 0&&t.composerRoomId===n?t.reply:void 0;return(0,p.jsxs)(p.Fragment,{children:[i!==void 0&&n!==void 0&&(0,p.jsx)(Va,{reply:i,clear:()=>{e.clearReply(n)}}),(0,p.jsx)(r,{...e})]})}function Va({reply:e,clear:t}){return(0,p.jsxs)(`div`,{className:`dsh-chatroom-reply-preview`,children:[(0,p.jsx)(`button`,{type:`button`,"aria-label":`取消回复`,onClick:t,children:`×`}),(0,p.jsxs)(`span`,{children:[(0,p.jsxs)(`strong`,{children:[`回复 `,e.displayName,`：`]}),(0,p.jsx)(`small`,{children:e.text})]})]})}function Ha(e,t,n=[]){let r=!1,i=!1,a,o,s,c,l,u,d=[],f=[],p=[],m=[];for(let h of e.data.content){if(h.type!==`text`){m.push(h);continue}let e=h.text;if(!i){i=!0;let d=ma(e);e=d===void 0?e:e.slice(d.length);let f=/^([^：]{1,80})：/.exec(e);a=f?.[1],r=t!==void 0&&(d===void 0?a===t.displayName:d.participantId===t.participantId),o=d?.avatarId??g(a??d?.participantId??`participant`),s=d?.participantId;let p=n.find(e=>e.participantId===s);o=p?.avatarId??o,c=p?.avatarUrl,f!==null&&(e=e.slice(f[0].length));let m=ha(e);e=m.text,l=m.reply;let h=_a(e);e=h.text,u=h.forward}let _=va(e);e=_.text,f.push(..._.cards);let v=ga(e);e=v.text,d.push(...v.files),e.trim()!==``&&p.push(e.trim()),e.trim()!==``&&m.push(e===h.text?h:{...h,text:e})}if((d.length>0||m.some(e=>e.type===`image`))&&p.length===1&&Ua(p[0])){p.length=0;for(let e=m.length-1;e>=0;--e){let t=m[e];t?.type===`text`&&Ua(t.text.trim())&&m.splice(e,1)}}return{node:i?{...e,data:{...e.data,content:m}}:e,own:r,avatarId:o??g(t?.participantId??`participant`),...s===void 0?{}:{participantId:s},files:d,cards:f,text:p.join(`
`),...a===void 0?{}:{displayName:a},...c===void 0?t!==void 0&&r&&t.avatarUrl!==void 0?{avatarUrl:t.avatarUrl}:{}:{avatarUrl:c},...l===void 0?{}:{reply:l},...u===void 0?{}:{forward:u}}}function Ua(e){return e===`发送了文件。`||e===`发送了一张图片。`}let Wa=(0,d.memo)(function(e){let t=e.useChatroom(e=>e),n=e.nativeMessageView,r=t.rooms.find(t=>String(e.sessionId)===t.sessionId),i=e.resolveTarget?.(String(e.sessionId))??(r===void 0?void 0:{kind:`room`,room:r});if(i===void 0)return(0,p.jsx)(n,{...e});let a=Ha(e.node,t.identity),o={...a,...t.members.find(e=>e.participantId===a.participantId)?.avatarUrl===void 0?{}:{avatarUrl:t.members.find(e=>e.participantId===a.participantId)?.avatarUrl}},s=(0,p.jsx)(n,{...e,node:o.node}),c=i.room,l=Xa(String(e.sessionId),e.node,o),u=Qa(l),d=Za(l),f=t.identity===void 0?void 0:()=>{e.setReply(c.id,u)},m=t.identity===void 0||i.kind===`thread`?void 0:()=>{e.openThread(c.id,d)},h=$a(e,t,c.id,l,l.text,o.own,f,m),g=eo(t.threadPreviews,l.messageId,`human`);return(0,p.jsxs)(p.Fragment,{children:[c.aiContextStartSeq===e.node.data.seq&&(0,p.jsx)(za,{}),(0,p.jsx)(Ka,{native:s,projection:o,tools:h,threadPreview:g,onReply:f,onThread:m})]})}),Ga=(0,d.memo)(function(e){let t=e.useChatroom(e=>e),n=e.nativeMessageView,r=t.rooms.find(t=>String(e.sessionId)===t.sessionId),i=e.resolveTarget?.(String(e.sessionId))??(r===void 0?void 0:{kind:`room`,room:r});if(i===void 0)return(0,p.jsx)(n,{...e});let a=Ha(e.node,t.identity),o={...a,...t.members.find(e=>e.participantId===a.participantId)?.avatarUrl===void 0?{}:{avatarUrl:t.members.find(e=>e.participantId===a.participantId)?.avatarUrl}},s=(0,p.jsx)(n,{...e,node:o.node}),c=i.room,l=Xa(String(e.sessionId),e.node,o),u=Qa(l),d=Za(l),f=t.identity===void 0?void 0:()=>{e.setReply(c.id,u)},m=t.identity===void 0||i.kind===`thread`?void 0:()=>{e.openThread(c.id,d)},h=$a(e,t,c.id,l,l.text,o.own,f,m),g=eo(t.threadPreviews,l.messageId,`human`);return(0,p.jsxs)(p.Fragment,{children:[c.aiContextStartSeq===e.node.data.seq&&(0,p.jsx)(za,{}),(0,p.jsx)(Ka,{native:s,projection:o,tools:h,threadPreview:g,onReply:f,onThread:m})]})});function Ka({native:e,projection:t,tools:n,threadPreview:r,onReply:i,onThread:a}){let o=Ri();return(0,p.jsxs)(`div`,{className:`dsh-chatroom-participant-message`,"data-dsh-chatroom-own":t.own,"data-dsh-chatroom-selection-mode":n.selecting||void 0,"data-dsh-chatroom-selected":n.selected||void 0,onContextMenu:o.open,children:[(0,p.jsx)(Li,{tools:n}),(0,p.jsx)(A,{avatarId:t.avatarId,avatarUrl:t.avatarUrl,seed:t.participantId??t.displayName??``}),(0,p.jsxs)(`div`,{className:`dsh-chatroom-message-column`,children:[t.displayName!==void 0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-display-name`,children:t.displayName}),!n.recalled&&t.reply!==void 0&&(0,p.jsxs)(`div`,{className:`dsh-chatroom-reply-quote`,children:[(0,p.jsxs)(`strong`,{children:[`回复 `,t.reply.displayName]}),(0,p.jsx)(`span`,{children:t.reply.text})]}),n.recalled?(0,p.jsx)(`div`,{className:`dsh-chatroom-recalled-message`,children:`消息已撤回`}):(0,p.jsxs)(p.Fragment,{children:[t.node.data.content.length>0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-native-message`,children:e}),t.files.map(e=>(0,p.jsx)(qa,{file:e},e.id)),t.cards.map((e,t)=>(0,p.jsx)(N,{card:e},`${e.kind}:${e.title}:${t}`)),t.forward!==void 0&&(0,p.jsx)(Ja,{forward:t.forward})]}),(0,p.jsx)(zi,{...n}),(0,p.jsx)(fa,{preview:r,open:a}),(0,p.jsx)(Ii,{tools:n})]}),(0,p.jsx)(Bi,{tools:n,position:o.position,close:o.close})]})}function qa({file:e}){return(0,p.jsxs)(`a`,{className:`dsh-chatroom-file-card`,href:`${y}/files/${encodeURIComponent(e.id)}`,download:e.name,children:[(0,p.jsx)(`span`,{className:`dsh-chatroom-file-icon`,"aria-hidden":!0,children:`📎`}),(0,p.jsxs)(`span`,{className:`dsh-chatroom-file-copy`,children:[(0,p.jsx)(`strong`,{children:e.name}),(0,p.jsx)(`small`,{children:no(e.bytes)})]}),(0,p.jsx)(`span`,{"aria-hidden":!0,children:`↓`})]})}function Ja({forward:e,depth:t=0}){return(0,p.jsxs)(`details`,{className:`dsh-chatroom-forward-card`,children:[(0,p.jsxs)(`summary`,{children:[(0,p.jsxs)(`strong`,{children:[`合并转发 · `,e.items.length,` 条消息`]}),(0,p.jsxs)(`small`,{children:[`来自 `,e.sourceRoomTitle]})]}),(0,p.jsx)(`div`,{children:e.items.map(n=>(0,p.jsxs)(`article`,{children:[(0,p.jsxs)(`strong`,{children:[n.displayName,(0,p.jsx)(`time`,{children:to(n.createdAt)})]}),n.reply!==void 0&&(0,p.jsxs)(`div`,{className:`dsh-chatroom-forward-reply`,children:[(0,p.jsxs)(`b`,{children:[`回复 `,n.reply.displayName]}),(0,p.jsx)(`span`,{children:n.reply.text})]}),(n.content??[{type:`text`,text:n.text,markdown:n.role===`ai`}]).map((t,r)=>{if(t.type===`text`)return t.markdown?(0,p.jsx)(Ni,{text:t.text},r):(0,p.jsx)(`p`,{className:`dsh-chatroom-forward-text`,children:t.text},r);if(t.type===`file`)return(0,p.jsx)(qa,{file:t.file},`${t.file.id}:${r}`);let i=Ya(e.sourceRoomId,n,t.image);return i===void 0?(0,p.jsx)(`span`,{className:`dsh-chatroom-forward-image-error`,children:`图片来源不可用`},`${t.image.attachmentId}:${r}`):(0,p.jsx)(`img`,{className:`dsh-chatroom-forward-image`,src:i,alt:t.image.name??`转发图片`},`${t.image.attachmentId}:${r}`)}),n.forward!==void 0&&t<1&&(0,p.jsx)(Ja,{forward:n.forward,depth:t+1}),n.reactions!==void 0&&n.reactions.length>0&&(0,p.jsx)(`div`,{className:`dsh-chatroom-forward-reactions`,children:n.reactions.map(e=>(0,p.jsxs)(`span`,{children:[e.emoji,` `,e.count]},e.emoji))})]},n.messageId))})]})}function Ya(e,t,n){if(t.sourceSessionId!==void 0&&t.sourceSeq!==void 0)return`${y}/images/${encodeURIComponent(JSON.stringify({sourceRoomId:e,sourceSessionId:t.sourceSessionId,sourceSeq:t.sourceSeq,image:n}))}`}function Xa(e,t,n){let r=n.files.length===0?``:n.files.map(e=>e.name).join(`、`),i=n.forward===void 0?``:`合并转发 ${n.forward.items.length} 条消息`,a=(n.text.trim()||r||i||`图片消息`).replace(/\s+/gu,` `);return{messageId:`${t.kind}:${t.data.seq}`,sourceSessionId:e,sourceSeq:t.data.seq,role:`human`,displayName:n.displayName??`参与者`,text:[...a].slice(0,120).join(``),createdAt:t.data.time,content:[...n.text.trim()===``?[]:[{type:`text`,text:n.text,markdown:!1}],...n.node.data.content.flatMap(e=>e.type===`image`?[{type:`image`,image:{...e.attachment,attachmentId:String(e.attachment.attachmentId)}}]:[]),...n.files.map(e=>({type:`file`,file:e}))],...n.reply===void 0?{}:{reply:n.reply},...n.forward===void 0?{}:{forward:n.forward}}}function Za(e){if(e.sourceSessionId===void 0||e.sourceSeq===void 0)throw Error(`chatroom branch target lost its source coordinates`);return{messageId:e.messageId,displayName:e.displayName,text:e.text,role:e.role,sourceSessionId:e.sourceSessionId,sourceSeq:e.sourceSeq}}function Qa(e){return{messageId:e.messageId,displayName:e.displayName,text:e.text}}function $a(e,t,n,r,i,a,o,s){return{roomId:n,message:r,reactions:t.reactions,identity:t.identity,selecting:t.selectionRoomId===n,selected:t.selectionRoomId===n&&t.selectedMessages.some(e=>e.messageId===r.messageId),recalled:t.recalls.some(e=>e.messageId===r.messageId),canRecall:a,copyText:i,onReply:o,onBranch:s,toggleReaction:e.toggleReaction,openForward:e.openForward,toggleSelection:e.toggleMessageSelection,recallMessage:e.recallMessage}}function eo(e,t,n){return e.find(e=>e.thread.root.messageId===t&&e.thread.root.role===n)}function to(e){return new Date(e).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})}function no(e){return e<1024?`${e} B`:e<1048576?`${(e/1024).toFixed(1)} KB`:`${(e/1048576).toFixed(1)} MB`}function ro(e,t){let n=e.displayName.trim(),r=n.localeCompare(`AI`,void 0,{sensitivity:`accent`})===0||n.localeCompare(`DeepSeek`,void 0,{sensitivity:`accent`})===0,i=t.some(t=>t.participantId!==e.participantId&&t.displayName.trim().localeCompare(n,void 0,{sensitivity:`accent`})===0);return n===``||r||i?e.username:n}var io=class{openSession;snapshot={branchFrame:void 0,open:!1,phase:`loading`,connection:`offline`,rooms:[],room:void 0,roomEnsureSessionId:void 0,identity:void 0,auth:{enabled:!1,authenticated:!0,providers:[],allowSelfRegistration:!0,bootstrapRequired:!1},online:0,members:[],memberCandidates:[],reactions:[],recalls:[],threadPreviews:[],membersOpen:!1,managementBusy:!1,managementError:void 0,error:void 0,composerRoomId:void 0,pendingFiles:[],reply:void 0,composerBusy:!1,composerError:void 0,sessionControlBusy:!1,sessionControlError:void 0,wecomBusy:!1,wecomError:void 0,wecomAuthorization:void 0,wecomAuthorizationOpen:!1,thread:void 0,threadMessages:[],threadReply:void 0,threadBusy:!1,threadError:void 0,unreadCount:0,toasts:[],notificationsEnabled:uo()===`granted`,selectionRoomId:void 0,selectedMessages:[],forwardOpen:!1,forwardBusy:!1,forwardError:void 0,accountOpen:!1,accountBusy:!1,accountError:void 0,adminOpen:!1,adminBusy:!1,adminOverview:void 0,adminError:void 0,automationBusy:!1,automationOverview:void 0,automationError:void 0,directOpen:!1,directBusy:!1,directPeers:[],directConversations:[],directConversation:void 0,directMessages:[],directError:void 0,newSessionModes:{}};listeners=new Set;eventSource;notificationSource;pendingOpenRoomId;identityPromptedRoomId;stopped=!1;compositionRevision=0;pendingFileSequence=0;originalTitle;activeNativeSession;roomEnsure;pendingAutoTriggerWrites=new Map;constructor(e=()=>!1,t){this.openSession=e,t!==void 0&&(this.snapshot={...this.snapshot,branchFrame:t})}getSnapshot=()=>this.snapshot;roomForSession(e){let t=this.snapshot.rooms.find(t=>t.sessionId===e);if(t!==void 0)return t;let n=this.snapshot.branchFrame;return n?.sessionId===e?this.snapshot.rooms.find(e=>e.id===n.roomId):void 0}agentTargetForSession(e){let t=this.roomForSession(e);if(t===void 0)return;let n=this.snapshot.branchFrame;return n?.sessionId===e?{kind:`thread`,room:t,threadId:n.threadId}:{kind:`room`,room:t}}registerNewSession=e=>{this.set({newSessionModes:{...this.snapshot.newSessionModes,[e]:`group`}})};newSessionMode=e=>this.snapshot.newSessionModes[e];chooseNewSessionMode=async(e,t)=>this.snapshot.newSessionModes[e]!==void 0&&(this.set({newSessionModes:{...this.snapshot.newSessionModes,[e]:t},error:void 0}),!0);ensurePromptTarget=async e=>{let t=this.agentTargetForSession(e);return t!==void 0||this.snapshot.newSessionModes[e]!==`group`||this.activeNativeSession?.id!==e?t:(await this.ensureActiveSessionRoom(),this.agentTargetForSession(e))};newGroupInvitees=e=>{let t=this.snapshot.directPeers.filter(e=>e.participantId!==this.snapshot.identity?.participantId);return t.filter(n=>{let r=ro(n,t);return ya(e,r)||r!==n.username&&ya(e,n.username)}).map(e=>e.participantId)};switchBranchFrame(e){let t=this.snapshot.branchFrame;(t?.threadId!==e.threadId||t.sessionId!==e.sessionId||t.roomId!==e.roomId||t.parentSessionId!==e.parentSessionId)&&(this.compositionRevision+=1,this.set({branchFrame:e,composerRoomId:void 0,pendingFiles:[],reply:void 0,composerBusy:!1,composerError:void 0}))}subscribe=e=>(this.listeners.add(e),()=>{this.listeners.delete(e)});async start(){this.stopped=!1,typeof document<`u`&&(this.originalTitle=document.title),await this.loadSession()}stop(){this.stopped=!0,this.closeEvents(),this.closeNotifications(),this.updateActiveDocumentRoom(!1),this.updateDocumentTitle(0),this.listeners.clear()}openRoom=()=>{this.set({open:!0,error:void 0})};login=async(e,t)=>{this.set({phase:`loading`,error:void 0});try{let n=await Q(`${y}/auth/login`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({username:e,password:t})});return this.acceptSession(n),!0}catch(e){return this.set({phase:`auth-required`,open:!0,error:$(e)}),!1}};register=async e=>{this.set({phase:`loading`,error:void 0});try{let t=await Q(`${y}/auth/register`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e)});return this.acceptSession(t),!0}catch(e){return this.set({phase:`auth-required`,open:!0,error:$(e)}),!1}};logout=async()=>{try{await vo(`${y}/auth/logout`,{method:`POST`})}finally{this.closeEvents(),this.closeNotifications();let e=this.snapshot.auth;this.set({phase:`auth-required`,open:!0,rooms:[],room:void 0,roomEnsureSessionId:void 0,identity:void 0,auth:{enabled:e.enabled,authenticated:!1,providers:e.providers,allowSelfRegistration:e.allowSelfRegistration,bootstrapRequired:e.bootstrapRequired},accountOpen:!1,accountError:void 0,adminOpen:!1,adminOverview:void 0,directOpen:!1,directConversation:void 0,directMessages:[]})}};openAccount=()=>{!this.snapshot.auth.enabled||!this.snapshot.auth.authenticated||this.set({accountOpen:!0,accountBusy:!1,accountError:void 0,adminOpen:!1,directOpen:!1})};closeAccount=()=>{this.set({accountOpen:!1,accountBusy:!1,accountError:void 0})};changePassword=async(e,t)=>{this.set({accountBusy:!0,accountError:void 0});try{let n=await Q(`${y}/account`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({action:`change-password`,currentPassword:e,newPassword:t})});return this.set({accountOpen:!1,accountBusy:!1,accountError:void 0,auth:{...this.snapshot.auth,account:n.account},identity:n.account}),!0}catch(e){return this.set({accountBusy:!1,accountError:$(e)}),!1}};openAdmin=async()=>{if(this.snapshot.auth.account?.role===`super-admin`){this.set({adminOpen:!0,adminBusy:!0,adminError:void 0,directOpen:!1,accountOpen:!1});try{let e=await Q(`${y}/admin`);this.set({adminBusy:!1,adminOverview:e})}catch(e){this.set({adminBusy:!1,adminError:$(e)})}}};closeAdmin=()=>{this.set({adminOpen:!1,adminError:void 0})};loadAutomation=async()=>{if(!this.snapshot.automationBusy){this.set({automationBusy:!0,automationError:void 0});try{let e=await Q(`${y}/automation`);this.set({automationBusy:!1,automationOverview:e})}catch(e){this.set({automationBusy:!1,automationError:$(e)})}}};saveAutomation=async(e,t,n,r,i,a)=>{if(this.snapshot.automationBusy)return!1;this.set({automationBusy:!0,automationError:void 0});try{let o=await Q(`${y}/automation`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({provider:e,model:t,meetingSummaryProvider:n,meetingSummaryModel:r,mainAgentPrompt:i,controllerPrompt:a})});return this.set({automationBusy:!1,automationOverview:o}),!0}catch(e){return this.set({automationBusy:!1,automationError:$(e)}),!1}};adminCreateUser=async e=>this.adminMutation({action:`create-user`,...e});adminUpdateUser=async(e,t)=>this.adminMutation({action:`update-user`,userId:e,...t});adminSetSelfRegistration=async e=>this.adminMutation({action:`settings`,allowSelfRegistration:e});adminSetAutoRedirectProvider=async e=>this.adminMutation({action:`settings`,autoRedirectProviderId:e??null});adminSaveProvider=async e=>this.adminMutation({action:`save-provider`,...e});adminDeleteProvider=async e=>this.adminMutation({action:`delete-provider`,providerId:e});openDirect=async e=>{this.set({directOpen:!0,directBusy:!0,directError:void 0,adminOpen:!1,accountOpen:!1});try{let t=e===void 0?await Q(`${y}/direct`):await Q(`${y}/direct`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({peerId:e})});this.set({directBusy:!1,directPeers:t.peers,directConversations:t.conversations,directConversation:t.conversation,directMessages:t.messages??[]})}catch(e){this.set({directBusy:!1,directError:$(e)})}};loadDirectDirectory=async()=>{if(this.snapshot.phase!==`ready`||this.snapshot.identity===void 0)return!1;try{let e=await Q(`${y}/direct`);return this.set({directPeers:e.peers,directConversations:e.conversations,directError:void 0}),!0}catch(e){return this.set({directError:$(e)}),!1}};closeDirect=()=>{this.set({directOpen:!1,directError:void 0})};sendDirect=async(e,t=[])=>{let n=this.snapshot.directConversation;if(n===void 0||e.trim()===``&&t.length===0||this.snapshot.directBusy)return!1;this.set({directBusy:!0,directError:void 0});try{let r=await go(t),i=[...e.trim()===``?[]:[{type:`text`,text:e}],...r],a=await Q(`${y}/direct/messages`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({conversationId:n.id,content:i})}),o=this.snapshot.directMessages.some(e=>e.id===a.message.id)?this.snapshot.directMessages:[...this.snapshot.directMessages,a.message];return this.set({directBusy:!1,directConversation:a.conversation,directMessages:o,directConversations:lo(this.snapshot.directConversations,a.conversation)}),!0}catch(e){return this.set({directBusy:!1,directError:$(e)}),!1}};openMembers=()=>{if(this.snapshot.room===void 0)return;this.set({membersOpen:!0,memberCandidates:[],thread:void 0,threadMessages:[],threadReply:void 0,threadError:void 0});let e=this.snapshot.members.find(e=>e.participantId===this.snapshot.identity?.participantId)?.role;(e===`owner`||e===`admin`||this.snapshot.auth.account?.role===`super-admin`)&&this.loadRoomMemberCandidates()};loadRoomMemberCandidates=async()=>{let e=this.snapshot.room;if(!(e===void 0||this.snapshot.managementBusy)){this.set({managementBusy:!0,managementError:void 0});try{let t=await Q(`${y}/rooms/manage?roomId=${encodeURIComponent(e.id)}`);this.snapshot.room?.id===e.id&&this.applyRoomManagement(t)}catch(e){this.set({managementBusy:!1,managementError:$(e)})}}};completeGroupSetup=async(e,t)=>{let n=this.snapshot.room;return n===void 0||e.trim()===``||t.length===0||e.trim()!==n.title&&!await this.renameRoom(e)?!1:await this.addRoomMembers(t)};closeMembers=()=>{this.set({membersOpen:!1,memberCandidates:[],managementError:void 0})};addRoomMembers=async e=>{let t=this.snapshot.room;if(t===void 0||e.length===0||this.snapshot.managementBusy)return!1;this.set({managementBusy:!0,managementError:void 0});try{let n=await Q(`${y}/rooms/manage`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:t.id,action:`add-members`,participantIds:e})});return this.applyRoomManagement(n),!0}catch(e){return this.set({managementBusy:!1,managementError:$(e)}),!1}};setRoomPinned=async(e,t)=>{try{let n=await Q(`${y}/rooms/manage`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:e,action:`set-pinned`,pinned:t})});return this.applyRoomManagement(n),!0}catch(e){return this.set({managementError:$(e)}),!1}};setRoomAutoTrigger=e=>{let t=this.snapshot.room;if(t===void 0||this.snapshot.managementBusy)return Promise.resolve(!1);this.set({managementBusy:!0,managementError:void 0});let n=(async()=>{try{let n=await Q(`${y}/rooms/manage`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:t.id,action:`set-auto-trigger`,enabled:e})});return this.applyRoomManagement(n),!0}catch(e){return this.set({managementBusy:!1,managementError:$(e)}),!1}})();return this.pendingAutoTriggerWrites.set(t.id,n),n.then(()=>{this.pendingAutoTriggerWrites.get(t.id)===n&&this.pendingAutoTriggerWrites.delete(t.id)}),n};async waitForRoomAutoTrigger(e){let t=this.pendingAutoTriggerWrites.get(e);if(t!==void 0&&!await t)throw Error(this.snapshot.managementError??`自动回复设置保存失败。`)}recallMessage=async(e,t)=>{try{let n=await Q(`${y}/messages/recall`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:e,messageId:t})});return this.replaceRecall(n),!0}catch(e){return this.set({composerError:$(e)}),!1}};renameRoom=async e=>{let t=this.snapshot.room;if(t===void 0||this.snapshot.managementBusy)return!1;this.set({managementBusy:!0,managementError:void 0});try{let n=await Q(`${y}/rooms/manage`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:t.id,action:`rename`,title:e})});return this.applyRoomManagement(n),!0}catch(e){return this.set({managementBusy:!1,managementError:$(e)}),!1}};setMemberRole=async(e,t)=>{let n=this.snapshot.room;if(n===void 0||this.snapshot.managementBusy)return!1;this.set({managementBusy:!0,managementError:void 0});try{let r=await Q(`${y}/rooms/manage`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:n.id,action:`set-role`,participantId:e,role:t})});return this.applyRoomManagement(r),!0}catch(e){return this.set({managementBusy:!1,managementError:$(e)}),!1}};closeRoom=()=>{this.set(this.snapshot.phase===`identity-required`&&this.snapshot.identity!==void 0?{open:!1,phase:`ready`,error:void 0}:{open:!1})};resumeOpen=()=>{let e=this.pendingOpenRoomId;if(e===void 0)return;let t=this.snapshot.rooms.find(t=>t.id===e);t===void 0||!this.openSession(t.sessionId)||(this.pendingOpenRoomId=void 0,this.set({open:!1,error:void 0}))};activateSession=(e,t=`新会话`,n=!0)=>{this.activeNativeSession=e===void 0?void 0:{id:e,title:t,shareable:n};let r=e===void 0?void 0:this.roomForSession(e);if(r===void 0){this.closeEvents(),this.identityPromptedRoomId=void 0,this.updateActiveDocumentRoom(!1),this.set({room:void 0,roomEnsureSessionId:this.roomEnsure?.sessionId===e?e:void 0,connection:`offline`,online:0,members:[],memberCandidates:[],reactions:[],recalls:[],threadPreviews:[],membersOpen:!1,thread:void 0,threadMessages:[],threadReply:void 0,selectionRoomId:void 0,selectedMessages:[],forwardOpen:!1,directOpen:!1,directError:void 0});return}this.updateActiveDocumentRoom(!0),this.snapshot.identity===void 0&&this.identityPromptedRoomId!==r.id&&(this.identityPromptedRoomId=r.id,this.set({open:!0})),(this.snapshot.room?.id!==r.id||this.eventSource===void 0)&&(this.set({room:r,roomEnsureSessionId:void 0,connection:`connecting`,online:0,members:[],memberCandidates:[],reactions:[],recalls:[],threadPreviews:[],membersOpen:!1,thread:void 0,threadMessages:[],threadReply:void 0,selectionRoomId:void 0,selectedMessages:[],forwardOpen:!1,directOpen:!1,directError:void 0}),this.clearUnread(),this.openEvents(r))};join=async(e,t)=>{let n=this.snapshot.room,r=this.snapshot.connection,i=this.snapshot.online;this.set({phase:`loading`,error:void 0});try{let a=await Q(`${y}/session`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({displayName:e,avatarId:t})});if(a.identity===null)throw Error(`服务端没有返回聊天室身份。`);let o=n===void 0?void 0:a.rooms.find(e=>e.id===n.id);this.set({phase:`ready`,open:!1,rooms:a.rooms,room:o,identity:a.identity,connection:o===void 0?`offline`:r,online:o===void 0?0:i,error:void 0}),this.openNotifications(),this.ensureActiveSessionRoom()}catch(e){this.set({phase:`identity-required`,error:$(e)})}};addFiles=(e,t)=>{if(t.length===0)return;let n=this.compositionFor(e),r=t.map(e=>({id:`file-${++this.pendingFileSequence}`,file:e}));this.compositionRevision+=1,this.set({composerRoomId:e,pendingFiles:[...n.files,...r],reply:n.reply,composerError:void 0})};removeFile=(e,t)=>{if(this.snapshot.composerRoomId!==e)return;let n=this.snapshot.pendingFiles.filter(e=>e.id!==t);n.length!==this.snapshot.pendingFiles.length&&(this.compositionRevision+=1,this.set({pendingFiles:n,composerError:void 0}))};setReply=(e,t)=>{let n=this.compositionFor(e);this.compositionRevision+=1,this.set({composerRoomId:e,pendingFiles:n.files,reply:t,composerError:void 0})};clearReply=e=>{this.snapshot.composerRoomId===e&&this.snapshot.reply!==void 0&&(this.compositionRevision+=1,this.set({reply:void 0,composerError:void 0}))};toggleReaction=async(e,t,n)=>{try{let r=await Q(`${y}/reactions/toggle`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:e,messageId:t,emoji:n})});this.replaceReaction(r)}catch(e){this.set({composerError:$(e)})}};toggleMessageSelection=(e,t)=>{let n=this.snapshot.selectionRoomId===e?this.snapshot.selectedMessages:[],r=n.some(e=>e.messageId===t.messageId)?n.filter(e=>e.messageId!==t.messageId):[...n,t];this.set({selectionRoomId:e,selectedMessages:r,forwardOpen:!1,forwardError:void 0})};openForward=(e,t)=>{let n=this.snapshot.selectionRoomId===e?this.snapshot.selectedMessages:[],r=t===void 0||n.some(e=>e.messageId===t.messageId)?n:[t];r.length!==0&&this.set({selectionRoomId:e,selectedMessages:r,forwardOpen:!0,forwardError:void 0})};clearMessageSelection=()=>{this.set({selectionRoomId:void 0,selectedMessages:[],forwardOpen:!1,forwardBusy:!1,forwardError:void 0})};closeForward=()=>{this.set({forwardOpen:!1,forwardError:void 0})};forwardSelected=async e=>{let t=this.snapshot.selectionRoomId;if(t===void 0||this.snapshot.selectedMessages.length===0||this.snapshot.forwardBusy)return!1;this.set({forwardBusy:!0,forwardError:void 0});try{return await Q(`${y}/forward`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({sourceRoomId:t,targetRoomId:e,messages:this.snapshot.selectedMessages})}),this.clearMessageSelection(),!0}catch(e){return this.set({forwardBusy:!1,forwardError:$(e)}),!1}};composition=e=>{let t=this.compositionFor(e);return{roomId:e,revision:this.compositionRevision,files:t.files,reply:t.reply}};completeComposition=e=>{if(this.snapshot.composerRoomId!==e.roomId||this.compositionRevision!==e.revision){this.snapshot.composerBusy&&this.set({composerBusy:!1});return}this.compositionRevision+=1,this.set({composerRoomId:void 0,pendingFiles:[],reply:void 0,composerBusy:!1,composerError:void 0})};sendFiles=async e=>{let t=this.composition(e);if(!(t.files.length===0||this.snapshot.composerBusy)){this.set({composerBusy:!0,composerError:void 0});try{let n=await ho(t.files),r=this.snapshot.branchFrame;r?.roomId===e?await mo({threadId:r.threadId,mode:`queue`,content:n,...t.reply===void 0?{}:{reply:t.reply}}):await po({roomId:e,mode:`queue`,content:n,...t.reply===void 0?{}:{reply:t.reply}}),this.completeComposition(t)}catch(e){this.set({composerBusy:!1,composerError:$(e)})}}};selectRoom=async e=>{this.set({error:void 0});try{let t=await Q(`${y}/rooms/select`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:e})});this.selectAndOpen(t.room)}catch(e){this.set({phase:`ready`,error:$(e)})}};createRoom=async e=>{this.set({error:void 0});try{let t=await Q(`${y}/rooms`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({title:e})});this.selectAndOpen(t.room)}catch(e){this.set({phase:`ready`,error:$(e)})}};stopRoomSession=async e=>{if(this.snapshot.sessionControlBusy)return!1;this.set({sessionControlBusy:!0,sessionControlError:void 0});try{let t=await Q(`${y}/rooms/session`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:e,action:`stop`})});return this.applyRoomManagement(t),this.set({sessionControlBusy:!1}),!0}catch(e){return this.set({sessionControlBusy:!1,sessionControlError:$(e)}),!1}};newRoomSession=async e=>{if(this.snapshot.sessionControlBusy)return!1;this.set({sessionControlBusy:!0,sessionControlError:void 0});try{let t=await Q(`${y}/rooms/session`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:e,action:`new`})});return this.applyRoomManagement(t),this.set({sessionControlBusy:!1}),!0}catch(e){return this.set({sessionControlBusy:!1,sessionControlError:$(e)}),!1}};quickMeeting=async e=>this.createQuickMeeting({roomId:e});quickDirectMeeting=async e=>this.createQuickMeeting({directConversationId:e});loadWecomAuthorization=async()=>{try{let e=await Q(`${y}/wecom/auth`);return this.set({wecomAuthorization:e,wecomError:e.error}),e}catch(e){this.set({wecomError:$(e)});return}};startWecomAuthorization=async()=>{if(this.snapshot.wecomBusy)return!1;this.set({wecomBusy:!0,wecomError:void 0});try{let e=await Q(`${y}/wecom/auth`,{method:`POST`});return this.set({wecomBusy:!1,wecomAuthorization:e,wecomAuthorizationOpen:!1}),!0}catch(e){return this.set({wecomBusy:!1,wecomError:$(e)}),!1}};disconnectWecomAuthorization=async()=>{if(this.snapshot.wecomBusy)return!1;this.set({wecomBusy:!0,wecomError:void 0});try{let e=await Q(`${y}/wecom/auth`,{method:`DELETE`});return this.set({wecomBusy:!1,wecomAuthorization:e,wecomAuthorizationOpen:!1}),!0}catch(e){return this.set({wecomBusy:!1,wecomError:$(e)}),!1}};rebindWecomAuthorization=async()=>await this.disconnectWecomAuthorization()?await this.startWecomAuthorization():!1;async createQuickMeeting(e){if(this.snapshot.wecomBusy)return!1;this.set({wecomBusy:!0,wecomError:void 0});let t=await this.loadWecomAuthorization();return t?.status===`authorized`?this.publishQuickMeeting(e):(this.set({wecomBusy:!1,wecomAuthorizationOpen:!1,wecomError:t?.enabled===!0?`共享企业微信账号尚未连接，请由管理员前往“设置 → 群聊与账号”完成绑定。`:t?.error??`当前服务未启用企业微信 CLI。`}),!1)}async publishQuickMeeting(e){this.set({wecomBusy:!0,wecomError:void 0});try{return await Q(`${y}/wecom/quick-meeting`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e)}),this.set({wecomBusy:!1}),!0}catch(e){return this.set({wecomBusy:!1,wecomError:$(e)}),!1}}openThread=async(e,t)=>{this.set({membersOpen:!1,threadReply:void 0,threadBusy:!0,threadError:void 0});try{let n=await Q(`${y}/threads/open`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:e,root:t})});this.set({thread:n.thread,threadMessages:n.messages,...n.messages.length===0?{}:{threadPreviews:ao(this.snapshot.threadPreviews,{thread:n.thread,totalMessages:n.messages.length,recentMessages:n.messages.slice(-3)})},threadBusy:!1,threadError:void 0}),this.clearUnread()}catch(e){this.set({threadBusy:!1,threadError:$(e)})}};closeThread=()=>{this.set({thread:void 0,threadMessages:[],threadReply:void 0,threadBusy:!1,threadError:void 0})};setThreadReply=e=>{this.snapshot.thread!==void 0&&this.set({threadReply:e,threadError:void 0})};clearThreadReply=()=>{this.snapshot.threadReply!==void 0&&this.set({threadReply:void 0,threadError:void 0})};sendThreadMessage=async e=>{let t=this.snapshot.thread,n=this.snapshot.threadReply;if(t===void 0||this.snapshot.threadBusy||e.trim()===``)return!1;this.set({threadBusy:!0,threadError:void 0});try{return await Q(`${y}/threads/prompt`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({threadId:t.id,mode:`queue`,content:[{type:`text`,text:e}],...n===void 0?{}:{reply:n}})}),this.set({threadReply:void 0,threadBusy:!1,threadError:void 0}),!0}catch(e){return this.set({threadBusy:!1,threadError:$(e)}),!1}};enableSystemNotifications=async()=>{if(typeof Notification>`u`)return;let e=await Notification.requestPermission();this.set({notificationsEnabled:e===`granted`})};dismissToast=e=>{this.set({toasts:this.snapshot.toasts.filter(t=>t.id!==e)})};resetIdentity=async()=>{this.set({open:!0,phase:`identity-required`,error:void 0})};retry=async()=>{this.set({phase:`loading`,error:void 0}),await this.loadSession()};async adminMutation(e){if(this.snapshot.adminBusy)return!1;this.set({adminBusy:!0,adminError:void 0});try{let t=await Q(`${y}/admin`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e)}),n=`overview`in t?t.overview:t;return this.set({adminBusy:!1,adminOverview:n}),!0}catch(e){return this.set({adminBusy:!1,adminError:$(e)}),!1}}acceptSession(e){if(e.identity===null)throw Error(`服务端没有返回登录账号。`);this.set({phase:`ready`,open:!1,connection:`offline`,rooms:e.rooms,identity:e.identity,auth:fo(e),error:void 0}),this.openNotifications(),this.ensureActiveSessionRoom()}async ensureActiveSessionRoom(){let e=this.activeNativeSession;if(e===void 0||!e.shareable||this.snapshot.phase!==`ready`||this.snapshot.identity===void 0||this.snapshot.newSessionModes[e.id]!==`group`||this.roomForSession(e.id)!==void 0)return;if(this.roomEnsure?.sessionId===e.id)return await this.roomEnsure.promise;let t=(async()=>{this.set({roomEnsureSessionId:e.id,error:void 0});try{let t=await Q(`${y}/rooms/ensure`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({sessionId:e.id,title:e.title})}),n=this.snapshot.rooms.some(e=>e.id===t.room.id)?this.snapshot.rooms.map(e=>e.id===t.room.id?t.room:e):[...this.snapshot.rooms,t.room];this.set({rooms:n,error:void 0}),this.activeNativeSession?.id===e.id&&this.activateSession(e.id,e.title,e.shareable)}catch(t){this.activeNativeSession?.id===e.id&&this.set({roomEnsureSessionId:void 0,error:$(t)})}})();this.roomEnsure={sessionId:e.id,promise:t};try{await t}finally{this.roomEnsure?.promise===t&&(this.roomEnsure=void 0)}}selectAndOpen(e){let t=this.snapshot.rooms.some(t=>t.id===e.id)?this.snapshot.rooms.map(t=>t.id===e.id?e:t):[...this.snapshot.rooms,e];this.pendingOpenRoomId=e.id,this.set({phase:`ready`,rooms:t,room:e,connection:`connecting`,online:0,members:[],memberCandidates:[],reactions:[],recalls:[],threadPreviews:[],thread:void 0,threadMessages:[],threadReply:void 0,selectionRoomId:void 0,selectedMessages:[],forwardOpen:!1,error:void 0}),this.openEvents(e),this.resumeOpen()}compositionFor(e){return this.snapshot.composerRoomId===e?{files:this.snapshot.pendingFiles,reply:this.snapshot.reply}:{files:[],reply:void 0}}async loadSession(){try{let e=await Q(`${y}/session`);if(this.stopped)return;let t=fo(e);if(t.enabled&&!t.authenticated){this.closeEvents(),this.closeNotifications(),this.set({phase:`auth-required`,open:!0,connection:`offline`,rooms:[],room:void 0,roomEnsureSessionId:void 0,identity:void 0,auth:t,online:0,error:void 0});return}if(e.identity===null){this.closeEvents(),this.set({phase:`identity-required`,open:!0,connection:`offline`,rooms:e.rooms,room:void 0,roomEnsureSessionId:void 0,identity:void 0,auth:t,online:0,error:void 0});return}this.set({phase:`ready`,connection:`offline`,rooms:e.rooms,identity:e.identity,auth:t,error:void 0}),this.openNotifications(),this.ensureActiveSessionRoom()}catch(e){this.stopped||this.set({phase:`error`,connection:`offline`,error:$(e)})}}openEvents(e){if(this.closeEvents(),this.stopped||this.snapshot.identity===void 0)return;this.set({connection:`connecting`});let t=new EventSource(`${y}/events?roomId=${encodeURIComponent(e.id)}`);this.eventSource=t,t.onopen=()=>{this.eventSource===t&&this.set({connection:`online`,error:void 0})},t.onmessage=e=>{if(this.eventSource===t)try{this.receive(JSON.parse(e.data))}catch{this.set({error:`收到无法识别的聊天室同步消息。`})}},t.onerror=()=>{this.eventSource===t&&this.set({connection:`connecting`})}}openNotifications(){if(this.stopped||this.snapshot.identity===void 0||this.notificationSource!==void 0)return;let e=new EventSource(`${y}/notifications`);this.notificationSource=e,e.onmessage=t=>{if(this.notificationSource===e)try{let e=JSON.parse(t.data);e.type===`notification`?this.receiveNotification(e.notification):e.type===`direct-message`&&this.receiveDirectMessage(e)}catch{this.set({error:`收到无法识别的消息提醒。`})}}}closeEvents(){this.eventSource?.close(),this.eventSource=void 0}closeNotifications(){this.notificationSource?.close(),this.notificationSource=void 0}receive(e){switch(e.type){case`snapshot`:{let t=co(e.room,e.members),n=oo(this.snapshot.rooms,t);this.set({phase:`ready`,connection:`online`,rooms:n,room:t,identity:e.identity,online:e.online,members:e.members,reactions:e.reactions,recalls:e.recalls??[],threadPreviews:e.threadPreviews,error:void 0});return}case`presence`:{let t=this.snapshot.room===void 0?void 0:co(this.snapshot.room,e.members);this.set({online:e.online,members:e.members,...t===void 0?{}:{room:t,rooms:oo(this.snapshot.rooms,t)}});return}case`thread-message`:this.set({threadPreviews:ao(this.snapshot.threadPreviews,e.preview),...this.snapshot.thread?.id!==e.message.threadId||this.snapshot.threadMessages.some(t=>t.id===e.message.id)?{}:{threadMessages:[...this.snapshot.threadMessages,e.message]}});return;case`reaction`:this.replaceReaction(e.reaction);return;case`message-recalled`:this.replaceRecall(e.recall);return;case`room-updated`:this.applyRoomManagement({room:e.room,members:e.members});return}}replaceReaction(e){if(this.snapshot.room?.id!==e.roomId)return;let t=this.snapshot.reactions.filter(t=>t.messageId!==e.messageId||t.emoji!==e.emoji);this.set({reactions:e.participantIds.length===0?t:[...t,e]})}replaceRecall(e){if(this.snapshot.room?.id!==e.roomId)return;let t=this.snapshot.recalls.filter(t=>t.messageId!==e.messageId);this.set({recalls:[...t,e],reactions:this.snapshot.reactions.filter(t=>t.messageId!==e.messageId),selectedMessages:this.snapshot.selectedMessages.filter(t=>t.messageId!==e.messageId)})}applyRoomManagement(e){let t=this.snapshot.rooms.find(t=>t.id===e.room.id),n=t?.pinned!==void 0&&e.room.pinned===void 0?{...e.room,pinned:t.pinned}:e.room,r=so(this.snapshot.rooms.map(e=>e.id===n.id?n:e)),i=new Set(e.members.map(e=>e.participantId));this.set({rooms:r,...this.snapshot.room?.id===n.id?{room:n,members:e.members}:{},memberCandidates:`candidates`in e?e.candidates:this.snapshot.memberCandidates.filter(e=>!i.has(e.participantId)),managementBusy:!1,managementError:void 0})}receiveNotification(e){if(e.participantId===this.snapshot.identity?.participantId)return;let t=[...this.snapshot.toasts.filter(t=>t.id!==e.id),e].slice(-4),n=typeof document<`u`&&document.visibilityState===`visible`,r=this.snapshot.room?.id===e.roomId&&(e.threadId===void 0||e.threadId===this.snapshot.thread?.id),i=n&&r?this.snapshot.unreadCount:this.snapshot.unreadCount+1,a=so(this.snapshot.rooms.map(t=>t.id===e.roomId?{...t,updatedAt:Math.max(t.updatedAt??0,e.createdAt)}:t));if(this.set({toasts:t,unreadCount:i,rooms:a}),this.snapshot.notificationsEnabled&&typeof Notification<`u`&&!n)try{new Notification(`${e.displayName} · ${e.roomTitle}`,{body:e.text})}catch(e){this.set({notificationsEnabled:!1,error:`系统消息提醒失败：${$(e)}`})}globalThis.setTimeout(()=>{this.dismissToast(e.id)},6e3)}receiveDirectMessage(e){let t=lo(this.snapshot.directConversations,e.conversation),n=this.snapshot.directConversation?.id===e.conversation.id,r=!n||this.snapshot.directMessages.some(t=>t.id===e.message.id)?this.snapshot.directMessages:[...this.snapshot.directMessages,e.message],i=e.message.senderId===this.snapshot.identity?.participantId,a=typeof document<`u`&&document.visibilityState===`visible`,o=this.snapshot.directOpen&&n;if(this.set({directConversations:t,...n?{directConversation:e.conversation,directMessages:r}:{},unreadCount:i||a&&o?this.snapshot.unreadCount:this.snapshot.unreadCount+1}),!i){let t={id:e.message.id,roomId:`direct:${e.conversation.id}`,roomTitle:`私聊`,participantId:e.message.senderId,displayName:e.conversation.peer.displayName,role:`human`,text:e.message.text,createdAt:e.message.createdAt},n=[...this.snapshot.toasts.filter(e=>e.id!==t.id),t].slice(-4);if(this.set({toasts:n}),this.snapshot.notificationsEnabled&&typeof Notification<`u`&&!a)try{new Notification(`${e.conversation.peer.displayName} · 私聊`,{body:e.message.text})}catch(e){this.set({notificationsEnabled:!1,error:`系统消息提醒失败：${$(e)}`})}globalThis.setTimeout(()=>{this.dismissToast(t.id)},6e3)}}clearUnread(){this.snapshot.unreadCount!==0&&this.set({unreadCount:0})}updateDocumentTitle(e){typeof document>`u`||this.originalTitle===void 0||(document.title=e===0?this.originalTitle:`(${e}) ${this.originalTitle}`)}updateActiveDocumentRoom(e){typeof document>`u`||document.documentElement.toggleAttribute(`data-dsh-chatroom-active`,e)}set(e){if(!this.stopped){this.snapshot={...this.snapshot,...e},e.unreadCount!==void 0&&this.updateDocumentTitle(this.snapshot.unreadCount);for(let e of this.listeners)e()}}};function ao(e,t){return[...e.filter(e=>e.thread.id!==t.thread.id),t]}function oo(e,t){return so(e.some(e=>e.id===t.id)?e.map(e=>e.id===t.id?t:e):[...e,t])}function so(e){return[...e].sort((e,t)=>Number(t.pinned===!0)-Number(e.pinned===!0)||(t.updatedAt??0)-(e.updatedAt??0)||e.id.localeCompare(t.id))}function co(e,t){if(e.memberAvatars!==void 0)return e;let n=t.slice(0,9);return{...e,memberAvatarIds:n.map(e=>e.avatarId),memberAvatars:n.map(e=>({participantId:e.participantId,avatarId:e.avatarId,...e.avatarUrl===void 0?{}:{avatarUrl:e.avatarUrl}}))}}function lo(e,t){return[t,...e.filter(e=>e.id!==t.id)].sort((e,t)=>t.updatedAt-e.updatedAt)}function uo(){return typeof Notification>`u`?`unsupported`:Notification.permission}function fo(e){return e.auth??{enabled:!1,authenticated:!0,providers:[],allowSelfRegistration:!0,bootstrapRequired:!1}}async function po(e,t){return await Q(`${y}/prompt`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e),...t===void 0?{}:{signal:t}})}async function mo(e,t){return await Q(`${y}/threads/prompt`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e),...t===void 0?{}:{signal:t}})}async function ho(e){return await go(e.map(({file:e})=>e))}async function go(e){return await Promise.all(e.map(async e=>{let t=bo(new Uint8Array(await e.arrayBuffer()));return e.type===`image/png`||e.type===`image/jpeg`||e.type===`image/webp`||e.type===`image/gif`?{type:`image`,name:e.name,mediaType:e.type,data:t}:{type:`file`,name:e.name,mediaType:e.type===``?`application/octet-stream`:e.type,data:t}}))}var _o=class extends Error{status;constructor(e,t){super(t),this.status=e}};async function Q(e,t){let n=await fetch(e,{...t,credentials:`same-origin`});if(!n.ok)throw await yo(n);return await n.json()}async function vo(e,t){let n=await fetch(e,{...t,credentials:`same-origin`});if(!n.ok)throw await yo(n)}async function yo(e){let t=`聊天室请求失败（HTTP ${e.status}）。`;try{let n=await e.json();typeof n.error==`string`&&n.error!==``&&(t=n.error)}catch{}return new _o(e.status,t)}function $(e){return e instanceof Error?e.message:String(e)}function bo(e){let t=``;for(let n=0;n<e.length;n+=32768)t+=String.fromCharCode(...e.subarray(n,n+32768));return btoa(t)}function xo(e,t){let n=e.sessions.prompt,r=async(e,r)=>{let i=String(e.sessionId);if(ba(e.content))return await n(e,r);let a=typeof t.agentTargetForSession==`function`?t.agentTargetForSession(String(e.sessionId)):(()=>{let n=t.roomForSession(String(e.sessionId));return n===void 0?void 0:{kind:`room`,room:n}})(),o=a===void 0&&typeof t.newSessionMode==`function`&&t.newSessionMode(i)===`group`;if(a===void 0&&typeof t.ensurePromptTarget==`function`&&(a=await t.ensurePromptTarget(i)),a===void 0)return await n(e,r);if(t.getSnapshot().identity===void 0)throw Error(`请先选择聊天室身份。`);if(o){let n=t.newGroupInvitees(e.content);if(n.length>0&&!await t.addRoomMembers(n))throw Error(t.getSnapshot().managementError??`无法把提及的成员加入新群聊。`)}typeof t.waitForRoomAutoTrigger==`function`&&await t.waitForRoomAutoTrigger(a.room.id);let s=t.composition(a.room.id),c=await ho(s.files),l=[...e.content,...c];return a.kind===`thread`?await mo({threadId:a.threadId,mode:e.mode,content:l,...s.reply===void 0?{}:{reply:s.reply}},r):await po({roomId:a.room.id,mode:e.mode,content:l,...s.reply===void 0?{}:{reply:s.reply}},r),t.completeComposition(s),{rpcId:`chatroom-human-first`,result:{ok:!0,value:{accepted:!0}}}};return e.sessions.prompt=r,()=>{e.sessions.prompt===r&&(e.sessions.prompt=n)}}let So=`button[id^="dsh-slash-option-群聊成员-"]`,Co=`dsh-chatroom-native-mention-avatar`;function wo(e){let t=()=>{let t=Eo(e.getSnapshot());for(let e of document.querySelectorAll(So)){let n=e.firstElementChild,r=n?.nextElementSibling?.textContent?.trim();if(!(n instanceof HTMLElement)||r===void 0||r===``)continue;let i=t.get(r),a=n.querySelector(`:scope > img.${Co}`);if(i===void 0){a?.remove(),n.classList.remove(Co),delete n.dataset.dshChatroomAvatarFailed;continue}if(a?.src===i||(a?.remove(),n.dataset.dshChatroomAvatarFailed===i))continue;n.classList.add(Co);let o=document.createElement(`img`);o.alt=``,o.referrerPolicy=`no-referrer`,o.src=i,o.addEventListener(`error`,()=>{n.dataset.dshChatroomAvatarFailed=i,o.remove(),n.classList.remove(Co)},{once:!0}),n.prepend(o)}},n=new MutationObserver(e=>{e.some(To)&&t()});n.observe(document.body,{childList:!0,subtree:!0});let r=e.subscribe(t);return t(),()=>{r(),n.disconnect();for(let e of document.querySelectorAll(`${So} img.${Co}`)){let t=e.parentElement;e.remove(),t?.classList.remove(Co),t!=null&&delete t.dataset.dshChatroomAvatarFailed}}}function To(e){return[...e.addedNodes].some(e=>e instanceof Element&&(e.matches(So)||e.querySelector(So)!==null))}function Eo(e){let t=new Map;for(let n of e.members){let e=Do(n.avatarUrl);e!==void 0&&t.set(n.displayName,e)}for(let n of e.directPeers){let r=Do(n.avatarUrl);r!==void 0&&t.set(ro(n,e.directPeers),r)}return t}function Do(e){if(e!==void 0)try{let t=new URL(e);return t.protocol===`https:`&&t.username===``&&t.password===``&&t.hash===``?t.href:void 0}catch{return}}function Oo(e,t,n){let r=e.startSession,i=new Set,a=!1,o=r=>{let o=e.list.getSnapshot(),s=t.list.getSnapshot().current,c=s===void 0?void 0:o.items.find(e=>e.sessionIds.includes(s))?.workspaceId,l=r??c??o.recentWorkspaceId;if(l===void 0){t.clear();return}n(l).then(e=>{if(!a){let n=ko(t,e,i);n!==void 0&&i.add(n)}},e=>{a||console.warn(`new shared session failed:`,e)})};return e.startSession=o,()=>{a=!0;for(let e of i)e();i.clear(),e.startSession===o&&(e.startSession=r)}}function ko(e,t,n){let r=!1,i=()=>void 0,a,o=()=>{r||(r=!0,i(),a!==void 0&&clearTimeout(a),n.delete(o))},s=()=>{r||e.list.getSnapshot().byId[t]===void 0||(o(),e.open(t))};if(e.list.getSnapshot().byId[t]!==void 0){e.open(t);return}return i=e.list.subscribe(s),a=setTimeout(()=>{o(),console.warn(`new shared session was not listed within 5000ms`)},5e3),s(),r?void 0:o}function Ao(e){let t=e.useChatroom(e=>e),n=e.newSessionMode(String(e.sessionId)),[r,i]=(0,d.useState)(),a=e.session.composerPhase===`blank`&&e.session.nodes.length===0;if((0,d.useEffect)(()=>{a&&n===void 0&&e.registerNewSession(String(e.sessionId))},[a,n,e.registerNewSession,e.sessionId]),(0,d.useEffect)(()=>{if(!a||t.branchFrame!==void 0)return;let e=[...document.querySelectorAll(`span`)].find(e=>e.textContent?.trim()===`探索未至之境`),n=e?.parentElement,r=n?.parentElement,o=n?.nextElementSibling;if(!(o instanceof HTMLElement)||e===void 0||r==null)return;let s=e.textContent;return e.textContent=`今天有什么工作要处理？`,r.setAttribute(`data-dsh-chatroom-new-session-hero`,``),o.setAttribute(`data-dsh-chatroom-new-session-switch-host`,``),i(o),()=>{e.textContent=s,r.removeAttribute(`data-dsh-chatroom-new-session-hero`),o.removeAttribute(`data-dsh-chatroom-new-session-switch-host`)}},[a,e.sessionId,t.branchFrame]),(0,d.useEffect)(()=>{if(!a||r===void 0||n===void 0)return;let e=null,t=r;for(;t!==null&&e===null;)e=t.querySelector(`button[aria-label="选择工作区"]`),t=t.parentElement;let i=e?.querySelector(`span`);if(e===null||i==null)return;let o=i.textContent??``,s=n===`solo`?`Solo`:`群聊`;return i.textContent=s,e.title=o===``?`当前会话类型：${s}`:`当前会话类型：${s}；工作区：${o}`,e.setAttribute(`data-dsh-chatroom-session-mode`,n),()=>{i.textContent=o,e.removeAttribute(`title`),e.removeAttribute(`data-dsh-chatroom-session-mode`)}},[a,n,r]),!a||t.branchFrame!==void 0||n===void 0)return null;let o=n===`solo`?`solo`:`group`,s=(0,p.jsxs)(`div`,{className:`dsh-chatroom-new-mode-switch`,"data-mode":o,role:`group`,"aria-label":`新会话模式`,children:[(0,p.jsx)(`button`,{type:`button`,"data-active":o===`group`,onClick:()=>{e.chooseNewSessionMode(String(e.sessionId),`group`)},children:`群聊`}),(0,p.jsx)(`button`,{type:`button`,"data-active":o===`solo`,onClick:()=>{e.chooseNewSessionMode(String(e.sessionId),`solo`)},children:`Solo`})]});return r===void 0?(0,p.jsx)(`section`,{className:`dsh-chatroom-new-mode`,"aria-label":`选择新会话模式`,children:s}):(0,f.createPortal)(s,r)}function jo(e){if(e.isLoopback)return()=>void 0;let t=e.api,n=t.settings,r=t.credentials,i=t.llm,a={describe:(e,t)=>Mo(`settings.describe`,e,t),openDocument:n.openDocument,update:(e,t)=>Mo(`settings.update`,e,t),replace:(e,t)=>Mo(`settings.replace`,e,t),mutate:(e,t)=>Mo(`settings.mutate`,e,t)},o={describe:(e,t)=>Mo(`credentials.describe`,e,t),set:(e,t)=>Mo(`credentials.set`,e,t),unset:(e,t)=>Mo(`credentials.unset`,e,t)},s={...i,discoverModels:(e,t)=>Mo(`llm.discoverModels`,e,t)};return t.settings=a,t.credentials=o,t.llm=s,()=>{t.settings===a&&(t.settings=n),t.credentials===o&&(t.credentials=r),t.llm===s&&(t.llm=i)}}async function Mo(e,t,n){let r=crypto.randomUUID(),i=await fetch(`${y}/configuration/${e}`,{method:`POST`,headers:{"content-type":`application/json`},body:JSON.stringify({type:`client-request`,rpcId:r,method:e,payload:t}),credentials:`same-origin`,...n===void 0?{}:{signal:n}});if(!i.ok)throw Error(await Po(i));let a=No(await i.json());if(a.rpcId!==r)throw Error(`远程模型设置响应编号不匹配：发送 ${r}，收到 ${String(a.rpcId)}`);return{rpcId:a.rpcId,result:a.result}}function No(e){if(typeof e!=`object`||!e||Array.isArray(e))throw Error(`远程模型设置响应格式无效。`);let t=e;if(t.type!==`server-response`||typeof t.rpcId!=`string`||t.result===null||typeof t.result!=`object`||Array.isArray(t.result))throw Error(`远程模型设置响应格式无效。`);let n=t.result;if(n.ok!==!0&&n.ok!==!1)throw Error(`远程模型设置响应格式无效。`);return{rpcId:t.rpcId,result:n}}async function Po(e){try{let t=await e.json();if(typeof t==`object`&&t&&!Array.isArray(t)){let e=t.error;if(typeof e==`string`&&e!==``)return e}}catch{}return`远程模型设置请求失败：HTTP ${e.status}`}function Fo(e){let t=e.useChatroom(e=>e),n=t.rooms.find(t=>String(e.sessionId)===t.sessionId);if(n===void 0)return t.roomEnsureSessionId===String(e.sessionId)?(0,p.jsx)(`button`,{className:`dsh-chatroom-manage-action`,type:`button`,disabled:!0,children:`正在建立共享群…`}):null;let r=t.identity,i=t.room?.id===n.id,a=i&&t.connection===`online`?`${t.online} 人在线`:`共享会话`;return(0,p.jsxs)(`span`,{className:`dsh-chatroom-header-actions`,children:[(0,p.jsxs)(`span`,{className:`dsh-chatroom-identity-action`,title:`当前群聊身份`,children:[(0,p.jsx)(`span`,{className:`dsh-chatroom-presence-dot`,"data-online":i&&t.connection===`online`}),r?.displayName??`选择身份`,` · `,a]}),(0,p.jsx)(`button`,{className:`dsh-chatroom-manage-action`,type:`button`,onClick:e.openMembers,children:`群管理`})]})}let Io=`div[role="treeitem"][aria-selected]`,Lo=`data-dsh-chatroom-group-avatar`,Ro=`data-dsh-chatroom-solo-avatar`,zo=`data-dsh-chatroom-sidebar-category`,Bo=`data-dsh-chatroom-workspace-categories`,Vo=`data-dsh-chatroom-category-header`,Ho=`data-dsh-chatroom-direct-row`,Uo=`data-dsh-chatroom-category-wrapper`,Wo=`data-dsh-chatroom-branch-row`,Go=`data-dsh-chatroom-branch-marker`,Ko=`data-dsh-chatroom-branch-surface`,qo=`data-dsh-chatroom-branch-replies`,Jo=`data-dsh-chatroom-native-branch-title`,Yo=`data-dsh-chatroom-branch-count`,Xo=`chatroom-thread-v1-`,Zo=`分支：`,Qo=`data-dsh-chatroom-native-group-section`,$o=`data-dsh-chatroom-native-folder-wrapper`,es=`data-dsh-chatroom-native-folder-expand-attempted`,ts=`data-dsh-chatroom-native-overflow-button`,ns=`[role="tree"], [role="treeitem"], [role="menu"]`,rs=new WeakMap,is,as;function os(e,t){if(typeof document>`u`||typeof MutationObserver>`u`)return()=>void 0;let n=!1,r,i,a=()=>{n=!1;let a=t.list.getSnapshot(),s=e.getSnapshot();cs(document,s,a.current,e.setRoomPinned,e.openDirect,e.closeDirect,a);let c=s.phase===`ready`?s.identity?.participantId:void 0;c===void 0?r=void 0:r!==c&&(r=c,e.loadDirectDirectory().then(e=>{e||r!==c||(r=void 0,i=setTimeout(o,2e3))}))},o=()=>{n||(n=!0,queueMicrotask(a))},s=new MutationObserver(e=>{e.some(ss)&&o()});s.observe(document.body,{childList:!0,subtree:!0,characterData:!0});let c=e.subscribe(o),l=t.list.subscribe(o);return o(),()=>{c(),l(),s.disconnect();let e=document.querySelectorAll(`${Io}, [${Wo}], [data-dsh-chatroom-session-id]`);for(let t of e)As(t);i!==void 0&&clearTimeout(i);for(let e of document.querySelectorAll(`[${zo}]`))js(e);for(let e of document.querySelectorAll(`[${Bo}]`))Ws(e)}}function ss(e){let t=e.target instanceof Element?e.target:e.target.parentElement;return t!==null&&t.closest(ns)!==null||[...e.addedNodes,...e.removedNodes].some(e=>e instanceof Element&&(e.matches(ns)||e.querySelector(ns)!==null))}function cs(e,t,n,r,i,a,o){let s=[...e.querySelectorAll(Io)].filter(e=>e.closest(`[${Ho}]`)===null),c=Ps(e,s),l=[...t.rooms],u=[],d=[],f=0,p=0;for(let e of s){ds(e,a);let r=e.getAttribute(`aria-selected`)===`true`,i=ps(e)??(r?n:void 0),s=ls(o,i)??us(o,e),c=i===void 0?void 0:hs(l,e=>e.sessionId===i),d=Ts(e)?.textContent?.trim(),f=s!==void 0&&ys(s)||d?.startsWith(Zo)===!0||e.dataset.dshChatroomBranchSessionId!==void 0,p=c===void 0&&i===void 0&&!f&&r&&t.room!==void 0?hs(l,e=>e.id===t.room?.id):void 0,m=c??p??gs(l,e),h=vs(e,i,s,o,t,m);u.push({row:e,sessionId:i,summary:s,branch:h,room:m})}let m=new Map,h=new Set;if(o!==void 0)for(let e of Object.values(o.byId)){if(!ys(e)||e.parentId===void 0)continue;let t=String(e.id),n=String(e.parentId);h.add(t),m.set(n,(m.get(n)??0)+1)}for(let e of u){let t=e.branch;t!==void 0&&t.parentSessionId!==void 0&&(t.sessionId!==void 0&&h.has(t.sessionId)||t.sessionId===void 0&&o!==void 0&&Object.values(o.byId).some(e=>ys(e)&&e.displayTitle.trim()===t.displayTitle&&String(e.parentId??``)===t.parentSessionId)||m.set(t.parentSessionId,(m.get(t.parentSessionId)??0)+1))}for(let e of u){let{row:n,sessionId:i,branch:a,room:o}=e;if(o!==void 0){Os(n),xs(n,o,_s(o,t),f++,r),Cs(n,o.title,i===void 0?0:m.get(i)??0),Ms(n,`group`),d.push(n);continue}if(ks(n),a!==void 0){n.dataset.dshChatroomBranchRow!==void 0&&n.dataset.dshChatroomBranchSessionId!==a.sessionId&&Os(n),Ss(n,a),n.style.order=String(-1e4+f++),n.querySelector(`:scope > [${Ro}]`)?.remove(),Ms(n,`group`),d.push(n);continue}if(Os(n),!fs(n)){js(n);continue}n.removeAttribute(Wo),Ns(n,p++),Ms(n,`solo`),d.push(n)}Fs(e,c,d,t,i),Ks(e,t,r)}function ls(e,t){if(e!==void 0&&t!==void 0)return e.byId[t]}function us(e,t){if(e===void 0)return;let n=Ts(t)?.textContent?.trim();if(n===void 0||!n.startsWith(Zo))return;let r=Object.values(e.byId).filter(e=>ys(e)&&e.displayTitle.trim()===n);return r.length===1?r[0]:void 0}function ds(e,t){e.dataset.dshChatroomDirectCloseBound!==`true`&&(e.dataset.dshChatroomDirectCloseBound=`true`,e.addEventListener(`click`,e=>{e.target.closest(`button[aria-label]`)===null&&t?.()}))}function fs(e){return!e.hasAttribute(`aria-expanded`)&&(e.getAttribute(`aria-selected`)===`true`||e.querySelector(`button[aria-label]`)!==null||e.dataset.dshChatroomRoomRow!==void 0)}function ps(e){if(e.dataset.dshChatroomSessionId!==void 0)return e.dataset.dshChatroomSessionId;if(e.draggable!==!0)return;let t=e.ownerDocument.defaultView?.Event;if(t===void 0)return;let n=new Map,r={effectAllowed:`uninitialized`,dropEffect:`none`,setData:(e,t)=>n.set(e,t),getData:e=>n.get(e)??``,clearData:e=>e===void 0?n.clear():n.delete(e)},i;try{let a=new t(`dragstart`,{bubbles:!0,cancelable:!0});Object.defineProperty(a,"dataTransfer",{value:r}),e.dispatchEvent(a),i=n.get(`text/plain`)}catch{i=void 0}finally{try{let n=new t(`dragend`,{bubbles:!0});Object.defineProperty(n,"dataTransfer",{value:r}),e.dispatchEvent(n)}catch{}}if(i!==void 0&&i.length!==0)return e.dataset.dshChatroomSessionId=i,i}function ms(e,t){return[...e.querySelectorAll(`span`)].some(e=>!e.closest(`[${Ko}]`)&&e.childElementCount===0&&e.textContent?.trim()===t)}function hs(e,t){let n=e.findIndex(t);if(!(n<0))return e.splice(n,1)[0]}function gs(e,t){let n=e.filter(e=>ms(t,e.title));return n.length===1?hs(e,e=>e.id===n[0]?.id):void 0}function _s(e,t){return e.memberAvatars===void 0?e.memberAvatarIds===void 0?t.room?.id===e.id&&t.members.length>0?t.members.slice(0,9).map(e=>({participantId:e.participantId,avatarId:e.avatarId,...e.avatarUrl===void 0?{}:{avatarUrl:e.avatarUrl}})):[]:e.memberAvatarIds.slice(0,9).map((e,t)=>({participantId:String(t),avatarId:e})):e.memberAvatars.slice(0,9)}function vs(e,t,n,r,i,a){if(a!==void 0||t!==void 0&&i.rooms.some(e=>e.sessionId===t))return;let o=Ts(e)?.textContent?.trim(),s=n?.displayTitle.trim(),c=t?.startsWith(Xo)===!0,l=s?.startsWith(Zo)===!0||o?.startsWith(Zo)===!0;if(n!==void 0&&!ys(n)&&!c)return;let u=n!==void 0&&ys(n);if(c&&o!==void 0&&!o.startsWith(Zo)&&!u){e.dataset.dshChatroomSessionId===t&&delete e.dataset.dshChatroomSessionId;return}if(!c&&!l)return;let d=s??o??Zo,f=bs(d),p=t===void 0?void 0:(i.threadPreviews??[]).find(e=>e.thread.sessionId===t),m=p===void 0?void 0:i.rooms.find(e=>e.id===p.thread.roomId),h=n?.parentId===void 0?p?.thread.root.sourceSessionId??m?.sessionId:String(n.parentId),g=ls(r,h);return{sessionId:t,displayTitle:d,topic:f,parentSessionId:h,parentTitle:(h===void 0?void 0:i.rooms.find(e=>e.sessionId===h))?.title??g?.displayTitle??m?.title,replyCount:p!==void 0&&p.totalMessages>0?p.totalMessages:void 0}}function ys(e){return String(e.id).startsWith(Xo)||e.parentId!==void 0&&e.displayTitle.trim().startsWith(Zo)}function bs(e){let t=e.trim(),n=t.startsWith(Zo)?t.slice(3).trim():t;return n===``?`未命名主题`:n}function xs(e,t,n,r,i){e.dataset.dshChatroomRoomRow=``,e.dataset.dshChatroomRoomId=t.id,e.dataset.pinned=String(t.pinned===!0),e.style.order=String(-1e4+r),e.parentElement?.setAttribute(`data-dsh-chatroom-room-list`,``),Gs(e,t),e.querySelector(`:scope > [${Ro}]`)?.remove();let a=n.map(e=>`${e.participantId}:${e.avatarId}:${e.avatarUrl??``}`).join(`|`)||`empty`,o=e.querySelector(`:scope > [${Lo}]`);if(o?.dataset.signature===a)return;o?.remove(),o=e.ownerDocument.createElement(`span`),o.setAttribute(Lo,``),o.dataset.count=String(Math.max(1,n.length)),o.dataset.signature=a,o.setAttribute(`aria-hidden`,`true`);let s=n.length===0?[{emoji:`✦`}]:n.map(e=>({...e,emoji:_(e.avatarId,e.participantId).emoji}));for(let t of s){let n=e.ownerDocument.createElement(`span`);if(t.avatarUrl===void 0)n.textContent=t.emoji;else{let r=e.ownerDocument.createElement(`img`);r.src=t.avatarUrl,r.alt=``,r.referrerPolicy=`no-referrer`,r.addEventListener(`error`,()=>{r.remove(),n.textContent=t.emoji},{once:!0}),n.append(r)}o.append(n)}e.prepend(o)}function Ss(e,t){e.dataset.dshChatroomBranchRow=``,t.sessionId===void 0?delete e.dataset.dshChatroomBranchSessionId:e.dataset.dshChatroomBranchSessionId=t.sessionId,t.parentSessionId===void 0?delete e.dataset.dshChatroomBranchParentSessionId:e.dataset.dshChatroomBranchParentSessionId=t.parentSessionId,e.dataset.dshChatroomBranchTopic=t.topic,t.parentTitle===void 0?delete e.dataset.dshChatroomBranchParentTitle:e.dataset.dshChatroomBranchParentTitle=t.parentTitle,t.replyCount===void 0?e.removeAttribute(qo):e.setAttribute(qo,String(t.replyCount));let n=t.parentTitle===void 0?`来自群聊`:`来自 ${t.parentTitle}`,r=t.replyCount===void 0?``:` · ${t.replyCount} 条回复`,i=t.parentTitle===void 0&&t.replyCount===void 0?`分支会话：${t.topic}`:`分支会话：${t.topic}，${n}${r}`;Ds(e,i),e.setAttribute(`aria-label`,i),e.setAttribute(`title`,i);let a=Ts(e,t.displayTitle);a?.setAttribute(Jo,``);let o=e.querySelector(`:scope > [${Go}]`);o===null&&(o=e.ownerDocument.createElement(`span`),o.setAttribute(Go,``),o.setAttribute(`aria-hidden`,`true`),o.textContent=`↳`);let s=e.querySelector(`:scope > [${Ko}]`);s===null&&(s=e.ownerDocument.createElement(`span`),s.setAttribute(Ko,``),s.setAttribute(`aria-hidden`,`true`));let c=`${t.topic}|${t.parentTitle??``}|${t.replyCount??``}`;if(s.dataset.signature!==c){s.replaceChildren();let i=e.ownerDocument.createElement(`span`);i.setAttribute(`data-dsh-chatroom-branch-heading`,``);let a=e.ownerDocument.createElement(`span`);a.setAttribute(`data-dsh-chatroom-branch-badge`,``),a.textContent=`分支`;let o=e.ownerDocument.createElement(`span`);o.setAttribute(`data-dsh-chatroom-branch-topic`,``),o.textContent=t.topic,i.append(a,o);let l=e.ownerDocument.createElement(`span`);l.setAttribute(`data-dsh-chatroom-branch-parent`,``),l.textContent=`${n}${r}`,s.append(i,l),s.dataset.signature=c}a===void 0?(o.parentElement!==e||s.parentElement!==e)&&e.append(o,s):(a.previousElementSibling!==s||s.previousElementSibling!==o)&&a.before(o,s)}function Cs(e,t,n){if(n===0){ws(e);return}e.dataset.dshChatroomHasBranches=``,e.dataset.dshChatroomBranchCount=String(n);let r=e.querySelector(`:scope > [${Yo}]`);if(r===null){r=e.ownerDocument.createElement(`span`),r.setAttribute(Yo,``);let n=Ts(e,t);n===void 0?e.append(r):n.after(r)}let i=`分支 ${n}`;r.textContent!==i&&(r.textContent=i),r.setAttribute(`title`,`${n} 个分支`),r.setAttribute(`aria-label`,`${n} 个分支`)}function ws(e){delete e.dataset.dshChatroomHasBranches,delete e.dataset.dshChatroomBranchCount,e.querySelector(`:scope > [${Yo}]`)?.remove()}function Ts(e,t){let n=[...e.querySelectorAll(`span`)].filter(e=>!e.closest(`[${Ko}]`)&&!e.hasAttribute(Go)&&!e.hasAttribute(Yo)&&e.childElementCount===0);if(t!==void 0){let e=n.find(e=>e.textContent?.trim()===t);if(e!==void 0)return e}return n.find(e=>e.textContent?.trim().startsWith(Zo))??n.find(e=>e.dataset.dshChatroomNativeBranchTitle!==void 0)??n.filter(e=>{let t=e.textContent?.trim()??``;return t!==``&&!Es(t)&&t!==`●`}).sort((e,t)=>(t.textContent?.trim().length??0)-(e.textContent?.trim().length??0))[0]}function Es(e){return/^(?:刚刚|现在|now|\d+\s*(?:秒|分钟|小时|天|周|月|年|s|min|h|d|w))$/iu.test(e)}function Ds(e,t){let n=rs.get(e);if(n===void 0){rs.set(e,{ariaLabel:e.getAttribute(`aria-label`),title:e.getAttribute(`title`),appliedAriaLabel:t,appliedTitle:t});return}let r=e.getAttribute(`aria-label`)===n.appliedAriaLabel?n.ariaLabel:e.getAttribute(`aria-label`),i=e.getAttribute(`title`)===n.appliedTitle?n.title:e.getAttribute(`title`);rs.set(e,{ariaLabel:r,title:i,appliedAriaLabel:t,appliedTitle:t})}function Os(e){delete e.dataset.dshChatroomBranchRow,delete e.dataset.dshChatroomBranchSessionId,delete e.dataset.dshChatroomBranchParentSessionId,delete e.dataset.dshChatroomBranchTopic,delete e.dataset.dshChatroomBranchParentTitle,e.removeAttribute(qo),e.querySelector(`:scope > [${Go}]`)?.remove(),e.querySelector(`:scope > [${Ko}]`)?.remove();for(let t of e.querySelectorAll(`[${Jo}]`))t.removeAttribute(Jo);let t=rs.get(e);t!==void 0&&(e.getAttribute(`aria-label`)===t.appliedAriaLabel&&(t.ariaLabel===null?e.removeAttribute(`aria-label`):e.setAttribute(`aria-label`,t.ariaLabel)),e.getAttribute(`title`)===t.appliedTitle&&(t.title===null?e.removeAttribute(`title`):e.setAttribute(`title`,t.title)),rs.delete(e))}function ks(e){delete e.dataset.dshChatroomRoomRow,delete e.dataset.dshChatroomRoomId,delete e.dataset.pinned,ws(e),e.querySelector(`:scope > [${Lo}]`)?.remove()}function As(e){Os(e),ks(e),delete e.dataset.dshChatroomSessionId,delete e.dataset.dshChatroomBranchSessionId,e.style.removeProperty(`order`)}function js(e){As(e),e.removeAttribute(zo),e.removeAttribute(Wo),e.querySelector(`:scope > [${Ro}]`)?.remove();let t=e.parentElement;t?.removeAttribute(Uo),t?.style.removeProperty(`order`)}function Ms(e,t){e.setAttribute(zo,t);let n=e.closest(`[role="tree"]`),r=e.parentElement;n!==null&&r!==null&&r!==n&&(r.setAttribute(Uo,t),r.style.order=e.style.order)}function Ns(e,t){if(e.style.order=String(-6e3+t),e.querySelector(`:scope > [${Ro}]`)!==null)return;let n=e.ownerDocument.createElement(`span`);n.setAttribute(Ro,``),n.setAttribute(`aria-hidden`,`true`),n.textContent=`✦`,e.prepend(n)}function Ps(e,t){return t.find(e=>e.closest(`[role="tree"]`)!==null)?.closest(`[role="tree"]`)??e.querySelector(`[role="tree"]`)??t[0]?.parentElement??void 0}function Fs(e,t,n,r,i){for(let n of e.querySelectorAll(`[${Bo}]`))n!==t&&Ws(n);if(t===void 0)return;t.setAttribute(Bo,``),Is(t),Ls(t);let a=n.filter(e=>e.getAttribute(zo)===`group`).length,o=n.filter(e=>e.getAttribute(zo)===`solo`).length;zs(t,`group`,`群聊`,a,-11e3),zs(t,`solo`,`Solo`,o,-7e3);let s=Bs(r.directPeers??[],r.directConversations??[]);zs(t,`direct`,`私聊`,s.length,-3e3),Vs(t,s,r,i)}function Is(e){for(let t of e.querySelectorAll(`[${Qo}]`))t.removeAttribute(Qo);for(let t of e.querySelectorAll(`[${$o}]`))t.removeAttribute($o),t.removeAttribute(`data-hidden`),t.style.removeProperty(`order`);for(let t of e.querySelectorAll(`div[role="treeitem"]`)){let n=Rs(e,t);if(n!==void 0&&n!==t&&n.setAttribute(Qo,``),!t.hasAttribute(`aria-expanded`))continue;let r=t.parentElement;if(r===null)continue;let i=r.querySelectorAll(`div[role="treeitem"]`).length>1?t:r;i.setAttribute($o,``),i.dataset.hidden=`true`,t.getAttribute(`aria-expanded`)===`true`?t.removeAttribute(es):t.getAttribute(`aria-expanded`)===`false`&&!t.hasAttribute(es)&&(t.setAttribute(es,``),t.click())}}function Ls(e){for(let t of e.querySelectorAll(`[${Qo}]`)){let e=t.querySelector(`:scope > button`);if(e===null)continue;let n;for(let r of t.querySelectorAll(`:scope > *`)){if(r===e)continue;let t=Number(r.style.order);r.style.order!==``&&Number.isFinite(t)&&(n=n===void 0?t:Math.max(n,t))}if(n===void 0){e.removeAttribute(ts),e.style.removeProperty(`order`);continue}e.setAttribute(ts,``),e.style.order=String(n+1)}}function Rs(e,t){let n=t;for(;n?.parentElement!==null&&n.parentElement!==e;)n=n.parentElement;return n?.parentElement===e?n:void 0}function zs(e,t,n,r,i){let a=e.querySelector(`:scope > [${Vo}="${t}"]`);if(a===null){a=e.ownerDocument.createElement(`div`),a.setAttribute(Vo,t);let n=e.ownerDocument.createElement(`button`);n.type=`button`,n.setAttribute(`aria-expanded`,`true`),n.innerHTML=`<span data-chevron aria-hidden>⌄</span><span data-folder-icon aria-hidden></span><strong></strong><small></small>`,n.onclick=()=>{let r=e.getAttribute(`data-dsh-chatroom-${t}-collapsed`)===`true`;e.setAttribute(`data-dsh-chatroom-${t}-collapsed`,String(!r)),n.setAttribute(`aria-expanded`,String(r));let i=n.querySelector(`[data-chevron]`);i!==null&&(i.textContent=r?`⌄`:`›`)},a.append(n),e.append(a)}a.style.order=String(i);let o=a.querySelector(`strong`),s=a.querySelector(`small`),c=a.querySelector(`[data-folder-icon]`);if(c!==null&&c.childElementCount===0){let t=e.querySelector(`div[role="treeitem"][aria-expanded] svg[width="16"]`);t!==null&&c.append(t.cloneNode(!0))}o?.textContent!==n&&(o.textContent=n);let l=String(r);s?.textContent!==l&&(s.textContent=l)}function Bs(e,t){let n=new Map(t.map(e=>[e.peer.participantId,e])),r=new Map(e.map(e=>[e.participantId,e]));for(let e of t)r.set(e.peer.participantId,e.peer);return[...r.values()].sort((e,t)=>{let r=n.get(e.participantId)?.updatedAt??0;return(n.get(t.participantId)?.updatedAt??0)-r||e.displayName.localeCompare(t.displayName,`zh-CN`)})}function Vs(e,t,n,r){let i=new Map([...e.querySelectorAll(`:scope > [${Ho}]`)].map(e=>[e.dataset.peerId??``,e]));t.forEach((t,a)=>{let o=i.get(t.participantId);o===void 0&&(o=e.ownerDocument.createElement(`div`),o.setAttribute(Ho,``),o.dataset.peerId=t.participantId,o.innerHTML=`<button type="button"><span data-avatar></span><span><strong></strong><small></small></span></button>`,e.append(o)),i.delete(t.participantId),o.style.order=String(-2900+a),o.dataset.active=String(n.directConversation?.peer.participantId===t.participantId);let s=o.querySelector(`button`);s.setAttribute(`aria-label`,`与 ${t.displayName} 私聊`),s.onclick=()=>{r?.(t.participantId)};let c=o.querySelector(`strong`),l=o.querySelector(`small`);c.textContent!==t.displayName&&(c.textContent=t.displayName);let u=n.directConversations.find(e=>e.peer.participantId===t.participantId),d=u===void 0?`@${t.username}`:Us(u.updatedAt);l.textContent!==d&&(l.textContent=d),Hs(o.querySelector(`[data-avatar]`),t)});for(let e of i.values())e.remove()}function Hs(e,t){let n=`${t.participantId}:${t.avatarId}:${t.avatarUrl??``}`;if(e.dataset.signature===n)return;e.dataset.signature=n,e.replaceChildren();let r=_(t.avatarId,t.participantId).emoji;if(t.avatarUrl===void 0){e.textContent=r;return}let i=e.ownerDocument.createElement(`img`);i.src=t.avatarUrl,i.alt=``,i.referrerPolicy=`no-referrer`,i.addEventListener(`error`,()=>{i.remove(),e.textContent=r},{once:!0}),e.append(i)}function Us(e){let t=Math.max(0,Math.floor((Date.now()-e)/6e4));return t<1?`刚刚`:t<60?`${String(t)}分钟`:t<1440?`${String(Math.floor(t/60))}小时`:`${String(Math.floor(t/1440))}天`}function Ws(e){e.removeAttribute(Bo),e.removeAttribute(`data-dsh-chatroom-group-collapsed`),e.removeAttribute(`data-dsh-chatroom-solo-collapsed`),e.removeAttribute(`data-dsh-chatroom-direct-collapsed`);for(let t of e.querySelectorAll(`:scope > [${Vo}], :scope > [${Ho}]`))t.remove();for(let t of e.querySelectorAll(`[${Qo}]`))t.removeAttribute(Qo);for(let t of e.querySelectorAll(`[${$o}], [${Uo}]`))t.removeAttribute($o),t.removeAttribute(Uo),t.removeAttribute(`data-hidden`),t.style.removeProperty(`order`);for(let t of e.querySelectorAll(`[${es}]`))t.removeAttribute(es);for(let t of e.querySelectorAll(`[${ts}]`))t.removeAttribute(ts),t.style.removeProperty(`order`)}function Gs(e,t){let n=e.querySelector(`button[aria-label]`);n!==null&&(n.dataset.dshChatroomNativeMenuRoomId=t.id,n.dataset.dshChatroomNativeMenuBound!==`true`&&(n.dataset.dshChatroomNativeMenuBound=`true`,n.addEventListener(`click`,()=>{is=n.dataset.dshChatroomNativeMenuRoomId,as=void 0})))}function Ks(e,t,n){if(as!==void 0){as.isConnected||(as=void 0,is=void 0);return}let r=t.rooms.find(e=>e.id===is);if(r===void 0)return;let i=[...e.querySelectorAll(`[role="menu"]`)].at(-1)?.querySelector(`:scope > [role="presentation"]`),a=i?.querySelector(`:scope > *`),o=a?.querySelector(`:scope > button[role="menuitem"]`);if(i==null||a==null||o==null)return;let s=e.createElement(a.tagName.toLowerCase());s.className=a.className,s.dataset.dshChatroomPinMenuItem=``;let c=e.createElement(`button`);c.type=`button`,c.role=`menuitem`,c.className=o.className;let l=e.createElement(`span`);l.className=o.querySelector(`:scope > :first-child`)?.className??``;let u=e.createElementNS(`http://www.w3.org/2000/svg`,`svg`);u.setAttribute(`width`,`16`),u.setAttribute(`height`,`16`),u.setAttribute(`viewBox`,`0 0 16 16`);let d=e.createElementNS(`http://www.w3.org/2000/svg`,`path`);d.setAttribute(`d`,`M5 1.75h6l-1 4.1 2 2V9H8.65v5.25h-1.3V9H4V7.85l2-2-1-4.1Z`),d.setAttribute(`fill`,`currentColor`),u.append(d),l.append(u);let f=e.createElement(`span`);f.className=o.querySelector(`:scope > :last-child`)?.className??``,f.textContent=r.pinned===!0?`取消置顶`:`置顶群聊`,c.append(l,f),c.onclick=t=>{t.stopPropagation(),n?.(r.id,r.pinned!==!0),e.dispatchEvent(new KeyboardEvent(`keydown`,{key:`Escape`,bubbles:!0}))},s.append(c),i.append(s),as=s}let qs=`data-dsh-chatroom-settings-nav`;function Js(e){if(typeof document>`u`||typeof MutationObserver>`u`)return()=>void 0;let t=!1,n=()=>{if(t)return;let n=e().trim(),r=document.querySelectorAll(`[role="dialog"] nav button`);for(let e of r)n.length>0&&e.textContent?.trim()===n?e.setAttribute(qs,``):e.removeAttribute(qs)};n();let r=new MutationObserver(n);return r.observe(document.body??document.documentElement,{childList:!0,subtree:!0,characterData:!0}),()=>{t=!0,r.disconnect(),document.querySelectorAll(`[${qs}]`).forEach(e=>{e.removeAttribute(qs)})}}let Ys=[`connection`,`inputTriggers`,`sessions`,`settingsScope`,`slots`,`workspaces`];function Xs(e){let t=e.get(`connection`);if(t===void 0)throw Error(`chatroom: client connection service unavailable`);let n=e.get(`sessions`);if(n===void 0)throw Error(`chatroom: client sessions service unavailable`);let r=e.get(`workspaces`);if(r===void 0)throw Error(`chatroom: client workspaces service unavailable`);let i=e.get(`inputTriggers`);if(i===void 0)throw Error(`chatroom: input trigger service unavailable`);let a=typeof location>`u`?void 0:T(location),o=new io(e=>{let t=e,r=n.list.getSnapshot();return r.current===t||r.byId[t]!==void 0&&(n.open(t),!0)},a);e.effect(()=>Oo(r,n,async e=>{let n=await t.api.sessions.create({workspaceId:e});if(!n.result.ok)throw Error(`new shared session failed: ${n.result.error.code}: ${n.result.error.message}`);let r=n.result.value.sessionId;return o.registerNewSession(String(r)),r}),`chatroom: distinct native New Session`),e.effect(()=>{document.documentElement.setAttribute(`data-dsh-chatroom-installed`,``),a!==void 0&&document.documentElement.setAttribute(`data-dsh-chatroom-branch-frame`,``);let r=()=>{a!==void 0&&document.querySelector(`[data-shell-overlay]`)?.parentElement?.setAttribute(`data-dsh-chatroom-branch-shell`,``)},i=a===void 0?void 0:new MutationObserver(r);i?.observe(document.body,{childList:!0,subtree:!0}),r();let s=document.createElement(`style`);s.dataset.dshChatroomStyles=``,s.textContent=`
/* Keep AI and people visually distinct in Harness's native @ menu. */
[role="listbox"] [data-source="AI 助手"] { color: var(--brand-primary, #4f7cff); font-weight: 600; }
[role="option"][id^="dsh-slash-option-AI 助手-"] > span:first-child {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: var(--brand-primary, #4f7cff);
  color: #fff;
  box-shadow: 0 4px 12px rgb(79 124 255 / 22%);
}
[role="option"][id^="dsh-slash-option-AI 助手-"] > span:nth-child(2) { color: var(--brand-primary, #4f7cff); font-weight: 600; }
[role="listbox"] [data-source="群聊成员"] { margin-top: 2px; border-top: 1px solid var(--border-primary, #e5e7eb); }
[role="option"][id^="dsh-slash-option-群聊成员-"] > .dsh-chatroom-native-mention-avatar {
  position: relative;
  overflow: hidden;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 8px;
}
[role="option"][id^="dsh-slash-option-群聊成员-"] > .dsh-chatroom-native-mention-avatar > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dsh-chatroom-dialog-layer {
  pointer-events: auto;
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(0 0 0 / 28%);
  backdrop-filter: blur(2px);
}

.dsh-chatroom-card {
  position: relative;
  width: min(420px, calc(100vw - 48px));
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 18px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 28px;
  box-shadow: 0 24px 70px rgb(0 0 0 / 18%);
}

.dsh-chatroom-card h2 { margin: 0 0 10px; font-size: 22px; }
.dsh-chatroom-card p { margin: 0 0 20px; color: var(--text-secondary, #6b7280); line-height: 1.6; }
.dsh-chatroom-card code { color: var(--text-primary, #111827); font-size: .92em; }

.dsh-chatroom-close {
  position: absolute;
  top: 12px;
  right: 14px;
  border: 0;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  font: inherit;
  font-size: 24px;
  cursor: default;
}

.dsh-chatroom-name {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid var(--border-primary, #d1d5db);
  border-radius: 10px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 11px 13px;
  font: inherit;
  outline: none;
}

.dsh-chatroom-name:focus { border-color: var(--brand-primary, #4f7cff); }

.dsh-chatroom-avatar-fieldset {
  margin: 18px 0 0;
  padding: 0;
  border: 0;
}

.dsh-chatroom-avatar-fieldset legend {
  margin-bottom: 10px;
  color: var(--text-secondary, #6b7280);
  font-size: 13px;
}

.dsh-chatroom-avatar-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.dsh-chatroom-avatar-choice {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  min-width: 0;
  border: 2px solid transparent;
  border-radius: 13px;
  background: var(--bg-secondary, #f3f4f6);
  padding: 0;
  font-size: 23px;
  cursor: pointer;
}

.dsh-chatroom-avatar-choice[data-selected="true"] {
  border-color: var(--brand-primary, #4f7cff);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-primary, #4f7cff) 18%, transparent);
}

.dsh-chatroom-button {
  width: 100%;
  margin-top: 14px;
  border: 0;
  border-radius: 10px;
  background: var(--brand-primary, #4f7cff);
  color: #fff;
  padding: 11px 16px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.dsh-chatroom-button:disabled { cursor: not-allowed; opacity: .45; }
.dsh-chatroom-error { margin-top: 12px; color: #d14343; font-size: 13px; }

.dsh-chatroom-room-card { width: min(480px, calc(100vw - 48px)); }

.dsh-chatroom-room-list {
  display: grid;
  gap: 8px;
  max-height: min(340px, 42vh);
  overflow-y: auto;
}

.dsh-chatroom-room-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 10px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 11px 13px;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.dsh-chatroom-room-item:hover,
.dsh-chatroom-room-item[data-active="true"] {
  border-color: var(--brand-primary, #4f7cff);
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent);
}

.dsh-chatroom-room-item small { color: var(--text-secondary, #6b7280); }

.dsh-chatroom-create {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-top: 14px;
}

.dsh-chatroom-create-button {
  border: 0;
  border-radius: 10px;
  background: var(--brand-primary, #4f7cff);
  color: #fff;
  padding: 0 18px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.dsh-chatroom-create-button:disabled { cursor: not-allowed; opacity: .45; }

.dsh-chatroom-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  color: var(--text-secondary, #6b7280);
  font-size: 13px;
}

.dsh-chatroom-card-footer button {
  border: 0;
  background: transparent;
  color: var(--brand-primary, #4f7cff);
  padding: 0;
  font: inherit;
  cursor: pointer;
}

.dsh-chatroom-identity-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 4px 6px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.dsh-chatroom-header-actions { display: inline-flex; align-items: center; gap: 4px; }
.dsh-chatroom-manage-action {
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 4px 8px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dsh-chatroom-manage-action:hover { color: var(--brand-primary, #4f7cff); border-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-manage-action:disabled { cursor: wait; opacity: .58; }

[data-dsh-chatroom-room-row] {
  box-sizing: border-box;
  height: 48px !important;
  min-height: 48px;
  padding-block: 6px !important;
}

[data-dsh-chatroom-room-list],
[data-dsh-chatroom-workspace-categories] { display: flex !important; flex-direction: column; }
[data-dsh-chatroom-workspace-categories] > [data-dsh-chatroom-native-group-section] { display: contents !important; }
[data-dsh-chatroom-native-folder-wrapper][data-hidden="true"] { display: none !important; }
[data-dsh-chatroom-sidebar-category] { padding-left: 22px !important; }
[data-dsh-chatroom-category-header] {
  box-sizing: border-box;
  width: 100%;
  min-height: 38px;
  padding: 2px 8px;
}
[data-dsh-chatroom-category-header] > button {
  display: grid;
  grid-template-columns: 14px 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 34px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 3px 7px;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
[data-dsh-chatroom-category-header] > button:hover { background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); }
[data-dsh-chatroom-category-header] strong { color: var(--text-primary, #111827); font-size: 13px; font-weight: 600; }
[data-dsh-chatroom-category-header] small { font-size: 11px; }
[data-dsh-chatroom-category-header] [data-folder-icon] { display: inline-flex; width: 17px; height: 17px; align-items: center; }
[data-dsh-chatroom-category-header] [data-folder-icon] svg { display: block; width: 16px; height: 16px; }
[data-dsh-chatroom-group-collapsed="true"] [data-dsh-chatroom-category-wrapper="group"],
[data-dsh-chatroom-solo-collapsed="true"] [data-dsh-chatroom-category-wrapper="solo"],
[data-dsh-chatroom-direct-collapsed="true"] > [data-dsh-chatroom-direct-row] { display: none !important; }

[data-dsh-chatroom-solo-avatar] {
  display: grid;
  flex: 0 0 32px;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-right: 6px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 11%, var(--bg-primary, #fff));
  color: var(--brand-primary, #4f7cff);
  font-size: 16px;
}
[data-dsh-chatroom-direct-row] { box-sizing: border-box; width: 100%; min-height: 48px; padding: 2px 8px 2px 14px; }
[data-dsh-chatroom-direct-row] > button {
  display: grid;
  grid-template-columns: 32px 16px minmax(0, 1fr);
  align-items: center;
  gap: 5px;
  width: 100%;
  min-height: 44px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--text-primary, #111827);
  padding: 5px 8px;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
[data-dsh-chatroom-direct-row] > button::before { content: ""; grid-column: 2; grid-row: 1; }
[data-dsh-chatroom-direct-row] > button:hover,
[data-dsh-chatroom-direct-row][data-active="true"] > button { background: var(--bg-secondary, #f3f4f6); }
[data-dsh-chatroom-direct-row] [data-avatar] {
  display: grid;
  grid-column: 1;
  grid-row: 1;
  place-items: center;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 10%, var(--bg-primary, #fff));
}
[data-dsh-chatroom-direct-row] [data-avatar] img { width: 100%; height: 100%; object-fit: cover; }
[data-dsh-chatroom-direct-row] button > span:last-child { display: grid; grid-column: 3; grid-row: 1; min-width: 0; }
[data-dsh-chatroom-direct-row] strong,
[data-dsh-chatroom-direct-row] small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
[data-dsh-chatroom-direct-row] strong { font-size: 13px; }
[data-dsh-chatroom-direct-row] small { color: var(--text-secondary, #6b7280); font-size: 11px; }
[data-dsh-chatroom-room-row][data-pinned="true"] [data-dsh-chatroom-group-avatar]::after {
  content: ""; position: absolute; top: -2px; right: -2px; width: 7px; height: 7px; border: 2px solid var(--bg-primary, #fff);
  border-radius: 50%; background: var(--brand-primary, #4f7cff);
}

/* Native session rows reserve a 16px status slot plus a 4px title margin in
   front of the title. Once the chatroom avatar is prepended, the empty slot
   only widens the icon-to-title gap, so collapse it while it holds no dots. */
[data-dsh-chatroom-room-row] > [data-dsh-chatroom-group-avatar] + span:empty,
[data-dsh-chatroom-sidebar-category="solo"] > [data-dsh-chatroom-solo-avatar] + span:empty {
  display: none;
}
[data-dsh-chatroom-room-row] > [data-dsh-chatroom-group-avatar] + span:empty + span,
[data-dsh-chatroom-sidebar-category="solo"] > [data-dsh-chatroom-solo-avatar] + span:empty + span {
  margin-left: 0 !important;
}

[data-dsh-chatroom-group-avatar] {
  position: relative;
  display: grid;
  box-sizing: border-box;
  flex: 0 0 32px;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 32px;
  height: 32px;
  margin-right: 6px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--border-primary, #d8dde6) 82%, transparent);
  border-radius: 9px;
  background: var(--bg-secondary, #f3f4f6);
  box-shadow: 0 2px 7px rgb(15 23 42 / 8%);
}

[data-dsh-chatroom-group-avatar][data-count="1"] {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

[data-dsh-chatroom-group-avatar][data-count="2"] {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr;
}

[data-dsh-chatroom-group-avatar][data-count="3"],
[data-dsh-chatroom-group-avatar][data-count="4"] {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

[data-dsh-chatroom-group-avatar] > span {
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: color-mix(in srgb, var(--bg-primary, #fff) 82%, var(--brand-primary, #4f7cff));
  font-size: 8px;
  line-height: 1;
}

[data-dsh-chatroom-group-avatar] > span > img,
.dsh-chatroom-avatar > img,
.dsh-chatroom-member-avatar > img,
.dsh-chatroom-user-avatar > img,
.dsh-chatroom-direct-avatar > img,
.dsh-chatroom-inline-avatar > img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}

[data-dsh-chatroom-group-avatar][data-count="1"] > span { font-size: 18px; }
[data-dsh-chatroom-group-avatar][data-count="2"] > span { font-size: 12px; }
[data-dsh-chatroom-group-avatar][data-count="3"] > span,
[data-dsh-chatroom-group-avatar][data-count="4"] > span { font-size: 10px; }

/* Branch sessions are still native rows, but read as a nested Discord-style
   thread: a hook, compact branch badge, topic, and explicit parent context. */
[data-dsh-chatroom-branch-row] {
  position: relative;
  display: flex;
  box-sizing: border-box;
  width: auto !important;
  min-height: 46px !important;
  height: 46px !important;
  /* Keep the branch content aligned just after its parent title. The native
     row already supplies the workspace gutter, so an extra 30px made the
     marker look detached from the room it belongs to. */
  margin: 2px 8px 2px 18px !important;
  border: 1px solid transparent;
  border-radius: 10px !important;
  padding: 4px 8px !important;
  background: transparent;
  color: var(--dsw-alias-label-secondary, var(--text-secondary, #6b7280)) !important;
}

[data-dsh-chatroom-branch-row]:hover {
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 16%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 7%, var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-layer-2, var(--bg-secondary, #f3f4f6))));
}

[data-dsh-chatroom-branch-row][aria-selected="true"] {
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 32%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 13%, var(--dsw-alias-bg-layer-1, var(--bg-primary, #fff)));
  box-shadow: inset 2px 0 0 var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)), 0 2px 8px rgb(15 23 42 / 7%);
  color: var(--dsw-alias-label-primary, var(--text-primary, #111827)) !important;
}

[data-dsh-chatroom-branch-row]:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 48%, transparent);
  outline-offset: 1px;
}

[data-dsh-chatroom-branch-row]::before {
  position: absolute;
  top: 7px;
  left: -15px;
  width: 11px;
  height: 19px;
  border-bottom: 1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 28%, var(--dsw-alias-border-l2, var(--border-primary, #d8dde6)));
  border-left: 1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 28%, var(--dsw-alias-border-l2, var(--border-primary, #d8dde6)));
  border-bottom-left-radius: 7px;
  content: '';
  pointer-events: none;
}

[data-dsh-chatroom-branch-marker] {
  display: grid;
  flex: 0 0 22px;
  place-items: center;
  width: 22px;
  height: 22px;
  margin-right: 7px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 22%, transparent);
  border-radius: 7px;
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 10%, var(--dsw-alias-bg-layer-1, var(--bg-primary, #fff)));
  color: var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff));
  font-size: 15px;
  line-height: 1;
}

[data-dsh-chatroom-branch-surface] {
  display: grid;
  flex: 1 1 auto;
  align-content: center;
  min-width: 0;
  gap: 1px;
}

[data-dsh-chatroom-branch-heading] {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 6px;
}

[data-dsh-chatroom-branch-badge] {
  flex: none;
  border-radius: 5px;
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 13%, transparent);
  padding: 1px 5px;
  color: var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff));
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
}

[data-dsh-chatroom-branch-topic] {
  min-width: 0;
  overflow: hidden;
  color: inherit;
  font-size: 13px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-dsh-chatroom-branch-parent] {
  min-width: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary, var(--text-tertiary, #9ca3af));
  font-size: 11px;
  line-height: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-dsh-chatroom-native-branch-title] { display: none !important; }

/* The branch count is enough parent context; an inset stripe reads like a
   selected-row border and makes the sidebar edge visually heavier. */
[data-dsh-chatroom-has-branches] { box-shadow: none !important; }

/* DSH 0.1.x chooses a generic gear for external settings sections. The
   settings-nav helper marks this plugin's row after the dialog mounts, so the
   shell icon can be replaced without reaching into its React tree. */
[data-dsh-chatroom-settings-nav] > svg:first-child { display: none !important; }
[data-dsh-chatroom-settings-nav]::before {
  content: '';
  flex: none;
  width: 16px;
  height: 16px;
  background: currentColor;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3Cpath d='M22 21v-2a4 4 0 0 0-3-3.87'/%3E%3Cpath d='M16 3.13a4 4 0 0 1 0 7.75'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3Cpath d='M22 21v-2a4 4 0 0 0-3-3.87'/%3E%3Cpath d='M16 3.13a4 4 0 0 1 0 7.75'/%3E%3C/svg%3E") center / contain no-repeat;
}

[data-dsh-chatroom-branch-count] {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 20px;
  margin-right: 4px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 9%, var(--dsw-alias-bg-layer-2, var(--bg-secondary, #f3f4f6)));
  color: var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff));
  font-size: 11px;
  line-height: 20px;
}

[data-dsh-chatroom-has-branches]:hover > [data-dsh-chatroom-branch-count],
[data-dsh-chatroom-has-branches]:focus-within > [data-dsh-chatroom-branch-count] {
  display: none;
}

.dsh-chatroom-group-setup {
  display: grid;
  gap: 12px;
  box-sizing: border-box;
  width: 100%;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 16px;
  background: color-mix(in srgb, var(--bg-primary, #fff) 96%, var(--brand-primary, #4f7cff));
  color: var(--text-primary, #111827);
  padding: 14px 16px;
  box-shadow: 0 12px 34px rgb(15 23 42 / 8%);
}
.dsh-chatroom-group-setup-collapsed {
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}
.dsh-chatroom-group-setup-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 12%, var(--bg-primary, #fff));
  font-size: 21px;
}
.dsh-chatroom-group-setup-collapsed > span:nth-child(2),
.dsh-chatroom-group-setup header > span:first-child { display: grid; gap: 3px; min-width: 0; }
.dsh-chatroom-group-setup strong { font-size: 14px; }
.dsh-chatroom-group-setup small { color: var(--text-secondary, #6b7280); font-size: 12px; line-height: 1.45; }
.dsh-chatroom-group-setup-collapsed > button,
.dsh-chatroom-group-setup-primary {
  border: 0;
  border-radius: 10px;
  background: var(--brand-primary, #4f7cff);
  color: #fff;
  padding: 9px 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.dsh-chatroom-group-setup header,
.dsh-chatroom-group-setup footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dsh-chatroom-group-setup header > span:last-child { flex: none; color: var(--brand-primary, #4f7cff); font-size: 12px; }
.dsh-chatroom-group-setup-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.dsh-chatroom-group-setup-fields label { display: grid; gap: 5px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-group-setup-fields input {
  min-width: 0;
  border: 1px solid var(--border-primary, #d1d5db);
  border-radius: 10px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 9px 11px;
  font: inherit;
  font-size: 13px;
  outline: none;
}
.dsh-chatroom-group-setup-fields input:focus { border-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-group-setup-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
  max-height: min(176px, 24vh);
  overflow-y: auto;
}
.dsh-chatroom-group-setup-list > label {
  display: grid;
  grid-template-columns: 18px 36px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  border-radius: 11px;
  padding: 6px 7px;
  cursor: pointer;
}
.dsh-chatroom-group-setup-list > label:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-group-setup-list input { width: 16px; height: 16px; margin: 0; accent-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-group-setup-list .dsh-chatroom-member-avatar { width: 36px; height: 36px; }
.dsh-chatroom-group-setup-list label > span:last-child { display: grid; min-width: 0; }
.dsh-chatroom-group-setup-list label strong,
.dsh-chatroom-group-setup-list label small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-group-setup-list > p { grid-column: 1 / -1; margin: 12px; color: var(--text-secondary, #6b7280); font-size: 12px; text-align: center; }
.dsh-chatroom-group-setup-secondary {
  border: 0;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 8px 4px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.dsh-chatroom-group-setup button:disabled { cursor: not-allowed; opacity: .45; }

.dsh-chatroom-new-mode { display: flex; justify-content: center; box-sizing: border-box; width: 100%; padding: 20px; }
[data-dsh-chatroom-new-session-hero] { gap: clamp(20px, 3vh, 30px) !important; }
[data-dsh-chatroom-new-session-hero] > :first-child {
  display: grid !important;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  justify-content: center;
  align-items: center;
  column-gap: 10px;
  row-gap: clamp(16px, 2.5vh, 24px);
  width: 100%;
  height: auto !important;
}
[data-dsh-chatroom-new-session-hero] > :first-child > :first-child {
  grid-column: 1 / -1;
  grid-row: 1;
  justify-self: center;
  width: 68px !important;
  height: 51px !important;
}
[data-dsh-chatroom-new-session-hero] > :first-child > :first-child svg { width: 68px !important; height: auto !important; }
[data-dsh-chatroom-new-session-hero] > :first-child > :nth-child(2) {
  grid-column: 1;
  grid-row: 2;
  font-size: clamp(28px, 3.4vw, 40px) !important;
  font-weight: 650 !important;
  letter-spacing: -.035em;
}
[data-dsh-chatroom-new-session-hero] > :first-child > :nth-child(3) {
  grid-column: 2;
  grid-row: 2;
}
[data-dsh-chatroom-new-session-switch-host] {
  display: flex !important;
  align-self: stretch !important;
  justify-content: center !important;
  box-sizing: border-box;
  width: 100% !important;
  max-width: none !important;
  padding-bottom: 18px;
}
.dsh-chatroom-new-mode-switch {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  box-sizing: border-box;
  width: min(560px, calc(100vw - 48px));
  margin-inline: auto;
  gap: 3px;
  border-radius: 999px;
  background: var(--bg-secondary, #f3f4f6);
  padding: 3px;
  isolation: isolate;
}
.dsh-chatroom-new-mode-switch::before {
  position: absolute;
  z-index: -1;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc(50% - 4.5px);
  border-radius: 999px;
  background: var(--bg-primary, #fff);
  box-shadow: 0 1px 3px rgb(15 23 42 / 8%), 0 8px 24px rgb(15 23 42 / 5%);
  content: '';
  transform: translateX(0);
  transition: transform 220ms cubic-bezier(.22, 1, .36, 1);
}
.dsh-chatroom-new-mode-switch[data-mode="solo"]::before { transform: translateX(calc(100% + 3px)); }
.dsh-chatroom-new-mode-switch > button {
  position: relative;
  z-index: 1;
  min-height: 52px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 8px 18px;
  font: inherit;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
.dsh-chatroom-new-mode-switch > button[data-active="true"],
.dsh-chatroom-new-mode-switch > button:hover {
  color: var(--text-primary, #111827);
}
@media (prefers-reduced-motion: reduce) { .dsh-chatroom-new-mode-switch::before { transition: none; } }

.dsh-chatroom-presence-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a0a7b2;
}

.dsh-chatroom-presence-dot[data-online="true"] { background: #20b26b; }

.dsh-chatroom-participant-message {
  position: relative;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-selection-mode="true"],
[data-time-hover-root][data-dsh-chatroom-selection-mode] {
  box-sizing: border-box;
  position: relative;
  padding-left: 36px !important;
}

.dsh-chatroom-selection-checkbox {
  position: absolute;
  z-index: 3;
  top: 28px;
  left: 5px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  cursor: pointer;
}

.dsh-chatroom-selection-checkbox input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.dsh-chatroom-selection-checkbox > span {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: 19px;
  height: 19px;
  border: 1.5px solid var(--border-strong, #aeb5c0);
  border-radius: 6px;
  background: var(--bg-primary, #fff);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
.dsh-chatroom-selection-checkbox input:checked + span { border-color: var(--brand-primary, #4f7cff); background: var(--brand-primary, #4f7cff); }
.dsh-chatroom-selection-checkbox input:focus-visible + span { outline: 2px solid color-mix(in srgb, var(--brand-primary, #4f7cff) 35%, transparent); outline-offset: 2px; }

.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] {
  flex-direction: row-reverse;
}

.dsh-chatroom-avatar {
  display: grid;
  flex: 0 0 38px;
  place-items: center;
  width: 38px;
  height: 38px;
  overflow: hidden;
  margin-top: 20px;
  border: 1px solid rgb(255 255 255 / 70%);
  border-radius: 13px;
  background: linear-gradient(145deg, #eaf2ff, #cbdcff);
  box-shadow: 0 4px 14px rgb(15 23 42 / 10%);
  font-size: 21px;
}

.dsh-chatroom-avatar[data-avatar="panda"],
.dsh-chatroom-avatar[data-avatar="cat"] { background: linear-gradient(145deg, #f6f2ff, #ddd3ff); }
.dsh-chatroom-avatar[data-avatar="fox"],
.dsh-chatroom-avatar[data-avatar="dog"] { background: linear-gradient(145deg, #fff1db, #ffd29b); }
.dsh-chatroom-avatar[data-avatar="rabbit"],
.dsh-chatroom-avatar[data-avatar="unicorn"] { background: linear-gradient(145deg, #ffeaf4, #ffcde4); }
.dsh-chatroom-avatar[data-avatar="octopus"] { background: linear-gradient(145deg, #e8fff6, #bfead9); }
.dsh-chatroom-avatar img,
.dsh-chatroom-member-avatar img {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
  grid-area: 1 / 1;
}
.dsh-chatroom-avatar > span,
.dsh-chatroom-member-avatar > span { grid-area: 1 / 1; }
.dsh-chatroom-avatar img + span,
.dsh-chatroom-member-avatar img + span { visibility: hidden; }

.dsh-chatroom-message-column {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  max-width: calc(100% - 48px);
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-message-column {
  align-items: flex-end;
}

.dsh-chatroom-display-name {
  max-width: min(525px, 82%);
  padding: 0 4px;
  overflow: hidden;
  color: var(--dsw-alias-label-secondary, var(--text-secondary, #6b7280));
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-display-name {
  text-align: right;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] .dsh-chatroom-display-name {
  text-align: left;
}

.dsh-chatroom-native-message {
  width: 100%;
}

.dsh-chatroom-native-message [data-ref-chip][title^="@"] > svg {
  display: none !important;
}

.dsh-chatroom-native-message [data-ref-chip][title^="@"] {
  gap: 0 !important;
}

.dsh-chatroom-native-message [data-ref-chip][title^="@"]::before {
  content: "@";
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] .dsh-chatroom-native-message [data-time-hover-root] {
  align-items: flex-start !important;
  text-align: left;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] .dsh-chatroom-native-message [data-time-hover-root] > :first-child,
.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] .dsh-chatroom-native-message [data-time-hover-root] > :first-child > * {
  align-items: flex-start !important;
  align-self: flex-start !important;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-native-message [data-time-hover-root] {
  align-items: flex-end !important;
}

.dsh-chatroom-native-message [data-time-hover-root] > :last-child > button,
[data-dsh-chatroom-native-actions] > button {
  display: none !important;
}

[data-dsh-chatroom-active] [data-time-hover-root] :is([class*="timeStart"], [class*="timeEnd"]) {
  opacity: 1 !important;
}

.dsh-chatroom-reply-quote {
  display: flex;
  flex-direction: column;
  max-width: min(525px, 82%);
  margin-bottom: 5px;
  border-left: 3px solid var(--brand-primary, #4f7cff);
  border-radius: 0 8px 8px 0;
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent);
  padding: 6px 10px;
  color: var(--text-secondary, #6b7280);
  font-size: 12px;
  line-height: 18px;
}

.dsh-chatroom-reply-quote span {
  max-width: 420px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dsh-chatroom-message-actions > button {
  border: 0;
  background: transparent;
  color: var(--text-secondary, #7b8491);
  padding: 3px 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  opacity: .72;
}

.dsh-chatroom-message-actions > button:hover { color: var(--brand-primary, #4f7cff); opacity: 1; }
.dsh-chatroom-message-actions, .dsh-chatroom-assistant-actions { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 2px; }
.dsh-chatroom-message-actions { position: relative; }
.dsh-chatroom-inline-reaction-control { position: relative; display: inline-flex; }
.dsh-chatroom-inline-reaction-control > button {
  border: 0;
  background: transparent;
  color: var(--text-secondary, #7b8491);
  padding: 3px 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  opacity: .72;
}
.dsh-chatroom-inline-reaction-control > button:hover { color: var(--brand-primary, #4f7cff); opacity: 1; }
.dsh-chatroom-action-overflow {
  position: absolute;
  z-index: 18;
  bottom: calc(100% + 5px);
  left: 0;
  display: grid;
  min-width: 196px;
  overflow: hidden;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 12px;
  background: var(--bg-primary, #fff);
  padding: 5px;
  box-shadow: 0 12px 30px rgb(15 23 42 / 18%);
}
.dsh-chatroom-action-overflow > button { border: 0; border-radius: 8px; background: transparent; color: var(--text-primary, #111827); padding: 8px 9px; font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
.dsh-chatroom-action-overflow > button:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-inline-reactions {
  position: absolute;
  z-index: 12;
  bottom: calc(100% + 5px);
  left: 0;
  display: inline-flex;
  gap: 2px;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 12px;
  background: var(--bg-primary, #fff);
  padding: 5px;
  box-shadow: 0 12px 30px rgb(15 23 42 / 18%);
}
.dsh-chatroom-action-overflow > .dsh-chatroom-inline-reactions { position: static; box-sizing: border-box; width: 100%; border: 0; border-bottom: 1px solid var(--border-primary, #e5e7eb); border-radius: 0; box-shadow: none; }
.dsh-chatroom-inline-reactions > button { display: grid; place-items: center; width: 31px; height: 31px; border: 0; border-radius: 8px; background: transparent; font-size: 17px; cursor: pointer; }
.dsh-chatroom-inline-reactions > button:hover { background: var(--bg-secondary, #f3f4f6); transform: scale(1.06); }
.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-inline-reactions,
.dsh-chatroom-thread-message[data-own="true"] .dsh-chatroom-inline-reactions { right: 0; left: auto; }
.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-action-overflow { right: 0; left: auto; }
.dsh-chatroom-assistant-tools {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: min(440px, 76vw);
  padding-top: 8px;
}

html[data-dsh-chatroom-active] [data-dsh-chatroom-native-actions] {
  align-items: flex-start !important;
  height: auto !important;
  min-height: 0 !important;
  overflow: visible !important;
}

.dsh-chatroom-assistant-turn { display: flex; min-width: 0; flex-direction: column; gap: 16px; }
[data-dsh-chatroom-process-row][hidden] { display: none !important; }
.dsh-chatroom-process-toggle {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 7px;
  min-height: 26px;
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--text-secondary, #6b7280);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
}
.dsh-chatroom-process-toggle:hover { color: var(--text-primary, #111827); }
.dsh-chatroom-process-chevron { display: inline-block; color: var(--brand-primary, #4f7cff); transform: rotate(-90deg); transition: transform .16s ease; }
.dsh-chatroom-process-toggle[aria-expanded="true"] .dsh-chatroom-process-chevron { transform: rotate(0deg); }

.dsh-chatroom-thread-activity {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: min(440px, 100%);
  margin-top: 7px;
  border: 0;
  border-left: 2px solid color-mix(in srgb, var(--brand-primary, #4f7cff) 45%, transparent);
  border-radius: 0 8px 8px 0;
  background: color-mix(in srgb, var(--bg-secondary, light-dark(#f3f4f6, #1b1b1c)) 58%, transparent);
  padding: 7px 9px;
  color: var(--text-secondary, light-dark(#6b7280, #aeb0b4));
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.dsh-chatroom-assistant-tools > .dsh-chatroom-thread-activity { margin-top: 0; }
.dsh-chatroom-thread-activity:hover { background: var(--bg-secondary, light-dark(#f3f4f6, #2c2c2e)); }
.dsh-chatroom-thread-activity:disabled { cursor: default; }
.dsh-chatroom-thread-activity-heading { font-size: 11px; font-weight: 600; }
.dsh-chatroom-thread-activity-list { display: grid; gap: 3px; }
.dsh-chatroom-thread-activity-list > span { display: grid; grid-template-columns: 22px minmax(44px, 72px) minmax(0, 1fr); gap: 7px; font-size: 11px; line-height: 16px; }
.dsh-chatroom-thread-activity-list .dsh-chatroom-member-avatar { width: 22px; height: 22px; border-radius: 7px; font-size: 12px; }
.dsh-chatroom-thread-activity-list strong,
.dsh-chatroom-thread-activity-list > span > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.dsh-chatroom-toast-stack {
  pointer-events: auto;
  position: fixed;
  top: 76px;
  right: 24px;
  z-index: 75;
  display: grid;
  gap: 10px;
  width: min(360px, calc(100vw - 32px));
}

.dsh-chatroom-toast {
  display: grid;
  gap: 5px;
  width: 100%;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 14px;
  background: color-mix(in srgb, var(--bg-primary, #fff) 94%, transparent);
  color: var(--text-primary, #111827);
  padding: 13px 15px;
  box-shadow: 0 14px 40px rgb(15 23 42 / 16%);
  font: inherit;
  text-align: left;
  cursor: pointer;
  backdrop-filter: blur(14px);
}
.dsh-chatroom-toast strong { font-size: 13px; }
.dsh-chatroom-toast strong small { color: var(--text-secondary, #6b7280); font-weight: 400; }
.dsh-chatroom-toast > span { overflow: hidden; color: var(--text-secondary, #6b7280); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }

.dsh-chatroom-member-card {
  pointer-events: auto;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 250;
  width: min(460px, 94vw);
  overflow-y: auto;
  box-sizing: border-box;
  border-left: 1px solid var(--border-primary, #e5e7eb);
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 28px 24px;
  box-shadow: -18px 0 48px rgb(15 23 42 / 14%);
}
.dsh-chatroom-member-card h2 { margin: 0 0 8px; }
.dsh-chatroom-member-card > p { margin: 0 0 18px; color: var(--text-secondary, #6b7280); }
.dsh-chatroom-invite { display: grid; gap: 10px; margin-bottom: 18px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 12px; padding: 12px; }
.dsh-chatroom-invite-heading { display: flex; align-items: start; justify-content: space-between; gap: 12px; }
.dsh-chatroom-invite-heading > div { display: grid; gap: 3px; }
.dsh-chatroom-invite-heading > span { flex: none; color: var(--brand-primary, #4f7cff); font-size: 12px; }
.dsh-chatroom-invite small { color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-invite > input { min-width: 0; border: 1px solid var(--border-primary, #d1d5db); border-radius: 9px; background: var(--bg-primary, #fff); color: var(--text-primary, #111827); padding: 8px 10px; font: inherit; }
.dsh-chatroom-invite-list { display: grid; gap: 3px; max-height: min(240px, 34vh); overflow-y: auto; }
.dsh-chatroom-invite-list > label { display: grid; grid-template-columns: 18px 38px minmax(0, 1fr); align-items: center; gap: 9px; border-radius: 10px; padding: 6px 7px; cursor: pointer; }
.dsh-chatroom-invite-list > label:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-invite-list > label > input { width: 16px; height: 16px; margin: 0; accent-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-invite-list > label > span:last-child { display: grid; min-width: 0; }
.dsh-chatroom-invite-list > label strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-invite-list > p { margin: 8px 0; color: var(--text-secondary, #6b7280); font-size: 12px; text-align: center; }
.dsh-chatroom-invite > button { border: 0; border-radius: 8px; background: var(--brand-primary, #4f7cff); padding: 9px 10px; color: #fff; font: inherit; font-size: 12px; cursor: pointer; }
.dsh-chatroom-invite > button:disabled { cursor: not-allowed; opacity: .45; }
.dsh-chatroom-manage-title { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-bottom: 14px; }
.dsh-chatroom-manage-title input { min-width: 0; border: 1px solid var(--border-primary, #d1d5db); border-radius: 9px; background: var(--bg-primary, #fff); color: var(--text-primary, #111827); padding: 8px 10px; font: inherit; }
.dsh-chatroom-manage-title button,
.dsh-chatroom-member-role { border: 1px solid var(--border-primary, #e5e7eb); border-radius: 8px; background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); padding: 6px 9px; font: inherit; font-size: 12px; cursor: pointer; }
.dsh-chatroom-manage-title button:disabled,
.dsh-chatroom-member-role:disabled { cursor: not-allowed; opacity: .45; }
.dsh-chatroom-auto-trigger {
  display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 14px;
  border: 1px solid var(--border-primary, #e5e7eb); border-radius: 12px; padding: 11px 12px;
}
.dsh-chatroom-auto-trigger > div { display: grid; gap: 3px; min-width: 0; }
.dsh-chatroom-auto-trigger small { color: var(--text-secondary, #6b7280); font-size: 12px; line-height: 18px; }
.dsh-chatroom-switch { position: relative; flex: 0 0 auto; width: 38px; height: 22px; cursor: pointer; }
.dsh-chatroom-switch input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.dsh-chatroom-switch span { display: block; width: 100%; height: 100%; border-radius: 999px; background: #cbd0d8; transition: background .16s; }
.dsh-chatroom-switch span::after { content: ""; display: block; width: 18px; height: 18px; border-radius: 50%; background: #fff; transform: translate(2px, 2px); transition: transform .16s; box-shadow: 0 1px 4px rgb(15 23 42 / 18%); }
.dsh-chatroom-switch input:checked + span { background: var(--brand-primary, #4f7cff); }
.dsh-chatroom-switch input:checked + span::after { transform: translate(18px, 2px); }
.dsh-chatroom-switch input:disabled + span { opacity: .5; }
.dsh-chatroom-member-list { display: grid; gap: 5px; max-height: min(440px, 55vh); overflow-y: auto; }
.dsh-chatroom-member {
  display: grid;
  grid-template-columns: 42px 1fr auto;
  align-items: center;
  gap: 11px;
  border-radius: 12px;
  padding: 8px 9px;
}
.dsh-chatroom-member:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-member > span:nth-child(2) { display: grid; gap: 2px; min-width: 0; }
.dsh-chatroom-member strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-member strong em { margin-left: 4px; color: var(--brand-primary, #4f7cff); font-size: 10px; font-style: normal; font-weight: 500; }
.dsh-chatroom-member small { color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-member > i { width: 8px; height: 8px; border-radius: 50%; background: #c4c9d1; }
.dsh-chatroom-member > i[data-online="true"] { background: #20b26b; box-shadow: 0 0 0 3px rgb(32 178 107 / 14%); }
.dsh-chatroom-member-avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(145deg, #eaf2ff, #cbdcff);
  font-size: 20px;
}
.dsh-chatroom-inline-avatar { display: inline-grid; width: 22px; height: 22px; place-items: center; overflow: hidden; border-radius: 7px; vertical-align: middle; }
.dsh-chatroom-notification-button {
  width: 100%;
  margin-top: 14px;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 10px;
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-primary, #111827);
  padding: 10px 14px;
  font: inherit;
  cursor: pointer;
}
.dsh-chatroom-notification-button:disabled { color: #20a466; cursor: default; }

.dsh-chatroom-thread-panel {
  pointer-events: auto;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 55;
  display: grid;
  grid-template-rows: auto 1fr auto;
  width: min(720px, 96vw);
  border-left: 1px solid var(--border-primary, light-dark(#e5e7eb, #343438));
  background: var(--bg-primary, light-dark(#fff, #151517));
  color: var(--text-primary, light-dark(#111827, #f9fafb));
  box-shadow: -18px 0 48px rgb(15 23 42 / 12%);
}
.dsh-chatroom-thread-panel[data-open="false"] { display: none; }
.dsh-chatroom-thread-frame-shell { position: relative; min-height: 0; }
.dsh-chatroom-thread-frame { display: block; width: 100%; height: 100%; border: 0; background: var(--bg-primary, light-dark(#fff, #151517)); }
.dsh-chatroom-thread-frame-status { position: absolute; inset: 0; display: grid; place-content: center; gap: 12px; background: var(--bg-primary, light-dark(#fff, #151517)); color: var(--text-secondary, light-dark(#6b7280, #aeb0b4)); font-size: 13px; text-align: center; }
.dsh-chatroom-thread-frame-status strong { color: var(--text-primary, light-dark(#111827, #f9fafb)); font-size: 14px; }
.dsh-chatroom-thread-frame-status small { color: var(--text-tertiary, light-dark(#9ca3af, #8e9095)); font-size: 11px; }
.dsh-chatroom-thread-frame-status button { border: 0; border-radius: 9px; background: var(--brand-primary, #4f7cff); color: #fff; padding: 8px 12px; font: inherit; cursor: pointer; }
.dsh-chatroom-thread-frame-error { display: grid; place-items: center; color: var(--text-secondary, light-dark(#6b7280, #aeb0b4)); }
.dsh-chatroom-thread-compatibility { display: grid; grid-template-rows: auto auto 1fr auto; min-height: 0; }
.dsh-chatroom-thread-compatibility-notice { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--border-primary, light-dark(#e5e7eb, #343438)); background: color-mix(in srgb, var(--brand-primary, #4f7cff) 6%, var(--bg-primary, light-dark(#fff, #151517))); padding: 9px 16px; color: var(--text-secondary, light-dark(#6b7280, #aeb0b4)); font-size: 12px; }
.dsh-chatroom-thread-compatibility-notice > span:last-child { display: flex; align-items: center; gap: 8px; flex: none; }
.dsh-chatroom-thread-compatibility-notice :is(a, button) { border: 0; border-radius: 8px; background: transparent; color: var(--brand-primary, #4f7cff); padding: 5px 7px; font: inherit; text-decoration: none; cursor: pointer; }
.dsh-chatroom-thread-compatibility-notice a { background: var(--brand-primary, #4f7cff); color: #fff; }
.dsh-chatroom-thread-panel > header { display: flex; align-items: center; justify-content: space-between; min-height: 64px; border-bottom: 1px solid var(--border-primary, light-dark(#e5e7eb, #343438)); background: var(--bg-primary, light-dark(#fff, #151517)); padding: 0 18px; }
.dsh-chatroom-thread-panel > header div { display: grid; gap: 2px; min-width: 0; }
.dsh-chatroom-thread-panel > header strong { font-size: 16px; }
.dsh-chatroom-thread-panel > header small { overflow: hidden; color: var(--text-secondary, light-dark(#6b7280, #aeb0b4)); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-thread-panel > header button { border: 0; background: transparent; color: var(--text-secondary, light-dark(#6b7280, #aeb0b4)); font: inherit; font-size: 25px; cursor: pointer; }
.dsh-chatroom-thread-root { display: grid; gap: 5px; margin: 14px 16px 4px; border-left: 3px solid var(--brand-primary, #4f7cff); border-radius: 0 10px 10px 0; background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent); padding: 10px 12px; }
.dsh-chatroom-thread-root strong { font-size: 12px; }
.dsh-chatroom-thread-root > div { color: var(--text-secondary, #6b7280); font-size: 13px; line-height: 1.5; }
.dsh-chatroom-thread-root p { margin: 0; }
.dsh-chatroom-thread-messages { overflow-y: auto; padding: 18px 24px 10px; }
.dsh-chatroom-thread-empty { margin: 18px; color: var(--text-secondary, #6b7280); font-size: 13px; line-height: 1.6; text-align: center; }
.dsh-chatroom-thread-message { position: relative; display: flex; align-items: flex-start; gap: 11px; margin-bottom: 20px; }
.dsh-chatroom-thread-message[data-dsh-chatroom-selection-mode="true"] { box-sizing: border-box; padding-left: 36px; }
.dsh-chatroom-thread-message[data-own="true"] { flex-direction: row-reverse; }
.dsh-chatroom-thread-message-column { display: grid; gap: 5px; width: fit-content; max-width: calc(100% - 54px); }
.dsh-chatroom-thread-message[data-own="true"] .dsh-chatroom-thread-message-column { justify-items: end; }
.dsh-chatroom-thread-message-column > strong { display: flex; gap: 7px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-thread-message time { font-weight: 400; opacity: .8; }
.dsh-chatroom-thread-message-body { max-width: 590px; border-radius: 5px 15px 15px; background: var(--bg-secondary, #f3f4f6); padding: 10px 13px; font-size: 14px; line-height: 1.58; overflow-wrap: anywhere; }
.dsh-chatroom-thread-message[data-own="true"] .dsh-chatroom-thread-message-body { border-radius: 15px 5px 15px 15px; background: color-mix(in srgb, var(--brand-primary, #4f7cff) 15%, var(--bg-primary, #fff)); }
.dsh-chatroom-thread-message[data-role="ai"] .dsh-chatroom-thread-message-body { border: 1px solid color-mix(in srgb, var(--brand-primary, #4f7cff) 25%, transparent); background: color-mix(in srgb, var(--brand-primary, #4f7cff) 6%, var(--bg-primary, #fff)); }
.dsh-chatroom-thread-message-body p:first-child { margin-top: 0; }
.dsh-chatroom-thread-message-body p:last-child { margin-bottom: 0; }
.dsh-chatroom-thread-literal-text { white-space: pre-wrap; }
.dsh-chatroom-thread-message-body :is(h1, h2, h3, h4) { margin: 1em 0 .45em; line-height: 1.3; }
.dsh-chatroom-thread-message-body h1 { font-size: 1.35em; }
.dsh-chatroom-thread-message-body h2 { font-size: 1.22em; }
.dsh-chatroom-thread-message-body h3 { font-size: 1.12em; }
.dsh-chatroom-thread-message-body :is(ul, ol) { margin: .55em 0; padding-left: 1.55em; }
.dsh-chatroom-thread-message-body li + li { margin-top: .22em; }
.dsh-chatroom-thread-message-body blockquote { margin: .7em 0; border-left: 3px solid var(--border-strong, #aeb5c0); padding-left: .8em; color: var(--text-secondary, #6b7280); }
.dsh-chatroom-thread-message-body :not(pre) > code { border-radius: 5px; background: color-mix(in srgb, var(--text-primary, #111827) 8%, transparent); padding: .12em .36em; font-size: .9em; }
.dsh-chatroom-thread-message-body pre { max-width: 100%; overflow-x: auto; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 10px; background: color-mix(in srgb, var(--text-primary, #111827) 6%, var(--bg-primary, #fff)); padding: 11px 13px; }
.dsh-chatroom-thread-message-body pre code { font-size: 12px; line-height: 1.55; white-space: pre; }
.dsh-chatroom-thread-message-body table { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; }
.dsh-chatroom-thread-message-body :is(th, td) { border: 1px solid var(--border-primary, #e5e7eb); padding: 6px 9px; text-align: left; }
.dsh-chatroom-thread-message-body a { color: var(--brand-primary, #4f7cff); text-decoration: underline; text-underline-offset: 2px; }
.dsh-chatroom-thread-reply-quote { display: grid; gap: 2px; max-width: 520px; border-left: 3px solid var(--brand-primary, #4f7cff); border-radius: 0 8px 8px 0; background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent); padding: 6px 9px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-thread-reply-quote span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-thread-composer { position: relative; display: grid; grid-template-columns: 1fr auto; gap: 8px; border-top: 1px solid var(--border-primary, #e5e7eb); padding: 12px 14px; }
.dsh-chatroom-thread-composer-reply { display: flex; grid-column: 1 / -1; align-items: center; gap: 8px; border-left: 3px solid var(--brand-primary, #4f7cff); border-radius: 0 8px 8px 0; background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent); padding: 7px 9px; }
.dsh-chatroom-thread-composer-reply span { display: flex; flex: 1; flex-direction: column; min-width: 0; overflow: hidden; color: var(--text-secondary, #6b7280); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-thread-composer-reply button { align-self: center; background: transparent; color: var(--text-secondary, #6b7280); padding: 2px 7px; }
.dsh-chatroom-thread-composer textarea { resize: none; border: 1px solid var(--border-primary, #d1d5db); border-radius: 12px; background: var(--bg-primary, #fff); color: var(--text-primary, #111827); padding: 10px 11px; font: inherit; outline: none; }
.dsh-chatroom-thread-composer textarea:focus { border-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-thread-composer button { align-self: end; border: 0; border-radius: 10px; background: var(--brand-primary, #4f7cff); color: #fff; padding: 10px 14px; font: inherit; font-weight: 600; cursor: pointer; }
.dsh-chatroom-thread-composer .dsh-chatroom-thread-composer-reply button { align-self: center; background: transparent; color: var(--text-secondary, #6b7280); padding: 2px 7px; }
.dsh-chatroom-thread-composer button:disabled { opacity: .45; cursor: not-allowed; }
.dsh-chatroom-thread-mentions { position: absolute; right: 14px; bottom: calc(100% - 4px); left: 14px; z-index: 2; overflow: hidden; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 12px; background: var(--bg-primary, #fff); box-shadow: 0 12px 32px rgb(15 23 42 / 16%); }
.dsh-chatroom-thread-mentions > button { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; border-radius: 0; background: transparent; color: var(--text-primary, #111827); padding: 9px 11px; text-align: left; cursor: pointer; }
.dsh-chatroom-thread-mentions > button[data-active="true"], .dsh-chatroom-thread-mentions > button:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-thread-mentions i { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 8px; background: color-mix(in srgb, var(--brand-primary, #4f7cff) 12%, transparent); color: var(--brand-primary, #4f7cff); font-style: normal; }
.dsh-chatroom-thread-mentions span { display: grid; gap: 1px; }
.dsh-chatroom-thread-mentions strong { font-size: 13px; }
.dsh-chatroom-thread-mentions small { color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-thread-panel > .dsh-chatroom-error { margin: 0; padding: 0 16px 12px; }

.dsh-chatroom-file-card {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(360px, 78vw);
  margin: 4px 0;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 14px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 10px 12px;
  text-decoration: none;
}

.dsh-chatroom-file-card:hover { border-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-file-icon { font-size: 20px; }
.dsh-chatroom-file-copy { display: flex; flex: 1; flex-direction: column; min-width: 0; }
.dsh-chatroom-file-copy strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-file-copy small { color: var(--text-secondary, #6b7280); font-size: 11px; }

.dsh-chatroom-file-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #59616d);
  padding: 5px 7px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.dsh-chatroom-file-button:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-file-input { display: none; }

.dsh-chatroom-composer-dock {
  display: grid;
  gap: 7px;
  width: 100%;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 12px;
  background: var(--bg-primary, #fff);
  padding: 9px 11px;
  box-shadow: 0 5px 18px rgb(15 23 42 / 6%);
}

.dsh-chatroom-context-reset {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary, #6b7280);
  font-size: 12px;
}
.dsh-chatroom-context-reset::before,
.dsh-chatroom-context-reset::after { height: 1px; flex: 1; background: var(--border-primary, #e5e7eb); content: ''; }
.dsh-chatroom-context-reset span { color: var(--text-primary, #111827); font-weight: 600; white-space: nowrap; }
.dsh-chatroom-context-reset small { color: inherit; white-space: nowrap; }

.dsh-chatroom-pending-files {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.dsh-chatroom-reply-preview {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  margin: 8px 12px 0;
  border-radius: 8px;
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-secondary, #6b7280);
  padding: 6px 9px;
}

.dsh-chatroom-reply-preview > span { display: flex; flex: 1; align-items: baseline; min-width: 0; white-space: nowrap; }
.dsh-chatroom-reply-preview strong { flex: none; font-size: 12px; }
.dsh-chatroom-reply-preview small { overflow: hidden; color: inherit; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-reply-preview button,
.dsh-chatroom-pending-file button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); font: inherit; cursor: pointer; }

.dsh-chatroom-pending-file {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 240px;
  border-radius: 8px;
  background: var(--bg-secondary, #f3f4f6);
  padding: 5px 7px;
  font-size: 12px;
}

.dsh-chatroom-pending-file > span:nth-child(2) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-send-files { border: 0; border-radius: 8px; background: var(--brand-primary, #4f7cff); color: #fff; padding: 6px 10px; font: inherit; font-size: 12px; cursor: pointer; }
.dsh-chatroom-send-files:disabled { cursor: wait; opacity: .55; }
.dsh-chatroom-file-hint { color: var(--text-secondary, #6b7280); }
.dsh-chatroom-composer-error { color: #d14343; font-size: 12px; }

.dsh-chatroom-composer-actions { position: relative; display: inline-flex; align-items: center; gap: 2px; }
.dsh-chatroom-session-controls { display: inline-flex; align-items: center; gap: 5px; }
.dsh-chatroom-session-controls button {
  border: 0;
  border-radius: 8px;
  background: transparent;
  padding: 6px 8px;
  color: var(--text-secondary, #59616d);
  font: inherit;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}
.dsh-chatroom-session-controls button:hover:not(:disabled) { background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); }
.dsh-chatroom-session-controls button:disabled { opacity: .42; cursor: not-allowed; }
.dsh-chatroom-control-error {
  overflow: hidden;
  max-width: 240px;
  color: #d14343;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-chatroom-session-controls .dsh-chatroom-quick-meeting { color: var(--text-primary, #111827); font-weight: 600; }
.dsh-chatroom-external-card {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  width: min(620px, 100%);
  margin: 10px 0;
  border: 1px solid var(--border-primary, #dfe3ea);
  border-radius: 16px;
  background: var(--bg-primary, #fff);
  box-shadow: 0 6px 20px rgb(15 23 42 / 6%);
  padding: 14px;
}
.dsh-chatroom-external-icon { display: grid; width: 40px; height: 40px; place-items: center; border-radius: 12px; background: #edf3ff; font-size: 22px; }
.dsh-chatroom-external-copy { display: grid; min-width: 0; gap: 3px; }
.dsh-chatroom-external-copy small,
.dsh-chatroom-external-copy span { overflow: hidden; color: var(--text-secondary, #6b7280); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-external-copy small em { margin-left: 5px; border-radius: 999px; background: #e8f0ff; padding: 2px 6px; color: #356ae6; font-style: normal; font-weight: 600; }
.dsh-chatroom-external-copy strong { overflow: hidden; color: var(--text-primary, #111827); font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-external-card > a { border-radius: 9px; background: #edf3ff; padding: 7px 10px; color: #356ae6; font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap; }
.dsh-chatroom-emoji-picker {
  position: absolute;
  z-index: 80;
  bottom: 42px;
  left: 0;
  display: grid;
  grid-template-columns: repeat(6, 36px);
  gap: 4px;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 14px;
  background: var(--bg-primary, #fff);
  padding: 10px;
  box-shadow: 0 14px 36px rgb(15 23 42 / 18%);
}
.dsh-chatroom-emoji-picker button { display: grid; place-items: center; width: 36px; height: 36px; border: 0; border-radius: 9px; background: transparent; font-size: 20px; cursor: pointer; }
.dsh-chatroom-emoji-picker button:hover { background: var(--bg-secondary, #f3f4f6); }

.dsh-chatroom-participant-message[data-dsh-chatroom-selected="true"],
.dsh-chatroom-thread-message[data-dsh-chatroom-selected="true"],
[data-time-hover-root][data-dsh-chatroom-selected] {
  border-radius: 12px;
  outline: 2px solid color-mix(in srgb, var(--brand-primary, #4f7cff) 45%, transparent);
  outline-offset: 5px;
}

.dsh-chatroom-reaction-bar { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 3px; }
.dsh-chatroom-reaction-bar button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 38px;
  height: 25px;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 13px;
  background: var(--bg-primary, #fff);
  padding: 1px 8px;
  font: inherit;
  cursor: pointer;
}
.dsh-chatroom-reaction-bar button[aria-pressed="true"] { border-color: var(--brand-primary, #4f7cff); background: color-mix(in srgb, var(--brand-primary, #4f7cff) 10%, transparent); }
.dsh-chatroom-reaction-bar small { color: var(--text-secondary, #6b7280); font-size: 11px; }

.dsh-chatroom-context-menu {
  position: fixed;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 228px;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 13px;
  background: var(--bg-primary, #fff);
  padding: 6px;
  box-shadow: 0 16px 42px rgb(15 23 42 / 22%);
}
.dsh-chatroom-context-menu > button { display: flex; align-items: center; gap: 9px; border: 0; border-radius: 8px; background: transparent; padding: 9px 10px; color: var(--text-primary, #111827); font: inherit; font-size: 13px; text-align: left; cursor: pointer; }
.dsh-chatroom-context-menu > button:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-context-reactions { display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px; margin-bottom: 5px; border-bottom: 1px solid var(--border-primary, #e5e7eb); padding-bottom: 6px; }
.dsh-chatroom-context-reactions button { display: grid; place-items: center; width: 34px; height: 34px; border: 0; border-radius: 8px; background: transparent; font-size: 18px; cursor: pointer; }
.dsh-chatroom-context-reactions button:hover { background: var(--bg-secondary, #f3f4f6); transform: scale(1.08); }

.dsh-chatroom-forward-card { width: min(460px, 82vw); margin-top: 6px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 13px; background: var(--bg-primary, #fff); overflow: hidden; }
.dsh-chatroom-forward-card summary { display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; cursor: pointer; list-style: none; }
.dsh-chatroom-forward-card summary::-webkit-details-marker { display: none; }
.dsh-chatroom-forward-card summary small { color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-forward-card > div { max-height: 360px; overflow-y: auto; border-top: 1px solid var(--border-primary, #e5e7eb); padding: 4px 14px; }
.dsh-chatroom-forward-card article { padding: 10px 0; border-bottom: 1px solid var(--border-primary, #e5e7eb); }
.dsh-chatroom-forward-card article:last-child { border-bottom: 0; }
.dsh-chatroom-forward-card article strong { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; }
.dsh-chatroom-forward-card article time { color: var(--text-secondary, #6b7280); font-weight: 400; }
.dsh-chatroom-forward-card article p { margin: 4px 0 0; color: var(--text-primary, #111827); font-size: 13px; line-height: 1.45; }
.dsh-chatroom-forward-text { white-space: pre-wrap; }
.dsh-chatroom-forward-image { display: block; width: min(100%, 360px); max-height: 320px; margin-top: 7px; border-radius: 10px; object-fit: contain; background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-forward-image-error { display: block; margin-top: 7px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-forward-reply { display: grid; gap: 2px; margin-top: 6px; border-left: 2px solid var(--brand-primary, #4f7cff); padding-left: 8px; color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-forward-reply span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-forward-reactions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 7px; }
.dsh-chatroom-forward-reactions span { border: 1px solid var(--border-primary, #e5e7eb); border-radius: 999px; padding: 2px 7px; font-size: 11px; }
.dsh-chatroom-recalled-message { color: var(--text-tertiary, #8b919c); font-size: 13px; font-style: italic; }

.dsh-chatroom-selection-bar { position: fixed; z-index: 170; bottom: 92px; left: 50%; display: flex; align-items: center; gap: 10px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 14px; background: var(--bg-primary, #fff); padding: 9px 12px; box-shadow: 0 12px 34px rgb(15 23 42 / 18%); transform: translateX(-50%); }
.dsh-chatroom-selection-bar strong { margin-right: 8px; font-size: 13px; }
.dsh-chatroom-selection-bar button { border: 0; border-radius: 8px; background: var(--bg-secondary, #f3f4f6); padding: 7px 10px; font: inherit; cursor: pointer; }
.dsh-chatroom-selection-bar button:first-of-type { background: var(--brand-primary, #4f7cff); color: #fff; }
.dsh-chatroom-selection-bar button:disabled { cursor: not-allowed; opacity: .45; }

.dsh-chatroom-forward-layer { z-index: 190; }
.dsh-chatroom-forward-dialog { width: min(440px, calc(100vw - 48px)); }
.dsh-chatroom-forward-targets { display: flex; flex-direction: column; gap: 7px; max-height: 360px; overflow-y: auto; }
.dsh-chatroom-forward-targets > button { display: grid; grid-template-columns: 28px 1fr auto; align-items: center; gap: 8px; width: 100%; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 10px; background: var(--bg-primary, #fff); padding: 10px; color: var(--text-primary, #111827); font: inherit; text-align: left; cursor: pointer; }
.dsh-chatroom-forward-targets > button:hover { border-color: var(--brand-primary, #4f7cff); background: color-mix(in srgb, var(--brand-primary, #4f7cff) 6%, transparent); }
.dsh-chatroom-forward-targets small { color: var(--text-secondary, #6b7280); }
.dsh-chatroom-forward-empty { border-radius: 10px; background: var(--bg-secondary, #f3f4f6); padding: 18px; color: var(--text-secondary, #6b7280); text-align: center; }

.dsh-chatroom-auth-card { width: min(460px, calc(100vw - 32px)); padding: 32px; }
.dsh-chatroom-auth-card form, .dsh-chatroom-auth-card form > label { display: grid; gap: 7px; }
.dsh-chatroom-auth-card form { gap: 14px; }
.dsh-chatroom-auth-card input, .dsh-chatroom-admin-form input, .dsh-chatroom-admin-form select {
  width: 100%; box-sizing: border-box; border: 1px solid var(--border-primary, #d8dee9); border-radius: 10px;
  background: var(--bg-primary, #fff); padding: 10px 12px; color: var(--text-primary, #111827); font: inherit;
}
.dsh-chatroom-auth-brand { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid var(--border-primary, #e5e7eb); padding-bottom: 16px; }
.dsh-chatroom-auth-brand strong { font-size: 18px; }
.dsh-chatroom-auth-brand span, .dsh-chatroom-sso-list > span { color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-auth-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 14px; border-radius: 11px; background: var(--bg-secondary, #f3f4f6); padding: 4px; }
.dsh-chatroom-auth-tabs button { border: 0; border-radius: 8px; background: transparent; padding: 8px; font: inherit; cursor: pointer; }
.dsh-chatroom-auth-tabs button[data-active="true"] { background: var(--bg-primary, #fff); box-shadow: 0 1px 4px rgb(15 23 42 / 10%); }
.dsh-chatroom-sso-list { display: grid; gap: 8px; margin-top: 18px; text-align: center; }
.dsh-chatroom-sso-list a { border: 1px solid var(--border-primary, #d8dee9); border-radius: 10px; padding: 10px; color: var(--text-primary, #111827); text-decoration: none; }
.dsh-chatroom-card-footer > div { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }

.dsh-chatroom-settings {
  display: flex; min-width: 0; max-width: 720px; flex-direction: column; gap: 20px; width: 100%; box-sizing: border-box;
  padding-bottom: 32px; overflow-x: clip; color: var(--dsw-alias-label-primary);
}
.dsh-chatroom-settings-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.dsh-chatroom-settings-header > div { min-width: 0; }
.dsh-chatroom-settings-header h2, .dsh-chatroom-settings-header p { margin: 0; }
.dsh-chatroom-settings-header h2 { font-size: 16px; line-height: 24px; font-weight: 500; }
.dsh-chatroom-settings-header p { margin-top: 2px; color: var(--dsw-alias-label-tertiary); font-size: 14px; line-height: 22px; }
.dsh-chatroom-settings-header button {
  flex: none; height: 36px; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 18px;
  background: transparent; padding: 0 14px; color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; cursor: pointer;
}
.dsh-chatroom-settings-header button:hover { background: var(--dsw-alias-interactive-bg-hover-solid); }

.dsh-chatroom-account-layer { z-index: 255; }
.dsh-chatroom-account-card { width: min(460px, calc(100vw - 32px)); padding: 0; overflow: hidden; }
.dsh-chatroom-account-card > header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-primary, #e5e7eb); padding: 18px 22px; }
.dsh-chatroom-account-card > header h2, .dsh-chatroom-account-card > header p { margin: 0; }
.dsh-chatroom-account-card > header p { margin-top: 3px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-account-card > header button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); font-size: 25px; cursor: pointer; }
.dsh-chatroom-account-card > form { margin: 20px 22px; }
.dsh-chatroom-account-card > .dsh-chatroom-error { margin: 0 22px 20px; }

.dsh-chatroom-admin-layer { z-index: 260; }
.dsh-chatroom-admin-card { width: min(1080px, calc(100vw - 40px)); max-height: calc(100vh - 40px); padding: 0; overflow: hidden; }
.dsh-chatroom-admin-card > header, .dsh-chatroom-direct-panel > header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-primary, #e5e7eb); padding: 18px 22px; }
.dsh-chatroom-admin-card > header h2, .dsh-chatroom-admin-card > header p { margin: 0; }
.dsh-chatroom-admin-card > header p { margin-top: 3px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-admin-card > header button, .dsh-chatroom-direct-panel > header button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); font-size: 25px; cursor: pointer; }
.dsh-chatroom-admin-layout { display: grid; grid-template-columns: minmax(280px, .8fr) minmax(360px, 1.2fr); gap: 22px; max-height: calc(100vh - 122px); overflow-y: auto; padding: 20px 22px 28px; }
.dsh-chatroom-admin-layout section { min-width: 0; }
.dsh-chatroom-admin-layout h3 { margin: 10px 0 12px; font-size: 15px; }
.dsh-chatroom-admin-form { display: grid; gap: 9px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 13px; padding: 13px; }
.dsh-chatroom-admin-form > button, .dsh-chatroom-user-table button, .dsh-chatroom-provider-list button { border: 0; border-radius: 8px; background: var(--brand-primary, #4f7cff); padding: 8px 10px; color: #fff; font: inherit; cursor: pointer; }
.dsh-chatroom-toggle { display: flex; align-items: center; gap: 8px; color: var(--text-secondary, #6b7280); font-size: 13px; }
.dsh-chatroom-toggle input { width: auto; }
.dsh-chatroom-mini-avatars { display: flex; flex-wrap: wrap; gap: 4px; }
.dsh-chatroom-mini-avatars button { width: 31px; height: 31px; border: 1px solid transparent; border-radius: 8px; background: var(--bg-secondary, #f3f4f6); cursor: pointer; }
.dsh-chatroom-mini-avatars button[data-selected="true"] { border-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-user-table, .dsh-chatroom-provider-list { display: grid; gap: 7px; }
.dsh-chatroom-user-table > div { display: grid; grid-template-columns: 36px minmax(110px, 1fr) 118px auto; align-items: center; gap: 8px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 11px; padding: 8px 10px; }
.dsh-chatroom-user-table > div[data-disabled="true"] { opacity: .55; }
.dsh-chatroom-user-table > div > span:first-child { display: grid; place-items: center; width: 34px; height: 34px; overflow: hidden; border-radius: 9px; background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-user-table > div > span:nth-child(2) { display: grid; }
.dsh-chatroom-user-table small, .dsh-chatroom-provider-list small { color: var(--text-secondary, #6b7280); }
.dsh-chatroom-user-table select { min-width: 0; border: 1px solid var(--border-primary, #d8dee9); border-radius: 8px; background: var(--bg-primary, #fff); padding: 7px; }
.dsh-chatroom-user-table button, .dsh-chatroom-provider-list button { background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); }
.dsh-chatroom-provider-section { grid-column: 1 / -1; }
.dsh-chatroom-admin-field { display: grid; gap: 7px; max-width: 520px; color: var(--text-secondary, #6b7280); font-size: 13px; }
.dsh-chatroom-admin-field select { border: 1px solid var(--border-primary, #d8dee9); border-radius: 9px; background: var(--bg-primary, #fff); padding: 9px 11px; color: var(--text-primary, #111827); font: inherit; }
.dsh-chatroom-provider-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.dsh-chatroom-provider-form > button { grid-column: 1 / -1; }
.dsh-chatroom-callback { overflow-wrap: anywhere; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-provider-list { margin-top: 10px; }
.dsh-chatroom-provider-list > div { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 8px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 10px; padding: 9px 11px; }
.dsh-chatroom-provider-list span { display: grid; overflow: hidden; }
.dsh-chatroom-provider-list small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-panel-status { padding: 40px; color: var(--text-secondary, #6b7280); text-align: center; }

/* Native Settings section: one bounded column, the same label hierarchy,
   module fills, hairlines, and capsule actions as Models and Agent presets. */
.dsh-chatroom-settings > .dsh-chatroom-card {
  position: static; width: 100%; min-width: 0; max-height: none; box-sizing: border-box; border: 0; border-radius: 0;
  background: transparent; padding: 0; color: var(--dsw-alias-label-primary); box-shadow: none; overflow: visible;
}
.dsh-chatroom-settings .dsh-chatroom-automation-card > header,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header {
  border-bottom: 1px solid var(--dsw-alias-border-l2); padding-bottom: 12px;
}
.dsh-chatroom-settings .dsh-chatroom-automation-card > header h2,
.dsh-chatroom-settings .dsh-chatroom-automation-card > header p,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header h2,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header p { margin: 0; }
.dsh-chatroom-settings .dsh-chatroom-automation-card > header h2,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header h2 { font-size: 14px; line-height: 22px; font-weight: 500; }
.dsh-chatroom-settings .dsh-chatroom-automation-card > header p,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header p { margin-top: 1px; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.dsh-chatroom-automation-form { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 10px; padding-top: 12px; }
.dsh-chatroom-automation-form label { display: grid; gap: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.dsh-chatroom-automation-form select { min-width: 0; height: 38px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); padding: 0 10px; font: inherit; }
.dsh-chatroom-automation-form button { height: 38px; border: 0; border-radius: 9px; background: var(--dsw-alias-brand-primary); color: #fff; padding: 0 14px; font: inherit; cursor: pointer; }
.dsh-chatroom-automation-form button:disabled { cursor: default; opacity: .4; }
.dsh-chatroom-automation-form > small { grid-column: 1 / -1; color: var(--dsw-alias-label-tertiary); }
.dsh-chatroom-prompt-form { display: grid; gap: 14px; padding-top: 12px; }
.dsh-chatroom-prompt-form label { display: grid; gap: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.dsh-chatroom-prompt-form textarea {
  width: 100%; min-height: 116px; resize: vertical; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px;
  background: var(--dsw-alias-bg-layer-1); padding: 10px 11px; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; line-height: 20px; outline: none;
}
.dsh-chatroom-prompt-form textarea:focus { border-color: var(--dsw-alias-label-primary); box-shadow: 0 0 0 1px var(--dsw-alias-label-primary); }
.dsh-chatroom-prompt-form label small,
.dsh-chatroom-prompt-card > small { color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.dsh-chatroom-prompt-form > button {
  justify-self: start; height: 36px; border: 0; border-radius: 18px; background: var(--dsw-alias-button-primary-fill); padding: 0 15px;
  color: var(--dsw-alias-label-primary-foreground); font: inherit; font-size: 14px; cursor: pointer;
}
.dsh-chatroom-prompt-form > button:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
.dsh-chatroom-prompt-form > button:disabled { cursor: default; opacity: .4; }
.dsh-chatroom-settings .dsh-chatroom-account-card > header,
.dsh-chatroom-settings .dsh-chatroom-admin-card > header {
  align-items: flex-start; border: 0; border-bottom: 1px solid var(--dsw-alias-border-l2); padding: 0 0 12px;
}
.dsh-chatroom-settings .dsh-chatroom-account-card > header h2,
.dsh-chatroom-settings .dsh-chatroom-admin-card > header h2 {
  margin: 0; color: var(--dsw-alias-label-primary); font-size: 14px; line-height: 22px; font-weight: 500;
}
.dsh-chatroom-settings .dsh-chatroom-account-card > header p,
.dsh-chatroom-settings .dsh-chatroom-admin-card > header p {
  margin: 1px 0 0; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px;
}
.dsh-chatroom-settings .dsh-chatroom-account-card > form {
  margin: 12px 0 0;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout {
  display: flex; max-height: none; flex-direction: column; gap: 28px; overflow: visible; padding: 16px 0 0;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout > section {
  display: flex; min-width: 0; flex-direction: column; gap: 10px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout > section + section {
  border-top: 1px solid var(--dsw-alias-border-l2); padding-top: 24px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout h3 {
  margin: 0; color: var(--dsw-alias-label-primary); font-size: 14px; line-height: 22px; font-weight: 500;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout h3:not(:first-child) { margin-top: 10px; }
.dsh-chatroom-settings .dsh-chatroom-admin-form {
  display: grid; min-width: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 14px; border: 0;
  border-radius: 12px; background: var(--dsw-alias-bg-module-platform); padding: 14px 16px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-form > label:not(.dsh-chatroom-toggle) {
  display: flex; min-width: 0; flex-direction: column; gap: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 18px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-form input:not([type="checkbox"]),
.dsh-chatroom-settings .dsh-chatroom-admin-form select,
.dsh-chatroom-settings .dsh-chatroom-admin-field select,
.dsh-chatroom-settings .dsh-chatroom-user-table select {
  width: 100%; min-width: 0; height: 36px; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px;
  background: var(--dsw-alias-bg-layer-3); padding: 0 11px; color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; outline: none;
}
.dsh-chatroom-settings .dsh-chatroom-admin-form input:focus,
.dsh-chatroom-settings .dsh-chatroom-admin-form select:focus,
.dsh-chatroom-settings .dsh-chatroom-admin-field select:focus,
.dsh-chatroom-settings .dsh-chatroom-user-table select:focus {
  border-color: var(--dsw-alias-label-primary); box-shadow: 0 0 0 1px var(--dsw-alias-label-primary);
}
.dsh-chatroom-settings .dsh-chatroom-admin-form > button {
  justify-self: start; min-width: 92px; height: 36px; box-sizing: border-box; border: 0; border-radius: 18px;
  background: var(--dsw-alias-button-primary-fill); padding: 0 14px; color: var(--dsw-alias-label-primary-foreground); font: inherit; font-size: 14px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-form > button:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
.dsh-chatroom-settings .dsh-chatroom-admin-form > button:disabled { cursor: default; opacity: .4; }
.dsh-chatroom-settings .dsh-chatroom-toggle {
  min-width: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 20px;
}
.dsh-chatroom-settings .dsh-chatroom-toggle input { accent-color: var(--dsw-alias-brand-primary); }
.dsh-chatroom-settings-avatar-field { min-width: 0; margin: 0; border: 0; padding: 0; }
.dsh-chatroom-settings-avatar-field legend { margin-bottom: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 18px; }
.dsh-chatroom-settings .dsh-chatroom-mini-avatars button {
  border-radius: 8px; background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary);
}
.dsh-chatroom-settings .dsh-chatroom-mini-avatars button[data-selected="true"] {
  border-color: var(--dsw-alias-brand-primary); box-shadow: 0 0 0 1px var(--dsw-alias-brand-primary);
}
.dsh-chatroom-settings .dsh-chatroom-user-table,
.dsh-chatroom-settings .dsh-chatroom-provider-list { gap: 8px; }
.dsh-chatroom-settings .dsh-chatroom-user-table > div,
.dsh-chatroom-settings .dsh-chatroom-provider-list > div {
  min-width: 0; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px;
  background: transparent; padding: 10px 12px;
}
.dsh-chatroom-settings .dsh-chatroom-user-table > div {
  grid-template-columns: 36px minmax(0, 1fr) auto;
}
.dsh-chatroom-settings .dsh-chatroom-user-table > div > span:first-child { background: var(--dsw-alias-bg-module-platform); }
.dsh-chatroom-settings .dsh-chatroom-user-table > div > span:nth-child(2) { min-width: 0; }
.dsh-chatroom-settings .dsh-chatroom-user-table strong,
.dsh-chatroom-settings .dsh-chatroom-provider-list strong { font-size: 14px; line-height: 22px; font-weight: 500; }
.dsh-chatroom-settings .dsh-chatroom-user-table small,
.dsh-chatroom-settings .dsh-chatroom-provider-list small { color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.dsh-chatroom-user-actions, .dsh-chatroom-provider-actions { display: flex; align-items: center; gap: 6px; }
.dsh-chatroom-settings .dsh-chatroom-user-actions select { width: 118px; }
.dsh-chatroom-settings .dsh-chatroom-user-actions button,
.dsh-chatroom-settings .dsh-chatroom-provider-actions button {
  height: 28px; box-sizing: border-box; border: 0; border-radius: 14px; background: transparent; padding: 0 10px;
  color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; cursor: pointer;
}
.dsh-chatroom-settings .dsh-chatroom-user-actions button:hover,
.dsh-chatroom-settings .dsh-chatroom-provider-actions button:hover { background: var(--dsw-alias-interactive-bg-hover-solid); }
.dsh-chatroom-settings .dsh-chatroom-admin-field { max-width: none; color: var(--dsw-alias-label-secondary); }
.dsh-chatroom-settings .dsh-chatroom-callback {
  margin: 0; overflow-wrap: anywhere; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px;
}
.dsh-chatroom-settings .dsh-chatroom-callback code { color: var(--dsw-alias-label-secondary); }
.dsh-chatroom-settings .dsh-chatroom-provider-section { grid-column: auto; }
.dsh-chatroom-settings .dsh-chatroom-provider-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.dsh-chatroom-settings .dsh-chatroom-provider-form > button { grid-column: 1 / -1; }
.dsh-chatroom-settings .dsh-chatroom-provider-list > div { grid-template-columns: minmax(0, 1fr) auto; }
.dsh-chatroom-settings .dsh-chatroom-provider-list span { min-width: 0; }
.dsh-chatroom-settings .dsh-chatroom-provider-list small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-settings > .dsh-chatroom-error { color: var(--dsw-alias-state-error-primary); }

[data-dsh-chatroom-direct-host] { position: relative !important; overflow: hidden !important; }
[data-dsh-chatroom-direct-host] > :not(.dsh-chatroom-direct-panel) { visibility: hidden !important; pointer-events: none !important; }
.dsh-chatroom-direct-panel {
  position: fixed;
  z-index: 250;
  inset: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-width: 0;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
}
[data-dsh-chatroom-direct-host] > .dsh-chatroom-direct-panel { position: absolute; z-index: 5; }
.dsh-chatroom-direct-panel > header {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  min-height: 68px;
  border-bottom: 1px solid var(--border-primary, #e5e7eb);
  padding: 0 24px;
}
.dsh-chatroom-direct-panel > header > div { display: grid; gap: 1px; }
.dsh-chatroom-direct-panel > header strong { font-size: 15px; }
.dsh-chatroom-direct-panel > header small { overflow: hidden; color: var(--text-secondary, #6b7280); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-direct-panel > header button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); font-size: 25px; cursor: pointer; }
.dsh-chatroom-direct-header-avatar,
.dsh-chatroom-direct-message-avatar { display: grid; place-items: center; overflow: hidden; background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-direct-header-avatar { width: 38px; height: 38px; border-radius: 11px; }
.dsh-chatroom-direct-message-avatar { flex: 0 0 38px; width: 38px; height: 38px; border-radius: 12px; }
.dsh-chatroom-direct-header-avatar img,
.dsh-chatroom-direct-message-avatar img { width: 100%; height: 100%; object-fit: cover; }
.dsh-chatroom-direct-messages {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  min-height: 0;
  flex-direction: column;
  gap: 22px;
  overflow-y: auto;
  padding: 30px max(24px, calc((100% - 920px) / 2)) 120px;
}
.dsh-chatroom-direct-messages article { display: flex; align-items: flex-start; gap: 10px; max-width: min(76%, 720px); }
.dsh-chatroom-direct-messages article[data-own="true"] { align-self: flex-end; flex-direction: row-reverse; text-align: right; }
.dsh-chatroom-direct-messages article > div { display: grid; min-width: 0; }
.dsh-chatroom-direct-messages article strong,
.dsh-chatroom-direct-messages article time { color: var(--text-secondary, #6b7280); font-size: 11px; font-weight: 500; }
.dsh-chatroom-direct-messages article p {
  margin: 4px 0;
  border-radius: 16px;
  background: var(--bg-secondary, #f3f4f6);
  padding: 10px 14px;
  color: var(--text-primary, #111827);
  text-align: left;
  white-space: pre-wrap;
}
.dsh-chatroom-direct-messages article[data-own="true"] p { background: color-mix(in srgb, var(--brand-primary, #4f7cff) 14%, var(--bg-primary, #fff)); }
.dsh-chatroom-direct-media { display: grid; gap: 8px; margin: 4px 0; }
.dsh-chatroom-direct-media > a:not(.dsh-chatroom-direct-file) { display: block; overflow: hidden; border-radius: 14px; }
.dsh-chatroom-direct-media img { display: block; max-width: min(420px, 100%); max-height: 340px; object-fit: contain; }
.dsh-chatroom-direct-file {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-width: min(320px, 65vw);
  border: 1px solid var(--border-primary, #dfe3ea);
  border-radius: 13px;
  background: var(--bg-primary, #fff);
  padding: 10px 12px;
  color: var(--text-primary, #111827);
  text-align: left;
  text-decoration: none;
}
.dsh-chatroom-direct-file > span:nth-child(2) { display: grid; min-width: 0; }
.dsh-chatroom-direct-file strong { overflow: hidden; color: inherit !important; font-size: 13px !important; font-weight: 600 !important; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-direct-file small { color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-direct-composer {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  box-sizing: border-box;
  width: calc(100% - 48px);
  min-height: 112px;
  margin: 0 auto 18px;
  border: 1px solid var(--border-primary, #dfe3ea);
  border-radius: 22px;
  background: var(--bg-primary, #fff);
  box-shadow: 0 8px 28px rgb(15 23 42 / 8%);
  padding: 13px 14px 10px 18px;
}
.dsh-chatroom-direct-composer textarea { width: 100%; min-height: 52px; resize: none; border: 0; outline: 0; background: transparent; padding: 4px 0; color: var(--text-primary, #111827); font: inherit; line-height: 1.5; }
.dsh-chatroom-direct-pending-files { display: flex; min-width: 0; flex-wrap: wrap; gap: 6px; }
.dsh-chatroom-direct-pending-files > span { display: inline-flex; max-width: 260px; align-items: center; gap: 5px; border-radius: 8px; background: var(--bg-secondary, #f3f4f6); padding: 5px 7px; font-size: 12px; }
.dsh-chatroom-direct-pending-files > span > span:nth-child(2) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-direct-pending-files button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); cursor: pointer; }
.dsh-chatroom-direct-composer-tools { display: flex; position: relative; align-items: center; gap: 6px; }
.dsh-chatroom-direct-composer-tools > button,
.dsh-chatroom-direct-emoji-root > button { border: 0; border-radius: 9px; background: transparent; padding: 7px 8px; color: var(--text-secondary, #6b7280); font: inherit; font-size: 13px; cursor: pointer; }
.dsh-chatroom-direct-composer-tools > button:hover,
.dsh-chatroom-direct-emoji-root > button:hover { background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); }
.dsh-chatroom-direct-composer-tools > input { display: none; }
.dsh-chatroom-direct-composer-tools > small { margin-left: 4px; color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-direct-emoji-root { position: relative; }
.dsh-chatroom-direct-emoji-picker {
  position: absolute;
  z-index: 20;
  bottom: calc(100% + 8px);
  left: 0;
  display: grid;
  grid-template-columns: repeat(6, 34px);
  gap: 3px;
  border: 1px solid var(--border-primary, #dfe3ea);
  border-radius: 13px;
  background: var(--bg-primary, #fff);
  box-shadow: 0 12px 38px rgb(15 23 42 / 14%);
  padding: 8px;
}
.dsh-chatroom-direct-emoji-picker button { display: grid; width: 34px; height: 34px; place-items: center; border: 0; border-radius: 8px; background: transparent; font-size: 20px; cursor: pointer; }
.dsh-chatroom-direct-emoji-picker button:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-direct-composer-tools .dsh-chatroom-direct-send {
  display: grid;
  width: 42px;
  height: 42px;
  margin-left: auto;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: var(--brand-primary, #4f7cff);
  padding: 0;
  color: #fff;
  font: inherit;
  font-size: 24px;
  cursor: pointer;
}
.dsh-chatroom-direct-composer-tools .dsh-chatroom-direct-send:hover { background: var(--brand-primary, #4f7cff); color: #fff; }
.dsh-chatroom-direct-composer button:disabled { opacity: .45; cursor: not-allowed; }
.dsh-chatroom-direct-empty { display: grid; place-items: center; min-height: 0; color: var(--text-secondary, #6b7280); }
.dsh-chatroom-direct-panel > .dsh-chatroom-error { margin: 0 24px 16px; }

.dsh-chatroom-wecom-account-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.dsh-chatroom-wecom-account-row > span { color: var(--text-secondary, #6b7280); }
.dsh-chatroom-wecom-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
.dsh-chatroom-wecom-account-row button,
.dsh-chatroom-wecom-retry {
  border: 0;
  border-radius: 10px;
  background: var(--brand-primary, #4f7cff);
  padding: 8px 13px;
  color: #fff;
  font: inherit;
  cursor: pointer;
}
.dsh-chatroom-wecom-auth-layer { z-index: 390; }
.dsh-chatroom-wecom-auth-card { width: min(440px, calc(100vw - 32px)); text-align: center; }
.dsh-chatroom-wecom-auth-card > header { text-align: left; }
.dsh-chatroom-wecom-qr { display: block; width: min(280px, 72vw); height: auto; margin: 18px auto 8px; border-radius: 14px; }
.dsh-chatroom-wecom-auth-success { display: grid; place-items: center; gap: 10px; padding: 28px; color: #15803d; }
.dsh-chatroom-wecom-auth-success > span { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 50%; background: #dcfce7; font-size: 28px; }
.dsh-chatroom-wecom-retry { margin-top: 12px; }
.dsh-chatroom-wecom-retry:disabled { cursor: wait; opacity: .55; }
.dsh-chatroom-wecom-inline-qr { display: grid; justify-items: center; gap: 8px; margin-top: 16px; padding: 18px; border: 1px solid var(--border-color, #e5e7eb); border-radius: 14px; }
.dsh-chatroom-wecom-inline-qr img { display: block; width: min(280px, 72vw); height: auto; border-radius: 12px; }
.dsh-chatroom-wecom-inline-qr p { margin: 0; color: var(--text-secondary, #6b7280); }
.dsh-chatroom-direct-messages .dsh-chatroom-external-card { width: min(620px, 70vw); text-align: left; }
.dsh-chatroom-direct-composer-tools .dsh-chatroom-direct-meeting { color: var(--text-primary, #111827); font-weight: 600; }

html[data-dsh-chatroom-branch-frame] [data-shell-overlay] { display: none !important; }
html[data-dsh-chatroom-installed] [data-conversation-scroll] {
  --dsh-chat-content-width: 100%;
  --dsh-composer-card-max-width: 100%;
  --dsh-composer-side-clearance: clamp(8px, 1.2vw, 16px);
}
html[data-dsh-chatroom-active] [data-time-hover-root] > :last-child > button { display: none !important; }
html[data-dsh-chatroom-branch-frame] [data-dsh-chatroom-branch-shell] {
  grid-template-columns: 0 minmax(0, 1fr) 0 !important;
}
html[data-dsh-chatroom-branch-frame] [data-dsh-chatroom-branch-shell] > :first-child,
html[data-dsh-chatroom-branch-frame] [data-dsh-chatroom-branch-shell] > :nth-child(3),
html[data-dsh-chatroom-branch-frame] [data-dsh-chatroom-branch-shell] > [data-side] { display: none !important; }
html[data-dsh-chatroom-branch-frame] [data-dsh-chatroom-branch-shell] > :nth-child(2) {
  grid-column: 2 !important;
  min-width: 0;
}

@media (max-width: 640px) {
  .dsh-chatroom-session-controls button { padding-inline: 5px; }
  .dsh-chatroom-control-error { max-width: 100px; }
  .dsh-chatroom-external-card { grid-template-columns: 36px minmax(0, 1fr); }
  .dsh-chatroom-external-card > a { grid-column: 2; justify-self: start; }
  [data-dsh-chatroom-branch-row] {
    min-height: 44px !important;
    height: 44px !important;
    margin-inline-start: 14px !important;
  }
  [data-dsh-chatroom-branch-marker] {
    flex-basis: 20px;
    width: 20px;
    height: 20px;
    margin-right: 5px;
  }
  [data-dsh-chatroom-branch-badge] { padding-inline: 4px; }
  [data-dsh-chatroom-branch-parent] { font-size: 10px; }
  .dsh-chatroom-group-setup-collapsed { grid-template-columns: 38px minmax(0, 1fr); }
  .dsh-chatroom-group-setup-collapsed > button { grid-column: 1 / -1; width: 100%; }
  .dsh-chatroom-group-setup-fields,
  .dsh-chatroom-group-setup-list { grid-template-columns: 1fr; }
  .dsh-chatroom-avatar-grid { grid-template-columns: repeat(4, 1fr); }
  .dsh-chatroom-avatar { flex-basis: 34px; width: 34px; height: 34px; font-size: 19px; }
  .dsh-chatroom-message-column { max-width: calc(100% - 44px); }
  .dsh-chatroom-context-menu { width: 216px; }
  .dsh-chatroom-selection-bar { bottom: 84px; width: calc(100vw - 28px); justify-content: center; }
  .dsh-chatroom-action-label { display: none; }
  .dsh-chatroom-message-actions > button,
  .dsh-chatroom-inline-reaction-control > button { min-width: 30px; min-height: 30px; font-size: 14px; }
  .dsh-chatroom-thread-panel { width: 100vw; box-shadow: none; }
  .dsh-chatroom-member-card { width: 100vw; box-shadow: none; }
  .dsh-chatroom-thread-panel > header { min-height: 54px; padding: 0 12px; }
  .dsh-chatroom-action-overflow {
    position: fixed;
    right: 12px;
    bottom: 72px;
    left: 12px;
    min-width: 0;
    border-radius: 16px;
    padding: 8px;
    box-shadow: 0 18px 54px rgb(15 23 42 / 26%);
  }
  .dsh-chatroom-inline-reactions { justify-content: space-around; }
  .dsh-chatroom-admin-card { width: 100vw; max-height: 100vh; border-radius: 0; }
  .dsh-chatroom-settings > .dsh-chatroom-admin-card { width: 100%; max-height: none; border-radius: 14px; }
  .dsh-chatroom-admin-layout { grid-template-columns: 1fr; max-height: calc(100vh - 82px); }
  .dsh-chatroom-provider-section { grid-column: auto; }
  .dsh-chatroom-provider-form { grid-template-columns: 1fr; }
  .dsh-chatroom-provider-form > button { grid-column: auto; }
  .dsh-chatroom-user-table > div { grid-template-columns: 34px 1fr auto; }
  .dsh-chatroom-user-table select { grid-column: 2; }
  .dsh-chatroom-settings-header { flex-direction: column; }
  .dsh-chatroom-settings .dsh-chatroom-admin-form,
  .dsh-chatroom-settings .dsh-chatroom-provider-form { grid-template-columns: 1fr; }
  .dsh-chatroom-settings .dsh-chatroom-provider-form > button { grid-column: auto; }
  .dsh-chatroom-settings .dsh-chatroom-user-table > div { grid-template-columns: 34px minmax(0, 1fr); }
  .dsh-chatroom-settings .dsh-chatroom-user-actions { grid-column: 2; flex-wrap: wrap; }
  .dsh-chatroom-settings .dsh-chatroom-provider-list > div { grid-template-columns: 1fr; }
  .dsh-chatroom-settings .dsh-chatroom-provider-actions { justify-content: flex-end; }
  .dsh-chatroom-direct-messages { padding-inline: 16px; }
  .dsh-chatroom-direct-messages article { max-width: 88%; }
  .dsh-chatroom-direct-composer { width: calc(100% - 24px); margin-bottom: 10px; }
}
`,document.head.append(s);let c=jo(t),l=Zs(e.get(`settingsScope`)),u=xo(t.api,o),d=os(o,n),f=wo(o),p=a,m=!1,h=()=>{let e=p;if(e===void 0||m)return;let t=n.list.getSnapshot();ae(e,{current:t.current===void 0?void 0:String(t.current),byId:t.byId},e=>{n.open(e)})&&(m=!0,ne(e.parentSessionId),oe(e))},g=e=>{if(a===void 0||e.origin!==globalThis.location.origin||e.source!==globalThis.parent)return;let t=k(e.data);if(t!==void 0){if(p!==void 0&&te(p,t)){h();return}p=t,m=!1,le(),o.switchBranchFrame(t),h()}};globalThis.addEventListener(`message`,g);let _=()=>{h(),o.resumeOpen();let e=n.list.getSnapshot(),t=e.current,r=t===void 0?void 0:e.byId[t];t!==void 0&&r?.blank===!0&&r.origin!==`subagent`&&o.roomForSession(String(t))===void 0&&o.newSessionMode(String(t))===void 0&&o.registerNewSession(String(t)),o.activateSession(t===void 0?void 0:String(t),r?.displayTitle??`新会话`,a===void 0&&r?.origin!==`subagent`)},v=n.list.subscribe(_);return o.start().then(async()=>{if(_(),typeof location>`u`)return;let e=E(location,a);e!==void 0&&await o.selectRoom(e)}),()=>{v(),globalThis.removeEventListener(`message`,g),u(),f(),d(),l(),c(),o.stop(),s.remove(),i?.disconnect(),document.documentElement.removeAttribute(`data-dsh-chatroom-installed`),a!==void 0&&(le(),document.documentElement.removeAttribute(`data-dsh-chatroom-branch-frame`))}},`chatroom: browser state and styles`);let s=nc(o),c=rc(o);e.effect(()=>i.registerSource(s),`chatroom: AI mention source`),e.effect(()=>i.registerSource(c),`chatroom: member mention source`),e.slots.inject(`shell.overlay`,()=>e.slots.register({name:`shell.overlay`,id:`chatroom`,order:0,inject:()=>({hooks:{chatroom:o},openRoom:o.openRoom,closeRoom:o.closeRoom,join:o.join,login:o.login,register:o.register,logout:o.logout,openAccount:o.openAccount,closeAccount:o.closeAccount,changePassword:o.changePassword,selectRoom:o.selectRoom,createRoom:o.createRoom,resetIdentity:o.resetIdentity,retry:o.retry,closeMembers:o.closeMembers,renameRoom:o.renameRoom,setMemberRole:o.setMemberRole,addRoomMembers:o.addRoomMembers,setRoomAutoTrigger:o.setRoomAutoTrigger,closeThread:o.closeThread,setThreadReply:o.setThreadReply,clearThreadReply:o.clearThreadReply,sendThreadMessage:o.sendThreadMessage,enableSystemNotifications:o.enableSystemNotifications,dismissToast:o.dismissToast,toggleReaction:o.toggleReaction,recallMessage:o.recallMessage,openForward:o.openForward,closeForward:o.closeForward,forwardSelected:o.forwardSelected,toggleMessageSelection:o.toggleMessageSelection,clearMessageSelection:o.clearMessageSelection,openAdmin:o.openAdmin,closeAdmin:o.closeAdmin,adminCreateUser:o.adminCreateUser,adminUpdateUser:o.adminUpdateUser,adminSetSelfRegistration:o.adminSetSelfRegistration,adminSetAutoRedirectProvider:o.adminSetAutoRedirectProvider,adminSaveProvider:o.adminSaveProvider,adminDeleteProvider:o.adminDeleteProvider,loadAutomation:o.loadAutomation,saveAutomation:o.saveAutomation,openDirect:o.openDirect,closeDirect:o.closeDirect,sendDirect:o.sendDirect,quickDirectMeeting:o.quickDirectMeeting,loadWecomAuthorization:o.loadWecomAuthorization,startWecomAuthorization:o.startWecomAuthorization,disconnectWecomAuthorization:o.disconnectWecomAuthorization,rebindWecomAuthorization:o.rebindWecomAuthorization})},oa)),e.slots.inject(`settings.section`,()=>e.slots.register({name:`settings.section`,id:`chatroom`,order:30,label:()=>`群聊与账号`,inject:()=>({hooks:{chatroom:o},closeAccount:o.closeAccount,changePassword:o.changePassword,openAdmin:o.openAdmin,closeAdmin:o.closeAdmin,adminCreateUser:o.adminCreateUser,adminUpdateUser:o.adminUpdateUser,adminSetSelfRegistration:o.adminSetSelfRegistration,adminSetAutoRedirectProvider:o.adminSetAutoRedirectProvider,adminSaveProvider:o.adminSaveProvider,adminDeleteProvider:o.adminDeleteProvider,loadAutomation:o.loadAutomation,saveAutomation:o.saveAutomation,openDirect:o.openDirect,closeDirect:o.closeDirect,sendDirect:o.sendDirect,quickDirectMeeting:o.quickDirectMeeting,loadWecomAuthorization:o.loadWecomAuthorization,startWecomAuthorization:o.startWecomAuthorization,disconnectWecomAuthorization:o.disconnectWecomAuthorization,rebindWecomAuthorization:o.rebindWecomAuthorization})},pe)),e.effect(()=>Js(()=>`群聊与账号`),`chatroom: settings navigation icon`),e.slots.inject(`conversation.session.header.actions`,()=>e.slots.register({name:`conversation.session.header.actions`,id:`chatroom-identity`,order:-5,inject:()=>({hooks:{chatroom:o},openMembers:o.openMembers})},Fo)),e.slots.inject(`conversation.input.left`,()=>e.slots.register({name:`conversation.input.left`,id:`chatroom-files`,order:-20,inject:()=>({hooks:{chatroom:o},addFiles:o.addFiles,removeFile:o.removeFile,clearReply:o.clearReply,sendFiles:o.sendFiles,resolveTarget:o.agentTargetForSession.bind(o)})},Ia)),e.slots.inject(`conversation.input.right`,()=>e.slots.register({name:`conversation.input.right`,id:`chatroom-session-controls`,order:-30,inject:()=>({hooks:{chatroom:o},resolveTarget:o.agentTargetForSession.bind(o),stopRoomSession:o.stopRoomSession,newRoomSession:o.newRoomSession,quickMeeting:o.quickMeeting})},La)),e.slots.inject(`conversation.input.dock`,()=>e.slots.register({name:`conversation.input.dock`,id:`chatroom-group-setup`,order:-30,inject:()=>({hooks:{chatroom:o},registerNewSession:o.registerNewSession,newSessionMode:o.newSessionMode,chooseNewSessionMode:o.chooseNewSessionMode})},Ao)),e.slots.inject(`conversation.input.dock`,()=>e.slots.register({name:`conversation.input.dock`,id:`chatroom-composition`,order:-20,inject:()=>({hooks:{chatroom:o},addFiles:o.addFiles,removeFile:o.removeFile,clearReply:o.clearReply,sendFiles:o.sendFiles,resolveTarget:o.agentTargetForSession.bind(o)})},Ra)),e.slots.inject(`conversation.input.attachments`,()=>ec(()=>e.slots.entries(`conversation.input.attachments`).find(e=>(e.options.priority??0)===0)?.component,t=>e.slots.subscribe(`conversation.input.attachments`,t),t=>e.slots.register({name:`conversation.input.attachments`,priority:-10,locale:`conversation`,inject:()=>({hooks:{chatroom:o},nativeAttachmentsView:t,clearReply:o.clearReply,resolveTarget:o.agentTargetForSession.bind(o)})},Ba))),e.slots.inject(`conversation.chat.assistant-actions`,()=>e.slots.register({name:`conversation.chat.assistant-actions`,id:`chatroom-reply`,order:5,inject:()=>({hooks:{chatroom:o},resolveTarget:o.agentTargetForSession.bind(o),setReply:o.setReply,openThread:o.openThread,toggleReaction:o.toggleReaction,recallMessage:o.recallMessage,openForward:o.openForward,toggleMessageSelection:o.toggleMessageSelection})},pa)),e.slots.inject(`conversation.chat.node`,()=>ec(()=>e.slots.entries(`conversation.chat.node`).find(e=>e.options.key===`assistant-step`&&(e.options.priority??0)===0)?.component,t=>e.slots.subscribe(`conversation.chat.node`,t),t=>e.slots.register({name:`conversation.chat.node`,key:`assistant-step`,priority:-10,locale:`conversation`,inject:()=>({nativeMessageView:t,resolveTarget:o.agentTargetForSession.bind(o)})},Pa))),e.slots.inject(`conversation.chat.node`,()=>ec(()=>e.slots.entries(`conversation.chat.node`).find(e=>e.options.key===`user`&&(e.options.priority??0)===0)?.component,t=>e.slots.subscribe(`conversation.chat.node`,t),t=>e.slots.register({name:`conversation.chat.node`,key:`user`,priority:-10,locale:`conversation`,inject:()=>tc(o,t)},Wa))),e.slots.inject(`conversation.chat.node`,()=>ec(()=>e.slots.entries(`conversation.chat.node`).find(e=>e.options.key===`steering`&&(e.options.priority??0)===0)?.component,t=>e.slots.subscribe(`conversation.chat.node`,t),t=>e.slots.register({name:`conversation.chat.node`,key:`steering`,priority:-10,locale:`conversation`,inject:()=>tc(o,t)},Ga)))}function Zs(e){if(!Qs(e))return()=>void 0;let t=e.describe();return!$s(t)||t.persistence!==`memory`?()=>void 0:(t.persistence=`host`,t.load(),()=>{t.persistence===`host`&&(t.persistence=`memory`)})}function Qs(e){return typeof e==`object`&&!!e&&typeof e.describe==`function`}function $s(e){return typeof e==`object`&&!!e&&(e.persistence===`host`||e.persistence===`memory`)&&typeof e.load==`function`}function ec(e,t,n){let r,i,a=()=>{let t=e();if(t===r)return;let a=i;i=void 0,r=void 0,a?.(),t!==void 0&&(r=t,i=n(t))},o=t(a);return a(),()=>{o(),i?.(),i=void 0,r=void 0}}function tc(e,t){return{hooks:{chatroom:e},resolveTarget:e.agentTargetForSession.bind(e),nativeMessageView:t,setReply:e.setReply,openThread:e.openThread,toggleReaction:e.toggleReaction,recallMessage:e.recallMessage,openForward:e.openForward,toggleMessageSelection:e.toggleMessageSelection}}function nc(e){return{trigger:`@`,name:`AI 助手`,order:-100,async candidates(t,{query:n}){let r=e.roomForSession(String(t.sessionId)),i=r===void 0&&e.newSessionMode(String(t.sessionId))===`group`;if(r===void 0&&!i)return[];let a=[{name:ac(r?.aiDisplayName??`DeepSeek`),icon:`✦`,description:r===void 0?`创建群聊后立即回复`:`提及后回复`}],o=n.toLocaleLowerCase();return a.filter(e=>e.name.toLocaleLowerCase().includes(o))},lexicon(t){let n=e.roomForSession(String(t.sessionId));return n===void 0?e.newSessionMode(String(t.sessionId))===`group`?[`AI`,`DeepSeek`]:[]:[...new Set([`AI`,n.aiDisplayName])]},subscribeLexicon(t,n){return e.subscribe(n)},onPick({candidate:e}){return{text:`@${oc(e.name)} `}}}}function rc(e){return{trigger:`@`,name:`群聊成员`,order:-90,async candidates(t,{query:n}){let r=e.roomForSession(String(t.sessionId)),i=r===void 0&&e.newSessionMode(String(t.sessionId))===`group`;if(r===void 0&&!i)return[];i&&e.getSnapshot().directPeers.length===0&&await e.loadDirectDirectory();let a=e.getSnapshot(),o=r===void 0?a.directPeers.filter(e=>e.participantId!==a.identity?.participantId).map(e=>({name:ro(e,a.directPeers),icon:_(e.avatarId,e.participantId).emoji,description:`创建群聊时自动邀请 · @${e.username}`})):a.members.filter(e=>e.participantId!==a.identity?.participantId).map(e=>({name:e.displayName,icon:_(e.avatarId,e.participantId).emoji,description:e.online?`在线成员`:`群成员`})),s=n.toLocaleLowerCase();return o.filter((e,t,n)=>n.findIndex(t=>t.name===e.name)===t).filter(e=>e.name.toLocaleLowerCase().includes(s))},lexicon(t){let n=e.roomForSession(String(t.sessionId)),r=e.getSnapshot();return n===void 0?e.newSessionMode(String(t.sessionId))===`group`?[...new Set(r.directPeers.filter(e=>e.participantId!==r.identity?.participantId).map(e=>ro(e,r.directPeers)))]:[]:[...new Set(r.members.filter(e=>e.participantId!==r.identity?.participantId).map(e=>e.displayName))]},subscribeLexicon(t,n){return e.subscribe(n)},onPick({candidate:e}){return{text:`@${e.name} `}}}}let ic=`（AI 助手）`;function ac(e){return`${e}${ic}`}function oc(e){return e.endsWith(ic)?e.slice(0,-7):e}var sc={inject:Ys,apply:Xs};return n.activateRemoteSettingsMirror=Zs,n.apply=Xs,n.createChatroomAiSource=nc,n.createChatroomMemberSource=rc,n.default=sc,n.inject=Ys,n.mountAfterNativeMessageView=ec,t.exports}});
//# sourceMappingURL=client.js.map