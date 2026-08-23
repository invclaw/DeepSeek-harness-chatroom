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
    fireEvent.click(screen.getByLabelText('狐狸'))
    fireEvent.click(button)
    expect(join).toHaveBeenCalledWith('Alice', 'fox')
    fireEvent.click(screen.getByLabelText('关闭'))
    expect(closeRoom).toHaveBeenCalledOnce()
  })

  it('prefills the current name and avatar when editing identity', () => {
    renderEntry(view({ open: true, phase: 'identity-required' }))
    expect((screen.getByTestId('chatroom-identity-input') as HTMLInputElement).value).toBe('Alice')
    expect(screen.getByLabelText('鲸鱼').getAttribute('aria-checked')).toBe('true')
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
      openMembers={vi.fn()}
    />)
    expect(screen.getByText('Alice · 2 人在线')).toBeTruthy()

    rerender(<RoomIdentityAction
      sessionId={'another-session' as never}
      useChatroom={selector => selector(room)}
      openRoom={vi.fn()}
      openMembers={vi.fn()}
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
      openMembers={vi.fn()}
    />)
    fireEvent.click(screen.getByTitle('切换共享会话'))
    expect(openRoom).toHaveBeenCalledOnce()
  })

  it('renders member management, unread alerts, and branch replies as additive panels', () => {
    const sendThreadMessage = vi.fn(async () => true)
    const room = view({
      membersOpen: true,
      members: [{
        participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale', joinedAt: 1, lastSeenAt: Date.now(), online: true,
      }],
      unreadCount: 3,
      toasts: [{
        id: 'notice', roomId: 'lobby', roomTitle: 'AI 聊天室', participantId: 'bob-id', displayName: 'Bob',
        role: 'human', text: '新消息', createdAt: Date.now(),
      }],
      thread: {
        id: 'thread', roomId: 'lobby', sessionId: 'chatroom-thread-v1-thread', createdAt: 1,
        root: { messageId: 'user:1', displayName: 'Bob', text: '主题消息', role: 'human' },
      },
      threadMessages: [{
        id: 'thread-message', threadId: 'thread', sequence: 0, role: 'human', participantId: 'bob-id',
        displayName: 'Bob', avatarId: 'panda', text: '分支内容', createdAt: Date.now(),
      }],
    })
    renderEntry(room, { sendThreadMessage })
    expect(screen.getByTestId('chatroom-members')).toBeTruthy()
    expect(screen.getByTestId('chatroom-thread-panel')).toBeTruthy()
    expect(screen.getByText('分支内容')).toBeTruthy()
    expect(screen.getByText('新消息')).toBeTruthy()
    fireEvent.change(screen.getByPlaceholderText('回复分支；输入 @AI 让 AI 在本分支回答'), { target: { value: '@AI 总结' } })
    fireEvent.click(screen.getByText('发送'))
    expect(sendThreadMessage).toHaveBeenCalledWith('@AI 总结')
  })

  it('offers AI and room members from the branch mention menu', () => {
    const sendThreadMessage = vi.fn(async () => true)
    renderEntry(view({
      thread: {
        id: 'thread', roomId: 'lobby', sessionId: 'chatroom-thread-v1-thread', createdAt: 1,
        root: { messageId: 'user:1', displayName: 'Bob', text: '主题消息', role: 'human' },
      },
      members: [
        { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale', joinedAt: 1, lastSeenAt: 1, online: true },
        { participantId: 'bob-id', displayName: 'Bob', avatarId: 'panda', joinedAt: 1, lastSeenAt: 1, online: true },
      ],
    }), { sendThreadMessage })
    const composer = screen.getByPlaceholderText('回复分支；输入 @AI 让 AI 在本分支回答')

    fireEvent.change(composer, { target: { value: '@', selectionStart: 1 } })
    expect(screen.getByRole('option', { name: 'AI' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Bob' })).toBeTruthy()
    fireEvent.click(screen.getByRole('option', { name: 'AI' }))
    expect((composer as HTMLTextAreaElement).value).toBe('@AI ')
    fireEvent.change(composer, { target: { value: '@AI 请总结', selectionStart: 7 } })
    fireEvent.keyDown(composer, { key: 'Enter' })
    expect(sendThreadMessage).toHaveBeenCalledWith('@AI 请总结')
  })

  it('reuses native text primitives and shared actions without offering nested branches', () => {
    const setThreadReply = vi.fn()
    renderEntry(view({
      thread: {
        id: 'thread', roomId: 'lobby', sessionId: 'chatroom-thread-v1-thread', createdAt: 1,
        root: { messageId: 'user:1', displayName: 'Bob', text: '主题消息', role: 'human' },
      },
      threadMessages: [{
        id: 'thread-ai', threadId: 'thread', sequence: 0, role: 'ai', participantId: 'ai',
        displayName: 'DeepSeek', text: '**结论**：使用 `MarkdownText`。\n\n<script>alert(1)</script>', createdAt: Date.now(),
      }],
    }), { setThreadReply })

    expect(screen.getByText('结论').tagName).toBe('STRONG')
    expect(screen.getByText('MarkdownText').tagName).toBe('CODE')
    expect(document.querySelector('script')).toBeNull()
    expect(screen.getByRole('button', { name: '▣ 复制' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '↩ 回复' }))
    expect(setThreadReply).toHaveBeenCalledWith(expect.objectContaining({
      messageId: 'thread-ai', displayName: 'DeepSeek',
    }))
    expect(screen.queryByRole('button', { name: '⑂ 分支' })).toBeNull()
  })

  it('shows the pending branch quote above the composer and can cancel it', () => {
    const clearThreadReply = vi.fn()
    renderEntry(view({
      thread: {
        id: 'thread', roomId: 'lobby', sessionId: 'chatroom-thread-v1-thread', createdAt: 1,
        root: { messageId: 'user:1', displayName: 'Bob', text: '主题消息', role: 'human' },
      },
      threadReply: { messageId: 'thread-ai', displayName: 'DeepSeek', text: '上一条分支回复' },
    }), { clearThreadReply })

    expect(screen.getByText('回复 DeepSeek')).toBeTruthy()
    expect(screen.getByText('上一条分支回复')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '取消引用' }))
    expect(clearThreadReply).toHaveBeenCalledOnce()
  })

  it('opens a target chooser for a merged multi-message forward', () => {
    const openForward = vi.fn()
    const forwardSelected = vi.fn(async () => true)
    const second = { id: 'second', title: '项目二', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-v1-second' }
    const room = view({
      rooms: [view().room!, second],
      selectionRoomId: 'lobby',
      selectedMessages: [
        { messageId: 'user:1', role: 'human', displayName: 'Alice', text: '第一条', createdAt: 1 },
        { messageId: 'assistant:2', role: 'ai', displayName: 'DeepSeek', text: '第二条', createdAt: 2 },
      ],
      forwardOpen: true,
    })
    renderEntry(room, { openForward, forwardSelected })
    expect(screen.getByText('已选择 2 条消息')).toBeTruthy()
    expect(screen.getByTestId('chatroom-forward-dialog')).toBeTruthy()
    fireEvent.click(screen.getByText('项目二'))
    expect(forwardSelected).toHaveBeenCalledWith('second')
  })

  it('keeps multi-select mode visible with zero selected messages', () => {
    renderEntry(view({ selectionRoomId: 'lobby', selectedMessages: [] }))
    expect(screen.getByText('已选择 0 条消息')).toBeTruthy()
    expect((screen.getByRole('button', { name: '合并转发' }) as HTMLButtonElement).disabled).toBe(true)
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
    identity: { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' },
    online: 1,
    members: [],
    reactions: [],
    threadPreviews: [],
    membersOpen: false,
    error: undefined,
    composerRoomId: undefined,
    pendingFiles: [],
    reply: undefined,
    composerBusy: false,
    composerError: undefined,
    thread: undefined,
    threadMessages: [],
    threadReply: undefined,
    threadBusy: false,
    threadError: undefined,
    unreadCount: 0,
    toasts: [],
    notificationsEnabled: false,
    selectionRoomId: undefined,
    selectedMessages: [],
    forwardOpen: false,
    forwardBusy: false,
    forwardError: undefined,
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
    closeMembers={vi.fn()}
    closeThread={vi.fn()}
    setThreadReply={vi.fn()}
    clearThreadReply={vi.fn()}
    sendThreadMessage={vi.fn(async () => true)}
    enableSystemNotifications={vi.fn(async () => undefined)}
    dismissToast={vi.fn()}
    toggleReaction={vi.fn(async () => undefined)}
    openForward={vi.fn()}
    closeForward={vi.fn()}
    forwardSelected={vi.fn(async () => true)}
    toggleMessageSelection={vi.fn()}
    clearMessageSelection={vi.fn()}
    {...overrides}
  />)
}
