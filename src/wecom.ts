import { spawn, type ChildProcess } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, stat, unlink } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { join, parse, resolve } from 'node:path'
import type { Config } from './config.js'
import type { ChatroomDocumentCard, ChatroomExternalCard, ChatroomMeetingCard } from './types.js'

const require = createRequire(import.meta.url)
const MAX_OUTPUT_BYTES = 8 * 1024 * 1024

export const WECOM_SERVICES = [
  'calendar',
  'meeting',
  'doc',
  'sheet',
  'smartsheet',
  'smartpage',
  'contact',
  'identity',
] as const

export type WecomService = typeof WECOM_SERVICES[number]

export interface WecomAuthorizationState {
  readonly enabled: boolean
  readonly status: 'authorized' | 'unauthorized' | 'pending'
  readonly qrAvailable: boolean
  readonly canManage?: boolean
  readonly error?: string
}

/** Structured failure returned by the Enterprise WeChat CLI adapter. */
export class WecomCliError extends Error {
  constructor(message: string, readonly code: 'disabled' | 'unauthorized' | 'timeout' | 'invalid-output' | 'failed') {
    super(message)
    this.name = 'WecomCliError'
  }
}

/** Lazy process adapter around the official `@wecom/cli` package. */
export class WecomCliClient {
  constructor(private readonly config: Config, private readonly configDirectory = config.wecomCliConfigDirectory) {}

  /** Query one official CLI method schema without requiring plugin restart. */
  schema(service: WecomService, resource: readonly string[], method: string): Promise<unknown> {
    return this.run(['schema', 'get', joinCommand(service, resource, method)])
  }

  /** Execute one official Enterprise WeChat method with JSON parameters. */
  invoke(service: WecomService, resource: readonly string[], method: string, parameters: unknown): Promise<unknown> {
    return this.run([service, ...resource, method, '--json', JSON.stringify(parameters)])
  }

  /** Read the current Enterprise WeChat authorization state. */
  authStatus(): Promise<unknown> {
    return this.runText(['auth', 'show', '--status'])
  }

  private run(args: readonly string[]): Promise<unknown> {
    return this.runOutput(args, output => output === '' ? {} : parseJson(output))
  }

  private runText(args: readonly string[]): Promise<string> {
    return this.runOutput(args, output => output)
  }

  private runOutput<T>(args: readonly string[], parse: (output: string) => T): Promise<T> {
    if (!this.config.wecomEnabled) {
      return Promise.reject(new WecomCliError('企业微信能力已在插件配置中关闭。', 'disabled'))
    }
    const cli = this.config.wecomCliPath || require.resolve('@wecom/cli/bin/wecom.js')
    const environment = {
      ...process.env,
      ...(this.configDirectory === '' ? {} : { WECOM_CLI_CONFIG_DIR: this.configDirectory }),
    }
    return new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [cli, ...args], {
        env: environment,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      })
      let stdout = ''
      let stderr = ''
      let outputBytes = 0
      let settled = false
      const finish = (operation: () => void): void => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        operation()
      }
      const collect = (current: string, chunk: Buffer): string => {
        outputBytes += chunk.byteLength
        if (outputBytes > MAX_OUTPUT_BYTES) {
          child.kill('SIGKILL')
          finish(() => reject(new WecomCliError('企业微信 CLI 返回数据超过 8 MB 限制。', 'failed')))
          return current
        }
        return current + chunk.toString('utf8')
      }
      child.stdout.on('data', (chunk: Buffer) => { stdout = collect(stdout, chunk) })
      child.stderr.on('data', (chunk: Buffer) => { stderr = collect(stderr, chunk) })
      child.once('error', error => finish(() => reject(new WecomCliError(`无法启动企业微信 CLI：${error.message}`, 'failed'))))
      child.once('close', (code) => finish(() => {
        const output = stdout.trim()
        const diagnostic = stderr.trim()
        if (code !== 0) {
          const unauthorized = /unauthorized|未授权|auth init|登录|扫码/iu.test(`${output}\n${diagnostic}`)
          reject(new WecomCliError(
            unauthorized
              ? '当前账号尚未完成企业微信扫码授权。'
              : summarizeFailure(output || diagnostic || `退出码 ${String(code)}`),
            unauthorized ? 'unauthorized' : 'failed',
          ))
          return
        }
        try {
          resolve(parse(output))
        } catch (error) {
          reject(error instanceof WecomCliError
            ? error
            : new WecomCliError('企业微信 CLI 没有返回有效数据。', 'invalid-output'))
        }
      }))
      const timer = setTimeout(() => {
        child.kill('SIGKILL')
        finish(() => reject(new WecomCliError(`企业微信操作超过 ${this.config.wecomCliTimeoutMs} ms。`, 'timeout')))
      }, this.config.wecomCliTimeoutMs)
      timer.unref()
    })
  }
}

/** Account-scoped Enterprise WeChat CLI clients and QR authorization processes. */
export class WecomCliManager {
  private readonly clients = new Map<string, WecomCliClient>()
  private readonly authorizations = new Map<string, ChildProcess>()
  private readonly authorizationErrors = new Map<string, string>()

  constructor(private readonly config: Config) {}

  /** Return the isolated CLI client owned by one chatroom account. */
  client(participantId: string): WecomCliClient {
    const existing = this.clients.get(participantId)
    if (existing !== undefined) return existing
    const client = new WecomCliClient(this.config, this.accountDirectory(participantId))
    this.clients.set(participantId, client)
    return client
  }

  /** Return the former deployment account only for lifecycle records created before account isolation. */
  legacyClient(): WecomCliClient {
    return new WecomCliClient(this.config, this.legacySharedDirectory())
  }

  /** Read one account's authorization state without exposing credentials. */
  async authorizationState(participantId: string): Promise<WecomAuthorizationState> {
    if (!this.config.wecomEnabled) {
      return { enabled: false, status: 'unauthorized', qrAvailable: false, error: '企业微信能力已关闭。' }
    }
    const qrAvailable = await fileExists(this.qrPath(participantId))
    try {
      const status = String(await this.client(participantId).authStatus()).trim().toLowerCase()
      if (status === 'authorized') {
        this.authorizationErrors.delete(participantId)
        return { enabled: true, status: 'authorized', qrAvailable: false }
      }
    } catch (error) {
      if (!(error instanceof WecomCliError) || error.code !== 'unauthorized') {
        return {
          enabled: true,
          status: this.authorizations.has(participantId) ? 'pending' : 'unauthorized',
          qrAvailable,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    }
    const pending = this.authorizations.has(participantId)
    const authorizationError = this.authorizationErrors.get(participantId)
    return {
      enabled: true,
      status: pending ? 'pending' : 'unauthorized',
      qrAvailable,
      ...(authorizationError === undefined ? {} : { error: authorizationError }),
    }
  }

  /** Start one account's non-browser authorization and wait until its QR image exists. */
  async startAuthorization(participantId: string, restart = false): Promise<WecomAuthorizationState> {
    if (!this.config.wecomEnabled) throw new WecomCliError('企业微信能力已关闭。', 'disabled')
    const current = await this.authorizationState(participantId)
    if (current.status === 'authorized') return current
    if (restart) this.stopAuthorization(participantId)
    if (!this.authorizations.has(participantId)) await this.spawnAuthorization(participantId)
    const deadline = Date.now() + 15_000
    while (Date.now() < deadline) {
      if (await fileExists(this.qrPath(participantId))) return await this.authorizationState(participantId)
      if (!this.authorizations.has(participantId)) break
      await delay(150)
    }
    const state = await this.authorizationState(participantId)
    if (state.qrAvailable) return state
    throw new WecomCliError(state.error ?? '企业微信登录二维码生成超时。', 'timeout')
  }

  /** Read one account's authorization QR image. */
  async authorizationQr(participantId: string): Promise<Buffer> {
    try {
      return await readFile(this.qrPath(participantId))
    } catch {
      throw new WecomCliError('企业微信登录二维码尚未生成。', 'failed')
    }
  }

  /** Remove one account's authorization and stop its unfinished QR login. */
  async disconnectAuthorization(participantId: string): Promise<WecomAuthorizationState> {
    if (!this.config.wecomEnabled) throw new WecomCliError('企业微信能力已关闭。', 'disabled')
    this.stopAuthorization(participantId)
    const directory = this.accountDirectory(participantId)
    const resolved = resolve(directory)
    if (resolved === parse(resolved).root || resolved === resolve(homedir())) {
      throw new WecomCliError('企业微信授权目录配置过于宽泛，拒绝清除凭据。', 'failed')
    }
    await rm(directory, { recursive: true, force: true })
    await mkdir(directory, { recursive: true, mode: 0o700 })
    this.clients.delete(participantId)
    this.authorizationErrors.delete(participantId)
    return await this.authorizationState(participantId)
  }

  /** Stop outstanding authorization processes during plugin teardown. */
  stop(): void {
    for (const child of this.authorizations.values()) child.kill('SIGTERM')
    this.authorizations.clear()
  }

  private stopAuthorization(participantId: string): void {
    this.authorizations.get(participantId)?.kill('SIGTERM')
    this.authorizations.delete(participantId)
  }

  private async spawnAuthorization(participantId: string): Promise<void> {
    const directory = this.accountDirectory(participantId)
    await mkdir(directory, { recursive: true, mode: 0o700 })
    await mkdir(join(directory, 'tmp'), { recursive: true, mode: 0o700 })
    await unlink(this.qrPath(participantId)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error
    })
    this.authorizationErrors.delete(participantId)
    const cli = this.config.wecomCliPath || require.resolve('@wecom/cli/bin/wecom.js')
    const child = spawn(process.execPath, [cli, 'auth', 'init', '--noninteractive', '--no-browser', '--output-qrcode', 'auth-qrcode.png'], {
      cwd: directory,
      env: { ...process.env, WECOM_CLI_CONFIG_DIR: directory, WECOM_CLI_TMP_DIR: join(directory, 'tmp') },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })
    this.authorizations.set(participantId, child)
    let diagnostic = ''
    child.stdout?.on('data', (chunk: Buffer) => { diagnostic = `${diagnostic}${chunk.toString('utf8')}`.slice(-4_096) })
    child.stderr?.on('data', (chunk: Buffer) => { diagnostic = `${diagnostic}${chunk.toString('utf8')}`.slice(-4_096) })
    child.once('error', (error) => {
      if (this.authorizations.get(participantId) !== child) return
      this.authorizationErrors.set(participantId, `无法启动企业微信授权：${error.message}`)
      this.authorizations.delete(participantId)
    })
    child.once('close', (code) => {
      if (this.authorizations.get(participantId) !== child) return
      if (code !== 0 && code !== null) {
        this.authorizationErrors.set(participantId, summarizeFailure(diagnostic || `授权进程退出码 ${String(code)}`))
      }
      this.authorizations.delete(participantId)
    })
  }

  private accountDirectory(participantId: string): string {
    const configured = this.config.wecomCliConfigDirectory
    const base = configured !== '' ? configured : this.defaultBaseDirectory()
    const account = createHash('sha256').update(participantId).digest('hex').slice(0, 32)
    return join(base, 'accounts', account)
  }

  private legacySharedDirectory(): string {
    return this.config.wecomCliConfigDirectory !== ''
      ? this.config.wecomCliConfigDirectory
      : join(this.defaultBaseDirectory(), 'shared')
  }

  private defaultBaseDirectory(): string {
    return this.config.dataDirectory !== undefined && this.config.dataDirectory !== '' && this.config.dataDirectory !== ':memory:'
      ? join(this.config.dataDirectory, 'wecom-cli')
      : join(homedir(), '.dsh', 'chatroom', 'wecom-cli')
  }

  private qrPath(participantId: string): string {
    return join(this.accountDirectory(participantId), 'auth-qrcode.png')
  }
}

/** Infer one meeting or document card from an official CLI response. */
export function inferWecomCard(
  service: WecomService,
  method: string,
  parameters: unknown,
  result: unknown,
): ChatroomExternalCard | undefined {
  if (service === 'meeting') return meetingCard(method, parameters, result)
  if (service === 'doc' || service === 'sheet' || service === 'smartsheet' || service === 'smartpage') {
    return documentCard(service, parameters, result)
  }
  return undefined
}

function meetingCard(method: string, parameters: unknown, result: unknown): ChatroomMeetingCard | undefined {
  if (!/(?:create|get|update)$/u.test(method)) return undefined
  const title = firstString(result, ['subject', 'title', 'meeting_subject'])
    ?? firstString(parameters, ['subject', 'title'])
  if (title === undefined) return undefined
  const beginTime = firstString(result, ['begin_time', 'start_time']) ?? firstString(parameters, ['begin_time', 'start_time'])
  const endTime = firstString(result, ['end_time']) ?? firstString(parameters, ['end_time'])
  const url = firstUrl(result, ['meeting_url', 'join_url', 'url', 'meeting_link'])
  const location = firstString(result, ['location', 'meeting_room_name']) ?? firstString(parameters, ['location'])
  const status = firstString(result, ['status', 'meeting_status'])
  const attendees = stringArray(result, ['attendee_names', 'participant_names'])
  return {
    kind: 'meeting' as const,
    title,
    ...(beginTime === undefined ? {} : { beginTime }),
    ...(endTime === undefined ? {} : { endTime }),
    ...(url === undefined ? {} : { url }),
    ...(location === undefined ? {} : { location }),
    ...(status === undefined ? {} : { status }),
    ...(attendees === undefined ? {} : { attendees }),
  }
}

function documentCard(service: WecomService, parameters: unknown, result: unknown): ChatroomDocumentCard | undefined {
  const title = firstString(result, ['doc_name', 'name', 'title', 'file_name'])
    ?? firstString(parameters, ['doc_name', 'name', 'title'])
  const url = firstUrl(result, ['doc_url', 'url', 'share_url'])
    ?? firstUrl(parameters, ['doc_url', 'url', 'share_url', 'docid'])
  if (title === undefined || url === undefined) return undefined
  const documentType = firstString(result, ['doc_type', 'type']) ?? service
  const modifiedAt = firstString(result, ['update_time', 'modified_at', 'updated_at'])
  const owner = firstString(result, ['owner_name', 'creator_name'])
  return {
    kind: 'document' as const,
    title,
    documentType,
    url,
    ...(modifiedAt === undefined ? {} : { modifiedAt }),
    ...(owner === undefined ? {} : { owner }),
  }
}

function firstString(value: unknown, keys: readonly string[]): string | undefined {
  for (const record of records(value)) {
    for (const key of keys) {
      const candidate = record[key]
      if (typeof candidate === 'string' && candidate.trim() !== '') return candidate
    }
  }
  return undefined
}

function firstUrl(value: unknown, keys: readonly string[]): string | undefined {
  const candidate = firstString(value, keys)
  if (candidate === undefined) return undefined
  try {
    const url = new URL(candidate)
    return url.protocol === 'https:' ? candidate : undefined
  } catch {
    return undefined
  }
}

function stringArray(value: unknown, keys: readonly string[]): string[] | undefined {
  for (const record of records(value)) {
    for (const key of keys) {
      const candidate = record[key]
      if (Array.isArray(candidate) && candidate.every(item => typeof item === 'string')) return candidate
    }
  }
  return undefined
}

function records(value: unknown): Record<string, unknown>[] {
  const output: Record<string, unknown>[] = []
  const visit = (candidate: unknown, depth: number): void => {
    if (depth > 4 || candidate === null || typeof candidate !== 'object') return
    if (Array.isArray(candidate)) {
      for (const item of candidate.slice(0, 5)) visit(item, depth + 1)
      return
    }
    const record = candidate as Record<string, unknown>
    output.push(record)
    for (const nested of Object.values(record).slice(0, 20)) visit(nested, depth + 1)
  }
  visit(value, 0)
  return output
}

function joinCommand(service: WecomService, resource: readonly string[], method: string): string {
  return [service, ...resource, method].join('.')
}

function parseJson(output: string): unknown {
  if (output === '') return {}
  try {
    return JSON.parse(output) as unknown
  } catch {
    throw new WecomCliError('企业微信 CLI 没有返回有效 JSON。', 'invalid-output')
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function summarizeFailure(value: string): string {
  return [...value.replace(/\s+/gu, ' ').trim()].slice(0, 500).join('') || '企业微信操作失败。'
}
