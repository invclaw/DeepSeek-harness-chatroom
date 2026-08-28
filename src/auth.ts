import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
  scrypt as deriveScrypt,
  timingSafeEqual,
} from 'node:crypto'
import type { IncomingHttpHeaders } from 'node:http'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import * as oidc from 'openid-client'
import { fallbackAvatarId, isChatroomAvatarId } from './avatars.js'
import type { Config } from './config.js'
import type {
  AccountRecord,
  AuthProviderRecord,
  AuthSessionRecord,
  AuthSettingsRecord,
  ExternalAccountRecord,
} from './domain.js'
import type {
  ChatroomAccount,
  ChatroomAccountRole,
  ChatroomAdminOverview,
  ChatroomAuthProvider,
  ChatroomAuthProviderAdmin,
  ChatroomAuthState,
} from './types.js'

const SCRYPT_N = 32_768
const SCRYPT_R = 8
const SCRYPT_P = 1
const PASSWORD_MIN_POINTS = 12
const PASSWORD_MAX_POINTS = 128
const PASSWORD_MAX_BYTES = 1_024
const USERNAME_MAX_POINTS = 64
const DISPLAY_NAME_MAX_POINTS = 80
const PROVIDER_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/u
const LOGIN_WINDOW_MS = 60_000
const LOGIN_MAX_ATTEMPTS = 5
const LOGIN_BLOCK_MS = 5 * 60_000
const LOGIN_MAX_KEYS = 10_000

interface OidcPending {
  readonly providerId: string
  readonly codeVerifier: string
  readonly nonce: string
  readonly returnTo: string
  readonly expiresAt: number
}

interface ProviderInput {
  readonly id: string
  readonly label: string
  readonly enabled: boolean
  readonly issuer: string
  readonly clientId: string
  readonly clientSecret?: string
  readonly scopes: string
  readonly usernameClaim: string
  readonly displayNameClaim: string
  readonly autoCreateUsers: boolean
}

interface AccountInput {
  readonly username: string
  readonly password: string
  readonly displayName: string
  readonly avatarId?: string
  readonly role?: ChatroomAccountRole
  readonly bootstrapToken?: string
}

interface LoginBucket {
  readonly attempts: number[]
  blockedUntil: number
}

interface DshAuthIdentityHeaders {
  readonly encodedSubject?: string
  readonly legacySubject?: string
  readonly encodedUsername: string
  readonly encodedDisplayName?: string
  readonly encodedPicture?: string
  readonly roles: string
}

interface ExternalProfile {
  readonly subject: string
  readonly legacySubject?: string
  readonly username: string
  readonly displayName: string
  readonly avatarUrl?: string
}

/** Authentication failure with text safe to return to the requesting browser. */
export class ChatroomAuthError extends Error {}

/** Login throttle result carrying an HTTP-compatible retry delay. */
export class ChatroomAuthRateLimitError extends ChatroomAuthError {
  constructor(readonly retryAfterSeconds: number) {
    super(`登录尝试过多，请在 ${String(retryAfterSeconds)} 秒后重试。`)
  }
}

/** Durable local accounts, OIDC providers, dsh-auth adoption, and opaque sessions. */
export class ChatroomAuth {
  private readonly pendingOidc = new Map<string, OidcPending>()
  private readonly oidcConfigurations = new Map<string, { updatedAt: number; value: oidc.Configuration }>()
  private readonly loginBuckets = new Map<string, LoginBucket>()
  private accountAdmission: Promise<void> = Promise.resolve()
  private readonly encryptionKey: Buffer

  constructor(
    readonly config: Config,
    private readonly accounts: KvTable<string, AccountRecord>,
    private readonly sessions: KvTable<string, AuthSessionRecord>,
    private readonly settingsTable: KvTable<string, AuthSettingsRecord>,
    private readonly providersTable: KvTable<string, AuthProviderRecord>,
    private readonly externalAccounts: KvTable<string, ExternalAccountRecord>,
  ) {
    this.encryptionKey = createHash('sha256').update(config.authSecret).digest()
  }

  /** Seed dynamic settings and remove expired login sessions. */
  async start(now = Date.now()): Promise<void> {
    const existingSettings = this.settingsTable.get('auth')
    const loginProviders = this.providers()
    const inferredProviderId = loginProviders.find(provider => provider.type === 'dsh-auth')?.id
      ?? (loginProviders.length === 1 ? loginProviders[0]!.id : undefined)
    if (existingSettings === undefined) {
      await this.settingsTable.put('auth', {
        allowSelfRegistration: this.config.authAllowSelfRegistration,
        ...(inferredProviderId === undefined ? {} : { autoRedirectProviderId: inferredProviderId }),
        updatedAt: now,
      })
    } else if (existingSettings.autoRedirectProviderId === undefined && inferredProviderId !== undefined) {
      await this.settingsTable.put('auth', {
        ...existingSettings,
        autoRedirectProviderId: inferredProviderId,
        updatedAt: now,
      })
    }
    for (const [key, session] of this.sessions.entries()) {
      if (session.expiresAt <= now || this.accounts.get(session.userId)?.status !== 'active') {
        await this.sessions.delete(key)
      }
    }
  }

  /** Resolve one local opaque token without trusting browser-supplied identity fields. */
  account(token: string | undefined, now = Date.now()): ChatroomAccount | undefined {
    if (!this.config.authEnabled || token === undefined) return undefined
    const session = this.sessions.get(secretHash(token))
    if (session === undefined || session.expiresAt <= now) return undefined
    const account = this.accounts.get(session.userId)
    return account?.status === 'active' ? publicAccount(account) : undefined
  }

  /** Browser-safe authentication state; unauthenticated callers receive no room metadata. */
  state(account?: ChatroomAccount): ChatroomAuthState {
    const enabled = this.config.authEnabled
    const providers = enabled ? this.providers() : []
    const autoRedirectProvider = providers.find(provider => provider.id === this.settings().autoRedirectProviderId)
    return {
      enabled,
      authenticated: !enabled || account !== undefined,
      ...(account === undefined ? {} : { account }),
      providers,
      ...(autoRedirectProvider === undefined ? {} : { autoRedirectProvider }),
      allowSelfRegistration: this.settings().allowSelfRegistration,
      bootstrapRequired: enabled && this.accounts.size === 0,
    }
  }

  /** Enabled external sign-in choices shown on the login form. */
  providers(): readonly ChatroomAuthProvider[] {
    const providers: ChatroomAuthProvider[] = []
    if (this.config.authDshAuthVerifyUrl !== '' && this.config.authPublicOrigin !== '') {
      providers.push({ id: 'dsh-auth', type: 'dsh-auth', label: 'DeepSeek Harness 管理员' })
    }
    for (const [, provider] of this.providersTable.entries()) {
      if (provider.enabled) providers.push({ id: provider.id, type: 'oidc', label: provider.label })
    }
    return providers.sort((left, right) => left.label.localeCompare(right.label, 'zh-CN'))
  }

  /** Register the bootstrap super administrator or a policy-permitted member account. */
  async register(input: AccountInput): Promise<{ token: string; account: ChatroomAccount }> {
    return await this.serializeAccounts(async () => {
      this.assertEnabled()
      const first = this.accounts.size === 0
      if (first) {
        if (!secureTextEqual(input.bootstrapToken ?? '', this.config.authBootstrapToken)) {
          throw new ChatroomAuthError('首次注册需要正确的超级管理员初始化口令。')
        }
      } else if (!this.settings().allowSelfRegistration) {
        throw new ChatroomAuthError('当前系统已关闭自主注册，请联系管理员创建账号。')
      }
      const account = await this.createAccount({
        ...input,
        role: first ? 'super-admin' : 'member',
      })
      return { token: await this.issueSession(account.id), account: publicAccount(account) }
    })
  }

  /** Verify local credentials and issue a new opaque session. */
  async login(username: string, password: string): Promise<{ token: string; account: ChatroomAccount }> {
    this.assertEnabled()
    const normalized = normalizeUsername(username)
    const now = Date.now()
    const retryAfter = this.consumeLoginAttempt(normalized.key, now)
    if (retryAfter !== undefined) {
      throw new ChatroomAuthRateLimitError(retryAfter)
    }
    const account = this.findUsername(normalized.key)
    const expected = account?.passwordHash ?? await dummyPasswordHash()
    const matches = await verifyPassword(password, expected)
    if (!matches || account === undefined || account.status !== 'active' || account.passwordHash === undefined) {
      throw new ChatroomAuthError('账号或密码不正确。')
    }
    this.loginBuckets.delete(normalized.key)
    const updated = { ...account, lastLoginAt: now, updatedAt: now }
    await this.accounts.put(account.id, updated)
    return { token: await this.issueSession(account.id), account: publicAccount(updated) }
  }

  /** Revoke only the supplied browser session. */
  async logout(token: string | undefined): Promise<void> {
    if (token !== undefined) await this.sessions.delete(secretHash(token))
  }

  /** Replace one local password after verifying the current credential and revoke older sessions. */
  async changePassword(
    actor: ChatroomAccount,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ token: string; account: ChatroomAccount }> {
    return await this.serializeAccounts(async () => {
      const current = this.accounts.get(actor.participantId)
      if (current === undefined || current.status !== 'active') throw new ChatroomAuthError('账号不存在或已停用。')
      if (current.passwordHash === undefined) {
        throw new ChatroomAuthError('该账号由外部身份提供方管理，不能在此修改密码。')
      }
      if (!await verifyPassword(currentPassword, current.passwordHash)) {
        throw new ChatroomAuthError('当前密码不正确。')
      }
      const passwordHash = await hashPassword(newPassword)
      const updated = { ...current, passwordHash, updatedAt: Date.now() }
      await this.accounts.put(current.id, updated)
      await this.revokeUserSessions(current.id)
      return { token: await this.issueSession(current.id), account: publicAccount(updated) }
    })
  }

  /** Adopt dsh-auth's verified administrator headers as an external super administrator. */
  async adoptDshAuth(headers: IncomingHttpHeaders, originalUri = '/'): Promise<{ token: string; account: ChatroomAccount } | undefined> {
    if (!this.config.authEnabled
      || (!this.config.authDshAuthHeaders && this.config.authDshAuthVerifyUrl === '')) return undefined
    const verified = await this.dshAuthIdentity(headers, originalUri)
    if (verified === undefined) return undefined
    if (!verified.roles.split(',').map(value => value.trim()).includes('admin')) return undefined
    const profile = dshExternalProfile(verified)
    const account = await this.externalAccount(
      'dsh-auth',
      profile.subject,
      profile.username,
      profile.displayName,
      true,
      profile.avatarUrl,
      profile.legacySubject,
    )
    return { token: await this.issueSession(account.id), account: publicAccount(account) }
  }

  /** Refresh one signed-in account from the current verified dsh-auth profile without rotating its local session. */
  async synchronizeDshAuthProfile(
    headers: IncomingHttpHeaders,
    account: ChatroomAccount,
    originalUri = '/',
  ): Promise<ChatroomAccount> {
    if (!this.config.authEnabled
      || (!this.config.authDshAuthHeaders && this.config.authDshAuthVerifyUrl === '')) return account
    const verified = await this.dshAuthIdentity(headers, originalUri)
    if (verified === undefined) return account
    if (!verified.roles.split(',').map(value => value.trim()).includes('admin')) return account
    const profile = dshExternalProfile(verified)
    const linked = this.externalAccounts.get(externalKey('dsh-auth', profile.subject))
      ?? (profile.legacySubject === undefined
        ? undefined
        : this.externalAccounts.get(externalKey('dsh-auth', profile.legacySubject)))
    if (linked?.userId !== account.participantId) return account
    return publicAccount(await this.externalAccount(
      'dsh-auth',
      profile.subject,
      profile.username,
      profile.displayName,
      true,
      profile.avatarUrl,
      profile.legacySubject,
    ))
  }

  /** Public dsh-auth password-login location returning through the local adapter. */
  dshAuthLoginUrl(returnTo: string, callbackPath: string): URL {
    if (this.config.authPublicOrigin === ''
      || (!this.config.authDshAuthHeaders && this.config.authDshAuthVerifyUrl === '')) {
      throw new ChatroomAuthError('dsh-auth 登录尚未配置。')
    }
    const callback = new URL(callbackPath, this.config.authPublicOrigin)
    callback.searchParams.set('returnTo', safeReturnTo(returnTo))
    const login = new URL(this.config.authDshAuthLoginPath, this.config.authPublicOrigin)
    login.searchParams.set('returnTo', `${callback.pathname}${callback.search}`)
    return login
  }

  /** Build one PKCE and nonce-protected enterprise OIDC authorization redirect. */
  async startOidc(providerId: string, returnTo: string): Promise<URL> {
    this.assertEnabled()
    const provider = this.requireProvider(providerId)
    if (this.config.authPublicOrigin === '') {
      throw new ChatroomAuthError('管理员尚未配置企业 SSO 的公网访问地址。')
    }
    const configuration = await this.oidcConfiguration(provider)
    const codeVerifier = oidc.randomPKCECodeVerifier()
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier)
    const state = oidc.randomState()
    const nonce = oidc.randomNonce()
    this.pruneOidc()
    this.pendingOidc.set(state, {
      providerId,
      codeVerifier,
      nonce,
      returnTo: safeReturnTo(returnTo),
      expiresAt: Date.now() + 10 * 60_000,
    })
    return oidc.buildAuthorizationUrl(configuration, {
      redirect_uri: this.callbackUrl(providerId),
      scope: provider.scopes,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      nonce,
    })
  }

  /** Exchange and validate one OIDC callback, then bind or create its local account. */
  async completeOidc(providerId: string, currentUrl: URL): Promise<{
    token: string
    account: ChatroomAccount
    returnTo: string
  }> {
    this.assertEnabled()
    const state = currentUrl.searchParams.get('state') ?? ''
    const pending = this.pendingOidc.get(state)
    this.pendingOidc.delete(state)
    if (pending === undefined || pending.providerId !== providerId || pending.expiresAt <= Date.now()) {
      throw new ChatroomAuthError('企业登录请求已失效，请重新发起登录。')
    }
    const provider = this.requireProvider(providerId)
    const configuration = await this.oidcConfiguration(provider)
    const tokens = await oidc.authorizationCodeGrant(configuration, currentUrl, {
      pkceCodeVerifier: pending.codeVerifier,
      expectedState: state,
      expectedNonce: pending.nonce,
      idTokenExpected: true,
    })
    const claims = tokens.claims()
    if (claims?.sub === undefined) throw new ChatroomAuthError('企业身份没有返回稳定的用户标识。')
    const username = claimText(claims, provider.usernameClaim)
      ?? claimText(claims, 'preferred_username')
      ?? claimText(claims, 'email')
      ?? claims.sub
    const displayName = claimText(claims, provider.displayNameClaim)
      ?? claimText(claims, 'name')
      ?? username
    const account = await this.externalAccount(
      provider.id,
      claims.sub,
      username,
      displayName,
      provider.autoCreateUsers,
      normalizeAvatarUrl(claimText(claims, 'picture')),
    )
    return {
      token: await this.issueSession(account.id),
      account: publicAccount(account),
      returnTo: pending.returnTo,
    }
  }

  /** Super-administrator account, policy, and OIDC configuration snapshot. */
  overview(actor: ChatroomAccount): ChatroomAdminOverview {
    this.assertSuperAdmin(actor)
    const settings = this.settings()
    const users = [...this.accounts.entries()].map(([, account]) => publicAccount(account))
      .sort((left, right) => left.username.localeCompare(right.username, 'zh-CN'))
    const providers = [...this.providersTable.entries()].map(([, provider]) => adminProvider(provider))
      .sort((left, right) => left.label.localeCompare(right.label, 'zh-CN'))
    return {
      users,
      providers,
      loginProviders: this.providers(),
      ...(settings.autoRedirectProviderId == null
        ? {}
        : { autoRedirectProviderId: settings.autoRedirectProviderId }),
      allowSelfRegistration: settings.allowSelfRegistration,
      oidcCallbackBase: this.config.authPublicOrigin === ''
        ? ''
        : `${this.config.authPublicOrigin}/plugins/deepseek-harness-chatroom/api/auth/oidc/`,
    }
  }

  /** Create one local account from the super-administrator console. */
  async createUser(actor: ChatroomAccount, input: AccountInput): Promise<ChatroomAccount> {
    this.assertSuperAdmin(actor)
    return await this.serializeAccounts(async () =>
      publicAccount(await this.createAccount({ ...input, role: input.role ?? 'member' })))
  }

  /** Change global role or activation state without allowing the final super administrator to disappear. */
  async updateUser(
    actor: ChatroomAccount,
    userId: string,
    patch: { readonly role?: ChatroomAccountRole; readonly status?: 'active' | 'disabled' },
  ): Promise<ChatroomAccount> {
    this.assertSuperAdmin(actor)
    return await this.serializeAccounts(async () => {
      const current = this.accounts.get(userId)
      if (current === undefined) throw new ChatroomAuthError('账号不存在。')
      const role = patch.role ?? current.role
      const status = patch.status ?? current.status
      if (current.role === 'super-admin' && current.status === 'active'
        && (role !== 'super-admin' || status !== 'active') && this.activeSuperAdmins() <= 1) {
        throw new ChatroomAuthError('系统必须至少保留一位启用的超级管理员。')
      }
      const next = { ...current, role, status, updatedAt: Date.now() }
      await this.accounts.put(userId, next)
      if (status === 'disabled') await this.revokeUserSessions(userId)
      return publicAccount(next)
    })
  }

  /** Enable or disable autonomous password registration. */
  async updateSettings(
    actor: ChatroomAccount,
    patch: { readonly allowSelfRegistration?: boolean; readonly autoRedirectProviderId?: string | null },
  ): Promise<void> {
    this.assertSuperAdmin(actor)
    const current = this.settings()
    if (patch.autoRedirectProviderId !== undefined && patch.autoRedirectProviderId !== null
      && !this.providers().some(provider => provider.id === patch.autoRedirectProviderId)) {
      throw new ChatroomAuthError('自动跳转的认证提供方不存在或未启用。')
    }
    await this.settingsTable.put('auth', {
      ...current,
      ...(patch.allowSelfRegistration === undefined
        ? {}
        : { allowSelfRegistration: patch.allowSelfRegistration }),
      ...(patch.autoRedirectProviderId === undefined
        ? {}
        : { autoRedirectProviderId: patch.autoRedirectProviderId }),
      updatedAt: Date.now(),
    })
  }

  /** Add or replace one encrypted generic OIDC provider. */
  async saveProvider(actor: ChatroomAccount, input: ProviderInput): Promise<ChatroomAuthProviderAdmin> {
    this.assertSuperAdmin(actor)
    const id = input.id.trim().toLowerCase()
    if (!PROVIDER_ID_PATTERN.test(id) || id === 'dsh-auth' || id === 'password') {
      throw new ChatroomAuthError('认证提供方 ID 只能使用小写字母、数字、下划线和连字符。')
    }
    let issuer: URL
    try {
      issuer = new URL(input.issuer)
    } catch {
      throw new ChatroomAuthError('OIDC Issuer 必须是有效的 HTTPS URL。')
    }
    if (issuer.protocol !== 'https:' || issuer.username !== '' || issuer.password !== '' || issuer.hash !== '') {
      throw new ChatroomAuthError('OIDC Issuer 必须是 HTTPS URL。')
    }
    const existing = this.providersTable.get(id)
    const secret = input.clientSecret === undefined || input.clientSecret === ''
      ? existing?.encryptedClientSecret
      : this.encrypt(input.clientSecret)
    if (secret === undefined) throw new ChatroomAuthError('新认证提供方必须填写 Client Secret。')
    const now = Date.now()
    const provider: AuthProviderRecord = {
      id,
      type: 'oidc',
      label: normalizeLabel(input.label, '提供方名称'),
      enabled: input.enabled,
      issuer: issuer.href.replace(/\/$/u, ''),
      clientId: normalizeOpaque(input.clientId, 'Client ID'),
      encryptedClientSecret: secret,
      scopes: normalizeScopes(input.scopes),
      usernameClaim: normalizeClaim(input.usernameClaim),
      displayNameClaim: normalizeClaim(input.displayNameClaim),
      autoCreateUsers: input.autoCreateUsers,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    await this.providersTable.put(id, provider)
    const settings = this.settings()
    if (provider.enabled && settings.autoRedirectProviderId === undefined && this.providers().length === 1) {
      await this.settingsTable.put('auth', { ...settings, autoRedirectProviderId: id, updatedAt: now })
    } else if (!provider.enabled && settings.autoRedirectProviderId === id) {
      await this.settingsTable.put('auth', { ...settings, autoRedirectProviderId: null, updatedAt: now })
    }
    this.oidcConfigurations.delete(id)
    return adminProvider(provider)
  }

  /** Remove one OIDC provider without deleting accounts already linked to it. */
  async deleteProvider(actor: ChatroomAccount, providerId: string): Promise<void> {
    this.assertSuperAdmin(actor)
    await this.providersTable.delete(providerId)
    const settings = this.settings()
    if (settings.autoRedirectProviderId === providerId) {
      await this.settingsTable.put('auth', { ...settings, autoRedirectProviderId: null, updatedAt: Date.now() })
    }
    this.oidcConfigurations.delete(providerId)
  }

  /** Active public accounts for user search and private messaging. */
  activeAccounts(): readonly ChatroomAccount[] {
    return [...this.accounts.entries()]
      .map(([, value]) => value)
      .filter(value => value.status === 'active')
      .map(publicAccount)
      .sort((left, right) => left.displayName.localeCompare(right.displayName, 'zh-CN'))
  }

  private async createAccount(input: AccountInput): Promise<AccountRecord> {
    const username = normalizeUsername(input.username)
    if (this.findUsername(username.key) !== undefined) throw new ChatroomAuthError('该账号名已被使用。')
    const displayName = normalizeDisplayName(input.displayName)
    const passwordHash = await hashPassword(input.password)
    const id = randomUUID()
    if (input.avatarId !== undefined && !isChatroomAvatarId(input.avatarId)) {
      throw new ChatroomAuthError('请选择有效的头像。')
    }
    const now = Date.now()
    const account: AccountRecord = {
      id,
      username: username.value,
      usernameKey: username.key,
      displayName,
      avatarId: input.avatarId ?? fallbackAvatarId(id),
      passwordHash,
      role: input.role ?? 'member',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }
    await this.accounts.put(id, account)
    return account
  }

  private async externalAccount(
    providerId: string,
    subject: string,
    suggestedUsername: string,
    suggestedDisplayName: string,
    autoCreate: boolean,
    avatarUrl?: string,
    legacySubject?: string,
  ): Promise<AccountRecord> {
    return await this.serializeAccounts(async () => this.resolveExternalAccount(
      providerId,
      subject,
      suggestedUsername,
      suggestedDisplayName,
      autoCreate,
      avatarUrl,
      legacySubject,
    ))
  }

  private async resolveExternalAccount(
    providerId: string,
    subject: string,
    suggestedUsername: string,
    suggestedDisplayName: string,
    autoCreate: boolean,
    avatarUrl?: string,
    legacySubject?: string,
  ): Promise<AccountRecord> {
    const key = externalKey(providerId, subject)
    const legacyKey = legacySubject === undefined || legacySubject === subject
      ? undefined
      : externalKey(providerId, legacySubject)
    const linked = this.externalAccounts.get(key)
      ?? (legacyKey === undefined ? undefined : this.externalAccounts.get(legacyKey))
    if (linked !== undefined) {
      const account = this.accounts.get(linked.userId)
      if (account === undefined || account.status !== 'active') throw new ChatroomAuthError('该企业账号已停用。')
      const updated = externalProfileAccount(account, suggestedDisplayName, avatarUrl, Date.now())
      await this.accounts.put(account.id, updated)
      if (this.externalAccounts.get(key) === undefined) {
        await this.externalAccounts.put(key, { providerId, subject, userId: account.id, createdAt: Date.now() })
      }
      return updated
    }
    if (!autoCreate) throw new ChatroomAuthError('该企业账号尚未由管理员开通。')
    const base = normalizeUsername(suggestedUsername)
    let candidate = base.value
    let candidateKey = base.key
    for (let suffix = 2; this.findUsername(candidateKey) !== undefined; suffix += 1) {
      candidate = `${base.value.slice(0, Math.max(1, USERNAME_MAX_POINTS - String(suffix).length - 1))}-${String(suffix)}`
      candidateKey = candidate.toLowerCase()
    }
    const id = randomUUID()
    const now = Date.now()
    const account: AccountRecord = {
      id,
      username: candidate,
      usernameKey: candidateKey,
      displayName: normalizeDisplayName(suggestedDisplayName),
      avatarId: fallbackAvatarId(id),
      ...(avatarUrl === undefined ? {} : { avatarUrl }),
      role: providerId === 'dsh-auth' ? 'super-admin' : 'member',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    }
    await this.accounts.put(id, account)
    await this.externalAccounts.put(key, { providerId, subject, userId: id, createdAt: now })
    return account
  }

  private async serializeAccounts<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.accountAdmission.then(operation)
    this.accountAdmission = result.then(() => undefined, () => undefined)
    return await result
  }

  private async issueSession(userId: string): Promise<string> {
    const token = randomBytes(32).toString('base64url')
    const now = Date.now()
    await this.sessions.put(secretHash(token), {
      userId,
      createdAt: now,
      lastSeenAt: now,
      expiresAt: now + this.config.authSessionMaxAgeSeconds * 1_000,
    })
    return token
  }

  private settings(): AuthSettingsRecord {
    return this.settingsTable.get('auth') ?? {
      allowSelfRegistration: this.config.authAllowSelfRegistration,
      updatedAt: 0,
    }
  }

  private findUsername(usernameKey: string): AccountRecord | undefined {
    return [...this.accounts.entries()].find(([, account]) => account.usernameKey === usernameKey)?.[1]
  }

  private activeSuperAdmins(): number {
    return [...this.accounts.entries()].filter(([, account]) =>
      account.role === 'super-admin' && account.status === 'active').length
  }

  private async revokeUserSessions(userId: string): Promise<void> {
    for (const [key, session] of this.sessions.entries()) {
      if (session.userId === userId) await this.sessions.delete(key)
    }
  }

  private requireProvider(providerId: string): AuthProviderRecord {
    const provider = this.providersTable.get(providerId)
    if (provider === undefined || !provider.enabled) throw new ChatroomAuthError('认证提供方不存在或未启用。')
    return provider
  }

  private async oidcConfiguration(provider: AuthProviderRecord): Promise<oidc.Configuration> {
    const cached = this.oidcConfigurations.get(provider.id)
    if (cached?.updatedAt === provider.updatedAt) return cached.value
    const value = await oidc.discovery(
      new URL(provider.issuer),
      provider.clientId,
      this.decrypt(provider.encryptedClientSecret),
      undefined,
      { timeout: 10 },
    )
    this.oidcConfigurations.set(provider.id, { updatedAt: provider.updatedAt, value })
    return value
  }

  private async dshAuthIdentity(
    headers: IncomingHttpHeaders,
    originalUri: string,
  ): Promise<DshAuthIdentityHeaders | undefined> {
    if (this.config.authDshAuthHeaders) {
      const direct = dshIdentityHeaders(
        singleHeader(headers['x-dsh-auth-user-id']),
        singleHeader(headers['x-dsh-auth-subject']),
        singleHeader(headers['x-dsh-auth-username']),
        singleHeader(headers['x-dsh-auth-display-name']),
        singleHeader(headers['x-dsh-auth-picture']),
        singleHeader(headers['x-dsh-auth-roles']),
      )
      if (direct !== undefined) return direct
    }
    if (this.config.authDshAuthVerifyUrl === '') return undefined
    const publicOrigin = new URL(this.config.authPublicOrigin)
    let verified: Response
    try {
      verified = await fetch(this.config.authDshAuthVerifyUrl, {
        method: 'GET',
        headers: {
          ...(headers.cookie === undefined ? {} : { cookie: headers.cookie }),
          'x-forwarded-host': publicOrigin.host,
          'x-forwarded-proto': publicOrigin.protocol.slice(0, -1),
          'x-real-ip': '127.0.0.1',
          'x-original-method': 'GET',
          'x-original-uri': safeReturnTo(originalUri),
        },
        signal: AbortSignal.timeout(5_000),
      })
    } catch {
      return undefined
    }
    if (verified.status !== 204) return undefined
    return dshIdentityHeaders(
      verified.headers.get('x-dsh-auth-user-id') ?? undefined,
      verified.headers.get('x-dsh-auth-subject') ?? undefined,
      verified.headers.get('x-dsh-auth-username') ?? undefined,
      verified.headers.get('x-dsh-auth-display-name') ?? undefined,
      verified.headers.get('x-dsh-auth-picture') ?? undefined,
      verified.headers.get('x-dsh-auth-roles') ?? undefined,
    )
  }

  private consumeLoginAttempt(key: string, now: number): number | undefined {
    for (const [candidate, bucket] of this.loginBuckets) {
      if (bucket.blockedUntil <= now && (bucket.attempts.at(-1) ?? 0) <= now - LOGIN_WINDOW_MS) {
        this.loginBuckets.delete(candidate)
      }
    }
    let bucket = this.loginBuckets.get(key)
    if (bucket === undefined) {
      if (this.loginBuckets.size >= LOGIN_MAX_KEYS) return Math.ceil(LOGIN_WINDOW_MS / 1_000)
      bucket = { attempts: [], blockedUntil: 0 }
      this.loginBuckets.set(key, bucket)
    }
    if (bucket.blockedUntil > now) return Math.max(1, Math.ceil((bucket.blockedUntil - now) / 1_000))
    while ((bucket.attempts[0] ?? Number.POSITIVE_INFINITY) <= now - LOGIN_WINDOW_MS) bucket.attempts.shift()
    if (bucket.attempts.length >= LOGIN_MAX_ATTEMPTS) {
      bucket.blockedUntil = now + LOGIN_BLOCK_MS
      return Math.ceil(LOGIN_BLOCK_MS / 1_000)
    }
    bucket.attempts.push(now)
    return undefined
  }

  private callbackUrl(providerId: string): string {
    return `${this.config.authPublicOrigin}/plugins/deepseek-harness-chatroom/api/auth/oidc/${encodeURIComponent(providerId)}/callback`
  }

  private pruneOidc(): void {
    const now = Date.now()
    for (const [state, pending] of this.pendingOidc) {
      if (pending.expiresAt <= now) this.pendingOidc.delete(state)
    }
  }

  private encrypt(value: string): string {
    const nonce = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, nonce)
    const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
    return `${nonce.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${ciphertext.toString('base64url')}`
  }

  private decrypt(value: string): string {
    const [nonceValue, tagValue, ciphertextValue] = value.split('.')
    if (nonceValue === undefined || tagValue === undefined || ciphertextValue === undefined) {
      throw new Error('chatroom: encrypted OIDC client secret is invalid')
    }
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, Buffer.from(nonceValue, 'base64url'))
    decipher.setAuthTag(Buffer.from(tagValue, 'base64url'))
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
  }

  private assertEnabled(): void {
    if (!this.config.authEnabled) throw new ChatroomAuthError('系统登录尚未启用。')
  }

  private assertSuperAdmin(actor: ChatroomAccount): void {
    if (actor.role !== 'super-admin' || actor.status !== 'active') {
      throw new ChatroomAuthError('只有超级管理员可以执行此操作。')
    }
  }
}

/** Map one durable account to its public and message-compatible identity. */
export function publicAccount(account: AccountRecord): ChatroomAccount {
  return {
    participantId: account.id,
    username: account.username,
    displayName: account.displayName,
    avatarId: account.avatarId,
    ...(account.avatarUrl === undefined ? {} : { avatarUrl: account.avatarUrl }),
    role: account.role,
    status: account.status,
    createdAt: account.createdAt,
    ...(account.lastLoginAt === undefined ? {} : { lastLoginAt: account.lastLoginAt }),
  }
}

function adminProvider(provider: AuthProviderRecord): ChatroomAuthProviderAdmin {
  return {
    id: provider.id,
    type: 'oidc',
    label: provider.label,
    enabled: provider.enabled,
    issuer: provider.issuer,
    clientId: provider.clientId,
    hasClientSecret: true,
    scopes: provider.scopes,
    usernameClaim: provider.usernameClaim,
    displayNameClaim: provider.displayNameClaim,
    autoCreateUsers: provider.autoCreateUsers,
  }
}

function normalizeUsername(value: string): { value: string; key: string } {
  const normalized = value.normalize('NFC').trim()
  const points = Array.from(normalized).length
  if (points < 3 || points > USERNAME_MAX_POINTS || /[\p{C}\p{Z}]/u.test(normalized)) {
    throw new ChatroomAuthError('账号名需要 3–64 个字符，且不能包含空白或控制字符。')
  }
  return { value: normalized, key: normalized.toLowerCase() }
}

function normalizeDisplayName(value: string): string {
  const normalized = value.normalize('NFC').trim()
  const points = Array.from(normalized).length
  if (points < 1 || points > DISPLAY_NAME_MAX_POINTS || /\p{C}/u.test(normalized)) {
    throw new ChatroomAuthError('显示名称需要 1–80 个字符。')
  }
  return normalized
}

function normalizeLabel(value: string, label: string): string {
  const normalized = value.normalize('NFC').trim()
  if (normalized === '' || Array.from(normalized).length > 80 || /\p{C}/u.test(normalized)) {
    throw new ChatroomAuthError(`${label}需要 1–80 个字符。`)
  }
  return normalized
}

function normalizeOpaque(value: string, label: string): string {
  const normalized = value.trim()
  if (normalized === '' || normalized.length > 512 || /\p{C}/u.test(normalized)) {
    throw new ChatroomAuthError(`${label}无效。`)
  }
  return normalized
}

function normalizeClaim(value: string): string {
  const normalized = value.trim()
  if (!/^[A-Za-z0-9_.:-]{1,128}$/u.test(normalized)) throw new ChatroomAuthError('OIDC Claim 名称无效。')
  return normalized
}

function normalizeScopes(value: string): string {
  const scopes = value.trim().split(/\s+/u).filter(Boolean)
  if (!scopes.includes('openid')) scopes.unshift('openid')
  if (scopes.length > 20 || scopes.some(scope => !/^[\x21-\x7E]+$/u.test(scope))) {
    throw new ChatroomAuthError('OIDC Scopes 无效。')
  }
  return [...new Set(scopes)].join(' ')
}

function assertPassword(password: string): void {
  const points = Array.from(password).length
  if (points < PASSWORD_MIN_POINTS || points > PASSWORD_MAX_POINTS || Buffer.byteLength(password, 'utf8') > PASSWORD_MAX_BYTES) {
    throw new ChatroomAuthError('密码需要 12–128 个字符，且不能超过 1024 字节。')
  }
}

async function hashPassword(password: string): Promise<string> {
  assertPassword(password)
  const salt = randomBytes(16)
  const key = await scrypt(password, salt)
  return `$scrypt$ln=15,r=${String(SCRYPT_R)},p=${String(SCRYPT_P)}$${salt.toString('base64url')}$${key.toString('base64url')}`
}

async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const match = /^\$scrypt\$ln=15,r=8,p=1\$([A-Za-z0-9_-]+)\$([A-Za-z0-9_-]+)$/u.exec(encoded)
  if (match === null) return false
  const salt = Buffer.from(match[1]!, 'base64url')
  const expected = Buffer.from(match[2]!, 'base64url')
  if (salt.length !== 16 || expected.length !== 32) return false
  const actual = await scrypt(password, salt)
  return timingSafeEqual(actual, expected)
}

function scrypt(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    deriveScrypt(password, salt, 32, {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
      maxmem: 64 * 1024 * 1024,
    }, (error, derived) => {
      if (error !== null) reject(error)
      else resolve(derived)
    })
  })
}

let dummyHash: Promise<string> | undefined
function dummyPasswordHash(): Promise<string> {
  dummyHash ??= hashPassword('chatroom-invalid-password')
  return dummyHash
}

function secretHash(value: string): string {
  return createHash('sha256').update(value).digest('base64url')
}

function externalKey(providerId: string, subject: string): string {
  return secretHash(`${providerId}\u0000${subject}`)
}

function secureTextEqual(left: string, right: string): boolean {
  const leftDigest = createHash('sha256').update(left).digest()
  const rightDigest = createHash('sha256').update(right).digest()
  return timingSafeEqual(leftDigest, rightDigest) && left !== '' && right !== ''
}

function singleHeader(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' && value.length <= 2_048 ? value : undefined
}

function dshIdentityHeaders(
  legacySubject: string | undefined,
  encodedSubject: string | undefined,
  encodedUsername: string | undefined,
  encodedDisplayName: string | undefined,
  encodedPicture: string | undefined,
  roles: string | undefined,
): DshAuthIdentityHeaders | undefined {
  if ((encodedSubject ?? '') === '' && (legacySubject ?? '') === '') return undefined
  if (encodedUsername === undefined || roles === undefined || encodedUsername === '' || roles === '') return undefined
  return {
    ...(encodedSubject === undefined ? {} : { encodedSubject }),
    ...(legacySubject === undefined ? {} : { legacySubject }),
    encodedUsername,
    ...(encodedDisplayName === undefined ? {} : { encodedDisplayName }),
    ...(encodedPicture === undefined ? {} : { encodedPicture }),
    roles,
  }
}

function dshExternalProfile(headers: DshAuthIdentityHeaders): ExternalProfile {
  const username = decodeDshHeader(headers.encodedUsername, '管理员名称')
  const subject = headers.encodedSubject === undefined
    ? headers.legacySubject!
    : decodeDshHeader(headers.encodedSubject, '稳定用户标识')
  const displayName = headers.encodedDisplayName === undefined
    ? username
    : decodeDshHeader(headers.encodedDisplayName, '显示名称')
  const avatarUrl = normalizeAvatarUrl(headers.encodedPicture === undefined
    ? undefined
    : decodeDshHeader(headers.encodedPicture, '头像地址'))
  return {
    subject,
    ...(headers.legacySubject === undefined || headers.legacySubject === subject
      ? {}
      : { legacySubject: headers.legacySubject }),
    username,
    displayName,
    ...(avatarUrl === undefined ? {} : { avatarUrl }),
  }
}

function decodeDshHeader(value: string, label: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    throw new ChatroomAuthError(`dsh-auth 返回了无效的${label}。`)
  }
}

function normalizeAvatarUrl(value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  if (Buffer.byteLength(value, 'utf8') > 2_048) throw new ChatroomAuthError('企业头像地址过长。')
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new ChatroomAuthError('企业身份返回了无效的头像地址。')
  }
  if (url.protocol !== 'https:' || url.username !== '' || url.password !== '' || url.hash !== '') {
    throw new ChatroomAuthError('企业头像必须使用无凭据、无片段的 HTTPS 地址。')
  }
  return url.href
}

function externalProfileAccount(
  account: AccountRecord,
  displayName: string,
  avatarUrl: string | undefined,
  now: number,
): AccountRecord {
  const { avatarUrl: _previousAvatarUrl, ...rest } = account
  return {
    ...rest,
    displayName: normalizeDisplayName(displayName),
    ...(avatarUrl === undefined ? {} : { avatarUrl }),
    lastLoginAt: now,
    updatedAt: now,
  }
}

function safeReturnTo(value: string): string {
  if (!value.startsWith('/') || value.startsWith('//') || /[\r\n]/u.test(value)) return '/'
  return value.slice(0, 2_048)
}

function claimText(claims: Record<string, unknown>, name: string): string | undefined {
  const value = claims[name]
  return typeof value === 'string' && value !== '' ? value : undefined
}
