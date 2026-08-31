/** SQLite chat archive and content-addressed file storage owned by the chatroom plugin. */

import { createHash, randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import { readFileSync } from 'node:fs'
import { mkdir, rename, unlink, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'

const SCHEMA_VERSION = 2
const NODE_SQLITE_MODULE: string = 'node:sqlite'

export type ArchiveConversationKind = 'room' | 'thread' | 'direct'

export interface ArchiveMessageInput {
  readonly conversationId: string
  readonly id: string
  readonly sequence: number
  readonly role: 'human' | 'ai'
  readonly senderId?: string
  readonly displayName: string
  readonly text: string
  readonly createdAt: number
  readonly sessionId?: string
  readonly sessionSeq?: number
  readonly modelMessageId?: string
  readonly replyTo?: string
  readonly content?: unknown
}

export interface ArchivedMessageOwner {
  readonly senderId?: string
  readonly modelMessageId?: string
}

export interface StoredBlob {
  readonly sha256: string
  readonly storageKey: string
}

export interface ArchiveAttachmentInput {
  readonly id: string
  readonly roomId: string
  readonly participantId: string
  readonly displayName: string
  readonly name: string
  readonly mediaType: string
  readonly bytes: number
  readonly createdAt: number
}

export type ArchivedMeetingSummaryStatus = 'pending' | 'completed' | 'failed'

/** Durable meeting lifecycle record shared by UI cards, automation, and external APIs. */
export interface ArchivedMeeting {
  readonly id: string
  readonly conversationKind: 'room' | 'direct'
  readonly conversationId: string
  readonly externalMeetingId?: string
  readonly meetingUrl?: string
  readonly title: string
  readonly beginTime?: string | undefined
  readonly endTime?: string | undefined
  readonly status: string
  readonly summaryStatus: ArchivedMeetingSummaryStatus
  readonly summary?: string | undefined
  readonly summaryError?: string | undefined
  readonly endedAt?: number
  readonly summaryPostedAt?: number
  readonly createdAt: number
  readonly updatedAt: number
}

/** Open the plugin database and blob root without depending on Harness persistence internals. */
export async function openChatArchive(configuredDirectory: string): Promise<ChatArchive> {
  const memory = configuredDirectory === ':memory:'
  const root = memory ? ':memory:' : resolveArchiveRoot(configuredDirectory)
  if (!memory) await mkdir(root, { recursive: true, mode: 0o700 })
  // Keep the specifier dynamic because tsup's built-in normalizer rewrites a static
  // node:sqlite import to the nonexistent third-party package "sqlite".
  const { DatabaseSync: Database } = await import(NODE_SQLITE_MODULE) as typeof import('node:sqlite')
  return new ChatArchive(
    new Database(memory ? ':memory:' : join(root, 'chatroom.sqlite')),
    memory ? undefined : join(root, 'blobs', 'v1'),
  )
}

/** Durable projections used for chat queries, recall semantics, exports, and attachment retrieval. */
export class ChatArchive {
  private readonly memoryBlobs = new Map<string, Uint8Array>()

  constructor(
    private readonly database: DatabaseSync,
    private readonly blobRoot: string | undefined,
  ) {
    this.initialize()
  }

  /** Close the SQLite connection after intake stops. */
  close(): void {
    if (this.database.isOpen) this.database.close()
  }

  /** Create or refresh one room, branch, or direct-conversation catalog entry. */
  upsertConversation(input: {
    readonly id: string
    readonly kind: ArchiveConversationKind
    readonly title: string
    readonly createdAt: number
    readonly updatedAt: number
    readonly sessionId?: string
    readonly parentId?: string
  }): void {
    this.database.prepare(`INSERT INTO conversations
      (id, kind, title, session_id, parent_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET kind = excluded.kind, title = excluded.title,
        session_id = excluded.session_id, parent_id = excluded.parent_id, updated_at = excluded.updated_at`)
      .run(input.id, input.kind, input.title, input.sessionId ?? null, input.parentId ?? null, input.createdAt, input.updatedAt)
  }

  /** Record membership as a durable visibility and export relation. */
  upsertMember(conversationId: string, participantId: string, displayName: string, joinedAt: number): void {
    this.database.prepare(`INSERT INTO conversation_members
      (conversation_id, participant_id, display_name, joined_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(conversation_id, participant_id) DO UPDATE SET
        display_name = excluded.display_name, left_at = NULL`)
      .run(conversationId, participantId, displayName, joinedAt)
  }

  /** Project one committed chat message without duplicating a replayed Session event. */
  upsertMessage(input: ArchiveMessageInput): void {
    this.database.prepare(`INSERT INTO messages
      (conversation_id, id, sequence, role, sender_id, display_name, text, created_at,
       session_id, session_seq, model_message_id, reply_to, content_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(conversation_id, id) DO UPDATE SET
        sequence = excluded.sequence, role = excluded.role, sender_id = excluded.sender_id,
        display_name = excluded.display_name, text = excluded.text,
        session_id = excluded.session_id, session_seq = excluded.session_seq,
        model_message_id = excluded.model_message_id, reply_to = excluded.reply_to,
        content_json = excluded.content_json`)
      .run(
        input.conversationId,
        input.id,
        input.sequence,
        input.role,
        input.senderId ?? null,
        input.displayName,
        input.text,
        input.createdAt,
        input.sessionId ?? null,
        input.sessionSeq ?? null,
        input.modelMessageId ?? null,
        input.replyTo ?? null,
        input.content === undefined ? null : JSON.stringify(input.content),
      )
  }

  /** Resolve a visible UI id to its authoritative sender and model message id. */
  messageOwner(conversationId: string, messageId: string, sessionId?: string): ArchivedMessageOwner | undefined {
    const sequence = visibleSequence(messageId)
    const row = sequence === undefined
      ? this.database.prepare(`SELECT sender_id, model_message_id FROM messages
          WHERE conversation_id = ? AND (id = ? OR model_message_id = ?) LIMIT 1`)
        .get(conversationId, messageId, messageId)
      : this.database.prepare(`SELECT sender_id, model_message_id FROM messages
          WHERE conversation_id = ? AND (id = ? OR (session_id = ? AND session_seq = ?)) LIMIT 1`)
        .get(conversationId, messageId, sessionId ?? null, sequence)
    if (row === undefined) return undefined
    return {
      ...(typeof row.sender_id === 'string' ? { senderId: row.sender_id } : {}),
      ...(typeof row.model_message_id === 'string' ? { modelMessageId: row.model_message_id } : {}),
    }
  }

  /** Tombstone a message while retaining the record for audit and export. */
  recallMessage(conversationId: string, messageId: string, participantId: string, createdAt: number, sessionId?: string): void {
    const sequence = visibleSequence(messageId)
    const statement = sequence === undefined
      ? this.database.prepare(`UPDATE messages SET recalled_at = ?, recalled_by = ?
          WHERE conversation_id = ? AND (id = ? OR model_message_id = ?)`)
      : this.database.prepare(`UPDATE messages SET recalled_at = ?, recalled_by = ?
          WHERE conversation_id = ? AND (id = ? OR (session_id = ? AND session_seq = ?))`)
    if (sequence === undefined) statement.run(createdAt, participantId, conversationId, messageId, messageId)
    else statement.run(createdAt, participantId, conversationId, messageId, sessionId ?? null, sequence)
  }

  /** Create or replace one meeting lifecycle projection. */
  upsertMeeting(input: ArchivedMeeting): void {
    this.database.prepare(`INSERT INTO meetings
      (id, conversation_kind, conversation_id, external_meeting_id, meeting_url, title,
       begin_time, end_time, status, summary_status, summary, summary_error, ended_at,
       summary_posted_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        conversation_kind = excluded.conversation_kind, conversation_id = excluded.conversation_id,
        external_meeting_id = excluded.external_meeting_id, meeting_url = excluded.meeting_url,
        title = excluded.title, begin_time = excluded.begin_time, end_time = excluded.end_time,
        status = excluded.status, summary_status = excluded.summary_status, summary = excluded.summary,
        summary_error = excluded.summary_error, ended_at = excluded.ended_at,
        summary_posted_at = excluded.summary_posted_at, updated_at = excluded.updated_at`)
      .run(
        input.id, input.conversationKind, input.conversationId, input.externalMeetingId ?? null,
        input.meetingUrl ?? null, input.title, input.beginTime ?? null, input.endTime ?? null,
        input.status, input.summaryStatus, input.summary ?? null, input.summaryError ?? null,
        input.endedAt ?? null, input.summaryPostedAt ?? null, input.createdAt, input.updatedAt,
      )
  }

  /** Resolve one meeting lifecycle record by its plugin-owned public id. */
  meeting(id: string): ArchivedMeeting | undefined {
    const row = this.database.prepare('SELECT * FROM meetings WHERE id = ?').get(id)
    return row === undefined ? undefined : archivedMeeting(row)
  }

  /** List meetings that still need provider polling, summarization, or group delivery. */
  pendingMeetings(): readonly ArchivedMeeting[] {
    return this.database.prepare(`SELECT * FROM meetings
      WHERE status != 'end' OR summary_status != 'completed'
        OR (conversation_kind = 'room' AND summary_posted_at IS NULL)
      ORDER BY updated_at ASC`).all().map(archivedMeeting)
  }

  /** List completed summaries for authenticated external consumers. */
  meetingSummaries(limit = 100): readonly ArchivedMeeting[] {
    return this.database.prepare(`SELECT * FROM meetings WHERE summary_status = 'completed'
      ORDER BY updated_at DESC LIMIT ?`).all(limit).map(archivedMeeting)
  }

  /** Model message ids excluded from future requests after recall. */
  recalledMessageIds(sessionId: string): ReadonlySet<string> {
    const rows = this.database.prepare(`SELECT model_message_id FROM messages
      WHERE session_id = ? AND recalled_at IS NOT NULL AND model_message_id IS NOT NULL`).all(sessionId)
    return new Set(rows.flatMap(row => typeof row.model_message_id === 'string' ? [row.model_message_id] : []))
  }

  /** Persist bytes once by SHA-256 and return an opaque storage reference. */
  async putBlob(data: Uint8Array): Promise<StoredBlob> {
    const sha256 = createHash('sha256').update(data).digest('hex')
    const storageKey = `objects/${sha256.slice(0, 2)}/${sha256}`
    if (this.blobRoot === undefined) {
      this.memoryBlobs.set(storageKey, data.slice())
      return { sha256, storageKey }
    }
    const destination = join(this.blobRoot, storageKey)
    await mkdir(dirname(destination), { recursive: true, mode: 0o700 })
    const temporary = `${destination}.${randomUUID()}.tmp`
    try {
      await writeFile(temporary, data, { flag: 'wx', mode: 0o600 })
      try {
        await rename(temporary, destination)
      } catch (error) {
        if (!isAlreadyExists(error)) throw error
        await unlink(temporary)
      }
    } catch (error) {
      try { await unlink(temporary) } catch (cleanupError) {
        if (!isMissing(cleanupError)) throw cleanupError
      }
      if (!isAlreadyExists(error)) throw error
    }
    return { sha256, storageKey }
  }

  /** Store file bytes and their durable metadata as one plugin-owned attachment. */
  async putAttachment(input: ArchiveAttachmentInput, data: Uint8Array): Promise<StoredBlob> {
    const blob = await this.putBlob(data)
    this.database.prepare(`INSERT INTO attachments
      (id, room_id, participant_id, display_name, name, media_type, bytes, sha256, storage_key, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name = excluded.name, media_type = excluded.media_type,
        bytes = excluded.bytes, sha256 = excluded.sha256, storage_key = excluded.storage_key`)
      .run(
        input.id,
        input.roomId,
        input.participantId,
        input.displayName,
        input.name,
        input.mediaType,
        input.bytes,
        blob.sha256,
        blob.storageKey,
        input.createdAt,
      )
    return blob
  }

  /** Read one content-addressed blob by the reference stored in file metadata. */
  readBlob(storageKey: string): Uint8Array {
    if (!/^objects\/[a-f0-9]{2}\/[a-f0-9]{64}$/u.test(storageKey)) throw new Error('invalid chatroom blob key')
    if (this.blobRoot === undefined) {
      const data = this.memoryBlobs.get(storageKey)
      if (data === undefined) throw new Error('chatroom blob does not exist')
      return data.slice()
    }
    return new Uint8Array(readFileSync(join(this.blobRoot, storageKey)))
  }

  private initialize(): void {
    this.database.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;')
    if (this.blobRoot !== undefined) this.database.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;')
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS archive_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL CHECK(kind IN ('room', 'thread', 'direct')),
        title TEXT NOT NULL,
        session_id TEXT UNIQUE,
        parent_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS conversation_members (
        conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        participant_id TEXT NOT NULL,
        display_name TEXT NOT NULL,
        joined_at INTEGER NOT NULL,
        left_at INTEGER,
        PRIMARY KEY(conversation_id, participant_id)
      );
      CREATE TABLE IF NOT EXISTS messages (
        conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        id TEXT NOT NULL,
        sequence INTEGER NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('human', 'ai')),
        sender_id TEXT,
        display_name TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        session_id TEXT,
        session_seq INTEGER,
        model_message_id TEXT,
        reply_to TEXT,
        content_json TEXT,
        recalled_at INTEGER,
        recalled_by TEXT,
        PRIMARY KEY(conversation_id, id)
      );
      CREATE INDEX IF NOT EXISTS messages_conversation_sequence
        ON messages(conversation_id, sequence);
      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        participant_id TEXT NOT NULL,
        display_name TEXT NOT NULL,
        name TEXT NOT NULL,
        media_type TEXT NOT NULL,
        bytes INTEGER NOT NULL,
        sha256 TEXT NOT NULL,
        storage_key TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        conversation_kind TEXT NOT NULL CHECK(conversation_kind IN ('room', 'direct')),
        conversation_id TEXT NOT NULL,
        external_meeting_id TEXT,
        meeting_url TEXT,
        title TEXT NOT NULL,
        begin_time TEXT,
        end_time TEXT,
        status TEXT NOT NULL,
        summary_status TEXT NOT NULL CHECK(summary_status IN ('pending', 'completed', 'failed')),
        summary TEXT,
        summary_error TEXT,
        ended_at INTEGER,
        summary_posted_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS meetings_pending ON meetings(status, summary_status, summary_posted_at, updated_at);
    `)
    // A Harness event may be projected under more than one chat-visible id while legacy
    // records are normalized. The conversation/id primary key owns deduplication.
    this.database.exec(`
      DROP INDEX IF EXISTS messages_session_event;
      CREATE INDEX messages_session_event
        ON messages(session_id, session_seq) WHERE session_id IS NOT NULL AND session_seq IS NOT NULL;
    `)
    const current = this.database.prepare('SELECT value FROM archive_meta WHERE key = ?').get('schema_version')
    if (current !== undefined && (!Number.isSafeInteger(Number(current.value)) || Number(current.value) > SCHEMA_VERSION)) {
      throw new Error(`unsupported chatroom archive schema ${String(current.value)}`)
    }
    this.database.prepare(`INSERT INTO archive_meta (key, value) VALUES ('schema_version', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(String(SCHEMA_VERSION))
  }
}

function archivedMeeting(row: Record<string, unknown>): ArchivedMeeting {
  return {
    id: String(row.id),
    conversationKind: row.conversation_kind === 'direct' ? 'direct' : 'room',
    conversationId: String(row.conversation_id),
    ...(typeof row.external_meeting_id === 'string' ? { externalMeetingId: row.external_meeting_id } : {}),
    ...(typeof row.meeting_url === 'string' ? { meetingUrl: row.meeting_url } : {}),
    title: String(row.title),
    ...(typeof row.begin_time === 'string' ? { beginTime: row.begin_time } : {}),
    ...(typeof row.end_time === 'string' ? { endTime: row.end_time } : {}),
    status: String(row.status),
    summaryStatus: row.summary_status === 'completed' ? 'completed' : row.summary_status === 'failed' ? 'failed' : 'pending',
    ...(typeof row.summary === 'string' ? { summary: row.summary } : {}),
    ...(typeof row.summary_error === 'string' ? { summaryError: row.summary_error } : {}),
    ...(typeof row.ended_at === 'number' ? { endedAt: row.ended_at } : {}),
    ...(typeof row.summary_posted_at === 'number' ? { summaryPostedAt: row.summary_posted_at } : {}),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  }
}

function resolveArchiveRoot(configuredDirectory: string): string {
  if (configuredDirectory !== '') return configuredDirectory
  const dshHome = process.env.DSH_HOME?.trim()
  const base = dshHome === undefined || dshHome === '' ? join(homedir(), '.dsh') : dshHome
  return join(isAbsolute(base) ? base : resolve(base), 'chatroom')
}

function visibleSequence(messageId: string): number | undefined {
  const match = /^(?:user|steering):(\d+)$/u.exec(messageId)
  if (match === null) return undefined
  const value = Number(match[1])
  return Number.isSafeInteger(value) ? value : undefined
}

function isAlreadyExists(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'EEXIST'
}

function isMissing(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}
