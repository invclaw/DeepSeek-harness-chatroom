/** Authenticated carrier for native Harness RPC and browser event downlinks. */
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { realpath } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Duplex } from 'node:stream'
import type { Context } from '@deepseek-ai/cordis'
import { HostConnectionService, HOST_EVENTS_PATH, MUX_EVENTS_PATH } from '@deepseek-ai/dsh-client-connection'
import { toFetchHandler } from '@deepseek-ai/dsh-host-apiproxy'
import { RpcId, type HostFrame, type MuxFrame, type WorkspaceView } from '@deepseek-ai/dsh-host-apiproxy/api'
import { sessionCreateRequestSchema, sessionPromptRequestSchema } from '@deepseek-ai/dsh-host-apiproxy/api/sessions.schema'
import { WebSocket, WebSocketServer } from 'ws'
import type { Config } from './config.js'
import { cookieValue } from './cookies.js'
import type { ChatroomAccount, ChatroomIdentity } from './types.js'
import { ChatroomInputError, type ChatroomRuntime } from './room.js'

const SESSION_METHODS = new Set([
  'session.history', 'session.models', 'session.selectModel', 'session.rename', 'session.fork',
  'session.prompt', 'session.attachment', 'session.cancel', 'session.updateQueue', 'agentPreset.select',
  'goal.create', 'goal.edit', 'goal.pause', 'goal.resume', 'goal.complete', 'goal.clear',
  'workspace.archiveSession', 'workspace.insertSessionBefore',
])
const PUBLIC_METHODS = new Set(['session.list', 'session.search', 'workspace.list', 'host.describe', 'skill.list', 'agentPreset.list', 'llm.providers', 'llm.models', 'dynamicCordisRunner/inventory'])
const ADMIN_METHODS = new Set([
  'settings.describe', 'settings.openDocument', 'settings.update', 'settings.replace', 'settings.mutate',
  'credentials.describe', 'credentials.set', 'credentials.unset', 'llm.discoverModels',
  'dynamicCordisRunner/syncInspectManifest',
  'host.pickDirectory', 'host.listDirectory', 'host.createDirectory', 'host.openPath',
  'workspace.create', 'workspace.rename', 'workspace.delete', 'workspace.insertBefore',
  'agentPreset.read', 'agentPreset.copy', 'agentPreset.openDocument', 'agentPreset.remove',
])
const SESSION_REMOTES = new Set([
  'commands/list', 'commands/execute', 'fileReferences/list', 'sessionReferenceResolver/candidates',
  'dynamicCordisRunner/getClientCode', 'dynamicCordisRunner/reportClientGuardFailure',
  'dynamicCordisRunner/reportRenderFailure', 'dynamicCordisRunner/resolveInspectQuery',
  'dynamicCordisRunner/runHostHalf', 'dynamicCordisRunner/settleUserRun',
  'dynamicCordisRunner/stopFromPanel', 'dynamicCordisRunner/undefineFromPanel',
  'goals/create', 'goals/edit', 'goals/pause', 'goals/resume', 'goals/complete', 'goals/clear',
])

class CarrierError extends Error {
  constructor(readonly status: number, message: string) { super(message) }
}

type FetchHandler = (request: Request) => Promise<Response>
type Frame = { rpcId: string; payload: MuxFrame | HostFrame }

/** Owns the complete native browser transport; no unauthenticated fallback is mounted. */
export class NativeGateway {
  private readonly server = new WebSocketServer({ noServer: true })
  private readonly pumps = new Set<Promise<void>>()
  private readonly requests = new Set<AbortController>()
  private readonly answerable = new Map<string, string>()
  private stopped = false
  private readonly renewals = new WeakMap<Request, string>()
  private readonly upgradeRenewals = new WeakMap<IncomingMessage, string>()
  private readonly requestCompletions = new Set<Promise<void>>()

  constructor(
    private readonly ctx: Context,
    private readonly runtime: ChatroomRuntime,
    private readonly config: Config,
    private readonly dispatch: FetchHandler,
  ) {
    this.server.on('headers', (headers, request) => {
      const cookie = this.upgradeRenewals.get(request)
      if (cookie !== undefined) headers.push(`Set-Cookie: ${cookie}`)
    })
  }

  /** Check authentication and authorization before dispatching a native or Remote request. */
  async fetch(request: Request): Promise<Response> {
    const response = await this.authorizedFetch(request)
    const renewal = this.renewals.get(request)
    if (renewal === undefined) return response
    const headers = new Headers(response.headers)
    headers.append('Set-Cookie', renewal)
    return new Response(response.body, { status: response.status, headers })
  }

  private async authorizedFetch(request: Request): Promise<Response> {
    try {
      this.assertOrigin(request)
      const identity = await this.identity(request)
      const path = new URL(request.url).pathname
      const method = path.slice('/api/'.length)
      if (path === MUX_EVENTS_PATH || path === HOST_EVENTS_PATH) return new Response('WebSocket required', { status: 426 })
      if (!this.config.authEnabled) return await this.dispatch(request)
      if (identity === undefined) throw new CarrierError(401, '请先登录。')
      const canAccess = (id: unknown): Promise<boolean> => typeof id === 'string'
        ? this.runtime.canAccessNativeSession(id, identity)
        : Promise.resolve(false)
      const requireSession = async (id: unknown): Promise<void> => {
        if (!await canAccess(id)) throw new CarrierError(403, '会话不存在或你无权访问。')
      }
      if (method === 'session.export') {
        const url = new URL(request.url)
        await requireSession(url.searchParams.get('sessionId'))
        // A native export may traverse separately owned forks. Export one authorized log at a time.
        if (url.searchParams.get('includeDescendants') === 'true') throw new CarrierError(403, '请单独导出有权访问的会话。')
        return await this.dispatch(request)
      }
      if (request.method !== 'POST') throw new CarrierError(405, 'POST required')
      const body: unknown = await request.clone().json()
      if (!isRecord(body) || typeof body.rpcId !== 'string') throw new CarrierError(400, 'Invalid RPC envelope')
      if (method === 'respond') {
        const sessionId = this.answerable.get(body.rpcId)
        await requireSession(sessionId)
        const result = await this.dispatch(request)
        if (result.ok) this.answerable.delete(body.rpcId)
        return result
      }
      if (body.type !== 'client-request' || body.method !== method || !isRecord(body.payload)) {
        throw new CarrierError(400, 'Invalid RPC envelope')
      }
      const payload = body.payload
      if (SESSION_METHODS.has(method)) {
        await requireSession(payload.sessionId)
        if (payload.beforeSessionId !== undefined) await requireSession(payload.beforeSessionId)
        if (method === 'session.updateQueue' && this.runtime.ownsSession(String(payload.sessionId))) {
          // Group queue ownership is stricter than room membership and is enforced by the chatroom endpoint.
          throw new CarrierError(403, '请通过群聊队列操作自己的消息。')
        }
      } else if (method.startsWith('subagent.') && ['subagent.list', 'subagent.history', 'subagent.prompt', 'subagent.interrupt'].includes(method)) {
        await requireSession(payload.parentSessionId)
        if (method !== 'subagent.list') await requireSession(payload.childSessionId)
      } else if (method === 'session.create') {
        if (!sessionCreateRequestSchema.safeParse(payload).success) throw new CarrierError(400, 'Invalid session creation')
        if (payload.cwd !== undefined && payload.cwd !== this.config.cwd) throw new CarrierError(403, '只能在聊天室工作区创建会话。')
        if (payload.workspaceId !== undefined) {
          const listed = await this.ctx.apiProxy.workspace.list({ rpcId: RpcId(randomUUID()), payload: {} })
          if (!listed.result.ok || !await this.isWorkspace(listed.result.value.items.find(item => item.workspaceId === payload.workspaceId)?.path)) {
            throw new CarrierError(403, '只能在聊天室工作区创建会话。')
          }
        }
        if (payload.sessionId === undefined) payload.sessionId = await this.runtime.reserveSoloSession(identity)
        if (typeof payload.sessionId !== 'string' || !this.runtime.ownsSoloSession(payload.sessionId, identity)) {
          throw new CarrierError(403, '请先预留自己的 Solo 会话。')
        }
      } else if (SESSION_REMOTES.has(method)) {
        if (!isRecord(payload.args)) throw new CarrierError(400, 'Invalid Remote arguments')
        await requireSession(payload.args.agentId)
        if (method === 'commands/execute' && typeof payload.args.line === 'string') await this.runtime.assertPromptReferences(identity, [{ type: 'text', text: payload.args.line }])
      } else if (ADMIN_METHODS.has(method)) {
        if (!this.isAdmin(identity)) throw new CarrierError(403, '仅管理员可操作部署设置。')
      } else if (!PUBLIC_METHODS.has(method)) {
        throw new CarrierError(403, '此接口尚未配置账号权限。')
      }
      if (method === 'session.prompt') {
        const parsed = sessionPromptRequestSchema.safeParse(payload)
        if (!parsed.success) throw new CarrierError(400, 'Invalid prompt')
        const input = parsed.data
        await this.runtime.assertPromptReferences(identity, input.content)
        const command = input.content.length === 1 && input.content[0]?.type === 'text' && input.content[0].text.startsWith('/')
        if (!command && await this.runtime.submitNativeSession(input.sessionId, identity, input.content, input.mode)) {
          return Response.json({ type: 'server-response', rpcId: body.rpcId, result: { ok: true, value: { accepted: true } } })
        }
      }
      const authorizedRequest = method === 'session.create'
        ? new Request(request.url, { method: 'POST', headers: request.headers, signal: request.signal, body: JSON.stringify({ ...body, payload: { ...payload, ...(payload.workspaceId === undefined ? { cwd: this.config.cwd } : {}) } }) })
        : request
      const response = await this.dispatch(authorizedRequest)
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return response
      const output: unknown = await response.json()
      if (!isRecord(output) || !isRecord(output.result) || output.result.ok !== true) return Response.json(output, { status: response.status })
      if ((method === 'sessionReferenceResolver/candidates' || method === 'dynamicCordisRunner/inventory') && Array.isArray(output.result.value)) {
        output.result.value = await filterAsync(output.result.value, item => isRecord(item) ? canAccess(method === 'sessionReferenceResolver/candidates' ? item.sessionId : item.agentId) : Promise.resolve(false))
      }
      if (!isRecord(output.result.value)) return Response.json(output, { status: response.status })
      const value = output.result.value
      if (method === 'session.fork' && typeof value.sessionId === 'string') await this.runtime.ownNativeFork(value.sessionId, identity)
      if ((method === 'session.list' || method === 'session.search') && Array.isArray(value.items)) {
        value.items = await filterAsync(value.items, item => isRecord(item) ? canAccess(item.sessionId) : Promise.resolve(false))
        if (method === 'session.search') value.hasMore = false
      }
      if (method.startsWith('workspace.')) {
        if (Array.isArray(value.items)) value.items = (await Promise.all(value.items.map(item => this.workspace(item as WorkspaceView, identity)))).filter(item => item !== undefined)
        if (isRecord(value.workspace)) value.workspace = await this.workspace(value.workspace as unknown as WorkspaceView, identity)
        if (Array.isArray(value.archivedSessionIds)) value.archivedSessionIds = await filterAsync(value.archivedSessionIds, canAccess)
      }
      return Response.json(output, { status: response.status })
    } catch (error) {
      const status = error instanceof CarrierError ? error.status : error instanceof ChatroomInputError ? 403 : error instanceof SyntaxError ? 400 : 500
      return Response.json({ error: error instanceof CarrierError || error instanceof ChatroomInputError ? error.message : 'Native request failed' }, { status })
    }
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

  /** Authenticate before upgrading; each outgoing frame rechecks account and session access. */
  async upgrade(request: IncomingMessage, socket: Duplex, head: Buffer, kind: 'mux' | 'host'): Promise<void> {
    const fetchRequest = new Request(`http://${request.headers.host ?? 'localhost'}${request.url ?? '/'}`, { headers: nodeHeaders(request) })
    try {
      this.assertOrigin(fetchRequest)
      await this.identity(fetchRequest)
      const renewal = this.renewals.get(fetchRequest)
      if (renewal !== undefined) this.upgradeRenewals.set(request, renewal)
    } catch (error) {
      socket.end(`HTTP/1.1 ${error instanceof CarrierError ? error.status : 500} Forbidden\r\nConnection: close\r\n\r\n`)
      return
    }
    if (this.stopped || socket.destroyed) { socket.destroy(); return }
    this.server.handleUpgrade(request, socket, head, websocket => {
      const abort = new AbortController()
      websocket.once('close', () => abort.abort())
      websocket.once('error', () => abort.abort())
      websocket.once('message', () => websocket.close(1008, 'Downlink only'))
      const source = this.ctx.apiProxy.events[kind]({ rpcId: RpcId(randomUUID()), payload: {} }, abort.signal)
      const pump = this.pump(websocket, fetchRequest, source, abort)
      this.pumps.add(pump)
      void pump.finally(() => this.pumps.delete(pump))
    })
  }

  /** Stop intake, cancel disconnected work, and await all owned downlink iterators. */
  async close(): Promise<void> {
    this.stopped = true
    for (const abort of this.requests) abort.abort()
    for (const socket of this.server.clients) socket.terminate()
    await Promise.allSettled([...this.pumps, ...this.requestCompletions])
    await new Promise<void>(resolve => this.server.close(() => resolve()))
    this.answerable.clear()
  }

  private async pump(socket: WebSocket, request: Request, frames: AsyncIterable<Frame>, abort: AbortController): Promise<void> {
    // An idle socket must also lose access when its login expires or is revoked.
    const heartbeat = setInterval(() => {
      void this.identity(request).catch(() => socket.terminate())
    }, this.config.sseHeartbeatMs)
    heartbeat.unref()
    try {
      for await (const frame of frames) {
        const identity = await this.identity(request)
        const payload = this.config.authEnabled && identity !== undefined ? await this.filterFrame(frame, identity) : frame.payload
        if (payload === undefined) continue
        await new Promise<void>((resolve, reject) => socket.send(JSON.stringify({ type: 'server-request', rpcId: frame.rpcId, method: payload.type, payload }), error => error ? reject(error) : resolve()))
      }
    } catch {
      // Carrier errors and cancelled source iterators terminate this account's downlink.
    } finally {
      clearInterval(heartbeat)
      abort.abort()
      socket.terminate()
    }
  }

  private async filterFrame(frame: Frame, identity: ChatroomIdentity): Promise<Frame['payload'] | undefined> {
    const payload = frame.payload
    if ('sessionId' in payload) {
      if (!await this.runtime.canAccessNativeSession(payload.sessionId, identity)) return undefined
      if (payload.type === 'approval/requested' || payload.type === 'question/requested') this.answerable.set(frame.rpcId, payload.sessionId)
      return payload
    }
    if (payload.type === 'host/workspace-changed') {
      const workspace = await this.workspace(payload.workspace, identity)
      return workspace === undefined ? undefined : { ...payload, workspace }
    }
    if (payload.type === 'host/archived-sessions-changed') return { ...payload, archivedSessionIds: await filterAsync(payload.archivedSessionIds, id => this.runtime.canAccessNativeSession(id, identity)) }
    if (payload.type === 'host/remote-event') {
      if (payload.event === 'llm/adapters-updated') return payload
      if (payload.event === 'agent-preset/selected' || payload.event === 'commands/change') {
        return typeof payload.args[0] === 'string' && await this.runtime.canAccessNativeSession(payload.args[0], identity) ? payload : undefined
      }
      return this.isAdmin(identity) && ['credentials/reference-updated', 'settings/document-updated'].includes(payload.event) ? payload : undefined
    }
    // Unknown or globally scoped frames need an explicit account projection before publication.
    return undefined
  }

  private async workspace(value: WorkspaceView, identity: ChatroomIdentity): Promise<WorkspaceView | undefined> {
    const sessionIds = await filterAsync(value.sessionIds, id => this.runtime.canAccessNativeSession(id, identity))
    return sessionIds.length > 0 || await this.isWorkspace(value.path) ? { ...value, sessionIds } : undefined
  }

  private async isWorkspace(path: string | undefined): Promise<boolean> {
    return path !== undefined && (path === this.config.cwd || path === await realpath(this.config.cwd))
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

/** Mount the native connection service and authenticated route owners in the chatroom fiber. */
export function registerNativeGateway(ctx: Context, runtime: ChatroomRuntime, config: Config): () => Promise<void> {
  const hosts = [...(config.nativeTrustedHosts ?? []), ...(config.authPublicOrigin === '' ? [] : [new URL(config.authPublicOrigin).host])]
  const connection = new HostConnectionService(ctx, hosts)
  const handler = toFetchHandler(ctx.apiProxy)
  const shared = connection.createSharedFetchHandler('/api', handler)
  const gateway = new NativeGateway(ctx, runtime, config, request => shared.fetch(request))
  const disposers: Array<() => void> = []
  try {
    disposers.push(ctx.webServer.register({ kind: 'prefix', path: '/api', handler: (req, res) => gateway.handle(req, res) }))
    disposers.push(ctx.webServer.registerUpgrade({ path: MUX_EVENTS_PATH, handler: (req, socket, head) => gateway.upgrade(req, socket, head, 'mux') }))
    disposers.push(ctx.webServer.registerUpgrade({ path: HOST_EVENTS_PATH, handler: (req, socket, head) => gateway.upgrade(req, socket, head, 'host') }))
  } catch (error) {
    for (const dispose of disposers.reverse()) dispose()
    void gateway.close()
    throw error
  }
  return async () => {
    for (const dispose of disposers.splice(0).reverse()) dispose()
    await gateway.close()
  }
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
