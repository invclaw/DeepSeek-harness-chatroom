import { describe, expect, it, vi } from 'vitest'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { UiWorkspace } from '@deepseek-ai/dsh-client-ui-workspace/client'
import { installFreshSessionStart } from '../src/client/fresh-session.js'

describe('native New Session override', () => {
  it('creates distinct sessions through the native workspace navigation hook and restores it', async () => {
    const original = vi.fn()
    const navigation = { connectWorkspace: original } as Pick<UiWorkspace, 'connectWorkspace'>
    let id = 0
    const create = vi.fn(async () => ('fresh-' + ++id) as SessionId)
    const restore = installFreshSessionStart(navigation, create)
    expect(await navigation.connectWorkspace('workspace' as never)).toBe('fresh-1')
    expect(await navigation.connectWorkspace('workspace' as never)).toBe('fresh-2')
    expect(create).toHaveBeenCalledWith('workspace')
    expect(original).not.toHaveBeenCalled()
    restore()
    expect(navigation.connectWorkspace).toBe(original)
  })
  it('propagates creation failure and does not overwrite a later plugin hook on disposal', async () => {
    const navigation = { connectWorkspace: vi.fn() } as Pick<UiWorkspace, 'connectWorkspace'>
    const restore = installFreshSessionStart(navigation, vi.fn(async () => { throw new Error('creation failed') }))
    await expect(navigation.connectWorkspace('workspace' as never)).rejects.toThrow('creation failed')
    const later = vi.fn()
    navigation.connectWorkspace = later
    restore()
    expect(navigation.connectWorkspace).toBe(later)
  })
})
