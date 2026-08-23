import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ConnectionHandle, IApiClient } from '@deepseek-ai/dsh-client-connection/client'
import { installRemoteConfigurationApi } from '../src/client/remote-configuration.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('remote model configuration client', () => {
  it('leaves the native loopback configuration plane untouched', () => {
    const { connection, api } = connectionFixture(true)
    const restore = installRemoteConfigurationApi(connection)
    expect(connection.api.settings).toBe(api.settings)
    expect(connection.api.credentials).toBe(api.credentials)
    expect(connection.api.llm).toBe(api.llm)
    restore()
  })

  it('routes remote settings through the chatroom API and restores every domain', async () => {
    const { connection, api } = connectionFixture(false)
    const originalSettings = api.settings
    const originalCredentials = api.credentials
    const originalLlm = api.llm
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (_input, init) => {
      const request = JSON.parse(String(init?.body)) as { rpcId: string }
      return new Response(JSON.stringify({
        type: 'server-response',
        rpcId: request.rpcId,
        result: { ok: true, value: { writable: true, hasDocument: false, namespaces: [] } },
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    })
    vi.stubGlobal('fetch', fetchMock)

    const restore = installRemoteConfigurationApi(connection)
    const response = await connection.api.settings.describe({})
    expect(response.result).toEqual({
      ok: true,
      value: { writable: true, hasDocument: false, namespaces: [] },
    })
    expect(fetchMock).toHaveBeenCalledWith(
      '/plugins/deepseek-harness-chatroom/api/configuration/settings.describe',
      expect.objectContaining({ method: 'POST', credentials: 'same-origin' }),
    )
    const sent = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as Record<string, unknown>
    expect(sent).toMatchObject({ type: 'client-request', method: 'settings.describe', payload: {} })

    restore()
    expect(connection.api.settings).toBe(originalSettings)
    expect(connection.api.credentials).toBe(originalCredentials)
    expect(connection.api.llm).toBe(originalLlm)
  })

  it('surfaces the administrator denial returned by the plugin', async () => {
    const { connection } = connectionFixture(false)
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response(
      JSON.stringify({ error: '当前聊天室身份没有模型设置管理权限。' }),
      { status: 403, headers: { 'content-type': 'application/json' } },
    )))
    installRemoteConfigurationApi(connection)
    await expect(connection.api.settings.describe({})).rejects.toThrow('当前聊天室身份没有模型设置管理权限。')
  })
})

function connectionFixture(isLoopback: boolean): { connection: ConnectionHandle, api: IApiClient } {
  const settings = {
    describe: vi.fn(), openDocument: vi.fn(), update: vi.fn(), replace: vi.fn(), mutate: vi.fn(),
  } as unknown as IApiClient['settings']
  const credentials = { describe: vi.fn(), set: vi.fn(), unset: vi.fn() } as unknown as IApiClient['credentials']
  const llm = { providers: vi.fn(), models: vi.fn(), discoverModels: vi.fn() } as unknown as IApiClient['llm']
  const api = { settings, credentials, llm } as unknown as IApiClient
  const connection = { api, isLoopback } as unknown as ConnectionHandle
  return { connection, api }
}
