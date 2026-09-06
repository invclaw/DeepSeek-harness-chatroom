import { createServer, request as httpRequest } from 'node:http'
import { once } from 'node:events'
import { describe, expect, it, vi } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import { WebSocket } from 'ws'
import { NativeGateway } from '../src/native-gateway.js'
import type { ChatroomRuntime } from '../src/room.js'
import type { Config } from '../src/config.js'

function fixture() {
  let active = true
  const permitted = new Set(['alice-solo', 'shared-room'])
  const account = { participantId: 'alice', displayName: 'Alice', avatarId: 'whale', role: 'member' }
  const runtime = {
    isReady: true,
    auth: { accountForRequest: vi.fn(async (token: string) => token === 'alice-token' && active ? { account } : {}) },
    canAccessNativeSession: vi.fn(async (id: string) => permitted.has(id)),
    reserveSoloSession: vi.fn(async () => 'alice-solo'),
    ownsSoloSession: vi.fn((id: string) => id === 'alice-solo'),
    ownsSession: vi.fn((id: string) => id === 'shared-room'),
    assertPromptReferences: vi.fn(),
    submitNativeSession: vi.fn(async () => true),
    ownNativeFork: vi.fn(),
  } as unknown as ChatroomRuntime
  const config = {
    cwd: process.cwd(), authEnabled: true, authCookieName: 'chatroom-auth', authPublicOrigin: '',
    nativeTrustedHosts: [], settingsAdminParticipantIds: [], sseHeartbeatMs: 15_000,
  } as unknown as Config
  const dispatch = vi.fn(async (request: Request) => {
    const body = await request.clone().json() as { rpcId: string }
    return Response.json({ type: 'server-response', rpcId: body.rpcId, result: { ok: true, value: {} } })
  })
  const ready = Promise.withResolvers<void>()
  const available = Promise.withResolvers<void>()
  const queue: Array<{ rpcId: string; payload: Record<string, unknown> }> = []
  let notify: () => void = () => available.resolve()
  const events = async function* (_request: unknown, signal: AbortSignal) {
    ready.resolve()
    while (!signal.aborted) {
      if (queue.length === 0) {
        const pending = Promise.withResolvers<void>()
        notify = () => pending.resolve()
        signal.addEventListener('abort', notify, { once: true })
        try { await pending.promise } finally { signal.removeEventListener('abort', notify) }
      }
      const frame = queue.shift()
      if (frame !== undefined) yield frame
    }
  }
  const ctx = { apiProxy: { events: { mux: events, host: events } } } as unknown as Context
  const gateway = new NativeGateway(ctx, runtime, config, dispatch)
  return { gateway, runtime, dispatch, permitted, ready, revoke: () => { active = false }, push: (frame: (typeof queue)[number]) => { queue.push(frame); notify() } }
}

function rpc(method: string, payload: Record<string, unknown> = {}, token = 'alice-token'): Request {
  return new Request(`http://127.0.0.1/api/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: `chatroom-auth=${token}` },
    body: JSON.stringify({ type: 'client-request', rpcId: 'request-1', method, payload }),
  })
}

describe('native account gateway', () => {
  it.each(['session.list', 'session.history', 'session.prompt', 'settings.describe', 'commands/execute'])('rejects unauthenticated %s before dispatch', async method => {
    const f = fixture()
    try {
      expect((await f.gateway.fetch(rpc(method, { sessionId: 'alice-solo' }, 'invalid'))).status).toBe(401)
      expect(f.dispatch).not.toHaveBeenCalled()
    } finally { await f.gateway.close() }
  })

  it.each(['session.history', 'session.attachment', 'session.models', 'session.selectModel', 'session.prompt', 'session.cancel', 'session.fork', 'session.rename', 'session.updateQueue', 'agentPreset.select', 'goal.create', 'workspace.archiveSession'])('denies foreign-session %s', async method => {
    const f = fixture()
    try {
      expect((await f.gateway.fetch(rpc(method, { sessionId: 'bob-solo' }))).status).toBe(403)
      expect(f.dispatch).not.toHaveBeenCalled()
    } finally { await f.gateway.close() }
  })

  it('filters native list and search responses before they leave the server', async () => {
    const f = fixture()
    f.dispatch.mockImplementation(async () => Response.json({ result: { ok: true, value: { items: [
      { sessionId: 'bob-solo', snippet: 'private Bob text' }, { sessionId: 'alice-solo', snippet: 'Alice text' },
    ] } } }))
    try {
      for (const method of ['session.list', 'session.search']) {
        const response = await f.gateway.fetch(rpc(method))
        expect(JSON.stringify(await response.json())).not.toContain('Bob')
      }
    } finally { await f.gateway.close() }
  })

  it('uses authenticated room admission for native prompts and pins Solo creation cwd', async () => {
    const f = fixture()
    try {
      expect((await f.gateway.fetch(rpc('session.prompt', { sessionId: 'shared-room', mode: 'queue', content: [{ type: 'text', text: '@DeepSeek hello' }] }))).status).toBe(200)
      expect(f.runtime.submitNativeSession).toHaveBeenCalledWith('shared-room', expect.objectContaining({ participantId: 'alice' }), [{ type: 'text', text: '@DeepSeek hello' }], 'queue')
      expect(f.dispatch).not.toHaveBeenCalled()
      expect((await f.gateway.fetch(rpc('session.create', { sessionId: 'bob-solo' }))).status).toBe(403)
      await f.gateway.fetch(rpc('session.create', { sessionId: 'alice-solo' }))
      expect(await f.dispatch.mock.calls[0]![0].clone().json()).toMatchObject({ payload: { cwd: process.cwd() } })
    } finally { await f.gateway.close() }
  })

  it('assigns native startup sessions to the caller after validating creation parameters', async () => {
    const f = fixture()
    try {
      expect((await f.gateway.fetch(rpc('session.create', { cwd: '/private/foreign' }))).status).toBe(403)
      expect((await f.gateway.fetch(rpc('session.create', { agentPreset: 5 }))).status).toBe(400)
      expect(f.runtime.reserveSoloSession).not.toHaveBeenCalled()
      expect((await f.gateway.fetch(rpc('session.create'))).status).toBe(200)
      expect(f.runtime.reserveSoloSession).toHaveBeenCalledWith(expect.objectContaining({ participantId: 'alice' }))
      expect(await f.dispatch.mock.calls[0]![0].clone().json()).toMatchObject({ payload: { sessionId: 'alice-solo', cwd: process.cwd() } })
    } finally { await f.gateway.close() }
  })

  it('authorizes pinned Remote agentId fields and filters cross-session reference candidates', async () => {
    const f = fixture()
    try {
      expect((await f.gateway.fetch(rpc('commands/list', { args: { agentId: 'alice-solo' } }))).status).toBe(200)
      expect((await f.gateway.fetch(rpc('commands/list', { args: { agentId: 'bob-solo', sessionId: 'alice-solo' } }))).status).toBe(403)
      f.dispatch.mockResolvedValueOnce(Response.json({ result: { ok: true, value: [{ sessionId: 'bob-solo', label: 'private' }, { sessionId: 'shared-room', label: 'shared' }] } }))
      const response = await f.gateway.fetch(rpc('sessionReferenceResolver/candidates', { args: { agentId: 'alice-solo', query: '' } }))
      expect(await response.json()).toMatchObject({ result: { value: [{ sessionId: 'shared-room' }] } })
    } finally { await f.gateway.close() }
  })

  it('denies unscoped Remote, cross-account descendant, forged approval, and cross-site requests', async () => {
    const f = fixture()
    try {
      for (const [method, payload] of [
        ['dynamicCordisRunner/unknown', { args: {} }],
        ['commands/execute', { args: { agentId: 'bob-solo', line: '/help' } }],
        ['subagent.history', { parentSessionId: 'shared-room', childSessionId: 'bob-solo' }],
        ['respond', {}],
      ] as const) expect((await f.gateway.fetch(rpc(method, payload))).status).toBe(403)
      const request = rpc('session.list')
      request.headers.set('Origin', 'https://attacker.example')
      expect((await f.gateway.fetch(request)).status).toBe(403)
      expect(f.dispatch).not.toHaveBeenCalled()
    } finally { await f.gateway.close() }
  })

  it('closes an authenticated HTTP request even when its body never completes', async () => {
    const f = fixture()
    const server = createServer((req, res) => { void f.gateway.handle(req, res) })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const address = server.address()
    if (address === null || typeof address === 'string') throw new Error('Missing port')
    const request = httpRequest(`http://127.0.0.1:${address.port}/api/session.list`, { method: 'POST', headers: { Cookie: 'chatroom-auth=alice-token', 'Content-Length': 100 } })
    request.on('error', () => { /* Closing the carrier resets the unfinished client request. */ })
    request.flushHeaders()
    try {
      await vi.waitFor(() => expect(f.runtime.auth.accountForRequest).toHaveBeenCalled())
      await f.gateway.close()
      expect(f.dispatch).not.toHaveBeenCalled()
    } finally {
      request.destroy()
      await f.gateway.close()
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    }
  })

  it('filters real WebSocket frames, guards approval responses, and closes a revoked login', async () => {
    const f = fixture()
    const server = createServer((req, res) => { void f.gateway.handle(req, res) })
    server.on('upgrade', (req, socket, head) => { void f.gateway.upgrade(req, socket, head, 'mux') })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const address = server.address()
    if (address === null || typeof address === 'string') throw new Error('Missing port')
    const socket = new WebSocket(`ws://127.0.0.1:${address.port}/api/events.mux`, { headers: { Cookie: 'chatroom-auth=alice-token' } })
    const seen: string[] = []
    socket.on('message', value => seen.push(String(value)))
    try {
      await once(socket, 'open')
      await f.ready.promise
      f.push({ rpcId: 'foreign', payload: { type: 'session/subscribed', sessionId: 'bob-solo', lastSeq: 9 } })
      f.push({ rpcId: 'owned-approval', payload: { type: 'approval/requested', sessionId: 'alice-solo', approvalId: 'approval-1', toolName: 'bash' } })
      await vi.waitFor(() => expect(seen).toHaveLength(1))
      expect(seen[0]).toContain('owned-approval')
      expect(seen.join()).not.toContain('bob-solo')
      const response = new Request('http://127.0.0.1/api/respond', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: 'chatroom-auth=alice-token' }, body: JSON.stringify({ type: 'client-response', rpcId: 'owned-approval', result: { ok: true, value: {} } }) })
      expect((await f.gateway.fetch(response)).status).toBe(200)
      f.revoke()
      const closed = once(socket, 'close')
      f.push({ rpcId: 'after-revoke', payload: { type: 'session/subscribed', sessionId: 'alice-solo', lastSeq: 10 } })
      await closed
      expect(seen).toHaveLength(1)
    } finally {
      socket.terminate()
      await f.gateway.close()
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    }
  })
})
