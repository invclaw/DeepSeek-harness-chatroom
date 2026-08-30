import { useEffect, useMemo, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import type { ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ChatroomAgentTarget } from './store.js'

const COLLAPSIBLE_PROCESS_KINDS = new Set(['assistant-step', 'context', 'retry', 'tool-call'])

export interface ChatroomAssistantNodeViewProps extends ChatNodeViewProps<'assistant-step'> {
  nativeMessageView: ComponentType<ChatNodeViewProps<'assistant-step'>>
  resolveTarget?(sessionId: string): ChatroomAgentTarget | undefined
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
    <div className="dsh-chatroom-assistant-turn" ref={rootRef}>
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
      <NativeMessageView {...props} />
    </div>
  )
}
