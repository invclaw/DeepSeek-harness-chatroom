import { describe, expect, it } from 'vitest'
import { validateConfig, type Config } from '../src/config.js'
import { cookieValue, expiredSessionCookie, sessionCookie } from '../src/cookies.js'
import {
  CHATROOM_API_PREFIX,
  LEGACY_CHATROOM_API_PREFIX,
  matchChatroomApi,
} from '../src/routes.js'

describe('chatroom configuration and identity cookie', () => {
  it('uses a path-scoped persistent HttpOnly cookie', () => {
    expect(sessionCookie('room_session', 'abc_DEF-123', 600, '/plugins/deepseek-harness-chatroom/api')).toBe(
      'room_session=abc_DEF-123; Path=/plugins/deepseek-harness-chatroom/api; Max-Age=600; HttpOnly; SameSite=Strict',
    )
    expect(expiredSessionCookie('room_session', '/plugins/deepseek-harness-chatroom/api')).toContain('Max-Age=0')
    expect(cookieValue('unrelated=x; room_session=abc_DEF-123', 'room_session')).toBe('abc_DEF-123')
    expect(cookieValue('room_session=%0Aunsafe', 'room_session')).toBeUndefined()
  })

  it('rejects a relative working directory', () => {
    const config = validConfig()
    expect(() => validateConfig({ ...config, cwd: 'relative' })).toThrow('cwd must be absolute')
    expect(() => validateConfig(config)).not.toThrow()
  })

  it('accepts the proxied plugin API prefix and the direct-deployment alias', () => {
    expect(matchChatroomApi(`${CHATROOM_API_PREFIX}/health`)).toEqual({
      prefix: CHATROOM_API_PREFIX,
      endpoint: '/health',
    })
    expect(matchChatroomApi(`${LEGACY_CHATROOM_API_PREFIX}/session`)).toEqual({
      prefix: LEGACY_CHATROOM_API_PREFIX,
      endpoint: '/session',
    })
    expect(matchChatroomApi('/plugins/deepseek-harness-chatroom/client.js')).toBeUndefined()
  })
})

function validConfig(): Config {
  return {
    roomId: 'lobby', roomTitle: 'AI 聊天室', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-lobby',
    cwd: '/tmp', agentPreset: 'standard', cookieName: 'room_session', cookieMaxAgeSeconds: 600,
    maxDisplayNameChars: 24, maxRoomTitleChars: 80, maxMessageTextChars: 20_000,
    maxFileBytes: 20 * 1024 * 1024, maxFilesPerMessage: 5, maxMessageFileBytes: 50 * 1024 * 1024,
    maxImageSidePixels: 4_096,
    sseHeartbeatMs: 15_000,
  }
}
