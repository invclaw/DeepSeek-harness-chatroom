import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatroomClientStore, serializePendingFiles } from '../src/client/store.js'
import type { ChatroomNotificationEvent, ChatroomServerEvent } from '../src/types.js'

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

  emit(event: ChatroomServerEvent | ChatroomNotificationEvent): void {
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
    expect(store.getSnapshot()).toMatchObject({ open: false, phase: 'ready', identity, room: undefined })

    await store.selectRoom('lobby')
    expect(openSession).toHaveBeenCalledWith('chatroom-v1-lobby')
    expect(store.getSnapshot()).toMatchObject({ open: false, room })
    expect(FakeEventSource.instances[1]?.url).toBe('/plugins/deepseek-harness-chatroom/api/events?roomId=lobby')
  })

  it('prompts once when an unjoined browser enters a shared Session directly', async () => {
    const room = roomInfo()
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(sessionResponse(null, [room]))))
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()

    await store.start()
    store.activateSession(room.sessionId)
    expect(store.getSnapshot()).toMatchObject({ open: true, phase: 'identity-required', room })

    store.closeRoom()
    store.activateSession(room.sessionId)
    expect(store.getSnapshot().open).toBe(false)

    store.activateSession('ordinary-session')
    store.activateSession(room.sessionId)
    expect(store.getSnapshot().open).toBe(true)
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

  it('retargets a retained branch runtime without carrying composer state across threads', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const room = roomInfo()
    const first = {
      threadId: 'thread-1', sessionId: 'chatroom-thread-v1-thread-1', roomId: room.id,
      parentSessionId: room.sessionId,
    }
    const second = { ...first, threadId: 'thread-2', sessionId: 'chatroom-thread-v1-thread-2' }
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(sessionResponse(identity, [room]))))
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore(() => true, first)
    await store.start()
    store.addFiles(room.id, [{ name: 'note.txt' } as File])
    store.setReply(room.id, { messageId: 'user:1', displayName: 'Bob', text: '旧分支引用' })

    store.switchBranchFrame(second)

    expect(store.getSnapshot()).toMatchObject({
      branchFrame: second,
      composerRoomId: undefined,
      pendingFiles: [],
      reply: undefined,
      composerBusy: false,
      composerError: undefined,
    })
    expect(store.agentTargetForSession(second.sessionId)).toEqual({ kind: 'thread', room, threadId: 'thread-2' })
    expect(store.agentTargetForSession(first.sessionId)).toBeUndefined()
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

  it('defaults a new Session to Group but creates its room only on the first prompt', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const adopted = { id: 'session-native', title: '设计讨论', aiDisplayName: 'DeepSeek', sessionId: 'native-session' }
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(sessionResponse(identity, [])))
      .mockResolvedValueOnce(jsonResponse({ room: adopted }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()
    await store.start()

    store.registerNewSession('native-session')
    store.activateSession('native-session', '设计讨论')
    expect(store.getSnapshot().room).toBeUndefined()
    expect(store.newSessionMode('native-session')).toBe('group')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await store.chooseNewSessionMode('native-session', 'group')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await expect(store.ensurePromptTarget('native-session')).resolves.toEqual({ kind: 'room', room: adopted })

    expect(fetchMock.mock.calls[1]?.[0]).toBe('/plugins/deepseek-harness-chatroom/api/rooms/ensure')
    expect(JSON.parse(String((fetchMock.mock.calls[1]?.[1] as RequestInit).body))).toEqual({
      sessionId: 'native-session', title: '设计讨论',
    })
  })

  it('keeps the creation indicator through repeated Host list notifications', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const adopted = { id: 'session-native', title: '新会话', aiDisplayName: 'DeepSeek', sessionId: 'native-session' }
    let resolveEnsure: ((response: Response) => void) | undefined
    const ensure = new Promise<Response>((resolve) => { resolveEnsure = resolve })
    vi.stubGlobal('fetch', vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(sessionResponse(identity, [])))
      .mockReturnValueOnce(ensure))
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()
    await store.start()

    store.registerNewSession('native-session')
    store.activateSession('native-session', '新会话')
    const selecting = store.ensurePromptTarget('native-session')
    expect(store.getSnapshot().roomEnsureSessionId).toBe('native-session')
    store.activateSession('native-session', '新会话')
    expect(store.getSnapshot().roomEnsureSessionId).toBe('native-session')

    resolveEnsure?.(jsonResponse({ room: adopted }))
    await selecting
    await vi.waitFor(() => { expect(store.getSnapshot().room).toEqual(adopted) })
    expect(store.getSnapshot().roomEnsureSessionId).toBeUndefined()
  })

  it('clears the room-creation indicator after adoption fails', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(sessionResponse(identity, [])))
      .mockResolvedValueOnce(jsonResponse({ error: '分支会话不能单独转换为群聊。' }, 400))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()
    await store.start()

    store.registerNewSession('chatroom-thread-v1-old')
    store.activateSession('chatroom-thread-v1-old', '新会话')
    void store.ensurePromptTarget('chatroom-thread-v1-old')
    await vi.waitFor(() => {
      expect(store.getSnapshot()).toMatchObject({
        roomEnsureSessionId: undefined,
        error: '分支会话不能单独转换为群聊。',
      })
    })
  })

  it('exposes an in-flight automatic-response write until the server applies it', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const room = roomInfo()
    let resolveSetting: ((response: Response) => void) | undefined
    const settingResponse = new Promise<Response>((resolve) => { resolveSetting = resolve })
    vi.stubGlobal('fetch', vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(sessionResponse(identity, [room])))
      .mockReturnValueOnce(settingResponse))
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()
    await store.start()
    store.activateSession(room.sessionId)

    const setting = store.setRoomAutoTrigger(true)
    let waited = false
    const waiting = store.waitForRoomAutoTrigger(room.id).then(() => { waited = true })
    await Promise.resolve()
    expect(waited).toBe(false)
    resolveSetting?.(jsonResponse({ room: { ...room, autoTriggerEnabled: true }, members: [] }))

    await expect(setting).resolves.toBe(true)
    await waiting
    expect(waited).toBe(true)
    expect(store.getSnapshot().room).toMatchObject({ autoTriggerEnabled: true })
  })

  it('preserves the active identity and room while identity editing is cancelled or submitted', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const updated = { ...identity, displayName: 'Alice 2', avatarId: 'panda' as const }
    const room = roomInfo()
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(sessionResponse(identity, [room])))
      .mockResolvedValueOnce(jsonResponse(sessionResponse(updated, [room])))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()
    await store.start()
    store.activateSession(room.sessionId)
    FakeEventSource.instances[1]?.emit({ type: 'snapshot', room, identity, online: 2, members: [], reactions: [], threadPreviews: [] })

    await store.resetIdentity()
    expect(store.getSnapshot()).toMatchObject({ open: true, phase: 'identity-required', identity, room })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    store.closeRoom()
    expect(store.getSnapshot()).toMatchObject({ open: false, phase: 'ready', identity, room })

    store.openRoom()
    await store.resetIdentity()
    await store.join('Alice 2', 'panda')
    expect(store.getSnapshot()).toMatchObject({
      open: false,
      phase: 'ready',
      connection: 'online',
      identity: updated,
      online: 2,
      room,
    })
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/plugins/deepseek-harness-chatroom/api/session')
  })

  it('synchronizes presence only for the native room currently on screen', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const room = roomInfo()
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(sessionResponse(identity, [room]))))
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()
    await store.start()

    store.activateSession(room.sessionId)
    FakeEventSource.instances[1]?.emit({ type: 'snapshot', room, identity, online: 2, members: [], reactions: [], threadPreviews: [] })
    expect(store.getSnapshot()).toMatchObject({ connection: 'online', online: 2 })

    store.activateSession('ordinary-session')
    expect(store.getSnapshot()).toMatchObject({ connection: 'offline', room: undefined, online: 0 })
    expect(FakeEventSource.instances[1]?.closed).toBe(true)
  })

  it('keeps the directory avatar projection when the selected-room roster arrives', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const room = {
      ...roomInfo(),
      memberAvatarIds: ['whale' as const],
      memberAvatars: [{ participantId: 'alice-id', avatarId: 'whale' as const }],
    }
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(sessionResponse(identity, [room]))))
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()
    await store.start()
    store.activateSession(room.sessionId)

    FakeEventSource.instances[1]?.emit({
      type: 'snapshot', room, identity, online: 1,
      members: [{
        participantId: 'legacy-alice', displayName: '旧账号', avatarId: 'dog',
        avatarUrl: 'https://images.example.com/legacy-alice.png',
        role: 'member', joinedAt: 1, lastSeenAt: 2, online: true,
      }],
      reactions: [], threadPreviews: [],
    })

    expect(store.getSnapshot().room?.memberAvatars).toEqual(room.memberAvatars)
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

  it('classifies images natively and synchronizes reactions and merged forwarding', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const lobby = roomInfo()
    const target = { id: 'second', title: '项目二', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-v1-second' }
    const reaction = { roomId: 'lobby', messageId: 'user:1', emoji: '🎉' as const, participantIds: ['alice-id'] }
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(sessionResponse(identity, [lobby, target])))
      .mockResolvedValueOnce(jsonResponse(reaction))
      .mockResolvedValueOnce(jsonResponse({ accepted: true, aiTriggered: false }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()
    await store.start()
    const imageBytes = new Uint8Array([1, 2, 3]).buffer
    await expect(serializePendingFiles([{
      id: 'image-1',
      file: { name: 'photo.png', type: 'image/png', arrayBuffer: async () => imageBytes } as File,
    }])).resolves.toEqual([{ type: 'image', name: 'photo.png', mediaType: 'image/png', data: 'AQID' }])
    store.activateSession(lobby.sessionId)
    FakeEventSource.instances[1]?.emit({ type: 'snapshot', room: lobby, identity, online: 1, members: [], reactions: [], threadPreviews: [] })

    await store.toggleReaction('lobby', 'user:1', '🎉')
    expect(store.getSnapshot().reactions).toEqual([reaction])
    const item = { messageId: 'user:1', role: 'human' as const, displayName: 'Alice', text: '你好', createdAt: 1 }
    store.toggleMessageSelection('lobby', item)
    store.toggleMessageSelection('lobby', item)
    expect(store.getSnapshot()).toMatchObject({ selectionRoomId: 'lobby', selectedMessages: [] })
    store.toggleMessageSelection('lobby', item)
    store.openForward('lobby')
    await expect(store.forwardSelected('second')).resolves.toBe(true)
    expect(JSON.parse(String((fetchMock.mock.calls[2]?.[1] as RequestInit).body))).toEqual({
      sourceRoomId: 'lobby', targetRoomId: 'second', messages: [item],
    })
    expect(store.getSnapshot()).toMatchObject({
      selectionRoomId: undefined, selectedMessages: [], forwardOpen: false, forwardBusy: false,
    })

    store.toggleMessageSelection('lobby', item)
    FakeEventSource.instances[1]?.emit({
      type: 'message-recalled',
      recall: { roomId: 'lobby', messageId: 'user:1', participantId: 'alice-id', createdAt: 4 },
    })
    expect(store.getSnapshot()).toMatchObject({
      recalls: [expect.objectContaining({ messageId: 'user:1' })],
      reactions: [],
      selectedMessages: [],
    })
  })

  it('shows member presence, unread alerts, and a live right-side branch', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const room = roomInfo()
    const thread = {
      id: 'thread-id', roomId: 'lobby', sessionId: 'chatroom-thread-v1-thread-id', createdAt: 1,
      root: { messageId: 'user:1', displayName: 'Bob', text: '主题', role: 'human' as const },
    }
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(sessionResponse(identity, [room])))
      .mockResolvedValueOnce(jsonResponse({ thread, messages: [] }))
      .mockResolvedValueOnce(jsonResponse({ accepted: true, aiTriggered: true }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()
    await store.start()
    store.activateSession(room.sessionId)
    FakeEventSource.instances[1]?.emit({
      type: 'snapshot', room, identity, online: 2,
      members: [{ ...identity, joinedAt: 1, lastSeenAt: 2, online: true }],
      reactions: [],
      threadPreviews: [],
    })
    expect(store.getSnapshot()).toMatchObject({ online: 2, members: [{ displayName: 'Alice', online: true }] })

    await store.openThread('lobby', thread.root)
    FakeEventSource.instances[1]?.emit({
      type: 'thread-message',
      message: {
        id: 'branch-1', threadId: thread.id, sequence: 0, role: 'human', participantId: 'bob-id',
        displayName: 'Bob', avatarId: 'panda', text: '分支消息', createdAt: 3,
      },
      preview: {
        thread,
        totalMessages: 1,
        recentMessages: [{
          id: 'branch-1', threadId: thread.id, sequence: 0, role: 'human', participantId: 'bob-id',
          displayName: 'Bob', avatarId: 'panda', text: '分支消息', createdAt: 3,
        }],
      },
    })
    expect(store.getSnapshot().threadMessages).toMatchObject([{ text: '分支消息' }])
    expect(store.getSnapshot().threadPreviews).toMatchObject([{
      totalMessages: 1, recentMessages: [{ text: '分支消息' }],
    }])
    store.setThreadReply({ messageId: 'branch-1', displayName: 'Bob', text: '分支消息' })
    await store.sendThreadMessage('@AI 总结')
    expect(JSON.parse(String((fetchMock.mock.calls[2]?.[1] as RequestInit).body))).toEqual({
      threadId: 'thread-id', mode: 'queue', content: [{ type: 'text', text: '@AI 总结' }],
      reply: { messageId: 'branch-1', displayName: 'Bob', text: '分支消息' },
    })
    expect(store.getSnapshot().threadReply).toBeUndefined()

    FakeEventSource.instances[0]?.emit({
      type: 'notification',
      notification: {
        id: 'notice-1', roomId: 'other', roomTitle: '其他群', participantId: 'bob-id', displayName: 'Bob',
        role: 'human', text: '有新消息', createdAt: 4,
      },
    })
    expect(store.getSnapshot()).toMatchObject({ unreadCount: 1, toasts: [{ text: '有新消息' }] })
    store.stop()
  })

  it('loads unjoined platform users and adds checked accounts to the room', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const room = roomInfo()
    const owner = { ...identity, role: 'owner' as const, joinedAt: 1, lastSeenAt: 2, online: true }
    const candidate = { participantId: 'bob-id', username: 'bob-user', displayName: 'Bob', avatarId: 'panda' as const }
    const added = { ...candidate, role: 'member' as const, joinedAt: 3, lastSeenAt: 3, online: false }
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(sessionResponse(identity, [room])))
      .mockResolvedValueOnce(jsonResponse({ room, members: [owner], candidates: [candidate] }))
      .mockResolvedValueOnce(jsonResponse({ room, members: [owner, added], candidates: [] }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()
    await store.start()
    store.activateSession(room.sessionId)
    FakeEventSource.instances[1]?.emit({
      type: 'snapshot', room, identity, online: 1, members: [owner], reactions: [], threadPreviews: [],
    })

    store.openMembers()
    await vi.waitFor(() => { expect(store.getSnapshot().memberCandidates).toEqual([candidate]) })
    await expect(store.addRoomMembers([candidate.participantId])).resolves.toBe(true)

    expect(JSON.parse(String((fetchMock.mock.calls[2]?.[1] as RequestInit).body))).toEqual({
      roomId: 'lobby', action: 'add-members', participantIds: ['bob-id'],
    })
    expect(store.getSnapshot()).toMatchObject({
      members: [owner, added], memberCandidates: [], managementBusy: false,
    })
  })

  it('renames a blank shared Session and adds selected accounts as one setup action', async () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const room = roomInfo()
    const renamed = { ...room, title: '项目群' }
    const owner = { ...identity, role: 'owner' as const, joinedAt: 1, lastSeenAt: 2, online: true }
    const added = {
      participantId: 'bob-id', username: 'bob-user', displayName: 'Bob', avatarId: 'panda' as const,
      role: 'member' as const, joinedAt: 3, lastSeenAt: 3, online: false,
    }
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(sessionResponse(identity, [room])))
      .mockResolvedValueOnce(jsonResponse({ room: renamed, members: [owner] }))
      .mockResolvedValueOnce(jsonResponse({ room: renamed, members: [owner, added] }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('EventSource', FakeEventSource)
    const store = new ChatroomClientStore()
    await store.start()
    store.activateSession(room.sessionId)
    FakeEventSource.instances[1]?.emit({
      type: 'snapshot', room, identity, online: 1, members: [owner], reactions: [], threadPreviews: [],
    })

    await expect(store.completeGroupSetup('项目群', ['bob-id'])).resolves.toBe(true)
    expect(JSON.parse(String((fetchMock.mock.calls[1]?.[1] as RequestInit).body))).toEqual({
      roomId: 'lobby', action: 'rename', title: '项目群',
    })
    expect(JSON.parse(String((fetchMock.mock.calls[2]?.[1] as RequestInit).body))).toEqual({
      roomId: 'lobby', action: 'add-members', participantIds: ['bob-id'],
    })
    expect(store.getSnapshot()).toMatchObject({ room: renamed, members: [owner, added], managementBusy: false })
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
