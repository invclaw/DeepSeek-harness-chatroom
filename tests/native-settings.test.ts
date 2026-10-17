import { Context } from '@deepseek-ai/cordis'
import * as cordis from '@deepseek-ai/cordis'
import * as store from '@deepseek-ai/dsh-client-store'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { describe, expect, it, vi } from 'vitest'
import { embeddedNativeSettings } from '../scripts/native-settings.mjs'
import { canManageNativeSettings } from '../src/settings-access.js'
import type { Config } from '../src/config.js'

// Execute the exact adapted upstream factory, including its real mirror and forms.
const native = new Function('require', `${embeddedNativeSettings()}; return nativeSettings`)((id: string) => {
  if (id === '@deepseek-ai/cordis') return cordis
  if (id === '@deepseek-ai/dsh-client-store') return store
  throw new Error(`Unexpected native dependency ${id}`)
}) as { apply(ctx: Context): void; inject: string[] }

describe('managed native settings on a domain', () => {
  it.each([true, false])('loads Host settings only for an authorized browser (%s)', async canManage => {
    const ctx = new Context()
    const listeners = new Map<string, () => void>()
    const namespace = { ns: 'ui-settings', revision: 7, value: { enabled: true }, base: {}, user: {}, schema: { type: 'object', dict: { enabled: { type: 'boolean', meta: {} } }, meta: {} } }
    const describe = vi.fn(async () => ({ ok: true, value: { writable: true, namespaces: [namespace] } }))
    const mutate = vi.fn(async () => ({ ok: true, value: { ...namespace, revision: 8, value: { enabled: false } } }))
    const host = Object.freeze({ isLoopback: false })
    ctx.provide('remote', { $host: host, settings: { describe, mutate }, $on: (event: string, listener: () => void) => { listeners.set(event, listener); return () => listeners.delete(event) } } as never)
    ctx.provide('remote.settings', { describe, mutate } as never)
    ctx.provide('chatroomClientCapabilities', { canManage })
    const fork = ctx.plugin(native)
    try {
      await vi.waitFor(() => expect(ctx.get('configForms')).toBeDefined())
      const forms = ctx.get('configForms')!
      await forms.describe().ensure()
      expect(forms.get('ui-settings').getSnapshot().mode).toBe(canManage ? 'host' : 'memory')
      expect(forms.describe().getSnapshot().status).toBe(canManage ? 'ready' : 'unavailable')
      expect(describe).toHaveBeenCalledTimes(canManage ? 1 : 0)
      if (canManage) {
        expect(await forms.get('ui-settings').set('enabled', false)).toBe(true)
        expect(mutate).toHaveBeenCalledWith('ui-settings', [{ op: 'set', path: ['enabled'], value: false }], 7)
        listeners.get('settings/document-updated')!()
        await vi.waitFor(() => expect(describe).toHaveBeenCalledTimes(2))
      } else {
        expect(await forms.get('ui-settings').set('enabled', false)).toBe(false)
        expect(mutate).not.toHaveBeenCalled()
      }
      expect(host.isLoopback).toBe(false)
    } finally { await fork.dispose() }
  })
  it('uses the same server authority for capabilities and settings requests', () => {
    const config = { authEnabled: true, settingsAdminParticipantIds: ['operator'] } as Config
    const member = { participantId: 'member', displayName: 'Member', avatarId: 'whale' as const }
    expect(canManageNativeSettings(config, null)).toBe(false)
    expect(canManageNativeSettings(config, member)).toBe(false)
    expect(canManageNativeSettings(config, { ...member, participantId: 'operator' })).toBe(true)
    expect(canManageNativeSettings(config, { ...member, role: 'super-admin' } as never)).toBe(true)
    expect(canManageNativeSettings({ ...config, authEnabled: false }, null)).toBe(true)
  })
})
