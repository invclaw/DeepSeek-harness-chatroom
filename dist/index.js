// src/config.ts
import { isAbsolute } from "path";
import z from "@deepseek-ai/schemastery";
var Config = z.object({
  roomId: z.string().min(1).max(64).pattern(/^[a-z0-9][a-z0-9_-]*$/u).default("lobby"),
  roomTitle: z.string().min(1).max(80).default("AI \u804A\u5929\u5BA4"),
  aiDisplayName: z.string().min(1).max(40).default("DeepSeek"),
  sessionId: z.string().min(1).max(160).default("chatroom-v1-lobby"),
  cwd: z.string().required(),
  agentPreset: z.string().min(1).default("standard"),
  cookieName: z.string().pattern(/^[A-Za-z0-9_]+$/u).default("dsh_chatroom_session"),
  cookieMaxAgeSeconds: z.number().step(1).min(60).max(31536e3).default(31536e3),
  maxDisplayNameChars: z.number().step(1).min(1).max(80).default(24),
  maxRoomTitleChars: z.number().step(1).min(1).max(160).default(80),
  maxMessageTextChars: z.number().step(1).min(1).max(2e5).default(2e4),
  maxFileBytes: z.number().step(1).min(1).max(100 * 1024 * 1024).default(20 * 1024 * 1024),
  maxFilesPerMessage: z.number().step(1).min(1).max(20).default(5),
  maxMessageFileBytes: z.number().step(1).min(1).max(200 * 1024 * 1024).default(50 * 1024 * 1024),
  maxImageSidePixels: z.number().step(1).min(512).max(16384).default(4096),
  sseHeartbeatMs: z.number().step(1).min(5e3).max(12e4).default(15e3)
});
function validateConfig(config) {
  if (!isAbsolute(config.cwd)) {
    throw new Error(`chatroom: cwd must be absolute, got ${JSON.stringify(config.cwd)}`);
  }
  if (config.maxMessageFileBytes < config.maxFileBytes) {
    throw new Error("chatroom: maxMessageFileBytes must be greater than or equal to maxFileBytes");
  }
}

// src/cookies.ts
function cookieValue(header, name2) {
  if (header === void 0) return void 0;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0 || part.slice(0, index).trim() !== name2) continue;
    const value = part.slice(index + 1).trim();
    return /^[A-Za-z0-9_-]+$/u.test(value) ? value : void 0;
  }
  return void 0;
}
function sessionCookie(name2, token, maxAgeSeconds, path) {
  return `${name2}=${token}; Path=${path}; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Strict`;
}
function expiredSessionCookie(name2, path) {
  return `${name2}=; Path=${path}; Max-Age=0; HttpOnly; SameSite=Strict`;
}

// src/routes.ts
var CHATROOM_API_PREFIX = "/plugins/deepseek-harness-chatroom/api";
var LEGACY_CHATROOM_API_PREFIX = "/chatroom/api";
var CHATROOM_API_PREFIXES = [CHATROOM_API_PREFIX, LEGACY_CHATROOM_API_PREFIX];
function matchChatroomApi(pathname) {
  for (const prefix of CHATROOM_API_PREFIXES) {
    if (pathname === prefix) return { prefix, endpoint: "" };
    if (pathname.startsWith(`${prefix}/`)) return { prefix, endpoint: pathname.slice(prefix.length) };
  }
  return void 0;
}

// src/room.ts
import { createHash, randomBytes, randomUUID } from "crypto";
import { resolveSessionPreset } from "@deepseek-ai/dsh-agent-presets";
import { AttachmentError } from "@deepseek-ai/dsh-attachment";
import { createUserMessage } from "@deepseek-ai/dsh-llm";
import { SessionId } from "@deepseek-ai/dsh-session";

// src/avatars.ts
var CHATROOM_AVATARS = [
  { id: "whale", emoji: "\u{1F433}", label: "\u9CB8\u9C7C" },
  { id: "panda", emoji: "\u{1F43C}", label: "\u718A\u732B" },
  { id: "fox", emoji: "\u{1F98A}", label: "\u72D0\u72F8" },
  { id: "cat", emoji: "\u{1F431}", label: "\u732B\u54AA" },
  { id: "dog", emoji: "\u{1F436}", label: "\u72D7\u72D7" },
  { id: "rabbit", emoji: "\u{1F430}", label: "\u5154\u5B50" },
  { id: "octopus", emoji: "\u{1F419}", label: "\u7AE0\u9C7C" },
  { id: "unicorn", emoji: "\u{1F984}", label: "\u72EC\u89D2\u517D" }
];
function isChatroomAvatarId(value) {
  return typeof value === "string" && CHATROOM_AVATARS.some((avatar) => avatar.id === value);
}
function fallbackAvatarId(seed) {
  let hash = 0;
  for (const character of seed) hash = hash * 31 + character.codePointAt(0) >>> 0;
  return CHATROOM_AVATARS[hash % CHATROOM_AVATARS.length].id;
}

// src/domain.ts
import { z as z2 } from "zod";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
var nonNegativeSafeInteger = z2.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
var identitySchema = z2.object({
  participantId: z2.uuid(),
  displayName: z2.string().min(1),
  avatarId: z2.string().refine(isChatroomAvatarId).optional(),
  createdAt: nonNegativeSafeInteger,
  lastSeenAt: nonNegativeSafeInteger
}).refine((record) => record.lastSeenAt >= record.createdAt, {
  path: ["lastSeenAt"],
  message: "lastSeenAt must not precede createdAt"
});
var messageSchema = z2.object({
  id: z2.string().min(1),
  sequence: nonNegativeSafeInteger,
  role: z2.union([z2.literal("human"), z2.literal("ai")]),
  participantId: z2.string().min(1),
  displayName: z2.string().min(1),
  text: z2.string().min(1),
  createdAt: nonNegativeSafeInteger,
  inReplyTo: z2.string().min(1).optional(),
  aiProcessed: z2.boolean().optional()
});
var fileSchema = z2.object({
  id: z2.uuid(),
  roomId: z2.string().min(1),
  participantId: z2.string().min(1),
  displayName: z2.string().min(1),
  name: z2.string().min(1),
  mediaType: z2.string().min(1),
  bytes: nonNegativeSafeInteger,
  data: z2.string().min(1),
  createdAt: nonNegativeSafeInteger
});
var roomSchema = z2.object({
  id: z2.string().min(1),
  title: z2.string().min(1),
  aiDisplayName: z2.string().min(1),
  sessionId: z2.string().min(1),
  createdAt: nonNegativeSafeInteger,
  createdBy: z2.string().min(1)
});
var chatroomDomainSpec = defineDomain({
  name: "chatroom",
  version: 0,
  tables: {
    identities: domainTable(identitySchema),
    messages: domainTable(messageSchema),
    rooms: domainTable(roomSchema),
    files: domainTable(fileSchema)
  }
});

// src/message.ts
var PARTICIPANT_MARKER_START = "\u2063dsh-chatroom:";
var PARTICIPANT_MARKER_END = "\u2063";
var REPLY_MARKER_START = "\u2063dsh-chatroom-reply:";
var FILE_MARKER_START = "\u2063dsh-chatroom-file:";
function identifyChatroomText(text, identity) {
  return `${PARTICIPANT_MARKER_START}${identity.participantId}|${identity.avatarId}${PARTICIPANT_MARKER_END}${identity.displayName}\uFF1A${text}`;
}
function identifyPrompt(content, identity, reply) {
  let identified = false;
  const output = content.map((part) => {
    if (identified || part.type !== "text") return part;
    identified = true;
    return { ...part, text: identifyChatroomText(reply === void 0 ? part.text : identifyReplyText(part.text, reply), identity) };
  });
  const fallback = content.some((part) => part.type === "file") ? "\u53D1\u9001\u4E86\u6587\u4EF6\u3002" : "\u53D1\u9001\u4E86\u4E00\u5F20\u56FE\u7247\u3002";
  return identified ? output : [{ type: "text", text: identifyChatroomText(reply === void 0 ? fallback : identifyReplyText(fallback, reply), identity) }, ...output];
}
function identifyReplyText(text, reply) {
  return `${REPLY_MARKER_START}${encodePayload(reply)}${PARTICIPANT_MARKER_END}${replyPrefix(reply)}${text}`;
}
function identifyFileText(file) {
  return `
${FILE_MARKER_START}${encodePayload(file)}${PARTICIPANT_MARKER_END}${filePrefix(file)}`;
}
function mentionsAi(content, aiDisplayName) {
  const text = content.filter((part) => part.type === "text").map((part) => part.text).join("\n");
  return [aiDisplayName, "AI"].some((name2) => mentionPattern(name2).test(text));
}
function mentionPattern(name2) {
  const escaped = name2.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return new RegExp(`@${escaped}(?=$|[^\\p{L}\\p{N}_])`, "iu");
}
function replyPrefix(reply) {
  return `\u56DE\u590D ${reply.displayName}\u300C${reply.text}\u300D
`;
}
function filePrefix(file) {
  return `\u6587\u4EF6\uFF1A${file.name}`;
}
function encodePayload(value) {
  return encodeURIComponent(JSON.stringify(value));
}

// src/room.ts
var ChatroomInputError = class extends Error {
};
var ChatroomRuntime = class {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
  }
  ctx;
  config;
  domain;
  identities;
  roomRecords;
  files;
  states = /* @__PURE__ */ new Map();
  ready = false;
  stopping = false;
  /** Public metadata for the configured legacy room. */
  get room() {
    return this.requireRoom(this.config.roomId);
  }
  /** Ordered public room directory. */
  get rooms() {
    const records = [...this.states.values()].map((state) => state.record);
    records.sort((left, right) => {
      if (left.id === this.config.roomId) return -1;
      if (right.id === this.config.roomId) return 1;
      return left.createdAt - right.createdAt || left.id.localeCompare(right.id);
    });
    return records.map(publicRoom);
  }
  /** Maximum accepted JSON body for one text, image, and file room submission. */
  get maxPromptRequestBytes() {
    const { maxImagesPerMessage, maxMessageImageBytes } = this.ctx.attachments.imageLimits;
    const encodedImages = Math.ceil(maxMessageImageBytes / 3) * 4;
    const encodedFiles = Math.ceil(this.config.maxMessageFileBytes / 3) * 4;
    return encodedImages + encodedFiles + this.config.maxMessageTextChars * 4 + (maxImagesPerMessage + this.config.maxFilesPerMessage) * 2048 + 8192;
  }
  /** Whether identity persistence and the configured shared Session are ready. */
  get isReady() {
    return this.ready && !this.stopping;
  }
  /** Open storage, seed the original room, and acquire its Session without blocking Harness startup. */
  async start() {
    const domain = await this.ctx.storageDomain.open(chatroomDomainSpec);
    this.domain = domain;
    this.identities = domain.table("identities");
    this.roomRecords = domain.table("rooms");
    this.files = domain.table("files");
    await this.seedConfiguredRoom();
    for (const [, record] of this.requireRoomRecords().entries()) {
      this.states.set(record.id, newRoomState(record));
    }
    await this.ensureRoom(this.config.roomId);
    this.ready = true;
  }
  /** Stop intake, close presence streams, and release every activated room. */
  async stop() {
    if (this.stopping) return;
    this.stopping = true;
    this.ready = false;
    for (const state of this.states.values()) {
      for (const client of state.clients) client.response.end();
      state.clients.clear();
    }
    await Promise.allSettled([...this.states.values()].map(async (state) => {
      await state.admission;
      await state.activation?.catch(() => void 0);
      await state.binding?.release();
      state.binding = void 0;
    }));
    this.states.clear();
    await this.domain?.close();
    this.domain = void 0;
    this.identities = void 0;
    this.roomRecords = void 0;
    this.files = void 0;
  }
  /** Resolve an opaque cookie token to its durable identity. */
  identity(token) {
    if (!this.isReady || token === void 0) return void 0;
    const record = this.requireIdentities().get(tokenHash(token));
    return record === void 0 ? void 0 : publicIdentity(record);
  }
  /** Mint and durably bind a new browser identity. */
  async createIdentity(displayName, avatarId) {
    this.assertReady();
    const normalized = normalizeDisplayName(displayName, this.config.maxDisplayNameChars);
    const token = randomBytes(32).toString("base64url");
    const now = Date.now();
    const participantId = randomUUID();
    if (avatarId !== void 0 && !isChatroomAvatarId(avatarId)) throw new ChatroomInputError("\u8BF7\u9009\u62E9\u6709\u6548\u7684\u5934\u50CF\u3002");
    const record = {
      participantId,
      displayName: normalized,
      avatarId: avatarId ?? fallbackAvatarId(participantId),
      createdAt: now,
      lastSeenAt: now
    };
    await this.requireIdentities().put(tokenHash(token), record);
    return { token, identity: publicIdentity(record) };
  }
  /** Update the display fields for one existing browser identity. */
  async updateIdentity(token, displayName, avatarId) {
    this.assertReady();
    const key = tokenHash(token);
    const existing = this.requireIdentities().get(key);
    if (existing === void 0) throw new ChatroomInputError("\u804A\u5929\u5BA4\u8EAB\u4EFD\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u8FDB\u5165\u3002");
    const normalized = normalizeDisplayName(displayName, this.config.maxDisplayNameChars);
    if (avatarId !== void 0 && !isChatroomAvatarId(avatarId)) throw new ChatroomInputError("\u8BF7\u9009\u62E9\u6709\u6548\u7684\u5934\u50CF\u3002");
    const record = {
      ...existing,
      displayName: normalized,
      avatarId: avatarId ?? existing.avatarId ?? fallbackAvatarId(existing.participantId),
      lastSeenAt: Date.now()
    };
    await this.requireIdentities().put(key, record);
    return publicIdentity(record);
  }
  /** Revoke one browser identity token. */
  async deleteIdentity(token) {
    this.assertReady();
    if (token !== void 0) await this.requireIdentities().delete(tokenHash(token));
  }
  /** Create and activate one independent shared Harness Session. */
  async createRoom(title, identity) {
    this.assertReady();
    const id = randomUUID();
    const record = {
      id,
      title: normalizeRoomTitle(title, this.config.maxRoomTitleChars),
      aiDisplayName: this.config.aiDisplayName,
      sessionId: `chatroom-v1-${id}`,
      createdAt: Date.now(),
      createdBy: identity.participantId
    };
    await this.requireRoomRecords().put(id, record);
    const state = newRoomState(record);
    this.states.set(id, state);
    try {
      await this.ensureRoom(id);
      return publicRoom(record);
    } catch (error) {
      this.states.delete(id);
      await this.requireRoomRecords().delete(id);
      throw error;
    }
  }
  /** Activate an existing room and return its public metadata. */
  async selectRoom(roomId) {
    this.assertReady();
    await this.ensureRoom(roomId);
    return this.requireRoom(roomId);
  }
  /** Append human chat immediately; wake the Agent only for an explicit AI mention. */
  async submit(roomId, identity, content, mode, reply) {
    this.assertReady();
    const state = this.requireState(roomId);
    const task = state.admission.then(async () => {
      const binding = await this.ensureRoom(roomId);
      const aiTriggered = mentionsAi(content, state.record.aiDisplayName);
      const { provider, model: modelId } = binding.agent.options;
      if (aiTriggered && provider !== void 0 && modelId !== void 0 && content.some((part) => part.type === "image")) {
        const model = await this.ctx.llm.resolveModelInfo(provider, modelId);
        if (model.inputModalities !== void 0 && !model.inputModalities.includes("image")) {
          throw new ChatroomInputError(`\u6A21\u578B ${JSON.stringify(modelId)} \u4E0D\u652F\u6301\u56FE\u7247\u8F93\u5165\u3002`);
        }
      }
      const durable = await this.durableContent(roomId, identity, identifyPrompt(content, identity, reply));
      const message = createUserMessage({ content: durable, source: { kind: "user" } });
      if (!aiTriggered) {
        binding.agent.session.append("user/message", message, { surfaceOp: "append" });
      } else if (mode === "steer") {
        binding.agent.steer(message);
      } else {
        binding.agent.followup(message);
      }
      return { accepted: true, aiTriggered };
    });
    state.admission = task.then(() => void 0, () => void 0);
    return await task;
  }
  /** Resolve one authenticated room-file download. */
  file(fileId) {
    this.assertReady();
    const record = this.requireFiles().get(fileId);
    if (record === void 0) throw new ChatroomInputError("\u6587\u4EF6\u4E0D\u5B58\u5728\u3002");
    return { ref: publicFile(record), data: decodeBase64(record.data, "\u6587\u4EF6") };
  }
  /** Attach one authenticated presence client to one room. */
  subscribe(roomId, identity, response) {
    this.assertReady();
    const state = this.requireState(roomId);
    if (state.binding === void 0) throw new Error(`chatroom room ${JSON.stringify(roomId)} is not active`);
    const client = { participantId: identity.participantId, response };
    state.clients.add(client);
    const snapshot = {
      type: "snapshot",
      room: publicRoom(state.record),
      identity,
      online: onlineCount(state)
    };
    writeSse(response, snapshot);
    this.broadcastPresence(state);
    let disposed = false;
    return () => {
      if (disposed) return;
      disposed = true;
      state.clients.delete(client);
      this.broadcastPresence(state);
    };
  }
  async seedConfiguredRoom() {
    const records = this.requireRoomRecords();
    const existing = records.get(this.config.roomId);
    const configured = {
      id: this.config.roomId,
      title: this.config.roomTitle,
      aiDisplayName: this.config.aiDisplayName,
      sessionId: this.config.sessionId,
      createdAt: existing?.createdAt ?? Date.now(),
      createdBy: existing?.createdBy ?? "system"
    };
    if (existing === void 0 || existing.title !== configured.title || existing.aiDisplayName !== configured.aiDisplayName || existing.sessionId !== configured.sessionId) {
      await records.put(configured.id, configured);
    }
  }
  async ensureRoom(roomId) {
    const state = this.requireState(roomId);
    if (state.binding !== void 0) return state.binding;
    state.activation ??= this.activateRoom(state).then((binding) => {
      state.binding = binding;
      return binding;
    }).finally(() => {
      state.activation = void 0;
    });
    return await state.activation;
  }
  async activateRoom(state) {
    const binding = await this.acquireAgent(state.record.sessionId);
    try {
      await this.attachWorkspace(state.record.sessionId);
      return binding;
    } catch (error) {
      await binding.release();
      throw error;
    }
  }
  async acquireAgent(sessionId) {
    const id = SessionId(sessionId);
    const live = this.ctx.agents.get(id);
    if (live !== void 0) return borrowAgent(live);
    const persisted = (await this.ctx.sessionPersistence.list()).some((header) => header.id === id);
    const model = this.ctx.agentDefaultModel.currentSelection();
    const agentOptions = { provider: model.provider, model: model.model };
    if (persisted) {
      const inspected = await this.ctx.sessionPersistence.inspect(id);
      const agentPreset = resolveSessionPreset({ header: inspected.meta, events: inspected.events }) ?? this.config.agentPreset;
      try {
        return ownAgent(await this.ctx.agents.resume({
          resumeSessionId: id,
          agentOptions,
          setup: async (agentCtx) => {
            await this.ctx.agentPresets.mount(agentCtx, agentPreset);
          }
        }));
      } catch (error) {
        const raced = this.ctx.agents.get(id);
        if (raced !== void 0) return borrowAgent(raced);
        throw error;
      }
    }
    try {
      return ownAgent(await this.ctx.agents.create({
        sessionId: id,
        meta: { cwd: this.config.cwd, agentPreset: this.config.agentPreset },
        agentOptions,
        setup: async (agentCtx) => {
          await this.ctx.agentPresets.mount(agentCtx, this.config.agentPreset);
        }
      }));
    } catch (error) {
      const raced = this.ctx.agents.get(id);
      if (raced !== void 0) return borrowAgent(raced);
      throw error;
    }
  }
  /** Ensure one shared Session uses native Workspace navigation. */
  async attachWorkspace(sessionId) {
    const workspace = await this.ctx.workspaceRegistry.resolveByPath(this.config.cwd) ?? await this.ctx.workspaceRegistry.create(this.config.cwd);
    await workspace.attachSession(SessionId(sessionId));
  }
  async durableContent(roomId, identity, content) {
    const prepared = content.map((part) => part.type === "text" ? part : { part, data: decodeBase64(part.data, part.type === "image" ? "\u56FE\u7247" : "\u6587\u4EF6") });
    const images = prepared.filter((item) => "data" in item && item.part.type === "image");
    const files = prepared.filter((item) => "data" in item && item.part.type === "file");
    this.validateFiles(files.map((file) => file.data));
    const mediaTypes = this.ctx.attachments.imageLimits.mediaTypes;
    for (const image of images) {
      if (image.part.type !== "image" || !mediaTypes.includes(image.part.mediaType)) {
        throw new ChatroomInputError(`\u4E0D\u652F\u6301\u56FE\u7247\u683C\u5F0F ${image.part.mediaType}\u3002`);
      }
    }
    const admittedImages = await Promise.all(images.map(async (image) => ({
      part: image.part,
      data: await this.resizeImage(image.data)
    })));
    let refs = [];
    try {
      refs = await this.ctx.attachments.saveImages(admittedImages.map((image) => ({
        data: image.data,
        mediaType: image.part.mediaType,
        ...image.part.name === void 0 ? {} : { name: image.part.name }
      })));
    } catch (error) {
      if (error instanceof AttachmentError) throw new ChatroomInputError(`\u56FE\u7247\u65E0\u6CD5\u53D1\u9001\uFF1A${error.message}`);
      throw error;
    }
    const fileRefs = /* @__PURE__ */ new Map();
    for (const file of files) {
      if (file.part.type !== "file") continue;
      const record = this.fileRecord(roomId, identity, file.part, file.data);
      await this.requireFiles().put(record.id, record);
      fileRefs.set(file.part, publicFile(record));
    }
    const blocks = [];
    let imageIndex = 0;
    for (const item of prepared) {
      if (!("data" in item)) {
        blocks.push({ type: "text", text: item.text });
        continue;
      }
      if (item.part.type === "file") {
        const file = fileRefs.get(item.part);
        if (file === void 0) throw new Error("chatroom file batch lost a file reference");
        blocks.push({ type: "text", text: identifyFileText(file) });
        continue;
      }
      const attachment = refs[imageIndex++];
      if (attachment === void 0) throw new Error("chatroom attachment batch lost an image reference");
      blocks.push({ type: "image", attachment });
    }
    return blocks;
  }
  validateFiles(files) {
    if (files.length > this.config.maxFilesPerMessage) {
      throw new ChatroomInputError(`\u4E00\u6761\u6D88\u606F\u6700\u591A\u53D1\u9001 ${this.config.maxFilesPerMessage} \u4E2A\u6587\u4EF6\u3002`);
    }
    if (files.some((file) => file.byteLength > this.config.maxFileBytes)) {
      throw new ChatroomInputError(`\u5355\u4E2A\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC7 ${formatMegabytes(this.config.maxFileBytes)}\u3002`);
    }
    const total = files.reduce((sum, file) => sum + file.byteLength, 0);
    if (total > this.config.maxMessageFileBytes) {
      throw new ChatroomInputError(`\u4E00\u6761\u6D88\u606F\u7684\u6587\u4EF6\u603B\u5927\u5C0F\u4E0D\u80FD\u8D85\u8FC7 ${formatMegabytes(this.config.maxMessageFileBytes)}\u3002`);
    }
  }
  fileRecord(roomId, identity, part, data) {
    return {
      id: randomUUID(),
      roomId,
      participantId: identity.participantId,
      displayName: identity.displayName,
      name: normalizeFileName(part.name),
      mediaType: normalizeMediaType(part.mediaType),
      bytes: data.byteLength,
      data: Buffer.from(data).toString("base64"),
      createdAt: Date.now()
    };
  }
  async resizeImage(data) {
    try {
      const { default: sharp } = await import("sharp");
      const image = sharp(data, { animated: true, failOn: "error", limitInputPixels: false });
      const metadata = await image.metadata();
      const width = metadata.width;
      const height = metadata.pageHeight ?? metadata.height;
      if (width === void 0 || height === void 0) return data;
      const maxPixels = this.ctx.attachments.imageLimits.maxImagePixels;
      const scale = Math.min(
        1,
        this.config.maxImageSidePixels / width,
        this.config.maxImageSidePixels / height,
        Math.sqrt(maxPixels / (width * height))
      );
      if (scale >= 1) return data;
      const resized = await image.resize({
        width: Math.max(1, Math.floor(width * scale)),
        height: Math.max(1, Math.floor(height * scale)),
        fit: "inside",
        withoutEnlargement: true
      }).toBuffer();
      return new Uint8Array(resized);
    } catch (error) {
      throw new ChatroomInputError(`\u56FE\u7247\u65E0\u6CD5\u53D1\u9001\uFF1A${error instanceof Error ? error.message : String(error)}`);
    }
  }
  broadcastPresence(state) {
    this.broadcast(state, { type: "presence", online: onlineCount(state) });
  }
  broadcast(state, event) {
    for (const client of [...state.clients]) {
      if (!writeSse(client.response, event)) state.clients.delete(client);
    }
  }
  assertReady() {
    if (!this.isReady) throw new Error("chatroom is not ready");
  }
  requireRoom(roomId) {
    return publicRoom(this.requireState(roomId).record);
  }
  requireState(roomId) {
    const state = this.states.get(roomId);
    if (state === void 0) throw new ChatroomInputError("\u5171\u4EAB\u4F1A\u8BDD\u4E0D\u5B58\u5728\u3002");
    return state;
  }
  requireIdentities() {
    if (this.identities === void 0) throw new Error("chatroom identity storage is unavailable");
    return this.identities;
  }
  requireRoomRecords() {
    if (this.roomRecords === void 0) throw new Error("chatroom room storage is unavailable");
    return this.roomRecords;
  }
  requireFiles() {
    if (this.files === void 0) throw new Error("chatroom file storage is unavailable");
    return this.files;
  }
};
function newRoomState(record) {
  return {
    record,
    clients: /* @__PURE__ */ new Set(),
    binding: void 0,
    activation: void 0,
    admission: Promise.resolve()
  };
}
function ownAgent(handle) {
  return { agent: handle.agent, release: () => handle.dispose() };
}
function borrowAgent(agent) {
  return { agent, release: async () => void 0 };
}
function publicIdentity(record) {
  return {
    participantId: record.participantId,
    displayName: record.displayName,
    avatarId: record.avatarId ?? fallbackAvatarId(record.participantId)
  };
}
function publicFile(record) {
  return { id: record.id, name: record.name, mediaType: record.mediaType, bytes: record.bytes };
}
function publicRoom(record) {
  return {
    id: record.id,
    title: record.title,
    aiDisplayName: record.aiDisplayName,
    sessionId: record.sessionId
  };
}
function normalizeDisplayName(value, maxChars) {
  const normalized = value.trim().replace(/\s+/gu, " ");
  if (normalized === "") throw new ChatroomInputError("\u8BF7\u8F93\u5165\u8EAB\u4EFD\u540D\u79F0\u3002");
  if ([...normalized].length > maxChars) throw new ChatroomInputError(`\u8EAB\u4EFD\u540D\u79F0\u4E0D\u80FD\u8D85\u8FC7 ${maxChars} \u4E2A\u5B57\u7B26\u3002`);
  if (/\p{Cc}/u.test(normalized)) throw new ChatroomInputError("\u8EAB\u4EFD\u540D\u79F0\u4E0D\u80FD\u5305\u542B\u63A7\u5236\u5B57\u7B26\u3002");
  return normalized;
}
function normalizeRoomTitle(value, maxChars) {
  const normalized = value.trim().replace(/\s+/gu, " ");
  if (normalized === "") throw new ChatroomInputError("\u8BF7\u8F93\u5165\u5171\u4EAB\u4F1A\u8BDD\u540D\u79F0\u3002");
  if ([...normalized].length > maxChars) throw new ChatroomInputError(`\u5171\u4EAB\u4F1A\u8BDD\u540D\u79F0\u4E0D\u80FD\u8D85\u8FC7 ${maxChars} \u4E2A\u5B57\u7B26\u3002`);
  if (/\p{Cc}/u.test(normalized)) throw new ChatroomInputError("\u5171\u4EAB\u4F1A\u8BDD\u540D\u79F0\u4E0D\u80FD\u5305\u542B\u63A7\u5236\u5B57\u7B26\u3002");
  return normalized;
}
function decodeBase64(data, label) {
  const decoded = Buffer.from(data, "base64");
  if (data.length === 0 || decoded.toString("base64") !== data) {
    throw new ChatroomInputError(`${label}\u6570\u636E\u4E0D\u662F\u6709\u6548\u7684 base64\u3002`);
  }
  return new Uint8Array(decoded);
}
function normalizeFileName(value) {
  const normalized = value.trim().replace(/[\\/]/gu, "_").replace(/[\p{Cc}\p{Cf}]/gu, "");
  if (normalized === "") throw new ChatroomInputError("\u6587\u4EF6\u540D\u4E0D\u80FD\u4E3A\u7A7A\u3002");
  return [...normalized].slice(0, 255).join("");
}
function normalizeMediaType(value) {
  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/u.test(normalized) ? normalized : "application/octet-stream";
}
function formatMegabytes(bytes) {
  return `${Math.ceil(bytes / 1024 / 1024)} MB`;
}
function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}
function onlineCount(state) {
  return new Set([...state.clients].map((client) => client.participantId)).size;
}
function writeSse(response, event) {
  if (response.destroyed || response.writableEnded) return false;
  try {
    response.write(`data: ${JSON.stringify(event)}

`);
    return true;
  } catch {
    return false;
  }
}

// src/http.ts
var ChatroomHttpController = class {
  constructor(ctx, runtime, config) {
    this.runtime = runtime;
    this.config = config;
    this.log = ctx.logger("deepseek-harness-chatroom");
  }
  runtime;
  config;
  log;
  /** Dispatch one request under a registered chatroom API prefix. */
  async handle(request, response) {
    try {
      const url = new URL(request.url ?? "/", "http://chatroom.local");
      const route = matchChatroomApi(url.pathname);
      if (route === void 0) {
        json(response, 404, { error: "\u63A5\u53E3\u4E0D\u5B58\u5728\u3002" });
        return;
      }
      if (route.endpoint === "/health" && request.method === "GET") {
        json(response, this.runtime.isReady ? 200 : 503, { ready: this.runtime.isReady });
        return;
      }
      if (!this.runtime.isReady) {
        json(response, 503, { error: "\u804A\u5929\u5BA4\u6B63\u5728\u542F\u52A8\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" });
        return;
      }
      if (route.endpoint === "/session") {
        await this.handleSession(request, response, route.prefix);
        return;
      }
      if (route.endpoint === "/rooms") {
        await this.handleRooms(request, response);
        return;
      }
      if (route.endpoint === "/rooms/select") {
        await this.handleRoomSelection(request, response);
        return;
      }
      if (route.endpoint === "/prompt") {
        await this.handlePrompt(request, response);
        return;
      }
      if (route.endpoint.startsWith("/files/")) {
        this.handleFile(request, response, route.endpoint.slice("/files/".length));
        return;
      }
      if (route.endpoint === "/events" && request.method === "GET") {
        await this.handleEvents(request, response, url.searchParams);
        return;
      }
      json(response, 404, { error: "\u63A5\u53E3\u4E0D\u5B58\u5728\u3002" });
    } catch (error) {
      if (error instanceof ChatroomInputError) {
        json(response, 422, { error: error.message });
        return;
      }
      this.log.warn("Chatroom request failed: %s", String(error));
      if (!response.headersSent) {
        json(response, 500, { error: "\u804A\u5929\u5BA4\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" });
      } else {
        response.destroy();
      }
    }
  }
  async handleSession(request, response, cookiePath) {
    const token = this.token(request);
    if (request.method === "GET") {
      json(response, 200, this.sessionPayload(this.runtime.identity(token) ?? null));
      return;
    }
    if (request.method === "POST") {
      assertSameOrigin(request);
      const body = await readJson(request, smallRequestLimit(this.config));
      const existing = this.runtime.identity(token);
      if (existing !== void 0 && token !== void 0) {
        const updated = await this.runtime.updateIdentity(
          token,
          fieldString(body, "displayName"),
          optionalFieldString(body, "avatarId")
        );
        json(response, 200, this.sessionPayload(updated));
        return;
      }
      const created = await this.runtime.createIdentity(fieldString(body, "displayName"), optionalFieldString(body, "avatarId"));
      response.setHeader("Set-Cookie", sessionCookie(
        this.config.cookieName,
        created.token,
        this.config.cookieMaxAgeSeconds,
        cookiePath
      ));
      json(response, 201, this.sessionPayload(created.identity));
      return;
    }
    if (request.method === "DELETE") {
      assertSameOrigin(request);
      await this.runtime.deleteIdentity(token);
      response.setHeader("Set-Cookie", expiredSessionCookie(this.config.cookieName, cookiePath));
      response.writeHead(204);
      response.end();
      return;
    }
    methodNotAllowed(response, "GET, POST, DELETE");
  }
  async handleRooms(request, response) {
    if (request.method === "GET") {
      json(response, 200, { rooms: this.runtime.rooms });
      return;
    }
    if (request.method !== "POST") {
      methodNotAllowed(response, "GET, POST");
      return;
    }
    assertSameOrigin(request);
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const body = await readJson(request, smallRequestLimit(this.config));
    const room = await this.runtime.createRoom(fieldString(body, "title"), identity);
    json(response, 201, { room });
  }
  async handleRoomSelection(request, response) {
    if (request.method !== "POST") {
      methodNotAllowed(response, "POST");
      return;
    }
    assertSameOrigin(request);
    if (this.requireIdentity(request, response) === void 0) return;
    const body = await readJson(request, smallRequestLimit(this.config));
    const room = await this.runtime.selectRoom(fieldString(body, "roomId"));
    json(response, 200, { room });
  }
  async handlePrompt(request, response) {
    if (request.method !== "POST") {
      methodNotAllowed(response, "POST");
      return;
    }
    assertSameOrigin(request);
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const body = await readJson(request, this.runtime.maxPromptRequestBytes);
    const prompt = promptRequest(body, this.config);
    const result = await this.runtime.submit(prompt.roomId, identity, prompt.content, prompt.mode, prompt.reply);
    json(response, 200, result);
  }
  handleFile(request, response, fileId) {
    if (request.method !== "GET") {
      methodNotAllowed(response, "GET");
      return;
    }
    if (this.requireIdentity(request, response) === void 0) return;
    if (fileId === "" || fileId.includes("/")) throw new ChatroomInputError("\u6587\u4EF6\u7F16\u53F7\u65E0\u6548\u3002");
    const file = this.runtime.file(fileId);
    response.writeHead(200, {
      "Content-Type": file.ref.mediaType,
      "Content-Length": file.data.byteLength,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.ref.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(file.data);
  }
  async handleEvents(request, response, search) {
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    const roomId = search.get("roomId");
    if (roomId === null || roomId === "") throw new ChatroomInputError("\u7F3A\u5C11\u5171\u4EAB\u4F1A\u8BDD\u7F16\u53F7\u3002");
    await this.runtime.selectRoom(roomId);
    response.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    const unsubscribe = this.runtime.subscribe(roomId, identity, response);
    const heartbeat = setInterval(() => {
      if (!response.destroyed && !response.writableEnded) response.write(": heartbeat\n\n");
    }, this.config.sseHeartbeatMs);
    request.once("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  }
  sessionPayload(identity) {
    return { identity, rooms: this.runtime.rooms, room: this.runtime.room };
  }
  requireIdentity(request, response) {
    const identity = this.runtime.identity(this.token(request));
    if (identity === void 0) {
      json(response, 401, { error: "\u8BF7\u5148\u9009\u62E9\u804A\u5929\u5BA4\u8EAB\u4EFD\u3002" });
    }
    return identity;
  }
  token(request) {
    return cookieValue(request.headers.cookie, this.config.cookieName);
  }
};
function json(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  response.end(body);
}
function methodNotAllowed(response, allow) {
  response.setHeader("Allow", allow);
  json(response, 405, { error: "\u8BF7\u6C42\u65B9\u6CD5\u4E0D\u53D7\u652F\u6301\u3002" });
}
function assertSameOrigin(request) {
  const origin = request.headers.origin;
  if (origin === void 0) return;
  const host = request.headers.host;
  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ChatroomInputError("\u8BF7\u6C42\u6765\u6E90\u65E0\u6548\u3002");
  }
  if (host === void 0 || originHost !== host) throw new ChatroomInputError("\u8BF7\u6C42\u6765\u6E90\u65E0\u6548\u3002");
}
async function readJson(request, limit) {
  const contentType = request.headers["content-type"]?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") throw new ChatroomInputError("\u8BF7\u6C42\u5FC5\u987B\u4F7F\u7528 application/json\u3002");
  const chunks = [];
  let bytes = 0;
  for await (const raw of request) {
    const chunk = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
    bytes += chunk.byteLength;
    if (bytes > limit) throw new ChatroomInputError("\u8BF7\u6C42\u5185\u5BB9\u8FC7\u5927\u3002");
    chunks.push(chunk);
  }
  let value;
  try {
    value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ChatroomInputError("\u8BF7\u6C42 JSON \u65E0\u6548\u3002");
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ChatroomInputError("\u8BF7\u6C42 JSON \u5FC5\u987B\u662F\u5BF9\u8C61\u3002");
  }
  return value;
}
function fieldString(body, field) {
  const value = body[field];
  if (typeof value !== "string") throw new ChatroomInputError(`\u5B57\u6BB5 ${field} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u3002`);
  return value;
}
function optionalFieldString(body, field) {
  const value = body[field];
  if (value === void 0) return void 0;
  if (typeof value !== "string") throw new ChatroomInputError(`\u5B57\u6BB5 ${field} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u3002`);
  return value;
}
function promptRequest(body, config) {
  const roomId = fieldString(body, "roomId");
  const mode = body.mode;
  if (mode !== "queue" && mode !== "steer") throw new ChatroomInputError("\u5B57\u6BB5 mode \u5FC5\u987B\u662F queue \u6216 steer\u3002");
  if (!Array.isArray(body.content) || body.content.length === 0) {
    throw new ChatroomInputError("\u6D88\u606F\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A\u3002");
  }
  const content = [];
  let textChars = 0;
  for (const raw of body.content) {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      throw new ChatroomInputError("\u6D88\u606F\u5185\u5BB9\u683C\u5F0F\u65E0\u6548\u3002");
    }
    const part = raw;
    if (part.type === "text") {
      if (typeof part.text !== "string") throw new ChatroomInputError("\u6587\u672C\u6D88\u606F\u65E0\u6548\u3002");
      textChars += [...part.text].length;
      content.push({ type: "text", text: part.text });
      continue;
    }
    if (part.type === "image") {
      if (!isImageMediaType(part.mediaType) || typeof part.data !== "string") {
        throw new ChatroomInputError("\u56FE\u7247\u6D88\u606F\u65E0\u6548\u3002");
      }
      if (part.name !== void 0 && typeof part.name !== "string") {
        throw new ChatroomInputError("\u56FE\u7247\u540D\u79F0\u65E0\u6548\u3002");
      }
      content.push({
        type: "image",
        mediaType: part.mediaType,
        data: part.data,
        ...part.name === void 0 ? {} : { name: part.name }
      });
      continue;
    }
    if (part.type === "file") {
      if (typeof part.mediaType !== "string" || typeof part.data !== "string" || typeof part.name !== "string") {
        throw new ChatroomInputError("\u6587\u4EF6\u6D88\u606F\u65E0\u6548\u3002");
      }
      content.push({ type: "file", mediaType: part.mediaType, data: part.data, name: part.name });
      continue;
    }
    throw new ChatroomInputError("\u6D88\u606F\u5185\u5BB9\u7C7B\u578B\u65E0\u6548\u3002");
  }
  if (textChars > config.maxMessageTextChars) {
    throw new ChatroomInputError(`\u6D88\u606F\u6587\u672C\u4E0D\u80FD\u8D85\u8FC7 ${config.maxMessageTextChars} \u4E2A\u5B57\u7B26\u3002`);
  }
  if (!content.some((part) => part.type !== "text" || part.text.trim() !== "")) {
    throw new ChatroomInputError("\u6D88\u606F\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A\u3002");
  }
  const reply = replyRequest(body.reply);
  return { roomId, mode, content, ...reply === void 0 ? {} : { reply } };
}
function replyRequest(value) {
  if (value === void 0) return void 0;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ChatroomInputError("\u56DE\u590D\u5F15\u7528\u65E0\u6548\u3002");
  }
  const reply = value;
  const messageId = fieldString(reply, "messageId");
  const displayName = fieldString(reply, "displayName").trim();
  const text = fieldString(reply, "text").trim().replace(/\s+/gu, " ");
  if (messageId === "" || displayName === "" || text === "") throw new ChatroomInputError("\u56DE\u590D\u5F15\u7528\u4E0D\u5B8C\u6574\u3002");
  if ([...displayName].length > 80 || [...text].length > 240) throw new ChatroomInputError("\u56DE\u590D\u5F15\u7528\u8FC7\u957F\u3002");
  if (/\p{Cc}/u.test(`${displayName}${text}`)) throw new ChatroomInputError("\u56DE\u590D\u5F15\u7528\u5305\u542B\u65E0\u6548\u5B57\u7B26\u3002");
  return { messageId, displayName, text };
}
function isImageMediaType(value) {
  return value === "image/png" || value === "image/jpeg" || value === "image/webp" || value === "image/gif";
}
function smallRequestLimit(config) {
  return Math.max(config.maxDisplayNameChars, config.maxRoomTitleChars) * 4 + 1024;
}

// src/index.ts
var name = "deepseek-harness-chatroom";
var inject = [
  "agentDefaultModel",
  "agentPresets",
  "agents",
  "attachments",
  "llm",
  "sessionPersistence",
  "sessions",
  "storageDomain",
  "webServer",
  "workspaceRegistry"
];
function apply(ctx, config) {
  validateConfig(config);
  const runtime = new ChatroomRuntime(ctx, config);
  const http = new ChatroomHttpController(ctx, runtime, config);
  const log = ctx.logger("deepseek-harness-chatroom");
  ctx.effect(() => {
    const unregister = CHATROOM_API_PREFIXES.map((path) => ctx.webServer.register({
      kind: "prefix",
      path,
      handler: (request, response) => http.handle(request, response)
    }));
    const startup = runtime.start().then(() => {
      log.info("AI chatroom %s is ready", JSON.stringify(config.roomId));
    }).catch(async (error) => {
      log.warn("AI chatroom remains offline: %s. Harness startup is unaffected.", String(error));
      await runtime.stop();
    });
    return async () => {
      for (const dispose of unregister) dispose();
      await startup;
      await runtime.stop();
    };
  }, "deepseek-harness-chatroom.runtime");
}
var index_default = { name, inject, Config, apply };
export {
  ChatroomHttpController,
  ChatroomRuntime,
  Config,
  apply,
  index_default as default,
  inject,
  name
};
//# sourceMappingURL=index.js.map