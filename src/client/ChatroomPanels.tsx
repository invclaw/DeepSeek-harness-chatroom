import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { chatroomAvatar, fallbackAvatarId } from '../avatars.js'
import type {
  ChatroomForwardItem,
  ChatroomNotification,
  ChatroomReplyReference,
  ChatroomThread,
  ChatroomThreadMessage,
} from '../types.js'
import type { ChatroomReactionEmoji } from '../reactions.js'
import {
  BRANCH_FRAME_READY,
  branchFrameDocumentReady,
  branchFrameTarget,
  branchFrameUrl,
  prepareBranchFrameSelection,
  restoreParentSessionSelection,
  switchBranchFrame,
} from './branch-frame.js'
import { ChatroomAccountPanels, type ChatroomAccountPanelProps } from './ChatroomAccountPanels.js'
import { ChatroomAvatarView } from './ChatroomAvatarView.js'
import { ChatroomMarkdown } from './ChatroomMarkdown.js'
import {
  ChatroomInlineMessageActions,
  ChatroomMessageContextMenu,
  ChatroomReactionBar,
  ChatroomSelectionCheckbox,
  useChatroomMessageMenu,
  type ChatroomMessageToolsProps,
} from './ChatroomMessageTools.js'

interface ChatroomPanelsProps extends ChatroomAccountPanelProps {
  closeMembers(): void
  renameRoom?(title: string): Promise<boolean>
  setMemberRole?(participantId: string, role: 'admin' | 'member'): Promise<boolean>
  addRoomMembers?(participantIds: readonly string[]): Promise<boolean>
  setRoomAutoTrigger?(enabled: boolean): Promise<boolean>
  closeThread(): void
  setThreadReply(reply: ChatroomReplyReference): void
  clearThreadReply(): void
  sendThreadMessage(text: string): Promise<boolean>
  enableSystemNotifications(): Promise<void>
  dismissToast(id: string): void
  toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void>
  recallMessage(roomId: string, messageId: string): Promise<boolean>
  openForward(roomId: string, message?: ChatroomForwardItem): void
  closeForward(): void
  forwardSelected(targetRoomId: string): Promise<boolean>
  clearMessageSelection(): void
  toggleMessageSelection(roomId: string, message: ChatroomForwardItem): void
}

let branchFrameInstance = 0
const BRANCH_FRAME_COMPATIBILITY_KEY = 'dsh-chatroom:branch-frame-compatibility'

/** Persistent member management, branch conversation, and in-page alerts. */
export function ChatroomPanels(props: ChatroomPanelsProps): JSX.Element {
  const [retainedThread, setRetainedThread] = useState<ChatroomThread>()
  const visibleThread = props.room.thread
  const mountedThread = visibleThread ?? retainedThread
  useEffect(() => {
    if (visibleThread !== undefined) setRetainedThread(visibleThread)
  }, [visibleThread])
  return (
    <>
      <ToastStack toasts={props.room.toasts} dismiss={props.dismissToast} />
      <ChatroomAccountPanels {...props} />
      {props.room.membersOpen && <MemberPanel {...props} />}
      {mountedThread !== undefined && <ThreadPanel
        {...props}
        thread={mountedThread}
        open={visibleThread?.id === mountedThread.id}
      />}
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
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<readonly string[]>([])
  const viewerRole = props.room.members.find(member =>
    member.participantId === props.room.identity?.participantId)?.role ?? 'member'
  const canManage = viewerRole === 'owner' || viewerRole === 'admin'
  const canInvite = canManage || props.room.auth.account?.role === 'super-admin'
  const normalizedSearch = search.trim().toLocaleLowerCase('zh-CN')
  const candidates = props.room.memberCandidates.filter(candidate => normalizedSearch === ''
    || candidate.displayName.toLocaleLowerCase('zh-CN').includes(normalizedSearch)
    || candidate.username.toLocaleLowerCase('zh-CN').includes(normalizedSearch))
  useEffect(() => {
    const available = new Set(props.room.memberCandidates.map(candidate => candidate.participantId))
    setSelected(current => current.filter(participantId => available.has(participantId)))
  }, [props.room.memberCandidates])
  return (
      <aside className="dsh-chatroom-member-card" data-testid="chatroom-members" aria-label="群管理">
        <button className="dsh-chatroom-close" aria-label="关闭群管理" type="button" onClick={props.closeMembers}>×</button>
        <h2>群管理</h2>
        <p>{props.room.room?.title} · {props.room.members.length} 位成员 · {props.room.online} 人在线</p>
        {canInvite && <section className="dsh-chatroom-invite" aria-label="添加群成员">
          <div className="dsh-chatroom-invite-heading">
            <div><strong>添加成员</strong><small>从系统中尚未加入本群的启用账号里选择。</small></div>
            <span>{selected.length} 位已选</span>
          </div>
          <input
            type="search"
            value={search}
            placeholder="搜索姓名或账号"
            aria-label="搜索系统用户"
            onChange={event => { setSearch(event.target.value) }}
          />
          <div className="dsh-chatroom-invite-list">
            {candidates.map(candidate => {
              const checked = selected.includes(candidate.participantId)
              return <label key={candidate.participantId}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={props.room.managementBusy}
                  onChange={() => { setSelected(current => checked
                    ? current.filter(participantId => participantId !== candidate.participantId)
                    : [...current, candidate.participantId]) }}
                />
                <ChatroomAvatarView className="dsh-chatroom-member-avatar" {...candidate} />
                <span><strong>{candidate.displayName}</strong><small>@{candidate.username}</small></span>
              </label>
            })}
            {candidates.length === 0 && <p>{props.room.managementBusy
              ? '正在加载系统用户…'
              : normalizedSearch === ''
                ? '所有启用账号都已在群聊中。'
                : '没有匹配的系统用户。'}</p>}
          </div>
          <button
            type="button"
            disabled={props.room.managementBusy || selected.length === 0}
            onClick={async () => {
              if (await props.addRoomMembers?.(selected)) setSelected([])
            }}
          >添加选中的 {selected.length} 位</button>
        </section>}
        {canManage && <form className="dsh-chatroom-manage-title" onSubmit={(event) => {
          event.preventDefault()
          void props.renameRoom?.(title)
        }}>
          <input value={title} maxLength={160} aria-label="群聊名称" onChange={event => { setTitle(event.target.value) }} />
          <button type="submit" disabled={props.room.managementBusy || title.trim() === '' || title.trim() === props.room.room?.title}>保存名称</button>
        </form>}
        <section className="dsh-chatroom-auto-trigger" aria-label="AI 自动回复">
          <div><strong>无需 @AI 自动回复</strong><small>开启后，由设置中选择的判断模型决定普通消息是否需要 AI 回复。群内所有成员都可以修改。</small></div>
          <label className="dsh-chatroom-switch">
            <input
              type="checkbox"
              aria-label="无需 @AI 自动回复"
              checked={props.room.room?.autoTriggerEnabled ?? false}
              disabled={props.room.managementBusy}
              onChange={event => { void props.setRoomAutoTrigger?.(event.target.checked) }}
            />
            <span aria-hidden />
          </label>
        </section>
        <div className="dsh-chatroom-member-list">
          {props.room.members.map(member => {
            return (
              <div className="dsh-chatroom-member" key={member.participantId}>
                <ChatroomAvatarView className="dsh-chatroom-member-avatar" {...member} />
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
      </aside>
  )
}

function ThreadPanel(props: ChatroomPanelsProps & {
  readonly thread: ChatroomThread
  readonly open: boolean
}): JSX.Element {
  const { thread } = props
  const parentSessionId = props.room.room?.sessionId
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [frameInstance] = useState(() => ++branchFrameInstance)
  const [attempt, setAttempt] = useState(0)
  const [preparedAttempt, setPreparedAttempt] = useState(-1)
  const [ready, setReady] = useState(false)
  const [compatibilityMode, setCompatibilityMode] = useState(branchFrameCompatibilityPreferred)
  useLayoutEffect(() => {
    if (parentSessionId === undefined) return
    if (compatibilityMode) {
      restoreParentSessionSelection(parentSessionId)
      return
    }
    prepareBranchFrameSelection(thread.sessionId)
    setPreparedAttempt(attempt)
    const fallback = globalThis.setTimeout(() => {
      restoreParentSessionSelection(parentSessionId)
    }, 30_000)
    return () => {
      globalThis.clearTimeout(fallback)
      restoreParentSessionSelection(parentSessionId)
    }
  }, [attempt, compatibilityMode, parentSessionId, thread.sessionId])
  useEffect(() => {
    if (props.open || parentSessionId === undefined) return
    restoreParentSessionSelection(parentSessionId)
  }, [parentSessionId, props.open])
  useEffect(() => {
    if (compatibilityMode) return
    setReady(false)
    let settled = false
    let poll: ReturnType<typeof globalThis.setInterval>
    let timer: ReturnType<typeof globalThis.setTimeout>
    const probe = () => {
      if (settled) return
      const frameWindow = frameRef.current?.contentWindow
      if (frameWindow !== null && frameWindow !== undefined && parentSessionId !== undefined) {
        switchBranchFrame(frameWindow, branchFrameTarget(thread, parentSessionId))
      }
      try {
        const document = frameRef.current?.contentDocument
        if (document === null || document === undefined
          || !branchFrameDocumentReady(document, thread.sessionId, thread.root.text)) return
      } catch {
        // An incomplete same-origin iframe can withhold its document; the visible timeout owns recovery.
        return
      }
      settled = true
      globalThis.clearInterval(poll)
      globalThis.clearTimeout(timer)
      setReady(true)
    }
    const receive = (event: MessageEvent) => {
      if (event.origin !== globalThis.location.origin || event.source !== frameRef.current?.contentWindow) return
      if (!isBranchReadyMessage(event.data, thread.id)) return
      probe()
    }
    globalThis.addEventListener('message', receive)
    poll = globalThis.setInterval(probe, 150)
    timer = globalThis.setTimeout(() => {
      if (settled) return
      globalThis.clearInterval(poll)
      if (parentSessionId !== undefined) restoreParentSessionSelection(parentSessionId)
      rememberBlockedBranchFrame()
      setCompatibilityMode(true)
    }, 8_000)
    probe()
    return () => {
      settled = true
      globalThis.removeEventListener('message', receive)
      globalThis.clearInterval(poll)
      globalThis.clearTimeout(timer)
    }
  }, [attempt, compatibilityMode, parentSessionId, thread.id, thread.root.text, thread.sessionId])
  const summary = branchSummary(thread.root.text)
  const frameUrl = parentSessionId === undefined
    ? undefined
    : branchFrameUrl(thread, parentSessionId, `${frameInstance}:${attempt}`)
  return (
    <aside
      className="dsh-chatroom-thread-panel"
      data-testid="chatroom-thread-panel"
      data-open={props.open}
      aria-hidden={!props.open}
      aria-label="分支回复"
    >
      <header>
        <div><strong>分支回复</strong><small>来自 {props.room.room?.title ?? '群聊'} · {thread.root.displayName}：{summary}</small></div>
        <button aria-label="关闭分支" type="button" onClick={props.closeThread}>×</button>
      </header>
      {parentSessionId === undefined
        ? <div className="dsh-chatroom-thread-frame-error">无法确定父群聊会话。</div>
        : compatibilityMode
          ? <ThreadCompatibilityPanel
            {...props}
            thread={thread}
            frameUrl={frameUrl!}
            retry={() => {
              forgetBlockedBranchFrame()
              setCompatibilityMode(false)
              setAttempt(value => value + 1)
            }}
          />
          : <div className="dsh-chatroom-thread-frame-shell">
            {preparedAttempt === attempt && <iframe
              className="dsh-chatroom-thread-frame"
              key={`${frameInstance}:${attempt}`}
              ref={frameRef}
              title={`分支回复：${summary}`}
              src={frameUrl}
              onLoad={() => {
                try {
                  if (frameRef.current?.contentDocument !== null) return
                } catch {
                  // The browser can reject an embedded document before exposing its content.
                }
                restoreParentSessionSelection(parentSessionId)
                rememberBlockedBranchFrame()
                setCompatibilityMode(true)
              }}
            />}
            {!ready && <div className="dsh-chatroom-thread-frame-status" role="status">
              <span>{attempt === 0 ? '正在加载分支…' : '正在重新加载分支…'}</span>
              <small>正在初始化原生 Harness 分支会话</small>
            </div>}
          </div>}
      {props.room.threadError !== undefined && <div className="dsh-chatroom-error" role="alert">{props.room.threadError}</div>}
    </aside>
  )
}

function ThreadCompatibilityPanel(props: ChatroomPanelsProps & {
  readonly thread: ChatroomThread
  readonly frameUrl: string
  retry(): void
}): JSX.Element {
  const [text, setText] = useState('')
  const [mention, setMention] = useState<ThreadMention | undefined>()
  const [mentionIndex, setMentionIndex] = useState(0)
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mentionCandidates = useMemo(() => {
    const aiNames = [...new Set(['AI', props.room.room?.aiDisplayName].filter((name): name is string => name !== undefined))]
    return [
      ...aiNames.map(name => ({ name, description: '当前分支的 AI 助手', ai: true })),
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
  return <div className="dsh-chatroom-thread-compatibility">
    <div className="dsh-chatroom-thread-compatibility-notice" role="status">
      <span>当前访问入口不允许嵌入完整 Agent，已切换到分支兼容模式。</span>
      <span><a href={props.frameUrl} target="_blank" rel="noreferrer">在新标签打开完整 Agent</a><button type="button" onClick={props.retry}>重试嵌入</button></span>
    </div>
    <div className="dsh-chatroom-thread-root">
      <strong>{props.thread.root.displayName}</strong>
      <div>{props.thread.root.role === 'ai'
        ? <ChatroomMarkdown text={props.thread.root.text} />
        : props.thread.root.text}</div>
    </div>
    <div className="dsh-chatroom-thread-messages">
      {props.room.threadMessages.length === 0 && <p className="dsh-chatroom-thread-empty">从这里开始与分支 AI 对话；回复只会进入当前分支。</p>}
      {props.room.threadMessages.map(message => <ThreadMessage key={message.id} message={message} roomId={props.thread.roomId} props={props} />)}
      <div ref={endRef} />
    </div>
    <form className="dsh-chatroom-thread-composer" onSubmit={(event) => {
      event.preventDefault()
      const submitted = text.trim()
      if (submitted === '') return
      void props.sendThreadMessage(submitted).then((sent) => { if (sent) setText('') })
    }}>
      {props.room.threadReply !== undefined && <div className="dsh-chatroom-thread-composer-reply">
        <span><strong>回复 {props.room.threadReply.displayName}</strong>{props.room.threadReply.text}</span>
        <button type="button" aria-label="取消引用" onClick={props.clearThreadReply}>×</button>
      </div>}
      <textarea
        ref={textareaRef}
        rows={3}
        placeholder="给分支 AI 发消息"
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
        {visibleMentions.map((candidate, index) => <button
          type="button"
          role="option"
          aria-label={candidate.name}
          aria-selected={index === mentionIndex}
          data-active={index === mentionIndex}
          key={candidate.name}
          onMouseDown={event => { event.preventDefault() }}
          onClick={() => { pickMention(candidate.name) }}
        ><i>{candidate.ai ? '✦' : '●'}</i><span><strong>{candidate.name}</strong><small>{candidate.description}</small></span></button>)}
      </div>}
      <button type="submit" disabled={props.room.threadBusy || text.trim() === ''}>发送</button>
    </form>
  </div>
}

function ThreadMessage({
  message,
  roomId,
  props,
}: {
  readonly message: ChatroomThreadMessage
  readonly roomId: string
  readonly props: ChatroomPanelsProps
}): JSX.Element {
  const own = message.participantId === props.room.identity?.participantId
  const knownMember = props.room.members.find(member => member.participantId === message.participantId)
  const avatarId = knownMember?.avatarId ?? message.avatarId ?? fallbackAvatarId(message.participantId)
  const avatarUrl = knownMember?.avatarUrl ?? message.avatarUrl
  const avatar = message.role === 'ai' ? { id: 'ai', emoji: '✦' } : chatroomAvatar(avatarId, message.participantId)
  const target = threadMessageTarget(message)
  const onReply = props.room.identity === undefined ? undefined : () => { props.setThreadReply(target) }
  const tools: ChatroomMessageToolsProps = {
    roomId,
    message: { ...target, role: message.role, createdAt: message.createdAt },
    reactions: props.room.reactions,
    identity: props.room.identity,
    selecting: props.room.selectionRoomId === roomId,
    selected: props.room.selectionRoomId === roomId
      && props.room.selectedMessages.some(item => item.messageId === message.id),
    recalled: props.room.recalls.some(item => item.messageId === message.id),
    canRecall: own && message.role === 'human',
    copyText: message.text,
    onReply,
    toggleReaction: props.toggleReaction,
    openForward: props.openForward,
    toggleSelection: props.toggleMessageSelection,
    recallMessage: props.recallMessage,
  }
  const menu = useChatroomMessageMenu()
  return <article
    className="dsh-chatroom-thread-message"
    data-own={own}
    data-role={message.role}
    data-dsh-chatroom-selection-mode={tools.selecting || undefined}
    data-dsh-chatroom-selected={tools.selected || undefined}
    onContextMenu={menu.open}
  >
    <ChatroomSelectionCheckbox tools={tools} />
    {message.role === 'ai'
      ? <span className="dsh-chatroom-member-avatar" data-avatar={avatar.id} aria-hidden>{avatar.emoji}</span>
      : <ChatroomAvatarView
          className="dsh-chatroom-member-avatar"
          participantId={message.participantId}
          avatarId={avatarId}
          {...(avatarUrl === undefined ? {} : { avatarUrl })}
        />}
    <div className="dsh-chatroom-thread-message-column">
      <strong>{message.displayName}<time>{formatTime(message.createdAt)}</time></strong>
      {!tools.recalled && message.reply !== undefined && <div className="dsh-chatroom-thread-reply-quote">
        <strong>回复 {message.reply.displayName}</strong><span>{message.reply.text}</span>
      </div>}
      <div className="dsh-chatroom-thread-message-body">
        {tools.recalled
          ? <div className="dsh-chatroom-recalled-message">消息已撤回</div>
          : message.role === 'ai'
            ? <ChatroomMarkdown text={message.text} />
            : <div className="dsh-chatroom-thread-literal-text">{message.text}</div>}
      </div>
      <ChatroomReactionBar {...tools} />
      <ChatroomInlineMessageActions tools={tools} />
    </div>
    <ChatroomMessageContextMenu tools={tools} position={menu.position} close={menu.close} />
  </article>
}

function threadMessageTarget(message: ChatroomThreadMessage): ChatroomReplyReference {
  return {
    messageId: message.id,
    displayName: message.displayName,
    text: branchSummary(message.text, 120),
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

function branchSummary(text: string, limit = 48): string {
  const normalized = text
    .replace(/```[\s\S]*?```/gu, ' ')
    .replace(/[`*_#>|\[\]]/gu, '')
    .replace(/\s+/gu, ' ')
    .trim()
  const characters = [...normalized]
  if (characters.length === 0) return '分支消息'
  return characters.length <= limit ? normalized : `${characters.slice(0, limit).join('')}…`
}

function branchFrameCompatibilityPreferred(): boolean {
  try {
    return globalThis.sessionStorage?.getItem(BRANCH_FRAME_COMPATIBILITY_KEY) === '1'
  } catch {
    return false
  }
}

function rememberBlockedBranchFrame(): void {
  try {
    globalThis.sessionStorage?.setItem(BRANCH_FRAME_COMPATIBILITY_KEY, '1')
  } catch {
    // Storage can be unavailable in isolated browser contexts; the current panel still falls back.
  }
}

function forgetBlockedBranchFrame(): void {
  try {
    globalThis.sessionStorage?.removeItem(BRANCH_FRAME_COMPATIBILITY_KEY)
  } catch {
    // Storage can be unavailable in isolated browser contexts; retry still applies to the current panel.
  }
}

function isBranchReadyMessage(value: unknown, threadId: string): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const message = value as { type?: unknown; threadId?: unknown }
  return message.type === BRANCH_FRAME_READY && message.threadId === threadId
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
