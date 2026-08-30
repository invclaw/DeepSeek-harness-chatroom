import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ChatroomNewSessionMode, ChatroomView } from './store.js'

interface NewGroupSetupInjected {
  useChatroom<T>(selector: (snapshot: ChatroomView) => T): T
  registerNewSession(sessionId: string): void
  newSessionMode(sessionId: string): ChatroomNewSessionMode | undefined
  chooseNewSessionMode(sessionId: string, mode: 'group' | 'solo'): Promise<boolean>
}

type NewGroupSetupDockProps = PropsRuntime<'conversation.input.dock'> & NewGroupSetupInjected

/** Native blank-Session choice between a shared room and one-person Agent work. */
export function NewGroupSetupDock(props: NewGroupSetupDockProps): JSX.Element | null {
  const view = props.useChatroom(snapshot => snapshot)
  const mode = props.newSessionMode(String(props.sessionId))
  const [nativeHeroBody, setNativeHeroBody] = useState<HTMLElement>()
  const blank = props.session.composerPhase === 'blank' && props.session.nodes.length === 0

  useEffect(() => {
    if (blank && mode === undefined) props.registerNewSession(String(props.sessionId))
  }, [blank, mode, props.registerNewSession, props.sessionId])

  useEffect(() => {
    if (!blank || view.branchFrame !== undefined) return
    const headlineText = [...document.querySelectorAll<HTMLElement>('span')]
      .find(element => element.textContent?.trim() === '探索未至之境')
    const headline = headlineText?.parentElement
    const stack = headline?.parentElement
    const body = headline?.nextElementSibling
    if (!(body instanceof HTMLElement) || headlineText === undefined || stack === null || stack === undefined) return
    const originalHeadline = headlineText.textContent
    headlineText.textContent = '今天有什么工作要处理？'
    stack.setAttribute('data-dsh-chatroom-new-session-hero', '')
    body.setAttribute('data-dsh-chatroom-new-session-switch-host', '')
    setNativeHeroBody(body)
    return () => {
      headlineText.textContent = originalHeadline
      stack.removeAttribute('data-dsh-chatroom-new-session-hero')
      body.removeAttribute('data-dsh-chatroom-new-session-switch-host')
    }
  }, [blank, props.sessionId, view.branchFrame])

  if (!blank || view.branchFrame !== undefined || mode === undefined) return null
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
  return nativeHeroBody === undefined
    ? <section className="dsh-chatroom-new-mode" aria-label="选择新会话模式">{chooser}</section>
    : createPortal(chooser, nativeHeroBody)
}
