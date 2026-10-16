/** Chatroom authorization boundary around the native DSH Remote carrier. */
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { realpath } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Duplex } from 'node:stream'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-gateway'
import type {} from '@deepseek-ai/dsh-api-workspace-controller'
import { HostConnectionService, type ConnectionFetchHandler } from '@deepseek-ai/dsh-client-connection'
import { WebSocket, WebSocketServer } from 'ws'
import type { Config } from './config.js'
import { cookieValue } from './cookies.js'
import type { ChatroomAccount, ChatroomIdentity } from './types.js'
import { ChatroomInputError, type ChatroomRuntime } from './room.js'

const MUX_PATH = '/api/remote.mux'
const PUBLIC = new Set(['session/list', 'session/search', 'session/control', 'workspace/follow', 'agentPresets/list', 'session/modelCatalog', 'session/canOpenWorkspacePath', 'llm/listProviders', 'permissionPresets/catalog'])
const SESSION = new Set(['session/page', 'session/follow', 'session/projections', 'session/selectModel', 'session/rename', 'session/fork', 'session/prompt', 'session/attachment', 'session/cancel', 'session/updateQueue', 'skills/list', 'fileReferences/list', 'fileUploads/upload', 'userQuestions/answer', 'userQuestions/attachWait', 'messageFeedback/list', 'messageFeedback/put', 'messageFeedback/delete', 'agentPresets/select', 'commands/list', 'commands/execute', 'sessionReferenceResolver/candidates', 'goals/get', 'goals/create', 'goals/edit', 'goals/pause', 'goals/resume', 'goals/complete', 'goals/clear', 'workspace/archiveSession', 'workspace/unarchiveSession', 'workspace/pinSession', 'workspace/unpinSession', 'workspace/insertSessionBefore'])
const ADMIN = new Set(['settings/describe', 'settings/update', 'settings/replace', 'settings/mutate', 'settings/openSettingsDocument', 'credentials/describe', 'credentials/set', 'credentials/unset', 'llm/discoverModels', 'agentPresets/read', 'dynamicCordisRunner/inventory', 'dynamicCordisRunner/syncInspectManifest', 'pluginManager/listBundles', 'pluginManager/listPlugins', 'pluginInventory/list'])
const GLOBAL_EVENTS = new Set(['llm/adapters-updated', 'permission-presets/catalog-changed'])
type RecordValue = Record<string, unknown>
type Identity = ChatroomIdentity | undefined
type FetchHandler = (request: Request) => Promise<Response>
class CarrierError extends Error {
  constructor(readonly status: number, message: string) { super(message) }
}

/**
 * Supply the native registries without exposing native operator authentication.
 * Only this module's HTTP and WS owners may dispatch through those registries.
 */
export function installNativeConnection(ctx: Context, config: Config): () => void {
  let gateway: NativeGateway | undefined
  const register = ctx.webServer.registerUpgrade.bind(ctx.webServer)
  const wrapped: typeof ctx.webServer.registerUpgrade = route => register(route.path === MUX_PATH
    ? { ...route, handler: (req, socket, head) => {
      if (gateway === undefined) { socket.end('HTTP/1.1 503 Service Unavailable\r\n\r\n'); return }
      return gateway.upgrade(req, socket, head)
    } }
    : route)
  ctx.webServer.registerUpgrade = wrapped
  // BrowserAuth is nominal and unexported by DSH. This deliberate adapter denies
  // every native transport admission; index assets contain no private Session data.
  const auth = {
    isAuthenticated: () => false,
    authorizeIndex: () => true,
    authenticatedUrl: (url: string) => url,
  } as unknown as ConstructorParameters<typeof HostConnectionService>[2]
  new HostConnectionService(ctx, config.nativeTrustedHosts ?? [], auth)
  ctx.provide('chatroomNativeGateway', (value: NativeGateway | undefined) => { gateway = value })
  return () => { if (ctx.webServer.registerUpgrade === wrapped) ctx.webServer.registerUpgrade = register }
}

declare module '@deepseek-ai/cordis' {
  interface Context { chatroomNativeGateway: (gateway: NativeGateway | undefined) => void }
}

/** Native encoding, binary attachments and Remote streams stay owned by DSH. */
export class NativeGateway {
  private readonly server = new WebSocketServer({ noServer: true, maxPayload: 1024 * 1024 })
  private readonly requests = new Set<AbortController>()
  private readonly pumps = new Set<Promise<void>>()
  private readonly requestCompletions = new Set<Promise<void>>()
  private readonly generations = new Map<string, { participantId: string | undefined; deliveries: Map<string, string> }>()
  private stopped = false
  private readonly renewals = new WeakMap<Request, string>()
  constructor(private readonly ctx: Context, private readonly runtime: ChatroomRuntime,
    private readonly config: Config, private readonly dispatch: FetchHandler) {}

  async fetch(request: Request): Promise<Response> {
    try {
      this.assertOrigin(request)
      const identity = await this.identity(request)
      const url = new URL(request.url)
      const endpoint = url.pathname.slice('/api/'.length)
      let authorizedRequest = request
      let resourceId: unknown
      let eventResult: RecordValue | undefined
      if (endpoint === 'remote.mux') return new Response('WebSocket required', { status: 426 })
      // Exact binary and streaming Fetch routes carry Session identity in the URL.
      if (endpoint === 'file') {
        if (request.method !== 'GET' && request.method !== 'HEAD') throw new CarrierError(405, 'GET or HEAD required')
        if (identity !== undefined) await this.runtime.assertNativeFileAccess(url.searchParams.get('path') ?? '', identity, request.signal)
      } else if (endpoint === 'session/uploadFileBinary' || endpoint === 'session.export') {
        await this.requireSession(url.searchParams.get('sessionId'), identity)
        if (url.searchParams.get('includeDescendants') === 'true') throw new CarrierError(403, '请单独导出有权访问的会话。')
      } else {
        const body: unknown = await request.clone().json()
        if (!record(body) || body.type !== 'client-request' || typeof body.rpcId !== 'string'
          || body.method !== endpoint || !record(body.payload)) throw new CarrierError(400, 'Invalid RPC envelope')
        await this.authorize(endpoint, body.payload, identity)
        if (endpoint === '$events/result' && record(body.payload.args)) eventResult = body.payload.args
        const args = record(body.payload.args) ? body.payload.args : {}
        const input = record(args.request) ? args.request : args
        resourceId = sessionResourceId(input, args)
        if (endpoint === 'workspace/initializeDefault') {
          // The native default points at the operator's Documents directory.
          // A shared deployment always adopts its configured directory instead.
          const workspace = await this.ctx.workspaceRegistry.create(this.config.cwd)
          const value = await this.filterValue(endpoint, { workspace: {
            workspaceId: workspace.id, path: workspace.path, title: workspace.title,
            sessionIds: [...workspace.sessionIds], createdAt: workspace.createdAt, updatedAt: workspace.updatedAt,
          } }, identity)
          return this.success(body.rpcId, value, request)
        }
        if (endpoint === 'session/create') {
          if (identity !== undefined && input.sessionId === undefined) input.sessionId = await this.runtime.reserveSoloSession(identity)
          if (input.workspaceId === undefined) input.cwd = this.config.cwd
          authorizedRequest = new Request(request.url, { method: request.method, headers: request.headers, signal: request.signal, body: JSON.stringify(body) })
        }
        if (endpoint === 'session/prompt' && identity !== undefined && typeof input.sessionId === 'string'
          && Array.isArray(input.content) && (input.mode === 'queue' || input.mode === 'steer')) {
          const command = input.content.length === 1 && record(input.content[0]) && input.content[0].type === 'text'
            && typeof input.content[0].text === 'string' && input.content[0].text.startsWith('/')
          if (!command && await this.runtime.submitNativeSession(input.sessionId, identity, input.content as never, input.mode)) {
            return this.success(body.rpcId, { accepted: true }, request)
          }
        }
      }
      const response = await this.dispatch(authorizedRequest)
      const renewal = this.renewals.get(request)
      const headers = new Headers(response.headers)
      if (renewal !== undefined) headers.append('set-cookie', renewal)
      if (!response.ok || !headers.get('content-type')?.includes('application/json')) {
        return new Response(response.body, { status: response.status, headers })
      }
      const output: unknown = await response.json()
      if (record(output) && record(output.result) && output.result.ok === true) {
        if (eventResult !== undefined) {
          this.generations.get(String(eventResult.clientId))?.deliveries.delete(String(eventResult.eventId))
        }
        if (endpoint === 'session/fork' && record(output.result.value) && typeof output.result.value.sessionId === 'string' && identity !== undefined) {
          await this.runtime.ownNativeFork(output.result.value.sessionId, identity)
        }
        output.result.value = await this.filterValue(endpoint, output.result.value, identity, resourceId)
      }
      headers.delete('content-length')
      return new Response(JSON.stringify(output), { status: response.status, headers })
    } catch (error) {
      const status = error instanceof CarrierError ? error.status : error instanceof ChatroomInputError ? 403 : error instanceof SyntaxError ? 400 : 500
      return Response.json({ error: status === 500 ? 'Native request failed' : String((error as Error).message) }, { status })
    }
  }

  private success(rpcId: string, value: unknown, request: Request): Response {
    const headers = new Headers()
    const renewal = this.renewals.get(request)
    if (renewal !== undefined) headers.append('set-cookie', renewal)
    return Response.json({ type: 'server-response', rpcId, result: { ok: true, value } }, { headers })
  }

  private async authorize(endpoint: string, payload: RecordValue, identity: Identity): Promise<void> {
    if (!this.config.authEnabled) return
    if (identity === undefined) throw new CarrierError(401, '请先登录。')
    if (endpoint === '$events') return
    if (endpoint === '$events/result') {
      if (!record(payload.args)) throw new CarrierError(400, 'Invalid Remote arguments')
      const generation = this.generations.get(String(payload.args.clientId))
      const sessionId = generation?.deliveries.get(String(payload.args.eventId))
      if (generation?.participantId !== identity.participantId || sessionId === undefined) throw new CarrierError(403, '交互请求已失效。')
      await this.requireSession(sessionId, identity)
      return
    }
    if (!record(payload.args)) throw new CarrierError(400, 'Invalid Remote arguments')
    const args = payload.args
    const input = record(args.request) ? args.request : args
    if (PUBLIC.has(endpoint) || endpoint === 'workspace/initializeDefault') return
    if (endpoint === 'session/create') {
      if (input.cwd !== undefined && input.cwd !== this.config.cwd) throw new CarrierError(403, '只能在聊天室工作区创建会话。')
      if (input.workspaceId !== undefined) {
        const workspace = this.ctx.workspaceRegistry.list().find(workspace => workspace.id === input.workspaceId)
        if (workspace === undefined || !await samePath(workspace.path, this.config.cwd)) throw new CarrierError(403, '工作区不可用。')
      }
      if (input.sessionId !== undefined && (typeof input.sessionId !== 'string' || !this.runtime.ownsSoloSession(input.sessionId, identity))) throw new CarrierError(403, '请先预留自己的 Solo 会话。')
      return
    }
    if (SESSION.has(endpoint)) {
      await this.requireSession(sessionResourceId(input, args), identity)
      if (args.agentId !== undefined) await this.requireSession(args.agentId, identity)
      if (record(input.address) && input.address.kind === 'subagent') {
        await this.requireSession(input.address.parentSessionId, identity)
        await this.requireSession(input.address.childSessionId, identity)
      }
      if (input.beforeSessionId !== undefined) await this.requireSession(input.beforeSessionId, identity)
      if (input.workspaceId !== undefined) {
        const workspace = this.ctx.workspaceRegistry.list().find(workspace => workspace.id === input.workspaceId)
        if (workspace === undefined || !await samePath(workspace.path, this.config.cwd)) throw new CarrierError(403, '工作区不可用。')
      }
      if (endpoint === 'session/updateQueue' && this.runtime.ownsSession(String(input.sessionId))) throw new CarrierError(403, '请通过群聊队列操作自己的消息。')
      if ((endpoint === 'session/prompt' || endpoint === 'commands/execute') && typeof input.sessionId === 'string') await this.runtime.prepareNativeModelSession(input.sessionId)
      if (endpoint === 'session/prompt' && Array.isArray(input.content)) await this.runtime.assertPromptReferences(identity, input.content as never)
      if (endpoint === 'commands/execute' && typeof input.line === 'string') await this.runtime.assertPromptReferences(identity, [{ type: 'text', text: input.line }])
      return
    }
    if (ADMIN.has(endpoint) && this.isAdmin(identity)) return
    throw new CarrierError(403, '此接口尚未配置账号权限。')
  }

  /** An empty group is a durable conversation, never a reusable native blank draft. */
  private roomSummary(value: unknown): unknown {
    if (!record(value) || typeof value.sessionId !== 'string' || !this.runtime.ownsSession(value.sessionId)) return value
    return { ...value, blank: false, ...(record(value.projections) ? { projections: this.roomProjections(value.sessionId, value.projections) } : {}) }
  }

  private roomProjections(id: unknown, value: unknown): unknown {
    if (typeof id !== 'string' || !this.runtime.ownsSession(id) || !record(value) || !record(value.values)
      || !record(value.values.sessionListMetadata)) return value
    return { ...value, values: { ...value.values, sessionListMetadata: { ...value.values.sessionListMetadata, blank: false } } }
  }

  private async filterValue(endpoint: string, value: unknown, identity: Identity, resourceId?: unknown): Promise<unknown> {
    if (endpoint === 'session/projections') value = this.roomProjections(resourceId, value)
    if (endpoint === 'session/list' && record(value) && Array.isArray(value.items)) value = { ...value, items: value.items.map(item => this.roomSummary(item)) }
    if (this.config.authEnabled && Array.isArray(value)
      && (endpoint === 'sessionReferenceResolver/candidates' || endpoint === 'dynamicCordisRunner/inventory')) {
      return await filterAsync(value, item => record(item)
        ? this.canAccess(endpoint === 'sessionReferenceResolver/candidates' ? item.sessionId : item.agentId, identity)
        : Promise.resolve(false))
    }
    if (!this.config.authEnabled || !record(value)) return value
    const output = { ...value }
    if ((endpoint === 'session/list' || endpoint === 'session/search') && Array.isArray(output.items)) {
      output.items = await filterAsync(output.items, item => record(item) ? this.canAccess(item.sessionId ?? item.id, identity) : Promise.resolve(false))
      // A truncated global search cannot disclose whether somebody else's results remain.
      if (endpoint === 'session/search') output.hasMore = false
    }
    if (endpoint.startsWith('workspace/')) {
      for (const key of ['archivedSessionIds', 'pinnedSessionIds']) if (Array.isArray(output[key])) output[key] = await filterAsync(output[key], id => this.canAccess(id, identity))
      if (record(output.workspace)) output.workspace = await this.filterWorkspace(output.workspace, identity)
    }
    return output
  }

  private async filterWorkspace(value: RecordValue, identity: Identity): Promise<RecordValue> {
    const output = { ...value }
    if (Array.isArray(output.sessionIds)) output.sessionIds = await filterAsync(output.sessionIds, id => this.canAccess(id, identity))
    return output
  }

  /** Recheck identity and resource access at each delivered native stream item. */
  private async filterFrame(endpoint: string, value: unknown, identity: Identity, clientId: string | undefined, resourceId?: unknown): Promise<unknown | undefined> {
    if (record(value)) {
      if (endpoint === 'session/follow' && value.type === 'snapshot') value = { ...value, projections: this.roomProjections(resourceId, value.projections) }
      else if (endpoint === 'session/control' && value.type === 'baseline' && record(value.value) && record(value.value.projections)) {
        value = { ...value, value: { ...value.value, projections: Object.fromEntries(Object.entries(value.value.projections).map(([id, projection]) => [id, this.roomProjections(id, projection)])) } }
      } else if (endpoint === 'session/control' && value.type === 'projection' && typeof value.sessionId === 'string'
        && this.runtime.ownsSession(value.sessionId) && value.key === 'sessionListMetadata' && record(value.value)) {
        value = { ...value, value: { ...value.value, blank: false } }
      } else if (endpoint === '$events' && value.type === 'emit' && value.event === 'api-session/added' && Array.isArray(value.args)) {
        value = { ...value, args: [this.roomSummary(value.args[0]), ...value.args.slice(1)] }
      }
    }
    if (!this.config.authEnabled || !record(value)) return value
    if (endpoint === '$events') {
      if (value.type === 'ready' && typeof value.clientId === 'string') {
        this.generations.set(value.clientId, { participantId: identity?.participantId, deliveries: new Map() })
        return { ...value, host: this.isAdmin(identity) ? value.host : { home: '' } }
      }
      const generation = clientId === undefined ? undefined : this.generations.get(clientId)
      if (value.type === 'waterfall' && typeof value.eventId === 'string') {
        if (!await this.canAccess(value.agentId, identity)) {
          if (clientId !== undefined) await this.returnEvent(clientId, value.eventId)
          return undefined
        }
        generation?.deliveries.set(value.eventId, String(value.agentId))
        return value
      }
      if (value.type === 'cancel') {
        if (!generation?.deliveries.delete(String(value.eventId))) return undefined
        return value
      }
      if (value.type === 'emit' && Array.isArray(value.args)) {
        if (GLOBAL_EVENTS.has(String(value.event))) return value
        const first = value.args[0]
        const id = typeof first === 'string' ? first : record(first) ? first.sessionId ?? first.agentId ?? first.id : undefined
        return await this.canAccess(id, identity) ? value : this.isAdmin(identity) && String(value.event).startsWith('plugin-manager/') ? value : undefined
      }
      return undefined
    }
    if (endpoint === 'session/control') {
      if (value.type === 'baseline' && record(value.value) && record(value.value.projections)) {
        const projections: RecordValue = {}
        for (const [id, projection] of Object.entries(value.value.projections)) if (await this.canAccess(id, identity)) projections[id] = projection
        return { ...value, value: { ...value.value, projections } }
      }
      return await this.canAccess(value.sessionId, identity) ? value : undefined
    }
    if (endpoint === 'workspace/follow') {
      if (value.type === 'baseline' && record(value.value)) {
        const baseline = value.value
        const items = Array.isArray(baseline.items) ? await filterAsync(baseline.items, item => record(item) && typeof item.path === 'string' ? samePath(item.path, this.config.cwd) : Promise.resolve(false)) : []
        return { ...value, value: {
          ...baseline,
          items: await Promise.all(items.map(item => this.filterWorkspace(item as RecordValue, identity))),
          archivedSessionIds: await filterAsync(Array.isArray(baseline.archivedSessionIds) ? baseline.archivedSessionIds : [], id => this.canAccess(id, identity)),
          pinnedSessionIds: await filterAsync(Array.isArray(baseline.pinnedSessionIds) ? baseline.pinnedSessionIds : [], id => this.canAccess(id, identity)),
        } }
      }
      if (value.type === 'upsert' && record(value.workspace)) {
        if (typeof value.workspace.path !== 'string' || !await samePath(value.workspace.path, this.config.cwd)) return undefined
        return { ...value, workspace: await this.filterWorkspace(value.workspace, identity) }
      }
      if (value.type === 'archived' || value.type === 'pinned') return await this.filterValue(endpoint, value, identity)
      // Workspace order is deployment-wide; disclose only the configured workspace.
      const workspaces = this.ctx.workspaceRegistry.list()
      const visible = new Set((await filterAsync(workspaces, item => samePath(item.path, this.config.cwd))).map(item => String(item.id)))
      if (value.type === 'order' && Array.isArray(value.workspaceIds)) return { ...value, workspaceIds: value.workspaceIds.filter(id => visible.has(String(id))) }
      return undefined
    }
    return value
  }

  private async returnEvent(clientId: string, eventId: string): Promise<void> {
    const method = '$events/result'
    await this.dispatch(new Request(`http://localhost/api/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'client-request', rpcId: randomUUID(), method, payload: { args: { clientId, eventId, outcome: { kind: 'next' } } } }) }))
  }

  async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const abort = new AbortController()
    const completion = Promise.withResolvers<void>()
    this.requestCompletions.add(completion.promise)
    this.requests.add(abort)
    const close = () => { if (!response.writableFinished) abort.abort() }
    response.once('close', close)
    const cancelBody = () => request.destroy()
    abort.signal.addEventListener('abort', cancelBody, { once: true })
    try {
      const initial = new Request(`http://${request.headers.host ?? 'localhost'}${request.url ?? '/'}`, { headers: nodeHeaders(request) })
      this.assertOrigin(initial)
      const identity = await this.identity(initial)
      const url = new URL(initial.url)
      if (url.pathname === '/api/session/uploadFileBinary' || url.pathname === '/api/session.export') {
        await this.requireSession(url.searchParams.get('sessionId'), identity)
        if (url.searchParams.get('includeDescendants') === 'true') throw new CarrierError(403, '请单独导出有权访问的会话。')
      }
      const chunks: Buffer[] = []
      let size = 0
      for await (const chunk of request) {
        const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string)
        size += bytes.length
        if (size > (this.config.nativeMaxRequestBytes ?? 314572800)) throw new CarrierError(413, 'Request too large')
        chunks.push(bytes)
      }
      const result = await this.fetch(new Request(initial.url, { method: request.method ?? 'GET', headers: initial.headers, signal: abort.signal, ...(chunks.length === 0 ? {} : { body: Buffer.concat(chunks) }) }))
      const headers = Object.fromEntries(result.headers) as Record<string, string | string[]>
      const cookies = result.headers.getSetCookie()
      if (cookies.length > 0) headers['set-cookie'] = cookies
      response.writeHead(result.status, headers)
      if (result.body !== null) for await (const chunk of result.body) if (!response.write(chunk)) await once(response, 'drain', { signal: abort.signal })
      response.end()
    } catch (error) {
      if (!response.headersSent && !abort.signal.aborted) { response.writeHead(error instanceof CarrierError ? error.status : 500); response.end('Native request failed') }
      else response.destroy()
    } finally {
      response.off('close', close)
      abort.signal.removeEventListener('abort', cancelBody)
      this.requests.delete(abort)
      this.requestCompletions.delete(completion.promise)
      completion.resolve()
    }
  }

  async upgrade(request: IncomingMessage, socket: Duplex, head: Buffer): Promise<void> {
    const initial = new Request(`http://${request.headers.host ?? 'localhost'}${request.url ?? '/'}`, { headers: nodeHeaders(request) })
    try { this.assertOrigin(initial); await this.identity(initial) }
    catch { socket.end('HTTP/1.1 401 Unauthorized\r\n\r\n'); return }
    this.server.handleUpgrade(request, socket, head, ws => {
      const streams = new Map<string, { abort: AbortController; endpoint: string; payload: RecordValue; clientId?: string }>()
      const send = (frame: unknown) => {
        if (ws.readyState !== WebSocket.OPEN) return
        if (ws.bufferedAmount > 4 * 1024 * 1024) { ws.close(1013); return }
        ws.send(JSON.stringify(frame))
      }
      let serial = Promise.resolve()
      ws.on('message', data => {
        serial = serial.then(async () => {
          const frame: unknown = JSON.parse(data.toString())
          if (!record(frame) || typeof frame.streamId !== 'string') throw new CarrierError(400, 'Invalid stream frame')
          const id = frame.streamId
          if (frame.type === 'cancel' || frame.type === 'end') { streams.get(id)?.abort.abort(); return }
          if (frame.type !== 'open' || typeof frame.endpoint !== 'string' || !record(frame.payload) || streams.has(id) || streams.size >= 128) throw new CarrierError(400, 'Invalid stream open')
          const identity = await this.identity(initial)
          await this.authorize(frame.endpoint, frame.payload, identity)
          const entry = { abort: new AbortController(), endpoint: frame.endpoint, payload: frame.payload } as { abort: AbortController; endpoint: string; payload: RecordValue; clientId?: string }
          streams.set(id, entry)
          const pump = (async () => {
            try {
              const source = await this.ctx.typertGateway.wireStream.open(entry.endpoint, entry.payload, (async function* () {})(), undefined, entry.abort.signal)
              for await (const value of source) {
                if (entry.abort.signal.aborted || this.stopped) break
                const current = await this.identity(initial)
                await this.authorize(entry.endpoint, entry.payload, current)
                const args = record(entry.payload.args) ? entry.payload.args : {}
                const input = record(args.request) ? args.request : args
                const filtered = await this.filterFrame(entry.endpoint, value, current, entry.clientId, sessionResourceId(input, args))
                if (record(filtered) && filtered.type === 'ready' && typeof filtered.clientId === 'string') entry.clientId = filtered.clientId
                if (filtered !== undefined) send({ type: 'item', streamId: id, value: filtered })
              }
              if (!entry.abort.signal.aborted) send({ type: 'end', streamId: id })
            } catch (error) {
              if (!entry.abort.signal.aborted) send({ type: 'error', streamId: id, error: this.ctx.typertGateway.wireStream.failure(error) })
            } finally {
              streams.delete(id)
              if (entry.clientId !== undefined) this.generations.delete(entry.clientId)
            }
          })()
          this.pumps.add(pump)
          void pump.finally(() => this.pumps.delete(pump))
        }).catch(() => { ws.close(1008) })
      })
      const heartbeat = setInterval(() => { void this.identity(initial).then(() => ws.ping()).catch(() => ws.close(1008)) }, 15000)
      ws.on('error', () => ws.close())
      ws.once('close', () => { clearInterval(heartbeat); for (const entry of streams.values()) { entry.abort.abort(); if (entry.clientId !== undefined) this.generations.delete(entry.clientId) } })
    })
  }

  async close(): Promise<void> {
    this.stopped = true
    for (const abort of this.requests) abort.abort()
    for (const ws of this.server.clients) ws.terminate()
    await Promise.allSettled([...this.pumps, ...this.requestCompletions])
    await new Promise<void>(resolve => this.server.close(() => resolve()))
  }
  private async identity(request: Request): Promise<Identity> {
    if (this.stopped || !this.runtime.isReady) throw new CarrierError(503, '聊天室尚未就绪。')
    if (!this.config.authEnabled) return this.runtime.identity(cookieValue(request.headers.get('cookie') ?? undefined, this.config.cookieName))
    const result = await this.runtime.auth.accountForRequest(cookieValue(request.headers.get('cookie') ?? undefined, this.config.authCookieName), Object.fromEntries(request.headers), new URL(request.url).pathname)
    if (result.renewalCookie !== undefined) this.renewals.set(request, result.renewalCookie)
    if (result.account === undefined) throw new CarrierError(401, '请先登录。')
    return result.account
  }
  private canAccess(id: unknown, identity: Identity): Promise<boolean> {
    return typeof id !== 'string' ? Promise.resolve(false) : !this.config.authEnabled ? Promise.resolve(true) : identity === undefined ? Promise.resolve(false) : this.runtime.canAccessNativeSession(id, identity)
  }
  private async requireSession(id: unknown, identity: Identity): Promise<void> {
    if (!await this.canAccess(id, identity)) throw new CarrierError(403, '会话不存在或你无权访问。')
  }
  private isAdmin(identity: Identity): boolean {
    return identity !== undefined && (('role' in identity && (identity as ChatroomAccount).role === 'super-admin') || this.config.settingsAdminParticipantIds.includes(identity.participantId))
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

export function registerNativeGateway(ctx: Context, runtime: ChatroomRuntime, config: Config): () => Promise<void> {
  const shared: ConnectionFetchHandler = ctx.connection.createSharedFetchHandler('/api')
  const gateway = new NativeGateway(ctx, runtime, config, request => shared.fetch(request))
  ctx.chatroomNativeGateway(gateway)
  const remove = ctx.webServer.register({ kind: 'prefix', path: '/api', handler: (req, res) => gateway.handle(req, res) })
  return async () => { remove(); ctx.chatroomNativeGateway(undefined); await gateway.close() }
}
function record(value: unknown): value is RecordValue { return value !== null && typeof value === 'object' && !Array.isArray(value) }
function sessionResourceId(input: RecordValue, args: RecordValue): unknown {
  const address = record(input.address) ? input.address : {}
  return input.sessionId ?? input.agentId ?? address.sessionId ?? address.childSessionId ?? args.agentId
}
async function filterAsync<T>(values: readonly T[], include: (value: T) => Promise<boolean>): Promise<T[]> { const allowed = await Promise.all(values.map(include)); return values.filter((_, index) => allowed[index]) }
async function samePath(left: string, right: string): Promise<boolean> { try { return await realpath(left) === await realpath(right) } catch { return false } }
function nodeHeaders(request: IncomingMessage): Headers { const headers = new Headers(); for (const [name, value] of Object.entries(request.headers)) if (value !== undefined) for (const item of Array.isArray(value) ? value : [value]) headers.append(name, item); return headers }
