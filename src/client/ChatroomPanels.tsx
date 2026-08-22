import { useEffect, useRef, useState } from 'react'
import { chatroomAvatar, fallbackAvatarId } from '../avatars.js'
import type { ChatroomNotification } from '../types.js'
import type { ChatroomView } from './store.js'

interface ChatroomPanelsProps {
  readonly room: ChatroomView
  closeMembers(): void
  closeThread(): void
  sendThreadMessage(text: string): Promise<boolean>
  enableSystemNotifications(): Promise<void>
  dismissToast(id: string): void
  openForward(roomId: string): void
  closeForward(): void
  forwardSelected(targetRoomId: string): Promise<boolean>
  clearMessageSelection(): void
}

/** Persistent member management, branch conversation, and in-page alerts. */
export function ChatroomPanels(props: ChatroomPanelsProps): JSX.Element {
  return (
    <>
      <ToastStack toasts={props.room.toasts} dismiss={props.dismissToast} />
      {props.room.membersOpen && <MemberPanel {...props} />}
      {props.room.thread !== undefined && <ThreadPanel {...props} />}
      {props.room.selectedMessages.length > 0 && <SelectionBar {...props} />}
      {props.room.forwardOpen && <ForwardPanel {...props} />}
    </>
  )
}

function SelectionBar(props: ChatroomPanelsProps): JSX.Element {
  const sourceRoomId = props.room.selectionRoomId
  return (
    <div className="dsh-chatroom-selection-bar" role="toolbar" aria-label="消息多选">
      <strong>已选择 {props.room.selectedMessages.length} 条消息</strong>
      <button type="button" onClick={() => { if (sourceRoomId !== undefined) props.openForward(sourceRoomId) }}>合并转发</button>
      <button type="button" onClick={props.clearMessageSelection}>取消</button>
    </div>
  )
}

function ForwardPanel(props: ChatroomPanelsProps): JSX.Element {
  const targets = props.room.rooms.filter(item => item.id !== props.room.selectionRoomId)
  return (
    <div className="dsh-chatroom-dialog-layer dsh-chatroom-forward-layer" data-testid="chatroom-forward-dialog">
      <section className="dsh-chatroom-card dsh-chatroom-forward-dialog" aria-label="转发到群聊">
        <button className="dsh-chatroom-close" aria-label="关闭转发" type="button" onClick={props.closeForward}>×</button>
        <h2>转发到群聊</h2>
        <p>将选中的 {props.room.selectedMessages.length} 条消息合并成一张聊天记录卡片。</p>
        <div className="dsh-chatroom-forward-targets">
          {targets.map(room => (
            <button
              type="button"
              key={room.id}
              disabled={props.room.forwardBusy}
              onClick={() => { void props.forwardSelected(room.id) }}
            >
              <span>＃</span><strong>{room.title}</strong><small>@{room.aiDisplayName}</small>
            </button>
          ))}
          {targets.length === 0 && <div className="dsh-chatroom-forward-empty">请先新建另一个群聊，再进行转发。</div>}
        </div>
        {props.room.forwardError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.forwardError}</div>}
      </section>
    </div>
  )
}

function ToastStack({
  toasts,
  dismiss,
}: {
  toasts: readonly ChatroomNotification[]
  dismiss(id: string): void
}): JSX.Element | null {
  if (toasts.length === 0) return null
  return (
    <div className="dsh-chatroom-toast-stack" role="status" aria-live="polite">
      {toasts.map(toast => (
        <button className="dsh-chatroom-toast" key={toast.id} type="button" onClick={() => { dismiss(toast.id) }}>
          <strong>{toast.displayName} <small>· {toast.roomTitle}{toast.threadId === undefined ? '' : ' · 分支'}</small></strong>
          <span>{toast.text}</span>
        </button>
      ))}
    </div>
  )
}

function MemberPanel(props: ChatroomPanelsProps): JSX.Element {
  return (
    <div className="dsh-chatroom-dialog-layer dsh-chatroom-member-layer" data-testid="chatroom-members">
      <section className="dsh-chatroom-card dsh-chatroom-member-card" aria-label="群管理">
        <button className="dsh-chatroom-close" aria-label="关闭群管理" type="button" onClick={props.closeMembers}>×</button>
        <h2>群管理</h2>
        <p>{props.room.room?.title} · {props.room.members.length} 位成员 · {props.room.online} 人在线</p>
        <div className="dsh-chatroom-member-list">
          {props.room.members.map(member => {
            const avatar = chatroomAvatar(member.avatarId, member.participantId)
            return (
              <div className="dsh-chatroom-member" key={member.participantId}>
                <span className="dsh-chatroom-member-avatar" data-avatar={avatar.id}>{avatar.emoji}</span>
                <span><strong>{member.displayName}</strong><small>{member.online ? '在线' : `最近活跃 ${formatRelative(member.lastSeenAt)}`}</small></span>
                <i data-online={member.online} />
              </div>
            )
          })}
        </div>
        <button
          className="dsh-chatroom-notification-button"
          type="button"
          disabled={props.room.notificationsEnabled}
          onClick={() => { void props.enableSystemNotifications() }}
        >
          {props.room.notificationsEnabled ? '✓ 系统消息提醒已开启' : '开启系统消息提醒'}
        </button>
      </section>
    </div>
  )
}

function ThreadPanel(props: ChatroomPanelsProps): JSX.Element {
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const thread = props.room.thread!
  useEffect(() => {
    if (typeof endRef.current?.scrollIntoView === 'function') endRef.current.scrollIntoView({ block: 'end' })
  }, [props.room.threadMessages.length])
  return (
    <aside className="dsh-chatroom-thread-panel" data-testid="chatroom-thread-panel" aria-label="分支回复">
      <header>
        <div><strong>分支回复</strong><small>{props.room.room?.title}</small></div>
        <button aria-label="关闭分支" type="button" onClick={props.closeThread}>×</button>
      </header>
      <div className="dsh-chatroom-thread-root">
        <strong>{thread.root.displayName}</strong>
        <span>{thread.root.text}</span>
      </div>
      <div className="dsh-chatroom-thread-messages">
        {props.room.threadMessages.length === 0 && <p className="dsh-chatroom-thread-empty">从这里开始分支讨论。输入 <code>@AI</code> 只会在本分支触发 AI。</p>}
        {props.room.threadMessages.map(message => {
          const own = message.participantId === props.room.identity?.participantId
          const avatarId = message.avatarId ?? fallbackAvatarId(message.participantId)
          const avatar = message.role === 'ai' ? { id: 'ai', emoji: '✦' } : chatroomAvatar(avatarId, message.participantId)
          return (
            <article className="dsh-chatroom-thread-message" data-own={own} data-role={message.role} key={message.id}>
              <span className="dsh-chatroom-member-avatar" data-avatar={avatar.id}>{avatar.emoji}</span>
              <div><strong>{message.displayName}<time>{formatTime(message.createdAt)}</time></strong><p>{message.text}</p></div>
            </article>
          )
        })}
        <div ref={endRef} />
      </div>
      <form className="dsh-chatroom-thread-composer" onSubmit={(event) => {
        event.preventDefault()
        const submitted = text.trim()
        if (submitted === '') return
        void props.sendThreadMessage(submitted).then((sent) => { if (sent) setText('') })
      }}>
        <textarea
          rows={3}
          placeholder="回复分支；输入 @AI 让 AI 在本分支回答"
          value={text}
          onChange={event => { setText(event.target.value) }}
          onKeyDown={event => {
            if (event.key !== 'Enter' || event.shiftKey) return
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
          }}
        />
        <button type="submit" disabled={props.room.threadBusy || text.trim() === ''}>发送</button>
      </form>
      {props.room.threadError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.threadError}</div>}
    </aside>
  )
}

function formatRelative(time: number): string {
  const minutes = Math.max(0, Math.floor((Date.now() - time) / 60_000))
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (minutes < 1_440) return `${Math.floor(minutes / 60)} 小时前`
  return `${Math.floor(minutes / 1_440)} 天前`
}

function formatTime(time: number): string {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
