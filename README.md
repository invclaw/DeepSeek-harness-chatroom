# DeepSeek Harness Chatroom

[简体中文](README.zh.md) | English

An out-of-tree [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web plugin that lets multiple browsers share one persistent Harness Session while retaining the complete native conversation UI.

## Features

- First-visit display-name selection with a durable, opaque browser-session cookie
- One persistent Session shared by every participant; Harness's native live channel synchronizes messages, replies, and execution state
- Native sidebar, Conversation/Trajectory tabs, reasoning and tool flow, Session log, model selection, and composer
- Native images, stop/queue/steer behavior, slash commands, approvals, and question interactions without plugin reimplementation
- Participant names added immediately before the native prompt admission, so every browser and the model see the same identity
- Current identity and online count in the native Session header, including identity switching
- Asynchronous initialization: model, storage, or Session failures leave only the room offline and never block Harness Web startup
- No changes to the DeepSeek Harness repository

Version 0.3.1 removes the former full-screen custom transcript and the model-silence prompt. The plugin is now only the identity and navigation layer around a native shared Session, so AI replies behave like an ordinary Harness conversation. Each browser keeps its own messages on the right while peer and AI messages render on the left through Harness' native message renderer. Participant names sit above their bubbles, leaving only message content inside. The entry dialog closes immediately when that Session is already selected, and a dismissed identity dialog stays closed until the user reopens it from the native Session header.

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

The browser bundle is discovered through the plugin's `dsh.client` manifest. It contributes only a `shell.overlay` launcher and identity status in the native Session header; it does not replace the conversation, sidebar, details, or composer components.

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
    sseHeartbeatMs: 15000
```

`sessionId` is the one persistent Session opened by every participant. Change it only when intentionally starting a fresh AI context. Upgrading the plugin does not create a separate conversation per participant.

The API route is registered immediately and reports `503` until identity storage and the Session are ready. Initialization runs in the background, and failures remain isolated from Harness Web startup.

## Browser identity and security

The browser receives a random 256-bit token in an `HttpOnly`, `SameSite=Strict` cookie scoped to the chatroom API. The server stores only its SHA-256 digest. Reloading the page or restarting Harness restores the identity until the cookie expires or the user selects the identity control in the Session header.

A display name is presentation, not authentication. Every participant who can reach the room can submit input to the configured Agent preset and may use its tools. Use a restricted preset and narrow `cwd` for rooms exposed beyond a trusted team.

## Verify

1. Open Harness Web, select **Enter AI Chatroom**, and choose `Alice`.
2. The existing native Session must open with sidebar, Conversation/Trajectory tabs, native composer, and Session log. The former custom full-screen transcript must not appear.
3. In a private window or another browser choose `Bob`; both pages must open the same `sessionId`.
4. Send text from Alice and Bob. Messages must appear as `Alice: …` and `Bob: …`, remain ordered in both pages, and receive normal AI replies.
5. Send an image and ask the model to describe it. The image and response must use native message nodes.
6. Run built-in commands such as `/new`; Harness's native command path must handle them.
7. Trigger an approval-requiring tool. The native approval composer must appear and complete the authorization.
8. Reload and restart Harness. The browser identity and shared Session context must recover.

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
