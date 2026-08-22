/** Shared JSON contracts between the Host room service and browser client. */
import type { ChatroomAvatarId } from './avatars.js';
export type ChatroomMessageRole = 'human' | 'ai';
/** Public participant identity bound to one opaque browser session. */
export interface ChatroomIdentity {
    readonly participantId: string;
    readonly displayName: string;
    readonly avatarId: ChatroomAvatarId;
}
/** One room member projected with current presence. */
export interface ChatroomMember extends ChatroomIdentity {
    readonly joinedAt: number;
    readonly lastSeenAt: number;
    readonly online: boolean;
}
/** Durable reply metadata rendered as a quote and retained in model-visible text. */
export interface ChatroomReplyReference {
    readonly messageId: string;
    readonly displayName: string;
    readonly text: string;
}
/** Download metadata for one plugin-owned room file. */
export interface ChatroomFileReference {
    readonly id: string;
    readonly name: string;
    readonly mediaType: string;
    readonly bytes: number;
}
/** One persisted room message delivered to every connected participant. */
export interface ChatroomMessage {
    readonly id: string;
    readonly sequence: number;
    readonly role: ChatroomMessageRole;
    readonly participantId: string;
    readonly displayName: string;
    readonly text: string;
    readonly createdAt: number;
    readonly inReplyTo?: string;
}
/** Public room metadata stable for one plugin configuration. */
export interface ChatroomInfo {
    readonly id: string;
    readonly title: string;
    readonly aiDisplayName: string;
    readonly sessionId: string;
}
/** Initial identity lookup result. */
export interface ChatroomSessionResponse {
    readonly identity: ChatroomIdentity | null;
    readonly rooms: readonly ChatroomInfo[];
    /** Configured legacy room retained during rolling browser bundle upgrades. */
    readonly room: ChatroomInfo;
}
/** Room directory response. */
export interface ChatroomRoomsResponse {
    readonly rooms: readonly ChatroomInfo[];
}
/** One selected or newly created room. */
export interface ChatroomRoomResponse {
    readonly room: ChatroomInfo;
}
export type ChatroomPromptContentPart = {
    readonly type: 'text';
    readonly text: string;
} | {
    readonly type: 'image';
    readonly mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';
    readonly data: string;
    readonly name?: string;
} | {
    readonly type: 'file';
    readonly mediaType: string;
    readonly data: string;
    readonly name: string;
};
/** Browser submission routed through human-first room admission. */
export interface ChatroomPromptRequest {
    readonly roomId: string;
    readonly mode: 'queue' | 'steer';
    readonly content: readonly ChatroomPromptContentPart[];
    readonly reply?: ChatroomReplyReference;
}
/** Whether one accepted room message woke the AI. */
export interface ChatroomPromptResponse {
    readonly accepted: true;
    readonly aiTriggered: boolean;
}
/** Root message used to create or reopen a branch conversation. */
export interface ChatroomThreadRoot extends ChatroomReplyReference {
    readonly role: ChatroomMessageRole;
}
/** Public branch metadata. */
export interface ChatroomThread {
    readonly id: string;
    readonly roomId: string;
    readonly root: ChatroomThreadRoot;
    readonly sessionId: string;
    readonly createdAt: number;
}
/** One durable message rendered inside a branch panel. */
export interface ChatroomThreadMessage {
    readonly id: string;
    readonly threadId: string;
    readonly sequence: number;
    readonly role: ChatroomMessageRole;
    readonly participantId: string;
    readonly displayName: string;
    readonly avatarId?: ChatroomAvatarId;
    readonly text: string;
    readonly createdAt: number;
}
/** Branch lookup or creation response. */
export interface ChatroomThreadResponse {
    readonly thread: ChatroomThread;
    readonly messages: readonly ChatroomThreadMessage[];
}
/** Branch text admission request. */
export interface ChatroomThreadPromptRequest {
    readonly threadId: string;
    readonly text: string;
}
/** Browser notification for a new human or AI message. */
export interface ChatroomNotification {
    readonly id: string;
    readonly roomId: string;
    readonly roomTitle: string;
    readonly threadId?: string;
    readonly participantId: string;
    readonly displayName: string;
    readonly role: ChatroomMessageRole;
    readonly text: string;
    readonly createdAt: number;
}
/** Full synchronization point sent when one SSE connection opens. */
export interface ChatroomSnapshotEvent {
    readonly type: 'snapshot';
    readonly room: ChatroomInfo;
    readonly identity: ChatroomIdentity;
    readonly online: number;
    readonly members: readonly ChatroomMember[];
}
/** Online connection count event. */
export interface ChatroomPresenceEvent {
    readonly type: 'presence';
    readonly online: number;
    readonly members: readonly ChatroomMember[];
}
/** One branch message delivered to participants watching its parent room. */
export interface ChatroomThreadMessageEvent {
    readonly type: 'thread-message';
    readonly message: ChatroomThreadMessage;
}
/** One global message alert delivered independently of active-room presence. */
export interface ChatroomNotificationEvent {
    readonly type: 'notification';
    readonly notification: ChatroomNotification;
}
export type ChatroomServerEvent = ChatroomSnapshotEvent | ChatroomPresenceEvent | ChatroomThreadMessageEvent;
/** Browser-visible error envelope. */
export interface ChatroomErrorResponse {
    readonly error: string;
}
//# sourceMappingURL=types.d.ts.map