/** Shared JSON contracts between the Host room service and browser client. */

export type ChatroomMessageRole = 'human' | 'ai'

/** Public participant identity bound to one opaque browser session. */
export interface ChatroomIdentity {
  readonly participantId: string
  readonly displayName: string
}

/** One persisted room message delivered to every connected participant. */
export interface ChatroomMessage {
  readonly id: string
  readonly sequence: number
  readonly role: ChatroomMessageRole
  readonly participantId: string
  readonly displayName: string
  readonly text: string
  readonly createdAt: number
  readonly inReplyTo?: string
}

/** Public room metadata stable for one plugin configuration. */
export interface ChatroomInfo {
  readonly id: string
  readonly title: string
  readonly aiDisplayName: string
  readonly sessionId: string
}

/** Initial identity lookup result. */
export interface ChatroomSessionResponse {
  readonly identity: ChatroomIdentity | null
  readonly room: ChatroomInfo
}

/** Full synchronization point sent when one SSE connection opens. */
export interface ChatroomSnapshotEvent {
  readonly type: 'snapshot'
  readonly room: ChatroomInfo
  readonly identity: ChatroomIdentity
  readonly online: number
}

/** Online connection count event. */
export interface ChatroomPresenceEvent {
  readonly type: 'presence'
  readonly online: number
}

export type ChatroomServerEvent = ChatroomSnapshotEvent | ChatroomPresenceEvent

/** Browser-visible error envelope. */
export interface ChatroomErrorResponse {
  readonly error: string
}
