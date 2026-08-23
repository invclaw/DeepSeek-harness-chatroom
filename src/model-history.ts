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

/** Build a lazy stream that removes chat-history images only when the selected model is text-only. */
export function textCompatibleStream(
  options: GenerateOptions,
  next: () => AsyncIterable<StreamChunk>,
  ownsSession: (sessionId: string) => boolean,
  resolveModelInfo: (provider: string, model: string, signal?: AbortSignal) => Promise<{ readonly inputModalities?: readonly string[] }>,
  stream: (options: GenerateOptions) => AsyncIterable<StreamChunk>,
): AsyncIterable<StreamChunk> {
  if (options.sessionId === undefined
    || !ownsSession(String(options.sessionId))
    || !messagesContainImages(options.messages)) return next()

  return (async function*(): AsyncGenerator<StreamChunk> {
    const model = await resolveModelInfo(options.provider, options.model, options.signal)
    if (model.inputModalities === undefined || model.inputModalities.includes('image')) {
      yield* next()
      return
    }
    yield* stream({ ...options, messages: textCompatibleMessages(options.messages) })
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
