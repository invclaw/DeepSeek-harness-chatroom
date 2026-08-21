// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { ChatNode, ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import {
  ChatroomUserMessageNodeView,
  identifyChatroomText,
  projectChatroomMessage,
  type ChatroomUserMessageNodeViewProps,
} from '../src/client/ChatroomMessageNodeView.js'
import type { ChatroomIdentity } from '../src/types.js'

const alice: ChatroomIdentity = { participantId: 'alice-id', displayName: 'Alice' }
const bob: ChatroomIdentity = { participantId: 'bob-id', displayName: 'Bob' }

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

  it('puts the participant name above a native bubble that contains only the message', () => {
    const Native = ({ node }: ChatNodeViewProps<'user'>) => <div data-testid="native">{firstText(node)}</div>
    const { rerender } = render(<ChatroomUserMessageNodeView {...messageProps(
      userNode(identifyChatroomText('自己的消息', alice)),
      alice,
      Native,
    )} />)
    expect(screen.getByText('Alice').className).toBe('dsh-chatroom-display-name')
    expect(screen.getByTestId('native').textContent).toBe('自己的消息')
    expect(screen.getByTestId('native').parentElement?.getAttribute('data-dsh-chatroom-own')).toBe('true')

    rerender(<ChatroomUserMessageNodeView {...messageProps(
      userNode(identifyChatroomText('别人的消息', bob)),
      alice,
      Native,
    )} />)
    expect(screen.getByText('Bob').className).toBe('dsh-chatroom-display-name')
    expect(screen.getByTestId('native').parentElement?.getAttribute('data-dsh-chatroom-own')).toBe('false')
    expect(screen.getByTestId('native').textContent).toBe('别人的消息')
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
  identity: ChatroomIdentity,
  nativeMessageView: ChatroomUserMessageNodeViewProps['nativeMessageView'],
): ChatroomUserMessageNodeViewProps {
  return {
    node,
    sessionId: 'chatroom-v1-lobby' as never,
    useChatroom: (selector: (snapshot: import('../src/client/store.js').ChatroomView) => unknown) => selector({
      open: false,
      phase: 'ready',
      connection: 'online',
      room: { id: 'lobby', title: 'AI 聊天室', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-v1-lobby' },
      identity,
      online: 2,
      error: undefined,
    }),
    nativeMessageView,
  } as unknown as ChatroomUserMessageNodeViewProps
}
