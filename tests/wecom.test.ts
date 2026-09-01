import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Config } from '../src/config.js'
import { inferWecomCard, WecomCliClient, WecomCliError, WecomCliManager } from '../src/wecom.js'
import { documentTitleFromHtml, fetchTencentDocumentTitle, normalizeDocumentTitle, parseWecomDocumentUrl } from '../src/wecom-document.js'

afterEach(() => { vi.unstubAllGlobals() })

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
    expect(inferWecomCard('doc', 'get', { docid: 'https://docs.qq.com/doc/DT2JxRE5xd3JPRVh6' }, {
      name: '项目复盘',
    })).toEqual({
      kind: 'document', title: '项目复盘', documentType: 'doc', url: 'https://docs.qq.com/doc/DT2JxRE5xd3JPRVh6',
    })
  })

  it('accepts only recognized Tencent Docs HTTPS URLs for metadata lookup', () => {
    expect(parseWecomDocumentUrl('https://docs.qq.com/doc/DT2JxRE5xd3JPRVh6')).toMatchObject({ service: 'doc', source: 'tencent-docs' })
    expect(parseWecomDocumentUrl('https://docs.qq.com/aio/DYnhEWFJhekJVS3RB')).toMatchObject({ service: 'smartpage', source: 'tencent-docs' })
    expect(parseWecomDocumentUrl('https://doc.weixin.qq.com/doc/a1_project')).toMatchObject({
      service: 'doc', source: 'wecom', documentId: 'a1_project',
    })
    expect(parseWecomDocumentUrl('http://docs.qq.com/doc/not-secure')).toBeUndefined()
    expect(parseWecomDocumentUrl('https://attacker.example/doc/DT2JxRE5xd3JPRVh6')).toBeUndefined()
  })

  it('extracts a real Tencent Docs title and safely ignores unavailable metadata', async () => {
    expect(documentTitleFromHtml('<title>Lighthouse 发布清单 - 腾讯文档</title>')).toBe('Lighthouse 发布清单')
    expect(documentTitleFromHtml('<meta property="og:title" content="研发周报 &amp; 计划">')).toBe('研发周报 & 计划')
    expect(documentTitleFromHtml('<title>腾讯文档</title>')).toBeUndefined()
    expect(normalizeDocumentTitle('腾讯文档 · 在线文档')).toBeUndefined()

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(
      '<html><head><title>Lighthouse 发布清单 | 腾讯文档</title></head></html>',
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    ))
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchTencentDocumentTitle('https://docs.qq.com/doc/DT2JxRE5xd3JPRVh6')).resolves.toBe('Lighthouse 发布清单')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://docs.qq.com/doc/DT2JxRE5xd3JPRVh6',
      expect.objectContaining({ redirect: 'manual' }),
    )

    fetchMock.mockRejectedValueOnce(new Error('blocked'))
    await expect(fetchTencentDocumentTitle('https://docs.qq.com/doc/DT2JxRE5xd3JPRVh6')).resolves.toBeUndefined()
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
