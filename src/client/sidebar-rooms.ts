import { chatroomAvatar } from '../avatars.js'
import type {
  ChatroomDirectConversation,
  ChatroomDirectPeer,
  ChatroomInfo,
  ChatroomRoomAvatar,
} from '../types.js'
import type {
  ISessions,
  SessionId,
  SessionListState,
  SessionSummary,
} from '@deepseek-ai/dsh-client-runtime/client'
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
const BRANCH_MARKER_ATTRIBUTE = 'data-dsh-chatroom-branch-marker'
const BRANCH_SURFACE_ATTRIBUTE = 'data-dsh-chatroom-branch-surface'
const BRANCH_HEADING_ATTRIBUTE = 'data-dsh-chatroom-branch-heading'
const BRANCH_BADGE_ATTRIBUTE = 'data-dsh-chatroom-branch-badge'
const BRANCH_TOPIC_ATTRIBUTE = 'data-dsh-chatroom-branch-topic'
const BRANCH_PARENT_ATTRIBUTE = 'data-dsh-chatroom-branch-parent'
const BRANCH_REPLIES_ATTRIBUTE = 'data-dsh-chatroom-branch-replies'
const BRANCH_NATIVE_TITLE_ATTRIBUTE = 'data-dsh-chatroom-native-branch-title'
const BRANCH_COUNT_ATTRIBUTE = 'data-dsh-chatroom-branch-count'
const SESSION_ID_ATTRIBUTE = 'data-dsh-chatroom-session-id'
const BRANCH_SESSION_PREFIX = 'chatroom-thread-v1-'
const BRANCH_TITLE_PREFIX = '分支：'
const NATIVE_GROUP_SECTION_ATTRIBUTE = 'data-dsh-chatroom-native-group-section'
const NATIVE_FOLDER_WRAPPER_ATTRIBUTE = 'data-dsh-chatroom-native-folder-wrapper'

type SidebarSessionList = Pick<SessionListState, 'byId'>

interface BranchRowFacts {
  readonly sessionId: string | undefined
  readonly displayTitle: string
  readonly topic: string
  readonly parentSessionId: string | undefined
  readonly parentTitle: string | undefined
  readonly replyCount: number | undefined
}

interface RowBinding {
  readonly row: HTMLElement
  readonly sessionId: string | undefined
  readonly summary: SessionSummary | undefined
  readonly branch: BranchRowFacts | undefined
  readonly room: ChatroomInfo | undefined
}

interface OriginalRowAttributes {
  readonly ariaLabel: string | null
  readonly title: string | null
  readonly appliedAriaLabel: string
  readonly appliedTitle: string
}

// Native rows normally have no tooltip or explicit aria-label. Remembering the
// original values lets a row be reused by React without leaving plugin text on it.
const originalRowAttributes = new WeakMap<HTMLElement, OriginalRowAttributes>()
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
    const list = sessions.list.getSnapshot()
    const snapshot = store.getSnapshot()
    reconcileSidebarRoomRows(
      document,
      snapshot,
      list.current,
      store.setRoomPinned,
      store.openDirect,
      store.closeDirect,
      list,
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
    const decoratedRows = document.querySelectorAll<HTMLElement>(
      `${ROOM_ROW_SELECTOR}, [${BRANCH_ROW_ATTRIBUTE}], [${SESSION_ID_ATTRIBUTE}]`,
    )
    for (const row of decoratedRows) clearRoomRow(row)
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
  sessionList?: SidebarSessionList,
): void {
  const rows = [...documentRoot.querySelectorAll<HTMLElement>(ROOM_ROW_SELECTOR)]
    .filter(row => row.closest(`[${DIRECT_ROW_ATTRIBUTE}]`) === null)
  const categoryRoot = sidebarTreeRoot(documentRoot, rows)
  const remaining = [...snapshot.rooms]
  const bindings: RowBinding[] = []
  const categorized: HTMLElement[] = []
  let groupOrder = 0
  let soloOrder = 0
  for (const row of rows) {
    decorateNativeConversationNavigation(row, closeDirect)
    const selected = row.getAttribute('aria-selected') === 'true'
    const sessionId = nativeSessionId(row) ?? (selected ? currentSessionId : undefined)
    const summary = sessionSummary(sessionList, sessionId) ?? uniquelyTitledBranchSummary(sessionList, row)
    const bySession = sessionId === undefined
      ? undefined
      : takeRoom(remaining, candidate => candidate.sessionId === sessionId)
    // Only a selected row without a session payload can be recovered from the
    // active room. A branch row has its own session id while the store still
    // points at the parent room; binding it here would turn the branch into a
    // duplicate parent row.
    const active = bySession === undefined && sessionId === undefined && selected && snapshot.room !== undefined
      ? takeRoom(remaining, room => room.id === snapshot.room?.id)
      : undefined
    const room = bySession ?? active ?? takeUniquelyTitledRoom(remaining, row)
    const branch = resolveBranch(row, sessionId, summary, sessionList, snapshot, room)
    bindings.push({ row, sessionId, summary, branch, room })
  }

  // Count from the complete session projection so virtualized or collapsed
  // branch rows still expose an accurate parent count.
  const branchCounts = new Map<string, number>()
  const countedBranches = new Set<string>()
  if (sessionList !== undefined) {
    for (const summary of Object.values(sessionList.byId)) {
      if (!summaryLooksLikeBranch(summary) || summary.parentId === undefined) continue
      const id = String(summary.id)
      const parent = String(summary.parentId)
      countedBranches.add(id)
      branchCounts.set(parent, (branchCounts.get(parent) ?? 0) + 1)
    }
  }
  for (const binding of bindings) {
    const branch = binding.branch
    if (branch === undefined || branch.parentSessionId === undefined) continue
    if (branch.sessionId !== undefined && countedBranches.has(branch.sessionId)) continue
    if (branch.sessionId === undefined && sessionList !== undefined
      && Object.values(sessionList.byId).some(summary =>
        summaryLooksLikeBranch(summary)
        && summary.displayTitle.trim() === branch.displayTitle
        && String(summary.parentId ?? '') === branch.parentSessionId)) continue
    branchCounts.set(branch.parentSessionId, (branchCounts.get(branch.parentSessionId) ?? 0) + 1)
  }

  for (const binding of bindings) {
    const { row, sessionId, branch, room } = binding
    if (room !== undefined) {
      clearBranchRow(row)
      decorateRoomRow(row, room, roomAvatars(room, snapshot), groupOrder++, setPinned)
      decorateBranchParent(row, room.title, sessionId === undefined ? 0 : branchCounts.get(sessionId) ?? 0)
      setRowCategory(row, 'group')
      categorized.push(row)
      continue
    }
    clearRoomDecorations(row)
    if (branch !== undefined) {
      clearBranchRow(row)
      decorateBranchRow(row, branch)
      row.style.order = String(-10_000 + groupOrder++)
      row.querySelector(`:scope > [${SOLO_AVATAR_ATTRIBUTE}]`)?.remove()
      setRowCategory(row, 'group')
      categorized.push(row)
      continue
    }
    clearBranchRow(row)
    if (!isNativeSessionRow(row)) {
      clearCategorizedRow(row)
      continue
    }
    row.removeAttribute(BRANCH_ROW_ATTRIBUTE)
    decorateSoloRow(row, soloOrder++)
    setRowCategory(row, 'solo')
    categorized.push(row)
  }
  reconcileWorkspaceCategories(documentRoot, categoryRoot, categorized, snapshot, openDirect)
  reconcileNativeRoomMenu(documentRoot, snapshot, setPinned)
}

function sessionSummary(list: SidebarSessionList | undefined, id: string | undefined): SessionSummary | undefined {
  if (list === undefined || id === undefined) return undefined
  return list.byId[id as SessionId]
}

function uniquelyTitledBranchSummary(
  list: SidebarSessionList | undefined,
  row: HTMLElement,
): SessionSummary | undefined {
  if (list === undefined) return undefined
  const title = findNativeTitleElement(row)?.textContent?.trim()
  if (title === undefined || !title.startsWith(BRANCH_TITLE_PREFIX)) return undefined
  const matches = Object.values(list.byId).filter(summary =>
    summaryLooksLikeBranch(summary) && summary.displayTitle.trim() === title)
  return matches.length === 1 ? matches[0] : undefined
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
  let sessionId: string | undefined
  try {
    // Native rows expose their authoritative Session ID only through the drag payload.
    const start = new EventConstructor('dragstart', { bubbles: true, cancelable: true })
    Object.defineProperty(start, 'dataTransfer', { value: dataTransfer })
    row.dispatchEvent(start)
    sessionId = values.get('text/plain')
  } catch {
    // The synthetic probe is best-effort; an incompatible host row can still
    // be matched through the selected-session fallback.
    sessionId = undefined
  } finally {
    // A third-party row listener should not prevent the remaining sidebar rows
    // from reconciling just because it rejects our non-user drag probe.
    try {
      const end = new EventConstructor('dragend', { bubbles: true })
      Object.defineProperty(end, 'dataTransfer', { value: dataTransfer })
      row.dispatchEvent(end)
    } catch {
      // The synthetic probe is best-effort; the selected-session fallback can
      // still bind the active row when a host listener refuses dragend.
    }
  }
  if (sessionId === undefined || sessionId.length === 0) return undefined
  row.dataset.dshChatroomSessionId = sessionId
  return sessionId
}

function rowContainsTitle(row: HTMLElement, title: string): boolean {
  return [...row.querySelectorAll('span')].some(candidate =>
    !candidate.closest(`[${BRANCH_SURFACE_ATTRIBUTE}]`)
    && candidate.childElementCount === 0
    && candidate.textContent?.trim() === title)
}

function uniquelyTitledRoom(rooms: readonly ChatroomInfo[], row: HTMLElement): ChatroomInfo | undefined {
  const matches = rooms.filter(room => rowContainsTitle(row, room.title))
  return matches.length === 1 ? matches[0] : undefined
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

function resolveBranch(
  row: HTMLElement,
  sessionId: string | undefined,
  summary: SessionSummary | undefined,
  sessionList: SidebarSessionList | undefined,
  snapshot: ChatroomView,
  room: ChatroomInfo | undefined,
): BranchRowFacts | undefined {
  // A real room whose title happens to start with “分支：” must remain a room;
  // an authoritative room/session match wins over the title heuristic.
  if (room !== undefined || (sessionId !== undefined && snapshot.rooms.some(candidate => candidate.sessionId === sessionId))) {
    return undefined
  }
  const rowTitle = findNativeTitleElement(row)?.textContent?.trim()
  const summaryTitle = summary?.displayTitle.trim()
  const idLooksLikeBranch = sessionId?.startsWith(BRANCH_SESSION_PREFIX) === true
  const titleLooksLikeBranch = summaryTitle?.startsWith(BRANCH_TITLE_PREFIX) === true
    || rowTitle?.startsWith(BRANCH_TITLE_PREFIX) === true
  // Once the host has a summary, a user-renamed ordinary Session may also
  // start with “分支：”. Require the durable branch id/parent signal in that
  // case; the title-only fallback is reserved for the loading gap.
  if (summary !== undefined && !summaryLooksLikeBranch(summary) && !idLooksLikeBranch) return undefined
  // A keyed native row can briefly be reused while its Session summary is
  // loading. Do not let a stale cached branch id repaint an ordinary title.
  const summaryIsBranch = summary !== undefined && summaryLooksLikeBranch(summary)
  if (idLooksLikeBranch && rowTitle !== undefined && !rowTitle.startsWith(BRANCH_TITLE_PREFIX)
    && !summaryIsBranch) {
    if (row.dataset.dshChatroomSessionId === sessionId) delete row.dataset.dshChatroomSessionId
    return undefined
  }
  if (!idLooksLikeBranch && !titleLooksLikeBranch) return undefined
  const displayTitle = summaryTitle ?? rowTitle ?? BRANCH_TITLE_PREFIX
  const topic = branchTopic(displayTitle)
  const preview = sessionId === undefined
    ? undefined
    : (snapshot.threadPreviews ?? []).find(candidate => candidate.thread.sessionId === sessionId)
  const previewRoom = preview === undefined
    ? undefined
    : snapshot.rooms.find(room => room.id === preview.thread.roomId)
  const parentSessionId = summary?.parentId === undefined
    ? (preview?.thread.root.sourceSessionId ?? previewRoom?.sessionId)
    : String(summary.parentId)
  const parentSummary = sessionSummary(sessionList, parentSessionId)
  const parentRoom = parentSessionId === undefined
    ? undefined
    : snapshot.rooms.find(room => room.sessionId === parentSessionId)
  const parentTitle = parentRoom?.title ?? parentSummary?.displayTitle ?? previewRoom?.title
  const replyCount = preview !== undefined && preview.totalMessages > 0
    ? preview.totalMessages
    : undefined
  return { sessionId, displayTitle, topic, parentSessionId, parentTitle, replyCount }
}

function summaryLooksLikeBranch(summary: SessionSummary): boolean {
  return String(summary.id).startsWith(BRANCH_SESSION_PREFIX)
    || (summary.parentId !== undefined && summary.displayTitle.trim().startsWith(BRANCH_TITLE_PREFIX))
}

function branchTopic(title: string): string {
  const normalized = title.trim()
  const topic = normalized.startsWith(BRANCH_TITLE_PREFIX)
    ? normalized.slice(BRANCH_TITLE_PREFIX.length).trim()
    : normalized
  return topic === '' ? '未命名主题' : topic
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

function decorateBranchRow(row: HTMLElement, facts: BranchRowFacts): void {
  row.dataset.dshChatroomBranchRow = ''
  if (facts.sessionId !== undefined) row.dataset.dshChatroomBranchSessionId = facts.sessionId
  else delete row.dataset.dshChatroomBranchSessionId
  if (facts.parentSessionId !== undefined) row.dataset.dshChatroomBranchParentSessionId = facts.parentSessionId
  else delete row.dataset.dshChatroomBranchParentSessionId
  row.dataset.dshChatroomBranchTopic = facts.topic
  if (facts.parentTitle === undefined) delete row.dataset.dshChatroomBranchParentTitle
  else row.dataset.dshChatroomBranchParentTitle = facts.parentTitle
  if (facts.replyCount === undefined) row.removeAttribute(BRANCH_REPLIES_ATTRIBUTE)
  else row.setAttribute(BRANCH_REPLIES_ATTRIBUTE, String(facts.replyCount))

  const parentLabel = facts.parentTitle === undefined ? '来自群聊' : `来自 ${facts.parentTitle}`
  const replyLabel = facts.replyCount === undefined ? '' : ` · ${facts.replyCount} 条回复`
  const label = facts.parentTitle === undefined && facts.replyCount === undefined
    ? `分支会话：${facts.topic}`
    : `分支会话：${facts.topic}，${parentLabel}${replyLabel}`
  rememberOriginalAttributes(row, label)
  row.setAttribute('aria-label', label)
  row.setAttribute('title', label)

  const titleElement = findNativeTitleElement(row, facts.displayTitle)
  titleElement?.setAttribute(BRANCH_NATIVE_TITLE_ATTRIBUTE, '')
  let marker = row.querySelector<HTMLElement>(`:scope > [${BRANCH_MARKER_ATTRIBUTE}]`)
  if (marker === null) {
    marker = row.ownerDocument.createElement('span')
    marker.setAttribute(BRANCH_MARKER_ATTRIBUTE, '')
    marker.setAttribute('aria-hidden', 'true')
    marker.textContent = '↳'
  }
  let surface = row.querySelector<HTMLElement>(`:scope > [${BRANCH_SURFACE_ATTRIBUTE}]`)
  if (surface === null) {
    surface = row.ownerDocument.createElement('span')
    surface.setAttribute(BRANCH_SURFACE_ATTRIBUTE, '')
    surface.setAttribute('aria-hidden', 'true')
  }
  const signature = `${facts.topic}|${facts.parentTitle ?? ''}|${facts.replyCount ?? ''}`
  if (surface.dataset.signature !== signature) {
    surface.replaceChildren()
    const heading = row.ownerDocument.createElement('span')
    heading.setAttribute(BRANCH_HEADING_ATTRIBUTE, '')
    const badge = row.ownerDocument.createElement('span')
    badge.setAttribute(BRANCH_BADGE_ATTRIBUTE, '')
    badge.textContent = '分支'
    const topic = row.ownerDocument.createElement('span')
    topic.setAttribute(BRANCH_TOPIC_ATTRIBUTE, '')
    topic.textContent = facts.topic
    heading.append(badge, topic)
    const parent = row.ownerDocument.createElement('span')
    parent.setAttribute(BRANCH_PARENT_ATTRIBUTE, '')
    parent.textContent = `${parentLabel}${replyLabel}`
    surface.append(heading, parent)
    surface.dataset.signature = signature
  }
  if (titleElement !== undefined) {
    const alreadyPositioned = titleElement.previousElementSibling === surface
      && surface.previousElementSibling === marker
    if (!alreadyPositioned) titleElement.before(marker, surface)
  } else if (marker.parentElement !== row || surface.parentElement !== row) {
    row.append(marker, surface)
  }
}

function decorateBranchParent(row: HTMLElement, roomTitle: string, count: number): void {
  if (count === 0) {
    clearBranchParent(row)
    return
  }
  row.dataset.dshChatroomHasBranches = ''
  row.dataset.dshChatroomBranchCount = String(count)
  let indicator = row.querySelector<HTMLElement>(`:scope > [${BRANCH_COUNT_ATTRIBUTE}]`)
  if (indicator === null) {
    indicator = row.ownerDocument.createElement('span')
    indicator.setAttribute(BRANCH_COUNT_ATTRIBUTE, '')
    const titleElement = findNativeTitleElement(row, roomTitle)
    if (titleElement === undefined) row.append(indicator)
    else titleElement.after(indicator)
  }
  const label = `分支 ${count}`
  // Avoid replacing the text node on every observer pass; the sidebar observer
  // watches child-list mutations and would otherwise schedule itself forever.
  if (indicator.textContent !== label) indicator.textContent = label
  indicator.setAttribute('title', `${count} 个分支`)
  indicator.setAttribute('aria-label', `${count} 个分支`)
}

function clearBranchParent(row: HTMLElement): void {
  delete row.dataset.dshChatroomHasBranches
  delete row.dataset.dshChatroomBranchCount
  row.querySelector(`:scope > [${BRANCH_COUNT_ATTRIBUTE}]`)?.remove()
}

function findNativeTitleElement(row: HTMLElement, expectedTitle?: string): HTMLElement | undefined {
  const candidates = [...row.querySelectorAll<HTMLElement>('span')].filter(candidate =>
    !candidate.closest(`[${BRANCH_SURFACE_ATTRIBUTE}]`)
    && !candidate.hasAttribute(BRANCH_MARKER_ATTRIBUTE)
    && !candidate.hasAttribute(BRANCH_COUNT_ATTRIBUTE)
    && candidate.childElementCount === 0)
  if (expectedTitle !== undefined) {
    const exact = candidates.find(candidate => candidate.textContent?.trim() === expectedTitle)
    if (exact !== undefined) return exact
  }
  return candidates.find(candidate => candidate.textContent?.trim().startsWith(BRANCH_TITLE_PREFIX))
    ?? candidates.find(candidate => candidate.dataset.dshChatroomNativeBranchTitle !== undefined)
    ?? candidates
      .filter(candidate => {
        const text = candidate.textContent?.trim() ?? ''
        return text !== '' && !looksLikeTimeLabel(text) && text !== '●'
      })
      .sort((left, right) => (right.textContent?.trim().length ?? 0) - (left.textContent?.trim().length ?? 0))[0]
}

function looksLikeTimeLabel(value: string): boolean {
  return /^(?:刚刚|现在|now|\d+\s*(?:秒|分钟|小时|天|周|月|年|s|min|h|d|w))$/iu.test(value)
}

function rememberOriginalAttributes(row: HTMLElement, appliedLabel: string): void {
  const original = originalRowAttributes.get(row)
  if (original === undefined) {
    originalRowAttributes.set(row, {
      ariaLabel: row.getAttribute('aria-label'),
      title: row.getAttribute('title'),
      appliedAriaLabel: appliedLabel,
      appliedTitle: appliedLabel,
    })
    return
  }
  // React may update native accessibility attributes while the plugin owns the
  // branch presentation. Treat a value that no longer matches our last write
  // as the new host value, so cleanup never restores stale metadata.
  const ariaLabel = row.getAttribute('aria-label') === original.appliedAriaLabel
    ? original.ariaLabel
    : row.getAttribute('aria-label')
  const title = row.getAttribute('title') === original.appliedTitle
    ? original.title
    : row.getAttribute('title')
  originalRowAttributes.set(row, {
    ariaLabel,
    title,
    appliedAriaLabel: appliedLabel,
    appliedTitle: appliedLabel,
  })
}

function clearBranchRow(row: HTMLElement): void {
  delete row.dataset.dshChatroomBranchRow
  delete row.dataset.dshChatroomBranchSessionId
  delete row.dataset.dshChatroomBranchParentSessionId
  delete row.dataset.dshChatroomBranchTopic
  delete row.dataset.dshChatroomBranchParentTitle
  row.removeAttribute(BRANCH_REPLIES_ATTRIBUTE)
  row.querySelector(`:scope > [${BRANCH_MARKER_ATTRIBUTE}]`)?.remove()
  row.querySelector(`:scope > [${BRANCH_SURFACE_ATTRIBUTE}]`)?.remove()
  for (const title of row.querySelectorAll(`[${BRANCH_NATIVE_TITLE_ATTRIBUTE}]`)) {
    title.removeAttribute(BRANCH_NATIVE_TITLE_ATTRIBUTE)
  }
  const original = originalRowAttributes.get(row)
  if (original !== undefined) {
    if (row.getAttribute('aria-label') === original.appliedAriaLabel) {
      if (original.ariaLabel === null) row.removeAttribute('aria-label')
      else row.setAttribute('aria-label', original.ariaLabel)
    }
    if (row.getAttribute('title') === original.appliedTitle) {
      if (original.title === null) row.removeAttribute('title')
      else row.setAttribute('title', original.title)
    }
    originalRowAttributes.delete(row)
  }
}

function clearRoomDecorations(row: HTMLElement): void {
  delete row.dataset.dshChatroomRoomRow
  delete row.dataset.dshChatroomRoomId
  delete row.dataset.pinned
  clearBranchParent(row)
  row.querySelector(`:scope > [${GROUP_AVATAR_ATTRIBUTE}]`)?.remove()
}

function clearRoomRow(row: HTMLElement): void {
  clearBranchRow(row)
  clearRoomDecorations(row)
  delete row.dataset.dshChatroomSessionId
  delete row.dataset.dshChatroomBranchSessionId
  row.style.removeProperty('order')
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
  const peers = directDirectoryPeers(snapshot.directPeers ?? [], snapshot.directConversations ?? [])
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
