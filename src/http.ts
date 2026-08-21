import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type { Config } from './config.js'
import { cookieValue, expiredSessionCookie, sessionCookie } from './cookies.js'
import { matchChatroomApi } from './routes.js'
import { ChatroomInputError, ChatroomRuntime } from './room.js'
import type {
  ChatroomErrorResponse,
  ChatroomPromptContentPart,
  ChatroomPromptRequest,
  ChatroomRoomResponse,
  ChatroomRoomsResponse,
  ChatroomSessionResponse,
} from './types.js'

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

  /** Dispatch one request under a registered chatroom API prefix. */
  async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    try {
      const url = new URL(request.url ?? '/', 'http://chatroom.local')
      const route = matchChatroomApi(url.pathname)
      if (route === undefined) {
        json(response, 404, { error: '接口不存在。' } satisfies ChatroomErrorResponse)
        return
      }
      if (route.endpoint === '/health' && request.method === 'GET') {
        json(response, this.runtime.isReady ? 200 : 503, { ready: this.runtime.isReady })
        return
      }
      if (!this.runtime.isReady) {
        json(response, 503, { error: '聊天室正在启动，请稍后重试。' } satisfies ChatroomErrorResponse)
        return
      }
      if (route.endpoint === '/session') {
        await this.handleSession(request, response, route.prefix)
        return
      }
      if (route.endpoint === '/rooms') {
        await this.handleRooms(request, response)
        return
      }
      if (route.endpoint === '/rooms/select') {
        await this.handleRoomSelection(request, response)
        return
      }
      if (route.endpoint === '/prompt') {
        await this.handlePrompt(request, response)
        return
      }
      if (route.endpoint.startsWith('/files/')) {
        this.handleFile(request, response, route.endpoint.slice('/files/'.length))
        return
      }
      if (route.endpoint === '/events' && request.method === 'GET') {
        await this.handleEvents(request, response, url.searchParams)
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

  private async handleSession(request: IncomingMessage, response: ServerResponse, cookiePath: string): Promise<void> {
    const token = this.token(request)
    if (request.method === 'GET') {
      json(response, 200, this.sessionPayload(this.runtime.identity(token) ?? null))
      return
    }
    if (request.method === 'POST') {
      assertSameOrigin(request)
      const existing = this.runtime.identity(token)
      if (existing !== undefined) {
        json(response, 200, this.sessionPayload(existing))
        return
      }
      const body = await readJson(request, smallRequestLimit(this.config))
      const created = await this.runtime.createIdentity(fieldString(body, 'displayName'), optionalFieldString(body, 'avatarId'))
      response.setHeader('Set-Cookie', sessionCookie(
        this.config.cookieName,
        created.token,
        this.config.cookieMaxAgeSeconds,
        cookiePath,
      ))
      json(response, 201, this.sessionPayload(created.identity))
      return
    }
    if (request.method === 'DELETE') {
      assertSameOrigin(request)
      await this.runtime.deleteIdentity(token)
      response.setHeader('Set-Cookie', expiredSessionCookie(this.config.cookieName, cookiePath))
      response.writeHead(204)
      response.end()
      return
    }
    methodNotAllowed(response, 'GET, POST, DELETE')
  }

  private async handleRooms(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method === 'GET') {
      json(response, 200, { rooms: this.runtime.rooms } satisfies ChatroomRoomsResponse)
      return
    }
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'GET, POST')
      return
    }
    assertSameOrigin(request)
    const identity = this.requireIdentity(request, response)
    if (identity === undefined) return
    const body = await readJson(request, smallRequestLimit(this.config))
    const room = await this.runtime.createRoom(fieldString(body, 'title'), identity)
    json(response, 201, { room } satisfies ChatroomRoomResponse)
  }

  private async handleRoomSelection(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'POST')
      return
    }
    assertSameOrigin(request)
    if (this.requireIdentity(request, response) === undefined) return
    const body = await readJson(request, smallRequestLimit(this.config))
    const room = await this.runtime.selectRoom(fieldString(body, 'roomId'))
    json(response, 200, { room } satisfies ChatroomRoomResponse)
  }

  private async handlePrompt(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'POST')
      return
    }
    assertSameOrigin(request)
    const identity = this.requireIdentity(request, response)
    if (identity === undefined) return
    const body = await readJson(request, this.runtime.maxPromptRequestBytes)
    const prompt = promptRequest(body, this.config)
    const result = await this.runtime.submit(prompt.roomId, identity, prompt.content, prompt.mode, prompt.reply)
    json(response, 200, result)
  }

  private handleFile(request: IncomingMessage, response: ServerResponse, fileId: string): void {
    if (request.method !== 'GET') {
      methodNotAllowed(response, 'GET')
      return
    }
    if (this.requireIdentity(request, response) === undefined) return
    if (fileId === '' || fileId.includes('/')) throw new ChatroomInputError('文件编号无效。')
    const file = this.runtime.file(fileId)
    response.writeHead(200, {
      'Content-Type': file.ref.mediaType,
      'Content-Length': file.data.byteLength,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.ref.name)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    })
    response.end(file.data)
  }

  private async handleEvents(
    request: IncomingMessage,
    response: ServerResponse,
    search: URLSearchParams,
  ): Promise<void> {
    const identity = this.requireIdentity(request, response)
    if (identity === undefined) return
    const roomId = search.get('roomId')
    if (roomId === null || roomId === '') throw new ChatroomInputError('缺少共享会话编号。')
    await this.runtime.selectRoom(roomId)
    response.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    const unsubscribe = this.runtime.subscribe(roomId, identity, response)
    const heartbeat = setInterval(() => {
      if (!response.destroyed && !response.writableEnded) response.write(': heartbeat\n\n')
    }, this.config.sseHeartbeatMs)
    request.once('close', () => {
      clearInterval(heartbeat)
      unsubscribe()
    })
  }

  private sessionPayload(identity: ChatroomSessionResponse['identity']): ChatroomSessionResponse {
    return { identity, rooms: this.runtime.rooms, room: this.runtime.room }
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

function optionalFieldString(body: Record<string, unknown>, field: string): string | undefined {
  const value = body[field]
  if (value === undefined) return undefined
  if (typeof value !== 'string') throw new ChatroomInputError(`字段 ${field} 必须是字符串。`)
  return value
}

function promptRequest(body: Record<string, unknown>, config: Config): ChatroomPromptRequest {
  const roomId = fieldString(body, 'roomId')
  const mode = body.mode
  if (mode !== 'queue' && mode !== 'steer') throw new ChatroomInputError('字段 mode 必须是 queue 或 steer。')
  if (!Array.isArray(body.content) || body.content.length === 0) {
    throw new ChatroomInputError('消息内容不能为空。')
  }
  const content: ChatroomPromptContentPart[] = []
  let textChars = 0
  for (const raw of body.content) {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new ChatroomInputError('消息内容格式无效。')
    }
    const part = raw as Record<string, unknown>
    if (part.type === 'text') {
      if (typeof part.text !== 'string') throw new ChatroomInputError('文本消息无效。')
      textChars += [...part.text].length
      content.push({ type: 'text', text: part.text })
      continue
    }
    if (part.type === 'image') {
      if (!isImageMediaType(part.mediaType) || typeof part.data !== 'string') {
        throw new ChatroomInputError('图片消息无效。')
      }
      if (part.name !== undefined && typeof part.name !== 'string') {
        throw new ChatroomInputError('图片名称无效。')
      }
      content.push({
        type: 'image',
        mediaType: part.mediaType,
        data: part.data,
        ...(part.name === undefined ? {} : { name: part.name }),
      })
      continue
    }
    if (part.type === 'file') {
      if (typeof part.mediaType !== 'string' || typeof part.data !== 'string' || typeof part.name !== 'string') {
        throw new ChatroomInputError('文件消息无效。')
      }
      content.push({ type: 'file', mediaType: part.mediaType, data: part.data, name: part.name })
      continue
    }
    throw new ChatroomInputError('消息内容类型无效。')
  }
  if (textChars > config.maxMessageTextChars) {
    throw new ChatroomInputError(`消息文本不能超过 ${config.maxMessageTextChars} 个字符。`)
  }
  if (!content.some(part => part.type !== 'text' || part.text.trim() !== '')) {
    throw new ChatroomInputError('消息内容不能为空。')
  }
  const reply = replyRequest(body.reply)
  return { roomId, mode, content, ...(reply === undefined ? {} : { reply }) }
}

function replyRequest(value: unknown): ChatroomPromptRequest['reply'] {
  if (value === undefined) return undefined
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ChatroomInputError('回复引用无效。')
  }
  const reply = value as Record<string, unknown>
  const messageId = fieldString(reply, 'messageId')
  const displayName = fieldString(reply, 'displayName').trim()
  const text = fieldString(reply, 'text').trim().replace(/\s+/gu, ' ')
  if (messageId === '' || displayName === '' || text === '') throw new ChatroomInputError('回复引用不完整。')
  if ([...displayName].length > 80 || [...text].length > 240) throw new ChatroomInputError('回复引用过长。')
  if (/\p{Cc}/u.test(`${displayName}${text}`)) throw new ChatroomInputError('回复引用包含无效字符。')
  return { messageId, displayName, text }
}

function isImageMediaType(value: unknown): value is Extract<ChatroomPromptContentPart, { type: 'image' }>['mediaType'] {
  return value === 'image/png' || value === 'image/jpeg' || value === 'image/webp' || value === 'image/gif'
}

function smallRequestLimit(config: Config): number {
  return Math.max(config.maxDisplayNameChars, config.maxRoomTitleChars) * 4 + 1_024
}
