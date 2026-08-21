import { createHash, randomBytes, randomUUID } from 'node:crypto'
import type { ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-agent-default-model'
import { resolveSessionPreset } from '@deepseek-ai/dsh-agent-presets'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionId, type SessionEvent } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-session-persistence'
import type { Domain, KvTable } from '@deepseek-ai/dsh-storage-domain'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type { Config } from './config.js'
import { chatroomDomainSpec, type IdentityRecord, type MessageRecord } from './domain.js'
import type {
  ChatroomIdentity, ChatroomInfo, ChatroomMessage, ChatroomServerEvent, ChatroomSnapshotEvent,
} from './types.js'

/** Durable source metadata identifying one human room message in model history. */
export interface ChatroomMessageSource {
  readonly kind: 'chatroom'
  readonly roomId: string
  readonly roomMessageId: string
  readonly participantId: string
  readonly displayName: string
}

declare module '@deepseek-ai/dsh-llm' {
  interface MessageSourceMap {
    chatroom: ChatroomMessageSource
  }
}

interface AgentBinding {
  readonly agent: Agent
  release(): Promise<void>
}

interface SseClient {
  readonly participantId: string
  readonly response: ServerResponse
}

interface CompletedRoomTurn {
  readonly roomMessageId: string
  readonly reply?: { readonly id: string; readonly text: string; readonly createdAt: number }
}

const swallow = (): void => undefined

/** Runtime validation failure safe to return to a browser. */
export class ChatroomInputError extends Error {}

/** One durable shared room, its browser identities, and its single AI Agent. */
export class ChatroomRuntime {
  private domain: Domain<typeof chatroomDomainSpec> | undefined
  private identities: KvTable<string, IdentityRecord> | undefined
  private messages: KvTable<string, MessageRecord> | undefined
  private binding: AgentBinding | undefined
  private nextSequence = 1
  private ready = false
  private stopping = false
  private readonly clients = new Set<SseClient>()
  private writeTail: Promise<void> = Promise.resolve()
  private aiTail: Promise<void> = Promise.resolve()
  private readonly retryTimers = new Set<ReturnType<typeof setTimeout>>()
  private createdFreshAgent = false

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
    }
  }

  /** Whether persistence and the room Agent are ready to accept requests. */
  get isReady(): boolean {
    return this.ready && !this.stopping
  }

  /** Open durable identity/message storage, acquire the room Agent, and replay unfinished AI work. */
  async start(): Promise<void> {
    const domain = await this.ctx.storageDomain.open(chatroomDomainSpec)
    this.domain = domain
    this.identities = domain.table('identities')
    this.messages = domain.table('messages')
    this.nextSequence = 1 + Math.max(0, ...[...this.messages.entries()].map(([, item]) => item.sequence))
    this.binding = await this.acquireAgent()
    await this.reconcileCompletedTurns()
    if (this.createdFreshAgent) this.injectRecoveredTranscript()
    this.ready = true
    for (const record of this.sortedRecords()) {
      if (record.role === 'human' && record.aiProcessed !== true) this.enqueueAi(record)
    }
  }

  /** Stop intake, close SSE clients, drain writes and Agent work, then release owned resources. */
  async stop(): Promise<void> {
    if (this.stopping) return
    this.stopping = true
    this.ready = false
    for (const timer of this.retryTimers) clearTimeout(timer)
    this.retryTimers.clear()
    for (const client of this.clients) client.response.end()
    this.clients.clear()
    await Promise.allSettled([this.writeTail, this.aiTail])
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

  /** Persist and broadcast one human message, then schedule its independent AI decision. */
  async send(identity: ChatroomIdentity, text: string): Promise<ChatroomMessage> {
    this.assertReady()
    const normalized = normalizeMessage(text, this.config.maxMessageChars)
    const record = await this.commitMessage({
      id: randomUUID(),
      role: 'human',
      participantId: identity.participantId,
      displayName: identity.displayName,
      text: normalized,
      createdAt: Date.now(),
      aiProcessed: false,
    })
    const message = publicMessage(record)
    this.broadcast({ type: 'message', message })
    this.enqueueAi(record)
    return message
  }

  /** Attach one authenticated SSE client and immediately deliver an authoritative snapshot. */
  subscribe(identity: ChatroomIdentity, response: ServerResponse): () => void {
    this.assertReady()
    const client: SseClient = { participantId: identity.participantId, response }
    this.clients.add(client)
    const snapshot: ChatroomSnapshotEvent = {
      type: 'snapshot',
      room: this.room,
      identity,
      messages: this.sortedRecords().map(publicMessage),
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

  /** Current persisted public room transcript. */
  history(): readonly ChatroomMessage[] {
    this.assertReady()
    return this.sortedRecords().map(publicMessage)
  }

  private async acquireAgent(): Promise<AgentBinding> {
    const id = SessionId(this.config.sessionId)
    const live = this.ctx.agents.get(id)
    if (live !== undefined) return this.borrowAgent(live)
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
          setup: agentCtx => this.setupAgent(agentCtx, agentPreset),
        }))
      } catch (error) {
        const raced = this.ctx.agents.get(id)
        if (raced !== undefined) return this.borrowAgent(raced)
        throw error
      }
    }
    this.createdFreshAgent = true
    try {
      return ownAgent(await this.ctx.agents.create({
        sessionId: id,
        meta: { cwd: this.config.cwd, agentPreset: this.config.agentPreset },
        agentOptions,
        setup: agentCtx => this.setupAgent(agentCtx, this.config.agentPreset),
      }))
    } catch (error) {
      const raced = this.ctx.agents.get(id)
      if (raced !== undefined) {
        this.createdFreshAgent = false
        return this.borrowAgent(raced)
      }
      throw error
    }
  }

  private async setupAgent(agentCtx: Context, preset: string): Promise<void> {
    await this.ctx.agentPresets.mount(agentCtx, preset)
    this.registerPrompt(agentCtx)
  }

  private borrowAgent(agent: Agent): AgentBinding {
    const disposePrompt = this.registerPrompt(agent.ctx)
    return {
      agent,
      release: async () => { disposePrompt() },
    }
  }

  private registerPrompt(agentCtx: Context): () => void {
    return agentCtx.systemPrompt.section({
      name: 'channel:chatroom',
      order: 190,
      text: this.config.systemPrompt,
    })
  }

  private injectRecoveredTranscript(): void {
    const transcript = this.sortedRecords()
      .map(record => `${record.displayName}: ${record.text}`)
      .join('\n')
    if (transcript === '') return
    this.requireAgent().inject(createUserMessage({
      content: [{ type: 'text', text: `聊天室恢复记录：\n${transcript}` }],
      source: { kind: 'plugin', plugin: 'chatroom', form: 'recall' },
    }))
  }

  private enqueueAi(message: MessageRecord): void {
    if (this.stopping) return
    const task = this.aiTail.then(() => this.processHumanMessage(message))
    this.aiTail = task.catch(error => {
      this.ctx.logger('deepseek-harness-chatroom').warn(
        'AI decision failed for room message %s; retrying in %dms: %s',
        shortId(message.id),
        this.config.aiRetryDelayMs,
        String(error),
      )
      this.scheduleRetry(message)
    })
  }

  private scheduleRetry(message: MessageRecord): void {
    if (this.stopping) return
    const timer = setTimeout(() => {
      this.retryTimers.delete(timer)
      const current = this.requireMessages().get(message.id)
      if (current?.role === 'human' && current.aiProcessed !== true) this.enqueueAi(current)
    }, this.config.aiRetryDelayMs)
    this.retryTimers.add(timer)
  }

  private async processHumanMessage(message: MessageRecord): Promise<void> {
    if (this.stopping) return
    const current = this.requireMessages().get(message.id)
    if (current === undefined || current.role !== 'human' || current.aiProcessed === true) return
    const agent = this.requireAgent()
    await withTimeout(agent.whenIdle(), this.config.responseTimeoutMs, 'chatroom Agent availability')
    const start = agent.session.events.length
    agent.followup(createUserMessage({
      content: [{
        type: 'text',
        text: `聊天室消息：${JSON.stringify({ speaker: current.displayName, message: current.text })}`,
      }],
      source: {
        kind: 'chatroom',
        roomId: this.config.roomId,
        roomMessageId: current.id,
        participantId: current.participantId,
        displayName: current.displayName,
      },
    }))
    try {
      await withTimeout(agent.whenIdle(), this.config.responseTimeoutMs, 'chatroom AI decision')
    } catch (error) {
      agent.cancel({ kind: 'user' })
      throw error
    }
    await this.ctx.sessions.flush(agent.session)
    const turnEvents = agent.session.events.slice(start)
    assertAiDecisionCompleted(turnEvents)
    const reply = latestAssistantReply(turnEvents)
    if (reply !== undefined && shouldPublishReply(reply.text, this.config.noReplyToken)) {
      const stored = await this.commitMessage({
        id: reply.id,
        role: 'ai',
        participantId: 'ai',
        displayName: this.config.aiDisplayName,
        text: reply.text.trim(),
        createdAt: reply.createdAt,
        inReplyTo: current.id,
      })
      this.broadcast({ type: 'message', message: publicMessage(stored) })
    }
    await this.requireMessages().update(current.id, record => ({ ...record, aiProcessed: true }))
  }

  private async reconcileCompletedTurns(): Promise<void> {
    const completed = completedRoomTurns(this.requireAgent().session.events, this.config.noReplyToken)
    const replied = new Set(
      [...this.requireMessages().entries()]
        .map(([, record]) => record.inReplyTo)
        .filter((value): value is string => value !== undefined),
    )
    for (const turn of completed) {
      const human = this.requireMessages().get(turn.roomMessageId)
      if (human === undefined || human.role !== 'human') continue
      if (turn.reply !== undefined && !replied.has(turn.roomMessageId)) {
        const stored = await this.commitMessage({
          id: turn.reply.id,
          role: 'ai',
          participantId: 'ai',
          displayName: this.config.aiDisplayName,
          text: turn.reply.text,
          createdAt: turn.reply.createdAt,
          inReplyTo: turn.roomMessageId,
        })
        replied.add(stored.inReplyTo ?? turn.roomMessageId)
      }
      if (human.aiProcessed !== true) {
        await this.requireMessages().update(human.id, record => ({ ...record, aiProcessed: true }))
      }
    }
  }

  private commitMessage(record: Omit<MessageRecord, 'sequence'>): Promise<MessageRecord> {
    return this.enqueueWrite(async () => {
      const existing = this.requireMessages().get(record.id)
      if (existing !== undefined) return existing
      const stored: MessageRecord = { ...record, sequence: this.nextSequence }
      await this.requireMessages().put(stored.id, stored)
      this.nextSequence += 1
      return stored
    })
  }

  private enqueueWrite<T>(operation: () => Promise<T>): Promise<T> {
    if (this.stopping) return Promise.reject(new Error('chatroom is stopping'))
    const result = this.writeTail.then(operation)
    this.writeTail = result.then(swallow, swallow)
    return result
  }

  private sortedRecords(): MessageRecord[] {
    return [...this.requireMessages().entries()]
      .map(([, record]) => record)
      .sort((left, right) => left.sequence - right.sequence)
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

  private requireMessages(): KvTable<string, MessageRecord> {
    if (this.messages === undefined) throw new Error('chatroom message storage is unavailable')
    return this.messages
  }

  private requireAgent(): Agent {
    if (this.binding === undefined) throw new Error('chatroom Agent is unavailable')
    return this.binding.agent
  }
}

function ownAgent(handle: AgentHandle): AgentBinding {
  return { agent: handle.agent, release: () => handle.dispose() }
}

function publicIdentity(record: IdentityRecord): ChatroomIdentity {
  return { participantId: record.participantId, displayName: record.displayName }
}

function publicMessage(record: MessageRecord): ChatroomMessage {
  return {
    id: record.id,
    sequence: record.sequence,
    role: record.role,
    participantId: record.participantId,
    displayName: record.displayName,
    text: record.text,
    createdAt: record.createdAt,
    ...(record.inReplyTo === undefined ? {} : { inReplyTo: record.inReplyTo }),
  }
}

function normalizeDisplayName(value: string, maxChars: number): string {
  const normalized = value.trim().replace(/\s+/gu, ' ')
  if (normalized === '') throw new ChatroomInputError('请输入身份名称。')
  if ([...normalized].length > maxChars) throw new ChatroomInputError(`身份名称不能超过 ${maxChars} 个字符。`)
  if (/\p{Cc}/u.test(normalized)) throw new ChatroomInputError('身份名称不能包含控制字符。')
  return normalized
}

function normalizeMessage(value: string, maxChars: number): string {
  const normalized = value.trim()
  if (normalized === '') throw new ChatroomInputError('消息不能为空。')
  if ([...normalized].length > maxChars) throw new ChatroomInputError(`消息不能超过 ${maxChars} 个字符。`)
  return normalized
}

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function messageText(event: SessionEvent<'assistant/message'>): string {
  return event.data.message.content
    .filter((block): block is Extract<typeof block, { type: 'text' }> => block.type === 'text')
    .map(block => block.text)
    .join('')
    .trim()
}

function latestAssistantReply(events: readonly SessionEvent[]): CompletedRoomTurn['reply'] | undefined {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index]
    if (event?.type !== 'assistant/message') continue
    const text = messageText(event)
    if (text !== '') return { id: String(event.data.message.id), text, createdAt: event.time }
  }
  return undefined
}

function shouldPublishReply(text: string, noReplyToken: string): boolean {
  return text.trim() !== '' && text.trim() !== noReplyToken
}

export function completedRoomTurns(events: readonly SessionEvent[], noReplyToken: string): CompletedRoomTurn[] {
  const byTurn = new Map<number, { roomMessageId: string; reply?: CompletedRoomTurn['reply'] }>()
  const completed = new Set<number>()
  let activeTurn: number | undefined
  for (const event of events) {
    if (event.type === 'turn/start') {
      activeTurn = event.data.turn
      continue
    }
    if (event.type === 'turn/end') {
      if (isCompletedDecision(event)) completed.add(event.data.turn)
      activeTurn = undefined
      continue
    }
    if (event.type === 'user/message' && activeTurn !== undefined && event.data.source.kind === 'chatroom') {
      byTurn.set(activeTurn, { roomMessageId: event.data.source.roomMessageId })
      continue
    }
    if (event.type === 'assistant/message') {
      const row = byTurn.get(event.data.turn)
      const text = messageText(event)
      if (row !== undefined && text !== '') {
        row.reply = { id: String(event.data.message.id), text, createdAt: event.time }
      }
    }
  }
  const output: CompletedRoomTurn[] = []
  for (const [turn, row] of byTurn) {
    if (!completed.has(turn)) continue
    output.push({
      roomMessageId: row.roomMessageId,
      ...(row.reply === undefined || !shouldPublishReply(row.reply.text, noReplyToken) ? {} : { reply: row.reply }),
    })
  }
  return output
}

/** Reject any settled Agent turn that did not reach a usable model decision. */
export function assertAiDecisionCompleted(events: readonly SessionEvent[]): void {
  let end: SessionEvent<'turn/end'> | undefined
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index]
    if (event?.type === 'turn/end') {
      end = event
      break
    }
  }
  if (end === undefined) throw new Error('chatroom AI turn ended without a durable turn/end event')
  if (isCompletedDecision(end)) return
  const reason = end.data.reason
  if (reason.kind === 'error') {
    throw new Error(`chatroom AI turn failed (${reason.error.code}): ${reason.error.message}`)
  }
  throw new Error(`chatroom AI turn ended without a decision: ${reason.kind}`)
}

function isCompletedDecision(event: SessionEvent<'turn/end'>): boolean {
  return event.data.reason.kind === 'completed' || event.data.reason.kind === 'max-tokens'
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

async function withTimeout<T>(task: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      task,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
      }),
    ])
  } finally {
    if (timer !== undefined) clearTimeout(timer)
  }
}

function shortId(value: string): string {
  return value.length <= 10 ? value : `${value.slice(0, 6)}…${value.slice(-4)}`
}
