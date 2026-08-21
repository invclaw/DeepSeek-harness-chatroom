import type { ServerResponse } from 'node:http';
import type { Context } from '@deepseek-ai/cordis';
import type { Config } from './config.js';
import type { ChatroomFileReference, ChatroomIdentity, ChatroomInfo, ChatroomPromptContentPart, ChatroomPromptResponse, ChatroomReplyReference } from './types.js';
/** Runtime validation failure safe to return to a browser. */
export declare class ChatroomInputError extends Error {
}
/** Shared browser identities, room directory, presence, and native Harness Sessions. */
export declare class ChatroomRuntime {
    private readonly ctx;
    readonly config: Config;
    private domain;
    private identities;
    private roomRecords;
    private files;
    private readonly states;
    private ready;
    private stopping;
    constructor(ctx: Context, config: Config);
    /** Public metadata for the configured legacy room. */
    get room(): ChatroomInfo;
    /** Ordered public room directory. */
    get rooms(): readonly ChatroomInfo[];
    /** Maximum accepted JSON body for one text, image, and file room submission. */
    get maxPromptRequestBytes(): number;
    /** Whether identity persistence and the configured shared Session are ready. */
    get isReady(): boolean;
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
    /** Revoke one browser identity token. */
    deleteIdentity(token: string | undefined): Promise<void>;
    /** Create and activate one independent shared Harness Session. */
    createRoom(title: string, identity: ChatroomIdentity): Promise<ChatroomInfo>;
    /** Activate an existing room and return its public metadata. */
    selectRoom(roomId: string): Promise<ChatroomInfo>;
    /** Append human chat immediately; wake the Agent only for an explicit AI mention. */
    submit(roomId: string, identity: ChatroomIdentity, content: readonly ChatroomPromptContentPart[], mode: 'queue' | 'steer', reply?: ChatroomReplyReference): Promise<ChatroomPromptResponse>;
    /** Resolve one authenticated room-file download. */
    file(fileId: string): {
        readonly ref: ChatroomFileReference;
        readonly data: Uint8Array;
    };
    /** Attach one authenticated presence client to one room. */
    subscribe(roomId: string, identity: ChatroomIdentity, response: ServerResponse): () => void;
    private seedConfiguredRoom;
    private ensureRoom;
    private activateRoom;
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
}
//# sourceMappingURL=room.d.ts.map