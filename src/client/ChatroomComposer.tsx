import { useEffect, useRef, useState } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ChatroomReplyReference } from '../types.js'
import type { ChatroomAgentTarget, ChatroomClientStore, ChatroomView } from './store.js'

interface ChatroomComposerInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  addFiles(roomId: string, files: readonly File[]): void
  removeFile(roomId: string, fileId: string): void
  clearReply(roomId: string): void
  sendFiles(roomId: string): Promise<void>
  resolveTarget(sessionId: string): ChatroomAgentTarget | undefined
}

type FileActionProps = PropsRuntime<'conversation.input.left'> & ChatroomComposerInjected
type ComposerDockProps = PropsRuntime<'conversation.input.dock'> & ChatroomComposerInjected

const MESSAGE_EMOJIS = ['😀', '😄', '😂', '🥰', '😍', '🤔', '😮', '😭', '😡', '👍', '👏', '🙏', '🎉', '❤️', '🔥', '✨', '✅', '👀'] as const

/** Small file chooser inside the native composer tool row. */
export function ChatroomFileAction(props: FileActionProps): JSX.Element | null {
  const room = props.useChatroom(snapshot => snapshot)
  const target = props.resolveTarget(String(props.sessionId))
  const active = target?.room
  const input = useRef<HTMLInputElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  useEffect(() => {
    if (!emojiOpen) return
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setEmojiOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => { document.removeEventListener('pointerdown', close) }
  }, [emojiOpen])
  if (active === undefined) return null
  return (
    <div className="dsh-chatroom-composer-actions" ref={root}>
      <button
        className="dsh-chatroom-file-button"
        type="button"
        title="发送表情"
        aria-label="发送表情"
        aria-expanded={emojiOpen}
        onClick={() => { setEmojiOpen(open => !open) }}
      >
        <span aria-hidden>☺</span>
        <span>表情</span>
      </button>
      {emojiOpen && (
        <div className="dsh-chatroom-emoji-picker" role="dialog" aria-label="选择表情">
          {MESSAGE_EMOJIS.map(emoji => (
            <button
              type="button"
              key={emoji}
              aria-label={`插入 ${emoji}`}
              onClick={() => {
                props.inputActions.setDraft(`${props.input.draft}${emoji}`)
                setEmojiOpen(false)
              }}
            >{emoji}</button>
          ))}
        </div>
      )}
      <button
        className="dsh-chatroom-file-button"
        type="button"
        title="发送图片或文件"
        aria-label="发送图片或文件"
        onClick={() => { input.current?.click() }}
      >
        <span aria-hidden>📎</span>
        <span>附件</span>
      </button>
      <input
        ref={input}
        className="dsh-chatroom-file-input"
        data-testid="chatroom-file-input"
        type="file"
        multiple
        onChange={(event) => {
          const files = event.currentTarget.files
          if (files !== null) props.addFiles(active.id, [...files])
          event.currentTarget.value = ''
        }}
      />
    </div>
  )
}

/** Reply quote and pending file rail above the native composer. */
export function ChatroomComposerDock(props: ComposerDockProps): JSX.Element | null {
  const room = props.useChatroom(snapshot => snapshot)
  const target = props.resolveTarget(String(props.sessionId))
  const active = target?.room
  if (active === undefined || room.composerRoomId !== active.id) return null
  const hasFiles = room.pendingFiles.length > 0
  if (!hasFiles && room.reply === undefined && room.composerError === undefined) return null
  const canSendFilesOnly = hasFiles && props.input.draft.trim() === '' && props.input.imageIds.length === 0
  return (
    <div className="dsh-chatroom-composer-dock" data-testid="chatroom-composer-dock">
      {room.reply !== undefined && <ReplyPreview reply={room.reply} clear={() => { props.clearReply(active.id) }} />}
      {hasFiles && (
        <div className="dsh-chatroom-pending-files">
          {room.pendingFiles.map(item => (
            <span className="dsh-chatroom-pending-file" key={item.id}>
              <span aria-hidden>{item.file.type.startsWith('image/') ? '🖼️' : '📎'}</span>
              <span title={item.file.name}>{item.file.name}</span>
              <button type="button" aria-label={`移除 ${item.file.name}`} onClick={() => { props.removeFile(active.id, item.id) }}>×</button>
            </span>
          ))}
          {canSendFilesOnly
            ? (
              <button
                className="dsh-chatroom-send-files"
                type="button"
                disabled={room.composerBusy}
                onClick={() => { void props.sendFiles(active.id) }}
              >
                {room.composerBusy ? '正在发送…' : '发送'}
              </button>
            )
            : <small className="dsh-chatroom-file-hint">文件将随当前消息发送</small>}
        </div>
      )}
      {room.composerError !== undefined && <div className="dsh-chatroom-composer-error" role="alert">{room.composerError}</div>}
    </div>
  )
}

function ReplyPreview({ reply, clear }: { reply: ChatroomReplyReference; clear(): void }): JSX.Element {
  return (
    <div className="dsh-chatroom-reply-preview">
      <span>
        <strong>回复 {reply.displayName}</strong>
        <small>{reply.text}</small>
      </span>
      <button type="button" aria-label="取消回复" onClick={clear}>×</button>
    </div>
  )
}

export type { ChatroomClientStore }
