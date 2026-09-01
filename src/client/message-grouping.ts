/** Visual position of one message inside a consecutive sender group. */
export type ChatroomMessageGroupPosition = 'single' | 'start' | 'middle' | 'end'

const GROUP_WINDOW_MS = 5 * 60_000

/** Compute a message's position among adjacent messages from the same sender. */
export function chatroomMessageGroupPosition<T>(
  messages: readonly T[],
  index: number,
  sender: (message: T) => string,
  createdAt: (message: T) => number,
): ChatroomMessageGroupPosition {
  const current = messages[index]
  if (current === undefined) return 'single'
  const previous = messages[index - 1]
  const next = messages[index + 1]
  const joinsPrevious = previous !== undefined
    && sender(previous) === sender(current)
    && createdAt(current) - createdAt(previous) >= 0
    && createdAt(current) - createdAt(previous) <= GROUP_WINDOW_MS
  const joinsNext = next !== undefined
    && sender(next) === sender(current)
    && createdAt(next) - createdAt(current) >= 0
    && createdAt(next) - createdAt(current) <= GROUP_WINDOW_MS
  if (joinsPrevious && joinsNext) return 'middle'
  if (joinsPrevious) return 'end'
  if (joinsNext) return 'start'
  return 'single'
}

/** Stable identifier shared by adjacent messages in one visual sender group. */
export function chatroomMessageActionGroup<T>(
  messages: readonly T[],
  index: number,
  sender: (message: T) => string,
  createdAt: (message: T) => number,
): string {
  const current = messages[index]
  if (current === undefined) return `missing:${index}`
  let first = index
  while (first > 0) {
    const previous = messages[first - 1]!
    const candidate = messages[first]!
    const gap = createdAt(candidate) - createdAt(previous)
    if (sender(previous) !== sender(current) || gap < 0 || gap > GROUP_WINDOW_MS) break
    first -= 1
  }
  return `${sender(current)}:${createdAt(messages[first]!)}:${first}`
}

/** Move the group's one visible action rail to the hovered message. */
export function activateGroupedMessageActions(message: HTMLElement): void {
  const row = actionRow(message)
  if (row === undefined) return
  for (const candidate of actionGroupRows(row)) candidate.dataset.dshChatroomActionsVisible = String(candidate === row)
}

/** Restore the group's one visible action rail to its final message. */
export function restoreGroupedMessageActions(message: HTMLElement): void {
  const row = actionRow(message)
  if (row === undefined) return
  for (const candidate of actionGroupRows(row)) {
    const position = candidate.dataset.dshChatroomGroupPosition
    candidate.dataset.dshChatroomActionsVisible = String(position === 'single' || position === 'end')
  }
}

/** Reconcile native conversation rows after one participant message mounts or unmounts. */
export function reconcileNativeMessageGroups(message: HTMLElement, sender: string, createdAt: number): () => void {
  const flow = message.closest<HTMLElement>('[data-chat-flow-kind]')
  if (flow === null || flow.parentElement === null) return () => undefined
  flow.dataset.dshChatroomGroupSender = sender
  flow.dataset.dshChatroomGroupTime = String(createdAt)
  const container = flow.parentElement
  reconcileFlowContainer(container)
  return () => {
    delete flow.dataset.dshChatroomGroupSender
    delete flow.dataset.dshChatroomGroupTime
    delete flow.dataset.dshChatroomGroupPosition
    delete flow.dataset.dshChatroomActionGroup
    delete flow.dataset.dshChatroomActionsVisible
    queueMicrotask(() => { if (container.isConnected) reconcileFlowContainer(container) })
  }
}

function reconcileFlowContainer(container: HTMLElement): void {
  const children = [...container.children].filter((child): child is HTMLElement => child instanceof HTMLElement)
  for (const child of children) {
    delete child.dataset.dshChatroomGroupPosition
    delete child.dataset.dshChatroomActionGroup
    delete child.dataset.dshChatroomActionsVisible
  }
  let index = 0
  while (index < children.length) {
    const first = children[index]!
    const sender = first.dataset.dshChatroomGroupSender
    const firstTime = groupTime(first)
    if (sender === undefined || firstTime === undefined) {
      index += 1
      continue
    }
    let end = index
    let previousTime = firstTime
    while (end + 1 < children.length) {
      const next = children[end + 1]!
      const nextTime = groupTime(next)
      if (next.dataset.dshChatroomGroupSender !== sender
        || nextTime === undefined
        || nextTime - previousTime < 0
        || nextTime - previousTime > GROUP_WINDOW_MS) break
      end += 1
      previousTime = nextTime
    }
    for (let cursor = index; cursor <= end; cursor += 1) {
      const position: ChatroomMessageGroupPosition = index === end
        ? 'single'
        : cursor === index
          ? 'start'
          : cursor === end
            ? 'end'
            : 'middle'
      const child = children[cursor]!
      child.dataset.dshChatroomGroupPosition = position
      child.dataset.dshChatroomActionGroup = `${sender}:${firstTime}:${index}`
      child.dataset.dshChatroomActionsVisible = String(position === 'single' || position === 'end')
      child.querySelector<HTMLElement>('.dsh-chatroom-participant-message')?.setAttribute('data-dsh-chatroom-group-position', position)
    }
    index = end + 1
  }
}

function actionRow(message: HTMLElement): HTMLElement | undefined {
  return message.closest<HTMLElement>('[data-chat-flow-kind][data-dsh-chatroom-action-group]')
    ?? message.closest<HTMLElement>('[data-dsh-chatroom-action-group]')
    ?? undefined
}

function actionGroupRows(row: HTMLElement): readonly HTMLElement[] {
  const key = row.dataset.dshChatroomActionGroup
  const parent = row.parentElement
  if (key === undefined || parent === null) return [row]
  return [...parent.children].filter((candidate): candidate is HTMLElement =>
    candidate instanceof HTMLElement && candidate.dataset.dshChatroomActionGroup === key)
}

function groupTime(element: HTMLElement): number | undefined {
  const value = Number(element.dataset.dshChatroomGroupTime)
  return Number.isFinite(value) ? value : undefined
}
