import type { ConnectionHandle, IApiClient } from '@deepseek-ai/dsh-client-connection/client'
import { CHATROOM_API_PREFIX } from '../routes.js'

type MutableApiClient = {
  -readonly [Key in keyof IApiClient]: IApiClient[Key]
}

type AsyncResult<Method> = Method extends (...args: infer _Args) => Promise<infer Result> ? Result : never

/** Route the RC7 configuration plane through the authenticated chatroom API for remote browsers. */
export function installRemoteConfigurationApi(connection: ConnectionHandle): () => void {
  if (connection.isLoopback) return () => undefined
  const api = connection.api as MutableApiClient
  const originalSettings = api.settings
  const originalCredentials = api.credentials
  const originalLlm = api.llm

  const settings: IApiClient['settings'] = {
    describe: (payload, signal) => remoteCall<AsyncResult<IApiClient['settings']['describe']>>('settings.describe', payload, signal),
    openDocument: originalSettings.openDocument,
    update: (payload, signal) => remoteCall<AsyncResult<IApiClient['settings']['update']>>('settings.update', payload, signal),
    replace: (payload, signal) => remoteCall<AsyncResult<IApiClient['settings']['replace']>>('settings.replace', payload, signal),
    mutate: (payload, signal) => remoteCall<AsyncResult<IApiClient['settings']['mutate']>>('settings.mutate', payload, signal),
  }
  const credentials: IApiClient['credentials'] = {
    describe: (payload, signal) => remoteCall<AsyncResult<IApiClient['credentials']['describe']>>('credentials.describe', payload, signal),
    set: (payload, signal) => remoteCall<AsyncResult<IApiClient['credentials']['set']>>('credentials.set', payload, signal),
    unset: (payload, signal) => remoteCall<AsyncResult<IApiClient['credentials']['unset']>>('credentials.unset', payload, signal),
  }
  const llm: IApiClient['llm'] = {
    ...originalLlm,
    discoverModels: (payload, signal) => remoteCall<AsyncResult<IApiClient['llm']['discoverModels']>>('llm.discoverModels', payload, signal),
  }
  api.settings = settings
  api.credentials = credentials
  api.llm = llm

  return () => {
    if (api.settings === settings) api.settings = originalSettings
    if (api.credentials === credentials) api.credentials = originalCredentials
    if (api.llm === llm) api.llm = originalLlm
  }
}

async function remoteCall<Result>(method: string, payload: unknown, signal?: AbortSignal): Promise<Result> {
  const rpcId = crypto.randomUUID()
  const response = await fetch(`${CHATROOM_API_PREFIX}/configuration/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'client-request', rpcId, method, payload }),
    credentials: 'same-origin',
    ...(signal === undefined ? {} : { signal }),
  })
  if (!response.ok) throw new Error(await configurationError(response))
  const envelope = configurationEnvelope(await response.json())
  if (envelope.rpcId !== rpcId) {
    throw new Error(`远程模型设置响应编号不匹配：发送 ${rpcId}，收到 ${String(envelope.rpcId)}`)
  }
  return { rpcId: envelope.rpcId, result: envelope.result } as Result
}

function configurationEnvelope(value: unknown): { rpcId: string, result: object } {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('远程模型设置响应格式无效。')
  }
  const envelope = value as Record<string, unknown>
  if (envelope.type !== 'server-response' || typeof envelope.rpcId !== 'string'
    || envelope.result === null || typeof envelope.result !== 'object' || Array.isArray(envelope.result)) {
    throw new Error('远程模型设置响应格式无效。')
  }
  const result = envelope.result as Record<string, unknown>
  if (result.ok !== true && result.ok !== false) throw new Error('远程模型设置响应格式无效。')
  return { rpcId: envelope.rpcId, result }
}

async function configurationError(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json()
    if (payload !== null && typeof payload === 'object' && !Array.isArray(payload)) {
      const error = (payload as Record<string, unknown>).error
      if (typeof error === 'string' && error !== '') return error
    }
  } catch {
    // Only an error response body is ignored; its HTTP status remains available below.
  }
  return `远程模型设置请求失败：HTTP ${response.status}`
}
