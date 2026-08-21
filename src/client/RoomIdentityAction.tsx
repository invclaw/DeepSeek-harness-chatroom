import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { ChatroomView } from './store.js'

interface RoomIdentityActionInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  openRoom(): void
  resetIdentity(): Promise<void>
}

type RoomIdentityActionProps = { readonly sessionId: SessionId } & RoomIdentityActionInjected

/** Show the current room identity and presence inside the native session header. */
export function RoomIdentityAction(props: RoomIdentityActionProps): JSX.Element | null {
  const room = props.useChatroom(snapshot => snapshot)
  if (room.room === undefined || String(props.sessionId) !== room.room.sessionId) return null
  const identity = room.identity
  const presence = room.connection === 'online' ? `${room.online} 人在线` : '连接中'
  return (
    <button
      className="dsh-chatroom-identity-action"
      type="button"
      title={identity === undefined ? '选择聊天室身份' : '切换聊天室身份'}
      onClick={() => { identity === undefined ? props.openRoom() : void props.resetIdentity() }}
    >
      <span className="dsh-chatroom-presence-dot" data-online={room.connection === 'online'} />
      {identity?.displayName ?? '选择身份'} · {presence}
    </button>
  )
}
