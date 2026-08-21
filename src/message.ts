import type { ChatroomIdentity, ChatroomPromptContentPart } from './types.js'
import type { ChatroomFileReference, ChatroomReplyReference } from './types.js'
import { fallbackAvatarId, isChatroomAvatarId, type ChatroomAvatarId } from './avatars.js'

export const PARTICIPANT_MARKER_START = '\u2063dsh-chatroom:'
export const PARTICIPANT_MARKER_END = '\u2063'
export const REPLY_MARKER_START = '\u2063dsh-chatroom-reply:'
export const FILE_MARKER_START = '\u2063dsh-chatroom-file:'

/** Add a durable, visually invisible participant id before the display name. */
export function identifyChatroomText(text: string, identity: ChatroomIdentity): string {
  return `${PARTICIPANT_MARKER_START}${identity.participantId}|${identity.avatarId}${PARTICIPANT_MARKER_END}${identity.displayName}：${text}`
}

/** Add the room identity to the first text block without altering image order. */
export function identifyPrompt(
  content: readonly ChatroomPromptContentPart[],
  identity: ChatroomIdentity,
  reply?: ChatroomReplyReference,
): ChatroomPromptContentPart[] {
  let identified = false
  const output = content.map((part): ChatroomPromptContentPart => {
    if (identified || part.type !== 'text') return part
    identified = true
    return { ...part, text: identifyChatroomText(reply === undefined ? part.text : identifyReplyText(part.text, reply), identity) }
  })
  const fallback = content.some(part => part.type === 'file')
    ? '发送了文件。'
    : '发送了一张图片。'
  return identified
    ? output
    : [{ type: 'text', text: identifyChatroomText(reply === undefined ? fallback : identifyReplyText(fallback, reply), identity) }, ...output]
}

/** Parse a current or historical participant marker at the start of text. */
export function participantMarker(text: string): {
  readonly participantId: string
  readonly avatarId: ChatroomAvatarId
  readonly length: number
} | undefined {
  if (!text.startsWith(PARTICIPANT_MARKER_START)) return undefined
  const end = text.indexOf(PARTICIPANT_MARKER_END, PARTICIPANT_MARKER_START.length)
  if (end < 0) return undefined
  const payload = text.slice(PARTICIPANT_MARKER_START.length, end)
  const separator = payload.indexOf('|')
  const participantId = separator < 0 ? payload : payload.slice(0, separator)
  if (participantId === '') return undefined
  const candidate = separator < 0 ? undefined : payload.slice(separator + 1)
  return {
    participantId,
    avatarId: isChatroomAvatarId(candidate) ? candidate : fallbackAvatarId(participantId),
    length: end + PARTICIPANT_MARKER_END.length,
  }
}

/** Add reply metadata plus a readable quote line for the model transcript. */
export function identifyReplyText(text: string, reply: ChatroomReplyReference): string {
  return `${REPLY_MARKER_START}${encodePayload(reply)}${PARTICIPANT_MARKER_END}${replyPrefix(reply)}${text}`
}

/** Project one leading reply marker back into a quote card and message body. */
export function projectReplyText(text: string): { text: string; reply?: ChatroomReplyReference } {
  if (!text.startsWith(REPLY_MARKER_START)) return { text }
  const end = text.indexOf(PARTICIPANT_MARKER_END, REPLY_MARKER_START.length)
  if (end < 0) return { text }
  const reply = decodePayload<ChatroomReplyReference>(text.slice(REPLY_MARKER_START.length, end))
  if (!validReply(reply)) return { text }
  let visible = text.slice(end + PARTICIPANT_MARKER_END.length)
  const prefix = replyPrefix(reply)
  if (visible.startsWith(prefix)) visible = visible.slice(prefix.length)
  return { text: visible, reply }
}

/** Model-visible file line with an invisible rendering marker. */
export function identifyFileText(file: ChatroomFileReference): string {
  return `\n${FILE_MARKER_START}${encodePayload(file)}${PARTICIPANT_MARKER_END}${filePrefix(file)}`
}

/** Remove file marker lines while collecting download cards for the browser. */
export function projectFileText(text: string): { text: string; files: ChatroomFileReference[] } {
  const files: ChatroomFileReference[] = []
  let visible = text
  while (true) {
    const start = visible.indexOf(FILE_MARKER_START)
    if (start < 0) break
    const end = visible.indexOf(PARTICIPANT_MARKER_END, start + FILE_MARKER_START.length)
    if (end < 0) break
    const file = decodePayload<ChatroomFileReference>(visible.slice(start + FILE_MARKER_START.length, end))
    if (!validFile(file)) break
    files.push(file)
    const before = visible.slice(0, start).replace(/\n$/u, '')
    let after = visible.slice(end + PARTICIPANT_MARKER_END.length)
    const prefix = filePrefix(file)
    if (after.startsWith(prefix)) after = after.slice(prefix.length)
    visible = `${before}${after}`
  }
  return { text: visible, files }
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

function replyPrefix(reply: ChatroomReplyReference): string {
  return `回复 ${reply.displayName}「${reply.text}」\n`
}

function filePrefix(file: ChatroomFileReference): string {
  return `文件：${file.name}`
}

function encodePayload(value: unknown): string {
  return encodeURIComponent(JSON.stringify(value))
}

function decodePayload<T>(value: string): T | undefined {
  try {
    return JSON.parse(decodeURIComponent(value)) as T
  } catch {
    return undefined
  }
}

function validReply(value: unknown): value is ChatroomReplyReference {
  if (value === null || typeof value !== 'object') return false
  const item = value as Partial<ChatroomReplyReference>
  return typeof item.messageId === 'string' && typeof item.displayName === 'string' && typeof item.text === 'string'
}

function validFile(value: unknown): value is ChatroomFileReference {
  if (value === null || typeof value !== 'object') return false
  const item = value as Partial<ChatroomFileReference>
  return typeof item.id === 'string' && typeof item.name === 'string'
    && typeof item.mediaType === 'string' && typeof item.bytes === 'number'
}
