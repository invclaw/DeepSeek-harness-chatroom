/** Authenticated producer metadata is assigned by the server, never parsed from visible message text. */
import type { UserMessage } from '@deepseek-ai/dsh-llm'

/** Return the participant attached to an admitted message by the chatroom ingress. */
export function messageParticipant(message: UserMessage): string | undefined {
  const source = message.source
  return 'chatroomParticipantId' in source && typeof source.chatroomParticipantId === 'string'
    ? source.chatroomParticipantId
    : undefined
}
