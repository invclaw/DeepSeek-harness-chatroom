# DeepSeek Harness Chatroom

[简体中文](README.zh.md) | English

An out-of-tree [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web plugin that lets multiple browsers create and switch among persistent shared Sessions while retaining the complete native conversation UI.

## Features

- First-visit display-name and avatar selection with a durable, opaque browser-session cookie
- A shared-room directory that creates and switches among independent persistent Harness Sessions
- Human-first chat: ordinary messages do not wake the Agent; `@AI` or the configured AI display name explicitly requests a reply
- RC7's native `@` menu lists `@AI` and the configured AI name before other reference sources
- Harness's native live channel synchronizes messages, replies, and execution state
- Native sidebar, Conversation/Trajectory tabs, reasoning and tool flow, Session log, model selection, and composer
- Reply quotes and authenticated room-file upload/download cards
- Oversized images are resized before entering Harness's durable attachment store; stop/queue/steer behavior, slash commands, approvals, and question interactions stay native
- Participant names added on the Host before Session admission, so every browser and the model see the same identity
- Current identity and online count in the native Session header, with direct access to the shared-room directory
- Durable room membership with a group-management panel, member avatars, online state, and recent activity
- In-page message toasts, unread title badges, and opt-in browser system notifications across rooms
- Persistent branch replies in a right-side panel; every branch owns a separate Harness Session, and `@AI` answers stay inside that branch
- Asynchronous initialization: model, storage, or Session failures leave only the room offline and never block Harness Web startup
- No changes to the DeepSeek Harness repository

Version 0.6.0 establishes the collaboration-platform foundation: durable membership, live member management, room-wide unread notifications, and persistent branch conversations. A branch opens beside the native Harness conversation and uses its own Agent Session, so ordinary branch messages remain human chat and `@AI` produces an answer only in that branch. The main room continues to use Harness's complete native conversation interface.

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
    sseHeartbeatMs: 15000
```

`sessionId` remains the persistent Session for the pre-upgrade lobby. Rooms created in the UI receive independent Sessions and contexts. Every branch also receives an independent persistent Session. Room files, membership, branch metadata, and branch messages live in the same `chatroom` storage domain, and downloads require a valid chatroom cookie. The additive tables keep domain version zero, so existing identities and lobby data open without migration.

The API route is registered immediately and reports `503` until identity storage and the Session are ready. Initialization runs in the background, and failures remain isolated from Harness Web startup.

## Browser identity and security

The browser receives a random 256-bit token in an `HttpOnly`, `SameSite=Strict` cookie scoped to the chatroom API. The server stores only its SHA-256 digest. Reloading the page or restarting Harness restores the identity until the cookie expires or the user changes identity from the shared-room directory.

A display name is presentation, not authentication. Every participant who can reach the room can submit input to the configured Agent preset and may use its tools. Use a restricted preset and narrow `cwd` for rooms exposed beyond a trusted team.

## Verify

1. Open Harness Web, select **Shared sessions**, choose `Alice` and an avatar, then enter the existing lobby.
2. The native Session must open with sidebar, Conversation/Trajectory tabs, native composer, and Session log. No custom transcript should appear.
3. Reopen the directory and create **Project two**. It must open as another native Session, remain switchable from the sidebar, and keep independent history.
4. In a private window or another browser choose `Bob` and enter the same shared room.
5. Send ordinary text from Alice. Both pages must synchronize it without an AI reply. Typing `@` must list AI first; selecting it and sending must wake the Agent.
6. Select **Reply** below a human message. The composer must show the quote, and both browsers must render the same quote after sending.
7. Send an oversized image through the native image path; it must resize and synchronize. Send a file through **File**; the other browser must download the original bytes.
8. Run `/new`, approval and question interactions, and stop/queue/steer flows through their native Harness paths.
9. Open **Group management** in the Session header. Both participants must appear with the correct avatar and online state. Enable system notifications from this explicit user action, hide the tab, and verify that a new peer message creates a system alert and unread title badge.
10. Select **Branch** below a human or AI message. A right-side branch panel must open. Send ordinary branch text and confirm that the AI stays silent; send `@AI summarize` and confirm that the reply appears in the branch rather than the main room.
11. Reload and restart Harness. Identity, room directory, membership, branches, and every Session context must recover.

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
