import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import { useEffect, useState, useSyncExternalStore } from 'react'
import type { ChatroomView } from './store.js'

interface RoomIdentityActionInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  openMembers(): void
  openAgents?(): void
  sessions?: ISessions
}

type RoomIdentityActionProps = { readonly sessionId: SessionId } & RoomIdentityActionInjected

/** Show the current room identity and presence inside the native session header. */
export function RoomIdentityAction(props: RoomIdentityActionProps): JSX.Element | null {
  const room = props.useChatroom(snapshot => snapshot)
  const current = room.rooms.find(candidate => String(props.sessionId) === candidate.sessionId)
  if (current === undefined) {
    if (room.roomEnsureSessionId !== String(props.sessionId)) return null
    return <button className="dsh-chatroom-manage-action" type="button" disabled>正在建立共享群…</button>
  }
  const identity = room.identity
  const selected = room.room?.id === current.id
  const presence = selected && room.connection === 'online' ? `${room.online} 人在线` : '共享会话'
  return (
    <span className="dsh-chatroom-header-actions">
      <span className="dsh-chatroom-identity-action" title="当前群聊身份">
        <span className="dsh-chatroom-presence-dot" data-online={selected && room.connection === 'online'} />
        {identity?.displayName ?? '选择身份'} · {presence}
      </span>
      {props.sessions !== undefined && <RoomAgentRoster
        sessions={props.sessions}
        parentSessionId={props.sessionId}
        mainName={current.aiDisplayName}
      />}
      {props.openAgents !== undefined && <button className="dsh-chatroom-manage-action" type="button" onClick={props.openAgents}>AI 成员</button>}
      <button className="dsh-chatroom-manage-action" type="button" onClick={props.openMembers}>群管理</button>
    </span>
  )
}

/** Expose the existing native child catalog; never turn a session reference into a fake bot. */
export function RoomAgentRoster({ sessions, parentSessionId, mainName }: {
  sessions: ISessions
  parentSessionId: SessionId
  mainName: string
}): JSX.Element {
  const list = useSyncExternalStore(sessions.list.subscribe, sessions.list.getSnapshot)
  const catalog = list.subagentsByParent[parentSessionId]
  const children = catalog?.entries.filter(entry => entry.kind === 'child') ?? []
  const [error, setError] = useState<string>()
  const refresh = () => {
    setError(undefined)
    void sessions.refreshSubagents(parentSessionId).catch((cause: unknown) => setError(String(cause)))
  }
  useEffect(() => {
    setError(undefined)
    sessions.setSubagentCatalogOpen(parentSessionId, true)
    return () => sessions.setSubagentCatalogOpen(parentSessionId, false)
  }, [sessions, parentSessionId])
  const failed = error ?? (catalog?.state === 'error' ? 'Agent 列表读取失败，请重试' : undefined)
  return <span className="dsh-chatroom-agent-roster" aria-label="房间 Agent">
    <span>{failed !== undefined ? 'Agent 列表异常' : catalog === undefined || catalog.state === 'loading' ? 'Agent 加载中…' : `Agent ${children.length + 1}`}</span>
    <span className="dsh-chatroom-manage-action"
      title="主 Agent：在群聊中输入 @AI 提问">{mainName} · 主 Agent</span>
    {children.map(child => <button key={child.id} type="button" className="dsh-chatroom-manage-action"
      aria-label={`打开 Agent ${child.label ?? child.id}`}
      title={child.mode === 'continuable' ? '打开独立持久会话，直接与此 Agent 续聊；不是群聊中的会话引用' : '一次性 Agent，只能查看历史'}
      onClick={() => {
        try {
          setError(undefined)
          sessions.openSubagent({ parentSessionId, childSessionId: child.id, mode: child.mode })
        } catch (cause) { setError(String(cause)) }
      }}>
      {child.label ?? '未命名 Agent'} · {child.mode === 'one-shot' ? '只读' : child.activity === 'running' ? '运行中' : '可续聊'}
    </button>)}
    <button type="button" className="dsh-chatroom-manage-action" aria-label="刷新 Agent 列表" onClick={refresh}>↻</button>
    {failed !== undefined && <span role="alert">{failed}</span>}
    <small>子 Agent 点按钮直接续聊；@ 会话引用不会唤起它。</small>
  </span>
}
