// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatroomEntry } from '../src/client/ChatroomEntry.js'
import { RoomIdentityAction } from '../src/client/RoomIdentityAction.js'
import type { ChatroomView } from '../src/client/store.js'

afterEach(cleanup)

describe('native chatroom integration', () => {
  it('shows only a launcher outside the room instead of replacing the conversation UI', () => {
    renderEntry(view({ open: false }), 'ordinary-session')
    expect(screen.getByText('◉ 进入 AI 聊天室')).toBeTruthy()
    expect(screen.queryByTestId('chatroom-dialog')).toBeNull()
  })

  it('requires a name before navigating to the native shared Session', () => {
    const join = vi.fn(async () => undefined)
    renderEntry(view({ open: true, phase: 'identity-required', identity: undefined }), undefined, { join })
    const button = screen.getByTestId('chatroom-join')
    expect((button as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByTestId('chatroom-identity-input'), { target: { value: 'Alice' } })
    fireEvent.click(button)
    expect(join).toHaveBeenCalledWith('Alice')
    expect(screen.getByText('进入后使用 Harness 原生对话界面。', { exact: false })).toBeTruthy()
  })

  it('keeps a dismissed identity dialog closed on the shared Session', () => {
    renderEntry(
      view({ open: false, phase: 'identity-required', identity: undefined }),
      'chatroom-v1-lobby',
    )
    expect(screen.queryByTestId('chatroom-dialog')).toBeNull()
    expect(screen.queryByText('◉ 进入 AI 聊天室')).toBeNull()
  })

  it('never leaves a blocking status dialog over an already selected native Session', () => {
    const closeRoom = vi.fn()
    renderEntry(view({ open: true, phase: 'ready' }), 'chatroom-v1-lobby', { closeRoom })
    expect(screen.queryByTestId('chatroom-dialog')).toBeNull()
    expect(closeRoom).toHaveBeenCalledOnce()
  })

  it('adds identity and presence to the native Session header only', () => {
    const room = view({ connection: 'online', online: 2 })
    const { rerender } = render(<RoomIdentityAction
      sessionId={'chatroom-v1-lobby' as never}
      useChatroom={selector => selector(room)}
      openRoom={vi.fn()}
      resetIdentity={vi.fn(async () => undefined)}
    />)
    expect(screen.getByText('Alice · 2 人在线')).toBeTruthy()

    rerender(<RoomIdentityAction
      sessionId={'another-session' as never}
      useChatroom={selector => selector(room)}
      openRoom={vi.fn()}
      resetIdentity={vi.fn(async () => undefined)}
    />)
    expect(screen.queryByText('Alice · 2 人在线')).toBeNull()
  })

  it('reopens identity selection from the native Session header after dismissal', () => {
    const openRoom = vi.fn()
    const room = view({ open: false, phase: 'identity-required', identity: undefined })
    render(<RoomIdentityAction
      sessionId={'chatroom-v1-lobby' as never}
      useChatroom={selector => selector(room)}
      openRoom={openRoom}
      resetIdentity={vi.fn(async () => undefined)}
    />)
    fireEvent.click(screen.getByTitle('选择聊天室身份'))
    expect(openRoom).toHaveBeenCalledOnce()
  })
})

function view(patch: Partial<ChatroomView> = {}): ChatroomView {
  return {
    open: false,
    phase: 'ready',
    connection: 'connecting',
    room: { id: 'lobby', title: 'AI 聊天室', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-v1-lobby' },
    identity: { participantId: 'alice-id', displayName: 'Alice' },
    online: 1,
    error: undefined,
    ...patch,
  }
}

function renderEntry(
  room: ChatroomView,
  current: string | undefined,
  overrides: Partial<Parameters<typeof ChatroomEntry>[0]> = {},
): void {
  render(<ChatroomEntry
    useSessions={selector => selector({ current } as never)}
    useWorkspaces={vi.fn() as never}
    useChatroom={selector => selector(room)}
    openRoom={vi.fn()}
    closeRoom={vi.fn()}
    join={vi.fn(async () => undefined)}
    retry={vi.fn(async () => undefined)}
    {...overrides}
  />)
}
