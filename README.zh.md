<div align="center">
  <h1>DeepSeek Harness 多人 AI 聊天室</h1>
  <p><strong>为 DeepSeek Harness 原生 Web 界面补上一套完整的多人协作层。</strong></p>
  <p>简体中文 · <a href="README.md">English</a></p>
  <p>
    <img alt="版本 1.1.16" src="https://img.shields.io/badge/version-1.1.16-4f6bff">
    <img alt="Harness 0.1.1-rc.2" src="https://img.shields.io/badge/DeepSeek_Harness-0.1.1--rc.2-111827">
    <img alt="pnpm 10.33.4" src="https://img.shields.io/badge/pnpm-10.33.4-f69220">
    <img alt="MIT 许可证" src="https://img.shields.io/badge/license-MIT-22c55e">
  </p>
</div>

在原生 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 工作区中并列提供群聊、Solo 和私聊，同时保留消息流、Agent 运行时、模型选择、权限模式、轨迹和 Session log，不创建第二套 Agent 对话界面。

<p align="center">
  <img src="docs/assets/group-chat.jpg" alt="包含头像、提及、表情贴附、图片、消息操作和分支预览的 Harness 共享群聊" width="100%">
</p>
<p align="center"><sub>人类优先聊天、原生 Agent 回复、富媒体、表情贴附和分支动态都在同一个 Session 中。</sub></p>

## 为什么是这个插件

| 原生 Harness 完整保留 | 多人协作能力补齐 | 身份体系可用于线上部署 |
| --- | --- | --- |
| Session、Agent 预设、模型、权限、Think/工具轨迹、审批、问答、斜杠命令、停止/排队/转向和失败重试全部沿用原生实现。 | 共享群聊、在线状态、提及、回复、表情贴附、图片文件、转发、多选、分支、消息提醒、群管理和私聊。 | 本地账号、管理员统一建号、角色与停用、`dsh-auth`、企业 OIDC/SSO、认证自动跳转和网关 `forward_auth`。 |

插件完全独立于 Harness 主仓库，**不修改 DeepSeek Harness**。初始化是异步的：聊天室存储、模型或 Session 失败只影响插件自身，不会阻碍 Harness Web 启动。

## 界面预览

<table>
  <tr>
    <td width="50%">
      <img src="docs/assets/new-group-setup.jpg" alt="在原生空白 Session 首屏直接创建群聊"><br>
      <strong>在原生欢迎页选择群聊或 Solo</strong><br>
      默认选中群聊，第一条普通消息发送时再建立 Room；随后从群管理邀请系统账号。
    </td>
    <td width="50%">
      <img src="docs/assets/group-management.jpg" alt="包含系统账号目录和群成员的群管理抽屉"><br>
      <strong>在当前会话中管理成员</strong><br>
      群主、群管理员和平台超级管理员直接添加系统已有账号，并查看角色和在线状态。
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <img src="docs/assets/account-settings.jpg" alt="Harness 原生群聊与账号设置页"><br>
      <strong>所有管理能力收敛到 Harness 设置</strong><br>
      注册策略、统一建号、角色、密码、私聊、`dsh-auth` 和 OIDC 提供方都沿用原生设置页设计语言。
    </td>
  </tr>
</table>

> 截图均直接采集自线上运行的 v1.1.5 产品界面，不是设计稿或 Mockup。

## 核心能力

### 共享群聊与人类优先 AI

- 工作区侧栏固定归纳为“群聊 / Solo / 私聊”：共享 Room 进入群聊，原生单人 Agent Session 进入 Solo，私聊目录列出系统全部可用账号。
- 点击“新会话”后继续使用原生欢迎页和输入框，并在群聊/Solo 开关中默认选中群聊；群聊的第一条普通消息才建立共享 Room，Solo 保留完整原生一对一 Agent 会话。
- 普通消息在人类之间实时同步；明确输入 `@AI` 或配置的 AI 名称会始终直接请求 Agent 回复，各群也可开启由判断模型控制的免 `@AI` 自动回复。
- 在“设置 → 群聊与账号”中可选择全局自动回复判断模型，并分别编辑主群/分支 Agent 与自动回复判断 Agent 的系统提示词；保存后下一轮生效，无需重启 Harness。
- 原生 `@` 菜单同时列出 Agent 和当前群成员。发送者身份在 Host 接纳 Session 消息前写入，浏览器和模型看到相同的发言人。
- 共享会话继续使用原生侧栏，并增加更舒展的行高和成员九宫格群头像；在原生侧栏重命名会同步写入持久群名，切换会话和重启后都不会回滚。
- 群聊消息流和输入框使用整个可用内容列，不再受原生固定宽度上限约束。
- 会话头显示当前身份、在线人数和“群管理”；跨群页内提示、标题未读数和可选浏览器系统通知全部可用。

### 完整复用原生 Agent

- 原生侧栏、对话/轨迹页签、输入框、模型与权限选择、思考/工具过程、Session log、审批、问答、斜杠命令、停止/排队/转向、失败详情和重试全部保留。
- Agent 运行期间保持 Think 与工具行可见；最终答案输出完成后，前面的执行过程自动合并成一个可展开的摘要。
- 持久分支从右侧分栏打开，每个分支拥有独立 Harness Session；支持 Markdown、`@` 候选、图片/文件、引用、贴表情、转发、多选及完整 Agent 能力，但不会继续创建嵌套群聊分支。访问网关拒绝嵌入页面时立即切换到分支兼容视图，不再等待超时；完整 Agent 仍可在新标签打开。
- 历史图片持久保存。选用纯文本模型时，只有本次模型请求会把图片替换为确定性的说明文字，界面仍显示原图。

### 消息与富媒体

- IOA、OIDC 等企业身份提供方返回的真实头像会用于消息、成员目录、邀请列表、私聊和群头像；没有企业头像或图片加载失败时，稳定降级为账号对应的卡通头像。
- 常驻时间戳、回复引用、表情输入、消息贴表情、Markdown、图片预览以及经过认证的文件上传下载。
- 纯图片和纯文件直接作为消息显示，不额外生成“发送了图片/文件”的占位气泡；超大图片写入 Harness 附件存储前会自动缩放。
- 回复、点赞、分支和转发可直接点击；复制、完整表情面板、多选保留在 `…`/右键菜单，移动端使用底部操作面板。
- 合并转发由服务端从权威 Session 事件重建，保留文本/Markdown、图片、文件、引用、嵌套转发和表情计数。

### 账号、SSO 与私聊

- 可选本地账号密码注册、超级管理员统一建号、角色与启停、密码轮换和会话撤销；同一身份在所有群聊中复用。
- 可接入本地账号、[`dsh-auth`](https://github.com/hxy91819/dsh-auth) 或企业 OIDC 授权码流程，包含 discovery、PKCE、state 和 nonce。
- 可让未登录用户自动跳转到指定外部认证；`local=1` 始终保留本地账号应急入口。
- 账号之间支持持久私聊，只有双方可见，包含 Enter 发送、Shift+Enter 换行、表情、图片和文件，并复用未读数、页内提示和浏览器通知；私聊文件夹同时承担通讯录能力，首次点击任意用户头像即可在 Harness 主会话区开始聊天。

<details>
<summary><strong>近期版本</strong></summary>

- **1.1.16** — 以 DeepSeek Harness 0.1.1-rc.2 为主要兼容基线，新增群聊、Solo、私聊分类导航，支持带文件和表情的原生私聊、新会话模式切换、群聊置顶、AI 自动唤起设置与 AI/成员分组提及，并保留 1.1.15 的 IOA 头像和原生 Session 绑定修复。
- **1.1.15** — 增加分支主题与盒模型的 Chromium 回归门禁，并避免移动端全宽分支面板超出视口。
- **1.1.14** — 让 Harness 消息操作行随 AI 分支摘要自动增高，避免摘要与吸底输入框重叠。
- **1.1.13** — 分支面板和回复摘要跟随宿主明暗配色，并让 AI 分支摘要进入消息正常布局、稳定停留在输入框上方。
- **1.1.12** — 每个原生侧栏群头像都按权威 Session ID 绑定，同名会话、选中态变化和行重排不再导致群头像串换。
- **1.1.11** — 群聊切换时保持群头像的身份与排序稳定，并让初始房间目录直接携带企业头像。
- **1.1.10** — 贯通 dsh-auth/IOA 与 OIDC 企业头像，在所有聊天表面优先显示真实照片并保留卡通降级。
- **1.1.9** — 原生侧栏重命名持久化为群名，并为共享会话增加更高的行距和成员九宫格群头像。
- **1.1.8** — 原生分支 frame 被网关拦截时立即启用消息兼容视图，保留完整 Agent 直达入口，并把含大量 Markdown 的分支主题收敛为短标题。
- **1.1.7** — 隔离分支运行时启动时保持目标 Session，不再跳回父群聊。
- **1.1.6** — 新建或恢复分支时把分支 Session 挂载到原生 Workspace，保留的 Harness iframe 可以直接选中目标会话，不再等待到超时。
- **1.1.5** — 在原生空白 Session 首屏直接建群并勾选平台成员。
- **1.1.4** — 保证原生“新会话”创建独立 Session，并排除分支 Session 的空白会话复用。
- **1.1.3** — 移除复制邀请链接，改为直接从系统账号目录选择成员。
- **1.1.2** — 用 Harness 原生设计语言重做“设置 → 群聊与账号”。
- **1.1.0** — Harness Session 默认共享，加入账号/SSO 管理，安装 `dsh-auth` 时默认优先使用它登录。

</details>

## 环境要求

- Node.js 22.19 或更高版本
- pnpm 10.33.4
- 主要兼容目标为 DeepSeek Harness 0.1.1-rc.2；最低仍支持 0.1.0-rc.7。
- Web profile 已配置可用的默认模型

### 回归门禁

`pnpm check` 负责类型检查、可观察行为测试和生产构建。CI 还会安装 Chromium 并运行 `pnpm test:browser`，验证分支面板的明暗 computed color，以及 AI 分支摘要会撑开 Harness 原生操作行且不与输入框重叠。浏览器断言使用盒模型和计算样式，不依赖易碎的截图快照。

## 从 GitHub 安装

升级旧版本时先移除原插件记录，再安装当前仓库：

```sh
pnpm dsh plugin --profile web remove deepseek-harness-chatroom
pnpm dsh plugin --profile web add github:invclaw/DeepSeek-harness-chatroom
pnpm dsh --profile web
```

安装本地检出：

```sh
pnpm dsh plugin --profile web add /absolute/path/to/DeepSeek-harness-chatroom
pnpm dsh --profile web
```

浏览器包通过插件的 `dsh.client` manifest 自动发现。新 Session 默认选择群聊，并只在第一条普通消息发送时幂等绑定为共享 Room；Solo 保持原生 Session。插件添加身份状态、三类侧栏目录、群管理、通讯录、输入候选和文件/回复控件，不替换 Harness 的主对话、详情或原生输入框。

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
    authMode: !!js process.env.DSH_CHATROOM_AUTH_MODE ?? 'local'
    authDshAuthSuperAdminSubjects: !!js (process.env.DSH_CHATROOM_DSH_AUTH_SUPER_ADMINS ?? '').split(',').map(value => value.trim()).filter(Boolean)
    authDshAuthAvatarUrlTemplate: !!js process.env.DSH_CHATROOM_DSH_AUTH_AVATAR_TEMPLATE ?? ''
    authDshAuthAvatarAllowedOrigins: !!js (process.env.DSH_CHATROOM_DSH_AUTH_AVATAR_ORIGINS ?? '').split(',').map(value => value.trim()).filter(Boolean)
    authDshAuthRevalidateSeconds: !!js Number(process.env.DSH_CHATROOM_DSH_AUTH_REVALIDATE_SECONDS ?? 60)
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
    authMode: local
    authDshAuthSuperAdminSubjects: []
    authDshAuthAvatarUrlTemplate: ''
    authDshAuthAvatarAllowedOrigins: []
    authDshAuthRevalidateSeconds: 60
```

`authSecret` 用于加密 OIDC Client Secret，必须稳定保存在 Git 之外。本地密码使用带随机盐的 scrypt。第一次密码注册必须填写 `authBootstrapToken`，该账号会成为初始超级管理员；后续注册遵循“系统管理”里的动态策略。登录失败有内存限流，停用账号会撤销其全部会话，修改密码会轮换当前会话并撤销旧会话。认证 Cookie 是随机值，服务端只保存 SHA-256 摘要，使用 `HttpOnly`、`SameSite=Strict`、根路径，并在 `authPublicOrigin` 为 HTTPS 时加上 `Secure`。

### 企业 OIDC 与 dsh-auth

OIDC 提供方在 Harness 原生“设置 → 群聊与账号”中添加，界面显示的回调地址必须原样登记到企业身份平台。发现与授权码交换使用 OIDC discovery、PKCE、state 和 nonce；Client Secret 使用 `authSecret` 派生的 AES-256-GCM 密钥加密，不会回显到管理界面。部署 dsh-auth 时它会成为初始默认入口；没有 dsh-auth 时，唯一启用的外部认证会成为默认入口。超级管理员可以改选其他提供方或恢复登录选择页。`local=1` 应急入口仅适用于 `hybrid`/`local` 模式。

要在保留本地多用户账号的同时复用 [`dsh-auth`](https://github.com/hxy91819/dsh-auth)，需让它的 `/auth/*` 路由继续在同一公网 Origin 可访问，并将 `DSH_CHATROOM_DSH_AUTH_VERIFY_URL` 指向它的回环 `/auth/verify`（如果插件运行在同一个 Harness listener，通常为 `http://127.0.0.1:3080/auth/verify`）。聊天室只把浏览器中的 dsh-auth Cookie 转发给该回环校验接口，并把验证成功的账号导入为普通成员；`authDshAuthSuperAdminSubjects` 中列出的 subject 才是全局超级管理员。生产环境可设 `authMode: dsh-auth-only`、关闭自主注册并将复核周期保持为 60 秒；此模式隐藏本地密码和 OIDC 入口，并在上游会话撤销后拒绝访问，`local=1` 应急入口仅适用于 `hybrid`/`local` 模式。`DSH_CHATROOM_DSH_AUTH_HEADERS=enabled` 仅适用于受信任网关兼容场景，网关必须先删除客户端伪造的同名 Header。头像只保存 HTTPS URL；可用 `authDshAuthAvatarUrlTemplate` 并配合 `authDshAuthAvatarAllowedOrigins`，加载失败自动回退内置头像。

### 整站网关保护

仅启用插件账号 API 并不能自动保护一个直接暴露公网的 Harness。生产部署必须让 Harness 只监听回环地址，并在公网 TLS 代理中完成以下规则：

1. 公网直接访问 `/plugins/deepseek-harness-chatroom/api/auth/verify` 固定返回 `404`。
2. 只放行明确的登录、注册、退出、`/auth/page`、`/auth/providers`、OIDC 与 dsh-auth 回调路由。
3. 其余 Harness 页面、静态资源、API、插件、SSE、下载和 WebSocket 都先向上述 verify 地址发起内部 `forward_auth` 子请求。
4. 用 `X-Original-URI` 传递原始地址；只对顶层页面请求把 `401 + X-Dsh-Auth-Login` 转成 `303`，并把校验响应中的 `Set-Cookie` 返回浏览器。
5. 删除客户端传入的 `X-Dsh-Auth-User-Id`、`X-Dsh-Auth-Subject`、`X-Dsh-Auth-Username`、`X-Dsh-Auth-Display-Name`、`X-Dsh-Auth-Picture` 和 `X-Dsh-Auth-Roles`，再复制校验通过的值。缺少后四个资料 Header 时认证仍可用，但聊天室只能显示账号名和卡通头像。

校验成功返回 `204` 和服务端身份 Header，未登录返回 `401` 和独立登录页位置。认证提供方异常不会阻碍 Harness 启动：插件路由仍会立即注册，自己的存储未就绪时返回 `503`，OIDC 或 dsh-auth 登录失败只影响对应登录请求。

`settingsAdminParticipantIds` 默认为空，远程浏览器因此不能读取或修改 Harness 配置。生产部署可通过逗号分隔的 `DSH_CHATROOM_SETTINGS_ADMIN_IDS` 环境变量设置白名单；当前身份的 `participantId` 可从已登录浏览器请求 `/plugins/deepseek-harness-chatroom/api/session` 的响应中读取。修改显示名称或头像不会改变该 ID；重置聊天室身份会生成新 ID，需要同步更新白名单。远程模型设置请求还必须携带有效的 HttpOnly 聊天室 Cookie 并通过同源检查。

`sessionId` 是升级前大厅继续使用的持久 Session。普通 Harness Session 第一次由已登录成员打开时，插件会按 Session ID 幂等建立共享群记录，不创建第二套会话；群主和管理员从群管理抽屉把启用的平台账号直接加入当前群聊。每个分支仍获得独立持久 Session。聊天室文件、成员、表情贴附、分支元数据、分支消息和分支引用保存在同一个 `chatroom` storage domain。

API 路由会立即注册，在存储和 Session 就绪前返回 `503`。初始化始终在后台运行，失败被限制在插件内部，Harness Web 仍可正常运行。

## 浏览器身份与安全

认证关闭时，旧版浏览器身份仍使用仅作用于聊天室 API 的随机 256 位 `HttpOnly`、`SameSite=Strict` Cookie；它只能标识参与者，不构成访问控制。认证启用后，前述账号 Cookie 是群聊、文件、图片、模型设置管理、通知和私聊的唯一身份依据。

显示名称只是房间展示身份，不是账号认证。远程模型设置授权只比较服务端从 HttpOnly Cookie 解析出的不透明 `participantId`，不相信可修改的显示名称。配置代理沿用 Harness API Proxy 的 schema 校验、机密脱敏和 revision 冲突检查；密钥值只允许写入且不会回传，`settings.openDocument`、Session、文件系统及其他特权接口不在代理列表内。所有能进入房间的人仍能向所选 Agent preset 提交输入，并可能使用该 preset 提供的工具。面向非完全可信成员时，应使用受限 preset 和范围尽可能小的 `cwd`。

## 验收

1. 打开 Harness Web 并完成登录或首次身份设置；页面不应出现右下角“共享会话”按钮。
2. 点击 Harness 原生“新会话”；原生欢迎页应显示默认选中“群聊”的“群聊 / Solo”开关，不出现命名或拉人表单。群聊发送第一条普通消息后进入侧栏“群聊”，切换 Solo 后发送消息则进入“Solo”；两者都保留对话/轨迹、原生输入框和 Session log。
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
