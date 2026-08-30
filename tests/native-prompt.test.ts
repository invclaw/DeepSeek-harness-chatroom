import { afterEach, describe, expect, it, vi } from 'vitest'
import type { IApiClient } from '@deepseek-ai/dsh-client-connection/client'
import { installNativePromptIdentity, identifyPrompt } from '../src/client/native-prompt.js'
import type { ChatroomClientStore } from '../src/client/store.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('native prompt admission', () => {
  it('prefixes text while preserving native image blocks', () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const image = { type: 'image' as const, mediaType: 'image/png' as const, data: 'AA==', name: 'test.png' }
    expect(identifyPrompt([{ type: 'text', text: '你好' }, image], identity)).toEqual([
      { type: 'text', text: '\u2063dsh-chatroom:alice-id|whale\u2063Alice：你好' },
      image,
    ])
    expect(identifyPrompt([image], identity)).toEqual([
      { type: 'text', text: '\u2063dsh-chatroom:alice-id|whale\u2063Alice：' },
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
      getSnapshot: () => ({ identity: { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' } }),
      composition: () => ({ roomId: 'room', revision: 0, files: [], reply: undefined }),
      completeComposition: vi.fn(),
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
    expect(store.completeComposition).toHaveBeenCalledOnce()

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

  it('routes a native branch composer payload, attachments, and steer mode to the branch Agent', async () => {
    const original = vi.fn(async () => ({
      rpcId: 'rpc' as never,
      result: { ok: true as const, value: { accepted: true as const } },
    }))
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({
      accepted: true,
      aiTriggered: true,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const api = { sessions: { prompt: original } } as unknown as IApiClient
    const room = { id: 'room', sessionId: 'room-session' }
    const store = {
      agentTargetForSession: (sessionId: string) => sessionId === 'branch-session'
        ? { kind: 'thread', room, threadId: 'thread-id' }
        : undefined,
      getSnapshot: () => ({ identity: { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' } }),
      composition: () => ({
        roomId: 'room',
        revision: 0,
        files: [{
          id: 'file-id',
          file: {
            name: 'note.txt', type: 'text/plain',
            arrayBuffer: async () => new TextEncoder().encode('hello').buffer,
          },
        }],
        reply: { messageId: 'user:1', displayName: 'Bob', text: '前文' },
      }),
      completeComposition: vi.fn(),
    } as unknown as ChatroomClientStore
    installNativePromptIdentity(api, store)

    await api.sessions.prompt({
      sessionId: 'branch-session' as never,
      mode: 'steer',
      content: [{ type: 'text', text: '@AI 继续' }],
    })

    expect(fetchMock).toHaveBeenCalledWith('/plugins/deepseek-harness-chatroom/api/threads/prompt', expect.objectContaining({
      body: JSON.stringify({
        threadId: 'thread-id',
        mode: 'steer',
        content: [
          { type: 'text', text: '@AI 继续' },
          { type: 'file', name: 'note.txt', mediaType: 'text/plain', data: 'aGVsbG8=' },
        ],
        reply: { messageId: 'user:1', displayName: 'Bob', text: '前文' },
      }),
    }))
    expect(original).not.toHaveBeenCalled()
    expect(store.completeComposition).toHaveBeenCalledOnce()
  })

  it('invites people mentioned in the first new-Group prompt before sending it', async () => {
    const original = vi.fn()
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({
      accepted: true, aiTriggered: false,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const api = { sessions: { prompt: original } } as unknown as IApiClient
    const room = { id: 'new-room', sessionId: 'new-session' }
    const addRoomMembers = vi.fn(async () => true)
    const store = {
      agentTargetForSession: () => undefined,
      newSessionMode: () => 'group',
      ensurePromptTarget: vi.fn(async () => ({ kind: 'room' as const, room })),
      newGroupInvitees: vi.fn(() => ['bob-id']),
      addRoomMembers,
      getSnapshot: () => ({
        identity: { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' },
        managementError: undefined,
      }),
      composition: () => ({ roomId: room.id, revision: 0, files: [], reply: undefined }),
      completeComposition: vi.fn(),
    } as unknown as ChatroomClientStore
    installNativePromptIdentity(api, store)

    await api.sessions.prompt({
      sessionId: 'new-session' as never,
      mode: 'queue',
      content: [{ type: 'text', text: '@Bob 大家开始吧' }],
    })

    expect(store.newGroupInvitees).toHaveBeenCalledWith([{ type: 'text', text: '@Bob 大家开始吧' }])
    expect(addRoomMembers).toHaveBeenCalledWith(['bob-id'])
    expect(fetchMock).toHaveBeenCalledWith('/plugins/deepseek-harness-chatroom/api/prompt', expect.anything())
    expect(addRoomMembers.mock.invocationCallOrder[0]).toBeLessThan(fetchMock.mock.invocationCallOrder[0]!)
    expect(original).not.toHaveBeenCalled()
  })

  it('waits for an in-flight automatic-response setting before admitting a message', async () => {
    const order: string[] = []
    const original = vi.fn()
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => {
      order.push('prompt')
      return new Response(JSON.stringify({ accepted: true, aiTriggered: true }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      })
    })
    vi.stubGlobal('fetch', fetchMock)
    const api = { sessions: { prompt: original } } as unknown as IApiClient
    const room = { id: 'room', sessionId: 'room-session' }
    const store = {
      roomForSession: () => room,
      waitForRoomAutoTrigger: vi.fn(async () => { order.push('setting') }),
      getSnapshot: () => ({ identity: { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' } }),
      composition: () => ({ roomId: 'room', revision: 0, files: [], reply: undefined }),
      completeComposition: vi.fn(),
    } as unknown as ChatroomClientStore
    installNativePromptIdentity(api, store)

    await api.sessions.prompt({
      sessionId: 'room-session' as never,
      mode: 'queue',
      content: [{ type: 'text', text: 'DeepSeek你说话啊' }],
    })

    expect(store.waitForRoomAutoTrigger).toHaveBeenCalledWith('room')
    expect(order).toEqual(['setting', 'prompt'])
  })
})
