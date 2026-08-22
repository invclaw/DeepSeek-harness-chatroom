# DeepSeek Harness 多人 AI 聊天室

简体中文 | [English](README.md)

这是一个独立于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 主仓库的 Web 插件。多人浏览器可以创建和切换多个持久共享 Session，同时完整复用 Harness 原生会话界面。

## 功能

- 首次访问选择显示名称和头像；后续通过不透明浏览器会话 Cookie 自动恢复
- 共享会话目录支持创建和切换多个相互独立的持久 Harness Session
- 普通消息只用于人类聊天；明确输入 `@AI` 或 `@DeepSeek`（可配置名称）时才触发 Agent 回复
- RC7 原生 `@` 候选菜单优先提供 `@AI` 和配置的 AI 名称
- 消息、AI 回复和运行状态由 Harness 原生实时通道同步
- 保留原生侧栏、对话/轨迹页签、思考与工具过程、Session log、模型选择和输入框
- 支持回复引用、聊天室文件上传/下载；超大图片自动缩放后写入 Harness 原生附件存储
- 停止/排队/转向、斜杠命令、批准授权和问答交互继续使用原生能力
- 真人消息在服务端写入 Session 前附加显示名称，其他房间成员和模型看到同一身份
- 会话头显示当前身份与在线人数，可随时打开共享会话目录
- 群管理面板持久记录成员，显示成员头像、在线状态和最近活跃时间
- 支持页内新消息提示、网页标题未读数，以及由用户主动开启的浏览器系统通知
- 支持在右侧分栏发起持久分支回复；每个分支使用独立 Harness Session，分支内 `@AI` 的回答不会进入主群
- 房间异步初始化：模型、存储或 Session 初始化失败只会让聊天室离线，不会阻碍 Harness Web 启动
- 不修改 DeepSeek Harness 主仓库

0.6.2 建立线上协作群聊的基础：持久成员、群管理、跨房间未读提醒和持久分支会话。分支在 Harness 原生会话右侧打开，普通分支消息仍是人类聊天，只有明确 `@AI` 才会唤醒该分支自己的 Agent；AI 回答只出现在分支中。主群继续完整使用 Harness 原生对话界面，直接进入群聊的访客在选择身份和头像期间也只会看到干净的成员气泡，不会暴露内部同步标记；消息时间戳无需悬停即可常驻显示。

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

浏览器包通过插件的 `dsh.client` manifest 自动发现。插件只添加共享会话入口、身份状态、输入候选和文件/回复控件；不会替换 Harness 的主对话、侧栏、详情或原生输入框。

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
    maxRoomTitleChars: 80
    maxMessageTextChars: 20000
    maxFileBytes: 20971520
    maxFilesPerMessage: 5
    maxMessageFileBytes: 52428800
    maxImageSidePixels: 4096
    sseHeartbeatMs: 15000
```

`sessionId` 是升级前大厅继续使用的持久 Session。通过界面新建的共享会话会获得独立 Session 和上下文，每个分支也会获得独立持久 Session。聊天室文件、成员、分支元数据和分支消息保存在同一个 `chatroom` storage domain，下载端点需要有效聊天室 Cookie。新增表不改变 domain 版本，已有身份和大厅数据可直接读取。

API 路由会立即注册，在存储和 Session 就绪前返回 `503`。初始化始终在后台运行，失败被限制在插件内部，Harness Web 仍可正常运行。

## 浏览器身份与安全

浏览器收到随机 256 位令牌，Cookie 使用 `HttpOnly`、`SameSite=Strict`，且仅作用于聊天室 API。服务端只保存令牌的 SHA-256 摘要。刷新页面或重启 Harness 会恢复同一身份，直到 Cookie 过期或用户在共享会话目录中更换身份。

显示名称只是房间展示身份，不是账号认证。所有能进入房间的人都能向所选 Agent preset 提交输入，并可能使用该 preset 提供的工具。面向非完全可信成员时，应使用受限 preset 和范围尽可能小的 `cwd`。

## 验收

1. 打开 Harness Web，点击“共享会话”，填写 `Alice` 并选择头像，再进入已有大厅。
2. 页面应切换到原生 Session，保留侧栏、对话/轨迹、原生输入框和 Session log；不应出现自绘聊天页。
3. 再打开共享会话目录，创建“项目二”；页面应进入新的原生 Session，侧栏能在它和大厅之间切换，历史互不混合。
4. 用无痕窗口或另一个浏览器填写 `Bob`，进入同一共享会话。
5. Alice 发送普通文字，两个页面应立即同步，且 AI 不回复；输入 `@` 时应先看到 AI 候选，选择后发送，AI 应回复。
6. 点击真人消息下方“回复”，输入区应显示引用；发送后两端显示同一引用卡片。
7. 通过原生图片入口发送超大图片，应自动缩放并同步；通过“文件”入口发送文件，另一端应能下载完整原文件。
8. 执行 `/new` 等内置斜杠命令，并完成批准授权、问答交互、停止/排队/转向等原生流程。
9. 在会话头打开“群管理”；两名参与者应显示正确头像和在线状态。由此处主动开启系统通知，隐藏网页后让另一人发消息，应出现系统通知和网页标题未读数。
10. 在真人或 AI 消息下点击“分支”，右侧应打开分栏。先发送普通分支消息，AI 不应回复；再发送 `@AI 总结`，AI 回答只能出现在当前分支，不能进入主群。
11. 刷新并重启 Harness；身份、共享会话目录、成员、分支和各 Session 上下文都应继续恢复。

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
