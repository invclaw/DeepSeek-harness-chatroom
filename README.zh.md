# DeepSeek Harness 多人 AI 聊天室

简体中文 | [English](README.md)

这是一个独立于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 主仓库的 Web 插件。多人浏览器可以创建和切换多个持久共享 Session，同时完整复用 Harness 原生会话界面。

## 功能

- 可选的整站账号体系：支持密码注册、超级管理员统一建号、账号停用与会话撤销、修改密码，并在所有群聊间复用同一身份
- 可插拔认证：本地账号密码、通用企业 OIDC 授权码 + PKCE/nonce 回调，以及社区 `dsh-auth` 管理员身份均可接入
- 提供独立登录页和供网关 `forward_auth` 调用的 `/auth/verify`，可覆盖 Harness 页面、API、下载、SSE 和 WebSocket，不依赖前端遮罩充当安全边界
- 超级管理员后台统一管理注册策略、创建用户、角色/启停状态和 OIDC 提供方；Client Secret 加密保存且绝不回传浏览器
- 账号之间支持持久私聊，只有会话双方可见，并复用页内提醒、未读数和浏览器系统通知
- 关闭认证时继续保留旧的首次显示名称和头像选择；后续进入任何共享群都通过不透明浏览器会话 Cookie 自动恢复
- 每个普通 Harness 新会话会自动成为共享群聊，继续使用原生 Session、侧栏和会话创建流程
- 普通消息只用于人类聊天；明确输入 `@AI` 或 `@DeepSeek`（可配置名称）时才触发 Agent 回复
- RC7 原生 `@` 候选菜单同时提供 AI 和当前群成员；只有 `@AI` 或配置的 AI 名称会触发 Agent
- 消息、AI 回复和运行状态由 Harness 原生实时通道同步
- 保留原生侧栏、对话/轨迹页签、思考与工具过程、Session log、模型选择和输入框
- 远程部署可按聊天室 participant ID 白名单授权原生模型设置页；代理仅开放模型配置所需接口，宿主文件打开及其他特权接口仍保持禁用
- 支持表情选择、回复引用和聊天室文件上传/下载；图片和文件直接作为消息内容显示，不生成额外的文字提示气泡
- 超大图片自动缩放后写入 Harness 原生附件存储
- 停止/排队/转向、斜杠命令、批准授权和问答交互继续使用原生能力
- 真人消息在服务端写入 Session 前附加显示名称，其他房间成员和模型看到同一身份
- 会话头显示当前身份、在线人数和“群管理”；群管理从右侧抽屉打开，不再显示右下角共享按钮
- 群主、群管理员和平台超级管理员可在群管理抽屉搜索系统中的启用账号，勾选多位用户并直接拉入群聊；抽屉同时提供成员头像、在线状态和最近活跃时间
- 支持页内新消息提示、网页标题未读数，以及由用户主动开启的浏览器系统通知
- 支持在右侧分栏发起持久分支回复；分栏保留一套 Harness 原生运行时并原地切换分支 Session，原生 Markdown、图片/文件、模型选择、权限模式、停止/排队/转向、斜杠命令、审批、问答交互、Think/工具轨迹、失败详情和重试全部可用
- 分支原生输入框提供 AI 和群成员的 `@` 候选，每个分支使用独立 Harness Session；分支内 `@AI` 的回答、引用和工具运行只进入该分支，消息仍复用群聊头像、表情贴附、回复、转发和多选能力，且不会继续创建嵌套群聊分支
- 群聊和分支历史中的图片继续保留并正常显示；切换到不支持图片的文本模型时，插件只在该次模型请求中用说明文本替代历史图片，避免图片历史锁死后续 AI 回复
- 有新回复的分支会在根消息下方低干扰显示最近 3 条，点击即可打开右侧分栏
- 消息常驻“回复、点赞、转发”，复制、完整表情面板、多选和分支收进可点击的 `…` 菜单并保留右键入口；移动端使用全宽分支和底部操作菜单
- 消息支持持久表情贴附；进入多选后所有真人和 AI 消息显示复选框，可将 1–50 条消息合并转发到其他群，服务端从原始 Session 事件重建文本/Markdown、图片、文件、引用、嵌套转发和表情计数，避免浏览器篡改或丢字段
- 房间异步初始化：模型、存储或 Session 初始化失败只会让聊天室离线，不会阻碍 Harness Web 启动
- 不修改 DeepSeek Harness 主仓库

1.1.3 移除复制群邀请链接，改为群主、群管理员和平台超级管理员可见的系统账号搜索与多选器，勾选后即可把启用账号直接加入群聊。1.1.2 将“设置 → 群聊与账号”重做为不会横向溢出的原生设置单列，全面使用 Harness 主题令牌、带标签的账号与 OIDC 字段、响应式成员操作，以及与模型和 Agent 预设页面一致的模块底色、细边框和胶囊控件。1.1.1 不再写入用于初始化的伪造轮次，第一次 AI 运行完全沿用 Harness 原生轮次编号。1.1.0 让 Harness 新会话默认成为共享群聊，移除右下角启动按钮，并把账号、注册策略和 SSO 收敛到原生“设置 → 群聊与账号”；部署 dsh-auth 时默认优先使用它登录，`local=1` 保留本地账号应急入口。1.0.1 新增默认 SSO 自动跳转。

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

浏览器包通过插件的 `dsh.client` manifest 自动发现。插件会把普通 Harness Session 幂等绑定为共享群聊，并添加身份状态、群管理、输入候选和文件/回复控件；不会替换 Harness 的主对话、侧栏、详情或原生输入框。

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
    authEnabled: !!js Boolean(process.env.DSH_CHATROOM_AUTH_SECRET)
    authSecret: !!js process.env.DSH_CHATROOM_AUTH_SECRET ?? ''
    authPublicOrigin: !!js process.env.DSH_CHATROOM_AUTH_PUBLIC_ORIGIN ?? ''
    authBootstrapToken: !!js process.env.DSH_CHATROOM_AUTH_BOOTSTRAP_TOKEN ?? ''
    authAllowSelfRegistration: !!js process.env.DSH_CHATROOM_SELF_REGISTRATION !== 'disabled'
    authDshAuthHeaders: !!js process.env.DSH_CHATROOM_DSH_AUTH_HEADERS === 'enabled'
    authDshAuthVerifyUrl: !!js process.env.DSH_CHATROOM_DSH_AUTH_VERIFY_URL ?? ''
    authDshAuthLoginPath: !!js process.env.DSH_CHATROOM_DSH_AUTH_LOGIN_PATH ?? '/auth/login'
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
    authEnabled: true
    authCookieName: dsh_chatroom_auth
    authSessionMaxAgeSeconds: 2592000
    authSecret: 至少包含32个UTF-8字节的随机密钥
    authPublicOrigin: https://chat.example.com
    authBootstrapToken: 一次性超级管理员初始化口令
    authAllowSelfRegistration: true
    authDshAuthHeaders: false
    authDshAuthVerifyUrl: ''
    authDshAuthLoginPath: /auth/login
```

`authSecret` 用于加密 OIDC Client Secret，必须稳定保存在 Git 之外。本地密码使用带随机盐的 scrypt。第一次密码注册必须填写 `authBootstrapToken`，该账号会成为初始超级管理员；后续注册遵循“系统管理”里的动态策略。登录失败有内存限流，停用账号会撤销其全部会话，修改密码会轮换当前会话并撤销旧会话。认证 Cookie 是随机值，服务端只保存 SHA-256 摘要，使用 `HttpOnly`、`SameSite=Strict`、根路径，并在 `authPublicOrigin` 为 HTTPS 时加上 `Secure`。

### 企业 OIDC 与 dsh-auth

OIDC 提供方在 Harness 原生“设置 → 群聊与账号”中添加，界面显示的回调地址必须原样登记到企业身份平台。发现与授权码交换使用 OIDC discovery、PKCE、state 和 nonce；Client Secret 使用 `authSecret` 派生的 AES-256-GCM 密钥加密，不会回显到管理界面。部署 dsh-auth 时它会成为初始默认入口；没有 dsh-auth 时，唯一启用的外部认证会成为默认入口。超级管理员可以改选其他提供方或恢复登录选择页。需要排查 SSO 或使用本地超级管理员时，在原访问地址查询参数中加入 `local=1`。

要在保留本地多用户账号的同时复用 [`dsh-auth`](https://github.com/hxy91819/dsh-auth)，需让它的 `/auth/*` 路由继续在同一公网 Origin 可访问，并将 `DSH_CHATROOM_DSH_AUTH_VERIFY_URL` 指向它的回环 `/auth/verify`（如果插件运行在同一个 Harness listener，通常为 `http://127.0.0.1:3080/auth/verify`）。聊天室只把浏览器中的 dsh-auth Cookie 转发给该回环校验接口，并把验证成功的管理员导入为本地超级管理员。`DSH_CHATROOM_DSH_AUTH_HEADERS=enabled` 则直接信任代理注入的 `X-Dsh-Auth-*`，适用于已有 dsh-auth 托管网关的部署，网关必须先删除客户端伪造的同名 Header。dsh-auth 外层网关本身只允许它的单一管理员通过；若还要允许本地成员账号登录，应使用“回环校验适配”，而不是把单用户 dsh-auth 放在最外层。

### 整站网关保护

仅启用插件账号 API 并不能自动保护一个直接暴露公网的 Harness。生产部署必须让 Harness 只监听回环地址，并在公网 TLS 代理中完成以下规则：

1. 公网直接访问 `/plugins/deepseek-harness-chatroom/api/auth/verify` 固定返回 `404`。
2. 只放行明确的登录、注册、退出、`/auth/page`、`/auth/providers`、OIDC 与 dsh-auth 回调路由。
3. 其余 Harness 页面、静态资源、API、插件、SSE、下载和 WebSocket 都先向上述 verify 地址发起内部 `forward_auth` 子请求。
4. 用 `X-Original-URI` 传递原始地址；只对顶层页面请求把 `401 + X-Dsh-Auth-Login` 转成 `303`，并把校验响应中的 `Set-Cookie` 返回浏览器。
5. 删除客户端传入的 `X-Dsh-Auth-User-Id`、`X-Dsh-Auth-Username` 和 `X-Dsh-Auth-Roles`，再复制校验通过的值。

校验成功返回 `204` 和服务端身份 Header，未登录返回 `401` 和独立登录页位置。认证提供方异常不会阻碍 Harness 启动：插件路由仍会立即注册，自己的存储未就绪时返回 `503`，OIDC 或 dsh-auth 登录失败只影响对应登录请求。

`settingsAdminParticipantIds` 默认为空，远程浏览器因此不能读取或修改 Harness 配置。生产部署可通过逗号分隔的 `DSH_CHATROOM_SETTINGS_ADMIN_IDS` 环境变量设置白名单；当前身份的 `participantId` 可从已登录浏览器请求 `/plugins/deepseek-harness-chatroom/api/session` 的响应中读取。修改显示名称或头像不会改变该 ID；重置聊天室身份会生成新 ID，需要同步更新白名单。远程模型设置请求还必须携带有效的 HttpOnly 聊天室 Cookie 并通过同源检查。

`sessionId` 是升级前大厅继续使用的持久 Session。普通 Harness Session 第一次由已登录成员打开时，插件会按 Session ID 幂等建立共享群记录，不创建第二套会话；群主和管理员从群管理抽屉把启用的平台账号直接加入当前群聊。每个分支仍获得独立持久 Session。聊天室文件、成员、表情贴附、分支元数据、分支消息和分支引用保存在同一个 `chatroom` storage domain。

API 路由会立即注册，在存储和 Session 就绪前返回 `503`。初始化始终在后台运行，失败被限制在插件内部，Harness Web 仍可正常运行。

## 浏览器身份与安全

认证关闭时，旧版浏览器身份仍使用仅作用于聊天室 API 的随机 256 位 `HttpOnly`、`SameSite=Strict` Cookie；它只能标识参与者，不构成访问控制。认证启用后，前述账号 Cookie 是群聊、文件、图片、模型设置管理、通知和私聊的唯一身份依据。

显示名称只是房间展示身份，不是账号认证。远程模型设置授权只比较服务端从 HttpOnly Cookie 解析出的不透明 `participantId`，不相信可修改的显示名称。配置代理沿用 Harness API Proxy 的 schema 校验、机密脱敏和 revision 冲突检查；密钥值只允许写入且不会回传，`settings.openDocument`、Session、文件系统及其他特权接口不在代理列表内。所有能进入房间的人仍能向所选 Agent preset 提交输入，并可能使用该 preset 提供的工具。面向非完全可信成员时，应使用受限 preset 和范围尽可能小的 `cwd`。

## 验收

1. 打开 Harness Web 并完成登录或首次身份设置；页面不应出现右下角“共享会话”按钮。
2. 点击 Harness 原生“新会话”；新 Session 应自动成为共享群，保留侧栏、对话/轨迹、原生输入框和 Session log。
3. 在原生“设置 → 群聊与账号”确认账号、注册策略和 SSO 均可管理，不再出现插件自绘系统管理弹窗。
4. 用无痕窗口或另一个浏览器登录 `Bob`，让该平台账号进入群管理可选目录。
5. Alice 发送普通文字，两个页面应立即同步，且 AI 不回复；输入 `@` 时应同时看到 AI 和 Bob，提及 Bob 不触发 AI，提及 AI 才会获得回复。
6. 点击真人消息下方“回复”，输入区应显示引用；发送后两端显示同一引用卡片。
7. 通过“表情”插入一个表情；再分别发送纯图片和纯文件，消息中应只有图片或文件卡片，不应出现“发送了……”文字气泡；另一端应能下载完整原文件。
8. 执行 `/new` 等内置斜杠命令，并完成批准授权、问答交互、停止/排队/转向等原生流程。
9. 在会话头打开“群管理”；群主从系统账号目录搜索并勾选 Bob，直接加入当前群聊，右侧抽屉随后应显示双方头像和在线状态。群主修改群名、将 Bob 设为管理员，再由 Bob 修改群名；刷新后成员、名称和角色应保持。
10. 在真人或 AI 消息的 `…` 菜单点击“分支”，右侧应打开完整 Harness 原生会话。确认模型选择、权限模式、图片/文件、停止/转向、斜杠命令、审批、问答、Think/工具轨迹和失败重试均存在；输入 `@` 应看到 AI 和当前群成员，`@AI` 回答只进入分支。对任意分支回复执行复制、引用、贴表情、转发和多选，且分支消息不能继续发起群聊分支。连续发送 4 条消息后关闭分栏，根消息下方应显示总回复数和最近 3 条。
11. 打开任意真人或 AI 消息的 `…` 菜单选择“多选”，确认所有消息左侧都出现复选框；直接勾选包含 Markdown、引用、图片、文件和表情贴附的多条消息并合并转发到“项目二”，目标群的可展开记录卡片应原样保留这些内容。
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
