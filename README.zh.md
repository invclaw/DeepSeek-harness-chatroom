# DeepSeek Harness 多人 AI 聊天室

简体中文 | [English](README.md)

这是一个独立于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 主仓库的 Web 插件。多人浏览器共享一个持久 Harness Session，同时完整复用 Harness 原生会话界面。

## 功能

- 首次访问选择显示身份；后续通过不透明浏览器会话 Cookie 自动恢复
- 所有人打开同一个持久 Session，消息、AI 回复和运行状态由 Harness 原生实时通道同步
- 保留原生侧栏、对话/轨迹页签、思考与工具过程、Session log、模型选择和输入框
- 原生图片发送、停止/排队/转向、斜杠命令、批准授权和问答交互不经过插件重写
- 真人消息在进入原生 prompt 前附加显示名称，其他房间成员和模型看到同一身份
- 会话头显示当前身份与在线人数，可随时切换身份
- 房间异步初始化：模型、存储或 Session 初始化失败只会让聊天室离线，不会阻碍 Harness Web 启动
- 不修改 DeepSeek Harness 主仓库

0.3.1 移除了旧版自绘全屏聊天页和“AI 可静默”提示。聊天室现在只是原生共享 Session 的身份与导航层；AI 回复行为与普通 Harness 会话一致。每个浏览器只把自己的消息放在右侧，其他参与者和 AI 的消息通过 Harness 原生消息组件显示在左侧。参与者昵称位于气泡上方，气泡内部只显示消息正文。原生共享 Session 已选中时，入口弹窗会立即关闭；身份弹窗关闭后不会自行重现，需要时可从原生会话头重新打开。

## 环境要求

- Node.js 22.19 或更高版本
- pnpm 10.33.4
- DeepSeek Harness 0.1.0-rc.7 或更高版本
- Web profile 已配置可用的默认模型

## 从 GitHub 安装

升级旧版本时先移除原插件记录，再安装当前仓库：

```sh
pnpm dsh plugin --profile web remove deepseek-harness-chatroom
pnpm dsh plugin --profile web add github:sliverp/DeepSeek-harness-chatroom
pnpm dsh --profile web
```

安装本地检出：

```sh
pnpm dsh plugin --profile web add /absolute/path/to/DeepSeek-harness-chatroom
pnpm dsh --profile web
```

浏览器包通过插件的 `dsh.client` manifest 自动发现。插件只向 `shell.overlay` 添加入口，并向原生会话头添加身份状态；不会替换 Harness 的主对话、侧栏、详情或输入组件。

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

需要调整时，在 Web profile 的 `cordis.patch.yml` 覆盖配置：

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
    sseHeartbeatMs: 15000
```

`sessionId` 是所有成员共同打开的唯一持久 Session。只有在确实需要全新 AI 上下文时才修改它。插件升级不会新建每位成员各自的会话。

API 路由会立即注册，在存储和 Session 就绪前返回 `503`。初始化始终在后台运行，失败被限制在插件内部，Harness Web 仍可正常运行。

## 浏览器身份与安全

浏览器收到随机 256 位令牌，Cookie 使用 `HttpOnly`、`SameSite=Strict`，且仅作用于聊天室 API。服务端只保存令牌的 SHA-256 摘要。刷新页面或重启 Harness 会恢复同一身份，直到 Cookie 过期或用户点击会话头的身份按钮。

显示名称只是房间展示身份，不是账号认证。所有能进入房间的人都能向所选 Agent preset 提交输入，并可能使用该 preset 提供的工具。面向非完全可信成员时，应使用受限 preset 和范围尽可能小的 `cwd`。

## 验收

1. 打开 Harness Web，点击“进入 AI 聊天室”并填写 `Alice`。
2. 页面应切换到现有原生 Session，保留侧栏、对话/轨迹、原生输入框和 Session log；不应出现旧版全屏聊天页。
3. 用无痕窗口或另一个浏览器填写 `Bob`，两个页面应打开相同 `sessionId`。
4. Alice 和 Bob 分别发送文字；消息应显示为 `Alice：…`、`Bob：…`，两个页面顺序一致且 AI 正常回复。
5. 发送图片并要求 AI 描述；图片与回复应使用原生消息节点显示。
6. 执行 `/new` 等内置斜杠命令；命令应由 Harness 原生命令链处理。
7. 触发需要批准的工具；原生批准面板应出现在输入区并可完成授权。
8. 刷新和重启 Harness；身份与共享 Session 上下文应继续恢复。

健康检查位于 `/plugins/deepseek-harness-chatroom/api/health`。直接部署 Harness Web 时也可使用 `/chatroom/api/health`。房间就绪时返回：

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
