import { z } from 'zod'
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import type { ChatroomFileReference, ChatroomMessageRole, ChatroomReplyReference, ChatroomThreadRoot } from './types.js'
import type { ChatroomReactionEmoji } from './reactions.js'
import { isChatroomReactionEmoji } from './reactions.js'
import type { ChatroomAvatarId } from './avatars.js'
import { isChatroomAvatarId } from './avatars.js'

const nonNegativeSafeInteger = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)
const safeAvatarUrl = z.string().url().refine((value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.username === '' && url.password === '' && url.hash === ''
  } catch {
    return false
  }
}, 'avatarUrl must be an HTTPS URL without credentials or fragments')
const safeExternalText = z.string().min(1).refine((value) =>
  Buffer.byteLength(value, 'utf8') <= 512 && !/\p{C}/u.test(value),
  'external identity text must be at most 512 UTF-8 bytes without control characters')

export interface IdentityRecord {
  readonly participantId: string
  readonly displayName: string
  readonly avatarId?: ChatroomAvatarId
  readonly avatarUrl?: string
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
  /** Legacy inline payload retained only until startup migration writes it to the blob store. */
  readonly data?: string
  readonly sha256?: string
  readonly storageKey?: string
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
  readonly updatedAt?: number
  readonly createdBy: string
  readonly ownerParticipantId?: string
  readonly adminParticipantIds?: readonly string[]
  readonly autoTriggerEnabled?: boolean
  /** Last Session event excluded from later AI requests after starting a new AI conversation. */
  readonly aiContextResetSeq?: number
}

export interface RoomPreferenceRecord {
  readonly roomId: string
  readonly participantId: string
  readonly pinned: boolean
  readonly updatedAt: number
}

export interface AutomationSettingsRecord {
  readonly provider: string
  readonly model: string
  readonly mainAgentPrompt?: string
  readonly controllerPrompt?: string
  readonly updatedAt: number
}

export interface MemberRecord {
  readonly roomId: string
  readonly participantId: string
  readonly displayName: string
  readonly avatarId: ChatroomAvatarId
  readonly avatarUrl?: string
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
  readonly rootContentVersion?: 1
}

export interface ThreadMessageRecord {
  readonly id: string
  readonly threadId: string
  readonly sequence: number
  readonly role: ChatroomMessageRole
  readonly participantId: string
  readonly displayName: string
  readonly avatarId?: ChatroomAvatarId
  readonly avatarUrl?: string
  readonly text: string
  readonly files?: readonly {
    readonly id: string
    readonly name: string
    readonly mediaType: string
    readonly bytes: number
  }[]
  readonly hasImages?: boolean
  readonly reply?: ChatroomReplyReference
  readonly createdAt: number
  readonly modelMessageId?: string
  readonly sessionSeq?: number
}

export interface ReactionRecord {
  readonly roomId: string
  readonly messageId: string
  readonly emoji: ChatroomReactionEmoji
  readonly participantId: string
  readonly createdAt: number
}

export interface RecallRecord {
  readonly roomId: string
  readonly messageId: string
  readonly participantId: string
  readonly createdAt: number
}

export type ChatroomAccountRole = 'super-admin' | 'admin' | 'member'
export type ChatroomAccountStatus = 'active' | 'disabled'

export interface AccountRecord {
  readonly id: string
  readonly username: string
  readonly usernameKey: string
  readonly displayName: string
  readonly avatarId: ChatroomAvatarId
  readonly avatarUrl?: string
  readonly externalProviderId?: string
  readonly externalSubject?: string
  readonly passwordHash?: string
  readonly role: ChatroomAccountRole
  readonly status: ChatroomAccountStatus
  readonly createdAt: number
  readonly updatedAt: number
  readonly lastLoginAt?: number
}

export interface AuthSessionRecord {
  readonly userId: string
  readonly createdAt: number
  readonly lastSeenAt: number
  readonly expiresAt: number
  readonly externalValidatedAt?: number
}

export interface AuthSettingsRecord {
  readonly allowSelfRegistration: boolean
  /** Undefined is a pre-setting state, null explicitly disables automatic external login. */
  readonly autoRedirectProviderId?: string | null
  readonly updatedAt: number
}

export interface AuthProviderRecord {
  readonly id: string
  readonly type: 'oidc'
  readonly label: string
  readonly enabled: boolean
  readonly issuer: string
  readonly clientId: string
  readonly encryptedClientSecret: string
  readonly scopes: string
  readonly usernameClaim: string
  readonly displayNameClaim: string
  readonly autoCreateUsers: boolean
  readonly createdAt: number
  readonly updatedAt: number
}

export interface ExternalAccountRecord {
  readonly providerId: string
  readonly subject: string
  readonly userId: string
  readonly createdAt: number
}

export interface DirectConversationRecord {
  readonly id: string
  readonly participantIds: readonly [string, string]
  readonly createdAt: number
  readonly updatedAt: number
  readonly nextSequence: number
}

export interface DirectMessageRecord {
  readonly id: string
  readonly conversationId: string
  readonly sequence: number
  readonly senderId: string
  readonly text: string
  readonly files?: readonly ChatroomFileReference[]
  readonly createdAt: number
}

const identitySchema = z.object({
  participantId: z.uuid(),
  displayName: z.string().min(1),
  avatarId: z.string().refine(isChatroomAvatarId).optional(),
  avatarUrl: safeAvatarUrl.optional(),
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
  data: z.string().min(1).optional(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/u).optional(),
  storageKey: z.string().min(1).optional(),
  createdAt: nonNegativeSafeInteger,
}).refine(record => record.data !== undefined || (record.sha256 !== undefined && record.storageKey !== undefined), {
  message: 'file payload must be inline or reference the blob store',
}) as z.ZodType<FileRecord>

const roomSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  aiDisplayName: z.string().min(1),
  sessionId: z.string().min(1),
  createdAt: nonNegativeSafeInteger,
  updatedAt: nonNegativeSafeInteger.optional(),
  createdBy: z.string().min(1),
  ownerParticipantId: z.string().min(1).optional(),
  adminParticipantIds: z.array(z.string().min(1)).optional(),
  autoTriggerEnabled: z.boolean().optional(),
  aiContextResetSeq: nonNegativeSafeInteger.optional(),
}) as z.ZodType<RoomRecord>

const roomPreferenceSchema = z.object({
  roomId: z.string().min(1),
  participantId: z.string().min(1),
  pinned: z.boolean(),
  updatedAt: nonNegativeSafeInteger,
}) as z.ZodType<RoomPreferenceRecord>

const automationSettingsSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  mainAgentPrompt: z.string().optional(),
  controllerPrompt: z.string().optional(),
  updatedAt: nonNegativeSafeInteger,
}) as z.ZodType<AutomationSettingsRecord>

const memberSchema = z.object({
  roomId: z.string().min(1),
  participantId: z.string().min(1),
  displayName: z.string().min(1),
  avatarId: z.string().refine(isChatroomAvatarId),
  avatarUrl: safeAvatarUrl.optional(),
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
  sourceSessionId: z.string().min(1).optional(),
  sourceSeq: nonNegativeSafeInteger.optional(),
})

const replySchema = z.object({
  messageId: z.string().min(1),
  displayName: z.string().min(1),
  text: z.string().min(1),
})

const threadSchema = z.object({
  id: z.uuid(),
  roomId: z.string().min(1),
  root: threadRootSchema,
  sessionId: z.string().min(1),
  createdAt: nonNegativeSafeInteger,
  createdBy: z.string().min(1),
  rootContentVersion: z.literal(1).optional(),
}) as z.ZodType<ThreadRecord>

const threadMessageSchema = z.object({
  id: z.uuid(),
  threadId: z.uuid(),
  sequence: nonNegativeSafeInteger,
  role: z.union([z.literal('human'), z.literal('ai')]),
  participantId: z.string().min(1),
  displayName: z.string().min(1),
  avatarId: z.string().refine(isChatroomAvatarId).optional(),
  avatarUrl: safeAvatarUrl.optional(),
  text: z.string().min(1),
  files: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    mediaType: z.string().min(1),
    bytes: nonNegativeSafeInteger,
  })).optional(),
  hasImages: z.boolean().optional(),
  reply: replySchema.optional(),
  createdAt: nonNegativeSafeInteger,
  modelMessageId: z.string().min(1).optional(),
  sessionSeq: nonNegativeSafeInteger.optional(),
}) as z.ZodType<ThreadMessageRecord>

const reactionSchema = z.object({
  roomId: z.string().min(1),
  messageId: z.string().min(1),
  emoji: z.string().refine(isChatroomReactionEmoji),
  participantId: z.string().min(1),
  createdAt: nonNegativeSafeInteger,
}) as z.ZodType<ReactionRecord>

const recallSchema = z.object({
  roomId: z.string().min(1),
  messageId: z.string().min(1),
  participantId: z.string().min(1),
  createdAt: nonNegativeSafeInteger,
}) as z.ZodType<RecallRecord>

const accountSchema = z.object({
  id: z.uuid(),
  username: z.string().min(1),
  usernameKey: z.string().min(1),
  displayName: z.string().min(1),
  avatarId: z.string().refine(isChatroomAvatarId),
  avatarUrl: safeAvatarUrl.optional(),
  externalProviderId: z.string().min(1).optional(),
  externalSubject: safeExternalText.optional(),
  passwordHash: z.string().min(1).optional(),
  role: z.union([z.literal('super-admin'), z.literal('admin'), z.literal('member')]),
  status: z.union([z.literal('active'), z.literal('disabled')]),
  createdAt: nonNegativeSafeInteger,
  updatedAt: nonNegativeSafeInteger,
  lastLoginAt: nonNegativeSafeInteger.optional(),
}) as z.ZodType<AccountRecord>

const authSessionSchema = z.object({
  userId: z.uuid(),
  createdAt: nonNegativeSafeInteger,
  lastSeenAt: nonNegativeSafeInteger,
  expiresAt: nonNegativeSafeInteger,
  externalValidatedAt: nonNegativeSafeInteger.optional(),
}) as z.ZodType<AuthSessionRecord>

const authSettingsSchema = z.object({
  allowSelfRegistration: z.boolean(),
  autoRedirectProviderId: z.string().min(1).nullable().optional(),
  updatedAt: nonNegativeSafeInteger,
}) as z.ZodType<AuthSettingsRecord>

const authProviderSchema = z.object({
  id: z.string().min(1),
  type: z.literal('oidc'),
  label: z.string().min(1),
  enabled: z.boolean(),
  issuer: z.string().url(),
  clientId: z.string().min(1),
  encryptedClientSecret: z.string().min(1),
  scopes: z.string().min(1),
  usernameClaim: z.string().min(1),
  displayNameClaim: z.string().min(1),
  autoCreateUsers: z.boolean(),
  createdAt: nonNegativeSafeInteger,
  updatedAt: nonNegativeSafeInteger,
}) as z.ZodType<AuthProviderRecord>

const externalAccountSchema = z.object({
  providerId: z.string().min(1),
  subject: safeExternalText,
  userId: z.uuid(),
  createdAt: nonNegativeSafeInteger,
}) as z.ZodType<ExternalAccountRecord>

const directConversationSchema = z.object({
  id: z.uuid(),
  participantIds: z.tuple([z.uuid(), z.uuid()]),
  createdAt: nonNegativeSafeInteger,
  updatedAt: nonNegativeSafeInteger,
  nextSequence: nonNegativeSafeInteger,
}) as z.ZodType<DirectConversationRecord>

const directMessageSchema = z.object({
  id: z.uuid(),
  conversationId: z.uuid(),
  sequence: nonNegativeSafeInteger,
  senderId: z.uuid(),
  text: z.string(),
  files: z.array(z.object({
    id: z.uuid(),
    name: z.string().min(1),
    mediaType: z.string().min(1),
    bytes: nonNegativeSafeInteger,
  })).optional(),
  createdAt: nonNegativeSafeInteger,
}).refine(record => record.text.trim() !== '' || (record.files?.length ?? 0) > 0, {
  message: 'direct message must include text or files',
}) as z.ZodType<DirectMessageRecord>

/** Durable identities, rooms, and the version-zero message table retained for on-disk compatibility. */
export const chatroomDomainSpec = defineDomain({
  name: 'chatroom',
  version: 0,
  tables: {
    identities: domainTable<string, IdentityRecord>(identitySchema),
    messages: domainTable<string, MessageRecord>(messageSchema),
    rooms: domainTable<string, RoomRecord>(roomSchema),
    room_preferences: domainTable<string, RoomPreferenceRecord>(roomPreferenceSchema),
    automation_settings: domainTable<string, AutomationSettingsRecord>(automationSettingsSchema),
    files: domainTable<string, FileRecord>(fileSchema),
    members: domainTable<string, MemberRecord>(memberSchema),
    threads: domainTable<string, ThreadRecord>(threadSchema),
    thread_messages: domainTable<string, ThreadMessageRecord>(threadMessageSchema),
    reactions: domainTable<string, ReactionRecord>(reactionSchema),
    recalls: domainTable<string, RecallRecord>(recallSchema),
    accounts: domainTable<string, AccountRecord>(accountSchema),
    auth_sessions: domainTable<string, AuthSessionRecord>(authSessionSchema),
    auth_settings: domainTable<string, AuthSettingsRecord>(authSettingsSchema),
    auth_providers: domainTable<string, AuthProviderRecord>(authProviderSchema),
    external_accounts: domainTable<string, ExternalAccountRecord>(externalAccountSchema),
    direct_conversations: domainTable<string, DirectConversationRecord>(directConversationSchema),
    direct_messages: domainTable<string, DirectMessageRecord>(directMessageSchema),
  },
})
