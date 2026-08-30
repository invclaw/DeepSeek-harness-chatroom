import { describe, expect, it, vi } from 'vitest'
import { createChatroomAiSource, createChatroomMemberSource } from '../src/client/index.js'
import type { ChatroomClientStore } from '../src/client/store.js'

describe('chatroom mention source', () => {
  it('offers AI and peer names only inside shared sessions and inserts a literal mention', async () => {
    const store = {
      roomForSession: (sessionId: string) => sessionId === 'shared'
        ? { id: 'room', title: '大厅', aiDisplayName: 'DeepSeek', sessionId: 'shared' }
        : undefined,
      newSessionMode: () => undefined,
      getSnapshot: () => ({
        identity: { participantId: 'alice-id' },
        members: [
          { participantId: 'alice-id', displayName: 'Alice', online: true },
          { participantId: 'bob-id', displayName: 'Bob', online: true },
          { participantId: 'carol-id', displayName: 'Carol', online: false },
        ],
      }),
      subscribe: vi.fn(() => () => undefined),
    } as unknown as ChatroomClientStore
    const source = createChatroomAiSource(store)
    const memberSource = createChatroomMemberSource(store)
    const signal = new AbortController().signal

    await expect(source.candidates({ sessionId: 'shared' as never }, {
      query: '', position: 'inline', signal,
    })).resolves.toMatchObject([
      { name: 'DeepSeek（AI 助手）', icon: '✦', description: '提及后回复' },
    ])
    await expect(memberSource.candidates({ sessionId: 'shared' as never }, {
      query: '', position: 'inline', signal,
    })).resolves.toMatchObject([
      { name: 'Bob', description: '在线成员' },
      { name: 'Carol', description: '群成员' },
    ])
    await expect(source.candidates({ sessionId: 'ordinary' as never }, {
      query: '', position: 'inline', signal,
    })).resolves.toEqual([])
    expect(source.name).toBe('AI 助手')
    expect(memberSource.name).toBe('群聊成员')
    expect(source.lexicon?.({ sessionId: 'shared' as never })).toEqual(['AI', 'DeepSeek'])
    expect(memberSource.lexicon?.({ sessionId: 'shared' as never })).toEqual(['Bob', 'Carol'])
    expect(source.onPick({ candidate: { name: 'DeepSeek（AI 助手）' } } as never)).toEqual({ text: '@DeepSeek ' })
    expect(memberSource.onPick({ candidate: { name: 'Bob' } } as never)).toEqual({ text: '@Bob ' })
  })

  it('offers the account directory while composing a new Group', async () => {
    const loadDirectDirectory = vi.fn(async () => true)
    const store = {
      roomForSession: () => undefined,
      newSessionMode: (sessionId: string) => sessionId === 'new-group' ? 'group' : undefined,
      getSnapshot: () => ({
        identity: { participantId: 'alice-id' }, members: [],
        directPeers: [
          { participantId: 'alice-id', username: 'alice', displayName: 'Alice', avatarId: 'whale' },
          { participantId: 'bob-id', username: 'bob', displayName: 'Bob', avatarId: 'panda' },
        ],
      }),
      loadDirectDirectory,
      subscribe: vi.fn(() => () => undefined),
    } as unknown as ChatroomClientStore
    const source = createChatroomAiSource(store)
    const memberSource = createChatroomMemberSource(store)

    await expect(source.candidates({ sessionId: 'new-group' as never }, {
      query: '', position: 'inline', signal: new AbortController().signal,
    })).resolves.toMatchObject([
      { name: 'DeepSeek（AI 助手）', description: '创建群聊后立即回复' },
    ])
    await expect(memberSource.candidates({ sessionId: 'new-group' as never }, {
      query: '', position: 'inline', signal: new AbortController().signal,
    })).resolves.toMatchObject([
      { name: 'Bob', description: '创建群聊时自动邀请 · @bob' },
    ])
    expect(source.lexicon?.({ sessionId: 'new-group' as never })).toEqual(['AI', 'DeepSeek'])
    expect(memberSource.lexicon?.({ sessionId: 'new-group' as never })).toEqual(['Bob'])
    expect(loadDirectDirectory).not.toHaveBeenCalled()
  })
})
