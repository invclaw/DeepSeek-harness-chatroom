import { createHash, randomBytes, randomUUID } from 'node:crypto'
import type { ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-agent-default-model'
import { resolveSessionPreset } from '@deepseek-ai/dsh-agent-presets'
import { AttachmentError, type ImageMediaType } from '@deepseek-ai/dsh-attachment'
import { createUserMessage, type ContentBlock } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-session-persistence'
import type { Domain, KvTable } from '@deepseek-ai/dsh-storage-domain'
import type {} from '@deepseek-ai/dsh-workspace'
import type { Config } from './config.js'
import { chatroomDomainSpec, type IdentityRecord, type RoomRecord } from './domain.js'
import { identifyPrompt, mentionsAi } from './message.js'
import type {
  ChatroomIdentity,
  ChatroomInfo,
  ChatroomPromptContentPart,
  ChatroomPromptResponse,
  ChatroomServerEvent,
  ChatroomSnapshotEvent,
} from './types.js'

interface AgentBinding {
  readonly agent: Agent
  release(): Promise<void>
}

interface SseClient {
  readonly participantId: string
  readonly response: ServerResponse
}

interface RoomState {
  readonly record: RoomRecord
  readonly clients: Set<SseClient>
  binding: AgentBinding | undefined
  activation: Promise<AgentBinding> | undefined
  admission: Promise<void>
}

/** Runtime validation failure safe to return to a browser. */
export class ChatroomInputError extends Error {}

/** Shared browser identities, room directory, presence, and native Harness Sessions. */
export class ChatroomRuntime {
  private domain: Domain<typeof chatroomDomainSpec> | undefined
  private identities: KvTable<string, IdentityRecord> | undefined
  private roomRecords: KvTable<string, RoomRecord> | undefined
  private readonly states = new Map<string, RoomState>()
  private ready = false
  private stopping = false

  constructor(
    private readonly ctx: Context,
    readonly config: Config,
  ) {}

  /** Public metadata for the configured legacy room. */
  get room(): ChatroomInfo {
    return this.requireRoom(this.config.roomId)
  }

  /** Ordered public room directory. */
  get rooms(): readonly ChatroomInfo[] {
    const records = [...this.states.values()].map(state => state.record)
    records.sort((left, right) => {
      if (left.id === this.config.roomId) return -1
      if (right.id === this.config.roomId) return 1
      return left.createdAt - right.createdAt || left.id.localeCompare(right.id)
    })
    return records.map(publicRoom)
  }

  /** Maximum accepted JSON body for one text-and-image room submission. */
  get maxPromptRequestBytes(): number {
    const { maxImagesPerMessage, maxMessageImageBytes } = this.ctx.attachments.imageLimits
    const encodedImages = Math.ceil(maxMessageImageBytes / 3) * 4
    return encodedImages + this.config.maxMessageTextChars * 4 + maxImagesPerMessage * 2_048 + 8_192
  }

  /** Whether identity persistence and the configured shared Session are ready. */
  get isReady(): boolean {
    return this.ready && !this.stopping
  }

  /** Open storage, seed the original room, and acquire its Session without blocking Harness startup. */
  async start(): Promise<void> {
    const domain = await this.ctx.storageDomain.open(chatroomDomainSpec)
    this.domain = domain
    this.identities = domain.table('identities')
    this.roomRecords = domain.table('rooms')
    await this.seedConfiguredRoom()
    for (const [, record] of this.requireRoomRecords().entries()) {
      this.states.set(record.id, newRoomState(record))
    }
    await this.ensureRoom(this.config.roomId)
    this.ready = true
  }

  /** Stop intake, close presence streams, and release every activated room. */
  async stop(): Promise<void> {
    if (this.stopping) return
    this.stopping = true
    this.ready = false
    for (const state of this.states.values()) {
      for (const client of state.clients) client.response.end()
      state.clients.clear()
    }
    await Promise.allSettled([...this.states.values()].map(async (state) => {
      await state.admission
      await state.activation?.catch(() => undefined)
      await state.binding?.release()
      state.binding = undefined
    }))
    this.states.clear()
    await this.domain?.close()
    this.domain = undefined
    this.identities = undefined
    this.roomRecords = undefined
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

  /** Create and activate one independent shared Harness Session. */
  async createRoom(title: string, identity: ChatroomIdentity): Promise<ChatroomInfo> {
    this.assertReady()
    const id = randomUUID()
    const record: RoomRecord = {
      id,
      title: normalizeRoomTitle(title, this.config.maxRoomTitleChars),
      aiDisplayName: this.config.aiDisplayName,
      sessionId: `chatroom-v1-${id}`,
      createdAt: Date.now(),
      createdBy: identity.participantId,
    }
    await this.requireRoomRecords().put(id, record)
    const state = newRoomState(record)
    this.states.set(id, state)
    try {
      await this.ensureRoom(id)
      return publicRoom(record)
    } catch (error) {
      this.states.delete(id)
      await this.requireRoomRecords().delete(id)
      throw error
    }
  }

  /** Activate an existing room and return its public metadata. */
  async selectRoom(roomId: string): Promise<ChatroomInfo> {
    this.assertReady()
    await this.ensureRoom(roomId)
    return this.requireRoom(roomId)
  }

  /** Append human chat immediately; wake the Agent only for an explicit AI mention. */
  async submit(
    roomId: string,
    identity: ChatroomIdentity,
    content: readonly ChatroomPromptContentPart[],
    mode: 'queue' | 'steer',
  ): Promise<ChatroomPromptResponse> {
    this.assertReady()
    const state = this.requireState(roomId)
    const task = state.admission.then(async () => {
      const binding = await this.ensureRoom(roomId)
      const aiTriggered = mentionsAi(content, state.record.aiDisplayName)
      const { provider, model: modelId } = binding.agent.options
      if (aiTriggered && provider !== undefined && modelId !== undefined && content.some(part => part.type === 'image')) {
        const model = await this.ctx.llm.resolveModelInfo(provider, modelId)
        if (model.inputModalities !== undefined && !model.inputModalities.includes('image')) {
          throw new ChatroomInputError(`模型 ${JSON.stringify(modelId)} 不支持图片输入。`)
        }
      }
      const durable = await this.durableContent(identifyPrompt(content, identity))
      const message = createUserMessage({ content: durable, source: { kind: 'user' } })
      if (!aiTriggered) {
        binding.agent.session.append('user/message', message, { surfaceOp: 'append' })
      } else if (mode === 'steer') {
        binding.agent.steer(message)
      } else {
        binding.agent.followup(message)
      }
      return { accepted: true as const, aiTriggered }
    })
    state.admission = task.then(() => undefined, () => undefined)
    return await task
  }

  /** Attach one authenticated presence client to one room. */
  subscribe(roomId: string, identity: ChatroomIdentity, response: ServerResponse): () => void {
    this.assertReady()
    const state = this.requireState(roomId)
    if (state.binding === undefined) throw new Error(`chatroom room ${JSON.stringify(roomId)} is not active`)
    const client: SseClient = { participantId: identity.participantId, response }
    state.clients.add(client)
    const snapshot: ChatroomSnapshotEvent = {
      type: 'snapshot',
      room: publicRoom(state.record),
      identity,
      online: onlineCount(state),
    }
    writeSse(response, snapshot)
    this.broadcastPresence(state)
    let disposed = false
    return () => {
      if (disposed) return
      disposed = true
      state.clients.delete(client)
      this.broadcastPresence(state)
    }
  }

  private async seedConfiguredRoom(): Promise<void> {
    const records = this.requireRoomRecords()
    const existing = records.get(this.config.roomId)
    const configured: RoomRecord = {
      id: this.config.roomId,
      title: this.config.roomTitle,
      aiDisplayName: this.config.aiDisplayName,
      sessionId: this.config.sessionId,
      createdAt: existing?.createdAt ?? Date.now(),
      createdBy: existing?.createdBy ?? 'system',
    }
    if (existing === undefined
      || existing.title !== configured.title
      || existing.aiDisplayName !== configured.aiDisplayName
      || existing.sessionId !== configured.sessionId) {
      await records.put(configured.id, configured)
    }
  }

  private async ensureRoom(roomId: string): Promise<AgentBinding> {
    const state = this.requireState(roomId)
    if (state.binding !== undefined) return state.binding
    state.activation ??= this.activateRoom(state).then((binding) => {
      state.binding = binding
      return binding
    }).finally(() => {
      state.activation = undefined
    })
    return await state.activation
  }

  private async activateRoom(state: RoomState): Promise<AgentBinding> {
    const binding = await this.acquireAgent(state.record.sessionId)
    try {
      await this.attachWorkspace(state.record.sessionId)
      return binding
    } catch (error) {
      await binding.release()
      throw error
    }
  }

  private async acquireAgent(sessionId: string): Promise<AgentBinding> {
    const id = SessionId(sessionId)
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

  /** Ensure one shared Session uses native Workspace navigation. */
  private async attachWorkspace(sessionId: string): Promise<void> {
    const workspace = await this.ctx.workspaceRegistry.resolveByPath(this.config.cwd)
      ?? await this.ctx.workspaceRegistry.create(this.config.cwd)
    await workspace.attachSession(SessionId(sessionId))
  }

  private async durableContent(content: readonly ChatroomPromptContentPart[]): Promise<ContentBlock[]> {
    const prepared = content.map(part => part.type === 'text'
      ? part
      : { part, data: decodeBase64(part.data) })
    const images = prepared.filter((part): part is Extract<typeof part, { data: Uint8Array }> => 'data' in part)
    const mediaTypes = this.ctx.attachments.imageLimits.mediaTypes
    for (const image of images) {
      if (!mediaTypes.includes(image.part.mediaType)) {
        throw new ChatroomInputError(`不支持图片格式 ${image.part.mediaType}。`)
      }
    }
    let refs: Awaited<ReturnType<typeof this.ctx.attachments.saveImages>> = []
    try {
      refs = await this.ctx.attachments.saveImages(images.map(image => ({
        data: image.data,
        mediaType: image.part.mediaType as ImageMediaType,
        ...(image.part.name === undefined ? {} : { name: image.part.name }),
      })))
    } catch (error) {
      if (error instanceof AttachmentError) throw new ChatroomInputError(`图片无法发送：${error.message}`)
      throw error
    }
    const blocks: ContentBlock[] = []
    let imageIndex = 0
    for (const item of prepared) {
      if (!('data' in item)) {
        blocks.push({ type: 'text', text: item.text })
        continue
      }
      const attachment = refs[imageIndex++]
      if (attachment === undefined) throw new Error('chatroom attachment batch lost an image reference')
      blocks.push({ type: 'image', attachment })
    }
    return blocks
  }

  private broadcastPresence(state: RoomState): void {
    this.broadcast(state, { type: 'presence', online: onlineCount(state) })
  }

  private broadcast(state: RoomState, event: ChatroomServerEvent): void {
    for (const client of [...state.clients]) {
      if (!writeSse(client.response, event)) state.clients.delete(client)
    }
  }

  private assertReady(): void {
    if (!this.isReady) throw new Error('chatroom is not ready')
  }

  private requireRoom(roomId: string): ChatroomInfo {
    return publicRoom(this.requireState(roomId).record)
  }

  private requireState(roomId: string): RoomState {
    const state = this.states.get(roomId)
    if (state === undefined) throw new ChatroomInputError('共享会话不存在。')
    return state
  }

  private requireIdentities(): KvTable<string, IdentityRecord> {
    if (this.identities === undefined) throw new Error('chatroom identity storage is unavailable')
    return this.identities
  }

  private requireRoomRecords(): KvTable<string, RoomRecord> {
    if (this.roomRecords === undefined) throw new Error('chatroom room storage is unavailable')
    return this.roomRecords
  }
}

function newRoomState(record: RoomRecord): RoomState {
  return {
    record,
    clients: new Set(),
    binding: undefined,
    activation: undefined,
    admission: Promise.resolve(),
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

function publicRoom(record: RoomRecord): ChatroomInfo {
  return {
    id: record.id,
    title: record.title,
    aiDisplayName: record.aiDisplayName,
    sessionId: record.sessionId,
  }
}

function normalizeDisplayName(value: string, maxChars: number): string {
  const normalized = value.trim().replace(/\s+/gu, ' ')
  if (normalized === '') throw new ChatroomInputError('请输入身份名称。')
  if ([...normalized].length > maxChars) throw new ChatroomInputError(`身份名称不能超过 ${maxChars} 个字符。`)
  if (/\p{Cc}/u.test(normalized)) throw new ChatroomInputError('身份名称不能包含控制字符。')
  return normalized
}

function normalizeRoomTitle(value: string, maxChars: number): string {
  const normalized = value.trim().replace(/\s+/gu, ' ')
  if (normalized === '') throw new ChatroomInputError('请输入共享会话名称。')
  if ([...normalized].length > maxChars) throw new ChatroomInputError(`共享会话名称不能超过 ${maxChars} 个字符。`)
  if (/\p{Cc}/u.test(normalized)) throw new ChatroomInputError('共享会话名称不能包含控制字符。')
  return normalized
}

function decodeBase64(data: string): Uint8Array {
  const decoded = Buffer.from(data, 'base64')
  if (data.length === 0 || decoded.toString('base64') !== data) {
    throw new ChatroomInputError('图片数据不是有效的 base64。')
  }
  return new Uint8Array(decoded)
}

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function onlineCount(state: RoomState): number {
  return new Set([...state.clients].map(client => client.participantId)).size
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
