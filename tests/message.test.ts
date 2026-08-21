import { describe, expect, it } from 'vitest'
import { isSlashCommand, mentionsAi } from '../src/message.js'

describe('human-first room messages', () => {
  it('requires an explicit generic or configured AI mention', () => {
    expect(mentionsAi([{ type: 'text', text: '大家先讨论一下' }], 'DeepSeek')).toBe(false)
    expect(mentionsAi([{ type: 'text', text: '@AI 请总结' }], 'DeepSeek')).toBe(true)
    expect(mentionsAi([{ type: 'text', text: '请 @deepseek 看一下' }], 'DeepSeek')).toBe(true)
    expect(mentionsAi([{ type: 'text', text: '@Aileen 你好' }], 'DeepSeek')).toBe(false)
  })

  it('keeps slash commands on the native Harness command path', () => {
    expect(isSlashCommand([{ type: 'text', text: '  /new' }])).toBe(true)
    expect(isSlashCommand([{ type: 'text', text: '普通消息 /new' }])).toBe(false)
    expect(isSlashCommand([{ type: 'image', mediaType: 'image/png', data: 'AA==' }])).toBe(false)
  })
})
