import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { CHATROOM_REACTION_EMOJIS, type ChatroomReactionEmoji } from '../reactions.js'
import type { ChatroomForwardItem, ChatroomIdentity, ChatroomReaction } from '../types.js'

async function writeClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText !== undefined) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }
  if (typeof document.execCommand !== 'function') return false
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.append(textarea)
  textarea.select()
  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}

export interface ChatroomMessageToolsProps {
  readonly roomId: string
  readonly message: ChatroomForwardItem
  readonly reactions: readonly ChatroomReaction[]
  readonly identity: ChatroomIdentity | undefined
  readonly selecting: boolean
  readonly selected: boolean
  readonly copyText?: string
  readonly onReply?: (() => void) | undefined
  readonly onBranch?: (() => void) | undefined
  toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void>
  openForward(roomId: string, message: ChatroomForwardItem): void
  toggleSelection(roomId: string, message: ChatroomForwardItem): void
}

/** Capability-driven actions reused by main-room and branch message rows. */
export function ChatroomInlineMessageActions({
  tools,
}: {
  readonly tools: ChatroomMessageToolsProps
}): JSX.Element | null {
  const [copied, setCopied] = useState(false)
  const [overflowOpen, setOverflowOpen] = useState(false)
  const copyText = tools.copyText
  const canAct = tools.identity !== undefined
  const liked = tools.reactions.some(reaction => reaction.messageId === tools.message.messageId
    && reaction.emoji === '👍'
    && reaction.participantIds.includes(tools.identity?.participantId ?? ''))
  useEffect(() => {
    if (!overflowOpen) return
    const close = () => { setOverflowOpen(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [overflowOpen])
  if (copyText === undefined && !canAct) return null
  const copy = (): void => {
    if (copyText === undefined || copied) return
    void writeClipboard(copyText).then((written) => {
      if (!written) return
      setCopied(true)
      globalThis.setTimeout(() => { setCopied(false) }, 1_000)
    })
  }
  return (
    <div className="dsh-chatroom-message-actions">
      {tools.onReply !== undefined && <button type="button" aria-label="回复" onClick={tools.onReply}>↩ <span className="dsh-chatroom-action-label">回复</span></button>}
      {canAct && (
        <button
          type="button"
          aria-label={liked ? '取消点赞' : '点赞'}
          aria-pressed={liked}
          onClick={() => { void tools.toggleReaction(tools.roomId, tools.message.messageId, '👍') }}
        >👍 <span className="dsh-chatroom-action-label">{liked ? '已赞' : '点赞'}</span></button>
      )}
      {canAct && <button type="button" aria-label="转发" onClick={() => { tools.openForward(tools.roomId, tools.message) }}>↗ <span className="dsh-chatroom-action-label">转发</span></button>}
      {(canAct || copyText !== undefined || tools.onBranch !== undefined) && (
        <span className="dsh-chatroom-inline-reaction-control">
          <button type="button" aria-label="更多消息操作" aria-expanded={overflowOpen} onClick={() => { setOverflowOpen(open => !open) }}>•••</button>
          {overflowOpen && (
            <span className="dsh-chatroom-action-overflow" role="menu" aria-label="更多消息操作" onPointerDown={event => { event.stopPropagation() }}>
              {canAct && <span className="dsh-chatroom-inline-reactions" aria-label="贴表情">
                {CHATROOM_REACTION_EMOJIS.map(emoji => (
                  <button
                    type="button"
                    aria-label={`贴表情 ${emoji}`}
                    title={`贴表情 ${emoji}`}
                    key={emoji}
                    onClick={() => {
                      void tools.toggleReaction(tools.roomId, tools.message.messageId, emoji)
                      setOverflowOpen(false)
                    }}
                  >{emoji}</button>
                ))}
              </span>}
              {copyText !== undefined && <button type="button" role="menuitem" onClick={() => { copy(); setOverflowOpen(false) }}>{copied ? '✓ 已复制' : '▣ 复制'}</button>}
              {canAct && <button type="button" role="menuitem" onClick={() => { tools.toggleSelection(tools.roomId, tools.message); setOverflowOpen(false) }}>{tools.selected ? '✓ 取消选择' : '☑ 多选'}</button>}
              {tools.onBranch !== undefined && <button type="button" role="menuitem" onClick={() => { tools.onBranch?.(); setOverflowOpen(false) }}>⑂ 分支</button>}
            </span>
          )}
        </span>
      )}
    </div>
  )
}

/** Checkbox shown on every message while the room is in multi-select mode. */
export function ChatroomSelectionCheckbox({ tools }: { tools: ChatroomMessageToolsProps }): JSX.Element | null {
  if (!tools.selecting) return null
  return (
    <label className="dsh-chatroom-selection-checkbox" title={tools.selected ? '取消选择' : '选择消息'}>
      <input
        type="checkbox"
        aria-label={`${tools.selected ? '取消选择' : '选择'} ${tools.message.displayName} 的消息`}
        checked={tools.selected}
        onChange={() => { tools.toggleSelection(tools.roomId, tools.message) }}
      />
      <span aria-hidden>{tools.selected ? '✓' : ''}</span>
    </label>
  )
}

/** Local context-menu state for one native message row. */
export function useChatroomMessageMenu(): {
  readonly position: { x: number; y: number } | undefined
  open(event: MouseEvent | ReactMouseEvent): void
  close(): void
} {
  const [position, setPosition] = useState<{ x: number; y: number }>()
  useEffect(() => {
    if (position === undefined) return
    const close = () => { setPosition(undefined) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [position])
  return {
    position,
    open: (event) => {
      event.preventDefault()
      event.stopPropagation()
      setPosition({
        x: Math.max(8, Math.min(event.clientX, globalThis.innerWidth - 248)),
        y: Math.max(8, Math.min(event.clientY, globalThis.innerHeight - 248)),
      })
    },
    close: () => { setPosition(undefined) },
  }
}

/** Persisted reaction chips shown below one message. */
export function ChatroomReactionBar(props: ChatroomMessageToolsProps): JSX.Element | null {
  const reactions = props.reactions.filter(item => item.messageId === props.message.messageId && item.participantIds.length > 0)
  if (reactions.length === 0) return null
  return (
    <div className="dsh-chatroom-reaction-bar">
      {reactions.map(reaction => (
        <button
          type="button"
          key={reaction.emoji}
          aria-label={`${reaction.emoji} ${reaction.participantIds.length}`}
          aria-pressed={reaction.participantIds.includes(props.identity?.participantId ?? '')}
          disabled={props.identity === undefined}
          onClick={() => { void props.toggleReaction(props.roomId, props.message.messageId, reaction.emoji) }}
        >
          <span>{reaction.emoji}</span><small>{reaction.participantIds.length}</small>
        </button>
      ))}
    </div>
  )
}

/** Right-click menu shared by human and AI messages. */
export function ChatroomMessageContextMenu({
  tools,
  position,
  close,
}: {
  tools: ChatroomMessageToolsProps
  position: { x: number; y: number } | undefined
  close(): void
}): JSX.Element | null {
  if (position === undefined || tools.identity === undefined) return null
  const copyText = tools.copyText
  return (
    <div
      className="dsh-chatroom-context-menu"
      style={{ left: position.x, top: position.y }}
      role="menu"
      onPointerDown={event => { event.stopPropagation() }}
    >
      <div className="dsh-chatroom-context-reactions" aria-label="贴表情">
        {CHATROOM_REACTION_EMOJIS.map(emoji => (
          <button
            type="button"
            key={emoji}
            title={`贴表情 ${emoji}`}
            onClick={() => { void tools.toggleReaction(tools.roomId, tools.message.messageId, emoji); close() }}
          >{emoji}</button>
        ))}
      </div>
      {copyText !== undefined && (
        <button type="button" role="menuitem" onClick={() => { void writeClipboard(copyText); close() }}>
          <span aria-hidden>▣</span> 复制
        </button>
      )}
      {tools.onReply !== undefined && (
        <button type="button" role="menuitem" onClick={() => { tools.onReply?.(); close() }}>
          <span aria-hidden>↩</span> 回复
        </button>
      )}
      <button type="button" role="menuitem" onClick={() => { tools.openForward(tools.roomId, tools.message); close() }}>
        <span aria-hidden>↗</span> 转发
      </button>
      <button type="button" role="menuitem" onClick={() => { tools.toggleSelection(tools.roomId, tools.message); close() }}>
        <span aria-hidden>{tools.selected ? '✓' : '☑'}</span> {tools.selected ? '取消选择' : '多选'}
      </button>
      {tools.onBranch !== undefined && (
        <button type="button" role="menuitem" onClick={() => { tools.onBranch?.(); close() }}>
          <span aria-hidden>⑂</span> 分支
        </button>
      )}
    </div>
  )
}
