/** SQLite chat archive and content-addressed file storage owned by the chatroom plugin. */
import type { DatabaseSync } from 'node:sqlite';
export type ArchiveConversationKind = 'room' | 'thread' | 'direct';
export interface ArchiveMessageInput {
    readonly conversationId: string;
    readonly id: string;
    readonly sequence: number;
    readonly role: 'human' | 'ai';
    readonly senderId?: string;
    readonly displayName: string;
    readonly text: string;
    readonly createdAt: number;
    readonly sessionId?: string;
    readonly sessionSeq?: number;
    readonly modelMessageId?: string;
    readonly replyTo?: string;
    readonly content?: unknown;
}
export interface ArchivedMessageOwner {
    readonly senderId?: string;
    readonly modelMessageId?: string;
}
/** One SQLite conversation or message match after membership filtering. */
export interface ArchivedSearchHit {
    readonly kind: 'conversation' | 'message';
    readonly conversationId: string;
    readonly conversationKind: ArchiveConversationKind;
    readonly conversationTitle: string;
    readonly sessionId?: string;
    readonly parentId?: string;
    readonly messageId?: string;
    readonly role?: 'human' | 'ai';
    readonly displayName?: string;
    readonly text?: string;
    readonly createdAt: number;
}
export interface StoredBlob {
    readonly sha256: string;
    readonly storageKey: string;
}
export interface ArchiveAttachmentInput {
    readonly id: string;
    readonly roomId: string;
    readonly participantId: string;
    readonly displayName: string;
    readonly name: string;
    readonly mediaType: string;
    readonly bytes: number;
    readonly createdAt: number;
}
export type ArchivedMeetingSummaryStatus = 'pending' | 'completed' | 'failed';
/** Durable meeting lifecycle record shared by UI cards, automation, and external APIs. */
export interface ArchivedMeeting {
    readonly id: string;
    readonly conversationKind: 'room' | 'thread' | 'direct';
    readonly conversationId: string;
    readonly credentialOwnerParticipantId?: string;
    readonly externalMeetingId?: string;
    readonly meetingUrl?: string;
    readonly title: string;
    readonly beginTime?: string | undefined;
    readonly endTime?: string | undefined;
    readonly status: string;
    readonly summaryStatus: ArchivedMeetingSummaryStatus;
    readonly summary?: string | undefined;
    readonly summaryError?: string | undefined;
    readonly endedAt?: number;
    readonly summaryPostedAt?: number;
    readonly createdAt: number;
    readonly updatedAt: number;
}
/** Open the plugin database and blob root without depending on Harness persistence internals. */
export declare function openChatArchive(configuredDirectory: string): Promise<ChatArchive>;
/** Durable projections used for chat queries, recall semantics, exports, and attachment retrieval. */
export declare class ChatArchive {
    private readonly database;
    private readonly blobRoot;
    private readonly memoryBlobs;
    constructor(database: DatabaseSync, blobRoot: string | undefined);
    /** Close the SQLite connection after intake stops. */
    close(): void;
    /** Create or refresh one room, branch, or direct-conversation catalog entry. */
    upsertConversation(input: {
        readonly id: string;
        readonly kind: ArchiveConversationKind;
        readonly title: string;
        readonly createdAt: number;
        readonly updatedAt: number;
        readonly sessionId?: string;
        readonly parentId?: string;
    }): void;
    /** Record membership as a durable visibility and export relation. */
    upsertMember(conversationId: string, participantId: string, displayName: string, joinedAt: number): void;
    /** Project one committed chat message without duplicating a replayed Session event. */
    upsertMessage(input: ArchiveMessageInput): void;
    /** Resolve a visible UI id to its authoritative sender and model message id. */
    messageOwner(conversationId: string, messageId: string, sessionId?: string): ArchivedMessageOwner | undefined;
    /** Tombstone a message while retaining the record for audit and export. */
    recallMessage(conversationId: string, messageId: string, participantId: string, createdAt: number, sessionId?: string): void;
    /** Create or replace one meeting lifecycle projection. */
    upsertMeeting(input: ArchivedMeeting): void;
    /** Resolve one meeting lifecycle record by its plugin-owned public id. */
    meeting(id: string): ArchivedMeeting | undefined;
    /** Resolve lifecycle records for legacy cards that only persisted a meeting URL. */
    meetingsByUrl(meetingUrl: string): readonly ArchivedMeeting[];
    /** Whether one data-projection migration completed successfully. */
    projectionMigrationComplete(name: string): boolean;
    /** Persist completion only after a data-projection migration scans every source. */
    completeProjectionMigration(name: string): void;
    /** List meetings that still need provider polling, summarization, or group delivery. */
    pendingMeetings(): readonly ArchivedMeeting[];
    /** List completed summaries for authenticated external consumers. */
    meetingSummaries(limit?: number): readonly ArchivedMeeting[];
    /** Search only conversations and messages visible to one participant. */
    search(participantId: string, query: string, limit?: number): readonly ArchivedSearchHit[];
    /** Model message ids excluded from future requests after recall. */
    recalledMessageIds(sessionId: string): ReadonlySet<string>;
    /** Persist bytes once by SHA-256 and return an opaque storage reference. */
    putBlob(data: Uint8Array): Promise<StoredBlob>;
    /** Store file bytes and their durable metadata as one plugin-owned attachment. */
    putAttachment(input: ArchiveAttachmentInput, data: Uint8Array): Promise<StoredBlob>;
    /** Read one content-addressed blob by the reference stored in file metadata. */
    readBlob(storageKey: string): Uint8Array;
    private initialize;
    private migrateMeetingConversationKinds;
    private addMeetingCredentialOwners;
}
//# sourceMappingURL=archive.d.ts.map