import type { IncomingHttpHeaders } from 'node:http'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatroomAuth } from '../src/auth.js'
import { renderAuthPage } from '../src/auth-page.js'
import type { Config } from '../src/config.js'
import type {
  AccountRecord,
  AuthProviderRecord,
  AuthSessionRecord,
  AuthSettingsRecord,
  ExternalAccountRecord,
} from '../src/domain.js'

afterEach(() => { vi.unstubAllGlobals() })

describe('ChatroomAuth', () => {
  it('prefers dsh-auth as the initial login provider when it is installed', async () => {
    const fixture = createAuth({ authDshAuthVerifyUrl: 'http://127.0.0.1:3080/auth/verify' })

    await fixture.auth.start()

    expect(fixture.auth.state().autoRedirectProvider).toMatchObject({ id: 'dsh-auth', type: 'dsh-auth' })
    expect(fixture.settings.get('auth')?.autoRedirectProviderId).toBe('dsh-auth')
  })

  it('bootstraps one super administrator and enforces registration and final-admin policy', async () => {
    const fixture = createAuth()
    await fixture.auth.start()

    await expect(fixture.auth.register({
      username: 'owner', password: 'correct horse battery', displayName: 'Owner', bootstrapToken: 'wrong',
    })).rejects.toThrow('初始化口令')
    const owner = await fixture.auth.register({
      username: 'owner', password: 'correct horse battery', displayName: 'Owner', bootstrapToken: 'bootstrap-token',
    })
    expect(owner.account.role).toBe('super-admin')
    expect(fixture.auth.account(owner.token)).toMatchObject({ username: 'owner', role: 'super-admin' })

    const member = await fixture.auth.register({
      username: 'member', password: 'member password 123', displayName: 'Member',
    })
    expect(member.account.role).toBe('member')
    await fixture.auth.updateSettings(owner.account, { allowSelfRegistration: false })
    await expect(fixture.auth.register({
      username: 'third-user', password: 'third password 123', displayName: 'Third',
    })).rejects.toThrow('关闭自主注册')
    await expect(fixture.auth.updateUser(owner.account, owner.account.participantId, { status: 'disabled' }))
      .rejects.toThrow('至少保留')

    const secondAdmin = await fixture.auth.createUser(owner.account, {
      username: 'second-admin', password: 'second password 123', displayName: 'Second', role: 'super-admin',
    })
    await expect(fixture.auth.updateUser(owner.account, owner.account.participantId, { role: 'member' }))
      .resolves.toMatchObject({ role: 'member' })
    await expect(fixture.auth.login(secondAdmin.username, 'second password 123'))
      .resolves.toMatchObject({ account: { role: 'super-admin' } })

    await expect(fixture.auth.changePassword(member.account, 'wrong password', 'replacement password 123'))
      .rejects.toThrow('当前密码不正确')
    const changed = await fixture.auth.changePassword(member.account, 'member password 123', 'replacement password 123')
    expect(fixture.auth.account(member.token)).toBeUndefined()
    expect(fixture.auth.account(changed.token)).toMatchObject({ username: 'member' })
    await expect(fixture.auth.login('member', 'replacement password 123')).resolves.toMatchObject({
      account: { username: 'member' },
    })
  })

  it('adopts verified dsh-auth administrator headers and encrypts OIDC secrets at rest', async () => {
    const fixture = createAuth({ authDshAuthHeaders: true })
    await fixture.auth.start()
    const adopted = await fixture.auth.adoptDshAuth({
      'x-dsh-auth-user-id': 'external-admin',
      'x-dsh-auth-username': encodeURIComponent('企业管理员'),
      'x-dsh-auth-roles': 'admin',
    } satisfies IncomingHttpHeaders)
    expect(adopted?.account).toMatchObject({ username: '企业管理员', role: 'super-admin' })

    const provider = await fixture.auth.saveProvider(adopted!.account, {
      id: 'company', label: '企业统一登录', enabled: true, issuer: 'https://id.example.com',
      clientId: 'chatroom-client', clientSecret: 'private-client-secret', scopes: 'openid profile email',
      usernameClaim: 'preferred_username', displayNameClaim: 'name', autoCreateUsers: true,
    })
    expect(provider).toMatchObject({ id: 'company', hasClientSecret: true })
    expect(fixture.auth.state().autoRedirectProvider).toMatchObject({ id: 'company' })
    expect(fixture.auth.overview(adopted!.account)).toMatchObject({
      autoRedirectProviderId: 'company',
      loginProviders: [{ id: 'company', type: 'oidc', label: '企业统一登录' }],
    })
    await fixture.auth.updateSettings(adopted!.account, { autoRedirectProviderId: null })
    expect(fixture.auth.state().autoRedirectProvider).toBeUndefined()
    await fixture.auth.updateSettings(adopted!.account, { autoRedirectProviderId: 'company' })
    expect(fixture.auth.state().autoRedirectProvider).toMatchObject({ id: 'company' })
    const durable = fixture.providers.get('company')
    expect(durable?.encryptedClientSecret).not.toContain('private-client-secret')
    expect(JSON.stringify(fixture.auth.overview(adopted!.account))).not.toContain('private-client-secret')
  })

  it('maps standardized dsh-auth subjects to stable accounts and configured roles', async () => {
    const fixture = createAuth({
      authDshAuthHeaders: true,
      authDshAuthSuperAdminSubjects: ['alice'],
      authDshAuthAvatarUrlTemplate: 'https://avatars.example.com/{username}.png',
      authDshAuthAvatarAllowedOrigins: ['https://avatars.example.com'],
    })
    await fixture.auth.start()
    const mason = await fixture.auth.adoptDshAuth({
      'x-dsh-auth-subject': 'alice',
      'x-dsh-auth-username': 'alice',
      'x-dsh-auth-display-name': encodeURIComponent('黄先生'),
      'x-dsh-auth-picture': encodeURIComponent('https://avatars.example.com/mason-direct.png'),
      'x-dsh-auth-roles': 'admin',
    } satisfies IncomingHttpHeaders)
    expect(mason?.account).toMatchObject({
      username: 'alice',
      displayName: '黄先生',
      role: 'super-admin',
      avatarUrl: 'https://avatars.example.com/mason-direct.png',
    })

    const sameSubject = await fixture.auth.adoptDshAuth({
      'x-dsh-auth-subject': 'alice',
      'x-dsh-auth-username': 'alice',
      'x-dsh-auth-display-name': encodeURIComponent('黄先生（更新）'),
    } satisfies IncomingHttpHeaders)
    expect(sameSubject?.account.participantId).toBe(mason?.account.participantId)
    expect(sameSubject?.account.displayName).toBe('黄先生（更新）')
    expect(sameSubject?.account.avatarUrl).toBe('https://avatars.example.com/alice.png')

    const member = await fixture.auth.adoptDshAuth({
      'x-dsh-auth-subject': 'mauriceniu',
      'x-dsh-auth-username': 'mauriceniu',
      'x-dsh-auth-display-name': 'Maurice',
      'x-dsh-auth-roles': 'admin',
    } satisfies IncomingHttpHeaders)
    expect(member?.account.role).toBe('member')
  })

  it('revalidates dsh-auth-only sessions, refreshes profiles, and revokes stale local sessions', async () => {
    const verified = (displayName: string, cookie: string) => new Response(null, {
      status: 204,
      headers: {
        'x-dsh-auth-subject': 'mauriceniu',
        'x-dsh-auth-username': 'mauriceniu',
        'x-dsh-auth-display-name': encodeURIComponent(displayName),
        'set-cookie': cookie,
      },
    })
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(verified('Maurice', 'dsh_auth_session=renewed-1; HttpOnly; Path=/'))
      .mockResolvedValueOnce(verified('Maurice 更新', 'dsh_auth_session=renewed-2; HttpOnly; Path=/'))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
    vi.stubGlobal('fetch', fetcher)
    const fixture = createAuth({
      authMode: 'dsh-auth-only',
      authAllowSelfRegistration: false,
      authDshAuthVerifyUrl: 'http://127.0.0.1:3080/auth/verify',
      authDshAuthRevalidateSeconds: 5,
    })
    await fixture.auth.start()

    expect(fixture.auth.state()).toMatchObject({
      providers: [{ id: 'dsh-auth', type: 'dsh-auth' }],
      allowSelfRegistration: false,
      bootstrapRequired: false,
    })
    await expect(fixture.auth.login('local-user', 'local password 123')).rejects.toThrow('企业统一登录')
    await expect(fixture.auth.register({
      username: 'local-user', password: 'local password 123', displayName: 'Local',
    })).rejects.toThrow('企业统一登录')
    await expect(fixture.auth.startOidc('company', '/')).rejects.toThrow('企业统一登录')

    const adopted = await fixture.auth.adoptDshAuth({ cookie: 'dsh_auth_session=original' })
    expect(adopted).toMatchObject({
      account: { username: 'mauriceniu', displayName: 'Maurice', role: 'member' },
      renewalCookie: 'dsh_auth_session=renewed-1; HttpOnly; Path=/',
    })
    const refreshed = await fixture.auth.accountForRequest(
      adopted?.token,
      { cookie: 'dsh_auth_session=renewed-1' },
      '/plugins/deepseek-harness-chatroom/api/session',
      Date.now() + 10_000,
    )
    expect(refreshed).toMatchObject({
      account: { participantId: adopted?.account.participantId, displayName: 'Maurice 更新' },
      renewalCookie: 'dsh_auth_session=renewed-2; HttpOnly; Path=/',
    })

    const revoked = await fixture.auth.accountForRequest(
      adopted?.token,
      { cookie: 'dsh_auth_session=renewed-2' },
      '/',
      Date.now() + 20_000,
    )
    expect(revoked.account).toBeUndefined()
    expect(fixture.auth.account(adopted?.token)).toBeUndefined()
  })

  it('renders a standalone login gate without embedding deployment secrets', () => {
    const page = renderAuthPage('/plugins/deepseek-harness-chatroom/api', {
      enabled: true,
      authenticated: false,
      providers: [{ id: 'company', type: 'oidc', label: '企业统一登录' }],
      autoRedirectProvider: { id: 'company', type: 'oidc', label: '企业统一登录' },
      allowSelfRegistration: true,
      bootstrapRequired: true,
    }, '/workspace?tab=chat')
    expect(page).toContain('创建超级管理员')
    expect(page).toContain('企业统一登录')
    expect(page).toContain('Content')
    expect(page).not.toContain('bootstrap-token')
  })
})

function createAuth(patch: Partial<Config> = {}) {
  const accounts = new MemoryTable<string, AccountRecord>()
  const sessions = new MemoryTable<string, AuthSessionRecord>()
  const settings = new MemoryTable<string, AuthSettingsRecord>()
  const providers = new MemoryTable<string, AuthProviderRecord>()
  const external = new MemoryTable<string, ExternalAccountRecord>()
  const auth = new ChatroomAuth({ ...config(), ...patch }, accounts, sessions, settings, providers, external)
  return { auth, accounts, sessions, settings, providers, external }
}

class MemoryTable<K extends string, V> implements KvTable<K, V> {
  private readonly records = new Map<K, V>()
  get size(): number { return this.records.size }
  get(key: K): V | undefined { return this.records.get(key) }
  entries(): IterableIterator<[K, V]> { return new Map(this.records).entries() }
  keys(): IterableIterator<K> { return new Map(this.records).keys() }
  async put(key: K, value: V): Promise<void> { this.records.set(key, value) }
  async delete(key: K): Promise<boolean> { return this.records.delete(key) }
  async update(key: K, fn: (current: V) => V): Promise<V> {
    const current = this.records.get(key)
    if (current === undefined) throw new Error('missing key')
    const next = fn(current)
    this.records.set(key, next)
    return next
  }
}

function config(): Config {
  return {
    roomId: 'lobby', roomTitle: 'AI 聊天室', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-v1-lobby',
    cwd: '/workspace', agentPreset: 'standard', cookieName: 'dsh_chatroom_session', cookieMaxAgeSeconds: 31_536_000,
    maxDisplayNameChars: 24, maxRoomTitleChars: 80, maxMessageTextChars: 20_000,
    maxFileBytes: 20 * 1024 * 1024, maxFilesPerMessage: 5, maxMessageFileBytes: 50 * 1024 * 1024,
    maxImageSidePixels: 4_096, settingsAdminParticipantIds: [], maxSettingsRequestBytes: 1024 * 1024,
    sseHeartbeatMs: 15_000, authEnabled: true, authCookieName: 'dsh_chatroom_auth',
    authSessionMaxAgeSeconds: 2_592_000, authSecret: 'a secure test secret with at least 32 bytes',
    authPublicOrigin: 'https://chat.example.com', authBootstrapToken: 'bootstrap-token',
    authAllowSelfRegistration: true, authDshAuthHeaders: false, authDshAuthVerifyUrl: '',
    authDshAuthLoginPath: '/auth/login',
  }
}
