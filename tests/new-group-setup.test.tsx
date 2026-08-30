// @vitest-environment jsdom

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

  it('reuses the native Harness welcome hero', () => {
    document.body.innerHTML = `
      <div data-native-stack>
        <div data-native-headline><span>🐋</span><span>探索未至之境</span><span>预览版</span></div>
        <div data-native-body></div>
      </div>
    `
    const { unmount } = render(<NewGroupSetupDock {...dockProps('group')} />)

    expect(screen.getByText('今天有什么工作要处理？')).toBeTruthy()
    expect(document.querySelector('[data-native-body] [aria-label="新会话模式"]')).toBeTruthy()
    expect(document.querySelector('[data-dsh-chatroom-new-session-hero]')).toBeTruthy()

    unmount()
    expect(screen.getByText('探索未至之境')).toBeTruthy()
  })

  it('registers a blank native Session when the Session list has not reported it yet', () => {
    const registerNewSession = vi.fn()
    render(<NewGroupSetupDock {...dockProps(undefined, undefined, true, registerNewSession)} />)

    expect(registerNewSession).toHaveBeenCalledWith('native-session')
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
    room: undefined,
    rooms: [],
    identity: { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' },
  } as unknown as ChatroomView
  return {
    sessionId: 'native-session',
    session: { composerPhase: blank ? 'blank' : 'ready', nodes: blank ? [] : [{}] },
    useChatroom: (selector: (value: ChatroomView) => unknown) => selector(snapshot),
    registerNewSession,
    newSessionMode: () => mode,
    chooseNewSessionMode,
  } as unknown as Parameters<typeof NewGroupSetupDock>[0]
}
