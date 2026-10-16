import { useEffect, useState } from 'react'
import type { PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionReference } from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from './NativeBranchContent.js'
import type {
  ChatroomForwardItem,
  ChatroomNotification,
  ChatroomReplyReference,
  ChatroomSearchResult,
  ChatroomThread,
} from '../types.js'
import type { ChatroomReactionEmoji } from '../reactions.js'
import { ChatroomAccountPanels, type ChatroomAccountPanelProps } from './ChatroomAccountPanels.js'
import { ChatroomAvatarView } from './ChatroomAvatarView.js'

interface ChatroomPanelsProps extends ChatroomAccountPanelProps, PropsRenderSlots<'chatroom.branch'> {
  retainBranch(sessionId: string): SessionReference
  openBranchSession(sessionId: string): void
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
  closeSearch(): void
  searchAll(query: string): Promise<void>
  openSearchResult(result: ChatroomSearchResult): Promise<void>
}

/** Persistent member management, branch conversation, and in-page alerts. */
export function ChatroomPanels(props: ChatroomPanelsProps): JSX.Element {
  return (
    <>
      <ToastStack toasts={props.room.toasts} dismiss={props.dismissToast} />
      <ChatroomAccountPanels {...props} />
      {props.room.membersOpen && <MemberPanel {...props} />}
      {props.room.thread !== undefined && <ThreadPanel
        {...props}
        thread={props.room.thread}
        open
      />}
      {props.room.selectionRoomId !== undefined && <SelectionBar {...props} />}
      {props.room.forwardOpen && <ForwardPanel {...props} />}
      {props.room.searchOpen && <SearchPanel {...props} />}
    </>
  )
}

function SearchPanel(props: ChatroomPanelsProps): JSX.Element {
  const [query, setQuery] = useState(props.room.searchQuery)
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') props.closeSearch() }
    document.addEventListener('keydown', close)
    return () => { document.removeEventListener('keydown', close) }
  }, [props.closeSearch])
  useEffect(() => {
    const timer = globalThis.setTimeout(() => { void props.searchAll(query) }, 180)
    return () => { globalThis.clearTimeout(timer) }
  }, [props.searchAll, query])
  return <div
    className="dsh-chatroom-search-layer"
    data-testid="chatroom-search-dialog"
    onPointerDown={event => { if (event.target === event.currentTarget) props.closeSearch() }}
  >
    <section className="dsh-chatroom-search-dialog" role="dialog" aria-modal="true" aria-label="搜索全部会话">
      <header>
        <div><strong>搜索</strong><small>用户、群聊、私聊、分支与全部聊天内容</small></div>
        <button type="button" aria-label="关闭搜索" onClick={props.closeSearch}>×</button>
      </header>
      <label className="dsh-chatroom-search-input">
        <span aria-hidden>⌕</span>
        <input
          autoFocus
          type="search"
          value={query}
          placeholder="输入用户名、群聊名或消息内容"
          aria-label="搜索用户名、群聊名或消息内容"
          onChange={event => { setQuery(event.target.value) }}
        />
        {query !== '' && <button type="button" aria-label="清空搜索" onClick={() => { setQuery('') }}>×</button>}
      </label>
      <div className="dsh-chatroom-search-results" role="listbox" aria-label="搜索结果">
        {props.room.searchResults.map(result => <button
          type="button"
          role="option"
          aria-label={`${result.title}，${result.subtitle}`}
          key={result.id}
          onClick={() => { void props.openSearchResult(result) }}
        >
          <span className="dsh-chatroom-search-result-icon" aria-hidden>{searchResultIcon(result.kind)}</span>
          <span className="dsh-chatroom-search-result-copy">
            <strong>{result.title}</strong>
            <small>{result.subtitle}</small>
            {result.preview !== undefined && <span>{result.preview}</span>}
          </span>
          {result.createdAt !== undefined && <time>{formatSearchTime(result.createdAt)}</time>}
        </button>)}
        {props.room.searchBusy && <p role="status">正在搜索…</p>}
        {!props.room.searchBusy && props.room.searchError !== undefined && <p className="dsh-chatroom-error" role="alert">{props.room.searchError}</p>}
        {!props.room.searchBusy && props.room.searchError === undefined && query.trim() === '' && <p>输入关键词，搜索当前账号可见的全部内容。</p>}
        {!props.room.searchBusy && props.room.searchError === undefined && query.trim() !== '' && props.room.searchResults.length === 0 && <p>没有找到匹配的用户、会话或消息。</p>}
      </div>
    </section>
  </div>
}

function searchResultIcon(kind: ChatroomSearchResult['kind']): string {
  switch (kind) {
    case 'account': return '人'
    case 'direct': return '私'
    case 'room': return '群'
    case 'thread': return '↳'
    case 'message': return '文'
  }
}

function formatSearchTime(createdAt: number): string {
  const date = new Date(createdAt)
  const today = new Date()
  return date.toDateString() === today.toDateString()
    ? date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
    : date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
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
  const { thread, SessionProvider, renderSlot, retainBranch } = props
  const [reference, setReference] = useState<SessionReference>()
  const [error, setError] = useState<string>()
  useEffect(() => {
    const selected = retainBranch(thread.sessionId)
    let active = true
    setReference(selected)
    setError(undefined)
    void selected.ready.catch(() => { if (active) setError('分支暂时无法加载，请关闭后重试。') })
    return () => { active = false; selected.release() }
  }, [retainBranch, thread.sessionId])
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') props.closeThread() }
    document.addEventListener('keydown', close)
    return () => { document.removeEventListener('keydown', close) }
  }, [props.closeThread])
  return <div className="dsh-chatroom-thread-layer" data-testid="chatroom-thread-layer"
    onPointerDown={event => { if (event.target === event.currentTarget) props.closeThread() }}>
    <aside className="dsh-chatroom-thread-panel" data-testid="chatroom-thread-panel" data-open={props.open} aria-label="分支回复">
      <header>
        <div><strong>分支回复</strong><small>{props.room.room?.title ?? '群聊'} · {thread.root.displayName} 发起</small></div>
        <span className="dsh-chatroom-thread-header-actions">
        <button aria-label="在主视图打开分支" title="在主视图打开，查看轨迹与知识来源" type="button" onClick={() => { props.openBranchSession(thread.sessionId) }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h6v6m0-6-9 9" /><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></svg>
        </button>
        <button aria-label="关闭分支" type="button" onClick={props.closeThread}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
        </button>
        </span>
      </header>
      <div className="dsh-chatroom-thread-native" data-dsh-chatroom-branch-session={thread.sessionId}>
        {error !== undefined ? <div className="dsh-chatroom-thread-error" role="alert">{error}</div>
          : reference?.sessionId === thread.sessionId
            ? <SessionProvider session={reference}>{renderSlot('chatroom.branch', {})}</SessionProvider>
            : <div className="dsh-chatroom-thread-status" role="status">正在加载分支…</div>}
      </div>
    </aside>
  </div>
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
