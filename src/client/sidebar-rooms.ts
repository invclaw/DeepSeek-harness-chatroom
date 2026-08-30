import { chatroomAvatar } from '../avatars.js'
import type { ChatroomInfo, ChatroomRoomAvatar } from '../types.js'
import type {
  ISessions,
  SessionId,
  SessionListState,
  SessionSummary,
} from '@deepseek-ai/dsh-client-runtime/client'
import type { ChatroomClientStore, ChatroomView } from './store.js'

const ROOM_ROW_SELECTOR = 'div[role="treeitem"][aria-selected]'
const GROUP_AVATAR_ATTRIBUTE = 'data-dsh-chatroom-group-avatar'
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

/** Decorate native Workspace Session rows without replacing the Harness sidebar. */
export function installSidebarRoomRows(store: ChatroomClientStore, sessions?: ISessions): () => void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return () => undefined
  let scheduled = false
  const reconcile = (): void => {
    scheduled = false
    const list = sessions?.list.getSnapshot()
    reconcileSidebarRoomRows(document, store.getSnapshot(), list?.current, list)
  }
  const schedule = (): void => {
    if (scheduled) return
    scheduled = true
    queueMicrotask(reconcile)
  }
  const observer = new MutationObserver(schedule)
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })
  const unsubscribe = store.subscribe(schedule)
  const unsubscribeSessions = sessions?.list.subscribe(schedule)
  schedule()
  return () => {
    unsubscribe()
    unsubscribeSessions?.()
    observer.disconnect()
    const decoratedRows = document.querySelectorAll<HTMLElement>(
      `${ROOM_ROW_SELECTOR}, [${BRANCH_ROW_ATTRIBUTE}], [${SESSION_ID_ATTRIBUTE}]`,
    )
    for (const row of decoratedRows) clearRoomRow(row)
  }
}

/** Reconcile one document pass; exported for deterministic browser tests. */
export function reconcileSidebarRoomRows(
  documentRoot: Document,
  snapshot: ChatroomView,
  currentSessionId?: SessionId,
  sessionList?: SidebarSessionList,
): void {
  const rows = [...documentRoot.querySelectorAll<HTMLElement>(ROOM_ROW_SELECTOR)]
  const bindings: RowBinding[] = rows.map((row) => {
    const sessionId = nativeSessionId(row)
      ?? (row.getAttribute('aria-selected') === 'true'
        ? String(currentSessionId ?? snapshot.room?.sessionId ?? '') || undefined
        : undefined)
    const summary = sessionSummary(sessionList, sessionId)
      ?? uniquelyTitledBranchSummary(sessionList, row)
    const room = sessionId === undefined
      ? uniquelyTitledRoom(snapshot.rooms, row)
      : snapshot.rooms.find(candidate => candidate.sessionId === sessionId)
    return {
      row,
      sessionId,
      summary,
      branch: resolveBranch(row, sessionId, summary, sessionList, snapshot, room),
      room,
    }
  })

  // Parent counts are computed before painting rows so the parent marker does
  // not depend on native row order (the host may sort by recency). Start with
  // the full session projection so collapsed/virtualized branch rows count too.
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
    const parent = branch.parentSessionId
    if (branch.sessionId !== undefined && countedBranches.has(branch.sessionId)) continue
    if (branch.sessionId === undefined && sessionList !== undefined
      && Object.values(sessionList.byId).some(summary =>
        summaryLooksLikeBranch(summary)
        && summary.displayTitle.trim() === branch.displayTitle
        && String(summary.parentId ?? '') === parent)) continue
    branchCounts.set(parent, (branchCounts.get(parent) ?? 0) + 1)
  }

  for (const binding of bindings) {
    if (binding.branch !== undefined) {
      clearRoomDecorations(binding.row)
      decorateBranchRow(binding.row, binding.branch)
      continue
    }
    clearBranchRow(binding.row)
    if (binding.room === undefined) {
      clearRoomDecorations(binding.row)
      continue
    }
    decorateRoomRow(binding.row, binding.room, roomAvatars(binding.room, snapshot))
    const count = binding.sessionId === undefined
      ? 0
      : branchCounts.get(binding.sessionId) ?? 0
    decorateBranchParent(binding.row, binding.room.title, count)
  }
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
  clearBranchParent(row)
  row.querySelector(`:scope > [${GROUP_AVATAR_ATTRIBUTE}]`)?.remove()
}

function clearRoomRow(row: HTMLElement): void {
  clearBranchRow(row)
  clearRoomDecorations(row)
  delete row.dataset.dshChatroomSessionId
  delete row.dataset.dshChatroomBranchSessionId
}
