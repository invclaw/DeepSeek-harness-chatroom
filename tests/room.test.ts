import { describe, expect, it, vi } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import sharp from 'sharp'
import type { Config } from '../src/config.js'
import { ChatroomRuntime } from '../src/room.js'
import { participantMarker, projectFileText, projectForwardText } from '../src/message.js'

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
    await runtime.stop()
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
} {
  const tables = new Map<string, MemoryTable<string, unknown>>()
  const agents: Array<Agent & {
    followup: ReturnType<typeof vi.fn>
    steer: ReturnType<typeof vi.fn>
    session: Agent['session'] & { append: ReturnType<typeof vi.fn> }
  }> = []
  const attached: string[] = []
  const savedImages = vi.fn(async (inputs: Array<{ data: Uint8Array; mediaType: string; name?: string }>) =>
    inputs.map((input, index) => ({
      attachmentId: `attachment-${index}`,
      mediaType: input.mediaType,
      bytes: input.data.byteLength,
      width: 1,
      height: 1,
      ...(input.name === undefined ? {} : { name: input.name }),
    })))
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
      create: vi.fn(async ({ sessionId }: { sessionId: string }) => {
        const agent = {
          id: sessionId,
          options: { provider: 'deepseek', model: 'chat' },
          session: { events: [], append: vi.fn() },
          followup: vi.fn(),
          steer: vi.fn(),
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
    },
    llm: { resolveModelInfo: vi.fn(async () => ({ inputModalities: ['text', 'image'] })) },
  } as unknown as Context
  return { ctx, agents, attached, savedImages }
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
  }
}
