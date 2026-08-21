import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ChatroomReplyReference } from '../types.js'
import type { ChatroomView } from './store.js'

interface AssistantReplyInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  setReply(roomId: string, reply: ChatroomReplyReference): void
}

type AssistantReplyProps = PropsRuntime<'conversation.chat.assistant-actions'> & AssistantReplyInjected

/** Reply action contributed to finalized AI messages in shared rooms. */
export function ChatroomAssistantReplyAction(props: AssistantReplyProps): JSX.Element | null {
  const room = props.useChatroom(snapshot => snapshot.rooms.find(candidate =>
    candidate.sessionId === String(props.sessionId)))
  const assistant = props.useSession(snapshot => snapshot.nodes.find(node =>
    node.kind === 'assistant' && node.messageId === props.messageId))
  if (room === undefined || assistant?.kind !== 'assistant') return null
  const text = assistant.blocks.flatMap(block => block.kind === 'text' ? [block.text] : []).join('')
    .trim().replace(/\s+/gu, ' ')
  const reply: ChatroomReplyReference = {
    messageId: String(props.messageId),
    displayName: room.aiDisplayName,
    text: [...(text || 'AI 回复')].slice(0, 120).join(''),
  }
  return (
    <button
      className="dsh-chatroom-assistant-reply"
      type="button"
      title={`回复 ${room.aiDisplayName}`}
      aria-label={`回复 ${room.aiDisplayName}`}
      onClick={() => { props.setReply(room.id, reply) }}
    >
      ↩
    </button>
  )
}
