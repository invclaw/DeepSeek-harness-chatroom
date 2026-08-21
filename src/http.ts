import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type { Config } from './config.js'
import { cookieValue, expiredSessionCookie, sessionCookie } from './cookies.js'
import { ChatroomInputError, ChatroomRuntime } from './room.js'
import type { ChatroomErrorResponse, ChatroomSessionResponse } from './types.js'

/** HTTP/SSE adapter for the browser client. */
export class ChatroomHttpController {
  private readonly log

  constructor(
    ctx: Context,
    private readonly runtime: ChatroomRuntime,
    private readonly config: Config,
  ) {
    this.log = ctx.logger('deepseek-harness-chatroom')
  }

  /** Dispatch one request under the `/chatroom/api` prefix. */
  async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    try {
      const pathname = new URL(request.url ?? '/', 'http://chatroom.local').pathname
      if (pathname === '/chatroom/api/health' && request.method === 'GET') {
        json(response, this.runtime.isReady ? 200 : 503, { ready: this.runtime.isReady })
        return
      }
      if (!this.runtime.isReady) {
        json(response, 503, { error: '聊天室正在启动，请稍后重试。' } satisfies ChatroomErrorResponse)
        return
      }
      if (pathname === '/chatroom/api/session') {
        await this.handleSession(request, response)
        return
      }
      if (pathname === '/chatroom/api/events' && request.method === 'GET') {
        this.handleEvents(request, response)
        return
      }
      if (pathname === '/chatroom/api/messages') {
        await this.handleMessages(request, response)
        return
      }
      json(response, 404, { error: '接口不存在。' } satisfies ChatroomErrorResponse)
    } catch (error) {
      if (error instanceof ChatroomInputError) {
        json(response, 422, { error: error.message } satisfies ChatroomErrorResponse)
        return
      }
      this.log.warn('Chatroom request failed: %s', String(error))
      if (!response.headersSent) {
        json(response, 500, { error: '聊天室暂时不可用，请稍后重试。' } satisfies ChatroomErrorResponse)
      } else {
        response.destroy()
      }
    }
  }

  private async handleSession(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const token = this.token(request)
    if (request.method === 'GET') {
      const payload: ChatroomSessionResponse = {
        identity: this.runtime.identity(token) ?? null,
        room: this.runtime.room,
      }
      json(response, 200, payload)
      return
    }
    if (request.method === 'POST') {
      assertSameOrigin(request)
      const existing = this.runtime.identity(token)
      if (existing !== undefined) {
        json(response, 200, { identity: existing, room: this.runtime.room } satisfies ChatroomSessionResponse)
        return
      }
      const body = await readJson(request, requestLimit(this.config))
      const displayName = fieldString(body, 'displayName')
      const created = await this.runtime.createIdentity(displayName)
      response.setHeader('Set-Cookie', sessionCookie(
        this.config.cookieName,
        created.token,
        this.config.cookieMaxAgeSeconds,
      ))
      json(response, 201, { identity: created.identity, room: this.runtime.room } satisfies ChatroomSessionResponse)
      return
    }
    if (request.method === 'DELETE') {
      assertSameOrigin(request)
      await this.runtime.deleteIdentity(token)
      response.setHeader('Set-Cookie', expiredSessionCookie(this.config.cookieName))
      response.writeHead(204)
      response.end()
      return
    }
    methodNotAllowed(response, 'GET, POST, DELETE')
  }

  private handleEvents(request: IncomingMessage, response: ServerResponse): void {
    const identity = this.requireIdentity(request, response)
    if (identity === undefined) return
    response.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    const unsubscribe = this.runtime.subscribe(identity, response)
    const heartbeat = setInterval(() => {
      if (!response.destroyed && !response.writableEnded) response.write(': heartbeat\n\n')
    }, this.config.sseHeartbeatMs)
    request.once('close', () => {
      clearInterval(heartbeat)
      unsubscribe()
    })
  }

  private async handleMessages(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const identity = this.requireIdentity(request, response)
    if (identity === undefined) return
    if (request.method === 'GET') {
      json(response, 200, { messages: this.runtime.history() })
      return
    }
    if (request.method === 'POST') {
      assertSameOrigin(request)
      const body = await readJson(request, requestLimit(this.config))
      const message = await this.runtime.send(identity, fieldString(body, 'text'))
      json(response, 202, { message })
      return
    }
    methodNotAllowed(response, 'GET, POST')
  }

  private requireIdentity(request: IncomingMessage, response: ServerResponse) {
    const identity = this.runtime.identity(this.token(request))
    if (identity === undefined) {
      json(response, 401, { error: '请先选择聊天室身份。' } satisfies ChatroomErrorResponse)
    }
    return identity
  }

  private token(request: IncomingMessage): string | undefined {
    return cookieValue(request.headers.cookie, this.config.cookieName)
  }
}

function json(response: ServerResponse, status: number, payload: unknown): void {
  const body = JSON.stringify(payload)
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  })
  response.end(body)
}

function methodNotAllowed(response: ServerResponse, allow: string): void {
  response.setHeader('Allow', allow)
  json(response, 405, { error: '请求方法不受支持。' } satisfies ChatroomErrorResponse)
}

function assertSameOrigin(request: IncomingMessage): void {
  const origin = request.headers.origin
  if (origin === undefined) return
  const host = request.headers.host
  let originHost: string
  try {
    originHost = new URL(origin).host
  } catch {
    throw new ChatroomInputError('请求来源无效。')
  }
  if (host === undefined || originHost !== host) throw new ChatroomInputError('请求来源无效。')
}

async function readJson(request: IncomingMessage, limit: number): Promise<Record<string, unknown>> {
  const contentType = request.headers['content-type']?.split(';', 1)[0]?.trim().toLowerCase()
  if (contentType !== 'application/json') throw new ChatroomInputError('请求必须使用 application/json。')
  const chunks: Buffer[] = []
  let bytes = 0
  for await (const raw of request) {
    const chunk = Buffer.isBuffer(raw) ? raw : Buffer.from(raw)
    bytes += chunk.byteLength
    if (bytes > limit) throw new ChatroomInputError('请求内容过大。')
    chunks.push(chunk)
  }
  let value: unknown
  try {
    value = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new ChatroomInputError('请求 JSON 无效。')
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ChatroomInputError('请求 JSON 必须是对象。')
  }
  return value as Record<string, unknown>
}

function fieldString(body: Record<string, unknown>, field: string): string {
  const value = body[field]
  if (typeof value !== 'string') throw new ChatroomInputError(`字段 ${field} 必须是字符串。`)
  return value
}

function requestLimit(config: Config): number {
  return Math.max(config.maxDisplayNameChars, config.maxMessageChars) * 4 + 1_024
}
