import { describe, expect, it } from 'vitest'
import { automaticAuthRedirect } from '../src/auth-redirect.js'
import type { ChatroomAuthState } from '../src/types.js'

const prefix = '/plugins/deepseek-harness-chatroom/api'
const provider = { id: 'company', type: 'oidc' as const, label: '企业统一登录' }

describe('automatic authentication redirect', () => {
  it('sends ordinary unauthenticated entry to the configured provider', () => {
    expect(automaticAuthRedirect(
      prefix,
      state({ autoRedirectProvider: provider }),
      '/workspace?tab=chat',
      new URL('https://chat.example.com/auth/page'),
    )).toBe(`${prefix}/auth/oidc/company/start?returnTo=%2Fworkspace%3Ftab%3Dchat`)
  })

  it('retains local login for bootstrap and either local recovery switch', () => {
    expect(automaticAuthRedirect(
      prefix,
      state({ autoRedirectProvider: provider, bootstrapRequired: true }),
      '/',
      new URL('https://chat.example.com/auth/page'),
    )).toBeUndefined()
    expect(automaticAuthRedirect(
      prefix,
      state({ autoRedirectProvider: provider }),
      '/',
      new URL('https://chat.example.com/auth/page?local=1'),
    )).toBeUndefined()
    expect(automaticAuthRedirect(
      prefix,
      state({ autoRedirectProvider: provider }),
      '/workspace?local=1',
      new URL('https://chat.example.com/auth/page'),
    )).toBeUndefined()
  })
})

function state(patch: Partial<ChatroomAuthState>): ChatroomAuthState {
  return {
    enabled: true,
    authenticated: false,
    providers: [provider],
    allowSelfRegistration: false,
    bootstrapRequired: false,
    ...patch,
  }
}
