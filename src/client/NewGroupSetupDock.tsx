import { useEffect } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ChatroomView } from './store.js'

interface NewGroupSetupInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  registerNewSession(sessionId: string): void
  chooseNewSessionMode(sessionId: string, mode: 'group' | 'solo'): Promise<boolean>
}

type NewGroupSetupDockProps = PropsRuntime<'conversation.input.dock'> & NewGroupSetupInjected

/** Native blank-Session choice between a shared room and one-person Agent work. */
export function NewGroupSetupDock(props: NewGroupSetupDockProps): JSX.Element | null {
  const mode = props.useChatroom(snapshot => snapshot.newSessionModes[String(props.sessionId)])
  const blank = props.useSession(snapshot => snapshot.blank)

  useEffect(() => {
    if (blank && mode === undefined) props.registerNewSession(String(props.sessionId))
  }, [blank, mode, props.registerNewSession, props.sessionId])

  if (!blank || mode === undefined) return null
  const activeMode = mode === 'solo' ? 'solo' : 'group'
  const chooser = (
    <div className="dsh-chatroom-new-mode-switch" data-mode={activeMode} role="group" aria-label="新会话模式">
      <button
        type="button"
        data-active={activeMode === 'group'}
        onClick={() => { void props.chooseNewSessionMode(String(props.sessionId), 'group') }}
      >群聊</button>
      <button
        type="button"
        data-active={activeMode === 'solo'}
        onClick={() => { void props.chooseNewSessionMode(String(props.sessionId), 'solo') }}
      >Solo</button>
    </div>
  )
  return <section className="dsh-chatroom-new-mode" aria-label="选择新会话模式">{chooser}</section>
}
