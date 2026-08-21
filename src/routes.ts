/** Canonical API prefix carried through the Host's existing plugin proxy route. */
export const CHATROOM_API_PREFIX = '/plugins/deepseek-harness-chatroom/api'

/** Original API prefix retained for direct Harness Web deployments. */
export const LEGACY_CHATROOM_API_PREFIX = '/chatroom/api'

/** Every Host prefix accepted by the chatroom HTTP adapter. */
export const CHATROOM_API_PREFIXES = [CHATROOM_API_PREFIX, LEGACY_CHATROOM_API_PREFIX] as const

/** Resolve a request pathname to its matched chatroom API prefix and endpoint. */
export function matchChatroomApi(pathname: string): { prefix: string, endpoint: string } | undefined {
  for (const prefix of CHATROOM_API_PREFIXES) {
    if (pathname === prefix) return { prefix, endpoint: '' }
    if (pathname.startsWith(`${prefix}/`)) return { prefix, endpoint: pathname.slice(prefix.length) }
  }
  return undefined
}
