import { isAbsolute } from 'node:path'
import z from '@deepseek-ai/schemastery'

/** Deployment configuration for shared AI rooms. */
export interface Config {
  roomId: string
  roomTitle: string
  aiDisplayName: string
  sessionId: string
  cwd: string
  agentPreset: string
  cookieName: string
  cookieMaxAgeSeconds: number
  maxDisplayNameChars: number
  maxRoomTitleChars: number
  maxMessageTextChars: number
  maxFileBytes: number
  maxFilesPerMessage: number
  maxMessageFileBytes: number
  maxImageSidePixels: number
  settingsAdminParticipantIds: string[]
  maxSettingsRequestBytes: number
  sseHeartbeatMs: number
  authEnabled: boolean
  authCookieName: string
  authSessionMaxAgeSeconds: number
  authSecret: string
  authPublicOrigin: string
  authBootstrapToken: string
  authAllowSelfRegistration: boolean
  authDshAuthHeaders: boolean
  authDshAuthVerifyUrl: string
  authDshAuthLoginPath: string
  /** Authentication topology. Omitted by older callers and treated as local. */
  authMode?: 'local' | 'hybrid' | 'dsh-auth-only'
  authDshAuthSuperAdminSubjects?: string[]
  authDshAuthAvatarUrlTemplate?: string
  authDshAuthAvatarAllowedOrigins?: string[]
  authDshAuthRevalidateSeconds?: number
}

export const Config: z<Config> = z.object({
  roomId: z.string().min(1).max(64).pattern(/^[a-z0-9][a-z0-9_-]*$/u).default('lobby'),
  roomTitle: z.string().min(1).max(80).default('AI 聊天室'),
  aiDisplayName: z.string().min(1).max(40).default('DeepSeek'),
  sessionId: z.string().min(1).max(160).default('chatroom-v1-lobby'),
  cwd: z.string().required(),
  agentPreset: z.string().min(1).default('standard'),
  cookieName: z.string().pattern(/^[A-Za-z0-9_]+$/u).default('dsh_chatroom_session'),
  cookieMaxAgeSeconds: z.number().step(1).min(60).max(31_536_000).default(31_536_000),
  maxDisplayNameChars: z.number().step(1).min(1).max(80).default(24),
  maxRoomTitleChars: z.number().step(1).min(1).max(160).default(80),
  maxMessageTextChars: z.number().step(1).min(1).max(200_000).default(20_000),
  maxFileBytes: z.number().step(1).min(1).max(100 * 1024 * 1024).default(20 * 1024 * 1024),
  maxFilesPerMessage: z.number().step(1).min(1).max(20).default(5),
  maxMessageFileBytes: z.number().step(1).min(1).max(200 * 1024 * 1024).default(50 * 1024 * 1024),
  maxImageSidePixels: z.number().step(1).min(512).max(16_384).default(4_096),
  settingsAdminParticipantIds: z.array(z.string().min(1).max(128)).default([]),
  maxSettingsRequestBytes: z.number().step(1).min(1_024).max(8 * 1024 * 1024).default(1024 * 1024),
  sseHeartbeatMs: z.number().step(1).min(5_000).max(120_000).default(15_000),
  authEnabled: z.boolean().default(false),
  authCookieName: z.string().pattern(/^[A-Za-z0-9_]+$/u).default('dsh_chatroom_auth'),
  authSessionMaxAgeSeconds: z.number().step(1).min(300).max(31_536_000).default(2_592_000),
  authSecret: z.string().default(''),
  authPublicOrigin: z.string().default(''),
  authBootstrapToken: z.string().default(''),
  authAllowSelfRegistration: z.boolean().default(true),
  authDshAuthHeaders: z.boolean().default(false),
  authDshAuthVerifyUrl: z.string().default(''),
  authDshAuthLoginPath: z.string().default('/auth/login'),
  authMode: z.string().pattern(/^(local|hybrid|dsh-auth-only)$/u).default('local'),
  authDshAuthSuperAdminSubjects: z.array(z.string().min(1).max(512)).default([]),
  authDshAuthAvatarUrlTemplate: z.string().default(''),
  authDshAuthAvatarAllowedOrigins: z.array(z.string().min(1)).default([]),
  authDshAuthRevalidateSeconds: z.number().step(1).min(5).max(3_600).default(60),
}) as unknown as z<Config>

/** Validate relationships Schemastery cannot express by individual fields. */
export function validateConfig(config: Config): void {
  if (!isAbsolute(config.cwd)) {
    throw new Error(`chatroom: cwd must be absolute, got ${JSON.stringify(config.cwd)}`)
  }
  if (config.maxMessageFileBytes < config.maxFileBytes) {
    throw new Error('chatroom: maxMessageFileBytes must be greater than or equal to maxFileBytes')
  }
  if (config.authEnabled && Buffer.byteLength(config.authSecret, 'utf8') < 32) {
    throw new Error('chatroom: authSecret must contain at least 32 UTF-8 bytes when authentication is enabled')
  }
  if (config.authEnabled && config.authBootstrapToken === ''
    && !config.authDshAuthHeaders && config.authDshAuthVerifyUrl === '') {
    throw new Error('chatroom: authBootstrapToken or a dsh-auth adapter is required to create the first super administrator')
  }
  if (config.authPublicOrigin !== '') {
    const origin = new URL(config.authPublicOrigin)
    if (origin.origin !== config.authPublicOrigin || origin.protocol !== 'https:') {
      throw new Error('chatroom: authPublicOrigin must be an HTTPS origin without a path')
    }
  }
  if (config.authDshAuthVerifyUrl !== '') {
    if (config.authPublicOrigin === '') {
      throw new Error('chatroom: authPublicOrigin is required with authDshAuthVerifyUrl')
    }
    const verify = new URL(config.authDshAuthVerifyUrl)
    const loopback = verify.hostname === '127.0.0.1' || verify.hostname === '[::1]' || verify.hostname === 'localhost'
    if (!loopback || verify.protocol !== 'http:' || verify.username !== '' || verify.password !== '' || verify.hash !== '') {
      throw new Error('chatroom: authDshAuthVerifyUrl must be an uncredentialed loopback HTTP URL')
    }
  }
  const mode = config.authMode ?? 'local'
  if (mode === 'dsh-auth-only' && (config.authEnabled !== true || config.authDshAuthVerifyUrl === '')) {
    throw new Error('chatroom: dsh-auth-only mode requires authEnabled and authDshAuthVerifyUrl')
  }
  if (mode === 'dsh-auth-only' && (config.authDshAuthSuperAdminSubjects ?? []).length === 0) {
    throw new Error('chatroom: dsh-auth-only mode requires at least one super-admin subject')
  }
  if (mode === 'dsh-auth-only' && config.authAllowSelfRegistration) {
    throw new Error('chatroom: dsh-auth-only mode must disable self registration')
  }
  if (mode === 'dsh-auth-only' && config.authDshAuthHeaders) {
    throw new Error('chatroom: dsh-auth-only mode does not allow direct identity headers')
  }
  const allowedOrigins = config.authDshAuthAvatarAllowedOrigins ?? []
  for (const value of allowedOrigins) {
    let origin: URL
    try { origin = new URL(value) } catch { throw new Error('chatroom: avatar allowed origins must be HTTPS origins') }
    if (origin.protocol !== 'https:' || origin.origin !== value || origin.pathname !== '/' || origin.search !== '' || origin.hash !== '') {
      throw new Error('chatroom: avatar allowed origins must be HTTPS origins without paths')
    }
  }
  const template = config.authDshAuthAvatarUrlTemplate ?? ''
  if (template !== '') {
    if (!template.includes('{username}')) throw new Error('chatroom: avatar URL template must contain {username}')
    const expanded = template.replaceAll('{username}', 'user')
    let avatar: URL
    try { avatar = new URL(expanded) } catch { throw new Error('chatroom: avatar URL template must be an HTTPS URL') }
    if (avatar.protocol !== 'https:' || avatar.username !== '' || avatar.password !== '' || avatar.hash !== '') {
      throw new Error('chatroom: avatar URL template must be an HTTPS URL')
    }
    if (allowedOrigins.length > 0 && !allowedOrigins.includes(avatar.origin)) {
      throw new Error('chatroom: avatar URL template origin is not allowlisted')
    }
  }
  if (!config.authDshAuthLoginPath.startsWith('/') || config.authDshAuthLoginPath.startsWith('//')
    || /[?#\r\n]/u.test(config.authDshAuthLoginPath)) {
    throw new Error('chatroom: authDshAuthLoginPath must be an absolute public path without a query or fragment')
  }
}
