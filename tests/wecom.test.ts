import { createHash } from 'node:crypto'
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

  it('isolates account credentials and leaves the former shared credential untouched', async () => {
    const root = await mkdtemp(join(tmpdir(), 'chatroom-wecom-'))
    const accountDirectory = (participantId: string): string => join(
      root,
      'wecom-cli',
      'accounts',
      createHash('sha256').update(participantId).digest('hex').slice(0, 32),
    )
    const alice = accountDirectory('alice-id')
    const shared = join(root, 'wecom-cli', 'shared')
    await mkdir(alice, { recursive: true })
    await mkdir(shared, { recursive: true })
    await writeFile(join(alice, 'credentials.enc'), 'alice credentials')
    await writeFile(join(shared, 'credentials.enc'), 'former shared credentials')
    const manager = new WecomCliManager({
      wecomEnabled: true,
      wecomCliPath: fileURLToPath(new URL('fixtures/fake-wecom-cli.mjs', import.meta.url)),
      wecomCliConfigDirectory: '',
      wecomCliTimeoutMs: 5_000,
      dataDirectory: root,
    } as Config)

    await expect(manager.authorizationState('alice-id')).resolves.toMatchObject({ status: 'authorized', qrAvailable: false })
    await expect(manager.authorizationState('bob-id')).resolves.toMatchObject({ status: 'unauthorized', qrAvailable: false })
    await expect(manager.legacyClient().authStatus()).resolves.toBe('authorized')
    await expect(manager.disconnectAuthorization('bob-id')).resolves.toMatchObject({ status: 'unauthorized', qrAvailable: false })
    await expect(readFile(join(alice, 'credentials.enc'), 'utf8')).resolves.toBe('alice credentials')
    await expect(readFile(join(shared, 'credentials.enc'), 'utf8')).resolves.toBe('former shared credentials')
    await expect(manager.disconnectAuthorization('alice-id')).resolves.toMatchObject({ status: 'unauthorized', qrAvailable: false })
    await expect(readFile(join(alice, 'credentials.enc'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
    manager.stop()

    const restarted = new WecomCliManager({
      wecomEnabled: true,
      wecomCliPath: fileURLToPath(new URL('fixtures/fake-wecom-cli.mjs', import.meta.url)),
      wecomCliConfigDirectory: '',
      wecomCliTimeoutMs: 5_000,
      dataDirectory: root,
    } as Config)
    await expect(restarted.authorizationState('alice-id')).resolves.toMatchObject({ status: 'unauthorized' })
    await expect(restarted.legacyClient().authStatus()).resolves.toBe('authorized')
  })

  it('keeps simultaneous QR authorization files inside their owning account directories', async () => {
    const root = await mkdtemp(join(tmpdir(), 'chatroom-wecom-auth-'))
    const accountDirectory = (participantId: string): string => join(
      root,
      'wecom-cli',
      'accounts',
      createHash('sha256').update(participantId).digest('hex').slice(0, 32),
    )
    const manager = new WecomCliManager({
      wecomEnabled: true,
      wecomCliPath: fileURLToPath(new URL('fixtures/fake-wecom-cli.mjs', import.meta.url)),
      wecomCliConfigDirectory: '',
      wecomCliTimeoutMs: 5_000,
      dataDirectory: root,
    } as Config)

    await expect(Promise.all([
      manager.startAuthorization('alice-id'),
      manager.startAuthorization('bob-id'),
    ])).resolves.toEqual([
      expect.objectContaining({ status: 'pending', qrAvailable: true }),
      expect.objectContaining({ status: 'pending', qrAvailable: true }),
    ])
    await expect(manager.authorizationQr('alice-id')).resolves.not.toHaveLength(0)
    await expect(manager.authorizationQr('bob-id')).resolves.not.toHaveLength(0)
    await writeFile(join(accountDirectory('alice-id'), 'credentials.enc'), 'alice credentials')
    await expect(manager.authorizationState('alice-id')).resolves.toMatchObject({ status: 'authorized' })
    await expect(manager.authorizationState('bob-id')).resolves.toMatchObject({ status: 'pending' })
    manager.stop()
  })
})
