import { describe, expect, it, vi } from 'vitest'
import { activateRemoteSettingsMirror, mountAfterNativeMessageView } from '../src/client/index.js'

describe('chatroom client load order', () => {
  it('waits for the native renderer and remounts when it is replaced', () => {
    let native: object | undefined
    let changed = (): void => undefined
    const mounted: object[] = []
    const disposed: object[] = []
    const first = {}
    const second = {}
    const unsubscribe = vi.fn()
    const stop = mountAfterNativeMessageView(
      () => native,
      listener => { changed = listener; return unsubscribe },
      value => {
        mounted.push(value)
        return () => { disposed.push(value) }
      },
    )

    expect(mounted).toEqual([])
    native = first
    changed()
    expect(mounted).toEqual([first])
    native = second
    changed()
    expect(mounted).toEqual([first, second])
    expect(disposed).toEqual([first])

    stop()
    expect(unsubscribe).toHaveBeenCalledOnce()
    expect(disposed).toEqual([first, second])
  })

  it('activates and restores RC8 remote settings mirror persistence', () => {
    const load = vi.fn(async () => undefined)
    const mirror = { persistence: 'memory' as 'host' | 'memory', load }
    const restore = activateRemoteSettingsMirror({ describe: () => mirror })
    expect(mirror.persistence).toBe('host')
    expect(load).toHaveBeenCalledOnce()
    restore()
    expect(mirror.persistence).toBe('memory')
  })

  it('leaves an already host-backed or older settings scope untouched', () => {
    const load = vi.fn(async () => undefined)
    const mirror = { persistence: 'host' as 'host' | 'memory', load }
    activateRemoteSettingsMirror({ describe: () => mirror })()
    activateRemoteSettingsMirror({})()
    expect(mirror.persistence).toBe('host')
    expect(load).not.toHaveBeenCalled()
  })
})
