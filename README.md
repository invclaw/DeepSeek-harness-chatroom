# DeepSeek Harness Chatroom

[简体中文](README.zh.md) | English

An out-of-tree [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web plugin that lets multiple browsers create and switch among persistent shared Sessions while retaining the complete native conversation UI.

## Features

- Optional system-wide accounts with password registration, super-administrator provisioning, disabled-account revocation, password rotation, and one identity reused across rooms
- Pluggable authentication through local passwords, generic enterprise OIDC Authorization Code + PKCE/nonce callbacks, or the community `dsh-auth` administrator identity
- A standalone login page and `/auth/verify` contract for an edge `forward_auth`, covering the Harness SPA, APIs, downloads, SSE, and WebSockets instead of relying on a client-side overlay
- A super-administrator console for registration policy, user creation, roles/status, and encrypted OIDC provider configuration; client secrets are never returned to browsers
- Durable private text conversations between accounts, visible only to their two participants and delivered through the existing toast, unread, and browser-notification channel
- Legacy identity mode still supports one first-visit display-name and avatar selection reused across every room through a durable, opaque browser-session cookie
- Every ordinary Harness Session becomes a shared room on first use, retaining the native new-session and sidebar flows
- Human-first chat: ordinary messages do not wake the Agent; `@AI` or the configured AI display name explicitly requests a reply
- RC7's native `@` menu lists AI and current room members together; only `@AI` or the configured AI name wakes the Agent
- Harness's native live channel synchronizes messages, replies, and execution state
- Native sidebar, Conversation/Trajectory tabs, reasoning and tool flow, Session log, model selection, and composer
- Remote deployments can allowlist chatroom participant IDs for the native Models settings page; the bridge exposes only model-configuration methods and keeps Host file opening and every unrelated privileged API disabled
- Emoji insertion, reply quotes, and authenticated room-file upload/download cards; pure image and file messages render directly without placeholder text bubbles
- Oversized images are resized before entering Harness's durable attachment store; stop/queue/steer behavior, slash commands, approvals, and question interactions stay native
- Participant names added on the Host before Session admission, so every browser and the model see the same identity
- Current identity, online count, and Group management in the native Session header, with no floating room launcher
- A right-side management drawer where room managers search and check active platform accounts to add them directly, alongside member avatars, online state, and role controls
- In-page message toasts, unread title badges, and opt-in browser system notifications across rooms
- Persistent branch replies in a right-side panel that retains one native Harness runtime and switches its Session in place, including Markdown, image/file upload, model and permission selectors, stop/queue/steer, slash commands, approvals, question interactions, Think/tool trajectory, failure details, and retries
- Native AI/member `@` candidates inside the branch composer; every branch owns an independent Session, so `@AI` answers, quotes, and tool runs stay inside that branch while chatroom reactions, replies, forwarding, and selection remain available without nested chatroom branches
- Images remain visible and durable in room and branch history; when a selected model is text-only, only that model request receives deterministic text markers in place of historical images
- Quiet root-message branch activity with the total reply count and latest three replies, updated live without opening the branch panel
- Reply, like, and forward stay visible; copy, the full reaction picker, multi-select, and branch live in a clickable overflow menu as well as the context menu, with a full-width branch and bottom action menu on mobile
- Durable message reactions and selection checkboxes for every human and AI message; merged forwarding is rebuilt from authoritative Session events and retains literal/Markdown text, images, files, quotes, nested forwards, and reaction counts
- Asynchronous initialization: model, storage, or Session failures leave only the room offline and never block Harness Web startup
- No changes to the DeepSeek Harness repository

Version 1.1.3 replaces copied room invitation links with a manager-only, searchable multi-select directory of active platform accounts; checked users are added to the room immediately. Version 1.1.2 rebuilds **Settings → Chatroom & accounts** as a width-safe native Settings column using Harness theme tokens, labeled account and OIDC fields, responsive member actions, and the same module, hairline, and capsule-control vocabulary as the Models and Agent presets pages. Version 1.1.1 keeps the first AI run on Harness's native turn numbering instead of writing a synthetic setup turn. Version 1.1.0 makes native Harness Sessions shared by default, removes the floating launcher, and moves account and SSO administration into native Settings. An installed `dsh-auth` is the initial default login provider; `local=1` retains local-account recovery.

## Requirements

- Node.js 22.19 or later
- pnpm 10.33.4
- DeepSeek Harness 0.1.0-rc.7 or later
- A working default model selection in the Harness Web profile

## Install from GitHub

When upgrading, remove the previous plugin record before installing the current repository:

```sh
pnpm dsh plugin --profile web remove deepseek-harness-chatroom
pnpm dsh plugin --profile web add github:sliverp/DeepSeek-harness-chatroom
pnpm dsh --profile web
```

For a local checkout:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/DeepSeek-harness-chatroom
pnpm dsh --profile web
```

The browser bundle is discovered through the plugin's `dsh.client` manifest. It idempotently binds ordinary Harness Sessions to shared rooms and contributes identity status, group management, input candidates, and file/reply controls. It does not replace the conversation, sidebar, details, or native text composer.

## Configure

Installation adds this row to the Web profile:

```yaml
- id: chatroom
  name: deepseek-harness-chatroom
  config:
    roomId: lobby
    roomTitle: AI Chatroom
    aiDisplayName: DeepSeek
    sessionId: chatroom-v1-lobby
    cwd: !!js process.env.DSH_CHATROOM_CWD ?? process.cwd()
    agentPreset: standard
    settingsAdminParticipantIds: !!js (process.env.DSH_CHATROOM_SETTINGS_ADMIN_IDS ?? '').split(',').map(value => value.trim()).filter(Boolean)
    authEnabled: !!js Boolean(process.env.DSH_CHATROOM_AUTH_SECRET)
    authSecret: !!js process.env.DSH_CHATROOM_AUTH_SECRET ?? ''
    authPublicOrigin: !!js process.env.DSH_CHATROOM_AUTH_PUBLIC_ORIGIN ?? ''
    authBootstrapToken: !!js process.env.DSH_CHATROOM_AUTH_BOOTSTRAP_TOKEN ?? ''
    authAllowSelfRegistration: !!js process.env.DSH_CHATROOM_SELF_REGISTRATION !== 'disabled'
    authDshAuthHeaders: !!js process.env.DSH_CHATROOM_DSH_AUTH_HEADERS === 'enabled'
    authDshAuthVerifyUrl: !!js process.env.DSH_CHATROOM_DSH_AUTH_VERIFY_URL ?? ''
    authDshAuthLoginPath: !!js process.env.DSH_CHATROOM_DSH_AUTH_LOGIN_PATH ?? '/auth/login'
```

Override it in the Web profile's `cordis.patch.yml` when needed:

```yaml
- id: chatroom
  name: deepseek-harness-chatroom
  config:
    roomId: team-room
    roomTitle: Team AI Room
    aiDisplayName: DeepSeek
    sessionId: chatroom-v1-team-room
    cwd: /absolute/path/available/to-the-room-agent
    agentPreset: standard
    cookieName: dsh_chatroom_session
    cookieMaxAgeSeconds: 31536000
    maxDisplayNameChars: 24
    maxRoomTitleChars: 80
    maxMessageTextChars: 20000
    maxFileBytes: 20971520
    maxFilesPerMessage: 5
    maxMessageFileBytes: 52428800
    maxImageSidePixels: 4096
    settingsAdminParticipantIds:
      - participant-id-of-an-administrator
    maxSettingsRequestBytes: 1048576
    sseHeartbeatMs: 15000
    authEnabled: true
    authCookieName: dsh_chatroom_auth
    authSessionMaxAgeSeconds: 2592000
    authSecret: a-random-secret-containing-at-least-32-utf8-bytes
    authPublicOrigin: https://chat.example.com
    authBootstrapToken: one-time-super-administrator-bootstrap-token
    authAllowSelfRegistration: true
    authDshAuthHeaders: false
    authDshAuthVerifyUrl: ''
    authDshAuthLoginPath: /auth/login
```

`authSecret` encrypts OIDC client secrets and hashes no passwords directly; keep it stable and outside Git. Local passwords use salted scrypt. The first password registration must present `authBootstrapToken` and becomes the initial super administrator. Later registrations follow the mutable policy in **System administration**. Login attempts are bounded in memory, disabling an account revokes all its sessions, and changing a password rotates the current session and revokes older ones. The authentication cookie is random, stored only by SHA-256 digest, `HttpOnly`, `SameSite=Strict`, root-scoped, and `Secure` whenever `authPublicOrigin` uses HTTPS.

### Enterprise OIDC and dsh-auth

Add OIDC providers from **System administration**. The displayed callback URL must be registered exactly at the identity provider. Discovery and the authorization-code exchange use OIDC discovery, PKCE, state, and nonce; the client secret is stored with AES-256-GCM under `authSecret` and is never projected back to the UI. The first enabled external provider automatically becomes the unauthenticated entry; **Unauthenticated entry** can select a different provider or restore the login chooser. Add `local=1` to the original application URL to reach the local-account recovery form, and bootstrap always remains on the local registration page.

To reuse [`dsh-auth`](https://github.com/hxy91819/dsh-auth) as the default administrator identity while retaining local multi-user accounts, keep its `/auth/*` routes reachable on the same public origin and set `DSH_CHATROOM_DSH_AUTH_VERIFY_URL` to its loopback `/auth/verify` URL (typically `http://127.0.0.1:3080/auth/verify`). The chatroom forwards the browser's dsh-auth cookie only to that verifier and imports its administrator as a local super administrator. When configured, dsh-auth is the initial default login provider; super administrators can choose another provider in **Settings → Chatroom & accounts**, while `local=1` opens local recovery. Do not put the single-user dsh-auth edge outside local member login.

### Whole-site edge enforcement

Enabling the plugin's account APIs does not by itself make a publicly reachable Harness secure. Keep Harness loopback-only and configure the public TLS proxy to:

1. Return `404` for public requests to `/plugins/deepseek-harness-chatroom/api/auth/verify`.
2. Proxy only the explicit login/register/logout, `/auth/page`, `/auth/providers`, OIDC, and dsh-auth callback routes without authentication.
3. Run every other Harness page, asset, API, plugin, SSE, download, and WebSocket request through an internal `forward_auth` subrequest to that verify URL.
4. Pass the original URI as `X-Original-URI`, convert a `401` plus `X-Dsh-Auth-Login` to a `303` only for top-level page navigation, and preserve `Set-Cookie` returned by verification.
5. Remove inbound `X-Dsh-Auth-User-Id`, `X-Dsh-Auth-Username`, and `X-Dsh-Auth-Roles` before copying verified values.

The verifier returns `204` with verified identity headers, or `401` with the standalone login location. This arrangement keeps the authentication edge independent from Harness startup: the plugin registers immediately, reports `503` until its own storage is ready, and a provider discovery/login failure does not prevent Harness from starting.

`settingsAdminParticipantIds` defaults to an empty list, so remote browsers cannot read or modify Harness configuration. Production deployments may supply the allowlist through the comma-separated `DSH_CHATROOM_SETTINGS_ADMIN_IDS` environment variable. The current identity's `participantId` is available in the authenticated `/plugins/deepseek-harness-chatroom/api/session` response. Changing a display name or avatar preserves that ID; resetting the chatroom identity creates a new ID and requires an allowlist update. A remote Models request must also carry the valid HttpOnly chatroom cookie and pass the same-origin check.

`sessionId` remains the persistent Session for the pre-upgrade lobby. When an authenticated member first opens an ordinary Harness Session, the plugin idempotently creates only the shared-room record for that exact Session ID. Room managers add active platform accounts from the Group management drawer. Every branch still receives an independent persistent Session.

The API route is registered immediately and reports `503` until identity storage and the Session are ready. Initialization runs in the background, and failures remain isolated from Harness Web startup.

## Browser identity and security

When authentication is disabled, the legacy browser identity still receives a random 256-bit token in an API-scoped `HttpOnly`, `SameSite=Strict` cookie. This mode identifies participants but is not an access-control mechanism. When authentication is enabled, the account cookie described above is authoritative for rooms, files, images, settings administration, notifications, and private conversations.

A display name is presentation, not authentication. Remote Models authorization compares the opaque `participantId` resolved by the server from the HttpOnly cookie and never trusts the editable display name. The configuration carrier retains API Proxy schema validation, secret redaction, and revision-conflict checks; credentials are write-only and never returned, while `settings.openDocument`, Sessions, filesystem methods, and every other privileged API are absent from the allowlist. Every participant who can reach the room can still submit input to the configured Agent preset and may use its tools. Use a restricted preset and narrow `cwd` for rooms exposed beyond a trusted team.

## Verify

1. Open Harness Web and finish login or first-time identity setup. No floating **Shared sessions** button should appear.
2. Use the native **New session** action. The Session must automatically become a shared room while retaining the sidebar, Conversation/Trajectory tabs, native composer, and Session log.
3. Open **Settings → Chatroom & accounts** and verify account, registration, and SSO administration lives there instead of a custom modal.
4. In a private window or another browser sign in as `Bob` so the platform account is available to Group management.
5. Send ordinary text from Alice. Both pages must synchronize it without an AI reply. Typing `@` must list both AI and Bob; mentioning Bob must stay human-only, while mentioning AI must wake the Agent.
6. Select **Reply** below a human message. The composer must show the quote, and both browsers must render the same quote after sending.
7. Insert an emoji through **Emoji**, then send a pure image and a pure file. Only the media or download card must render, without a "sent a..." text bubble; the other browser must download the original file bytes.
8. Run `/new`, approval and question interactions, and stop/queue/steer flows through their native Harness paths.
9. Open **Group management** in the Session header. As a manager, search the platform account directory, check Bob, and add him directly; the drawer must then show both participants and presence. Rename the room as its owner, promote Bob, and rename it again as Bob; membership, title, and roles must survive reload.
10. Choose **Branch** from a human or AI message's overflow menu. The panel must contain the complete native Harness conversation. Verify model and permission selection, image/file upload, stop/steer, slash commands, approval/question interactions, Think/tool trajectory, and retry UI. Typing `@` must list AI and room members, while `@AI` output stays in the branch. Reply, react, forward, and multi-select a branch message; no nested chatroom branch action may appear. After four messages, close the panel and verify the root's total and latest three replies.
11. Choose **Multi-select** from the overflow menu and confirm every human and AI message receives a checkbox. Select messages containing Markdown, quotes, images, files, and reactions, merge them into **Project two**, and verify the target card retains all of those fields.
12. Enter another shared room and confirm that display-name and avatar setup is not requested again.
13. With an image already in room history, switch to a text-only model and send `@AI summarize` in both the main room and a branch. Both must answer while the historical image remains visible.
14. Reload and restart Harness. Identity, Session-to-room bindings, membership, reactions, branches, and every Session context must recover.
15. Add the current identity's `participantId` to `DSH_CHATROOM_SETTINGS_ADMIN_IDS`, then open **Settings → Models** from the remote URL. The provider directory and editor cards must load; a second identity that is not allowlisted must receive an authorization error.

The health endpoint is `/plugins/deepseek-harness-chatroom/api/health`; direct Harness Web deployments may also use `/chatroom/api/health`. A ready room returns:

```json
{"ready":true}
```

## Development

```sh
corepack pnpm@10.33.4 install
corepack pnpm@10.33.4 run check
```

## License

MIT
