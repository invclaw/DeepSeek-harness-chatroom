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

The Chatroom bundle disables the profile's original `connection` entry, reuses the native Connection/Gateway registries internally, and owns the public `/api` HTTP authorization and `/api/remote.mux` WebSocket carrier. Keep this replacement enabled when upgrading; a second native transport must not expose an unguarded route. This release targets Harness 0.2.0-rc.2. Keep dsh-auth's `DSH_AUTH_NATIVE_AUTH_BRIDGE=false`: native operator admission cannot enforce multi-user room ownership.

An edge `forward_auth` check establishes login, not room membership. Chatroom verifies the account and Session ownership on HTTP requests and outgoing WebSocket frames, including expiry and disabled-account revocation. The edge should still protect private static assets and other plugins' endpoints. Keep the Host bound to loopback behind the authenticated TLS proxy.

Set `authPublicOrigin` to the public origin. `nativeTrustedHosts` inherits the Web profile's trusted hosts through the bundle; extend it only for explicit additional deployment hostnames. Native request bodies are limited by `nativeMaxRequestBytes` (314572800 by default), separately from Chatroom upload limits. Forward `Host`, `Origin`, cookies, and WebSocket upgrade headers without accepting client-supplied identity headers as verified identity.

### Native settings on authenticated domain URLs

DSH RC.2 normally keeps non-loopback browser settings in memory. To enable the
native model forms for Chatroom administrators, replace the Web bundle's
`ui-settings` module name with `deepseek-harness-chatroom/settings`, retaining the
entry ID and its configuration. Named profile patches for that entry must use the
same module name. This host-only subpath delegates the native Host preferences
and enables the bundled native settings factory with a server-confirmed capability.
Do not also mount the original settings provider. Without this entry, the plugin
preserves the default Harness provider behavior.

Super administrators and configured `settingsAdminParticipantIds` use Host
persistence. Other authenticated members keep browser-local preferences. Each
settings/credentials RPC and every settings invalidation rechecks the current
account authority; the bootstrap capability grants no API access. The transport's
loopback classification remains unchanged. Validate model settings with a domain
hostname as well as localhost, since localhost alone misses this RC.2 behavior.
