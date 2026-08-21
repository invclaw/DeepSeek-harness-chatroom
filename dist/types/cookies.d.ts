/** Parse one Cookie header without decoding attacker-controlled escape sequences. */
export declare function cookieValue(header: string | undefined, name: string): string | undefined;
/** Build the persistent HttpOnly identity cookie. */
export declare function sessionCookie(name: string, token: string, maxAgeSeconds: number, path: string): string;
/** Expire the current browser identity. */
export declare function expiredSessionCookie(name: string, path: string): string;
//# sourceMappingURL=cookies.d.ts.map