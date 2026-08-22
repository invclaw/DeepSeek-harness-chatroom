// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatNode, ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import {
  ChatroomUserMessageNodeView,
  identifyChatroomText,
  projectChatroomMessage,
  type ChatroomUserMessageNodeViewProps,
} from '../src/client/ChatroomMessageNodeView.js'
import type { ChatroomIdentity } from '../src/types.js'
import { identifyFileText, identifyReplyText } from '../src/message.js'

const alice: ChatroomIdentity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' }
const bob: ChatroomIdentity = { participantId: 'bob-id', displayName: 'Bob', avatarId: 'fox' }

afterEach(cleanup)

describe('participant-specific native message projection', () => {
  it('uses the durable participant id and removes its invisible display marker', () => {
    const node = userNode(identifyChatroomText('你好', alice))
    const own = projectChatroomMessage(node, alice)
    const peer = projectChatroomMessage(node, bob)
    expect(own.own).toBe(true)
    expect(peer.own).toBe(false)
    expect(own.displayName).toBe('Alice')
    expect(peer.displayName).toBe('Alice')
    expect(firstText(own.node)).toBe('你好')
    expect(firstText(peer.node)).toBe('你好')
  })

  it('classifies pre-0.3 history by its visible display-name prefix', () => {
    const own = projectChatroomMessage(userNode('Alice：旧消息'), alice)
    const peer = projectChatroomMessage(userNode('Alice：旧消息'), bob)
    expect(own).toMatchObject({ own: true, displayName: 'Alice' })
    expect(peer).toMatchObject({ own: false, displayName: 'Alice' })
    expect(firstText(own.node)).toBe('旧消息')
    expect(firstText(peer.node)).toBe('旧消息')
  })

  it('hides transport markers before this browser chooses an identity', () => {
    const Native = ({ node }: ChatNodeViewProps<'user'>) => <div data-testid="native">{firstText(node)}</div>
    render(<ChatroomUserMessageNodeView {...messageProps(
      userNode(identifyChatroomText('加入前可读', bob)),
      undefined,
      Native,
    )} />)

    expect(screen.getByText('Bob').className).toBe('dsh-chatroom-display-name')
    expect(screen.getByTestId('native').textContent).toBe('加入前可读')
    expect(screen.queryByRole('button', { name: '↩ 回复' })).toBeNull()
    expect(screen.queryByRole('button', { name: '⑂ 分支' })).toBeNull()
  })

  it('puts the participant name above a native bubble that contains only the message', () => {
    const Native = ({ node }: ChatNodeViewProps<'user'>) => <div data-testid="native">{firstText(node)}</div>
    const { rerender } = render(<ChatroomUserMessageNodeView {...messageProps(
      userNode(identifyChatroomText('自己的消息', alice)),
      alice,
      Native,
    )} />)
    expect(screen.getByText('Alice').className).toBe('dsh-chatroom-display-name')
    expect(screen.getByTestId('native').textContent).toBe('自己的消息')
    expect(screen.getByTestId('native').closest('.dsh-chatroom-participant-message')?.getAttribute('data-dsh-chatroom-own')).toBe('true')

    rerender(<ChatroomUserMessageNodeView {...messageProps(
      userNode(identifyChatroomText('别人的消息', bob)),
      alice,
      Native,
    )} />)
    expect(screen.getByText('Bob').className).toBe('dsh-chatroom-display-name')
    expect(screen.getByTestId('native').closest('.dsh-chatroom-participant-message')?.getAttribute('data-dsh-chatroom-own')).toBe('false')
    expect(screen.getByTestId('native').textContent).toBe('别人的消息')
  })

  it('renders avatar, reply quote, file card, and a reply action around the native bubble', () => {
    const reply = { messageId: 'user:1', displayName: 'Alice', text: '上一条消息' }
    const file = { id: 'file-id', name: 'brief.pdf', mediaType: 'application/pdf', bytes: 2048 }
    const text = identifyReplyText(`请查收${identifyFileText(file)}`, reply)
    const setReply = vi.fn()
    const Native = ({ node }: ChatNodeViewProps<'user'>) => <div data-testid="native">{firstText(node)}</div>
    render(<ChatroomUserMessageNodeView {...{
      ...messageProps(userNode(identifyChatroomText(text, bob)), alice, Native),
      setReply,
    }} />)

    expect(screen.getByText('🦊')).toBeTruthy()
    expect(screen.getByText('回复 Alice')).toBeTruthy()
    expect(screen.getByText('brief.pdf')).toBeTruthy()
    expect(screen.getByTestId('native').textContent).toBe('请查收')
    fireEvent.click(screen.getByRole('button', { name: '↩ 回复' }))
    expect(setReply).toHaveBeenCalledWith('lobby', expect.objectContaining({ displayName: 'Bob', text: '请查收' }))
  })

  it('renders a pure file directly and exposes reactions, forwarding, and multi-select on right click', () => {
    const file = { id: 'file-id', name: 'brief.pdf', mediaType: 'application/pdf', bytes: 2048 }
    const toggleReaction = vi.fn(async () => undefined)
    const openForward = vi.fn()
    const toggleMessageSelection = vi.fn()
    const Native = ({ node }: ChatNodeViewProps<'user'>) => <div data-testid="native">{firstText(node)}</div>
    render(<ChatroomUserMessageNodeView {...{
      ...messageProps(userNode(identifyChatroomText(identifyFileText(file), bob)), alice, Native),
      toggleReaction,
      openForward,
      toggleMessageSelection,
    }} />)

    expect(screen.getByText('brief.pdf')).toBeTruthy()
    expect(screen.queryByTestId('native')).toBeNull()
    expect(screen.queryByText(/发送了/u)).toBeNull()
    const row = screen.getByText('brief.pdf').closest('.dsh-chatroom-participant-message')!
    fireEvent.contextMenu(row, { clientX: 120, clientY: 80 })
    fireEvent.click(screen.getByTitle('贴表情 👍'))
    expect(toggleReaction).toHaveBeenCalledWith('lobby', 'user:1', '👍')

    fireEvent.contextMenu(row, { clientX: 120, clientY: 80 })
    fireEvent.click(screen.getByRole('menuitem', { name: /转发/u }))
    expect(openForward).toHaveBeenCalledWith('lobby', expect.objectContaining({ messageId: 'user:1', text: 'brief.pdf' }))

    fireEvent.contextMenu(row, { clientX: 120, clientY: 80 })
    fireEvent.click(screen.getByRole('menuitem', { name: /多选/u }))
    expect(toggleMessageSelection).toHaveBeenCalledWith('lobby', expect.objectContaining({ messageId: 'user:1' }))
  })

  it('removes legacy attachment placeholders from existing room history', () => {
    const file = { id: 'file-id', name: 'brief.pdf', mediaType: 'application/pdf', bytes: 2048 }
    const Native = ({ node }: ChatNodeViewProps<'user'>) => <div data-testid="native">{firstText(node)}</div>
    render(<ChatroomUserMessageNodeView {...messageProps(
      userNode(identifyChatroomText(`发送了文件。${identifyFileText(file)}`, bob)),
      alice,
      Native,
    )} />)

    expect(screen.getByText('brief.pdf')).toBeTruthy()
    expect(screen.queryByText('发送了文件。')).toBeNull()
    expect(screen.queryByTestId('native')).toBeNull()
  })
})

function userNode(text: string): ChatNode<'user'> {
  return {
    key: 'user:1',
    kind: 'user',
    seq: 1,
    location: { kind: 'turn', turn: 1 } as never,
    data: {
      kind: 'user',
      seq: 1,
      time: 1,
      content: [{ type: 'text', text }],
      source: { kind: 'user' },
    },
  } as unknown as ChatNode<'user'>
}

function firstText(node: ChatNode<'user' | 'steering'>): string {
  const block = node.data.content.find(item => item.type === 'text')
  return block?.type === 'text' ? block.text : ''
}

function messageProps(
  node: ChatNode<'user'>,
  identity: ChatroomIdentity | undefined,
  nativeMessageView: ChatroomUserMessageNodeViewProps['nativeMessageView'],
): ChatroomUserMessageNodeViewProps {
  return {
    node,
    sessionId: 'chatroom-v1-lobby' as never,
    useChatroom: (selector: (snapshot: import('../src/client/store.js').ChatroomView) => unknown) => selector({
      open: false,
      phase: 'ready',
      connection: 'online',
      rooms: [{ id: 'lobby', title: 'AI 聊天室', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-v1-lobby' }],
      room: { id: 'lobby', title: 'AI 聊天室', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-v1-lobby' },
      identity,
      online: 2,
      members: [],
      reactions: [],
      membersOpen: false,
      error: undefined,
      composerRoomId: undefined,
      pendingFiles: [],
      reply: undefined,
      composerBusy: false,
      composerError: undefined,
      thread: undefined,
      threadMessages: [],
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
    }),
    nativeMessageView,
    setReply: () => undefined,
    openThread: async () => undefined,
  } as unknown as ChatroomUserMessageNodeViewProps
}
