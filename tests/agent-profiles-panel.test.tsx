// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatroomAgentProfile, ChatroomAgentProfilesView } from '../src/types.js'
import { AgentProfilesPanel } from '../src/client/ChatroomPanels.js'

function profile(patch: Partial<ChatroomAgentProfile> = {}): ChatroomAgentProfile {
  return {
    id: 'profile-1',
    roomId: 'room-1',
    name: 'Terra',
    role: '审查员',
    provider: 'deepseek',
    model: 'chat',
    enabled: true,
    createdAt: 1,
    updatedAt: 1,
    ...patch,
  }
}

function view(profiles: readonly ChatroomAgentProfile[], canManage = true): ChatroomAgentProfilesView {
  return {
    canManage,
    profiles,
    models: [{ provider: 'deepseek', model: 'chat', label: 'DeepSeek · Chat' }],
  }
}

function renderPanel(agentProfiles: ChatroomAgentProfilesView, overrides: Record<string, unknown> = {}): void {
  const props = {
    room: {
      room: { id: 'room-1', title: '评审部' },
      agentsOpen: true,
      agentProfiles,
      agentBusy: false,
      agentError: undefined,
    },
    closeAgents: vi.fn(),
    saveAgentProfile: vi.fn(async () => true),
    deleteAgentProfile: vi.fn(async () => undefined),
    ...overrides,
  } as unknown as Parameters<typeof AgentProfilesPanel>[0]
  render(<AgentProfilesPanel {...props} />)
}

describe('AgentProfilesPanel', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('lists room AI participants and wires manager actions', async () => {
    const saveAgentProfile = vi.fn(async () => true)
    const deleteAgentProfile = vi.fn(async () => undefined)
    renderPanel(view([profile()]), { saveAgentProfile, deleteAgentProfile })
    expect(screen.getByText('Terra')).toBeTruthy()
    expect(screen.getByText(/审查员 · deepseek · chat/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '停用' }))
    await waitFor(() => expect(saveAgentProfile).toHaveBeenCalledWith(expect.objectContaining({
      profileId: 'profile-1',
      enabled: false,
    })))
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    await waitFor(() => expect(deleteAgentProfile).toHaveBeenCalledWith('profile-1'))
  })

  it('creates a room AI participant with the selected model route', async () => {
    const saveAgentProfile = vi.fn(async () => true)
    renderPanel(view([], true), { saveAgentProfile })
    fireEvent.change(screen.getByLabelText('AI 成员名称'), { target: { value: 'Nova' } })
    fireEvent.change(screen.getByLabelText('AI 成员职责'), { target: { value: '设计员' } })
    fireEvent.click(screen.getByRole('button', { name: '添加 AI 成员' }))
    await waitFor(() => expect(saveAgentProfile).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Nova',
      role: '设计员',
      provider: 'deepseek',
      model: 'chat',
      enabled: true,
    })))
  })

  it('stays read-only for members without management rights', () => {
    renderPanel(view([], false))
    expect(screen.getByText('只有群主和管理员可以修改 AI 成员。')).toBeTruthy()
    expect(screen.queryByRole('button', { name: '删除' })).toBeNull()
    expect(screen.queryByRole('button', { name: '添加 AI 成员' })).toBeNull()
  })

  it('surfaces storage errors from the store', () => {
    renderPanel(view([], true), { room: {
      room: { id: 'room-1', title: '评审部' },
      agentsOpen: true,
      agentProfiles: view([], true),
      agentBusy: false,
      agentError: 'AI 成员保存失败。',
    } })
    expect(screen.getByRole('alert').textContent).toBe('AI 成员保存失败。')
  })
})
