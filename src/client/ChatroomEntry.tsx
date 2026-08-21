import { useState } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { CHATROOM_AVATARS, chatroomAvatar, type ChatroomAvatarId } from '../avatars.js'
import type { ChatroomClientStore, ChatroomView } from './store.js'

interface ChatroomEntryInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  openRoom(): void
  closeRoom(): void
  join(displayName: string, avatarId: string): Promise<void>
  selectRoom(roomId: string): Promise<void>
  createRoom(title: string): Promise<void>
  resetIdentity(): Promise<void>
  retry(): Promise<void>
}

type ChatroomEntryProps = PropsRuntime<'shell.overlay'> & ChatroomEntryInjected

/** Additive shared-session launcher, identity setup, and room directory. */
export function ChatroomEntry(props: ChatroomEntryProps): JSX.Element | null {
  const room = props.useChatroom(snapshot => snapshot)

  if (!room.open) {
    return (
      <button className="dsh-chatroom-launcher" data-dsh-chatroom-entry type="button" onClick={props.openRoom}>
        ◉ 共享会话
      </button>
    )
  }

  return (
    <div className="dsh-chatroom-dialog-layer" data-dsh-chatroom-entry data-testid="chatroom-dialog">
      {room.phase === 'identity-required' && <IdentityStep room={room} join={props.join} close={props.closeRoom} />}
      {room.phase === 'loading' && <StatusCard title="正在载入共享会话" detail="正在恢复此浏览器的身份与会话目录…" close={props.closeRoom} />}
      {room.phase === 'ready' && room.identity !== undefined && (
        <RoomStep
          room={room}
          selectRoom={props.selectRoom}
          createRoom={props.createRoom}
          resetIdentity={props.resetIdentity}
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
  )
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
  const [name, setName] = useState('')
  const [avatarId, setAvatarId] = useState<ChatroomAvatarId>(CHATROOM_AVATARS[0].id)
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
  close,
}: {
  room: ChatroomView
  selectRoom(roomId: string): Promise<void>
  createRoom(title: string): Promise<void>
  resetIdentity(): Promise<void>
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
        <button type="button" onClick={() => { void resetIdentity() }}>更换身份</button>
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
