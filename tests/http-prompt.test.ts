import { createServer } from 'node:http'
import { once } from 'node:events'
import { expect, it, vi } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import { ChatroomHttpController } from '../src/http.js'
import type { ChatroomRuntime } from '../src/room.js'
import type { Config } from '../src/config.js'

it.each(['/prompt', '/threads/prompt'])('retains native correlation across the actual HTTP adapter %s', async path => {
  const identity = { participantId: 'alice', displayName: 'Alice', avatarId: 'whale' }
  const submit = vi.fn(async () => ({ accepted: true, aiTriggered: false }))
  const runtime = { isReady: true, identity: () => identity, maxPromptRequestBytes: 65536, submit, submitThread: submit } as unknown as ChatroomRuntime
  const ctx = { logger: () => ({ warn: vi.fn(), error: vi.fn() }) } as unknown as Context
  const config = { authEnabled: false, cookieName: 'synthetic', maxMessageTextChars: 1000 } as Config
  const controller = new ChatroomHttpController(ctx, runtime, config)
  const server = createServer((request, response) => { void controller.handle(request, response) })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/plugins/deepseek-harness-chatroom/api${path}`
  const payload = { roomId: 'room', threadId: 'thread', mode: 'queue', content: [{ type: 'text', text: 'one message' }], requestId: 'native-request', clientTimeZone: 'Asia/Shanghai' }
  try {
    const accepted = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    expect(accepted.status).toBe(200)
    expect(await accepted.json()).toMatchObject({ accepted: true })
    expect(submit).toHaveBeenCalledWith(path === '/prompt' ? 'room' : 'thread', identity, payload.content, 'queue', undefined, { requestId: 'native-request', clientTimeZone: 'Asia/Shanghai' })
    const rejected = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, clientTimeZone: 'Invalid/Zone' }) })
    expect(rejected.status).toBe(422)
    await rejected.body?.cancel()
    expect(submit).toHaveBeenCalledOnce()
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())) }
})
