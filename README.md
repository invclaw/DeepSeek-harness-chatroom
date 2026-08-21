# DeepSeek Harness Chatroom

[简体中文](README.zh.md) | English

An out-of-tree [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web plugin that turns the one-to-one agent surface into a synchronized multi-user AI chatroom.

## Features

- First-visit display-name selection with a durable, opaque browser-session cookie
- One shared room transcript synchronized to every connected browser through Server-Sent Events
- One persistent Harness Agent session containing every participant's message in room order
- Autonomous AI participation: the model can reply or explicitly remain silent for each human message
- Current participant messages on the right; AI and other participants on the left
- A full-screen room surface using the Harness theme, spacing, content width, composer, and bubble language
- Durable identities and transcript across Harness restarts
- Automatic reconciliation of an AI turn that completed immediately before a process interruption
- Asynchronous room initialization: missing model configuration or room storage failure leaves only the room offline and never blocks Harness Web startup
- No changes to the DeepSeek Harness repository

## Requirements

- Node.js 22.19 or later
- pnpm 10.33.4
- DeepSeek Harness 0.1.0-rc.7 or later
- A working default model selection in the Harness Web profile

## Install from GitHub

```sh
pnpm dsh plugin --profile web add github:sliverp/DeepSeek-harness-chatroom
pnpm dsh --profile web
```

For a local checkout:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/DeepSeek-harness-chatroom
pnpm dsh --profile web
```

The browser bundle is discovered through the plugin's `dsh.client` manifest. The plugin contributes an additive `shell.overlay` entry and does not replace Harness conversation, sidebar, or details components.

## Configure

Installation adds this row to the Web profile:

```yaml
- id: chatroom
  name: deepseek-harness-chatroom
  config:
    roomId: lobby
    roomTitle: AI 聊天室
    aiDisplayName: DeepSeek
    sessionId: chatroom-v1-lobby
    cwd: !!js process.env.DSH_CHATROOM_CWD ?? process.cwd()
    agentPreset: standard
```

Override that row in `~/.dsh/profiles/web/cordis.patch.yml` to change room behavior:

```yaml
- id: chatroom
  name: deepseek-harness-chatroom
  config:
    roomId: team-room
    roomTitle: Team AI Room
    aiDisplayName: DeepSeek
    sessionId: chatroom-v1-team-room
    cwd: /absolute/path/available/to/the-room-agent
    agentPreset: standard
    cookieName: dsh_chatroom_session
    cookieMaxAgeSeconds: 31536000
    maxDisplayNameChars: 24
    maxMessageChars: 4000
    responseTimeoutMs: 180000
    aiRetryDelayMs: 5000
    sseHeartbeatMs: 15000
    noReplyToken: <CHATROOM_NO_REPLY>
    systemPrompt: |-
      You participate in a multi-user AI room. Every input identifies its speaker.
      Read the full room history and decide independently whether a response is useful.
      If no response is needed, output exactly <CHATROOM_NO_REPLY> and nothing else.
      Otherwise output only the natural-language message to send to the room.
```

`systemPrompt` must contain `noReplyToken`. The token gives every queued human message an explicit, durable AI decision without showing a synthetic reply in the room.

`sessionId` identifies the room's single persistent Harness Agent. Change it when intentionally starting a fresh AI context. Human identities and the displayed transcript remain in the plugin storage domain; changing only `sessionId` does not delete them.

The API route is registered immediately and reports `503` until storage and the Agent are ready. Initialization runs in the background, and all failures are contained within the plugin so Harness Web can continue running.

## Browser identity and security

The browser receives a random 256-bit token in an `HttpOnly`, `SameSite=Strict` cookie scoped to the chatroom API. The server stores only its SHA-256 digest. Reloading the page or restarting Harness restores the same participant identity until the cookie expires or the user selects **Switch identity**.

A display name is room presentation, not account authentication. Deploy Harness Web behind the access control appropriate for the workspace. Every participant who can reach this room can submit input to the configured Agent preset and therefore to its tools. Use a restricted preset and a narrow `cwd` for rooms exposed beyond a trusted team.

## Verify

1. Open Harness Web in one browser profile. Enter `Alice` on the identity screen.
2. Open the same URL in a private window or another browser. Enter `Bob`.
3. Send a message from Alice. It must appear immediately on the right for Alice and on the left for Bob.
4. Send a message from Bob. Both transcripts must remain in identical sequence.
5. Ask `DeepSeek，请回复“多人链路正常”`. The AI reply must appear on the left in both browsers.
6. Send an ordinary side remark that does not require an answer. The model may remain silent; the human message must still be present in the persistent room Agent session.
7. Reload both pages. Each browser must restore its own identity and the complete shared transcript.
8. Stop and restart Harness Web. The same identities, transcript, and AI context must recover.

The health endpoint is available at `/plugins/deepseek-harness-chatroom/api/health`, which remains reachable when a deployment proxies only Harness plugin paths. `/chatroom/api/health` is retained for direct Harness Web deployments. A ready room returns:

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
