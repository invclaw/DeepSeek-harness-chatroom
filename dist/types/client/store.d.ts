import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots';
import type { ChatroomAdminOverview, ChatroomAuthState, ChatroomDirectConversation, ChatroomDirectMessage, ChatroomDirectPeer, ChatroomForwardItem, ChatroomIdentity, ChatroomInfo, ChatroomMember, ChatroomNotification, ChatroomPromptContentPart, ChatroomPromptRequest, ChatroomPromptResponse, ChatroomReaction, ChatroomReplyReference, ChatroomRoomInviteCandidate, ChatroomThread, ChatroomThreadMessage, ChatroomThreadPreview, ChatroomThreadPromptRequest, ChatroomThreadRoot } from '../types.js';
import type { ChatroomReactionEmoji } from '../reactions.js';
export type ChatroomPhase = 'loading' | 'auth-required' | 'identity-required' | 'ready' | 'error';
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
/** Query-carried context for the isolated native Harness branch frame. */
export interface ChatroomBranchFrame {
    readonly threadId: string;
    readonly sessionId: string;
    readonly roomId: string;
    readonly parentSessionId: string;
}
/** Agent submission target resolved from a native Harness Session id. */
export type ChatroomAgentTarget = {
    readonly kind: 'room';
    readonly room: ChatroomInfo;
} | {
    readonly kind: 'thread';
    readonly room: ChatroomInfo;
    readonly threadId: string;
};
/** Browser identity, room directory, selection, and presence around native Harness Sessions. */
export interface ChatroomView {
    readonly branchFrame?: ChatroomBranchFrame | undefined;
    readonly open: boolean;
    readonly phase: ChatroomPhase;
    readonly connection: ChatroomConnection;
    readonly rooms: readonly ChatroomInfo[];
    readonly room: ChatroomInfo | undefined;
    readonly roomEnsureSessionId: string | undefined;
    readonly identity: ChatroomIdentity | undefined;
    readonly auth: ChatroomAuthState;
    readonly online: number;
    readonly members: readonly ChatroomMember[];
    readonly memberCandidates: readonly ChatroomRoomInviteCandidate[];
    readonly reactions: readonly ChatroomReaction[];
    readonly threadPreviews: readonly ChatroomThreadPreview[];
    readonly membersOpen: boolean;
    readonly managementBusy?: boolean;
    readonly managementError?: string | undefined;
    readonly error: string | undefined;
    readonly composerRoomId: string | undefined;
    readonly pendingFiles: readonly PendingChatroomFile[];
    readonly reply: ChatroomReplyReference | undefined;
    readonly composerBusy: boolean;
    readonly composerError: string | undefined;
    readonly thread: ChatroomThread | undefined;
    readonly threadMessages: readonly ChatroomThreadMessage[];
    readonly threadReply: ChatroomReplyReference | undefined;
    readonly threadBusy: boolean;
    readonly threadError: string | undefined;
    readonly unreadCount: number;
    readonly toasts: readonly ChatroomNotification[];
    readonly notificationsEnabled: boolean;
    readonly selectionRoomId: string | undefined;
    readonly selectedMessages: readonly ChatroomForwardItem[];
    readonly forwardOpen: boolean;
    readonly forwardBusy: boolean;
    readonly forwardError: string | undefined;
    readonly accountOpen: boolean;
    readonly accountBusy: boolean;
    readonly accountError: string | undefined;
    readonly adminOpen: boolean;
    readonly adminBusy: boolean;
    readonly adminOverview: ChatroomAdminOverview | undefined;
    readonly adminError: string | undefined;
    readonly directOpen: boolean;
    readonly directBusy: boolean;
    readonly directPeers: readonly ChatroomDirectPeer[];
    readonly directConversations: readonly ChatroomDirectConversation[];
    readonly directConversation: ChatroomDirectConversation | undefined;
    readonly directMessages: readonly ChatroomDirectMessage[];
    readonly directError: string | undefined;
}
/** React-free owner of room identity, directory, presence, and native Session navigation. */
export declare class ChatroomClientStore implements HostObservable<ChatroomView> {
    private readonly openSession;
    private snapshot;
    private readonly listeners;
    private eventSource;
    private notificationSource;
    private pendingOpenRoomId;
    private identityPromptedRoomId;
    private stopped;
    private compositionRevision;
    private pendingFileSequence;
    private originalTitle;
    private activeNativeSession;
    private roomEnsure;
    constructor(openSession?: (sessionId: string) => boolean, branchFrame?: ChatroomBranchFrame);
    /** Current immutable room projection. */
    getSnapshot: () => ChatroomView;
    /** Resolve room metadata for any native Session in the shared directory. */
    roomForSession(sessionId: string): ChatroomInfo | undefined;
    /** Resolve whether one native Session submits to a room or one branch. */
    agentTargetForSession(sessionId: string): ChatroomAgentTarget | undefined;
    /** Retarget one retained native branch runtime without carrying composer state across threads. */
    switchBranchFrame(frame: ChatroomBranchFrame): void;
    /** Subscribe to room projection changes. */
    subscribe: (listener: () => void) => (() => void);
    /** Resolve the persistent browser identity and shared room directory. */
    start(): Promise<void>;
    /** Stop network activity and notification delivery. */
    stop(): void;
    /** Show identity setup or the shared room directory. */
    openRoom: () => void;
    /** Authenticate one local account and restore its room directory. */
    login: (username: string, password: string) => Promise<boolean>;
    /** Register a local member or the bootstrap super administrator. */
    register: (input: {
        username: string;
        password: string;
        displayName: string;
        avatarId: string;
        bootstrapToken?: string;
    }) => Promise<boolean>;
    /** Revoke the current account session and return to the login gate. */
    logout: () => Promise<void>;
    /** Open password and personal account controls. */
    openAccount: () => void;
    closeAccount: () => void;
    /** Change the current local password and retain the newly rotated session. */
    changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
    /** Open and load the super-administrator console. */
    openAdmin: () => Promise<void>;
    closeAdmin: () => void;
    /** Create a local account from the super-administrator console. */
    adminCreateUser: (input: {
        username: string;
        password: string;
        displayName: string;
        avatarId: string;
        role: "super-admin" | "admin" | "member";
    }) => Promise<boolean>;
    /** Change a platform account role or activation state. */
    adminUpdateUser: (userId: string, patch: {
        role?: "super-admin" | "admin" | "member";
        status?: "active" | "disabled";
    }) => Promise<boolean>;
    /** Change whether new users may register themselves. */
    adminSetSelfRegistration: (allowSelfRegistration: boolean) => Promise<boolean>;
    /** Select one external provider for immediate unauthenticated entry, or retain the local chooser. */
    adminSetAutoRedirectProvider: (providerId?: string) => Promise<boolean>;
    /** Add or update one generic enterprise OIDC provider. */
    adminSaveProvider: (input: {
        id: string;
        label: string;
        enabled: boolean;
        issuer: string;
        clientId: string;
        clientSecret?: string;
        scopes: string;
        usernameClaim: string;
        displayNameClaim: string;
        autoCreateUsers: boolean;
    }) => Promise<boolean>;
    adminDeleteProvider: (providerId: string) => Promise<boolean>;
    /** Open the private-message directory. */
    openDirect: (peerId?: string) => Promise<void>;
    closeDirect: () => void;
    /** Send one message inside the selected private conversation. */
    sendDirect: (text: string) => Promise<boolean>;
    /** Open group management for the active room. */
    openMembers: () => void;
    /** Load active platform accounts available to the current room creation or management surface. */
    loadRoomMemberCandidates: () => Promise<void>;
    /** Apply the blank-Session group name and selected members as one user action. */
    completeGroupSetup: (title: string, participantIds: readonly string[]) => Promise<boolean>;
    /** Close group management without changing the active room. */
    closeMembers: () => void;
    /** Add selected active platform accounts to the current room. */
    addRoomMembers: (participantIds: readonly string[]) => Promise<boolean>;
    /** Rename the active room through the server-enforced management endpoint. */
    renameRoom: (title: string) => Promise<boolean>;
    /** Promote or demote one member through the owner-only management endpoint. */
    setMemberRole: (participantId: string, role: "admin" | "member") => Promise<boolean>;
    /** Close only the additive room dialog. */
    closeRoom: () => void;
    /** Retry pending native navigation when the Host Session list changes. */
    resumeOpen: () => void;
    /** Track native navigation and adopt ordinary Harness Sessions as shared rooms. */
    activateSession: (sessionId: string | undefined, title?: string, shareable?: boolean) => void;
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
    /** Toggle one reaction and replace the message summary immediately. */
    toggleReaction: (roomId: string, messageId: string, emoji: ChatroomReactionEmoji) => Promise<void>;
    /** Add or remove one message from the current room selection. */
    toggleMessageSelection: (roomId: string, message: ChatroomForwardItem) => void;
    /** Open the target-room chooser for one message or the active selection. */
    openForward: (roomId: string, message?: ChatroomForwardItem) => void;
    /** Cancel message selection and merged-forward composition. */
    clearMessageSelection: () => void;
    /** Close only the forward target chooser while retaining selected messages. */
    closeForward: () => void;
    /** Send the current selection to another shared room as one merged card. */
    forwardSelected: (targetRoomId: string) => Promise<boolean>;
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
    /** Create or reopen a branch rooted at one main-room message. */
    openThread: (roomId: string, root: ChatroomThreadRoot) => Promise<void>;
    /** Close the right-side branch panel. */
    closeThread: () => void;
    /** Address the next branch message as a reply without opening a nested branch. */
    setThreadReply: (reply: ChatroomReplyReference) => void;
    /** Cancel the pending branch reply. */
    clearThreadReply: () => void;
    /** Send one human-first branch message. */
    sendThreadMessage: (text: string) => Promise<boolean>;
    /** Request browser notification permission from an explicit user gesture. */
    enableSystemNotifications: () => Promise<void>;
    /** Remove one in-page message alert. */
    dismissToast: (id: string) => void;
    /** Open identity editing without revoking the current identity. */
    resetIdentity: () => Promise<void>;
    /** Retry identity and directory recovery. */
    retry: () => Promise<void>;
    private adminMutation;
    private acceptSession;
    private ensureActiveSessionRoom;
    private selectAndOpen;
    private compositionFor;
    private loadSession;
    private openEvents;
    private openNotifications;
    private closeEvents;
    private closeNotifications;
    private receive;
    private replaceReaction;
    private applyRoomManagement;
    private receiveNotification;
    private receiveDirectMessage;
    private clearUnread;
    private updateDocumentTitle;
    private updateActiveDocumentRoom;
    private set;
}
/** Submit one native composer payload through human-first room admission. */
export declare function submitRoomPrompt(request: ChatroomPromptRequest, signal?: AbortSignal): Promise<ChatroomPromptResponse>;
/** Submit one native composer payload through branch human-first admission. */
export declare function submitThreadPrompt(request: ChatroomThreadPromptRequest, signal?: AbortSignal): Promise<ChatroomPromptResponse>;
/** Serialize browser Files only at submission time, keeping bytes out of observable state. */
export declare function serializePendingFiles(files: readonly PendingChatroomFile[]): Promise<ChatroomPromptContentPart[]>;
//# sourceMappingURL=store.d.ts.map