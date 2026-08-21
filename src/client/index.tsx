/** Browser half of the AI chatroom plugin. */

import type { ComponentType } from 'react'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type { ClientContext, ISessions, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { InputTriggerServiceContract, InputTriggerSource } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { ChatroomEntry } from './ChatroomEntry.js'
import { ChatroomAssistantReplyAction } from './ChatroomAssistantReplyAction.js'
import { ChatroomComposerDock, ChatroomFileAction } from './ChatroomComposer.js'
import {
  ChatroomSteeringMessageNodeView,
  ChatroomUserMessageNodeView,
} from './ChatroomMessageNodeView.js'
import { installNativePromptIdentity } from './native-prompt.js'
import { RoomIdentityAction } from './RoomIdentityAction.js'
import { ChatroomClientStore } from './store.js'
import { CHATROOM_STYLES } from './styles.js'

export const inject = ['connection', 'inputTriggers', 'sessions', 'slots']

/** Add room identity and navigation around the existing Harness conversation UI. */
export function apply(ctx: ClientContext): void {
  const connection = ctx.get('connection') as ConnectionHandle | undefined
  if (connection === undefined) throw new Error('chatroom: client connection service unavailable')
  const sessions = ctx.get('sessions') as ISessions | undefined
  if (sessions === undefined) throw new Error('chatroom: client sessions service unavailable')
  const inputTriggers = ctx.get('inputTriggers') as InputTriggerServiceContract | undefined
  if (inputTriggers === undefined) throw new Error('chatroom: input trigger service unavailable')
  const store = new ChatroomClientStore((rawSessionId) => {
    const sessionId = rawSessionId as SessionId
    const list = sessions.list.getSnapshot()
    if (list.current === sessionId) return true
    if (list.byId[sessionId] === undefined) return false
    sessions.open(sessionId)
    return true
  })
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.dshChatroomStyles = ''
    style.textContent = CHATROOM_STYLES
    document.head.append(style)
    const restorePrompt = installNativePromptIdentity(connection.api, store)
    const syncSession = () => {
      store.resumeOpen()
      const current = sessions.list.getSnapshot().current
      store.activateSession(current === undefined ? undefined : String(current))
    }
    const unsubscribeSessions = sessions.list.subscribe(syncSession)
    void store.start().then(syncSession)
    return () => {
      unsubscribeSessions()
      restorePrompt()
      store.stop()
      style.remove()
    }
  }, 'chatroom: browser state and styles')

  const aiSource = createChatroomAiSource(store)
  ctx.effect(() => inputTriggers.registerSource(aiSource), 'chatroom: @AI input source')

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'chatroom',
    order: 0,
    inject: () => ({
      hooks: { chatroom: store },
      openRoom: store.openRoom,
      closeRoom: store.closeRoom,
      join: store.join,
      selectRoom: store.selectRoom,
      createRoom: store.createRoom,
      resetIdentity: store.resetIdentity,
      retry: store.retry,
    }),
  }, ChatroomEntry))

  ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
    name: 'conversation.session.header.actions',
    id: 'chatroom-identity',
    order: -5,
    inject: () => ({
      hooks: { chatroom: store },
      openRoom: store.openRoom,
    }),
  }, RoomIdentityAction))

  ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
    name: 'conversation.input.left',
    id: 'chatroom-files',
    order: -20,
    inject: () => ({
      hooks: { chatroom: store },
      addFiles: store.addFiles,
      removeFile: store.removeFile,
      clearReply: store.clearReply,
      sendFiles: store.sendFiles,
    }),
  }, ChatroomFileAction))

  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'chatroom-composition',
    order: -20,
    inject: () => ({
      hooks: { chatroom: store },
      addFiles: store.addFiles,
      removeFile: store.removeFile,
      clearReply: store.clearReply,
      sendFiles: store.sendFiles,
    }),
  }, ChatroomComposerDock))

  ctx.slots.inject('conversation.chat.assistant-actions', () => ctx.slots.register({
    name: 'conversation.chat.assistant-actions',
    id: 'chatroom-reply',
    order: 5,
    inject: () => ({ hooks: { chatroom: store }, setReply: store.setReply }),
  }, ChatroomAssistantReplyAction))

  ctx.slots.inject('conversation.chat.node', () => {
    const nativeEntry = ctx.slots.entries('conversation.chat.node').find(entry =>
      entry.options.key === 'user' && (entry.options.priority ?? 0) === 0)
    if (nativeEntry === undefined) throw new Error('chatroom: native user message renderer unavailable')
    const nativeMessageView = nativeEntry.component as ComponentType<ChatNodeViewProps<'user'>>
    return ctx.slots.register({
      name: 'conversation.chat.node',
      key: 'user',
      priority: -10,
      locale: 'conversation',
      inject: () => ({ hooks: { chatroom: store }, nativeMessageView, setReply: store.setReply }),
    }, ChatroomUserMessageNodeView)
  })

  ctx.slots.inject('conversation.chat.node', () => {
    const nativeEntry = ctx.slots.entries('conversation.chat.node').find(entry =>
      entry.options.key === 'steering' && (entry.options.priority ?? 0) === 0)
    if (nativeEntry === undefined) throw new Error('chatroom: native steering message renderer unavailable')
    const nativeMessageView = nativeEntry.component as ComponentType<ChatNodeViewProps<'steering'>>
    return ctx.slots.register({
      name: 'conversation.chat.node',
      key: 'steering',
      priority: -10,
      locale: 'conversation',
      inject: () => ({ hooks: { chatroom: store }, nativeMessageView, setReply: store.setReply }),
    }, ChatroomSteeringMessageNodeView)
  })
}

/** Build the room-scoped source contributed to RC7's native @ menu. */
export function createChatroomAiSource(store: ChatroomClientStore): InputTriggerSource {
  return {
    trigger: '@',
    name: 'AI',
    order: -100,
    candidates(session, { query }) {
      const room = store.roomForSession(String(session.sessionId))
      if (room === undefined) return Promise.resolve([])
      const names = [...new Set(['AI', room.aiDisplayName])]
      const needle = query.toLocaleLowerCase()
      return Promise.resolve(names
        .filter(name => name.toLocaleLowerCase().includes(needle))
        .map(name => ({ name, icon: '✦', description: '提及后触发 AI 回复' })))
    },
    lexicon(session) {
      const room = store.roomForSession(String(session.sessionId))
      return room === undefined ? [] : [...new Set(['AI', room.aiDisplayName])]
    },
    subscribeLexicon(_session, listener) {
      return store.subscribe(listener)
    },
    onPick({ candidate }) {
      return { text: `@${candidate.name} ` }
    },
  }
}

export default { inject, apply }
