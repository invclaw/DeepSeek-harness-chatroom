import { memo, type ComponentType, type ReactNode } from 'react'
import type { ChatNode, ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { chatroomAvatar, fallbackAvatarId, type ChatroomAvatarId } from '../avatars.js'
import type { ChatroomFileReference, ChatroomIdentity, ChatroomReplyReference } from '../types.js'
import { participantMarker, projectFileText, projectReplyText } from '../message.js'
import { CHATROOM_API_PREFIX } from '../routes.js'
import type { ChatroomView } from './store.js'

type ParticipantNode = ChatNode<'user' | 'steering'>

export { identifyChatroomText } from '../message.js'

interface ChatroomMessageNodeInjected<Kind extends 'user' | 'steering'> {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  nativeMessageView: ComponentType<ChatNodeViewProps<Kind>>
  setReply(roomId: string, reply: ChatroomReplyReference): void
}

/** Props for the native user-message wrapper. */
export type ChatroomUserMessageNodeViewProps =
  & ChatNodeViewProps<'user'>
  & ChatroomMessageNodeInjected<'user'>

/** Props for the native steering-message wrapper. */
export type ChatroomSteeringMessageNodeViewProps =
  & ChatNodeViewProps<'steering'>
  & ChatroomMessageNodeInjected<'steering'>

/** Participant-specific display projection of one durable native user node. */
export function projectChatroomMessage(
  node: ParticipantNode,
  identity: ChatroomIdentity,
): {
  readonly node: ParticipantNode
  readonly own: boolean
  readonly displayName?: string
  readonly avatarId: ChatroomAvatarId
  readonly reply?: ChatroomReplyReference
  readonly files: readonly ChatroomFileReference[]
  readonly text: string
} {
  let own = false
  let identityProjected = false
  let displayName: string | undefined
  let avatarId: ChatroomAvatarId | undefined
  let reply: ChatroomReplyReference | undefined
  const files: ChatroomFileReference[] = []
  const texts: string[] = []
  const content = node.data.content.map((block) => {
    if (block.type !== 'text') return block
    let visibleText = block.text
    if (!identityProjected) {
      identityProjected = true
      const marker = participantMarker(visibleText)
      visibleText = marker === undefined ? visibleText : visibleText.slice(marker.length)
      const namePrefix = /^([^：]{1,80})：/.exec(visibleText)
      displayName = namePrefix?.[1]
      own = marker === undefined
        ? displayName === identity.displayName
        : marker.participantId === identity.participantId
      avatarId = marker?.avatarId ?? fallbackAvatarId(displayName ?? identity.participantId)
      if (namePrefix !== null) visibleText = visibleText.slice(namePrefix[0].length)
      const replyProjection = projectReplyText(visibleText)
      visibleText = replyProjection.text
      reply = replyProjection.reply
    }
    const fileProjection = projectFileText(visibleText)
    visibleText = fileProjection.text
    files.push(...fileProjection.files)
    if (visibleText.trim() !== '') texts.push(visibleText.trim())
    return visibleText === block.text ? block : { ...block, text: visibleText }
  })
  return {
    node: identityProjected
      ? { ...node, data: { ...node.data, content } } as ParticipantNode
      : node,
    own,
    avatarId: avatarId ?? fallbackAvatarId(identity.participantId),
    files,
    text: texts.join('\n'),
    ...(displayName === undefined ? {} : { displayName }),
    ...(reply === undefined ? {} : { reply }),
  }
}

/** Reuse Harness' native user renderer and move only peer user messages to the left. */
export const ChatroomUserMessageNodeView = memo(function ChatroomUserMessageNodeView(
  props: ChatroomUserMessageNodeViewProps,
) {
  const room = props.useChatroom(snapshot => snapshot)
  const NativeView = props.nativeMessageView
  if (!room.rooms.some(candidate => String(props.sessionId) === candidate.sessionId)
    || room.identity === undefined) {
    return <NativeView {...props} />
  }
  const projection = projectChatroomMessage(props.node, room.identity)
  const native = <NativeView {...props} node={projection.node as ChatNode<'user'>} />
  const activeRoom = room.rooms.find(candidate => String(props.sessionId) === candidate.sessionId)!
  return participantMessage(native, projection, () => {
    props.setReply(activeRoom.id, replyTarget(props.node, projection))
  })
})

/** Reuse Harness' native steering renderer and move only peer steering messages to the left. */
export const ChatroomSteeringMessageNodeView = memo(function ChatroomSteeringMessageNodeView(
  props: ChatroomSteeringMessageNodeViewProps,
) {
  const room = props.useChatroom(snapshot => snapshot)
  const NativeView = props.nativeMessageView
  if (!room.rooms.some(candidate => String(props.sessionId) === candidate.sessionId)
    || room.identity === undefined) {
    return <NativeView {...props} />
  }
  const projection = projectChatroomMessage(props.node, room.identity)
  const native = <NativeView {...props} node={projection.node as ChatNode<'steering'>} />
  const activeRoom = room.rooms.find(candidate => String(props.sessionId) === candidate.sessionId)!
  return participantMessage(native, projection, () => {
    props.setReply(activeRoom.id, replyTarget(props.node, projection))
  })
})

function participantMessage(
  native: ReactNode,
  projection: ReturnType<typeof projectChatroomMessage>,
  onReply: () => void,
): ReactNode {
  const avatar = chatroomAvatar(projection.avatarId, projection.displayName ?? '')
  return (
    <div className="dsh-chatroom-participant-message" data-dsh-chatroom-own={projection.own}>
      <div className="dsh-chatroom-avatar" data-avatar={avatar.id} title={avatar.label} aria-hidden>{avatar.emoji}</div>
      <div className="dsh-chatroom-message-column">
        {projection.displayName !== undefined
          && <div className="dsh-chatroom-display-name">{projection.displayName}</div>}
        {projection.reply !== undefined && (
          <div className="dsh-chatroom-reply-quote">
            <strong>回复 {projection.reply.displayName}</strong>
            <span>{projection.reply.text}</span>
          </div>
        )}
        <div className="dsh-chatroom-native-message">{native}</div>
        {projection.files.map(file => <FileCard file={file} key={file.id} />)}
        <button className="dsh-chatroom-reply-button" type="button" onClick={onReply}>↩ 回复</button>
      </div>
    </div>
  )
}

function FileCard({ file }: { file: ChatroomFileReference }): JSX.Element {
  return (
    <a
      className="dsh-chatroom-file-card"
      href={`${CHATROOM_API_PREFIX}/files/${encodeURIComponent(file.id)}`}
      download={file.name}
    >
      <span className="dsh-chatroom-file-icon" aria-hidden>📎</span>
      <span className="dsh-chatroom-file-copy">
        <strong>{file.name}</strong>
        <small>{formatFileSize(file.bytes)}</small>
      </span>
      <span aria-hidden>↓</span>
    </a>
  )
}

function replyTarget(node: ParticipantNode, projection: ReturnType<typeof projectChatroomMessage>): ChatroomReplyReference {
  const fileText = projection.files.length === 0 ? '' : projection.files.map(file => file.name).join('、')
  const text = (projection.text.trim() || fileText || '图片消息').replace(/\s+/gu, ' ')
  return {
    messageId: `${node.kind}:${node.data.seq}`,
    displayName: projection.displayName ?? '参与者',
    text: [...text].slice(0, 120).join(''),
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1_024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}
