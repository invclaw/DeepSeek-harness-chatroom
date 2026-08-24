import { useEffect, useState } from 'react'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { CHATROOM_AVATARS, chatroomAvatar, type ChatroomAvatarId } from '../avatars.js'
import type { ChatroomView } from './store.js'

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
  openDirect(peerId?: string): Promise<void>
  closeDirect(): void
  sendDirect(text: string): Promise<boolean>
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
  return <div className="dsh-chatroom-settings" data-testid="chatroom-settings">
    <header className="dsh-chatroom-settings-header">
      <div><h2>群聊与账号</h2><p>管理个人账号、平台成员和企业统一登录。</p></div>
      <button type="button" onClick={() => { void panelProps.openDirect() }}>打开私聊</button>
    </header>
    <AccountPanel {...panelProps} embedded />
    {superAdmin && <AdminPanel {...panelProps} embedded />}
  </div>
}

function AccountPanel(props: ChatroomAccountPanelProps & { embedded?: boolean }): JSX.Element {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const account = props.room.auth.account
  const content = <section className="dsh-chatroom-card dsh-chatroom-account-card" aria-label="账号设置">
      <header><div><h2>账号设置</h2><p>{account === undefined ? '' : `${account.displayName} · @${account.username}`}</p></div>{!props.embedded && <button aria-label="关闭账号设置" type="button" onClick={props.closeAccount}>×</button>}</header>
      <form className="dsh-chatroom-admin-form" onSubmit={async event => {
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
      </form>
      {props.room.accountError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.accountError}</div>}
    </section>
  return props.embedded ? content : <div className="dsh-chatroom-dialog-layer dsh-chatroom-account-layer" data-testid="chatroom-account">{content}</div>
}

function AdminPanel(props: ChatroomAccountPanelProps & { embedded?: boolean }): JSX.Element {
  const overview = props.room.adminOverview
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
                disabled={props.room.adminBusy}
                onChange={event => { void props.adminSetSelfRegistration(event.target.checked) }}
              />允许用户使用账号密码自主注册</label>
              <h3>统一创建账号</h3>
              <form className="dsh-chatroom-admin-form" onSubmit={async (event) => {
                event.preventDefault()
                if (await props.adminCreateUser({ username, password, displayName, avatarId, role })) {
                  setUsername(''); setPassword(''); setDisplayName('')
                }
              }}>
                <input placeholder="账号名" value={username} onChange={event => { setUsername(event.target.value) }} />
                <input placeholder="显示名称" value={displayName} onChange={event => { setDisplayName(event.target.value) }} />
                <input placeholder="初始密码（至少 12 位）" type="password" value={password} onChange={event => { setPassword(event.target.value) }} />
                <select value={role} onChange={event => { setRole(event.target.value as typeof role) }}>
                  <option value="member">成员</option><option value="admin">管理员</option><option value="super-admin">超级管理员</option>
                </select>
                <div className="dsh-chatroom-mini-avatars">{CHATROOM_AVATARS.map(avatar => <button
                  key={avatar.id}
                  type="button"
                  data-selected={avatar.id === avatarId}
                  onClick={() => { setAvatarId(avatar.id) }}
                >{avatar.emoji}</button>)}</div>
                <button type="submit" disabled={props.room.adminBusy || username === '' || displayName === '' || password === ''}>创建账号</button>
              </form>
            </section>
            <section>
              <h3>用户 · {overview.users.length}</h3>
              <div className="dsh-chatroom-user-table">{overview.users.map(user => {
                const avatar = chatroomAvatar(user.avatarId, user.participantId)
                return <div key={user.participantId} data-disabled={user.status === 'disabled'}>
                  <span data-avatar={avatar.id}>{avatar.emoji}</span>
                  <span><strong>{user.displayName}</strong><small>@{user.username}</small></span>
                  <select
                    aria-label={`${user.username} 的角色`}
                    value={user.role}
                    disabled={props.room.adminBusy}
                    onChange={event => { void props.adminUpdateUser(user.participantId, { role: event.target.value as typeof user.role }) }}
                  ><option value="member">成员</option><option value="admin">管理员</option><option value="super-admin">超级管理员</option></select>
                  <button type="button" disabled={props.room.adminBusy} onClick={() => { void props.adminUpdateUser(user.participantId, { status: user.status === 'active' ? 'disabled' : 'active' }) }}>
                    {user.status === 'active' ? '停用' : '启用'}
                  </button>
                </div>
              })}</div>
            </section>
            <section className="dsh-chatroom-provider-section">
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
                <input placeholder="Provider ID，例如 company" value={provider.id} onChange={event => { setProvider({ ...provider, id: event.target.value }) }} />
                <input placeholder="登录按钮名称" value={provider.label} onChange={event => { setProvider({ ...provider, label: event.target.value }) }} />
                <input placeholder="Issuer URL" value={provider.issuer} onChange={event => { setProvider({ ...provider, issuer: event.target.value }) }} />
                <input placeholder="Client ID" value={provider.clientId} onChange={event => { setProvider({ ...provider, clientId: event.target.value }) }} />
                <input placeholder="Client Secret（编辑时可留空）" type="password" value={provider.clientSecret ?? ''} onChange={event => { setProvider({ ...provider, clientSecret: event.target.value }) }} />
                <input placeholder="Scopes" value={provider.scopes} onChange={event => { setProvider({ ...provider, scopes: event.target.value }) }} />
                <input placeholder="账号 Claim" value={provider.usernameClaim} onChange={event => { setProvider({ ...provider, usernameClaim: event.target.value }) }} />
                <input placeholder="名称 Claim" value={provider.displayNameClaim} onChange={event => { setProvider({ ...provider, displayNameClaim: event.target.value }) }} />
                <label className="dsh-chatroom-toggle"><input type="checkbox" checked={provider.enabled} onChange={event => { setProvider({ ...provider, enabled: event.target.checked }) }} />启用</label>
                <label className="dsh-chatroom-toggle"><input type="checkbox" checked={provider.autoCreateUsers} onChange={event => { setProvider({ ...provider, autoCreateUsers: event.target.checked }) }} />首次 SSO 登录自动创建账号</label>
                <button type="submit" disabled={props.room.adminBusy}>保存提供方</button>
              </form>
              <div className="dsh-chatroom-provider-list">{overview.providers.map(item => <div key={item.id}>
                <span><strong>{item.label}</strong><small>{item.id} · {item.enabled ? '已启用' : '已停用'} · {item.issuer}</small></span>
                <button type="button" onClick={() => { setProvider({
                  id: item.id, label: item.label, enabled: item.enabled, issuer: item.issuer, clientId: item.clientId,
                  scopes: item.scopes, usernameClaim: item.usernameClaim, displayNameClaim: item.displayNameClaim,
                  autoCreateUsers: item.autoCreateUsers,
                }) }}>编辑</button>
                <button type="button" onClick={() => { void props.adminDeleteProvider(item.id) }}>删除</button>
              </div>)}</div>
            </section>
          </div>}
        {props.room.adminError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.adminError}</div>}
      </section>
  return props.embedded ? content : <div className="dsh-chatroom-dialog-layer dsh-chatroom-admin-layer" data-testid="chatroom-admin">{content}</div>
}

function DirectPanel(props: ChatroomAccountPanelProps): JSX.Element {
  const [text, setText] = useState('')
  const current = props.room.directConversation
  return <aside className="dsh-chatroom-direct-panel" aria-label="私聊" data-testid="chatroom-direct">
    <header><div><strong>私聊</strong><small>{current === undefined ? '选择一个联系人' : current.peer.displayName}</small></div><button aria-label="关闭私聊" type="button" onClick={props.closeDirect}>×</button></header>
    <div className="dsh-chatroom-direct-body">
      <nav>
        <h3>最近私聊</h3>
        {props.room.directConversations.map(conversation => <button key={conversation.id} data-active={conversation.id === current?.id} type="button" onClick={() => { void props.openDirect(conversation.peer.participantId) }}>
          <span>{chatroomAvatar(conversation.peer.avatarId, conversation.peer.participantId).emoji}</span><span><strong>{conversation.peer.displayName}</strong><small>@{conversation.peer.username}</small></span>
        </button>)}
        <h3>所有用户</h3>
        {props.room.directPeers.map(peer => <button key={peer.participantId} type="button" onClick={() => { void props.openDirect(peer.participantId) }}>
          <span>{chatroomAvatar(peer.avatarId, peer.participantId).emoji}</span><span><strong>{peer.displayName}</strong><small>@{peer.username}</small></span>
        </button>)}
      </nav>
      <section>
        {current === undefined
          ? <div className="dsh-chatroom-direct-empty">选择一位用户开始私聊</div>
          : <>
            <div className="dsh-chatroom-direct-messages">{props.room.directMessages.map(message => {
              const own = message.senderId === props.room.identity?.participantId
              return <article key={message.id} data-own={own}><small>{own ? '我' : current.peer.displayName}</small><p>{message.text}</p><time>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></article>
            })}</div>
            <form onSubmit={async (event) => {
              event.preventDefault()
              if (await props.sendDirect(text)) setText('')
            }}><textarea placeholder={`给 ${current.peer.displayName} 发消息`} value={text} onChange={event => { setText(event.target.value) }} /><button type="submit" disabled={props.room.directBusy || text.trim() === ''}>发送</button></form>
          </>}
      </section>
    </div>
    {props.room.directError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.directError}</div>}
  </aside>
}

function emptyProvider(): OidcProviderForm {
  return {
    id: '', label: '', enabled: true, issuer: '', clientId: '', scopes: 'openid profile email',
    usernameClaim: 'preferred_username', displayNameClaim: 'name', autoCreateUsers: true,
  }
}
