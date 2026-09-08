// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import { RoomAgentRoster } from '../src/client/RoomIdentityAction.js'

afterEach(cleanup)

function fixture(state = 'ready') {
  const snapshot = { subagentsByParent: { parent: {
    state, error: state === 'error' ? { message: 'offline' } : null,
    entries: state === 'error' ? [] : [
      { kind: 'child', id: 'planner', label: '方案员', mode: 'continuable', activity: 'inactive', hasChildren: false },
      { kind: 'child', id: 'reviewer', label: '审查员', mode: 'continuable', activity: 'running', hasChildren: false },
      { kind: 'diagnostic', id: 'broken', reason: 'corrupt' },
    ],
  } } }
  return {
    list: { getSnapshot: () => snapshot, subscribe: () => () => {} },
    openSubagent: vi.fn(), setSubagentCatalogOpen: vi.fn(), refreshSubagents: vi.fn(async () => {}),
  }
}

describe('native room Agent roster', () => {
  it('shows real children and opens the exact native continuation instead of inserting a session reference', () => {
    const sessions = fixture()
    const { unmount } = render(<RoomAgentRoster sessions={sessions as unknown as ISessions}
      parentSessionId={'parent' as never} mainName="DeepSeek" />)
    expect(screen.getByText('Agent 3')).toBeTruthy()
    expect(screen.getByText('方案员 · 可续聊')).toBeTruthy()
    expect(screen.getByText('审查员 · 运行中')).toBeTruthy()
    expect(screen.queryByText('broken')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '打开 Agent 审查员' }))
    expect(sessions.openSubagent).toHaveBeenCalledWith({
      parentSessionId: 'parent', childSessionId: 'reviewer', mode: 'continuable',
    })
    expect(sessions.setSubagentCatalogOpen).toHaveBeenCalledWith('parent', true)
    unmount()
    expect(sessions.setSubagentCatalogOpen).toHaveBeenLastCalledWith('parent', false)
  })

  it('shows failed catalog reads instead of claiming there is only one Agent, with a working retry', async () => {
    const sessions = fixture('error')
    sessions.refreshSubagents.mockRejectedValueOnce(new Error('network unavailable'))
    render(<RoomAgentRoster sessions={sessions as unknown as ISessions}
      parentSessionId={'parent' as never} mainName="DeepSeek" />)
    expect(screen.queryByText('Agent 1')).toBeNull()
    expect(screen.getByRole('alert').textContent).toContain('读取失败')
    fireEvent.click(screen.getByRole('button', { name: '刷新 Agent 列表' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('network unavailable'))
    expect(sessions.refreshSubagents).toHaveBeenCalledWith('parent')
  })
})
