// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { reconcileSidebarRoomRows } from '../src/client/sidebar-rooms.js'
import type { ChatroomView } from '../src/client/store.js'

afterEach(() => {
  document.body.replaceChildren()
})

describe('native sidebar room rows', () => {
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

    reconcileSidebarRoomRows(document, snapshot)

    const rows = [...document.querySelectorAll<HTMLElement>('[data-dsh-chatroom-room-row]')]
    expect(rows[0]?.dataset.dshChatroomRoomId).toBe('first')
    expect(rows[1]?.dataset.dshChatroomRoomId).toBe('selected')
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
})
