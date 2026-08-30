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
import { ChatroomAssistantReplyAction } from '../src/client/ChatroomAssistantReplyAction.js'
import { ChatroomAssistantNodeView } from '../src/client/ChatroomAssistantNodeView.js'
import type { ChatroomIdentity } from '../src/types.js'
import { identifyFileText, identifyForwardText, identifyReplyText } from '../src/message.js'

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

  it('projects and renders the verified enterprise avatar for a known participant', () => {
    const avatarUrl = 'https://images.example.com/alice.png'
    const node = userNode(identifyChatroomText('你好', alice))
    const projected = projectChatroomMessage(node, bob, [{
      participantId: alice.participantId, avatarId: alice.avatarId, avatarUrl,
    }])
    expect(projected.avatarUrl).toBe(avatarUrl)

    const Native = ({ node: renderedNode }: ChatNodeViewProps<'user'>) => <div>{firstText(renderedNode)}</div>
    render(<ChatroomUserMessageNodeView {...messageProps(node, bob, Native, {
      members: [{
        ...alice, avatarUrl, role: 'member', joinedAt: 1, lastSeenAt: 1, online: true,
      }],
    })} />)
    expect(document.querySelector<HTMLImageElement>('.dsh-chatroom-avatar img')?.src).toBe(avatarUrl)
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
    expect(screen.queryByRole('button', { name: '分支' })).toBeNull()
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

  it('offers recall only for the sender and replaces the message with a tombstone', () => {
    const recallMessage = vi.fn(async () => true)
    const Native = ({ node }: ChatNodeViewProps<'user'>) => <div data-testid="native">{firstText(node)}</div>
    const ownNode = userNode(identifyChatroomText('需要撤回', alice))
    const { rerender } = render(<ChatroomUserMessageNodeView {...{
      ...messageProps(ownNode, alice, Native),
      recallMessage,
    }} />)

    fireEvent.click(screen.getByRole('button', { name: '更多消息操作' }))
    fireEvent.click(screen.getByRole('menuitem', { name: '↶ 撤回' }))
    expect(recallMessage).toHaveBeenCalledWith('lobby', 'user:1')

    rerender(<ChatroomUserMessageNodeView {...{
      ...messageProps(ownNode, alice, Native, {
        recalls: [{ roomId: 'lobby', messageId: 'user:1', participantId: 'alice-id', createdAt: 2 }],
      }),
      recallMessage,
    }} />)
    expect(screen.getByText('消息已撤回')).toBeTruthy()
    expect(screen.queryByTestId('native')).toBeNull()
    expect(screen.queryByRole('button', { name: '更多消息操作' })).toBeNull()
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
    expect(screen.getByRole('button', { name: '回复' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '点赞' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '分支' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '转发' })).toBeTruthy()
    expect(screen.queryByRole('menuitem', { name: '▣ 复制' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '更多消息操作' }))
    expect(screen.getByRole('menuitem', { name: '▣ 复制' })).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: '☑ 多选' })).toBeTruthy()
    expect(screen.queryByRole('menuitem', { name: '⑂ 分支' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '回复' }))
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
    expect(screen.getByRole('menuitem', { name: /复制/u })).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: /回复/u })).toBeTruthy()
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

  it('renders forwarded Markdown, files, images, quotes, and reaction snapshots', () => {
    const bundle = {
      sourceRoomId: 'source-room',
      sourceRoomTitle: '来源群',
      items: [{
        messageId: 'assistant:9',
        sourceSessionId: 'source-session',
        sourceSeq: 9,
        role: 'ai' as const,
        displayName: 'DeepSeek',
        text: '**结论**',
        createdAt: 9,
        reply: { messageId: 'user:8', displayName: 'Alice', text: '问题' },
        reactions: [{ emoji: '🎉' as const, count: 2 }],
        content: [
          { type: 'text' as const, text: '**结论**', markdown: true },
          { type: 'file' as const, file: { id: 'file-id', name: 'report.pdf', mediaType: 'application/pdf', bytes: 2_048 } },
          {
            type: 'image' as const,
            image: {
              attachmentId: 'image-id', mediaType: 'image/png' as const, bytes: 100,
              width: 10, height: 10, name: 'chart.png',
            },
          },
        ],
      }],
    }
    const Native = ({ node }: ChatNodeViewProps<'user'>) => <div data-testid="native">{firstText(node)}</div>
    render(<ChatroomUserMessageNodeView {...messageProps(
      userNode(identifyChatroomText(identifyForwardText(bundle), bob)),
      alice,
      Native,
    )} />)

    expect(screen.getByText('合并转发 · 1 条消息')).toBeTruthy()
    expect(screen.getByText('结论').tagName).toBe('STRONG')
    expect(screen.getByText('回复 Alice')).toBeTruthy()
    expect(screen.getByText('report.pdf')).toBeTruthy()
    expect(screen.getByText('🎉 2')).toBeTruthy()
    const image = screen.getByRole('img', { name: 'chart.png' }) as HTMLImageElement
    const encoded = image.src.slice(image.src.indexOf('/images/') + '/images/'.length)
    expect(JSON.parse(decodeURIComponent(encoded))).toMatchObject({
      sourceRoomId: 'source-room', sourceSessionId: 'source-session', sourceSeq: 9,
      image: { attachmentId: 'image-id' },
    })
  })

  it('shows every message checkbox in selection mode and the latest three branch replies', () => {
    const toggleMessageSelection = vi.fn()
    const openThread = vi.fn(async () => undefined)
    const root = {
      messageId: 'user:1', displayName: 'Bob', text: '主题', role: 'human' as const,
      sourceSessionId: 'chatroom-v1-lobby', sourceSeq: 1,
    }
    const thread = { id: 'thread', roomId: 'lobby', sessionId: 'thread-session', root, createdAt: 1 }
    const recentMessages = [1, 2, 3].map(sequence => ({
      id: `reply-${sequence}`,
      threadId: 'thread',
      sequence,
      role: 'human' as const,
      participantId: 'bob-id',
      displayName: 'Bob',
      avatarId: 'fox' as const,
      text: `分支回复 ${sequence}`,
      createdAt: sequence,
    }))
    const Native = ({ node }: ChatNodeViewProps<'user'>) => <div data-testid="native">{firstText(node)}</div>
    render(<ChatroomUserMessageNodeView {...{
      ...messageProps(userNode(identifyChatroomText('主题', bob)), alice, Native, {
        selectionRoomId: 'lobby',
        threadPreviews: [{ thread, totalMessages: 5, recentMessages }],
      }),
      toggleMessageSelection,
      openThread,
    }} />)

    fireEvent.click(screen.getByRole('checkbox', { name: '选择 Bob 的消息' }))
    expect(toggleMessageSelection).toHaveBeenCalledWith('lobby', expect.objectContaining({ messageId: 'user:1' }))
    expect(screen.getByText('分支 · 5 条回复')).toBeTruthy()
    expect(screen.getByText('分支回复 1')).toBeTruthy()
    expect(screen.getByText('分支回复 3')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '打开分支，5 条回复' }))
    expect(openThread).toHaveBeenCalledWith('lobby', root)
  })

  it('adds the same selection checkbox and branch activity to AI messages', () => {
    const toggleMessageSelection = vi.fn()
    const openThread = vi.fn(async () => undefined)
    const root = {
      messageId: 'assistant:2', displayName: 'DeepSeek', text: 'AI 结论', role: 'ai' as const,
      sourceSessionId: 'chatroom-v1-lobby', sourceSeq: 2,
    }
    const thread = { id: 'ai-thread', roomId: 'lobby', sessionId: 'ai-thread-session', root, createdAt: 1 }
    const useChatroom = messageProps(userNode(identifyChatroomText('参考', bob)), alice, () => null, {
      selectionRoomId: 'lobby',
      threadPreviews: [{
        thread,
        totalMessages: 1,
        recentMessages: [{
          id: 'ai-reply', threadId: thread.id, sequence: 0, role: 'human', participantId: 'alice-id',
          displayName: 'Alice', avatarId: 'whale', text: '追问', createdAt: 2,
        }],
      }],
    }).useChatroom
    const props = {
      sessionId: 'chatroom-v1-lobby' as never,
      messageId: 'assistant:2',
      useChatroom,
      useSession: (selector: (snapshot: unknown) => unknown) => selector({
        nodes: [{ kind: 'assistant', messageId: 'assistant:2', seq: 2, blocks: [{ kind: 'text', text: 'AI 结论' }], time: 2 }],
      }),
      setReply: vi.fn(),
      openThread,
      toggleReaction: vi.fn(async () => undefined),
      openForward: vi.fn(),
      toggleMessageSelection,
    } as unknown as Parameters<typeof ChatroomAssistantReplyAction>[0]
    render(<div data-time-hover-root><div data-testid="native-actions"><div><ChatroomAssistantReplyAction {...props} /></div></div></div>)

    const activity = screen.getByRole('button', { name: '打开分支，1 条回复' })
    expect(activity.parentElement?.className).toBe('dsh-chatroom-assistant-tools')
    expect(activity.closest('[data-dsh-chatroom-native-actions]')).toBe(screen.getByTestId('native-actions'))
    expect(activity.previousElementSibling?.className).toBe('dsh-chatroom-assistant-actions')
    fireEvent.click(screen.getByRole('checkbox', { name: '选择 DeepSeek 的消息' }))
    expect(toggleMessageSelection).toHaveBeenCalledWith('lobby', expect.objectContaining({
      messageId: 'assistant:2', role: 'ai',
    }))
    fireEvent.click(activity)
    expect(openThread).toHaveBeenCalledWith('lobby', root)
  })

  it('folds completed Think and tool rows into one expandable process summary', () => {
    const finalNode = {
      key: 'assistant-final',
      kind: 'assistant-step',
      location: { kind: 'step', turn: { turn: 1 } },
      data: {
        status: 'settled', turn: 1, step: 2,
        blocks: [{ kind: 'reasoning', text: '最后一步 Think' }, { kind: 'text', text: '最终答案' }], time: 4,
        finalNode: { kind: 'assistant', seq: 4, messageId: 'assistant:4', time: 4, turn: 1, step: 2, blocks: [] },
      },
    }
    const processNodes = [
      { key: 'assistant-think', kind: 'assistant-step', location: { kind: 'step', turn: { turn: 1 } } },
      { key: 'tool-bash', kind: 'tool-call', location: { kind: 'step', turn: { turn: 1 } } },
      { key: 'user-question', kind: 'user', location: { kind: 'turn', turn: { turn: 1 } } },
    ]
    const nodes = new Map([...processNodes, finalNode].map(node => [node.key, node]))
    const Native = () => <div><div data-testid="inline-think" data-variant="think">最后一步 Think</div><div>最终答案</div></div>
    const props = {
      node: finalNode,
      sessionId: 'chatroom-v1-lobby',
      nativeMessageView: Native,
      resolveTarget: () => ({ kind: 'room', room: { id: 'lobby' } }),
      useTurnData: () => ({ closing: { finalNode: { seq: 4 } } }),
      useSession: (selector: (snapshot: unknown) => unknown) => selector({
        chat: { order: [...nodes.keys()], nodes },
      }),
    } as unknown as Parameters<typeof ChatroomAssistantNodeView>[0]

    render(
      <div data-chat-flow="">
        <div data-testid="think" data-chat-flow-key="assistant-think">Think</div>
        <div data-testid="tool" data-chat-flow-key="tool-bash">Bash</div>
        <div data-testid="user" data-chat-flow-key="user-question">问题</div>
        <div data-chat-flow-key="assistant-final"><ChatroomAssistantNodeView {...props} /></div>
      </div>,
    )

    expect(screen.getByTestId('think').hidden).toBe(true)
    expect(screen.getByTestId('tool').hidden).toBe(true)
    expect(screen.getByTestId('inline-think').hidden).toBe(true)
    expect(screen.getByTestId('user').hidden).toBe(false)
    const toggle = screen.getByRole('button', { name: '执行过程 · 3 项' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(screen.getByTestId('think').hidden).toBe(false)
    expect(screen.getByTestId('tool').hidden).toBe(false)
    expect(screen.getByTestId('inline-think').hidden).toBe(false)
    expect(screen.getByRole('button', { name: '收起执行过程 · 3 项' }).getAttribute('aria-expanded')).toBe('true')
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
  viewPatch: Partial<import('../src/client/store.js').ChatroomView> = {},
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
      roomEnsureSessionId: undefined,
      identity,
      auth: {
        enabled: false,
        authenticated: true,
        providers: [],
        allowSelfRegistration: true,
        bootstrapRequired: false,
      },
      online: 2,
      members: [],
      memberCandidates: [],
      reactions: [],
      recalls: [],
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
      accountOpen: false,
      accountBusy: false,
      accountError: undefined,
      adminOpen: false,
      adminBusy: false,
      adminOverview: undefined,
      adminError: undefined,
      automationBusy: false,
      automationOverview: undefined,
      automationError: undefined,
      directOpen: false,
      directBusy: false,
      directPeers: [],
      directConversations: [],
      directConversation: undefined,
      directMessages: [],
      directError: undefined,
      newSessionModes: {},
      ...viewPatch,
    }),
    nativeMessageView,
    setReply: () => undefined,
    openThread: async () => undefined,
  } as unknown as ChatroomUserMessageNodeViewProps
}
