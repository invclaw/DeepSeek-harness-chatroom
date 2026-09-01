import { useEffect, useRef, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import type { ComposerAttachmentsProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ChatroomReplyReference } from '../types.js'
import { participantMarker } from '../message.js'
import type { ChatroomAgentTarget, ChatroomClientStore, ChatroomView } from './store.js'
import { CHATROOM_MESSAGE_EMOJIS } from './emojis.js'
import { subscribeChatroomDraftRestore } from './draft-restore.js'

interface ChatroomComposerBaseInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  resolveTarget(sessionId: string): ChatroomAgentTarget | undefined
}

interface ChatroomQueueInjected {
  updateQueuedPrompt(
    target: { readonly roomId: string } | { readonly threadId: string },
    messageId: string,
    action: 'guide' | 'delete' | 'edit',
  ): Promise<string | undefined>
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
type ComposerDockProps = PropsRuntime<'conversation.input.dock'> & ChatroomFileInjected & ChatroomQueueInjected
type ComposerRightProps = PropsRuntime<'conversation.input.right'> & ChatroomSessionInjected
type ComposerAttachmentsInjected = ChatroomComposerBaseInjected & Pick<ChatroomFileInjected, 'clearReply'> & {
  nativeAttachmentsView: ComponentType<ComposerAttachmentsProps>
}
export type ChatroomComposerAttachmentsProps = ComposerAttachmentsProps & ComposerAttachmentsInjected

/** Shared emoji chooser used by native room/thread and private composers. */
export function ChatroomEmojiPicker({
  open,
  toggle,
  close,
  pick,
}: {
  readonly open: boolean
  toggle(): void
  close(): void
  pick(emoji: string): void
}): JSX.Element {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close()
    }
    document.addEventListener('pointerdown', dismiss)
    return () => { document.removeEventListener('pointerdown', dismiss) }
  }, [close, open])
  return <div className="dsh-chatroom-composer-actions" ref={root}>
    <button
      className="dsh-chatroom-file-button"
      type="button"
      title="发送表情"
      aria-label="发送表情"
      aria-expanded={open}
      onClick={toggle}
    >
      <span aria-hidden>☺</span>
      <span>表情</span>
    </button>
    {open && <div className="dsh-chatroom-emoji-picker" role="dialog" aria-label="选择表情">
      {CHATROOM_MESSAGE_EMOJIS.map(emoji => <button
        type="button"
        key={emoji}
        aria-label={`插入 ${emoji}`}
        onClick={() => { pick(emoji); close() }}
      >{emoji}</button>)}
    </div>}
  </div>
}

/** Shared reply preview used by native room/thread and private composers. */
export function ChatroomReplyPreview({
  reply,
  clear,
  cancelLabel = '取消回复',
}: {
  readonly reply: ChatroomReplyReference
  readonly cancelLabel?: string
  clear(): void
}): JSX.Element {
  return <div className="dsh-chatroom-reply-preview">
    <button type="button" aria-label={cancelLabel} onClick={clear}>×</button>
    <span><strong>回复 {reply.displayName}：</strong><small>{reply.text}</small></span>
  </div>
}

/** Shared pending-file rail used by native room/thread and private composers. */
export function ChatroomPendingFiles({ files, remove, trailing }: {
  readonly files: readonly { readonly id: string; readonly file: File }[]
  remove(id: string): void
  readonly trailing?: ReactNode
}): JSX.Element {
  return <div className="dsh-chatroom-pending-files">
    {files.map(item => <span className="dsh-chatroom-pending-file" key={item.id}>
      <span aria-hidden>{item.file.type.startsWith('image/') ? '🖼️' : '📎'}</span>
      <span title={item.file.name}>{item.file.name}</span>
      <button type="button" aria-label={`移除 ${item.file.name}`} onClick={() => { remove(item.id) }}>×</button>
    </span>)}
    {trailing}
  </div>
}

/** Small file chooser inside the native composer tool row. */
export function ChatroomFileAction(props: FileActionProps): JSX.Element | null {
  const room = props.useChatroom(snapshot => snapshot)
  const target = props.resolveTarget(String(props.sessionId))
  const active = target?.room
  const input = useRef<HTMLInputElement>(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  if (active === undefined) return null
  return (
    <div className="dsh-chatroom-composer-actions">
      <ChatroomEmojiPicker
        open={emojiOpen}
        toggle={() => { setEmojiOpen(open => !open) }}
        close={() => { setEmojiOpen(false) }}
        pick={emoji => { props.inputActions.setDraft(`${props.input.draft}${emoji}`) }}
      />
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
  useEffect(() => subscribeChatroomDraftRestore(
    String(props.sessionId),
    text => { props.inputActions.setDraft(text) },
  ), [props.inputActions, props.sessionId])
  if (target === undefined) return null
  const active = target.room
  const pendingIds = new Set((room.pendingMessages ?? []).map(message => message.messageId))
  const queued = (props.session?.queue ?? []).filter(item =>
    item.placement === 'queued' && !pendingIds.has(String(item.messageId)))
  const compositionActive = room.composerRoomId === active.id
  const hasFiles = compositionActive && room.pendingFiles.length > 0
  const resetVisible = target?.kind === 'room'
    && active.aiContextResetSeq !== undefined
    && active.aiContextStartSeq === undefined
  if (queued.length === 0 && !hasFiles && !resetVisible && (!compositionActive || room.composerError === undefined)) return null
  const canSendFilesOnly = hasFiles && props.input.draft.trim() === '' && props.input.imageIds.length === 0
  return (
    <div
      className="dsh-chatroom-composer-dock"
      data-testid="chatroom-composer-dock"
      data-dsh-chatroom-queue-dock={queued.length > 0 || undefined}
    >
      {queued.length > 0 && <ChatroomQueuedPromptDock
        queue={queued}
        running={props.session.running}
        guide={async messageId => await props.updateQueuedPrompt(
          target.kind === 'room' ? { roomId: active.id } : { threadId: target.threadId },
          messageId,
          'guide',
        )}
        edit={async messageId => {
          const restored = await props.updateQueuedPrompt(
            target.kind === 'room' ? { roomId: active.id } : { threadId: target.threadId },
            messageId,
            'edit',
          )
          if (restored !== undefined) props.inputActions.setDraft(restored)
        }}
        remove={async messageId => await props.updateQueuedPrompt(
          target.kind === 'room' ? { roomId: active.id } : { threadId: target.threadId },
          messageId,
          'delete',
        )}
      />}
      {resetVisible && <ChatroomContextResetDivider />}
      {hasFiles && (
        <ChatroomPendingFiles
          files={room.pendingFiles}
          remove={itemId => { props.removeFile(active.id, itemId) }}
          trailing={canSendFilesOnly
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
        />
      )}
      {compositionActive && room.composerError !== undefined && <div className="dsh-chatroom-composer-error" role="alert">{room.composerError}</div>}
    </div>
  )
}

function ChatroomQueuedPromptDock({ queue, running, guide, edit, remove }: {
  readonly queue: readonly {
    readonly messageId: unknown
    readonly text: string | null
    readonly preview: ReactNode
  }[]
  readonly running: boolean
  guide(messageId: string): Promise<unknown>
  edit(messageId: string): Promise<void>
  remove(messageId: string): Promise<unknown>
}): JSX.Element {
  const [busyMessageId, setBusyMessageId] = useState<string>()
  const perform = async (messageId: string, action: () => Promise<unknown>) => {
    setBusyMessageId(messageId)
    try { await action() } finally { setBusyMessageId(undefined) }
  }
  return <div className="dsh-chatroom-queued-prompts" aria-label="排队消息">
    {queue.map(item => {
      const messageId = String(item.messageId)
      const busy = busyMessageId === messageId
      return <div className="dsh-chatroom-queued-prompt" key={messageId}>
        <div className="dsh-chatroom-queued-prompt-status">
          <span aria-hidden className="dsh-chatroom-queue-dot" />
          <span>{running ? '正在排队 · 等待当前回复完成' : '等待模型响应'}</span>
        </div>
        <div className="dsh-chatroom-queued-prompt-content">{chatroomQueuedPromptPreview(item.text, item.preview)}</div>
        <div className="dsh-chatroom-queued-prompt-actions">
          <button type="button" disabled={busy || !running} onClick={() => { void perform(messageId, async () => await guide(messageId)) }}>引导对话</button>
          <button type="button" aria-label="编辑排队消息" disabled={busy} onClick={() => { void perform(messageId, async () => { await edit(messageId) }) }}>编辑</button>
          <button type="button" aria-label="删除排队消息" disabled={busy} onClick={() => { void perform(messageId, async () => await remove(messageId)) }}>删除</button>
        </div>
      </div>
    })}
  </div>
}

function chatroomQueuedPromptPreview(text: string | null, preview: ReactNode): ReactNode {
  const normalized = text?.match(/The automatic-response controller selected this chatroom message for an AI response: (.+?)(?:\nChatroom pending source:|$)/s)?.[1]
  if (normalized !== undefined) {
    try {
      const parsed: unknown = JSON.parse(normalized)
      return typeof parsed === 'string' ? parsed : preview
    } catch {
      return preview
    }
  }
  if (text === null) return preview
  const marker = participantMarker(text)
  if (marker === undefined) return preview
  return text.slice(marker.length).replace(/^[^：]{1,80}：/u, '')
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
        <ChatroomReplyPreview reply={reply} clear={() => { props.clearReply(activeRoomId) }} />
      )}
      <NativeAttachmentsView {...props} />
    </>
  )
}

export type { ChatroomClientStore }
