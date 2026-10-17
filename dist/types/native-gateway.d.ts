import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Duplex } from 'node:stream';
import type { Context } from '@deepseek-ai/cordis';
import type { Config } from './config.js';
import { type ChatroomRuntime } from './room.js';
type FetchHandler = (request: Request) => Promise<Response>;
/**
 * Supply the native registries without exposing native operator authentication.
 * Only this module's HTTP and WS owners may dispatch through those registries.
 */
export declare function installNativeConnection(ctx: Context, config: Config): () => void;
declare module '@deepseek-ai/cordis' {
    interface Context {
        chatroomNativeGateway: (gateway: NativeGateway | undefined) => void;
    }
}
/** Native encoding, binary attachments and Remote streams stay owned by DSH. */
export declare class NativeGateway {
    private readonly ctx;
    private readonly runtime;
    private readonly config;
    private readonly dispatch;
    private readonly server;
    private readonly requests;
    private readonly pumps;
    private readonly requestCompletions;
    private readonly generations;
    private stopped;
    private readonly renewals;
    constructor(ctx: Context, runtime: ChatroomRuntime, config: Config, dispatch: FetchHandler);
    fetch(request: Request): Promise<Response>;
    private success;
    private authorize;
    /** An empty group is a durable conversation, never a reusable native blank draft. */
    private roomSummary;
    private roomProjections;
    private filterValue;
    private filterWorkspace;
    /** Recheck identity and resource access at each delivered native stream item. */
    private filterFrame;
    private returnEvent;
    handle(request: IncomingMessage, response: ServerResponse): Promise<void>;
    upgrade(request: IncomingMessage, socket: Duplex, head: Buffer): Promise<void>;
    close(): Promise<void>;
    private identity;
    private filterSessions;
    private canAccess;
    private requireSession;
    private isAdmin;
    private assertOrigin;
}
export declare function registerNativeGateway(ctx: Context, runtime: ChatroomRuntime, config: Config): () => Promise<void>;
export {};
//# sourceMappingURL=native-gateway.d.ts.map