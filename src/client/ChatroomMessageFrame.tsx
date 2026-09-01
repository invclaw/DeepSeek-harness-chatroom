import { type ReactNode, type Ref } from 'react'
import type { ChatroomReplyReference } from '../types.js'
import {
  ChatroomInlineMessageActions,
  ChatroomMessageContextMenu,
  ChatroomReactionBar,
  ChatroomSelectionCheckbox,
  useChatroomMessageMenu,
  type ChatroomMessageToolsProps,
} from './ChatroomMessageTools.js'
import {
  activateGroupedMessageActions,
  restoreGroupedMessageActions,
  type ChatroomMessageGroupPosition,
} from './message-grouping.js'

/** Shared participant-message chrome used by Group, branch, and Direct transcripts. */
export function ChatroomMessageFrame({
  rootRef,
  className,
  own,
  role = 'human',
  groupPosition,
  actionGroup,
  avatar,
  displayName,
  reply,
  body,
  footer,
  tools,
}: {
  readonly rootRef?: Ref<HTMLDivElement> | undefined
  readonly className?: string | undefined
  readonly own: boolean
  readonly role?: 'human' | 'ai' | undefined
  readonly groupPosition?: ChatroomMessageGroupPosition | undefined
  readonly actionGroup?: string | undefined
  readonly avatar: ReactNode
  readonly displayName?: string | undefined
  readonly reply?: ChatroomReplyReference | undefined
  readonly body: ReactNode
  readonly footer?: ReactNode | undefined
  readonly tools: ChatroomMessageToolsProps
}): JSX.Element {
  const menu = useChatroomMessageMenu()
  const actionsVisible = groupPosition === undefined || groupPosition === 'single' || groupPosition === 'end'
  return <div
    ref={rootRef}
    className={['dsh-chatroom-participant-message', className].filter(Boolean).join(' ')}
    data-dsh-chatroom-message-id={tools.message.messageId}
    data-dsh-chatroom-own={own}
    data-own={own}
    data-role={role}
    data-dsh-chatroom-group-position={groupPosition}
    data-dsh-chatroom-action-group={actionGroup}
    data-dsh-chatroom-actions-visible={actionsVisible}
    data-dsh-chatroom-selection-mode={tools.selecting || undefined}
    data-dsh-chatroom-selected={tools.selected || undefined}
    onPointerEnter={event => { activateGroupedMessageActions(event.currentTarget) }}
    onPointerLeave={event => { restoreGroupedMessageActions(event.currentTarget) }}
    onContextMenu={menu.open}
  >
    <ChatroomSelectionCheckbox tools={tools} />
    {avatar}
    <div className="dsh-chatroom-message-column">
      {displayName !== undefined && <div className="dsh-chatroom-display-name">{displayName}</div>}
      {!tools.recalled && reply !== undefined && <div className="dsh-chatroom-reply-quote">
        <strong>回复 {reply.displayName}</strong><span>{reply.text}</span>
      </div>}
      {body}
      <ChatroomReactionBar {...tools} />
      {footer}
      <ChatroomInlineMessageActions tools={tools} showTime />
    </div>
    <ChatroomMessageContextMenu tools={tools} position={menu.position} close={menu.close} />
  </div>
}
