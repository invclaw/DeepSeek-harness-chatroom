import type { Config } from './config.js';
import type { ChatroomExternalCard } from './types.js';
export declare const WECOM_SERVICES: readonly ["calendar", "meeting", "doc", "sheet", "smartsheet", "smartpage", "contact", "identity"];
export type WecomService = typeof WECOM_SERVICES[number];
export interface WecomAuthorizationState {
    readonly enabled: boolean;
    readonly status: 'authorized' | 'unauthorized' | 'pending';
    readonly qrAvailable: boolean;
    readonly canManage?: boolean;
    readonly error?: string;
}
/** Structured failure returned by the Enterprise WeChat CLI adapter. */
export declare class WecomCliError extends Error {
    readonly code: 'disabled' | 'unauthorized' | 'timeout' | 'invalid-output' | 'failed';
    constructor(message: string, code: 'disabled' | 'unauthorized' | 'timeout' | 'invalid-output' | 'failed');
}
/** Lazy process adapter around the official `@wecom/cli` package. */
export declare class WecomCliClient {
    private readonly config;
    private readonly configDirectory;
    private readonly children;
    private stopped;
    constructor(config: Config, configDirectory?: string);
    /** Query one official CLI method schema without requiring plugin restart. */
    schema(service: WecomService, resource: readonly string[], method: string, signal?: AbortSignal): Promise<unknown>;
    /** Execute one official Enterprise WeChat method with JSON parameters. */
    invoke(service: WecomService, resource: readonly string[], method: string, parameters: unknown, signal?: AbortSignal): Promise<unknown>;
    /** Read the current Enterprise WeChat authorization state. */
    authStatus(): Promise<unknown>;
    private run;
    private runText;
    /** Cancel external operations and await process exit before discarding this credential owner. */
    stop(): Promise<void>;
    private runOutput;
}
/** Account-scoped Enterprise WeChat CLI clients and QR authorization processes. */
export declare class WecomCliManager {
    private readonly config;
    private readonly clients;
    private legacy;
    private readonly authorizations;
    private readonly authorizationErrors;
    constructor(config: Config);
    /** Return the isolated CLI client owned by one chatroom account. */
    client(participantId: string): WecomCliClient;
    /** Return the former deployment account only for lifecycle records created before account isolation. */
    legacyClient(): WecomCliClient;
    /** Read one account's authorization state without exposing credentials. */
    authorizationState(participantId: string): Promise<WecomAuthorizationState>;
    /** Start one account's non-browser authorization and wait until its QR image exists. */
    startAuthorization(participantId: string, restart?: boolean): Promise<WecomAuthorizationState>;
    /** Read one account's authorization QR image. */
    authorizationQr(participantId: string): Promise<Buffer>;
    /** Remove one account's authorization and stop its unfinished QR login. */
    disconnectAuthorization(participantId: string): Promise<WecomAuthorizationState>;
    /** Stop outstanding authorization processes during plugin teardown. */
    stop(): Promise<void>;
    private stopAuthorization;
    private spawnAuthorization;
    private accountDirectory;
    private legacySharedDirectory;
    private defaultBaseDirectory;
    private qrPath;
}
/** Infer one meeting or document card from an official CLI response. */
export declare function inferWecomCard(service: WecomService, method: string, parameters: unknown, result: unknown): ChatroomExternalCard | undefined;
//# sourceMappingURL=wecom.d.ts.map