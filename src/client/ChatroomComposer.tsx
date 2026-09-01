import { useEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import type { ComposerAttachmentsProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ChatroomReplyReference } from '../types.js'
import type { ChatroomAgentTarget, ChatroomClientStore, ChatroomView } from './store.js'
import { CHATROOM_MESSAGE_EMOJIS } from './emojis.js'

interface ChatroomComposerBaseInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  resolveTarget(sessionId: string): ChatroomAgentTarget | undefined
}

interface ChatroomFileInjected extends ChatroomComposerBaseInjected {
  addFiles(roomId: string, files: readonly File[]): void
  removeFile(roomId: string, fileId: string): void
  clearReply(roomId: string): void
  sendFiles(roomId: string): Promise<void>
}

interface ChatroomSessionInjected extends ChatroomComposerBaseInjected {
  stopRoomSession(roomId: string): Promise<boolean>
  newRoomSession(roomId: string): Promise<boolean>
  quickMeeting(roomId: string): Promise<boolean>
  quickThreadMeeting(threadId: string): Promise<boolean>
}

type FileActionProps = PropsRuntime<'conversation.input.left'> & ChatroomFileInjected
type ComposerDockProps = PropsRuntime<'conversation.input.dock'> & ChatroomFileInjected
type ComposerRightProps = PropsRuntime<'conversation.input.right'> & ChatroomSessionInjected
type ComposerAttachmentsInjected = ChatroomComposerBaseInjected & Pick<ChatroomFileInjected, 'clearReply'> & {
  nativeAttachmentsView: ComponentType<ComposerAttachmentsProps>
}
export type ChatroomComposerAttachmentsProps = ComposerAttachmentsProps & ComposerAttachmentsInjected

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
          {CHATROOM_MESSAGE_EMOJIS.map(emoji => (
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

/** Native-composer controls for stopping work or rotating the room Session. */
export function ChatroomSessionControls(props: ComposerRightProps): JSX.Element | null {
  const room = props.useChatroom(snapshot => snapshot)
  const target = props.resolveTarget(String(props.sessionId))
  if (target === undefined) return null
  return (
    <div className="dsh-chatroom-session-controls">
      {target.kind === 'room' && <>
        <button
          type="button"
          disabled={!props.session.running || room.sessionControlBusy}
          onClick={() => { void props.stopRoomSession(target.room.id) }}
        >■ 停止</button>
        <button
          type="button"
          disabled={room.sessionControlBusy}
          onClick={() => { void props.newRoomSession(target.room.id) }}
        >＋ 新会话</button>
      </>}
      <button
        type="button"
        className="dsh-chatroom-quick-meeting"
        disabled={room.wecomBusy}
        onClick={() => {
          void (target.kind === 'room'
            ? props.quickMeeting(target.room.id)
            : props.quickThreadMeeting(target.threadId))
        }}
      >⚡ 快速会议</button>
      {room.sessionControlError !== undefined && (
        <span className="dsh-chatroom-control-error" role="alert" title={room.sessionControlError}>{room.sessionControlError}</span>
      )}
      {room.wecomError !== undefined && (
        <span className="dsh-chatroom-control-error" role="alert" title={room.wecomError}>{room.wecomError}</span>
      )}
    </div>
  )
}

/** Pending file rail above the native composer. */
export function ChatroomComposerDock(props: ComposerDockProps): JSX.Element | null {
  const room = props.useChatroom(snapshot => snapshot)
  const target = props.resolveTarget(String(props.sessionId))
  const active = target?.room
  if (active === undefined) return null
  const compositionActive = room.composerRoomId === active.id
  const hasFiles = compositionActive && room.pendingFiles.length > 0
  const resetVisible = target?.kind === 'room'
    && active.aiContextResetSeq !== undefined
    && active.aiContextStartSeq === undefined
  if (!hasFiles && !resetVisible && (!compositionActive || room.composerError === undefined)) return null
  const canSendFilesOnly = hasFiles && props.input.draft.trim() === '' && props.input.imageIds.length === 0
  return (
    <div className="dsh-chatroom-composer-dock" data-testid="chatroom-composer-dock">
      {resetVisible && <ChatroomContextResetDivider />}
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
      {compositionActive && room.composerError !== undefined && <div className="dsh-chatroom-composer-error" role="alert">{room.composerError}</div>}
    </div>
  )
}

/** Persistent visual boundary between retained room history and a fresh AI context. */
export function ChatroomContextResetDivider(): JSX.Element {
  return <div className="dsh-chatroom-context-reset" role="status">
    <span>新的 AI 会话</span><small>此前群聊消息继续保留</small>
  </div>
}

/** Native attachment renderer plus an in-card reply preview for shared sessions. */
export function ChatroomComposerAttachments(props: ChatroomComposerAttachmentsProps): JSX.Element {
  const room = props.useChatroom(snapshot => snapshot)
  const target = props.resolveTarget(String(props.sessionId))
  const active = target?.room
  const activeRoomId = active?.id
  const NativeAttachmentsView = props.nativeAttachmentsView
  const reply = activeRoomId !== undefined && room.composerRoomId === activeRoomId ? room.reply : undefined
  return (
    <>
      {reply !== undefined && activeRoomId !== undefined && (
        <ReplyPreview reply={reply} clear={() => { props.clearReply(activeRoomId) }} />
      )}
      <NativeAttachmentsView {...props} />
    </>
  )
}

function ReplyPreview({ reply, clear }: { reply: ChatroomReplyReference; clear(): void }): JSX.Element {
  return (
    <div className="dsh-chatroom-reply-preview">
      <button type="button" aria-label="取消回复" onClick={clear}>×</button>
      <span>
        <strong>回复 {reply.displayName}：</strong>
        <small>{reply.text}</small>
      </span>
    </div>
  )
}

export type { ChatroomClientStore }
