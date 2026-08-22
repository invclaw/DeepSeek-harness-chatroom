import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { ChatroomView } from './store.js'

interface RoomIdentityActionInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  openRoom(): void
  openMembers(): void
}

type RoomIdentityActionProps = { readonly sessionId: SessionId } & RoomIdentityActionInjected

/** Show the current room identity and presence inside the native session header. */
export function RoomIdentityAction(props: RoomIdentityActionProps): JSX.Element | null {
  const room = props.useChatroom(snapshot => snapshot)
  const current = room.rooms.find(candidate => String(props.sessionId) === candidate.sessionId)
  if (current === undefined) return null
  const identity = room.identity
  const selected = room.room?.id === current.id
  const presence = selected && room.connection === 'online' ? `${room.online} 人在线` : '共享会话'
  return (
    <span className="dsh-chatroom-header-actions">
      <button
        className="dsh-chatroom-identity-action"
        type="button"
        title={identity === undefined ? '选择聊天室身份' : '切换共享会话'}
        onClick={props.openRoom}
      >
        <span className="dsh-chatroom-presence-dot" data-online={selected && room.connection === 'online'} />
        {identity?.displayName ?? '选择身份'} · {presence}
      </button>
      <button className="dsh-chatroom-manage-action" type="button" onClick={props.openMembers}>群管理</button>
    </span>
  )
}
