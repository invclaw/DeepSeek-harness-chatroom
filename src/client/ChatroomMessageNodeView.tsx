import { memo, type ComponentType, type ReactNode } from 'react'
import type { ChatNode, ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { chatroomAvatar, fallbackAvatarId, type ChatroomAvatarId } from '../avatars.js'
import type {
  ChatroomFileReference,
  ChatroomForwardBundle,
  ChatroomForwardItem,
  ChatroomIdentity,
  ChatroomReplyReference,
  ChatroomThreadPreview,
  ChatroomThreadRoot,
} from '../types.js'
import { participantMarker, projectFileText, projectForwardText, projectReplyText } from '../message.js'
import type { ChatroomReactionEmoji } from '../reactions.js'
import { CHATROOM_API_PREFIX } from '../routes.js'
import {
  ChatroomInlineMessageActions,
  ChatroomMessageContextMenu,
  ChatroomReactionBar,
  ChatroomSelectionCheckbox,
  useChatroomMessageMenu,
  type ChatroomMessageToolsProps,
} from './ChatroomMessageTools.js'
import { ChatroomThreadActivity } from './ChatroomThreadActivity.js'
import type { ChatroomView } from './store.js'

type ParticipantNode = ChatNode<'user' | 'steering'>

export { identifyChatroomText } from '../message.js'

interface ChatroomMessageNodeInjected<Kind extends 'user' | 'steering'> {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  nativeMessageView: ComponentType<ChatNodeViewProps<Kind>>
  setReply(roomId: string, reply: ChatroomReplyReference): void
  openThread(roomId: string, root: ChatroomThreadRoot): Promise<void>
  toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void>
  openForward(roomId: string, message: ChatroomForwardItem): void
  toggleMessageSelection(roomId: string, message: ChatroomForwardItem): void
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
  identity: ChatroomIdentity | undefined,
): {
  readonly node: ParticipantNode
  readonly own: boolean
  readonly displayName?: string
  readonly avatarId: ChatroomAvatarId
  readonly reply?: ChatroomReplyReference
  readonly files: readonly ChatroomFileReference[]
  readonly forward?: ChatroomForwardBundle
  readonly text: string
} {
  let own = false
  let identityProjected = false
  let displayName: string | undefined
  let avatarId: ChatroomAvatarId | undefined
  let reply: ChatroomReplyReference | undefined
  let forward: ChatroomForwardBundle | undefined
  const files: ChatroomFileReference[] = []
  const texts: string[] = []
  const content: Array<(typeof node.data.content)[number]> = []
  for (const block of node.data.content) {
    if (block.type !== 'text') {
      content.push(block)
      continue
    }
    let visibleText = block.text
    if (!identityProjected) {
      identityProjected = true
      const marker = participantMarker(visibleText)
      visibleText = marker === undefined ? visibleText : visibleText.slice(marker.length)
      const namePrefix = /^([^：]{1,80})：/.exec(visibleText)
      displayName = namePrefix?.[1]
      own = identity !== undefined && (marker === undefined
        ? displayName === identity.displayName
        : marker.participantId === identity.participantId)
      avatarId = marker?.avatarId ?? fallbackAvatarId(displayName ?? marker?.participantId ?? 'participant')
      if (namePrefix !== null) visibleText = visibleText.slice(namePrefix[0].length)
      const replyProjection = projectReplyText(visibleText)
      visibleText = replyProjection.text
      reply = replyProjection.reply
      const forwardProjection = projectForwardText(visibleText)
      visibleText = forwardProjection.text
      forward = forwardProjection.forward
    }
    const fileProjection = projectFileText(visibleText)
    visibleText = fileProjection.text
    files.push(...fileProjection.files)
    if (visibleText.trim() !== '') texts.push(visibleText.trim())
    if (visibleText.trim() !== '') content.push(visibleText === block.text ? block : { ...block, text: visibleText })
  }
  const hasVisualAttachment = files.length > 0 || content.some(block => block.type === 'image')
  if (hasVisualAttachment && texts.length === 1 && isLegacyAttachmentPlaceholder(texts[0]!)) {
    texts.length = 0
    for (let index = content.length - 1; index >= 0; index -= 1) {
      const block = content[index]
      if (block?.type === 'text' && isLegacyAttachmentPlaceholder(block.text.trim())) content.splice(index, 1)
    }
  }
  return {
    node: identityProjected
      ? { ...node, data: { ...node.data, content } } as ParticipantNode
      : node,
    own,
    avatarId: avatarId ?? fallbackAvatarId(identity?.participantId ?? 'participant'),
    files,
    text: texts.join('\n'),
    ...(displayName === undefined ? {} : { displayName }),
    ...(reply === undefined ? {} : { reply }),
    ...(forward === undefined ? {} : { forward }),
  }
}

function isLegacyAttachmentPlaceholder(text: string): boolean {
  return text === '发送了文件。' || text === '发送了一张图片。'
}

/** Reuse Harness' native user renderer and move only peer user messages to the left. */
export const ChatroomUserMessageNodeView = memo(function ChatroomUserMessageNodeView(
  props: ChatroomUserMessageNodeViewProps,
) {
  const room = props.useChatroom(snapshot => snapshot)
  const NativeView = props.nativeMessageView
  if (!room.rooms.some(candidate => String(props.sessionId) === candidate.sessionId)) {
    return <NativeView {...props} />
  }
  const projection = projectChatroomMessage(props.node, room.identity)
  const native = <NativeView {...props} node={projection.node as ChatNode<'user'>} />
  const activeRoom = room.rooms.find(candidate => String(props.sessionId) === candidate.sessionId)!
  const message = messageTarget(props.node, projection)
  const target = replyTarget(message)
  const onReply = room.identity === undefined ? undefined : () => { props.setReply(activeRoom.id, target) }
  const onThread = room.identity === undefined
    ? undefined
    : () => { void props.openThread(activeRoom.id, { ...target, role: 'human' }) }
  const tools = messageTools(props, room, activeRoom.id, message, message.text, onReply, onThread)
  const threadPreview = findThreadPreview(room.threadPreviews, message.messageId, 'human')
  return <ParticipantMessage
    native={native}
    projection={projection}
    tools={tools}
    threadPreview={threadPreview}
    onReply={onReply}
    onThread={onThread}
  />
})

/** Reuse Harness' native steering renderer and move only peer steering messages to the left. */
export const ChatroomSteeringMessageNodeView = memo(function ChatroomSteeringMessageNodeView(
  props: ChatroomSteeringMessageNodeViewProps,
) {
  const room = props.useChatroom(snapshot => snapshot)
  const NativeView = props.nativeMessageView
  if (!room.rooms.some(candidate => String(props.sessionId) === candidate.sessionId)) {
    return <NativeView {...props} />
  }
  const projection = projectChatroomMessage(props.node, room.identity)
  const native = <NativeView {...props} node={projection.node as ChatNode<'steering'>} />
  const activeRoom = room.rooms.find(candidate => String(props.sessionId) === candidate.sessionId)!
  const message = messageTarget(props.node, projection)
  const target = replyTarget(message)
  const onReply = room.identity === undefined ? undefined : () => { props.setReply(activeRoom.id, target) }
  const onThread = room.identity === undefined
    ? undefined
    : () => { void props.openThread(activeRoom.id, { ...target, role: 'human' }) }
  const tools = messageTools(props, room, activeRoom.id, message, message.text, onReply, onThread)
  const threadPreview = findThreadPreview(room.threadPreviews, message.messageId, 'human')
  return <ParticipantMessage
    native={native}
    projection={projection}
    tools={tools}
    threadPreview={threadPreview}
    onReply={onReply}
    onThread={onThread}
  />
})

function ParticipantMessage({
  native,
  projection,
  tools,
  threadPreview,
  onReply,
  onThread,
}: {
  native: ReactNode
  projection: ReturnType<typeof projectChatroomMessage>
  tools: ChatroomMessageToolsProps
  threadPreview: ChatroomThreadPreview | undefined
  onReply: (() => void) | undefined
  onThread: (() => void) | undefined
}): ReactNode {
  const avatar = chatroomAvatar(projection.avatarId, projection.displayName ?? '')
  const menu = useChatroomMessageMenu()
  return (
    <div
      className="dsh-chatroom-participant-message"
      data-dsh-chatroom-own={projection.own}
      data-dsh-chatroom-selection-mode={tools.selecting || undefined}
      data-dsh-chatroom-selected={tools.selected || undefined}
      onContextMenu={menu.open}
    >
      <ChatroomSelectionCheckbox tools={tools} />
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
        {projection.node.data.content.length > 0 && <div className="dsh-chatroom-native-message">{native}</div>}
        {projection.files.map(file => <FileCard file={file} key={file.id} />)}
        {projection.forward !== undefined && <ForwardCard forward={projection.forward} />}
        <ChatroomReactionBar {...tools} />
        <ChatroomThreadActivity preview={threadPreview} open={onThread} />
        <ChatroomInlineMessageActions tools={tools} nativeCopy />
      </div>
      <ChatroomMessageContextMenu tools={tools} position={menu.position} close={menu.close} />
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

function ForwardCard({ forward }: { forward: ChatroomForwardBundle }): JSX.Element {
  return (
    <details className="dsh-chatroom-forward-card">
      <summary><strong>合并转发 · {forward.items.length} 条消息</strong><small>来自 {forward.sourceRoomTitle}</small></summary>
      <div>
        {forward.items.map(item => (
          <article key={item.messageId}>
            <strong>{item.displayName}<time>{formatTime(item.createdAt)}</time></strong>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </details>
  )
}

function messageTarget(node: ParticipantNode, projection: ReturnType<typeof projectChatroomMessage>): ChatroomForwardItem {
  const fileText = projection.files.length === 0 ? '' : projection.files.map(file => file.name).join('、')
  const forwardText = projection.forward === undefined ? '' : `合并转发 ${projection.forward.items.length} 条消息`
  const text = (projection.text.trim() || fileText || forwardText || '图片消息').replace(/\s+/gu, ' ')
  return {
    messageId: `${node.kind}:${node.data.seq}`,
    role: 'human',
    displayName: projection.displayName ?? '参与者',
    text: [...text].slice(0, 120).join(''),
    createdAt: node.data.time,
  }
}

function replyTarget(message: ChatroomForwardItem): ChatroomReplyReference {
  return { messageId: message.messageId, displayName: message.displayName, text: message.text }
}

function messageTools(
  props: ChatroomUserMessageNodeViewProps | ChatroomSteeringMessageNodeViewProps,
  room: ChatroomView,
  roomId: string,
  message: ChatroomForwardItem,
  copyText: string,
  onReply: (() => void) | undefined,
  onBranch: (() => void) | undefined,
): ChatroomMessageToolsProps {
  return {
    roomId,
    message,
    reactions: room.reactions,
    identity: room.identity,
    selecting: room.selectionRoomId === roomId,
    selected: room.selectionRoomId === roomId && room.selectedMessages.some(item => item.messageId === message.messageId),
    copyText,
    onReply,
    onBranch,
    toggleReaction: props.toggleReaction,
    openForward: props.openForward,
    toggleSelection: props.toggleMessageSelection,
  }
}

function findThreadPreview(
  previews: readonly ChatroomThreadPreview[],
  messageId: string,
  role: 'human' | 'ai',
): ChatroomThreadPreview | undefined {
  return previews.find(preview => preview.thread.root.messageId === messageId && preview.thread.root.role === role)
}

function formatTime(time: number): string {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1_024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}
