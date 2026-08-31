import { afterEach, describe, expect, it } from 'vitest'
import { reconcileSidebarRoomRows } from '../../src/client/sidebar-rooms.js'
import { CHATROOM_STYLES } from '../../src/client/styles.js'
import type { ChatroomView } from '../../src/client/store.js'

afterEach(() => {
  document.documentElement.removeAttribute('data-dsh-chatroom-active')
  document.head.replaceChildren()
  document.body.replaceChildren()
})

const EMPTY_SNAPSHOT = {
  rooms: [], members: [], directPeers: [], directConversations: [],
} as unknown as ChatroomView

describe('sidebar category overflow in a real browser', () => {
  it('keeps one show-more control below every visible row instead of mid-list buttons', () => {
    mountSidebar([5, 5])

    reconcileSidebarRoomRows(document, EMPTY_SNAPSHOT)

    const rows = sessionRows()
    expect(rows).toHaveLength(10)
    expect(rows.filter(isVisible)).toHaveLength(8)
    // The reported defect was several native buttons interleaved between rows.
    // A category now owns exactly one control and it sits below the last row.
    const nativeButtons = [...document.querySelectorAll<HTMLElement>('[data-dsh-chatroom-native-overflow-button]')]
    expect(nativeButtons).toHaveLength(2)
    expect(nativeButtons.filter(isVisible)).toHaveLength(0)
    const controls = [...document.querySelectorAll<HTMLElement>('[data-dsh-chatroom-category-overflow]')]
    expect(controls).toHaveLength(1)
    const control = controls[0]!
    expect(control.textContent).toBe('展开其余 2 个会话')
    expect(bottomOfVisibleRows(rows)).toBeLessThanOrEqual(control.getBoundingClientRect().top)
    expect(control.getBoundingClientRect().bottom)
      .toBeLessThanOrEqual(header('direct').getBoundingClientRect().top)
  })

  it('reveals the remaining rows and follows them when expanded', () => {
    mountSidebar([5, 5])
    reconcileSidebarRoomRows(document, EMPTY_SNAPSHOT)
    const control = requiredElement<HTMLElement>('[data-dsh-chatroom-category-overflow="solo"]')

    requiredElement<HTMLButtonElement>('[data-dsh-chatroom-category-overflow="solo"] button').click()

    const rows = sessionRows()
    expect(rows.filter(isVisible)).toHaveLength(10)
    expect(control.textContent).toBe('收起')
    expect(bottomOfVisibleRows(rows)).toBeLessThanOrEqual(control.getBoundingClientRect().top)
  })

  it('hides its control together with the collapsed category', () => {
    mountSidebar([5, 5])
    reconcileSidebarRoomRows(document, EMPTY_SNAPSHOT)

    requiredElement<HTMLButtonElement>('[data-dsh-chatroom-category-header="solo"] button').click()

    expect(sessionRows().filter(isVisible)).toHaveLength(0)
    expect(isVisible(requiredElement<HTMLElement>('[data-dsh-chatroom-category-overflow="solo"]'))).toBe(false)
  })
})

function sessionRows(): readonly HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-dsh-chatroom-sidebar-category="solo"]')]
}

function isVisible(element: HTMLElement): boolean {
  return element.getClientRects().length > 0
}

function bottomOfVisibleRows(rows: readonly HTMLElement[]): number {
  return Math.max(...rows.filter(isVisible).map(row => row.getBoundingClientRect().bottom))
}

function header(category: string): HTMLElement {
  return requiredElement<HTMLElement>(`[data-dsh-chatroom-category-header="${category}"]`)
}

// Mirrors the native workspace browser: one section per Workspace, each session
// row inside its own HoverCard wrapper, each section truncated by its own
// collapsed "show more sessions" button.
function mountSidebar(sessionsPerSection: readonly number[]): void {
  document.documentElement.dataset.dshChatroomActive = ''
  const style = document.createElement('style')
  style.textContent = `${CHATROOM_STYLES}
    body { margin: 0; }
    .host-tree { display: flex; flex-direction: column; width: 280px; }
    .host-section { display: flex; flex-direction: column; }
    .host-wrapper { display: block; }
    div[role="treeitem"] { display: flex; align-items: center; height: 44px; }
    .host-overflow { height: 32px; }
  `
  document.head.append(style)
  let session = 0
  const sections = sessionsPerSection.map((count, index) => {
    const rows = Array.from({ length: count }, () => {
      session += 1
      const title = `会话 ${String(session)}`
      return `<span class="host-wrapper"><div role="treeitem" aria-selected="false">`
        + `<span></span><span>${title}</span><button aria-label="${title}操作">•••</button></div></span>`
    }).join('')
    return `<div class="host-section">${rows}`
      + `<button class="host-overflow" type="button" aria-expanded="false">展开其余 ${String(index + 3)} 个会话</button>`
      + '</div>'
  }).join('')
  document.body.innerHTML = `<div class="host-tree" role="tree">${sections}</div>`
}

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (element === null) throw new Error(`Missing fixture element: ${selector}`)
  return element
}
