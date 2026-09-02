import type { ServerResponse } from 'node:http';
import type { Context } from '@deepseek-ai/cordis';
import { type Session, type SessionEvent } from '@deepseek-ai/dsh-session';
import { ChatroomAuth } from './auth.js';
import { type ChatroomAgentAction, type ChatroomAgentActionInput } from './agent-tools.js';
import type { Config } from './config.js';
import { type ChatroomReactionEmoji } from './reactions.js';
import { type WecomAuthorizationState } from './wecom.js';
import type { ChatroomAutomationOverview, ChatroomDirectConversation, ChatroomDirectMessage, ChatroomDirectResponse, ChatroomDocumentCard, ChatroomFileReference, ChatroomForwardItem, ChatroomIdentity, ChatroomImageReference, ChatroomInfo, ChatroomMeetingCard, ChatroomMeetingSummary, ChatroomMember, ChatroomPromptContentPart, ChatroomPromptResponse, ChatroomReaction, ChatroomRecall, ChatroomReplyReference, ChatroomSearchResponse, ChatroomRoomInviteCandidate, ChatroomThreadResponse, ChatroomThreadRoot } from './types.js';
/** Runtime validation failure safe to return to a browser. */
export declare class ChatroomInputError extends Error {
}
/** Shared browser identities, room directory, presence, and native Harness Sessions. */
export declare class ChatroomRuntime {
    private readonly ctx;
    readonly config: Config;
    private readonly log;
    private domain;
    private archive;
    private identities;
    private roomRecords;
    private roomPreferences;
    private soloSessions;
    private automationSettings;
    private files;
    private members;
    private threads;
    private threadMessages;
    private reactions;
    private recalls;
    private directConversations;
    private directMessages;
    private authentication;
    private readonly states;
    private readonly roomTitleWrites;
    private readonly sessionRoomCreations;
    private readonly threadStates;
    private readonly notificationClients;
    private readonly ignoredAssistantMessageIds;
    private readonly activeTurnDeferredMessageIds;
    private readonly aiContextStartWrites;
    private readonly chatroomAgentContexts;
    private readonly wecom;
    private meetingPollTimer;
    private meetingPoll;
    private ready;
    private stopping;
    constructor(ctx: Context, config: Config);
    /** Public metadata for the configured legacy room. */
    get room(): ChatroomInfo;
    /** Ordered public room directory. */
    get rooms(): readonly ChatroomInfo[];
    /** Ordered room directory personalized with one participant's pinned rooms. */
    roomsFor(identity?: ChatroomIdentity): readonly ChatroomInfo[];
    /** Global automatic-response settings and the available controller-model catalog. */
    automationOverview(canManage: boolean): Promise<ChatroomAutomationOverview>;
    /** Validate and persist the controller model plus both chatroom prompt roles. */
    updateAutomationSettings(provider: string, model: string, mainAgentPrompt: string, controllerPrompt: string, meetingSummaryProvider?: string, meetingSummaryModel?: string): Promise<void>;
    /** Current member roster for one room-management response. */
    membersForRoom(roomId: string): readonly ChatroomMember[];
    /** Active platform accounts that a room manager may add to one room. */
    roomInviteCandidates(roomId: string, identity: ChatroomIdentity): readonly ChatroomRoomInviteCandidate[];
    /** Maximum accepted JSON body for one text, image, and file room submission. */
    get maxPromptRequestBytes(): number;
    /** Whether identity persistence and the configured shared Session are ready. */
    get isReady(): boolean;
    /** Account and provider manager initialized with the chatroom storage domain. */
    get auth(): ChatroomAuth;
    /** Whether one model request belongs to a room or branch Session owned by this runtime. */
    ownsSession(sessionId: string): boolean;
    /** Model message ids omitted after recalls, a context reset, or until the active turn finishes. */
    hiddenModelMessageIds(sessionId: string): ReadonlySet<string>;
    /** Stable model message ids omitted from future requests after a chat recall. */
    recalledMessageIds(sessionId: string): ReadonlySet<string>;
    /** Describe the collaboration operations available to one room-scoped Agent. */
    agentCapabilities(sessionId: string): Promise<{
        readonly room: string;
        readonly scope: 'room' | 'branch';
        readonly members: string[];
        readonly inviteCandidates: string[];
        readonly recentMessages: Array<{
            readonly messageId: string;
            readonly role: 'human' | 'ai';
            readonly displayName: string;
            readonly text: string;
            readonly sourceSessionId?: string;
            readonly sourceSeq?: number;
        }>;
        readonly actions: ChatroomAgentAction[];
    }>;
    /** Execute one Agent-requested room side effect against its owning Session. */
    agentAction(sessionId: string, input: ChatroomAgentActionInput): Promise<{
        readonly action: ChatroomAgentAction;
        readonly summary: string;
        readonly followupText?: string;
    }>;
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
    /** Reserve an opaque native Session id as a private Solo conversation. */
    reserveSoloSession(identity: ChatroomIdentity): Promise<string>;
    /** Release a failed or abandoned Solo Session reservation owned by the caller. */
    releaseSoloSession(sessionId: string, identity: ChatroomIdentity): Promise<void>;
    /** List only the native Solo Sessions owned by one identity. */
    soloSessionIds(identity: ChatroomIdentity): readonly string[];
    /** Test whether one native Session is an identity-owned Solo conversation. */
    ownsSoloSession(sessionId: string, identity: ChatroomIdentity): boolean;
    /** Adopt one native Harness Session as a shared room, once, across concurrent browsers. */
    ensureSessionRoom(sessionId: string, title: string, identity: ChatroomIdentity): Promise<ChatroomInfo>;
    private createSessionRoom;
    /** Activate an existing room and return its public metadata. */
    selectRoom(roomId: string, identity?: ChatroomIdentity): Promise<ChatroomInfo>;
    /** Stop the active Agent turn while retaining the room and queued user intake. */
    stopRoomSession(roomId: string, identity: ChatroomIdentity): Promise<ChatroomInfo>;
    /** Start a fresh AI context while retaining the room Session, transcript, and roster. */
    renewRoomSession(roomId: string, identity: ChatroomIdentity): Promise<ChatroomInfo>;
    /** Create an Enterprise WeChat online meeting and post it to the room as a durable card. */
    createQuickMeeting(roomId: string, identity: ChatroomIdentity): Promise<ChatroomMeetingCard>;
    /** Create an Enterprise WeChat online meeting and post it to one branch. */
    createThreadQuickMeeting(threadId: string, identity: ChatroomIdentity): Promise<ChatroomMeetingCard>;
    /** Create an Enterprise WeChat online meeting and post it to one private conversation. */
    createDirectQuickMeeting(conversationId: string, identity: ChatroomIdentity): Promise<ChatroomMeetingCard>;
    /** Read the deployment-wide Enterprise WeChat authorization state. */
    wecomAuthorizationState(identity: ChatroomIdentity): Promise<WecomAuthorizationState & {
        readonly canManage: boolean;
    }>;
    /** Start deployment-wide Enterprise WeChat QR authorization. */
    startWecomAuthorization(identity: ChatroomIdentity): Promise<WecomAuthorizationState & {
        readonly canManage: boolean;
    }>;
    /** Read the deployment-wide Enterprise WeChat authorization QR image. */
    wecomAuthorizationQr(identity: ChatroomIdentity): Promise<Buffer>;
    /** Remove the shared Enterprise WeChat authorization as a settings administrator. */
    disconnectWecomAuthorization(identity: ChatroomIdentity): Promise<WecomAuthorizationState & {
        readonly canManage: boolean;
    }>;
    /** Resolve one meeting status or summary after enforcing conversation visibility. */
    meetingSummary(id: string, identity: ChatroomIdentity): ChatroomMeetingSummary;
    /** Resolve a legacy meeting card by URL after enforcing conversation visibility. */
    meetingSummaryByUrl(meetingUrl: string, identity: ChatroomIdentity): ChatroomMeetingSummary;
    /** Resolve one Tencent Docs URL through the deployment-shared Enterprise WeChat account. */
    resolveWecomDocument(documentUrl: string, identity: ChatroomIdentity): Promise<ChatroomDocumentCard>;
    /** List completed meeting summaries visible to one authenticated participant. */
    meetingSummaries(identity: ChatroomIdentity): readonly ChatroomMeetingSummary[];
    /** Poll tracked meetings immediately; used by the scheduler and operational checks. */
    synchronizeMeetings(): Promise<void>;
    /** Rename one room as its owner or an administrator. */
    renameRoom(roomId: string, title: string, identity: ChatroomIdentity): Promise<ChatroomInfo>;
    /** Promote or demote one room member; only the owner controls administrators. */
    setMemberRole(roomId: string, participantId: string, role: 'admin' | 'member', identity: ChatroomIdentity): Promise<readonly ChatroomMember[]>;
    /** Add active platform accounts to a room as ordinary members. */
    addRoomMembers(roomId: string, participantIds: readonly string[], identity: ChatroomIdentity): Promise<readonly ChatroomMember[]>;
    /** Append human chat immediately and evaluate optional automatic responses in a separate queue. */
    submit(roomId: string, identity: ChatroomIdentity, content: readonly ChatroomPromptContentPart[], mode: 'queue' | 'steer', reply?: ChatroomReplyReference): Promise<ChatroomPromptResponse>;
    /** Guide, remove, or take back one queued AI prompt before the Agent claims it. */
    updateQueuedPrompt(target: {
        readonly roomId: string;
    } | {
        readonly threadId: string;
    }, messageId: string, action: 'guide' | 'delete' | 'edit', identity: ChatroomIdentity): Promise<{
        readonly accepted: true;
        readonly text: string;
    }>;
    /** Persist one participant's personal sidebar pin for a room. */
    setRoomPinned(roomId: string, pinned: boolean, identity: ChatroomIdentity): Promise<ChatroomInfo>;
    /** Enable or disable model-controlled automatic AI responses as a room member. */
    setRoomAutoTrigger(roomId: string, enabled: boolean, identity: ChatroomIdentity): Promise<ChatroomInfo>;
    /** Recall one caller-owned human message while retaining an auditable tombstone. */
    recallMessage(roomId: string, messageId: string, identity: ChatroomIdentity): Promise<ChatroomRecall>;
    /** Toggle one participant reaction and replace its room-wide summary. */
    toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji, identity: ChatroomIdentity): Promise<ChatroomReaction>;
    /** Append selected messages as one merged-forward card in another room. */
    forwardMessages(sourceRoomId: string, targetRoomId: string, messages: readonly ChatroomForwardItem[], identity: ChatroomIdentity): Promise<ChatroomPromptResponse>;
    private resolveDirectForwardItem;
    private resolveForwardItem;
    private forwardSourceBinding;
    /** Resolve one authenticated room-file download. */
    file(fileId: string, identity?: ChatroomIdentity): {
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
    /** List active peers and private conversations visible only to the requesting account. */
    directDirectory(identity: ChatroomIdentity): ChatroomDirectResponse;
    /** Search visible accounts, room names, branch names, and archived messages. */
    search(query: string, identity: ChatroomIdentity): ChatroomSearchResponse;
    /** Create or reopen one two-account private conversation. */
    openDirect(peerId: string, identity: ChatroomIdentity): Promise<ChatroomDirectResponse>;
    /** Append one private message and notify only its two participants. */
    sendDirect(conversationId: string, content: readonly ChatroomPromptContentPart[], identity: ChatroomIdentity, reply?: ChatroomReplyReference): Promise<{
        conversation: ChatroomDirectConversation;
        message: ChatroomDirectMessage;
    }>;
    /** Toggle one reaction on a private message and notify both participants. */
    toggleDirectReaction(conversationId: string, messageId: string, emoji: ChatroomReactionEmoji, identity: ChatroomIdentity): Promise<ChatroomDirectMessage>;
    private publishDirectMessage;
    /** Create or reopen a branch rooted at one native room message. */
    openThread(roomId: string, identity: ChatroomIdentity, root: ChatroomThreadRoot): Promise<ChatroomThreadResponse>;
    /** Append one branch message immediately and evaluate optional automatic responses in a separate queue. */
    submitThread(threadId: string, identity: ChatroomIdentity, text: string, reply?: ChatroomReplyReference): Promise<ChatroomPromptResponse>;
    submitThread(threadId: string, identity: ChatroomIdentity, content: readonly ChatroomPromptContentPart[], mode: 'queue' | 'steer', reply?: ChatroomReplyReference): Promise<ChatroomPromptResponse>;
    /** Project committed AI output into its parent room or branch stream. */
    handleSessionEvent(session: Session, event: SessionEvent): void;
    private createThread;
    private resolveThreadRoot;
    private upgradeThreadRoot;
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
    private publicDirectConversation;
    private directoryPeers;
    private directoryPeer;
    private directMessageHistory;
    private findDirectMessage;
    private searchHit;
    private storeDirectFiles;
    private seedConfiguredRoom;
    private agentToolTarget;
    private agentIdentity;
    private storeAgentFile;
    private toggleAgentReaction;
    private agentInviteMembers;
    private agentMessage;
    private agentRecentMessages;
    private recallAgentMessage;
    private ensureRoom;
    private activateRoom;
    private activateSharedSession;
    private ensureRoomTitle;
    private acquireAgent;
    private setupAgentContext;
    private augmentChatroomAgentContext;
    private createMeetingCard;
    private prepareAgentWecomCard;
    private trackMeeting;
    private backfillMeetingCards;
    private backfillMeetingCard;
    private scheduleMeetingPoll;
    private pollMeetings;
    private pollMeeting;
    private generateMeetingSummary;
    private postMeetingSummary;
    private canReadMeeting;
    private appendThreadCard;
    private appendDirectCard;
    private appendRoomCard;
    /** Ensure one shared Session uses native Workspace navigation. */
    private attachWorkspace;
    private durableContent;
    private validateFiles;
    private fileRecord;
    private resizeImage;
    private broadcastPresence;
    private publishPendingMessage;
    private removePendingMessage;
    private pendingMessagesForRoom;
    private broadcastPendingMessages;
    private broadcast;
    private assertReady;
    private requireRoom;
    private projectRoom;
    private roomPinned;
    private defaultAutomationSettings;
    private resolvedAutomationSettings;
    private touchRoom;
    private captureAiContextStart;
    private syncArchive;
    private archiveRoom;
    private archiveThread;
    private archiveDirectConversation;
    private archiveDirectMessage;
    private archiveThreadMessage;
    private archiveRoomSession;
    private archiveSessionEvent;
    private appendThreadRoot;
    private shouldAutoTrigger;
    private scheduleAutomaticResponse;
    private deferMessageFromActiveTurn;
    private acceptSessionTitle;
    private requireState;
    private requireIdentities;
    private requireRoomRecords;
    private requireRoomPreferences;
    private requireSoloSessions;
    private requireAutomationSettings;
    private requireArchive;
    private requireFiles;
    private requireMembers;
    private requireThreads;
    private requireThreadMessages;
    private requireReactions;
    private requireRecalls;
    private assertRecallOwner;
    private recallsForRoom;
    private requireDirectConversations;
    private requireDirectMessages;
    private requireThreadState;
    private assertRoomManager;
    private canManageWecom;
    private assertCanManageWecom;
    private assertRoomInviter;
    private assertRoomMember;
    private isRoomMember;
    private roomMemberCount;
}
//# sourceMappingURL=room.d.ts.map