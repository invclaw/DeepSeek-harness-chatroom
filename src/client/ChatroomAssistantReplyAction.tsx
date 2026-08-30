import { useEffect, useRef } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  ChatroomForwardContentPart,
  ChatroomForwardItem,
  ChatroomReplyReference,
  ChatroomThreadRoot,
} from '../types.js'
import type { ChatroomReactionEmoji } from '../reactions.js'
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
import type { ChatroomAgentTarget } from './store.js'

interface AssistantReplyInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  resolveTarget?(sessionId: string): ChatroomAgentTarget | undefined
  setReply(roomId: string, reply: ChatroomReplyReference): void
  openThread(roomId: string, root: ChatroomThreadRoot): Promise<void>
  toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void>
  openForward(roomId: string, message: ChatroomForwardItem): void
  toggleMessageSelection(roomId: string, message: ChatroomForwardItem): void
}

type AssistantReplyProps = PropsRuntime<'conversation.chat.assistant-actions'> & AssistantReplyInjected

/** Reply action contributed to finalized AI messages in shared rooms. */
export function ChatroomAssistantReplyAction(props: AssistantReplyProps): JSX.Element | null {
  const view = props.useChatroom(snapshot => snapshot)
  const directRoom = view.rooms.find(candidate => candidate.sessionId === String(props.sessionId))
  const target = props.resolveTarget?.(String(props.sessionId))
    ?? (directRoom === undefined ? undefined : { kind: 'room' as const, room: directRoom })
  const room = target?.room
  const assistant = props.useSession(snapshot => snapshot.nodes.find(node =>
    node.kind === 'assistant' && node.messageId === props.messageId))
  const rootRef = useRef<HTMLDivElement>(null)
  const menu = useChatroomMessageMenu()
  const selected = view.selectionRoomId === room?.id
    && view.selectedMessages.some(item => item.messageId === String(props.messageId))
  const selecting = view.selectionRoomId === room?.id
  useEffect(() => {
    const root = rootRef.current?.closest<HTMLElement>('[data-time-hover-root]')
    if (root === null || root === undefined || room === undefined) return
    let nativeActions = rootRef.current?.parentElement
    while (nativeActions !== null && nativeActions !== undefined
      && nativeActions.parentElement !== null && nativeActions.parentElement !== root) {
      nativeActions = nativeActions.parentElement
    }
    nativeActions?.setAttribute('data-dsh-chatroom-native-actions', '')
    const onContextMenu = (event: MouseEvent) => { menu.open(event) }
    root.addEventListener('contextmenu', onContextMenu)
    root.toggleAttribute('data-dsh-chatroom-selected', selected)
    root.toggleAttribute('data-dsh-chatroom-selection-mode', selecting)
    return () => {
      root.removeEventListener('contextmenu', onContextMenu)
      root.removeAttribute('data-dsh-chatroom-selected')
      root.removeAttribute('data-dsh-chatroom-selection-mode')
      nativeActions?.removeAttribute('data-dsh-chatroom-native-actions')
    }
  }, [menu.open, room, selected, selecting])
  if (room === undefined || assistant?.kind !== 'assistant') return null
  const text = assistant.blocks.flatMap(block => block.kind === 'text' ? [block.text] : []).join('')
    .trim().replace(/\s+/gu, ' ')
  const reply: ChatroomReplyReference = {
    messageId: String(props.messageId),
    displayName: room.aiDisplayName,
    text: [...(text || 'AI 回复')].slice(0, 120).join(''),
  }
  const message: ChatroomForwardItem = {
    ...reply,
    sourceSessionId: String(props.sessionId),
    sourceSeq: assistant.seq,
    role: 'ai',
    createdAt: assistant.time,
    content: assistant.blocks.reduce<ChatroomForwardContentPart[]>((parts, block) => {
      if (block.kind === 'text') parts.push({ type: 'text', text: block.text, markdown: true })
      if (block.kind === 'image') parts.push({
        type: 'image',
        image: { ...block.attachment, attachmentId: String(block.attachment.attachmentId) },
      })
      return parts
    }, []),
  }
  const threadRoot: ChatroomThreadRoot = {
    ...reply,
    role: 'ai',
    sourceSessionId: message.sourceSessionId!,
    sourceSeq: message.sourceSeq!,
  }
  const tools: ChatroomMessageToolsProps = {
    roomId: room.id,
    message,
    reactions: view.reactions,
    identity: view.identity,
    selecting,
    selected,
    copyText: text || 'AI 回复',
    onReply: () => { props.setReply(room.id, reply) },
    onBranch: target?.kind === 'thread' ? undefined : () => { void props.openThread(room.id, threadRoot) },
    toggleReaction: props.toggleReaction,
    openForward: props.openForward,
    toggleSelection: props.toggleMessageSelection,
  }
  const threadPreview = view.threadPreviews.find(preview =>
    preview.thread.root.messageId === message.messageId && preview.thread.root.role === 'ai')
  return (
    <div className="dsh-chatroom-assistant-tools" ref={rootRef}>
      <ChatroomSelectionCheckbox tools={tools} />
      <div className="dsh-chatroom-assistant-actions">
        <ChatroomReactionBar {...tools} />
        <ChatroomInlineMessageActions tools={tools} />
      </div>
      {target?.kind !== 'thread' && <ChatroomThreadActivity
        preview={threadPreview}
        open={() => { void props.openThread(room.id, threadRoot) }}
      />}
      <ChatroomMessageContextMenu tools={tools} position={menu.position} close={menu.close} />
    </div>
  )
}
