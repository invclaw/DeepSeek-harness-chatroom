// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  branchFrameDocumentReady,
  branchFrameFromLocation,
  branchFrameSwitchFromMessage,
  branchFrameTarget,
  branchFrameUrl,
  invitedRoomFromLocation,
  notifyBranchFrameReady,
  prepareBranchFrameSelection,
  restoreParentSessionSelection,
  sameBranchFrame,
  stageBranchFrameSession,
  switchBranchFrame,
} from '../src/client/branch-frame.js'
import { CHATROOM_STYLES } from '../src/client/styles.js'

beforeEach(() => {
  history.replaceState({}, '', '/private-entry/?keep=1#old')
  localStorage.clear()
  document.documentElement.removeAttribute('data-dsh-chatroom-branch-session-ready')
  document.body.replaceChildren()
})

describe('native branch frame isolation', () => {
  it('round-trips the branch and parent Sessions through a same-origin Harness URL', () => {
    const href = branchFrameUrl({
      id: 'thread-id',
      roomId: 'room-id',
      sessionId: 'chatroom-thread-v1-thread-id',
      createdAt: 1,
      root: { messageId: 'user:1', displayName: 'Alice', text: '主题', role: 'human' },
    }, 'chatroom-v1-room-id', 'frame-load-2')
    const url = new URL(href)

    expect(url.pathname).toBe('/private-entry/')
    expect(url.searchParams.get('keep')).toBe('1')
    expect(url.searchParams.get('dsh-chatroom-frame-load')).toBe('frame-load-2')
    expect(url.hash).toBe('')
    expect(branchFrameFromLocation({ search: url.search } as Location)).toEqual({
      threadId: 'thread-id',
      roomId: 'room-id',
      sessionId: 'chatroom-thread-v1-thread-id',
      parentSessionId: 'chatroom-v1-room-id',
    })
  })

  it('waits for the intended Session marker and native composer before exposing the frame', () => {
    const frame = {
      threadId: 'thread', roomId: 'room', sessionId: 'branch-session', parentSessionId: 'parent-session',
    }
    const rootText = `${'猫'.repeat(40)}不会进入原生标题`
    document.body.innerHTML = `<main data-dsh-chatroom-branch-shell><nav></nav><section><header>分支：${'猫'.repeat(18)}</header></section><aside></aside></main>`
    notifyBranchFrameReady(frame)
    expect(branchFrameDocumentReady(document, frame.sessionId, rootText)).toBe(false)

    document.querySelector('section')!.insertAdjacentHTML('beforeend', '<textarea></textarea>')
    expect(branchFrameDocumentReady(document, frame.sessionId, rootText)).toBe(true)
    expect(branchFrameDocumentReady(document, 'another-session', rootText)).toBe(false)
    expect(branchFrameDocumentReady(document, frame.sessionId, '不同的主题')).toBe(false)
  })

  it('switches one retained native runtime to another branch target', () => {
    const thread = {
      id: 'thread-id', roomId: 'room-id', sessionId: 'chatroom-thread-v1-thread-id', createdAt: 1,
      root: { messageId: 'assistant:1', displayName: 'DeepSeek', text: '较长的 AI 回复', role: 'ai' as const },
    }
    const frame = branchFrameTarget(thread, 'chatroom-v1-room-id')
    const postMessage = vi.fn()
    switchBranchFrame({ postMessage } as unknown as Window, frame)
    expect(postMessage).toHaveBeenCalledWith({ type: 'dsh-chatroom-branch-switch', frame }, location.origin)
    expect(branchFrameSwitchFromMessage(postMessage.mock.calls[0]?.[0])).toEqual(frame)
    expect(branchFrameSwitchFromMessage({ type: 'dsh-chatroom-branch-switch', frame: { ...frame, sessionId: '' } })).toBeUndefined()
    expect(sameBranchFrame(frame, { ...frame })).toBe(true)
    expect(sameBranchFrame(frame, { ...frame, threadId: 'another-thread' })).toBe(false)
  })

  it('rejects partial frame addresses and restores the parent selection', () => {
    expect(branchFrameFromLocation({ search: '?dsh-chatroom-thread=thread-id' } as Location)).toBeUndefined()

    prepareBranchFrameSelection('chatroom-thread-v1-thread')
    expect(JSON.parse(localStorage.getItem('dsh.sessions.current')!)).toEqual({
      sessionId: 'chatroom-thread-v1-thread',
    })
    restoreParentSessionSelection('chatroom-v1-parent')
    expect(JSON.parse(localStorage.getItem('dsh.sessions.current')!)).toEqual({
      sessionId: 'chatroom-v1-parent',
    })
  })

  it('does not navigate an isolated branch runtime back to its parent room', () => {
    const location = { search: '?dsh-chatroom-room=room-id' } as Location
    expect(invitedRoomFromLocation(location, undefined)).toBe('room-id')
    expect(invitedRoomFromLocation(location, {
      threadId: 'thread-id',
      roomId: 'room-id',
      sessionId: 'chatroom-thread-v1-thread-id',
      parentSessionId: 'chatroom-v1-room-id',
    })).toBeUndefined()
  })

  it('waits for asynchronous native navigation before staging the branch', () => {
    const frame = {
      threadId: 'thread', roomId: 'room', sessionId: 'branch-session', parentSessionId: 'parent-session',
    }
    const open = vi.fn()
    expect(stageBranchFrameSession(frame, {
      current: 'parent-session', byId: { 'branch-session': {} },
    }, open)).toBe(false)
    expect(open).toHaveBeenCalledWith('branch-session')

    expect(stageBranchFrameSession(frame, {
      current: 'branch-session', byId: { 'branch-session': {} },
    }, open)).toBe(true)
    expect(open).toHaveBeenCalledOnce()
  })

  it('collapses native message actions in every active shared Session', () => {
    expect(CHATROOM_STYLES).toContain(
      'html[data-dsh-chatroom-active] [data-time-hover-root] > :last-child > button { display: none !important; }',
    )
    expect(CHATROOM_STYLES).toContain(
      'html[data-dsh-chatroom-branch-frame] [data-dsh-chatroom-branch-shell] > :nth-child(2)',
    )
    expect(CHATROOM_STYLES).toContain('grid-column: 2 !important;')
  })

  it('renders native mention chips with their literal sigil instead of the reference icon', () => {
    expect(CHATROOM_STYLES).toContain(
      '.dsh-chatroom-native-message [data-ref-chip][title^="@"] > svg',
    )
    expect(CHATROOM_STYLES).toContain('gap: 0 !important;')
    expect(CHATROOM_STYLES).toContain('content: "@";')
  })

  it('uses inherited color-scheme fallbacks for branch surfaces', () => {
    expect(CHATROOM_STYLES).toContain(
      'background: var(--bg-primary, light-dark(#fff, #151517));',
    )
    expect(CHATROOM_STYLES).toContain(
      'color: var(--text-secondary, light-dark(#6b7280, #aeb0b4));',
    )
    expect(CHATROOM_STYLES).toContain(
      'var(--bg-secondary, light-dark(#f3f4f6, #1b1b1c))',
    )
  })

  it('lets injected AI branch activity expand the native action row', () => {
    expect(CHATROOM_STYLES).toContain(
      'html[data-dsh-chatroom-active] [data-dsh-chatroom-native-actions]',
    )
    expect(CHATROOM_STYLES).toContain('height: auto !important;')
    expect(CHATROOM_STYLES).toContain('overflow: visible !important;')
  })
})
