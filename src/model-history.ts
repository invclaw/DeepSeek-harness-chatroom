/** Model-request compatibility helpers for shared chatroom Sessions. */

import { freezeMessage } from '@deepseek-ai/dsh-llm'
import type { ContentBlock, GenerateOptions, Message, StreamChunk } from '@deepseek-ai/dsh-llm'

const OMITTED_IMAGE_TEXT = '[历史图片已保留在群聊中，但未发送给当前文本模型。]'

/** Replace image blocks with a deterministic text marker while preserving every message id and source. */
export function textCompatibleMessages(messages: readonly Message[]): Message[] {
  return messages.map((message) => {
    const content = textCompatibleContent(message.content)
    return content === message.content ? message : freezeMessage({ ...message, content })
  })
}

/** Whether any message, including a tool result, contains an image block. */
export function messagesContainImages(messages: readonly Message[]): boolean {
  return messages.some(message => contentContainsImages(message.content))
}

/** Remove recalled messages by their stable model ids while preserving the remaining immutable values. */
export function visibleMessages(messages: readonly Message[], recalledIds: ReadonlySet<string>): Message[] {
  if (recalledIds.size === 0) return [...messages]
  return messages.filter(message => !recalledIds.has(String(message.id)))
}

/** Restore provider-required tool-call/result adjacency in Sessions written by older plugin builds. */
export function protocolCompatibleMessages(messages: readonly Message[]): Message[] {
  const compatible: Message[] = []
  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index]!
    const calls = message.content.filter((block): block is Extract<ContentBlock, { type: 'tool-call' }> =>
      block.type === 'tool-call')
    if (message.role !== 'assistant' || calls.length === 0) {
      compatible.push(message)
      continue
    }

    const pending = new Set(calls.map(call => String(call.id)))
    const results: Message[] = []
    const deferred: Message[] = []
    let cursor = index + 1
    while (cursor < messages.length && pending.size > 0) {
      const candidate = messages[cursor]!
      const resultIds = candidate.content.flatMap(block => block.type === 'tool-result'
        ? [String(block.toolCallId)]
        : [])
      if (resultIds.some(id => pending.has(id))) {
        results.push(candidate)
        for (const id of resultIds) pending.delete(id)
        cursor += 1
        continue
      }
      if (startsNewProviderExchange(candidate)) break
      deferred.push(candidate)
      cursor += 1
    }

    const content = message.content.filter(block => block.type !== 'tool-call' || !pending.has(String(block.id)))
    if (content.length > 0) {
      compatible.push(content.length === message.content.length
        ? message
        : freezeMessage({ ...message, content }))
    }
    compatible.push(...results, ...deferred)
    index = cursor - 1
  }
  return compatible
}

/** Build a lazy stream that removes chat-history images only when the selected model is text-only. */
export function textCompatibleStream(
  options: GenerateOptions,
  next: () => AsyncIterable<StreamChunk>,
  ownsSession: (sessionId: string) => boolean,
  recalledMessageIds: (sessionId: string) => ReadonlySet<string>,
  resolveModelInfo: (provider: string, model: string, signal?: AbortSignal) => Promise<{ readonly inputModalities?: readonly string[] }>,
  stream: (options: GenerateOptions) => AsyncIterable<StreamChunk>,
): AsyncIterable<StreamChunk> {
  if (options.sessionId === undefined || !ownsSession(String(options.sessionId))) return next()
  const messages = protocolCompatibleMessages(
    visibleMessages(options.messages, recalledMessageIds(String(options.sessionId))),
  )
  const messagesChanged = messages.length !== options.messages.length
    || messages.some((message, index) => message !== options.messages[index])
  const requestMessages = messagesChanged ? messages : options.messages
  const hasImages = messagesContainImages(requestMessages)
  if (!messagesChanged && !hasImages) return next()

  return (async function*(): AsyncGenerator<StreamChunk> {
    if (!hasImages) {
      yield* stream({ ...options, messages: requestMessages })
      return
    }
    const model = await resolveModelInfo(options.provider, options.model, options.signal)
    if (model.inputModalities === undefined || model.inputModalities.includes('image')) {
      if (!messagesChanged) yield* next()
      else yield* stream({ ...options, messages: requestMessages })
      return
    }
    yield* stream({ ...options, messages: textCompatibleMessages(requestMessages) })
  })()
}

function textCompatibleContent(content: ContentBlock[]): ContentBlock[] {
  let changed = false
  const compatible = content.map((block): ContentBlock => {
    if (block.type === 'image') {
      changed = true
      return { type: 'text', text: OMITTED_IMAGE_TEXT }
    }
    if (block.type !== 'tool-result') return block
    const nested = textCompatibleContent(block.content)
    if (nested === block.content) return block
    changed = true
    return { ...block, content: nested }
  })
  return changed ? compatible : content
}

function contentContainsImages(content: readonly ContentBlock[]): boolean {
  return content.some(block => block.type === 'image'
    || (block.type === 'tool-result' && contentContainsImages(block.content)))
}

function startsNewProviderExchange(message: Message): boolean {
  if (message.role === 'assistant') return message.content.some(block => block.type === 'tool-call')
  return message.source.kind === 'user'
}
