import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { CHATROOM_REACTION_EMOJIS, type ChatroomReactionEmoji } from '../reactions.js'
import type { ChatroomForwardItem, ChatroomIdentity, ChatroomReaction } from '../types.js'

export interface ChatroomMessageToolsProps {
  readonly roomId: string
  readonly message: ChatroomForwardItem
  readonly reactions: readonly ChatroomReaction[]
  readonly identity: ChatroomIdentity | undefined
  readonly selected: boolean
  toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void>
  openForward(roomId: string, message: ChatroomForwardItem): void
  toggleSelection(roomId: string, message: ChatroomForwardItem): void
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
        y: Math.max(8, Math.min(event.clientY, globalThis.innerHeight - 168)),
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
      <button type="button" role="menuitem" onClick={() => { tools.openForward(tools.roomId, tools.message); close() }}>
        <span aria-hidden>↗</span> 转发
      </button>
      <button type="button" role="menuitem" onClick={() => { tools.toggleSelection(tools.roomId, tools.message); close() }}>
        <span aria-hidden>{tools.selected ? '✓' : '☑'}</span> {tools.selected ? '取消选择' : '多选'}
      </button>
    </div>
  )
}
