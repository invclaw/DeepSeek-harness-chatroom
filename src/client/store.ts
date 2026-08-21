import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  ChatroomErrorResponse,
  ChatroomIdentity,
  ChatroomInfo,
  ChatroomServerEvent,
  ChatroomSessionResponse,
} from '../types.js'
import { CHATROOM_API_PREFIX } from '../routes.js'

export type ChatroomPhase = 'loading' | 'identity-required' | 'ready' | 'error'
export type ChatroomConnection = 'offline' | 'connecting' | 'online'

/** Browser identity and presence around the native Harness Session. */
export interface ChatroomView {
  readonly open: boolean
  readonly phase: ChatroomPhase
  readonly connection: ChatroomConnection
  readonly room: ChatroomInfo | undefined
  readonly identity: ChatroomIdentity | undefined
  readonly online: number
  readonly error: string | undefined
}

/** React-free owner of room identity, presence, and native Session navigation. */
export class ChatroomClientStore implements HostObservable<ChatroomView> {
  private snapshot: ChatroomView = {
    open: false,
    phase: 'loading',
    connection: 'offline',
    room: undefined,
    identity: undefined,
    online: 0,
    error: undefined,
  }
  private readonly listeners = new Set<() => void>()
  private eventSource: EventSource | undefined
  private stopped = false

  constructor(private readonly openSession: (sessionId: string) => boolean = () => false) {}

  /** Current immutable room projection. */
  getSnapshot = (): ChatroomView => this.snapshot

  /** Subscribe to room projection changes. */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /** Resolve the persistent browser identity and start presence synchronization. */
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

  /** Open the native shared Session or show the identity dialog first. */
  openRoom = (): void => {
    this.set({ open: true, error: undefined })
    this.resumeOpen()
  }

  /** Close only the additive identity/status dialog. */
  closeRoom = (): void => {
    this.set({ open: false })
  }

  /** Retry pending navigation when the Host Session list changes. */
  resumeOpen = (): void => {
    const { open, phase, room, identity } = this.snapshot
    if (!open || phase !== 'ready' || room === undefined || identity === undefined) return
    if (this.openSession(room.sessionId)) {
      this.set({ open: false, error: undefined })
    }
  }

  /** Create the first persistent browser identity, then enter the shared Session. */
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
        room: session.room,
        identity: session.identity,
        connection: 'connecting',
        error: undefined,
      })
      this.openEvents()
      this.resumeOpen()
    } catch (error) {
      this.set({ phase: 'identity-required', error: errorMessage(error) })
    }
  }

  /** Revoke the current identity and reopen the identity dialog. */
  resetIdentity = async (): Promise<void> => {
    this.closeEvents()
    try {
      await requestEmpty(`${CHATROOM_API_PREFIX}/session`, { method: 'DELETE' })
      this.set({
        open: true,
        phase: 'identity-required',
        connection: 'offline',
        identity: undefined,
        online: 0,
        error: undefined,
      })
    } catch (error) {
      this.set({ open: true, phase: 'error', error: errorMessage(error) })
    }
  }

  /** Retry identity recovery and pending Session navigation. */
  retry = async (): Promise<void> => {
    this.set({ phase: 'loading', error: undefined })
    await this.loadSession()
    this.resumeOpen()
  }

  private async loadSession(): Promise<void> {
    try {
      const session = await requestJson<ChatroomSessionResponse>(`${CHATROOM_API_PREFIX}/session`)
      if (this.stopped) return
      if (session.identity === null) {
        this.set({
          phase: 'identity-required',
          connection: 'offline',
          room: session.room,
          identity: undefined,
          online: 0,
          error: undefined,
        })
        return
      }
      this.set({
        phase: 'ready',
        connection: 'connecting',
        room: session.room,
        identity: session.identity,
        error: undefined,
      })
      this.openEvents()
    } catch (error) {
      if (!this.stopped) this.set({ phase: 'error', connection: 'offline', error: errorMessage(error) })
    }
  }

  private openEvents(): void {
    this.closeEvents()
    if (this.stopped || this.snapshot.identity === undefined) return
    this.set({ connection: 'connecting' })
    const source = new EventSource(`${CHATROOM_API_PREFIX}/events`)
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
