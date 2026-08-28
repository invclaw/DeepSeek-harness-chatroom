import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { toFetchHandler } from '@deepseek-ai/dsh-host-apiproxy'
import { ChatroomAuthError, ChatroomAuthRateLimitError } from './auth.js'
import { automaticAuthRedirect } from './auth-redirect.js'
import { renderAuthPage } from './auth-page.js'
import type { Config } from './config.js'
import { cookieValue, expiredSessionCookie, sessionCookie } from './cookies.js'
import { matchChatroomApi } from './routes.js'
import { ChatroomInputError, ChatroomRuntime } from './room.js'
import { isChatroomReactionEmoji } from './reactions.js'
import type {
  ChatroomErrorResponse,
  ChatroomAccount,
  ChatroomPromptContentPart,
  ChatroomPromptRequest,
  ChatroomForwardItem,
  ChatroomForwardImageRequest,
  ChatroomImageReference,
  ChatroomRoomResponse,
  ChatroomRoomManageResponse,
  ChatroomRoomManagementResponse,
  ChatroomRoomsResponse,
  ChatroomSessionResponse,
  ChatroomThreadPromptRequest,
  ChatroomThreadRoot,
} from './types.js'

/** HTTP/SSE adapter for the browser client. */
export class ChatroomHttpController {
  private readonly log
  private readonly configurationApi

  constructor(
    ctx: Context,
    private readonly runtime: ChatroomRuntime,
    private readonly config: Config,
  ) {
    this.log = ctx.logger('deepseek-harness-chatroom')
    this.configurationApi = toFetchHandler(ctx.apiProxy)
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
      if (route.endpoint.startsWith('/auth/')) {
        await this.handleAuthentication(request, response, route.prefix, route.endpoint, url)
        return
      }
      if (route.endpoint === '/admin') {
        await this.handleAdministration(request, response)
        return
      }
      if (route.endpoint === '/account') {
        await this.handleAccount(request, response)
        return
      }
      if (route.endpoint === '/direct') {
        await this.handleDirect(request, response)
        return
      }
      if (route.endpoint === '/direct/messages') {
        await this.handleDirectMessages(request, response)
        return
      }
      if (route.endpoint === '/rooms') {
        await this.handleRooms(request, response)
        return
      }
      if (route.endpoint === '/rooms/ensure') {
        await this.handleRoomEnsure(request, response)
        return
      }
      if (route.endpoint === '/rooms/select') {
        await this.handleRoomSelection(request, response)
        return
      }
      if (route.endpoint === '/rooms/manage') {
        await this.handleRoomManagement(request, response)
        return
      }
      if (route.endpoint === '/prompt') {
        await this.handlePrompt(request, response)
        return
      }
      if (route.endpoint === '/threads/open') {
        await this.handleThreadOpen(request, response)
        return
      }
      if (route.endpoint === '/threads/prompt') {
        await this.handleThreadPrompt(request, response)
        return
      }
      if (route.endpoint === '/reactions/toggle') {
        await this.handleReactionToggle(request, response)
        return
      }
      if (route.endpoint === '/forward') {
        await this.handleForward(request, response)
        return
      }
      if (route.endpoint.startsWith('/files/')) {
        await this.handleFile(request, response, route.endpoint.slice('/files/'.length))
        return
      }
      if (route.endpoint.startsWith('/images/')) {
        await this.handleImage(request, response, route.endpoint.slice('/images/'.length))
        return
      }
      if (route.endpoint === '/events' && request.method === 'GET') {
        await this.handleEvents(request, response, url.searchParams)
        return
      }
      if (route.endpoint === '/notifications' && request.method === 'GET') {
        await this.handleNotifications(request, response)
        return
      }
      if (route.endpoint.startsWith('/configuration/')) {
        await this.handleConfiguration(request, response, route.endpoint.slice('/configuration/'.length))
        return
      }
      json(response, 404, { error: '接口不存在。' } satisfies ChatroomErrorResponse)
    } catch (error) {
      if (error instanceof ChatroomAuthRateLimitError) {
        response.setHeader('Retry-After', String(error.retryAfterSeconds))
        json(response, 429, { error: error.message } satisfies ChatroomErrorResponse)
        return
      }
      if (error instanceof ChatroomInputError || error instanceof ChatroomAuthError) {
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
      if (this.config.authEnabled) {
        let account = await this.requestAccount(request, response)
        if (account === undefined) {
          const adopted = await this.runtime.auth.adoptDshAuth(request.headers)
          if (adopted !== undefined) {
            account = adopted.account
            this.setAuthCookie(response, adopted.token)
            this.forwardDshAuthRenewal(response, adopted.renewalCookie)
          }
        }
        json(response, 200, this.sessionPayload(account ?? null, account))
        return
      }
      json(response, 200, this.sessionPayload(this.runtime.identity(token) ?? null))
      return
    }
    if (request.method === 'POST') {
      if (this.config.authEnabled) {
        json(response, 409, { error: '登录模式下请在账号设置中修改个人资料。' } satisfies ChatroomErrorResponse)
        return
      }
      assertSameOrigin(request)
      const body = await readJson(request, smallRequestLimit(this.config))
      const existing = this.runtime.identity(token)
      if (existing !== undefined && token !== undefined) {
        const updated = await this.runtime.updateIdentity(
          token,
          fieldString(body, 'displayName'),
          optionalFieldString(body, 'avatarId'),
        )
        json(response, 200, this.sessionPayload(updated))
        return
      }
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
      if (this.config.authEnabled) {
        json(response, 409, { error: '登录模式下请使用退出登录。' } satisfies ChatroomErrorResponse)
        return
      }
      assertSameOrigin(request)
      await this.runtime.deleteIdentity(token)
      response.setHeader('Set-Cookie', expiredSessionCookie(this.config.cookieName, cookiePath))
      response.writeHead(204)
      response.end()
      return
    }
    methodNotAllowed(response, 'GET, POST, DELETE')
  }

  private async handleAuthentication(
    request: IncomingMessage,
    response: ServerResponse,
    cookiePath: string,
    endpoint: string,
    url: URL,
  ): Promise<void> {
    if (endpoint === '/auth/verify') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        methodNotAllowed(response, 'GET, HEAD')
        return
      }
      let account = await this.requestAccount(request, response)
      if (account === undefined) {
        const adopted = await this.runtime.auth.adoptDshAuth(request.headers, originalRequestUri(request))
        if (adopted !== undefined) {
          account = adopted.account
          this.setAuthCookie(response, adopted.token)
          this.forwardDshAuthRenewal(response, adopted.renewalCookie)
        }
      }
      if (account === undefined) {
        const login = `${cookiePath}/auth/page?returnTo=${encodeURIComponent(originalRequestUri(request))}`
        response.writeHead(401, {
          'Cache-Control': 'no-store, max-age=0',
          Vary: 'Cookie',
          'WWW-Authenticate': 'Session realm="DeepSeek Harness"',
          'X-Dsh-Auth-Login': login,
        })
        response.end()
        return
      }
      response.writeHead(204, {
        'Cache-Control': 'no-store, max-age=0',
        Vary: 'Cookie',
        'X-Dsh-Auth-User-Id': account.participantId,
        'X-Dsh-Auth-Subject': encodeURIComponent(this.runtime.auth.verifiedSubject(account)),
        'X-Dsh-Auth-Username': encodeURIComponent(account.username),
        ...(account.displayName === account.username ? {} : { 'X-Dsh-Auth-Display-Name': encodeURIComponent(account.displayName) }),
        ...(account.avatarUrl === undefined ? {} : { 'X-Dsh-Auth-Picture': encodeURIComponent(account.avatarUrl) }),
        'X-Dsh-Auth-Roles': account.role,
      })
      response.end()
      return
    }
    if (endpoint === '/auth/page') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        methodNotAllowed(response, 'GET, HEAD')
        return
      }
      const returnTo = safeReturnPath(url.searchParams.get('returnTo') ?? '/')
      let account = await this.requestAccount(request, response)
      if (account === undefined) {
        const adopted = await this.runtime.auth.adoptDshAuth(request.headers, returnTo)
        if (adopted !== undefined) {
          account = adopted.account
          this.setAuthCookie(response, adopted.token)
          this.forwardDshAuthRenewal(response, adopted.renewalCookie)
        }
      }
      if (account !== undefined) {
        response.writeHead(303, { Location: returnTo, 'Cache-Control': 'no-store' })
        response.end()
        return
      }
      const state = this.runtime.auth.state()
      const automaticRedirect = automaticAuthRedirect(cookiePath, state, returnTo, url)
      if (automaticRedirect !== undefined) {
        response.writeHead(303, {
          Location: automaticRedirect,
          'Cache-Control': 'no-store',
        })
        response.end()
        return
      }
      html(response, 200, renderAuthPage(cookiePath, state, returnTo), request.method === 'HEAD', this.config)
      return
    }
    if (endpoint === '/auth/providers' && request.method === 'GET') {
      const account = await this.requestAccount(request, response)
      json(response, 200, this.runtime.auth.state(account))
      return
    }
    if (endpoint === '/auth/login' && request.method === 'POST') {
      assertSameOrigin(request)
      const body = await readJson(request, 8_192)
      const result = await this.runtime.auth.login(fieldString(body, 'username'), fieldString(body, 'password'))
      this.setAuthCookie(response, result.token)
      json(response, 200, this.sessionPayload(result.account, result.account))
      return
    }
    if (endpoint === '/auth/register' && request.method === 'POST') {
      assertSameOrigin(request)
      const body = await readJson(request, 16_384)
      const result = await this.runtime.auth.register({
        username: fieldString(body, 'username'),
        password: fieldString(body, 'password'),
        displayName: fieldString(body, 'displayName'),
        ...(optionalFieldString(body, 'avatarId') === undefined ? {} : { avatarId: optionalFieldString(body, 'avatarId')! }),
        ...(optionalFieldString(body, 'bootstrapToken') === undefined
          ? {}
          : { bootstrapToken: optionalFieldString(body, 'bootstrapToken')! }),
      })
      this.setAuthCookie(response, result.token)
      json(response, 201, this.sessionPayload(result.account, result.account))
      return
    }
    if (endpoint === '/auth/logout' && request.method === 'POST') {
      assertSameOrigin(request)
      await this.runtime.auth.logout(this.authToken(request))
      response.setHeader('Set-Cookie', expiredSessionCookie(
        this.config.authCookieName,
        '/',
        this.config.authPublicOrigin.startsWith('https://'),
      ))
      response.writeHead(204)
      response.end()
      return
    }
    const oidcMatch = /^\/auth\/oidc\/([^/]+)\/(start|callback)$/u.exec(endpoint)
    if (oidcMatch !== null && request.method === 'GET') {
      const providerId = decodeURIComponent(oidcMatch[1]!)
      if (oidcMatch[2] === 'start') {
        const target = await this.runtime.auth.startOidc(providerId, url.searchParams.get('returnTo') ?? '/')
        response.writeHead(302, { Location: target.href, 'Cache-Control': 'no-store' })
        response.end()
        return
      }
      const completed = await this.runtime.auth.completeOidc(providerId, publicCallbackUrl(url, this.config))
      this.setAuthCookie(response, completed.token)
      response.writeHead(302, { Location: completed.returnTo, 'Cache-Control': 'no-store' })
      response.end()
      return
    }
    if (endpoint === '/auth/dsh-auth/start' && request.method === 'GET') {
      const callbackPath = `${cookiePath}/auth/dsh-auth/callback`
      const target = this.runtime.auth.dshAuthLoginUrl(url.searchParams.get('returnTo') ?? '/', callbackPath)
      response.writeHead(302, { Location: target.href, 'Cache-Control': 'no-store' })
      response.end()
      return
    }
    if (endpoint === '/auth/dsh-auth/callback' && request.method === 'GET') {
      const returnTo = safeReturnPath(url.searchParams.get('returnTo') ?? '/')
      const adopted = await this.runtime.auth.adoptDshAuth(request.headers, returnTo)
      if (adopted === undefined) throw new ChatroomAuthError('dsh-auth 登录未完成或已失效。')
      this.setAuthCookie(response, adopted.token)
      this.forwardDshAuthRenewal(response, adopted.renewalCookie)
      response.writeHead(302, { Location: returnTo, 'Cache-Control': 'no-store' })
      response.end()
      return
    }
    methodNotAllowed(response, endpoint.endsWith('/start') || endpoint.endsWith('/callback') ? 'GET' : 'POST')
  }

  private async handleAdministration(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const actor = await this.requireAccount(request, response)
    if (actor === undefined) return
    if (request.method === 'GET') {
      json(response, 200, this.runtime.auth.overview(actor))
      return
    }
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'GET, POST')
      return
    }
    assertSameOrigin(request)
    const body = await readJson(request, 32_768)
    const action = fieldString(body, 'action')
    if (action === 'create-user') {
      const account = await this.runtime.auth.createUser(actor, {
        username: fieldString(body, 'username'),
        password: fieldString(body, 'password'),
        displayName: fieldString(body, 'displayName'),
        ...(optionalFieldString(body, 'avatarId') === undefined ? {} : { avatarId: optionalFieldString(body, 'avatarId')! }),
        role: accountRole(body.role),
      })
      json(response, 201, { account, overview: this.runtime.auth.overview(actor) })
      return
    }
    if (action === 'update-user') {
      const account = await this.runtime.auth.updateUser(actor, fieldString(body, 'userId'), {
        ...(body.role === undefined ? {} : { role: accountRole(body.role) }),
        ...(body.status === undefined ? {} : { status: accountStatus(body.status) }),
      })
      json(response, 200, { account, overview: this.runtime.auth.overview(actor) })
      return
    }
    if (action === 'settings') {
      const allowSelfRegistration = body.allowSelfRegistration === undefined
        ? undefined
        : fieldBoolean(body, 'allowSelfRegistration')
      const autoRedirectProviderId = nullableFieldString(body, 'autoRedirectProviderId')
      if (allowSelfRegistration === undefined && autoRedirectProviderId === undefined) {
        throw new ChatroomInputError('至少需要修改一项认证设置。')
      }
      await this.runtime.auth.updateSettings(actor, {
        ...(allowSelfRegistration === undefined ? {} : { allowSelfRegistration }),
        ...(autoRedirectProviderId === undefined ? {} : { autoRedirectProviderId }),
      })
      json(response, 200, this.runtime.auth.overview(actor))
      return
    }
    if (action === 'save-provider') {
      const provider = await this.runtime.auth.saveProvider(actor, {
        id: fieldString(body, 'id'),
        label: fieldString(body, 'label'),
        enabled: fieldBoolean(body, 'enabled'),
        issuer: fieldString(body, 'issuer'),
        clientId: fieldString(body, 'clientId'),
        ...(optionalFieldString(body, 'clientSecret') === undefined
          ? {}
          : { clientSecret: optionalFieldString(body, 'clientSecret')! }),
        scopes: fieldString(body, 'scopes'),
        usernameClaim: fieldString(body, 'usernameClaim'),
        displayNameClaim: fieldString(body, 'displayNameClaim'),
        autoCreateUsers: fieldBoolean(body, 'autoCreateUsers'),
      })
      json(response, 200, { provider, overview: this.runtime.auth.overview(actor) })
      return
    }
    if (action === 'delete-provider') {
      await this.runtime.auth.deleteProvider(actor, fieldString(body, 'providerId'))
      json(response, 200, this.runtime.auth.overview(actor))
      return
    }
    throw new ChatroomAuthError('管理员操作无效。')
  }

  private async handleAccount(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'POST')
      return
    }
    assertSameOrigin(request)
    const actor = await this.requireAccount(request, response)
    if (actor === undefined) return
    const body = await readJson(request, 4_096)
    if (fieldString(body, 'action') !== 'change-password') throw new ChatroomAuthError('账号操作无效。')
    const changed = await this.runtime.auth.changePassword(
      actor,
      fieldString(body, 'currentPassword'),
      fieldString(body, 'newPassword'),
    )
    this.setAuthCookie(response, changed.token)
    json(response, 200, { account: changed.account })
  }

  private async handleDirect(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const identity = await this.requireIdentity(request, response)
    if (identity === undefined) return
    if (request.method === 'GET') {
      json(response, 200, this.runtime.directDirectory(identity))
      return
    }
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'GET, POST')
      return
    }
    assertSameOrigin(request)
    const body = await readJson(request, 4_096)
    json(response, 200, await this.runtime.openDirect(fieldString(body, 'peerId'), identity))
  }

  private async handleDirectMessages(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'POST')
      return
    }
    assertSameOrigin(request)
    const identity = await this.requireIdentity(request, response)
    if (identity === undefined) return
    const body = await readJson(request, this.config.maxMessageTextChars * 4 + 4_096)
    json(response, 201, await this.runtime.sendDirect(
      fieldString(body, 'conversationId'),
      fieldString(body, 'text'),
      identity,
    ))
  }

  private async handleRooms(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method === 'GET') {
      if (await this.requireIdentity(request, response) === undefined) return
      json(response, 200, { rooms: this.runtime.rooms } satisfies ChatroomRoomsResponse)
      return
    }
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'GET, POST')
      return
    }
    assertSameOrigin(request)
    const identity = await this.requireIdentity(request, response)
    if (identity === undefined) return
    const body = await readJson(request, smallRequestLimit(this.config))
    const room = await this.runtime.createRoom(fieldString(body, 'title'), identity)
    json(response, 201, { room } satisfies ChatroomRoomResponse)
  }

  private async handleRoomEnsure(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'POST')
      return
    }
    assertSameOrigin(request)
    const identity = await this.requireIdentity(request, response)
    if (identity === undefined) return
    const body = await readJson(request, smallRequestLimit(this.config))
    const room = await this.runtime.ensureSessionRoom(
      fieldString(body, 'sessionId'),
      fieldString(body, 'title'),
      identity,
    )
    json(response, 200, { room } satisfies ChatroomRoomResponse)
  }

  private async handleRoomSelection(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'POST')
      return
    }
    assertSameOrigin(request)
    const identity = await this.requireIdentity(request, response)
    if (identity === undefined) return
    const body = await readJson(request, smallRequestLimit(this.config))
    const room = await this.runtime.selectRoom(fieldString(body, 'roomId'), identity)
    json(response, 200, { room } satisfies ChatroomRoomResponse)
  }

  private async handleRoomManagement(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const identity = await this.requireIdentity(request, response)
    if (identity === undefined) return
    if (request.method === 'GET') {
      const url = new URL(request.url ?? '/', 'http://chatroom.local')
      const roomId = url.searchParams.get('roomId')
      if (roomId === null || roomId === '') throw new ChatroomInputError('缺少群聊标识。')
      const room = this.runtime.rooms.find(item => item.id === roomId)
      if (room === undefined) throw new ChatroomInputError('共享会话不存在。')
      json(response, 200, {
        room,
        members: this.runtime.membersForRoom(roomId),
        candidates: this.runtime.roomInviteCandidates(roomId, identity),
      } satisfies ChatroomRoomManagementResponse)
      return
    }
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'GET, POST')
      return
    }
    assertSameOrigin(request)
    const body = await readJson(request, smallRequestLimit(this.config) + 8_192)
    const roomId = fieldString(body, 'roomId')
    const action = fieldString(body, 'action')
    if (action === 'rename') {
      const room = await this.runtime.renameRoom(roomId, fieldString(body, 'title'), identity)
      json(response, 200, { room, members: this.runtime.membersForRoom(roomId) } satisfies ChatroomRoomManageResponse)
      return
    }
    if (action === 'set-role') {
      const role = fieldString(body, 'role')
      if (role !== 'admin' && role !== 'member') throw new ChatroomInputError('群成员角色无效。')
      const members = await this.runtime.setMemberRole(
        roomId,
        fieldString(body, 'participantId'),
        role,
        identity,
      )
      json(response, 200, { room: this.runtime.rooms.find(item => item.id === roomId)!, members } satisfies ChatroomRoomManageResponse)
      return
    }
    if (action === 'add-members') {
      const members = await this.runtime.addRoomMembers(
        roomId,
        stringArray(body, 'participantIds'),
        identity,
      )
      json(response, 200, {
        room: this.runtime.rooms.find(item => item.id === roomId)!,
        members,
        candidates: this.runtime.roomInviteCandidates(roomId, identity),
      } satisfies ChatroomRoomManagementResponse)
      return
    }
    throw new ChatroomInputError('群管理操作无效。')
  }

  private async handleThreadOpen(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'POST')
      return
    }
    assertSameOrigin(request)
    const identity = await this.requireIdentity(request, response)
    if (identity === undefined) return
    const body = await readJson(request, smallRequestLimit(this.config) + 2_048)
    const root = threadRootRequest(body.root)
    const result = await this.runtime.openThread(fieldString(body, 'roomId'), identity, root)
    json(response, 200, result)
  }

  private async handleThreadPrompt(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'POST')
      return
    }
    assertSameOrigin(request)
    const identity = await this.requireIdentity(request, response)
    if (identity === undefined) return
    const body = await readJson(request, this.runtime.maxPromptRequestBytes)
    const parsed = promptRequest({ ...body, roomId: '__thread__' }, this.config)
    const prompt: ChatroomThreadPromptRequest = {
      threadId: fieldString(body, 'threadId'),
      mode: parsed.mode,
      content: parsed.content,
      ...(parsed.reply === undefined ? {} : { reply: parsed.reply }),
    }
    const result = await this.runtime.submitThread(
      prompt.threadId,
      identity,
      prompt.content,
      prompt.mode,
      prompt.reply,
    )
    json(response, 200, result)
  }

  private async handlePrompt(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'POST')
      return
    }
    assertSameOrigin(request)
    const identity = await this.requireIdentity(request, response)
    if (identity === undefined) return
    const body = await readJson(request, this.runtime.maxPromptRequestBytes)
    const prompt = promptRequest(body, this.config)
    const result = await this.runtime.submit(prompt.roomId, identity, prompt.content, prompt.mode, prompt.reply)
    json(response, 200, result)
  }

  private async handleReactionToggle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'POST')
      return
    }
    assertSameOrigin(request)
    const identity = await this.requireIdentity(request, response)
    if (identity === undefined) return
    const body = await readJson(request, smallRequestLimit(this.config))
    const emoji = body.emoji
    if (!isChatroomReactionEmoji(emoji)) throw new ChatroomInputError('请选择支持的消息表情。')
    const reaction = await this.runtime.toggleReaction(
      fieldString(body, 'roomId'),
      fieldString(body, 'messageId'),
      emoji,
      identity,
    )
    json(response, 200, reaction)
  }

  private async handleForward(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'POST')
      return
    }
    assertSameOrigin(request)
    const identity = await this.requireIdentity(request, response)
    if (identity === undefined) return
    const body = await readJson(request, this.config.maxMessageTextChars * 12 + 32_768)
    const result = await this.runtime.forwardMessages(
      fieldString(body, 'sourceRoomId'),
      fieldString(body, 'targetRoomId'),
      forwardItems(body.messages),
      identity,
    )
    json(response, 200, result)
  }

  private async handleFile(request: IncomingMessage, response: ServerResponse, fileId: string): Promise<void> {
    if (request.method !== 'GET') {
      methodNotAllowed(response, 'GET')
      return
    }
    if (await this.requireIdentity(request, response) === undefined) return
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

  private async handleImage(request: IncomingMessage, response: ServerResponse, encoded: string): Promise<void> {
    if (request.method !== 'GET') {
      methodNotAllowed(response, 'GET')
      return
    }
    if (await this.requireIdentity(request, response) === undefined) return
    let value: unknown
    try {
      value = JSON.parse(decodeURIComponent(encoded))
    } catch {
      throw new ChatroomInputError('图片引用无效。')
    }
    const image = forwardImageRequest(value)
    const stored = await this.runtime.image(
      image.sourceRoomId,
      image.sourceSessionId,
      image.sourceSeq,
      image.image,
    )
    response.writeHead(200, {
      'Content-Type': stored.ref.mediaType,
      'Content-Length': stored.data.byteLength,
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(stored.ref.name ?? 'image')}`,
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    })
    response.end(stored.data)
  }

  private async handleEvents(
    request: IncomingMessage,
    response: ServerResponse,
    search: URLSearchParams,
  ): Promise<void> {
    const identity = await this.requireIdentity(request, response)
    if (identity === undefined) return
    const roomId = search.get('roomId')
    if (roomId === null || roomId === '') throw new ChatroomInputError('缺少共享会话编号。')
    await this.runtime.selectRoom(roomId, identity)
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
    const revalidate = this.config.authMode === 'dsh-auth-only'
      ? setInterval(() => {
        void this.requestAccount(request).then(account => {
          if (account !== undefined || response.destroyed || response.writableEnded) return
          clearInterval(revalidate)
          clearInterval(heartbeat)
          unsubscribe()
          response.end()
        }).catch(() => {
          clearInterval(revalidate)
          clearInterval(heartbeat)
          unsubscribe()
          response.end()
        })
      }, (this.config.authDshAuthRevalidateSeconds ?? 60) * 1_000)
      : undefined
    request.once('close', () => {
      clearInterval(heartbeat)
      if (revalidate !== undefined) clearInterval(revalidate)
      unsubscribe()
    })
  }

  private async handleNotifications(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const identity = await this.requireIdentity(request, response)
    if (identity === undefined) return
    response.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    const unsubscribe = this.runtime.subscribeNotifications(identity, response)
    const heartbeat = setInterval(() => {
      if (!response.destroyed && !response.writableEnded) response.write(': heartbeat\n\n')
    }, this.config.sseHeartbeatMs)
    const revalidate = this.config.authMode === 'dsh-auth-only'
      ? setInterval(() => {
        void this.requestAccount(request).then(account => {
          if (account !== undefined || response.destroyed || response.writableEnded) return
          clearInterval(revalidate)
          clearInterval(heartbeat)
          unsubscribe()
          response.end()
        }).catch(() => {
          clearInterval(revalidate)
          clearInterval(heartbeat)
          unsubscribe()
          response.end()
        })
      }, (this.config.authDshAuthRevalidateSeconds ?? 60) * 1_000)
      : undefined
    request.once('close', () => {
      clearInterval(heartbeat)
      if (revalidate !== undefined) clearInterval(revalidate)
      unsubscribe()
    })
  }

  private async handleConfiguration(
    request: IncomingMessage,
    response: ServerResponse,
    method: string,
  ): Promise<void> {
    if (request.method !== 'POST') {
      methodNotAllowed(response, 'POST')
      return
    }
    if (!isRemoteConfigurationMethod(method)) {
      json(response, 404, { error: '远程配置接口不存在。' } satisfies ChatroomErrorResponse)
      return
    }
    assertSameOrigin(request)
    const identity = await this.requireIdentity(request, response)
    if (identity === undefined) return
    const account = this.config.authEnabled ? await this.requestAccount(request, response) : undefined
    if (account?.role !== 'super-admin' && !canManageRemoteSettings(this.config, identity.participantId)) {
      json(response, 403, { error: '当前聊天室身份没有模型设置管理权限。' } satisfies ChatroomErrorResponse)
      return
    }
    const body = await readJson(request, this.config.maxSettingsRequestBytes)
    const controller = new AbortController()
    request.once('aborted', () => controller.abort())
    const upstream = await this.configurationApi.fetch(new Request(`http://chatroom.local/api/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    }))
    const payload = await upstream.json()
    if (method === 'settings.describe') hideHostDocumentCapability(payload)
    json(response, upstream.status, payload)
  }

  private sessionPayload(
    identity: ChatroomSessionResponse['identity'],
    account?: ChatroomAccount,
  ): ChatroomSessionResponse {
    return {
      auth: this.runtime.auth.state(account),
      identity,
      rooms: this.config.authEnabled && account === undefined ? [] : this.runtime.rooms,
      ...(this.config.authEnabled && account === undefined ? {} : { room: this.runtime.room }),
    }
  }

  private async requireIdentity(request: IncomingMessage, response: ServerResponse) {
    const identity = this.config.authEnabled
      ? await this.requestAccount(request, response)
      : this.runtime.identity(this.token(request))
    if (identity === undefined) {
      json(response, 401, {
        error: this.config.authEnabled ? '请先登录。' : '请先选择聊天室身份。',
      } satisfies ChatroomErrorResponse)
    }
    return identity
  }

  private async requireAccount(request: IncomingMessage, response: ServerResponse): Promise<ChatroomAccount | undefined> {
    const account = await this.requestAccount(request, response)
    if (account === undefined) json(response, 401, { error: '请先登录。' } satisfies ChatroomErrorResponse)
    return account
  }

  private async requestAccount(request: IncomingMessage, response?: ServerResponse): Promise<ChatroomAccount | undefined> {
    const resolved = await this.runtime.auth.accountForRequest(
      this.authToken(request),
      request.headers,
      originalRequestUri(request),
    )
    if (response !== undefined) this.forwardDshAuthRenewal(response, resolved.renewalCookie)
    return resolved.account
  }

  private forwardDshAuthRenewal(response: ServerResponse, cookie: string | undefined): void {
    if (cookie === undefined) return
    const current = response.getHeader('Set-Cookie')
    const values = current === undefined ? [] : Array.isArray(current) ? current.map(String) : [String(current)]
    response.setHeader('Set-Cookie', [...values, cookie])
  }

  private token(request: IncomingMessage): string | undefined {
    return cookieValue(request.headers.cookie, this.config.cookieName)
  }

  private authToken(request: IncomingMessage): string | undefined {
    return cookieValue(request.headers.cookie, this.config.authCookieName)
  }

  private setAuthCookie(response: ServerResponse, token: string): void {
    response.setHeader('Set-Cookie', sessionCookie(
      this.config.authCookieName,
      token,
      this.config.authSessionMaxAgeSeconds,
      '/',
      this.config.authPublicOrigin.startsWith('https://'),
    ))
  }
}

const REMOTE_CONFIGURATION_METHODS = new Set([
  'settings.describe',
  'settings.update',
  'settings.replace',
  'settings.mutate',
  'credentials.describe',
  'credentials.set',
  'credentials.unset',
  'llm.discoverModels',
])

/** Whether the remote administrator bridge exposes one API Proxy method. */
export function isRemoteConfigurationMethod(method: string): boolean {
  return REMOTE_CONFIGURATION_METHODS.has(method)
}

/** Whether one authenticated chatroom identity may use the remote model-settings bridge. */
export function canManageRemoteSettings(config: Config, participantId: string): boolean {
  return config.settingsAdminParticipantIds.includes(participantId)
}

function hideHostDocumentCapability(payload: unknown): void {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return
  const result = (payload as Record<string, unknown>).result
  if (result === null || typeof result !== 'object' || Array.isArray(result)) return
  const resultRecord = result as Record<string, unknown>
  if (resultRecord.ok !== true) return
  const value = resultRecord.value
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return
  ;(value as Record<string, unknown>).hasDocument = false
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

function html(response: ServerResponse, status: number, body: string, head: boolean, config: Config): void {
  response.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store, max-age=0',
    'Content-Security-Policy': chatroomContentSecurityPolicy(config),
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  })
  response.end(head ? undefined : body)
}

/** Keep document image loading limited to same-origin assets and configured avatar origins. */
export function chatroomContentSecurityPolicy(config: Pick<Config, 'authDshAuthAvatarAllowedOrigins'>): string {
  const imageSources = ["'self'", 'data:', ...(config.authDshAuthAvatarAllowedOrigins ?? [])].join(' ')
  return `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; img-src ${imageSources}; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`
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

function stringArray(body: Record<string, unknown>, field: string): readonly string[] {
  const value = body[field]
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    throw new ChatroomInputError(`字段 ${field} 必须是字符串数组。`)
  }
  return value
}

function optionalFieldString(body: Record<string, unknown>, field: string): string | undefined {
  const value = body[field]
  if (value === undefined) return undefined
  if (typeof value !== 'string') throw new ChatroomInputError(`字段 ${field} 必须是字符串。`)
  return value
}

function nullableFieldString(body: Record<string, unknown>, field: string): string | null | undefined {
  const value = body[field]
  if (value === undefined || value === null) return value
  if (typeof value !== 'string') throw new ChatroomInputError(`字段 ${field} 必须是字符串或 null。`)
  return value
}

function fieldBoolean(body: Record<string, unknown>, field: string): boolean {
  const value = body[field]
  if (typeof value !== 'boolean') throw new ChatroomInputError(`字段 ${field} 必须是布尔值。`)
  return value
}

function accountRole(value: unknown): 'super-admin' | 'admin' | 'member' {
  if (value !== 'super-admin' && value !== 'admin' && value !== 'member') {
    throw new ChatroomInputError('账号角色无效。')
  }
  return value
}

function accountStatus(value: unknown): 'active' | 'disabled' {
  if (value !== 'active' && value !== 'disabled') throw new ChatroomInputError('账号状态无效。')
  return value
}

function publicCallbackUrl(url: URL, config: Config): URL {
  if (config.authPublicOrigin === '') throw new ChatroomAuthError('管理员尚未配置企业 SSO 的公网访问地址。')
  return new URL(`${url.pathname}${url.search}`, config.authPublicOrigin)
}

function forwardItems(value: unknown): readonly ChatroomForwardItem[] {
  if (!Array.isArray(value)) throw new ChatroomInputError('转发消息列表无效。')
  return value.map((raw) => {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new ChatroomInputError('转发消息格式无效。')
    }
    const item = raw as Record<string, unknown>
    const role = item.role
    if (role !== 'human' && role !== 'ai') throw new ChatroomInputError('转发消息角色无效。')
    if (typeof item.createdAt !== 'number') throw new ChatroomInputError('转发消息时间无效。')
    if ((item.sourceSessionId === undefined) !== (item.sourceSeq === undefined)
      || (item.sourceSessionId !== undefined && typeof item.sourceSessionId !== 'string')
      || (item.sourceSeq !== undefined && typeof item.sourceSeq !== 'number')) {
      throw new ChatroomInputError('转发来源消息不完整。')
    }
    return {
      messageId: fieldString(item, 'messageId'),
      ...(item.sourceSessionId === undefined ? {} : {
        sourceSessionId: item.sourceSessionId,
        sourceSeq: item.sourceSeq as number,
      }),
      role,
      displayName: fieldString(item, 'displayName'),
      text: fieldString(item, 'text'),
      createdAt: item.createdAt,
    }
  })
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

function threadRootRequest(value: unknown): ChatroomThreadRoot {
  const reply = replyRequest(value)
  if (reply === undefined || value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ChatroomInputError('分支主题消息无效。')
  }
  const role = (value as Record<string, unknown>).role
  if (role !== 'human' && role !== 'ai') throw new ChatroomInputError('分支主题角色无效。')
  const request = value as Record<string, unknown>
  if ((request.sourceSessionId === undefined) !== (request.sourceSeq === undefined)
    || (request.sourceSessionId !== undefined && typeof request.sourceSessionId !== 'string')
    || (request.sourceSeq !== undefined && typeof request.sourceSeq !== 'number')) {
    throw new ChatroomInputError('分支主题来源消息不完整。')
  }
  return {
    ...reply,
    role,
    ...(request.sourceSessionId === undefined ? {} : {
      sourceSessionId: request.sourceSessionId,
      sourceSeq: request.sourceSeq as number,
    }),
  }
}

function isImageMediaType(value: unknown): value is Extract<ChatroomPromptContentPart, { type: 'image' }>['mediaType'] {
  return value === 'image/png' || value === 'image/jpeg' || value === 'image/webp' || value === 'image/gif'
}

function imageReference(value: unknown): ChatroomImageReference {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ChatroomInputError('图片引用无效。')
  }
  const image = value as Record<string, unknown>
  if (typeof image.attachmentId !== 'string' || !isImageMediaType(image.mediaType)
    || !Number.isSafeInteger(image.bytes) || !Number.isSafeInteger(image.width) || !Number.isSafeInteger(image.height)
    || (image.name !== undefined && typeof image.name !== 'string')) {
    throw new ChatroomInputError('图片引用无效。')
  }
  return {
    attachmentId: image.attachmentId,
    mediaType: image.mediaType,
    bytes: image.bytes as number,
    width: image.width as number,
    height: image.height as number,
    ...(image.name === undefined ? {} : { name: image.name }),
  }
}

function forwardImageRequest(value: unknown): ChatroomForwardImageRequest {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ChatroomInputError('图片来源无效。')
  }
  const request = value as Record<string, unknown>
  const sourceSeq = request.sourceSeq
  if (!Number.isSafeInteger(sourceSeq) || (sourceSeq as number) < 0) {
    throw new ChatroomInputError('图片来源无效。')
  }
  return {
    sourceRoomId: fieldString(request, 'sourceRoomId'),
    sourceSessionId: fieldString(request, 'sourceSessionId'),
    sourceSeq: sourceSeq as number,
    image: imageReference(request.image),
  }
}

function smallRequestLimit(config: Config): number {
  return Math.max(config.maxDisplayNameChars, config.maxRoomTitleChars) * 4 + 1_024
}

function originalRequestUri(request: IncomingMessage): string {
  const original = request.headers['x-original-uri'] ?? request.headers['x-forwarded-uri']
  return safeReturnPath(typeof original === 'string' ? original : '/')
}

function safeReturnPath(value: string): string {
  if (!value.startsWith('/') || value.startsWith('//') || /[\r\n]/u.test(value)) return '/'
  return value.slice(0, 2_048)
}
