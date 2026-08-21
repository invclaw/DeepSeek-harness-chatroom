/** Browser half of the AI chatroom plugin. */

import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type { ClientContext, ISessions, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { ChatroomEntry } from './ChatroomEntry.js'
import { installNativePromptIdentity } from './native-prompt.js'
import { RoomIdentityAction } from './RoomIdentityAction.js'
import { ChatroomClientStore } from './store.js'
import { CHATROOM_STYLES } from './styles.js'

export const inject = ['connection', 'sessions', 'slots']

/** Add room identity and navigation around the existing Harness conversation UI. */
export function apply(ctx: ClientContext): void {
  const connection = ctx.get('connection') as ConnectionHandle | undefined
  if (connection === undefined) throw new Error('chatroom: client connection service unavailable')
  const sessions = ctx.get('sessions') as ISessions | undefined
  if (sessions === undefined) throw new Error('chatroom: client sessions service unavailable')
  const store = new ChatroomClientStore((rawSessionId) => {
    const sessionId = rawSessionId as SessionId
    if (sessions.list.getSnapshot().byId[sessionId] === undefined) return false
    sessions.open(sessionId)
    return true
  })
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.dshChatroomStyles = ''
    style.textContent = CHATROOM_STYLES
    document.head.append(style)
    const restorePrompt = installNativePromptIdentity(connection.api, store)
    const unsubscribeSessions = sessions.list.subscribe(store.resumeOpen)
    void store.start()
    return () => {
      unsubscribeSessions()
      restorePrompt()
      store.stop()
      style.remove()
    }
  }, 'chatroom: browser state and styles')

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'chatroom',
    order: 0,
    inject: () => ({
      hooks: { chatroom: store },
      openRoom: store.openRoom,
      closeRoom: store.closeRoom,
      join: store.join,
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
      resetIdentity: store.resetIdentity,
    }),
  }, RoomIdentityAction))
}

export default { inject, apply }
