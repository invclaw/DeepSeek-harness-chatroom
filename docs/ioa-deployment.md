# IOA / dsh-auth deployment notes

The open-source bundle keeps `authMode: local` and built-in avatars by default. A managed IOA deployment should inject, outside Git, values equivalent to:

```yaml
authEnabled: true
authMode: dsh-auth-only
authPublicOrigin: https://chat.example.com
authDshAuthLoginPath: /auth/login/external
authAllowSelfRegistration: false
authDshAuthVerifyUrl: http://127.0.0.1:3080/auth/verify
authDshAuthSuperAdminSubjects: [alice]
authDshAuthRevalidateSeconds: 60
authDshAuthAvatarUrlTemplate: https://avatars.example.com/{username}.png
authDshAuthAvatarAllowedOrigins: [https://avatars.example.com]
```

Do not commit IOA tokens, cookies, or application secrets. Keep Chatroom's `authSecret` in a separate
0600 deployment secret (not the dsh-auth session secret). `dsh-auth` owns IOA verification and emits
the standard `X-Dsh-Auth-*` identity headers; Chatroom uses the stable subject for account mapping and
ignores the edge `admin` role. Renewal cookies returned by the loopback verifier are forwarded to the browser.

Keep private avatar-service endpoints and approval references in the deployment runbook, not in the open-source configuration. If approval is unavailable, leave the template empty; the UI continues with built-in avatars.

For rollback, clear the avatar template and switch to `authMode: hybrid` or `local`. Existing external account links remain stable; only the authentication edge changes.

## Native transport authorization

This local `1.4.4-codex.rc1.4` build is pinned to Harness `0.1.2-rc.1`; it is not an upstream release. The Chatroom bundle disables the profile's original `connection` entry and mounts account-authorized `/api` HTTP routes and `/api/remote.mux`. The official Gateway remains active with an isolated `webServer`, preserving its protocol and client module without an unguarded WebSocket listener. Do not re-enable a second native transport or install older Harness peers alongside this build. Other Harness cohorts require a fresh compatibility check.

For a shared LAN installation, use a dedicated `DSH_HOME` and workspace rather than exposing a private profile's Sessions, MCP credentials, and unrelated plugin APIs. Each person signs in with a distinct account; the group owner adds existing accounts from Group management. A trusted-LAN HTTP endpoint does not encrypt passwords or messages. Use a TLS reverse proxy and an HTTPS `authPublicOrigin` for untrusted networks or Internet access.

An edge `forward_auth` check establishes login, not room membership. Chatroom verifies the account and Session ownership on HTTP requests and outgoing WebSocket frames, including expiry and disabled-account revocation. The edge should still protect private static assets and other plugins' endpoints. Keep the Host bound to loopback behind the authenticated TLS proxy.

Set `authPublicOrigin` to the public origin. `nativeTrustedHosts` inherits the Web profile's trusted hosts through the bundle; extend it only for explicit additional deployment hostnames. Native request bodies are limited by `nativeMaxRequestBytes` (314572800 by default), separately from Chatroom upload limits. Forward `Host`, `Origin`, cookies, and WebSocket upgrade headers without accepting client-supplied identity headers as verified identity.
