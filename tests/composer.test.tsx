// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ComponentProps } from 'react'
import type { ComposerAttachmentsProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import {
  ChatroomComposerAttachments,
  ChatroomComposerDock,
  ChatroomSessionControls,
  type ChatroomComposerAttachmentsProps,
} from '../src/client/ChatroomComposer.js'
import type { ChatroomView } from '../src/client/store.js'

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
    }
    render(<ChatroomSessionControls {...props as unknown as ComponentProps<typeof ChatroomSessionControls>} />)
    fireEvent.click(screen.getByRole('button', { name: '■ 停止' }))
    fireEvent.click(screen.getByRole('button', { name: '＋ 新会话' }))
    fireEvent.click(screen.getByRole('button', { name: '⚡ 快速会议' }))
    expect(stopRoomSession).toHaveBeenCalledWith('lobby')
    expect(newRoomSession).toHaveBeenCalledWith('lobby')
    expect(quickMeeting).toHaveBeenCalledWith('lobby')
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
})
