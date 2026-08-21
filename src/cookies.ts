/** Parse one Cookie header without decoding attacker-controlled escape sequences. */
export function cookieValue(header: string | undefined, name: string): string | undefined {
  if (header === undefined) return undefined
  for (const part of header.split(';')) {
    const index = part.indexOf('=')
    if (index < 0 || part.slice(0, index).trim() !== name) continue
    const value = part.slice(index + 1).trim()
    return /^[A-Za-z0-9_-]+$/u.test(value) ? value : undefined
  }
  return undefined
}

/** Build the persistent HttpOnly identity cookie. */
export function sessionCookie(name: string, token: string, maxAgeSeconds: number, path: string): string {
  return `${name}=${token}; Path=${path}; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Strict`
}

/** Expire the current browser identity. */
export function expiredSessionCookie(name: string, path: string): string {
  return `${name}=; Path=${path}; Max-Age=0; HttpOnly; SameSite=Strict`
}
