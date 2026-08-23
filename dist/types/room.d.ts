import type { ServerResponse } from 'node:http';
import type { Context } from '@deepseek-ai/cordis';
import { type Session, type SessionEvent } from '@deepseek-ai/dsh-session';
import type { Config } from './config.js';
import { type ChatroomReactionEmoji } from './reactions.js';
import type { ChatroomFileReference, ChatroomForwardItem, ChatroomIdentity, ChatroomImageReference, ChatroomInfo, ChatroomMember, ChatroomPromptContentPart, ChatroomPromptResponse, ChatroomReaction, ChatroomReplyReference, ChatroomThreadResponse, ChatroomThreadRoot } from './types.js';
/** Runtime validation failure safe to return to a browser. */
export declare class ChatroomInputError extends Error {
}
/** Shared browser identities, room directory, presence, and native Harness Sessions. */
export declare class ChatroomRuntime {
    private readonly ctx;
    readonly config: Config;
    private readonly log;
    private domain;
    private identities;
    private roomRecords;
    private files;
    private members;
    private threads;
    private threadMessages;
    private reactions;
    private readonly states;
    private readonly threadStates;
    private readonly notificationClients;
    private ready;
    private stopping;
    constructor(ctx: Context, config: Config);
    /** Public metadata for the configured legacy room. */
    get room(): ChatroomInfo;
    /** Ordered public room directory. */
    get rooms(): readonly ChatroomInfo[];
    /** Current member roster for one room-management response. */
    membersForRoom(roomId: string): readonly ChatroomMember[];
    /** Maximum accepted JSON body for one text, image, and file room submission. */
    get maxPromptRequestBytes(): number;
    /** Whether identity persistence and the configured shared Session are ready. */
    get isReady(): boolean;
    /** Whether one model request belongs to a room or branch Session owned by this runtime. */
    ownsSession(sessionId: string): boolean;
    /** Open storage, seed the original room, and acquire its Session without blocking Harness startup. */
    start(): Promise<void>;
    /** Stop intake, close presence streams, and release every activated room. */
    stop(): Promise<void>;
    /** Resolve an opaque cookie token to its durable identity. */
    identity(token: string | undefined): ChatroomIdentity | undefined;
    /** Mint and durably bind a new browser identity. */
    createIdentity(displayName: string, avatarId?: string): Promise<{
        token: string;
        identity: ChatroomIdentity;
    }>;
    /** Update the display fields for one existing browser identity. */
    updateIdentity(token: string, displayName: string, avatarId?: string): Promise<ChatroomIdentity>;
    /** Revoke one browser identity token. */
    deleteIdentity(token: string | undefined): Promise<void>;
    /** Create and activate one independent shared Harness Session. */
    createRoom(title: string, identity: ChatroomIdentity): Promise<ChatroomInfo>;
    /** Activate an existing room and return its public metadata. */
    selectRoom(roomId: string, identity?: ChatroomIdentity): Promise<ChatroomInfo>;
    /** Rename one room as its owner or an administrator. */
    renameRoom(roomId: string, title: string, identity: ChatroomIdentity): Promise<ChatroomInfo>;
    /** Promote or demote one room member; only the owner controls administrators. */
    setMemberRole(roomId: string, participantId: string, role: 'admin' | 'member', identity: ChatroomIdentity): Promise<readonly ChatroomMember[]>;
    /** Append human chat immediately; wake the Agent only for an explicit AI mention. */
    submit(roomId: string, identity: ChatroomIdentity, content: readonly ChatroomPromptContentPart[], mode: 'queue' | 'steer', reply?: ChatroomReplyReference): Promise<ChatroomPromptResponse>;
    /** Toggle one participant reaction and replace its room-wide summary. */
    toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji, identity: ChatroomIdentity): Promise<ChatroomReaction>;
    /** Append selected messages as one merged-forward card in another room. */
    forwardMessages(sourceRoomId: string, targetRoomId: string, messages: readonly ChatroomForwardItem[], identity: ChatroomIdentity): Promise<ChatroomPromptResponse>;
    private resolveForwardItem;
    private forwardSourceBinding;
    /** Resolve one authenticated room-file download. */
    file(fileId: string): {
        readonly ref: ChatroomFileReference;
        readonly data: Uint8Array;
    };
    /** Resolve one forwarded image only when the durable source event still owns its attachment. */
    image(sourceRoomId: string, sourceSessionId: string, sourceSeq: number, ref: ChatroomImageReference): Promise<{
        readonly ref: ChatroomImageReference;
        readonly data: Uint8Array;
    }>;
    /** Attach one authenticated presence client to one room. */
    subscribe(roomId: string, identity: ChatroomIdentity, response: ServerResponse): () => void;
    /** Attach one identity to the global message-notification stream. */
    subscribeNotifications(identity: ChatroomIdentity, response: ServerResponse): () => void;
    /** Create or reopen a branch rooted at one native room message. */
    openThread(roomId: string, identity: ChatroomIdentity, root: ChatroomThreadRoot): Promise<ChatroomThreadResponse>;
    /** Append one branch message and wake only that branch Agent on an AI mention. */
    submitThread(threadId: string, identity: ChatroomIdentity, text: string, reply?: ChatroomReplyReference): Promise<ChatroomPromptResponse>;
    submitThread(threadId: string, identity: ChatroomIdentity, content: readonly ChatroomPromptContentPart[], mode: 'queue' | 'steer', reply?: ChatroomReplyReference): Promise<ChatroomPromptResponse>;
    /** Project committed AI output into its parent room or branch stream. */
    handleSessionEvent(session: Session, event: SessionEvent): void;
    private createThread;
    private ensureThread;
    private recordThreadAssistant;
    private messagesForThread;
    private threadPreview;
    private threadPreviewsForRoom;
    private nextThreadSequence;
    private touchMember;
    private roomMembers;
    private reactionsForRoom;
    private reactionSummary;
    private notify;
    private seedConfiguredRoom;
    private ensureRoom;
    private activateRoom;
    private ensureRoomVisible;
    private acquireAgent;
    /** Ensure one shared Session uses native Workspace navigation. */
    private attachWorkspace;
    private durableContent;
    private validateFiles;
    private fileRecord;
    private resizeImage;
    private broadcastPresence;
    private broadcast;
    private assertReady;
    private requireRoom;
    private requireState;
    private requireIdentities;
    private requireRoomRecords;
    private requireFiles;
    private requireMembers;
    private requireThreads;
    private requireThreadMessages;
    private requireReactions;
    private requireThreadState;
    private assertRoomManager;
}
//# sourceMappingURL=room.d.ts.map