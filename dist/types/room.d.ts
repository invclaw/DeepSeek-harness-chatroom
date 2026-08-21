import type { ServerResponse } from 'node:http';
import type { Context } from '@deepseek-ai/cordis';
import { type SessionEvent } from '@deepseek-ai/dsh-session';
import type { Config } from './config.js';
import type { ChatroomIdentity, ChatroomInfo, ChatroomMessage } from './types.js';
/** Durable source metadata identifying one human room message in model history. */
export interface ChatroomMessageSource {
    readonly kind: 'chatroom';
    readonly roomId: string;
    readonly roomMessageId: string;
    readonly participantId: string;
    readonly displayName: string;
}
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        chatroom: ChatroomMessageSource;
    }
}
interface CompletedRoomTurn {
    readonly roomMessageId: string;
    readonly reply?: {
        readonly id: string;
        readonly text: string;
        readonly createdAt: number;
    };
}
/** Runtime validation failure safe to return to a browser. */
export declare class ChatroomInputError extends Error {
}
/** One durable shared room, its browser identities, and its single AI Agent. */
export declare class ChatroomRuntime {
    private readonly ctx;
    readonly config: Config;
    private domain;
    private identities;
    private messages;
    private binding;
    private nextSequence;
    private ready;
    private stopping;
    private readonly clients;
    private writeTail;
    private aiTail;
    private readonly retryTimers;
    private createdFreshAgent;
    constructor(ctx: Context, config: Config);
    /** Public metadata for this configured room. */
    get room(): ChatroomInfo;
    /** Whether persistence and the room Agent are ready to accept requests. */
    get isReady(): boolean;
    /** Open durable identity/message storage, acquire the room Agent, and replay unfinished AI work. */
    start(): Promise<void>;
    /** Stop intake, close SSE clients, drain writes and Agent work, then release owned resources. */
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
    /** Persist and broadcast one human message, then schedule its independent AI decision. */
    send(identity: ChatroomIdentity, text: string): Promise<ChatroomMessage>;
    /** Attach one authenticated SSE client and immediately deliver an authoritative snapshot. */
    subscribe(identity: ChatroomIdentity, response: ServerResponse): () => void;
    /** Current persisted public room transcript. */
    history(): readonly ChatroomMessage[];
    private acquireAgent;
    private setupAgent;
    private borrowAgent;
    private registerPrompt;
    private injectRecoveredTranscript;
    private enqueueAi;
    private scheduleRetry;
    private processHumanMessage;
    private reconcileCompletedTurns;
    private commitMessage;
    private enqueueWrite;
    private sortedRecords;
    private onlineCount;
    private broadcast;
    private broadcastPresence;
    private assertReady;
    private requireIdentities;
    private requireMessages;
    private requireAgent;
}
export declare function completedRoomTurns(events: readonly SessionEvent[], noReplyToken: string): CompletedRoomTurn[];
/** Reject any settled Agent turn that did not reach a usable model decision. */
export declare function assertAiDecisionCompleted(events: readonly SessionEvent[]): void;
export {};
//# sourceMappingURL=room.d.ts.map