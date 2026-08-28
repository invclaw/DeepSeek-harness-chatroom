import { chatroomAvatar, type ChatroomAvatarId } from '../avatars.js'
import type { ChatroomInfo } from '../types.js'
import type { ChatroomClientStore, ChatroomView } from './store.js'

const ROOM_ROW_SELECTOR = 'div[role="treeitem"][aria-selected]'
const GROUP_AVATAR_ATTRIBUTE = 'data-dsh-chatroom-group-avatar'

/** Decorate native Workspace Session rows without replacing the Harness sidebar. */
export function installSidebarRoomRows(store: ChatroomClientStore): () => void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return () => undefined
  let scheduled = false
  const reconcile = (): void => {
    scheduled = false
    reconcileSidebarRoomRows(document, store.getSnapshot())
  }
  const schedule = (): void => {
    if (scheduled) return
    scheduled = true
    queueMicrotask(reconcile)
  }
  const observer = new MutationObserver(schedule)
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })
  const unsubscribe = store.subscribe(schedule)
  schedule()
  return () => {
    unsubscribe()
    observer.disconnect()
    for (const row of document.querySelectorAll<HTMLElement>('[data-dsh-chatroom-room-row]')) clearRoomRow(row)
  }
}

/** Reconcile one document pass; exported for deterministic browser tests. */
export function reconcileSidebarRoomRows(documentRoot: Document, snapshot: ChatroomView): void {
  const rows = [...documentRoot.querySelectorAll<HTMLElement>(ROOM_ROW_SELECTOR)]
  const remaining = [...snapshot.rooms]
  for (const row of rows) {
    const selected = row.getAttribute('aria-selected') === 'true'
    const active = selected && snapshot.room !== undefined
      ? takeRoom(remaining, room => room.id === snapshot.room?.id)
      : undefined
    const room = active ?? takeRoom(remaining, candidate => rowContainsTitle(row, candidate.title))
    if (room === undefined) clearRoomRow(row)
    else decorateRoomRow(row, room, roomAvatarIds(room, snapshot))
  }
}

function takeRoom(rooms: ChatroomInfo[], matches: (room: ChatroomInfo) => boolean): ChatroomInfo | undefined {
  const index = rooms.findIndex(matches)
  if (index === -1) return undefined
  return rooms.splice(index, 1)[0]
}

function rowContainsTitle(row: HTMLElement, title: string): boolean {
  return [...row.querySelectorAll('span')].some(candidate =>
    candidate.childElementCount === 0 && candidate.textContent?.trim() === title)
}

function roomAvatarIds(room: ChatroomInfo, snapshot: ChatroomView): readonly ChatroomAvatarId[] {
  const ids = snapshot.room?.id === room.id && snapshot.members.length > 0
    ? snapshot.members.map(member => member.avatarId)
    : room.memberAvatarIds ?? []
  return ids.slice(0, 9)
}

function decorateRoomRow(row: HTMLElement, room: ChatroomInfo, avatarIds: readonly ChatroomAvatarId[]): void {
  row.dataset.dshChatroomRoomRow = ''
  row.dataset.dshChatroomRoomId = room.id
  const signature = avatarIds.join(',') || 'empty'
  let avatar = row.querySelector<HTMLElement>(`:scope > [${GROUP_AVATAR_ATTRIBUTE}]`)
  if (avatar?.dataset.signature === signature) return
  avatar?.remove()
  avatar = row.ownerDocument.createElement('span')
  avatar.setAttribute(GROUP_AVATAR_ATTRIBUTE, '')
  avatar.dataset.count = String(Math.max(1, avatarIds.length))
  avatar.dataset.signature = signature
  avatar.setAttribute('aria-hidden', 'true')
  const cells = avatarIds.length === 0 ? ['✦'] : avatarIds.map(id => chatroomAvatar(id, id).emoji)
  for (const emoji of cells) {
    const cell = row.ownerDocument.createElement('span')
    cell.textContent = emoji
    avatar.append(cell)
  }
  row.prepend(avatar)
}

function clearRoomRow(row: HTMLElement): void {
  delete row.dataset.dshChatroomRoomRow
  delete row.dataset.dshChatroomRoomId
  row.querySelector(`:scope > [${GROUP_AVATAR_ATTRIBUTE}]`)?.remove()
}
