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
  it('selects an identity and opens the existing native Session', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice' }
    const room = roomInfo()
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ identity: null, room }))
      .mockResolvedValueOnce(jsonResponse({ identity, room }, 201))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('EventSource', FakeEventSource)
    const openSession = vi.fn(() => true)
    const store = new ChatroomClientStore(openSession)

    await store.start()
    store.openRoom()
    await store.join('Alice')

    expect(openSession).toHaveBeenCalledWith('chatroom-v1-lobby')
    expect(store.getSnapshot()).toMatchObject({ open: false, phase: 'ready', identity })
    expect(FakeEventSource.instances[0]?.url).toBe('/plugins/deepseek-harness-chatroom/api/events')
  })

  it('waits for the Host list when the room Session is still initializing', async () => {
    const identity = { participantId: 'returning-id', displayName: '回访者' }
    const openSession = vi.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ identity, room: roomInfo() })))
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore(openSession)

    await store.start()
    store.openRoom()
    expect(store.getSnapshot().open).toBe(true)
    store.resumeOpen()
    expect(store.getSnapshot().open).toBe(false)
  })

  it('synchronizes room presence without owning the transcript', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice' }
    const room = roomInfo()
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ identity, room })))
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()
    await store.start()

    FakeEventSource.instances[0]?.emit({ type: 'snapshot', room, identity, online: 2 })
    expect(store.getSnapshot()).toMatchObject({ connection: 'online', online: 2 })
  })
})

function roomInfo() {
  return { id: 'lobby', title: 'AI 聊天室', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-v1-lobby' }
}

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
