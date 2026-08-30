import { chatroomAvatar } from '../avatars.js'
import type {
  ChatroomDirectConversation,
  ChatroomDirectPeer,
  ChatroomInfo,
  ChatroomRoomAvatar,
} from '../types.js'
import type { ISessions, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { ChatroomClientStore, ChatroomView } from './store.js'

const ROOM_ROW_SELECTOR = 'div[role="treeitem"][aria-selected]'
const GROUP_AVATAR_ATTRIBUTE = 'data-dsh-chatroom-group-avatar'
const SOLO_AVATAR_ATTRIBUTE = 'data-dsh-chatroom-solo-avatar'
const CATEGORY_ATTRIBUTE = 'data-dsh-chatroom-sidebar-category'
const CATEGORY_ROOT_ATTRIBUTE = 'data-dsh-chatroom-workspace-categories'
const CATEGORY_HEADER_ATTRIBUTE = 'data-dsh-chatroom-category-header'
const DIRECT_ROW_ATTRIBUTE = 'data-dsh-chatroom-direct-row'
const CATEGORY_WRAPPER_ATTRIBUTE = 'data-dsh-chatroom-category-wrapper'
const BRANCH_ROW_ATTRIBUTE = 'data-dsh-chatroom-branch-row'
const NATIVE_GROUP_SECTION_ATTRIBUTE = 'data-dsh-chatroom-native-group-section'
const NATIVE_FOLDER_WRAPPER_ATTRIBUTE = 'data-dsh-chatroom-native-folder-wrapper'
let activeNativeMenuRoomId: string | undefined
let activeNativeMenuItem: HTMLElement | undefined

/** Decorate native Workspace Session rows without replacing the Harness sidebar. */
export function installSidebarRoomRows(store: ChatroomClientStore, sessions: ISessions): () => void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return () => undefined
  let scheduled = false
  let directoryIdentity: string | undefined
  let directoryRetry: ReturnType<typeof setTimeout> | undefined
  const reconcile = (): void => {
    scheduled = false
    const snapshot = store.getSnapshot()
    reconcileSidebarRoomRows(
      document,
      snapshot,
      sessions.list.getSnapshot().current,
      store.setRoomPinned,
      store.openDirect,
      store.closeDirect,
    )
    const identity = snapshot.phase === 'ready' ? snapshot.identity?.participantId : undefined
    if (identity === undefined) directoryIdentity = undefined
    else if (directoryIdentity !== identity) {
      directoryIdentity = identity
      void store.loadDirectDirectory().then(loaded => {
        if (loaded || directoryIdentity !== identity) return
        directoryIdentity = undefined
        directoryRetry = setTimeout(schedule, 2_000)
      })
    }
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
    if (directoryRetry !== undefined) clearTimeout(directoryRetry)
    for (const row of document.querySelectorAll<HTMLElement>(`[${CATEGORY_ATTRIBUTE}]`)) clearCategorizedRow(row)
    for (const root of document.querySelectorAll<HTMLElement>(`[${CATEGORY_ROOT_ATTRIBUTE}]`)) clearCategoryRoot(root)
  }
}

/** Reconcile one document pass; exported for deterministic browser tests. */
export function reconcileSidebarRoomRows(
  documentRoot: Document,
  snapshot: ChatroomView,
  currentSessionId?: SessionId,
  setPinned?: (roomId: string, pinned: boolean) => Promise<boolean>,
  openDirect?: (peerId?: string) => Promise<void>,
  closeDirect?: () => void,
): void {
  const rows = [...documentRoot.querySelectorAll<HTMLElement>(ROOM_ROW_SELECTOR)]
    .filter(row => row.closest(`[${DIRECT_ROW_ATTRIBUTE}]`) === null)
  const categoryRoot = sidebarTreeRoot(documentRoot, rows)
  const remaining = [...snapshot.rooms]
  const categorized: HTMLElement[] = []
  let groupOrder = 0
  let soloOrder = 0
  for (const row of rows) {
    decorateNativeConversationNavigation(row, closeDirect)
    const selected = row.getAttribute('aria-selected') === 'true'
    const sessionId = nativeSessionId(row) ?? (selected ? currentSessionId : undefined)
    const bySession = sessionId === undefined
      ? undefined
      : takeRoom(remaining, candidate => candidate.sessionId === sessionId)
    const active = bySession === undefined && selected && snapshot.room !== undefined
      ? takeRoom(remaining, room => room.id === snapshot.room?.id)
      : undefined
    const room = bySession ?? active ?? takeUniquelyTitledRoom(remaining, row)
    if (room !== undefined) {
      row.removeAttribute(BRANCH_ROW_ATTRIBUTE)
      decorateRoomRow(row, room, roomAvatars(room, snapshot), groupOrder++, setPinned)
      setRowCategory(row, 'group')
      categorized.push(row)
      continue
    }
    clearRoomRow(row)
    if (!isNativeSessionRow(row)) {
      clearCategorizedRow(row)
      continue
    }
    const branch = rowTitle(row).startsWith('分支：')
    const category = branch ? 'group' : 'solo'
    if (category === 'group') {
      row.setAttribute(BRANCH_ROW_ATTRIBUTE, '')
      row.style.order = String(-10_000 + groupOrder++)
    } else {
      row.removeAttribute(BRANCH_ROW_ATTRIBUTE)
      decorateSoloRow(row, soloOrder++)
    }
    setRowCategory(row, category)
    categorized.push(row)
  }
  reconcileWorkspaceCategories(documentRoot, categoryRoot, categorized, snapshot, openDirect)
  reconcileNativeRoomMenu(documentRoot, snapshot, setPinned)
}

function decorateNativeConversationNavigation(row: HTMLElement, closeDirect?: () => void): void {
  if (row.dataset.dshChatroomDirectCloseBound === 'true') return
  row.dataset.dshChatroomDirectCloseBound = 'true'
  row.addEventListener('click', event => {
    if ((event.target as Element).closest('button[aria-label]') !== null) return
    closeDirect?.()
  })
}

function isNativeSessionRow(row: HTMLElement): boolean {
  return !row.hasAttribute('aria-expanded')
    && (row.getAttribute('aria-selected') === 'true'
      || row.querySelector('button[aria-label]') !== null
      || row.dataset.dshChatroomRoomRow !== undefined)
}

function rowTitle(row: HTMLElement): string {
  return [...row.querySelectorAll('span')]
    .find(candidate => candidate.childElementCount === 0 && candidate.textContent?.trim() !== '')
    ?.textContent?.trim() ?? ''
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

function takeRoom(rooms: ChatroomInfo[], predicate: (room: ChatroomInfo) => boolean): ChatroomInfo | undefined {
  const index = rooms.findIndex(predicate)
  if (index < 0) return undefined
  return rooms.splice(index, 1)[0]
}

function takeUniquelyTitledRoom(rooms: ChatroomInfo[], row: HTMLElement): ChatroomInfo | undefined {
  const matches = rooms.filter(room => rowContainsTitle(row, room.title))
  return matches.length === 1 ? takeRoom(rooms, room => room.id === matches[0]?.id) : undefined
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

function decorateRoomRow(
  row: HTMLElement,
  room: ChatroomInfo,
  avatars: readonly ChatroomRoomAvatar[],
  order: number,
  setPinned?: (roomId: string, pinned: boolean) => Promise<boolean>,
): void {
  row.dataset.dshChatroomRoomRow = ''
  row.dataset.dshChatroomRoomId = room.id
  row.dataset.pinned = String(room.pinned === true)
  row.style.order = String(-10_000 + order)
  row.parentElement?.setAttribute('data-dsh-chatroom-room-list', '')
  decorateNativeMenuTrigger(row, room)
  row.querySelector(`:scope > [${SOLO_AVATAR_ATTRIBUTE}]`)?.remove()
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

function setRowCategory(row: HTMLElement, category: 'group' | 'solo'): void {
  row.setAttribute(CATEGORY_ATTRIBUTE, category)
  const root = row.closest<HTMLElement>('[role="tree"]')
  const wrapper = row.parentElement
  if (root !== null && wrapper !== null && wrapper !== root) {
    wrapper.setAttribute(CATEGORY_WRAPPER_ATTRIBUTE, category)
    wrapper.style.order = row.style.order
  }
}

function decorateSoloRow(row: HTMLElement, order: number): void {
  row.style.order = String(-6_000 + order)
  if (row.querySelector(`:scope > [${SOLO_AVATAR_ATTRIBUTE}]`) !== null) return
  const avatar = row.ownerDocument.createElement('span')
  avatar.setAttribute(SOLO_AVATAR_ATTRIBUTE, '')
  avatar.setAttribute('aria-hidden', 'true')
  avatar.textContent = '✦'
  row.prepend(avatar)
}

function clearRoomRow(row: HTMLElement): void {
  delete row.dataset.dshChatroomRoomRow
  delete row.dataset.dshChatroomRoomId
  delete row.dataset.pinned
  row.style.removeProperty('order')
  row.querySelector(`:scope > [${GROUP_AVATAR_ATTRIBUTE}]`)?.remove()
}

function clearCategorizedRow(row: HTMLElement): void {
  clearRoomRow(row)
  row.removeAttribute(CATEGORY_ATTRIBUTE)
  row.removeAttribute(BRANCH_ROW_ATTRIBUTE)
  row.querySelector(`:scope > [${SOLO_AVATAR_ATTRIBUTE}]`)?.remove()
  const wrapper = row.parentElement
  wrapper?.removeAttribute(CATEGORY_WRAPPER_ATTRIBUTE)
  wrapper?.style.removeProperty('order')
}

function sidebarTreeRoot(documentRoot: Document, rows: readonly HTMLElement[]): HTMLElement | undefined {
  return rows.find(row => row.closest<HTMLElement>('[role="tree"]') !== null)
    ?.closest<HTMLElement>('[role="tree"]')
    ?? documentRoot.querySelector<HTMLElement>('[role="tree"]')
    ?? rows[0]?.parentElement
    ?? undefined
}

function reconcileWorkspaceCategories(
  documentRoot: Document,
  primary: HTMLElement | undefined,
  rows: readonly HTMLElement[],
  snapshot: ChatroomView,
  openDirect?: (peerId?: string) => Promise<void>,
): void {
  for (const root of documentRoot.querySelectorAll<HTMLElement>(`[${CATEGORY_ROOT_ATTRIBUTE}]`)) {
    if (root !== primary) clearCategoryRoot(root)
  }
  if (primary === undefined) return
  primary.setAttribute(CATEGORY_ROOT_ATTRIBUTE, '')
  reconcileNativeTreeSections(primary)
  const groupCount = rows.filter(row => row.getAttribute(CATEGORY_ATTRIBUTE) === 'group').length
  const soloCount = rows.filter(row => row.getAttribute(CATEGORY_ATTRIBUTE) === 'solo').length
  reconcileCategoryHeader(primary, 'group', '群聊', groupCount, -11_000)
  reconcileCategoryHeader(primary, 'solo', 'Solo', soloCount, -7_000)
  const peers = directDirectoryPeers(snapshot.directPeers, snapshot.directConversations)
  reconcileCategoryHeader(primary, 'direct', '私聊', peers.length, -3_000)
  reconcileDirectRows(primary, peers, snapshot, openDirect)
}

function reconcileNativeTreeSections(root: HTMLElement): void {
  for (const section of root.querySelectorAll<HTMLElement>(`[${NATIVE_GROUP_SECTION_ATTRIBUTE}]`)) {
    section.removeAttribute(NATIVE_GROUP_SECTION_ATTRIBUTE)
  }
  for (const wrapper of root.querySelectorAll<HTMLElement>(`[${NATIVE_FOLDER_WRAPPER_ATTRIBUTE}]`)) {
    wrapper.removeAttribute(NATIVE_FOLDER_WRAPPER_ATTRIBUTE)
    wrapper.removeAttribute('data-hidden')
    wrapper.style.removeProperty('order')
  }
  for (const row of root.querySelectorAll<HTMLElement>('div[role="treeitem"]')) {
    const section = directChildContaining(root, row)
    if (section !== undefined && section !== row) section.setAttribute(NATIVE_GROUP_SECTION_ATTRIBUTE, '')
    if (!row.hasAttribute('aria-expanded')) continue
    const parent = row.parentElement
    if (parent === null) continue
    const wrapper = parent.querySelectorAll('div[role="treeitem"]').length > 1 ? row : parent
    wrapper.setAttribute(NATIVE_FOLDER_WRAPPER_ATTRIBUTE, '')
    wrapper.dataset.hidden = 'true'
    if (row.getAttribute('aria-expanded') === 'false' && row.dataset.dshChatroomExpanding !== 'true') {
      row.dataset.dshChatroomExpanding = 'true'
      row.click()
      queueMicrotask(() => { delete row.dataset.dshChatroomExpanding })
    }
  }
}

function directChildContaining(root: HTMLElement, descendant: HTMLElement): HTMLElement | undefined {
  let current: HTMLElement | null = descendant
  while (current?.parentElement !== null && current.parentElement !== root) current = current.parentElement
  return current?.parentElement === root ? current : undefined
}

function reconcileCategoryHeader(
  root: HTMLElement,
  category: 'group' | 'solo' | 'direct',
  label: string,
  count: number,
  order: number,
): void {
  let header = root.querySelector<HTMLElement>(`:scope > [${CATEGORY_HEADER_ATTRIBUTE}="${category}"]`)
  if (header === null) {
    header = root.ownerDocument.createElement('div')
    header.setAttribute(CATEGORY_HEADER_ATTRIBUTE, category)
    const button = root.ownerDocument.createElement('button')
    button.type = 'button'
    button.setAttribute('aria-expanded', 'true')
    button.innerHTML = '<span data-chevron aria-hidden>⌄</span><span data-folder-icon aria-hidden></span><strong></strong><small></small>'
    button.onclick = () => {
      const collapsed = root.getAttribute(`data-dsh-chatroom-${category}-collapsed`) === 'true'
      root.setAttribute(`data-dsh-chatroom-${category}-collapsed`, String(!collapsed))
      button.setAttribute('aria-expanded', String(collapsed))
      const arrow = button.querySelector('[data-chevron]')
      if (arrow !== null) arrow.textContent = collapsed ? '⌄' : '›'
    }
    header.append(button)
    root.append(header)
  }
  header.style.order = String(order)
  const strong = header.querySelector('strong')
  const small = header.querySelector('small')
  const folderIcon = header.querySelector<HTMLElement>('[data-folder-icon]')
  if (folderIcon !== null && folderIcon.childElementCount === 0) {
    const nativeIcon = root.querySelector<SVGElement>('div[role="treeitem"][aria-expanded] svg[width="16"]')
    if (nativeIcon !== null) folderIcon.append(nativeIcon.cloneNode(true))
  }
  if (strong?.textContent !== label) strong!.textContent = label
  const countLabel = String(count)
  if (small?.textContent !== countLabel) small!.textContent = countLabel
}

function directDirectoryPeers(
  peers: readonly ChatroomDirectPeer[],
  conversations: readonly ChatroomDirectConversation[],
): readonly ChatroomDirectPeer[] {
  const conversationByPeer = new Map(conversations.map(item => [item.peer.participantId, item]))
  const all = new Map(peers.map(peer => [peer.participantId, peer]))
  for (const conversation of conversations) all.set(conversation.peer.participantId, conversation.peer)
  return [...all.values()].sort((left, right) => {
    const leftTime = conversationByPeer.get(left.participantId)?.updatedAt ?? 0
    const rightTime = conversationByPeer.get(right.participantId)?.updatedAt ?? 0
    return rightTime - leftTime || left.displayName.localeCompare(right.displayName, 'zh-CN')
  })
}

function reconcileDirectRows(
  root: HTMLElement,
  peers: readonly ChatroomDirectPeer[],
  snapshot: ChatroomView,
  openDirect?: (peerId?: string) => Promise<void>,
): void {
  const retained = new Map([...root.querySelectorAll<HTMLElement>(`:scope > [${DIRECT_ROW_ATTRIBUTE}]`)]
    .map(row => [row.dataset.peerId ?? '', row]))
  peers.forEach((peer, index) => {
    let row = retained.get(peer.participantId)
    if (row === undefined) {
      row = root.ownerDocument.createElement('div')
      row.setAttribute(DIRECT_ROW_ATTRIBUTE, '')
      row.dataset.peerId = peer.participantId
      row.innerHTML = '<button type="button"><span data-avatar></span><span><strong></strong><small></small></span></button>'
      root.append(row)
    }
    retained.delete(peer.participantId)
    row.style.order = String(-2_900 + index)
    row.dataset.active = String(snapshot.directConversation?.peer.participantId === peer.participantId)
    const button = row.querySelector<HTMLButtonElement>('button')!
    button.setAttribute('aria-label', `与 ${peer.displayName} 私聊`)
    button.onclick = () => { void openDirect?.(peer.participantId) }
    const strong = row.querySelector('strong')!
    const small = row.querySelector('small')!
    if (strong.textContent !== peer.displayName) strong.textContent = peer.displayName
    const conversation = snapshot.directConversations.find(item => item.peer.participantId === peer.participantId)
    const subtitle = conversation === undefined ? `@${peer.username}` : formatDirectTime(conversation.updatedAt)
    if (small.textContent !== subtitle) small.textContent = subtitle
    reconcileDirectAvatar(row.querySelector<HTMLElement>('[data-avatar]')!, peer)
  })
  for (const row of retained.values()) row.remove()
}

function reconcileDirectAvatar(container: HTMLElement, peer: ChatroomDirectPeer): void {
  const signature = `${peer.participantId}:${peer.avatarId}:${peer.avatarUrl ?? ''}`
  if (container.dataset.signature === signature) return
  container.dataset.signature = signature
  container.replaceChildren()
  const fallback = chatroomAvatar(peer.avatarId, peer.participantId).emoji
  if (peer.avatarUrl === undefined) {
    container.textContent = fallback
    return
  }
  const image = container.ownerDocument.createElement('img')
  image.src = peer.avatarUrl
  image.alt = ''
  image.referrerPolicy = 'no-referrer'
  image.addEventListener('error', () => {
    image.remove()
    container.textContent = fallback
  }, { once: true })
  container.append(image)
}

function formatDirectTime(timestamp: number): string {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000))
  if (elapsedMinutes < 1) return '刚刚'
  if (elapsedMinutes < 60) return `${String(elapsedMinutes)}分钟`
  if (elapsedMinutes < 1_440) return `${String(Math.floor(elapsedMinutes / 60))}小时`
  return `${String(Math.floor(elapsedMinutes / 1_440))}天`
}

function clearCategoryRoot(root: HTMLElement): void {
  root.removeAttribute(CATEGORY_ROOT_ATTRIBUTE)
  root.removeAttribute('data-dsh-chatroom-group-collapsed')
  root.removeAttribute('data-dsh-chatroom-solo-collapsed')
  root.removeAttribute('data-dsh-chatroom-direct-collapsed')
  for (const header of root.querySelectorAll(`:scope > [${CATEGORY_HEADER_ATTRIBUTE}], :scope > [${DIRECT_ROW_ATTRIBUTE}]`)) {
    header.remove()
  }
  for (const section of root.querySelectorAll<HTMLElement>(`[${NATIVE_GROUP_SECTION_ATTRIBUTE}]`)) {
    section.removeAttribute(NATIVE_GROUP_SECTION_ATTRIBUTE)
  }
  for (const wrapper of root.querySelectorAll<HTMLElement>(`[${NATIVE_FOLDER_WRAPPER_ATTRIBUTE}], [${CATEGORY_WRAPPER_ATTRIBUTE}]`)) {
    wrapper.removeAttribute(NATIVE_FOLDER_WRAPPER_ATTRIBUTE)
    wrapper.removeAttribute(CATEGORY_WRAPPER_ATTRIBUTE)
    wrapper.removeAttribute('data-hidden')
    wrapper.style.removeProperty('order')
  }
}

function decorateNativeMenuTrigger(row: HTMLElement, room: ChatroomInfo): void {
  const trigger = row.querySelector<HTMLButtonElement>('button[aria-label]')
  if (trigger === null) return
  trigger.dataset.dshChatroomNativeMenuRoomId = room.id
  if (trigger.dataset.dshChatroomNativeMenuBound === 'true') return
  trigger.dataset.dshChatroomNativeMenuBound = 'true'
  trigger.addEventListener('click', () => {
    activeNativeMenuRoomId = trigger.dataset.dshChatroomNativeMenuRoomId
    activeNativeMenuItem = undefined
  })
}

function reconcileNativeRoomMenu(
  documentRoot: Document,
  snapshot: ChatroomView,
  setPinned?: (roomId: string, pinned: boolean) => Promise<boolean>,
): void {
  if (activeNativeMenuItem !== undefined) {
    if (!activeNativeMenuItem.isConnected) {
      activeNativeMenuItem = undefined
      activeNativeMenuRoomId = undefined
    }
    return
  }
  const room = snapshot.rooms.find(candidate => candidate.id === activeNativeMenuRoomId)
  if (room === undefined) return
  const menus = [...documentRoot.querySelectorAll<HTMLElement>('[role="menu"]')]
  const menu = menus.at(-1)
  const viewport = menu?.querySelector<HTMLElement>(':scope > [role="presentation"]')
  const template = viewport?.querySelector<HTMLElement>(':scope > *')
  const templateButton = template?.querySelector<HTMLButtonElement>(':scope > button[role="menuitem"]')
  if (viewport === null || viewport === undefined || template === null || template === undefined
    || templateButton === null || templateButton === undefined) return
  const wrapper = documentRoot.createElement(template.tagName.toLowerCase())
  wrapper.className = template.className
  wrapper.dataset.dshChatroomPinMenuItem = ''
  const button = documentRoot.createElement('button')
  button.type = 'button'
  button.role = 'menuitem'
  button.className = templateButton.className
  const icon = documentRoot.createElement('span')
  icon.className = templateButton.querySelector<HTMLElement>(':scope > :first-child')?.className ?? ''
  const svg = documentRoot.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '16')
  svg.setAttribute('height', '16')
  svg.setAttribute('viewBox', '0 0 16 16')
  const path = documentRoot.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', 'M5 1.75h6l-1 4.1 2 2V9H8.65v5.25h-1.3V9H4V7.85l2-2-1-4.1Z')
  path.setAttribute('fill', 'currentColor')
  svg.append(path)
  icon.append(svg)
  const label = documentRoot.createElement('span')
  label.className = templateButton.querySelector<HTMLElement>(':scope > :last-child')?.className ?? ''
  label.textContent = room.pinned === true ? '取消置顶' : '置顶群聊'
  button.append(icon, label)
  button.onclick = event => {
    event.stopPropagation()
    void setPinned?.(room.id, room.pinned !== true)
    documentRoot.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  }
  wrapper.append(button)
  viewport.append(wrapper)
  activeNativeMenuItem = wrapper
}
