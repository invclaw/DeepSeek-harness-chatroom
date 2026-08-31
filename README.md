<div align="center">
  <h1>DeepSeek Harness Chatroom</h1>
  <p><strong>A multi-user collaboration layer for the native DeepSeek Harness Web UI.</strong></p>
  <p><a href="README.zh.md">简体中文</a> · English</p>
  <p>
    <img alt="Version 1.3.3" src="https://img.shields.io/badge/version-1.3.3-4f6bff">
    <img alt="Harness 0.1.1-rc.2" src="https://img.shields.io/badge/DeepSeek_Harness-0.1.1--rc.2-111827">
    <img alt="pnpm 10.33.4" src="https://img.shields.io/badge/pnpm-10.33.4-f69220">
    <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-22c55e">
  </p>
</div>

Add Group, Solo, and direct-message modes to the native [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) workspace without replacing the conversation stream, Agent runtime, model picker, permission controls, trajectory, or Session log.

<p align="center">
  <img src="docs/assets/group-chat.jpg" alt="A shared Harness room with avatars, mentions, reactions, images, message actions, and a branch preview" width="100%">
</p>
<p align="center"><sub>Human-first chat, native Agent responses, rich media, reactions, and live branch previews in one Session.</sub></p>

## Why this plugin

| Native Harness, preserved | Collaboration, added | Identity, ready for deployment |
| --- | --- | --- |
| Sessions, Agent presets, models, permissions, Think/tool trajectory, approvals, questions, slash commands, stop/queue/steer, and retries stay native. | Shared rooms, presence, mentions, replies, reactions, rich media, forwarding, multi-select, branches, notifications, group management, and private chat. | Local accounts, administrator provisioning, roles, account revocation, `dsh-auth`, enterprise OIDC/SSO, automatic provider redirect, and an edge `forward_auth` contract. |

The plugin is out-of-tree and does **not** modify DeepSeek Harness. Its initialization is asynchronous: chatroom storage, model, or Session failures remain isolated and never prevent Harness Web from starting.

## Product tour

<table>
  <tr>
    <td width="50%">
      <img src="docs/assets/new-group-setup.jpg" alt="Create a group from the native blank Session screen"><br>
      <strong>Choose Group or Solo in the native welcome screen</strong><br>
      Group is selected by default and becomes a Room on the first regular message. Invite known accounts later from Group management.
    </td>
    <td width="50%">
      <img src="docs/assets/group-management.jpg" alt="Group management drawer with account directory and room members"><br>
      <strong>Manage members in place</strong><br>
      Owners, room administrators, and platform super administrators add known accounts directly and see roles and presence.
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <img src="docs/assets/account-settings.jpg" alt="Native Harness Chatroom and accounts settings page"><br>
      <strong>Keep administration inside Harness Settings</strong><br>
      Registration policy, account creation, roles, password rotation, private chat, `dsh-auth`, and OIDC providers follow the native Settings design language.
    </td>
  </tr>
</table>

> The screenshots are historical captures from the deployed v1.1.5 product UI. They are not a current-version guarantee, and no mockups are used.

## Core capabilities

### Shared rooms and human-first AI

- The workspace sidebar groups activity into **Group / Solo / Direct**. Shared Rooms appear under Group, native one-person Agent Sessions under Solo, and every available platform account under Direct. Because a category merges every Workspace, the per-Workspace "show more sessions" buttons are expanded and replaced by one show-more control per category whose count matches the folder count.
- **New session** keeps the native welcome screen and composer, with Group selected by default in a Group/Solo switch. The first regular Group message creates its Room; Solo remains a native one-person Agent Session.
- Human messages synchronize in real time. `@AI` and direct forms such as `DeepSeek please answer` request an Agent reply without consulting the decision model; rooms may also enable model-controlled replies for other messages without an explicit mention.
- **Settings → Chatroom & accounts** selects the global auto-reply decision model and edits separate system prompts for the main/branch Agent and the auto-reply decision Agent. Prompt changes apply to the next turn without restarting Harness.
- The native `@` menu lists the Agent and current room members together. Participant identity is attached on the Host before Session admission, so browsers and the model see the same sender.
- Shared Session rows retain the native sidebar while adding a roomier member-avatar collage. Native Session renames update the durable room title, so the name survives navigation and restarts.
- Group, Solo, and Direct reuse the room composer layout and interaction model. Their transcript and composer use the full available conversation column instead of the native fixed-width cap.
- The Session header shows the current identity, online count, and **Group management**. New-message toasts, title unread counts, and opt-in browser notifications work across rooms.

### Complete native Agent runtime

- The native sidebar, Conversation/Trajectory tabs, composer, model and permission selectors, reasoning/tool flow, Session log, approvals, questions, slash commands, stop/queue/steer, failures, and retries remain intact.
- The room composer adds **Stop** and **New session**. Stop cancels the active Agent turn while retaining queued input. New session keeps the room's visible Session and complete transcript, first shows a new-AI-conversation divider above the composer, and then permanently keeps it before the next participant message. The server persists the matching context boundary so later AI requests contain only messages sent after that point. Concurrent requests coalesce into one reset.
- While an Agent is running, Think and tool rows stay visible. Once the final answer arrives, the preceding process rows collapse into one expandable summary.
- Persistent branches open in a right-side panel and own independent Harness Sessions. Branches support Markdown, `@` candidates, images/files, quotes, reactions, forwarding, selection, and the full Agent runtime without nested chatroom branches. Their sidebar rows use a compact marker and parent context instead of a heavy edge stripe, keeping the hierarchy visible without making the branch look like a second room. Gateways that reject embedded documents switch immediately to an inline compatibility view instead of waiting for a timeout, with the complete Agent available in a new tab.
- Historical images remain durable. For text-only models, only the model request receives deterministic text markers in place of image input; the UI keeps the original media.

### Messaging and media

- Verified profile images from IOA, OIDC, and other enterprise providers appear in messages, member directories, the native `@` menu, invite lists, private chat, and room collages. Missing or failed profile images fall back to the account's stable cartoon avatar.
- Timestamps, compact in-composer reply quotes, emoji insertion, message reactions, Markdown, image previews, and authenticated file upload/download.
- Pure image and file messages render directly—no extra “sent an image/file” placeholder bubble. Oversized images are resized before entering Harness attachment storage.
- Reply, like, branch, and forward are available from the message row; copy, reaction picker, multi-select, and sender-only recall remain available from the overflow/context menu, with a mobile bottom sheet. Recalled messages become synchronized tombstones and lose their reactions and selection state.
- Merged forwarding is rebuilt from authoritative Session events and retains text/Markdown, media, quotes, nested forwards, and reaction counts.
- The Agent receives room-scoped tools for capability discovery, proactive messages, file delivery, replies, reactions, branch creation, member invitation, and recalling its own messages. Tool actions use the same durable room records and live events as human operations.

### Enterprise WeChat collaboration

- The official [`@wecom/cli`](https://github.com/WecomTeam/wecom-cli) supplies calendar CRUD, attendees/free-busy/rooms, meeting lifecycle/minutes/transcripts, document search and permissions, online sheets, smart sheets, and smart documents.
- Agents read each live operation definition with `wecom_schema` and execute it with `wecom_action`. Every call resolves the current prompting platform user and that account's isolated Enterprise WeChat authorization. People are resolved through contacts instead of guessed or exposed internal IDs. Missing authorization or an individual CLI failure remains isolated from plugin and Harness startup.
- **Quick meeting** in Group and Direct creates a default 60-minute online meeting with the current platform account's isolated Enterprise WeChat authorization and posts it immediately; Solo intentionally omits the action. When the official CLI does not return a structured human `userid`, the plugin does not invent an attendee and follows the CLI's optional-attendees schema. Meeting and document results render as native cards with titles, times, attendees, owners, and links instead of plain text.

### Accounts, SSO, and private chat

- Optional local password registration, super-administrator account provisioning, roles/status, password rotation, disabled-account revocation, and one identity reused across rooms.
- Pluggable authentication through local accounts, [`dsh-auth`](https://github.com/hxy91819/dsh-auth), or enterprise OIDC Authorization Code with discovery, PKCE, state, and nonce.
- The chosen external provider can automatically receive unauthenticated users; `local=1` keeps a local recovery entry.
- Durable private conversations are visible only to their two participants, support Enter-to-send, Shift+Enter newlines, emoji, images, files, and Quick-meeting cards, and reuse the same unread/toast/browser-notification channel. The Direct folder is also the account directory: clicking any profile starts the conversation in the main Harness conversation area.

### Storage and backup

- The plugin owns a SQLite chat archive at `$DSH_HOME/chatroom/chatroom.sqlite` (or `~/.dsh/chatroom/chatroom.sqlite`). It projects rooms, branches, private conversations, membership, messages, attachment metadata, and recall tombstones into queryable tables. Harness Session logs remain the authoritative Agent execution and audit history; they are not used as the only chat database.
- File bytes are stored outside SQLite in a SHA-256 content-addressed Blob tree under `blobs/v1/objects/`. Duplicate bytes share one object, while attachment rows retain the original name, media type, sender, room, and creation time. Legacy inline Base64 records migrate on startup without changing message references.
- Recall is non-destructive: the archive retains the original row and records who recalled it and when. Every client receives the tombstone, and the recalled model message ID is removed from future main-room or branch model requests.
- Back up or move the complete chat archive by stopping the plugin and copying the configured data directory. Set `dataDirectory` or `DSH_CHATROOM_DATA_DIR` to place SQLite and Blobs on a dedicated volume.

<details>
<summary><strong>Recent releases</strong></summary>

- **1.3.4** — expand the native per-Workspace session truncation and give each sidebar category a single show-more control whose count matches its folder count, instead of several native buttons stranded mid-list by the flattened categories.
- **1.3.3** — unify the full-width Group, Solo, and Direct composer experience, persist the AI-context reset divider at its exact transcript position, and add per-platform-account Enterprise WeChat QR authorization with Quick-meeting compatibility for identity responses that omit a structured human user id.
- **1.3.2** — retain the complete room transcript when starting a new AI conversation and exclude every earlier user, assistant, and tool-result message from later model requests.
- **1.3.1** — polish branch navigation with a closer marker and no parent edge stripe, replace the generic Settings navigation gear with a semantic group/account icon and safe fallback, and add browser coverage for the layout and settings navigation.
- **1.3.0** — add room Stop/New-session controls, official schema-driven wecom-cli Agent tools, Quick meeting, and native meeting/document cards while keeping Enterprise WeChat authorization failures isolated from Harness startup.
- **1.2.5** — append ordinary room and branch messages before the optional automatic-response model runs, and repair historical tool-call/result ordering from older chatroom builds before requests reach the model provider.
- **1.2.4** — add the plugin-owned SQLite chat archive and content-addressed local Blob store, migrate legacy inline attachments, enforce membership visibility in authenticated deployments, and make recall remove the original model message from future Agent context.
- **1.2.3** — attach the room capability and action tools when a shared Session is already running before the chatroom adopts it, so native Harness-restored Agents receive the same collaboration tools as plugin-created Agents.
- **1.2.0** — serialize auto-reply settings with message admission, wake the Agent deterministically for direct AI addressing, add durable sender-only recall, remove the redundant private-chat Settings entry, and expose the complete room action set as model-callable Agent tools.
- **1.1.17** — keep compact reply quotes inside the native composer card and show verified IOA/OIDC profile images in native member mention candidates, with cartoon fallbacks.
- **1.1.16** — target DeepSeek Harness 0.1.1-rc.2, add Group/Solo/Direct navigation, native private messaging with files and emoji, streamlined new-Session mode selection, room pinning, automatic AI wake-up controls, and distinct AI/member mention groups while retaining the 1.1.15 IOA profile and native Session fixes.
- **1.1.15** — add a Chromium regression gate for branch theme and geometry, and keep the full-width mobile branch panel inside its viewport.
- **1.1.14** — make the Harness action row expand around injected AI branch activity instead of letting the summary overlap the sticky composer.
- **1.1.13** — match branch panels and reply summaries to the inherited light/dark color scheme, and keep AI branch activity in normal message flow above the composer.
- **1.1.12** — bind every native sidebar collage to its authoritative Session ID, so duplicate titles, selection changes, and row reordering cannot swap room avatars.
- **1.1.11** — keep room-collage identities and ordering stable while navigating, and include enterprise profile images in the initial room directory.
- **1.1.10** — carry dsh-auth/IOA and OIDC profile images across every chat surface while retaining deterministic cartoon fallbacks.
- **1.1.9** — persist native sidebar renames as room titles and add taller shared-Session rows with member-avatar collages.
- **1.1.8** — replace blocked native branch frames with an immediate messaging fallback, retain direct access to the complete Agent, and collapse Markdown-heavy branch subjects into compact titles.
- **1.1.7** — keep isolated branch runtimes on their target Session instead of navigating back to the parent room during startup.
- **1.1.6** — attach every new or resumed branch Session to the native Workspace so the retained Harness iframe can select it without timing out.
- **1.1.5** — create a group and select platform members directly on the native blank-Session screen.
- **1.1.4** — guarantee distinct native New Sessions and exclude branch Sessions from blank-Session reuse.
- **1.1.3** — replace copied invitation links with direct account-directory selection.
- **1.1.2** — rebuild **Settings → Chatroom & accounts** in the native Harness Settings design language.
- **1.1.0** — make Harness Sessions shared by default, add account/SSO administration, and prefer installed `dsh-auth` as the initial login provider.

</details>

## Requirements

- Node.js 22.19 or later
- pnpm 10.33.4
- DeepSeek Harness 0.1.1-rc.2 is the primary compatibility target; 0.1.0-rc.7 remains the minimum supported release.
- A working default model selection in the Harness Web profile

### Regression gates

`pnpm check` runs type checks, observable-behavior tests, and production builds. CI additionally installs Chromium and runs `pnpm test:browser`, which verifies the branch panel's computed light/dark colors, keeps branch markers close to their parent without the parent edge stripe, proves that injected AI branch activity expands the native Harness actions row without overlapping the composer, and checks the semantic/fallback group/account Settings icon. These browser assertions deliberately use geometry and computed styles instead of screenshot snapshots.

## Install from GitHub

When upgrading, remove the previous plugin record before installing the current repository:

```sh
pnpm dsh plugin --profile web remove deepseek-harness-chatroom
pnpm dsh plugin --profile web add github:invclaw/DeepSeek-harness-chatroom
pnpm dsh --profile web
```

For a local checkout:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/DeepSeek-harness-chatroom
pnpm dsh --profile web
```

The browser bundle is discovered through the plugin's `dsh.client` manifest. New Sessions default to Group and bind to a shared Room only when their first regular message is sent; Solo remains native. The plugin contributes identity status, categorized sidebar folders, the account directory, group management, input candidates, and file/reply controls without replacing the conversation, details, or native text composer.

## Configure

Installation adds this row to the Web profile:

```yaml
- id: chatroom
  name: deepseek-harness-chatroom
  config:
    dataDirectory: !!js process.env.DSH_CHATROOM_DATA_DIR ?? ''
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
    authMode: !!js process.env.DSH_CHATROOM_AUTH_MODE ?? 'local'
    authDshAuthSuperAdminSubjects: !!js (process.env.DSH_CHATROOM_DSH_AUTH_SUPER_ADMINS ?? '').split(',').map(value => value.trim()).filter(Boolean)
    authDshAuthAvatarUrlTemplate: !!js process.env.DSH_CHATROOM_DSH_AUTH_AVATAR_TEMPLATE ?? ''
    wecomEnabled: !!js process.env.DSH_CHATROOM_WECOM !== 'disabled'
    wecomCliPath: !!js process.env.DSH_CHATROOM_WECOM_CLI_PATH ?? ''
    wecomCliConfigDirectory: !!js process.env.WECOM_CLI_CONFIG_DIR ?? ''
    wecomCliTimeoutMs: !!js Number(process.env.DSH_CHATROOM_WECOM_TIMEOUT_MS ?? 30000)
    wecomQuickMeetingDurationMinutes: !!js Number(process.env.DSH_CHATROOM_WECOM_QUICK_MEETING_MINUTES ?? 60)
    wecomQuickMeetingSubject: !!js process.env.DSH_CHATROOM_WECOM_QUICK_MEETING_SUBJECT ?? 'Quick meeting'
    wecomTimeZone: !!js process.env.DSH_CHATROOM_WECOM_TIMEZONE ?? 'Asia/Shanghai'
    authDshAuthAvatarAllowedOrigins: !!js (process.env.DSH_CHATROOM_DSH_AUTH_AVATAR_ORIGINS ?? '').split(',').map(value => value.trim()).filter(Boolean)
    authDshAuthRevalidateSeconds: !!js Number(process.env.DSH_CHATROOM_DSH_AUTH_REVALIDATE_SECONDS ?? 60)
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
    authMode: local
    authDshAuthSuperAdminSubjects: []
    authDshAuthAvatarUrlTemplate: ''
    authDshAuthAvatarAllowedOrigins: []
    authDshAuthRevalidateSeconds: 60
    wecomEnabled: true
    wecomCliPath: ''
    wecomCliConfigDirectory: /persistent/wecom-cli/config
    wecomCliTimeoutMs: 30000
    wecomQuickMeetingDurationMinutes: 60
    wecomQuickMeetingSubject: Quick meeting
    wecomTimeZone: Asia/Shanghai
```

### Enterprise WeChat authorization

The dependency is installed with the plugin, so no global CLI install is required. On the first Quick-meeting action, each platform user receives an in-page QR code and scans it once with their own Enterprise WeChat account. The official CLI encrypts credentials under an account-isolated directory at `wecomCliConfigDirectory/accounts/` (or the chat data directory's `wecom-cli/accounts/` when unset); container deployments should persist that parent directory. Missing authorization pauses only that user's Quick meeting or Agent Enterprise WeChat action; ordinary rooms and Agents continue to run.

`authSecret` encrypts OIDC client secrets and hashes no passwords directly; keep it stable and outside Git. Local passwords use salted scrypt. The first password registration must present `authBootstrapToken` and becomes the initial super administrator. Later registrations follow the mutable policy in **System administration**. Login attempts are bounded in memory, disabling an account revokes all its sessions, and changing a password rotates the current session and revokes older ones. The authentication cookie is random, stored only by SHA-256 digest, `HttpOnly`, `SameSite=Strict`, root-scoped, and `Secure` whenever `authPublicOrigin` uses HTTPS.

### Enterprise OIDC and dsh-auth

Add OIDC providers from **System administration**. The displayed callback URL must be registered exactly at the identity provider. Discovery and the authorization-code exchange use OIDC discovery, PKCE, state, and nonce; the client secret is stored with AES-256-GCM under `authSecret` and is never projected back to the UI. The first enabled external provider automatically becomes the unauthenticated entry; **Unauthenticated entry** can select a different provider or restore the login chooser. In `hybrid`/`local` modes, add `local=1` to the original application URL to reach the local-account recovery form; bootstrap always remains on the local registration page.

To reuse [`dsh-auth`](https://github.com/hxy91819/dsh-auth), keep its `/auth/*` routes on the same public origin and set `DSH_CHATROOM_DSH_AUTH_VERIFY_URL` to its loopback `/auth/verify` URL (typically `http://127.0.0.1:3080/auth/verify`). Verified dsh-auth accounts are ordinary chatroom members unless their stable subject appears in `authDshAuthSuperAdminSubjects`; the edge `admin` role is not a chatroom role. Production can set `authMode: dsh-auth-only`, disable self-registration, and keep the 60-second upstream revalidation interval. Local password and OIDC entry points are then hidden, and revoked upstream sessions stop working at the next validation; the `local=1` recovery switch is available only in `hybrid`/`local` modes. Avatar URLs are HTTPS-only, optionally generated with `authDshAuthAvatarUrlTemplate` and constrained by `authDshAuthAvatarAllowedOrigins`; failed loads fall back to the built-in avatar. `authDshAuthHeaders` remains a trusted-gateway compatibility switch and is disabled by default.

### Whole-site edge enforcement

Enabling the plugin's account APIs does not by itself make a publicly reachable Harness secure. Keep Harness loopback-only and configure the public TLS proxy to:

1. Return `404` for public requests to `/plugins/deepseek-harness-chatroom/api/auth/verify`.
2. Proxy only the explicit login/register/logout, `/auth/page`, `/auth/providers`, OIDC, and dsh-auth callback routes without authentication.
3. Run every other Harness page, asset, API, plugin, SSE, download, and WebSocket request through an internal `forward_auth` subrequest to that verify URL.
4. Pass the original URI as `X-Original-URI`, convert a `401` plus `X-Dsh-Auth-Login` to a `303` only for top-level page navigation, and preserve `Set-Cookie` returned by verification.
5. Remove inbound `X-Dsh-Auth-User-Id`, `X-Dsh-Auth-Subject`, `X-Dsh-Auth-Username`, `X-Dsh-Auth-Display-Name`, `X-Dsh-Auth-Picture`, and `X-Dsh-Auth-Roles` before copying verified values. Authentication still works without the four profile headers, but the chatroom can then show only the account name and cartoon fallback.

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
