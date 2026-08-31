// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { installSidebarRoomRows, reconcileSidebarRoomRows } from '../src/client/sidebar-rooms.js'
import type { ChatroomClientStore, ChatroomView } from '../src/client/store.js'

afterEach(() => {
  document.body.replaceChildren()
})

describe('native sidebar room rows', () => {
  const settleMutations = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 0))
    await new Promise(resolve => setTimeout(resolve, 0))
  }

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
    const snapshot = {
      rooms: [first, second], room: second, members: [], directPeers: [], directConversations: [],
    } as unknown as ChatroomView
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

    reconcileSidebarRoomRows(document, {
      rooms, members: [], directPeers: [], directConversations: [],
    } as unknown as ChatroomView)

    expect(document.querySelector('[data-dsh-chatroom-room-row]')).toBeNull()
  })

  it('keeps duplicate-title avatars bound to native session ids across row reorder', () => {
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

  it('does not guess between duplicate room titles without a native session id', () => {
    document.body.innerHTML = '<div role="treeitem" aria-selected="false"><span>workspace</span></div>'
    const rooms = [
      { id: 'first', title: 'workspace', sessionId: 'session-a' },
      { id: 'second', title: 'workspace', sessionId: 'session-b' },
    ]

    reconcileSidebarRoomRows(document, { rooms, members: [] } as unknown as ChatroomView)

    expect(document.querySelector('[data-dsh-chatroom-room-row]')).toBeNull()
  })

  it('keeps a room named with the branch prefix as a normal room', () => {
    document.body.innerHTML = '<div role="treeitem" aria-selected="false"><span>分支：产品讨论</span></div>'
    const room = {
      id: 'room', title: '分支：产品讨论', aiDisplayName: 'DeepSeek', sessionId: 'room-session',
      memberAvatarIds: ['fox'],
    } as const

    reconcileSidebarRoomRows(document, { rooms: [room], members: [] } as unknown as ChatroomView)

    expect(document.querySelector('[data-dsh-chatroom-room-row]')).toBeTruthy()
    expect(document.querySelector('[data-dsh-chatroom-branch-row]')).toBeNull()
  })

  it('does not treat an ordinary renamed Session as a branch', () => {
    document.body.innerHTML = '<div role="treeitem" aria-selected="false"><span>分支：用户自定义标题</span></div>'
    const row = document.querySelector<HTMLElement>('[role="treeitem"]')!
    bindNativeSession(row, 'ordinary-session')
    const sessionList = {
      byId: {
        'ordinary-session': {
          id: 'ordinary-session', displayTitle: '分支：用户自定义标题',
          running: false, blank: false, updatedAt: 1,
        },
      },
    } as never

    reconcileSidebarRoomRows(document, { rooms: [], members: [] } as unknown as ChatroomView, undefined, undefined, undefined, undefined, sessionList)

    expect(row.dataset.dshChatroomBranchRow).toBeUndefined()
  })

  it('keeps a renamed branch styled when its durable summary still identifies it', () => {
    document.body.innerHTML = '<div role="treeitem" aria-selected="true"><span></span><span>发布计划</span></div>'
    const row = document.querySelector<HTMLElement>('[role="treeitem"]')!
    bindNativeSession(row, 'chatroom-thread-v1-renamed')
    const sessionList = {
      byId: {
        'chatroom-thread-v1-renamed': {
          id: 'chatroom-thread-v1-renamed', displayTitle: '发布计划', parentId: 'parent-session',
          running: false, blank: false, updatedAt: 1,
        },
      },
    } as never

    reconcileSidebarRoomRows(document, { rooms: [], members: [] } as unknown as ChatroomView, undefined, undefined, undefined, undefined, sessionList)

    expect(row.dataset.dshChatroomBranchRow).toBe('')
    expect(row.querySelector('[data-dsh-chatroom-branch-topic]')?.textContent).toBe('发布计划')
    expect(row.dataset.dshChatroomBranchParentSessionId).toBe('parent-session')
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

  it('renders a branch row as a nested conversation with its parent context', () => {
    document.body.innerHTML = `
      <div role="treeitem" aria-selected="false"><span></span><span>项目群</span><span>刚刚</span></div>
      <div role="treeitem" aria-selected="true"><span></span><span>分支：讨论发布计划</span><span>1分钟</span></div>
    `
    const rows = [...document.querySelectorAll<HTMLElement>('[role="treeitem"]')]
    bindNativeSession(rows[0]!, 'parent-session')
    bindNativeSession(rows[1]!, 'chatroom-thread-v1-release')
    const room = {
      id: 'room', title: '项目群', aiDisplayName: 'DeepSeek', sessionId: 'parent-session', memberAvatarIds: ['whale'],
    } as const
    const branch = 'chatroom-thread-v1-release'
    const snapshot = {
      rooms: [room],
      members: [],
      threadPreviews: [{
        thread: {
          id: 'release', roomId: 'room', sessionId: branch,
          root: { messageId: 'root', displayName: 'Bob', text: '发布计划', role: 'human' }, createdAt: 1,
        },
        totalMessages: 3,
        recentMessages: [],
      }],
    } as unknown as ChatroomView
    const sessionList = {
      byId: {
        'parent-session': { id: 'parent-session', displayTitle: '项目群', running: false, blank: false, updatedAt: 1 },
        [branch]: {
          id: branch, displayTitle: '分支：讨论发布计划', parentId: 'parent-session',
          running: false, blank: false, updatedAt: 2,
        },
      },
    } as never

    reconcileSidebarRoomRows(document, snapshot, branch as never, undefined, undefined, undefined, sessionList)

    const branchRow = rows[1]!
    expect(branchRow.dataset.dshChatroomBranchRow).toBe('')
    expect(branchRow.dataset.dshChatroomBranchParentSessionId).toBe('parent-session')
    expect(branchRow.querySelector('[data-dsh-chatroom-branch-marker]')?.textContent).toBe('↳')
    expect(branchRow.querySelector('[data-dsh-chatroom-branch-badge]')?.textContent).toBe('分支')
    expect(branchRow.querySelector('[data-dsh-chatroom-branch-topic]')?.textContent).toBe('讨论发布计划')
    expect(branchRow.querySelector('[data-dsh-chatroom-branch-parent]')?.textContent).toBe('来自 项目群 · 3 条回复')
    expect(branchRow.getAttribute('aria-label')).toBe('分支会话：讨论发布计划，来自 项目群 · 3 条回复')
    expect(rows[0]!.dataset.dshChatroomBranchCount).toBe('1')
    expect(rows[0]!.querySelector('[data-dsh-chatroom-branch-count]')?.textContent).toBe('分支 1')
    expect(branchRow.querySelector('[data-dsh-chatroom-native-branch-title]')).toBeTruthy()

    const observer = new MutationObserver(() => undefined)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    reconcileSidebarRoomRows(document, snapshot, branch as never, undefined, undefined, undefined, sessionList)
    expect(observer.takeRecords().filter(record => record.type === 'childList')).toHaveLength(0)
    observer.disconnect()
  })

  it('does not bind a selected branch row to the active parent room', () => {
    document.body.innerHTML = '<div role="treeitem" aria-selected="true"><span></span><span>分支：发布计划</span></div>'
    const row = document.querySelector<HTMLElement>('[role="treeitem"]')!
    bindNativeSession(row, 'chatroom-thread-v1-release')
    const room = {
      id: 'room', title: '项目群', aiDisplayName: 'DeepSeek', sessionId: 'parent-session',
    } as const
    const sessionList = {
      byId: {
        'chatroom-thread-v1-release': {
          id: 'chatroom-thread-v1-release', displayTitle: '分支：发布计划', parentId: 'parent-session',
          running: false, blank: false, updatedAt: 2,
        },
      },
    } as never

    reconcileSidebarRoomRows(document, {
      rooms: [room], room, members: [], directPeers: [], directConversations: [],
    } as unknown as ChatroomView, 'chatroom-thread-v1-release' as never, undefined, undefined, undefined, sessionList)

    expect(row.dataset.dshChatroomBranchRow).toBe('')
    expect(row.dataset.dshChatroomRoomId).toBeUndefined()
    expect(row.querySelector('[data-dsh-chatroom-branch-topic]')?.textContent).toBe('发布计划')
  })

  it('keeps a branch-looking selected row distinct when the host has no drag payload', () => {
    document.body.innerHTML = '<div role="treeitem" aria-selected="true"><span></span><span>分支：无拖拽 ID</span></div>'
    const row = document.querySelector<HTMLElement>('[role="treeitem"]')!
    row.draggable = true
    const room = { id: 'room', title: '项目群', aiDisplayName: 'DeepSeek', sessionId: 'parent-session' } as const
    const sessionList = {
      byId: {
        'chatroom-thread-v1-missing': {
          id: 'chatroom-thread-v1-missing', displayTitle: '分支：无拖拽 ID', parentId: 'parent-session',
          running: false, blank: false, updatedAt: 2,
        },
      },
    } as never

    reconcileSidebarRoomRows(document, {
      rooms: [room], room, members: [], directPeers: [], directConversations: [],
    } as unknown as ChatroomView, 'chatroom-thread-v1-missing' as never, undefined, undefined, undefined, sessionList)

    expect(row.dataset.dshChatroomBranchRow).toBe('')
    expect(row.dataset.dshChatroomRoomId).toBeUndefined()
  })

  it('restores a native row when a branch is no longer part of the session list', () => {
    document.body.innerHTML = '<div role="treeitem" aria-selected="true"><span></span><span>分支：旧主题</span></div>'
    const row = document.querySelector<HTMLElement>('[role="treeitem"]')!
    row.setAttribute('aria-label', '原生会话')
    row.setAttribute('title', '原生提示')
    bindNativeSession(row, 'chatroom-thread-v1-old')
    reconcileSidebarRoomRows(document, { rooms: [], members: [] } as unknown as ChatroomView)
    expect(row.dataset.dshChatroomBranchRow).toBe('')

    row.innerHTML = '<span></span><span>普通会话</span>'
    row.removeAttribute('aria-selected')
    row.setAttribute('aria-selected', 'false')
    reconcileSidebarRoomRows(document, { rooms: [], members: [] } as unknown as ChatroomView)
    expect(row.dataset.dshChatroomBranchRow).toBeUndefined()
    expect(row.querySelector('[data-dsh-chatroom-branch-surface]')).toBeNull()
    expect(row.getAttribute('aria-label')).toBe('原生会话')
    expect(row.getAttribute('title')).toBe('原生提示')
  })

  it('preserves host accessibility updates while a branch row is decorated', () => {
    document.body.innerHTML = '<div role="treeitem" aria-selected="true"><span></span><span>分支：主题</span></div>'
    const row = document.querySelector<HTMLElement>('[role="treeitem"]')!
    bindNativeSession(row, 'chatroom-thread-v1-attrs')
    const snapshot = { rooms: [], members: [] } as unknown as ChatroomView

    reconcileSidebarRoomRows(document, snapshot)
    row.setAttribute('aria-label', '宿主更新的标签')
    row.setAttribute('title', '宿主更新的提示')
    reconcileSidebarRoomRows(document, snapshot)

    row.innerHTML = '<span></span><span>普通会话</span>'
    row.setAttribute('aria-selected', 'false')
    reconcileSidebarRoomRows(document, snapshot)

    expect(row.getAttribute('aria-label')).toBe('宿主更新的标签')
    expect(row.getAttribute('title')).toBe('宿主更新的提示')
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

  it('ignores conversation mutations outside the native sidebar', async () => {
    document.body.innerHTML = `
      <div role="tree"><div role="treeitem" aria-selected="true"><span>会话</span></div></div>
      <main id="conversation"></main>
    `
    const store = {
      getSnapshot: () => ({
        phase: 'ready', rooms: [], members: [], directPeers: [], directConversations: [],
      } as unknown as ChatroomView),
      subscribe: () => () => undefined,
      setRoomPinned: vi.fn(),
      openDirect: vi.fn(),
      closeDirect: vi.fn(),
    } as unknown as ChatroomClientStore
    const getSnapshot = vi.fn(() => ({ current: undefined, byId: {} }))
    const sessions = {
      list: { getSnapshot, subscribe: () => () => undefined },
    } as never

    const dispose = installSidebarRoomRows(store, sessions)
    await settleMutations()
    getSnapshot.mockClear()

    document.querySelector('#conversation')!.append(document.createElement('p'))
    await settleMutations()
    expect(getSnapshot).not.toHaveBeenCalled()

    document.querySelector('[role="tree"]')!.append(document.createElement('div'))
    await settleMutations()
    expect(getSnapshot).toHaveBeenCalled()
    dispose()
  })
})
