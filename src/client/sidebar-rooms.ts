import { chatroomAvatar } from '../avatars.js'
import type { ChatroomInfo, ChatroomRoomAvatar } from '../types.js'
import type { ISessions, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { ChatroomClientStore, ChatroomView } from './store.js'

const ROOM_ROW_SELECTOR = 'div[role="treeitem"][aria-selected]'
const GROUP_AVATAR_ATTRIBUTE = 'data-dsh-chatroom-group-avatar'

/** Decorate native Workspace Session rows without replacing the Harness sidebar. */
export function installSidebarRoomRows(store: ChatroomClientStore, sessions: ISessions): () => void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return () => undefined
  let scheduled = false
  const reconcile = (): void => {
    scheduled = false
    reconcileSidebarRoomRows(document, store.getSnapshot(), sessions.list.getSnapshot().current)
  }
  const schedule = (): void => {
    if (scheduled) return
    scheduled = true
    queueMicrotask(reconcile)
  }
  const observer = new MutationObserver(schedule)
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })
  const unsubscribe = store.subscribe(schedule)
  const unsubscribeSessions = sessions.list.subscribe(schedule)
  schedule()
  return () => {
    unsubscribe()
    unsubscribeSessions()
    observer.disconnect()
    for (const row of document.querySelectorAll<HTMLElement>('[data-dsh-chatroom-room-row]')) clearRoomRow(row)
    for (const row of document.querySelectorAll<HTMLElement>('[data-dsh-chatroom-session-id]')) {
      delete row.dataset.dshChatroomSessionId
    }
  }
}

/** Reconcile one document pass; exported for deterministic browser tests. */
export function reconcileSidebarRoomRows(
  documentRoot: Document,
  snapshot: ChatroomView,
  currentSessionId?: SessionId,
): void {
  const rows = [...documentRoot.querySelectorAll<HTMLElement>(ROOM_ROW_SELECTOR)]
  for (const row of rows) {
    const sessionId = nativeSessionId(row)
      ?? (row.getAttribute('aria-selected') === 'true' ? currentSessionId : undefined)
    const room = sessionId === undefined
      ? uniquelyTitledRoom(snapshot.rooms, row)
      : snapshot.rooms.find(candidate => candidate.sessionId === sessionId)
    if (room === undefined) clearRoomRow(row)
    else decorateRoomRow(row, room, roomAvatars(room, snapshot))
  }
}

function nativeSessionId(row: HTMLElement): string | undefined {
  if (row.dataset.dshChatroomSessionId !== undefined) return row.dataset.dshChatroomSessionId
  if (row.draggable !== true) return undefined
  const EventConstructor = row.ownerDocument.defaultView?.Event
  if (EventConstructor === undefined) return undefined
  const values = new Map<string, string>()
  const dataTransfer = {
    effectAllowed: 'uninitialized',
    dropEffect: 'none',
    setData: (format: string, data: string) => values.set(format, data),
    getData: (format: string) => values.get(format) ?? '',
    clearData: (format?: string) => format === undefined ? values.clear() : values.delete(format),
  }
  // Native rows expose their authoritative Session ID only through the drag payload.
  const start = new EventConstructor('dragstart', { bubbles: true, cancelable: true })
  Object.defineProperty(start, 'dataTransfer', { value: dataTransfer })
  row.dispatchEvent(start)
  const sessionId = values.get('text/plain')
  const end = new EventConstructor('dragend', { bubbles: true })
  Object.defineProperty(end, 'dataTransfer', { value: dataTransfer })
  row.dispatchEvent(end)
  if (sessionId === undefined || sessionId.length === 0) return undefined
  row.dataset.dshChatroomSessionId = sessionId
  return sessionId
}

function rowContainsTitle(row: HTMLElement, title: string): boolean {
  return [...row.querySelectorAll('span')].some(candidate =>
    candidate.childElementCount === 0 && candidate.textContent?.trim() === title)
}

function uniquelyTitledRoom(rooms: readonly ChatroomInfo[], row: HTMLElement): ChatroomInfo | undefined {
  const matches = rooms.filter(room => rowContainsTitle(row, room.title))
  return matches.length === 1 ? matches[0] : undefined
}

function roomAvatars(room: ChatroomInfo, snapshot: ChatroomView): readonly ChatroomRoomAvatar[] {
  if (room.memberAvatars !== undefined) return room.memberAvatars.slice(0, 9)
  if (room.memberAvatarIds !== undefined) {
    return room.memberAvatarIds.slice(0, 9)
      .map((avatarId, index) => ({ participantId: String(index), avatarId }))
  }
  if (snapshot.room?.id === room.id && snapshot.members.length > 0) {
    return snapshot.members.slice(0, 9).map(member => ({
      participantId: member.participantId,
      avatarId: member.avatarId,
      ...(member.avatarUrl === undefined ? {} : { avatarUrl: member.avatarUrl }),
    }))
  }
  return []
}

function decorateRoomRow(row: HTMLElement, room: ChatroomInfo, avatars: readonly ChatroomRoomAvatar[]): void {
  row.dataset.dshChatroomRoomRow = ''
  row.dataset.dshChatroomRoomId = room.id
  const signature = avatars.map(item => `${item.participantId}:${item.avatarId}:${item.avatarUrl ?? ''}`).join('|') || 'empty'
  let avatar = row.querySelector<HTMLElement>(`:scope > [${GROUP_AVATAR_ATTRIBUTE}]`)
  if (avatar?.dataset.signature === signature) return
  avatar?.remove()
  avatar = row.ownerDocument.createElement('span')
  avatar.setAttribute(GROUP_AVATAR_ATTRIBUTE, '')
  avatar.dataset.count = String(Math.max(1, avatars.length))
  avatar.dataset.signature = signature
  avatar.setAttribute('aria-hidden', 'true')
  const cells: Array<{ readonly emoji: string; readonly avatarUrl?: string }> = avatars.length === 0
    ? [{ emoji: '✦' }]
    : avatars.map(identity => ({
        ...identity,
        emoji: chatroomAvatar(identity.avatarId, identity.participantId).emoji,
      }))
  for (const entry of cells) {
    const cell = row.ownerDocument.createElement('span')
    if (entry.avatarUrl === undefined) {
      cell.textContent = entry.emoji
    } else {
      const image = row.ownerDocument.createElement('img')
      image.src = entry.avatarUrl
      image.alt = ''
      image.referrerPolicy = 'no-referrer'
      image.addEventListener('error', () => {
        image.remove()
        cell.textContent = entry.emoji
      }, { once: true })
      cell.append(image)
    }
    avatar.append(cell)
  }
  row.prepend(avatar)
}

function clearRoomRow(row: HTMLElement): void {
  delete row.dataset.dshChatroomRoomRow
  delete row.dataset.dshChatroomRoomId
  row.querySelector(`:scope > [${GROUP_AVATAR_ATTRIBUTE}]`)?.remove()
}
