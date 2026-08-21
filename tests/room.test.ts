import { describe, expect, it, vi } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import type { Config } from '../src/config.js'
import { ChatroomRuntime } from '../src/room.js'

describe('ChatroomRuntime', () => {
  it('appends human chat without waking AI and wakes only on explicit mention', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()
    const identity = { participantId: 'alice-id', displayName: 'Alice' }

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
      text: '\u2063dsh-chatroom:alice-id\u2063Alice：@AI 请总结',
    })

    await runtime.stop()
  })

  it('creates an independent persisted room and native Session', async () => {
    const harness = fakeHarness()
    const runtime = new ChatroomRuntime(harness.ctx, config())
    await runtime.start()

    const room = await runtime.createRoom('项目二', { participantId: 'alice-id', displayName: 'Alice' })

    expect(room.title).toBe('项目二')
    expect(room.sessionId).toBe(`chatroom-v1-${room.id}`)
    expect(runtime.rooms).toHaveLength(2)
    expect(harness.agents).toHaveLength(2)
    expect(harness.attached).toEqual(['chatroom-v1-lobby', room.sessionId])
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
} {
  const tables = new Map<string, MemoryTable<string, unknown>>()
  const agents: Array<Agent & {
    followup: ReturnType<typeof vi.fn>
    steer: ReturnType<typeof vi.fn>
    session: Agent['session'] & { append: ReturnType<typeof vi.fn> }
  }> = []
  const attached: string[] = []
  const ctx = {
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
          session: { append: vi.fn() },
          followup: vi.fn(),
          steer: vi.fn(),
        } as unknown as (typeof agents)[number]
        agents.push(agent)
        return { agent, dispose: vi.fn(async () => undefined) }
      }),
    },
    sessionPersistence: { list: vi.fn(async () => []) },
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
      saveImages: vi.fn(async () => []),
    },
    llm: { resolveModelInfo: vi.fn(async () => ({ inputModalities: ['text', 'image'] })) },
  } as unknown as Context
  return { ctx, agents, attached }
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
    sseHeartbeatMs: 15_000,
  }
}
