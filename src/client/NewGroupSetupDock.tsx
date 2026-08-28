import { useEffect, useMemo, useState } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ChatroomAgentTarget, ChatroomView } from './store.js'
import { ChatroomAvatarView } from './ChatroomAvatarView.js'

interface NewGroupSetupInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  resolveTarget(sessionId: string): ChatroomAgentTarget | undefined
  loadRoomMemberCandidates(): Promise<void>
  completeGroupSetup(title: string, participantIds: readonly string[]): Promise<boolean>
}

type NewGroupSetupDockProps = PropsRuntime<'conversation.input.dock'> & NewGroupSetupInjected

/** Inline blank-Session flow for naming a group and adding platform accounts before the first message. */
export function NewGroupSetupDock(props: NewGroupSetupDockProps): JSX.Element | null {
  const view = props.useChatroom(snapshot => snapshot)
  const target = props.resolveTarget(String(props.sessionId))
  const room = target?.kind === 'room' ? target.room : undefined
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [title, setTitle] = useState('新群聊')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<readonly string[]>([])
  const [saving, setSaving] = useState(false)
  const blank = props.session.composerPhase === 'blank' && props.session.nodes.length === 0
  const normalizedSearch = search.trim().toLocaleLowerCase('zh-CN')
  const candidates = useMemo(() => view.memberCandidates.filter(candidate => normalizedSearch === ''
    || candidate.displayName.toLocaleLowerCase('zh-CN').includes(normalizedSearch)
    || candidate.username.toLocaleLowerCase('zh-CN').includes(normalizedSearch)), [normalizedSearch, view.memberCandidates])

  useEffect(() => {
    setExpanded(false)
    setDismissed(false)
    setTitle('新群聊')
    setSearch('')
    setSelected([])
    setSaving(false)
  }, [props.sessionId])
  useEffect(() => {
    if (expanded && room !== undefined) void props.loadRoomMemberCandidates()
  }, [expanded, room?.id])
  useEffect(() => {
    const available = new Set(view.memberCandidates.map(candidate => candidate.participantId))
    setSelected(current => current.filter(participantId => available.has(participantId)))
  }, [view.memberCandidates])

  if (!blank || room === undefined || view.branchFrame !== undefined || dismissed || view.members.length > 1) return null
  if (!expanded) {
    return (
      <section className="dsh-chatroom-group-setup dsh-chatroom-group-setup-collapsed" aria-label="创建群聊">
        <span className="dsh-chatroom-group-setup-icon" aria-hidden>👥</span>
        <span>
          <strong>直接创建群聊</strong>
          <small>填写群名并从系统用户中勾选成员，第一条消息前就把大家拉进来。</small>
        </span>
        <button type="button" onClick={() => { setExpanded(true) }}>选择成员</button>
      </section>
    )
  }

  const busy = saving || view.managementBusy === true
  return (
    <section className="dsh-chatroom-group-setup" aria-label="创建群聊">
      <header>
        <span><strong>创建群聊</strong><small>当前新会话将成为这个群的 AI 会话。</small></span>
        <span>{selected.length} 位已选</span>
      </header>
      <div className="dsh-chatroom-group-setup-fields">
        <label>
          <span>群聊名称</span>
          <input
            value={title}
            maxLength={160}
            aria-label="新群聊名称"
            onChange={event => { setTitle(event.target.value) }}
          />
        </label>
        <label>
          <span>邀请成员</span>
          <input
            type="search"
            value={search}
            placeholder="搜索姓名或账号"
            aria-label="搜索新群聊成员"
            onChange={event => { setSearch(event.target.value) }}
          />
        </label>
      </div>
      <div className="dsh-chatroom-group-setup-list">
        {candidates.map(candidate => {
          const checked = selected.includes(candidate.participantId)
          return (
            <label key={candidate.participantId}>
              <input
                type="checkbox"
                checked={checked}
                disabled={busy}
                onChange={() => { setSelected(current => checked
                  ? current.filter(participantId => participantId !== candidate.participantId)
                  : [...current, candidate.participantId]) }}
              />
              <ChatroomAvatarView className="dsh-chatroom-member-avatar" {...candidate} />
              <span><strong>{candidate.displayName}</strong><small>@{candidate.username}</small></span>
            </label>
          )
        })}
        {candidates.length === 0 && <p>{view.managementBusy
          ? '正在加载系统用户…'
          : normalizedSearch === ''
            ? '当前没有其他可邀请的系统用户。'
            : '没有匹配的系统用户。'}</p>}
      </div>
      {view.managementError !== undefined && <div className="dsh-chatroom-error" role="alert">{view.managementError}</div>}
      <footer>
        <button className="dsh-chatroom-group-setup-secondary" type="button" disabled={busy} onClick={() => { setDismissed(true) }}>稍后邀请</button>
        <button
          className="dsh-chatroom-group-setup-primary"
          type="button"
          disabled={busy || title.trim() === '' || selected.length === 0}
          onClick={async () => {
            setSaving(true)
            const completed = await props.completeGroupSetup(title, selected)
            setSaving(false)
            if (completed) setDismissed(true)
          }}
        >{saving ? '正在创建…' : `创建群聊（${selected.length + 1} 人）`}</button>
      </footer>
    </section>
  )
}
