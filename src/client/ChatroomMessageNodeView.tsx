import { memo, type ComponentType, type ReactNode } from 'react'
import type { ChatNode, ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { fallbackAvatarId, type ChatroomAvatarId } from '../avatars.js'
import type {
  ChatroomFileReference,
  ChatroomForwardBundle,
  ChatroomForwardItem,
  ChatroomIdentity,
  ChatroomImageReference,
  ChatroomReplyReference,
  ChatroomRoomAvatar,
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
import { ChatroomMarkdown } from './ChatroomMarkdown.js'
import { ChatroomAvatarView } from './ChatroomAvatarView.js'
import type { ChatroomView } from './store.js'
import type { ChatroomAgentTarget } from './store.js'

type ParticipantNode = ChatNode<'user' | 'steering'>

export { identifyChatroomText } from '../message.js'

interface ChatroomMessageNodeInjected<Kind extends 'user' | 'steering'> {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  nativeMessageView: ComponentType<ChatNodeViewProps<Kind>>
  resolveTarget?(sessionId: string): ChatroomAgentTarget | undefined
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
  knownAvatars: readonly ChatroomRoomAvatar[] = [],
): {
  readonly node: ParticipantNode
  readonly own: boolean
  readonly displayName?: string
  readonly avatarId: ChatroomAvatarId
  readonly avatarUrl?: string
  readonly participantId?: string
  readonly reply?: ChatroomReplyReference
  readonly files: readonly ChatroomFileReference[]
  readonly forward?: ChatroomForwardBundle
  readonly text: string
} {
  let own = false
  let identityProjected = false
  let displayName: string | undefined
  let avatarId: ChatroomAvatarId | undefined
  let avatarUrl: string | undefined
  let participantId: string | undefined
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
      participantId = marker?.participantId ?? (own ? identity?.participantId : undefined)
      const knownAvatar = knownAvatars.find(candidate => candidate.participantId === participantId)
      avatarId = knownAvatar?.avatarId ?? marker?.avatarId ?? fallbackAvatarId(displayName ?? participantId ?? 'participant')
      avatarUrl = knownAvatar?.avatarUrl ?? (own ? identity?.avatarUrl : undefined)
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
    ...(participantId === undefined ? {} : { participantId }),
    ...(avatarUrl === undefined ? {} : { avatarUrl }),
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
  const directRoom = room.rooms.find(candidate => String(props.sessionId) === candidate.sessionId)
  const sessionTarget = props.resolveTarget?.(String(props.sessionId))
    ?? (directRoom === undefined ? undefined : { kind: 'room' as const, room: directRoom })
  if (sessionTarget === undefined) {
    return <NativeView {...props} />
  }
  const activeRoom = sessionTarget.room
  const knownAvatars = room.room?.id === activeRoom.id ? room.members : activeRoom.memberAvatars ?? []
  const projection = projectChatroomMessage(props.node, room.identity, knownAvatars)
  const native = <NativeView {...props} node={projection.node as ChatNode<'user'>} />
  const message = messageTarget(String(props.sessionId), props.node, projection)
  const reply = replyTarget(message)
  const threadRoot = threadRootTarget(message)
  const onReply = room.identity === undefined ? undefined : () => { props.setReply(activeRoom.id, reply) }
  const onThread = room.identity === undefined || sessionTarget.kind === 'thread'
    ? undefined
    : () => { void props.openThread(activeRoom.id, threadRoot) }
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
  const directRoom = room.rooms.find(candidate => String(props.sessionId) === candidate.sessionId)
  const sessionTarget = props.resolveTarget?.(String(props.sessionId))
    ?? (directRoom === undefined ? undefined : { kind: 'room' as const, room: directRoom })
  if (sessionTarget === undefined) {
    return <NativeView {...props} />
  }
  const activeRoom = sessionTarget.room
  const knownAvatars = room.room?.id === activeRoom.id ? room.members : activeRoom.memberAvatars ?? []
  const projection = projectChatroomMessage(props.node, room.identity, knownAvatars)
  const native = <NativeView {...props} node={projection.node as ChatNode<'steering'>} />
  const message = messageTarget(String(props.sessionId), props.node, projection)
  const reply = replyTarget(message)
  const threadRoot = threadRootTarget(message)
  const onReply = room.identity === undefined ? undefined : () => { props.setReply(activeRoom.id, reply) }
  const onThread = room.identity === undefined || sessionTarget.kind === 'thread'
    ? undefined
    : () => { void props.openThread(activeRoom.id, threadRoot) }
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
      <ChatroomAvatarView
        className="dsh-chatroom-avatar"
        participantId={projection.participantId ?? projection.displayName ?? 'participant'}
        avatarId={projection.avatarId}
        {...(projection.avatarUrl === undefined ? {} : { avatarUrl: projection.avatarUrl })}
      />
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
        <ChatroomInlineMessageActions tools={tools} />
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

function ForwardCard({ forward, depth = 0 }: { forward: ChatroomForwardBundle; depth?: number }): JSX.Element {
  return (
    <details className="dsh-chatroom-forward-card">
      <summary><strong>合并转发 · {forward.items.length} 条消息</strong><small>来自 {forward.sourceRoomTitle}</small></summary>
      <div>
        {forward.items.map(item => (
          <article key={item.messageId}>
            <strong>{item.displayName}<time>{formatTime(item.createdAt)}</time></strong>
            {item.reply !== undefined && <div className="dsh-chatroom-forward-reply"><b>回复 {item.reply.displayName}</b><span>{item.reply.text}</span></div>}
            {(item.content ?? [{ type: 'text' as const, text: item.text, markdown: item.role === 'ai' }]).map((part, index) => {
              if (part.type === 'text') return part.markdown
                ? <ChatroomMarkdown key={index} text={part.text} />
                : <p className="dsh-chatroom-forward-text" key={index}>{part.text}</p>
              if (part.type === 'file') return <FileCard file={part.file} key={`${part.file.id}:${index}`} />
              const href = imageHref(forward.sourceRoomId, item, part.image)
              return href === undefined
                ? <span className="dsh-chatroom-forward-image-error" key={`${part.image.attachmentId}:${index}`}>图片来源不可用</span>
                : <img className="dsh-chatroom-forward-image" key={`${part.image.attachmentId}:${index}`} src={href} alt={part.image.name ?? '转发图片'} />
            })}
            {item.forward !== undefined && depth < 1 && <ForwardCard forward={item.forward} depth={depth + 1} />}
            {item.reactions !== undefined && item.reactions.length > 0 && <div className="dsh-chatroom-forward-reactions">
              {item.reactions.map(reaction => <span key={reaction.emoji}>{reaction.emoji} {reaction.count}</span>)}
            </div>}
          </article>
        ))}
      </div>
    </details>
  )
}

function imageHref(
  sourceRoomId: string,
  item: ChatroomForwardItem,
  image: ChatroomImageReference,
): string | undefined {
  if (item.sourceSessionId === undefined || item.sourceSeq === undefined) return undefined
  return `${CHATROOM_API_PREFIX}/images/${encodeURIComponent(JSON.stringify({
    sourceRoomId,
    sourceSessionId: item.sourceSessionId,
    sourceSeq: item.sourceSeq,
    image,
  }))}`
}

function messageTarget(
  sessionId: string,
  node: ParticipantNode,
  projection: ReturnType<typeof projectChatroomMessage>,
): ChatroomForwardItem {
  const fileText = projection.files.length === 0 ? '' : projection.files.map(file => file.name).join('、')
  const forwardText = projection.forward === undefined ? '' : `合并转发 ${projection.forward.items.length} 条消息`
  const text = (projection.text.trim() || fileText || forwardText || '图片消息').replace(/\s+/gu, ' ')
  return {
    messageId: `${node.kind}:${node.data.seq}`,
    sourceSessionId: sessionId,
    sourceSeq: node.data.seq,
    role: 'human',
    displayName: projection.displayName ?? '参与者',
    text: [...text].slice(0, 120).join(''),
    createdAt: node.data.time,
    content: [
      ...(projection.text.trim() === '' ? [] : [{ type: 'text' as const, text: projection.text, markdown: false }]),
      ...projection.node.data.content.flatMap(block => block.type === 'image'
        ? [{ type: 'image' as const, image: { ...block.attachment, attachmentId: String(block.attachment.attachmentId) } }]
        : []),
      ...projection.files.map(file => ({ type: 'file' as const, file })),
    ],
    ...(projection.reply === undefined ? {} : { reply: projection.reply }),
    ...(projection.forward === undefined ? {} : { forward: projection.forward }),
  }
}

function threadRootTarget(message: ChatroomForwardItem): ChatroomThreadRoot {
  if (message.sourceSessionId === undefined || message.sourceSeq === undefined) {
    throw new Error('chatroom branch target lost its source coordinates')
  }
  return {
    messageId: message.messageId,
    displayName: message.displayName,
    text: message.text,
    role: message.role,
    sourceSessionId: message.sourceSessionId,
    sourceSeq: message.sourceSeq,
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
