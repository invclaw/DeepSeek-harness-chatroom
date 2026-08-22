import type { ChatroomMessageRole, ChatroomThreadRoot } from './types.js';
import type { ChatroomReactionEmoji } from './reactions.js';
import type { ChatroomAvatarId } from './avatars.js';
export interface IdentityRecord {
    readonly participantId: string;
    readonly displayName: string;
    readonly avatarId?: ChatroomAvatarId;
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
    readonly data: string;
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
    readonly createdBy: string;
}
export interface MemberRecord {
    readonly roomId: string;
    readonly participantId: string;
    readonly displayName: string;
    readonly avatarId: ChatroomAvatarId;
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
}
export interface ThreadMessageRecord {
    readonly id: string;
    readonly threadId: string;
    readonly sequence: number;
    readonly role: ChatroomMessageRole;
    readonly participantId: string;
    readonly displayName: string;
    readonly avatarId?: ChatroomAvatarId;
    readonly text: string;
    readonly createdAt: number;
}
export interface ReactionRecord {
    readonly roomId: string;
    readonly messageId: string;
    readonly emoji: ChatroomReactionEmoji;
    readonly participantId: string;
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
        files: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, FileRecord>;
        members: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, MemberRecord>;
        threads: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, ThreadRecord>;
        thread_messages: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, ThreadMessageRecord>;
        reactions: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, ReactionRecord>;
    };
};
//# sourceMappingURL=domain.d.ts.map