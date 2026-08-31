import type { ChatroomExternalCard, ChatroomFileReference, ChatroomMessageRole, ChatroomReplyReference, ChatroomThreadRoot } from './types.js';
import type { ChatroomReactionEmoji } from './reactions.js';
import type { ChatroomAvatarId } from './avatars.js';
export interface IdentityRecord {
    readonly participantId: string;
    readonly displayName: string;
    readonly avatarId?: ChatroomAvatarId;
    readonly avatarUrl?: string;
    readonly createdAt: number;
    readonly lastSeenAt: number;
}
export interface FileRecord {
    readonly id: string;
    readonly roomId: string;
    readonly participantId: string;
    readonly displayName: string;
    readonly name: string;
    readonly mediaType: string;
    readonly bytes: number;
    /** Legacy inline payload retained only until startup migration writes it to the blob store. */
    readonly data?: string;
    readonly sha256?: string;
    readonly storageKey?: string;
    readonly createdAt: number;
}
export interface MessageRecord {
    readonly id: string;
    readonly sequence: number;
    readonly role: ChatroomMessageRole;
    readonly participantId: string;
    readonly displayName: string;
    readonly text: string;
    readonly createdAt: number;
    readonly inReplyTo?: string;
    readonly aiProcessed?: boolean;
}
export interface RoomRecord {
    readonly id: string;
    readonly title: string;
    readonly aiDisplayName: string;
    readonly sessionId: string;
    readonly createdAt: number;
    readonly updatedAt?: number;
    readonly createdBy: string;
    readonly ownerParticipantId?: string;
    readonly adminParticipantIds?: readonly string[];
    readonly autoTriggerEnabled?: boolean;
    /** Last Session event excluded from later AI requests after starting a new AI conversation. */
    readonly aiContextResetSeq?: number;
    /** First participant message displayed after the latest AI-context reset. */
    readonly aiContextStartSeq?: number;
}
export interface RoomPreferenceRecord {
    readonly roomId: string;
    readonly participantId: string;
    readonly pinned: boolean;
    readonly updatedAt: number;
}
export interface AutomationSettingsRecord {
    readonly provider: string;
    readonly model: string;
    readonly mainAgentPrompt?: string;
    readonly controllerPrompt?: string;
    readonly updatedAt: number;
}
export interface MemberRecord {
    readonly roomId: string;
    readonly participantId: string;
    readonly displayName: string;
    readonly avatarId: ChatroomAvatarId;
    readonly avatarUrl?: string;
    readonly joinedAt: number;
    readonly lastSeenAt: number;
}
export interface ThreadRecord {
    readonly id: string;
    readonly roomId: string;
    readonly root: ChatroomThreadRoot;
    readonly sessionId: string;
    readonly createdAt: number;
    readonly createdBy: string;
    readonly rootContentVersion?: 1;
}
export interface ThreadMessageRecord {
    readonly id: string;
    readonly threadId: string;
    readonly sequence: number;
    readonly role: ChatroomMessageRole;
    readonly participantId: string;
    readonly displayName: string;
    readonly avatarId?: ChatroomAvatarId;
    readonly avatarUrl?: string;
    readonly text: string;
    readonly files?: readonly {
        readonly id: string;
        readonly name: string;
        readonly mediaType: string;
        readonly bytes: number;
    }[];
    readonly hasImages?: boolean;
    readonly reply?: ChatroomReplyReference;
    readonly createdAt: number;
    readonly modelMessageId?: string;
    readonly sessionSeq?: number;
}
export interface ReactionRecord {
    readonly roomId: string;
    readonly messageId: string;
    readonly emoji: ChatroomReactionEmoji;
    readonly participantId: string;
    readonly createdAt: number;
}
export interface RecallRecord {
    readonly roomId: string;
    readonly messageId: string;
    readonly participantId: string;
    readonly createdAt: number;
}
export type ChatroomAccountRole = 'super-admin' | 'admin' | 'member';
export type ChatroomAccountStatus = 'active' | 'disabled';
export interface AccountRecord {
    readonly id: string;
    readonly username: string;
    readonly usernameKey: string;
    readonly displayName: string;
    readonly avatarId: ChatroomAvatarId;
    readonly avatarUrl?: string;
    readonly externalProviderId?: string;
    readonly externalSubject?: string;
    readonly passwordHash?: string;
    readonly role: ChatroomAccountRole;
    readonly status: ChatroomAccountStatus;
    readonly createdAt: number;
    readonly updatedAt: number;
    readonly lastLoginAt?: number;
}
export interface AuthSessionRecord {
    readonly userId: string;
    readonly createdAt: number;
    readonly lastSeenAt: number;
    readonly expiresAt: number;
    readonly externalValidatedAt?: number;
}
export interface AuthSettingsRecord {
    readonly allowSelfRegistration: boolean;
    /** Undefined is a pre-setting state, null explicitly disables automatic external login. */
    readonly autoRedirectProviderId?: string | null;
    readonly updatedAt: number;
}
export interface AuthProviderRecord {
    readonly id: string;
    readonly type: 'oidc';
    readonly label: string;
    readonly enabled: boolean;
    readonly issuer: string;
    readonly clientId: string;
    readonly encryptedClientSecret: string;
    readonly scopes: string;
    readonly usernameClaim: string;
    readonly displayNameClaim: string;
    readonly autoCreateUsers: boolean;
    readonly createdAt: number;
    readonly updatedAt: number;
}
export interface ExternalAccountRecord {
    readonly providerId: string;
    readonly subject: string;
    readonly userId: string;
    readonly createdAt: number;
}
export interface DirectConversationRecord {
    readonly id: string;
    readonly participantIds: readonly [string, string];
    readonly createdAt: number;
    readonly updatedAt: number;
    readonly nextSequence: number;
}
export interface DirectMessageRecord {
    readonly id: string;
    readonly conversationId: string;
    readonly sequence: number;
    readonly senderId: string;
    readonly text: string;
    readonly files?: readonly ChatroomFileReference[];
    readonly card?: ChatroomExternalCard;
    readonly createdAt: number;
}
/** Durable identities, rooms, and the version-zero message table retained for on-disk compatibility. */
export declare const chatroomDomainSpec: {
    name: string;
    version: number;
    tables: {
        identities: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, IdentityRecord>;
        messages: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, MessageRecord>;
        rooms: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, RoomRecord>;
        room_preferences: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, RoomPreferenceRecord>;
        automation_settings: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, AutomationSettingsRecord>;
        files: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, FileRecord>;
        members: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, MemberRecord>;
        threads: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, ThreadRecord>;
        thread_messages: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, ThreadMessageRecord>;
        reactions: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, ReactionRecord>;
        recalls: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, RecallRecord>;
        accounts: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, AccountRecord>;
        auth_sessions: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, AuthSessionRecord>;
        auth_settings: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, AuthSettingsRecord>;
        auth_providers: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, AuthProviderRecord>;
        external_accounts: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, ExternalAccountRecord>;
        direct_conversations: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, DirectConversationRecord>;
        direct_messages: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, DirectMessageRecord>;
    };
};
//# sourceMappingURL=domain.d.ts.map