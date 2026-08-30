// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ComposerAttachmentsProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import {
  ChatroomComposerAttachments,
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
})
