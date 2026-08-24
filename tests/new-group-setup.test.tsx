// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NewGroupSetupDock } from '../src/client/NewGroupSetupDock.js'
import type { ChatroomView } from '../src/client/store.js'

afterEach(cleanup)

describe('blank Session group setup', () => {
  it('searches system users and completes the group before the first message', async () => {
    const loadRoomMemberCandidates = vi.fn(async () => undefined)
    const completeGroupSetup = vi.fn(async () => true)
    const snapshot = groupView()
    render(<NewGroupSetupDock {...dockProps(snapshot, { loadRoomMemberCandidates, completeGroupSetup })} />)

    expect(screen.getByText('直接创建群聊')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '选择成员' }))
    await waitFor(() => { expect(loadRoomMemberCandidates).toHaveBeenCalledOnce() })
    fireEvent.change(screen.getByLabelText('搜索新群聊成员'), { target: { value: 'bob' } })
    expect(screen.getByText('@bob-user')).toBeTruthy()
    expect(screen.queryByText('@carol-user')).toBeNull()
    fireEvent.click(screen.getByRole('checkbox', { name: /Bob/ }))
    fireEvent.change(screen.getByLabelText('新群聊名称'), { target: { value: '项目群' } })
    fireEvent.click(screen.getByRole('button', { name: '创建群聊（2 人）' }))

    await waitFor(() => {
      expect(completeGroupSetup).toHaveBeenCalledWith('项目群', ['bob-id'])
      expect(screen.queryByRole('region', { name: '创建群聊' })).toBeNull()
    })
  })

  it('stays absent after the Session has messages or other members', () => {
    const snapshot = groupView()
    const { rerender } = render(<NewGroupSetupDock {...dockProps(snapshot, {}, false)} />)
    expect(screen.queryByText('直接创建群聊')).toBeNull()

    rerender(<NewGroupSetupDock {...dockProps({
      ...snapshot,
      members: [
        { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale', role: 'owner', joinedAt: 1, lastSeenAt: 1, online: true },
        { participantId: 'bob-id', displayName: 'Bob', avatarId: 'panda', role: 'member', joinedAt: 1, lastSeenAt: 1, online: true },
      ],
    })} />)
    expect(screen.queryByText('直接创建群聊')).toBeNull()
  })
})

function dockProps(
  snapshot: ChatroomView,
  overrides: Record<string, unknown> = {},
  blank = true,
): Parameters<typeof NewGroupSetupDock>[0] {
  const room = snapshot.room!
  return {
    sessionId: room.sessionId,
    session: { composerPhase: blank ? 'blank' : 'ready', nodes: blank ? [] : [{}] },
    useChatroom: (selector: (value: ChatroomView) => unknown) => selector(snapshot),
    resolveTarget: () => ({ kind: 'room', room }),
    loadRoomMemberCandidates: vi.fn(async () => undefined),
    completeGroupSetup: vi.fn(async () => true),
    ...overrides,
  } as unknown as Parameters<typeof NewGroupSetupDock>[0]
}

function groupView(): ChatroomView {
  const room = { id: 'room', title: '新会话', aiDisplayName: 'DeepSeek', sessionId: 'native-session' }
  return {
    phase: 'ready',
    room,
    rooms: [room],
    identity: { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' },
    members: [],
    memberCandidates: [
      { participantId: 'bob-id', username: 'bob-user', displayName: 'Bob', avatarId: 'panda' },
      { participantId: 'carol-id', username: 'carol-user', displayName: 'Carol', avatarId: 'fox' },
    ],
    managementBusy: false,
  } as unknown as ChatroomView
}
