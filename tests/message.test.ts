import { describe, expect, it } from 'vitest'
import {
  identifyForwardText,
  identifyPrompt,
  isSlashCommand,
  mentionsAi,
  projectForwardText,
} from '../src/message.js'

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

  it('identifies pure attachments without adding a visible placeholder', () => {
    const identity = { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' as const }
    expect(identifyPrompt([{
      type: 'file', name: 'note.txt', mediaType: 'text/plain', data: 'aGVsbG8=',
    }], identity)).toEqual([
      { type: 'text', text: '\u2063dsh-chatroom:alice-id|whale\u2063Alice：' },
      { type: 'file', name: 'note.txt', mediaType: 'text/plain', data: 'aGVsbG8=' },
    ])
  })

  it('round-trips merged-forward metadata while retaining a readable model transcript', () => {
    const bundle = {
      sourceRoomId: 'lobby',
      sourceRoomTitle: '大厅',
      items: [{
        messageId: 'user:1', role: 'human' as const, displayName: 'Alice', text: '你好', createdAt: 1,
      }],
    }
    const identified = identifyForwardText(bundle)
    expect(identified).toContain('合并转发（1 条）\nAlice：你好')
    expect(projectForwardText(identified)).toEqual({ text: '', forward: bundle })
  })
})
