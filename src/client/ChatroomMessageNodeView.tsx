import { memo, type ComponentType, type ReactNode } from 'react'
import type { ChatNode, ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ChatroomIdentity } from '../types.js'
import { PARTICIPANT_MARKER_END, PARTICIPANT_MARKER_START } from '../message.js'
import type { ChatroomView } from './store.js'

type ParticipantNode = ChatNode<'user' | 'steering'>

export { identifyChatroomText } from '../message.js'

interface ChatroomMessageNodeInjected<Kind extends 'user' | 'steering'> {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  nativeMessageView: ComponentType<ChatNodeViewProps<Kind>>
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
): { readonly node: ParticipantNode; readonly own: boolean; readonly displayName?: string } {
  let own = false
  let projected = false
  let displayName: string | undefined
  const content = node.data.content.map((block) => {
    if (projected || block.type !== 'text') return block
    projected = true
    const marker = participantMarker(block.text)
    const visibleText = marker === undefined ? block.text : block.text.slice(marker.length)
    const namePrefix = /^([^：]{1,80})：/.exec(visibleText)
    displayName = namePrefix?.[1]
    own = marker === undefined
      ? displayName === identity.displayName
      : marker.participantId === identity.participantId
    const messageText = namePrefix === null ? visibleText : visibleText.slice(namePrefix[0].length)
    return messageText === block.text ? block : { ...block, text: messageText }
  })
  return {
    node: projected
      ? { ...node, data: { ...node.data, content } } as ParticipantNode
      : node,
    own,
    ...(displayName === undefined ? {} : { displayName }),
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
  return participantMessage(native, projection)
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
  return participantMessage(native, projection)
})

function participantMessage(
  native: ReactNode,
  projection: { readonly own: boolean; readonly displayName?: string },
): ReactNode {
  return (
    <div className="dsh-chatroom-participant-message" data-dsh-chatroom-own={projection.own}>
      {projection.displayName !== undefined
        && <div className="dsh-chatroom-display-name">{projection.displayName}</div>}
      {native}
    </div>
  )
}

function participantMarker(text: string): { readonly participantId: string; readonly length: number } | undefined {
  if (!text.startsWith(PARTICIPANT_MARKER_START)) return undefined
  const end = text.indexOf(PARTICIPANT_MARKER_END, PARTICIPANT_MARKER_START.length)
  if (end < 0) return undefined
  const participantId = text.slice(PARTICIPANT_MARKER_START.length, end)
  if (participantId === '') return undefined
  return { participantId, length: end + PARTICIPANT_MARKER_END.length }
}
