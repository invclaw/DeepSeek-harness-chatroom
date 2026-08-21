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
  it('chooses identity first, then opens a selected native shared Session', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const room = roomInfo()
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(sessionResponse(null, [room])))
      .mockResolvedValueOnce(jsonResponse(sessionResponse(identity, [room]), 201))
      .mockResolvedValueOnce(jsonResponse({ room }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('EventSource', FakeEventSource)
    const openSession = vi.fn(() => true)
    const store = new ChatroomClientStore(openSession)

    await store.start()
    store.openRoom()
    await store.join('Alice', 'whale')
    expect(openSession).not.toHaveBeenCalled()
    expect(store.getSnapshot()).toMatchObject({ open: true, phase: 'ready', identity, room: undefined })

    await store.selectRoom('lobby')
    expect(openSession).toHaveBeenCalledWith('chatroom-v1-lobby')
    expect(store.getSnapshot()).toMatchObject({ open: false, room })
    expect(FakeEventSource.instances[0]?.url).toBe('/plugins/deepseek-harness-chatroom/api/events?roomId=lobby')
  })

  it('waits for the Host list when a newly activated Session is still arriving', async () => {
    const identity = { participantId: 'returning-id', displayName: '回访者', avatarId: 'panda' as const }
    const room = roomInfo()
    const openSession = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true)
    vi.stubGlobal('fetch', vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(sessionResponse(identity, [room])))
      .mockResolvedValueOnce(jsonResponse({ room })))
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore(openSession)

    await store.start()
    store.openRoom()
    await store.selectRoom('lobby')
    expect(store.getSnapshot().open).toBe(true)
    store.resumeOpen()
    expect(store.getSnapshot().open).toBe(false)
  })

  it('creates a second independent room and adds it to the directory', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const lobby = roomInfo()
    const second = { id: 'second', title: '项目二', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-v1-second' }
    vi.stubGlobal('fetch', vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(sessionResponse(identity, [lobby])))
      .mockResolvedValueOnce(jsonResponse({ room: second }, 201)))
    vi.stubGlobal('EventSource', FakeEventSource)
    const openSession = vi.fn(() => true)
    const store = new ChatroomClientStore(openSession)

    await store.start()
    store.openRoom()
    await store.createRoom('项目二')

    expect(store.getSnapshot().rooms).toEqual([lobby, second])
    expect(store.getSnapshot().room).toEqual(second)
    expect(openSession).toHaveBeenCalledWith('chatroom-v1-second')
  })

  it('synchronizes presence only for the native room currently on screen', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const room = roomInfo()
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(sessionResponse(identity, [room]))))
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()
    await store.start()

    store.activateSession(room.sessionId)
    FakeEventSource.instances[0]?.emit({ type: 'snapshot', room, identity, online: 2 })
    expect(store.getSnapshot()).toMatchObject({ connection: 'online', online: 2 })

    store.activateSession('ordinary-session')
    expect(store.getSnapshot()).toMatchObject({ connection: 'offline', room: undefined, online: 0 })
    expect(FakeEventSource.instances[0]?.closed).toBe(true)
  })

  it('sends selected files without placeholder composer text', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const room = roomInfo()
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(sessionResponse(identity, [room])))
      .mockResolvedValueOnce(jsonResponse({ accepted: true, aiTriggered: false }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()
    await store.start()
    const bytes = new TextEncoder().encode('hello').buffer
    const file = { name: 'note.txt', type: 'text/plain', arrayBuffer: async () => bytes } as File

    store.addFiles('lobby', [file])
    await store.sendFiles('lobby')

    const body = JSON.parse(String((fetchMock.mock.calls[1]?.[1] as RequestInit).body)) as {
      content: Array<{ type: string; name: string; mediaType: string; data: string }>
    }
    expect(body.content).toEqual([{
      type: 'file', name: 'note.txt', mediaType: 'text/plain', data: 'aGVsbG8=',
    }])
    expect(store.getSnapshot()).toMatchObject({ pendingFiles: [], composerBusy: false, composerError: undefined })
  })
})

function roomInfo() {
  return { id: 'lobby', title: 'AI 聊天室', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-v1-lobby' }
}

function sessionResponse(identity: { participantId: string; displayName: string; avatarId: 'whale' | 'panda' } | null, rooms: ReturnType<typeof roomInfo>[]) {
  return { identity, rooms, room: rooms[0] }
}

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
