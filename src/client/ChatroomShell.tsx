import { useEffect, useRef, useState } from 'react'
import type { ChatroomMessage } from '../types.js'
import type { ChatroomClientStore, ChatroomView } from './store.js'

interface ChatroomShellProps {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  openRoom(): void
  closeRoom(): void
  join(displayName: string): Promise<void>
  resetIdentity(): Promise<void>
  send(text: string): Promise<boolean>
  retry(): Promise<void>
}

/** Frame-wide chatroom entry and full-screen one-to-many conversation surface. */
export function ChatroomShell(props: ChatroomShellProps): JSX.Element {
  const room = props.useChatroom(snapshot => snapshot)
  if (!room.open) {
    return <button className="dsh-chatroom-launcher" data-dsh-chatroom-entry type="button" onClick={props.openRoom}>◉ 进入 AI 聊天室</button>
  }
  return (
    <section className="dsh-chatroom-shell" data-dsh-chatroom-entry data-testid="chatroom-shell">
      {room.phase === 'identity-required' && <IdentityStep room={room} join={props.join} />}
      {room.phase === 'loading' && <StatusCard title="正在进入聊天室" detail="正在恢复此浏览器的身份与房间状态…" />}
      {room.phase === 'error' && <StatusCard title="聊天室暂时不可用" detail={room.error ?? '请稍后重试。'} action="重试" onAction={props.retry} />}
      {room.phase === 'ready' && room.identity !== undefined && (
        <RoomView room={room} closeRoom={props.closeRoom} resetIdentity={props.resetIdentity} send={props.send} />
      )}
    </section>
  )
}

function IdentityStep({ room, join }: { room: ChatroomView; join(displayName: string): Promise<void> }): JSX.Element {
  const [name, setName] = useState('')
  return (
    <div className="dsh-chatroom-center">
      <form className="dsh-chatroom-card" onSubmit={(event) => { event.preventDefault(); void join(name) }}>
        <h2>{room.room?.title ?? 'AI 聊天室'}</h2>
        <p>第一次进入，请选择你在房间中显示的身份。此浏览器会在后续访问时自动恢复。</p>
        <input
          className="dsh-chatroom-name"
          data-testid="chatroom-identity-input"
          autoFocus
          maxLength={80}
          placeholder="你的名字"
          value={name}
          onChange={event => { setName(event.target.value) }}
        />
        <button className="dsh-chatroom-button primary" data-testid="chatroom-join" type="submit" disabled={name.trim() === ''}>进入聊天室</button>
        {room.error !== undefined && <div className="dsh-chatroom-error" role="alert">{room.error}</div>}
      </form>
    </div>
  )
}

function RoomView({
  room,
  closeRoom,
  resetIdentity,
  send,
}: {
  room: ChatroomView
  closeRoom(): void
  resetIdentity(): Promise<void>
  send(text: string): Promise<boolean>
}): JSX.Element {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ block: 'end' })
  }, [room.messages.length])
  const submit = async (): Promise<void> => {
    const text = draft.trim()
    if (text === '') return
    if (await send(text)) setDraft('')
  }
  return (
    <>
      <header className="dsh-chatroom-header">
        <button className="dsh-chatroom-icon-button" title="返回 Harness" type="button" onClick={closeRoom}>‹</button>
        <div className="dsh-chatroom-heading">
          <h1 className="dsh-chatroom-title">{room.room?.title ?? 'AI 聊天室'}</h1>
          <div className="dsh-chatroom-presence">{connectionLabel(room.connection)} · {room.online} 人在线</div>
        </div>
        <div className="dsh-chatroom-header-actions">
          <span className="dsh-chatroom-presence dsh-chatroom-identity-label">{room.identity?.displayName}</span>
          <button className="dsh-chatroom-icon-button" title="切换身份" type="button" onClick={() => { void resetIdentity() }}>↻</button>
        </div>
      </header>
      <main className="dsh-chatroom-transcript" data-testid="chatroom-transcript">
        <div className="dsh-chatroom-column">
          {room.messages.length === 0 && <div className="dsh-chatroom-empty">房间还没有消息，来打个招呼吧。</div>}
          {room.messages.map(message => <MessageRow key={message.id} message={message} own={message.participantId === room.identity?.participantId} />)}
          <div ref={bottomRef} />
        </div>
      </main>
      <footer className="dsh-chatroom-composer-wrap">
        <div className="dsh-chatroom-composer">
          <textarea
            className="dsh-chatroom-textarea"
            data-testid="chatroom-composer"
            aria-label="发送聊天室消息"
            rows={1}
            placeholder="给房间里的大家发消息…"
            value={draft}
            onChange={event => { setDraft(event.target.value) }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void submit()
              }
            }}
          />
          <button className="dsh-chatroom-send" data-testid="chatroom-send" title="发送" type="button" disabled={draft.trim() === '' || room.sending} onClick={() => { void submit() }}>↑</button>
        </div>
        {room.error !== undefined && <div className="dsh-chatroom-error" role="alert">{room.error}</div>}
      </footer>
    </>
  )
}

function MessageRow({ message, own }: { message: ChatroomMessage; own: boolean }): JSX.Element {
  const ai = message.role === 'ai'
  return (
    <article className={`dsh-chatroom-row${own ? ' own' : ''}`} data-message-id={message.id} data-message-side={own ? 'right' : 'left'}>
      {!own && <div className={`dsh-chatroom-avatar${ai ? '' : ' human'}`}>{ai ? 'AI' : firstGrapheme(message.displayName)}</div>}
      <div className="dsh-chatroom-message">
        <div className="dsh-chatroom-meta">{message.displayName} · {formatTime(message.createdAt)}</div>
        <div className="dsh-chatroom-bubble">{message.text}</div>
      </div>
    </article>
  )
}

function StatusCard({ title, detail, action, onAction }: { title: string; detail: string; action?: string; onAction?(): Promise<void> }): JSX.Element {
  return (
    <div className="dsh-chatroom-center">
      <div className="dsh-chatroom-card">
        <h2>{title}</h2>
        <p>{detail}</p>
        {action !== undefined && <button className="dsh-chatroom-button primary" type="button" onClick={() => { void onAction?.() }}>{action}</button>}
      </div>
    </div>
  )
}

function connectionLabel(connection: ChatroomView['connection']): string {
  return connection === 'online' ? '已同步' : connection === 'connecting' ? '连接中' : '离线'
}

function firstGrapheme(value: string): string {
  return [...value][0]?.toUpperCase() ?? '?'
}

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(timestamp)
}

export type { ChatroomClientStore }
