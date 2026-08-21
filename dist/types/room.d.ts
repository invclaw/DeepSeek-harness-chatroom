import type { ServerResponse } from 'node:http';
import type { Context } from '@deepseek-ai/cordis';
import type { Config } from './config.js';
import type { ChatroomIdentity, ChatroomInfo } from './types.js';
/** Runtime validation failure safe to return to a browser. */
export declare class ChatroomInputError extends Error {
}
/** Shared browser identities, presence, and the persistent native Harness Session. */
export declare class ChatroomRuntime {
    private readonly ctx;
    readonly config: Config;
    private domain;
    private identities;
    private binding;
    private ready;
    private stopping;
    private readonly clients;
    constructor(ctx: Context, config: Config);
    /** Public metadata for this configured room. */
    get room(): ChatroomInfo;
    /** Whether identity persistence and the shared Session are ready. */
    get isReady(): boolean;
    /** Open identity storage and acquire the shared Session without blocking Harness startup. */
    start(): Promise<void>;
    /** Stop intake, close presence streams, and release owned resources. */
    stop(): Promise<void>;
    /** Resolve an opaque cookie token to its durable identity. */
    identity(token: string | undefined): ChatroomIdentity | undefined;
    /** Mint and durably bind a new browser identity. */
    createIdentity(displayName: string): Promise<{
        token: string;
        identity: ChatroomIdentity;
    }>;
    /** Revoke one browser identity token. */
    deleteIdentity(token: string | undefined): Promise<void>;
    /** Attach one authenticated presence client and send the current room baseline. */
    subscribe(identity: ChatroomIdentity, response: ServerResponse): () => void;
    private acquireAgent;
    /** Ensure the shared Session uses the same native Workspace navigation as ordinary conversations. */
    private attachWorkspace;
    private onlineCount;
    private broadcast;
    private broadcastPresence;
    private assertReady;
    private requireIdentities;
}
//# sourceMappingURL=room.d.ts.map