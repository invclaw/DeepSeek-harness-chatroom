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
