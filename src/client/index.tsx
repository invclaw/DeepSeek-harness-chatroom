/** Browser half of the AI chatroom plugin. */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { ChatroomShell } from './ChatroomShell.js'
import { ChatroomClientStore } from './store.js'
import { CHATROOM_STYLES } from './styles.js'

export const inject = ['slots']

/** Register one additive frame overlay and start its React-free room client. */
export function apply(ctx: ClientContext): void {
  const store = new ChatroomClientStore()
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.dshChatroomStyles = ''
    style.textContent = CHATROOM_STYLES
    document.head.append(style)
    void store.start()
    return () => {
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
      resetIdentity: store.resetIdentity,
      send: store.send,
      retry: store.retry,
    }),
  }, ChatroomShell))
}

export default { inject, apply }
