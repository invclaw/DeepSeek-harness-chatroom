import { describe, expect, it, vi } from 'vitest'
import { createChatroomAiSource } from '../src/client/index.js'
import type { ChatroomClientStore } from '../src/client/store.js'

describe('chatroom @AI source', () => {
  it('offers AI names only inside shared sessions and inserts a literal mention', async () => {
    const store = {
      roomForSession: (sessionId: string) => sessionId === 'shared'
        ? { id: 'room', title: '大厅', aiDisplayName: 'DeepSeek', sessionId: 'shared' }
        : undefined,
      subscribe: vi.fn(() => () => undefined),
    } as unknown as ChatroomClientStore
    const source = createChatroomAiSource(store)
    const signal = new AbortController().signal

    await expect(source.candidates({ sessionId: 'shared' as never }, {
      query: '', position: 'inline', signal,
    })).resolves.toMatchObject([{ name: 'AI' }, { name: 'DeepSeek' }])
    await expect(source.candidates({ sessionId: 'ordinary' as never }, {
      query: '', position: 'inline', signal,
    })).resolves.toEqual([])
    expect(source.lexicon?.({ sessionId: 'shared' as never })).toEqual(['AI', 'DeepSeek'])
    expect(source.onPick({ candidate: { name: 'AI' } } as never)).toEqual({ text: '@AI ' })
  })
})
