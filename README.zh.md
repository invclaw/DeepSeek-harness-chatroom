# DeepSeek Harness 多人 AI 聊天室

简体中文 | [English](README.md)

这是一个独立于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 主仓库的 Web 插件，把原本的一对一 Agent 对话扩展为实时同步的多人 AI 聊天室。

## 功能

- 首次访问选择显示身份；后续通过不透明浏览器会话 Cookie 自动恢复
- 所有人共享一份房间消息流，通过 Server-Sent Events 实时同步
- 房间使用一个持久 Harness Agent，会按顺序获取每个人的所有消息
- AI 对每条真人消息自主决定回复或保持沉默
- 自己的消息在右侧；AI 与其他人的消息在左侧
- 复用 Harness 主题、间距、正文宽度、输入框和气泡视觉语言的全屏聊天室
- 身份与消息在 Harness 重启后继续保留
- 进程中断前已经完成的 AI 回合可在启动时自动对账
- 房间异步初始化：模型未配置或房间存储失败只会让聊天室离线，不会阻碍 Harness Web 启动
- 不修改 DeepSeek Harness 主仓库

## 环境要求

- Node.js 22.19 或更高版本
- pnpm 10.33.4
- DeepSeek Harness 0.1.0-rc.7 或更高版本
- Web profile 已配置可用的默认模型

## 从 GitHub 安装

```sh
pnpm dsh plugin --profile web add github:sliverp/DeepSeek-harness-chatroom
pnpm dsh --profile web
```

安装本地检出：

```sh
pnpm dsh plugin --profile web add /absolute/path/to/DeepSeek-harness-chatroom
pnpm dsh --profile web
```

浏览器包通过插件的 `dsh.client` manifest 自动发现。插件只向 `shell.overlay` 添加一个独立入口，不会替换 Harness 的主对话、侧栏或详情组件。

## 配置

安装时会向 Web profile 加入：

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

需要调整时，在 `~/.dsh/profiles/web/cordis.patch.yml` 覆盖该行：

```yaml
- id: chatroom
  name: deepseek-harness-chatroom
  config:
    roomId: team-room
    roomTitle: 团队 AI 聊天室
    aiDisplayName: DeepSeek
    sessionId: chatroom-v1-team-room
    cwd: /允许房间Agent访问的绝对路径
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
      你正在一个多人 AI 聊天室中参与讨论，每条输入都会标出发言者。
      阅读完整房间记录，自主判断当前是否值得回复。
      不需要回复时，只输出 <CHATROOM_NO_REPLY>，不得添加其他字符。
      决定回复时，只输出要发到房间的自然语言正文。
```

`systemPrompt` 必须包含 `noReplyToken`。这样每条排队处理的真人消息都有明确且可持久化的 AI 决策，但保持沉默时不会在房间里生成伪消息。

`sessionId` 对应房间唯一的持久 Harness Agent。需要主动开始全新 AI 上下文时再修改它。浏览器身份和房间展示记录位于插件自己的存储域；只改 `sessionId` 不会删除这些数据。

API 路由会立即注册，在存储和 Agent 就绪前返回 `503`。初始化始终在后台运行，失败被限制在插件内部，Harness Web 仍可正常运行。

## 浏览器身份与安全

浏览器收到一个随机 256 位令牌，Cookie 使用 `HttpOnly`、`SameSite=Strict`，且仅作用于 `/chatroom/api`。服务端只保存令牌的 SHA-256 摘要。刷新页面或重启 Harness 会恢复同一身份，直到 Cookie 过期或用户点击“切换身份”。

显示名称只是房间展示身份，不是账号认证。请根据工作区敏感程度为 Harness Web 配置访问控制。所有能进入房间的人都能向所选 Agent preset 提交输入，也可能使用该 preset 提供的工具。面向非完全可信成员时，应使用受限 preset 和范围尽可能小的 `cwd`。

## 验收

1. 用一个浏览器 profile 打开 Harness Web，身份填写 `Alice`。
2. 用无痕窗口或另一个浏览器打开同一地址，身份填写 `Bob`。
3. Alice 发送消息；Alice 侧应显示在右边，Bob 侧应显示在左边。
4. Bob 发送消息；两个页面的消息顺序必须完全一致。
5. 发送 `DeepSeek，请回复“多人链路正常”`；AI 回复应同时出现在两个页面左侧。
6. 发送一条不需要回答的普通旁白；AI 可以保持沉默，但真人消息必须进入持久房间 Agent 会话。
7. 刷新两个页面；各自身份和完整共享记录必须恢复。
8. 停止并重启 Harness Web；身份、记录和 AI 上下文必须继续恢复。

健康检查位于 `/chatroom/api/health`。房间就绪时返回：

```json
{"ready":true}
```

## 开发

```sh
corepack pnpm@10.33.4 install
corepack pnpm@10.33.4 run check
```

## 许可证

MIT
