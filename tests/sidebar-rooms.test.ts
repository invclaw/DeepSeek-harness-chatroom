// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
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
      rooms: [room], room,
      members: room.memberAvatarIds.map((avatarId, index) => ({ avatarId, participantId: String(index) })),
    } as unknown as ChatroomView

    reconcileSidebarRoomRows(document, snapshot)

    const roomRow = document.querySelector<HTMLElement>('[data-dsh-chatroom-room-row]')!
    expect(roomRow.dataset.dshChatroomRoomId).toBe('room')
    const avatar = roomRow.querySelector<HTMLElement>('[data-dsh-chatroom-group-avatar]')!
    expect(avatar.dataset.count).toBe('9')
    expect(avatar.children).toHaveLength(9)
    expect(document.querySelectorAll('[data-dsh-chatroom-room-row]')).toHaveLength(1)
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
    const snapshot = { rooms: [first, selected], room: selected, members: [] } as unknown as ChatroomView
    const nativeRows = [...document.querySelectorAll<HTMLElement>('[role="treeitem"]')]
    bindNativeSession(nativeRows[0]!, 'first-session')
    bindNativeSession(nativeRows[1]!, 'selected-session')

    reconcileSidebarRoomRows(document, snapshot)

    const rows = [...document.querySelectorAll<HTMLElement>('[data-dsh-chatroom-room-row]')]
    expect(rows[0]?.dataset.dshChatroomRoomId).toBe('first')
    expect(rows[1]?.dataset.dshChatroomRoomId).toBe('selected')
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

    reconcileSidebarRoomRows(document, { rooms: [], members: [] } as unknown as ChatroomView, undefined, sessionList)

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

    reconcileSidebarRoomRows(document, { rooms: [], members: [] } as unknown as ChatroomView, undefined, sessionList)

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
    const snapshot = { rooms: [room], room, members: [] } as unknown as ChatroomView

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

    reconcileSidebarRoomRows(document, snapshot, branch as never, sessionList)

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
})
