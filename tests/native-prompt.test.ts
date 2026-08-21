import { describe, expect, it, vi } from 'vitest'
import type { IApiClient } from '@deepseek-ai/dsh-client-connection/client'
import { installNativePromptIdentity, identifyPrompt } from '../src/client/native-prompt.js'
import type { ChatroomClientStore } from '../src/client/store.js'

describe('native prompt identity', () => {
  it('prefixes text while preserving native image blocks', () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice' }
    const image = { type: 'image' as const, mediaType: 'image/png' as const, data: 'AA==', name: 'test.png' }
    expect(identifyPrompt([{ type: 'text', text: '你好' }, image], identity)).toEqual([
      { type: 'text', text: '\u2063dsh-chatroom:alice-id\u2063Alice：你好' },
      image,
    ])
    expect(identifyPrompt([image], identity)).toEqual([
      { type: 'text', text: '\u2063dsh-chatroom:alice-id\u2063Alice：发送了一张图片。' },
      image,
    ])
  })

  it('decorates only the configured room Session and restores the API method', async () => {
    const original = vi.fn(async () => ({
      rpcId: 'rpc' as never,
      result: { ok: true as const, value: { accepted: true as const } },
    }))
    const api = { sessions: { prompt: original } } as unknown as IApiClient
    const store = {
      getSnapshot: () => ({
        room: { sessionId: 'room-session' },
        identity: { participantId: 'alice-id', displayName: 'Alice' },
      }),
    } as ChatroomClientStore
    const restore = installNativePromptIdentity(api, store)

    await api.sessions.prompt({
      sessionId: 'room-session' as never,
      mode: 'queue',
      content: [{ type: 'text', text: '消息' }],
    })
    expect(original).toHaveBeenLastCalledWith(expect.objectContaining({
      content: [{ type: 'text', text: '\u2063dsh-chatroom:alice-id\u2063Alice：消息' }],
    }), undefined)

    await api.sessions.prompt({
      sessionId: 'ordinary-session' as never,
      mode: 'queue',
      content: [{ type: 'text', text: '原样' }],
    })
    expect(original).toHaveBeenLastCalledWith(expect.objectContaining({
      content: [{ type: 'text', text: '原样' }],
    }), undefined)

    restore()
    expect(api.sessions.prompt).toBe(original)
  })
})
