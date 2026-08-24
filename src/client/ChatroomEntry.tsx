import { useEffect, useState } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { CHATROOM_AVATARS, chatroomAvatar, type ChatroomAvatarId } from '../avatars.js'
import { authProviderStartLocation } from '../auth-redirect.js'
import type { ChatroomClientStore, ChatroomView } from './store.js'
import type { ChatroomAuthState, ChatroomForwardItem, ChatroomReplyReference } from '../types.js'
import type { ChatroomReactionEmoji } from '../reactions.js'
import { CHATROOM_API_PREFIX } from '../routes.js'
import { ChatroomPanels } from './ChatroomPanels.js'

interface ChatroomEntryInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  openRoom(): void
  closeRoom(): void
  join(displayName: string, avatarId: string): Promise<void>
  login(username: string, password: string): Promise<boolean>
  register(input: { username: string; password: string; displayName: string; avatarId: string; bootstrapToken?: string }): Promise<boolean>
  logout(): Promise<void>
  openAccount(): void
  closeAccount(): void
  changePassword(currentPassword: string, newPassword: string): Promise<boolean>
  selectRoom(roomId: string): Promise<void>
  createRoom(title: string): Promise<void>
  resetIdentity(): Promise<void>
  retry(): Promise<void>
  closeMembers(): void
  renameRoom?(title: string): Promise<boolean>
  setMemberRole?(participantId: string, role: 'admin' | 'member'): Promise<boolean>
  addRoomMembers?(participantIds: readonly string[]): Promise<boolean>
  closeThread(): void
  setThreadReply(reply: ChatroomReplyReference): void
  clearThreadReply(): void
  sendThreadMessage(text: string): Promise<boolean>
  enableSystemNotifications(): Promise<void>
  dismissToast(id: string): void
  toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void>
  openForward(roomId: string, message?: ChatroomForwardItem): void
  closeForward(): void
  forwardSelected(targetRoomId: string): Promise<boolean>
  toggleMessageSelection(roomId: string, message: ChatroomForwardItem): void
  clearMessageSelection(): void
  openAdmin(): Promise<void>
  closeAdmin(): void
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

type ChatroomEntryProps = PropsRuntime<'shell.overlay'> & ChatroomEntryInjected

/** Authentication and first-identity overlays plus persistent chatroom panels. */
export function ChatroomEntry(props: ChatroomEntryProps): JSX.Element | null {
  const room = props.useChatroom(snapshot => snapshot)
  if (room.branchFrame !== undefined) return null
  const panels = <ChatroomPanels room={room} {...props} />

  if (!room.open) {
    return panels
  }

  return (
    <>
      <div className="dsh-chatroom-dialog-layer" data-dsh-chatroom-entry data-testid="chatroom-dialog">
        {room.phase === 'auth-required' && <AuthStep room={room} login={props.login} register={props.register} />}
        {room.phase === 'identity-required' && <IdentityStep room={room} join={props.join} close={props.closeRoom} />}
        {room.phase === 'loading' && <StatusCard title="正在载入共享会话" detail="正在恢复此浏览器的身份与会话目录…" close={props.closeRoom} />}
        {room.phase === 'ready' && room.identity !== undefined && (
          <RoomStep
            room={room}
            selectRoom={props.selectRoom}
            createRoom={props.createRoom}
            resetIdentity={props.resetIdentity}
            logout={props.logout}
            openAccount={props.openAccount}
            openAdmin={props.openAdmin}
            openDirect={props.openDirect}
            close={props.closeRoom}
          />
        )}
        {room.phase === 'error' && (
          <StatusCard
            title="共享会话暂时不可用"
            detail={room.error ?? '请稍后重试。'}
            action="重试"
            onAction={props.retry}
            close={props.closeRoom}
          />
        )}
      </div>
      {panels}
    </>
  )
}

function AuthStep({
  room,
  login,
  register,
}: {
  room: ChatroomView
  login(username: string, password: string): Promise<boolean>
  register(input: { username: string; password: string; displayName: string; avatarId: string; bootstrapToken?: string }): Promise<boolean>
}): JSX.Element {
  const registrationAvailable = room.auth.bootstrapRequired || room.auth.allowSelfRegistration
  const [mode, setMode] = useState<'login' | 'register'>(room.auth.bootstrapRequired ? 'register' : 'login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bootstrapToken, setBootstrapToken] = useState('')
  const [avatarId, setAvatarId] = useState<ChatroomAvatarId>(CHATROOM_AVATARS[0].id)
  const returnTo = typeof location === 'undefined' ? '/' : `${location.pathname}${location.search}`
  const autoProvider = room.auth.bootstrapRequired ? undefined : room.auth.autoRedirectProvider
  const localLogin = typeof location !== 'undefined' && new URLSearchParams(location.search).get('local') === '1'
  useEffect(() => {
    if (autoProvider === undefined || localLogin || typeof location === 'undefined') return
    location.assign(providerLoginUrl(autoProvider, returnTo))
  }, [autoProvider, localLogin, returnTo])
  if (autoProvider !== undefined && !localLogin) {
    return <section className="dsh-chatroom-card dsh-chatroom-auth-card" role="status">
      <h2>正在前往 {autoProvider.label}</h2><p>正在打开企业统一登录…</p>
    </section>
  }
  return (
    <section className="dsh-chatroom-card dsh-chatroom-auth-card" aria-label="系统登录">
      <div className="dsh-chatroom-auth-brand"><strong>DeepSeek Harness</strong><span>团队协作平台</span></div>
      <h2>{mode === 'login' ? '登录' : room.auth.bootstrapRequired ? '创建超级管理员' : '注册账号'}</h2>
      <div className="dsh-chatroom-auth-tabs">
        <button type="button" data-active={mode === 'login'} onClick={() => { setMode('login') }}>登录</button>
        {registrationAvailable && <button type="button" data-active={mode === 'register'} onClick={() => { setMode('register') }}>注册</button>}
      </div>
      <form onSubmit={(event) => {
        event.preventDefault()
        if (mode === 'login') void login(username, password)
        else void register({
          username,
          password,
          displayName,
          avatarId,
          ...(room.auth.bootstrapRequired ? { bootstrapToken } : {}),
        })
      }}>
        <label>账号<input autoFocus autoComplete="username" value={username} onChange={event => { setUsername(event.target.value) }} /></label>
        <label>密码<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={event => { setPassword(event.target.value) }} /></label>
        {mode === 'register' && <>
          <label>显示名称<input value={displayName} onChange={event => { setDisplayName(event.target.value) }} /></label>
          {room.auth.bootstrapRequired && <label>初始化口令<input type="password" value={bootstrapToken} onChange={event => { setBootstrapToken(event.target.value) }} /></label>}
          <fieldset className="dsh-chatroom-avatar-fieldset">
            <legend>选择头像</legend>
            <div className="dsh-chatroom-avatar-grid" role="radiogroup" aria-label="选择头像">
              {CHATROOM_AVATARS.map(avatar => <button
                className="dsh-chatroom-avatar-choice"
                data-avatar={avatar.id}
                data-selected={avatar.id === avatarId}
                key={avatar.id}
                type="button"
                role="radio"
                aria-checked={avatar.id === avatarId}
                onClick={() => { setAvatarId(avatar.id) }}
              >{avatar.emoji}</button>)}
            </div>
          </fieldset>
        </>}
        <button className="dsh-chatroom-button" type="submit" disabled={username.trim() === '' || password === '' || (mode === 'register' && displayName.trim() === '')}>
          {mode === 'login' ? '登录' : '创建账号'}
        </button>
      </form>
      {room.auth.providers.length > 0 && <div className="dsh-chatroom-sso-list">
        <span>或使用企业账号</span>
        {room.auth.providers.map(provider => <a
          key={provider.id}
          href={providerLoginUrl(provider, returnTo)}
        >使用 {provider.label} 登录</a>)}
      </div>}
      {room.error !== undefined && <div className="dsh-chatroom-error" role="alert">{room.error}</div>}
    </section>
  )
}

function providerLoginUrl(provider: ChatroomAuthState['providers'][number], returnTo: string): string {
  return authProviderStartLocation(CHATROOM_API_PREFIX, provider, returnTo)
}

function IdentityStep({
  room,
  join,
  close,
}: {
  room: ChatroomView
  join(displayName: string, avatarId: string): Promise<void>
  close(): void
}): JSX.Element {
  const [name, setName] = useState(room.identity?.displayName ?? '')
  const [avatarId, setAvatarId] = useState<ChatroomAvatarId>(room.identity?.avatarId ?? CHATROOM_AVATARS[0].id)
  return (
    <form className="dsh-chatroom-card" onSubmit={(event) => { event.preventDefault(); void join(name, avatarId) }}>
      <button className="dsh-chatroom-close" aria-label="关闭" type="button" onClick={close}>×</button>
      <h2>共享会话</h2>
      <p>选择你在共享会话中显示的名字和头像。进入后继续使用 Harness 原生对话界面。</p>
      <input
        className="dsh-chatroom-name"
        data-testid="chatroom-identity-input"
        autoFocus
        maxLength={80}
        placeholder="你的名字"
        value={name}
        onChange={event => { setName(event.target.value) }}
      />
      <fieldset className="dsh-chatroom-avatar-fieldset">
        <legend>选择头像</legend>
        <div className="dsh-chatroom-avatar-grid" role="radiogroup" aria-label="选择头像">
          {CHATROOM_AVATARS.map(avatar => (
            <button
              className="dsh-chatroom-avatar-choice"
              data-avatar={avatar.id}
              data-selected={avatar.id === avatarId}
              key={avatar.id}
              type="button"
              role="radio"
              aria-checked={avatar.id === avatarId}
              aria-label={avatar.label}
              onClick={() => { setAvatarId(avatar.id) }}
            >
              {avatar.emoji}
            </button>
          ))}
        </div>
      </fieldset>
      <button className="dsh-chatroom-button" data-testid="chatroom-join" type="submit" disabled={name.trim() === ''}>继续</button>
      {room.error !== undefined && <div className="dsh-chatroom-error" role="alert">{room.error}</div>}
    </form>
  )
}

function RoomStep({
  room,
  selectRoom,
  createRoom,
  resetIdentity,
  logout,
  openAccount,
  openAdmin,
  openDirect,
  close,
}: {
  room: ChatroomView
  selectRoom(roomId: string): Promise<void>
  createRoom(title: string): Promise<void>
  resetIdentity(): Promise<void>
  logout(): Promise<void>
  openAccount(): void
  openAdmin(): Promise<void>
  openDirect(peerId?: string): Promise<void>
  close(): void
}): JSX.Element {
  const [title, setTitle] = useState('')
  return (
    <div className="dsh-chatroom-card dsh-chatroom-room-card">
      <button className="dsh-chatroom-close" aria-label="关闭" type="button" onClick={close}>×</button>
      <h2>共享会话</h2>
      <p>普通消息只在人类之间聊天；输入 <code>@AI</code> 或 <code>@{room.rooms[0]?.aiDisplayName ?? 'DeepSeek'}</code> 才会触发 AI 回复。</p>
      <div className="dsh-chatroom-room-list" data-testid="chatroom-room-list">
        {room.rooms.map(item => (
          <button
            className="dsh-chatroom-room-item"
            data-active={item.id === room.room?.id}
            data-testid={`chatroom-room-${item.id}`}
            key={item.id}
            type="button"
            onClick={() => { void selectRoom(item.id) }}
          >
            <span>{item.title}</span>
            <small>@{item.aiDisplayName}</small>
          </button>
        ))}
      </div>
      <form className="dsh-chatroom-create" onSubmit={(event) => {
        event.preventDefault()
        if (title.trim() !== '') void createRoom(title)
      }}>
        <input
          className="dsh-chatroom-name"
          data-testid="chatroom-title-input"
          maxLength={160}
          placeholder="新共享会话名称"
          value={title}
          onChange={event => { setTitle(event.target.value) }}
        />
        <button className="dsh-chatroom-create-button" data-testid="chatroom-create" type="submit" disabled={title.trim() === ''}>新建</button>
      </form>
      <div className="dsh-chatroom-card-footer">
        <span>当前身份：{room.identity === undefined ? '' : `${chatroomAvatar(room.identity.avatarId, room.identity.participantId).emoji} ${room.identity.displayName}`}</span>
        <div>
          <button type="button" onClick={() => { void openDirect() }}>私聊</button>
          {room.auth.enabled && <button type="button" onClick={openAccount}>账号设置</button>}
          {room.auth.account?.role === 'super-admin' && <button type="button" onClick={() => { void openAdmin() }}>系统管理</button>}
          {room.auth.enabled
            ? <button type="button" onClick={() => { void logout() }}>退出登录</button>
            : <button type="button" onClick={() => { void resetIdentity() }}>更换身份</button>}
        </div>
      </div>
      {room.error !== undefined && <div className="dsh-chatroom-error" role="alert">{room.error}</div>}
    </div>
  )
}

function StatusCard({
  title,
  detail,
  action,
  onAction,
  close,
}: {
  title: string
  detail: string
  action?: string
  onAction?(): Promise<void>
  close(): void
}): JSX.Element {
  return (
    <div className="dsh-chatroom-card" role="status">
      <button className="dsh-chatroom-close" aria-label="关闭" type="button" onClick={close}>×</button>
      <h2>{title}</h2>
      <p>{detail}</p>
      {action !== undefined && <button className="dsh-chatroom-button" type="button" onClick={() => { void onAction?.() }}>{action}</button>}
    </div>
  )
}

export type { ChatroomClientStore }
