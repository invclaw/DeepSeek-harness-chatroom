import { z } from 'zod'
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import type { ChatroomMessageRole } from './types.js'

const nonNegativeSafeInteger = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)

export interface IdentityRecord {
  readonly participantId: string
  readonly displayName: string
  readonly createdAt: number
  readonly lastSeenAt: number
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

const identitySchema = z.object({
  participantId: z.uuid(),
  displayName: z.string().min(1),
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

const roomSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  aiDisplayName: z.string().min(1),
  sessionId: z.string().min(1),
  createdAt: nonNegativeSafeInteger,
  createdBy: z.string().min(1),
}) as z.ZodType<RoomRecord>

/** Durable identities, rooms, and the version-zero message table retained for on-disk compatibility. */
export const chatroomDomainSpec = defineDomain({
  name: 'chatroom',
  version: 0,
  tables: {
    identities: domainTable<string, IdentityRecord>(identitySchema),
    messages: domainTable<string, MessageRecord>(messageSchema),
    rooms: domainTable<string, RoomRecord>(roomSchema),
  },
})
