import { afterEach, describe, expect, it, vi } from 'vitest'
import type { IApiClient } from '@deepseek-ai/dsh-client-connection/client'
import { installNativePromptIdentity, identifyPrompt } from '../src/client/native-prompt.js'
import type { ChatroomClientStore } from '../src/client/store.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('native prompt admission', () => {
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

  it('routes room chat to the plugin and leaves ordinary sessions and commands native', async () => {
    const original = vi.fn(async () => ({
      rpcId: 'rpc' as never,
      result: { ok: true as const, value: { accepted: true as const } },
    }))
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({
      accepted: true,
      aiTriggered: false,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const api = { sessions: { prompt: original } } as unknown as IApiClient
    const room = { id: 'room', sessionId: 'room-session' }
    const store = {
      roomForSession: (sessionId: string) => sessionId === room.sessionId ? room : undefined,
      getSnapshot: () => ({ identity: { participantId: 'alice-id', displayName: 'Alice' } }),
    } as unknown as ChatroomClientStore
    const restore = installNativePromptIdentity(api, store)

    await api.sessions.prompt({
      sessionId: 'room-session' as never,
      mode: 'queue',
      content: [{ type: 'text', text: '人类消息' }],
    })
    expect(fetchMock).toHaveBeenCalledWith('/plugins/deepseek-harness-chatroom/api/prompt', expect.objectContaining({
      body: JSON.stringify({
        roomId: 'room',
        mode: 'queue',
        content: [{ type: 'text', text: '人类消息' }],
      }),
    }))
    expect(original).not.toHaveBeenCalled()

    await api.sessions.prompt({
      sessionId: 'room-session' as never,
      mode: 'queue',
      content: [{ type: 'text', text: '/new' }],
    })
    expect(original).toHaveBeenLastCalledWith(expect.objectContaining({
      content: [{ type: 'text', text: '/new' }],
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
