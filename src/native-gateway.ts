/** Account-authorized adapter for the rc.1 native RPC and stream mux. */
import { once } from 'node:events'
import { realpath } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Duplex } from 'node:stream'
import type { Context } from '@deepseek-ai/cordis'
import type { WorkspaceView } from '@deepseek-ai/dsh-api-workspace-controller/types'
import type { Config } from './config.js'
import { cookieValue } from './cookies.js'
import type { ChatroomAccount, ChatroomIdentity, ChatroomPromptContentPart } from './types.js'
import { ChatroomInputError, type ChatroomRuntime } from './room.js'
import { createNativeTransport, type NativeTransport } from './native-platform.js'

const MUX_PATH = '/api/remote.mux'
const PUBLIC_METHODS = new Set([
  'session/list', 'session/search', 'session/modelCatalog', 'session/canOpenWorkspacePath',
  'workspace/list', 'agentPresets/list', 'agentPreset/list', 'llm/providers', 'llm/models',
  'dynamicCordisRunner/inventory',
])
const SESSION_METHODS = new Set([
  'session/page', 'session/selectModel', 'session/rename', 'session/fork', 'session/prompt',
  'session/attachment', 'session/cancel', 'session/updateQueue',
  'workspace/archiveSession', 'workspace/insertSessionBefore', 'agentPresets/select',
  'subagents/list', 'subagents/prompt', 'subagents/interruptByParent',
  'commands/list', 'commands/execute', 'fileReferences/list', 'sessionReferenceResolver/candidates',
  'goals/create', 'goals/edit', 'goals/pause', 'goals/resume', 'goals/complete', 'goals/clear',
])
const SESSION_EVENTS = new Set([
  'agent-preset/selected', 'api-session/activity', 'api-session/error', 'api-session/removed',
  'api-session/status', 'commands/change',
])
class CarrierError extends Error {
  constructor(readonly status: number, message: string) { super(message) }
}
type FetchHandler = (request: Request) => Promise<Response>
type Mux = InstanceType<NativeTransport['Mux']>

/** Every native request and every stream item is checked against current account ownership. */
export class NativeGateway {
  private readonly requests = new Set<AbortController>()
  private readonly requestCompletions = new Set<Promise<void>>()
  private readonly renewals = new WeakMap<Request, string>()
  private readonly muxes = new Map<Duplex, Mux>()
  private readonly answerable = new Map<string, { participantId: string; sessionId: string }>()
  private stopped = false

  constructor(
    private readonly ctx: Context,
    private readonly runtime: ChatroomRuntime,
    private readonly config: Config,
    private readonly dispatch: FetchHandler,
    private readonly transport: NativeTransport,
  ) {}

  async fetch(request: Request): Promise<Response> {
    const response = await this.authorizedFetch(request)
    const renewal = this.renewals.get(request)
    if (renewal === undefined) return response
    const headers = new Headers(response.headers)
    headers.append('Set-Cookie', renewal)
    return new Response(response.body, { status: response.status, headers })
  }

  private async requireSession(id: unknown, identity: ChatroomIdentity): Promise<void> {
    if (typeof id !== 'string' || !await this.runtime.canAccessNativeSession(id, identity)) {
      throw new CarrierError(403, '会话不存在或你无权访问。')
    }
  }

  private async sessionArguments(args: Record<string, unknown>, identity: ChatroomIdentity): Promise<void> {
    const request = isRecord(args.request) ? args.request : args
    const address = isRecord(request.address) ? request.address : request
    const ids = ['sessionId', 'agentId', 'parentSessionId', 'childSessionId', 'beforeSessionId']
      .filter(key => address[key] !== undefined).map(key => address[key])
    if (ids.length === 0) throw new CarrierError(400, 'Missing session identity')
    for (const id of ids) await this.requireSession(id, identity)
  }

  private async authorizedFetch(request: Request): Promise<Response> {
    try {
      this.assertOrigin(request)
      const identity = await this.identity(request)
      const url = new URL(request.url)
      if (url.pathname === MUX_PATH) return new Response('WebSocket required', { status: 426 })
      if (!this.config.authEnabled) return await this.dispatch(request)
      if (identity === undefined) throw new CarrierError(401, '请先登录。')
      const endpoint = url.pathname.slice('/api/'.length)
      if (request.method !== 'POST') throw new CarrierError(405, 'POST required')
      const body: unknown = await request.clone().json()
      if (!isRecord(body) || body.type !== 'client-request' || typeof body.rpcId !== 'string'
        || body.method !== endpoint || !isRecord(body.payload)) throw new CarrierError(400, 'Invalid RPC envelope')
      const args = body.payload.args
      // $events/result is a native carrier message, not a reflected service call.
      if (endpoint === '$events/result') {
        const result = isRecord(args) ? args : body.payload
        const owned = this.answerable.get(String(result.clientId) + ':' + String(result.eventId))
        if (owned?.participantId !== identity.participantId) throw new CarrierError(403, 'No authorized event delivery')
        await this.requireSession(owned.sessionId, identity)
      } else {
        if (!isRecord(args)) throw new CarrierError(400, 'Invalid Remote arguments')
        const input = isRecord(args.request) ? args.request : args
        if (SESSION_METHODS.has(endpoint)) {
          await this.sessionArguments(args, identity)
          if (endpoint === 'session/updateQueue' && this.runtime.ownsSession(String(input.sessionId))) {
            throw new CarrierError(403, '请通过群聊队列操作自己的消息。')
          }
        } else if (endpoint === 'session/create') {
          for (const key of ['agentPreset', 'sessionId', 'workspaceId', 'cwd']) {
            if (input[key] !== undefined && typeof input[key] !== 'string') throw new CarrierError(400, 'Invalid session creation parameters')
          }
          if (input.cwd !== undefined && !await this.isWorkspace(typeof input.cwd === 'string' ? input.cwd : undefined)) {
            throw new CarrierError(403, '只能在聊天室工作区创建会话。')
          }
          if (input.workspaceId !== undefined) {
            const workspace = this.ctx.workspaceRegistry.list().find(item => String(item.id) === input.workspaceId)
            if (!await this.isWorkspace(workspace?.path)) {
              throw new CarrierError(403, '只能在聊天室工作区创建会话。')
            }
          }
          if (input.sessionId === undefined) input.sessionId = await this.runtime.reserveSoloSession(identity)
          if (typeof input.sessionId !== 'string' || !this.runtime.ownsSoloSession(input.sessionId, identity)) {
            throw new CarrierError(403, '请先预留自己的 Solo 会话。')
          }
          if (input.workspaceId === undefined) input.cwd = this.config.cwd
        } else if (!PUBLIC_METHODS.has(endpoint) && !this.isAdmin(identity)) {
          throw new CarrierError(403, '此接口尚未配置账号权限。')
        }
        if (endpoint === 'session/prompt' || endpoint === 'subagents/prompt') {
          if (input.requestId !== undefined && (typeof input.requestId !== 'string' || !input.requestId.length || input.requestId.length > 256)) throw new CarrierError(400, 'Invalid request identity')
          if (!Array.isArray(input.content) || !input.content.every(isPromptPart)) {
            throw new CarrierError(400, 'Invalid prompt')
          }
          await this.runtime.assertPromptReferences(identity, input.content)
        }
        if (endpoint === 'session/prompt') {
          if (!['queue', 'steer'].includes(String(input.mode)) || typeof input.sessionId !== 'string') throw new CarrierError(400, 'Invalid prompt')
          const content = input.content as ChatroomPromptContentPart[]
          const command = content.length === 1 && content[0]?.type === 'text' && content[0].text.startsWith('/')
          if (!command && await this.runtime.submitNativeSession(input.sessionId, identity, content, input.mode as 'queue' | 'steer', input.requestId as string | undefined)) {
            return Response.json({ type: 'server-response', rpcId: body.rpcId, result: { ok: true, value: { accepted: true } } })
          }
        }
        if (endpoint === 'commands/execute' && typeof input.line === 'string') {
          await this.runtime.assertPromptReferences(identity, [{ type: 'text', text: input.line }])
        }
      }
      const response = await this.dispatch(new Request(request.url, {
        method: 'POST', headers: request.headers, signal: request.signal, body: JSON.stringify(body),
      }))
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return response
      const output: unknown = await response.json()
      if (!isRecord(output) || !isRecord(output.result) || output.result.ok !== true) return Response.json(output, { status: response.status })
      output.result.value = await this.filterResult(endpoint, output.result.value, identity)
      return Response.json(output, { status: response.status })
    } catch (error) {
      const status = error instanceof CarrierError ? error.status : error instanceof ChatroomInputError ? 403 : error instanceof SyntaxError ? 400 : 500
      return Response.json({ error: error instanceof CarrierError || error instanceof ChatroomInputError ? error.message : 'Native request failed' }, { status })
    }
  }

  private async filterResult(endpoint: string, value: unknown, identity: ChatroomIdentity): Promise<unknown> {
    const canAccess = (id: unknown) => typeof id === 'string' ? this.runtime.canAccessNativeSession(id, identity) : Promise.resolve(false)
    if (Array.isArray(value) && ['sessionReferenceResolver/candidates', 'dynamicCordisRunner/inventory'].includes(endpoint)) {
      return await filterAsync(value, item => isRecord(item) ? canAccess(item.sessionId ?? item.agentId) : Promise.resolve(false))
    }
    if (!isRecord(value)) return value
    if (endpoint === 'subagents/list' && Array.isArray(value.entries)) {
      return { ...value, entries: await filterAsync(value.entries, item => isRecord(item) ? canAccess(item.id) : Promise.resolve(false)) }
    }
    if (endpoint === 'session/fork' && typeof value.sessionId === 'string') await this.runtime.ownNativeFork(value.sessionId, identity)
    if (['session/list', 'session/search'].includes(endpoint) && Array.isArray(value.items)) {
      return { ...value, items: (await filterAsync(value.items, item => isRecord(item) ? canAccess(item.sessionId) : Promise.resolve(false))).map(item =>
        isRecord(item) && typeof item.sessionId === 'string' && this.runtime.ownsSession(item.sessionId) ? { ...item, blank: false } : item),
        ...(endpoint === 'session/search' ? { hasMore: false } : {}) }
    }
    if (endpoint.startsWith('workspace/')) {
      const output = { ...value }
      if (Array.isArray(value.items)) output.items = (await Promise.all(value.items.map(item => this.workspace(item as WorkspaceView, identity)))).filter(Boolean)
      if (isRecord(value.workspace)) output.workspace = await this.workspace(value.workspace as unknown as WorkspaceView, identity)
      if (Array.isArray(value.archivedSessionIds)) output.archivedSessionIds = await filterAsync(value.archivedSessionIds, canAccess)
      return output
    }
    return value
  }

  /** Bridge a bounded Node request and propagate disconnect cancellation through the native carrier. */
  async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const abort = new AbortController()
    let finish!: () => void
    const completed = new Promise<void>(resolve => { finish = resolve })
    this.requestCompletions.add(completed)
    this.requests.add(abort)
    const close = (): void => { if (!response.writableFinished) abort.abort() }
    response.once('close', close)
    const cancelBody = (): void => { request.destroy() }
    abort.signal.addEventListener('abort', cancelBody, { once: true })
    try {
      const preflight = new Request(`http://${request.headers.host ?? 'localhost'}${request.url ?? '/'}`, { headers: nodeHeaders(request) })
      this.assertOrigin(preflight)
      await this.identity(preflight)
      const chunks: Buffer[] = []
      let size = 0
      for await (const chunk of request) {
        const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string)
        size += bytes.length
        if (size > (this.config.nativeMaxRequestBytes ?? 300 * 1024 * 1024)) throw new CarrierError(413, 'Request too large')
        chunks.push(bytes)
      }
      const headers = nodeHeaders(request)
      const url = `http://${request.headers.host ?? 'localhost'}${request.url ?? '/'}`
      const result = await this.fetch(new Request(url, {
        method: request.method ?? 'GET', headers, signal: abort.signal,
        ...(chunks.length === 0 ? {} : { body: Buffer.concat(chunks) }),
      }))
      response.writeHead(result.status, Object.fromEntries(result.headers))
      if (result.body !== null) for await (const chunk of result.body) {
        if (!response.write(chunk)) await once(response, 'drain', { signal: abort.signal })
      }
      response.end()
    } catch (error) {
      if (!response.headersSent && !abort.signal.aborted) {
        response.writeHead(error instanceof CarrierError ? error.status : 500)
        response.end('Native request failed')
      } else response.destroy()
    } finally {
      response.off('close', close)
      abort.signal.removeEventListener('abort', cancelBody)
      this.requests.delete(abort)
      this.requestCompletions.delete(completed)
      finish()
    }
  }


  /** Keep one native mux per authenticated socket so identities cannot share an opener. */
  async upgrade(request: IncomingMessage, socket: Duplex, head: Buffer): Promise<void> {
    const fetchRequest = new Request(`http://${request.headers.host ?? 'localhost'}${request.url ?? '/'}`, { headers: nodeHeaders(request) })
    try {
      this.assertOrigin(fetchRequest)
      await this.identity(fetchRequest)
      if (this.stopped || socket.destroyed) { socket.destroy(); return }
      let clientId: string | undefined
      const mux = new this.transport.Mux(async (endpoint, payload, signal) => {
        const identity = await this.identity(fetchRequest)
        if (this.config.authEnabled) {
          if (identity === undefined) throw new CarrierError(401, '请先登录。')
          if (endpoint === 'session/follow') {
            if (!isRecord(payload) || !isRecord(payload.args)) throw new CarrierError(400, 'Invalid stream arguments')
            await this.sessionArguments(payload.args, identity)
          } else if (!['$events', 'session/control', 'workspace/follow'].includes(endpoint)) {
            throw new CarrierError(403, '此数据流尚未配置账号权限。')
          }
        }
        const source = await this.transport.gateway.wireStream.open(endpoint, payload, signal)
        const self = this
        return (async function* () {
          for await (const frame of source) {
            signal.throwIfAborted()
            const current = await self.identity(fetchRequest).catch(error => { socket.destroy(); throw error })
            if (endpoint === '$events' && isRecord(frame) && frame.type === 'ready' && typeof frame.clientId === 'string') clientId = frame.clientId
            if (!self.config.authEnabled || current === undefined) { yield frame; continue }
            if (endpoint === 'session/follow' && isRecord(payload) && isRecord(payload.args)) await self.sessionArguments(payload.args, current)
            const filtered = await self.filterFrame(endpoint, frame, current, clientId)
            if (filtered !== undefined) yield filtered
          }
        })()
      }, this.transport.gateway.wireStream.failure, 2_000)
      this.muxes.set(socket, mux)
      const heartbeat = setInterval(() => { void this.identity(fetchRequest).catch(() => socket.destroy()) }, this.config.sseHeartbeatMs)
      heartbeat.unref()
      socket.once('close', () => {
        clearInterval(heartbeat)
        this.muxes.delete(socket)
        if (clientId !== undefined) for (const key of this.answerable.keys()) if (key.startsWith(clientId + ':')) this.answerable.delete(key)
        void mux.close()
      })
      mux.handleUpgrade(request, socket, head)
    } catch (error) {
      socket.end(`HTTP/1.1 ${error instanceof CarrierError ? error.status : 500} Forbidden\r\nConnection: close\r\n\r\n`)
    }
  }

  private async filterFrame(endpoint: string, frame: unknown, identity: ChatroomIdentity, clientId?: string): Promise<unknown> {
    if (!isRecord(frame)) return undefined
    const canAccess = (id: unknown) => typeof id === 'string' ? this.runtime.canAccessNativeSession(id, identity) : Promise.resolve(false)
    if (endpoint === 'session/follow') return frame
    if (endpoint === 'session/control') {
      if (frame.type === 'baseline' && isRecord(frame.value)) {
        const value: Record<string, unknown> = {}
        for (const key of ['queues', 'jobs', 'projections']) {
          const rows = frame.value[key]
          if (!isRecord(rows)) throw new CarrierError(500, 'Invalid native control baseline')
          value[key] = Object.fromEntries(await filterAsync(Object.entries(rows), ([id]) => canAccess(id)))
        }
        return { ...frame, value }
      }
      return await canAccess(frame.sessionId) ? frame : undefined
    }
    if (endpoint === 'workspace/follow') {
      if (frame.type === 'baseline') return { ...frame, value: await this.filterResult('workspace/list', frame.value, identity) }
      if (frame.type === 'upsert' && isRecord(frame.workspace)) {
        const workspace = await this.workspace(frame.workspace as unknown as WorkspaceView, identity)
        return workspace === undefined ? undefined : { ...frame, workspace }
      }
      if (frame.type === 'archived' && Array.isArray(frame.archivedSessionIds)) return { ...frame, archivedSessionIds: await filterAsync(frame.archivedSessionIds, canAccess) }
      // Order/removal contains only ids, but still must not reveal another workspace.
      return undefined
    }
    if (endpoint !== '$events') return undefined
    if (frame.type === 'ready') return frame
    if (frame.type === 'waterfall' && typeof frame.eventId === 'string' && typeof frame.agentId === 'string'
      && clientId !== undefined && await canAccess(frame.agentId)) {
      this.answerable.set(clientId + ':' + frame.eventId, { participantId: identity.participantId, sessionId: frame.agentId })
      return frame
    }
    if (frame.type === 'cancel' && typeof frame.eventId === 'string' && clientId !== undefined) {
      const key = clientId + ':' + frame.eventId
      const owned = this.answerable.get(key)
      this.answerable.delete(key)
      return owned?.participantId === identity.participantId ? frame : undefined
    }
    if (frame.type !== 'emit' || !Array.isArray(frame.args)) return undefined
    if (frame.event === 'llm/adapters-updated') return frame
    if (frame.event === 'api-session/added') {
      const item = frame.args[0]
      if (!isRecord(item) || !await canAccess(item.sessionId)) return undefined
      return { ...frame, args: [this.runtime.ownsSession(String(item.sessionId)) ? { ...item, blank: false } : item, ...frame.args.slice(1)] }
    }
    if (typeof frame.event === 'string' && SESSION_EVENTS.has(frame.event)) return await canAccess(frame.args[0]) ? frame : undefined
    return this.isAdmin(identity) && ['settings/document-updated', 'credentials/reference-updated'].includes(String(frame.event)) ? frame : undefined
  }

  async close(): Promise<void> {
    this.stopped = true
    for (const abort of this.requests) abort.abort()
    await Promise.allSettled([...this.muxes.values()].map(mux => mux.close()))
    for (const socket of this.muxes.keys()) socket.destroy()
    this.muxes.clear()
    await Promise.allSettled(this.requestCompletions)
    this.answerable.clear()
  }

  private async workspace(value: WorkspaceView, identity: ChatroomIdentity): Promise<WorkspaceView | undefined> {
    const sessionIds = await filterAsync(value.sessionIds, id => this.runtime.canAccessNativeSession(id, identity))
    return sessionIds.length > 0 || await this.isWorkspace(value.path) ? { ...value, sessionIds } : undefined
  }

  private async isWorkspace(path: string | undefined): Promise<boolean> {
    if (path === undefined) return false
    const canonical = (value: string) => process.platform === 'win32' ? resolve(value).toLowerCase() : resolve(value)
    try { return canonical(await realpath(path)) === canonical(await realpath(this.config.cwd)) } catch { return false }
  }

  private async identity(request: Request): Promise<ChatroomIdentity | undefined> {
    if (this.stopped || !this.runtime.isReady) throw new CarrierError(503, '聊天室尚未就绪。')
    if (!this.config.authEnabled) return this.runtime.identity(cookieValue(request.headers.get('cookie') ?? undefined, this.config.cookieName))
    const result = await this.runtime.auth.accountForRequest(
      cookieValue(request.headers.get('cookie') ?? undefined, this.config.authCookieName),
      Object.fromEntries(request.headers), new URL(request.url).pathname,
    )
    if (result.renewalCookie !== undefined) this.renewals.set(request, result.renewalCookie)
    if (result.account === undefined) throw new CarrierError(401, '请先登录。')
    return result.account
  }

  private isAdmin(identity: ChatroomIdentity): boolean {
    return ('role' in identity && (identity as ChatroomAccount).role === 'super-admin') || this.config.settingsAdminParticipantIds.includes(identity.participantId)
  }

  private assertOrigin(request: Request): void {
    const url = new URL(request.url)
    const publicHost = this.config.authPublicOrigin === '' ? undefined : new URL(this.config.authPublicOrigin).host
    const trusted = ['localhost', '127.0.0.1', '[::1]', ...(this.config.nativeTrustedHosts ?? [])]
    if (url.host !== publicHost && !trusted.some(host => host === url.host || host === url.hostname)) throw new CarrierError(403, 'Untrusted host')
    const origin = request.headers.get('origin')
    if (origin !== null && new URL(origin).host !== url.host) throw new CarrierError(403, 'Untrusted origin')
    if (request.headers.get('sec-fetch-site') === 'cross-site') throw new CarrierError(403, 'Cross-site request denied')
  }
}

/** Native Gateway stays the protocol owner; this plugin owns the account trust boundary. */
export async function registerNativeGateway(ctx: Context, runtime: ChatroomRuntime, config: Config): Promise<() => Promise<void>> {
  const hosts = [...(config.nativeTrustedHosts ?? []), ...(config.authPublicOrigin === '' ? [] : [new URL(config.authPublicOrigin).host])]
  const transport = await createNativeTransport(ctx, hosts)
  const shared = transport.connection.createSharedFetchHandler('/api')
  const gateway = new NativeGateway(ctx, runtime, config, request => shared.fetch(request), transport)
  // Only the static login shell is public. RPC, streams and plugin APIs require
  // an account cookie and authorization; no browser-launch token is shared with members.
  if (config.authEnabled) transport.connection.authorizeIndex = (req, res) => {
    const host = req.headers instanceof Headers ? req.headers.get('host') : req.headers.host
    const allowed = typeof host === 'string' && ['localhost', '127.0.0.1', '[::1]', ...hosts].some(item =>
      item === host || item === new URL('http://' + host).hostname)
    if (!allowed) { res.writeHead(403); res.end('Untrusted host'); return false }
    return true
  }
  const disposers: Array<() => void> = []
  try {
    disposers.push(ctx.webServer.register({ kind: 'prefix', path: '/api', handler: (req, res) => gateway.handle(req, res) }))
    disposers.push(ctx.webServer.registerUpgrade({ path: MUX_PATH, handler: (req, socket, head) => gateway.upgrade(req, socket, head) }))
  } catch (error) {
    for (const dispose of disposers.reverse()) dispose()
    await gateway.close()
    throw error
  }
  return async () => { for (const dispose of disposers.splice(0).reverse()) dispose(); await gateway.close() }
}

function isPromptPart(value: unknown): value is ChatroomPromptContentPart {
  if (!isRecord(value)) return false
  if (value.type === 'text') return typeof value.text === 'string'
  return value.type === 'image' && typeof value.data === 'string' && typeof value.mediaType === 'string'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

async function filterAsync<T>(values: readonly T[], include: (value: T) => Promise<boolean>): Promise<T[]> {
  const allowed = await Promise.all(values.map(include))
  return values.filter((_, index) => allowed[index])
}

function nodeHeaders(request: IncomingMessage): Headers {
  const headers = new Headers()
  for (const [name, value] of Object.entries(request.headers)) if (value !== undefined) {
    for (const item of Array.isArray(value) ? value : [value]) headers.append(name, item)
  }
  return headers
}
