import { createHash, randomBytes, randomUUID } from 'node:crypto'
import type { ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-agent-default-model'
import { resolveSessionPreset } from '@deepseek-ai/dsh-agent-presets'
import { SessionId } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-session-persistence'
import type { Domain, KvTable } from '@deepseek-ai/dsh-storage-domain'
import type {} from '@deepseek-ai/dsh-workspace'
import type { Config } from './config.js'
import { chatroomDomainSpec, type IdentityRecord } from './domain.js'
import type {
  ChatroomIdentity, ChatroomInfo, ChatroomServerEvent, ChatroomSnapshotEvent,
} from './types.js'

interface AgentBinding {
  readonly agent: Agent
  release(): Promise<void>
}

interface SseClient {
  readonly participantId: string
  readonly response: ServerResponse
}

/** Runtime validation failure safe to return to a browser. */
export class ChatroomInputError extends Error {}

/** Shared browser identities, presence, and the persistent native Harness Session. */
export class ChatroomRuntime {
  private domain: Domain<typeof chatroomDomainSpec> | undefined
  private identities: KvTable<string, IdentityRecord> | undefined
  private binding: AgentBinding | undefined
  private ready = false
  private stopping = false
  private readonly clients = new Set<SseClient>()

  constructor(
    private readonly ctx: Context,
    readonly config: Config,
  ) {}

  /** Public metadata for this configured room. */
  get room(): ChatroomInfo {
    return {
      id: this.config.roomId,
      title: this.config.roomTitle,
      aiDisplayName: this.config.aiDisplayName,
      sessionId: this.config.sessionId,
    }
  }

  /** Whether identity persistence and the shared Session are ready. */
  get isReady(): boolean {
    return this.ready && !this.stopping
  }

  /** Open identity storage and acquire the shared Session without blocking Harness startup. */
  async start(): Promise<void> {
    const domain = await this.ctx.storageDomain.open(chatroomDomainSpec)
    this.domain = domain
    this.identities = domain.table('identities')
    this.binding = await this.acquireAgent()
    await this.attachWorkspace()
    this.ready = true
  }

  /** Stop intake, close presence streams, and release owned resources. */
  async stop(): Promise<void> {
    if (this.stopping) return
    this.stopping = true
    this.ready = false
    for (const client of this.clients) client.response.end()
    this.clients.clear()
    await this.binding?.release()
    this.binding = undefined
    await this.domain?.close()
    this.domain = undefined
  }

  /** Resolve an opaque cookie token to its durable identity. */
  identity(token: string | undefined): ChatroomIdentity | undefined {
    if (!this.isReady || token === undefined) return undefined
    const record = this.requireIdentities().get(tokenHash(token))
    return record === undefined ? undefined : publicIdentity(record)
  }

  /** Mint and durably bind a new browser identity. */
  async createIdentity(displayName: string): Promise<{ token: string; identity: ChatroomIdentity }> {
    this.assertReady()
    const normalized = normalizeDisplayName(displayName, this.config.maxDisplayNameChars)
    const token = randomBytes(32).toString('base64url')
    const now = Date.now()
    const record: IdentityRecord = {
      participantId: randomUUID(),
      displayName: normalized,
      createdAt: now,
      lastSeenAt: now,
    }
    await this.requireIdentities().put(tokenHash(token), record)
    return { token, identity: publicIdentity(record) }
  }

  /** Revoke one browser identity token. */
  async deleteIdentity(token: string | undefined): Promise<void> {
    this.assertReady()
    if (token !== undefined) await this.requireIdentities().delete(tokenHash(token))
  }

  /** Attach one authenticated presence client and send the current room baseline. */
  subscribe(identity: ChatroomIdentity, response: ServerResponse): () => void {
    this.assertReady()
    const client: SseClient = { participantId: identity.participantId, response }
    this.clients.add(client)
    const snapshot: ChatroomSnapshotEvent = {
      type: 'snapshot',
      room: this.room,
      identity,
      online: this.onlineCount(),
    }
    writeSse(response, snapshot)
    this.broadcastPresence()
    let disposed = false
    return () => {
      if (disposed) return
      disposed = true
      this.clients.delete(client)
      this.broadcastPresence()
    }
  }

  private async acquireAgent(): Promise<AgentBinding> {
    const id = SessionId(this.config.sessionId)
    const live = this.ctx.agents.get(id)
    if (live !== undefined) return borrowAgent(live)
    const persisted = (await this.ctx.sessionPersistence.list()).some(header => header.id === id)
    const model = this.ctx.agentDefaultModel.currentSelection()
    const agentOptions = { provider: model.provider, model: model.model }
    if (persisted) {
      const inspected = await this.ctx.sessionPersistence.inspect(id)
      const agentPreset = resolveSessionPreset({ header: inspected.meta, events: inspected.events })
        ?? this.config.agentPreset
      try {
        return ownAgent(await this.ctx.agents.resume({
          resumeSessionId: id,
          agentOptions,
          setup: async (agentCtx) => { await this.ctx.agentPresets.mount(agentCtx, agentPreset) },
        }))
      } catch (error) {
        const raced = this.ctx.agents.get(id)
        if (raced !== undefined) return borrowAgent(raced)
        throw error
      }
    }
    try {
      return ownAgent(await this.ctx.agents.create({
        sessionId: id,
        meta: { cwd: this.config.cwd, agentPreset: this.config.agentPreset },
        agentOptions,
        setup: async (agentCtx) => { await this.ctx.agentPresets.mount(agentCtx, this.config.agentPreset) },
      }))
    } catch (error) {
      const raced = this.ctx.agents.get(id)
      if (raced !== undefined) return borrowAgent(raced)
      throw error
    }
  }

  /** Ensure the shared Session uses the same native Workspace navigation as ordinary conversations. */
  private async attachWorkspace(): Promise<void> {
    const workspace = await this.ctx.workspaceRegistry.resolveByPath(this.config.cwd)
      ?? await this.ctx.workspaceRegistry.create(this.config.cwd)
    await workspace.attachSession(SessionId(this.config.sessionId))
  }

  private onlineCount(): number {
    return new Set([...this.clients].map(client => client.participantId)).size
  }

  private broadcast(event: ChatroomServerEvent): void {
    for (const client of [...this.clients]) {
      if (!writeSse(client.response, event)) this.clients.delete(client)
    }
  }

  private broadcastPresence(): void {
    this.broadcast({ type: 'presence', online: this.onlineCount() })
  }

  private assertReady(): void {
    if (!this.isReady) throw new Error('chatroom is not ready')
  }

  private requireIdentities(): KvTable<string, IdentityRecord> {
    if (this.identities === undefined) throw new Error('chatroom identity storage is unavailable')
    return this.identities
  }
}

function ownAgent(handle: AgentHandle): AgentBinding {
  return { agent: handle.agent, release: () => handle.dispose() }
}

function borrowAgent(agent: Agent): AgentBinding {
  return { agent, release: async () => undefined }
}

function publicIdentity(record: IdentityRecord): ChatroomIdentity {
  return { participantId: record.participantId, displayName: record.displayName }
}

function normalizeDisplayName(value: string, maxChars: number): string {
  const normalized = value.trim().replace(/\s+/gu, ' ')
  if (normalized === '') throw new ChatroomInputError('请输入身份名称。')
  if ([...normalized].length > maxChars) throw new ChatroomInputError(`身份名称不能超过 ${maxChars} 个字符。`)
  if (/\p{Cc}/u.test(normalized)) throw new ChatroomInputError('身份名称不能包含控制字符。')
  return normalized
}

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function writeSse(response: ServerResponse, event: ChatroomServerEvent): boolean {
  if (response.destroyed || response.writableEnded) return false
  try {
    response.write(`data: ${JSON.stringify(event)}\n\n`)
    return true
  } catch {
    return false
  }
}
