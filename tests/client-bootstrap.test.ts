import { describe, expect, it, vi } from 'vitest'
import { bootstrapChatroom } from '../src/client/bootstrap.js'

describe('chatroom connection bootstrap', () => {
  it('waits for the identity response that sets the cookie before admitting native startup', async () => {
    const ready = Promise.withResolvers<Response>()
    const fetcher = vi.fn<typeof fetch>().mockReturnValue(ready.promise)
    const startNative = vi.fn()
    const pending = bootstrapChatroom(fetcher).then(startNative)
    expect(startNative).not.toHaveBeenCalled()
    ready.resolve(Response.json({ identity: { participantId: 'alice' }, auth: { enabled: true, authenticated: true } }))
    await pending
    expect(startNative).toHaveBeenCalledOnce()
    expect(fetcher).toHaveBeenCalledWith('/plugins/deepseek-harness-chatroom/api/session', expect.objectContaining({ credentials: 'same-origin' }))
  })
  it('reports startup failure without opening a repeatedly unauthorized native connection', async () => {
    const startNative = vi.fn()
    await expect(bootstrapChatroom(vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 500 }))).then(startNative)).rejects.toThrow('500')
    expect(startNative).not.toHaveBeenCalled()
  })
})
