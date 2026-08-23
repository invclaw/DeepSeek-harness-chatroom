import type { ChatroomThread } from '../types.js'
import type { ChatroomBranchFrame } from './store.js'

const THREAD_ID = 'dsh-chatroom-thread'
const THREAD_SESSION = 'dsh-chatroom-thread-session'
const ROOM_ID = 'dsh-chatroom-room'
const PARENT_SESSION = 'dsh-chatroom-parent-session'
const FRAME_LOAD = 'dsh-chatroom-frame-load'
const BRANCH_SESSION_READY = 'data-dsh-chatroom-branch-session-ready'
export const BRANCH_FRAME_READY = 'dsh-chatroom-branch-ready'
export const BRANCH_FRAME_SWITCH = 'dsh-chatroom-branch-switch'

interface BranchSessionList {
  readonly current?: string | undefined
  readonly byId: Readonly<Record<string, unknown>>
}

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
export function branchFrameUrl(thread: ChatroomThread, parentSessionId: string, loadId?: string): string {
  const url = new URL(globalThis.location.href)
  url.searchParams.set(THREAD_ID, thread.id)
  url.searchParams.set(THREAD_SESSION, thread.sessionId)
  url.searchParams.set(ROOM_ID, thread.roomId)
  url.searchParams.set(PARENT_SESSION, parentSessionId)
  if (loadId !== undefined) url.searchParams.set(FRAME_LOAD, loadId)
  url.hash = ''
  return url.toString()
}

/** Build the dynamic branch target sent to one retained native runtime. */
export function branchFrameTarget(thread: ChatroomThread, parentSessionId: string): ChatroomBranchFrame {
  return {
    threadId: thread.id,
    sessionId: thread.sessionId,
    roomId: thread.roomId,
    parentSessionId,
  }
}

/** Request that a retained native runtime select another branch Session. */
export function switchBranchFrame(target: Window, frame: ChatroomBranchFrame): void {
  target.postMessage({ type: BRANCH_FRAME_SWITCH, frame }, globalThis.location.origin)
}

/** Parse a same-origin parent request to select another branch Session. */
export function branchFrameSwitchFromMessage(value: unknown): ChatroomBranchFrame | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const message = value as { type?: unknown; frame?: unknown }
  if (message.type !== BRANCH_FRAME_SWITCH
    || typeof message.frame !== 'object'
    || message.frame === null
    || Array.isArray(message.frame)) return undefined
  const frame = message.frame as Record<string, unknown>
  if (!['threadId', 'sessionId', 'roomId', 'parentSessionId'].every(key =>
    typeof frame[key] === 'string' && frame[key] !== '')) return undefined
  return frame as unknown as ChatroomBranchFrame
}

/** Return whether two branch targets address the same retained runtime state. */
export function sameBranchFrame(left: ChatroomBranchFrame, right: ChatroomBranchFrame): boolean {
  return left.threadId === right.threadId
    && left.sessionId === right.sessionId
    && left.roomId === right.roomId
    && left.parentSessionId === right.parentSessionId
}

/** Restore the parent's room selection after the child runtime stages its branch. */
export function restoreParentSessionSelection(parentSessionId: string): void {
  persistSessionSelection(parentSessionId)
}

/** Seed the isolated runtime so it opens the branch instead of replaying the parent first. */
export function prepareBranchFrameSelection(sessionId: string): void {
  persistSessionSelection(sessionId)
}

function persistSessionSelection(sessionId: string): void {
  try {
    localStorage.setItem('dsh.sessions.current', JSON.stringify({ sessionId }))
  } catch {
    // Browser storage can be unavailable; the two live runtimes still retain independent in-memory selections.
  }
}

/** Advance branch selection without treating an asynchronous open request as complete. */
export function stageBranchFrameSession(
  frame: ChatroomBranchFrame,
  list: BranchSessionList,
  open: (sessionId: string) => void,
): boolean {
  if (list.byId[frame.sessionId] === undefined) return false
  if (list.current !== frame.sessionId) {
    open(frame.sessionId)
    return false
  }
  return true
}

/** Notify the parent panel after the native runtime selects the branch Session. */
export function notifyBranchFrameReady(frame: ChatroomBranchFrame): void {
  markBranchFrameSessionReady(globalThis.document, frame.sessionId)
  if (globalThis.parent === globalThis.window) return
  globalThis.parent.postMessage({ type: BRANCH_FRAME_READY, threadId: frame.threadId }, globalThis.location.origin)
}

/** Mark which native Session the isolated child document selected. */
export function markBranchFrameSessionReady(document: Document, sessionId: string): void {
  document.documentElement.setAttribute(BRANCH_SESSION_READY, sessionId)
}

/** Confirm that the isolated document has rendered the intended native branch Session. */
export function branchFrameDocumentReady(
  document: Document,
  sessionId: string,
  rootText: string,
): boolean {
  const shell = document.querySelector('[data-dsh-chatroom-branch-shell]')
  const conversation = shell?.children.item(1)
  const titlePrefix = `分支：${[...rootText].slice(0, 12).join('')}`
  return document.documentElement.getAttribute(BRANCH_SESSION_READY) === sessionId
    && (conversation?.textContent ?? '').includes(titlePrefix)
    && conversation?.querySelector('textarea') !== null
}

/** Remove the child-document marker when the branch runtime unmounts. */
export function clearBranchFrameReady(): void {
  globalThis.document.documentElement.removeAttribute(BRANCH_SESSION_READY)
}
