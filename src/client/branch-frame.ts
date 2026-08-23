import type { ChatroomThread } from '../types.js'
import type { ChatroomBranchFrame } from './store.js'

const THREAD_ID = 'dsh-chatroom-thread'
const THREAD_SESSION = 'dsh-chatroom-thread-session'
const ROOM_ID = 'dsh-chatroom-room'
const PARENT_SESSION = 'dsh-chatroom-parent-session'

/** Parse an isolated native branch-frame address. */
export function branchFrameFromLocation(location: Pick<Location, 'search'>): ChatroomBranchFrame | undefined {
  const search = new URLSearchParams(location.search)
  const threadId = search.get(THREAD_ID)
  const sessionId = search.get(THREAD_SESSION)
  const roomId = search.get(ROOM_ID)
  const parentSessionId = search.get(PARENT_SESSION)
  if ([threadId, sessionId, roomId, parentSessionId].some(value => value === null || value === '')) return undefined
  return {
    threadId: threadId!,
    sessionId: sessionId!,
    roomId: roomId!,
    parentSessionId: parentSessionId!,
  }
}

/** Build a same-origin Harness URL whose current session is isolated to one branch. */
export function branchFrameUrl(thread: ChatroomThread, parentSessionId: string): string {
  const url = new URL(globalThis.location.href)
  url.searchParams.set(THREAD_ID, thread.id)
  url.searchParams.set(THREAD_SESSION, thread.sessionId)
  url.searchParams.set(ROOM_ID, thread.roomId)
  url.searchParams.set(PARENT_SESSION, parentSessionId)
  url.hash = ''
  return url.toString()
}

/** Restore the parent's room selection after the child runtime stages its branch. */
export function restoreParentSessionSelection(parentSessionId: string): void {
  try {
    localStorage.setItem('dsh.sessions.current', JSON.stringify({ sessionId: parentSessionId }))
  } catch {
    // Browser storage can be unavailable; the two live runtimes still retain independent in-memory selections.
  }
}
