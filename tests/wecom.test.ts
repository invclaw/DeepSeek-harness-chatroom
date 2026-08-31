import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { Config } from '../src/config.js'
import { inferWecomCard, WecomCliClient, WecomCliError, WecomCliManager } from '../src/wecom.js'

describe('official Enterprise WeChat CLI adapter', () => {
  it('does not spawn the CLI when the capability is disabled', async () => {
    const client = new WecomCliClient({ wecomEnabled: false } as Config)
    await expect(client.invoke('meeting', [], 'list', {})).rejects.toEqual(
      expect.objectContaining<Partial<WecomCliError>>({ code: 'disabled' }),
    )
  })

  it('projects meeting and document results into native room cards', () => {
    expect(inferWecomCard('meeting', 'create', { subject: '周会' }, {
      meeting_url: 'https://meeting.example.com/join', begin_time: '2026-09-01 10:00:00',
    })).toEqual({
      kind: 'meeting', title: '周会', beginTime: '2026-09-01 10:00:00', url: 'https://meeting.example.com/join',
    })
    expect(inferWecomCard('smartpage', 'create', { title: '复盘' }, {
      doc_url: 'https://doc.example.com/page', owner_name: 'Alice',
    })).toEqual({
      kind: 'document', title: '复盘', documentType: 'smartpage', url: 'https://doc.example.com/page', owner: 'Alice',
    })
  })

  it('migrates the only authorized legacy account into one deployment-shared credential directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'chatroom-wecom-'))
    const legacy = join(root, 'wecom-cli', 'accounts', 'legacy-account')
    await mkdir(legacy, { recursive: true })
    await writeFile(join(legacy, 'credentials.enc'), 'encrypted credentials')
    await writeFile(join(legacy, '.encryption_key'), 'encryption key')
    const manager = new WecomCliManager({
      wecomEnabled: true,
      wecomCliPath: fileURLToPath(new URL('fixtures/fake-wecom-cli.mjs', import.meta.url)),
      wecomCliConfigDirectory: '',
      wecomCliTimeoutMs: 5_000,
      dataDirectory: root,
    } as Config)

    await expect(manager.authorizationState()).resolves.toMatchObject({ status: 'authorized', qrAvailable: false })
    await expect(readFile(join(root, 'wecom-cli', 'shared', 'credentials.enc'), 'utf8')).resolves.toBe('encrypted credentials')
    await expect(manager.disconnectAuthorization()).resolves.toMatchObject({ status: 'unauthorized', qrAvailable: false })
    await expect(readFile(join(root, 'wecom-cli', 'shared', 'credentials.enc'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
    manager.stop()

    const restarted = new WecomCliManager({
      wecomEnabled: true,
      wecomCliPath: fileURLToPath(new URL('fixtures/fake-wecom-cli.mjs', import.meta.url)),
      wecomCliConfigDirectory: '',
      wecomCliTimeoutMs: 5_000,
      dataDirectory: root,
    } as Config)
    await expect(restarted.authorizationState()).resolves.toMatchObject({ status: 'unauthorized' })
  })
})
