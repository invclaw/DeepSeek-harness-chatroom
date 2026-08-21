import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots';
import type { ChatroomIdentity, ChatroomInfo, ChatroomMessage } from '../types.js';
export type ChatroomPhase = 'loading' | 'identity-required' | 'ready' | 'error';
export type ChatroomConnection = 'offline' | 'connecting' | 'online';
/** Immutable browser projection consumed through the slot host's observable hook. */
export interface ChatroomView {
    readonly open: boolean;
    readonly phase: ChatroomPhase;
    readonly connection: ChatroomConnection;
    readonly room: ChatroomInfo | undefined;
    readonly identity: ChatroomIdentity | undefined;
    readonly messages: readonly ChatroomMessage[];
    readonly online: number;
    readonly sending: boolean;
    readonly error: string | undefined;
}
/** React-free owner of room HTTP, SSE, navigation, and immutable UI state. */
export declare class ChatroomClientStore implements HostObservable<ChatroomView> {
    private snapshot;
    private readonly listeners;
    private eventSource;
    private stopped;
    /** Current immutable room projection. */
    getSnapshot: () => ChatroomView;
    /** Subscribe to room projection changes. */
    subscribe: (listener: () => void) => (() => void);
    /** Resolve the persistent browser identity and start live synchronization. */
    start(): Promise<void>;
    /** Stop network activity and notification delivery. */
    stop(): void;
    /** Open the full room overlay. */
    openRoom: () => void;
    /** Return to Harness while retaining the persistent room identity. */
    closeRoom: () => void;
    /** Create the first persistent browser identity. */
    join: (displayName: string) => Promise<void>;
    /** Revoke the current identity so this browser can choose another name. */
    resetIdentity: () => Promise<void>;
    /** Persist one message; SSE remains the authoritative transcript path. */
    send: (text: string) => Promise<boolean>;
    /** Retry startup after the room API was temporarily unavailable. */
    retry: () => Promise<void>;
    private loadSession;
    private openEvents;
    private closeEvents;
    private receive;
    private set;
}
//# sourceMappingURL=store.d.ts.map