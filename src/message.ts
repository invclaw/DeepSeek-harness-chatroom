import type { ChatroomIdentity, ChatroomPromptContentPart } from './types.js'

export const PARTICIPANT_MARKER_START = '\u2063dsh-chatroom:'
export const PARTICIPANT_MARKER_END = '\u2063'

/** Add a durable, visually invisible participant id before the display name. */
export function identifyChatroomText(text: string, identity: ChatroomIdentity): string {
  return `${PARTICIPANT_MARKER_START}${identity.participantId}${PARTICIPANT_MARKER_END}${identity.displayName}：${text}`
}

/** Add the room identity to the first text block without altering image order. */
export function identifyPrompt(
  content: readonly ChatroomPromptContentPart[],
  identity: ChatroomIdentity,
): ChatroomPromptContentPart[] {
  let identified = false
  const output = content.map((part): ChatroomPromptContentPart => {
    if (identified || part.type !== 'text') return part
    identified = true
    return { ...part, text: identifyChatroomText(part.text, identity) }
  })
  return identified
    ? output
    : [{ type: 'text', text: identifyChatroomText('发送了一张图片。', identity) }, ...output]
}

/** Whether visible room text explicitly mentions the generic or configured AI name. */
export function mentionsAi(content: readonly ChatroomPromptContentPart[], aiDisplayName: string): boolean {
  const text = content.filter((part): part is Extract<ChatroomPromptContentPart, { type: 'text' }> =>
    part.type === 'text').map(part => part.text).join('\n')
  return [aiDisplayName, 'AI'].some(name => mentionPattern(name).test(text))
}

/** Whether the native command dispatcher must retain ownership of this submission. */
export function isSlashCommand(content: readonly ChatroomPromptContentPart[]): boolean {
  const firstText = content.find((part): part is Extract<ChatroomPromptContentPart, { type: 'text' }> =>
    part.type === 'text')
  return firstText?.text.trimStart().startsWith('/') ?? false
}

function mentionPattern(name: string): RegExp {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  return new RegExp(`@${escaped}(?=$|[^\\p{L}\\p{N}_])`, 'iu')
}
