// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { reconcileSidebarRoomRows } from '../src/client/sidebar-rooms.js'
import type { ChatroomView } from '../src/client/store.js'

afterEach(() => {
  document.body.replaceChildren()
})

describe('native sidebar room rows', () => {
  function bindNativeSession(row: HTMLElement, sessionId: string): void {
    row.draggable = true
    row.addEventListener('dragstart', event => {
      ;(event as DragEvent).dataTransfer?.setData('text/plain', sessionId)
    })
  }

  it('adds a nine-grid member avatar to the matching native Session row', () => {
    document.body.innerHTML = `
      <div role="treeitem" aria-selected="true">
        <span></span><span>项目群</span><span>刚刚</span>
      </div>
      <div role="treeitem" aria-selected="false">
        <span></span><span>普通会话</span><span>5分钟</span>
      </div>
    `
    const room = {
      id: 'room', title: '项目群', aiDisplayName: 'DeepSeek', sessionId: 'session',
      memberAvatarIds: ['whale', 'panda', 'fox', 'cat', 'dog', 'rabbit', 'octopus', 'unicorn', 'whale'],
    } as const
    const snapshot = {
      rooms: [room], room, directPeers: [], directConversations: [],
      members: room.memberAvatarIds.map((avatarId, index) => ({ avatarId, participantId: String(index) })),
    } as unknown as ChatroomView

    reconcileSidebarRoomRows(document, snapshot)

    const roomRow = document.querySelector<HTMLElement>('[data-dsh-chatroom-room-row]')!
    expect(roomRow.dataset.dshChatroomRoomId).toBe('room')
    const avatar = roomRow.querySelector<HTMLElement>('[data-dsh-chatroom-group-avatar]')!
    expect(avatar.dataset.count).toBe('9')
    expect(avatar.children).toHaveLength(9)
    expect(roomRow.querySelector('[data-dsh-chatroom-solo-avatar]')).toBeNull()
    expect(document.querySelectorAll('[data-dsh-chatroom-room-row]')).toHaveLength(1)
  })

  it('removes a stale Solo icon when a native Session becomes a shared room', () => {
    document.body.innerHTML = `
      <div role="tree">
        <div role="treeitem" aria-selected="true"><span></span><span>稍后识别的群聊</span></div>
      </div>
    `
    const soloSnapshot = {
      rooms: [], members: [], directPeers: [], directConversations: [],
    } as unknown as ChatroomView

    reconcileSidebarRoomRows(document, soloSnapshot)
    expect(document.querySelectorAll('[data-dsh-chatroom-solo-avatar]')).toHaveLength(1)

    const room = {
      id: 'room', title: '稍后识别的群聊', aiDisplayName: 'DeepSeek', sessionId: 'session',
      memberAvatarIds: ['whale'],
    } as const
    reconcileSidebarRoomRows(document, {
      rooms: [room], room, members: [], directPeers: [], directConversations: [],
    } as unknown as ChatroomView)

    const roomRow = document.querySelector<HTMLElement>('[data-dsh-chatroom-room-row]')!
    expect(roomRow.querySelectorAll('[data-dsh-chatroom-group-avatar]')).toHaveLength(1)
    expect(roomRow.querySelector('[data-dsh-chatroom-solo-avatar]')).toBeNull()
  })

  it('uses the selected room id when two Sessions share the same title', () => {
    document.body.innerHTML = `
      <div role="treeitem" aria-selected="false"><span></span><span>同名群</span></div>
      <div role="treeitem" aria-selected="true"><span></span><span>同名群</span></div>
    `
    const first = {
      id: 'first', title: '同名群', aiDisplayName: 'DeepSeek', sessionId: 'first-session', memberAvatarIds: ['fox'],
    } as const
    const selected = {
      id: 'selected', title: '同名群', aiDisplayName: 'DeepSeek', sessionId: 'selected-session', memberAvatarIds: ['cat'],
    } as const
    const snapshot = {
      rooms: [first, selected], room: selected, members: [], directPeers: [], directConversations: [],
    } as unknown as ChatroomView
    const nativeRows = [...document.querySelectorAll<HTMLElement>('[role="treeitem"]')]
    bindNativeSession(nativeRows[0]!, 'selected-session')
    bindNativeSession(nativeRows[1]!, 'first-session')

    reconcileSidebarRoomRows(document, snapshot)

    const rows = [...document.querySelectorAll<HTMLElement>('[data-dsh-chatroom-room-row]')]
    expect(rows[0]?.dataset.dshChatroomRoomId).toBe('selected')
    expect(rows[1]?.dataset.dshChatroomRoomId).toBe('first')
  })

  it('keeps duplicate-title avatars bound to native session ids across selection and row reorder', () => {
    document.body.innerHTML = `
      <div role="treeitem" aria-selected="false"><span></span><span>workspace</span></div>
      <div role="treeitem" aria-selected="true"><span></span><span>workspace</span></div>
    `
    const first = {
      id: 'first', title: 'workspace', aiDisplayName: 'DeepSeek', sessionId: 'session-a',
      memberAvatars: [{ participantId: 'artist', avatarId: 'whale' }],
    } as const
    const second = {
      id: 'second', title: 'workspace', aiDisplayName: 'DeepSeek', sessionId: 'session-b',
      memberAvatars: [{ participantId: 'person', avatarId: 'dog', avatarUrl: 'https://images.example.com/person.png' }],
    } as const
    const snapshot = { rooms: [first, second], room: second, members: [] } as unknown as ChatroomView
    const rows = [...document.querySelectorAll<HTMLElement>('[role="treeitem"]')]
    bindNativeSession(rows[0]!, 'session-a')
    bindNativeSession(rows[1]!, 'session-b')

    reconcileSidebarRoomRows(document, snapshot, 'session-b' as never)
    const before = rows.map(row => row.querySelector<HTMLElement>('[data-dsh-chatroom-group-avatar]')?.dataset.signature)

    rows[0]!.setAttribute('aria-selected', 'true')
    rows[1]!.setAttribute('aria-selected', 'false')
    rows[1]!.before(rows[0]!)
    reconcileSidebarRoomRows(document, { ...snapshot, room: first } as ChatroomView, 'session-a' as never)

    expect(rows[0]!.dataset.dshChatroomRoomId).toBe('first')
    expect(rows[1]!.dataset.dshChatroomRoomId).toBe('second')
    expect(rows.map(row => row.querySelector<HTMLElement>('[data-dsh-chatroom-group-avatar]')?.dataset.signature)).toEqual(before)
  })

  it('does not guess between duplicate room titles when a native row has no session payload', () => {
    document.body.innerHTML = '<div role="treeitem" aria-selected="false"><span>workspace</span></div>'
    const rooms = [
      { id: 'first', title: 'workspace', sessionId: 'session-a' },
      { id: 'second', title: 'workspace', sessionId: 'session-b' },
    ]

    reconcileSidebarRoomRows(document, { rooms, members: [] } as unknown as ChatroomView)

    expect(document.querySelector('[data-dsh-chatroom-room-row]')).toBeNull()
  })

  it('uses enterprise profile images and falls back to the cartoon avatar after an image error', () => {
    document.body.innerHTML = '<div role="treeitem" aria-selected="true"><span></span><span>企业群</span></div>'
    const room = {
      id: 'room', title: '企业群', aiDisplayName: 'DeepSeek', sessionId: 'session',
      memberAvatars: [{
        participantId: 'mason', avatarId: 'dog', avatarUrl: 'https://images.example.com/mason.png',
      }],
    } as const
    const snapshot = {
      rooms: [room], room, members: [], directPeers: [], directConversations: [],
    } as unknown as ChatroomView

    reconcileSidebarRoomRows(document, snapshot)

    const image = document.querySelector<HTMLImageElement>('[data-dsh-chatroom-group-avatar] img')!
    expect(image.src).toBe('https://images.example.com/mason.png')
    image.dispatchEvent(new Event('error'))
    expect(document.querySelector('[data-dsh-chatroom-group-avatar]')?.textContent).toBe('🐶')
  })

  it('keeps the room-directory avatar stable when selecting a room loads a different roster projection', () => {
    document.body.innerHTML = '<div role="treeitem" aria-selected="true"><span></span><span>项目群</span></div>'
    const room = {
      id: 'room', title: '项目群', aiDisplayName: 'DeepSeek', sessionId: 'session',
      memberAvatars: [{ participantId: 'alice', avatarId: 'whale' }],
    } as const
    const snapshot = {
      rooms: [room], room, directPeers: [], directConversations: [],
      members: [{
        participantId: 'legacy-alice', avatarId: 'dog',
        avatarUrl: 'https://images.example.com/legacy-alice.png',
      }],
    } as unknown as ChatroomView

    reconcileSidebarRoomRows(document, snapshot)

    const avatar = document.querySelector<HTMLElement>('[data-dsh-chatroom-group-avatar]')!
    expect(avatar.textContent).toBe('🐳')
    expect(avatar.querySelector('img')).toBeNull()
    expect(avatar.dataset.signature).toBe('alice:whale:')
  })

  it('orders recent rooms and exposes a personal pin action from the row menu', () => {
    document.body.innerHTML = `
      <div><div role="treeitem" aria-selected="false"><span></span><span>旧群</span><span><button aria-label="旧群操作">•••</button></span></div>
      <div role="treeitem" aria-selected="true"><span></span><span>新群</span><span><button aria-label="新群操作">•••</button></span></div></div>
    `
    const recent = {
      id: 'recent', title: '新群', aiDisplayName: 'DeepSeek', sessionId: 'recent-session', updatedAt: 20,
    } as const
    const pinned = {
      id: 'pinned', title: '旧群', aiDisplayName: 'DeepSeek', sessionId: 'pinned-session', updatedAt: 10, pinned: true,
    } as const
    const snapshot = {
      rooms: [pinned, recent], room: recent, members: [], directPeers: [], directConversations: [],
    } as unknown as ChatroomView
    const setPinned = vi.fn(async () => true)

    reconcileSidebarRoomRows(document, snapshot, undefined, setPinned)

    const oldRow = [...document.querySelectorAll<HTMLElement>('[data-dsh-chatroom-room-row]')]
      .find(row => row.dataset.dshChatroomRoomId === 'pinned')!
    const newRow = [...document.querySelectorAll<HTMLElement>('[data-dsh-chatroom-room-row]')]
      .find(row => row.dataset.dshChatroomRoomId === 'recent')!
    expect(Number(oldRow.style.order)).toBeLessThan(Number(newRow.style.order))
    const trigger = oldRow.querySelector<HTMLButtonElement>('button[aria-label="旧群操作"]')!
    trigger.click()
    document.body.insertAdjacentHTML('beforeend', `
      <div role="menu"><div role="presentation"><div class="native-wrap">
        <button type="button" role="menuitem" class="native-item"><span class="native-label">重命名</span></button>
      </div></div></div>
    `)
    reconcileSidebarRoomRows(document, snapshot, undefined, setPinned)
    const action = document.querySelector<HTMLButtonElement>('[data-dsh-chatroom-pin-menu-item] > button')!
    expect(action.textContent).toBe('取消置顶')
    expect(oldRow.querySelectorAll('button')).toHaveLength(1)
    const settledMarkup = document.body.innerHTML
    reconcileSidebarRoomRows(document, snapshot, undefined, setPinned)
    expect(document.body.innerHTML).toBe(settledMarkup)
    action.click()
    expect(setPinned).toHaveBeenCalledWith('pinned', false)
  })

  it('keeps native workspace and unfiled folders expanded but hidden from the chat navigation', () => {
    document.body.innerHTML = `
      <div role="tree">
        <span data-workspace><div role="treeitem" aria-expanded="false"><span><span>deepseek-harness</span></span></div></span>
        <span data-unfiled><div role="treeitem" aria-expanded="true"><span><span>未分组</span></span></div></span>
        <span><div role="treeitem" aria-selected="true"><span>个人工作</span><button aria-label="个人工作操作">•••</button></div></span>
      </div>
    `
    const workspace = document.querySelector<HTMLElement>('[data-workspace] [role="treeitem"]')!
    const expand = vi.fn()
    workspace.addEventListener('click', expand)

    reconcileSidebarRoomRows(document, {
      rooms: [], members: [], directPeers: [], directConversations: [],
    } as unknown as ChatroomView)

    expect(expand).toHaveBeenCalledOnce()
    expect(document.querySelector<HTMLElement>('[data-workspace]')?.dataset.hidden).toBe('true')
    expect(document.querySelector<HTMLElement>('[data-unfiled]')?.dataset.hidden).toBe('true')
    expect(document.querySelector('[data-dsh-chatroom-category-header="solo"]')?.textContent).toContain('Solo1')
  })

  it('groups native rows into Group and Solo folders and exposes every private contact', () => {
    document.body.innerHTML = `
      <div>
        <div role="treeitem" aria-selected="true"><span>项目群</span><button aria-label="项目群操作">•••</button></div>
        <div role="treeitem" aria-selected="false"><span>个人工作</span><button aria-label="个人工作操作">•••</button></div>
      </div>
    `
    const room = { id: 'room', title: '项目群', aiDisplayName: 'DeepSeek', sessionId: 'room-session' } as const
    const snapshot = {
      rooms: [room], room, members: [],
      directPeers: [{ participantId: 'bob-id', username: 'bob', displayName: 'Bob', avatarId: 'panda' }],
      directConversations: [],
    } as unknown as ChatroomView
    const openDirect = vi.fn(async () => undefined)

    reconcileSidebarRoomRows(document, snapshot, undefined, undefined, openDirect)

    expect(document.querySelector('[data-dsh-chatroom-category-header="group"]')?.textContent).toContain('群聊1')
    expect(document.querySelector('[data-dsh-chatroom-category-header="solo"]')?.textContent).toContain('Solo1')
    expect(document.querySelector('[data-dsh-chatroom-category-header="direct"]')?.textContent).toContain('私聊1')
    expect(document.querySelector('[data-dsh-chatroom-sidebar-category="group"]')?.textContent).toContain('项目群')
    expect(document.querySelector('[data-dsh-chatroom-sidebar-category="solo"]')?.textContent).toContain('个人工作')
    document.querySelector<HTMLButtonElement>('[aria-label="与 Bob 私聊"]')!.click()
    expect(openDirect).toHaveBeenCalledWith('bob-id')
  })
})
