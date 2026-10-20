// @vitest-environment jsdom

import { useSyncExternalStore } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NewGroupSetupDock } from '../src/client/NewGroupSetupDock.js'
import type { ChatroomView } from '../src/client/store.js'

afterEach(() => {
  cleanup()
  document.body.replaceChildren()
})

describe('blank Session mode switch', () => {
  it('defaults to Group and changes modes without opening a group setup form', () => {
    const chooseNewSessionMode = vi.fn(async () => true)
    render(<NewGroupSetupDock {...dockProps('group', chooseNewSessionMode)} />)

    const group = screen.getByRole('button', { name: '群聊' })
    const solo = screen.getByRole('button', { name: 'Solo' })
    expect(group.getAttribute('data-active')).toBe('true')
    expect(solo.getAttribute('data-active')).toBe('false')
    expect(screen.queryByText('群聊名称')).toBeNull()
    expect(screen.queryByText('邀请成员')).toBeNull()

    fireEvent.click(solo)
    expect(chooseNewSessionMode).toHaveBeenCalledWith('native-session', 'solo')
    fireEvent.click(group)
    expect(chooseNewSessionMode).toHaveBeenCalledWith('native-session', 'group')
  })

  it('keeps the mode switch visible when the native welcome content is replaced', () => {
    document.body.innerHTML = `
      <div data-native-composer>
        <div data-native-root>
          <div data-native-stack>
            <div data-native-headline><span>🐋</span><span>探索未至之境</span><span>预览版</span></div>
            <div data-native-body></div>
          </div>
        </div>
        <button aria-label="选择工作区"><span>project-directory</span></button>
      </div>
    `
    const { rerender } = render(<NewGroupSetupDock {...dockProps('group')} />)
    document.querySelector('[data-native-root]')!.replaceChildren(document.createElement('div'))
    rerender(<NewGroupSetupDock {...dockProps('solo')} />)
    expect(screen.getByRole('group', { name: '新会话模式' }).isConnected).toBe(true)
    expect(screen.getByRole('button', { name: 'Solo' }).getAttribute('data-active')).toBe('true')
    expect(screen.getByRole('button', { name: '选择工作区' }).textContent).toBe('project-directory')
  })

  it('registers a blank native Session when the Session list has not reported it yet', () => {
    let snapshot = { newSessionModes: {} } as unknown as ChatroomView
    const listeners = new Set<() => void>()
    const props = dockProps(undefined)
    props.useChatroom = selector => useSyncExternalStore(listener => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    }, () => selector(snapshot))
    const registerNewSession = vi.fn(() => {
      snapshot = { ...snapshot, newSessionModes: { 'native-session': 'group' } }
      for (const listener of listeners) listener()
    })
    render(<NewGroupSetupDock {...props} registerNewSession={registerNewSession} />)

    expect(registerNewSession).toHaveBeenCalledWith('native-session')
    expect(screen.getByRole('group', { name: '新会话模式' }).getAttribute('data-mode')).toBe('group')
  })

  it('stays absent after the Session has messages', () => {
    render(<NewGroupSetupDock {...dockProps('group', undefined, false)} />)
    expect(screen.queryByRole('group', { name: '新会话模式' })).toBeNull()
  })
})

function dockProps(
  mode: 'group' | 'solo' | undefined,
  chooseNewSessionMode = vi.fn(async () => true),
  blank = true,
  registerNewSession = vi.fn(),
): Parameters<typeof NewGroupSetupDock>[0] {
  const snapshot = {
    phase: 'ready',
    newSessionModes: mode === undefined ? {} : { 'native-session': mode },
    room: undefined,
    rooms: [],
    identity: { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' },
  } as unknown as ChatroomView
  return {
    sessionId: 'native-session',
    useSession: (select: (value: { blank: boolean }) => unknown) => select({ blank }),
    useChatroom: (selector: (value: ChatroomView) => unknown) => selector(snapshot),
    registerNewSession,
    newSessionMode: () => mode,
    chooseNewSessionMode,
  } as unknown as Parameters<typeof NewGroupSetupDock>[0]
}
