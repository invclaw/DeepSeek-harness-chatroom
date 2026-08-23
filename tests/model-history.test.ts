import { describe, expect, it, vi } from 'vitest'
import { createUserMessage, type GenerateOptions, type StreamChunk } from '@deepseek-ai/dsh-llm'
import { messagesContainImages, textCompatibleMessages, textCompatibleStream } from '../src/model-history.js'

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
      request(), next, id => id === 'chatroom-v1-lobby', resolve, downstream,
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

    for await (const _chunk of textCompatibleStream(request(), next, () => true, resolve, stream)) { /* drain */ }
    for await (const _chunk of textCompatibleStream(request(), next, () => false, resolve, stream)) { /* drain */ }

    expect(next).toHaveBeenCalledTimes(2)
    expect(stream).not.toHaveBeenCalled()
  })
})
