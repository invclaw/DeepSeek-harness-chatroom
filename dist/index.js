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
  sseHeartbeatMs: z.number().step(1).min(5e3).max(12e4).default(15e3)
});
function validateConfig(config) {
  if (!isAbsolute(config.cwd)) {
    throw new Error(`chatroom: cwd must be absolute, got ${JSON.stringify(config.cwd)}`);
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
  binding;
  ready = false;
  stopping = false;
  clients = /* @__PURE__ */ new Set();
  /** Public metadata for this configured room. */
  get room() {
    return {
      id: this.config.roomId,
      title: this.config.roomTitle,
      aiDisplayName: this.config.aiDisplayName,
      sessionId: this.config.sessionId
    };
  }
  /** Whether identity persistence and the shared Session are ready. */
  get isReady() {
    return this.ready && !this.stopping;
  }
  /** Open identity storage and acquire the shared Session without blocking Harness startup. */
  async start() {
    const domain = await this.ctx.storageDomain.open(chatroomDomainSpec);
    this.domain = domain;
    this.identities = domain.table("identities");
    this.binding = await this.acquireAgent();
    await this.attachWorkspace();
    this.ready = true;
  }
  /** Stop intake, close presence streams, and release owned resources. */
  async stop() {
    if (this.stopping) return;
    this.stopping = true;
    this.ready = false;
    for (const client of this.clients) client.response.end();
    this.clients.clear();
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
  /** Attach one authenticated presence client and send the current room baseline. */
  subscribe(identity, response) {
    this.assertReady();
    const client = { participantId: identity.participantId, response };
    this.clients.add(client);
    const snapshot = {
      type: "snapshot",
      room: this.room,
      identity,
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
  async acquireAgent() {
    const id = SessionId(this.config.sessionId);
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
  /** Ensure the shared Session uses the same native Workspace navigation as ordinary conversations. */
  async attachWorkspace() {
    const workspace = await this.ctx.workspaceRegistry.resolveByPath(this.config.cwd) ?? await this.ctx.workspaceRegistry.create(this.config.cwd);
    await workspace.attachSession(SessionId(this.config.sessionId));
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
};
function ownAgent(handle) {
  return { agent: handle.agent, release: () => handle.dispose() };
}
function borrowAgent(agent) {
  return { agent, release: async () => void 0 };
}
function publicIdentity(record) {
  return { participantId: record.participantId, displayName: record.displayName };
}
function normalizeDisplayName(value, maxChars) {
  const normalized = value.trim().replace(/\s+/gu, " ");
  if (normalized === "") throw new ChatroomInputError("\u8BF7\u8F93\u5165\u8EAB\u4EFD\u540D\u79F0\u3002");
  if ([...normalized].length > maxChars) throw new ChatroomInputError(`\u8EAB\u4EFD\u540D\u79F0\u4E0D\u80FD\u8D85\u8FC7 ${maxChars} \u4E2A\u5B57\u7B26\u3002`);
  if (/\p{Cc}/u.test(normalized)) throw new ChatroomInputError("\u8EAB\u4EFD\u540D\u79F0\u4E0D\u80FD\u5305\u542B\u63A7\u5236\u5B57\u7B26\u3002");
  return normalized;
}
function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
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
      const pathname = new URL(request.url ?? "/", "http://chatroom.local").pathname;
      const route = matchChatroomApi(pathname);
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
      if (route.endpoint === "/events" && request.method === "GET") {
        this.handleEvents(request, response);
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
        this.config.cookieMaxAgeSeconds,
        cookiePath
      ));
      json(response, 201, { identity: created.identity, room: this.runtime.room });
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
  return config.maxDisplayNameChars * 4 + 1024;
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