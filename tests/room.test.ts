import { describe, expect, it, vi } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { CallId, createAssistantMessage, createToolResultMessage, createUserMessage } from '@deepseek-ai/dsh-llm'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import type { ToolDefinition } from '@deepseek-ai/dsh-tools'
import sharp from 'sharp'
import type { Config } from '../src/config.js'
import { ChatroomRuntime } from '../src/room.js'
import { participantMarker, projectFileText, projectForwardText, projectReplyText } from '../src/message.js'

describe('ChatroomRuntime', () => {
  it('appends human chat without waking AI and wakes only on explicit mention', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }

    await runtime.submit('lobby', identity, [{ type: 'text', text: '大家先讨论' }], 'queue')
    expect(harness.agents[0]?.session.append).toHaveBeenCalledOnce()
    expect(harness.agents[0]?.followup).not.toHaveBeenCalled()

    await runtime.submit('lobby', identity, [{ type: 'text', text: '@AI 请总结' }], 'queue')
    expect(harness.agents[0]?.followup).toHaveBeenCalledOnce()
    expect(harness.agents[0]?.session.append).toHaveBeenCalledOnce()

    await runtime.submit('lobby', identity, [{ type: 'text', text: '@DeepSeek 立即补充' }], 'steer')
    expect(harness.agents[0]?.steer).toHaveBeenCalledOnce()
    const followup = harness.agents[0]?.followup.mock.calls[0]?.[0]
    expect(followup?.content[0]).toMatchObject({
      type: 'text',
      text: '\u2063dsh-chatroom:alice-id|whale\u2063Alice：@AI 请总结',
    })

    await runtime.stop()
  })

  it('stops the current turn and coalesces AI-context resets without replacing room history', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    await runtime.selectRoom('lobby', identity)

    await runtime.stopRoomSession('lobby', identity)
    expect(harness.agents[0]?.cancel).toHaveBeenCalledWith({ kind: 'user' }, { keepInbox: true })
    expect(harness.agents[0]?.whenIdle).toHaveBeenCalledOnce()

    const userMessage = createUserMessage({
      content: [{ type: 'text', text: '需要保留的群聊历史' }],
      source: { kind: 'user' },
    })
    const assistantMessage = createAssistantMessage({
      content: [{ type: 'text', text: '需要保留的 AI 回复' }],
      source: { provider: 'deepseek', model: 'chat' },
    })
    const toolMessage = createToolResultMessage({
      callId: CallId('call-before-reset'),
      content: [{ type: 'text', text: '需要从新上下文排除的工具结果' }],
      isError: false,
    })
    const events: SessionEvent[] = [
      { type: 'user/message', seq: 0, time: 1, data: userMessage, surfaceOp: 'append' },
      {
        type: 'assistant/message', seq: 1, time: 2,
        data: { turn: 1, step: 1, message: assistantMessage }, surfaceOp: 'append',
      },
      {
        type: 'tool/result', seq: 2, time: 3,
        data: { turn: 1, step: 1, message: toolMessage }, surfaceOp: 'append',
      },
    ]
    ;(harness.agents[0]!.session as unknown as { events: SessionEvent[] }).events = events

    const [first, second] = await Promise.all([
      runtime.renewRoomSession('lobby', identity),
      runtime.renewRoomSession('lobby', identity),
    ])
    expect(first.sessionId).toBe(second.sessionId)
    expect(first.sessionId).toBe('chatroom-v1-lobby')
    expect(harness.agents).toHaveLength(1)
    expect(harness.agents[0]?.cancel).toHaveBeenLastCalledWith({ kind: 'user' })
    expect(harness.agents[0]?.session.events).toEqual(events)
    expect(runtime.hiddenModelMessageIds(first.sessionId)).toEqual(new Set([
      String(userMessage.id), String(assistantMessage.id), String(toolMessage.id),
    ]))
    expect(harness.tables.get('rooms')?.get('lobby')).toMatchObject({
      sessionId: 'chatroom-v1-lobby', aiContextResetSeq: 2,
    })

    const currentMessage = createUserMessage({
      content: [{ type: 'text', text: '新 AI 会话中的第一条消息' }],
      source: { kind: 'user' },
    })
    const currentEvent = { type: 'user/message', seq: 3, time: 4, data: currentMessage, surfaceOp: 'append' } as const
    events.push(currentEvent)
    runtime.handleSessionEvent(harness.agents[0]!.session, currentEvent)
    await vi.waitFor(() => {
      expect(harness.tables.get('rooms')?.get('lobby')).toMatchObject({ aiContextStartSeq: 3 })
    })
    expect(runtime.hiddenModelMessageIds(first.sessionId)).not.toContain(String(currentMessage.id))
    await runtime.stop()
  })

  it('creates a quick Enterprise WeChat meeting and appends its durable card', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    await runtime.selectRoom('lobby', identity)
    const wecom = (runtime as unknown as {
      wecom: { client: ReturnType<typeof vi.fn> }
    }).wecom
    const invoke = vi.fn()
      .mockResolvedValueOnce({ userid: 'alice-wecom' })
      .mockResolvedValueOnce({
        subject: '快速会议', begin_time: '2026-09-01 10:00:00', end_time: '2026-09-01 11:00:00',
        meeting_url: 'https://meeting.example.com/join',
      })
    wecom.client = vi.fn(() => ({ invoke }))

    await expect(runtime.createQuickMeeting('lobby', identity)).resolves.toMatchObject({
      kind: 'meeting', title: '快速会议', url: 'https://meeting.example.com/join',
    })
    expect(wecom.client).toHaveBeenCalledWith()
    expect(invoke).toHaveBeenNthCalledWith(1, 'identity', [], 'whoami', {})
    expect(invoke).toHaveBeenNthCalledWith(2, 'meeting', [], 'create', expect.objectContaining({
      subject: '快速会议', attendees: [{ userid: 'alice-wecom' }],
    }))
    const message = harness.agents[0]?.session.append.mock.calls.at(-1)?.[1]
    expect(JSON.stringify(message)).toContain('dsh-chatroom-card:')
    expect(harness.agents[0]?.followup).not.toHaveBeenCalled()
    await runtime.stop()
  })

  it('creates a quick meeting when the official identity response has no structured userid', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    await runtime.selectRoom('lobby', identity)
    const wecom = (runtime as unknown as {
      wecom: { client: ReturnType<typeof vi.fn> }
    }).wecom
    const invoke = vi.fn()
      .mockResolvedValueOnce({ extra_identity_context: '机器人和授权真人身份说明' })
      .mockResolvedValueOnce({ meeting_id: 'meeting', meeting_link: 'https://meeting.example.com/join' })
    wecom.client = vi.fn(() => ({ invoke }))

    await expect(runtime.createQuickMeeting('lobby', identity)).resolves.toMatchObject({
      kind: 'meeting', title: '快速会议', url: 'https://meeting.example.com/join',
    })
    expect(invoke).toHaveBeenNthCalledWith(2, 'meeting', [], 'create', expect.not.objectContaining({ attendees: expect.anything() }))
    await runtime.stop()
  })

  it('updates a meeting after it ends, summarizes its notes, and posts the summary once', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    await runtime.selectRoom('lobby', identity)
    const wecom = (runtime as unknown as { wecom: { client: ReturnType<typeof vi.fn> } }).wecom
    const invoke = vi.fn()
      .mockResolvedValueOnce({ userid: 'alice-wecom' })
      .mockResolvedValueOnce({
        meeting_id: 'provider-meeting', subject: '周会', meeting_link: 'https://meeting.example.com/join',
        begin_time: '2026-09-01 10:00:00', end_time: '2026-09-01 11:00:00',
      })
      .mockResolvedValueOnce({ meetings: [{
        meeting_id: 'provider-meeting', subject: '周会', meeting_status: 'end',
        begin_time: '2026-09-01 10:00:00', end_time: '2026-09-01 11:00:00',
        attendees: [{ name: 'Alice', is_attended: true, duration: 1800 }],
        notes: [{ note_content: '确认发布计划', todo_content: 'Alice 明天发布' }],
      }] })
    wecom.client = vi.fn(() => ({ invoke }))
    const card = await runtime.createQuickMeeting('lobby', identity)
    harness.llmStream.mockImplementationOnce(async function* () {
      yield { type: 'text-delta', index: 0, text: '结论：按计划发布。\n\n行动项：Alice 明天发布。' }
      yield { type: 'finish', reason: { kind: 'stop' } }
    })

    await runtime.synchronizeMeetings()

    expect(invoke).toHaveBeenNthCalledWith(3, 'meeting', [], 'get', {
      meeting_ids: [{ meeting_id: 'provider-meeting' }],
    })
    expect(runtime.meetingSummary(card.id!, identity)).toMatchObject({
      id: card.id,
      status: 'end',
      summaryStatus: 'completed',
      summary: '结论：按计划发布。\n\n行动项：Alice 明天发布。',
    })
    expect(harness.agents[0]?.session.append.mock.calls.at(-1)?.[0]).toBe('assistant/message')
    expect(JSON.stringify(harness.agents[0]?.session.append.mock.calls.at(-1)?.[1])).toContain('会议总结 · 周会')
    await runtime.synchronizeMeetings()
    expect(invoke).toHaveBeenCalledTimes(3)
    await runtime.stop()
  })

  it('uses the configured controller model only when automatic responses are enabled', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    expect(harness.promptSections).toHaveLength(3)
    expect(promptSectionText(harness.promptSections[0]!)).toContain('多人群聊')
    await runtime.updateAutomationSettings('deepseek', 'chat', '主 Agent 自定义提示词', '判断 Agent 自定义提示词')
    expect(promptSectionText(harness.promptSections[0]!)).toBe('主 Agent 自定义提示词')
    await runtime.selectRoom('lobby', { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' })
    const identity = { participantId: 'bob-id', displayName: 'Bob', avatarId: 'panda' as const }
    await runtime.selectRoom('lobby', identity)
    await runtime.setRoomAutoTrigger('lobby', true, identity)
    harness.llmStream.mockImplementationOnce(async function* () {
      yield { type: 'text-delta', index: 0, text: '{"wake":true}' }
      yield { type: 'finish', reason: { kind: 'stop' } }
    })

    await runtime.submit('lobby', identity, [{ type: 'text', text: '请总结刚才的结论' }], 'queue')
    await vi.waitFor(() => expect(harness.agents[0]?.followup).toHaveBeenCalledOnce())

    expect(harness.llmStream).toHaveBeenCalledOnce()
    expect(harness.llmStream.mock.calls[0]?.[0]).toMatchObject({
      provider: 'deepseek', model: 'chat', reasoningEffort: 'off',
      system: '判断 Agent 自定义提示词', temperature: 0, maxTokens: 128,
    })
    expect(harness.agents[0]?.followup).toHaveBeenCalledOnce()
    harness.llmStream.mockImplementationOnce(async function* () {
      yield { type: 'text-delta', index: 0, text: '{"wake":false}' }
      yield { type: 'finish', reason: { kind: 'stop' } }
    })

    await runtime.submit('lobby', identity, [{ type: 'text', text: '大家下午好' }], 'queue')
    await vi.waitFor(() => expect(harness.llmStream).toHaveBeenCalledTimes(2))

    expect(harness.agents[0]?.followup).toHaveBeenCalledOnce()
    expect(harness.agents[0]?.session.append).toHaveBeenCalledTimes(2)
    await runtime.stop()
  })

  it('accepts and appends ordinary chat before the automatic-response controller finishes', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    await runtime.selectRoom('lobby', identity)
    await runtime.setRoomAutoTrigger('lobby', true, identity)
    let releaseController!: () => void
    const controller = new Promise<void>((resolve) => { releaseController = resolve })
    harness.llmStream.mockImplementationOnce(async function* () {
      await controller
      yield { type: 'text-delta', index: 0, text: '{"wake":false}' }
      yield { type: 'finish', reason: { kind: 'stop' } }
    })

    await expect(runtime.submit(
      'lobby', identity, [{ type: 'text', text: '这条消息必须立即显示' }], 'queue',
    )).resolves.toEqual({ accepted: true, aiTriggered: false })
    expect(harness.agents[0]?.session.append).toHaveBeenCalledOnce()
    expect(harness.agents[0]?.followup).not.toHaveBeenCalled()

    releaseController()
    await runtime.stop()
  })

  it('wakes directly addressed automatic-response messages without a controller round trip', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    await runtime.selectRoom('lobby', identity)
    await runtime.setRoomAutoTrigger('lobby', true, identity)

    await runtime.submit('lobby', identity, [{ type: 'text', text: 'DeepSeek你说话啊' }], 'queue')

    expect(harness.llmStream).not.toHaveBeenCalled()
    expect(harness.agents[0]?.followup).toHaveBeenCalledOnce()
    await runtime.stop()
  })

  it('orders rooms by recent activity while keeping personal pins first', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(100)
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    now.mockReturnValue(200)
    const first = await runtime.createRoom('第一个群', identity)
    now.mockReturnValue(300)
    const second = await runtime.createRoom('第二个群', identity)
    expect(runtime.roomsFor(identity).findIndex(room => room.id === second.id))
      .toBeLessThan(runtime.roomsFor(identity).findIndex(room => room.id === first.id))

    now.mockReturnValue(400)
    await runtime.submit(first.id, identity, [{ type: 'text', text: '最近更新' }], 'queue')
    expect(runtime.roomsFor(identity).findIndex(room => room.id === first.id))
      .toBeLessThan(runtime.roomsFor(identity).findIndex(room => room.id === second.id))

    await runtime.setRoomPinned(second.id, true, identity)
    expect(runtime.roomsFor(identity)[0]).toMatchObject({ id: second.id, pinned: true })
    expect(runtime.roomsFor({ participantId: 'bob', displayName: 'Bob', avatarId: 'panda' })[0]?.id).not.toBe(second.id)
    await runtime.stop()
    now.mockRestore()
  })

  it('creates an independent persisted room and native Session', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()

    const room = await runtime.createRoom('项目二', { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' })

    expect(room.title).toBe('项目二')
    expect(room.sessionId).toBe(`chatroom-v1-${room.id}`)
    expect(runtime.rooms).toHaveLength(2)
    expect(harness.agents).toHaveLength(2)
    expect(harness.attached).toEqual(['chatroom-v1-lobby', room.sessionId])
    expect(harness.agents[1]?.session.append).not.toHaveBeenCalled()
    await runtime.stop()
  })

  it('adopts one native Harness Session as one shared room across concurrent browsers', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    harness.agents.push({
      id: 'native-session-1',
      options: { provider: 'deepseek', model: 'chat' },
      session: { events: [], append: vi.fn() },
      ctx: harness.makeAgentContext(),
      followup: vi.fn(),
      steer: vi.fn(),
    } as never)
    vi.mocked(harness.ctx.agents.get).mockImplementation(id =>
      harness.agents.find(agent => String(agent.id) === String(id)))
    const alice = {
      participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const,
      avatarUrl: 'https://images.example.com/alice.png',
    }
    const bob = { participantId: 'bob-id', displayName: 'Bob', avatarId: 'panda' as const }

    const [first, second] = await Promise.all([
      runtime.ensureSessionRoom('native-session-1', '新会话', alice),
      runtime.ensureSessionRoom('native-session-1', '新会话', bob),
    ])

    expect(second).toEqual(first)
    expect(first).toMatchObject({ sessionId: 'native-session-1', title: '新会话' })
    expect(runtime.rooms).toHaveLength(2)
    expect(runtime.membersForRoom(first.id)).toHaveLength(2)
    expect(runtime.rooms.find(room => room.id === first.id)?.memberAvatarIds).toEqual(
      expect.arrayContaining(['whale', 'panda']),
    )
    expect(runtime.rooms.find(room => room.id === first.id)?.memberAvatars).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          participantId: 'alice-id', avatarId: 'whale',
          avatarUrl: 'https://images.example.com/alice.png',
        }),
        expect.objectContaining({ participantId: 'bob-id', avatarId: 'panda' }),
      ]),
    )
    expect(harness.agents).toHaveLength(2)
    expect(harness.agents[1]?.session.append).not.toHaveBeenCalled()
    await runtime.stop()
  })

  it('adds chatroom tools to a live Agent restored by Harness before room adoption', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    harness.registeredTools.length = 0
    harness.promptSections.length = 0
    const presetMounts = vi.mocked(harness.ctx.agentPresets.mount).mock.calls.length
    const agentCtx = harness.makeAgentContext()
    harness.agents.push({
      id: 'native-live-session',
      options: { provider: 'deepseek', model: 'chat' },
      session: { id: 'native-live-session', events: [], append: vi.fn() },
      ctx: agentCtx,
      followup: vi.fn(),
      steer: vi.fn(),
    } as never)
    vi.mocked(harness.ctx.agents.get).mockImplementation(id =>
      harness.agents.find(agent => String(agent.id) === String(id)))

    await runtime.ensureSessionRoom('native-live-session', '原生会话', {
      participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale',
    })

    expect(harness.registeredTools.map(tool => tool.name)).toEqual([
      'chatroom_capabilities', 'chatroom_action', 'wecom_schema', 'wecom_action',
    ])
    expect(harness.promptSections.map(section => section.name)).toEqual([
      'chatroom:main-agent', 'chatroom:collaboration-tools', 'chatroom:wecom-tools',
    ])
    expect(harness.ctx.agentPresets.mount).toHaveBeenCalledTimes(presetMounts)
    await runtime.stop()
  })

  it('lets owners promote administrators and lets both roles rename the room', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const alice = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const bob = { participantId: 'bob-id', displayName: 'Bob', avatarId: 'panda' as const }
    const room = await runtime.createRoom('项目群', alice)
    await runtime.selectRoom(room.id, bob)

    expect([...runtime.membersForRoom(room.id)].sort((left, right) => left.participantId.localeCompare(right.participantId))).toMatchObject([
      { participantId: 'alice-id', role: 'owner' },
      { participantId: 'bob-id', role: 'member' },
    ])
    await expect(runtime.renameRoom(room.id, '越权改名', bob)).rejects.toThrow('没有群管理权限')
    await runtime.setMemberRole(room.id, bob.participantId, 'admin', alice)
    expect([...runtime.membersForRoom(room.id)].sort((left, right) => left.participantId.localeCompare(right.participantId))).toMatchObject([
      { participantId: 'alice-id', role: 'owner' },
      { participantId: 'bob-id', role: 'admin' },
    ])
    await expect(runtime.renameRoom(room.id, '管理员已改名', bob)).resolves.toMatchObject({
      title: '管理员已改名',
    })
    await expect(runtime.setMemberRole(room.id, alice.participantId, 'member', alice)).rejects.toThrow('不能修改群主角色')
    await runtime.stop()
  })

  it('lets room managers add active platform accounts without an invite link', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, {
      ...config(),
      authEnabled: true,
      authSecret: 'a secure test secret with at least 32 bytes',
      authPublicOrigin: 'https://chat.example.com',
      authBootstrapToken: 'bootstrap-token',
    })
    await runtime.start()
    const alice = (await runtime.auth.register({
      username: 'alice', password: 'alice password 123', displayName: 'Alice', bootstrapToken: 'bootstrap-token',
    })).account
    const bob = (await runtime.auth.register({
      username: 'bob-user', password: 'bob password 1234', displayName: 'Bob',
    })).account
    const charlie = (await runtime.auth.register({
      username: 'charlie', password: 'charlie password 123', displayName: 'Charlie',
    })).account
    const room = await runtime.createRoom('项目群', alice)

    expect(runtime.roomInviteCandidates(room.id, alice).map(candidate => candidate.username)).toEqual([
      'bob-user', 'charlie',
    ])
    await runtime.addRoomMembers(room.id, [bob.participantId], alice)
    expect(runtime.membersForRoom(room.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ participantId: alice.participantId, role: 'owner' }),
      expect.objectContaining({ participantId: bob.participantId, role: 'member', online: false }),
    ]))
    expect(runtime.roomInviteCandidates(room.id, alice).map(candidate => candidate.username)).toEqual(['charlie'])
    await expect(runtime.addRoomMembers(room.id, [charlie.participantId], charlie)).rejects.toThrow('没有群管理权限')

    const bobRoom = await runtime.createRoom('Bob 的群', bob)
    await runtime.addRoomMembers(bobRoom.id, [charlie.participantId], alice)
    expect(runtime.membersForRoom(bobRoom.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ participantId: bob.participantId, role: 'owner' }),
      expect.objectContaining({ participantId: charlie.participantId, role: 'member' }),
    ]))
    await runtime.stop()
  })

  it('keeps a managed configured-room title across plugin restarts', async () => {
    const harness = fakeHarness()
    const alice = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const first = new ChatroomRuntime(harness.ctx, config())
    await first.start()
    await first.selectRoom('lobby', alice)
    await first.renameRoom('lobby', '新版大厅', alice)
    await first.stop()

    const second = new ChatroomRuntime(harness.ctx, config())
    await second.start()
    expect(second.room.title).toBe('新版大厅')
    await second.stop()
  })

  it('persists native Session title changes as the shared room title', async () => {
    const harness = fakeHarness()
    const first = new ChatroomRuntime(harness.ctx, config())
    await first.start()
    const session = harness.agents[0]!.session

    first.handleSessionEvent(session, {
      type: 'session/title',
      seq: 1,
      time: 2,
      data: { title: '原生侧栏改名', messageSeqs: [], source: { kind: 'user' } },
    } as SessionEvent)

    expect(first.room.title).toBe('原生侧栏改名')
    await vi.waitFor(() => {
      expect((harness.tables.get('rooms')?.get('lobby') as { title?: string } | undefined)?.title)
        .toBe('原生侧栏改名')
    })
    await first.stop()

    const second = new ChatroomRuntime(harness.ctx, config())
    await second.start()
    expect(second.room.title).toBe('原生侧栏改名')
    await second.stop()
  })

  it('updates an identity without replacing its participant id or token', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const created = await runtime.createIdentity('Alice', 'whale')

    const updated = await runtime.updateIdentity(created.token, 'Alice 2', 'panda')

    expect(updated).toEqual({
      participantId: created.identity.participantId,
      displayName: 'Alice 2',
      avatarId: 'panda',
    })
    expect(runtime.identity(created.token)).toEqual(updated)
    await runtime.stop()
  })

  it('uses existing browser identities as the private-chat directory when account auth is disabled', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const alice = await runtime.createIdentity('Alice', 'whale')
    const bob = await runtime.createIdentity('Bob', 'panda')

    expect(runtime.directDirectory(alice.identity).peers).toContainEqual({
      participantId: bob.identity.participantId,
      username: 'Bob',
      displayName: 'Bob',
      avatarId: 'panda',
    })
    const opened = await runtime.openDirect(bob.identity.participantId, alice.identity)
    const sent = await runtime.sendDirect(opened.conversation!.id, [{ type: 'text', text: '你好 Bob' }], alice.identity)
    expect((await runtime.openDirect(alice.identity.participantId, bob.identity)).messages).toEqual([sent.message])
    await runtime.stop()
  })

  it('creates a private quick meeting with the sender account and stores its card', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const alice = await runtime.createIdentity('Alice', 'whale')
    const bob = await runtime.createIdentity('Bob', 'panda')
    const opened = await runtime.openDirect(bob.identity.participantId, alice.identity)
    const wecom = (runtime as unknown as { wecom: { client: ReturnType<typeof vi.fn> } }).wecom
    const invoke = vi.fn()
      .mockResolvedValueOnce({ userid: 'alice-wecom' })
      .mockResolvedValueOnce({ subject: '快速会议', meeting_url: 'https://meeting.example.com/private' })
    wecom.client = vi.fn(() => ({ invoke }))

    await runtime.createDirectQuickMeeting(opened.conversation!.id, alice.identity)

    expect(wecom.client).toHaveBeenCalledWith()
    expect((await runtime.openDirect(alice.identity.participantId, bob.identity)).messages).toMatchObject([{
      senderId: alice.identity.participantId,
      text: '',
      card: { kind: 'meeting', title: '快速会议', url: 'https://meeting.example.com/private' },
    }])
    await runtime.stop()
  })

  it('keeps direct conversations private to their two authenticated accounts', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, {
      ...config(),
      authEnabled: true,
      authSecret: 'a secure test secret with at least 32 bytes',
      authPublicOrigin: 'https://chat.example.com',
      authBootstrapToken: 'bootstrap-token',
    })
    await runtime.start()
    const alice = (await runtime.auth.register({
      username: 'alice', password: 'alice password 123', displayName: 'Alice', bootstrapToken: 'bootstrap-token',
    })).account
    const bob = (await runtime.auth.register({
      username: 'bob-user', password: 'bob password 1234', displayName: 'Bob',
    })).account
    const charlie = (await runtime.auth.register({
      username: 'charlie', password: 'charlie password 123', displayName: 'Charlie',
    })).account

    const opened = await runtime.openDirect(bob.participantId, alice)
    const sent = await runtime.sendDirect(opened.conversation!.id, [
      { type: 'text', text: '只给 Bob 的消息' },
      { type: 'file', name: 'private.txt', mediaType: 'text/plain', data: Buffer.from('private file').toString('base64') },
    ], alice)
    expect(sent.message).toMatchObject({ sequence: 1, senderId: alice.participantId, text: '只给 Bob 的消息' })
    expect(sent.message.files).toHaveLength(1)
    expect(Buffer.from(runtime.file(sent.message.files![0]!.id, bob).data).toString()).toBe('private file')
    expect((await runtime.openDirect(alice.participantId, bob)).messages).toEqual([sent.message])
    await expect(runtime.sendDirect(opened.conversation!.id, [{ type: 'text', text: '越权读取' }], charlie)).rejects.toThrow('无权访问')
    expect(() => runtime.file(sent.message.files![0]!.id, charlie)).toThrow('无权访问')
    expect(runtime.directDirectory(charlie).conversations).toEqual([])
    await runtime.stop()
  })

  it('stores downloadable files and keeps a model-readable reply line', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }

    await runtime.submit('lobby', identity, [{
      type: 'file', name: 'note.txt', mediaType: 'text/plain', data: Buffer.from('hello').toString('base64'),
    }], 'queue', { messageId: 'user:1', displayName: 'Bob', text: '前文' })

    const message = harness.agents[0]?.session.append.mock.calls[0]?.[1]
    const text = message?.content.filter((block: { type: string }) => block.type === 'text')
      .map((block: { text?: string }) => block.text ?? '').join('') ?? ''
    expect(text).toContain('回复 Bob「前文」')
    expect(text).not.toContain('发送了文件')
    const projected = projectFileText(text)
    expect(projected.files).toMatchObject([{ name: 'note.txt', mediaType: 'text/plain', bytes: 5 }])
    const stored = runtime.file(projected.files[0]!.id)
    expect(new TextDecoder().decode(stored.data)).toBe('hello')
    const persisted = [...(harness.tables.get('files')?.entries() ?? [])][0]?.[1] as Record<string, unknown> | undefined
    expect(persisted).toMatchObject({
      sha256: expect.stringMatching(/^[a-f0-9]{64}$/u),
      storageKey: expect.stringMatching(/^objects\/[a-f0-9]{2}\/[a-f0-9]{64}$/u),
    })
    expect(persisted).not.toHaveProperty('data')
    await runtime.stop()
  })

  it('downscales oversized images before native attachment admission', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, { ...config(), maxImageSidePixels: 1000 })
    await runtime.start()
    const image = await sharp({ create: { width: 2000, height: 10, channels: 3, background: '#336699' } }).png().toBuffer()

    await runtime.submit('lobby', {
      participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale',
    }, [{ type: 'image', mediaType: 'image/png', data: image.toString('base64'), name: 'wide.png' }], 'queue')

    const saved = harness.savedImages.mock.calls[0]?.[0]?.[0]
    const metadata = await sharp(saved?.data).metadata()
    expect(metadata.width).toBe(1000)
    expect(metadata.height).toBe(5)
    await runtime.stop()
  })

  it('keeps durable members and routes AI replies through an independent branch Session', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const alice = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const bob = { participantId: 'bob-id', displayName: 'Bob', avatarId: 'panda' as const }
    await runtime.selectRoom('lobby', alice)
    await runtime.selectRoom('lobby', bob)
    const writes: string[] = []
    const response = {
      destroyed: false,
      writableEnded: false,
      write: vi.fn((value: string) => { writes.push(value); return true }),
      end: vi.fn(),
    }
    const unsubscribe = runtime.subscribe('lobby', alice, response as never)
    const snapshot = JSON.parse(writes[0]!.slice('data: '.length)) as { members: Array<{ displayName: string }> }
    expect(snapshot.members.map(member => member.displayName)).toEqual(['Alice', 'Bob'])

    const opened = await runtime.openThread('lobby', alice, {
      messageId: 'user:1', displayName: 'Bob', text: '这个方案怎么做？', role: 'human',
    })
    expect(opened.messages).toEqual([])
    expect(harness.agents[1]?.session.append).toHaveBeenCalledOnce()
    expect(harness.attached).toEqual(['chatroom-v1-lobby', opened.thread.sessionId])

    await runtime.submitThread(opened.thread.id, bob, '先讨论，不叫 AI')
    expect(harness.agents[1]?.session.append).toHaveBeenCalledTimes(2)
    expect(harness.agents[1]?.followup).not.toHaveBeenCalled()
    await runtime.submitThread(opened.thread.id, alice, '@AI 给出结论', {
      messageId: 'branch-human-1', displayName: 'Bob', text: '先讨论，不叫 AI',
    })
    expect(harness.agents[1]?.followup).toHaveBeenCalledOnce()
    expect(harness.agents[1]?.followup.mock.calls[0]?.[0]?.content[0]).toMatchObject({
      type: 'text',
      text: expect.stringContaining('回复 Bob「先讨论，不叫 AI」'),
    })

    runtime.handleSessionEvent(
      { id: opened.thread.sessionId } as unknown as Session,
      {
        type: 'assistant/message', seq: 8, time: 1_000,
        data: {
          turn: 1,
          step: 1,
          message: { role: 'assistant', content: [{ type: 'text', text: '分支结论' }] },
        },
      } as SessionEvent,
    )
    await vi.waitFor(async () => {
      const reopened = await runtime.openThread('lobby', alice, opened.thread.root)
      expect(reopened.messages.map(message => [message.role, message.text])).toEqual([
        ['human', '先讨论，不叫 AI'],
        ['human', '@AI 给出结论'],
        ['ai', '分支结论'],
      ])
      expect(reopened.messages[1]?.reply).toEqual({
        messageId: 'branch-human-1', displayName: 'Bob', text: '先讨论，不叫 AI',
      })
    })
    const branchEvents = writes.filter(value => value.startsWith('data: '))
      .map(value => JSON.parse(value.slice('data: '.length)) as {
        type: string
        preview?: { totalMessages: number; recentMessages: Array<{ text: string }> }
      })
      .filter(event => event.type === 'thread-message')
    expect(branchEvents.at(-1)?.preview).toMatchObject({
      totalMessages: 3,
      recentMessages: [{ text: '先讨论，不叫 AI' }, { text: '@AI 给出结论' }, { text: '分支结论' }],
    })
    const reconnectWrites: string[] = []
    const reconnect = runtime.subscribe('lobby', bob, {
      destroyed: false,
      writableEnded: false,
      write: vi.fn((value: string) => { reconnectWrites.push(value); return true }),
      end: vi.fn(),
    } as never)
    const reconnectSnapshot = JSON.parse(reconnectWrites[0]!.slice('data: '.length)) as {
      threadPreviews: Array<{ totalMessages: number; recentMessages: Array<{ text: string }> }>
    }
    expect(reconnectSnapshot.threadPreviews).toMatchObject([{
      totalMessages: 3,
      recentMessages: [{ text: '先讨论，不叫 AI' }, { text: '@AI 给出结论' }, { text: '分支结论' }],
    }])
    reconnect()
    await runtime.stop()
    expect(() => { unsubscribe() }).not.toThrow()
  })

  it('seeds an AI-authored branch root as a native assistant message', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const alice = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }

    const opened = await runtime.openThread('lobby', alice, {
      messageId: 'assistant:7', role: 'ai', displayName: 'DeepSeek', text: '**结论**\n\n```ts\nconst ready = true\n```',
    })

    const [eventType, payload] = harness.agents[1]?.session.append.mock.calls[0] ?? []
    expect(eventType).toBe('assistant/message')
    expect(payload).toMatchObject({
      turn: 0,
      step: 0,
      message: {
        role: 'assistant',
        content: [{ type: 'text', text: '这是群聊分支的主题消息。DeepSeek：**结论**\n\n```ts\nconst ready = true\n```' }],
      },
    })
    runtime.handleSessionEvent(harness.agents[1]!.session, {
      type: 'assistant/message', seq: 1, time: 1, data: payload,
    } as SessionEvent)
    await expect(runtime.openThread('lobby', alice, opened.thread.root)).resolves.toMatchObject({ messages: [] })
    await runtime.stop()
  })

  it('persists reaction toggles and broadcasts replacement summaries', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const alice = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    await runtime.selectRoom('lobby', alice)
    const writes: string[] = []
    runtime.subscribe('lobby', alice, {
      destroyed: false,
      writableEnded: false,
      write: vi.fn((value: string) => { writes.push(value); return true }),
      end: vi.fn(),
    } as never)

    await expect(runtime.toggleReaction('lobby', 'user:1', '👍', alice)).resolves.toEqual({
      roomId: 'lobby', messageId: 'user:1', emoji: '👍', participantIds: ['alice-id'],
    })
    await expect(runtime.toggleReaction('lobby', 'user:1', '👍', alice)).resolves.toEqual({
      roomId: 'lobby', messageId: 'user:1', emoji: '👍', participantIds: [],
    })
    const events = writes.filter(value => value.startsWith('data: '))
      .map(value => JSON.parse(value.slice('data: '.length)) as { type: string; reaction?: { participantIds: string[] } })
    expect(events.filter(event => event.type === 'reaction').map(event => event.reaction?.participantIds)).toEqual([
      ['alice-id'], [],
    ])
    await runtime.stop()
  })

  it('lets a sender recall their human message and rejects another member', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const alice = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const bob = { participantId: 'bob-id', displayName: 'Bob', avatarId: 'panda' as const }
    await runtime.selectRoom('lobby', alice)
    await runtime.selectRoom('lobby', bob)
    await runtime.submit('lobby', alice, [{ type: 'text', text: '稍后撤回' }], 'queue')
    const payload = harness.agents[0]?.session.append.mock.calls[0]?.[1]
    Object.assign(harness.agents[0]!.session, {
      events: [{ type: 'user/message', seq: 7, time: 1, data: payload }],
    })

    await runtime.toggleReaction('lobby', 'user:7', '👍', bob)
    await expect(runtime.recallMessage('lobby', 'user:7', bob)).rejects.toThrow('只能撤回自己发送的消息')
    await expect(runtime.recallMessage('lobby', 'user:7', alice)).resolves.toMatchObject({
      roomId: 'lobby', messageId: 'user:7', participantId: 'alice-id',
    })
    const writes: string[] = []
    runtime.subscribe('lobby', alice, {
      destroyed: false,
      writableEnded: false,
      write: vi.fn((value: string) => { writes.push(value); return true }),
      end: vi.fn(),
    } as never)
    const snapshot = JSON.parse(writes[0]!.slice('data: '.length)) as {
      recalls: Array<{ messageId: string }>
      reactions: unknown[]
    }
    expect(snapshot.recalls).toEqual([expect.objectContaining({ messageId: 'user:7' })])
    expect(snapshot.reactions).toEqual([])
    expect(runtime.recalledMessageIds(String(harness.agents[0]!.session.id)).has(String(payload.id))).toBe(true)
    await runtime.stop()
  })

  it('registers model-callable chatroom tools and executes collaboration side effects', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, {
      ...config(),
      cwd: process.cwd(),
      authEnabled: true,
      authSecret: 'a secure test secret with at least 32 bytes',
      authPublicOrigin: 'https://chat.example.com',
      authBootstrapToken: 'bootstrap-token',
    })
    await runtime.start()
    const alice = (await runtime.auth.register({
      username: 'alice', password: 'alice password 123', displayName: 'Alice', bootstrapToken: 'bootstrap-token',
    })).account
    const bob = (await runtime.auth.register({
      username: 'bob', password: 'bob password 12345', displayName: 'Bob',
    })).account
    await runtime.selectRoom('lobby', alice)
    await runtime.submit('lobby', alice, [{ type: 'text', text: '请处理这条消息' }], 'queue')
    const payload = harness.agents[0]?.session.append.mock.calls[0]?.[1]
    Object.assign(harness.agents[0]!.session, {
      events: [{ type: 'user/message', seq: 9, time: 1, data: payload }],
    })
    const capabilities = harness.registeredTools.find(tool => tool.name === 'chatroom_capabilities')
    const action = harness.registeredTools.find(tool => tool.name === 'chatroom_action')
    if (capabilities === undefined || action === undefined) throw new Error('chatroom tools were not registered')
    const concludeTurn = vi.fn()
    const deferContext = vi.fn()
    const exec = { concludeTurn, deferContext, signal: new AbortController().signal } as never

    await expect(capabilities.execute({}, exec)).resolves.toMatchObject({
      room: 'AI 聊天室',
      scope: 'room',
      actions: expect.arrayContaining(['send_message', 'send_file', 'react', 'reply', 'start_branch', 'invite_members']),
    })
    await action.execute({ action: 'invite_members', participantIds: [bob.participantId] }, exec)
    await action.execute({ action: 'react', messageId: 'user:9', emoji: '🎉' }, exec)
    await action.execute({ action: 'reply', messageId: 'user:9', text: '已经处理。' }, exec)
    await action.execute({ action: 'send_file', path: 'package.json', caption: '项目清单' }, exec)
    await action.execute({ action: 'send_message', text: '主动同步一条进展。' }, exec)
    await action.execute({ action: 'start_branch', messageId: 'user:9' }, exec)
    const assistantMessage = createAssistantMessage({
      content: [{ type: 'text', text: '可以撤回的正常 AI 消息' }],
      source: { provider: 'deepseek', model: 'chat' },
    })
    const assistantPayload = { turn: 3, step: 1, message: assistantMessage }
    Object.assign(harness.agents[0]!.session, {
      events: [
        { type: 'user/message', seq: 9, time: 1, data: payload },
        { type: 'assistant/message', seq: 10, time: 2, data: assistantPayload },
      ],
    })
    await action.execute({
      action: 'recall_message',
      messageId: String(assistantMessage.id),
    }, exec)

    expect(runtime.membersForRoom('lobby')).toContainEqual(expect.objectContaining({ participantId: bob.participantId }))
    expect([...(harness.tables.get('reactions')?.entries() ?? [])]).toContainEqual([
      expect.any(String), expect.objectContaining({ messageId: 'user:9', emoji: '🎉', participantId: 'ai' }),
    ])
    expect([...(harness.tables.get('recalls')?.entries() ?? [])]).toContainEqual([
      expect.any(String), expect.objectContaining({ messageId: String(assistantMessage.id), participantId: 'ai' }),
    ])
    const deferredTexts = deferContext.mock.calls.map(call => call[0]?.content[1]?.text as string)
    expect(deferredTexts.some(text => projectReplyText(text).reply?.messageId === 'user:9')).toBe(true)
    expect(deferredTexts.some(text => projectFileText(text).files.some(file => file.name === 'package.json'))).toBe(true)
    expect(deferredTexts).toContain('主动同步一条进展。')
    expect(harness.agents[0]?.session.append.mock.calls.filter(call => call[0] === 'assistant/message')).toEqual([])
    expect(harness.agents).toHaveLength(2)
    expect(deferContext).toHaveBeenCalledTimes(3)
    expect(concludeTurn).not.toHaveBeenCalled()
    await runtime.stop()
  })

  it('rebuilds an image branch root from its durable source event', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const alice = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const image = await sharp({ create: { width: 8, height: 6, channels: 3, background: '#336699' } }).png().toBuffer()
    await runtime.submit('lobby', alice, [{
      type: 'image', name: 'diagram.png', mediaType: 'image/png', data: image.toString('base64'),
    }], 'queue')
    const sourceMessage = harness.agents[0]?.session.append.mock.calls[0]?.[1]
    Object.assign(harness.agents[0]!.session, {
      events: [{ type: 'user/message', seq: 7, time: 123_456, data: sourceMessage }],
    })

    const opened = await runtime.openThread('lobby', alice, {
      messageId: 'user:7',
      sourceSessionId: 'chatroom-v1-lobby',
      sourceSeq: 7,
      role: 'human',
      displayName: '伪造昵称',
      text: '伪造内容',
    })

    expect(opened.thread.root).toMatchObject({ displayName: 'Alice', text: '图片消息' })
    const seed = harness.agents[1]?.session.append.mock.calls[0]?.[1]
    expect(seed?.content).toEqual([
      { type: 'text', text: '这是群聊分支的主题消息。Alice：' },
      { type: 'image', attachment: expect.objectContaining({ attachmentId: 'attachment-0', name: 'diagram.png' }) },
    ])
    await runtime.openThread('lobby', alice, opened.thread.root)
    expect(harness.agents[1]?.session.append).toHaveBeenCalledOnce()
    await runtime.stop()
  })

  it('backfills media once when reopening a pre-0.9.9 branch', async () => {
    const harness = fakeHarness()
    const alice = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const first = new ChatroomRuntime(harness.ctx, config())
    await first.start()
    const legacy = await first.openThread('lobby', alice, {
      messageId: 'user:7', role: 'human', displayName: 'Alice', text: '图片消息',
    })
    await first.stop()
    const threads = harness.tables.get('threads')
    const stored = threads?.get(legacy.thread.id) as Record<string, unknown> | undefined
    if (threads === undefined || stored === undefined) throw new Error('thread fixture missing')
    await threads.put(legacy.thread.id, { ...stored, rootContentVersion: undefined })

    const second = new ChatroomRuntime(harness.ctx, config())
    await second.start()
    Object.assign(harness.agents[2]!.session, {
      events: [{
        type: 'user/message', seq: 7, time: 123_456,
        data: {
          role: 'user',
          content: [
            { type: 'text', text: '\u2063dsh-chatroom:alice-id|whale\u2063Alice：' },
            {
              type: 'image',
              attachment: {
                attachmentId: 'attachment-legacy', mediaType: 'image/png', bytes: 100,
                width: 8, height: 6, name: 'legacy.png',
              },
            },
          ],
          source: { kind: 'user' },
        },
      }],
    })
    const root = {
      messageId: 'user:7', sourceSessionId: 'chatroom-v1-lobby', sourceSeq: 7,
      role: 'human' as const, displayName: 'Alice', text: '图片消息',
    }
    await second.openThread('lobby', alice, root)
    await second.openThread('lobby', alice, root)
    expect(harness.agents[3]?.session.append).toHaveBeenCalledOnce()
    expect(harness.agents[3]?.session.append.mock.calls[0]?.[1]?.content).toContainEqual({
      type: 'image', attachment: expect.objectContaining({ attachmentId: 'attachment-legacy' }),
    })
    await second.stop()
  })

  it('forwards selected messages as one native card without waking AI', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const target = await runtime.createRoom('项目二', identity)
    const items = [
      { messageId: 'user:1', role: 'human' as const, displayName: 'Bob', text: '方案 A', createdAt: 1 },
      { messageId: 'assistant:2', role: 'ai' as const, displayName: 'DeepSeek', text: '结论 B', createdAt: 2 },
    ]

    await expect(runtime.forwardMessages('lobby', target.id, items, identity)).resolves.toEqual({
      accepted: true, aiTriggered: false,
    })
    expect(harness.agents[1]?.followup).not.toHaveBeenCalled()
    const message = harness.agents[1]?.session.append.mock.calls
      .find(call => (call[1] as { content?: unknown } | undefined)?.content !== undefined)?.[1]
    const raw = message?.content.find((block: { type: string }) => block.type === 'text')?.text ?? ''
    const marker = participantMarker(raw)
    expect(marker?.participantId).toBe('alice-id')
    const visible = raw.slice(marker?.length ?? 0).replace(/^Alice：/u, '')
    expect(projectForwardText(visible)).toEqual({
      text: '',
      forward: { sourceRoomId: 'lobby', sourceRoomTitle: 'AI 聊天室', items },
    })
    await runtime.stop()
  })

  it('rebuilds a forward from the durable source event with media, quote, Markdown, and reactions', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const alice = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    const target = await runtime.createRoom('项目二', alice)
    const image = await sharp({ create: { width: 8, height: 6, channels: 3, background: '#336699' } }).png().toBuffer()
    await runtime.submit('lobby', alice, [
      { type: 'text', text: '**方案 A**' },
      { type: 'file', name: 'notes.txt', mediaType: 'text/plain', data: Buffer.from('hello').toString('base64') },
      { type: 'image', name: 'diagram.png', mediaType: 'image/png', data: image.toString('base64') },
    ], 'queue', { messageId: 'user:2', displayName: 'Bob', text: '请补充资料' })
    const sourceMessage = harness.agents[0]?.session.append.mock.calls[0]?.[1]
    Object.assign(harness.agents[0]!.session, {
      events: [{ type: 'user/message', seq: 7, time: 123_456, data: sourceMessage }],
    })
    await runtime.toggleReaction('lobby', 'user:7', '🎉', alice)

    await runtime.forwardMessages('lobby', target.id, [{
      messageId: 'user:7',
      sourceSessionId: 'chatroom-v1-lobby',
      sourceSeq: 7,
      role: 'human',
      displayName: '伪造昵称',
      text: '伪造内容',
      createdAt: 1,
    }], alice)

    const targetMessage = harness.agents[1]?.session.append.mock.calls
      .find(call => (call[1] as { content?: unknown } | undefined)?.content !== undefined)?.[1]
    const raw = targetMessage?.content.find((block: { type: string }) => block.type === 'text')?.text ?? ''
    const marker = participantMarker(raw)
    const visible = raw.slice(marker?.length ?? 0).replace(/^Alice：/u, '')
    const forwarded = projectForwardText(visible).forward
    expect(forwarded?.items[0]).toMatchObject({
      messageId: 'user:7',
      sourceSessionId: 'chatroom-v1-lobby',
      sourceSeq: 7,
      displayName: 'Alice',
      text: '**方案 A**',
      createdAt: 123_456,
      reply: { messageId: 'user:2', displayName: 'Bob', text: '请补充资料' },
      reactions: [{ emoji: '🎉', count: 1 }],
      content: [
        { type: 'text', text: '**方案 A**', markdown: false },
        { type: 'file', file: { name: 'notes.txt', mediaType: 'text/plain', bytes: 5 } },
        { type: 'image', image: { attachmentId: 'attachment-0', mediaType: 'image/png', name: 'diagram.png' } },
      ],
    })
    const imagePart = forwarded?.items[0]?.content?.find(part => part.type === 'image')
    if (imagePart?.type !== 'image') throw new Error('forwarded image missing')
    await expect(runtime.image('lobby', 'chatroom-v1-lobby', 7, imagePart.image)).resolves.toMatchObject({
      data: new Uint8Array([1, 2, 3]),
    })
    await expect(runtime.image('lobby', 'chatroom-v1-lobby', 7, {
      ...imagePart.image,
      attachmentId: 'another-attachment',
    })).rejects.toThrow('图片来源消息不存在')
    expect(harness.agents[1]?.followup).not.toHaveBeenCalled()
    await runtime.stop()
  })
})

function fakeHarness(): {
  ctx: Context
  agents: Array<Agent & {
    followup: ReturnType<typeof vi.fn>
    steer: ReturnType<typeof vi.fn>
    session: Agent['session'] & { append: ReturnType<typeof vi.fn> }
  }>
  attached: string[]
  savedImages: ReturnType<typeof vi.fn>
  tables: Map<string, MemoryTable<string, unknown>>
  llmStream: ReturnType<typeof vi.fn>
  promptSections: Array<{ name: string; order: number; text: string | (() => string) }>
  registeredTools: ToolDefinition[]
  makeAgentContext(): Context
} {
  const tables = new Map<string, MemoryTable<string, unknown>>()
  const agents: Array<Agent & {
    followup: ReturnType<typeof vi.fn>
    steer: ReturnType<typeof vi.fn>
    session: Agent['session'] & { append: ReturnType<typeof vi.fn> }
  }> = []
  const attached: string[] = []
  const promptSections: Array<{ name: string; order: number; text: string | (() => string) }> = []
  const registeredTools: ToolDefinition[] = []
  const makeAgentContext = (): Context => ({
    tools: {
      register: vi.fn((definition: ToolDefinition) => {
        registeredTools.push(definition)
        return () => undefined
      }),
    },
    systemPrompt: {
      section: vi.fn((section: { name: string; order: number; text: string | (() => string) }) => {
        promptSections.push(section)
        return () => undefined
      }),
    },
  }) as unknown as Context
  const savedImages = vi.fn(async (inputs: Array<{ data: Uint8Array; mediaType: string; name?: string }>) =>
    inputs.map((input, index) => ({
      attachmentId: `attachment-${index}`,
      mediaType: input.mediaType,
      bytes: input.data.byteLength,
      width: 1,
      height: 1,
      ...(input.name === undefined ? {} : { name: input.name }),
    })))
  const llmStream = vi.fn(async function* () {
    yield { type: 'text-delta', index: 0, text: '{"wake":false}' }
    yield { type: 'finish', reason: { kind: 'stop' } }
  })
  const ctx = {
    logger: vi.fn(() => ({ warn: vi.fn(), info: vi.fn() })),
    storageDomain: {
      open: vi.fn(async () => ({
        table: (name: string) => {
          let table = tables.get(name)
          if (table === undefined) {
            table = new MemoryTable()
            tables.set(name, table)
          }
          return table
        },
        close: vi.fn(async () => undefined),
      })),
    },
    agents: {
      get: vi.fn(() => undefined),
      create: vi.fn(async ({ sessionId, setup }: { sessionId: string; setup?: (ctx: Context) => Promise<void> }) => {
        const agentCtx = makeAgentContext()
        await setup?.(agentCtx)
        const agent = {
          id: sessionId,
          options: { provider: 'deepseek', model: 'chat' },
          session: { id: sessionId, events: [], append: vi.fn() },
          ctx: agentCtx,
          followup: vi.fn(),
          steer: vi.fn(),
          cancel: vi.fn(),
          whenIdle: vi.fn(async () => undefined),
        } as unknown as (typeof agents)[number]
        agents.push(agent)
        return { agent, dispose: vi.fn(async () => undefined) }
      }),
    },
    sessionPersistence: { list: vi.fn(async () => []) },
    sessionTitle: {
      get: vi.fn(() => undefined),
      rename: vi.fn((_session: unknown, title: string) => ({ title, messageSeqs: [], source: { kind: 'user' } })),
    },
    agentDefaultModel: { currentSelection: vi.fn(() => ({ provider: 'deepseek', model: 'chat' })) },
    agentPresets: { mount: vi.fn(async () => undefined) },
    workspaceRegistry: {
      resolveByPath: vi.fn(async () => ({
        attachSession: vi.fn(async (sessionId: string) => { attached.push(String(sessionId)) }),
      })),
      create: vi.fn(),
    },
    attachments: {
      imageLimits: {
        maxImageBytes: 1_000_000,
        maxImagesPerMessage: 4,
        maxMessageImageBytes: 4_000_000,
        maxImagePixels: 10_000_000,
        mediaTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      },
      saveImages: savedImages,
      readImage: vi.fn(async (ref) => ({ ref, data: new Uint8Array([1, 2, 3]) })),
    },
    llm: {
      resolveModelInfo: vi.fn(async () => ({
        inputModalities: ['text', 'image'],
        reasoning: { efforts: [{ id: 'off', name: 'Off' }], defaultEffort: 'off' },
      })),
      stream: llmStream,
      listProviders: vi.fn(() => [{ id: 'deepseek', name: 'DeepSeek' }]),
      listModels: vi.fn(async () => [{ id: 'chat', name: 'Chat' }]),
    },
  } as unknown as Context
  return { ctx, agents, attached, savedImages, tables, llmStream, promptSections, registeredTools, makeAgentContext }
}

function promptSectionText(section: { text: string | (() => string) }): string {
  return typeof section.text === 'string' ? section.text : section.text()
}

class MemoryTable<K extends string, V> implements KvTable<K, V> {
  private readonly records = new Map<K, V>()

  get size(): number { return this.records.size }
  get(key: K): V | undefined { return this.records.get(key) }
  entries(): IterableIterator<[K, V]> { return new Map(this.records).entries() }
  keys(): IterableIterator<K> { return new Map(this.records).keys() }
  async put(key: K, value: V): Promise<void> { this.records.set(key, value) }
  async delete(key: K): Promise<boolean> { return this.records.delete(key) }
  async update(key: K, fn: (current: V) => V): Promise<V> {
    const current = this.records.get(key)
    if (current === undefined) throw new Error('missing key')
    const next = fn(current)
    this.records.set(key, next)
    return next
  }
}

function config(): Config {
  return {
    roomId: 'lobby',
    roomTitle: 'AI 聊天室',
    aiDisplayName: 'DeepSeek',
    sessionId: 'chatroom-v1-lobby',
    cwd: '/workspace',
    agentPreset: 'standard',
    cookieName: 'dsh_chatroom_session',
    cookieMaxAgeSeconds: 31_536_000,
    maxDisplayNameChars: 24,
    maxRoomTitleChars: 80,
    maxMessageTextChars: 20_000,
    maxFileBytes: 20 * 1024 * 1024,
    maxFilesPerMessage: 5,
    maxMessageFileBytes: 50 * 1024 * 1024,
    maxImageSidePixels: 4_096,
    settingsAdminParticipantIds: [],
    maxSettingsRequestBytes: 1024 * 1024,
    sseHeartbeatMs: 15_000,
    authEnabled: false,
    authCookieName: 'dsh_chatroom_auth',
    authSessionMaxAgeSeconds: 2_592_000,
    authSecret: '',
    authPublicOrigin: '',
    authBootstrapToken: '',
    authAllowSelfRegistration: true,
    authDshAuthHeaders: false,
    authDshAuthVerifyUrl: '',
    authDshAuthLoginPath: '/auth/login',
    wecomEnabled: true,
    wecomCliPath: '',
    wecomCliConfigDirectory: '',
    wecomCliTimeoutMs: 30_000,
    wecomQuickMeetingDurationMinutes: 60,
    wecomQuickMeetingSubject: '快速会议',
    wecomTimeZone: 'Asia/Shanghai',
    dataDirectory: ':memory:',
  }
}
