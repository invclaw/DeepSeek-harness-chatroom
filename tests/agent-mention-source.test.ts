import { describe, expect, it, vi } from 'vitest'
import { createChatroomAgentProfileSource } from '../src/client/agent-mention-source.js'
import type { ChatroomAgentProfile, ChatroomAgentProfilesView } from '../src/types.js'

const profile = (patch: Partial<ChatroomAgentProfile> = {}): ChatroomAgentProfile => ({
  id: 'profile-1',
  roomId: 'room-1',
  name: 'Terra',
  role: '审查员',
  provider: 'minimax-cn',
  model: 'MiniMax-M3',
  enabled: true,
  createdAt: 1,
  updatedAt: 1,
  ...patch,
})

function fakeStore(view: ChatroomAgentProfilesView | undefined, roomId = 'room-1') {
  return {
    roomForSession: vi.fn(() => roomId === undefined ? undefined : { id: roomId }),
    getSnapshot: vi.fn(() => ({ agentProfiles: view })),
    ensureAgentProfiles: vi.fn(async () => undefined),
    subscribe: vi.fn(() => () => undefined),
  } as never
}

const session = { sessionId: 'chatroom-v1-room-1' } as never

describe('createChatroomAgentProfileSource', () => {
  it('lists enabled room AI participants with role and model annotations', async () => {
    const view: ChatroomAgentProfilesView = {
      canManage: true,
      profiles: [
        profile(),
        profile({ id: 'profile-2', name: 'M3', role: '快速实现员', model: 'MiniMax-M3', reasoningEffort: 'high' }),
        profile({ id: 'profile-3', name: '停用者', enabled: false }),
      ],
      models: [],
    }
    const source = createChatroomAgentProfileSource(fakeStore(view))
    const candidates = await source.candidates(session, { query: '', position: 'inline', drilled: false, signal: new AbortController().signal })
    expect(candidates.map(candidate => candidate.name)).toEqual(['Terra', 'M3'])
    expect(candidates[1]!.description).toContain('快速实现员 · MiniMax-M3 · high')
  })

  it('filters candidates by query and inserts the mention token on pick', async () => {
    const view: ChatroomAgentProfilesView = { canManage: true, profiles: [profile()], models: [] }
    const source = createChatroomAgentProfileSource(fakeStore(view))
    const filtered = await source.candidates(session, { query: 'ter', position: 'inline', drilled: false, signal: new AbortController().signal })
    expect(filtered.map(candidate => candidate.name)).toEqual(['Terra'])
    expect(source.onPick({ candidate: { name: 'Terra', value: 'profile-1' }, session, position: 'inline', via: 'menu', action: 'pick', span: {} as never })).toEqual({ text: '@Terra ' })
  })

  it('rolls the lexicon from enabled profiles and returns empty without a room', () => {
    const view: ChatroomAgentProfilesView = { canManage: true, profiles: [profile(), profile({ name: '停用者', enabled: false })], models: [] }
    const source = createChatroomAgentProfileSource(fakeStore(view))
    expect(source.lexicon?.(session)).toEqual(['Terra'])
    const noRoom = createChatroomAgentProfileSource(fakeStore(undefined, undefined as never))
    expect(noRoom.lexicon?.(session)).toEqual([])
  })
})
