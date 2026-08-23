import { useEffect, useMemo, useRef, useState } from 'react'
import { chatroomAvatar, fallbackAvatarId } from '../avatars.js'
import type {
  ChatroomForwardItem,
  ChatroomNotification,
  ChatroomReplyReference,
  ChatroomThreadMessage,
} from '../types.js'
import type { ChatroomReactionEmoji } from '../reactions.js'
import {
  ChatroomInlineMessageActions,
  ChatroomMessageContextMenu,
  ChatroomReactionBar,
  ChatroomSelectionCheckbox,
  useChatroomMessageMenu,
  type ChatroomMessageToolsProps,
} from './ChatroomMessageTools.js'
import { ChatroomMarkdown } from './ChatroomMarkdown.js'
import type { ChatroomView } from './store.js'

interface ChatroomPanelsProps {
  readonly room: ChatroomView
  closeMembers(): void
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
  const [mention, setMention] = useState<ThreadMention | undefined>()
  const [mentionIndex, setMentionIndex] = useState(0)
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const thread = props.room.thread!
  const mentionCandidates = useMemo(() => {
    const aiNames = [...new Set(['AI', props.room.room?.aiDisplayName].filter((name): name is string => name !== undefined))]
    return [
      ...aiNames.map(name => ({ name, description: '提及后在本分支触发 AI', ai: true })),
      ...props.room.members
        .filter(member => member.participantId !== props.room.identity?.participantId)
        .map(member => ({ name: member.displayName, description: member.online ? '在线成员' : '群成员', ai: false })),
    ].filter((candidate, index, all) => all.findIndex(item => item.name === candidate.name) === index)
  }, [props.room.identity?.participantId, props.room.members, props.room.room?.aiDisplayName])
  const visibleMentions = mention === undefined
    ? []
    : mentionCandidates.filter(candidate => candidate.name.toLocaleLowerCase().includes(mention.query.toLocaleLowerCase()))
  useEffect(() => {
    if (typeof endRef.current?.scrollIntoView === 'function') endRef.current.scrollIntoView({ block: 'end' })
  }, [props.room.threadMessages.length])
  useEffect(() => { setMentionIndex(0) }, [mention?.query])

  const updateMention = (value: string, cursor: number): void => {
    setMention(activeThreadMention(value, cursor))
  }
  const pickMention = (name: string): void => {
    if (mention === undefined) return
    const cursor = textareaRef.current?.selectionStart ?? text.length
    const next = `${text.slice(0, mention.start)}@${name} ${text.slice(cursor)}`
    const nextCursor = mention.start + name.length + 2
    setText(next)
    setMention(undefined)
    queueMicrotask(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor)
    })
  }
  return (
    <aside className="dsh-chatroom-thread-panel" data-testid="chatroom-thread-panel" aria-label="分支回复">
      <header>
        <div><strong>分支回复</strong><small>{props.room.room?.title}</small></div>
        <button aria-label="关闭分支" type="button" onClick={props.closeThread}>×</button>
      </header>
      <div className="dsh-chatroom-thread-root">
        <strong>{thread.root.displayName}</strong>
        <div>{thread.root.role === 'ai'
          ? <ChatroomMarkdown text={thread.root.text} />
          : thread.root.text}</div>
      </div>
      <div className="dsh-chatroom-thread-messages">
        {props.room.threadMessages.length === 0 && <p className="dsh-chatroom-thread-empty">从这里开始分支讨论。输入 <code>@AI</code> 只会在本分支触发 AI。</p>}
        {props.room.threadMessages.map(message => <ThreadMessage key={message.id} message={message} props={props} />)}
        <div ref={endRef} />
      </div>
      <form className="dsh-chatroom-thread-composer" onSubmit={(event) => {
        event.preventDefault()
        const submitted = text.trim()
        if (submitted === '') return
        void props.sendThreadMessage(submitted).then((sent) => { if (sent) setText('') })
      }}>
        {props.room.threadReply !== undefined && (
          <div className="dsh-chatroom-thread-composer-reply">
            <span><strong>回复 {props.room.threadReply.displayName}</strong>{props.room.threadReply.text}</span>
            <button type="button" aria-label="取消引用" onClick={props.clearThreadReply}>×</button>
          </div>
        )}
        <textarea
          ref={textareaRef}
          rows={3}
          placeholder="回复分支；输入 @AI 让 AI 在本分支回答"
          value={text}
          aria-expanded={visibleMentions.length > 0}
          aria-controls="dsh-chatroom-thread-mentions"
          onChange={event => {
            setText(event.target.value)
            updateMention(event.target.value, event.target.selectionStart)
          }}
          onClick={event => { updateMention(event.currentTarget.value, event.currentTarget.selectionStart) }}
          onKeyDown={event => {
            if (visibleMentions.length > 0) {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault()
                const direction = event.key === 'ArrowDown' ? 1 : -1
                setMentionIndex(current => (current + direction + visibleMentions.length) % visibleMentions.length)
                return
              }
              if (event.key === 'Escape') {
                event.preventDefault()
                setMention(undefined)
                return
              }
              if (event.key === 'Tab') {
                event.preventDefault()
                pickMention(visibleMentions[mentionIndex]?.name ?? visibleMentions[0]!.name)
                return
              }
            }
            if (event.key !== 'Enter' || event.shiftKey) return
            if (visibleMentions.length > 0 && mention?.query === '') {
              event.preventDefault()
              pickMention(visibleMentions[mentionIndex]?.name ?? visibleMentions[0]!.name)
              return
            }
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
          }}
        />
        {visibleMentions.length > 0 && <div className="dsh-chatroom-thread-mentions" id="dsh-chatroom-thread-mentions" role="listbox" aria-label="提及成员">
          {visibleMentions.map((candidate, index) => (
            <button
              type="button"
              role="option"
              aria-label={candidate.name}
              aria-selected={index === mentionIndex}
              data-active={index === mentionIndex}
              key={candidate.name}
              onMouseDown={event => { event.preventDefault() }}
              onClick={() => { pickMention(candidate.name) }}
            >
              <i>{candidate.ai ? '✦' : '●'}</i><span><strong>{candidate.name}</strong><small>{candidate.description}</small></span>
            </button>
          ))}
        </div>}
        <button type="submit" disabled={props.room.threadBusy || text.trim() === ''}>发送</button>
      </form>
      {props.room.threadError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.threadError}</div>}
    </aside>
  )
}

function ThreadMessage({
  message,
  props,
}: {
  message: ChatroomThreadMessage
  props: ChatroomPanelsProps
}): JSX.Element {
  const own = message.participantId === props.room.identity?.participantId
  const avatarId = message.avatarId ?? fallbackAvatarId(message.participantId)
  const avatar = message.role === 'ai' ? { id: 'ai', emoji: '✦' } : chatroomAvatar(avatarId, message.participantId)
  const target = threadMessageTarget(message)
  const onReply = props.room.identity === undefined ? undefined : () => { props.setThreadReply(target) }
  const tools: ChatroomMessageToolsProps = {
    roomId: props.room.thread!.roomId,
    message: { ...target, role: message.role, createdAt: message.createdAt },
    reactions: props.room.reactions,
    identity: props.room.identity,
    selecting: props.room.selectionRoomId === props.room.thread!.roomId,
    selected: props.room.selectionRoomId === props.room.thread!.roomId
      && props.room.selectedMessages.some(item => item.messageId === message.id),
    copyText: message.text,
    onReply,
    toggleReaction: props.toggleReaction,
    openForward: props.openForward,
    toggleSelection: props.toggleMessageSelection,
  }
  const menu = useChatroomMessageMenu()
  return (
    <article
      className="dsh-chatroom-thread-message"
      data-own={own}
      data-role={message.role}
      data-dsh-chatroom-selection-mode={tools.selecting || undefined}
      data-dsh-chatroom-selected={tools.selected || undefined}
      onContextMenu={menu.open}
    >
      <ChatroomSelectionCheckbox tools={tools} />
      <span className="dsh-chatroom-member-avatar" data-avatar={avatar.id}>{avatar.emoji}</span>
      <div className="dsh-chatroom-thread-message-column">
        <strong>{message.displayName}<time>{formatTime(message.createdAt)}</time></strong>
        {message.reply !== undefined && (
          <div className="dsh-chatroom-thread-reply-quote">
            <strong>回复 {message.reply.displayName}</strong>
            <span>{message.reply.text}</span>
          </div>
        )}
        <div className="dsh-chatroom-thread-message-body">
          {message.role === 'ai'
            ? <ChatroomMarkdown text={message.text} />
            : <div className="dsh-chatroom-thread-literal-text">{message.text}</div>}
        </div>
        <ChatroomReactionBar {...tools} />
        <ChatroomInlineMessageActions tools={tools} />
      </div>
      <ChatroomMessageContextMenu tools={tools} position={menu.position} close={menu.close} />
    </article>
  )
}

function threadMessageTarget(message: ChatroomThreadMessage): ChatroomReplyReference {
  return {
    messageId: message.id,
    displayName: message.displayName,
    text: [...message.text.trim().replace(/\s+/gu, ' ')].slice(0, 120).join(''),
  }
}

interface ThreadMention {
  readonly start: number
  readonly query: string
}

function activeThreadMention(text: string, cursor: number): ThreadMention | undefined {
  const prefix = text.slice(0, cursor)
  const match = /(?:^|\s)@([^\s@]*)$/u.exec(prefix)
  if (match === null) return undefined
  return { start: prefix.length - match[1]!.length - 1, query: match[1]! }
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
