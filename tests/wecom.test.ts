import { describe, expect, it } from 'vitest'
import type { Config } from '../src/config.js'
import { inferWecomCard, WecomCliClient, WecomCliError } from '../src/wecom.js'

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
})
