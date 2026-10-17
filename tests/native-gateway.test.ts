import { createServer, request as httpRequest } from 'node:http'
import { once } from 'node:events'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import { WebSocket } from 'ws'
import { NativeGateway } from '../src/native-gateway.js'
import type { ChatroomRuntime } from '../src/room.js'
import type { Config } from '../src/config.js'

const gateways: NativeGateway[] = []
afterEach(async () => { await Promise.all(gateways.splice(0).map(gateway => gateway.close())) })
function fixture() {
  let active = true
  const permitted = new Set(['alice-solo', 'shared-room'])
  const account = { participantId: 'alice', displayName: 'Alice', avatarId: 'whale', role: 'member' }
  const runtime = {
    isReady: true,
    auth: { accountForRequest: vi.fn(async (token: string) => token === 'alice-token' && active ? { account } : {}) },
    canAccessNativeSession: vi.fn(async (id: string) => permitted.has(id)),
    accessibleNativeSessionIds: vi.fn(async (ids: string[]) => new Set(ids.filter(id => permitted.has(id)))),
    ownsSoloSession: vi.fn((id: string) => id === 'alice-solo'),
    ownsSession: vi.fn((id: string) => id === 'shared-room'),
    assertPromptReferences: vi.fn(), ownNativeFork: vi.fn(), prepareNativeModelSession: vi.fn(), assertNativeFileAccess: vi.fn(),
    reserveSoloSession: vi.fn(async () => 'alice-solo'), submitNativeSession: vi.fn(async () => false),
  } as unknown as ChatroomRuntime
  const config = { cwd: process.cwd(), authEnabled: true, authCookieName: 'chatroom-auth', authPublicOrigin: '', nativeTrustedHosts: [], settingsAdminParticipantIds: [] } as unknown as Config
  const dispatch = vi.fn(async (request: Request) => {
    const body = await request.clone().json() as { rpcId: string }
    return Response.json({ type: 'server-response', rpcId: body.rpcId, result: { ok: true, value: {} } })
  })
  const queue: unknown[] = []
  let notify = () => {}
  const events = vi.fn(async function* (_endpoint: string, _payload: unknown, _uplink: unknown, _peer: unknown, signal: AbortSignal) {
    while (!signal.aborted) {
      if (queue.length === 0) {
        const pending = Promise.withResolvers<void>()
        notify = pending.resolve
        signal.addEventListener('abort', notify, { once: true })
        try { await pending.promise } finally { signal.removeEventListener('abort', notify) }
      }
      const value = queue.shift()
      if (value !== undefined) yield value
    }
  })
  const jobs = { get: vi.fn((id: string) => { if (id === 'own-job') return { owner: 'alice-solo' }; if (id === 'unowned-job') return {}; throw new Error('not found') }) }
  const ctx = { jobs, typertGateway: { wireStream: { open: events, failure: () => ({ code: 'denied', message: 'Access denied', details: {} }) } }, workspaceRegistry: { list: () => [] } } as unknown as Context
  const gateway = new NativeGateway(ctx, runtime, config, dispatch)
  gateways.push(gateway)
  return { gateway, runtime, dispatch, permitted, events, account, jobs, revoke: () => { active = false }, push: (value: unknown) => { queue.push(value); notify() } }
}
function rpc(method: string, request: Record<string, unknown> = {}, token = 'alice-token'): Request {
  if ((method === 'session/page' || method === 'session/follow') && request.sessionId !== undefined) {
    const { sessionId, ...rest } = request
    request = { ...rest, address: { kind: 'session', sessionId } }
  }
  return new Request(`http://127.0.0.1/api/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: `chatroom-auth=${token}` }, body: JSON.stringify({ type: 'client-request', rpcId: 'request-1', method, payload: { args: { request } } }) })
}
describe('native Remote account gateway', () => {
  it.each(['session/list', 'session/page', 'session/prompt', 'settings/describe', 'llm/listConfigurableProviders', 'commands/execute'])('rejects anonymous %s before dispatch', async method => {
    const f = fixture()
    expect((await f.gateway.fetch(rpc(method, {}, 'invalid'))).status).toBe(401)
    expect(f.dispatch).not.toHaveBeenCalled()
  })
  it.each(['job/list', 'job/follow', 'job/kill', 'session/page', 'session/projections', 'session/attachment', 'session/models', 'session/selectModel', 'session/prompt', 'session/cancel', 'session/fork', 'session/rename', 'session/updateQueue', 'agentPresets/select', 'workspace/archiveSession'])('denies foreign %s before side effects', async method => {
    const f = fixture()
    expect((await f.gateway.fetch(rpc(method, { sessionId: 'bob-solo' }))).status).toBe(403)
    expect(f.dispatch).not.toHaveBeenCalled()
  })
  it('filters both native directory and search results', async () => {
    const f = fixture()
    f.dispatch.mockImplementation(async () => Response.json({ result: { ok: true, value: { items: [ { sessionId: 'bob-solo', snippet: 'private Bob text' }, { sessionId: 'alice-solo', snippet: 'Alice text' } ], hasMore: true } } }))
    for (const method of ['session/list', 'session/search']) {
      const response = await f.gateway.fetch(rpc(method))
      const output = JSON.stringify(await response.json())
      expect(output).not.toContain('Bob')
      expect(output).toContain('Alice')
    }
    expect(f.runtime.canAccessNativeSession).not.toHaveBeenCalled()
    expect(f.runtime.accessibleNativeSessionIds).toHaveBeenCalledTimes(2)
  })
  it('filters control baselines in batches and rechecks access on the next baseline', async () => {
    const f = fixture()
    const server = createServer()
    server.on('upgrade', (req, socket, head) => { void f.gateway.upgrade(req, socket, head) })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const socket = new WebSocket(`ws://127.0.0.1:${(server.address() as { port: number }).port}/api/remote.mux`, { headers: { Cookie: 'chatroom-auth=alice-token' } })
    try {
      await once(socket, 'open')
      socket.send(JSON.stringify({ type: 'open', streamId: 'control', endpoint: 'session/control', payload: { args: { request: {} } } }))
      await vi.waitFor(() => expect(f.events).toHaveBeenCalledOnce())
      for (const allowed of [true, false]) {
        if (!allowed) f.permitted.delete('alice-solo')
        const pending = once(socket, 'message')
        f.push({ type: 'baseline', value: { projections: { 'alice-solo': { state: 'own' }, 'bob-solo': { state: 'private' } } } })
        const [frame] = await pending
        expect(JSON.parse(String(frame)).value.value.projections).toEqual(allowed ? { 'alice-solo': { state: 'own' } } : {})
      }
      expect(f.runtime.canAccessNativeSession).not.toHaveBeenCalled()
      expect(f.runtime.accessibleNativeSessionIds).toHaveBeenCalledTimes(2)
    } finally { socket.terminate(); await new Promise<void>(resolve => server.close(() => resolve())) }
  })
  it.each(['settings/describe', 'llm/listConfigurableProviders', 'credentials/set', 'dynamicCordisRunner/inventory', 'directoryPicker/list', 'workspace/create', 'terminal/open', 'unknown/execute'])('denies member operator endpoint %s', async method => {
    const f = fixture()
    expect((await f.gateway.fetch(rpc(method))).status).toBe(403)
    expect(f.dispatch).not.toHaveBeenCalled()
  })
  it.each(['settings/describe', 'llm/listConfigurableProviders'])('allows an authorized administrator to use %s', async method => {
    const f = fixture()
    f.account.role = 'super-admin'
    expect((await f.gateway.fetch(rpc(method))).status).toBe(200)
    expect(f.dispatch).toHaveBeenCalledOnce()
  })
  it('forwards settings invalidations only while the stream account is an administrator', async () => {
    const f = fixture()
    const server = createServer()
    server.on('upgrade', (req, socket, head) => { void f.gateway.upgrade(req, socket, head) })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const socket = new WebSocket(`ws://127.0.0.1:${(server.address() as { port: number }).port}/api/remote.mux`, { headers: { Cookie: 'chatroom-auth=alice-token' } })
    const frames: unknown[] = []
    socket.on('message', frame => frames.push(JSON.parse(String(frame)).value))
    try {
      await once(socket, 'open')
      socket.send(JSON.stringify({ type: 'open', streamId: 'events', endpoint: '$events', payload: { args: {} } }))
      await vi.waitFor(() => expect(f.events).toHaveBeenCalledOnce())
      for (const admin of [false, true, false]) {
        frames.length = 0
        f.account.role = admin ? 'super-admin' : 'member'
        const invalidation = { type: 'emit', event: 'settings/document-updated', args: [{ revision: 8 }] }
        f.push(invalidation)
        // The following allowed frame is a barrier: every previous frame has been filtered.
        f.push({ type: 'emit', event: 'llm/adapters-updated', args: [] })
        await vi.waitFor(() => expect(frames.some((frame: any) => frame.event === 'llm/adapters-updated')).toBe(true))
        expect(frames).toContainEqual({ type: 'emit', event: 'llm/adapters-updated', args: [] })
        expect(frames.filter((frame: any) => frame.event === 'settings/document-updated')).toEqual(admin ? [invalidation] : [])
        expect((await f.gateway.fetch(rpc('settings/describe'))).status).toBe(admin ? 200 : 403)
      }
    } finally { socket.terminate(); await new Promise<void>(resolve => server.close(() => resolve())) }
  })
  it.each(['job/follow', 'job/kill'])('permits only session-owned %s', async method => {
    const f = fixture()
    expect((await f.gateway.fetch(rpc(method, { sessionId: 'alice-solo', jobId: 'own-job' }))).status).toBe(200)
    for (const jobId of ['unowned-job', 'foreign-job']) expect((await f.gateway.fetch(rpc(method, { sessionId: 'alice-solo', jobId }))).status).toBe(403)
    expect(f.dispatch).toHaveBeenCalledOnce()
  })
  it('keeps the real mux open for owned job rows and excludes unowned jobs', async () => {
    const f = fixture()
    const server = createServer()
    server.on('upgrade', (req, socket, head) => { void f.gateway.upgrade(req, socket, head) })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const socket = new WebSocket(`ws://127.0.0.1:${(server.address() as { port: number }).port}/api/remote.mux`, { headers: { Cookie: 'chatroom-auth=alice-token' } })
    try {
      await once(socket, 'open')
      socket.send(JSON.stringify({ type: 'open', streamId: 'jobs', endpoint: 'job/list', payload: { args: { request: { sessionId: 'alice-solo' } } } }))
      await vi.waitFor(() => expect(f.events).toHaveBeenCalledOnce())
      const pending = once(socket, 'message')
      f.push({ type: 'rows', jobs: [{ id: 'own-job', owner: 'alice-solo' }, { id: 'foreign-job', owner: 'bob-solo' }, { id: 'unowned-job' }] })
      const [frame] = await pending
      expect(JSON.parse(String(frame)).value.jobs).toEqual([{ id: 'own-job', owner: 'alice-solo' }])
      expect(socket.readyState).toBe(WebSocket.OPEN)
    } finally { socket.terminate(); await new Promise<void>(resolve => server.close(() => resolve())) }
  })
  it('requires a reserved native Session and checks move anchors', async () => {
    const f = fixture()
    expect((await f.gateway.fetch(rpc('session/create', { sessionId: 'bob-solo' }))).status).toBe(403)
    expect((await f.gateway.fetch(rpc('session/create', { sessionId: 'alice-solo' }))).status).toBe(200)
    expect((await f.gateway.fetch(rpc('workspace/insertSessionBefore', { sessionId: 'alice-solo', beforeSessionId: 'bob-solo' }))).status).toBe(403)
  })
  it('creates native drafts in the configured workspace with an owned reservation', async () => {
    const f = fixture()
    expect((await f.gateway.fetch(rpc('session/create'))).status).toBe(200)
    const request = f.dispatch.mock.calls[0]![0]
    expect((await request.json()).payload.args.request).toEqual({ sessionId: 'alice-solo', cwd: process.cwd() })
    expect((await f.gateway.fetch(rpc('session/create', { cwd: '/' }))).status).toBe(403)
    expect(f.dispatch).toHaveBeenCalledOnce()
  })
  it('routes group prompts through participant-aware intake', async () => {
    const f = fixture()
    vi.mocked(f.runtime.submitNativeSession).mockResolvedValue(true)
    const response = await f.gateway.fetch(rpc('session/prompt', { sessionId: 'shared-room', requestId: 'native-request', clientTimeZone: 'Asia/Shanghai', mode: 'queue', content: [{ type: 'text', text: 'human discussion' }] }))
    expect((await response.json()).result.value.accepted).toBe(true)
    expect(f.runtime.submitNativeSession).toHaveBeenCalledWith('shared-room', f.account, [{ type: 'text', text: 'human discussion' }], 'queue', { requestId: 'native-request', clientTimeZone: 'Asia/Shanghai' })
    expect(f.dispatch).not.toHaveBeenCalled()
  })
  it('rejects invalid native prompt time zones before intake', async () => {
    const f = fixture()
    expect((await f.gateway.fetch(rpc('session/prompt', { sessionId: 'shared-room', requestId: 'native-request', clientTimeZone: 'Invalid/Zone', mode: 'queue', content: [{ type: 'text', text: 'message' }] }))).status).toBe(400)
    expect(f.runtime.submitNativeSession).not.toHaveBeenCalled()
    expect(f.dispatch).not.toHaveBeenCalled()
  })
  it('keeps empty groups visible while preserving reusable personal drafts', async () => {
    const f = fixture()
    f.dispatch.mockImplementation(async () => Response.json({ result: { ok: true, value: { items: ['alice-solo', 'shared-room'].map(sessionId => ({ sessionId, blank: true, projections: { kind: 'cached', asOfSeq: 0, values: { sessionListMetadata: { blank: true, lastPromptAt: null } } } })) } } }))
    const response = await f.gateway.fetch(rpc('session/list'))
    const items = (await response.json()).result.value.items
    expect(items.find((item: { sessionId: string }) => item.sessionId === 'shared-room')).toMatchObject({ blank: false, projections: { values: { sessionListMetadata: { blank: false } } } })
    expect(items.find((item: { sessionId: string }) => item.sessionId === 'alice-solo').blank).toBe(true)
  })
  it('filters reference candidates even when the native result is an array', async () => {
    const f = fixture()
    f.dispatch.mockImplementation(async () => Response.json({ result: { ok: true, value: [{ sessionId: 'bob-solo', title: 'Bob secret' }, { sessionId: 'alice-solo', title: 'Alice' }] } }))
    const response = await f.gateway.fetch(rpc('sessionReferenceResolver/candidates', { agentId: 'alice-solo' }))
    expect((await response.json()).result.value).toEqual([{ sessionId: 'alice-solo', title: 'Alice' }])
  })
  it.each(['GET', 'HEAD'])('serves authorized native Markdown images with %s', async method => {
    const f = fixture()
    f.dispatch.mockImplementation(async request => new Response(request.method === 'HEAD' ? null : 'image', { headers: { 'Content-Type': 'image/png' } }))
    const response = await f.gateway.fetch(new Request('http://127.0.0.1/api/file?path=%2Fworkspace%2Fchart.png', { method, headers: { Cookie: 'chatroom-auth=alice-token' } }))
    expect(response.status).toBe(200)
    expect(f.runtime.assertNativeFileAccess).toHaveBeenCalledWith('/workspace/chart.png', f.account, expect.any(AbortSignal))
    expect(await response.text()).toBe(method === 'HEAD' ? '' : 'image')
    expect((await f.gateway.fetch(new Request('http://127.0.0.1/api/file?path=/etc/passwd'))).status).toBe(401)
    expect(f.dispatch).toHaveBeenCalledOnce()
  })
  it('authorizes binary uploads before touching the body', async () => {
    const f = fixture()
    const request = new Request('http://127.0.0.1/api/session/uploadFileBinary?sessionId=bob-solo', { method: 'POST', headers: { Cookie: 'chatroom-auth=alice-token' }, body: new Uint8Array([1, 2]) })
    expect((await f.gateway.fetch(request)).status).toBe(403)
    expect(f.dispatch).not.toHaveBeenCalled()
  })
  it('rejects a foreign upload at the HTTP boundary before its body arrives', async () => {
    const f = fixture()
    const server = createServer((req, res) => { void f.gateway.handle(req, res) })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const address = server.address() as { port: number }
    const upload = httpRequest({ hostname: '127.0.0.1', port: address.port, method: 'POST', path: '/api/session/uploadFileBinary?sessionId=bob-solo', headers: { Cookie: 'chatroom-auth=alice-token', 'Content-Length': 1000000 } })
    try {
      const response = once(upload, 'response')
      upload.flushHeaders()
      const [result] = await response
      expect(result.statusCode).toBe(403)
      result.resume()
      expect(f.dispatch).not.toHaveBeenCalled()
    } finally { upload.destroy(); server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())) }
  })
  it('protects the native dotted export endpoint and prevents descendant traversal', async () => {
    const f = fixture()
    for (const query of ['sessionId=bob-solo', 'sessionId=alice-solo&includeDescendants=true']) {
      expect((await f.gateway.fetch(new Request(`http://127.0.0.1/api/session.export?${query}`, { headers: { Cookie: 'chatroom-auth=alice-token' } }))).status).toBe(403)
    }
    expect(f.dispatch).not.toHaveBeenCalled()
  })
  it('authorizes native history addresses, including both identities of a subagent address', async () => {
    const f = fixture()
    expect((await f.gateway.fetch(rpc('session/page', { address: { kind: 'session', sessionId: 'alice-solo' }, throughSeq: 0 }))).status).toBe(200)
    for (const [parentSessionId, childSessionId] of [['alice-solo', 'bob-solo'], ['bob-solo', 'alice-solo']]) {
      expect((await f.gateway.fetch(rpc('session/page', { address: { kind: 'subagent', parentSessionId, childSessionId, mode: 'one-shot' }, throughSeq: 0 }))).status).toBe(403)
    }
    expect(f.dispatch).toHaveBeenCalledOnce()
  })
  it('rejects cross-origin requests and unrelated event results', async () => {
    const f = fixture()
    const request = rpc('session/list')
    request.headers.set('origin', 'https://evil.example')
    expect((await f.gateway.fetch(request)).status).toBe(403)
    expect((await f.gateway.fetch(rpc('$events/result', { clientId: 'other-client', eventId: 'other-event' }))).status).toBe(403)
  })
  it('accepts a delivered native interaction once and releases denied deliveries', async () => {
    const f = fixture()
    const server = createServer()
    server.on('upgrade', (req, socket, head) => { void f.gateway.upgrade(req, socket, head) })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const { port } = server.address() as { port: number }
    const socket = new WebSocket(`ws://127.0.0.1:${port}/api/remote.mux`, { headers: { Cookie: 'chatroom-auth=alice-token' } })
    const resultRequest = (eventId: string) => new Request('http://127.0.0.1/api/$events/result', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: 'chatroom-auth=alice-token' },
      body: JSON.stringify({ type: 'client-request', rpcId: 'result', method: '$events/result',
        payload: { args: { clientId: 'client', eventId, outcome: { kind: 'return', value: true } } } }),
    })
    try {
      await once(socket, 'open')
      socket.send(JSON.stringify({ type: 'open', streamId: 'events', endpoint: '$events', payload: { args: {} } }))
      await vi.waitFor(() => expect(f.events).toHaveBeenCalledOnce())
      let received = once(socket, 'message')
      f.push({ type: 'ready', clientId: 'client', host: {} })
      await received
      received = once(socket, 'message')
      f.push({ type: 'waterfall', eventId: 'approval', agentId: 'alice-solo', event: 'permission/request', args: [] })
      await received
      expect((await f.gateway.fetch(resultRequest('approval'))).status).toBe(200)
      expect((await f.gateway.fetch(resultRequest('approval'))).status).toBe(403)
      f.dispatch.mockClear()
      f.push({ type: 'waterfall', eventId: 'foreign', agentId: 'bob-solo', event: 'permission/request', args: [] })
      await vi.waitFor(() => expect(f.dispatch).toHaveBeenCalledOnce())
      expect((await f.dispatch.mock.calls[0]![0].json()).payload).toEqual({ args: {
        clientId: 'client', eventId: 'foreign', outcome: { kind: 'next' },
      } })
      expect((await f.gateway.fetch(resultRequest('foreign'))).status).toBe(403)
    } finally { socket.terminate(); await new Promise<void>(resolve => server.close(() => resolve())) }
  })
  it('filters actual WS control baselines and revokes delivery after logout', async () => {
    const f = fixture()
    const server = createServer()
    server.on('upgrade', (req, socket, head) => { void f.gateway.upgrade(req, socket, head) })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const address = server.address() as { port: number }
    const socket = new WebSocket(`ws://127.0.0.1:${address.port}/api/remote.mux`, { headers: { Cookie: 'chatroom-auth=alice-token' } })
    try {
      await once(socket, 'open')
      socket.send(JSON.stringify({ type: 'open', streamId: 'control', endpoint: 'session/control', payload: { args: {} } }))
      await vi.waitFor(() => expect(f.events).toHaveBeenCalledOnce())
      const first = once(socket, 'message')
      f.push({ type: 'baseline', value: { projections: { 'alice-solo': { asOfSeq: 0, values: {} }, 'bob-solo': { secret: 'Bob' } } } })
      const [message] = await first
      expect(String(message)).toContain('alice-solo')
      expect(String(message)).not.toContain('Bob')
      expect(String(message)).not.toContain('bob-solo')
      f.revoke()
      const denied = once(socket, 'message')
      f.push({ type: 'projection', sessionId: 'alice-solo', key: 'inbox', value: 'late private data', seq: 1 })
      const [error] = await denied
      expect(JSON.parse(String(error)).type).toBe('error')
      expect(String(error)).not.toContain('late private data')
    } finally { socket.terminate(); await new Promise<void>(resolve => server.close(() => resolve())) }
  })
})
