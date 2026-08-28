import type { ChatroomAuthProvider, ChatroomAuthState } from './types.js'

/** Build the plugin-owned start route for one external identity provider. */
export function authProviderStartLocation(
  prefix: string,
  provider: ChatroomAuthProvider,
  returnTo: string,
): string {
  const route = provider.type === 'oidc'
    ? `${prefix}/auth/oidc/${encodeURIComponent(provider.id)}/start`
    : `${prefix}/auth/dsh-auth/start`
  return `${route}?returnTo=${encodeURIComponent(returnTo)}`
}

/** Resolve an immediate SSO redirect while preserving bootstrap and local-login recovery. */
export function automaticAuthRedirect(
  prefix: string,
  state: ChatroomAuthState,
  returnTo: string,
  requestUrl: URL,
): string | undefined {
  if (state.bootstrapRequired || state.autoRedirectProvider === undefined) return undefined
  if (state.authMode !== 'dsh-auth-only' && localLoginRequested(requestUrl, returnTo)) return undefined
  return authProviderStartLocation(prefix, state.autoRedirectProvider, returnTo)
}

/** Detect the local recovery switch on either the auth page or original application URL. */
export function localLoginRequested(requestUrl: URL, returnTo: string): boolean {
  if (requestUrl.searchParams.get('local') === '1') return true
  return new URL(returnTo, 'http://chatroom.local').searchParams.get('local') === '1'
}
