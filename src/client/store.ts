import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  ChatroomErrorResponse,
  ChatroomIdentity,
  ChatroomInfo,
  ChatroomPromptRequest,
  ChatroomPromptResponse,
  ChatroomRoomResponse,
  ChatroomServerEvent,
  ChatroomSessionResponse,
} from '../types.js'
import { CHATROOM_API_PREFIX } from '../routes.js'

export type ChatroomPhase = 'loading' | 'identity-required' | 'ready' | 'error'
export type ChatroomConnection = 'offline' | 'connecting' | 'online'

/** Browser identity, room directory, selection, and presence around native Harness Sessions. */
export interface ChatroomView {
  readonly open: boolean
  readonly phase: ChatroomPhase
  readonly connection: ChatroomConnection
  readonly rooms: readonly ChatroomInfo[]
  readonly room: ChatroomInfo | undefined
  readonly identity: ChatroomIdentity | undefined
  readonly online: number
  readonly error: string | undefined
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
    error: undefined,
  }
  private readonly listeners = new Set<() => void>()
  private eventSource: EventSource | undefined
  private pendingOpenRoomId: string | undefined
  private stopped = false

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
    await this.loadSession()
  }

  /** Stop network activity and notification delivery. */
  stop(): void {
    this.stopped = true
    this.closeEvents()
    this.listeners.clear()
  }

  /** Show identity setup or the shared room directory. */
  openRoom = (): void => {
    this.set({ open: true, error: undefined })
  }

  /** Close only the additive room dialog. */
  closeRoom = (): void => {
    this.set({ open: false })
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
      this.set({ room: undefined, connection: 'offline', online: 0 })
      return
    }
    if (this.snapshot.room?.id === room.id && this.eventSource !== undefined) return
    this.set({ room, connection: 'connecting', online: 0 })
    this.openEvents(room)
  }

  /** Create the persistent browser identity, then show the room directory. */
  join = async (displayName: string): Promise<void> => {
    this.set({ phase: 'loading', error: undefined })
    try {
      const session = await requestJson<ChatroomSessionResponse>(`${CHATROOM_API_PREFIX}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      })
      if (session.identity === null) throw new Error('服务端没有返回聊天室身份。')
      this.set({
        phase: 'ready',
        rooms: session.rooms,
        room: undefined,
        identity: session.identity,
        connection: 'offline',
        online: 0,
        error: undefined,
      })
    } catch (error) {
      this.set({ phase: 'identity-required', error: errorMessage(error) })
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

  /** Revoke the current identity and reopen identity setup. */
  resetIdentity = async (): Promise<void> => {
    this.closeEvents()
    try {
      await requestEmpty(`${CHATROOM_API_PREFIX}/session`, { method: 'DELETE' })
      this.set({
        open: true,
        phase: 'identity-required',
        connection: 'offline',
        room: undefined,
        identity: undefined,
        online: 0,
        error: undefined,
      })
    } catch (error) {
      this.set({ open: true, phase: 'error', error: errorMessage(error) })
    }
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

  private closeEvents(): void {
    this.eventSource?.close()
    this.eventSource = undefined
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
          error: undefined,
        })
        return
      case 'presence':
        this.set({ online: event.online })
    }
  }

  private set(patch: Partial<ChatroomView>): void {
    if (this.stopped) return
    this.snapshot = { ...this.snapshot, ...patch }
    for (const listener of this.listeners) listener()
  }
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

async function requestEmpty(url: string, init?: RequestInit): Promise<void> {
  const response = await fetch(url, { ...init, credentials: 'same-origin' })
  if (!response.ok) throw await responseError(response)
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
