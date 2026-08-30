import { describe, expect, it, vi } from 'vitest'
import {
  CallId,
  createAssistantMessage,
  createToolResultMessage,
  createUserMessage,
  type GenerateOptions,
  type StreamChunk,
} from '@deepseek-ai/dsh-llm'
import {
  messagesContainImages,
  protocolCompatibleMessages,
  textCompatibleMessages,
  textCompatibleStream,
  visibleMessages,
} from '../src/model-history.js'

function request(): GenerateOptions {
  return {
    provider: 'deepseek',
    model: 'deepseek-v4-flash',
    sessionId: 'chatroom-v1-lobby' as never,
    messages: [createUserMessage({
      content: [
        { type: 'text', text: '看这张图' },
        { type: 'image', attachment: { attachmentId: 'image-1' as never, mediaType: 'image/png', bytes: 12, width: 1, height: 1 } },
      ],
      source: { kind: 'user' },
    })],
  }
}

describe('chatroom model history compatibility', () => {
  it('preserves message identity while replacing images with a readable marker', () => {
    const original = request().messages
    const compatible = textCompatibleMessages(original)

    expect(messagesContainImages(original)).toBe(true)
    expect(messagesContainImages(compatible)).toBe(false)
    expect(compatible[0]?.id).toBe(original[0]?.id)
    expect(compatible[0]?.content).toEqual([
      { type: 'text', text: '看这张图' },
      { type: 'text', text: '[历史图片已保留在群聊中，但未发送给当前文本模型。]' },
    ])
  })

  it('redispatches only owned text-model requests with sanitized history', async () => {
    const downstream = vi.fn(async function*(_options: GenerateOptions): AsyncGenerator<StreamChunk> {
      yield { type: 'finish', reason: { kind: 'stop' } }
    })
    const next = vi.fn(() => downstream(request()))
    const resolve = vi.fn(async () => ({ inputModalities: ['text'] }))
    const chunks: StreamChunk[] = []

    for await (const chunk of textCompatibleStream(
      request(), next, id => id === 'chatroom-v1-lobby', () => new Set(), resolve, downstream,
    )) chunks.push(chunk)

    expect(next).not.toHaveBeenCalled()
    expect(resolve).toHaveBeenCalledWith('deepseek', 'deepseek-v4-flash', undefined)
    expect(messagesContainImages(downstream.mock.calls[0]![0].messages)).toBe(false)
    expect(chunks).toEqual([{ type: 'finish', reason: { kind: 'stop' } }])
  })

  it('leaves image-capable and non-chatroom requests on their original stream', async () => {
    const finish = { type: 'finish' as const, reason: { kind: 'stop' as const } }
    const next = vi.fn(async function*(): AsyncGenerator<StreamChunk> { yield finish })
    const stream = vi.fn(async function*(): AsyncGenerator<StreamChunk> { yield finish })
    const resolve = vi.fn(async () => ({ inputModalities: ['text', 'image'] }))

    for await (const _chunk of textCompatibleStream(request(), next, () => true, () => new Set(), resolve, stream)) { /* drain */ }
    for await (const _chunk of textCompatibleStream(request(), next, () => false, () => new Set(), resolve, stream)) { /* drain */ }

    expect(next).toHaveBeenCalledTimes(2)
    expect(stream).not.toHaveBeenCalled()
  })

  it('removes recalled model messages before dispatch', async () => {
    const options = request()
    const recalledId = String(options.messages[0]!.id)
    expect(visibleMessages(options.messages, new Set([recalledId]))).toEqual([])
    const next = vi.fn(async function*(): AsyncGenerator<StreamChunk> { yield { type: 'finish', reason: { kind: 'stop' } } })
    const stream = vi.fn(async function*(_options: GenerateOptions): AsyncGenerator<StreamChunk> {
      yield { type: 'finish', reason: { kind: 'stop' } }
    })

    for await (const _chunk of textCompatibleStream(
      options,
      next,
      () => true,
      () => new Set([recalledId]),
      async () => ({ inputModalities: ['text'] }),
      stream,
    )) { /* drain */ }

    expect(next).not.toHaveBeenCalled()
    expect(stream.mock.calls[0]![0].messages).toEqual([])
  })

  it('moves an older chatroom assistant insertion after its matching tool result', async () => {
    const callId = CallId('call-chatroom-action')
    const toolCall = createAssistantMessage({
      content: [{ type: 'tool-call', id: callId, name: 'chatroom_action', arguments: '{}' }],
      source: { provider: 'deepseek', model: 'deepseek-v4-flash' },
    })
    const inserted = createAssistantMessage({
      content: [{ type: 'text', text: 'Agent 群聊工具验收通过' }],
      source: { provider: 'deepseek', model: 'deepseek-v4-flash' },
    })
    const result = createToolResultMessage({
      callId,
      content: [{ type: 'text', text: '消息已发送到当前会话。' }],
      isError: false,
    })
    const human = createUserMessage({ content: [{ type: 'text', text: '继续' }], source: { kind: 'user' } })

    expect(protocolCompatibleMessages([toolCall, inserted, result, human])).toEqual([
      toolCall, result, inserted, human,
    ])

    const options = { ...request(), messages: [toolCall, inserted, result, human] }
    const next = vi.fn(async function*(): AsyncGenerator<StreamChunk> {
      yield { type: 'finish', reason: { kind: 'stop' } }
    })
    const stream = vi.fn(async function*(_options: GenerateOptions): AsyncGenerator<StreamChunk> {
      yield { type: 'finish', reason: { kind: 'stop' } }
    })
    for await (const _chunk of textCompatibleStream(
      options, next, () => true, () => new Set(), async () => ({ inputModalities: ['text'] }), stream,
    )) { /* drain */ }

    expect(next).not.toHaveBeenCalled()
    expect(stream.mock.calls[0]![0].messages).toEqual([toolCall, result, inserted, human])
  })

  it('removes unresolved historical tool calls at the next human exchange', () => {
    const callId = CallId('call-without-result')
    const toolCall = createAssistantMessage({
      content: [{ type: 'tool-call', id: callId, name: 'chatroom_action', arguments: '{}' }],
      source: { provider: 'deepseek', model: 'deepseek-v4-flash' },
    })
    const human = createUserMessage({ content: [{ type: 'text', text: '重试' }], source: { kind: 'user' } })

    expect(protocolCompatibleMessages([toolCall, human])).toEqual([human])
  })
})
