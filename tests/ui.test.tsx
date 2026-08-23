// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatroomEntry } from '../src/client/ChatroomEntry.js'
import { RoomIdentityAction } from '../src/client/RoomIdentityAction.js'
import { BRANCH_FRAME_READY, markBranchFrameSessionReady } from '../src/client/branch-frame.js'
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

  it('renders room management, unread alerts, and an isolated native branch frame', () => {
    const renameRoom = vi.fn(async () => true)
    const setMemberRole = vi.fn(async () => true)
    const closeThread = vi.fn()
    const room = view({
      membersOpen: true,
      members: [
        {
          participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale', role: 'owner',
          joinedAt: 1, lastSeenAt: Date.now(), online: true,
        },
        {
          participantId: 'bob-id', displayName: 'Bob', avatarId: 'panda', role: 'member',
          joinedAt: 1, lastSeenAt: Date.now(), online: true,
        },
      ],
      unreadCount: 3,
      toasts: [{
        id: 'notice', roomId: 'lobby', roomTitle: 'AI 聊天室', participantId: 'bob-id', displayName: 'Bob',
        role: 'human', text: '新消息', createdAt: Date.now(),
      }],
      thread: {
        id: 'thread', roomId: 'lobby', sessionId: 'chatroom-thread-v1-thread', createdAt: 1,
        root: { messageId: 'user:1', displayName: 'Bob', text: '主题消息', role: 'human' },
      },
    })
    const overrides = { renameRoom, setMemberRole, closeThread }
    const rendered = renderEntry(room, overrides)
    expect(screen.getByTestId('chatroom-members')).toBeTruthy()
    expect(screen.getByTestId('chatroom-thread-panel')).toBeTruthy()
    expect(screen.getByText('新消息')).toBeTruthy()
    const frame = screen.getByTitle('分支回复：主题消息') as HTMLIFrameElement
    const frameUrl = new URL(frame.src)
    expect(frameUrl.searchParams.get('dsh-chatroom-thread')).toBe('thread')
    expect(frameUrl.searchParams.get('dsh-chatroom-thread-session')).toBe('chatroom-thread-v1-thread')
    expect(frameUrl.searchParams.get('dsh-chatroom-parent-session')).toBe('chatroom-v1-lobby')
    expect(screen.getByText('正在加载分支…')).toBeTruthy()
    fireEvent(window, new MessageEvent('message', {
      origin: globalThis.location.origin,
      source: frame.contentWindow,
      data: { type: BRANCH_FRAME_READY, threadId: 'thread' },
    }))
    expect(screen.getByText('正在加载分支…')).toBeTruthy()

    const frameDocument = frame.contentDocument!
    frameDocument.open()
    frameDocument.write('<!doctype html><html><body><main data-dsh-chatroom-branch-shell><nav></nav><section><header>分支：主题消息</header><textarea></textarea></section><aside></aside></main></body></html>')
    frameDocument.close()
    markBranchFrameSessionReady(frameDocument, 'chatroom-thread-v1-thread')
    fireEvent(window, new MessageEvent('message', {
      origin: globalThis.location.origin,
      source: frame.contentWindow,
      data: { type: BRANCH_FRAME_READY, threadId: 'thread' },
    }))
    expect(screen.queryByText('正在加载分支…')).toBeNull()

    fireEvent.change(screen.getByRole('textbox', { name: '群聊名称' }), { target: { value: '新群名' } })
    fireEvent.click(screen.getByRole('button', { name: '保存名称' }))
    expect(renameRoom).toHaveBeenCalledWith('新群名')
    fireEvent.click(screen.getByRole('button', { name: '设为管理员' }))
    expect(setMemberRole).toHaveBeenCalledWith('bob-id', 'admin')
    fireEvent.click(screen.getByRole('button', { name: '关闭分支' }))
    expect(closeThread).toHaveBeenCalledOnce()

    rendered.rerender(entry({ ...room, thread: undefined }, overrides))
    expect(screen.getByTestId('chatroom-thread-panel').getAttribute('data-open')).toBe('false')
    expect(screen.getByTitle('分支回复：主题消息')).toBe(frame)
    rendered.rerender(entry(room, overrides))
    expect(screen.getByTestId('chatroom-thread-panel').getAttribute('data-open')).toBe('true')
    expect(screen.getByTitle('分支回复：主题消息')).toBe(frame)
  })

  it('does not mount a second chatroom shell inside the native branch frame', () => {
    renderEntry(view({
      branchFrame: {
        threadId: 'thread', roomId: 'lobby', sessionId: 'chatroom-thread-v1-thread',
        parentSessionId: 'chatroom-v1-lobby',
      },
    }))
    expect(document.body.firstElementChild?.firstChild).toBeNull()
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
): ReturnType<typeof render> {
  return render(entry(room, overrides))
}

function entry(
  room: ChatroomView,
  overrides: Partial<Parameters<typeof ChatroomEntry>[0]> = {},
): JSX.Element {
  return <ChatroomEntry
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
  />
}
