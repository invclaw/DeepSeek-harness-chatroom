import { describe, expect, it, vi } from 'vitest'
import type {
  ISessions,
  IWorkspaces,
  SessionId,
  SessionListState,
  WorkspaceId,
  WorkspaceListState,
} from '@deepseek-ai/dsh-client-runtime/client'
import { installFreshSessionStart } from '../src/client/fresh-session.js'

describe('native New Session override', () => {
  it('creates a distinct Session in the current Workspace and opens it after listing', async () => {
    const current = 'chatroom-thread-v1-old' as SessionId
    const created = 'native-fresh' as SessionId
    const workspaceId = 'workspace' as WorkspaceId
    const sessionState = sessionList(current)
    const sessionListeners = new Set<() => void>()
    const original = vi.fn()
    const open = vi.fn()
    const workspaces = {
      startSession: original,
      list: snapshot(workspaceList(workspaceId, current)),
    } as unknown as IWorkspaces
    const sessions = {
      list: snapshot(sessionState, sessionListeners),
      clear: vi.fn(),
      open,
    } as unknown as ISessions
    const createSession = vi.fn(async () => created)
    const restore = installFreshSessionStart(workspaces, sessions, createSession)

    workspaces.startSession()
    await vi.waitFor(() => { expect(createSession).toHaveBeenCalledWith(workspaceId) })
    expect(original).not.toHaveBeenCalled()
    expect(open).not.toHaveBeenCalled()

    sessionState.byId[created] = {
      id: created, displayTitle: '新会话', running: false, blank: true, updatedAt: 2,
    }
    for (const listener of sessionListeners) listener()
    expect(open).toHaveBeenCalledWith(created)

    restore()
    expect(workspaces.startSession).toBe(original)
  })

  it('keeps the native empty-Workspace behavior', () => {
    const original = vi.fn()
    const workspaces = {
      startSession: original,
      list: snapshot({ ...workspaceList(undefined, undefined), items: [] }),
    } as unknown as IWorkspaces
    const clear = vi.fn()
    const sessions = {
      list: snapshot(sessionList(undefined)),
      clear,
    } as unknown as ISessions
    const restore = installFreshSessionStart(workspaces, sessions, vi.fn())

    workspaces.startSession()
    expect(clear).toHaveBeenCalledOnce()
    restore()
  })
})

function snapshot<T>(value: T, listeners = new Set<() => void>()) {
  return {
    getSnapshot: () => value,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
}

function sessionList(current: SessionId | undefined): SessionListState {
  return {
    ids: current === undefined ? [] : [current],
    byId: current === undefined ? {} : {
      [current]: { id: current, displayTitle: '旧分支', running: false, blank: true, updatedAt: 1 },
    },
    current,
    phase: 'ready',
    subagentsByParent: {},
    jobsBySession: {},
    currentAddress: undefined,
  }
}

function workspaceList(
  workspaceId: WorkspaceId | undefined,
  current: SessionId | undefined,
): WorkspaceListState {
  return {
    items: workspaceId === undefined ? [] : [{
      workspaceId,
      title: '工作区',
      path: '/workspace',
      sessionIds: current === undefined ? [] : [current],
      createdAt: '2026-08-24T00:00:00.000Z',
      updatedAt: '2026-08-24T00:00:00.000Z',
    }],
    archivedSessionIds: [],
    state: 'idle',
    phase: 'ready',
    error: null,
    baselinesReady: true,
    recentWorkspaceId: workspaceId,
  }
}
