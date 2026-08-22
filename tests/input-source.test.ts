import { describe, expect, it, vi } from 'vitest'
import { createChatroomAiSource } from '../src/client/index.js'
import type { ChatroomClientStore } from '../src/client/store.js'

describe('chatroom mention source', () => {
  it('offers AI and peer names only inside shared sessions and inserts a literal mention', async () => {
    const store = {
      roomForSession: (sessionId: string) => sessionId === 'shared'
        ? { id: 'room', title: '大厅', aiDisplayName: 'DeepSeek', sessionId: 'shared' }
        : undefined,
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
    const signal = new AbortController().signal

    await expect(source.candidates({ sessionId: 'shared' as never }, {
      query: '', position: 'inline', signal,
    })).resolves.toMatchObject([
      { name: 'AI', description: '提及后触发 AI 回复' },
      { name: 'DeepSeek', description: '提及后触发 AI 回复' },
      { name: 'Bob', description: '在线成员' },
      { name: 'Carol', description: '群成员' },
    ])
    await expect(source.candidates({ sessionId: 'ordinary' as never }, {
      query: '', position: 'inline', signal,
    })).resolves.toEqual([])
    expect(source.lexicon?.({ sessionId: 'shared' as never })).toEqual(['AI', 'DeepSeek', 'Bob', 'Carol'])
    expect(source.onPick({ candidate: { name: 'AI' } } as never)).toEqual({ text: '@AI ' })
  })
})
