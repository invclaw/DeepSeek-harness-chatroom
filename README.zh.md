# DeepSeek Harness 多人 AI 聊天室

简体中文 | [English](README.md)

这是一个独立于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 主仓库的 Web 插件。多人浏览器可以创建和切换多个持久共享 Session，同时完整复用 Harness 原生会话界面。

## 功能

- 首次访问统一选择显示名称和头像；后续进入任何共享群都通过不透明浏览器会话 Cookie 自动恢复，无需重复设置
- 共享会话目录支持创建和切换多个相互独立的持久 Harness Session
- 普通消息只用于人类聊天；明确输入 `@AI` 或 `@DeepSeek`（可配置名称）时才触发 Agent 回复
- RC7 原生 `@` 候选菜单同时提供 AI 和当前群成员；只有 `@AI` 或配置的 AI 名称会触发 Agent
- 消息、AI 回复和运行状态由 Harness 原生实时通道同步
- 保留原生侧栏、对话/轨迹页签、思考与工具过程、Session log、模型选择和输入框
- 远程部署可按聊天室 participant ID 白名单授权原生模型设置页；代理仅开放模型配置所需接口，宿主文件打开及其他特权接口仍保持禁用
- 支持表情选择、回复引用和聊天室文件上传/下载；图片和文件直接作为消息内容显示，不生成额外的文字提示气泡
- 超大图片自动缩放后写入 Harness 原生附件存储
- 停止/排队/转向、斜杠命令、批准授权和问答交互继续使用原生能力
- 真人消息在服务端写入 Session 前附加显示名称，其他房间成员和模型看到同一身份
- 会话头显示当前身份与在线人数，可随时打开共享会话目录
- 群管理面板持久记录成员，显示成员头像、在线状态和最近活跃时间
- 支持页内新消息提示、网页标题未读数，以及由用户主动开启的浏览器系统通知
- 支持在右侧分栏发起持久分支回复；分支输入框提供 AI 和群成员的 `@` 候选，每个分支使用独立 Harness Session，分支内 `@AI` 的回答不会进入主群
- 群聊和分支历史中的图片继续保留并正常显示；切换到不支持图片的文本模型时，插件只在该次模型请求中用说明文本替代历史图片，避免图片历史锁死后续 AI 回复
- 有新回复的分支会在根消息下方低干扰显示最近 3 条，点击即可打开右侧分栏
- 消息支持持久表情贴附；右键菜单提供贴表情、转发和多选，进入多选后所有真人和 AI 消息显示复选框，可将 1–50 条消息合并转发到其他群
- 房间异步初始化：模型、存储或 Session 初始化失败只会让聊天室离线，不会阻碍 Harness Web 启动
- 不修改 DeepSeek Harness 主仓库

0.7.5 为 RC7 远程 Web 部署补充受聊天室管理员身份保护的模型配置通道，并兼容 RC7 当前依赖树中提前进入内存模式的共享 Settings mirror。Harness 原生配置面仍保持回环地址限制；插件只把 `settings`、`credentials` 和模型发现中设置模型所需的方法转发给白名单身份，不开放宿主文件、Session 或其他 API。0.7.3 加入的分支提及、文本模型图片历史兼容和原生消息渲染器装载顺序修复继续保留。

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
    settingsAdminParticipantIds: !!js (process.env.DSH_CHATROOM_SETTINGS_ADMIN_IDS ?? '').split(',').map(value => value.trim()).filter(Boolean)
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
    settingsAdminParticipantIds:
      - 当前管理员身份的-participant-id
    maxSettingsRequestBytes: 1048576
    sseHeartbeatMs: 15000
```

`settingsAdminParticipantIds` 默认为空，远程浏览器因此不能读取或修改 Harness 配置。生产部署可通过逗号分隔的 `DSH_CHATROOM_SETTINGS_ADMIN_IDS` 环境变量设置白名单；当前身份的 `participantId` 可从已登录浏览器请求 `/plugins/deepseek-harness-chatroom/api/session` 的响应中读取。修改显示名称或头像不会改变该 ID；重置聊天室身份会生成新 ID，需要同步更新白名单。远程模型设置请求还必须携带有效的 HttpOnly 聊天室 Cookie 并通过同源检查。

`sessionId` 是升级前大厅继续使用的持久 Session。通过界面新建的共享会话会获得独立 Session 和上下文，每个分支也会获得独立持久 Session。聊天室文件、成员、表情贴附、分支元数据和分支消息保存在同一个 `chatroom` storage domain，下载端点需要有效聊天室 Cookie。合并转发卡片作为原生 Session 消息持久化。新增表不改变 domain 版本，已有身份和大厅数据可直接读取。

API 路由会立即注册，在存储和 Session 就绪前返回 `503`。初始化始终在后台运行，失败被限制在插件内部，Harness Web 仍可正常运行。

## 浏览器身份与安全

浏览器收到随机 256 位令牌，Cookie 使用 `HttpOnly`、`SameSite=Strict`，且仅作用于聊天室 API。服务端只保存令牌的 SHA-256 摘要。刷新页面或重启 Harness 会恢复同一身份，直到 Cookie 过期或用户在共享会话目录中更换身份。

显示名称只是房间展示身份，不是账号认证。远程模型设置授权只比较服务端从 HttpOnly Cookie 解析出的不透明 `participantId`，不相信可修改的显示名称。配置代理沿用 Harness API Proxy 的 schema 校验、机密脱敏和 revision 冲突检查；密钥值只允许写入且不会回传，`settings.openDocument`、Session、文件系统及其他特权接口不在代理列表内。所有能进入房间的人仍能向所选 Agent preset 提交输入，并可能使用该 preset 提供的工具。面向非完全可信成员时，应使用受限 preset 和范围尽可能小的 `cwd`。

## 验收

1. 打开 Harness Web，点击“共享会话”，填写 `Alice` 并选择头像，再进入已有大厅。
2. 页面应切换到原生 Session，保留侧栏、对话/轨迹、原生输入框和 Session log；不应出现自绘聊天页。
3. 再打开共享会话目录，创建“项目二”；页面应进入新的原生 Session，侧栏能在它和大厅之间切换，历史互不混合。
4. 用无痕窗口或另一个浏览器填写 `Bob`，进入同一共享会话。
5. Alice 发送普通文字，两个页面应立即同步，且 AI 不回复；输入 `@` 时应同时看到 AI 和 Bob，提及 Bob 不触发 AI，提及 AI 才会获得回复。
6. 点击真人消息下方“回复”，输入区应显示引用；发送后两端显示同一引用卡片。
7. 通过“表情”插入一个表情；再分别发送纯图片和纯文件，消息中应只有图片或文件卡片，不应出现“发送了……”文字气泡；另一端应能下载完整原文件。
8. 执行 `/new` 等内置斜杠命令，并完成批准授权、问答交互、停止/排队/转向等原生流程。
9. 在会话头打开“群管理”；两名参与者应显示正确头像和在线状态。由此处主动开启系统通知，隐藏网页后让另一人发消息，应出现系统通知和网页标题未读数。
10. 在真人或 AI 消息下点击“分支”，右侧应打开分栏。输入 `@` 应看到 AI 和当前群成员；连续发送 4 条分支消息，关闭分栏后根消息下方应显示总回复数和最近 3 条；再发送 `@AI 总结`，AI 回答只能出现在当前分支并更新该摘要，不能进入主群。
11. 右键任意真人或 AI 消息选择“多选”，确认所有真人和 AI 消息左侧都出现复选框；直接勾选多条并合并转发到“项目二”，目标群应出现一张可展开记录卡片。
12. 切换到其他共享群，不应重新询问显示名称或头像。
13. 在群聊历史已有图片的前提下切换到不支持图片的文本模型，分别在主群和分支发送 `@AI 总结`；两处都应正常回复，历史图片仍应显示。
14. 刷新并重启 Harness；身份、共享会话目录、成员、表情贴附、分支和各 Session 上下文都应继恢复。
15. 将当前身份的 `participantId` 加入 `DSH_CHATROOM_SETTINGS_ADMIN_IDS` 后，从远程地址打开“设置 → 模型”；提供方目录和编辑卡片应正常加载，未在白名单内的另一身份应收到权限错误。

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
