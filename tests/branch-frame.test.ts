// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  branchFrameFromLocation,
  branchFrameUrl,
  restoreParentSessionSelection,
  stageBranchFrameSession,
} from '../src/client/branch-frame.js'
import { CHATROOM_STYLES } from '../src/client/styles.js'

beforeEach(() => {
  history.replaceState({}, '', '/private-entry/?keep=1#old')
  localStorage.clear()
})

describe('native branch frame isolation', () => {
  it('round-trips the branch and parent Sessions through a same-origin Harness URL', () => {
    const href = branchFrameUrl({
      id: 'thread-id',
      roomId: 'room-id',
      sessionId: 'chatroom-thread-v1-thread-id',
      createdAt: 1,
      root: { messageId: 'user:1', displayName: 'Alice', text: '主题', role: 'human' },
    }, 'chatroom-v1-room-id')
    const url = new URL(href)

    expect(url.pathname).toBe('/private-entry/')
    expect(url.searchParams.get('keep')).toBe('1')
    expect(url.hash).toBe('')
    expect(branchFrameFromLocation({ search: url.search } as Location)).toEqual({
      threadId: 'thread-id',
      roomId: 'room-id',
      sessionId: 'chatroom-thread-v1-thread-id',
      parentSessionId: 'chatroom-v1-room-id',
    })
  })

  it('rejects partial frame addresses and restores the parent selection', () => {
    expect(branchFrameFromLocation({ search: '?dsh-chatroom-thread=thread-id' } as Location)).toBeUndefined()

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
  })
})
