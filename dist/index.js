// src/config.ts
import { isAbsolute } from "path";
import z from "@deepseek-ai/schemastery";
var DEFAULT_NO_REPLY_TOKEN = "<CHATROOM_NO_REPLY>";
var DEFAULT_SYSTEM_PROMPT = [
  "\u4F60\u6B63\u5728\u4E00\u4E2A\u591A\u4EBA AI \u804A\u5929\u5BA4\u4E2D\u4F5C\u4E3A\u53C2\u4E0E\u8005\u53D1\u8A00\u3002\u6BCF\u6761\u8F93\u5165\u90FD\u4F1A\u660E\u786E\u6807\u51FA\u53D1\u8A00\u8005\u59D3\u540D\u548C\u6D88\u606F\u5185\u5BB9\u3002",
  "\u4F60\u53EF\u4EE5\u8BFB\u53D6\u8FD9\u4E2A\u623F\u95F4\u81F3\u4ECA\u7684\u5B8C\u6574\u5BF9\u8BDD\uFF0C\u5E76\u81EA\u4E3B\u5224\u65AD\u5F53\u524D\u662F\u5426\u503C\u5F97\u56DE\u590D\u3002",
  `\u5982\u679C\u4E0D\u9700\u8981\u56DE\u590D\uFF0C\u53EA\u8F93\u51FA ${DEFAULT_NO_REPLY_TOKEN}\uFF0C\u4E0D\u5F97\u6DFB\u52A0\u4EFB\u4F55\u5176\u4ED6\u5B57\u7B26\u3002`,
  "\u5982\u679C\u51B3\u5B9A\u56DE\u590D\uFF0C\u53EA\u8F93\u51FA\u8981\u53D1\u9001\u5230\u804A\u5929\u5BA4\u7684\u81EA\u7136\u8BED\u8A00\u6B63\u6587\uFF0C\u4E0D\u8981\u6DFB\u52A0\u89D2\u8272\u524D\u7F00\uFF0C\u4E0D\u8981\u89E3\u91CA\u4F60\u7684\u56DE\u590D\u51B3\u7B56\u3002",
  "\u4E0D\u8981\u56E0\u4E3A\u6BCF\u6761\u6D88\u606F\u90FD\u88AB\u63D0\u4EA4\u7ED9\u4F60\u5C31\u5F3A\u884C\u63D2\u8BDD\uFF1B\u88AB\u70B9\u540D\u3001\u88AB\u63D0\u95EE\u3001\u80FD\u591F\u7EA0\u6B63\u5173\u952E\u9519\u8BEF\u6216\u80FD\u660E\u663E\u63A8\u8FDB\u8BA8\u8BBA\u65F6\u518D\u56DE\u590D\u3002"
].join("\n");
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
  maxMessageChars: z.number().step(1).min(1).max(2e4).default(4e3),
  responseTimeoutMs: z.number().step(1).min(1e3).max(9e5).default(18e4),
  aiRetryDelayMs: z.number().step(1).min(1e3).max(3e5).default(5e3),
  sseHeartbeatMs: z.number().step(1).min(5e3).max(12e4).default(15e3),
  noReplyToken: z.string().min(1).max(80).default(DEFAULT_NO_REPLY_TOKEN),
  systemPrompt: z.string().min(1).default(DEFAULT_SYSTEM_PROMPT)
});
function validateConfig(config) {
  if (!isAbsolute(config.cwd)) {
    throw new Error(`chatroom: cwd must be absolute, got ${JSON.stringify(config.cwd)}`);
  }
  if (config.systemPrompt.includes(config.noReplyToken) === false) {
    throw new Error("chatroom: systemPrompt must contain noReplyToken so silence remains an explicit model decision");
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
function sessionCookie(name2, token, maxAgeSeconds) {
  return `${name2}=${token}; Path=/chatroom/api; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Strict`;
}
function expiredSessionCookie(name2) {
  return `${name2}=; Path=/chatroom/api; Max-Age=0; HttpOnly; SameSite=Strict`;
}

// src/room.ts
import { createHash, randomBytes, randomUUID } from "crypto";
import { resolveSessionPreset } from "@deepseek-ai/dsh-agent-presets";
import { createUserMessage } from "@deepseek-ai/dsh-llm";
import { SessionId } from "@deepseek-ai/dsh-session";

// src/domain.ts
import { z as z2 } from "zod";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
var nonNegativeSafeInteger = z2.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
var identitySchema = z2.object({
  participantId: z2.uuid(),
  displayName: z2.string().min(1),
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
var chatroomDomainSpec = defineDomain({
  name: "chatroom",
  version: 0,
  tables: {
    identities: domainTable(identitySchema),
    messages: domainTable(messageSchema)
  }
});

// src/room.ts
var swallow = () => void 0;
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
  messages;
  binding;
  nextSequence = 1;
  ready = false;
  stopping = false;
  clients = /* @__PURE__ */ new Set();
  writeTail = Promise.resolve();
  aiTail = Promise.resolve();
  retryTimers = /* @__PURE__ */ new Set();
  createdFreshAgent = false;
  /** Public metadata for this configured room. */
  get room() {
    return {
      id: this.config.roomId,
      title: this.config.roomTitle,
      aiDisplayName: this.config.aiDisplayName
    };
  }
  /** Whether persistence and the room Agent are ready to accept requests. */
  get isReady() {
    return this.ready && !this.stopping;
  }
  /** Open durable identity/message storage, acquire the room Agent, and replay unfinished AI work. */
  async start() {
    const domain = await this.ctx.storageDomain.open(chatroomDomainSpec);
    this.domain = domain;
    this.identities = domain.table("identities");
    this.messages = domain.table("messages");
    this.nextSequence = 1 + Math.max(0, ...[...this.messages.entries()].map(([, item]) => item.sequence));
    this.binding = await this.acquireAgent();
    await this.reconcileCompletedTurns();
    if (this.createdFreshAgent) this.injectRecoveredTranscript();
    this.ready = true;
    for (const record of this.sortedRecords()) {
      if (record.role === "human" && record.aiProcessed !== true) this.enqueueAi(record);
    }
  }
  /** Stop intake, close SSE clients, drain writes and Agent work, then release owned resources. */
  async stop() {
    if (this.stopping) return;
    this.stopping = true;
    this.ready = false;
    for (const timer of this.retryTimers) clearTimeout(timer);
    this.retryTimers.clear();
    for (const client of this.clients) client.response.end();
    this.clients.clear();
    await Promise.allSettled([this.writeTail, this.aiTail]);
    await this.binding?.release();
    this.binding = void 0;
    await this.domain?.close();
    this.domain = void 0;
  }
  /** Resolve an opaque cookie token to its durable identity. */
  identity(token) {
    if (!this.isReady || token === void 0) return void 0;
    const record = this.requireIdentities().get(tokenHash(token));
    return record === void 0 ? void 0 : publicIdentity(record);
  }
  /** Mint and durably bind a new browser identity. */
  async createIdentity(displayName) {
    this.assertReady();
    const normalized = normalizeDisplayName(displayName, this.config.maxDisplayNameChars);
    const token = randomBytes(32).toString("base64url");
    const now = Date.now();
    const record = {
      participantId: randomUUID(),
      displayName: normalized,
      createdAt: now,
      lastSeenAt: now
    };
    await this.requireIdentities().put(tokenHash(token), record);
    return { token, identity: publicIdentity(record) };
  }
  /** Revoke one browser identity token. */
  async deleteIdentity(token) {
    this.assertReady();
    if (token !== void 0) await this.requireIdentities().delete(tokenHash(token));
  }
  /** Persist and broadcast one human message, then schedule its independent AI decision. */
  async send(identity, text) {
    this.assertReady();
    const normalized = normalizeMessage(text, this.config.maxMessageChars);
    const record = await this.commitMessage({
      id: randomUUID(),
      role: "human",
      participantId: identity.participantId,
      displayName: identity.displayName,
      text: normalized,
      createdAt: Date.now(),
      aiProcessed: false
    });
    const message = publicMessage(record);
    this.broadcast({ type: "message", message });
    this.enqueueAi(record);
    return message;
  }
  /** Attach one authenticated SSE client and immediately deliver an authoritative snapshot. */
  subscribe(identity, response) {
    this.assertReady();
    const client = { participantId: identity.participantId, response };
    this.clients.add(client);
    const snapshot = {
      type: "snapshot",
      room: this.room,
      identity,
      messages: this.sortedRecords().map(publicMessage),
      online: this.onlineCount()
    };
    writeSse(response, snapshot);
    this.broadcastPresence();
    let disposed = false;
    return () => {
      if (disposed) return;
      disposed = true;
      this.clients.delete(client);
      this.broadcastPresence();
    };
  }
  /** Current persisted public room transcript. */
  history() {
    this.assertReady();
    return this.sortedRecords().map(publicMessage);
  }
  async acquireAgent() {
    const id = SessionId(this.config.sessionId);
    const live = this.ctx.agents.get(id);
    if (live !== void 0) return this.borrowAgent(live);
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
          setup: (agentCtx) => this.setupAgent(agentCtx, agentPreset)
        }));
      } catch (error) {
        const raced = this.ctx.agents.get(id);
        if (raced !== void 0) return this.borrowAgent(raced);
        throw error;
      }
    }
    this.createdFreshAgent = true;
    try {
      return ownAgent(await this.ctx.agents.create({
        sessionId: id,
        meta: { cwd: this.config.cwd, agentPreset: this.config.agentPreset },
        agentOptions,
        setup: (agentCtx) => this.setupAgent(agentCtx, this.config.agentPreset)
      }));
    } catch (error) {
      const raced = this.ctx.agents.get(id);
      if (raced !== void 0) {
        this.createdFreshAgent = false;
        return this.borrowAgent(raced);
      }
      throw error;
    }
  }
  async setupAgent(agentCtx, preset) {
    await this.ctx.agentPresets.mount(agentCtx, preset);
    this.registerPrompt(agentCtx);
  }
  borrowAgent(agent) {
    const disposePrompt = this.registerPrompt(agent.ctx);
    return {
      agent,
      release: async () => {
        disposePrompt();
      }
    };
  }
  registerPrompt(agentCtx) {
    return agentCtx.systemPrompt.section({
      name: "channel:chatroom",
      order: 190,
      text: this.config.systemPrompt
    });
  }
  injectRecoveredTranscript() {
    const transcript = this.sortedRecords().map((record) => `${record.displayName}: ${record.text}`).join("\n");
    if (transcript === "") return;
    this.requireAgent().inject(createUserMessage({
      content: [{ type: "text", text: `\u804A\u5929\u5BA4\u6062\u590D\u8BB0\u5F55\uFF1A
${transcript}` }],
      source: { kind: "plugin", plugin: "chatroom", form: "recall" }
    }));
  }
  enqueueAi(message) {
    if (this.stopping) return;
    const task = this.aiTail.then(() => this.processHumanMessage(message));
    this.aiTail = task.catch((error) => {
      this.ctx.logger("deepseek-harness-chatroom").warn(
        "AI decision failed for room message %s; retrying in %dms: %s",
        shortId(message.id),
        this.config.aiRetryDelayMs,
        String(error)
      );
      this.scheduleRetry(message);
    });
  }
  scheduleRetry(message) {
    if (this.stopping) return;
    const timer = setTimeout(() => {
      this.retryTimers.delete(timer);
      const current = this.requireMessages().get(message.id);
      if (current?.role === "human" && current.aiProcessed !== true) this.enqueueAi(current);
    }, this.config.aiRetryDelayMs);
    this.retryTimers.add(timer);
  }
  async processHumanMessage(message) {
    if (this.stopping) return;
    const current = this.requireMessages().get(message.id);
    if (current === void 0 || current.role !== "human" || current.aiProcessed === true) return;
    const agent = this.requireAgent();
    await withTimeout(agent.whenIdle(), this.config.responseTimeoutMs, "chatroom Agent availability");
    const start = agent.session.events.length;
    agent.followup(createUserMessage({
      content: [{
        type: "text",
        text: `\u804A\u5929\u5BA4\u6D88\u606F\uFF1A${JSON.stringify({ speaker: current.displayName, message: current.text })}`
      }],
      source: {
        kind: "chatroom",
        roomId: this.config.roomId,
        roomMessageId: current.id,
        participantId: current.participantId,
        displayName: current.displayName
      }
    }));
    try {
      await withTimeout(agent.whenIdle(), this.config.responseTimeoutMs, "chatroom AI decision");
    } catch (error) {
      agent.cancel({ kind: "user" });
      throw error;
    }
    await this.ctx.sessions.flush(agent.session);
    const turnEvents = agent.session.events.slice(start);
    assertAiDecisionCompleted(turnEvents);
    const reply = latestAssistantReply(turnEvents);
    if (reply !== void 0 && shouldPublishReply(reply.text, this.config.noReplyToken)) {
      const stored = await this.commitMessage({
        id: reply.id,
        role: "ai",
        participantId: "ai",
        displayName: this.config.aiDisplayName,
        text: reply.text.trim(),
        createdAt: reply.createdAt,
        inReplyTo: current.id
      });
      this.broadcast({ type: "message", message: publicMessage(stored) });
    }
    await this.requireMessages().update(current.id, (record) => ({ ...record, aiProcessed: true }));
  }
  async reconcileCompletedTurns() {
    const completed = completedRoomTurns(this.requireAgent().session.events, this.config.noReplyToken);
    const replied = new Set(
      [...this.requireMessages().entries()].map(([, record]) => record.inReplyTo).filter((value) => value !== void 0)
    );
    for (const turn of completed) {
      const human = this.requireMessages().get(turn.roomMessageId);
      if (human === void 0 || human.role !== "human") continue;
      if (turn.reply !== void 0 && !replied.has(turn.roomMessageId)) {
        const stored = await this.commitMessage({
          id: turn.reply.id,
          role: "ai",
          participantId: "ai",
          displayName: this.config.aiDisplayName,
          text: turn.reply.text,
          createdAt: turn.reply.createdAt,
          inReplyTo: turn.roomMessageId
        });
        replied.add(stored.inReplyTo ?? turn.roomMessageId);
      }
      if (human.aiProcessed !== true) {
        await this.requireMessages().update(human.id, (record) => ({ ...record, aiProcessed: true }));
      }
    }
  }
  commitMessage(record) {
    return this.enqueueWrite(async () => {
      const existing = this.requireMessages().get(record.id);
      if (existing !== void 0) return existing;
      const stored = { ...record, sequence: this.nextSequence };
      await this.requireMessages().put(stored.id, stored);
      this.nextSequence += 1;
      return stored;
    });
  }
  enqueueWrite(operation) {
    if (this.stopping) return Promise.reject(new Error("chatroom is stopping"));
    const result = this.writeTail.then(operation);
    this.writeTail = result.then(swallow, swallow);
    return result;
  }
  sortedRecords() {
    return [...this.requireMessages().entries()].map(([, record]) => record).sort((left, right) => left.sequence - right.sequence);
  }
  onlineCount() {
    return new Set([...this.clients].map((client) => client.participantId)).size;
  }
  broadcast(event) {
    for (const client of [...this.clients]) {
      if (!writeSse(client.response, event)) this.clients.delete(client);
    }
  }
  broadcastPresence() {
    this.broadcast({ type: "presence", online: this.onlineCount() });
  }
  assertReady() {
    if (!this.isReady) throw new Error("chatroom is not ready");
  }
  requireIdentities() {
    if (this.identities === void 0) throw new Error("chatroom identity storage is unavailable");
    return this.identities;
  }
  requireMessages() {
    if (this.messages === void 0) throw new Error("chatroom message storage is unavailable");
    return this.messages;
  }
  requireAgent() {
    if (this.binding === void 0) throw new Error("chatroom Agent is unavailable");
    return this.binding.agent;
  }
};
function ownAgent(handle) {
  return { agent: handle.agent, release: () => handle.dispose() };
}
function publicIdentity(record) {
  return { participantId: record.participantId, displayName: record.displayName };
}
function publicMessage(record) {
  return {
    id: record.id,
    sequence: record.sequence,
    role: record.role,
    participantId: record.participantId,
    displayName: record.displayName,
    text: record.text,
    createdAt: record.createdAt,
    ...record.inReplyTo === void 0 ? {} : { inReplyTo: record.inReplyTo }
  };
}
function normalizeDisplayName(value, maxChars) {
  const normalized = value.trim().replace(/\s+/gu, " ");
  if (normalized === "") throw new ChatroomInputError("\u8BF7\u8F93\u5165\u8EAB\u4EFD\u540D\u79F0\u3002");
  if ([...normalized].length > maxChars) throw new ChatroomInputError(`\u8EAB\u4EFD\u540D\u79F0\u4E0D\u80FD\u8D85\u8FC7 ${maxChars} \u4E2A\u5B57\u7B26\u3002`);
  if (/\p{Cc}/u.test(normalized)) throw new ChatroomInputError("\u8EAB\u4EFD\u540D\u79F0\u4E0D\u80FD\u5305\u542B\u63A7\u5236\u5B57\u7B26\u3002");
  return normalized;
}
function normalizeMessage(value, maxChars) {
  const normalized = value.trim();
  if (normalized === "") throw new ChatroomInputError("\u6D88\u606F\u4E0D\u80FD\u4E3A\u7A7A\u3002");
  if ([...normalized].length > maxChars) throw new ChatroomInputError(`\u6D88\u606F\u4E0D\u80FD\u8D85\u8FC7 ${maxChars} \u4E2A\u5B57\u7B26\u3002`);
  return normalized;
}
function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}
function messageText(event) {
  return event.data.message.content.filter((block) => block.type === "text").map((block) => block.text).join("").trim();
}
function latestAssistantReply(events) {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event?.type !== "assistant/message") continue;
    const text = messageText(event);
    if (text !== "") return { id: String(event.data.message.id), text, createdAt: event.time };
  }
  return void 0;
}
function shouldPublishReply(text, noReplyToken) {
  return text.trim() !== "" && text.trim() !== noReplyToken;
}
function completedRoomTurns(events, noReplyToken) {
  const byTurn = /* @__PURE__ */ new Map();
  const completed = /* @__PURE__ */ new Set();
  let activeTurn;
  for (const event of events) {
    if (event.type === "turn/start") {
      activeTurn = event.data.turn;
      continue;
    }
    if (event.type === "turn/end") {
      if (isCompletedDecision(event)) completed.add(event.data.turn);
      activeTurn = void 0;
      continue;
    }
    if (event.type === "user/message" && activeTurn !== void 0 && event.data.source.kind === "chatroom") {
      byTurn.set(activeTurn, { roomMessageId: event.data.source.roomMessageId });
      continue;
    }
    if (event.type === "assistant/message") {
      const row = byTurn.get(event.data.turn);
      const text = messageText(event);
      if (row !== void 0 && text !== "") {
        row.reply = { id: String(event.data.message.id), text, createdAt: event.time };
      }
    }
  }
  const output = [];
  for (const [turn, row] of byTurn) {
    if (!completed.has(turn)) continue;
    output.push({
      roomMessageId: row.roomMessageId,
      ...row.reply === void 0 || !shouldPublishReply(row.reply.text, noReplyToken) ? {} : { reply: row.reply }
    });
  }
  return output;
}
function assertAiDecisionCompleted(events) {
  let end;
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event?.type === "turn/end") {
      end = event;
      break;
    }
  }
  if (end === void 0) throw new Error("chatroom AI turn ended without a durable turn/end event");
  if (isCompletedDecision(end)) return;
  const reason = end.data.reason;
  if (reason.kind === "error") {
    throw new Error(`chatroom AI turn failed (${reason.error.code}): ${reason.error.message}`);
  }
  throw new Error(`chatroom AI turn ended without a decision: ${reason.kind}`);
}
function isCompletedDecision(event) {
  return event.data.reason.kind === "completed" || event.data.reason.kind === "max-tokens";
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
async function withTimeout(task, timeoutMs, label) {
  let timer;
  try {
    return await Promise.race([
      task,
      new Promise((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
      })
    ]);
  } finally {
    if (timer !== void 0) clearTimeout(timer);
  }
}
function shortId(value) {
  return value.length <= 10 ? value : `${value.slice(0, 6)}\u2026${value.slice(-4)}`;
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
  /** Dispatch one request under the `/chatroom/api` prefix. */
  async handle(request, response) {
    try {
      const pathname = new URL(request.url ?? "/", "http://chatroom.local").pathname;
      if (pathname === "/chatroom/api/health" && request.method === "GET") {
        json(response, this.runtime.isReady ? 200 : 503, { ready: this.runtime.isReady });
        return;
      }
      if (!this.runtime.isReady) {
        json(response, 503, { error: "\u804A\u5929\u5BA4\u6B63\u5728\u542F\u52A8\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" });
        return;
      }
      if (pathname === "/chatroom/api/session") {
        await this.handleSession(request, response);
        return;
      }
      if (pathname === "/chatroom/api/events" && request.method === "GET") {
        this.handleEvents(request, response);
        return;
      }
      if (pathname === "/chatroom/api/messages") {
        await this.handleMessages(request, response);
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
  async handleSession(request, response) {
    const token = this.token(request);
    if (request.method === "GET") {
      const payload = {
        identity: this.runtime.identity(token) ?? null,
        room: this.runtime.room
      };
      json(response, 200, payload);
      return;
    }
    if (request.method === "POST") {
      assertSameOrigin(request);
      const existing = this.runtime.identity(token);
      if (existing !== void 0) {
        json(response, 200, { identity: existing, room: this.runtime.room });
        return;
      }
      const body = await readJson(request, requestLimit(this.config));
      const displayName = fieldString(body, "displayName");
      const created = await this.runtime.createIdentity(displayName);
      response.setHeader("Set-Cookie", sessionCookie(
        this.config.cookieName,
        created.token,
        this.config.cookieMaxAgeSeconds
      ));
      json(response, 201, { identity: created.identity, room: this.runtime.room });
      return;
    }
    if (request.method === "DELETE") {
      assertSameOrigin(request);
      await this.runtime.deleteIdentity(token);
      response.setHeader("Set-Cookie", expiredSessionCookie(this.config.cookieName));
      response.writeHead(204);
      response.end();
      return;
    }
    methodNotAllowed(response, "GET, POST, DELETE");
  }
  handleEvents(request, response) {
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    response.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    const unsubscribe = this.runtime.subscribe(identity, response);
    const heartbeat = setInterval(() => {
      if (!response.destroyed && !response.writableEnded) response.write(": heartbeat\n\n");
    }, this.config.sseHeartbeatMs);
    request.once("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  }
  async handleMessages(request, response) {
    const identity = this.requireIdentity(request, response);
    if (identity === void 0) return;
    if (request.method === "GET") {
      json(response, 200, { messages: this.runtime.history() });
      return;
    }
    if (request.method === "POST") {
      assertSameOrigin(request);
      const body = await readJson(request, requestLimit(this.config));
      const message = await this.runtime.send(identity, fieldString(body, "text"));
      json(response, 202, { message });
      return;
    }
    methodNotAllowed(response, "GET, POST");
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
function requestLimit(config) {
  return Math.max(config.maxDisplayNameChars, config.maxMessageChars) * 4 + 1024;
}

// src/index.ts
var name = "deepseek-harness-chatroom";
var inject = [
  "agentDefaultModel",
  "agentPresets",
  "agents",
  "sessionPersistence",
  "sessions",
  "storageDomain",
  "webServer"
];
function apply(ctx, config) {
  validateConfig(config);
  const runtime = new ChatroomRuntime(ctx, config);
  const http = new ChatroomHttpController(ctx, runtime, config);
  const log = ctx.logger("deepseek-harness-chatroom");
  ctx.effect(() => {
    const unregister = ctx.webServer.register({
      kind: "prefix",
      path: "/chatroom/api",
      handler: (request, response) => http.handle(request, response)
    });
    const startup = runtime.start().then(() => {
      log.info("AI chatroom %s is ready", JSON.stringify(config.roomId));
    }).catch(async (error) => {
      log.warn("AI chatroom remains offline: %s. Harness startup is unaffected.", String(error));
      await runtime.stop();
    });
    return async () => {
      unregister();
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