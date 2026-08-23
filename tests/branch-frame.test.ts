// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  branchFrameDocumentReady,
  branchFrameFromLocation,
  branchFrameUrl,
  notifyBranchFrameReady,
  prepareBranchFrameSelection,
  restoreParentSessionSelection,
  stageBranchFrameSession,
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
    document.body.innerHTML = '<main data-dsh-chatroom-branch-shell><nav></nav><section><header>被原生 UI 截断的分支标题</header></section><aside></aside></main>'
    notifyBranchFrameReady(frame)
    expect(branchFrameDocumentReady(document, frame.sessionId)).toBe(false)

    document.querySelector('section')!.insertAdjacentHTML('beforeend', '<textarea></textarea>')
    expect(branchFrameDocumentReady(document, frame.sessionId)).toBe(true)
    expect(branchFrameDocumentReady(document, 'another-session')).toBe(false)
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
})
