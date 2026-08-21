// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatroomShell } from '../src/client/ChatroomShell.js'
import type { ChatroomView } from '../src/client/store.js'

afterEach(cleanup)

describe('ChatroomShell', () => {
  it('keeps the current participant on the right and everyone else on the left', () => {
    const view: ChatroomView = {
      open: true,
      phase: 'ready',
      connection: 'online',
      room: { id: 'lobby', title: 'AI 聊天室', aiDisplayName: 'DeepSeek' },
      identity: { participantId: 'self', displayName: '我' },
      messages: [
        { id: 'self-message', sequence: 1, role: 'human', participantId: 'self', displayName: '我', text: '右边', createdAt: 1 },
        { id: 'other-message', sequence: 2, role: 'human', participantId: 'other', displayName: '朋友', text: '左边', createdAt: 2 },
        { id: 'ai-message', sequence: 3, role: 'ai', participantId: 'ai', displayName: 'DeepSeek', text: '也在左边', createdAt: 3 },
      ],
      online: 2,
      sending: false,
      error: undefined,
    }
    renderShell(view)

    expect(document.querySelector('[data-message-id="self-message"]')?.getAttribute('data-message-side')).toBe('right')
    expect(document.querySelector('[data-message-id="other-message"]')?.getAttribute('data-message-side')).toBe('left')
    expect(document.querySelector('[data-message-id="ai-message"]')?.getAttribute('data-message-side')).toBe('left')
    expect(screen.getByText('已同步 · 2 人在线')).toBeTruthy()
  })

  it('requires a name before the first browser identity can join', () => {
    const join = vi.fn(async () => undefined)
    renderShell({
      open: true,
      phase: 'identity-required',
      connection: 'offline',
      room: { id: 'lobby', title: 'AI 聊天室', aiDisplayName: 'DeepSeek' },
      identity: undefined,
      messages: [],
      online: 0,
      sending: false,
      error: undefined,
    }, { join })
    const button = screen.getByTestId('chatroom-join')
    expect((button as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByTestId('chatroom-identity-input'), { target: { value: 'Alice' } })
    fireEvent.click(button)
    expect(join).toHaveBeenCalledWith('Alice')
  })
})

function renderShell(view: ChatroomView, overrides: Partial<Parameters<typeof ChatroomShell>[0]> = {}): void {
  render(<ChatroomShell
    useChatroom={selector => selector(view)}
    openRoom={vi.fn()}
    closeRoom={vi.fn()}
    join={vi.fn(async () => undefined)}
    resetIdentity={vi.fn(async () => undefined)}
    send={vi.fn(async () => true)}
    retry={vi.fn(async () => undefined)}
    {...overrides}
  />)
}
