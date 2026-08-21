import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots';
import type { ChatroomIdentity, ChatroomInfo, ChatroomPromptContentPart, ChatroomPromptRequest, ChatroomPromptResponse, ChatroomReplyReference } from '../types.js';
export type ChatroomPhase = 'loading' | 'identity-required' | 'ready' | 'error';
export type ChatroomConnection = 'offline' | 'connecting' | 'online';
/** Browser-owned file waiting to be merged into the next room submission. */
export interface PendingChatroomFile {
    readonly id: string;
    readonly file: File;
}
/** CAS snapshot used by the native prompt interceptor. */
export interface ChatroomComposition {
    readonly roomId: string;
    readonly revision: number;
    readonly files: readonly PendingChatroomFile[];
    readonly reply: ChatroomReplyReference | undefined;
}
/** Browser identity, room directory, selection, and presence around native Harness Sessions. */
export interface ChatroomView {
    readonly open: boolean;
    readonly phase: ChatroomPhase;
    readonly connection: ChatroomConnection;
    readonly rooms: readonly ChatroomInfo[];
    readonly room: ChatroomInfo | undefined;
    readonly identity: ChatroomIdentity | undefined;
    readonly online: number;
    readonly error: string | undefined;
    readonly composerRoomId: string | undefined;
    readonly pendingFiles: readonly PendingChatroomFile[];
    readonly reply: ChatroomReplyReference | undefined;
    readonly composerBusy: boolean;
    readonly composerError: string | undefined;
}
/** React-free owner of room identity, directory, presence, and native Session navigation. */
export declare class ChatroomClientStore implements HostObservable<ChatroomView> {
    private readonly openSession;
    private snapshot;
    private readonly listeners;
    private eventSource;
    private pendingOpenRoomId;
    private stopped;
    private compositionRevision;
    private pendingFileSequence;
    constructor(openSession?: (sessionId: string) => boolean);
    /** Current immutable room projection. */
    getSnapshot: () => ChatroomView;
    /** Resolve room metadata for any native Session in the shared directory. */
    roomForSession(sessionId: string): ChatroomInfo | undefined;
    /** Subscribe to room projection changes. */
    subscribe: (listener: () => void) => (() => void);
    /** Resolve the persistent browser identity and shared room directory. */
    start(): Promise<void>;
    /** Stop network activity and notification delivery. */
    stop(): void;
    /** Show identity setup or the shared room directory. */
    openRoom: () => void;
    /** Close only the additive room dialog. */
    closeRoom: () => void;
    /** Retry pending native navigation when the Host Session list changes. */
    resumeOpen: () => void;
    /** Track native navigation so presence follows the room currently on screen. */
    activateSession: (sessionId: string | undefined) => void;
    /** Create the persistent browser identity, then show the room directory. */
    join: (displayName: string, avatarId: string) => Promise<void>;
    /** Add browser files to the next submission in one shared room. */
    addFiles: (roomId: string, files: readonly File[]) => void;
    /** Remove one browser-owned pending file. */
    removeFile: (roomId: string, fileId: string) => void;
    /** Address the next room message as a reply to one durable participant message. */
    setReply: (roomId: string, reply: ChatroomReplyReference) => void;
    /** Cancel the next-message reply without changing pending files. */
    clearReply: (roomId: string) => void;
    /** Capture files and reply metadata for one native prompt submission. */
    composition: (roomId: string) => ChatroomComposition;
    /** Clear only the composition that was successfully admitted. */
    completeComposition: (composition: ChatroomComposition) => void;
    /** Send selected files without requiring placeholder text in the native composer. */
    sendFiles: (roomId: string) => Promise<void>;
    /** Activate and navigate to an existing shared room. */
    selectRoom: (roomId: string) => Promise<void>;
    /** Create, activate, and navigate to a new independent shared room. */
    createRoom: (title: string) => Promise<void>;
    /** Revoke the current identity and reopen identity setup. */
    resetIdentity: () => Promise<void>;
    /** Retry identity and directory recovery. */
    retry: () => Promise<void>;
    private selectAndOpen;
    private compositionFor;
    private loadSession;
    private openEvents;
    private closeEvents;
    private receive;
    private set;
}
/** Submit one native composer payload through human-first room admission. */
export declare function submitRoomPrompt(request: ChatroomPromptRequest, signal?: AbortSignal): Promise<ChatroomPromptResponse>;
/** Serialize browser Files only at submission time, keeping bytes out of observable state. */
export declare function serializePendingFiles(files: readonly PendingChatroomFile[]): Promise<Extract<ChatroomPromptContentPart, {
    type: 'file';
}>[]>;
//# sourceMappingURL=store.d.ts.map