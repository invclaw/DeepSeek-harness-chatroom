// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatroomEntry } from '../src/client/ChatroomEntry.js'
import { RoomIdentityAction } from '../src/client/RoomIdentityAction.js'
import type { ChatroomView } from '../src/client/store.js'

afterEach(cleanup)

describe('native chatroom integration', () => {
  it('shows an additive shared-session launcher', () => {
    renderEntry(view({ open: false }))
    expect(screen.getByText('◉ 共享会话')).toBeTruthy()
    expect(screen.queryByTestId('chatroom-dialog')).toBeNull()
  })

  it('requires a name and lets the identity dialog close', () => {
    const join = vi.fn(async () => undefined)
    const closeRoom = vi.fn()
    renderEntry(view({ open: true, phase: 'identity-required', identity: undefined }), { join, closeRoom })
    const button = screen.getByTestId('chatroom-join')
    expect((button as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByTestId('chatroom-identity-input'), { target: { value: 'Alice' } })
    fireEvent.click(button)
    expect(join).toHaveBeenCalledWith('Alice')
    fireEvent.click(screen.getByLabelText('关闭'))
    expect(closeRoom).toHaveBeenCalledOnce()
  })

  it('lists existing rooms and creates a new independent shared Session', () => {
    const selectRoom = vi.fn(async () => undefined)
    const createRoom = vi.fn(async () => undefined)
    renderEntry(view({ open: true }), { selectRoom, createRoom })

    expect(screen.getByText('AI 聊天室')).toBeTruthy()
    expect(screen.getAllByText('@DeepSeek', { exact: false })).toHaveLength(2)
    fireEvent.click(screen.getByTestId('chatroom-room-lobby'))
    expect(selectRoom).toHaveBeenCalledWith('lobby')

    const create = screen.getByTestId('chatroom-create')
    expect((create as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByTestId('chatroom-title-input'), { target: { value: '项目二' } })
    fireEvent.click(create)
    expect(createRoom).toHaveBeenCalledWith('项目二')
  })

  it('adds identity and presence only to shared native Sessions', () => {
    const room = view({ connection: 'online', online: 2 })
    const { rerender } = render(<RoomIdentityAction
      sessionId={'chatroom-v1-lobby' as never}
      useChatroom={selector => selector(room)}
      openRoom={vi.fn()}
    />)
    expect(screen.getByText('Alice · 2 人在线')).toBeTruthy()

    rerender(<RoomIdentityAction
      sessionId={'another-session' as never}
      useChatroom={selector => selector(room)}
      openRoom={vi.fn()}
    />)
    expect(screen.queryByText('Alice · 2 人在线')).toBeNull()
  })

  it('opens the room chooser from a shared Session header', () => {
    const openRoom = vi.fn()
    const room = view()
    render(<RoomIdentityAction
      sessionId={'chatroom-v1-lobby' as never}
      useChatroom={selector => selector(room)}
      openRoom={openRoom}
    />)
    fireEvent.click(screen.getByTitle('切换共享会话'))
    expect(openRoom).toHaveBeenCalledOnce()
  })
})

function view(patch: Partial<ChatroomView> = {}): ChatroomView {
  const room = { id: 'lobby', title: 'AI 聊天室', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-v1-lobby' }
  return {
    open: false,
    phase: 'ready',
    connection: 'connecting',
    rooms: [room],
    room,
    identity: { participantId: 'alice-id', displayName: 'Alice' },
    online: 1,
    error: undefined,
    ...patch,
  }
}

function renderEntry(
  room: ChatroomView,
  overrides: Partial<Parameters<typeof ChatroomEntry>[0]> = {},
): void {
  render(<ChatroomEntry
    useSessions={vi.fn() as never}
    useWorkspaces={vi.fn() as never}
    useChatroom={selector => selector(room)}
    openRoom={vi.fn()}
    closeRoom={vi.fn()}
    join={vi.fn(async () => undefined)}
    selectRoom={vi.fn(async () => undefined)}
    createRoom={vi.fn(async () => undefined)}
    resetIdentity={vi.fn(async () => undefined)}
    retry={vi.fn(async () => undefined)}
    {...overrides}
  />)
}
