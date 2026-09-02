/** Shared JSON contracts between the Host room service and browser client. */

import type { ChatroomAvatarId } from './avatars.js'
import type { ChatroomReactionEmoji } from './reactions.js'

export type ChatroomMessageRole = 'human' | 'ai'
export type ChatroomMemberRole = 'owner' | 'admin' | 'member'
export type ChatroomAccountRole = 'super-admin' | 'admin' | 'member'
export type ChatroomAccountStatus = 'active' | 'disabled'

/** Public participant identity bound to one opaque browser session. */
export interface ChatroomIdentity {
  readonly participantId: string
  readonly displayName: string
  readonly avatarId: ChatroomAvatarId
  readonly avatarUrl?: string
}

/** Compact identity fields used to compose a room avatar in native session surfaces. */
export type ChatroomRoomAvatar = Pick<ChatroomIdentity, 'participantId' | 'avatarId' | 'avatarUrl'>

/** Signed-in platform account projected without credential material. */
export interface ChatroomAccount extends ChatroomIdentity {
  readonly username: string
  /** Whether this account has a locally managed password. */
  readonly passwordManaged?: boolean
  readonly role: ChatroomAccountRole
  readonly status: ChatroomAccountStatus
  readonly createdAt: number
  readonly lastLoginAt?: number
}

/** One enabled external sign-in choice. */
export interface ChatroomAuthProvider {
  readonly id: string
  readonly type: 'oidc' | 'dsh-auth'
  readonly label: string
}

/** Authentication state returned before any room data is exposed. */
export interface ChatroomAuthState {
  readonly enabled: boolean
  readonly authenticated: boolean
  readonly authMode?: 'local' | 'hybrid' | 'dsh-auth-only'
  readonly account?: ChatroomAccount
  readonly providers: readonly ChatroomAuthProvider[]
  /** Configured provider that bypasses the chooser for ordinary unauthenticated entry. */
  readonly autoRedirectProvider?: ChatroomAuthProvider
  readonly allowSelfRegistration: boolean
  readonly bootstrapRequired: boolean
}

/** Super-administrator view of one configurable OIDC provider. */
export interface ChatroomAuthProviderAdmin extends ChatroomAuthProvider {
  readonly enabled: boolean
  readonly issuer: string
  readonly clientId: string
  readonly hasClientSecret: boolean
  readonly scopes: string
  readonly usernameClaim: string
  readonly displayNameClaim: string
  readonly autoCreateUsers: boolean
}

/** Super-administrator snapshot for account and provider management. */
export interface ChatroomAdminOverview {
  readonly users: readonly ChatroomAccount[]
  readonly providers: readonly ChatroomAuthProviderAdmin[]
  readonly loginProviders: readonly ChatroomAuthProvider[]
  readonly autoRedirectProviderId?: string
  readonly allowSelfRegistration: boolean
  readonly oidcCallbackBase: string
}

/** One selectable model route for deciding whether ordinary room chat should wake the AI. */
export interface ChatroomAutomationModel {
  readonly provider: string
  readonly model: string
  readonly label: string
}

/** Global automatic-response policy and the model routes available to its administrator. */
export interface ChatroomAutomationOverview {
  readonly canManage: boolean
  readonly provider: string
  readonly model: string
  readonly meetingSummaryProvider: string
  readonly meetingSummaryModel: string
  readonly mainAgentPrompt: string
  readonly controllerPrompt: string
  readonly models: readonly ChatroomAutomationModel[]
}

/** One room member projected with current presence. */
export interface ChatroomMember extends ChatroomIdentity {
  readonly role?: ChatroomMemberRole | undefined
  readonly joinedAt: number
  readonly lastSeenAt: number
  readonly online: boolean
}

/** One active platform account that a room manager may add to the current room. */
export interface ChatroomRoomInviteCandidate extends ChatroomIdentity {
  readonly username: string
}

/** Durable reply metadata rendered as a quote and retained in model-visible text. */
export interface ChatroomReplyReference {
  readonly messageId: string
  readonly displayName: string
  readonly text: string
}

/** Download metadata for one plugin-owned room file. */
export interface ChatroomFileReference {
  readonly id: string
  readonly name: string
  readonly mediaType: string
  readonly bytes: number
}

/** Durable image metadata safe to carry inside forwarded-message cards. */
export interface ChatroomImageReference {
  readonly attachmentId: string
  readonly mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'
  readonly bytes: number
  readonly width: number
  readonly height: number
  readonly name?: string
}

/** Authenticated source coordinates used to read one image retained by a forwarded event. */
export interface ChatroomForwardImageRequest {
  readonly sourceRoomId: string
  readonly sourceSessionId: string
  readonly sourceSeq: number
  readonly image: ChatroomImageReference
}

/** One preserved content block inside a forwarded message. */
export type ChatroomForwardContentPart =
  | { readonly type: 'text'; readonly text: string; readonly markdown: boolean }
  | { readonly type: 'image'; readonly image: ChatroomImageReference }
  | { readonly type: 'file'; readonly file: ChatroomFileReference }

/** Reaction snapshot retained on a forwarded message. */
export interface ChatroomForwardReaction {
  readonly emoji: ChatroomReactionEmoji
  readonly count: number
}

/** One durable reaction summary for a native room message. */
export interface ChatroomReaction {
  readonly roomId: string
  readonly messageId: string
  readonly emoji: ChatroomReactionEmoji
  readonly participantIds: readonly string[]
}

/** Durable tombstone for a participant-recalled room or branch message. */
export interface ChatroomRecall {
  readonly roomId: string
  readonly messageId: string
  readonly participantId: string
  readonly createdAt: number
}

/** One selected message included in a merged forward. */
export interface ChatroomForwardItem {
  readonly messageId: string
  readonly sourceSessionId?: string
  readonly sourceSeq?: number
  readonly role: ChatroomMessageRole
  readonly displayName: string
  readonly text: string
  readonly createdAt: number
  readonly content?: readonly ChatroomForwardContentPart[]
  readonly reply?: ChatroomReplyReference
  readonly reactions?: readonly ChatroomForwardReaction[]
  readonly forward?: ChatroomForwardBundle
}

/** Durable merged-forward metadata rendered as one expandable message card. */
export interface ChatroomForwardBundle {
  readonly sourceRoomId: string
  readonly sourceRoomTitle: string
  readonly items: readonly ChatroomForwardItem[]
}

/** One persisted room message delivered to every connected participant. */
export interface ChatroomMessage {
  readonly id: string
  readonly sequence: number
  readonly role: ChatroomMessageRole
  readonly participantId: string
  readonly displayName: string
  readonly text: string
  readonly createdAt: number
  readonly inReplyTo?: string
}

/** Public room metadata stable for one plugin configuration. */
export interface ChatroomInfo {
  readonly id: string
  readonly title: string
  readonly aiDisplayName: string
  readonly sessionId: string
  readonly updatedAt?: number
  readonly pinned?: boolean
  readonly autoTriggerEnabled?: boolean
  /** Last native Session event excluded from subsequent AI requests. */
  readonly aiContextResetSeq?: number
  /** First participant message displayed after the latest AI-context reset. */
  readonly aiContextStartSeq?: number
  /** Up to nine member avatars used by compact room-directory surfaces. */
  readonly memberAvatarIds?: readonly ChatroomAvatarId[]
  readonly memberAvatars?: readonly ChatroomRoomAvatar[]
}

/** Result of one room-management mutation. */
export interface ChatroomRoomManageResponse {
  readonly room: ChatroomInfo
  readonly members: readonly ChatroomMember[]
}

/** Stop one room's Agent turn or reset its AI context without replacing the visible transcript. */
export interface ChatroomRoomSessionRequest {
  readonly roomId: string
  readonly action: 'stop' | 'new'
}

/** Rich Enterprise WeChat object embedded in a room transcript. */
export type ChatroomExternalCard = ChatroomMeetingCard | ChatroomDocumentCard

/** Scheduled Enterprise WeChat meeting rendered as a native room card. */
export interface ChatroomMeetingCard {
  readonly kind: 'meeting'
  /** Plugin-owned public identifier used to resolve live status without exposing the provider id. */
  readonly id?: string
  readonly title: string
  readonly beginTime?: string
  readonly endTime?: string
  readonly url?: string
  readonly location?: string
  readonly status?: string
  readonly attendees?: readonly string[]
}

/** Enterprise WeChat document rendered as a native room card. */
export interface ChatroomDocumentCard {
  readonly kind: 'document'
  readonly title: string
  readonly documentType?: string
  readonly url?: string
  readonly modifiedAt?: string
  readonly owner?: string
}

/** Explicit request for a default Enterprise WeChat online meeting. */
export interface ChatroomQuickMeetingRequest {
  readonly roomId?: string
  readonly threadId?: string
  readonly directConversationId?: string
}

/** Deployment-wide Enterprise WeChat authorization state. */
export interface ChatroomWecomAuthorizationState {
  readonly enabled: boolean
  readonly status: 'authorized' | 'unauthorized' | 'pending'
  readonly qrAvailable: boolean
  readonly canManage: boolean
  readonly error?: string
}

/** Durable state and AI summary for one Enterprise WeChat meeting. */
export interface ChatroomMeetingSummary {
  readonly id: string
  readonly conversationKind: 'room' | 'thread' | 'direct'
  readonly conversationId: string
  readonly title: string
  readonly status: string
  readonly summaryStatus: 'pending' | 'completed' | 'failed'
  readonly beginTime?: string
  readonly endTime?: string
  readonly summary?: string
  readonly summaryError?: string
  readonly endedAt?: number
  readonly updatedAt: number
}

/** Result of creating and posting a quick Enterprise WeChat meeting. */
export interface ChatroomQuickMeetingResponse {
  readonly accepted: true
  readonly card: ChatroomMeetingCard
}

/** Manager-only room roster plus active platform accounts that are not members yet. */
export interface ChatroomRoomManagementResponse extends ChatroomRoomManageResponse {
  readonly candidates: readonly ChatroomRoomInviteCandidate[]
}

/** Initial identity lookup result. */
export interface ChatroomSessionResponse {
  readonly auth: ChatroomAuthState
  readonly identity: ChatroomIdentity | null
  readonly rooms: readonly ChatroomInfo[]
  /** Native Solo Sessions owned by the authenticated identity. */
  readonly soloSessionIds: readonly string[]
  /** Configured legacy room retained during rolling browser bundle upgrades after authentication. */
  readonly room?: ChatroomInfo
}

/** Result of reserving one identity-owned native Solo Session id. */
export interface ChatroomSoloSessionResponse {
  readonly sessionId: string
}

/** One peer available for private messaging. */
export interface ChatroomDirectPeer extends ChatroomIdentity {
  readonly username: string
}

/** Private two-account conversation metadata. */
export interface ChatroomDirectConversation {
  readonly id: string
  readonly peer: ChatroomDirectPeer
  readonly createdAt: number
  readonly updatedAt: number
}

/** One reaction summary attached to a durable private message. */
export interface ChatroomDirectReaction {
  readonly emoji: ChatroomReactionEmoji
  readonly participantIds: readonly string[]
}

/** One durable private message with optional downloadable media. */
export interface ChatroomDirectMessage {
  readonly id: string
  readonly conversationId: string
  readonly sequence: number
  readonly senderId: string
  readonly text: string
  readonly files?: readonly ChatroomFileReference[]
  readonly reply?: ChatroomReplyReference
  readonly reactions?: readonly ChatroomDirectReaction[]
  readonly card?: ChatroomExternalCard
  readonly createdAt: number
}

/** Private-message directory and the selected conversation history. */
export interface ChatroomDirectResponse {
  readonly peers: readonly ChatroomDirectPeer[]
  readonly conversations: readonly ChatroomDirectConversation[]
  readonly conversation?: ChatroomDirectConversation
  readonly messages?: readonly ChatroomDirectMessage[]
}

/** One visibility-filtered global search result. */
export interface ChatroomSearchResult {
  readonly id: string
  readonly kind: 'account' | 'room' | 'thread' | 'direct' | 'message'
  readonly title: string
  readonly subtitle: string
  readonly preview?: string
  readonly participantId?: string
  readonly conversationKind?: 'room' | 'thread' | 'direct'
  readonly conversationId?: string
  readonly sessionId?: string
  readonly messageId?: string
  readonly createdAt?: number
}

/** Global account, conversation, and message matches for one query. */
export interface ChatroomSearchResponse {
  readonly query: string
  readonly results: readonly ChatroomSearchResult[]
}

/** Room directory response. */
export interface ChatroomRoomsResponse {
  readonly rooms: readonly ChatroomInfo[]
}

/** One selected or newly created room. */
export interface ChatroomRoomResponse {
  readonly room: ChatroomInfo
}

export type ChatroomPromptContentPart =
  | { readonly type: 'text'; readonly text: string }
  | {
    readonly type: 'image'
    readonly mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'
    readonly data: string
    readonly name?: string
  }
  | {
    readonly type: 'file'
    readonly mediaType: string
    readonly data: string
    readonly name: string
  }

/** Browser submission routed through human-first room admission. */
export interface ChatroomPromptRequest {
  readonly roomId: string
  readonly mode: 'queue' | 'steer'
  readonly content: readonly ChatroomPromptContentPart[]
  readonly reply?: ChatroomReplyReference
}

/** Whether one accepted room message woke the AI. */
export interface ChatroomPromptResponse {
  readonly accepted: true
  readonly aiTriggered: boolean
}

/** Mutation result for one AI prompt that has not entered a model turn yet. */
export interface ChatroomQueuedPromptActionResponse {
  readonly accepted: true
  readonly text: string
}

/** Toggle request for one participant and message reaction. */
export interface ChatroomReactionRequest {
  readonly roomId: string
  readonly messageId: string
  readonly emoji: ChatroomReactionEmoji
}

/** Merged-forward admission request. */
export interface ChatroomForwardRequest {
  readonly sourceRoomId: string
  readonly targetRoomId: string
  readonly messages: readonly ChatroomForwardItem[]
}

/** Root message used to create or reopen a branch conversation. */
export interface ChatroomThreadRoot extends ChatroomReplyReference {
  readonly role: ChatroomMessageRole
  readonly sourceSessionId?: string
  readonly sourceSeq?: number
}

/** Public branch metadata. */
export interface ChatroomThread {
  readonly id: string
  readonly roomId: string
  readonly root: ChatroomThreadRoot
  readonly sessionId: string
  readonly createdAt: number
}

/** One durable message rendered inside a branch panel. */
export interface ChatroomThreadMessage {
  readonly id: string
  readonly threadId: string
  readonly sequence: number
  readonly role: ChatroomMessageRole
  readonly participantId: string
  readonly displayName: string
  readonly avatarId?: ChatroomAvatarId
  readonly avatarUrl?: string
  readonly text: string
  readonly files?: readonly ChatroomFileReference[]
  readonly hasImages?: boolean
  readonly reply?: ChatroomReplyReference
  readonly card?: ChatroomExternalCard
  readonly createdAt: number
}

/** Branch lookup or creation response. */
export interface ChatroomThreadResponse {
  readonly thread: ChatroomThread
  readonly messages: readonly ChatroomThreadMessage[]
}

/** Compact branch activity projected beside its root room message. */
export interface ChatroomThreadPreview {
  readonly thread: ChatroomThread
  readonly totalMessages: number
  readonly recentMessages: readonly ChatroomThreadMessage[]
}

/** Branch text admission request. */
export interface ChatroomThreadPromptRequest {
  readonly threadId: string
  readonly mode: 'queue' | 'steer'
  readonly content: readonly ChatroomPromptContentPart[]
  readonly reply?: ChatroomReplyReference
}

/** Browser notification for a new human or AI message. */
export interface ChatroomNotification {
  readonly id: string
  readonly roomId: string
  readonly roomTitle: string
  readonly threadId?: string
  readonly participantId: string
  readonly displayName: string
  readonly role: ChatroomMessageRole
  readonly text: string
  readonly createdAt: number
}

/** Human room message already shared with participants while AI admission remains unsettled. */
export interface ChatroomPendingMessage {
  readonly messageId: string
  readonly roomId: string
  readonly participantId: string
  readonly displayName: string
  readonly avatarId?: ChatroomAvatarId
  readonly avatarUrl?: string
  readonly text: string
  readonly content: readonly ChatroomForwardContentPart[]
  readonly reply?: ChatroomReplyReference
  readonly forward?: ChatroomForwardBundle
  readonly createdAt: number
  readonly status: 'deciding' | 'queued' | 'passive' | 'guiding'
}

/** Full synchronization point sent when one SSE connection opens. */
export interface ChatroomSnapshotEvent {
  readonly type: 'snapshot'
  readonly room: ChatroomInfo
  readonly identity: ChatroomIdentity
  readonly online: number
  readonly members: readonly ChatroomMember[]
  readonly reactions: readonly ChatroomReaction[]
  readonly recalls?: readonly ChatroomRecall[]
  readonly threadPreviews: readonly ChatroomThreadPreview[]
  readonly pendingMessages?: readonly ChatroomPendingMessage[]
}

/** Complete replacement of transient room messages visible below the active AI reply. */
export interface ChatroomPendingMessagesEvent {
  readonly type: 'pending-messages'
  readonly messages: readonly ChatroomPendingMessage[]
}

/** Online connection count event. */
export interface ChatroomPresenceEvent {
  readonly type: 'presence'
  readonly online: number
  readonly members: readonly ChatroomMember[]
}

/** One branch message delivered to participants watching its parent room. */
export interface ChatroomThreadMessageEvent {
  readonly type: 'thread-message'
  readonly message: ChatroomThreadMessage
  readonly preview: ChatroomThreadPreview
}

/** One reaction replacement delivered to every participant in a room. */
export interface ChatroomReactionEvent {
  readonly type: 'reaction'
  readonly reaction: ChatroomReaction
}

/** One message-recall tombstone delivered to every participant in a room. */
export interface ChatroomRecallEvent {
  readonly type: 'message-recalled'
  readonly recall: ChatroomRecall
}

/** Room title or role roster replacement after a management mutation. */
export interface ChatroomRoomUpdatedEvent {
  readonly type: 'room-updated'
  readonly room: ChatroomInfo
  readonly members: readonly ChatroomMember[]
}

/** One global message alert delivered independently of active-room presence. */
export interface ChatroomNotificationEvent {
  readonly type: 'notification'
  readonly notification: ChatroomNotification
}

/** One private message delivered to both authenticated participants. */
export interface ChatroomDirectMessageEvent {
  readonly type: 'direct-message'
  readonly conversation: ChatroomDirectConversation
  readonly message: ChatroomDirectMessage
}

export type ChatroomGlobalEvent = ChatroomNotificationEvent | ChatroomDirectMessageEvent

export type ChatroomServerEvent =
  | ChatroomSnapshotEvent
  | ChatroomPresenceEvent
  | ChatroomPendingMessagesEvent
  | ChatroomThreadMessageEvent
  | ChatroomReactionEvent
  | ChatroomRecallEvent
  | ChatroomRoomUpdatedEvent

/** Browser-visible error envelope. */
export interface ChatroomErrorResponse {
  readonly error: string
}
