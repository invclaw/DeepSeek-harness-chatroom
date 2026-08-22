import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  ChatroomErrorResponse,
  ChatroomIdentity,
  ChatroomInfo,
  ChatroomMember,
  ChatroomNotification,
  ChatroomNotificationEvent,
  ChatroomPromptContentPart,
  ChatroomPromptRequest,
  ChatroomPromptResponse,
  ChatroomReplyReference,
  ChatroomRoomResponse,
  ChatroomServerEvent,
  ChatroomSessionResponse,
  ChatroomThread,
  ChatroomThreadMessage,
  ChatroomThreadResponse,
  ChatroomThreadRoot,
} from '../types.js'
import { CHATROOM_API_PREFIX } from '../routes.js'

export type ChatroomPhase = 'loading' | 'identity-required' | 'ready' | 'error'
export type ChatroomConnection = 'offline' | 'connecting' | 'online'

/** Browser-owned file waiting to be merged into the next room submission. */
export interface PendingChatroomFile {
  readonly id: string
  readonly file: File
}

/** CAS snapshot used by the native prompt interceptor. */
export interface ChatroomComposition {
  readonly roomId: string
  readonly revision: number
  readonly files: readonly PendingChatroomFile[]
  readonly reply: ChatroomReplyReference | undefined
}

/** Browser identity, room directory, selection, and presence around native Harness Sessions. */
export interface ChatroomView {
  readonly open: boolean
  readonly phase: ChatroomPhase
  readonly connection: ChatroomConnection
  readonly rooms: readonly ChatroomInfo[]
  readonly room: ChatroomInfo | undefined
  readonly identity: ChatroomIdentity | undefined
  readonly online: number
  readonly members: readonly ChatroomMember[]
  readonly membersOpen: boolean
  readonly error: string | undefined
  readonly composerRoomId: string | undefined
  readonly pendingFiles: readonly PendingChatroomFile[]
  readonly reply: ChatroomReplyReference | undefined
  readonly composerBusy: boolean
  readonly composerError: string | undefined
  readonly thread: ChatroomThread | undefined
  readonly threadMessages: readonly ChatroomThreadMessage[]
  readonly threadBusy: boolean
  readonly threadError: string | undefined
  readonly unreadCount: number
  readonly toasts: readonly ChatroomNotification[]
  readonly notificationsEnabled: boolean
}

/** React-free owner of room identity, directory, presence, and native Session navigation. */
export class ChatroomClientStore implements HostObservable<ChatroomView> {
  private snapshot: ChatroomView = {
    open: false,
    phase: 'loading',
    connection: 'offline',
    rooms: [],
    room: undefined,
    identity: undefined,
    online: 0,
    members: [],
    membersOpen: false,
    error: undefined,
    composerRoomId: undefined,
    pendingFiles: [],
    reply: undefined,
    composerBusy: false,
    composerError: undefined,
    thread: undefined,
    threadMessages: [],
    threadBusy: false,
    threadError: undefined,
    unreadCount: 0,
    toasts: [],
    notificationsEnabled: notificationPermission() === 'granted',
  }
  private readonly listeners = new Set<() => void>()
  private eventSource: EventSource | undefined
  private notificationSource: EventSource | undefined
  private pendingOpenRoomId: string | undefined
  private stopped = false
  private compositionRevision = 0
  private pendingFileSequence = 0
  private originalTitle: string | undefined

  constructor(private readonly openSession: (sessionId: string) => boolean = () => false) {}

  /** Current immutable room projection. */
  getSnapshot = (): ChatroomView => this.snapshot

  /** Resolve room metadata for any native Session in the shared directory. */
  roomForSession(sessionId: string): ChatroomInfo | undefined {
    return this.snapshot.rooms.find(room => room.sessionId === sessionId)
  }

  /** Subscribe to room projection changes. */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /** Resolve the persistent browser identity and shared room directory. */
  async start(): Promise<void> {
    this.stopped = false
    if (typeof document !== 'undefined') this.originalTitle = document.title
    await this.loadSession()
  }

  /** Stop network activity and notification delivery. */
  stop(): void {
    this.stopped = true
    this.closeEvents()
    this.closeNotifications()
    this.updateDocumentTitle(0)
    this.listeners.clear()
  }

  /** Show identity setup or the shared room directory. */
  openRoom = (): void => {
    this.set({ open: true, error: undefined })
  }

  /** Open group management for the active room. */
  openMembers = (): void => {
    if (this.snapshot.room !== undefined) this.set({
      membersOpen: true,
      thread: undefined,
      threadMessages: [],
      threadError: undefined,
    })
  }

  /** Close group management without changing the active room. */
  closeMembers = (): void => {
    this.set({ membersOpen: false })
  }

  /** Close only the additive room dialog. */
  closeRoom = (): void => {
    this.set(this.snapshot.phase === 'identity-required' && this.snapshot.identity !== undefined
      ? { open: false, phase: 'ready', error: undefined }
      : { open: false })
  }

  /** Retry pending native navigation when the Host Session list changes. */
  resumeOpen = (): void => {
    const roomId = this.pendingOpenRoomId
    if (roomId === undefined) return
    const room = this.snapshot.rooms.find(candidate => candidate.id === roomId)
    if (room === undefined || !this.openSession(room.sessionId)) return
    this.pendingOpenRoomId = undefined
    this.set({ open: false, error: undefined })
  }

  /** Track native navigation so presence follows the room currently on screen. */
  activateSession = (sessionId: string | undefined): void => {
    const room = sessionId === undefined ? undefined : this.roomForSession(sessionId)
    if (room === undefined) {
      this.closeEvents()
      this.set({ room: undefined, connection: 'offline', online: 0, members: [], membersOpen: false, thread: undefined, threadMessages: [] })
      return
    }
    if (this.snapshot.room?.id === room.id && this.eventSource !== undefined) return
    this.set({ room, connection: 'connecting', online: 0, members: [], membersOpen: false, thread: undefined, threadMessages: [] })
    this.clearUnread()
    this.openEvents(room)
  }

  /** Create the persistent browser identity, then show the room directory. */
  join = async (displayName: string, avatarId: string): Promise<void> => {
    const activeRoom = this.snapshot.room
    const activeConnection = this.snapshot.connection
    const activeOnline = this.snapshot.online
    this.set({ phase: 'loading', error: undefined })
    try {
      const session = await requestJson<ChatroomSessionResponse>(`${CHATROOM_API_PREFIX}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, avatarId }),
      })
      if (session.identity === null) throw new Error('服务端没有返回聊天室身份。')
      const resolvedRoom = activeRoom === undefined
        ? undefined
        : session.rooms.find(room => room.id === activeRoom.id)
      this.set({
        phase: 'ready',
        rooms: session.rooms,
        room: resolvedRoom,
        identity: session.identity,
        connection: resolvedRoom === undefined ? 'offline' : activeConnection,
        online: resolvedRoom === undefined ? 0 : activeOnline,
        error: undefined,
      })
      this.openNotifications()
    } catch (error) {
      this.set({ phase: 'identity-required', error: errorMessage(error) })
    }
  }

  /** Add browser files to the next submission in one shared room. */
  addFiles = (roomId: string, files: readonly File[]): void => {
    if (files.length === 0) return
    const current = this.compositionFor(roomId)
    const pending = files.map(file => ({ id: `file-${++this.pendingFileSequence}`, file }))
    this.compositionRevision += 1
    this.set({
      composerRoomId: roomId,
      pendingFiles: [...current.files, ...pending],
      reply: current.reply,
      composerError: undefined,
    })
  }

  /** Remove one browser-owned pending file. */
  removeFile = (roomId: string, fileId: string): void => {
    if (this.snapshot.composerRoomId !== roomId) return
    const files = this.snapshot.pendingFiles.filter(file => file.id !== fileId)
    if (files.length === this.snapshot.pendingFiles.length) return
    this.compositionRevision += 1
    this.set({ pendingFiles: files, composerError: undefined })
  }

  /** Address the next room message as a reply to one durable participant message. */
  setReply = (roomId: string, reply: ChatroomReplyReference): void => {
    const current = this.compositionFor(roomId)
    this.compositionRevision += 1
    this.set({
      composerRoomId: roomId,
      pendingFiles: current.files,
      reply,
      composerError: undefined,
    })
  }

  /** Cancel the next-message reply without changing pending files. */
  clearReply = (roomId: string): void => {
    if (this.snapshot.composerRoomId !== roomId || this.snapshot.reply === undefined) return
    this.compositionRevision += 1
    this.set({ reply: undefined, composerError: undefined })
  }

  /** Capture files and reply metadata for one native prompt submission. */
  composition = (roomId: string): ChatroomComposition => {
    const current = this.compositionFor(roomId)
    return { roomId, revision: this.compositionRevision, files: current.files, reply: current.reply }
  }

  /** Clear only the composition that was successfully admitted. */
  completeComposition = (composition: ChatroomComposition): void => {
    if (this.snapshot.composerRoomId !== composition.roomId
      || this.compositionRevision !== composition.revision) {
      if (this.snapshot.composerBusy) this.set({ composerBusy: false })
      return
    }
    this.compositionRevision += 1
    this.set({
      composerRoomId: undefined,
      pendingFiles: [],
      reply: undefined,
      composerBusy: false,
      composerError: undefined,
    })
  }

  /** Send selected files without requiring placeholder text in the native composer. */
  sendFiles = async (roomId: string): Promise<void> => {
    const composition = this.composition(roomId)
    if (composition.files.length === 0 || this.snapshot.composerBusy) return
    this.set({ composerBusy: true, composerError: undefined })
    try {
      const content = await serializePendingFiles(composition.files)
      await submitRoomPrompt({
        roomId,
        mode: 'queue',
        content,
        ...(composition.reply === undefined ? {} : { reply: composition.reply }),
      })
      this.completeComposition(composition)
    } catch (error) {
      this.set({ composerBusy: false, composerError: errorMessage(error) })
    }
  }

  /** Activate and navigate to an existing shared room. */
  selectRoom = async (roomId: string): Promise<void> => {
    this.set({ error: undefined })
    try {
      const response = await requestJson<ChatroomRoomResponse>(`${CHATROOM_API_PREFIX}/rooms/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      })
      this.selectAndOpen(response.room)
    } catch (error) {
      this.set({ phase: 'ready', error: errorMessage(error) })
    }
  }

  /** Create, activate, and navigate to a new independent shared room. */
  createRoom = async (title: string): Promise<void> => {
    this.set({ error: undefined })
    try {
      const response = await requestJson<ChatroomRoomResponse>(`${CHATROOM_API_PREFIX}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      this.selectAndOpen(response.room)
    } catch (error) {
      this.set({ phase: 'ready', error: errorMessage(error) })
    }
  }

  /** Create or reopen a branch rooted at one main-room message. */
  openThread = async (roomId: string, root: ChatroomThreadRoot): Promise<void> => {
    this.set({ membersOpen: false, threadBusy: true, threadError: undefined })
    try {
      const response = await requestJson<ChatroomThreadResponse>(`${CHATROOM_API_PREFIX}/threads/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, root }),
      })
      this.set({
        thread: response.thread,
        threadMessages: response.messages,
        threadBusy: false,
        threadError: undefined,
      })
      this.clearUnread()
    } catch (error) {
      this.set({ threadBusy: false, threadError: errorMessage(error) })
    }
  }

  /** Close the right-side branch panel. */
  closeThread = (): void => {
    this.set({ thread: undefined, threadMessages: [], threadBusy: false, threadError: undefined })
  }

  /** Send one human-first branch message. */
  sendThreadMessage = async (text: string): Promise<boolean> => {
    const thread = this.snapshot.thread
    if (thread === undefined || this.snapshot.threadBusy || text.trim() === '') return false
    this.set({ threadBusy: true, threadError: undefined })
    try {
      await requestJson<ChatroomPromptResponse>(`${CHATROOM_API_PREFIX}/threads/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: thread.id, text }),
      })
      this.set({ threadBusy: false, threadError: undefined })
      return true
    } catch (error) {
      this.set({ threadBusy: false, threadError: errorMessage(error) })
      return false
    }
  }

  /** Request browser notification permission from an explicit user gesture. */
  enableSystemNotifications = async (): Promise<void> => {
    if (typeof Notification === 'undefined') return
    const permission = await Notification.requestPermission()
    this.set({ notificationsEnabled: permission === 'granted' })
  }

  /** Remove one in-page message alert. */
  dismissToast = (id: string): void => {
    this.set({ toasts: this.snapshot.toasts.filter(toast => toast.id !== id) })
  }

  /** Open identity editing without revoking the current identity. */
  resetIdentity = async (): Promise<void> => {
    this.set({ open: true, phase: 'identity-required', error: undefined })
  }

  /** Retry identity and directory recovery. */
  retry = async (): Promise<void> => {
    this.set({ phase: 'loading', error: undefined })
    await this.loadSession()
  }

  private selectAndOpen(room: ChatroomInfo): void {
    const rooms = this.snapshot.rooms.some(candidate => candidate.id === room.id)
      ? this.snapshot.rooms.map(candidate => candidate.id === room.id ? room : candidate)
      : [...this.snapshot.rooms, room]
    this.pendingOpenRoomId = room.id
    this.set({ phase: 'ready', rooms, room, connection: 'connecting', online: 0, error: undefined })
    this.openEvents(room)
    this.resumeOpen()
  }

  private compositionFor(roomId: string): {
    files: readonly PendingChatroomFile[]
    reply: ChatroomReplyReference | undefined
  } {
    return this.snapshot.composerRoomId === roomId
      ? { files: this.snapshot.pendingFiles, reply: this.snapshot.reply }
      : { files: [], reply: undefined }
  }

  private async loadSession(): Promise<void> {
    try {
      const session = await requestJson<ChatroomSessionResponse>(`${CHATROOM_API_PREFIX}/session`)
      if (this.stopped) return
      if (session.identity === null) {
        this.closeEvents()
        this.set({
          phase: 'identity-required',
          connection: 'offline',
          rooms: session.rooms,
          room: undefined,
          identity: undefined,
          online: 0,
          error: undefined,
        })
        return
      }
      this.set({
        phase: 'ready',
        connection: 'offline',
        rooms: session.rooms,
        identity: session.identity,
        error: undefined,
      })
      this.openNotifications()
    } catch (error) {
      if (!this.stopped) this.set({ phase: 'error', connection: 'offline', error: errorMessage(error) })
    }
  }

  private openEvents(room: ChatroomInfo): void {
    this.closeEvents()
    if (this.stopped || this.snapshot.identity === undefined) return
    this.set({ connection: 'connecting' })
    const source = new EventSource(`${CHATROOM_API_PREFIX}/events?roomId=${encodeURIComponent(room.id)}`)
    this.eventSource = source
    source.onopen = () => {
      if (this.eventSource === source) this.set({ connection: 'online', error: undefined })
    }
    source.onmessage = (event) => {
      if (this.eventSource !== source) return
      try {
        this.receive(JSON.parse(event.data) as ChatroomServerEvent)
      } catch {
        this.set({ error: '收到无法识别的聊天室同步消息。' })
      }
    }
    source.onerror = () => {
      if (this.eventSource === source) this.set({ connection: 'connecting' })
    }
  }

  private openNotifications(): void {
    if (this.stopped || this.snapshot.identity === undefined || this.notificationSource !== undefined) return
    const source = new EventSource(`${CHATROOM_API_PREFIX}/notifications`)
    this.notificationSource = source
    source.onmessage = (event) => {
      if (this.notificationSource !== source) return
      try {
        const parsed = JSON.parse(event.data) as ChatroomNotificationEvent
        if (parsed.type === 'notification') this.receiveNotification(parsed.notification)
      } catch {
        this.set({ error: '收到无法识别的消息提醒。' })
      }
    }
  }

  private closeEvents(): void {
    this.eventSource?.close()
    this.eventSource = undefined
  }

  private closeNotifications(): void {
    this.notificationSource?.close()
    this.notificationSource = undefined
  }

  private receive(event: ChatroomServerEvent): void {
    switch (event.type) {
      case 'snapshot':
        this.set({
          phase: 'ready',
          connection: 'online',
          room: event.room,
          identity: event.identity,
          online: event.online,
          members: event.members,
          error: undefined,
        })
        return
      case 'presence':
        this.set({ online: event.online, members: event.members })
        return
      case 'thread-message':
        if (this.snapshot.thread?.id !== event.message.threadId
          || this.snapshot.threadMessages.some(message => message.id === event.message.id)) return
        this.set({ threadMessages: [...this.snapshot.threadMessages, event.message] })
    }
  }

  private receiveNotification(notification: ChatroomNotification): void {
    if (notification.participantId === this.snapshot.identity?.participantId) return
    const toasts = [...this.snapshot.toasts.filter(item => item.id !== notification.id), notification].slice(-4)
    const isVisible = typeof document !== 'undefined' && document.visibilityState === 'visible'
    const isCurrent = this.snapshot.room?.id === notification.roomId
      && (notification.threadId === undefined || notification.threadId === this.snapshot.thread?.id)
    const unreadCount = isVisible && isCurrent ? this.snapshot.unreadCount : this.snapshot.unreadCount + 1
    this.set({ toasts, unreadCount })
    if (this.snapshot.notificationsEnabled && typeof Notification !== 'undefined' && !isVisible) {
      try {
        new Notification(`${notification.displayName} · ${notification.roomTitle}`, { body: notification.text })
      } catch (error) {
        this.set({ notificationsEnabled: false, error: `系统消息提醒失败：${errorMessage(error)}` })
      }
    }
    globalThis.setTimeout(() => { this.dismissToast(notification.id) }, 6_000)
  }

  private clearUnread(): void {
    if (this.snapshot.unreadCount !== 0) this.set({ unreadCount: 0 })
  }

  private updateDocumentTitle(unreadCount: number): void {
    if (typeof document === 'undefined' || this.originalTitle === undefined) return
    document.title = unreadCount === 0 ? this.originalTitle : `(${unreadCount}) ${this.originalTitle}`
  }

  private set(patch: Partial<ChatroomView>): void {
    if (this.stopped) return
    this.snapshot = { ...this.snapshot, ...patch }
    if (patch.unreadCount !== undefined) this.updateDocumentTitle(this.snapshot.unreadCount)
    for (const listener of this.listeners) listener()
  }
}

function notificationPermission(): NotificationPermission | 'unsupported' {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
}

/** Submit one native composer payload through human-first room admission. */
export async function submitRoomPrompt(
  request: ChatroomPromptRequest,
  signal?: AbortSignal,
): Promise<ChatroomPromptResponse> {
  return await requestJson<ChatroomPromptResponse>(`${CHATROOM_API_PREFIX}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    ...(signal === undefined ? {} : { signal }),
  })
}

/** Serialize browser Files only at submission time, keeping bytes out of observable state. */
export async function serializePendingFiles(
  files: readonly PendingChatroomFile[],
): Promise<Extract<ChatroomPromptContentPart, { type: 'file' }>[]> {
  return await Promise.all(files.map(async ({ file }) => ({
    type: 'file' as const,
    name: file.name,
    mediaType: file.type === '' ? 'application/octet-stream' : file.type,
    data: bytesToBase64(new Uint8Array(await file.arrayBuffer())),
  })))
}

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, credentials: 'same-origin' })
  if (!response.ok) throw await responseError(response)
  return await response.json() as T
}

async function responseError(response: Response): Promise<HttpError> {
  let message = `聊天室请求失败（HTTP ${response.status}）。`
  try {
    const body = await response.json() as Partial<ChatroomErrorResponse>
    if (typeof body.error === 'string' && body.error !== '') message = body.error
  } catch {
    // The status code is sufficient when an upstream proxy returns non-JSON.
  }
  return new HttpError(response.status, message)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 32_768) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32_768))
  }
  return btoa(binary)
}
