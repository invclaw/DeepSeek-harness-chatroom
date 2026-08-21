import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots';
import type { ChatroomIdentity, ChatroomInfo } from '../types.js';
export type ChatroomPhase = 'loading' | 'identity-required' | 'ready' | 'error';
export type ChatroomConnection = 'offline' | 'connecting' | 'online';
/** Browser identity and presence around the native Harness Session. */
export interface ChatroomView {
    readonly open: boolean;
    readonly phase: ChatroomPhase;
    readonly connection: ChatroomConnection;
    readonly room: ChatroomInfo | undefined;
    readonly identity: ChatroomIdentity | undefined;
    readonly online: number;
    readonly error: string | undefined;
}
/** React-free owner of room identity, presence, and native Session navigation. */
export declare class ChatroomClientStore implements HostObservable<ChatroomView> {
    private readonly openSession;
    private snapshot;
    private readonly listeners;
    private eventSource;
    private stopped;
    constructor(openSession?: (sessionId: string) => boolean);
    /** Current immutable room projection. */
    getSnapshot: () => ChatroomView;
    /** Subscribe to room projection changes. */
    subscribe: (listener: () => void) => (() => void);
    /** Resolve the persistent browser identity and start presence synchronization. */
    start(): Promise<void>;
    /** Stop network activity and notification delivery. */
    stop(): void;
    /** Open the native shared Session or show the identity dialog first. */
    openRoom: () => void;
    /** Close only the additive identity/status dialog. */
    closeRoom: () => void;
    /** Retry pending navigation when the Host Session list changes. */
    resumeOpen: () => void;
    /** Create the first persistent browser identity, then enter the shared Session. */
    join: (displayName: string) => Promise<void>;
    /** Revoke the current identity and reopen the identity dialog. */
    resetIdentity: () => Promise<void>;
    /** Retry identity recovery and pending Session navigation. */
    retry: () => Promise<void>;
    private loadSession;
    private openEvents;
    private closeEvents;
    private receive;
    private set;
}
//# sourceMappingURL=store.d.ts.map