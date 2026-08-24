// src/config.ts
import { isAbsolute } from "path";
import z from "@deepseek-ai/schemastery";
var Config = z.object({
  roomId: z.string().min(1).max(64).pattern(/^[a-z0-9][a-z0-9_-]*$/u).default("lobby"),
  roomTitle: z.string().min(1).max(80).default("AI \u804A\u5929\u5BA4"),
  aiDisplayName: z.string().min(1).max(40).default("DeepSeek"),
  sessionId: z.string().min(1).max(160).default("chatroom-v1-lobby"),
  cwd: z.string().required(),
  agentPreset: z.string().min(1).default("standard"),
  cookieName: z.string().pattern(/^[A-Za-z0-9_]+$/u).default("dsh_chatroom_session"),
  cookieMaxAgeSeconds: z.number().step(1).min(60).max(31536e3).default(31536e3),
  maxDisplayNameChars: z.number().step(1).min(1).max(80).default(24),
  maxRoomTitleChars: z.number().step(1).min(1).max(160).default(80),
  maxMessageTextChars: z.number().step(1).min(1).max(2e5).default(2e4),
  maxFileBytes: z.number().step(1).min(1).max(100 * 1024 * 1024).default(20 * 1024 * 1024),
  maxFilesPerMessage: z.number().step(1).min(1).max(20).default(5),
  maxMessageFileBytes: z.number().step(1).min(1).max(200 * 1024 * 1024).default(50 * 1024 * 1024),
  maxImageSidePixels: z.number().step(1).min(512).max(16384).default(4096),
  settingsAdminParticipantIds: z.array(z.string().min(1).max(128)).default([]),
  maxSettingsRequestBytes: z.number().step(1).min(1024).max(8 * 1024 * 1024).default(1024 * 1024),
  sseHeartbeatMs: z.number().step(1).min(5e3).max(12e4).default(15e3),
  authEnabled: z.boolean().default(false),
  authCookieName: z.string().pattern(/^[A-Za-z0-9_]+$/u).default("dsh_chatroom_auth"),
  authSessionMaxAgeSeconds: z.number().step(1).min(300).max(31536e3).default(2592e3),
  authSecret: z.string().default(""),
  authPublicOrigin: z.string().default(""),
  authBootstrapToken: z.string().default(""),
  authAllowSelfRegistration: z.boolean().default(true),
  authDshAuthHeaders: z.boolean().default(false),
  authDshAuthVerifyUrl: z.string().default(""),
  authDshAuthLoginPath: z.string().default("/auth/login")
});
function validateConfig(config) {
  if (!isAbsolute(config.cwd)) {
    throw new Error(`chatroom: cwd must be absolute, got ${JSON.stringify(config.cwd)}`);
  }
  if (config.maxMessageFileBytes < config.maxFileBytes) {
    throw new Error("chatroom: maxMessageFileBytes must be greater than or equal to maxFileBytes");
  }
  if (config.authEnabled && Buffer.byteLength(config.authSecret, "utf8") < 32) {
    throw new Error("chatroom: authSecret must contain at least 32 UTF-8 bytes when authentication is enabled");
  }
  if (config.authEnabled && config.authBootstrapToken === "" && !config.authDshAuthHeaders && config.authDshAuthVerifyUrl === "") {
    throw new Error("chatroom: authBootstrapToken or a dsh-auth adapter is required to create the first super administrator");
  }
  if (config.authPublicOrigin !== "") {
    const origin = new URL(config.authPublicOrigin);
    if (origin.origin !== config.authPublicOrigin || origin.protocol !== "https:") {
      throw new Error("chatroom: authPublicOrigin must be an HTTPS origin without a path");
    }
  }
  if (config.authDshAuthVerifyUrl !== "") {
    if (config.authPublicOrigin === "") {
      throw new Error("chatroom: authPublicOrigin is required with authDshAuthVerifyUrl");
    }
    const verify = new URL(config.authDshAuthVerifyUrl);
    const loopback = verify.hostname === "127.0.0.1" || verify.hostname === "[::1]" || verify.hostname === "localhost";
    if (!loopback || verify.protocol !== "http:" || verify.username !== "" || verify.password !== "" || verify.hash !== "") {
      throw new Error("chatroom: authDshAuthVerifyUrl must be an uncredentialed loopback HTTP URL");
    }
  }
  if (!config.authDshAuthLoginPath.startsWith("/") || config.authDshAuthLoginPath.startsWith("//") || /[?#\r\n]/u.test(config.authDshAuthLoginPath)) {
    throw new Error("chatroom: authDshAuthLoginPath must be an absolute public path without a query or fragment");
  }
}

// src/http.ts
import { toFetchHandler } from "@deepseek-ai/dsh-host-apiproxy";

// src/auth.ts
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
  scrypt as deriveScrypt,
  timingSafeEqual
} from "crypto";
import * as oidc from "openid-client";

// src/avatars.ts
var CHATROOM_AVATARS = [
  { id: "whale", emoji: "\u{1F433}", label: "\u9CB8\u9C7C" },
  { id: "panda", emoji: "\u{1F43C}", label: "\u718A\u732B" },
  { id: "fox", emoji: "\u{1F98A}", label: "\u72D0\u72F8" },
  { id: "cat", emoji: "\u{1F431}", label: "\u732B\u54AA" },
  { id: "dog", emoji: "\u{1F436}", label: "\u72D7\u72D7" },
  { id: "rabbit", emoji: "\u{1F430}", label: "\u5154\u5B50" },
  { id: "octopus", emoji: "\u{1F419}", label: "\u7AE0\u9C7C" },
  { id: "unicorn", emoji: "\u{1F984}", label: "\u72EC\u89D2\u517D" }
];
function isChatroomAvatarId(value) {
  return typeof value === "string" && CHATROOM_AVATARS.some((avatar) => avatar.id === value);
}
function fallbackAvatarId(seed) {
  let hash = 0;
  for (const character of seed) hash = hash * 31 + character.codePointAt(0) >>> 0;
  return CHATROOM_AVATARS[hash % CHATROOM_AVATARS.length].id;
}

// src/auth.ts
var SCRYPT_N = 32768;
var SCRYPT_R = 8;
var SCRYPT_P = 1;
var PASSWORD_MIN_POINTS = 12;
var PASSWORD_MAX_POINTS = 128;
var PASSWORD_MAX_BYTES = 1024;
var USERNAME_MAX_POINTS = 64;
var DISPLAY_NAME_MAX_POINTS = 80;
var PROVIDER_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/u;
var LOGIN_WINDOW_MS = 6e4;
var LOGIN_MAX_ATTEMPTS = 5;
var LOGIN_BLOCK_MS = 5 * 6e4;
var LOGIN_MAX_KEYS = 1e4;
var ChatroomAuthError = class extends Error {
};
var ChatroomAuthRateLimitError = class extends ChatroomAuthError {
  constructor(retryAfterSeconds) {
    super(`\u767B\u5F55\u5C1D\u8BD5\u8FC7\u591A\uFF0C\u8BF7\u5728 ${String(retryAfterSeconds)} \u79D2\u540E\u91CD\u8BD5\u3002`);
    this.retryAfterSeconds = retryAfterSeconds;
  }
  retryAfterSeconds;
};
var ChatroomAuth = class {
  constructor(config, accounts, sessions, settingsTable, providersTable, externalAccounts) {
    this.config = config;
    this.accounts = accounts;
    this.sessions = sessions;
    this.settingsTable = settingsTable;
    this.providersTable = providersTable;
    this.externalAccounts = externalAccounts;
    this.encryptionKey = createHash("sha256").update(config.authSecret).digest();
  }
  config;
  accounts;
  sessions;
  settingsTable;
  providersTable;
  externalAccounts;
  pendingOidc = /* @__PURE__ */ new Map();
  oidcConfigurations = /* @__PURE__ */ new Map();
  loginBuckets = /* @__PURE__ */ new Map();
  accountAdmission = Promise.resolve();
  encryptionKey;
  /** Seed dynamic settings and remove expired login sessions. */
  async start(now = Date.now()) {
    const existingSettings = this.settingsTable.get("auth");
    const loginProviders = this.providers();
    const inferredProviderId = loginProviders.find((provider) => provider.type === "dsh-auth")?.id ?? (loginProviders.length === 1 ? loginProviders[0].id : void 0);
    if (existingSettings === void 0) {
      await this.settingsTable.put("auth", {
        allowSelfRegistration: this.config.authAllowSelfRegistration,
        ...inferredProviderId === void 0 ? {} : { autoRedirectProviderId: inferredProviderId },
        updatedAt: now
      });
    } else if (existingSettings.autoRedirectProviderId === void 0 && inferredProviderId !== void 0) {
      await this.settingsTable.put("auth", {
        ...existingSettings,
        autoRedirectProviderId: inferredProviderId,
        updatedAt: now
      });
    }
    for (const [key, session] of this.sessions.entries()) {
      if (session.expiresAt <= now || this.accounts.get(session.userId)?.status !== "active") {
        await this.sessions.delete(key);
      }
    }
  }
  /** Resolve one local opaque token without trusting browser-supplied identity fields. */
  account(token, now = Date.now()) {
    if (!this.config.authEnabled || token === void 0) return void 0;
    const session = this.sessions.get(secretHash(token));
    if (session === void 0 || session.expiresAt <= now) return void 0;
    const account = this.accounts.get(session.userId);
    return account?.status === "active" ? publicAccount(account) : void 0;
  }
  /** Browser-safe authentication state; unauthenticated callers receive no room metadata. */
  state(account) {
    const enabled = this.config.authEnabled;
    const providers = enabled ? this.providers() : [];
    const autoRedirectProvider = providers.find((provider) => provider.id === this.settings().autoRedirectProviderId);
    return {
      enabled,
      authenticated: !enabled || account !== void 0,
      ...account === void 0 ? {} : { account },
      providers,
      ...autoRedirectProvider === void 0 ? {} : { autoRedirectProvider },
      allowSelfRegistration: this.settings().allowSelfRegistration,
      bootstrapRequired: enabled && this.accounts.size === 0
    };
  }
  /** Enabled external sign-in choices shown on the login form. */
  providers() {
    const providers = [];
    if (this.config.authDshAuthVerifyUrl !== "" && this.config.authPublicOrigin !== "") {
      providers.push({ id: "dsh-auth", type: "dsh-auth", label: "DeepSeek Harness \u7BA1\u7406\u5458" });
    }
    for (const [, provider] of this.providersTable.entries()) {
      if (provider.enabled) providers.push({ id: provider.id, type: "oidc", label: provider.label });
    }
    return providers.sort((left, right) => left.label.localeCompare(right.label, "zh-CN"));
  }
  /** Register the bootstrap super administrator or a policy-permitted member account. */
  async register(input) {
    return await this.serializeAccounts(async () => {
      this.assertEnabled();
      const first = this.accounts.size === 0;
      if (first) {
        if (!secureTextEqual(input.bootstrapToken ?? "", this.config.authBootstrapToken)) {
          throw new ChatroomAuthError("\u9996\u6B21\u6CE8\u518C\u9700\u8981\u6B63\u786E\u7684\u8D85\u7EA7\u7BA1\u7406\u5458\u521D\u59CB\u5316\u53E3\u4EE4\u3002");
        }
      } else if (!this.settings().allowSelfRegistration) {
        throw new ChatroomAuthError("\u5F53\u524D\u7CFB\u7EDF\u5DF2\u5173\u95ED\u81EA\u4E3B\u6CE8\u518C\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u521B\u5EFA\u8D26\u53F7\u3002");
      }
      const account = await this.createAccount({
        ...input,
        role: first ? "super-admin" : "member"
      });
      return { token: await this.issueSession(account.id), account: publicAccount(account) };
    });
  }
  /** Verify local credentials and issue a new opaque session. */
  async login(username, password) {
    this.assertEnabled();
    const normalized = normalizeUsername(username);
    const now = Date.now();
    const retryAfter = this.consumeLoginAttempt(normalized.key, now);
    if (retryAfter !== void 0) {
      throw new ChatroomAuthRateLimitError(retryAfter);
    }
    const account = this.findUsername(normalized.key);
    const expected = account?.passwordHash ?? await dummyPasswordHash();
    const matches = await verifyPassword(password, expected);
    if (!matches || account === void 0 || account.status !== "active" || account.passwordHash === void 0) {
      throw new ChatroomAuthError("\u8D26\u53F7\u6216\u5BC6\u7801\u4E0D\u6B63\u786E\u3002");
    }
    this.loginBuckets.delete(normalized.key);
    const updated = { ...account, lastLoginAt: now, updatedAt: now };
    await this.accounts.put(account.id, updated);
    return { token: await this.issueSession(account.id), account: publicAccount(updated) };
  }
  /** Revoke only the supplied browser session. */
  async logout(token) {
    if (token !== void 0) await this.sessions.delete(secretHash(token));
  }
  /** Replace one local password after verifying the current credential and revoke older sessions. */
  async changePassword(actor, currentPassword, newPassword) {
    return await this.serializeAccounts(async () => {
      const current = this.accounts.get(actor.participantId);
      if (current === void 0 || current.status !== "active") throw new ChatroomAuthError("\u8D26\u53F7\u4E0D\u5B58\u5728\u6216\u5DF2\u505C\u7528\u3002");
      if (current.passwordHash === void 0) {
        throw new ChatroomAuthError("\u8BE5\u8D26\u53F7\u7531\u5916\u90E8\u8EAB\u4EFD\u63D0\u4F9B\u65B9\u7BA1\u7406\uFF0C\u4E0D\u80FD\u5728\u6B64\u4FEE\u6539\u5BC6\u7801\u3002");
      }
      if (!await verifyPassword(currentPassword, current.passwordHash)) {
        throw new ChatroomAuthError("\u5F53\u524D\u5BC6\u7801\u4E0D\u6B63\u786E\u3002");
      }
      const passwordHash = await hashPassword(newPassword);
      const updated = { ...current, passwordHash, updatedAt: Date.now() };
      await this.accounts.put(current.id, updated);
      await this.revokeUserSessions(current.id);
      return { token: await this.issueSession(current.id), account: publicAccount(updated) };
    });
  }
  /** Adopt dsh-auth's verified administrator headers as an external super administrator. */
  async adoptDshAuth(headers, originalUri = "/") {
    if (!this.config.authEnabled || !this.config.authDshAuthHeaders && this.config.authDshAuthVerifyUrl === "") return void 0;
    const verified = await this.dshAuthIdentity(headers, originalUri);
    if (verified === void 0) return void 0;
    const roles = verified.roles.split(",").map((value) => value.trim());
    if (!roles.includes("admin")) return void 0;
    let username;
    try {
      username = decodeURIComponent(verified.encodedUsername);
    } catch {
      throw new ChatroomAuthError("dsh-auth \u8FD4\u56DE\u4E86\u65E0\u6548\u7684\u7BA1\u7406\u5458\u540D\u79F0\u3002");
    }
    const account = await this.externalAccount("dsh-auth", verified.subject, username, username, true);
    return { token: await this.issueSession(account.id), account: publicAccount(account) };
  }
  /** Public dsh-auth password-login location returning through the local adapter. */
  dshAuthLoginUrl(returnTo, callbackPath) {
    if (this.config.authPublicOrigin === "" || !this.config.authDshAuthHeaders && this.config.authDshAuthVerifyUrl === "") {
      throw new ChatroomAuthError("dsh-auth \u767B\u5F55\u5C1A\u672A\u914D\u7F6E\u3002");
    }
    const callback = new URL(callbackPath, this.config.authPublicOrigin);
    callback.searchParams.set("returnTo", safeReturnTo(returnTo));
    const login = new URL(this.config.authDshAuthLoginPath, this.config.authPublicOrigin);
    login.searchParams.set("returnTo", `${callback.pathname}${callback.search}`);
    return login;
  }
  /** Build one PKCE and nonce-protected enterprise OIDC authorization redirect. */
  async startOidc(providerId, returnTo) {
    this.assertEnabled();
    const provider = this.requireProvider(providerId);
    if (this.config.authPublicOrigin === "") {
      throw new ChatroomAuthError("\u7BA1\u7406\u5458\u5C1A\u672A\u914D\u7F6E\u4F01\u4E1A SSO \u7684\u516C\u7F51\u8BBF\u95EE\u5730\u5740\u3002");
    }
    const configuration = await this.oidcConfiguration(provider);
    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    this.pruneOidc();
    this.pendingOidc.set(state, {
      providerId,
      codeVerifier,
      nonce,
      returnTo: safeReturnTo(returnTo),
      expiresAt: Date.now() + 10 * 6e4
    });
    return oidc.buildAuthorizationUrl(configuration, {
      redirect_uri: this.callbackUrl(providerId),
      scope: provider.scopes,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
      nonce
    });
  }
  /** Exchange and validate one OIDC callback, then bind or create its local account. */
  async completeOidc(providerId, currentUrl) {
    this.assertEnabled();
    const state = currentUrl.searchParams.get("state") ?? "";
    const pending = this.pendingOidc.get(state);
    this.pendingOidc.delete(state);
    if (pending === void 0 || pending.providerId !== providerId || pending.expiresAt <= Date.now()) {
      throw new ChatroomAuthError("\u4F01\u4E1A\u767B\u5F55\u8BF7\u6C42\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u53D1\u8D77\u767B\u5F55\u3002");
    }
    const provider = this.requireProvider(providerId);
    const configuration = await this.oidcConfiguration(provider);
    const tokens = await oidc.authorizationCodeGrant(configuration, currentUrl, {
      pkceCodeVerifier: pending.codeVerifier,
      expectedState: state,
      expectedNonce: pending.nonce,
      idTokenExpected: true
    });
    const claims = tokens.claims();
    if (claims?.sub === void 0) throw new ChatroomAuthError("\u4F01\u4E1A\u8EAB\u4EFD\u6CA1\u6709\u8FD4\u56DE\u7A33\u5B9A\u7684\u7528\u6237\u6807\u8BC6\u3002");
    const username = claimText(claims, provider.usernameClaim) ?? claimText(claims, "preferred_username") ?? claimText(claims, "email") ?? claims.sub;
    const displayName = claimText(claims, provider.displayNameClaim) ?? claimText(claims, "name") ?? username;
    const account = await this.externalAccount(provider.id, claims.sub, username, displayName, provider.autoCreateUsers);
    return {
      token: await this.issueSession(account.id),
      account: publicAccount(account),
      returnTo: pending.returnTo
    };
  }
  /** Super-administrator account, policy, and OIDC configuration snapshot. */
  overview(actor) {
    this.assertSuperAdmin(actor);
    const settings = this.settings();
    const users = [...this.accounts.entries()].map(([, account]) => publicAccount(account)).sort((left, right) => left.username.localeCompare(right.username, "zh-CN"));
    const providers = [...this.providersTable.entries()].map(([, provider]) => adminProvider(provider)).sort((left, right) => left.label.localeCompare(right.label, "zh-CN"));
    return {
      users,
      providers,
      loginProviders: this.providers(),
      ...settings.autoRedirectProviderId == null ? {} : { autoRedirectProviderId: settings.autoRedirectProviderId },
      allowSelfRegistration: settings.allowSelfRegistration,
      oidcCallbackBase: this.config.authPublicOrigin === "" ? "" : `${this.config.authPublicOrigin}/plugins/deepseek-harness-chatroom/api/auth/oidc/`
    };
  }
  /** Create one local account from the super-administrator console. */
  async createUser(actor, input) {
    this.assertSuperAdmin(actor);
    return await this.serializeAccounts(async () => publicAccount(await this.createAccount({ ...input, role: input.role ?? "member" })));
  }
  /** Change global role or activation state without allowing the final super administrator to disappear. */
  async updateUser(actor, userId, patch) {
    this.assertSuperAdmin(actor);
    return await this.serializeAccounts(async () => {
      const current = this.accounts.get(userId);
      if (current === void 0) throw new ChatroomAuthError("\u8D26\u53F7\u4E0D\u5B58\u5728\u3002");
      const role = patch.role ?? current.role;
      const status = patch.status ?? current.status;
      if (current.role === "super-admin" && current.status === "active" && (role !== "super-admin" || status !== "active") && this.activeSuperAdmins() <= 1) {
        throw new ChatroomAuthError("\u7CFB\u7EDF\u5FC5\u987B\u81F3\u5C11\u4FDD\u7559\u4E00\u4F4D\u542F\u7528\u7684\u8D85\u7EA7\u7BA1\u7406\u5458\u3002");
      }
      const next = { ...current, role, status, updatedAt: Date.now() };
      await this.accounts.put(userId, next);
      if (status === "disabled") await this.revokeUserSessions(userId);
      return publicAccount(next);
    });
  }
  /** Enable or disable autonomous password registration. */
  async updateSettings(actor, patch) {
    this.assertSuperAdmin(actor);
    const current = this.settings();
    if (patch.autoRedirectProviderId !== void 0 && patch.autoRedirectProviderId !== null && !this.providers().some((provider) => provider.id === patch.autoRedirectProviderId)) {
      throw new ChatroomAuthError("\u81EA\u52A8\u8DF3\u8F6C\u7684\u8BA4\u8BC1\u63D0\u4F9B\u65B9\u4E0D\u5B58\u5728\u6216\u672A\u542F\u7528\u3002");
    }
    await this.settingsTable.put("auth", {
      ...current,
      ...patch.allowSelfRegistration === void 0 ? {} : { allowSelfRegistration: patch.allowSelfRegistration },
      ...patch.autoRedirectProviderId === void 0 ? {} : { autoRedirectProviderId: patch.autoRedirectProviderId },
      updatedAt: Date.now()
    });
  }
  /** Add or replace one encrypted generic OIDC provider. */
  async saveProvider(actor, input) {
    this.assertSuperAdmin(actor);
    const id = input.id.trim().toLowerCase();
    if (!PROVIDER_ID_PATTERN.test(id) || id === "dsh-auth" || id === "password") {
      throw new ChatroomAuthError("\u8BA4\u8BC1\u63D0\u4F9B\u65B9 ID \u53EA\u80FD\u4F7F\u7528\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u4E0B\u5212\u7EBF\u548C\u8FDE\u5B57\u7B26\u3002");
    }
    let issuer;
    try {
      issuer = new URL(input.issuer);
    } catch {
      throw new ChatroomAuthError("OIDC Issuer \u5FC5\u987B\u662F\u6709\u6548\u7684 HTTPS URL\u3002");
    }
    if (issuer.protocol !== "https:" || issuer.username !== "" || issuer.password !== "" || issuer.hash !== "") {
      throw new ChatroomAuthError("OIDC Issuer \u5FC5\u987B\u662F HTTPS URL\u3002");
    }
    const existing = this.providersTable.get(id);
    const secret = input.clientSecret === void 0 || input.clientSecret === "" ? existing?.encryptedClientSecret : this.encrypt(input.clientSecret);
    if (secret === void 0) throw new ChatroomAuthError("\u65B0\u8BA4\u8BC1\u63D0\u4F9B\u65B9\u5FC5\u987B\u586B\u5199 Client Secret\u3002");
    const now = Date.now();
    const provider = {
      id,
      type: "oidc",
      label: normalizeLabel(input.label, "\u63D0\u4F9B\u65B9\u540D\u79F0"),
      enabled: input.enabled,
      issuer: issuer.href.replace(/\/$/u, ""),
      clientId: normalizeOpaque(input.clientId, "Client ID"),
      encryptedClientSecret: secret,
      scopes: normalizeScopes(input.scopes),
      usernameClaim: normalizeClaim(input.usernameClaim),
      displayNameClaim: normalizeClaim(input.displayNameClaim),
      autoCreateUsers: input.autoCreateUsers,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    await this.providersTable.put(id, provider);
    const settings = this.settings();
    if (provider.enabled && settings.autoRedirectProviderId === void 0 && this.providers().length === 1) {
      await this.settingsTable.put("auth", { ...settings, autoRedirectProviderId: id, updatedAt: now });
    } else if (!provider.enabled && settings.autoRedirectProviderId === id) {
      await this.settingsTable.put("auth", { ...settings, autoRedirectProviderId: null, updatedAt: now });
    }
    this.oidcConfigurations.delete(id);
    return adminProvider(provider);
  }
  /** Remove one OIDC provider without deleting accounts already linked to it. */
  async deleteProvider(actor, providerId) {
    this.assertSuperAdmin(actor);
    await this.providersTable.delete(providerId);
    const settings = this.settings();
    if (settings.autoRedirectProviderId === providerId) {
      await this.settingsTable.put("auth", { ...settings, autoRedirectProviderId: null, updatedAt: Date.now() });
    }
    this.oidcConfigurations.delete(providerId);
  }
  /** Active public accounts for user search and private messaging. */
  activeAccounts() {
    return [...this.accounts.entries()].map(([, value]) => value).filter((value) => value.status === "active").map(publicAccount).sort((left, right) => left.displayName.localeCompare(right.displayName, "zh-CN"));
  }
  async createAccount(input) {
    const username = normalizeUsername(input.username);
    if (this.findUsername(username.key) !== void 0) throw new ChatroomAuthError("\u8BE5\u8D26\u53F7\u540D\u5DF2\u88AB\u4F7F\u7528\u3002");
    const displayName = normalizeDisplayName(input.displayName);
    const passwordHash = await hashPassword(input.password);
    const id = randomUUID();
    if (input.avatarId !== void 0 && !isChatroomAvatarId(input.avatarId)) {
      throw new ChatroomAuthError("\u8BF7\u9009\u62E9\u6709\u6548\u7684\u5934\u50CF\u3002");
    }
    const now = Date.now();
    const account = {
      id,
      username: username.value,
      usernameKey: username.key,
      displayName,
      avatarId: input.avatarId ?? fallbackAvatarId(id),
      passwordHash,
      role: input.role ?? "member",
      status: "active",
      createdAt: now,
      updatedAt: now
    };
    await this.accounts.put(id, account);
    return account;
  }
  async externalAccount(providerId, subject, suggestedUsername, suggestedDisplayName, autoCreate) {
    return await this.serializeAccounts(async () => this.resolveExternalAccount(
      providerId,
      subject,
      suggestedUsername,
      suggestedDisplayName,
      autoCreate
    ));
  }
  async resolveExternalAccount(providerId, subject, suggestedUsername, suggestedDisplayName, autoCreate) {
    const key = externalKey(providerId, subject);
    const linked = this.externalAccounts.get(key);
    if (linked !== void 0) {
      const account2 = this.accounts.get(linked.userId);
      if (account2 === void 0 || account2.status !== "active") throw new ChatroomAuthError("\u8BE5\u4F01\u4E1A\u8D26\u53F7\u5DF2\u505C\u7528\u3002");
      const updated = { ...account2, lastLoginAt: Date.now(), updatedAt: Date.now() };
      await this.accounts.put(account2.id, updated);
      return updated;
    }
    if (!autoCreate) throw new ChatroomAuthError("\u8BE5\u4F01\u4E1A\u8D26\u53F7\u5C1A\u672A\u7531\u7BA1\u7406\u5458\u5F00\u901A\u3002");
    const base = normalizeUsername(suggestedUsername);
    let candidate = base.value;
    let candidateKey = base.key;
    for (let suffix = 2; this.findUsername(candidateKey) !== void 0; suffix += 1) {
      candidate = `${base.value.slice(0, Math.max(1, USERNAME_MAX_POINTS - String(suffix).length - 1))}-${String(suffix)}`;
      candidateKey = candidate.toLowerCase();
    }
    const id = randomUUID();
    const now = Date.now();
    const account = {
      id,
      username: candidate,
      usernameKey: candidateKey,
      displayName: normalizeDisplayName(suggestedDisplayName),
      avatarId: fallbackAvatarId(id),
      role: providerId === "dsh-auth" ? "super-admin" : "member",
      status: "active",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    };
    await this.accounts.put(id, account);
    await this.externalAccounts.put(key, { providerId, subject, userId: id, createdAt: now });
    return account;
  }
  async serializeAccounts(operation) {
    const result = this.accountAdmission.then(operation);
    this.accountAdmission = result.then(() => void 0, () => void 0);
    return await result;
  }
  async issueSession(userId) {
    const token = randomBytes(32).toString("base64url");
    const now = Date.now();
    await this.sessions.put(secretHash(token), {
      userId,
      createdAt: now,
      lastSeenAt: now,
      expiresAt: now + this.config.authSessionMaxAgeSeconds * 1e3
    });
    return token;
  }
  settings() {
    return this.settingsTable.get("auth") ?? {
      allowSelfRegistration: this.config.authAllowSelfRegistration,
      updatedAt: 0
    };
  }
  findUsername(usernameKey) {
    return [...this.accounts.entries()].find(([, account]) => account.usernameKey === usernameKey)?.[1];
  }
  activeSuperAdmins() {
    return [...this.accounts.entries()].filter(([, account]) => account.role === "super-admin" && account.status === "active").length;
  }
  async revokeUserSessions(userId) {
    for (const [key, session] of this.sessions.entries()) {
      if (session.userId === userId) await this.sessions.delete(key);
    }
  }
  requireProvider(providerId) {
    const provider = this.providersTable.get(providerId);
    if (provider === void 0 || !provider.enabled) throw new ChatroomAuthError("\u8BA4\u8BC1\u63D0\u4F9B\u65B9\u4E0D\u5B58\u5728\u6216\u672A\u542F\u7528\u3002");
    return provider;
  }
  async oidcConfiguration(provider) {
    const cached = this.oidcConfigurations.get(provider.id);
    if (cached?.updatedAt === provider.updatedAt) return cached.value;
    const value = await oidc.discovery(
      new URL(provider.issuer),
      provider.clientId,
      this.decrypt(provider.encryptedClientSecret),
      void 0,
      { timeout: 10 }
    );
    this.oidcConfigurations.set(provider.id, { updatedAt: provider.updatedAt, value });
    return value;
  }
  async dshAuthIdentity(headers, originalUri) {
    if (this.config.authDshAuthHeaders) {
      const direct = dshIdentityHeaders(
        singleHeader(headers["x-dsh-auth-user-id"]),
        singleHeader(headers["x-dsh-auth-username"]),
        singleHeader(headers["x-dsh-auth-roles"])
      );
      if (direct !== void 0) return direct;
    }
    if (this.config.authDshAuthVerifyUrl === "") return void 0;
    const publicOrigin = new URL(this.config.authPublicOrigin);
    let verified;
    try {
      verified = await fetch(this.config.authDshAuthVerifyUrl, {
        method: "GET",
        headers: {
          ...headers.cookie === void 0 ? {} : { cookie: headers.cookie },
          "x-forwarded-host": publicOrigin.host,
          "x-forwarded-proto": publicOrigin.protocol.slice(0, -1),
          "x-real-ip": "127.0.0.1",
          "x-original-method": "GET",
          "x-original-uri": safeReturnTo(originalUri)
        },
        signal: AbortSignal.timeout(5e3)
      });
    } catch {
      return void 0;
    }
    if (verified.status !== 204) return void 0;
    return dshIdentityHeaders(
      verified.headers.get("x-dsh-auth-user-id") ?? void 0,
      verified.headers.get("x-dsh-auth-username") ?? void 0,
      verified.headers.get("x-dsh-auth-roles") ?? void 0
    );
  }
  consumeLoginAttempt(key, now) {
    for (const [candidate, bucket2] of this.loginBuckets) {
      if (bucket2.blockedUntil <= now && (bucket2.attempts.at(-1) ?? 0) <= now - LOGIN_WINDOW_MS) {
        this.loginBuckets.delete(candidate);
      }
    }
    let bucket = this.loginBuckets.get(key);
    if (bucket === void 0) {
      if (this.loginBuckets.size >= LOGIN_MAX_KEYS) return Math.ceil(LOGIN_WINDOW_MS / 1e3);
      bucket = { attempts: [], blockedUntil: 0 };
      this.loginBuckets.set(key, bucket);
    }
    if (bucket.blockedUntil > now) return Math.max(1, Math.ceil((bucket.blockedUntil - now) / 1e3));
    while ((bucket.attempts[0] ?? Number.POSITIVE_INFINITY) <= now - LOGIN_WINDOW_MS) bucket.attempts.shift();
    if (bucket.attempts.length >= LOGIN_MAX_ATTEMPTS) {
      bucket.blockedUntil = now + LOGIN_BLOCK_MS;
      return Math.ceil(LOGIN_BLOCK_MS / 1e3);
    }
    bucket.attempts.push(now);
    return void 0;
  }
  callbackUrl(providerId) {
    return `${this.config.authPublicOrigin}/plugins/deepseek-harness-chatroom/api/auth/oidc/${encodeURIComponent(providerId)}/callback`;
  }
  pruneOidc() {
    const now = Date.now();
    for (const [state, pending] of this.pendingOidc) {
      if (pending.expiresAt <= now) this.pendingOidc.delete(state);
    }
  }
  encrypt(value) {
    const nonce = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.encryptionKey, nonce);
    const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    return `${nonce.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${ciphertext.toString("base64url")}`;
  }
  decrypt(value) {
    const [nonceValue, tagValue, ciphertextValue] = value.split(".");
    if (nonceValue === void 0 || tagValue === void 0 || ciphertextValue === void 0) {
      throw new Error("chatroom: encrypted OIDC client secret is invalid");
    }
    const decipher = createDecipheriv("aes-256-gcm", this.encryptionKey, Buffer.from(nonceValue, "base64url"));
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64url")),
      decipher.final()
    ]).toString("utf8");
  }
  assertEnabled() {
    if (!this.config.authEnabled) throw new ChatroomAuthError("\u7CFB\u7EDF\u767B\u5F55\u5C1A\u672A\u542F\u7528\u3002");
  }
  assertSuperAdmin(actor) {
    if (actor.role !== "super-admin" || actor.status !== "active") {
      throw new ChatroomAuthError("\u53EA\u6709\u8D85\u7EA7\u7BA1\u7406\u5458\u53EF\u4EE5\u6267\u884C\u6B64\u64CD\u4F5C\u3002");
    }
  }
};
function publicAccount(account) {
  return {
    participantId: account.id,
    username: account.username,
    displayName: account.displayName,
    avatarId: account.avatarId,
    role: account.role,
    status: account.status,
    createdAt: account.createdAt,
    ...account.lastLoginAt === void 0 ? {} : { lastLoginAt: account.lastLoginAt }
  };
}
function adminProvider(provider) {
  return {
    id: provider.id,
    type: "oidc",
    label: provider.label,
    enabled: provider.enabled,
    issuer: provider.issuer,
    clientId: provider.clientId,
    hasClientSecret: true,
    scopes: provider.scopes,
    usernameClaim: provider.usernameClaim,
    displayNameClaim: provider.displayNameClaim,
    autoCreateUsers: provider.autoCreateUsers
  };
}
function normalizeUsername(value) {
  const normalized = value.normalize("NFC").trim();
  const points = Array.from(normalized).length;
  if (points < 3 || points > USERNAME_MAX_POINTS || /[\p{C}\p{Z}]/u.test(normalized)) {
    throw new ChatroomAuthError("\u8D26\u53F7\u540D\u9700\u8981 3\u201364 \u4E2A\u5B57\u7B26\uFF0C\u4E14\u4E0D\u80FD\u5305\u542B\u7A7A\u767D\u6216\u63A7\u5236\u5B57\u7B26\u3002");
  }
  return { value: normalized, key: normalized.toLowerCase() };
}
function normalizeDisplayName(value) {
  const normalized = value.normalize("NFC").trim();
  const points = Array.from(normalized).length;
  if (points < 1 || points > DISPLAY_NAME_MAX_POINTS || /\p{C}/u.test(normalized)) {
    throw new ChatroomAuthError("\u663E\u793A\u540D\u79F0\u9700\u8981 1\u201380 \u4E2A\u5B57\u7B26\u3002");
  }
  return normalized;
}
function normalizeLabel(value, label) {
  const normalized = value.normalize("NFC").trim();
  if (normalized === "" || Array.from(normalized).length > 80 || /\p{C}/u.test(normalized)) {
    throw new ChatroomAuthError(`${label}\u9700\u8981 1\u201380 \u4E2A\u5B57\u7B26\u3002`);
  }
  return normalized;
}
function normalizeOpaque(value, label) {
  const normalized = value.trim();
  if (normalized === "" || normalized.length > 512 || /\p{C}/u.test(normalized)) {
    throw new ChatroomAuthError(`${label}\u65E0\u6548\u3002`);
  }
  return normalized;
}
function normalizeClaim(value) {
  const normalized = value.trim();
  if (!/^[A-Za-z0-9_.:-]{1,128}$/u.test(normalized)) throw new ChatroomAuthError("OIDC Claim \u540D\u79F0\u65E0\u6548\u3002");
  return normalized;
}
function normalizeScopes(value) {
  const scopes = value.trim().split(/\s+/u).filter(Boolean);
  if (!scopes.includes("openid")) scopes.unshift("openid");
  if (scopes.length > 20 || scopes.some((scope) => !/^[\x21-\x7E]+$/u.test(scope))) {
    throw new ChatroomAuthError("OIDC Scopes \u65E0\u6548\u3002");
  }
  return [...new Set(scopes)].join(" ");
}
function assertPassword(password) {
  const points = Array.from(password).length;
  if (points < PASSWORD_MIN_POINTS || points > PASSWORD_MAX_POINTS || Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
    throw new ChatroomAuthError("\u5BC6\u7801\u9700\u8981 12\u2013128 \u4E2A\u5B57\u7B26\uFF0C\u4E14\u4E0D\u80FD\u8D85\u8FC7 1024 \u5B57\u8282\u3002");
  }
}
async function hashPassword(password) {
  assertPassword(password);
  const salt = randomBytes(16);
  const key = await scrypt(password, salt);
  return `$scrypt$ln=15,r=${String(SCRYPT_R)},p=${String(SCRYPT_P)}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}
async function verifyPassword(password, encoded) {
  const match = /^\$scrypt\$ln=15,r=8,p=1\$([A-Za-z0-9_-]+)\$([A-Za-z0-9_-]+)$/u.exec(encoded);
  if (match === null) return false;
  const salt = Buffer.from(match[1], "base64url");
  const expected = Buffer.from(match[2], "base64url");
  if (salt.length !== 16 || expected.length !== 32) return false;
  const actual = await scrypt(password, salt);
  return timingSafeEqual(actual, expected);
}
function scrypt(password, salt) {
  return new Promise((resolve, reject) => {
    deriveScrypt(password, salt, 32, {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
      maxmem: 64 * 1024 * 1024
    }, (error, derived) => {
      if (error !== null) reject(error);
      else resolve(derived);
    });
  });
}
var dummyHash;
function dummyPasswordHash() {
  dummyHash ??= hashPassword("chatroom-invalid-password");
  return dummyHash;
}
function secretHash(value) {
  return createHash("sha256").update(value).digest("base64url");
}
function externalKey(providerId, subject) {
  return secretHash(`${providerId}\0${subject}`);
}
function secureTextEqual(left, right) {
  const leftDigest = createHash("sha256").update(left).digest();
  const rightDigest = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest) && left !== "" && right !== "";
}
function singleHeader(value) {
  return typeof value === "string" && value.length <= 1024 ? value : void 0;
}
function dshIdentityHeaders(subject, encodedUsername, roles) {
  if (subject === void 0 || encodedUsername === void 0 || roles === void 0 || subject === "" || encodedUsername === "" || roles === "") return void 0;
  return { subject, encodedUsername, roles };
}
function safeReturnTo(value) {
  if (!value.startsWith("/") || value.startsWith("//") || /[\r\n]/u.test(value)) return "/";
  return value.slice(0, 2048);
}
function claimText(claims, name2) {
  const value = claims[name2];
  return typeof value === "string" && value !== "" ? value : void 0;
}

// src/auth-redirect.ts
function authProviderStartLocation(prefix, provider, returnTo) {
  const route = provider.type === "oidc" ? `${prefix}/auth/oidc/${encodeURIComponent(provider.id)}/start` : `${prefix}/auth/dsh-auth/start`;
  return `${route}?returnTo=${encodeURIComponent(returnTo)}`;
}
function automaticAuthRedirect(prefix, state, returnTo, requestUrl) {
  if (state.bootstrapRequired || state.autoRedirectProvider === void 0 || localLoginRequested(requestUrl, returnTo)) return void 0;
  return authProviderStartLocation(prefix, state.autoRedirectProvider, returnTo);
}
function localLoginRequested(requestUrl, returnTo) {
  if (requestUrl.searchParams.get("local") === "1") return true;
  return new URL(returnTo, "http://chatroom.local").searchParams.get("local") === "1";
}

// src/auth-page.ts
function renderAuthPage(prefix, state, returnTo) {
  const registration = state.bootstrapRequired || state.allowSelfRegistration;
  const initialMode = state.bootstrapRequired ? "register" : "login";
  const providerLinks = state.providers.map((provider) => {
    const route = provider.type === "oidc" ? `${prefix}/auth/oidc/${encodeURIComponent(provider.id)}/start` : `${prefix}/auth/dsh-auth/start`;
    return `<a class="provider" href="${escapeHtml(route)}?returnTo=${encodeURIComponent(returnTo)}">\u4F7F\u7528 ${escapeHtml(provider.label)} \u767B\u5F55</a>`;
  }).join("");
  const data = scriptJson({ prefix, returnTo, initialMode, bootstrapRequired: state.bootstrapRequired });
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>\u767B\u5F55 \xB7 DeepSeek Harness</title>
<style>
:root{color-scheme:light dark;font-family:Inter,"PingFang SC","Microsoft YaHei",system-ui,sans-serif;background:#f4f6fb;color:#172033}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:28px;background:radial-gradient(circle at 20% 10%,#dce7ff 0,transparent 36%),#f4f6fb}
main{width:min(440px,100%);background:rgba(255,255,255,.94);border:1px solid #dce1eb;border-radius:24px;padding:34px;box-shadow:0 24px 70px rgba(31,50,92,.16)}
.brand{display:flex;align-items:center;gap:12px;margin-bottom:30px}.mark{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:#2f65e8;color:white;font-size:22px}.brand strong{display:block;font-size:19px}.brand span{color:#748096;font-size:13px}
h1{font-size:28px;margin:0 0 8px}p{margin:0 0 24px;color:#68748b;line-height:1.6}.tabs{display:grid;grid-template-columns:1fr 1fr;background:#edf1f8;border-radius:12px;padding:4px;margin-bottom:20px}.tabs button{border:0;border-radius:9px;padding:10px;background:transparent;color:#667086;font-weight:650}.tabs button[aria-selected=true]{background:white;color:#172033;box-shadow:0 2px 8px rgba(34,49,84,.1)}
form{display:grid;gap:14px}label{display:grid;gap:7px;font-size:14px;font-weight:650}input{width:100%;border:1px solid #cfd6e3;border-radius:12px;padding:12px 14px;background:white;color:#172033;font:inherit;outline:0}input:focus{border-color:#4a76e8;box-shadow:0 0 0 3px #dfe8ff}.primary{border:0;border-radius:12px;padding:13px;background:#3267e8;color:white;font:inherit;font-weight:700;cursor:pointer}.primary:disabled{opacity:.55;cursor:wait}.providers{display:grid;gap:10px;margin-top:22px;padding-top:22px;border-top:1px solid #e2e6ee}.providers>span{text-align:center;color:#8690a2;font-size:13px}.provider{text-decoration:none;text-align:center;border:1px solid #cfd6e3;border-radius:12px;padding:11px;color:#29354d;font-weight:650}.error{display:none;margin-top:16px;padding:11px 13px;border-radius:10px;background:#fff0f0;color:#c53434;font-size:14px}.error[data-open=true]{display:block}.bootstrap{padding:11px 13px;border-radius:10px;background:#fff8df;color:#795d10;font-size:13px;line-height:1.5}
@media(prefers-color-scheme:dark){:root{background:#101216;color:#f0f3f8}body{background:radial-gradient(circle at 20% 10%,#1c315e 0,transparent 36%),#101216}main{background:rgba(24,27,34,.96);border-color:#333945}.tabs{background:#252a34}.tabs button[aria-selected=true]{background:#373d49;color:white}input{background:#16191f;border-color:#454c5a;color:white}.provider{border-color:#454c5a;color:#e7ebf2}.providers{border-color:#383e49}}
</style>
</head>
<body>
<main>
  <div class="brand"><span class="mark">\u2726</span><span><strong>DeepSeek Harness</strong><span>\u56E2\u961F\u534F\u4F5C\u5E73\u53F0</span></span></div>
  <h1>${state.bootstrapRequired ? "\u521B\u5EFA\u8D85\u7EA7\u7BA1\u7406\u5458" : "\u6B22\u8FCE\u56DE\u6765"}</h1>
  <p>${state.bootstrapRequired ? "\u4F7F\u7528\u90E8\u7F72\u65F6\u751F\u6210\u7684\u521D\u59CB\u5316\u53E3\u4EE4\u521B\u5EFA\u7CFB\u7EDF\u7684\u7B2C\u4E00\u4F4D\u8D85\u7EA7\u7BA1\u7406\u5458\u3002" : "\u767B\u5F55\u540E\u53EF\u8FDB\u5165\u7FA4\u804A\u3001AI \u4F1A\u8BDD\u548C\u79C1\u804A\u3002"}</p>
  ${registration ? `<div class="tabs" role="tablist"><button type="button" data-mode="login" role="tab">\u767B\u5F55</button><button type="button" data-mode="register" role="tab">${state.bootstrapRequired ? "\u521D\u59CB\u5316" : "\u6CE8\u518C"}</button></div>` : ""}
  <form id="auth-form">
    <label>\u8D26\u53F7<input name="username" autocomplete="username" minlength="3" maxlength="64" required autofocus></label>
    <label>\u5BC6\u7801<input name="password" type="password" autocomplete="current-password" minlength="12" maxlength="128" required></label>
    <div data-register hidden><label>\u663E\u793A\u540D\u79F0<input name="displayName" maxlength="80"></label></div>
    ${state.bootstrapRequired ? '<div data-register hidden><label>\u8D85\u7EA7\u7BA1\u7406\u5458\u521D\u59CB\u5316\u53E3\u4EE4<input name="bootstrapToken" type="password" autocomplete="off"></label></div><div class="bootstrap" data-register hidden>\u521D\u59CB\u5316\u53E3\u4EE4\u53EA\u7528\u4E8E\u521B\u5EFA\u7B2C\u4E00\u4F4D\u8D85\u7EA7\u7BA1\u7406\u5458\uFF0C\u521B\u5EFA\u6210\u529F\u540E\u4E0D\u4F1A\u5B58\u5165\u6D4F\u89C8\u5668\u3002</div>' : ""}
    <button class="primary" type="submit">\u7EE7\u7EED</button>
  </form>
  ${providerLinks === "" ? "" : `<div class="providers"><span>\u6216\u4F7F\u7528\u5176\u4ED6\u8EAB\u4EFD\u767B\u5F55</span>${providerLinks}</div>`}
  <div class="error" id="error" role="alert"></div>
</main>
<script id="auth-data" type="application/json">${data}</script>
<script>
const data=JSON.parse(document.getElementById('auth-data').textContent);let mode=data.initialMode;
const form=document.getElementById('auth-form'),error=document.getElementById('error'),submit=form.querySelector('button[type=submit]');
function render(){document.querySelectorAll('[data-mode]').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.mode===mode)));document.querySelectorAll('[data-register]').forEach(node=>{node.hidden=mode!=='register'});form.password.autocomplete=mode==='login'?'current-password':'new-password';submit.textContent=mode==='login'?'\u767B\u5F55':data.bootstrapRequired?'\u521B\u5EFA\u8D85\u7EA7\u7BA1\u7406\u5458':'\u6CE8\u518C\u5E76\u767B\u5F55';error.dataset.open='false'}
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;render()}));
form.addEventListener('submit',async event=>{event.preventDefault();submit.disabled=true;error.dataset.open='false';const values=Object.fromEntries(new FormData(form));const body=mode==='login'?{username:values.username,password:values.password}:{username:values.username,password:values.password,displayName:values.displayName,bootstrapToken:values.bootstrapToken};try{const response=await fetch(data.prefix+'/auth/'+mode,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});if(!response.ok){const result=await response.json().catch(()=>({}));throw new Error(result.error||'\u767B\u5F55\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002')}location.replace(data.returnTo)}catch(reason){error.textContent=reason instanceof Error?reason.message:'\u767B\u5F55\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002';error.dataset.open='true';submit.disabled=false}});render();
</script>
</body>
</html>`;
}
function escapeHtml(value) {
  return value.replace(/[&<>"']/gu, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}
function scriptJson(value) {
  return JSON.stringify(value).replace(/</gu, "\\u003c").replace(/\u2028/gu, "\\u2028").replace(/\u2029/gu, "\\u2029");
}

// src/cookies.ts
function cookieValue(header, name2) {
  if (header === void 0) return void 0;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0 || part.slice(0, index).trim() !== name2) continue;
    const value = part.slice(index + 1).trim();
    return /^[A-Za-z0-9_-]+$/u.test(value) ? value : void 0;
  }
  return void 0;
}
function sessionCookie(name2, token, maxAgeSeconds, path, secure = false) {
  return `${name2}=${token}; Path=${path}; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`;
}
function expiredSessionCookie(name2, path, secure = false) {
  return `${name2}=; Path=${path}; Max-Age=0; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`;
}

// src/routes.ts
var CHATROOM_API_PREFIX = "/plugins/deepseek-harness-chatroom/api";
var LEGACY_CHATROOM_API_PREFIX = "/chatroom/api";
var CHATROOM_API_PREFIXES = [CHATROOM_API_PREFIX, LEGACY_CHATROOM_API_PREFIX];
function matchChatroomApi(pathname) {
  for (const prefix of CHATROOM_API_PREFIXES) {
    if (pathname === prefix) return { prefix, endpoint: "" };
    if (pathname.startsWith(`${prefix}/`)) return { prefix, endpoint: pathname.slice(prefix.length) };
  }
  return void 0;
}

// src/room.ts
import { createHash as createHash2, randomBytes as randomBytes2, randomUUID as randomUUID2 } from "crypto";
import { resolveSessionPreset } from "@deepseek-ai/dsh-agent-presets";
import { AttachmentError } from "@deepseek-ai/dsh-attachment";
import { createUserMessage } from "@deepseek-ai/dsh-llm";
import { SessionId } from "@deepseek-ai/dsh-session";

// src/domain.ts
import { z as z2 } from "zod";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";

// src/reactions.ts
var CHATROOM_REACTION_EMOJIS = ["\u{1F44D}", "\u2764\uFE0F", "\u{1F602}", "\u{1F62E}", "\u{1F622}", "\u{1F389}"];
function isChatroomReactionEmoji(value) {
  return typeof value === "string" && CHATROOM_REACTION_EMOJIS.includes(value);
}

// src/domain.ts
var nonNegativeSafeInteger = z2.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
var identitySchema = z2.object({
  participantId: z2.uuid(),
  displayName: z2.string().min(1),
  avatarId: z2.string().refine(isChatroomAvatarId).optional(),
  createdAt: nonNegativeSafeInteger,
  lastSeenAt: nonNegativeSafeInteger
}).refine((record) => record.lastSeenAt >= record.createdAt, {
  path: ["lastSeenAt"],
  message: "lastSeenAt must not precede createdAt"
});
var messageSchema = z2.object({
  id: z2.string().min(1),
  sequence: nonNegativeSafeInteger,
  role: z2.union([z2.literal("human"), z2.literal("ai")]),
  participantId: z2.string().min(1),
  displayName: z2.string().min(1),
  text: z2.string().min(1),
  createdAt: nonNegativeSafeInteger,
  inReplyTo: z2.string().min(1).optional(),
  aiProcessed: z2.boolean().optional()
});
var fileSchema = z2.object({
  id: z2.uuid(),
  roomId: z2.string().min(1),
  participantId: z2.string().min(1),
  displayName: z2.string().min(1),
  name: z2.string().min(1),
  mediaType: z2.string().min(1),
  bytes: nonNegativeSafeInteger,
  data: z2.string().min(1),
  createdAt: nonNegativeSafeInteger
});
var roomSchema = z2.object({
  id: z2.string().min(1),
  title: z2.string().min(1),
  aiDisplayName: z2.string().min(1),
  sessionId: z2.string().min(1),
  createdAt: nonNegativeSafeInteger,
  createdBy: z2.string().min(1),
  ownerParticipantId: z2.string().min(1).optional(),
  adminParticipantIds: z2.array(z2.string().min(1)).optional()
});
var memberSchema = z2.object({
  roomId: z2.string().min(1),
  participantId: z2.string().min(1),
  displayName: z2.string().min(1),
  avatarId: z2.string().refine(isChatroomAvatarId),
  joinedAt: nonNegativeSafeInteger,
  lastSeenAt: nonNegativeSafeInteger
}).refine((record) => record.lastSeenAt >= record.joinedAt, {
  path: ["lastSeenAt"],
  message: "lastSeenAt must not precede joinedAt"
});
var threadRootSchema = z2.object({
  messageId: z2.string().min(1),
  displayName: z2.string().min(1),
  text: z2.string().min(1),
  role: z2.union([z2.literal("human"), z2.literal("ai")]),
  sourceSessionId: z2.string().min(1).optional(),
  sourceSeq: nonNegativeSafeInteger.optional()
});
var replySchema = z2.object({
  messageId: z2.string().min(1),
  displayName: z2.string().min(1),
  text: z2.string().min(1)
});
var threadSchema = z2.object({
  id: z2.uuid(),
  roomId: z2.string().min(1),
  root: threadRootSchema,
  sessionId: z2.string().min(1),
  createdAt: nonNegativeSafeInteger,
  createdBy: z2.string().min(1),
  rootContentVersion: z2.literal(1).optional()
});
var threadMessageSchema = z2.object({
  id: z2.uuid(),
  threadId: z2.uuid(),
  sequence: nonNegativeSafeInteger,
  role: z2.union([z2.literal("human"), z2.literal("ai")]),
  participantId: z2.string().min(1),
  displayName: z2.string().min(1),
  avatarId: z2.string().refine(isChatroomAvatarId).optional(),
  text: z2.string().min(1),
  files: z2.array(z2.object({
    id: z2.string().min(1),
    name: z2.string().min(1),
    mediaType: z2.string().min(1),
    bytes: nonNegativeSafeInteger
  })).optional(),
  hasImages: z2.boolean().optional(),
  reply: replySchema.optional(),
  createdAt: nonNegativeSafeInteger
});
var reactionSchema = z2.object({
  roomId: z2.string().min(1),
  messageId: z2.string().min(1),
  emoji: z2.string().refine(isChatroomReactionEmoji),
  participantId: z2.string().min(1),
  createdAt: nonNegativeSafeInteger
});
var accountSchema = z2.object({
  id: z2.uuid(),
  username: z2.string().min(1),
  usernameKey: z2.string().min(1),
  displayName: z2.string().min(1),
  avatarId: z2.string().refine(isChatroomAvatarId),
  passwordHash: z2.string().min(1).optional(),
  role: z2.union([z2.literal("super-admin"), z2.literal("admin"), z2.literal("member")]),
  status: z2.union([z2.literal("active"), z2.literal("disabled")]),
  createdAt: nonNegativeSafeInteger,
  updatedAt: nonNegativeSafeInteger,
  lastLoginAt: nonNegativeSafeInteger.optional()
});
var authSessionSchema = z2.object({
  userId: z2.uuid(),
  createdAt: nonNegativeSafeInteger,
  lastSeenAt: nonNegativeSafeInteger,
  expiresAt: nonNegativeSafeInteger
});
var authSettingsSchema = z2.object({
  allowSelfRegistration: z2.boolean(),
  autoRedirectProviderId: z2.string().min(1).nullable().optional(),
  updatedAt: nonNegativeSafeInteger
});
var authProviderSchema = z2.object({
  id: z2.string().min(1),
  type: z2.literal("oidc"),
  label: z2.string().min(1),
  enabled: z2.boolean(),
  issuer: z2.string().url(),
  clientId: z2.string().min(1),
  encryptedClientSecret: z2.string().min(1),
  scopes: z2.string().min(1),
  usernameClaim: z2.string().min(1),
  displayNameClaim: z2.string().min(1),
  autoCreateUsers: z2.boolean(),
  createdAt: nonNegativeSafeInteger,
  updatedAt: nonNegativeSafeInteger
});
var externalAccountSchema = z2.object({
  providerId: z2.string().min(1),
  subject: z2.string().min(1),
  userId: z2.uuid(),
  createdAt: nonNegativeSafeInteger
});
var directConversationSchema = z2.object({
  id: z2.uuid(),
  participantIds: z2.tuple([z2.uuid(), z2.uuid()]),
  createdAt: nonNegativeSafeInteger,
  updatedAt: nonNegativeSafeInteger,
  nextSequence: nonNegativeSafeInteger
});
var directMessageSchema = z2.object({
  id: z2.uuid(),
  conversationId: z2.uuid(),
  sequence: nonNegativeSafeInteger,
  senderId: z2.uuid(),
  text: z2.string().min(1),
  createdAt: nonNegativeSafeInteger
});
var chatroomDomainSpec = defineDomain({
  name: "chatroom",
  version: 0,
  tables: {
    identities: domainTable(identitySchema),
    messages: domainTable(messageSchema),
    rooms: domainTable(roomSchema),
    files: domainTable(fileSchema),
    members: domainTable(memberSchema),
    threads: domainTable(threadSchema),
    thread_messages: domainTable(threadMessageSchema),
    reactions: domainTable(reactionSchema),
    accounts: domainTable(accountSchema),
    auth_sessions: domainTable(authSessionSchema),
    auth_settings: domainTable(authSettingsSchema),
    auth_providers: domainTable(authProviderSchema),
    external_accounts: domainTable(externalAccountSchema),
    direct_conversations: domainTable(directConversationSchema),
    direct_messages: domainTable(directMessageSchema)
  }
});

// src/message.ts
var PARTICIPANT_MARKER_START = "\u2063dsh-chatroom:";
var PARTICIPANT_MARKER_END = "\u2063";
var REPLY_MARKER_START = "\u2063dsh-chatroom-reply:";
var FILE_MARKER_START = "\u2063dsh-chatroom-file:";
var FORWARD_MARKER_START = "\u2063dsh-chatroom-forward:";
function identifyChatroomText(text, identity) {
  return `${PARTICIPANT_MARKER_START}${identity.participantId}|${identity.avatarId}${PARTICIPANT_MARKER_END}${identity.displayName}\uFF1A${text}`;
}
function identifyPrompt(content, identity, reply) {
  let identified = false;
  const output = content.map((part) => {
    if (identified || part.type !== "text") return part;
    identified = true;
    return { ...part, text: identifyChatroomText(reply === void 0 ? part.text : identifyReplyText(part.text, reply), identity) };
  });
  return identified ? output : [{ type: "text", text: identifyChatroomText(reply === void 0 ? "" : identifyReplyText("", reply), identity) }, ...output];
}
function participantMarker(text) {
  if (!text.startsWith(PARTICIPANT_MARKER_START)) return void 0;
  const end = text.indexOf(PARTICIPANT_MARKER_END, PARTICIPANT_MARKER_START.length);
  if (end < 0) return void 0;
  const payload = text.slice(PARTICIPANT_MARKER_START.length, end);
  const separator = payload.indexOf("|");
  const participantId = separator < 0 ? payload : payload.slice(0, separator);
  if (participantId === "") return void 0;
  const candidate = separator < 0 ? void 0 : payload.slice(separator + 1);
  return {
    participantId,
    avatarId: isChatroomAvatarId(candidate) ? candidate : fallbackAvatarId(participantId),
    length: end + PARTICIPANT_MARKER_END.length
  };
}
function identifyReplyText(text, reply) {
  return `${REPLY_MARKER_START}${encodePayload(reply)}${PARTICIPANT_MARKER_END}${replyPrefix(reply)}${text}`;
}
function projectReplyText(text) {
  if (!text.startsWith(REPLY_MARKER_START)) return { text };
  const end = text.indexOf(PARTICIPANT_MARKER_END, REPLY_MARKER_START.length);
  if (end < 0) return { text };
  const reply = decodePayload(text.slice(REPLY_MARKER_START.length, end));
  if (!validReply(reply)) return { text };
  let visible = text.slice(end + PARTICIPANT_MARKER_END.length);
  const prefix = replyPrefix(reply);
  if (visible.startsWith(prefix)) visible = visible.slice(prefix.length);
  return { text: visible, reply };
}
function identifyFileText(file) {
  return `
${FILE_MARKER_START}${encodePayload(file)}${PARTICIPANT_MARKER_END}${filePrefix(file)}`;
}
function projectFileText(text) {
  const files = [];
  let visible = text;
  while (true) {
    const start = visible.indexOf(FILE_MARKER_START);
    if (start < 0) break;
    const end = visible.indexOf(PARTICIPANT_MARKER_END, start + FILE_MARKER_START.length);
    if (end < 0) break;
    const file = decodePayload(visible.slice(start + FILE_MARKER_START.length, end));
    if (!validFile(file)) break;
    files.push(file);
    const before = visible.slice(0, start).replace(/\n$/u, "");
    let after = visible.slice(end + PARTICIPANT_MARKER_END.length);
    const prefix = filePrefix(file);
    if (after.startsWith(prefix)) after = after.slice(prefix.length);
    visible = `${before}${after}`;
  }
  return { text: visible, files };
}
function identifyForwardText(bundle) {
  return `${FORWARD_MARKER_START}${encodePayload(bundle)}${PARTICIPANT_MARKER_END}${forwardPrefix(bundle)}`;
}
function projectForwardText(text) {
  if (!text.startsWith(FORWARD_MARKER_START)) return { text };
  const end = text.indexOf(PARTICIPANT_MARKER_END, FORWARD_MARKER_START.length);
  if (end < 0) return { text };
  const forward = decodePayload(text.slice(FORWARD_MARKER_START.length, end));
  if (!validForward(forward)) return { text };
  let visible = text.slice(end + PARTICIPANT_MARKER_END.length);
  const prefix = forwardPrefix(forward);
  if (visible.startsWith(prefix)) visible = visible.slice(prefix.length);
  return { text: visible, forward };
}
function mentionsAi(content, aiDisplayName) {
  const text = content.filter((part) => part.type === "text").map((part) => part.text).join("\n");
  return [aiDisplayName, "AI"].some((name2) => mentionPattern(name2).test(text));
}
function mentionPattern(name2) {
  const escaped = name2.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return new RegExp(`@${escaped}(?=$|[^\\p{L}\\p{N}_])`, "iu");
}
function replyPrefix(reply) {
  return `\u56DE\u590D ${reply.displayName}\u300C${reply.text}\u300D
`;
}
function filePrefix(file) {
  return `\u6587\u4EF6\uFF1A${file.name}`;
}
function forwardPrefix(bundle) {
  const lines = bundle.items.map((item) => `${item.displayName}\uFF1A${item.text}`);
  return `\u5408\u5E76\u8F6C\u53D1\uFF08${bundle.items.length} \u6761\uFF09
${lines.join("\n")}`;
}
function encodePayload(value) {
  return encodeURIComponent(JSON.stringify(value));
}
function decodePayload(value) {
  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return void 0;
  }
}
function validReply(value) {
  if (value === null || typeof value !== "object") return false;
  const item = value;
  return typeof item.messageId === "string" && typeof item.displayName === "string" && typeof item.text === "string";
}
function validFile(value) {
  if (value === null || typeof value !== "object") return false;
  const item = value;
  return typeof item.id === "string" && typeof item.name === "string" && typeof item.mediaType === "string" && typeof item.bytes === "number";
}
function validForward(value) {
  if (value === null || typeof value !== "object") return false;
  const bundle = value;
  if (typeof bundle.sourceRoomId !== "string" || typeof bundle.sourceRoomTitle !== "string" || !Array.isArray(bundle.items) || bundle.items.length === 0) return false;
  return bundle.items.every((raw) => {
    if (raw === null || typeof raw !== "object") return false;
    const item = raw;
    return typeof item.messageId === "string" && (item.role === "human" || item.role === "ai") && typeof item.displayName === "string" && typeof item.text === "string" && typeof item.createdAt === "number" && (item.sourceSessionId === void 0 || typeof item.sourceSessionId === "string") && (item.sourceSeq === void 0 || typeof item.sourceSeq === "number") && (item.content === void 0 || Array.isArray(item.content) && item.content.every(validForwardContentPart)) && (item.reply === void 0 || validReply(item.reply)) && (item.reactions === void 0 || Array.isArray(item.reactions) && item.reactions.every((reaction) => reaction !== null && typeof reaction === "object" && typeof reaction.emoji === "string" && typeof reaction.count === "number"));
  });
}
function validForwardContentPart(value) {
  if (value === null || typeof value !== "object") return false;
  const part = value;
  if (part.type === "text") return typeof part.text === "string" && typeof part.markdown === "boolean";
  if (part.type === "file") return validFile(part.file);
  if (part.type !== "image" || part.image === null || typeof part.image !== "object") return false;
  const image = part.image;
  return typeof image.attachmentId === "string" && typeof image.mediaType === "string" && typeof image.bytes === "number" && typeof image.width === "number" && typeof image.height === "number";
}

// src/room.ts
var ChatroomInputError = class extends Error {
};
var ChatroomRuntime = class {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    this.log = ctx.logger("deepseek-harness-chatroom");
  }
  ctx;
  config;
  log;
  domain;
  identities;
  roomRecords;
  files;
  members;
  threads;
  threadMessages;
  reactions;
  directConversations;
  directMessages;
  authentication;
  states = /* @__PURE__ */ new Map();
  sessionRoomCreations = /* @__PURE__ */ new Map();
  threadStates = /* @__PURE__ */ new Map();
  notificationClients = /* @__PURE__ */ new Set();
  ready = false;
  stopping = false;
  /** Public metadata for the configured legacy room. */
  get room() {
    return this.requireRoom(this.config.roomId);
  }
  /** Ordered public room directory. */
  get rooms() {
    const records = [...this.states.values()].map((state) => state.record);
    records.sort((left, right) => {
      if (left.id === this.config.roomId) return -1;
      if (right.id === this.config.roomId) return 1;
      return left.createdAt - right.createdAt || left.id.localeCompare(right.id);
    });
    return records.map(publicRoom);
  }
  /** Current member roster for one room-management response. */
  membersForRoom(roomId) {
    return this.roomMembers(this.requireState(roomId));
  }
  /** Maximum accepted JSON body for one text, image, and file room submission. */
  get maxPromptRequestBytes() {
    const { maxImagesPerMessage, maxMessageImageBytes } = this.ctx.attachments.imageLimits;
    const encodedImages = Math.ceil(maxMessageImageBytes / 3) * 4;
    const encodedFiles = Math.ceil(this.config.maxMessageFileBytes / 3) * 4;
    return encodedImages + encodedFiles + this.config.maxMessageTextChars * 4 + (maxImagesPerMessage + this.config.maxFilesPerMessage) * 2048 + 8192;
  }
  /** Whether identity persistence and the configured shared Session are ready. */
  get isReady() {
    return this.ready && !this.stopping;
  }
  /** Account and provider manager initialized with the chatroom storage domain. */
  get auth() {
    if (this.authentication === void 0) throw new Error("chatroom authentication is not ready");
    return this.authentication;
  }
  /** Whether one model request belongs to a room or branch Session owned by this runtime. */
  ownsSession(sessionId) {
    return [...this.states.values()].some((state) => state.record.sessionId === sessionId) || [...this.threadStates.values()].some((state) => state.record.sessionId === sessionId);
  }
  /** Open storage, seed the original room, and acquire its Session without blocking Harness startup. */
  async start() {
    const domain = await this.ctx.storageDomain.open(chatroomDomainSpec);
    this.domain = domain;
    this.identities = domain.table("identities");
    this.roomRecords = domain.table("rooms");
    this.files = domain.table("files");
    this.members = domain.table("members");
    this.threads = domain.table("threads");
    this.threadMessages = domain.table("thread_messages");
    this.reactions = domain.table("reactions");
    this.directConversations = domain.table("direct_conversations");
    this.directMessages = domain.table("direct_messages");
    this.authentication = new ChatroomAuth(
      this.config,
      domain.table("accounts"),
      domain.table("auth_sessions"),
      domain.table("auth_settings"),
      domain.table("auth_providers"),
      domain.table("external_accounts")
    );
    await this.authentication.start();
    await this.seedConfiguredRoom();
    for (const [, record] of this.requireRoomRecords().entries()) {
      this.states.set(record.id, newRoomState(record));
    }
    for (const [, record] of this.requireThreads().entries()) {
      this.threadStates.set(record.id, newThreadState(record));
    }
    await this.ensureRoom(this.config.roomId);
    this.ready = true;
  }
  /** Stop intake, close presence streams, and release every activated room. */
  async stop() {
    if (this.stopping) return;
    this.stopping = true;
    this.ready = false;
    for (const state of this.states.values()) {
      for (const client of state.clients) client.response.end();
      state.clients.clear();
    }
    for (const client of this.notificationClients) client.response.end();
    this.notificationClients.clear();
    await Promise.allSettled([...this.states.values()].map(async (state) => {
      await state.admission;
      await state.activation?.catch(() => void 0);
      await state.binding?.release();
      state.binding = void 0;
    }));
    this.states.clear();
    await Promise.allSettled([...this.threadStates.values()].map(async (state) => {
      await state.admission;
      await state.activation?.catch(() => void 0);
      await state.binding?.release();
      state.binding = void 0;
    }));
    this.threadStates.clear();
    await this.domain?.close();
    this.domain = void 0;
    this.identities = void 0;
    this.roomRecords = void 0;
    this.files = void 0;
    this.members = void 0;
    this.threads = void 0;
    this.threadMessages = void 0;
    this.reactions = void 0;
    this.directConversations = void 0;
    this.directMessages = void 0;
    this.authentication = void 0;
  }
  /** Resolve an opaque cookie token to its durable identity. */
  identity(token) {
    if (!this.isReady || token === void 0) return void 0;
    const record = this.requireIdentities().get(tokenHash(token));
    return record === void 0 ? void 0 : publicIdentity(record);
  }
  /** Mint and durably bind a new browser identity. */
  async createIdentity(displayName, avatarId) {
    this.assertReady();
    const normalized = normalizeDisplayName2(displayName, this.config.maxDisplayNameChars);
    const token = randomBytes2(32).toString("base64url");
    const now = Date.now();
    const participantId = randomUUID2();
    if (avatarId !== void 0 && !isChatroomAvatarId(avatarId)) throw new ChatroomInputError("\u8BF7\u9009\u62E9\u6709\u6548\u7684\u5934\u50CF\u3002");
    const record = {
      participantId,
      displayName: normalized,
      avatarId: avatarId ?? fallbackAvatarId(participantId),
      createdAt: now,
      lastSeenAt: now
    };
    await this.requireIdentities().put(tokenHash(token), record);
    return { token, identity: publicIdentity(record) };
  }
  /** Update the display fields for one existing browser identity. */
  async updateIdentity(token, displayName, avatarId) {
    this.assertReady();
    const key = tokenHash(token);
    const existing = this.requireIdentities().get(key);
    if (existing === void 0) throw new ChatroomInputError("\u804A\u5929\u5BA4\u8EAB\u4EFD\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u8FDB\u5165\u3002");
    const normalized = normalizeDisplayName2(displayName, this.config.maxDisplayNameChars);
    if (avatarId !== void 0 && !isChatroomAvatarId(avatarId)) throw new ChatroomInputError("\u8BF7\u9009\u62E9\u6709\u6548\u7684\u5934\u50CF\u3002");
    const record = {
      ...existing,
      displayName: normalized,
      avatarId: avatarId ?? existing.avatarId ?? fallbackAvatarId(existing.participantId),
      lastSeenAt: Date.now()
    };
    await this.requireIdentities().put(key, record);
    for (const [memberKey, member] of this.requireMembers().entries()) {
      if (member.participantId !== record.participantId) continue;
      await this.requireMembers().put(memberKey, {
        ...member,
        displayName: record.displayName,
        avatarId: record.avatarId ?? fallbackAvatarId(record.participantId),
        lastSeenAt: record.lastSeenAt
      });
      const state = this.states.get(member.roomId);
      if (state !== void 0) this.broadcastPresence(state);
    }
    return publicIdentity(record);
  }
  /** Revoke one browser identity token. */
  async deleteIdentity(token) {
    this.assertReady();
    if (token !== void 0) await this.requireIdentities().delete(tokenHash(token));
  }
  /** Create and activate one independent shared Harness Session. */
  async createRoom(title, identity) {
    this.assertReady();
    const id = randomUUID2();
    const record = {
      id,
      title: normalizeRoomTitle(title, this.config.maxRoomTitleChars),
      aiDisplayName: this.config.aiDisplayName,
      sessionId: `chatroom-v1-${id}`,
      createdAt: Date.now(),
      createdBy: identity.participantId,
      ownerParticipantId: identity.participantId,
      adminParticipantIds: []
    };
    await this.requireRoomRecords().put(id, record);
    const state = newRoomState(record);
    this.states.set(id, state);
    try {
      const binding = await this.ensureRoom(id);
      this.ensureRoomTitle(binding, record.title);
      await this.touchMember(id, identity);
      return publicRoom(record);
    } catch (error) {
      this.states.delete(id);
      await this.requireRoomRecords().delete(id);
      throw error;
    }
  }
  /** Adopt one native Harness Session as a shared room, once, across concurrent browsers. */
  async ensureSessionRoom(sessionId, title, identity) {
    this.assertReady();
    const existing = [...this.states.values()].find((state) => state.record.sessionId === sessionId);
    if (existing !== void 0) {
      await this.touchMember(existing.record.id, identity);
      return publicRoom(existing.record);
    }
    const pending = this.sessionRoomCreations.get(sessionId);
    if (pending !== void 0) {
      const room = await pending;
      await this.touchMember(room.id, identity);
      return room;
    }
    const creation = this.createSessionRoom(sessionId, title, identity);
    this.sessionRoomCreations.set(sessionId, creation);
    try {
      return await creation;
    } finally {
      this.sessionRoomCreations.delete(sessionId);
    }
  }
  async createSessionRoom(sessionId, title, identity) {
    const normalizedSessionId = String(SessionId(sessionId));
    if ([...this.threadStates.values()].some((state2) => state2.record.sessionId === normalizedSessionId)) {
      throw new ChatroomInputError("\u5206\u652F\u4F1A\u8BDD\u4E0D\u80FD\u5355\u72EC\u8F6C\u6362\u4E3A\u7FA4\u804A\u3002");
    }
    const live = this.ctx.agents.get(SessionId(normalizedSessionId));
    const persisted = live !== void 0 || (await this.ctx.sessionPersistence.list()).some((header) => String(header.id) === normalizedSessionId);
    if (!persisted) throw new ChatroomInputError("Harness \u4F1A\u8BDD\u4E0D\u5B58\u5728\u6216\u5C1A\u672A\u5C31\u7EEA\u3002");
    const id = `session-${createHash2("sha256").update(normalizedSessionId).digest("base64url").slice(0, 24)}`;
    const record = {
      id,
      title: normalizeRoomTitle(title, this.config.maxRoomTitleChars),
      aiDisplayName: this.config.aiDisplayName,
      sessionId: normalizedSessionId,
      createdAt: Date.now(),
      createdBy: identity.participantId,
      ownerParticipantId: identity.participantId,
      adminParticipantIds: []
    };
    await this.requireRoomRecords().put(id, record);
    const state = newRoomState(record);
    this.states.set(id, state);
    try {
      await this.ensureRoom(id);
      await this.touchMember(id, identity);
      return publicRoom(record);
    } catch (error) {
      this.states.delete(id);
      await this.requireRoomRecords().delete(id);
      throw error;
    }
  }
  /** Activate an existing room and return its public metadata. */
  async selectRoom(roomId, identity) {
    this.assertReady();
    const binding = await this.ensureRoom(roomId);
    if (identity !== void 0) this.ensureRoomTitle(binding, this.requireState(roomId).record.title);
    if (identity !== void 0) await this.touchMember(roomId, identity);
    return this.requireRoom(roomId);
  }
  /** Rename one room as its owner or an administrator. */
  async renameRoom(roomId, title, identity) {
    this.assertReady();
    const state = this.requireState(roomId);
    const normalizedTitle = normalizeRoomTitle(title, this.config.maxRoomTitleChars);
    const record = await this.requireRoomRecords().update(roomId, (current) => {
      this.assertRoomManager(current, identity.participantId);
      return { ...current, title: normalizedTitle };
    });
    state.record = record;
    const binding = await this.ensureRoom(roomId);
    this.ensureRoomTitle(binding, record.title);
    this.broadcast(state, { type: "room-updated", room: publicRoom(record), members: this.roomMembers(state) });
    return publicRoom(record);
  }
  /** Promote or demote one room member; only the owner controls administrators. */
  async setMemberRole(roomId, participantId, role, identity) {
    this.assertReady();
    const state = this.requireState(roomId);
    if (![...this.requireMembers().entries()].some(([, member]) => member.roomId === roomId && member.participantId === participantId)) {
      throw new ChatroomInputError("\u7FA4\u6210\u5458\u4E0D\u5B58\u5728\u3002");
    }
    const record = await this.requireRoomRecords().update(roomId, (current) => {
      if (current.ownerParticipantId !== identity.participantId) {
        throw new ChatroomInputError("\u53EA\u6709\u7FA4\u4E3B\u53EF\u4EE5\u8BBE\u7F6E\u7BA1\u7406\u5458\u3002");
      }
      if (participantId === current.ownerParticipantId) throw new ChatroomInputError("\u4E0D\u80FD\u4FEE\u6539\u7FA4\u4E3B\u89D2\u8272\u3002");
      const admins = new Set(current.adminParticipantIds ?? []);
      if (role === "admin") admins.add(participantId);
      else admins.delete(participantId);
      return { ...current, adminParticipantIds: [...admins].sort() };
    });
    state.record = record;
    const members = this.roomMembers(state);
    this.broadcast(state, { type: "room-updated", room: publicRoom(record), members });
    return members;
  }
  /** Append human chat immediately; wake the Agent only for an explicit AI mention. */
  async submit(roomId, identity, content, mode, reply) {
    this.assertReady();
    const state = this.requireState(roomId);
    const task = state.admission.then(async () => {
      const binding = await this.ensureRoom(roomId);
      const aiTriggered = mentionsAi(content, state.record.aiDisplayName);
      const { provider, model: modelId } = binding.agent.options;
      if (aiTriggered && provider !== void 0 && modelId !== void 0 && content.some((part) => part.type === "image")) {
        const model = await this.ctx.llm.resolveModelInfo(provider, modelId);
        if (model.inputModalities !== void 0 && !model.inputModalities.includes("image")) {
          throw new ChatroomInputError(`\u6A21\u578B ${JSON.stringify(modelId)} \u4E0D\u652F\u6301\u56FE\u7247\u8F93\u5165\u3002`);
        }
      }
      const durable = await this.durableContent(roomId, identity, identifyPrompt(content, identity, reply));
      const message = createUserMessage({ content: durable, source: { kind: "user" } });
      if (!aiTriggered) {
        binding.agent.session.append("user/message", message, { surfaceOp: "append" });
      } else if (mode === "steer") {
        binding.agent.steer(message);
      } else {
        binding.agent.followup(message);
      }
      await this.touchMember(roomId, identity);
      this.notify({
        id: randomUUID2(),
        roomId,
        roomTitle: state.record.title,
        participantId: identity.participantId,
        displayName: identity.displayName,
        role: "human",
        text: promptPreview(content),
        createdAt: Date.now()
      });
      return { accepted: true, aiTriggered };
    });
    state.admission = task.then(() => void 0, () => void 0);
    return await task;
  }
  /** Toggle one participant reaction and replace its room-wide summary. */
  async toggleReaction(roomId, messageId, emoji, identity) {
    this.assertReady();
    const state = this.requireState(roomId);
    const normalizedMessageId = normalizeMessageId(messageId);
    const task = state.admission.then(async () => {
      const key = reactionKey(roomId, normalizedMessageId, emoji, identity.participantId);
      const table = this.requireReactions();
      if (table.get(key) === void 0) {
        await table.put(key, {
          roomId,
          messageId: normalizedMessageId,
          emoji,
          participantId: identity.participantId,
          createdAt: Date.now()
        });
      } else {
        await table.delete(key);
      }
      await this.touchMember(roomId, identity);
      const reaction = this.reactionSummary(roomId, normalizedMessageId, emoji);
      this.broadcast(state, { type: "reaction", reaction });
      return reaction;
    });
    state.admission = task.then(() => void 0, () => void 0);
    return await task;
  }
  /** Append selected messages as one merged-forward card in another room. */
  async forwardMessages(sourceRoomId, targetRoomId, messages, identity) {
    this.assertReady();
    if (sourceRoomId === targetRoomId) throw new ChatroomInputError("\u8BF7\u9009\u62E9\u5176\u4ED6\u7FA4\u804A\u8FDB\u884C\u8F6C\u53D1\u3002");
    const source = this.requireState(sourceRoomId);
    const target = this.requireState(targetRoomId);
    const requested = normalizeForwardItems(messages);
    const normalized = await Promise.all(requested.map(async (item) => item.sourceSessionId === void 0 || item.sourceSeq === void 0 ? item : await this.resolveForwardItem(sourceRoomId, item)));
    const task = target.admission.then(async () => {
      const binding = await this.ensureRoom(targetRoomId);
      const bundle = {
        sourceRoomId,
        sourceRoomTitle: source.record.title,
        items: normalized
      };
      const identified = identifyPrompt([{ type: "text", text: identifyForwardText(bundle) }], identity);
      const durable = await this.durableContent(targetRoomId, identity, identified);
      binding.agent.session.append("user/message", createUserMessage({
        content: durable,
        source: { kind: "user" }
      }), { surfaceOp: "append" });
      await this.touchMember(targetRoomId, identity);
      this.notify({
        id: randomUUID2(),
        roomId: targetRoomId,
        roomTitle: target.record.title,
        participantId: identity.participantId,
        displayName: identity.displayName,
        role: "human",
        text: `\u8F6C\u53D1\u4E86 ${normalized.length} \u6761\u6D88\u606F`,
        createdAt: Date.now()
      });
      return { accepted: true, aiTriggered: false };
    });
    target.admission = task.then(() => void 0, () => void 0);
    return await task;
  }
  async resolveForwardItem(sourceRoomId, item) {
    if (item.sourceSessionId === void 0 || item.sourceSeq === void 0) {
      throw new ChatroomInputError("\u8F6C\u53D1\u6765\u6E90\u6D88\u606F\u4E0D\u5B8C\u6574\u3002");
    }
    const source = await this.forwardSourceBinding(sourceRoomId, item.sourceSessionId);
    const event = source.agent.session.events.find((candidate) => candidate.seq === item.sourceSeq);
    if (event === void 0) throw new ChatroomInputError("\u8F6C\u53D1\u6765\u6E90\u6D88\u606F\u4E0D\u5B58\u5728\u6216\u5DF2\u53D8\u5316\u3002");
    const message = event.type === "user/message" ? event.data : event.type === "assistant/message" ? event.data.message : void 0;
    if (message === void 0 || message.role === "assistant" !== (item.role === "ai")) {
      throw new ChatroomInputError("\u8F6C\u53D1\u6765\u6E90\u6D88\u606F\u4E0D\u5B58\u5728\u6216\u5DF2\u53D8\u5316\u3002");
    }
    const projected = projectForwardContent(message.content, item.role);
    const sourceRoom = this.requireState(sourceRoomId).record;
    const displayName = item.role === "ai" ? sourceRoom.aiDisplayName : projected.displayName ?? item.displayName;
    const reactions = this.reactionsForRoom(sourceRoomId).filter((reaction) => reaction.messageId === item.messageId && reaction.participantIds.length > 0).map((reaction) => ({ emoji: reaction.emoji, count: reaction.participantIds.length }));
    return {
      messageId: item.messageId,
      sourceSessionId: item.sourceSessionId,
      sourceSeq: item.sourceSeq,
      role: item.role,
      displayName,
      text: projected.text,
      createdAt: event.time,
      content: projected.content,
      ...projected.reply === void 0 ? {} : { reply: projected.reply },
      ...reactions.length === 0 ? {} : { reactions },
      ...projected.forward === void 0 ? {} : { forward: projected.forward }
    };
  }
  async forwardSourceBinding(roomId, sessionId) {
    const room = this.requireState(roomId);
    if (room.record.sessionId === sessionId) return await this.ensureRoom(roomId);
    const thread = [...this.threadStates.values()].find((candidate) => candidate.record.roomId === roomId && candidate.record.sessionId === sessionId);
    if (thread === void 0) throw new ChatroomInputError("\u8F6C\u53D1\u6765\u6E90\u4F1A\u8BDD\u4E0D\u5C5E\u4E8E\u5F53\u524D\u7FA4\u804A\u3002");
    return await this.ensureThread(thread.record.id);
  }
  /** Resolve one authenticated room-file download. */
  file(fileId) {
    this.assertReady();
    const record = this.requireFiles().get(fileId);
    if (record === void 0) throw new ChatroomInputError("\u6587\u4EF6\u4E0D\u5B58\u5728\u3002");
    return { ref: publicFile(record), data: decodeBase64(record.data, "\u6587\u4EF6") };
  }
  /** Resolve one forwarded image only when the durable source event still owns its attachment. */
  async image(sourceRoomId, sourceSessionId, sourceSeq, ref) {
    this.assertReady();
    const binding = await this.forwardSourceBinding(sourceRoomId, sourceSessionId);
    const event = binding.agent.session.events.find((candidate) => candidate.seq === sourceSeq);
    const message = event?.type === "user/message" ? event.data : event?.type === "assistant/message" ? event.data.message : void 0;
    const attachment = message?.content.find((block) => block.type === "image" && String(block.attachment.attachmentId) === ref.attachmentId && block.attachment.mediaType === ref.mediaType)?.attachment;
    if (attachment === void 0) throw new ChatroomInputError("\u56FE\u7247\u6765\u6E90\u6D88\u606F\u4E0D\u5B58\u5728\u6216\u5DF2\u53D8\u5316\u3002");
    const stored = await this.ctx.attachments.readImage(attachment);
    return {
      ref: { ...stored.ref, attachmentId: String(stored.ref.attachmentId) },
      data: stored.data
    };
  }
  /** Attach one authenticated presence client to one room. */
  subscribe(roomId, identity, response) {
    this.assertReady();
    const state = this.requireState(roomId);
    if (state.binding === void 0) throw new Error(`chatroom room ${JSON.stringify(roomId)} is not active`);
    const client = { participantId: identity.participantId, response };
    state.clients.add(client);
    const snapshot = {
      type: "snapshot",
      room: publicRoom(state.record),
      identity,
      online: onlineCount(state),
      members: this.roomMembers(state),
      reactions: this.reactionsForRoom(roomId),
      threadPreviews: this.threadPreviewsForRoom(roomId)
    };
    writeSse(response, snapshot);
    this.broadcastPresence(state);
    let disposed = false;
    return () => {
      if (disposed) return;
      disposed = true;
      state.clients.delete(client);
      if (!this.stopping) this.broadcastPresence(state);
    };
  }
  /** Attach one identity to the global message-notification stream. */
  subscribeNotifications(identity, response) {
    this.assertReady();
    const client = { participantId: identity.participantId, response };
    this.notificationClients.add(client);
    return () => {
      this.notificationClients.delete(client);
    };
  }
  /** List active peers and private conversations visible only to the requesting account. */
  directDirectory(identity) {
    this.assertReady();
    const peers = this.auth.activeAccounts().filter((account) => account.participantId !== identity.participantId).map((account) => ({
      participantId: account.participantId,
      username: account.username,
      displayName: account.displayName,
      avatarId: account.avatarId
    }));
    const conversations = [...this.requireDirectConversations().entries()].map(([, conversation]) => conversation).filter((conversation) => conversation.participantIds.includes(identity.participantId)).map((conversation) => this.publicDirectConversation(conversation, identity.participantId)).sort((left, right) => right.updatedAt - left.updatedAt);
    return { peers, conversations };
  }
  /** Create or reopen one two-account private conversation. */
  async openDirect(peerId, identity) {
    this.assertReady();
    if (peerId === identity.participantId) throw new ChatroomInputError("\u4E0D\u80FD\u548C\u81EA\u5DF1\u53D1\u8D77\u79C1\u804A\u3002");
    if (!this.auth.activeAccounts().some((account) => account.participantId === peerId)) {
      throw new ChatroomInputError("\u79C1\u804A\u5BF9\u8C61\u4E0D\u5B58\u5728\u6216\u5DF2\u505C\u7528\u3002");
    }
    const participants = [identity.participantId, peerId].sort();
    let record = [...this.requireDirectConversations().entries()].find(([, candidate]) => candidate.participantIds[0] === participants[0] && candidate.participantIds[1] === participants[1])?.[1];
    if (record === void 0) {
      const now = Date.now();
      record = {
        id: randomUUID2(),
        participantIds: participants,
        createdAt: now,
        updatedAt: now,
        nextSequence: 1
      };
      await this.requireDirectConversations().put(record.id, record);
    }
    return {
      ...this.directDirectory(identity),
      conversation: this.publicDirectConversation(record, identity.participantId),
      messages: this.directMessageHistory(record.id)
    };
  }
  /** Append one private text message and notify only its two participants. */
  async sendDirect(conversationId, text, identity) {
    this.assertReady();
    const existing = this.requireDirectConversations().get(conversationId);
    if (existing === void 0 || !existing.participantIds.includes(identity.participantId)) {
      throw new ChatroomInputError("\u79C1\u804A\u4E0D\u5B58\u5728\u6216\u4F60\u65E0\u6743\u8BBF\u95EE\u3002");
    }
    const normalized = text.normalize("NFC").trim();
    if (normalized === "" || Array.from(normalized).length > this.config.maxMessageTextChars || /\u0000/u.test(normalized)) {
      throw new ChatroomInputError("\u79C1\u804A\u6D88\u606F\u4E3A\u7A7A\u6216\u8FC7\u957F\u3002");
    }
    const now = Date.now();
    const updated = await this.requireDirectConversations().update(conversationId, (current) => ({
      ...current,
      updatedAt: now,
      nextSequence: current.nextSequence + 1
    }));
    const message = {
      id: randomUUID2(),
      conversationId,
      sequence: updated.nextSequence - 1,
      senderId: identity.participantId,
      text: normalized,
      createdAt: now
    };
    await this.requireDirectMessages().put(
      `${conversationId}:${String(message.sequence).padStart(12, "0")}:${message.id}`,
      message
    );
    const event = {
      type: "direct-message",
      conversation: this.publicDirectConversation(updated, identity.participantId),
      message: publicDirectMessage(message)
    };
    for (const client of [...this.notificationClients]) {
      if (!updated.participantIds.includes(client.participantId)) continue;
      const projected = client.participantId === identity.participantId ? event : { ...event, conversation: this.publicDirectConversation(updated, client.participantId) };
      if (!writeNotificationSse(client.response, projected)) this.notificationClients.delete(client);
    }
    return { conversation: event.conversation, message: event.message };
  }
  /** Create or reopen a branch rooted at one native room message. */
  async openThread(roomId, identity, root) {
    this.assertReady();
    const room = this.requireState(roomId);
    const normalized = normalizeThreadRoot(root);
    const task = room.admission.then(async () => {
      await this.touchMember(roomId, identity);
      const existing = [...this.requireThreads().entries()].find(([, record]) => record.roomId === roomId && record.root.messageId === normalized.messageId && record.root.role === normalized.role)?.[1];
      let state;
      if (existing?.rootContentVersion === 1) {
        state = this.requireThreadState(existing.id);
      } else {
        const resolved = await this.resolveThreadRoot(roomId, normalized);
        state = existing === void 0 ? await this.createThread(roomId, identity, resolved) : this.requireThreadState(existing.id);
        if (existing !== void 0) await this.upgradeThreadRoot(state, resolved);
      }
      await this.ensureThread(state.record.id);
      return {
        thread: publicThread(state.record),
        messages: this.messagesForThread(state.record.id)
      };
    });
    room.admission = task.then(() => void 0, () => void 0);
    return await task;
  }
  async submitThread(threadId, identity, contentOrText, modeOrReply = "queue", explicitReply) {
    this.assertReady();
    const state = this.requireThreadState(threadId);
    const content = typeof contentOrText === "string" ? [{ type: "text", text: normalizeThreadText(contentOrText, this.config.maxMessageTextChars) }] : contentOrText;
    const mode = typeof modeOrReply === "string" ? modeOrReply : "queue";
    const reply = typeof modeOrReply === "string" ? explicitReply : modeOrReply;
    const task = state.admission.then(async () => {
      const binding = await this.ensureThread(threadId);
      const room = this.requireState(state.record.roomId).record;
      const aiTriggered = mentionsAi(content, room.aiDisplayName);
      const { provider, model: modelId } = binding.agent.options;
      if (aiTriggered && provider !== void 0 && modelId !== void 0 && content.some((part) => part.type === "image")) {
        const model = await this.ctx.llm.resolveModelInfo(provider, modelId);
        if (model.inputModalities !== void 0 && !model.inputModalities.includes("image")) {
          throw new ChatroomInputError(`\u6A21\u578B ${JSON.stringify(modelId)} \u4E0D\u652F\u6301\u56FE\u7247\u8F93\u5165\u3002`);
        }
      }
      const durable = await this.durableContent(
        state.record.roomId,
        identity,
        identifyPrompt(content, identity, reply)
      );
      const text = promptPreview(content);
      const files = durable.flatMap((block) => block.type === "text" ? projectFileText(block.text).files : []);
      const sequence = this.nextThreadSequence(threadId);
      const record = {
        id: randomUUID2(),
        threadId,
        sequence,
        role: "human",
        participantId: identity.participantId,
        displayName: identity.displayName,
        avatarId: identity.avatarId,
        text,
        ...files.length === 0 ? {} : { files },
        ...durable.some((block) => block.type === "image") ? { hasImages: true } : {},
        ...reply === void 0 ? {} : { reply },
        createdAt: Date.now()
      };
      await this.requireThreadMessages().put(record.id, record);
      const message = createUserMessage({
        content: durable,
        source: { kind: "user" }
      });
      if (aiTriggered && mode === "steer") binding.agent.steer(message);
      else if (aiTriggered) binding.agent.followup(message);
      else binding.agent.session.append("user/message", message, { surfaceOp: "append" });
      await this.touchMember(state.record.roomId, identity);
      const publicMessage = publicThreadMessage(record);
      this.broadcast(this.requireState(state.record.roomId), {
        type: "thread-message",
        message: publicMessage,
        preview: this.threadPreview(state.record)
      });
      this.notify({
        id: record.id,
        roomId: state.record.roomId,
        roomTitle: room.title,
        threadId,
        participantId: identity.participantId,
        displayName: identity.displayName,
        role: "human",
        text,
        createdAt: record.createdAt
      });
      return { accepted: true, aiTriggered };
    });
    state.admission = task.then(() => void 0, () => void 0);
    return await task;
  }
  /** Project committed AI output into its parent room or branch stream. */
  handleSessionEvent(session, event) {
    if (!this.isReady || event.type !== "assistant/message") return;
    const text = assistantText(event.data.message.content);
    if (text === "") return;
    const thread = [...this.threadStates.values()].find((state) => state.record.sessionId === String(session.id));
    if (thread !== void 0) {
      void this.recordThreadAssistant(thread, text, event.time).catch((error) => {
        this.log.warn("Branch AI projection failed: %s", String(error));
      });
      return;
    }
    const room = [...this.states.values()].find((state) => state.record.sessionId === String(session.id));
    if (room === void 0) return;
    this.notify({
      id: `assistant:${session.id}:${event.seq}`,
      roomId: room.record.id,
      roomTitle: room.record.title,
      participantId: "ai",
      displayName: room.record.aiDisplayName,
      role: "ai",
      text,
      createdAt: event.time
    });
  }
  async createThread(roomId, identity, resolved) {
    const id = randomUUID2();
    const { root } = resolved;
    const record = {
      id,
      roomId,
      root,
      sessionId: `chatroom-thread-v1-${id}`,
      createdAt: Date.now(),
      createdBy: identity.participantId,
      ...root.sourceSessionId === void 0 ? {} : { rootContentVersion: 1 }
    };
    await this.requireThreads().put(id, record);
    const state = newThreadState(record);
    this.threadStates.set(id, state);
    try {
      const binding = await this.ensureThread(id);
      this.ctx.sessionTitle.rename(binding.agent.session, `\u5206\u652F\uFF1A${[...root.text].slice(0, 40).join("")}`);
      const seed = createUserMessage({ content: resolved.content, source: { kind: "user" } });
      binding.agent.session.append("user/message", seed, { surfaceOp: "append" });
      return state;
    } catch (error) {
      this.threadStates.delete(id);
      await this.requireThreads().delete(id);
      throw error;
    }
  }
  async resolveThreadRoot(roomId, root) {
    if (root.sourceSessionId === void 0 || root.sourceSeq === void 0) {
      return { root, content: fallbackThreadRootContent(root), hasMedia: false };
    }
    const item = await this.resolveForwardItem(roomId, {
      ...root,
      sourceSessionId: root.sourceSessionId,
      sourceSeq: root.sourceSeq,
      createdAt: 0
    });
    const authoritative = {
      messageId: root.messageId,
      displayName: item.displayName,
      text: item.text,
      role: item.role,
      sourceSessionId: root.sourceSessionId,
      sourceSeq: root.sourceSeq
    };
    return {
      root: authoritative,
      content: authoritativeThreadRootContent(authoritative, item),
      hasMedia: item.content?.some((part) => part.type === "image" || part.type === "file") ?? false
    };
  }
  async upgradeThreadRoot(state, resolved) {
    if (state.record.rootContentVersion === 1 || resolved.root.sourceSessionId === void 0) return;
    const record = {
      ...state.record,
      root: resolved.root,
      rootContentVersion: 1
    };
    if (resolved.hasMedia) {
      const binding = await this.ensureThread(record.id);
      binding.agent.session.append("user/message", createUserMessage({
        content: resolved.content,
        source: { kind: "user" }
      }), { surfaceOp: "append" });
    }
    await this.requireThreads().put(record.id, record);
    state.record = record;
  }
  async ensureThread(threadId) {
    const state = this.requireThreadState(threadId);
    if (state.binding !== void 0) return state.binding;
    const parentSessionId = this.requireState(state.record.roomId).record.sessionId;
    state.activation ??= this.acquireAgent(state.record.sessionId, parentSessionId).then(async (binding) => {
      try {
        await this.attachWorkspace(state.record.sessionId);
        state.binding = binding;
        return binding;
      } catch (error) {
        await binding.release();
        throw error;
      }
    }).finally(() => {
      state.activation = void 0;
    });
    return await state.activation;
  }
  async recordThreadAssistant(state, text, createdAt) {
    const room = this.requireState(state.record.roomId);
    const record = {
      id: randomUUID2(),
      threadId: state.record.id,
      sequence: this.nextThreadSequence(state.record.id),
      role: "ai",
      participantId: "ai",
      displayName: room.record.aiDisplayName,
      text,
      createdAt
    };
    await this.requireThreadMessages().put(record.id, record);
    const message = publicThreadMessage(record);
    this.broadcast(room, { type: "thread-message", message, preview: this.threadPreview(state.record) });
    this.notify({
      id: record.id,
      roomId: room.record.id,
      roomTitle: room.record.title,
      threadId: state.record.id,
      participantId: "ai",
      displayName: room.record.aiDisplayName,
      role: "ai",
      text,
      createdAt
    });
  }
  messagesForThread(threadId) {
    return [...this.requireThreadMessages().entries()].map(([, record]) => record).filter((record) => record.threadId === threadId).sort((left, right) => left.sequence - right.sequence).map(publicThreadMessage);
  }
  threadPreview(record) {
    const messages = this.messagesForThread(record.id);
    return {
      thread: publicThread(record),
      totalMessages: messages.length,
      recentMessages: messages.slice(-3)
    };
  }
  threadPreviewsForRoom(roomId) {
    return [...this.requireThreads().entries()].map(([, record]) => record).filter((record) => record.roomId === roomId).map((record) => this.threadPreview(record)).filter((preview) => preview.totalMessages > 0).sort((left, right) => {
      const leftTime = left.recentMessages.at(-1)?.createdAt ?? left.thread.createdAt;
      const rightTime = right.recentMessages.at(-1)?.createdAt ?? right.thread.createdAt;
      return rightTime - leftTime;
    });
  }
  nextThreadSequence(threadId) {
    return this.messagesForThread(threadId).reduce((maximum, message) => Math.max(maximum, message.sequence), -1) + 1;
  }
  async touchMember(roomId, identity) {
    const key = `${roomId}:${identity.participantId}`;
    const table = this.requireMembers();
    const existing = table.get(key);
    const now = Date.now();
    await table.put(key, {
      roomId,
      participantId: identity.participantId,
      displayName: identity.displayName,
      avatarId: identity.avatarId,
      joinedAt: existing?.joinedAt ?? now,
      lastSeenAt: now
    });
    const state = this.states.get(roomId);
    if (state !== void 0) {
      if (state.record.ownerParticipantId === void 0) {
        const record = await this.requireRoomRecords().update(roomId, (current) => current.ownerParticipantId === void 0 ? {
          ...current,
          ownerParticipantId: identity.participantId,
          adminParticipantIds: current.adminParticipantIds ?? []
        } : current);
        state.record = record;
      }
      this.broadcastPresence(state);
    }
  }
  roomMembers(state) {
    const online = new Set([...state.clients].map((client) => client.participantId));
    return [...this.requireMembers().entries()].map(([, record]) => record).filter((record) => record.roomId === state.record.id).sort((left, right) => Number(online.has(right.participantId)) - Number(online.has(left.participantId)) || right.lastSeenAt - left.lastSeenAt).map((record) => ({
      participantId: record.participantId,
      displayName: record.displayName,
      avatarId: record.avatarId,
      role: memberRole(state.record, record.participantId),
      joinedAt: record.joinedAt,
      lastSeenAt: record.lastSeenAt,
      online: online.has(record.participantId)
    }));
  }
  reactionsForRoom(roomId) {
    const grouped = /* @__PURE__ */ new Map();
    for (const [, record] of this.requireReactions().entries()) {
      if (record.roomId !== roomId) continue;
      const key = `${record.messageId}\0${record.emoji}`;
      const existing = grouped.get(key);
      if (existing === void 0) {
        grouped.set(key, { messageId: record.messageId, emoji: record.emoji, participantIds: [record.participantId] });
      } else {
        existing.participantIds.push(record.participantId);
      }
    }
    return [...grouped.values()].map((item) => ({
      roomId,
      messageId: item.messageId,
      emoji: item.emoji,
      participantIds: [...new Set(item.participantIds)].sort()
    })).sort((left, right) => left.messageId.localeCompare(right.messageId) || CHATROOM_REACTION_EMOJIS.indexOf(left.emoji) - CHATROOM_REACTION_EMOJIS.indexOf(right.emoji));
  }
  reactionSummary(roomId, messageId, emoji) {
    return this.reactionsForRoom(roomId).find((item) => item.messageId === messageId && item.emoji === emoji) ?? { roomId, messageId, emoji, participantIds: [] };
  }
  notify(notification) {
    const event = { type: "notification", notification };
    for (const client of [...this.notificationClients]) {
      if (client.participantId === notification.participantId) continue;
      if (!writeNotificationSse(client.response, event)) this.notificationClients.delete(client);
    }
  }
  publicDirectConversation(record, viewerId) {
    const peerId = record.participantIds.find((id) => id !== viewerId);
    const account = this.auth.activeAccounts().find((candidate) => candidate.participantId === peerId);
    if (peerId === void 0 || account === void 0) throw new ChatroomInputError("\u79C1\u804A\u5BF9\u8C61\u4E0D\u5B58\u5728\u6216\u5DF2\u505C\u7528\u3002");
    return {
      id: record.id,
      peer: {
        participantId: account.participantId,
        username: account.username,
        displayName: account.displayName,
        avatarId: account.avatarId
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }
  directMessageHistory(conversationId) {
    return [...this.requireDirectMessages().entries()].map(([, message]) => message).filter((message) => message.conversationId === conversationId).sort((left, right) => left.sequence - right.sequence).map(publicDirectMessage);
  }
  async seedConfiguredRoom() {
    const records = this.requireRoomRecords();
    const existing = records.get(this.config.roomId);
    const configured = {
      id: this.config.roomId,
      title: existing?.title ?? this.config.roomTitle,
      aiDisplayName: this.config.aiDisplayName,
      sessionId: this.config.sessionId,
      createdAt: existing?.createdAt ?? Date.now(),
      createdBy: existing?.createdBy ?? "system",
      ...existing?.ownerParticipantId === void 0 ? {} : { ownerParticipantId: existing.ownerParticipantId },
      adminParticipantIds: existing?.adminParticipantIds ?? []
    };
    if (existing === void 0 || existing.title !== configured.title || existing.aiDisplayName !== configured.aiDisplayName || existing.sessionId !== configured.sessionId) {
      await records.put(configured.id, configured);
    }
  }
  async ensureRoom(roomId) {
    const state = this.requireState(roomId);
    if (state.binding !== void 0) return state.binding;
    state.activation ??= this.activateRoom(state).then((binding) => {
      state.binding = binding;
      return binding;
    }).finally(() => {
      state.activation = void 0;
    });
    return await state.activation;
  }
  async activateRoom(state) {
    const binding = await this.acquireAgent(state.record.sessionId);
    try {
      await this.attachWorkspace(state.record.sessionId);
      return binding;
    } catch (error) {
      await binding.release();
      throw error;
    }
  }
  ensureRoomTitle(binding, title) {
    if (this.ctx.sessionTitle.get(binding.agent.session)?.title !== title) {
      this.ctx.sessionTitle.rename(binding.agent.session, title);
    }
  }
  async acquireAgent(sessionId, parentSessionId) {
    const id = SessionId(sessionId);
    const live = this.ctx.agents.get(id);
    if (live !== void 0) return borrowAgent(live);
    const persisted = (await this.ctx.sessionPersistence.list()).some((header) => header.id === id);
    const model = this.ctx.agentDefaultModel.currentSelection();
    const agentOptions = { provider: model.provider, model: model.model };
    if (persisted) {
      const inspected = await this.ctx.sessionPersistence.inspect(id);
      const agentPreset = resolveSessionPreset({ header: inspected.meta, events: inspected.events }) ?? this.config.agentPreset;
      try {
        return ownAgent(await this.ctx.agents.resume({
          resumeSessionId: id,
          agentOptions,
          setup: async (agentCtx) => {
            await this.ctx.agentPresets.mount(agentCtx, agentPreset);
          }
        }));
      } catch (error) {
        const raced = this.ctx.agents.get(id);
        if (raced !== void 0) return borrowAgent(raced);
        throw error;
      }
    }
    try {
      return ownAgent(await this.ctx.agents.create({
        sessionId: id,
        meta: {
          cwd: this.config.cwd,
          agentPreset: this.config.agentPreset,
          ...parentSessionId === void 0 ? {} : { parentSession: SessionId(parentSessionId) }
        },
        agentOptions,
        setup: async (agentCtx) => {
          await this.ctx.agentPresets.mount(agentCtx, this.config.agentPreset);
        }
      }));
    } catch (error) {
      const raced = this.ctx.agents.get(id);
      if (raced !== void 0) return borrowAgent(raced);
      throw error;
    }
  }
  /** Ensure one shared Session uses native Workspace navigation. */
  async attachWorkspace(sessionId) {
    const workspace = await this.ctx.workspaceRegistry.resolveByPath(this.config.cwd) ?? await this.ctx.workspaceRegistry.create(this.config.cwd);
    await workspace.attachSession(SessionId(sessionId));
  }
  async durableContent(roomId, identity, content) {
    const prepared = content.map((part) => part.type === "text" ? part : { part, data: decodeBase64(part.data, part.type === "image" ? "\u56FE\u7247" : "\u6587\u4EF6") });
    const images = prepared.filter((item) => "data" in item && item.part.type === "image");
    const files = prepared.filter((item) => "data" in item && item.part.type === "file");
    this.validateFiles(files.map((file) => file.data));
    const mediaTypes = this.ctx.attachments.imageLimits.mediaTypes;
    for (const image of images) {
      if (image.part.type !== "image" || !mediaTypes.includes(image.part.mediaType)) {
        throw new ChatroomInputError(`\u4E0D\u652F\u6301\u56FE\u7247\u683C\u5F0F ${image.part.mediaType}\u3002`);
      }
    }
    const admittedImages = await Promise.all(images.map(async (image) => ({
      part: image.part,
      data: await this.resizeImage(image.data)
    })));
    let refs = [];
    try {
      refs = await this.ctx.attachments.saveImages(admittedImages.map((image) => ({
        data: image.data,
        mediaType: image.part.mediaType,
        ...image.part.name === void 0 ? {} : { name: image.part.name }
      })));
    } catch (error) {
      if (error instanceof AttachmentError) throw new ChatroomInputError(`\u56FE\u7247\u65E0\u6CD5\u53D1\u9001\uFF1A${error.message}`);
      throw error;
    }
    const fileRefs = /* @__PURE__ */ new Map();
    for (const file of files) {
      if (file.part.type !== "file") continue;
      const record = this.fileRecord(roomId, identity, file.part, file.data);
      await this.requireFiles().put(record.id, record);
      fileRefs.set(file.part, publicFile(record));
    }
    const blocks = [];
    let imageIndex = 0;
    for (const item of prepared) {
      if (!("data" in item)) {
        blocks.push({ type: "text", text: item.text });
        continue;
      }
      if (item.part.type === "file") {
        const file = fileRefs.get(item.part);
        if (file === void 0) throw new Error("chatroom file batch lost a file reference");
        blocks.push({ type: "text", text: identifyFileText(file) });
        continue;
      }
      const attachment = refs[imageIndex++];
      if (attachment === void 0) throw new Error("chatroom attachment batch lost an image reference");
      blocks.push({ type: "image", attachment });
    }
    return blocks;
  }
  validateFiles(files) {
    if (files.length > this.config.maxFilesPerMessage) {
      throw new ChatroomInputError(`\u4E00\u6761\u6D88\u606F\u6700\u591A\u53D1\u9001 ${this.config.maxFilesPerMessage} \u4E2A\u6587\u4EF6\u3002`);
    }
    if (files.some((file) => file.byteLength > this.config.maxFileBytes)) {
      throw new ChatroomInputError(`\u5355\u4E2A\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC7 ${formatMegabytes(this.config.maxFileBytes)}\u3002`);
    }
    const total = files.reduce((sum, file) => sum + file.byteLength, 0);
    if (total > this.config.maxMessageFileBytes) {
      throw new ChatroomInputError(`\u4E00\u6761\u6D88\u606F\u7684\u6587\u4EF6\u603B\u5927\u5C0F\u4E0D\u80FD\u8D85\u8FC7 ${formatMegabytes(this.config.maxMessageFileBytes)}\u3002`);
    }
  }
  fileRecord(roomId, identity, part, data) {
    return {
      id: randomUUID2(),
      roomId,
      participantId: identity.participantId,
      displayName: identity.displayName,
      name: normalizeFileName(part.name),
      mediaType: normalizeMediaType(part.mediaType),
      bytes: data.byteLength,
      data: Buffer.from(data).toString("base64"),
      createdAt: Date.now()
    };
  }
  async resizeImage(data) {
    try {
      const { default: sharp } = await import("sharp");
      const image = sharp(data, { animated: true, failOn: "error", limitInputPixels: false });
      const metadata = await image.metadata();
      const width = metadata.width;
      const height = metadata.pageHeight ?? metadata.height;
      if (width === void 0 || height === void 0) return data;
      const maxPixels = this.ctx.attachments.imageLimits.maxImagePixels;
      const scale = Math.min(
        1,
        this.config.maxImageSidePixels / width,
        this.config.maxImageSidePixels / height,
        Math.sqrt(maxPixels / (width * height))
      );
      if (scale >= 1) return data;
      const resized = await image.resize({
        width: Math.max(1, Math.floor(width * scale)),
        height: Math.max(1, Math.floor(height * scale)),
        fit: "inside",
        withoutEnlargement: true
      }).toBuffer();
      return new Uint8Array(resized);
    } catch (error) {
      throw new ChatroomInputError(`\u56FE\u7247\u65E0\u6CD5\u53D1\u9001\uFF1A${error instanceof Error ? error.message : String(error)}`);
    }
  }
  broadcastPresence(state) {
    this.broadcast(state, { type: "presence", online: onlineCount(state), members: this.roomMembers(state) });
  }
  broadcast(state, event) {
    for (const client of [...state.clients]) {
      if (!writeSse(client.response, event)) state.clients.delete(client);
    }
  }
  assertReady() {
    if (!this.isReady) throw new Error("chatroom is not ready");
  }
  requireRoom(roomId) {
    return publicRoom(this.requireState(roomId).record);
  }
  requireState(roomId) {
    const state = this.states.get(roomId);
    if (state === void 0) throw new ChatroomInputError("\u5171\u4EAB\u4F1A\u8BDD\u4E0D\u5B58\u5728\u3002");
    return state;
  }
  requireIdentities() {
    if (this.identities === void 0) throw new Error("chatroom identity storage is unavailable");
    return this.identities;
  }
  requireRoomRecords() {
    if (this.roomRecords === void 0) throw new Error("chatroom room storage is unavailable");
    return this.roomRecords;
  }
  requireFiles() {
    if (this.files === void 0) throw new Error("chatroom file storage is unavailable");
    return this.files;
  }
  requireMembers() {
    if (this.members === void 0) throw new Error("chatroom member storage is unavailable");
    return this.members;
  }
  requireThreads() {
    if (this.threads === void 0) throw new Error("chatroom thread storage is unavailable");
    return this.threads;
  }
  requireThreadMessages() {
    if (this.threadMessages === void 0) throw new Error("chatroom thread message storage is unavailable");
    return this.threadMessages;
  }
  requireReactions() {
    if (this.reactions === void 0) throw new Error("chatroom reaction storage is unavailable");
    return this.reactions;
  }
  requireDirectConversations() {
    if (this.directConversations === void 0) throw new Error("chatroom direct conversation storage is unavailable");
    return this.directConversations;
  }
  requireDirectMessages() {
    if (this.directMessages === void 0) throw new Error("chatroom direct message storage is unavailable");
    return this.directMessages;
  }
  requireThreadState(threadId) {
    const state = this.threadStates.get(threadId);
    if (state === void 0) throw new ChatroomInputError("\u5206\u652F\u4F1A\u8BDD\u4E0D\u5B58\u5728\u3002");
    return state;
  }
  assertRoomManager(record, participantId) {
    if (record.ownerParticipantId !== participantId && !(record.adminParticipantIds ?? []).includes(participantId)) {
      throw new ChatroomInputError("\u5F53\u524D\u8EAB\u4EFD\u6CA1\u6709\u7FA4\u7BA1\u7406\u6743\u9650\u3002");
    }
  }
};
function newRoomState(record) {
  return {
    record,
    clients: /* @__PURE__ */ new Set(),
    binding: void 0,
    activation: void 0,
    admission: Promise.resolve()
  };
}
function newThreadState(record) {
  return {
    record,
    binding: void 0,
    activation: void 0,
    admission: Promise.resolve()
  };
}
function ownAgent(handle) {
  return { agent: handle.agent, release: () => handle.dispose() };
}
function borrowAgent(agent) {
  return { agent, release: async () => void 0 };
}
function publicIdentity(record) {
  return {
    participantId: record.participantId,
    displayName: record.displayName,
    avatarId: record.avatarId ?? fallbackAvatarId(record.participantId)
  };
}
function publicFile(record) {
  return { id: record.id, name: record.name, mediaType: record.mediaType, bytes: record.bytes };
}
function publicRoom(record) {
  return {
    id: record.id,
    title: record.title,
    aiDisplayName: record.aiDisplayName,
    sessionId: record.sessionId
  };
}
function memberRole(record, participantId) {
  if (record.ownerParticipantId === participantId) return "owner";
  return (record.adminParticipantIds ?? []).includes(participantId) ? "admin" : "member";
}
function publicThread(record) {
  return {
    id: record.id,
    roomId: record.roomId,
    root: record.root,
    sessionId: record.sessionId,
    createdAt: record.createdAt
  };
}
function publicThreadMessage(record) {
  return {
    id: record.id,
    threadId: record.threadId,
    sequence: record.sequence,
    role: record.role,
    participantId: record.participantId,
    displayName: record.displayName,
    text: record.text,
    ...record.files === void 0 ? {} : { files: record.files },
    ...record.hasImages === void 0 ? {} : { hasImages: record.hasImages },
    ...record.reply === void 0 ? {} : { reply: record.reply },
    createdAt: record.createdAt,
    ...record.avatarId === void 0 ? {} : { avatarId: record.avatarId }
  };
}
function normalizeDisplayName2(value, maxChars) {
  const normalized = value.trim().replace(/\s+/gu, " ");
  if (normalized === "") throw new ChatroomInputError("\u8BF7\u8F93\u5165\u8EAB\u4EFD\u540D\u79F0\u3002");
  if ([...normalized].length > maxChars) throw new ChatroomInputError(`\u8EAB\u4EFD\u540D\u79F0\u4E0D\u80FD\u8D85\u8FC7 ${maxChars} \u4E2A\u5B57\u7B26\u3002`);
  if (/\p{Cc}/u.test(normalized)) throw new ChatroomInputError("\u8EAB\u4EFD\u540D\u79F0\u4E0D\u80FD\u5305\u542B\u63A7\u5236\u5B57\u7B26\u3002");
  return normalized;
}
function normalizeRoomTitle(value, maxChars) {
  const normalized = value.trim().replace(/\s+/gu, " ");
  if (normalized === "") throw new ChatroomInputError("\u8BF7\u8F93\u5165\u5171\u4EAB\u4F1A\u8BDD\u540D\u79F0\u3002");
  if ([...normalized].length > maxChars) throw new ChatroomInputError(`\u5171\u4EAB\u4F1A\u8BDD\u540D\u79F0\u4E0D\u80FD\u8D85\u8FC7 ${maxChars} \u4E2A\u5B57\u7B26\u3002`);
  if (/\p{Cc}/u.test(normalized)) throw new ChatroomInputError("\u5171\u4EAB\u4F1A\u8BDD\u540D\u79F0\u4E0D\u80FD\u5305\u542B\u63A7\u5236\u5B57\u7B26\u3002");
  return normalized;
}
function normalizeThreadRoot(root) {
  const messageId = root.messageId.trim();
  const displayName = root.displayName.trim().replace(/\s+/gu, " ");
  const text = root.text.trim().replace(/\s+/gu, " ");
  if (messageId === "" || displayName === "" || text === "") throw new ChatroomInputError("\u5206\u652F\u4E3B\u9898\u6D88\u606F\u65E0\u6548\u3002");
  if (root.role !== "human" && root.role !== "ai") throw new ChatroomInputError("\u5206\u652F\u4E3B\u9898\u89D2\u8272\u65E0\u6548\u3002");
  const sourceSessionId = root.sourceSessionId?.trim();
  if (sourceSessionId === void 0 !== (root.sourceSeq === void 0)) {
    throw new ChatroomInputError("\u5206\u652F\u4E3B\u9898\u6765\u6E90\u6D88\u606F\u4E0D\u5B8C\u6574\u3002");
  }
  if (sourceSessionId !== void 0 && (sourceSessionId === "" || [...sourceSessionId].length > 240 || /\p{Cc}/u.test(sourceSessionId))) {
    throw new ChatroomInputError("\u5206\u652F\u4E3B\u9898\u6765\u6E90\u4F1A\u8BDD\u65E0\u6548\u3002");
  }
  if (root.sourceSeq !== void 0 && (!Number.isSafeInteger(root.sourceSeq) || root.sourceSeq < 0)) {
    throw new ChatroomInputError("\u5206\u652F\u4E3B\u9898\u6765\u6E90\u5E8F\u53F7\u65E0\u6548\u3002");
  }
  return {
    messageId: [...messageId].slice(0, 200).join(""),
    displayName: [...displayName].slice(0, 80).join(""),
    text: [...text].slice(0, 500).join(""),
    role: root.role,
    ...sourceSessionId === void 0 ? {} : { sourceSessionId, sourceSeq: root.sourceSeq }
  };
}
function fallbackThreadRootContent(root) {
  return [{
    type: "text",
    text: `\u8FD9\u662F\u7FA4\u804A\u5206\u652F\u7684\u4E3B\u9898\u6D88\u606F\u3002${root.displayName}\uFF1A${root.text}`
  }];
}
function authoritativeThreadRootContent(root, item) {
  const content = item.content ?? [];
  let metadata = "";
  if (item.reply !== void 0) metadata += identifyReplyText("", item.reply);
  if (item.forward !== void 0) metadata += identifyForwardText(item.forward);
  const blocks = [{
    type: "text",
    text: `\u8FD9\u662F\u7FA4\u804A\u5206\u652F\u7684\u4E3B\u9898\u6D88\u606F\u3002${root.displayName}\uFF1A${metadata}`
  }];
  for (const part of content) {
    if (part.type === "text") {
      blocks.push({ type: "text", text: part.text });
      continue;
    }
    if (part.type === "file") {
      blocks.push({ type: "text", text: identifyFileText(part.file) });
      continue;
    }
    blocks.push({ type: "image", attachment: part.image });
  }
  return blocks.length === 1 && metadata === "" ? fallbackThreadRootContent(root) : blocks;
}
function normalizeThreadText(value, maxChars) {
  const normalized = value.trim();
  if (normalized === "") throw new ChatroomInputError("\u8BF7\u8F93\u5165\u5206\u652F\u6D88\u606F\u3002");
  if ([...normalized].length > maxChars) throw new ChatroomInputError(`\u5206\u652F\u6D88\u606F\u4E0D\u80FD\u8D85\u8FC7 ${maxChars} \u4E2A\u5B57\u7B26\u3002`);
  if (/\p{Cc}/u.test(normalized)) throw new ChatroomInputError("\u5206\u652F\u6D88\u606F\u4E0D\u80FD\u5305\u542B\u63A7\u5236\u5B57\u7B26\u3002");
  return normalized;
}
function normalizeMessageId(value) {
  const normalized = value.trim();
  if (normalized === "" || [...normalized].length > 240 || /\p{Cc}/u.test(normalized)) {
    throw new ChatroomInputError("\u6D88\u606F\u7F16\u53F7\u65E0\u6548\u3002");
  }
  return normalized;
}
function normalizeForwardItems(items) {
  if (items.length === 0 || items.length > 50) throw new ChatroomInputError("\u8BF7\u9009\u62E9 1 \u5230 50 \u6761\u6D88\u606F\u8FDB\u884C\u8F6C\u53D1\u3002");
  const seen = /* @__PURE__ */ new Set();
  return items.map((item) => {
    const messageId = normalizeMessageId(item.messageId);
    const sourceSessionId = item.sourceSessionId?.trim();
    if (sourceSessionId === void 0 !== (item.sourceSeq === void 0)) {
      throw new ChatroomInputError("\u8F6C\u53D1\u6765\u6E90\u6D88\u606F\u4E0D\u5B8C\u6574\u3002");
    }
    if (sourceSessionId !== void 0 && (sourceSessionId === "" || [...sourceSessionId].length > 240 || /\p{Cc}/u.test(sourceSessionId))) {
      throw new ChatroomInputError("\u8F6C\u53D1\u6765\u6E90\u4F1A\u8BDD\u65E0\u6548\u3002");
    }
    if (item.sourceSeq !== void 0 && (!Number.isSafeInteger(item.sourceSeq) || item.sourceSeq < 0)) {
      throw new ChatroomInputError("\u8F6C\u53D1\u6765\u6E90\u5E8F\u53F7\u65E0\u6548\u3002");
    }
    const sourceKey = sourceSessionId === void 0 ? messageId : `${sourceSessionId}\0${item.sourceSeq}`;
    if (seen.has(sourceKey)) throw new ChatroomInputError("\u8F6C\u53D1\u6D88\u606F\u4E0D\u80FD\u91CD\u590D\u3002");
    seen.add(sourceKey);
    const displayName = item.displayName.trim().replace(/\s+/gu, " ");
    const text = item.text.trim().replace(/\s+/gu, " ");
    if (item.role !== "human" && item.role !== "ai") throw new ChatroomInputError("\u8F6C\u53D1\u6D88\u606F\u89D2\u8272\u65E0\u6548\u3002");
    if (displayName === "" || [...displayName].length > 80) throw new ChatroomInputError("\u8F6C\u53D1\u6D88\u606F\u6635\u79F0\u65E0\u6548\u3002");
    if (text === "" || [...text].length > 2e3) throw new ChatroomInputError("\u8F6C\u53D1\u6D88\u606F\u5185\u5BB9\u65E0\u6548\u3002");
    if (!Number.isSafeInteger(item.createdAt) || item.createdAt < 0) throw new ChatroomInputError("\u8F6C\u53D1\u6D88\u606F\u65F6\u95F4\u65E0\u6548\u3002");
    return {
      messageId,
      ...sourceSessionId === void 0 ? {} : { sourceSessionId, sourceSeq: item.sourceSeq },
      role: item.role,
      displayName,
      text,
      createdAt: item.createdAt
    };
  });
}
function projectForwardContent(blocks, role) {
  const content = [];
  const visibleTexts = [];
  let displayName;
  let reply;
  let forward;
  let firstText = true;
  for (const block of blocks) {
    if (block.type === "image") {
      const image = {
        ...block.attachment,
        attachmentId: String(block.attachment.attachmentId)
      };
      content.push({ type: "image", image });
      continue;
    }
    if (block.type !== "text") continue;
    let text2 = block.text;
    if (firstText && role === "human") {
      firstText = false;
      const marker = participantMarker(text2);
      if (marker !== void 0) text2 = text2.slice(marker.length);
      const prefix = /^([^：]{1,80})：/u.exec(text2);
      if (prefix !== null) {
        displayName = prefix[1];
        text2 = text2.slice(prefix[0].length);
      }
      const replyProjection = projectReplyText(text2);
      text2 = replyProjection.text;
      reply = replyProjection.reply;
      const forwardProjection = projectForwardText(text2);
      text2 = forwardProjection.text;
      forward = forwardProjection.forward;
    }
    const files = projectFileText(text2);
    text2 = files.text;
    for (const file of files.files) content.push({ type: "file", file });
    if (text2.trim() !== "") {
      content.push({ type: "text", text: text2, markdown: role === "ai" });
      visibleTexts.push(text2.trim());
    }
  }
  const text = visibleTexts.join("\n").trim() || (forward === void 0 ? void 0 : `\u5408\u5E76\u8F6C\u53D1 ${forward.items.length} \u6761\u6D88\u606F`) || (content.some((part) => part.type === "file") ? "\u6587\u4EF6\u6D88\u606F" : "\u56FE\u7247\u6D88\u606F");
  return {
    text,
    content,
    ...displayName === void 0 ? {} : { displayName },
    ...reply === void 0 ? {} : { reply },
    ...forward === void 0 ? {} : { forward }
  };
}
function reactionKey(roomId, messageId, emoji, participantId) {
  return `${roomId}\0${messageId}\0${emoji}\0${participantId}`;
}
function promptPreview(content) {
  const text = content.filter((part) => part.type === "text").map((part) => part.text.trim()).filter(Boolean).join(" ");
  if (text !== "") return [...text.replace(/\s+/gu, " ")].slice(0, 160).join("");
  if (content.some((part) => part.type === "file")) return "\u53D1\u9001\u4E86\u6587\u4EF6";
  return "\u53D1\u9001\u4E86\u56FE\u7247";
}
function assistantText(content) {
  return content.filter((block) => block.type === "text").map((block) => block.text.trim()).filter(Boolean).join("\n").trim();
}
function decodeBase64(data, label) {
  const decoded = Buffer.from(data, "base64");
  if (data.length === 0 || decoded.toString("base64") !== data) {
    throw new ChatroomInputError(`${label}\u6570\u636E\u4E0D\u662F\u6709\u6548\u7684 base64\u3002`);
  }
  return new Uint8Array(decoded);
}
function normalizeFileName(value) {
  const normalized = value.trim().replace(/[\\/]/gu, "_").replace(/[\p{Cc}\p{Cf}]/gu, "");
  if (normalized === "") throw new ChatroomInputError("\u6587\u4EF6\u540D\u4E0D\u80FD\u4E3A\u7A7A\u3002");
  return [...normalized].slice(0, 255).join("");
}
function normalizeMediaType(value) {
  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/u.test(normalized) ? normalized : "application/octet-stream";
}
function formatMegabytes(bytes) {
  return `${Math.ceil(bytes / 1024 / 1024)} MB`;
}
function tokenHash(token) {
  return createHash2("sha256").update(token).digest("hex");
}
function onlineCount(state) {
  return new Set([...state.clients].map((client) => client.participantId)).size;
}
function publicDirectMessage(record) {
  return {
    id: record.id,
    conversationId: record.conversationId,
    sequence: record.sequence,
    senderId: record.senderId,
    text: record.text,
    createdAt: record.createdAt
  };
}
function writeSse(response, event) {
  if (response.destroyed || response.writableEnded) return false;
  try {
    response.write(`data: ${JSON.stringify(event)}

`);
    return true;
  } catch {
    return false;
  }
}
function writeNotificationSse(response, event) {
  if (response.destroyed || response.writableEnded) return false;
  try {
    response.write(`data: ${JSON.stringify(event)}

`);
    return true;
  } catch {
    return false;
  }
}

// src/http.ts
var ChatroomHttpController = class {
  constructor(ctx, runtime, config) {
    this.runtime = runtime;
    this.config = config;
    this.log = ctx.logger("deepseek-harness-chatroom");
    this.configurationApi = toFetchHandler(ctx.apiProxy);
  }
  runtime;
  config;
  log;
  configurationApi;
  /** Dispatch one request under a registered chatroom API prefix. */
  async handle(request, response) {
    try {
      const url = new URL(request.url ?? "/", "http://chatroom.local");
      const route = matchChatroomApi(url.pathname);
      if (route === void 0) {
        json(response, 404, { error: "\u63A5\u53E3\u4E0D\u5B58\u5728\u3002" });
        return;
      }
      if (route.endpoint === "/health" && request.method === "GET") {
        json(response, this.runtime.isReady ? 200 : 503, { ready: this.runtime.isReady });
        return;
      }
      if (!this.runtime.isReady) {
        json(response, 503, { error: "\u804A\u5929\u5BA4\u6B63\u5728\u542F\u52A8\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" });
        return;
      }
      if (route.endpoint === "/session") {
        await this.handleSession(request, response, route.prefix);
        return;
      }
      if (route.endpoint.startsWith("/auth/")) {
        await this.handleAuthentication(request, response, route.prefix, route.endpoint, url);
        return;
      }
      if (route.endpoint === "/admin") {
        await this.handleAdministration(request, response);
        return;
      }
      if (route.endpoint === "/account") {
        await this.handleAccount(request, response);
        return;
      }
      if (route.endpoint === "/direct") {
        await this.handleDirect(request, response);
        return;
      }
      if (route.endpoint === "/direct/messages") {
        await this.handleDirectMessages(request, response);
        return;
      }
      if (route.endpoint === "/rooms") {
        await this.handleRooms(request, response);
        return;
      }
      if (route.endpoint === "/rooms/ensure") {
        await this.handleRoomEnsure(request, response);
        return;
      }
      if (route.endpoint === "/rooms/select") {
        await this.handleRoomSelection(request, response);
        return;
      }
      if (route.endpoint === "/rooms/manage") {
        await this.handleRoomManagement(request, response);
        return;
      }
      if (route.endpoint === "/prompt") {
        await this.handlePrompt(request, response);
        return;
      }
      if (route.endpoint === "/threads/open") {
        await this.handleThreadOpen(request, response);
        return;
      }
      if (route.endpoint === "/threads/prompt") {
        await this.handleThreadPrompt(request, response);
        return;
      }
      if (route.endpoint === "/reactions/toggle") {
        await this.handleReactionToggle(request, response);
        return;
      }
      if (route.endpoint === "/forward") {
        await this.handleForward(request, response);
        return;
      }
      if (route.endpoint.startsWith("/files/")) {
        this.handleFile(request, response, route.endpoint.slice("/files/".length));
        return;
      }
      if (route.endpoint.startsWith("/images/")) {
        await this.handleImage(request, response, route.endpoint.slice("/images/".length));
        return;
      }
      if (route.endpoint === "/events" && request.method === "GET") {
        await this.handleEvents(request, response, url.searchParams);
        return;
      }
      if (route.endpoint === "/notifications" && request.method === "GET") {
        this.handleNotifications(request, response);
        return;
      }
      if (route.endpoint.startsWith("/configuration/")) {
        await this.handleConfiguration(request, response, route.endpoint.slice("/configuration/".length));
        return;
      }
      json(response, 404, { error: "\u63A5\u53E3\u4E0D\u5B58\u5728\u3002" });
    } catch (error) {
      if (error instanceof ChatroomAuthRateLimitError) {
        response.setHeader("Retry-After", String(error.retryAfterSeconds));
        json(response, 429, { error: error.message });
        return;
      }
      if (error instanceof ChatroomInputError || error instanceof ChatroomAuthError) {
        json(response, 422, { error: error.message });
        return;
      }
      this.log.warn("Chatroom request failed: %s", String(error));
      if (!response.headersSent) {
        json(response, 500, { error: "\u804A\u5929\u5BA4\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" });
      } else {
        response.destroy();
      }
    }
  }
  async handleSession(request, response, cookiePath) {
    const token = this.token(request);
    if (request.method === "GET") {
      if (this.config.authEnabled) {
        let account = this.runtime.auth.account(this.authToken(request));
        if (account === void 0) {
          const adopted = await this.runtime.auth.adoptDshAuth(request.headers);
          if (adopted !== void 0) {
            account = adopted.account;
            this.setAuthCookie(response, adopted.token);
          }
        }
        json(response, 200, this.sessionPayload(account ?? null, account));
        return;
      }
      json(response, 200, this.sessionPayload(this.runtime.identity(token) ?? null));
      return;
    }
    if (request.method === "POST") {
      if (this.config.authEnabled) {
        json(response, 409, { error: "\u767B\u5F55\u6A21\u5F0F\u4E0B\u8BF7\u5728\u8D26\u53F7\u8BBE\u7F6E\u4E2D\u4FEE\u6539\u4E2A\u4EBA\u8D44\u6599\u3002" });
        return;
      }
      assertSameOrigin(request);
      const body = await readJson(request, smallRequestLimit(this.config));
      const existing = this.runtime.identity(token);
      if (existing !== void 0 && token !== void 0) {
        const updated = await this.runtime.updateIdentity(
          token,
          fieldString(body, "displayName"),
          optionalFieldString(body, "avatarId")
        );
        json(response, 200, this.sessionPayload(updated));
        return;
      }
      const created = await this.runtime.createIdentity(fieldString(body, "displayName"), optionalFieldString(body, "avatarId"));
      response.setHeader("Set-Cookie", sessionCookie(
        this.config.cookieName,
        created.token,
        this.config.cookieMaxAgeSeconds,
        cookiePath
      ));
      json(response, 201, this.sessionPayload(created.identity));
      return;
    }
    if (request.method === "DELETE") {
      if (this.config.authEnabled) {
        json(response, 409, { error: "\u767B\u5F55\u6A21\u5F0F\u4E0B\u8BF7\u4F7F\u7528\u9000\u51FA\u767B\u5F55\u3002" });
        return;
      }
      assertSameOrigin(request);
      await this.runtime.deleteIdentity(token);
      response.setHeader("Set-Cookie", expiredSessionCookie(this.config.cookieName, cookiePath));
      response.writeHead(204);
      response.end();
      return;
    }
    methodNotAllowed(response, "GET, POST, DELETE");
  }
  async handleAuthentication(request, response, cookiePath, endpoint, url) {
    if (endpoint === "/auth/verify") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        methodNotAllowed(response, "GET, HEAD");
        return;
      }
      let account = this.runtime.auth.account(this.authToken(request));
      if (account === void 0) {
        const adopted = await this.runtime.auth.adoptDshAuth(request.headers, originalRequestUri(request));
        if (adopted !== void 0) {
          account = adopted.account;
          this.setAuthCookie(response, adopted.token);
        }
      }
      if (account === void 0) {
        const login = `${cookiePath}/auth/page?returnTo=${encodeURIComponent(originalRequestUri(request))}`;
        response.writeHead(401, {
          "Cache-Control": "no-store, max-age=0",
          Vary: "Cookie",
          "WWW-Authenticate": 'Session realm="DeepSeek Harness"',
          "X-Dsh-Auth-Login": login
        });
        response.end();
        return;
      }
      response.writeHead(204, {
        "Cache-Control": "no-store, max-age=0",
        Vary: "Cookie",
        "X-Dsh-Auth-User-Id": account.participantId,
        "X-Dsh-Auth-Username": encodeURIComponent(account.username),
        "X-Dsh-Auth-Roles": account.role
      });
      response.end();
      return;
    }
    if (endpoint === "/auth/page") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        methodNotAllowed(response, "GET, HEAD");
        return;
      }
      const returnTo = safeReturnPath(url.searchParams.get("returnTo") ?? "/");
      let account = this.runtime.auth.account(this.authToken(request));
      if (account === void 0) {
        const adopted = await this.runtime.auth.adoptDshAuth(request.headers, returnTo);
        if (adopted !== void 0) {
          account = adopted.account;
          this.setAuthCookie(response, adopted.token);
        }
      }
      if (account !== void 0) {
        response.writeHead(303, { Location: returnTo, "Cache-Control": "no-store" });
        response.end();
        return;
      }
      const state = this.runtime.auth.state();
      const automaticRedirect = automaticAuthRedirect(cookiePath, state, returnTo, url);
      if (automaticRedirect !== void 0) {
        response.writeHead(303, {
          Location: automaticRedirect,
          "Cache-Control": "no-store"
        });
        response.end();
        return;
      }
      html(response, 200, renderAuthPage(cookiePath, state, returnTo), request.method === "HEAD");
      return;
    }
    if (endpoint === "/auth/providers" && request.method === "GET") {
      const account = this.runtime.auth.account(this.authToken(request));
      json(response, 200, this.runtime.auth.state(account));
      return;
    }
    if (endpoint === "/auth/login" && request.method === "POST") {
      assertSameOrigin(request);
      const body = await readJson(request, 8192);
      const result = await this.runtime.auth.login(fieldString(body, "username"), fieldString(body, "password"));
      this.setAuthCookie(response, result.token);
      json(response, 200, this.sessionPayload(result.account, result.account));
      return;
    }
    if (endpoint === "/auth/register" && request.method === "POST") {
      assertSameOrigin(request);
      const body = await readJson(request, 16384);
      const result = await this.runtime.auth.register({
        username: fieldString(body, "username"),
        password: fieldString(body, "password"),
        displayName: fieldString(body, "displayName"),
        ...optionalFieldString(body, "avatarId") === void 0 ? {} : { avatarId: optionalFieldString(body, "avatarId") },
        ...optionalFieldString(body, "bootstrapToken") === void 0 ? {} : { bootstrapToken: optionalFieldString(body, "bootstrapToken") }
      });
      this.setAuthCookie(response, result.token);
      json(response, 201, this.sessionPayload(result.account, result.account));
      return;
    }
    if (endpoint === "/auth/logout" && request.method === "POST") {
      assertSameOrigin(request);
      await this.runtime.auth.logout(this.authToken(request));
      response.setHeader("Set-Cookie", expiredSessionCookie(
        this.config.authCookieName,
        "/",
        this.config.authPublicOrigin.startsWith("https://")
      ));
      response.writeHead(204);
      response.end();
      return;
    }
    const oidcMatch = /^\/auth\/oidc\/([^/]+)\/(start|callback)$/u.exec(endpoint);
    if (oidcMatch !== null && request.method === "GET") {
      const providerId = decodeURIComponent(oidcMatch[1]);
      if (oidcMatch[2] === "start") {
        const target = await this.runtime.auth.startOidc(providerId, url.searchParams.get("returnTo") ?? "/");
        response.writeHead(302, { Location: target.href, "Cache-Control": "no-store" });
        response.end();
        return;
      }
      const completed = await this.runtime.auth.completeOidc(providerId, publicCallbackUrl(url, this.config));
      this.setAuthCookie(response, completed.token);
      response.writeHead(302, { Location: completed.returnTo, "Cache-Control": "no-store" });
      response.end();
      return;
    }
    if (endpoint === "/auth/dsh-auth/start" && request.method === "GET") {
      const callbackPath = `${cookiePath}/auth/dsh-auth/callback`;
      const target = this.runtime.auth.dshAuthLoginUrl(url.searchParams.get("returnTo") ?? "/", callbackPath);
      response.writeHead(302, { Location: target.href, "Cache-Control": "no-store" });
      response.end();
      return;
    }
    if (endpoint === "/auth/dsh-auth/callback" && request.method === "GET") {
      const returnTo = safeReturnPath(url.searchParams.get("returnTo") ?? "/");
      const adopted = await this.runtime.auth.adoptDshAuth(request.headers, returnTo);
      if (adopted === void 0) throw new ChatroomAuthError("dsh-auth \u767B\u5F55\u672A\u5B8C\u6210\u6216\u5DF2\u5931\u6548\u3002");
      this.setAuthCookie(response, adopted.token);
      response.writeHead(302, { Location: returnTo, "Cache-Control": "no-store" });
      response.end();
      return;
    }
    methodNotAllowed(response, endpoint.endsWith("/start") || endpoint.endsWith("/callback") ? "GET" : "POST");
  }
  async handleAdministration(request, response) {
    const actor = this.requireAccount(request, response);
    if (actor === void 0) return;
    if (request.method === "GET") {
      json(response, 200, this.runtime.auth.overview(actor));
      return;
    }
    if (request.method !== "POST") {
      methodNotAllowed(response, "GET, POST");
      return;
    }
    assertSameOrigin(request);
    const body = await readJson(request, 32768);
    const action = fieldString(body, "action");
    if (action === "create-user") {
      const account = await this.runtime.auth.createUser(actor, {
        username: fieldString(body, "username"),
        password: fieldString(body, "password"),
        displayName: fieldString(body, "displayName"),
        ...optionalFieldString(body, "avatarId") === void 0 ? {} : { avatarId: optionalFieldString(body, "avatarId") },
        role: accountRole(body.role)
      });
      json(response, 201, { account, overview: this.runtime.auth.overview(actor) });
      return;
    }
    if (action === "update-user") {
      const account = await this.runtime.auth.updateUser(actor, fieldString(body, "userId"), {
        ...body.role === void 0 ? {} : { role: accountRole(body.role) },
        ...body.status === void 0 ? {} : { status: accountStatus(body.status) }
      });
      json(response, 200, { account, overview: this.runtime.auth.overview(actor) });
      return;
    }
    if (action === "settings") {
      const allowSelfRegistration = body.allowSelfRegistration === void 0 ? void 0 : fieldBoolean(body, "allowSelfRegistration");
      const autoRedirectProviderId = nullableFieldString(body, "autoRedirectProviderId");
      if (allowSelfRegistration === void 0 && autoRedirectProviderId === void 0) {
        throw new ChatroomInputError("\u81F3\u5C11\u9700\u8981\u4FEE\u6539\u4E00\u9879\u8BA4\u8BC1\u8BBE\u7F6E\u3002");
      }
      await this.runtime.auth.updateSettings(actor, {
        ...allowSelfRegistration === void 0 ? {} : { allowSelfRegistration },
        ...autoRedirectProviderId === void 0 ? {} : { autoRedirectProviderId }
      });
      json(response, 200, this.runtime.auth.overview(actor));
      return;
    }
    if (action === "save-provider") {
      const provider = await this.runtime.auth.saveProvider(actor, {
        id: fieldString(body, "id"),
        label: fieldString(body, "label"),
        enabled: fieldBoolean(body, "enabled"),
        issuer: fieldString(body, "issuer"),
        clientId: fieldString(body, "clientId"),
        ...optionalFieldString(body, "clientSecret") === void 0 ? {} : { clientSecret: optionalFieldString(body, "clientSecret") },
        scopes: fieldString(body, "scopes"),
        usernameClaim: fieldString(body, "usernameClaim"),
        displayNameClaim: fieldString(body, "displayNameClaim"),
        autoCreateUsers: fieldBoolean(body, "autoCreateUsers")
      });
      json(response, 200, { provider, overview: this.runtime.auth.overview(actor) });
      return;
    }
    if (action === "delete-provider") {
      await this.runtime.auth.deleteProvider(actor, fieldString(body, "providerId"));
      json(response, 200, this.runtime.auth.overview(actor));
      return;
    }
    throw new ChatroomAuthError("\u7BA1\u7406\u5458\u64CD\u4F5C\u65E0\u6548\u3002");
  }
  async handleAccount(request, response) {
    if (request.method !== "POST") {
      methodNotAllowed(response, "POST");
      return;
    }
    assertSameOrigin(request);
    const actor = this.requireAccount(request, response);
    if (actor === void 0) return;
    const body = await readJson(request, 4096);
    if (fieldString(body, "action") !== "change-password") throw new ChatroomAuthError("\u8D26\u53F7\u64CD\u4F5C\u65E0\u6548\u3002");
    const changed = await this.runtime.auth.changePassword(
      actor,
      fieldString(body, "currentPassword"),
      fieldString(body, "newPassword")
    );
    this.setAuthCookie(response, changed.token);
    json(response, 200, { account: changed.account });
  }
  async handleDirect(request, response) {
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    if (request.method === "GET") {
      json(response, 200, this.runtime.directDirectory(identity));
      return;
    }
    if (request.method !== "POST") {
      methodNotAllowed(response, "GET, POST");
      return;
    }
    assertSameOrigin(request);
    const body = await readJson(request, 4096);
    json(response, 200, await this.runtime.openDirect(fieldString(body, "peerId"), identity));
  }
  async handleDirectMessages(request, response) {
    if (request.method !== "POST") {
      methodNotAllowed(response, "POST");
      return;
    }
    assertSameOrigin(request);
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const body = await readJson(request, this.config.maxMessageTextChars * 4 + 4096);
    json(response, 201, await this.runtime.sendDirect(
      fieldString(body, "conversationId"),
      fieldString(body, "text"),
      identity
    ));
  }
  async handleRooms(request, response) {
    if (request.method === "GET") {
      if (this.requireIdentity(request, response) === void 0) return;
      json(response, 200, { rooms: this.runtime.rooms });
      return;
    }
    if (request.method !== "POST") {
      methodNotAllowed(response, "GET, POST");
      return;
    }
    assertSameOrigin(request);
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const body = await readJson(request, smallRequestLimit(this.config));
    const room = await this.runtime.createRoom(fieldString(body, "title"), identity);
    json(response, 201, { room });
  }
  async handleRoomEnsure(request, response) {
    if (request.method !== "POST") {
      methodNotAllowed(response, "POST");
      return;
    }
    assertSameOrigin(request);
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const body = await readJson(request, smallRequestLimit(this.config));
    const room = await this.runtime.ensureSessionRoom(
      fieldString(body, "sessionId"),
      fieldString(body, "title"),
      identity
    );
    json(response, 200, { room });
  }
  async handleRoomSelection(request, response) {
    if (request.method !== "POST") {
      methodNotAllowed(response, "POST");
      return;
    }
    assertSameOrigin(request);
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const body = await readJson(request, smallRequestLimit(this.config));
    const room = await this.runtime.selectRoom(fieldString(body, "roomId"), identity);
    json(response, 200, { room });
  }
  async handleRoomManagement(request, response) {
    if (request.method !== "POST") {
      methodNotAllowed(response, "POST");
      return;
    }
    assertSameOrigin(request);
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const body = await readJson(request, smallRequestLimit(this.config) + 2048);
    const roomId = fieldString(body, "roomId");
    const action = fieldString(body, "action");
    if (action === "rename") {
      const room = await this.runtime.renameRoom(roomId, fieldString(body, "title"), identity);
      json(response, 200, { room, members: this.runtime.membersForRoom(roomId) });
      return;
    }
    if (action === "set-role") {
      const role = fieldString(body, "role");
      if (role !== "admin" && role !== "member") throw new ChatroomInputError("\u7FA4\u6210\u5458\u89D2\u8272\u65E0\u6548\u3002");
      const members = await this.runtime.setMemberRole(
        roomId,
        fieldString(body, "participantId"),
        role,
        identity
      );
      json(response, 200, { room: this.runtime.rooms.find((item) => item.id === roomId), members });
      return;
    }
    throw new ChatroomInputError("\u7FA4\u7BA1\u7406\u64CD\u4F5C\u65E0\u6548\u3002");
  }
  async handleThreadOpen(request, response) {
    if (request.method !== "POST") {
      methodNotAllowed(response, "POST");
      return;
    }
    assertSameOrigin(request);
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const body = await readJson(request, smallRequestLimit(this.config) + 2048);
    const root = threadRootRequest(body.root);
    const result = await this.runtime.openThread(fieldString(body, "roomId"), identity, root);
    json(response, 200, result);
  }
  async handleThreadPrompt(request, response) {
    if (request.method !== "POST") {
      methodNotAllowed(response, "POST");
      return;
    }
    assertSameOrigin(request);
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const body = await readJson(request, this.runtime.maxPromptRequestBytes);
    const parsed = promptRequest({ ...body, roomId: "__thread__" }, this.config);
    const prompt = {
      threadId: fieldString(body, "threadId"),
      mode: parsed.mode,
      content: parsed.content,
      ...parsed.reply === void 0 ? {} : { reply: parsed.reply }
    };
    const result = await this.runtime.submitThread(
      prompt.threadId,
      identity,
      prompt.content,
      prompt.mode,
      prompt.reply
    );
    json(response, 200, result);
  }
  async handlePrompt(request, response) {
    if (request.method !== "POST") {
      methodNotAllowed(response, "POST");
      return;
    }
    assertSameOrigin(request);
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const body = await readJson(request, this.runtime.maxPromptRequestBytes);
    const prompt = promptRequest(body, this.config);
    const result = await this.runtime.submit(prompt.roomId, identity, prompt.content, prompt.mode, prompt.reply);
    json(response, 200, result);
  }
  async handleReactionToggle(request, response) {
    if (request.method !== "POST") {
      methodNotAllowed(response, "POST");
      return;
    }
    assertSameOrigin(request);
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const body = await readJson(request, smallRequestLimit(this.config));
    const emoji = body.emoji;
    if (!isChatroomReactionEmoji(emoji)) throw new ChatroomInputError("\u8BF7\u9009\u62E9\u652F\u6301\u7684\u6D88\u606F\u8868\u60C5\u3002");
    const reaction = await this.runtime.toggleReaction(
      fieldString(body, "roomId"),
      fieldString(body, "messageId"),
      emoji,
      identity
    );
    json(response, 200, reaction);
  }
  async handleForward(request, response) {
    if (request.method !== "POST") {
      methodNotAllowed(response, "POST");
      return;
    }
    assertSameOrigin(request);
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const body = await readJson(request, this.config.maxMessageTextChars * 12 + 32768);
    const result = await this.runtime.forwardMessages(
      fieldString(body, "sourceRoomId"),
      fieldString(body, "targetRoomId"),
      forwardItems(body.messages),
      identity
    );
    json(response, 200, result);
  }
  handleFile(request, response, fileId) {
    if (request.method !== "GET") {
      methodNotAllowed(response, "GET");
      return;
    }
    if (this.requireIdentity(request, response) === void 0) return;
    if (fileId === "" || fileId.includes("/")) throw new ChatroomInputError("\u6587\u4EF6\u7F16\u53F7\u65E0\u6548\u3002");
    const file = this.runtime.file(fileId);
    response.writeHead(200, {
      "Content-Type": file.ref.mediaType,
      "Content-Length": file.data.byteLength,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.ref.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(file.data);
  }
  async handleImage(request, response, encoded) {
    if (request.method !== "GET") {
      methodNotAllowed(response, "GET");
      return;
    }
    if (this.requireIdentity(request, response) === void 0) return;
    let value;
    try {
      value = JSON.parse(decodeURIComponent(encoded));
    } catch {
      throw new ChatroomInputError("\u56FE\u7247\u5F15\u7528\u65E0\u6548\u3002");
    }
    const image = forwardImageRequest(value);
    const stored = await this.runtime.image(
      image.sourceRoomId,
      image.sourceSessionId,
      image.sourceSeq,
      image.image
    );
    response.writeHead(200, {
      "Content-Type": stored.ref.mediaType,
      "Content-Length": stored.data.byteLength,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(stored.ref.name ?? "image")}`,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(stored.data);
  }
  async handleEvents(request, response, search) {
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const roomId = search.get("roomId");
    if (roomId === null || roomId === "") throw new ChatroomInputError("\u7F3A\u5C11\u5171\u4EAB\u4F1A\u8BDD\u7F16\u53F7\u3002");
    await this.runtime.selectRoom(roomId, identity);
    response.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    const unsubscribe = this.runtime.subscribe(roomId, identity, response);
    const heartbeat = setInterval(() => {
      if (!response.destroyed && !response.writableEnded) response.write(": heartbeat\n\n");
    }, this.config.sseHeartbeatMs);
    request.once("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  }
  handleNotifications(request, response) {
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    response.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    const unsubscribe = this.runtime.subscribeNotifications(identity, response);
    const heartbeat = setInterval(() => {
      if (!response.destroyed && !response.writableEnded) response.write(": heartbeat\n\n");
    }, this.config.sseHeartbeatMs);
    request.once("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  }
  async handleConfiguration(request, response, method) {
    if (request.method !== "POST") {
      methodNotAllowed(response, "POST");
      return;
    }
    if (!isRemoteConfigurationMethod(method)) {
      json(response, 404, { error: "\u8FDC\u7A0B\u914D\u7F6E\u63A5\u53E3\u4E0D\u5B58\u5728\u3002" });
      return;
    }
    assertSameOrigin(request);
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const account = this.config.authEnabled ? this.runtime.auth.account(this.authToken(request)) : void 0;
    if (account?.role !== "super-admin" && !canManageRemoteSettings(this.config, identity.participantId)) {
      json(response, 403, { error: "\u5F53\u524D\u804A\u5929\u5BA4\u8EAB\u4EFD\u6CA1\u6709\u6A21\u578B\u8BBE\u7F6E\u7BA1\u7406\u6743\u9650\u3002" });
      return;
    }
    const body = await readJson(request, this.config.maxSettingsRequestBytes);
    const controller = new AbortController();
    request.once("aborted", () => controller.abort());
    const upstream = await this.configurationApi.fetch(new Request(`http://chatroom.local/api/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    }));
    const payload = await upstream.json();
    if (method === "settings.describe") hideHostDocumentCapability(payload);
    json(response, upstream.status, payload);
  }
  sessionPayload(identity, account) {
    return {
      auth: this.runtime.auth.state(account),
      identity,
      rooms: this.config.authEnabled && account === void 0 ? [] : this.runtime.rooms,
      ...this.config.authEnabled && account === void 0 ? {} : { room: this.runtime.room }
    };
  }
  requireIdentity(request, response) {
    const identity = this.config.authEnabled ? this.runtime.auth.account(this.authToken(request)) : this.runtime.identity(this.token(request));
    if (identity === void 0) {
      json(response, 401, {
        error: this.config.authEnabled ? "\u8BF7\u5148\u767B\u5F55\u3002" : "\u8BF7\u5148\u9009\u62E9\u804A\u5929\u5BA4\u8EAB\u4EFD\u3002"
      });
    }
    return identity;
  }
  requireAccount(request, response) {
    const account = this.runtime.auth.account(this.authToken(request));
    if (account === void 0) json(response, 401, { error: "\u8BF7\u5148\u767B\u5F55\u3002" });
    return account;
  }
  token(request) {
    return cookieValue(request.headers.cookie, this.config.cookieName);
  }
  authToken(request) {
    return cookieValue(request.headers.cookie, this.config.authCookieName);
  }
  setAuthCookie(response, token) {
    response.setHeader("Set-Cookie", sessionCookie(
      this.config.authCookieName,
      token,
      this.config.authSessionMaxAgeSeconds,
      "/",
      this.config.authPublicOrigin.startsWith("https://")
    ));
  }
};
var REMOTE_CONFIGURATION_METHODS = /* @__PURE__ */ new Set([
  "settings.describe",
  "settings.update",
  "settings.replace",
  "settings.mutate",
  "credentials.describe",
  "credentials.set",
  "credentials.unset",
  "llm.discoverModels"
]);
function isRemoteConfigurationMethod(method) {
  return REMOTE_CONFIGURATION_METHODS.has(method);
}
function canManageRemoteSettings(config, participantId) {
  return config.settingsAdminParticipantIds.includes(participantId);
}
function hideHostDocumentCapability(payload) {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return;
  const result = payload.result;
  if (result === null || typeof result !== "object" || Array.isArray(result)) return;
  const resultRecord = result;
  if (resultRecord.ok !== true) return;
  const value = resultRecord.value;
  if (value === null || typeof value !== "object" || Array.isArray(value)) return;
  value.hasDocument = false;
}
function json(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  response.end(body);
}
function html(response, status, body, head) {
  response.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store, max-age=0",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY"
  });
  response.end(head ? void 0 : body);
}
function methodNotAllowed(response, allow) {
  response.setHeader("Allow", allow);
  json(response, 405, { error: "\u8BF7\u6C42\u65B9\u6CD5\u4E0D\u53D7\u652F\u6301\u3002" });
}
function assertSameOrigin(request) {
  const origin = request.headers.origin;
  if (origin === void 0) return;
  const host = request.headers.host;
  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ChatroomInputError("\u8BF7\u6C42\u6765\u6E90\u65E0\u6548\u3002");
  }
  if (host === void 0 || originHost !== host) throw new ChatroomInputError("\u8BF7\u6C42\u6765\u6E90\u65E0\u6548\u3002");
}
async function readJson(request, limit) {
  const contentType = request.headers["content-type"]?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") throw new ChatroomInputError("\u8BF7\u6C42\u5FC5\u987B\u4F7F\u7528 application/json\u3002");
  const chunks = [];
  let bytes = 0;
  for await (const raw of request) {
    const chunk = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
    bytes += chunk.byteLength;
    if (bytes > limit) throw new ChatroomInputError("\u8BF7\u6C42\u5185\u5BB9\u8FC7\u5927\u3002");
    chunks.push(chunk);
  }
  let value;
  try {
    value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ChatroomInputError("\u8BF7\u6C42 JSON \u65E0\u6548\u3002");
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ChatroomInputError("\u8BF7\u6C42 JSON \u5FC5\u987B\u662F\u5BF9\u8C61\u3002");
  }
  return value;
}
function fieldString(body, field) {
  const value = body[field];
  if (typeof value !== "string") throw new ChatroomInputError(`\u5B57\u6BB5 ${field} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u3002`);
  return value;
}
function optionalFieldString(body, field) {
  const value = body[field];
  if (value === void 0) return void 0;
  if (typeof value !== "string") throw new ChatroomInputError(`\u5B57\u6BB5 ${field} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u3002`);
  return value;
}
function nullableFieldString(body, field) {
  const value = body[field];
  if (value === void 0 || value === null) return value;
  if (typeof value !== "string") throw new ChatroomInputError(`\u5B57\u6BB5 ${field} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u6216 null\u3002`);
  return value;
}
function fieldBoolean(body, field) {
  const value = body[field];
  if (typeof value !== "boolean") throw new ChatroomInputError(`\u5B57\u6BB5 ${field} \u5FC5\u987B\u662F\u5E03\u5C14\u503C\u3002`);
  return value;
}
function accountRole(value) {
  if (value !== "super-admin" && value !== "admin" && value !== "member") {
    throw new ChatroomInputError("\u8D26\u53F7\u89D2\u8272\u65E0\u6548\u3002");
  }
  return value;
}
function accountStatus(value) {
  if (value !== "active" && value !== "disabled") throw new ChatroomInputError("\u8D26\u53F7\u72B6\u6001\u65E0\u6548\u3002");
  return value;
}
function publicCallbackUrl(url, config) {
  if (config.authPublicOrigin === "") throw new ChatroomAuthError("\u7BA1\u7406\u5458\u5C1A\u672A\u914D\u7F6E\u4F01\u4E1A SSO \u7684\u516C\u7F51\u8BBF\u95EE\u5730\u5740\u3002");
  return new URL(`${url.pathname}${url.search}`, config.authPublicOrigin);
}
function forwardItems(value) {
  if (!Array.isArray(value)) throw new ChatroomInputError("\u8F6C\u53D1\u6D88\u606F\u5217\u8868\u65E0\u6548\u3002");
  return value.map((raw) => {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      throw new ChatroomInputError("\u8F6C\u53D1\u6D88\u606F\u683C\u5F0F\u65E0\u6548\u3002");
    }
    const item = raw;
    const role = item.role;
    if (role !== "human" && role !== "ai") throw new ChatroomInputError("\u8F6C\u53D1\u6D88\u606F\u89D2\u8272\u65E0\u6548\u3002");
    if (typeof item.createdAt !== "number") throw new ChatroomInputError("\u8F6C\u53D1\u6D88\u606F\u65F6\u95F4\u65E0\u6548\u3002");
    if (item.sourceSessionId === void 0 !== (item.sourceSeq === void 0) || item.sourceSessionId !== void 0 && typeof item.sourceSessionId !== "string" || item.sourceSeq !== void 0 && typeof item.sourceSeq !== "number") {
      throw new ChatroomInputError("\u8F6C\u53D1\u6765\u6E90\u6D88\u606F\u4E0D\u5B8C\u6574\u3002");
    }
    return {
      messageId: fieldString(item, "messageId"),
      ...item.sourceSessionId === void 0 ? {} : {
        sourceSessionId: item.sourceSessionId,
        sourceSeq: item.sourceSeq
      },
      role,
      displayName: fieldString(item, "displayName"),
      text: fieldString(item, "text"),
      createdAt: item.createdAt
    };
  });
}
function promptRequest(body, config) {
  const roomId = fieldString(body, "roomId");
  const mode = body.mode;
  if (mode !== "queue" && mode !== "steer") throw new ChatroomInputError("\u5B57\u6BB5 mode \u5FC5\u987B\u662F queue \u6216 steer\u3002");
  if (!Array.isArray(body.content) || body.content.length === 0) {
    throw new ChatroomInputError("\u6D88\u606F\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A\u3002");
  }
  const content = [];
  let textChars = 0;
  for (const raw of body.content) {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      throw new ChatroomInputError("\u6D88\u606F\u5185\u5BB9\u683C\u5F0F\u65E0\u6548\u3002");
    }
    const part = raw;
    if (part.type === "text") {
      if (typeof part.text !== "string") throw new ChatroomInputError("\u6587\u672C\u6D88\u606F\u65E0\u6548\u3002");
      textChars += [...part.text].length;
      content.push({ type: "text", text: part.text });
      continue;
    }
    if (part.type === "image") {
      if (!isImageMediaType(part.mediaType) || typeof part.data !== "string") {
        throw new ChatroomInputError("\u56FE\u7247\u6D88\u606F\u65E0\u6548\u3002");
      }
      if (part.name !== void 0 && typeof part.name !== "string") {
        throw new ChatroomInputError("\u56FE\u7247\u540D\u79F0\u65E0\u6548\u3002");
      }
      content.push({
        type: "image",
        mediaType: part.mediaType,
        data: part.data,
        ...part.name === void 0 ? {} : { name: part.name }
      });
      continue;
    }
    if (part.type === "file") {
      if (typeof part.mediaType !== "string" || typeof part.data !== "string" || typeof part.name !== "string") {
        throw new ChatroomInputError("\u6587\u4EF6\u6D88\u606F\u65E0\u6548\u3002");
      }
      content.push({ type: "file", mediaType: part.mediaType, data: part.data, name: part.name });
      continue;
    }
    throw new ChatroomInputError("\u6D88\u606F\u5185\u5BB9\u7C7B\u578B\u65E0\u6548\u3002");
  }
  if (textChars > config.maxMessageTextChars) {
    throw new ChatroomInputError(`\u6D88\u606F\u6587\u672C\u4E0D\u80FD\u8D85\u8FC7 ${config.maxMessageTextChars} \u4E2A\u5B57\u7B26\u3002`);
  }
  if (!content.some((part) => part.type !== "text" || part.text.trim() !== "")) {
    throw new ChatroomInputError("\u6D88\u606F\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A\u3002");
  }
  const reply = replyRequest(body.reply);
  return { roomId, mode, content, ...reply === void 0 ? {} : { reply } };
}
function replyRequest(value) {
  if (value === void 0) return void 0;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ChatroomInputError("\u56DE\u590D\u5F15\u7528\u65E0\u6548\u3002");
  }
  const reply = value;
  const messageId = fieldString(reply, "messageId");
  const displayName = fieldString(reply, "displayName").trim();
  const text = fieldString(reply, "text").trim().replace(/\s+/gu, " ");
  if (messageId === "" || displayName === "" || text === "") throw new ChatroomInputError("\u56DE\u590D\u5F15\u7528\u4E0D\u5B8C\u6574\u3002");
  if ([...displayName].length > 80 || [...text].length > 240) throw new ChatroomInputError("\u56DE\u590D\u5F15\u7528\u8FC7\u957F\u3002");
  if (/\p{Cc}/u.test(`${displayName}${text}`)) throw new ChatroomInputError("\u56DE\u590D\u5F15\u7528\u5305\u542B\u65E0\u6548\u5B57\u7B26\u3002");
  return { messageId, displayName, text };
}
function threadRootRequest(value) {
  const reply = replyRequest(value);
  if (reply === void 0 || value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ChatroomInputError("\u5206\u652F\u4E3B\u9898\u6D88\u606F\u65E0\u6548\u3002");
  }
  const role = value.role;
  if (role !== "human" && role !== "ai") throw new ChatroomInputError("\u5206\u652F\u4E3B\u9898\u89D2\u8272\u65E0\u6548\u3002");
  const request = value;
  if (request.sourceSessionId === void 0 !== (request.sourceSeq === void 0) || request.sourceSessionId !== void 0 && typeof request.sourceSessionId !== "string" || request.sourceSeq !== void 0 && typeof request.sourceSeq !== "number") {
    throw new ChatroomInputError("\u5206\u652F\u4E3B\u9898\u6765\u6E90\u6D88\u606F\u4E0D\u5B8C\u6574\u3002");
  }
  return {
    ...reply,
    role,
    ...request.sourceSessionId === void 0 ? {} : {
      sourceSessionId: request.sourceSessionId,
      sourceSeq: request.sourceSeq
    }
  };
}
function isImageMediaType(value) {
  return value === "image/png" || value === "image/jpeg" || value === "image/webp" || value === "image/gif";
}
function imageReference(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ChatroomInputError("\u56FE\u7247\u5F15\u7528\u65E0\u6548\u3002");
  }
  const image = value;
  if (typeof image.attachmentId !== "string" || !isImageMediaType(image.mediaType) || !Number.isSafeInteger(image.bytes) || !Number.isSafeInteger(image.width) || !Number.isSafeInteger(image.height) || image.name !== void 0 && typeof image.name !== "string") {
    throw new ChatroomInputError("\u56FE\u7247\u5F15\u7528\u65E0\u6548\u3002");
  }
  return {
    attachmentId: image.attachmentId,
    mediaType: image.mediaType,
    bytes: image.bytes,
    width: image.width,
    height: image.height,
    ...image.name === void 0 ? {} : { name: image.name }
  };
}
function forwardImageRequest(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ChatroomInputError("\u56FE\u7247\u6765\u6E90\u65E0\u6548\u3002");
  }
  const request = value;
  const sourceSeq = request.sourceSeq;
  if (!Number.isSafeInteger(sourceSeq) || sourceSeq < 0) {
    throw new ChatroomInputError("\u56FE\u7247\u6765\u6E90\u65E0\u6548\u3002");
  }
  return {
    sourceRoomId: fieldString(request, "sourceRoomId"),
    sourceSessionId: fieldString(request, "sourceSessionId"),
    sourceSeq,
    image: imageReference(request.image)
  };
}
function smallRequestLimit(config) {
  return Math.max(config.maxDisplayNameChars, config.maxRoomTitleChars) * 4 + 1024;
}
function originalRequestUri(request) {
  const original = request.headers["x-original-uri"] ?? request.headers["x-forwarded-uri"];
  return safeReturnPath(typeof original === "string" ? original : "/");
}
function safeReturnPath(value) {
  if (!value.startsWith("/") || value.startsWith("//") || /[\r\n]/u.test(value)) return "/";
  return value.slice(0, 2048);
}

// src/model-history.ts
import { freezeMessage } from "@deepseek-ai/dsh-llm";
var OMITTED_IMAGE_TEXT = "[\u5386\u53F2\u56FE\u7247\u5DF2\u4FDD\u7559\u5728\u7FA4\u804A\u4E2D\uFF0C\u4F46\u672A\u53D1\u9001\u7ED9\u5F53\u524D\u6587\u672C\u6A21\u578B\u3002]";
function textCompatibleMessages(messages) {
  return messages.map((message) => {
    const content = textCompatibleContent(message.content);
    return content === message.content ? message : freezeMessage({ ...message, content });
  });
}
function messagesContainImages(messages) {
  return messages.some((message) => contentContainsImages(message.content));
}
function textCompatibleStream(options, next, ownsSession, resolveModelInfo, stream) {
  if (options.sessionId === void 0 || !ownsSession(String(options.sessionId)) || !messagesContainImages(options.messages)) return next();
  return (async function* () {
    const model = await resolveModelInfo(options.provider, options.model, options.signal);
    if (model.inputModalities === void 0 || model.inputModalities.includes("image")) {
      yield* next();
      return;
    }
    yield* stream({ ...options, messages: textCompatibleMessages(options.messages) });
  })();
}
function textCompatibleContent(content) {
  let changed = false;
  const compatible = content.map((block) => {
    if (block.type === "image") {
      changed = true;
      return { type: "text", text: OMITTED_IMAGE_TEXT };
    }
    if (block.type !== "tool-result") return block;
    const nested = textCompatibleContent(block.content);
    if (nested === block.content) return block;
    changed = true;
    return { ...block, content: nested };
  });
  return changed ? compatible : content;
}
function contentContainsImages(content) {
  return content.some((block) => block.type === "image" || block.type === "tool-result" && contentContainsImages(block.content));
}

// src/index.ts
var name = "deepseek-harness-chatroom";
var inject = [
  "agentDefaultModel",
  "agentPresets",
  "agents",
  "attachments",
  "apiProxy",
  "llm",
  "sessionPersistence",
  "sessions",
  "sessionTitle",
  "storageDomain",
  "webServer",
  "workspaceRegistry"
];
function apply(ctx, config) {
  validateConfig(config);
  const runtime = new ChatroomRuntime(ctx, config);
  const http = new ChatroomHttpController(ctx, runtime, config);
  const log = ctx.logger("deepseek-harness-chatroom");
  ctx.effect(() => {
    const unregister = CHATROOM_API_PREFIXES.map((path) => ctx.webServer.register({
      kind: "prefix",
      path,
      handler: (request, response) => http.handle(request, response)
    }));
    const startup = runtime.start().then(() => {
      log.info("AI chatroom %s is ready", JSON.stringify(config.roomId));
    }).catch(async (error) => {
      log.warn("AI chatroom remains offline: %s. Harness startup is unaffected.", String(error));
      await runtime.stop();
    });
    return async () => {
      for (const dispose of unregister) dispose();
      await startup;
      await runtime.stop();
    };
  }, "deepseek-harness-chatroom.runtime");
  ctx.effect(() => ctx.on("session/event", (session, event) => {
    runtime.handleSessionEvent(session, event);
  }), "deepseek-harness-chatroom.session-events");
  ctx.effect(() => ctx.on("llm/stream", (options, next) => textCompatibleStream(
    options,
    next,
    (sessionId) => runtime.ownsSession(sessionId),
    (provider, model, signal) => ctx.llm.resolveModelInfo(provider, model, signal),
    (request) => ctx.llm.stream(request)
  )), "deepseek-harness-chatroom.model-history");
}
var index_default = { name, inject, Config, apply };
export {
  ChatroomHttpController,
  ChatroomRuntime,
  Config,
  apply,
  index_default as default,
  inject,
  name
};
//# sourceMappingURL=index.js.map