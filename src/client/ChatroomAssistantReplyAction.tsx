import { useEffect, useRef } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ChatroomForwardItem, ChatroomReplyReference, ChatroomThreadRoot } from '../types.js'
import type { ChatroomReactionEmoji } from '../reactions.js'
import {
  ChatroomMessageContextMenu,
  ChatroomReactionBar,
  useChatroomMessageMenu,
  type ChatroomMessageToolsProps,
} from './ChatroomMessageTools.js'
import type { ChatroomView } from './store.js'

interface AssistantReplyInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
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
  const room = view.rooms.find(candidate => candidate.sessionId === String(props.sessionId))
  const assistant = props.useSession(snapshot => snapshot.nodes.find(node =>
    node.kind === 'assistant' && node.messageId === props.messageId))
  const rootRef = useRef<HTMLDivElement>(null)
  const menu = useChatroomMessageMenu()
  const selected = view.selectionRoomId === room?.id
    && view.selectedMessages.some(item => item.messageId === String(props.messageId))
  useEffect(() => {
    const root = rootRef.current?.closest<HTMLElement>('[data-time-hover-root]')
    if (root === null || root === undefined || room === undefined) return
    const onContextMenu = (event: MouseEvent) => { menu.open(event) }
    root.addEventListener('contextmenu', onContextMenu)
    root.toggleAttribute('data-dsh-chatroom-selected', selected)
    return () => {
      root.removeEventListener('contextmenu', onContextMenu)
      root.removeAttribute('data-dsh-chatroom-selected')
    }
  }, [menu.open, room, selected])
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
    role: 'ai',
    createdAt: assistant.time,
  }
  const tools: ChatroomMessageToolsProps = {
    roomId: room.id,
    message,
    reactions: view.reactions,
    identity: view.identity,
    selected,
    toggleReaction: props.toggleReaction,
    openForward: props.openForward,
    toggleSelection: props.toggleMessageSelection,
  }
  return (
    <div className="dsh-chatroom-assistant-actions" ref={rootRef}>
      <ChatroomReactionBar {...tools} />
      <button
        className="dsh-chatroom-assistant-reply"
        type="button"
        title={`回复 ${room.aiDisplayName}`}
        aria-label={`回复 ${room.aiDisplayName}`}
        onClick={() => { props.setReply(room.id, reply) }}
      >↩</button>
      <button
        className="dsh-chatroom-assistant-reply"
        type="button"
        title="发起分支"
        aria-label="发起分支"
        onClick={() => { void props.openThread(room.id, { ...reply, role: 'ai' }) }}
      >⑂</button>
      <ChatroomMessageContextMenu tools={tools} position={menu.position} close={menu.close} />
    </div>
  )
}
