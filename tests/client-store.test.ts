import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatroomClientStore } from '../src/client/store.js'
import type { ChatroomServerEvent } from '../src/types.js'

class FakeEventSource {
  static instances: FakeEventSource[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: MessageEvent<string>) => void) | null = null
  onerror: (() => void) | null = null
  closed = false

  constructor(readonly url: string) {
    FakeEventSource.instances.push(this)
  }

  close(): void {
    this.closed = true
  }

  emit(event: ChatroomServerEvent): void {
    this.onmessage?.({ data: JSON.stringify(event) } as MessageEvent<string>)
  }
}

afterEach(() => {
  FakeEventSource.instances = []
  vi.unstubAllGlobals()
})

describe('ChatroomClientStore', () => {
  it('selects a first identity and synchronizes the shared transcript over SSE', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice' }
    const room = { id: 'lobby', title: 'AI 聊天室', aiDisplayName: 'DeepSeek' }
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ identity: null, room }))
      .mockResolvedValueOnce(jsonResponse({ identity, room }, 201))
      .mockResolvedValueOnce(jsonResponse({ message: { id: 'm2' } }, 202))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()

    await store.start()
    expect(store.getSnapshot().phase).toBe('identity-required')

    await store.join('Alice')
    expect(store.getSnapshot().identity).toEqual(identity)
    const source = FakeEventSource.instances[0]
    expect(source?.url).toBe('/chatroom/api/events')
    source?.emit({
      type: 'snapshot',
      room,
      identity,
      online: 2,
      messages: [{
        id: 'm1', sequence: 1, role: 'human', participantId: 'bob-id', displayName: 'Bob',
        text: '你好', createdAt: 1,
      }],
    })
    expect(store.getSnapshot()).toMatchObject({ phase: 'ready', connection: 'online', online: 2 })
    expect(store.getSnapshot().messages.map(message => message.text)).toEqual(['你好'])

    source?.emit({
      type: 'message',
      message: {
        id: 'm2', sequence: 2, role: 'ai', participantId: 'ai', displayName: 'DeepSeek',
        text: '大家好', createdAt: 2,
      },
    })
    expect(store.getSnapshot().messages.map(message => message.text)).toEqual(['你好', '大家好'])
    expect(await store.send('欢迎')).toBe(true)
    expect(fetchMock).toHaveBeenLastCalledWith('/chatroom/api/messages', expect.objectContaining({ method: 'POST' }))
    store.stop()
    expect(source?.closed).toBe(true)
  })

  it('restores a persisted identity without showing the identity step', async () => {
    const identity = { participantId: 'returning-id', displayName: '回访者' }
    const room = { id: 'lobby', title: 'AI 聊天室', aiDisplayName: 'DeepSeek' }
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ identity, room })))
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()

    await store.start()

    expect(store.getSnapshot()).toMatchObject({ phase: 'ready', identity, connection: 'connecting' })
    expect(FakeEventSource.instances).toHaveLength(1)
  })
})

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
