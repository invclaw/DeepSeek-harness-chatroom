import type { ChatroomBranchLink } from './store.js'

const THREAD_ID = 'dsh-chatroom-thread'
const THREAD_SESSION = 'dsh-chatroom-thread-session'
const ROOM_ID = 'dsh-chatroom-room'
const PARENT_SESSION = 'dsh-chatroom-parent-session'

/** Parse an native branch deep link. */
export function branchLinkFromLocation(location: Pick<Location, 'search'>): ChatroomBranchLink | undefined {
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

/** Return a URL-selected room when no branch is addressed. */
export function invitedRoomFromLocation(
  location: Pick<Location, 'search'>,
  branchLink: ChatroomBranchLink | undefined,
): string | undefined {
  if (branchLink !== undefined) return undefined
  const roomId = new URLSearchParams(location.search).get(ROOM_ID)
  return roomId === null || roomId === '' ? undefined : roomId
}

