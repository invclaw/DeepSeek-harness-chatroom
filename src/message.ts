import type {
  ChatroomDocumentCard,
  ChatroomExternalCard,
  ChatroomForwardBundle,
  ChatroomIdentity,
  ChatroomMeetingCard,
  ChatroomPromptContentPart,
} from './types.js'
import type { ChatroomFileReference, ChatroomReplyReference } from './types.js'
import { fallbackAvatarId, isChatroomAvatarId, type ChatroomAvatarId } from './avatars.js'

export const PARTICIPANT_MARKER_START = '\u2063dsh-chatroom:'
export const PARTICIPANT_MARKER_END = '\u2063'
export const REPLY_MARKER_START = '\u2063dsh-chatroom-reply:'
export const FILE_MARKER_START = '\u2063dsh-chatroom-file:'
export const FORWARD_MARKER_START = '\u2063dsh-chatroom-forward:'
export const EXTERNAL_CARD_MARKER_START = '\u2063dsh-chatroom-card:'

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
  return identified
    ? output
    : [{ type: 'text', text: identifyChatroomText(reply === undefined ? '' : identifyReplyText('', reply), identity) }, ...output]
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

/** Add one merged-forward payload plus a readable model transcript. */
export function identifyForwardText(bundle: ChatroomForwardBundle): string {
  return `${FORWARD_MARKER_START}${encodePayload(bundle)}${PARTICIPANT_MARKER_END}${forwardPrefix(bundle)}`
}

/** Remove a merged-forward transcript while returning its browser card metadata. */
export function projectForwardText(text: string): { text: string; forward?: ChatroomForwardBundle } {
  if (!text.startsWith(FORWARD_MARKER_START)) return { text }
  const end = text.indexOf(PARTICIPANT_MARKER_END, FORWARD_MARKER_START.length)
  if (end < 0) return { text }
  const forward = decodePayload<ChatroomForwardBundle>(text.slice(FORWARD_MARKER_START.length, end))
  if (!validForward(forward)) return { text }
  let visible = text.slice(end + PARTICIPANT_MARKER_END.length)
  const prefix = forwardPrefix(forward)
  if (visible.startsWith(prefix)) visible = visible.slice(prefix.length)
  return { text: visible, forward }
}

/** Add a model-readable Enterprise WeChat summary plus invisible card metadata. */
export function identifyExternalCardText(card: ChatroomExternalCard): string {
  return `${EXTERNAL_CARD_MARKER_START}${encodePayload(card)}${PARTICIPANT_MARKER_END}${externalCardPrefix(card)}`
}

/** Remove Enterprise WeChat markers while collecting browser cards. */
export function projectExternalCardText(text: string): { text: string; cards: ChatroomExternalCard[] } {
  const cards: ChatroomExternalCard[] = []
  let visible = text
  while (true) {
    const start = visible.indexOf(EXTERNAL_CARD_MARKER_START)
    if (start < 0) break
    const end = visible.indexOf(PARTICIPANT_MARKER_END, start + EXTERNAL_CARD_MARKER_START.length)
    if (end < 0) break
    const card = decodePayload<ChatroomExternalCard>(visible.slice(start + EXTERNAL_CARD_MARKER_START.length, end))
    if (!validExternalCard(card)) break
    cards.push(card)
    const before = visible.slice(0, start).replace(/\n$/u, '')
    let after = visible.slice(end + PARTICIPANT_MARKER_END.length)
    const prefix = externalCardPrefix(card)
    if (after.startsWith(prefix)) after = after.slice(prefix.length)
    visible = `${before}${after}`
  }
  return { text: visible, cards }
}

/** Whether visible room text explicitly mentions the generic or configured AI name. */
export function mentionsAi(content: readonly ChatroomPromptContentPart[], aiDisplayName: string): boolean {
  return [aiDisplayName, 'AI'].some(name => mentionsName(content, name))
}

/** Whether enabled automatic-response mode sees a direct plain-text address to the AI. */
export function addressesAi(content: readonly ChatroomPromptContentPart[], aiDisplayName: string): boolean {
  const text = content.filter((part): part is Extract<ChatroomPromptContentPart, { type: 'text' }> =>
    part.type === 'text').map(part => part.text).join('\n')
  return [aiDisplayName, 'DeepSeek', 'AI'].some((name) => {
    const normalized = name.trim()
    if (normalized === '') return false
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
    return new RegExp(`(?:^|[^\\p{L}\\p{N}_])${escaped}(?=\\s*(?:[，,:：]\\s*)?(?:你|请|帮|能|可以|说|回答|回复|看看|看下|总结|分析|处理))`, 'iu').test(text)
  })
}

/** Whether visible room text explicitly mentions one participant or account name. */
export function mentionsName(content: readonly ChatroomPromptContentPart[], name: string): boolean {
  const text = content.filter((part): part is Extract<ChatroomPromptContentPart, { type: 'text' }> =>
    part.type === 'text').map(part => part.text).join('\n')
  return mentionPattern(name).test(text)
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

function forwardPrefix(bundle: ChatroomForwardBundle): string {
  const lines = bundle.items.map(item => `${item.displayName}：${item.text}`)
  return `合并转发（${bundle.items.length} 条）\n${lines.join('\n')}`
}

function externalCardPrefix(card: ChatroomExternalCard): string {
  if (card.kind === 'meeting') {
    const time = [card.beginTime, card.endTime].filter(value => value !== undefined).join(' - ')
    return `企微会议：${card.title}${time === '' ? '' : `（${time}）`}`
  }
  return `企微${card.documentType ?? '文档'}：${card.title}`
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

function validForward(value: unknown): value is ChatroomForwardBundle {
  if (value === null || typeof value !== 'object') return false
  const bundle = value as Partial<ChatroomForwardBundle>
  if (typeof bundle.sourceRoomId !== 'string' || typeof bundle.sourceRoomTitle !== 'string'
    || !Array.isArray(bundle.items) || bundle.items.length === 0) return false
  return bundle.items.every((raw) => {
    if (raw === null || typeof raw !== 'object') return false
    const item = raw as Partial<ChatroomForwardBundle['items'][number]>
    return typeof item.messageId === 'string'
      && (item.role === 'human' || item.role === 'ai')
      && typeof item.displayName === 'string'
      && typeof item.text === 'string'
      && typeof item.createdAt === 'number'
      && (item.sourceSessionId === undefined || typeof item.sourceSessionId === 'string')
      && (item.sourceSeq === undefined || typeof item.sourceSeq === 'number')
      && (item.content === undefined || (Array.isArray(item.content) && item.content.every(validForwardContentPart)))
      && (item.reply === undefined || validReply(item.reply))
      && (item.reactions === undefined || (Array.isArray(item.reactions) && item.reactions.every(reaction =>
        reaction !== null && typeof reaction === 'object'
        && typeof (reaction as { emoji?: unknown }).emoji === 'string'
        && typeof (reaction as { count?: unknown }).count === 'number')))
  })
}

function validForwardContentPart(value: unknown): boolean {
  if (value === null || typeof value !== 'object') return false
  const part = value as Record<string, unknown>
  if (part.type === 'text') return typeof part.text === 'string' && typeof part.markdown === 'boolean'
  if (part.type === 'file') return validFile(part.file)
  if (part.type !== 'image' || part.image === null || typeof part.image !== 'object') return false
  const image = part.image as Record<string, unknown>
  return typeof image.attachmentId === 'string' && typeof image.mediaType === 'string'
    && typeof image.bytes === 'number' && typeof image.width === 'number' && typeof image.height === 'number'
}

function validExternalCard(value: unknown): value is ChatroomExternalCard {
  if (value === null || typeof value !== 'object') return false
  const card = value as Partial<ChatroomExternalCard>
  if (card.kind !== 'meeting' && card.kind !== 'document') return false
  if (typeof card.title !== 'string' || card.title.trim() === '') return false
  if (card.kind === 'meeting') {
    const meeting = value as Partial<ChatroomMeetingCard>
    return optionalStrings(meeting.beginTime, meeting.endTime, meeting.url, meeting.location, meeting.status)
      && (meeting.attendees === undefined
        || (Array.isArray(meeting.attendees) && meeting.attendees.every(item => typeof item === 'string')))
  }
  const document = value as Partial<ChatroomDocumentCard>
  return optionalStrings(document.documentType, document.url, document.modifiedAt, document.owner)
}

function optionalStrings(...values: readonly unknown[]): boolean {
  return values.every(value => value === undefined || typeof value === 'string')
}
