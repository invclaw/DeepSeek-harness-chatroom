import type { ChatroomThreadPreview } from '../types.js'

/** Quiet, three-message branch activity summary placed beside its root message. */
export function ChatroomThreadActivity({
  preview,
  open,
}: {
  readonly preview: ChatroomThreadPreview | undefined
  open: (() => void) | undefined
}): JSX.Element | null {
  if (preview === undefined) return null
  return (
    <button
      className="dsh-chatroom-thread-activity"
      type="button"
      aria-label={`打开分支，${preview.totalMessages} 条回复`}
      disabled={open === undefined}
      onClick={open}
    >
      <span className="dsh-chatroom-thread-activity-heading">
        <span aria-hidden>⑂</span> 分支 · {preview.totalMessages} 条回复
      </span>
      <span className="dsh-chatroom-thread-activity-list">
        {preview.recentMessages.map(message => (
          <span key={message.id}>
            <strong>{message.displayName}</strong>
            <span>{message.text}</span>
          </span>
        ))}
      </span>
    </button>
  )
}
