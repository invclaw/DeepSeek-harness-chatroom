import type {
  ISessions,
  IWorkspaces,
  SessionId,
  WorkspaceId,
} from '@deepseek-ai/dsh-client-runtime/client'

const SESSION_LIST_WAIT_MS = 5_000

/** Host operation that creates a new Session instead of resolving a reusable blank one. */
export type FreshSessionCreator = (workspaceId: WorkspaceId) => Promise<SessionId>

/**
 * Make the native New Session action create a distinct shared-session candidate.
 * Harness normally reuses any blank Session in the Workspace, but chatroom and
 * branch Sessions may contain durable human messages before an Agent turn starts.
 * @param workspaces - Native Workspace navigation service used by the sidebar.
 * @param sessions - Native Session service used to create and open the candidate.
 * @param createSession - Host operation that always creates a new Session.
 * @returns disposer restoring the original New Session implementation.
 */
export function installFreshSessionStart(
  workspaces: IWorkspaces,
  sessions: ISessions,
  createSession: FreshSessionCreator,
): () => void {
  const original = workspaces.startSession
  const pending = new Set<() => void>()
  let disposed = false
  const startFresh = (workspaceId?: WorkspaceId): void => {
    const workspace = workspaces.list.getSnapshot()
    const current = sessions.list.getSnapshot().current
    const currentWorkspaceId = current === undefined
      ? undefined
      : workspace.items.find(item => item.sessionIds.includes(current))?.workspaceId
    const target = workspaceId ?? currentWorkspaceId ?? workspace.recentWorkspaceId
    if (target === undefined) {
      sessions.clear()
      return
    }
    void createSession(target).then(
      sessionId => {
        if (!disposed) {
          const cancel = openWhenListed(sessions, sessionId, pending)
          if (cancel !== undefined) pending.add(cancel)
        }
      },
      (reason: unknown) => {
        if (!disposed) console.warn('new shared session failed:', reason)
      },
    )
  }
  workspaces.startSession = startFresh
  return () => {
    disposed = true
    for (const cancel of pending) cancel()
    pending.clear()
    if (workspaces.startSession === startFresh) workspaces.startSession = original
  }
}

function openWhenListed(
  sessions: ISessions,
  sessionId: SessionId,
  pending: Set<() => void>,
): (() => void) | undefined {
  let cancelled = false
  let unsubscribe = (): void => undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  const cancel = (): void => {
    if (cancelled) return
    cancelled = true
    unsubscribe()
    if (timer !== undefined) clearTimeout(timer)
    pending.delete(cancel)
  }
  const open = (): void => {
    if (cancelled || sessions.list.getSnapshot().byId[sessionId] === undefined) return
    cancel()
    sessions.open(sessionId)
  }
  if (sessions.list.getSnapshot().byId[sessionId] !== undefined) {
    sessions.open(sessionId)
    return undefined
  }
  unsubscribe = sessions.list.subscribe(open)
  timer = setTimeout(() => {
    cancel()
    console.warn(`new shared session was not listed within ${String(SESSION_LIST_WAIT_MS)}ms`)
  }, SESSION_LIST_WAIT_MS)
  open()
  return cancelled ? undefined : cancel
}
