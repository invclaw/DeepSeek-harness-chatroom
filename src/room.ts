import { createHash, randomBytes, randomUUID } from 'node:crypto'
import type { ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-agent-default-model'
import { resolveSessionPreset } from '@deepseek-ai/dsh-agent-presets'
import { AttachmentError, type ImageMediaType } from '@deepseek-ai/dsh-attachment'
import { createUserMessage, type ContentBlock } from '@deepseek-ai/dsh-llm'
import { SessionId, type Session, type SessionEvent } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-session-persistence'
import type {} from '@deepseek-ai/dsh-session-title'
import type { Domain, KvTable } from '@deepseek-ai/dsh-storage-domain'
import type {} from '@deepseek-ai/dsh-workspace'
import type { Config } from './config.js'
import { isChatroomAvatarId, fallbackAvatarId } from './avatars.js'
import {
  chatroomDomainSpec,
  type FileRecord,
  type IdentityRecord,
  type MemberRecord,
  type ReactionRecord,
  type RoomRecord,
  type ThreadMessageRecord,
  type ThreadRecord,
} from './domain.js'
import { identifyFileText, identifyForwardText, identifyPrompt, mentionsAi } from './message.js'
import { CHATROOM_REACTION_EMOJIS, type ChatroomReactionEmoji } from './reactions.js'
import type {
  ChatroomFileReference,
  ChatroomForwardBundle,
  ChatroomForwardItem,
  ChatroomIdentity,
  ChatroomInfo,
  ChatroomMember,
  ChatroomNotification,
  ChatroomNotificationEvent,
  ChatroomPromptContentPart,
  ChatroomPromptResponse,
  ChatroomReaction,
  ChatroomReplyReference,
  ChatroomServerEvent,
  ChatroomSnapshotEvent,
  ChatroomThread,
  ChatroomThreadMessage,
  ChatroomThreadPreview,
  ChatroomThreadResponse,
  ChatroomThreadRoot,
} from './types.js'

interface AgentBinding {
  readonly agent: Agent
  release(): Promise<void>
}

interface SseClient {
  readonly participantId: string
  readonly response: ServerResponse
}

interface NotificationClient {
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

interface ThreadState {
  readonly record: ThreadRecord
  binding: AgentBinding | undefined
  activation: Promise<AgentBinding> | undefined
  admission: Promise<void>
}

/** Runtime validation failure safe to return to a browser. */
export class ChatroomInputError extends Error {}

/** Shared browser identities, room directory, presence, and native Harness Sessions. */
export class ChatroomRuntime {
  private readonly log
  private domain: Domain<typeof chatroomDomainSpec> | undefined
  private identities: KvTable<string, IdentityRecord> | undefined
  private roomRecords: KvTable<string, RoomRecord> | undefined
  private files: KvTable<string, FileRecord> | undefined
  private members: KvTable<string, MemberRecord> | undefined
  private threads: KvTable<string, ThreadRecord> | undefined
  private threadMessages: KvTable<string, ThreadMessageRecord> | undefined
  private reactions: KvTable<string, ReactionRecord> | undefined
  private readonly states = new Map<string, RoomState>()
  private readonly threadStates = new Map<string, ThreadState>()
  private readonly notificationClients = new Set<NotificationClient>()
  private ready = false
  private stopping = false

  constructor(
    private readonly ctx: Context,
    readonly config: Config,
  ) {
    this.log = ctx.logger('deepseek-harness-chatroom')
  }

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

  /** Maximum accepted JSON body for one text, image, and file room submission. */
  get maxPromptRequestBytes(): number {
    const { maxImagesPerMessage, maxMessageImageBytes } = this.ctx.attachments.imageLimits
    const encodedImages = Math.ceil(maxMessageImageBytes / 3) * 4
    const encodedFiles = Math.ceil(this.config.maxMessageFileBytes / 3) * 4
    return encodedImages + encodedFiles + this.config.maxMessageTextChars * 4
      + (maxImagesPerMessage + this.config.maxFilesPerMessage) * 2_048 + 8_192
  }

  /** Whether identity persistence and the configured shared Session are ready. */
  get isReady(): boolean {
    return this.ready && !this.stopping
  }

  /** Whether one model request belongs to a room or branch Session owned by this runtime. */
  ownsSession(sessionId: string): boolean {
    return [...this.states.values()].some(state => state.record.sessionId === sessionId)
      || [...this.threadStates.values()].some(state => state.record.sessionId === sessionId)
  }

  /** Open storage, seed the original room, and acquire its Session without blocking Harness startup. */
  async start(): Promise<void> {
    const domain = await this.ctx.storageDomain.open(chatroomDomainSpec)
    this.domain = domain
    this.identities = domain.table('identities')
    this.roomRecords = domain.table('rooms')
    this.files = domain.table('files')
    this.members = domain.table('members')
    this.threads = domain.table('threads')
    this.threadMessages = domain.table('thread_messages')
    this.reactions = domain.table('reactions')
    await this.seedConfiguredRoom()
    for (const [, record] of this.requireRoomRecords().entries()) {
      this.states.set(record.id, newRoomState(record))
    }
    for (const [, record] of this.requireThreads().entries()) {
      this.threadStates.set(record.id, newThreadState(record))
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
    for (const client of this.notificationClients) client.response.end()
    this.notificationClients.clear()
    await Promise.allSettled([...this.states.values()].map(async (state) => {
      await state.admission
      await state.activation?.catch(() => undefined)
      await state.binding?.release()
      state.binding = undefined
    }))
    this.states.clear()
    await Promise.allSettled([...this.threadStates.values()].map(async (state) => {
      await state.admission
      await state.activation?.catch(() => undefined)
      await state.binding?.release()
      state.binding = undefined
    }))
    this.threadStates.clear()
    await this.domain?.close()
    this.domain = undefined
    this.identities = undefined
    this.roomRecords = undefined
    this.files = undefined
    this.members = undefined
    this.threads = undefined
    this.threadMessages = undefined
    this.reactions = undefined
  }

  /** Resolve an opaque cookie token to its durable identity. */
  identity(token: string | undefined): ChatroomIdentity | undefined {
    if (!this.isReady || token === undefined) return undefined
    const record = this.requireIdentities().get(tokenHash(token))
    return record === undefined ? undefined : publicIdentity(record)
  }

  /** Mint and durably bind a new browser identity. */
  async createIdentity(displayName: string, avatarId?: string): Promise<{ token: string; identity: ChatroomIdentity }> {
    this.assertReady()
    const normalized = normalizeDisplayName(displayName, this.config.maxDisplayNameChars)
    const token = randomBytes(32).toString('base64url')
    const now = Date.now()
    const participantId = randomUUID()
    if (avatarId !== undefined && !isChatroomAvatarId(avatarId)) throw new ChatroomInputError('请选择有效的头像。')
    const record: IdentityRecord = {
      participantId,
      displayName: normalized,
      avatarId: avatarId ?? fallbackAvatarId(participantId),
      createdAt: now,
      lastSeenAt: now,
    }
    await this.requireIdentities().put(tokenHash(token), record)
    return { token, identity: publicIdentity(record) }
  }

  /** Update the display fields for one existing browser identity. */
  async updateIdentity(token: string, displayName: string, avatarId?: string): Promise<ChatroomIdentity> {
    this.assertReady()
    const key = tokenHash(token)
    const existing = this.requireIdentities().get(key)
    if (existing === undefined) throw new ChatroomInputError('聊天室身份已失效，请重新进入。')
    const normalized = normalizeDisplayName(displayName, this.config.maxDisplayNameChars)
    if (avatarId !== undefined && !isChatroomAvatarId(avatarId)) throw new ChatroomInputError('请选择有效的头像。')
    const record: IdentityRecord = {
      ...existing,
      displayName: normalized,
      avatarId: avatarId ?? existing.avatarId ?? fallbackAvatarId(existing.participantId),
      lastSeenAt: Date.now(),
    }
    await this.requireIdentities().put(key, record)
    for (const [memberKey, member] of this.requireMembers().entries()) {
      if (member.participantId !== record.participantId) continue
      await this.requireMembers().put(memberKey, {
        ...member,
        displayName: record.displayName,
        avatarId: record.avatarId ?? fallbackAvatarId(record.participantId),
        lastSeenAt: record.lastSeenAt,
      })
      const state = this.states.get(member.roomId)
      if (state !== undefined) this.broadcastPresence(state)
    }
    return publicIdentity(record)
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
      const binding = await this.ensureRoom(id)
      this.ensureRoomVisible(binding, record.title)
      await this.touchMember(id, identity)
      return publicRoom(record)
    } catch (error) {
      this.states.delete(id)
      await this.requireRoomRecords().delete(id)
      throw error
    }
  }

  /** Activate an existing room and return its public metadata. */
  async selectRoom(roomId: string, identity?: ChatroomIdentity): Promise<ChatroomInfo> {
    this.assertReady()
    const binding = await this.ensureRoom(roomId)
    if (identity !== undefined) this.ensureRoomVisible(binding, this.requireState(roomId).record.title)
    if (identity !== undefined) await this.touchMember(roomId, identity)
    return this.requireRoom(roomId)
  }

  /** Append human chat immediately; wake the Agent only for an explicit AI mention. */
  async submit(
    roomId: string,
    identity: ChatroomIdentity,
    content: readonly ChatroomPromptContentPart[],
    mode: 'queue' | 'steer',
    reply?: ChatroomReplyReference,
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
      const durable = await this.durableContent(roomId, identity, identifyPrompt(content, identity, reply))
      const message = createUserMessage({ content: durable, source: { kind: 'user' } })
      if (!aiTriggered) {
        binding.agent.session.append('user/message', message, { surfaceOp: 'append' })
      } else if (mode === 'steer') {
        binding.agent.steer(message)
      } else {
        binding.agent.followup(message)
      }
      await this.touchMember(roomId, identity)
      this.notify({
        id: randomUUID(),
        roomId,
        roomTitle: state.record.title,
        participantId: identity.participantId,
        displayName: identity.displayName,
        role: 'human',
        text: promptPreview(content),
        createdAt: Date.now(),
      })
      return { accepted: true as const, aiTriggered }
    })
    state.admission = task.then(() => undefined, () => undefined)
    return await task
  }

  /** Toggle one participant reaction and replace its room-wide summary. */
  async toggleReaction(
    roomId: string,
    messageId: string,
    emoji: ChatroomReactionEmoji,
    identity: ChatroomIdentity,
  ): Promise<ChatroomReaction> {
    this.assertReady()
    const state = this.requireState(roomId)
    const normalizedMessageId = normalizeMessageId(messageId)
    const task = state.admission.then(async () => {
      const key = reactionKey(roomId, normalizedMessageId, emoji, identity.participantId)
      const table = this.requireReactions()
      if (table.get(key) === undefined) {
        await table.put(key, {
          roomId,
          messageId: normalizedMessageId,
          emoji,
          participantId: identity.participantId,
          createdAt: Date.now(),
        })
      } else {
        await table.delete(key)
      }
      await this.touchMember(roomId, identity)
      const reaction = this.reactionSummary(roomId, normalizedMessageId, emoji)
      this.broadcast(state, { type: 'reaction', reaction })
      return reaction
    })
    state.admission = task.then(() => undefined, () => undefined)
    return await task
  }

  /** Append selected messages as one merged-forward card in another room. */
  async forwardMessages(
    sourceRoomId: string,
    targetRoomId: string,
    messages: readonly ChatroomForwardItem[],
    identity: ChatroomIdentity,
  ): Promise<ChatroomPromptResponse> {
    this.assertReady()
    if (sourceRoomId === targetRoomId) throw new ChatroomInputError('请选择其他群聊进行转发。')
    const source = this.requireState(sourceRoomId)
    const target = this.requireState(targetRoomId)
    const normalized = normalizeForwardItems(messages)
    const task = target.admission.then(async () => {
      const binding = await this.ensureRoom(targetRoomId)
      const bundle: ChatroomForwardBundle = {
        sourceRoomId,
        sourceRoomTitle: source.record.title,
        items: normalized,
      }
      const identified = identifyPrompt([{ type: 'text', text: identifyForwardText(bundle) }], identity)
      const durable = await this.durableContent(targetRoomId, identity, identified)
      binding.agent.session.append('user/message', createUserMessage({
        content: durable,
        source: { kind: 'user' },
      }), { surfaceOp: 'append' })
      await this.touchMember(targetRoomId, identity)
      this.notify({
        id: randomUUID(),
        roomId: targetRoomId,
        roomTitle: target.record.title,
        participantId: identity.participantId,
        displayName: identity.displayName,
        role: 'human',
        text: `转发了 ${normalized.length} 条消息`,
        createdAt: Date.now(),
      })
      return { accepted: true as const, aiTriggered: false }
    })
    target.admission = task.then(() => undefined, () => undefined)
    return await task
  }

  /** Resolve one authenticated room-file download. */
  file(fileId: string): { readonly ref: ChatroomFileReference; readonly data: Uint8Array } {
    this.assertReady()
    const record = this.requireFiles().get(fileId)
    if (record === undefined) throw new ChatroomInputError('文件不存在。')
    return { ref: publicFile(record), data: decodeBase64(record.data, '文件') }
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
      members: this.roomMembers(state),
      reactions: this.reactionsForRoom(roomId),
      threadPreviews: this.threadPreviewsForRoom(roomId),
    }
    writeSse(response, snapshot)
    this.broadcastPresence(state)
    let disposed = false
    return () => {
      if (disposed) return
      disposed = true
      state.clients.delete(client)
      if (!this.stopping) this.broadcastPresence(state)
    }
  }

  /** Attach one identity to the global message-notification stream. */
  subscribeNotifications(identity: ChatroomIdentity, response: ServerResponse): () => void {
    this.assertReady()
    const client: NotificationClient = { participantId: identity.participantId, response }
    this.notificationClients.add(client)
    return () => { this.notificationClients.delete(client) }
  }

  /** Create or reopen a branch rooted at one native room message. */
  async openThread(roomId: string, identity: ChatroomIdentity, root: ChatroomThreadRoot): Promise<ChatroomThreadResponse> {
    this.assertReady()
    const room = this.requireState(roomId)
    const normalized = normalizeThreadRoot(root)
    const task = room.admission.then(async () => {
      await this.touchMember(roomId, identity)
      const existing = [...this.requireThreads().entries()].find(([, record]) =>
        record.roomId === roomId
        && record.root.messageId === normalized.messageId
        && record.root.role === normalized.role)?.[1]
      const state = existing === undefined
        ? await this.createThread(roomId, identity, normalized)
        : this.requireThreadState(existing.id)
      await this.ensureThread(state.record.id)
      return {
        thread: publicThread(state.record),
        messages: this.messagesForThread(state.record.id),
      }
    })
    room.admission = task.then(() => undefined, () => undefined)
    return await task
  }

  /** Append one branch message and wake only that branch Agent on an AI mention. */
  async submitThread(
    threadId: string,
    identity: ChatroomIdentity,
    text: string,
    reply?: ChatroomReplyReference,
  ): Promise<ChatroomPromptResponse> {
    this.assertReady()
    const state = this.requireThreadState(threadId)
    const normalized = normalizeThreadText(text, this.config.maxMessageTextChars)
    const task = state.admission.then(async () => {
      const binding = await this.ensureThread(threadId)
      const sequence = this.nextThreadSequence(threadId)
      const record: ThreadMessageRecord = {
        id: randomUUID(),
        threadId,
        sequence,
        role: 'human',
        participantId: identity.participantId,
        displayName: identity.displayName,
        avatarId: identity.avatarId,
        text: normalized,
        ...(reply === undefined ? {} : { reply }),
        createdAt: Date.now(),
      }
      await this.requireThreadMessages().put(record.id, record)
      const identified = identifyPrompt([{ type: 'text', text: normalized }], identity, reply)
      const message = createUserMessage({
        content: identified.map(part => ({ type: 'text' as const, text: part.type === 'text' ? part.text : '' })),
        source: { kind: 'user' },
      })
      const room = this.requireState(state.record.roomId).record
      const aiTriggered = mentionsAi([{ type: 'text', text: normalized }], room.aiDisplayName)
      if (aiTriggered) binding.agent.followup(message)
      else binding.agent.session.append('user/message', message, { surfaceOp: 'append' })
      await this.touchMember(state.record.roomId, identity)
      const publicMessage = publicThreadMessage(record)
      this.broadcast(this.requireState(state.record.roomId), {
        type: 'thread-message',
        message: publicMessage,
        preview: this.threadPreview(state.record),
      })
      this.notify({
        id: record.id,
        roomId: state.record.roomId,
        roomTitle: room.title,
        threadId,
        participantId: identity.participantId,
        displayName: identity.displayName,
        role: 'human',
        text: normalized,
        createdAt: record.createdAt,
      })
      return { accepted: true as const, aiTriggered }
    })
    state.admission = task.then(() => undefined, () => undefined)
    return await task
  }

  /** Project committed AI output into its parent room or branch stream. */
  handleSessionEvent(session: Session, event: SessionEvent): void {
    if (!this.isReady || event.type !== 'assistant/message') return
    const text = assistantText(event.data.message.content)
    if (text === '') return
    const thread = [...this.threadStates.values()].find(state => state.record.sessionId === String(session.id))
    if (thread !== undefined) {
      void this.recordThreadAssistant(thread, text, event.time).catch((error: unknown) => {
        this.log.warn('Branch AI projection failed: %s', String(error))
      })
      return
    }
    const room = [...this.states.values()].find(state => state.record.sessionId === String(session.id))
    if (room === undefined) return
    this.notify({
      id: `assistant:${session.id}:${event.seq}`,
      roomId: room.record.id,
      roomTitle: room.record.title,
      participantId: 'ai',
      displayName: room.record.aiDisplayName,
      role: 'ai',
      text,
      createdAt: event.time,
    })
  }

  private async createThread(
    roomId: string,
    identity: ChatroomIdentity,
    root: ChatroomThreadRoot,
  ): Promise<ThreadState> {
    const id = randomUUID()
    const record: ThreadRecord = {
      id,
      roomId,
      root,
      sessionId: `chatroom-thread-v1-${id}`,
      createdAt: Date.now(),
      createdBy: identity.participantId,
    }
    await this.requireThreads().put(id, record)
    const state = newThreadState(record)
    this.threadStates.set(id, state)
    try {
      const binding = await this.ensureThread(id)
      this.ctx.sessionTitle.rename(binding.agent.session, `分支：${[...root.text].slice(0, 40).join('')}`)
      const seed = createUserMessage({
        content: [{
          type: 'text',
          text: `这是群聊分支的主题消息。${root.displayName}：${root.text}`,
        }],
        source: { kind: 'user' },
      })
      binding.agent.session.append('user/message', seed, { surfaceOp: 'append' })
      return state
    } catch (error) {
      this.threadStates.delete(id)
      await this.requireThreads().delete(id)
      throw error
    }
  }

  private async ensureThread(threadId: string): Promise<AgentBinding> {
    const state = this.requireThreadState(threadId)
    if (state.binding !== undefined) return state.binding
    const parentSessionId = this.requireState(state.record.roomId).record.sessionId
    state.activation ??= this.acquireAgent(state.record.sessionId, parentSessionId).then(async (binding) => {
      try {
        await this.attachWorkspace(state.record.sessionId)
        state.binding = binding
        return binding
      } catch (error) {
        await binding.release()
        throw error
      }
    }).finally(() => {
      state.activation = undefined
    })
    return await state.activation
  }

  private async recordThreadAssistant(state: ThreadState, text: string, createdAt: number): Promise<void> {
    const room = this.requireState(state.record.roomId)
    const record: ThreadMessageRecord = {
      id: randomUUID(),
      threadId: state.record.id,
      sequence: this.nextThreadSequence(state.record.id),
      role: 'ai',
      participantId: 'ai',
      displayName: room.record.aiDisplayName,
      text,
      createdAt,
    }
    await this.requireThreadMessages().put(record.id, record)
    const message = publicThreadMessage(record)
    this.broadcast(room, { type: 'thread-message', message, preview: this.threadPreview(state.record) })
    this.notify({
      id: record.id,
      roomId: room.record.id,
      roomTitle: room.record.title,
      threadId: state.record.id,
      participantId: 'ai',
      displayName: room.record.aiDisplayName,
      role: 'ai',
      text,
      createdAt,
    })
  }

  private messagesForThread(threadId: string): readonly ChatroomThreadMessage[] {
    return [...this.requireThreadMessages().entries()]
      .map(([, record]) => record)
      .filter(record => record.threadId === threadId)
      .sort((left, right) => left.sequence - right.sequence)
      .map(publicThreadMessage)
  }

  private threadPreview(record: ThreadRecord): ChatroomThreadPreview {
    const messages = this.messagesForThread(record.id)
    return {
      thread: publicThread(record),
      totalMessages: messages.length,
      recentMessages: messages.slice(-3),
    }
  }

  private threadPreviewsForRoom(roomId: string): readonly ChatroomThreadPreview[] {
    return [...this.requireThreads().entries()]
      .map(([, record]) => record)
      .filter(record => record.roomId === roomId)
      .map(record => this.threadPreview(record))
      .filter(preview => preview.totalMessages > 0)
      .sort((left, right) => {
        const leftTime = left.recentMessages.at(-1)?.createdAt ?? left.thread.createdAt
        const rightTime = right.recentMessages.at(-1)?.createdAt ?? right.thread.createdAt
        return rightTime - leftTime
      })
  }

  private nextThreadSequence(threadId: string): number {
    return this.messagesForThread(threadId).reduce((maximum, message) => Math.max(maximum, message.sequence), -1) + 1
  }

  private async touchMember(roomId: string, identity: ChatroomIdentity): Promise<void> {
    const key = `${roomId}:${identity.participantId}`
    const table = this.requireMembers()
    const existing = table.get(key)
    const now = Date.now()
    await table.put(key, {
      roomId,
      participantId: identity.participantId,
      displayName: identity.displayName,
      avatarId: identity.avatarId,
      joinedAt: existing?.joinedAt ?? now,
      lastSeenAt: now,
    })
    const state = this.states.get(roomId)
    if (state !== undefined) this.broadcastPresence(state)
  }

  private roomMembers(state: RoomState): readonly ChatroomMember[] {
    const online = new Set([...state.clients].map(client => client.participantId))
    return [...this.requireMembers().entries()]
      .map(([, record]) => record)
      .filter(record => record.roomId === state.record.id)
      .sort((left, right) => Number(online.has(right.participantId)) - Number(online.has(left.participantId))
        || right.lastSeenAt - left.lastSeenAt)
      .map(record => ({
        participantId: record.participantId,
        displayName: record.displayName,
        avatarId: record.avatarId,
        joinedAt: record.joinedAt,
        lastSeenAt: record.lastSeenAt,
        online: online.has(record.participantId),
      }))
  }

  private reactionsForRoom(roomId: string): readonly ChatroomReaction[] {
    const grouped = new Map<string, { messageId: string; emoji: ChatroomReactionEmoji; participantIds: string[] }>()
    for (const [, record] of this.requireReactions().entries()) {
      if (record.roomId !== roomId) continue
      const key = `${record.messageId}\u0000${record.emoji}`
      const existing = grouped.get(key)
      if (existing === undefined) {
        grouped.set(key, { messageId: record.messageId, emoji: record.emoji, participantIds: [record.participantId] })
      } else {
        existing.participantIds.push(record.participantId)
      }
    }
    return [...grouped.values()]
      .map(item => ({
        roomId,
        messageId: item.messageId,
        emoji: item.emoji,
        participantIds: [...new Set(item.participantIds)].sort(),
      }))
      .sort((left, right) => left.messageId.localeCompare(right.messageId)
        || CHATROOM_REACTION_EMOJIS.indexOf(left.emoji) - CHATROOM_REACTION_EMOJIS.indexOf(right.emoji))
  }

  private reactionSummary(roomId: string, messageId: string, emoji: ChatroomReactionEmoji): ChatroomReaction {
    return this.reactionsForRoom(roomId).find(item => item.messageId === messageId && item.emoji === emoji)
      ?? { roomId, messageId, emoji, participantIds: [] }
  }

  private notify(notification: ChatroomNotification): void {
    const event: ChatroomNotificationEvent = { type: 'notification', notification }
    for (const client of [...this.notificationClients]) {
      if (client.participantId === notification.participantId) continue
      if (!writeNotificationSse(client.response, event)) this.notificationClients.delete(client)
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

  private ensureRoomVisible(binding: AgentBinding, title: string): void {
    if (this.ctx.sessionTitle.get(binding.agent.session)?.title !== title) {
      this.ctx.sessionTitle.rename(binding.agent.session, title)
    }
    if (binding.agent.session.events.some(event => event.type === 'turn/start')) return
    binding.agent.session.append('turn/start', { turn: 1 })
    binding.agent.session.append('turn/end', {
      turn: 1,
      reason: { kind: 'aborted', reason: { kind: 'user' } },
    })
  }

  private async acquireAgent(sessionId: string, parentSessionId?: string): Promise<AgentBinding> {
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
        meta: {
          cwd: this.config.cwd,
          agentPreset: this.config.agentPreset,
          ...(parentSessionId === undefined ? {} : { parentSession: SessionId(parentSessionId) }),
        },
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

  private async durableContent(
    roomId: string,
    identity: ChatroomIdentity,
    content: readonly ChatroomPromptContentPart[],
  ): Promise<ContentBlock[]> {
    const prepared = content.map(part => part.type === 'text'
      ? part
      : { part, data: decodeBase64(part.data, part.type === 'image' ? '图片' : '文件') })
    const images = prepared.filter((item): item is Extract<typeof item, { data: Uint8Array }> =>
      'data' in item && item.part.type === 'image')
    const files = prepared.filter((item): item is Extract<typeof item, { data: Uint8Array }> =>
      'data' in item && item.part.type === 'file')
    this.validateFiles(files.map(file => file.data))
    const mediaTypes = this.ctx.attachments.imageLimits.mediaTypes
    for (const image of images) {
      if (image.part.type !== 'image' || !mediaTypes.includes(image.part.mediaType)) {
        throw new ChatroomInputError(`不支持图片格式 ${image.part.mediaType}。`)
      }
    }
    const admittedImages = await Promise.all(images.map(async image => ({
      part: image.part as Extract<ChatroomPromptContentPart, { type: 'image' }>,
      data: await this.resizeImage(image.data),
    })))
    let refs: Awaited<ReturnType<typeof this.ctx.attachments.saveImages>> = []
    try {
      refs = await this.ctx.attachments.saveImages(admittedImages.map(image => ({
        data: image.data,
        mediaType: image.part.mediaType as ImageMediaType,
        ...(image.part.name === undefined ? {} : { name: image.part.name }),
      })))
    } catch (error) {
      if (error instanceof AttachmentError) throw new ChatroomInputError(`图片无法发送：${error.message}`)
      throw error
    }
    const fileRefs = new Map<Extract<ChatroomPromptContentPart, { type: 'file' }>, ChatroomFileReference>()
    for (const file of files) {
      if (file.part.type !== 'file') continue
      const record = this.fileRecord(roomId, identity, file.part, file.data)
      await this.requireFiles().put(record.id, record)
      fileRefs.set(file.part, publicFile(record))
    }
    const blocks: ContentBlock[] = []
    let imageIndex = 0
    for (const item of prepared) {
      if (!('data' in item)) {
        blocks.push({ type: 'text', text: item.text })
        continue
      }
      if (item.part.type === 'file') {
        const file = fileRefs.get(item.part)
        if (file === undefined) throw new Error('chatroom file batch lost a file reference')
        blocks.push({ type: 'text', text: identifyFileText(file) })
        continue
      }
      const attachment = refs[imageIndex++]
      if (attachment === undefined) throw new Error('chatroom attachment batch lost an image reference')
      blocks.push({ type: 'image', attachment })
    }
    return blocks
  }

  private validateFiles(files: readonly Uint8Array[]): void {
    if (files.length > this.config.maxFilesPerMessage) {
      throw new ChatroomInputError(`一条消息最多发送 ${this.config.maxFilesPerMessage} 个文件。`)
    }
    if (files.some(file => file.byteLength > this.config.maxFileBytes)) {
      throw new ChatroomInputError(`单个文件不能超过 ${formatMegabytes(this.config.maxFileBytes)}。`)
    }
    const total = files.reduce((sum, file) => sum + file.byteLength, 0)
    if (total > this.config.maxMessageFileBytes) {
      throw new ChatroomInputError(`一条消息的文件总大小不能超过 ${formatMegabytes(this.config.maxMessageFileBytes)}。`)
    }
  }

  private fileRecord(
    roomId: string,
    identity: ChatroomIdentity,
    part: Extract<ChatroomPromptContentPart, { type: 'file' }>,
    data: Uint8Array,
  ): FileRecord {
    return {
      id: randomUUID(),
      roomId,
      participantId: identity.participantId,
      displayName: identity.displayName,
      name: normalizeFileName(part.name),
      mediaType: normalizeMediaType(part.mediaType),
      bytes: data.byteLength,
      data: Buffer.from(data).toString('base64'),
      createdAt: Date.now(),
    }
  }

  private async resizeImage(data: Uint8Array): Promise<Uint8Array> {
    try {
      const { default: sharp } = await import('sharp')
      const image = sharp(data, { animated: true, failOn: 'error', limitInputPixels: false })
      const metadata = await image.metadata()
      const width = metadata.width
      const height = metadata.pageHeight ?? metadata.height
      if (width === undefined || height === undefined) return data
      const maxPixels = this.ctx.attachments.imageLimits.maxImagePixels
      const scale = Math.min(
        1,
        this.config.maxImageSidePixels / width,
        this.config.maxImageSidePixels / height,
        Math.sqrt(maxPixels / (width * height)),
      )
      if (scale >= 1) return data
      const resized = await image.resize({
        width: Math.max(1, Math.floor(width * scale)),
        height: Math.max(1, Math.floor(height * scale)),
        fit: 'inside',
        withoutEnlargement: true,
      }).toBuffer()
      return new Uint8Array(resized)
    } catch (error) {
      throw new ChatroomInputError(`图片无法发送：${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private broadcastPresence(state: RoomState): void {
    this.broadcast(state, { type: 'presence', online: onlineCount(state), members: this.roomMembers(state) })
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

  private requireFiles(): KvTable<string, FileRecord> {
    if (this.files === undefined) throw new Error('chatroom file storage is unavailable')
    return this.files
  }

  private requireMembers(): KvTable<string, MemberRecord> {
    if (this.members === undefined) throw new Error('chatroom member storage is unavailable')
    return this.members
  }

  private requireThreads(): KvTable<string, ThreadRecord> {
    if (this.threads === undefined) throw new Error('chatroom thread storage is unavailable')
    return this.threads
  }

  private requireThreadMessages(): KvTable<string, ThreadMessageRecord> {
    if (this.threadMessages === undefined) throw new Error('chatroom thread message storage is unavailable')
    return this.threadMessages
  }

  private requireReactions(): KvTable<string, ReactionRecord> {
    if (this.reactions === undefined) throw new Error('chatroom reaction storage is unavailable')
    return this.reactions
  }

  private requireThreadState(threadId: string): ThreadState {
    const state = this.threadStates.get(threadId)
    if (state === undefined) throw new ChatroomInputError('分支会话不存在。')
    return state
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

function newThreadState(record: ThreadRecord): ThreadState {
  return {
    record,
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
  return {
    participantId: record.participantId,
    displayName: record.displayName,
    avatarId: record.avatarId ?? fallbackAvatarId(record.participantId),
  }
}

function publicFile(record: FileRecord): ChatroomFileReference {
  return { id: record.id, name: record.name, mediaType: record.mediaType, bytes: record.bytes }
}

function publicRoom(record: RoomRecord): ChatroomInfo {
  return {
    id: record.id,
    title: record.title,
    aiDisplayName: record.aiDisplayName,
    sessionId: record.sessionId,
  }
}

function publicThread(record: ThreadRecord): ChatroomThread {
  return {
    id: record.id,
    roomId: record.roomId,
    root: record.root,
    sessionId: record.sessionId,
    createdAt: record.createdAt,
  }
}

function publicThreadMessage(record: ThreadMessageRecord): ChatroomThreadMessage {
  return {
    id: record.id,
    threadId: record.threadId,
    sequence: record.sequence,
    role: record.role,
    participantId: record.participantId,
    displayName: record.displayName,
    text: record.text,
    ...(record.reply === undefined ? {} : { reply: record.reply }),
    createdAt: record.createdAt,
    ...(record.avatarId === undefined ? {} : { avatarId: record.avatarId }),
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

function normalizeThreadRoot(root: ChatroomThreadRoot): ChatroomThreadRoot {
  const messageId = root.messageId.trim()
  const displayName = root.displayName.trim().replace(/\s+/gu, ' ')
  const text = root.text.trim().replace(/\s+/gu, ' ')
  if (messageId === '' || displayName === '' || text === '') throw new ChatroomInputError('分支主题消息无效。')
  if (root.role !== 'human' && root.role !== 'ai') throw new ChatroomInputError('分支主题角色无效。')
  return {
    messageId: [...messageId].slice(0, 200).join(''),
    displayName: [...displayName].slice(0, 80).join(''),
    text: [...text].slice(0, 500).join(''),
    role: root.role,
  }
}

function normalizeThreadText(value: string, maxChars: number): string {
  const normalized = value.trim()
  if (normalized === '') throw new ChatroomInputError('请输入分支消息。')
  if ([...normalized].length > maxChars) throw new ChatroomInputError(`分支消息不能超过 ${maxChars} 个字符。`)
  if (/\p{Cc}/u.test(normalized)) throw new ChatroomInputError('分支消息不能包含控制字符。')
  return normalized
}

function normalizeMessageId(value: string): string {
  const normalized = value.trim()
  if (normalized === '' || [...normalized].length > 240 || /\p{Cc}/u.test(normalized)) {
    throw new ChatroomInputError('消息编号无效。')
  }
  return normalized
}

function normalizeForwardItems(items: readonly ChatroomForwardItem[]): readonly ChatroomForwardItem[] {
  if (items.length === 0 || items.length > 50) throw new ChatroomInputError('请选择 1 到 50 条消息进行转发。')
  const seen = new Set<string>()
  return items.map((item) => {
    const messageId = normalizeMessageId(item.messageId)
    if (seen.has(messageId)) throw new ChatroomInputError('转发消息不能重复。')
    seen.add(messageId)
    const displayName = item.displayName.trim().replace(/\s+/gu, ' ')
    const text = item.text.trim().replace(/\s+/gu, ' ')
    if (item.role !== 'human' && item.role !== 'ai') throw new ChatroomInputError('转发消息角色无效。')
    if (displayName === '' || [...displayName].length > 80) throw new ChatroomInputError('转发消息昵称无效。')
    if (text === '' || [...text].length > 2_000) throw new ChatroomInputError('转发消息内容无效。')
    if (!Number.isSafeInteger(item.createdAt) || item.createdAt < 0) throw new ChatroomInputError('转发消息时间无效。')
    return { messageId, role: item.role, displayName, text, createdAt: item.createdAt }
  })
}

function reactionKey(roomId: string, messageId: string, emoji: ChatroomReactionEmoji, participantId: string): string {
  return `${roomId}\u0000${messageId}\u0000${emoji}\u0000${participantId}`
}

function promptPreview(content: readonly ChatroomPromptContentPart[]): string {
  const text = content.filter((part): part is Extract<ChatroomPromptContentPart, { type: 'text' }> =>
    part.type === 'text').map(part => part.text.trim()).filter(Boolean).join(' ')
  if (text !== '') return [...text.replace(/\s+/gu, ' ')].slice(0, 160).join('')
  if (content.some(part => part.type === 'file')) return '发送了文件'
  return '发送了图片'
}

function assistantText(content: readonly ContentBlock[]): string {
  return content.filter((block): block is Extract<ContentBlock, { type: 'text' }> => block.type === 'text')
    .map(block => block.text.trim()).filter(Boolean).join('\n').trim()
}

function decodeBase64(data: string, label: string): Uint8Array {
  const decoded = Buffer.from(data, 'base64')
  if (data.length === 0 || decoded.toString('base64') !== data) {
    throw new ChatroomInputError(`${label}数据不是有效的 base64。`)
  }
  return new Uint8Array(decoded)
}

function normalizeFileName(value: string): string {
  const normalized = value.trim().replace(/[\\/]/gu, '_').replace(/[\p{Cc}\p{Cf}]/gu, '')
  if (normalized === '') throw new ChatroomInputError('文件名不能为空。')
  return [...normalized].slice(0, 255).join('')
}

function normalizeMediaType(value: string): string {
  const normalized = value.trim().toLowerCase()
  return /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/u.test(normalized)
    ? normalized
    : 'application/octet-stream'
}

function formatMegabytes(bytes: number): string {
  return `${Math.ceil(bytes / 1024 / 1024)} MB`
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

function writeNotificationSse(response: ServerResponse, event: ChatroomNotificationEvent): boolean {
  if (response.destroyed || response.writableEnded) return false
  try {
    response.write(`data: ${JSON.stringify(event)}\n\n`)
    return true
  } catch {
    return false
  }
}
