import { z } from 'zod'
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import type { ChatroomMessageRole, ChatroomThreadRoot } from './types.js'
import type { ChatroomAvatarId } from './avatars.js'
import { isChatroomAvatarId } from './avatars.js'

const nonNegativeSafeInteger = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)

export interface IdentityRecord {
  readonly participantId: string
  readonly displayName: string
  readonly avatarId?: ChatroomAvatarId
  readonly createdAt: number
  readonly lastSeenAt: number
}

export interface FileRecord {
  readonly id: string
  readonly roomId: string
  readonly participantId: string
  readonly displayName: string
  readonly name: string
  readonly mediaType: string
  readonly bytes: number
  readonly data: string
  readonly createdAt: number
}

export interface MessageRecord {
  readonly id: string
  readonly sequence: number
  readonly role: ChatroomMessageRole
  readonly participantId: string
  readonly displayName: string
  readonly text: string
  readonly createdAt: number
  readonly inReplyTo?: string
  readonly aiProcessed?: boolean
}

export interface RoomRecord {
  readonly id: string
  readonly title: string
  readonly aiDisplayName: string
  readonly sessionId: string
  readonly createdAt: number
  readonly createdBy: string
}

export interface MemberRecord {
  readonly roomId: string
  readonly participantId: string
  readonly displayName: string
  readonly avatarId: ChatroomAvatarId
  readonly joinedAt: number
  readonly lastSeenAt: number
}

export interface ThreadRecord {
  readonly id: string
  readonly roomId: string
  readonly root: ChatroomThreadRoot
  readonly sessionId: string
  readonly createdAt: number
  readonly createdBy: string
}

export interface ThreadMessageRecord {
  readonly id: string
  readonly threadId: string
  readonly sequence: number
  readonly role: ChatroomMessageRole
  readonly participantId: string
  readonly displayName: string
  readonly avatarId?: ChatroomAvatarId
  readonly text: string
  readonly createdAt: number
}

const identitySchema = z.object({
  participantId: z.uuid(),
  displayName: z.string().min(1),
  avatarId: z.string().refine(isChatroomAvatarId).optional(),
  createdAt: nonNegativeSafeInteger,
  lastSeenAt: nonNegativeSafeInteger,
}).refine(record => record.lastSeenAt >= record.createdAt, {
  path: ['lastSeenAt'],
  message: 'lastSeenAt must not precede createdAt',
}) as z.ZodType<IdentityRecord>

const messageSchema = z.object({
  id: z.string().min(1),
  sequence: nonNegativeSafeInteger,
  role: z.union([z.literal('human'), z.literal('ai')]),
  participantId: z.string().min(1),
  displayName: z.string().min(1),
  text: z.string().min(1),
  createdAt: nonNegativeSafeInteger,
  inReplyTo: z.string().min(1).optional(),
  aiProcessed: z.boolean().optional(),
}) as z.ZodType<MessageRecord>

const fileSchema = z.object({
  id: z.uuid(),
  roomId: z.string().min(1),
  participantId: z.string().min(1),
  displayName: z.string().min(1),
  name: z.string().min(1),
  mediaType: z.string().min(1),
  bytes: nonNegativeSafeInteger,
  data: z.string().min(1),
  createdAt: nonNegativeSafeInteger,
}) as z.ZodType<FileRecord>

const roomSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  aiDisplayName: z.string().min(1),
  sessionId: z.string().min(1),
  createdAt: nonNegativeSafeInteger,
  createdBy: z.string().min(1),
}) as z.ZodType<RoomRecord>

const memberSchema = z.object({
  roomId: z.string().min(1),
  participantId: z.string().min(1),
  displayName: z.string().min(1),
  avatarId: z.string().refine(isChatroomAvatarId),
  joinedAt: nonNegativeSafeInteger,
  lastSeenAt: nonNegativeSafeInteger,
}).refine(record => record.lastSeenAt >= record.joinedAt, {
  path: ['lastSeenAt'],
  message: 'lastSeenAt must not precede joinedAt',
}) as z.ZodType<MemberRecord>

const threadRootSchema = z.object({
  messageId: z.string().min(1),
  displayName: z.string().min(1),
  text: z.string().min(1),
  role: z.union([z.literal('human'), z.literal('ai')]),
})

const threadSchema = z.object({
  id: z.uuid(),
  roomId: z.string().min(1),
  root: threadRootSchema,
  sessionId: z.string().min(1),
  createdAt: nonNegativeSafeInteger,
  createdBy: z.string().min(1),
}) as z.ZodType<ThreadRecord>

const threadMessageSchema = z.object({
  id: z.uuid(),
  threadId: z.uuid(),
  sequence: nonNegativeSafeInteger,
  role: z.union([z.literal('human'), z.literal('ai')]),
  participantId: z.string().min(1),
  displayName: z.string().min(1),
  avatarId: z.string().refine(isChatroomAvatarId).optional(),
  text: z.string().min(1),
  createdAt: nonNegativeSafeInteger,
}) as z.ZodType<ThreadMessageRecord>

/** Durable identities, rooms, and the version-zero message table retained for on-disk compatibility. */
export const chatroomDomainSpec = defineDomain({
  name: 'chatroom',
  version: 0,
  tables: {
    identities: domainTable<string, IdentityRecord>(identitySchema),
    messages: domainTable<string, MessageRecord>(messageSchema),
    rooms: domainTable<string, RoomRecord>(roomSchema),
    files: domainTable<string, FileRecord>(fileSchema),
    members: domainTable<string, MemberRecord>(memberSchema),
    threads: domainTable<string, ThreadRecord>(threadSchema),
    thread_messages: domainTable<string, ThreadMessageRecord>(threadMessageSchema),
  },
})
