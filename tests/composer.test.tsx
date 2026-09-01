// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ComponentProps } from 'react'
import type { ComposerAttachmentsProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import {
  ChatroomComposerAttachments,
  ChatroomComposerDock,
  ChatroomFileAction,
  ChatroomSessionControls,
  type ChatroomComposerAttachmentsProps,
} from '../src/client/ChatroomComposer.js'
import type { ChatroomView } from '../src/client/store.js'
import { restoreChatroomDraft } from '../src/client/draft-restore.js'

afterEach(cleanup)

describe('chatroom composer attachments', () => {
  it('renders the reply inside the native attachment seat and preserves its renderer', () => {
    const clearReply = vi.fn()
    const NativeAttachments = vi.fn((_props: ComposerAttachmentsProps) => <div data-testid="native-attachments" />)
    const props = {
      sessionId: 'session',
      attachments: [],
      canAcceptDrop: true,
      onAddImages: vi.fn(),
      onRemoveImage: vi.fn(),
      t: (key: string) => key,
      useChatroom: () => ({
        composerRoomId: 'room',
        reply: { messageId: 'message', displayName: '李岳华', text: 'deepseek你说话啊' },
      } as unknown as ChatroomView),
      clearReply,
      resolveTarget: () => ({ kind: 'room', room: { id: 'room' } }),
      nativeAttachmentsView: NativeAttachments,
    }

    render(<ChatroomComposerAttachments {...props as unknown as ChatroomComposerAttachmentsProps} />)
    expect(screen.getByText('回复 李岳华：')).not.toBeNull()
    expect(screen.getByText('deepseek你说话啊')).not.toBeNull()
    expect(screen.getByTestId('native-attachments')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '取消回复' }))
    expect(clearReply).toHaveBeenCalledWith('room')
  })

  it('offers native stop, new Session, and quick-meeting actions for rooms', () => {
    const stopRoomSession = vi.fn(async () => true)
    const newRoomSession = vi.fn(async () => true)
    const quickMeeting = vi.fn(async () => true)
    const props = {
      sessionId: 'chatroom-v1-lobby',
      session: { running: true },
      useChatroom: (selector: (snapshot: ChatroomView) => unknown) => selector({
        sessionControlBusy: false,
        sessionControlError: undefined,
        wecomBusy: false,
        wecomError: undefined,
      } as unknown as ChatroomView),
      resolveTarget: () => ({ kind: 'room', room: { id: 'lobby' } }),
      stopRoomSession,
      newRoomSession,
      quickMeeting,
      quickThreadMeeting: vi.fn(async () => true),
    }
    render(<ChatroomSessionControls {...props as unknown as ComponentProps<typeof ChatroomSessionControls>} />)
    fireEvent.click(screen.getByRole('button', { name: '■ 停止' }))
    fireEvent.click(screen.getByRole('button', { name: '＋ 新会话' }))
    fireEvent.click(screen.getByRole('button', { name: '⚡ 快速会议' }))
    expect(stopRoomSession).toHaveBeenCalledWith('lobby')
    expect(newRoomSession).toHaveBeenCalledWith('lobby')
    expect(quickMeeting).toHaveBeenCalledWith('lobby')
  })

  it('reuses emoji, file, and quick-meeting actions for branches', () => {
    const setDraft = vi.fn()
    const quickThreadMeeting = vi.fn(async () => true)
    const target = { kind: 'thread' as const, room: { id: 'lobby' }, threadId: 'thread-id' }
    const useChatroom = (selector: (snapshot: ChatroomView) => unknown) => selector({
      sessionControlBusy: false,
      sessionControlError: undefined,
      wecomBusy: false,
      wecomError: undefined,
    } as unknown as ChatroomView)
    const { rerender } = render(<ChatroomFileAction {...{
      sessionId: 'branch-session',
      input: { draft: '你好', imageIds: [] },
      inputActions: { setDraft },
      useChatroom,
      resolveTarget: () => target,
      addFiles: vi.fn(), removeFile: vi.fn(), clearReply: vi.fn(), sendFiles: vi.fn(),
    } as unknown as ComponentProps<typeof ChatroomFileAction>} />)

    fireEvent.click(screen.getByRole('button', { name: '发送表情' }))
    fireEvent.click(screen.getByRole('button', { name: '插入 🎉' }))
    expect(setDraft).toHaveBeenCalledWith('你好🎉')
    expect(screen.getByRole('button', { name: '发送图片或文件' })).not.toBeNull()

    rerender(<ChatroomSessionControls {...{
      sessionId: 'branch-session',
      session: { running: false },
      useChatroom,
      resolveTarget: () => target,
      stopRoomSession: vi.fn(),
      newRoomSession: vi.fn(),
      quickMeeting: vi.fn(),
      quickThreadMeeting,
    } as unknown as ComponentProps<typeof ChatroomSessionControls>} />)
    fireEvent.click(screen.getByRole('button', { name: '⚡ 快速会议' }))
    expect(quickThreadMeeting).toHaveBeenCalledWith('thread-id')
    expect(screen.queryByRole('button', { name: '■ 停止' })).toBeNull()
    expect(screen.queryByRole('button', { name: '＋ 新会话' })).toBeNull()
  })

  it('shows the AI-context divider without replacing the retained room transcript', () => {
    render(<ChatroomComposerDock {...{
      sessionId: 'chatroom-v1-lobby',
      input: { draft: '', imageIds: [] },
      inputActions: { setDraft: vi.fn() },
      useChatroom: (selector: (snapshot: ChatroomView) => unknown) => selector({
        composerRoomId: undefined, pendingFiles: [], composerError: undefined,
      } as unknown as ChatroomView),
      resolveTarget: () => ({ kind: 'room', room: { id: 'lobby', aiContextResetSeq: 9 } }),
      addFiles: vi.fn(), removeFile: vi.fn(), clearReply: vi.fn(), sendFiles: vi.fn(),
    } as unknown as ComponentProps<typeof ChatroomComposerDock>} />)
    expect(screen.getByText('新的 AI 会话')).not.toBeNull()
    expect(screen.getByText('此前群聊消息继续保留')).not.toBeNull()
  })

  it('moves the AI-context divider into the transcript after the first new message', () => {
    const { container } = render(<ChatroomComposerDock {...{
      sessionId: 'chatroom-v1-lobby',
      input: { draft: '', imageIds: [] },
      inputActions: { setDraft: vi.fn() },
      useChatroom: (selector: (snapshot: ChatroomView) => unknown) => selector({
        composerRoomId: undefined, pendingFiles: [], composerError: undefined,
      } as unknown as ChatroomView),
      resolveTarget: () => ({
        kind: 'room', room: { id: 'lobby', aiContextResetSeq: 9, aiContextStartSeq: 10 },
      }),
      addFiles: vi.fn(), removeFile: vi.fn(), clearReply: vi.fn(), sendFiles: vi.fn(),
    } as unknown as ComponentProps<typeof ChatroomComposerDock>} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders queued AI prompts on the sent message with guide, edit, and delete actions', async () => {
    const setDraft = vi.fn()
    const updateQueuedPrompt = vi.fn(async (_target, _messageId: string, action: string) =>
      action === 'edit' ? '@AI 修改后的问题' : '')
    const props = {
      sessionId: 'chatroom-v1-lobby',
      session: {
        running: true,
        queue: [{
          id: 'queue-row',
          messageId: 'queued-message',
          placement: 'queued',
          text: '\u2063dsh-chatroom:alice-id|whale\u2063Alice：@AI 原问题',
          preview: '\u2063dsh-chatroom:alice-id|whale\u2063Alice：@AI 原问题',
        }],
      },
      input: { draft: '', imageIds: [] },
      inputActions: { setDraft },
      useChatroom: (selector: (snapshot: ChatroomView) => unknown) => selector({
        composerRoomId: undefined, pendingFiles: [], composerError: undefined,
      } as unknown as ChatroomView),
      resolveTarget: () => ({ kind: 'room', room: { id: 'lobby' } }),
      updateQueuedPrompt,
      addFiles: vi.fn(), removeFile: vi.fn(), clearReply: vi.fn(), sendFiles: vi.fn(),
    }
    render(<ChatroomComposerDock {...props as unknown as ComponentProps<typeof ChatroomComposerDock>} />)

    expect(screen.getByText('正在排队 · 等待当前回复完成')).not.toBeNull()
    expect(screen.getByText('@AI 原问题')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '编辑排队消息' }))
    await waitFor(() => expect(setDraft).toHaveBeenCalledWith('@AI 修改后的问题'))
    expect(updateQueuedPrompt).toHaveBeenCalledWith({ roomId: 'lobby' }, 'queued-message', 'edit')

    await waitFor(() => expect((screen.getByRole('button', { name: '删除排队消息' }) as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(screen.getByRole('button', { name: '删除排队消息' }))
    await waitFor(() => expect(updateQueuedPrompt).toHaveBeenCalledWith({ roomId: 'lobby' }, 'queued-message', 'delete'))
    await waitFor(() => expect((screen.getByRole('button', { name: '引导对话' }) as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(screen.getByRole('button', { name: '引导对话' }))
    await waitFor(() => expect(updateQueuedPrompt).toHaveBeenCalledWith({ roomId: 'lobby' }, 'queued-message', 'guide'))
  })

  it('restores text edited from a pending message bubble into the matching native composer', () => {
    const setDraft = vi.fn()
    render(<ChatroomComposerDock {...{
      sessionId: 'chatroom-v1-lobby',
      input: { draft: '', imageIds: [] },
      inputActions: { setDraft },
      useChatroom: (selector: (snapshot: ChatroomView) => unknown) => selector({
        composerRoomId: undefined, pendingFiles: [], pendingMessages: [], composerError: undefined,
      } as unknown as ChatroomView),
      resolveTarget: () => ({ kind: 'room', room: { id: 'lobby' } }),
      updateQueuedPrompt: vi.fn(),
      addFiles: vi.fn(), removeFile: vi.fn(), clearReply: vi.fn(), sendFiles: vi.fn(),
    } as unknown as ComponentProps<typeof ChatroomComposerDock>} />)

    restoreChatroomDraft('chatroom-v1-lobby', '恢复到输入框')
    expect(setDraft).toHaveBeenCalledWith('恢复到输入框')
    restoreChatroomDraft('another-session', '不应恢复')
    expect(setDraft).toHaveBeenCalledTimes(1)
  })
})
