import { describe, expect, it } from 'vitest'
import { validateConfig, type Config } from '../src/config.js'
import { cookieValue, expiredSessionCookie, sessionCookie } from '../src/cookies.js'

describe('chatroom configuration and identity cookie', () => {
  it('uses a path-scoped persistent HttpOnly cookie', () => {
    expect(sessionCookie('room_session', 'abc_DEF-123', 600)).toBe(
      'room_session=abc_DEF-123; Path=/chatroom/api; Max-Age=600; HttpOnly; SameSite=Strict',
    )
    expect(expiredSessionCookie('room_session')).toContain('Max-Age=0')
    expect(cookieValue('unrelated=x; room_session=abc_DEF-123', 'room_session')).toBe('abc_DEF-123')
    expect(cookieValue('room_session=%0Aunsafe', 'room_session')).toBeUndefined()
  })

  it('rejects a relative working directory and an implicit silence decision', () => {
    const config = validConfig()
    expect(() => validateConfig({ ...config, cwd: 'relative' })).toThrow('cwd must be absolute')
    expect(() => validateConfig({ ...config, systemPrompt: '普通提示' })).toThrow('must contain noReplyToken')
    expect(() => validateConfig(config)).not.toThrow()
  })
})

function validConfig(): Config {
  return {
    roomId: 'lobby', roomTitle: 'AI 聊天室', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-lobby',
    cwd: '/tmp', agentPreset: 'standard', cookieName: 'room_session', cookieMaxAgeSeconds: 600,
    maxDisplayNameChars: 24, maxMessageChars: 4_000, responseTimeoutMs: 180_000,
    aiRetryDelayMs: 5_000, sseHeartbeatMs: 15_000, noReplyToken: '<CHATROOM_NO_REPLY>',
    systemPrompt: '保持自然；无需回复时输出 <CHATROOM_NO_REPLY>',
  }
}
