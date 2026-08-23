import { useState } from 'react'
import { chatroomAvatar } from '../avatars.js'
import type {
  ChatroomForwardItem,
  ChatroomNotification,
  ChatroomReplyReference,
} from '../types.js'
import type { ChatroomReactionEmoji } from '../reactions.js'
import { branchFrameUrl } from './branch-frame.js'
import type { ChatroomView } from './store.js'

interface ChatroomPanelsProps {
  readonly room: ChatroomView
  closeMembers(): void
  renameRoom?(title: string): Promise<boolean>
  setMemberRole?(participantId: string, role: 'admin' | 'member'): Promise<boolean>
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
  clearMessageSelection(): void
  toggleMessageSelection(roomId: string, message: ChatroomForwardItem): void
}

/** Persistent member management, branch conversation, and in-page alerts. */
export function ChatroomPanels(props: ChatroomPanelsProps): JSX.Element {
  return (
    <>
      <ToastStack toasts={props.room.toasts} dismiss={props.dismissToast} />
      {props.room.membersOpen && <MemberPanel {...props} />}
      {props.room.thread !== undefined && <ThreadPanel {...props} />}
      {props.room.selectionRoomId !== undefined && <SelectionBar {...props} />}
      {props.room.forwardOpen && <ForwardPanel {...props} />}
    </>
  )
}

function SelectionBar(props: ChatroomPanelsProps): JSX.Element {
  const sourceRoomId = props.room.selectionRoomId
  return (
    <div className="dsh-chatroom-selection-bar" role="toolbar" aria-label="消息多选">
      <strong>已选择 {props.room.selectedMessages.length} 条消息</strong>
      <button
        type="button"
        disabled={props.room.selectedMessages.length === 0}
        onClick={() => { if (sourceRoomId !== undefined) props.openForward(sourceRoomId) }}
      >合并转发</button>
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
  const [title, setTitle] = useState(props.room.room?.title ?? '')
  const viewerRole = props.room.members.find(member =>
    member.participantId === props.room.identity?.participantId)?.role ?? 'member'
  return (
    <div className="dsh-chatroom-dialog-layer dsh-chatroom-member-layer" data-testid="chatroom-members">
      <section className="dsh-chatroom-card dsh-chatroom-member-card" aria-label="群管理">
        <button className="dsh-chatroom-close" aria-label="关闭群管理" type="button" onClick={props.closeMembers}>×</button>
        <h2>群管理</h2>
        <p>{props.room.room?.title} · {props.room.members.length} 位成员 · {props.room.online} 人在线</p>
        {(viewerRole === 'owner' || viewerRole === 'admin') && <form className="dsh-chatroom-manage-title" onSubmit={(event) => {
          event.preventDefault()
          void props.renameRoom?.(title)
        }}>
          <input value={title} maxLength={160} aria-label="群聊名称" onChange={event => { setTitle(event.target.value) }} />
          <button type="submit" disabled={props.room.managementBusy || title.trim() === '' || title.trim() === props.room.room?.title}>保存名称</button>
        </form>}
        <div className="dsh-chatroom-member-list">
          {props.room.members.map(member => {
            const avatar = chatroomAvatar(member.avatarId, member.participantId)
            return (
              <div className="dsh-chatroom-member" key={member.participantId}>
                <span className="dsh-chatroom-member-avatar" data-avatar={avatar.id}>{avatar.emoji}</span>
                <span><strong>{member.displayName} <em>{member.role === 'owner' ? '群主' : member.role === 'admin' ? '管理员' : ''}</em></strong><small>{member.online ? '在线' : `最近活跃 ${formatRelative(member.lastSeenAt)}`}</small></span>
                {viewerRole === 'owner' && member.role !== 'owner'
                  ? <button
                    className="dsh-chatroom-member-role"
                    type="button"
                    disabled={props.room.managementBusy}
                    onClick={() => { void props.setMemberRole?.(member.participantId, member.role === 'admin' ? 'member' : 'admin') }}
                  >{member.role === 'admin' ? '取消管理员' : '设为管理员'}</button>
                  : <i data-online={member.online} />}
              </div>
            )
          })}
        </div>
        {props.room.managementError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.managementError}</div>}
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
  const thread = props.room.thread!
  const parentSessionId = props.room.room?.sessionId
  return (
    <aside className="dsh-chatroom-thread-panel" data-testid="chatroom-thread-panel" aria-label="分支回复">
      <header>
        <div><strong>分支回复</strong><small>{thread.root.displayName}：{thread.root.text}</small></div>
        <button aria-label="关闭分支" type="button" onClick={props.closeThread}>×</button>
      </header>
      {parentSessionId === undefined
        ? <div className="dsh-chatroom-thread-frame-error">无法确定父群聊会话。</div>
        : <iframe
          className="dsh-chatroom-thread-frame"
          title={`分支回复：${thread.root.text}`}
          src={branchFrameUrl(thread, parentSessionId)}
        />}
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
