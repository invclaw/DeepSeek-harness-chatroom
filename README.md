# DeepSeek Harness Chatroom

[简体中文](README.zh.md) | English

An out-of-tree [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web plugin that lets multiple browsers create and switch among persistent shared Sessions while retaining the complete native conversation UI.

## Features

- One first-visit display-name and avatar selection reused across every room through a durable, opaque browser-session cookie
- A shared-room directory that creates and switches among independent persistent Harness Sessions
- Human-first chat: ordinary messages do not wake the Agent; `@AI` or the configured AI display name explicitly requests a reply
- RC7's native `@` menu lists AI and current room members together; only `@AI` or the configured AI name wakes the Agent
- Harness's native live channel synchronizes messages, replies, and execution state
- Native sidebar, Conversation/Trajectory tabs, reasoning and tool flow, Session log, model selection, and composer
- Remote deployments can allowlist chatroom participant IDs for the native Models settings page; the bridge exposes only model-configuration methods and keeps Host file opening and every unrelated privileged API disabled
- Emoji insertion, reply quotes, and authenticated room-file upload/download cards; pure image and file messages render directly without placeholder text bubbles
- Oversized images are resized before entering Harness's durable attachment store; stop/queue/steer behavior, slash commands, approvals, and question interactions stay native
- Participant names added on the Host before Session admission, so every browser and the model see the same identity
- Current identity and online count in the native Session header, with direct access to the shared-room directory
- Durable room membership with member avatars, online state, and recent activity; owners can rename rooms and manage administrators, while administrators can also rename rooms
- In-page message toasts, unread title badges, and opt-in browser system notifications across rooms
- Persistent branch replies in a right-side panel that loads the branch's complete native Harness Session UI, including Markdown, image/file upload, model and permission selectors, stop/queue/steer, slash commands, approvals, question interactions, Think/tool trajectory, failure details, and retries
- Native AI/member `@` candidates inside the branch composer; every branch owns an independent Session, so `@AI` answers, quotes, and tool runs stay inside that branch while chatroom reactions, replies, forwarding, and selection remain available without nested chatroom branches
- Images remain visible and durable in room and branch history; when a selected model is text-only, only that model request receives deterministic text markers in place of historical images
- Quiet root-message branch activity with the total reply count and latest three replies, updated live without opening the branch panel
- Reply, like, and forward stay visible; copy, the full reaction picker, multi-select, and branch live in a clickable overflow menu as well as the context menu, with a full-width branch and bottom action menu on mobile
- Durable message reactions and selection checkboxes for every human and AI message; merged forwarding is rebuilt from authoritative Session events and retains literal/Markdown text, images, files, quotes, nested forwards, and reaction counts
- Asynchronous initialization: model, storage, or Session failures leave only the room offline and never block Harness Web startup
- No changes to the DeepSeek Harness repository

Version 0.9.3 replaces the custom branch transcript with an isolated native Harness Session, giving branches the same Agent, model, permission, interaction, trajectory, attachment, and recovery capabilities as the main conversation while suppressing nested branch creation. Branch selection waits for asynchronous native navigation and exposes loading recovery. It also adds owner/administrator management, source-verified lossless forwarding, and compact desktop/mobile message actions with reply, like, branch, and forward kept visible.

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

The browser bundle is discovered through the plugin's `dsh.client` manifest. It contributes a room launcher, identity status, input candidates, and file/reply controls. It does not replace the conversation, sidebar, details, or native text composer.

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
```

`settingsAdminParticipantIds` defaults to an empty list, so remote browsers cannot read or modify Harness configuration. Production deployments may supply the allowlist through the comma-separated `DSH_CHATROOM_SETTINGS_ADMIN_IDS` environment variable. The current identity's `participantId` is available in the authenticated `/plugins/deepseek-harness-chatroom/api/session` response. Changing a display name or avatar preserves that ID; resetting the chatroom identity creates a new ID and requires an allowlist update. A remote Models request must also carry the valid HttpOnly chatroom cookie and pass the same-origin check.

`sessionId` remains the persistent Session for the pre-upgrade lobby. Rooms created in the UI receive independent Sessions and contexts. Every branch also receives an independent persistent Session. Room files, membership, reactions, branch metadata, branch messages, and branch reply references live in the same `chatroom` storage domain, and downloads require a valid chatroom cookie. Merged-forward cards persist as native Session messages. The additive optional field keeps domain version zero, so existing identities, lobby data, and branches open without migration.

The API route is registered immediately and reports `503` until identity storage and the Session are ready. Initialization runs in the background, and failures remain isolated from Harness Web startup.

## Browser identity and security

The browser receives a random 256-bit token in an `HttpOnly`, `SameSite=Strict` cookie scoped to the chatroom API. The server stores only its SHA-256 digest. Reloading the page or restarting Harness restores the identity until the cookie expires or the user changes identity from the shared-room directory.

A display name is presentation, not authentication. Remote Models authorization compares the opaque `participantId` resolved by the server from the HttpOnly cookie and never trusts the editable display name. The configuration carrier retains API Proxy schema validation, secret redaction, and revision-conflict checks; credentials are write-only and never returned, while `settings.openDocument`, Sessions, filesystem methods, and every other privileged API are absent from the allowlist. Every participant who can reach the room can still submit input to the configured Agent preset and may use its tools. Use a restricted preset and narrow `cwd` for rooms exposed beyond a trusted team.

## Verify

1. Open Harness Web, select **Shared sessions**, choose `Alice` and an avatar, then enter the existing lobby.
2. The native Session must open with sidebar, Conversation/Trajectory tabs, native composer, and Session log. No custom transcript should appear.
3. Reopen the directory and create **Project two**. It must open as another native Session, remain switchable from the sidebar, and keep independent history.
4. In a private window or another browser choose `Bob` and enter the same shared room.
5. Send ordinary text from Alice. Both pages must synchronize it without an AI reply. Typing `@` must list both AI and Bob; mentioning Bob must stay human-only, while mentioning AI must wake the Agent.
6. Select **Reply** below a human message. The composer must show the quote, and both browsers must render the same quote after sending.
7. Insert an emoji through **Emoji**, then send a pure image and a pure file. Only the media or download card must render, without a "sent a..." text bubble; the other browser must download the original file bytes.
8. Run `/new`, approval and question interactions, and stop/queue/steer flows through their native Harness paths.
9. Open **Group management** in the Session header. Verify both participants, rename the room as its owner, promote Bob, and rename it again as Bob; the title and roles must survive reload. Enable system notifications, hide the tab, and verify a peer message creates a system alert and unread title badge.
10. Choose **Branch** from a human or AI message's overflow menu. The panel must contain the complete native Harness conversation. Verify model and permission selection, image/file upload, stop/steer, slash commands, approval/question interactions, Think/tool trajectory, and retry UI. Typing `@` must list AI and room members, while `@AI` output stays in the branch. Reply, react, forward, and multi-select a branch message; no nested chatroom branch action may appear. After four messages, close the panel and verify the root's total and latest three replies.
11. Choose **Multi-select** from the overflow menu and confirm every human and AI message receives a checkbox. Select messages containing Markdown, quotes, images, files, and reactions, merge them into **Project two**, and verify the target card retains all of those fields.
12. Enter another shared room and confirm that display-name and avatar setup is not requested again.
13. With an image already in room history, switch to a text-only model and send `@AI summarize` in both the main room and a branch. Both must answer while the historical image remains visible.
14. Reload and restart Harness. Identity, room directory, membership, reactions, branches, and every Session context must recover.
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
