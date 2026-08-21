import { useEffect, useState } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ChatroomClientStore, ChatroomView } from './store.js'

interface ChatroomEntryInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  openRoom(): void
  closeRoom(): void
  join(displayName: string): Promise<void>
  retry(): Promise<void>
}

type ChatroomEntryProps = PropsRuntime<'shell.overlay'> & ChatroomEntryInjected

/** Additive room launcher plus the first-visit identity dialog. */
export function ChatroomEntry(props: ChatroomEntryProps): JSX.Element | null {
  const room = props.useChatroom(snapshot => snapshot)
  const currentSession = props.useSessions(snapshot => snapshot.current)
  const selected = room.room !== undefined && String(currentSession) === room.room.sessionId

  useEffect(() => {
    if (selected && room.open && room.phase === 'ready') props.closeRoom()
  }, [props.closeRoom, room.open, room.phase, selected])

  if (selected && room.phase === 'ready') return null

  if (!room.open) {
    if (selected) return null
    return (
      <button className="dsh-chatroom-launcher" data-dsh-chatroom-entry type="button" onClick={props.openRoom}>
        ◉ 进入 AI 聊天室
      </button>
    )
  }

  return (
    <div className="dsh-chatroom-dialog-layer" data-dsh-chatroom-entry data-testid="chatroom-dialog">
      {room.phase === 'identity-required' && <IdentityStep room={room} join={props.join} close={props.closeRoom} />}
      {room.phase === 'loading' && <StatusCard title="正在进入聊天室" detail="正在恢复此浏览器的身份与共享会话…" close={props.closeRoom} />}
      {room.phase === 'ready' && (
        <StatusCard
          title="正在打开共享会话"
          detail="房间 Session 正在加入 Harness 会话列表，完成后会自动打开。"
          action="重试"
          onAction={props.retry}
          close={props.closeRoom}
        />
      )}
      {room.phase === 'error' && (
        <StatusCard
          title="聊天室暂时不可用"
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
  join(displayName: string): Promise<void>
  close(): void
}): JSX.Element {
  const [name, setName] = useState('')
  return (
    <form className="dsh-chatroom-card" onSubmit={(event) => { event.preventDefault(); void join(name) }}>
      <button className="dsh-chatroom-close" aria-label="关闭" type="button" onClick={close}>×</button>
      <h2>{room.room?.title ?? 'AI 聊天室'}</h2>
      <p>选择你在共享会话中显示的名字。进入后使用 Harness 原生对话界面。</p>
      <input
        className="dsh-chatroom-name"
        data-testid="chatroom-identity-input"
        autoFocus
        maxLength={80}
        placeholder="你的名字"
        value={name}
        onChange={event => { setName(event.target.value) }}
      />
      <button className="dsh-chatroom-button" data-testid="chatroom-join" type="submit" disabled={name.trim() === ''}>进入共享会话</button>
      {room.error !== undefined && <div className="dsh-chatroom-error" role="alert">{room.error}</div>}
    </form>
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
