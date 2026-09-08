import { createServer, request as httpRequest } from 'node:http'
import { once } from 'node:events'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import type { NativeTransport } from '../src/native-platform.js'
const nativePackage = createRequire(import.meta.url).resolve('@deepseek-ai/dsh-api-gateway/package.json')
const { RemoteStreamMuxServer } = await import(pathToFileURL(join(dirname(nativePackage), 'lib/types/stream-server.js')).href)
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
  const queue: Array<Record<string, unknown>> = []
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
  const ctx = {} as Context
  const transport = { Mux: RemoteStreamMuxServer, gateway: { wireStream: { open: (_endpoint: string, payload: unknown, signal: AbortSignal) => events(payload, signal), failure: (error: Error) => ({ code: 'internal', message: error.message }) } } } as unknown as NativeTransport
  const gateway = new NativeGateway(ctx, runtime, config, dispatch, transport)
  return { gateway, runtime, dispatch, permitted, ready, revoke: () => { active = false }, push: (frame: (typeof queue)[number]) => { queue.push(frame); notify() } }
}

function rpc(method: string, payload: Record<string, unknown> = {}, token = 'alice-token'): Request {
  return new Request(`http://127.0.0.1/api/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: `chatroom-auth=${token}` },
    body: JSON.stringify({ type: 'client-request', rpcId: 'request-1', method, payload: method === '$events/result' ? payload : ('args' in payload ? payload : { args: { request: payload } }) }),
  })
}

describe('native account gateway', () => {
  it.each(['session/list', 'session/page', 'session/prompt', 'settings/describe', 'commands/execute'])('rejects unauthenticated %s before dispatch', async method => {
    const f = fixture()
    try {
      expect((await f.gateway.fetch(rpc(method, { sessionId: 'alice-solo' }, 'invalid'))).status).toBe(401)
      expect(f.dispatch).not.toHaveBeenCalled()
    } finally { await f.gateway.close() }
  })

  it.each(['session/page', 'session/attachment', 'session/selectModel', 'session/prompt', 'session/cancel', 'session/fork', 'session/rename', 'session/updateQueue', 'agentPresets/select', 'goals/create', 'workspace/archiveSession'])('denies foreign-session %s', async method => {
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
      for (const method of ['session/list', 'session/search']) {
        const response = await f.gateway.fetch(rpc(method))
        expect(JSON.stringify(await response.json())).not.toContain('Bob')
      }
    } finally { await f.gateway.close() }
  })

  it('keeps human-only shared rooms visible before the first AI turn', async () => {
    const f = fixture()
    f.dispatch.mockResolvedValueOnce(Response.json({ result: { ok: true, value: { items: [
      { sessionId: 'shared-room', blank: true }, { sessionId: 'alice-solo', blank: true },
    ] } } }))
    try {
      const response = await f.gateway.fetch(rpc('session/list'))
      expect(await response.json()).toMatchObject({ result: { value: { items: [
        { sessionId: 'shared-room', blank: false }, { sessionId: 'alice-solo', blank: true },
      ] } } })
    } finally { await f.gateway.close() }
  })

  it('uses authenticated room admission for native prompts and pins Solo creation cwd', async () => {
    const f = fixture()
    try {
      expect((await f.gateway.fetch(rpc('session/prompt', { sessionId: 'shared-room', mode: 'queue', content: [{ type: 'text', text: '@DeepSeek hello' }] }))).status).toBe(200)
      expect(f.runtime.submitNativeSession).toHaveBeenCalledWith('shared-room', expect.objectContaining({ participantId: 'alice' }), [{ type: 'text', text: '@DeepSeek hello' }], 'queue', undefined)
      expect(f.dispatch).not.toHaveBeenCalled()
      expect((await f.gateway.fetch(rpc('session/create', { sessionId: 'bob-solo' }))).status).toBe(403)
      await f.gateway.fetch(rpc('session/create', { sessionId: 'alice-solo' }))
      expect(await f.dispatch.mock.calls[0]![0].clone().json()).toMatchObject({ payload: { args: { request: { cwd: process.cwd() } } } })
    } finally { await f.gateway.close() }
  })

  it('assigns native startup sessions to the caller after validating creation parameters', async () => {
    const f = fixture()
    try {
      expect((await f.gateway.fetch(rpc('session/create', { cwd: '/private/foreign' }))).status).toBe(403)
      expect((await f.gateway.fetch(rpc('session/create', { agentPreset: 5 }))).status).toBe(400)
      expect(f.runtime.reserveSoloSession).not.toHaveBeenCalled()
      expect((await f.gateway.fetch(rpc('session/create'))).status).toBe(200)
      expect(f.runtime.reserveSoloSession).toHaveBeenCalledWith(expect.objectContaining({ participantId: 'alice' }))
      expect(await f.dispatch.mock.calls[0]![0].clone().json()).toMatchObject({ payload: { args: { request: { sessionId: 'alice-solo', cwd: process.cwd() } } } })
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
        ['$events/result', {}],
      ] as const) expect((await f.gateway.fetch(rpc(method, payload))).status).toBe(403)
      const request = rpc('session/list')
      request.headers.set('Origin', 'https://attacker.example')
      expect((await f.gateway.fetch(request)).status).toBe(403)
      expect(f.dispatch).not.toHaveBeenCalled()
    } finally { await f.gateway.close() }
  })

  it('lets room members list and address only their authorized native subagents', async () => {
    const f = fixture()
    f.permitted.add('shared-child')
    try {
      f.dispatch.mockResolvedValueOnce(Response.json({ result: { ok: true, value: {
        parentAvailable: true, entries: [{ id: 'shared-child', kind: 'child' }, { id: 'bob-child', kind: 'child' }],
      } } }))
      const listed = await f.gateway.fetch(rpc('subagents/list', { args: { parentSessionId: 'shared-room' } }))
      expect(listed.status).toBe(200)
      expect(await listed.json()).toMatchObject({ result: { value: { entries: [{ id: 'shared-child', kind: 'child' }] } } })
      const prompt = { parentSessionId: 'shared-room', childSessionId: 'shared-child', mode: 'continuable', requestId: 'child-human-1', content: [{ type: 'text', text: 'hello' }] }
      expect((await f.gateway.fetch(rpc('subagents/prompt', prompt))).status).toBe(200)
      expect(f.runtime.assertPromptReferences).toHaveBeenCalledWith(expect.objectContaining({ participantId: 'alice' }), prompt.content)
      expect((await f.gateway.fetch(rpc('subagents/interruptByParent', { args: prompt }))).status).toBe(200)
      for (const method of ['subagents/list', 'subagents/prompt', 'subagents/interruptByParent']) {
        expect((await f.gateway.fetch(rpc(method, { ...prompt, parentSessionId: 'bob-room' }))).status).toBe(403)
        expect((await f.gateway.fetch(rpc(method, { ...prompt, childSessionId: 'bob-child' }))).status).toBe(403)
      }
    } finally { await f.gateway.close() }
  })

  it('closes an authenticated HTTP request even when its body never completes', async () => {
    const f = fixture()
    const server = createServer((req, res) => { void f.gateway.handle(req, res) })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const address = server.address()
    if (address === null || typeof address === 'string') throw new Error('Missing port')
    const request = httpRequest(`http://127.0.0.1:${address.port}/api/session/list`, { method: 'POST', headers: { Cookie: 'chatroom-auth=alice-token', 'Content-Length': 100 } })
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
    server.on('upgrade', (req, socket, head) => { void f.gateway.upgrade(req, socket, head) })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const address = server.address()
    if (address === null || typeof address === 'string') throw new Error('Missing port')
    const socket = new WebSocket(`ws://127.0.0.1:${address.port}/api/remote.mux`, { headers: { Cookie: 'chatroom-auth=alice-token' } })
    const seen: string[] = []
    socket.on('message', value => seen.push(String(value)))
    try {
      await once(socket, 'open')
      socket.send(JSON.stringify({ type: 'open', streamId: 'events', endpoint: '$events', payload: { args: {} } }))
      await f.ready.promise
      f.push({ type: 'ready', clientId: 'client-a', host: { home: '/home' } })
      f.push({ type: 'waterfall', event: 'approval/request', eventId: 'foreign', agentId: 'bob-solo', request: {} })
      f.push({ type: 'waterfall', event: 'approval/request', eventId: 'owned-approval', agentId: 'alice-solo', request: {} })
      await vi.waitFor(() => expect(seen).toHaveLength(2))
      expect(seen[1]).toContain('owned-approval')
      expect(seen.join()).not.toContain('bob-solo')
      const response = rpc('$events/result', { clientId: 'client-a', eventId: 'owned-approval', outcome: { ok: true, value: {} } })
      expect((await f.gateway.fetch(response)).status).toBe(200)
      f.revoke()
      const closed = once(socket, 'close')
      f.push({ type: 'emit', event: 'api-session/status', args: ['alice-solo', 'running'] })
      await closed
      expect(seen).toHaveLength(2)
    } finally {
      socket.terminate()
      await f.gateway.close()
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    }
  })
})
