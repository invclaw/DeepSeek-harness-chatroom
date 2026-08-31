import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
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

/** Structured failure returned by the Enterprise WeChat CLI adapter. */
export class WecomCliError extends Error {
  constructor(message: string, readonly code: 'disabled' | 'unauthorized' | 'timeout' | 'invalid-output' | 'failed') {
    super(message)
    this.name = 'WecomCliError'
  }
}

/** Lazy process adapter around the official `@wecom/cli` package. */
export class WecomCliClient {
  constructor(private readonly config: Config) {}

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
    return this.run(['auth', 'show', '--status'])
  }

  private run(args: readonly string[]): Promise<unknown> {
    if (!this.config.wecomEnabled) {
      return Promise.reject(new WecomCliError('企业微信能力已在插件配置中关闭。', 'disabled'))
    }
    const cli = this.config.wecomCliPath || require.resolve('@wecom/cli/bin/wecom.js')
    const environment = {
      ...process.env,
      ...(this.config.wecomCliConfigDirectory === '' ? {} : { WECOM_CLI_CONFIG_DIR: this.config.wecomCliConfigDirectory }),
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
              ? '企业微信尚未授权，请在部署机运行 wecom-cli auth init 完成扫码登录。'
              : summarizeFailure(output || diagnostic || `退出码 ${String(code)}`),
            unauthorized ? 'unauthorized' : 'failed',
          ))
          return
        }
        if (output === '') {
          resolve({})
          return
        }
        try {
          resolve(JSON.parse(output) as unknown)
        } catch {
          reject(new WecomCliError('企业微信 CLI 没有返回有效 JSON。', 'invalid-output'))
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

function summarizeFailure(value: string): string {
  return [...value.replace(/\s+/gu, ' ').trim()].slice(0, 500).join('') || '企业微信操作失败。'
}
