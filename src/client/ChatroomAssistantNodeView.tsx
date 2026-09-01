import { useEffect, useMemo, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import type { ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ChatroomAgentTarget } from './store.js'
import type { ChatroomView } from './store.js'
import type {
  ChatroomForwardItem,
  ChatroomReplyReference,
  ChatroomThreadRoot,
} from '../types.js'
import type { ChatroomReactionEmoji } from '../reactions.js'
import { projectExternalCardText } from '../message.js'
import { ChatroomExternalCardView } from './ChatroomExternalCard.js'
import { ChatroomAssistantReplyAction } from './ChatroomAssistantReplyAction.js'

const COLLAPSIBLE_PROCESS_KINDS = new Set(['assistant-step', 'context', 'retry', 'tool-call'])

export interface ChatroomAssistantNodeViewProps extends ChatNodeViewProps<'assistant-step'> {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  nativeMessageView: ComponentType<ChatNodeViewProps<'assistant-step'>>
  resolveTarget?(sessionId: string): ChatroomAgentTarget | undefined
  setReply(roomId: string, reply: ChatroomReplyReference): void
  openThread(roomId: string, root: ChatroomThreadRoot): Promise<void>
  toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void>
  openForward(roomId: string, message: ChatroomForwardItem): void
  toggleMessageSelection(roomId: string, message: ChatroomForwardItem): void
  recallMessage(roomId: string, messageId: string): Promise<boolean>
}

/** Keep a completed shared-room turn compact while preserving its native process rows. */
export function ChatroomAssistantNodeView(props: ChatroomAssistantNodeViewProps): JSX.Element {
  const NativeMessageView = props.nativeMessageView
  const rootRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const finalNode = props.node.data.finalNode
  const tail = props.useTurnData('turn-tail')
  const shared = props.resolveTarget?.(String(props.sessionId)) !== undefined
  const closing = shared
    && finalNode !== undefined
    && tail?.closing?.finalNode.seq === finalNode.seq
  const standaloneMeetingSummaryMessageId = shared
    && finalNode !== undefined
    && !closing
    && props.node.data.blocks.some(block => block.kind === 'text'
      && block.text.trimStart().startsWith('## 会议总结 ·'))
    ? finalNode.messageId
    : undefined
  const standaloneMeetingSummary = standaloneMeetingSummaryMessageId !== undefined
  const processSignature = props.useSession((snapshot) => {
    if (!closing) return ''
    const turn = props.node.data.turn
    return snapshot.chat.order.flatMap((key) => {
      const candidate = snapshot.chat.nodes.get(key)
      if (candidate === undefined || candidate.key === props.node.key) return []
      const location = candidate.location
      const candidateTurn = location.kind === 'turn' || location.kind === 'step'
        ? location.turn.turn
        : undefined
      return candidateTurn === turn && COLLAPSIBLE_PROCESS_KINDS.has(candidate.kind)
        ? [candidate.key]
        : []
    }).join('\u0000')
  })
  const processKeys = useMemo(
    () => processSignature === '' ? [] : processSignature.split('\u0000'),
    [processSignature],
  )
  const inlineReasoningCount = closing
    ? props.node.data.blocks.filter(block => block.kind === 'reasoning' && block.text.trim() !== '').length
    : 0
  const processItemCount = processKeys.length + inlineReasoningCount
  const cards = props.node.data.blocks.flatMap(block => block.kind === 'text'
    ? projectExternalCardText(block.text).cards
    : [])
  const projectedBlocks: Array<(typeof props.node.data.blocks)[number]> = []
  for (const block of props.node.data.blocks) {
    if (block.kind !== 'text') {
      projectedBlocks.push(block)
      continue
    }
    const projection = projectExternalCardText(block.text)
    if (projection.text.trim() !== '') projectedBlocks.push({ ...block, text: projection.text })
  }
  const projectedNode: typeof props.node = cards.length === 0 ? props.node : {
    ...props.node,
    data: {
      ...props.node.data,
      blocks: projectedBlocks,
    },
  }

  useEffect(() => {
    const root = rootRef.current
    const flow = root?.closest<HTMLElement>('[data-chat-flow]')
    if (root === null || !closing) return
    const keys = new Set(processKeys)
    const processRows = flow === null || flow === undefined
      ? []
      : [...flow.querySelectorAll<HTMLElement>('[data-chat-flow-key]')]
          .filter(row => keys.has(row.dataset.chatFlowKey ?? ''))
    const inlineReasoningRows = [...root.querySelectorAll<HTMLElement>('[data-variant="think"]')]
    const rows = [...processRows, ...inlineReasoningRows].map(row => ({ row, hidden: row.hidden }))
    for (const { row } of rows) {
      row.dataset.dshChatroomProcessRow = ''
      row.hidden = !expanded
    }
    return () => {
      for (const { row, hidden } of rows) {
        row.hidden = hidden
        delete row.dataset.dshChatroomProcessRow
      }
    }
  }, [closing, expanded, processKeys])

  return (
    <div
      className="dsh-chatroom-assistant-turn"
      ref={rootRef}
      data-time-hover-root={standaloneMeetingSummary || undefined}
      data-dsh-chatroom-standalone-assistant={standaloneMeetingSummary || undefined}
    >
      {closing && processItemCount > 0 && (
        <button
          type="button"
          className="dsh-chatroom-process-toggle"
          aria-expanded={expanded}
          onClick={() => { setExpanded(value => !value) }}
        >
          <span aria-hidden className="dsh-chatroom-process-chevron">⌄</span>
          <span>{expanded ? '收起执行过程' : '执行过程'} · {processItemCount} 项</span>
        </button>
      )}
      <NativeMessageView {...props} node={projectedNode} />
      {cards.map((card, index) => <ChatroomExternalCardView card={card} key={`${card.kind}:${card.title}:${index}`} />)}
      {standaloneMeetingSummary && <ChatroomAssistantReplyAction
        {...props}
        messageId={standaloneMeetingSummaryMessageId}
      />}
    </div>
  )
}
