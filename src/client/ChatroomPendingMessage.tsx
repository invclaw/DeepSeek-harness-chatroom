import { useState } from 'react'
import type { ChatroomForwardItem, ChatroomPendingMessage } from '../types.js'
import { CHATROOM_API_PREFIX } from '../routes.js'
import { ChatroomAvatar } from './ChatroomAvatar.js'
import { ChatroomLinkedText } from './ChatroomLinkedText.js'
import { ChatroomMessageFrame } from './ChatroomMessageFrame.js'
import { restoreChatroomDraft } from './draft-restore.js'

export interface ChatroomPendingMessageProps {
  readonly message: ChatroomPendingMessage
  readonly own: boolean
  readonly sessionId: string
  update(
    target: { readonly roomId: string },
    messageId: string,
    action: 'guide' | 'delete' | 'edit',
  ): Promise<string | undefined>
}

/** Immediately shared participant bubble whose AI admission is still mutable. */
export function ChatroomPendingMessageView(props: ChatroomPendingMessageProps): JSX.Element {
  const { message } = props
  const [busy, setBusy] = useState(false)
  const target = { roomId: message.roomId }
  const forwardItem: ChatroomForwardItem = {
    messageId: message.messageId,
    role: 'human',
    displayName: message.displayName,
    text: message.text,
    createdAt: message.createdAt,
    content: message.content,
    ...(message.reply === undefined ? {} : { reply: message.reply }),
    ...(message.forward === undefined ? {} : { forward: message.forward }),
  }
  const perform = async (action: 'guide' | 'delete' | 'edit') => {
    setBusy(true)
    try {
      const text = await props.update(target, message.messageId, action)
      if (action === 'edit' && text !== undefined) restoreChatroomDraft(props.sessionId, text)
    } finally {
      setBusy(false)
    }
  }
  return <ChatroomMessageFrame
    className="dsh-chatroom-pending-message"
    own={props.own}
    avatar={<ChatroomAvatar avatarId={message.avatarId} avatarUrl={message.avatarUrl} seed={message.participantId} />}
    displayName={message.displayName}
    reply={message.reply}
    tools={{
      roomId: message.roomId,
      message: forwardItem,
      reactions: [],
      identity: undefined,
      selecting: false,
      selected: false,
      recalled: false,
      canRecall: false,
      copyText: message.text,
      toggleReaction: async () => undefined,
      openForward: () => undefined,
      toggleSelection: () => undefined,
      recallMessage: async () => false,
    }}
    body={<>
      <ChatroomLinkedText className="dsh-chatroom-human-bubble" text={message.text} />
      {message.content.flatMap((part, index) => {
        if (part.type === 'text') return []
        if (part.type === 'file') return [<a
          className="dsh-chatroom-file-card"
          href={`${CHATROOM_API_PREFIX}/files/${encodeURIComponent(part.file.id)}`}
          download={part.file.name}
          key={`${part.file.id}:${index}`}
        ><span aria-hidden>📎</span><strong>{part.file.name}</strong><span aria-hidden>↓</span></a>]
        return [<span className="dsh-chatroom-pending-image" key={`${part.image.attachmentId}:${index}`}>🖼️ 图片已发送</span>]
      })}
    </>}
    footer={message.status === 'passive' ? undefined : <div className="dsh-chatroom-pending-control" role="status">
      <span><i aria-hidden />{pendingStatus(message.status)}</span>
      {props.own && message.status !== 'guiding' && <span className="dsh-chatroom-pending-actions">
        <button type="button" disabled={busy} onClick={() => { void perform('guide') }}>引导</button>
        <button type="button" disabled={busy} onClick={() => { void perform('edit') }}>编辑</button>
        <button type="button" disabled={busy} onClick={() => { void perform('delete') }}>撤回</button>
      </span>}
    </div>}
  />
}

function pendingStatus(status: ChatroomPendingMessage['status']): string {
  switch (status) {
    case 'deciding': return '正在判断是否需要 AI 回复'
    case 'queued': return '正在排队 · 等待当前回复完成'
    case 'guiding': return '正在引导当前回复'
    case 'passive': return ''
  }
}
