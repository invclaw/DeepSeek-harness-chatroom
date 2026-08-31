import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { CHATROOM_AVATARS, type ChatroomAvatarId } from '../avatars.js'
import { ChatroomAvatar } from './ChatroomAvatar.js'
import type { ChatroomView } from './store.js'
import { ChatroomAvatarView } from './ChatroomAvatarView.js'
import { ChatroomExternalCardView } from './ChatroomExternalCard.js'
import { CHATROOM_API_PREFIX } from '../routes.js'

const DIRECT_MESSAGE_EMOJIS = ['😀', '😄', '😂', '🥰', '😍', '🤔', '😮', '😭', '👍', '👏', '🙏', '🎉', '❤️', '🔥', '✨', '✅', '👀', '🚀'] as const

export interface ChatroomAccountPanelProps {
  readonly room: ChatroomView
  closeAccount(): void
  changePassword(currentPassword: string, newPassword: string): Promise<boolean>
  closeAdmin(): void
  openAdmin(): Promise<void>
  adminCreateUser(input: { username: string; password: string; displayName: string; avatarId: string; role: 'super-admin' | 'admin' | 'member' }): Promise<boolean>
  adminUpdateUser(userId: string, patch: { role?: 'super-admin' | 'admin' | 'member'; status?: 'active' | 'disabled' }): Promise<boolean>
  adminSetSelfRegistration(value: boolean): Promise<boolean>
  adminSetAutoRedirectProvider(providerId?: string): Promise<boolean>
  adminSaveProvider(input: { id: string; label: string; enabled: boolean; issuer: string; clientId: string; clientSecret?: string; scopes: string; usernameClaim: string; displayNameClaim: string; autoCreateUsers: boolean }): Promise<boolean>
  adminDeleteProvider(providerId: string): Promise<boolean>
  loadAutomation?(): Promise<void>
  saveAutomation?(provider: string, model: string, mainAgentPrompt: string, controllerPrompt: string): Promise<boolean>
  openDirect(peerId?: string): Promise<void>
  closeDirect(): void
  sendDirect(text: string, files?: readonly File[]): Promise<boolean>
  quickDirectMeeting?(conversationId: string): Promise<boolean>
  loadWecomAuthorization?(): Promise<ChatroomView['wecomAuthorization']>
  startWecomAuthorization?(): Promise<boolean>
  closeWecomAuthorization?(): void
}

interface OidcProviderForm {
  readonly id: string
  readonly label: string
  readonly enabled: boolean
  readonly issuer: string
  readonly clientId: string
  readonly clientSecret?: string
  readonly scopes: string
  readonly usernameClaim: string
  readonly displayNameClaim: string
  readonly autoCreateUsers: boolean
}

/** Super-administrator and private-message panels independent from native Agent Sessions. */
export function ChatroomAccountPanels(props: ChatroomAccountPanelProps): JSX.Element {
  return <>
    {props.room.directOpen && <DirectPanel {...props} />}
    {props.room.wecomAuthorizationOpen && <WecomAuthorizationDialog {...props} />}
  </>
}

interface ChatroomSettingsInjected extends Omit<ChatroomAccountPanelProps, 'room'> {
  readonly hooks: { readonly chatroom: { readonly getSnapshot: () => ChatroomView; readonly subscribe: (listener: () => void) => () => void } }
}

type ChatroomSettingsSectionProps = PropsRuntime<'settings.section'> & InjectFace<ChatroomSettingsInjected>

/** Account, registration, and enterprise-login controls inside native Harness Settings. */
export function ChatroomSettingsSection(props: ChatroomSettingsSectionProps): JSX.Element {
  const room = props.useChatroom(snapshot => snapshot)
  const panelProps: ChatroomAccountPanelProps = { ...props, room }
  const superAdmin = room.auth.account?.role === 'super-admin'
  useEffect(() => {
    if (superAdmin) void props.openAdmin()
  }, [superAdmin])
  useEffect(() => {
    void props.loadAutomation?.()
    void props.loadWecomAuthorization?.()
  }, [])
  return <div className="dsh-chatroom-settings" data-testid="chatroom-settings">
    <header className="dsh-chatroom-settings-header">
      <div><h2>群聊与账号</h2><p>管理个人账号、平台成员和企业统一登录。</p></div>
    </header>
    <AutomationPanel {...panelProps} />
    <PromptPanel {...panelProps} />
    <WecomAccountPanel {...panelProps} />
    <AccountPanel {...panelProps} embedded />
    {superAdmin && <AdminPanel {...panelProps} embedded />}
  </div>
}

function WecomAccountPanel(props: ChatroomAccountPanelProps): JSX.Element {
  const authorization = props.room.wecomAuthorization
  return <section className="dsh-chatroom-card dsh-chatroom-wecom-account" aria-label="企业微信账号">
    <header><div><h2>企业微信账号</h2><p>每个平台账号单独授权；会议和文档操作使用当前登录用户的企业微信身份。</p></div></header>
    <div className="dsh-chatroom-wecom-account-row">
      <span>{authorization?.enabled !== true
        ? '当前服务未启用企业微信 CLI'
        : authorization.status === 'authorized'
          ? '已连接'
          : authorization.status === 'pending' ? '等待扫码确认' : '尚未连接'}</span>
      {authorization?.enabled === true && authorization.status !== 'authorized' && <button
        type="button"
        disabled={props.room.wecomBusy}
        onClick={() => { void props.startWecomAuthorization?.() }}
      >{authorization.status === 'pending' ? '查看二维码' : '扫码连接'}</button>}
    </div>
    {props.room.wecomError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.wecomError}</div>}
  </section>
}

function WecomAuthorizationDialog(props: ChatroomAccountPanelProps): JSX.Element {
  const authorization = props.room.wecomAuthorization
  const [qrRevision, setQrRevision] = useState(() => Date.now())
  useEffect(() => {
    if (authorization?.status !== 'pending') return
    const timer = globalThis.setInterval(() => { void props.loadWecomAuthorization?.() }, 1_500)
    return () => { globalThis.clearInterval(timer) }
  }, [authorization?.status])
  useEffect(() => {
    if (authorization?.qrAvailable === true) setQrRevision(Date.now())
  }, [authorization?.qrAvailable])
  return <div className="dsh-chatroom-dialog-layer dsh-chatroom-wecom-auth-layer" data-testid="chatroom-wecom-auth">
    <section className="dsh-chatroom-card dsh-chatroom-wecom-auth-card" aria-label="连接企业微信">
      <header><div><h2>连接企业微信</h2><p>使用当前平台账号对应的企业微信扫码。凭据仅保存在服务器上的独立加密目录中。</p></div><button aria-label="关闭企业微信登录" type="button" onClick={props.closeWecomAuthorization}>×</button></header>
      {authorization?.status === 'authorized'
        ? <div className="dsh-chatroom-wecom-auth-success"><span aria-hidden>✓</span><strong>已连接，可以发起快速会议</strong></div>
        : authorization?.qrAvailable === true
          ? <><img className="dsh-chatroom-wecom-qr" src={`${CHATROOM_API_PREFIX}/wecom/auth/qr?v=${qrRevision}`} alt="企业微信登录二维码" /><p className="dsh-chatroom-panel-status">请使用企业微信扫码并在手机上确认。</p></>
          : <div className="dsh-chatroom-panel-status">{props.room.wecomBusy ? '正在生成登录二维码…' : '等待二维码…'}</div>}
      {authorization?.enabled === true && authorization.status !== 'authorized' && <button
        className="dsh-chatroom-wecom-retry"
        type="button"
        disabled={props.room.wecomBusy}
        onClick={() => { void props.startWecomAuthorization?.() }}
      >重新生成二维码</button>}
      {props.room.wecomError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.wecomError}</div>}
    </section>
  </div>
}

function AutomationPanel(props: ChatroomAccountPanelProps): JSX.Element {
  const overview = props.room.automationOverview
  const [selection, setSelection] = useState('')
  useEffect(() => {
    if (overview !== undefined) setSelection(modelKey(overview.provider, overview.model))
  }, [overview?.provider, overview?.model])
  if (props.room.automationBusy && overview === undefined) {
    return <section className="dsh-chatroom-card dsh-chatroom-automation-card"><div className="dsh-chatroom-panel-status">正在加载 AI 自动响应设置…</div></section>
  }
  if (overview === undefined) {
    return <section className="dsh-chatroom-card dsh-chatroom-automation-card">
      <header><div><h2>AI 自动响应</h2><p>加载判断模型失败。</p></div></header>
      {props.room.automationError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.automationError}</div>}
    </section>
  }
  return <section className="dsh-chatroom-card dsh-chatroom-automation-card" aria-label="AI 自动响应设置">
    <header><div><h2>AI 自动响应</h2><p>各群开启自动响应后，由这个模型判断普通消息是否需要唤起 AI。</p></div></header>
    <div className="dsh-chatroom-automation-form">
      <label>判断模型<select
        value={selection}
        disabled={!overview.canManage || props.room.automationBusy}
        onChange={event => { setSelection(event.target.value) }}
      >{overview.models.map(model => <option key={modelKey(model.provider, model.model)} value={modelKey(model.provider, model.model)}>{model.label}</option>)}</select></label>
      {overview.canManage && <button
        type="button"
        disabled={props.room.automationBusy || selection === modelKey(overview.provider, overview.model)}
        onClick={() => {
          const model = overview.models.find(item => modelKey(item.provider, item.model) === selection)
          if (model !== undefined) void props.saveAutomation?.(
            model.provider,
            model.model,
            overview.mainAgentPrompt,
            overview.controllerPrompt,
          )
        }}
      >保存判断模型</button>}
      {!overview.canManage && <small>只有超级管理员可以修改判断模型。</small>}
    </div>
    {props.room.automationError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.automationError}</div>}
  </section>
}

function PromptPanel(props: ChatroomAccountPanelProps): JSX.Element | null {
  const overview = props.room.automationOverview
  const [mainAgentPrompt, setMainAgentPrompt] = useState('')
  const [controllerPrompt, setControllerPrompt] = useState('')
  useEffect(() => {
    if (overview === undefined) return
    setMainAgentPrompt(overview.mainAgentPrompt)
    setControllerPrompt(overview.controllerPrompt)
  }, [overview?.mainAgentPrompt, overview?.controllerPrompt])
  if (overview === undefined) return null
  const unchanged = mainAgentPrompt === overview.mainAgentPrompt && controllerPrompt === overview.controllerPrompt
  return <section className="dsh-chatroom-card dsh-chatroom-prompt-card" aria-label="Agent 系统提示词设置">
    <header><div><h2>Agent 系统提示词</h2><p>仅影响聊天室主会话、分支会话和未 @AI 消息的唤起判断。</p></div></header>
    {overview.canManage
      ? <div className="dsh-chatroom-prompt-form">
          <label>群聊主 Agent<textarea
            aria-label="群聊主 Agent 系统提示词"
            value={mainAgentPrompt}
            onChange={event => { setMainAgentPrompt(event.target.value) }}
          /><small>作为真正的 system prompt 注入每个聊天室主会话和分支 Agent；下一轮对话生效。</small></label>
          <label>自动回复判断 Agent<textarea
            aria-label="自动回复判断 Agent 系统提示词"
            value={controllerPrompt}
            onChange={event => { setControllerPrompt(event.target.value) }}
          /><small>用于判断未明确 @AI 的普通消息是否需要唤起；明确 @AI 始终跳过判断并直接唤起。</small></label>
          <button
            type="button"
            disabled={props.room.automationBusy || unchanged}
            onClick={() => { void props.saveAutomation?.(
              overview.provider,
              overview.model,
              mainAgentPrompt,
              controllerPrompt,
            ) }}
          >保存系统提示词</button>
        </div>
      : <small>只有超级管理员可以修改系统提示词。</small>}
    {props.room.automationError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.automationError}</div>}
  </section>
}

function modelKey(provider: string, model: string): string {
  return `${provider}\u0000${model}`
}

function AccountPanel(props: ChatroomAccountPanelProps & { embedded?: boolean }): JSX.Element {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const account = props.room.auth.account
  const content = <section className="dsh-chatroom-card dsh-chatroom-account-card" aria-label="账号设置">
      <header><div><h2>账号设置</h2><p>{account === undefined ? '' : `${account.displayName} · @${account.username}`}</p></div>{!props.embedded && <button aria-label="关闭账号设置" type="button" onClick={props.closeAccount}>×</button>}</header>
      {account?.passwordManaged !== false && <form className="dsh-chatroom-admin-form" onSubmit={async event => {
        event.preventDefault()
        if (newPassword !== confirmation) return
        if (await props.changePassword(currentPassword, newPassword)) {
          setCurrentPassword(''); setNewPassword(''); setConfirmation('')
        }
      }}>
        <label>当前密码<input type="password" autoComplete="current-password" value={currentPassword} onChange={event => { setCurrentPassword(event.target.value) }} /></label>
        <label>新密码<input type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={event => { setNewPassword(event.target.value) }} /></label>
        <label>确认新密码<input type="password" autoComplete="new-password" minLength={12} value={confirmation} onChange={event => { setConfirmation(event.target.value) }} /></label>
        {confirmation !== '' && confirmation !== newPassword && <div className="dsh-chatroom-error" role="alert">两次输入的新密码不一致。</div>}
        <button type="submit" disabled={props.room.accountBusy || currentPassword === '' || newPassword.length < 12 || newPassword !== confirmation}>修改密码</button>
      </form>}
      {account?.passwordManaged === false && <p className="dsh-chatroom-panel-status">此账号由企业统一登录管理，密码请在企业登录系统中修改。</p>}
      {props.room.accountError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.accountError}</div>}
    </section>
  return props.embedded ? content : <div className="dsh-chatroom-dialog-layer dsh-chatroom-account-layer" data-testid="chatroom-account">{content}</div>
}

function AdminPanel(props: ChatroomAccountPanelProps & { embedded?: boolean }): JSX.Element {
  const overview = props.room.adminOverview
  const dshOnly = props.room.auth.authMode === 'dsh-auth-only'
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'super-admin' | 'admin' | 'member'>('member')
  const [avatarId, setAvatarId] = useState<ChatroomAvatarId>(CHATROOM_AVATARS[0].id)
  const [provider, setProvider] = useState(emptyProvider())
  const content = <section className="dsh-chatroom-card dsh-chatroom-admin-card" aria-label="系统管理">
        <header><div><h2>系统管理</h2><p>账号、注册策略和企业身份提供方</p></div>{!props.embedded && <button aria-label="关闭系统管理" type="button" onClick={props.closeAdmin}>×</button>}</header>
        {props.room.adminBusy && overview === undefined
          ? <div className="dsh-chatroom-panel-status">正在载入管理数据…</div>
          : overview !== undefined && <div className="dsh-chatroom-admin-layout">
            <section>
              <h3>注册策略</h3>
              <label className="dsh-chatroom-toggle"><input
                type="checkbox"
                checked={overview.allowSelfRegistration}
                disabled={props.room.adminBusy || dshOnly}
                onChange={event => { void props.adminSetSelfRegistration(event.target.checked) }}
              />允许用户使用账号密码自主注册</label>
              {!dshOnly && <>
              <h3>统一创建账号</h3>
              <form className="dsh-chatroom-admin-form" onSubmit={async (event) => {
                event.preventDefault()
                if (await props.adminCreateUser({ username, password, displayName, avatarId, role })) {
                  setUsername(''); setPassword(''); setDisplayName('')
                }
              }}>
                <label>账号名<input placeholder="例如 alice" value={username} onChange={event => { setUsername(event.target.value) }} /></label>
                <label>显示名称<input placeholder="成员看到的名称" value={displayName} onChange={event => { setDisplayName(event.target.value) }} /></label>
                <label>初始密码<input placeholder="至少 12 位" type="password" value={password} onChange={event => { setPassword(event.target.value) }} /></label>
                <label>角色<select value={role} onChange={event => { setRole(event.target.value as typeof role) }}>
                  <option value="member">成员</option><option value="admin">管理员</option><option value="super-admin">超级管理员</option>
                </select></label>
                <fieldset className="dsh-chatroom-settings-avatar-field"><legend>头像</legend>
                  <div className="dsh-chatroom-mini-avatars">{CHATROOM_AVATARS.map(avatar => <button
                    key={avatar.id}
                    type="button"
                    aria-label={avatar.label}
                    aria-pressed={avatar.id === avatarId}
                    data-selected={avatar.id === avatarId}
                    onClick={() => { setAvatarId(avatar.id) }}
                  >{avatar.emoji}</button>)}</div>
                </fieldset>
                <button type="submit" disabled={props.room.adminBusy || username === '' || displayName === '' || password === ''}>创建账号</button>
              </form>
              </>}
            </section>
            <section>
              <h3>用户 · {overview.users.length}</h3>
              <div className="dsh-chatroom-user-table">{overview.users.map(user => {
                return <div key={user.participantId} data-disabled={user.status === 'disabled'}>
                  <ChatroomAvatar avatarId={user.avatarId} avatarUrl={user.avatarUrl} seed={user.participantId} />
                  <span><strong>{user.displayName}</strong><small>@{user.username}</small></span>
                  <span className="dsh-chatroom-user-actions">
                    <select
                      aria-label={`${user.username} 的角色`}
                      value={user.role}
                      disabled={props.room.adminBusy}
                      onChange={event => { void props.adminUpdateUser(user.participantId, { role: event.target.value as typeof user.role }) }}
                    ><option value="member">成员</option><option value="admin">管理员</option><option value="super-admin">超级管理员</option></select>
                    <button type="button" disabled={props.room.adminBusy} onClick={() => { void props.adminUpdateUser(user.participantId, { status: user.status === 'active' ? 'disabled' : 'active' }) }}>
                      {user.status === 'active' ? '停用' : '启用'}
                    </button>
                  </span>
                </div>
              })}</div>
            </section>
            <section className="dsh-chatroom-provider-section">
              {dshOnly
                ? <><h3>企业统一登录</h3><p className="dsh-chatroom-panel-status">当前部署固定使用 dsh-auth 企业登录；本地密码和 OIDC 提供方已关闭。</p></>
                : <>
              <h3>企业 SSO / OIDC</h3>
              <label className="dsh-chatroom-admin-field">未登录用户入口<select
                aria-label="未登录用户入口"
                value={overview.autoRedirectProviderId ?? ''}
                disabled={props.room.adminBusy}
                onChange={event => { void props.adminSetAutoRedirectProvider(event.target.value || undefined) }}
              >
                <option value="">显示登录与认证选择页</option>
                {overview.loginProviders.map(item => <option key={item.id} value={item.id}>自动跳转到 {item.label}</option>)}
              </select></label>
              <p className="dsh-chatroom-callback">自动跳转启用后，可在访问地址增加 <code>local=1</code> 打开本地账号应急入口。</p>
              {overview.oidcCallbackBase !== '' && <p className="dsh-chatroom-callback">回调地址：<code>{overview.oidcCallbackBase}{provider.id || '{providerId}'}/callback</code></p>}
              <form className="dsh-chatroom-admin-form dsh-chatroom-provider-form" onSubmit={async (event) => {
                event.preventDefault()
                if (await props.adminSaveProvider(provider)) setProvider(emptyProvider())
              }}>
                <label>Provider ID<input placeholder="例如 company" value={provider.id} onChange={event => { setProvider({ ...provider, id: event.target.value }) }} /></label>
                <label>登录按钮名称<input placeholder="例如 企业统一登录" value={provider.label} onChange={event => { setProvider({ ...provider, label: event.target.value }) }} /></label>
                <label>Issuer URL<input placeholder="https://id.example.com" value={provider.issuer} onChange={event => { setProvider({ ...provider, issuer: event.target.value }) }} /></label>
                <label>Client ID<input value={provider.clientId} onChange={event => { setProvider({ ...provider, clientId: event.target.value }) }} /></label>
                <label>Client Secret<input placeholder="编辑时可留空" type="password" value={provider.clientSecret ?? ''} onChange={event => { setProvider({ ...provider, clientSecret: event.target.value }) }} /></label>
                <label>Scopes<input value={provider.scopes} onChange={event => { setProvider({ ...provider, scopes: event.target.value }) }} /></label>
                <label>账号 Claim<input value={provider.usernameClaim} onChange={event => { setProvider({ ...provider, usernameClaim: event.target.value }) }} /></label>
                <label>名称 Claim<input value={provider.displayNameClaim} onChange={event => { setProvider({ ...provider, displayNameClaim: event.target.value }) }} /></label>
                <label className="dsh-chatroom-toggle"><input type="checkbox" checked={provider.enabled} onChange={event => { setProvider({ ...provider, enabled: event.target.checked }) }} />启用</label>
                <label className="dsh-chatroom-toggle"><input type="checkbox" checked={provider.autoCreateUsers} onChange={event => { setProvider({ ...provider, autoCreateUsers: event.target.checked }) }} />首次 SSO 登录自动创建账号</label>
                <button type="submit" disabled={props.room.adminBusy}>保存提供方</button>
              </form>
              <div className="dsh-chatroom-provider-list">{overview.providers.map(item => <div key={item.id}>
                <span><strong>{item.label}</strong><small>{item.id} · {item.enabled ? '已启用' : '已停用'} · {item.issuer}</small></span>
                <span className="dsh-chatroom-provider-actions">
                  <button type="button" onClick={() => { setProvider({
                    id: item.id, label: item.label, enabled: item.enabled, issuer: item.issuer, clientId: item.clientId,
                    scopes: item.scopes, usernameClaim: item.usernameClaim, displayNameClaim: item.displayNameClaim,
                    autoCreateUsers: item.autoCreateUsers,
                  }) }}>编辑</button>
                  <button type="button" onClick={() => { void props.adminDeleteProvider(item.id) }}>删除</button>
                </span>
              </div>)}</div>
                </>}
            </section>
          </div>}
        {props.room.adminError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.adminError}</div>}
      </section>
  return props.embedded ? content : <div className="dsh-chatroom-dialog-layer dsh-chatroom-admin-layer" data-testid="chatroom-admin">{content}</div>
}

function DirectPanel(props: ChatroomAccountPanelProps): JSX.Element {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<readonly File[]>([])
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [host] = useState(() => nativeConversationHost())
  const messagesRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const emojiRootRef = useRef<HTMLDivElement>(null)
  const current = props.room.directConversation
  useLayoutEffect(() => {
    if (host === undefined) return
    host.setAttribute('data-dsh-chatroom-direct-host', '')
    return () => { host.removeAttribute('data-dsh-chatroom-direct-host') }
  }, [host])
  useEffect(() => {
    const viewport = messagesRef.current
    if (viewport !== null) viewport.scrollTop = viewport.scrollHeight
  }, [current?.id, props.room.directMessages.length])
  useEffect(() => {
    setText('')
    setFiles([])
    setEmojiOpen(false)
  }, [current?.id])
  useEffect(() => {
    if (!emojiOpen) return
    const close = (event: PointerEvent) => {
      if (!emojiRootRef.current?.contains(event.target as Node)) setEmojiOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => { document.removeEventListener('pointerdown', close) }
  }, [emojiOpen])
  const canSend = !props.room.directBusy && (text.trim() !== '' || files.length > 0)
  const content = <main className="dsh-chatroom-direct-panel" aria-label="私聊" data-testid="chatroom-direct">
    <header>
      {current !== undefined && <ChatroomAvatarView className="dsh-chatroom-direct-header-avatar" {...current.peer} />}
      <div><strong>{current?.peer.displayName ?? '私聊'}</strong><small>{current === undefined ? '从左侧通讯录选择联系人' : `@${current.peer.username}`}</small></div>
      <button aria-label="关闭私聊" type="button" onClick={props.closeDirect}>×</button>
    </header>
    {current === undefined
      ? <div className="dsh-chatroom-direct-empty">从左侧“私聊”通讯录选择一位联系人</div>
      : <>
        <div ref={messagesRef} className="dsh-chatroom-direct-messages">{props.room.directMessages.map(message => {
          const own = message.senderId === props.room.identity?.participantId
          const sender = own ? props.room.identity : current.peer
          return <article key={message.id} data-own={own}>
            {sender !== undefined && <ChatroomAvatarView className="dsh-chatroom-direct-message-avatar" {...sender} />}
            <div>
              <strong>{own ? '我' : current.peer.displayName}</strong>
              {message.text !== '' && <p>{message.text}</p>}
              {message.card !== undefined && <ChatroomExternalCardView card={message.card} />}
              {message.files !== undefined && message.files.length > 0 && <div className="dsh-chatroom-direct-media">
                {message.files.map(file => {
                  const url = `${CHATROOM_API_PREFIX}/files/${encodeURIComponent(file.id)}`
                  return file.mediaType.startsWith('image/')
                    ? <a key={file.id} href={url} target="_blank" rel="noreferrer"><img src={url} alt={file.name} /></a>
                    : <a className="dsh-chatroom-direct-file" key={file.id} href={url} download={file.name}>
                        <span aria-hidden>📎</span><span><strong>{file.name}</strong><small>{formatFileBytes(file.bytes)}</small></span><span aria-hidden>↓</span>
                      </a>
                })}
              </div>}
              <time>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
            </div>
          </article>
        })}</div>
        <form ref={formRef} className="dsh-chatroom-direct-composer" onSubmit={async (event) => {
          event.preventDefault()
          if (!canSend) return
          if (await props.sendDirect(text, files)) {
            setText('')
            setFiles([])
          }
        }}>
          <textarea
            ref={textareaRef}
            data-dsh-chatroom-direct-input
            rows={2}
            placeholder={`给 ${current.peer.displayName} 发消息`}
            value={text}
            onChange={event => { setText(event.target.value) }}
            onKeyDown={event => {
              if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
              event.preventDefault()
              if (canSend) formRef.current?.requestSubmit()
            }}
            onPaste={event => {
              const pasted = [...event.clipboardData.files]
              if (pasted.length > 0) setFiles(currentFiles => [...currentFiles, ...pasted])
            }}
            enterKeyHint="send"
          />
          {files.length > 0 && <div className="dsh-chatroom-direct-pending-files">
            {files.map((file, index) => <span key={`${file.name}-${file.lastModified}-${index}`}>
              <span aria-hidden>{file.type.startsWith('image/') ? '🖼️' : '📎'}</span>
              <span title={file.name}>{file.name}</span>
              <button type="button" aria-label={`移除 ${file.name}`} onClick={() => { setFiles(currentFiles => currentFiles.filter((_, fileIndex) => fileIndex !== index)) }}>×</button>
            </span>)}
          </div>}
          <div className="dsh-chatroom-direct-composer-tools">
            <div ref={emojiRootRef} className="dsh-chatroom-direct-emoji-root">
              <button type="button" aria-label="选择私聊表情" aria-expanded={emojiOpen} onClick={() => { setEmojiOpen(open => !open) }}>☺ <span>表情</span></button>
              {emojiOpen && <div className="dsh-chatroom-direct-emoji-picker" role="dialog" aria-label="选择私聊表情">
                {DIRECT_MESSAGE_EMOJIS.map(emoji => <button type="button" key={emoji} aria-label={`插入 ${emoji}`} onClick={() => {
                  setText(value => `${value}${emoji}`)
                  setEmojiOpen(false)
                  textareaRef.current?.focus()
                }}>{emoji}</button>)}
              </div>}
            </div>
            <button type="button" aria-label="选择私聊图片或文件" onClick={() => { fileInputRef.current?.click() }}>📎 <span>附件</span></button>
            <button
              type="button"
              className="dsh-chatroom-direct-meeting"
              disabled={props.room.wecomBusy}
              onClick={() => { void props.quickDirectMeeting?.(current.id) }}
            >⚡ <span>快速会议</span></button>
            <input ref={fileInputRef} aria-label="选择私聊文件" type="file" multiple onChange={event => {
              const selected = event.currentTarget.files
              if (selected !== null) setFiles(currentFiles => [...currentFiles, ...selected])
              event.currentTarget.value = ''
            }} />
            <small>Enter 发送 · Shift+Enter 换行</small>
            <button className="dsh-chatroom-direct-send" aria-label="发送私聊消息" type="submit" disabled={!canSend}>↑</button>
          </div>
        </form>
      </>}
    {props.room.directError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.directError}</div>}
  </main>
  return host === undefined ? content : createPortal(content, host)
}

function formatFileBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function nativeConversationHost(): HTMLElement | undefined {
  if (typeof document === 'undefined') return undefined
  const overlay = document.querySelector<HTMLElement>('[data-shell-overlay]')
  const frame = overlay?.parentElement
  if (overlay === null || overlay === undefined || frame === null || frame === undefined) return undefined
  const nativeInput = [...document.querySelectorAll<HTMLElement>('textarea')]
    .find(element => !element.hasAttribute('data-dsh-chatroom-direct-input'))
  let current = nativeInput
  while (current !== undefined && current.parentElement !== null && current.parentElement !== frame) {
    current = current.parentElement
  }
  if (current?.parentElement === frame) return current
  return [...frame.children]
    .filter((element): element is HTMLElement => element instanceof HTMLElement
      && element !== overlay && !element.hasAttribute('data-side'))
    .map(element => ({ element, area: element.clientWidth * element.clientHeight }))
    .sort((left, right) => right.area - left.area)[0]?.element
}

function emptyProvider(): OidcProviderForm {
  return {
    id: '', label: '', enabled: true, issuer: '', clientId: '', scopes: 'openid profile email',
    usernameClaim: 'preferred_username', displayNameClaim: 'name', autoCreateUsers: true,
  }
}
