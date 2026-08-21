window.__ModuleLoader__.load({
	id: "deepseek-harness-chatroom",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperties(exports, {
			__esModule: { value: true },
			[Symbol.toStringTag]: { value: "Module" }
		});
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/ChatroomEntry.tsx
		/** Additive room launcher plus the first-visit identity dialog. */
		function ChatroomEntry(props) {
			const room = props.useChatroom((snapshot) => snapshot);
			const currentSession = props.useSessions((snapshot) => snapshot.current);
			const selected = room.room !== void 0 && String(currentSession) === room.room.sessionId;
			const identityNeeded = selected && room.identity === void 0 && room.phase !== "loading";
			if (!room.open && !identityNeeded) {
				if (selected) return null;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					className: "dsh-chatroom-launcher",
					"data-dsh-chatroom-entry": true,
					type: "button",
					onClick: props.openRoom,
					children: "◉ 进入 AI 聊天室"
				});
			}
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-chatroom-dialog-layer",
				"data-dsh-chatroom-entry": true,
				"data-testid": "chatroom-dialog",
				children: [
					room.phase === "identity-required" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IdentityStep, {
						room,
						join: props.join,
						close: props.closeRoom
					}),
					room.phase === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusCard, {
						title: "正在进入聊天室",
						detail: "正在恢复此浏览器的身份与共享会话…",
						close: props.closeRoom
					}),
					room.phase === "ready" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusCard, {
						title: "正在打开共享会话",
						detail: "房间 Session 正在加入 Harness 会话列表，完成后会自动打开。",
						action: "重试",
						onAction: props.retry,
						close: props.closeRoom
					}),
					room.phase === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusCard, {
						title: "聊天室暂时不可用",
						detail: room.error ?? "请稍后重试。",
						action: "重试",
						onAction: props.retry,
						close: props.closeRoom
					})
				]
			});
		}
		function IdentityStep({ room, join, close }) {
			const [name, setName] = (0, react.useState)("");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
				className: "dsh-chatroom-card",
				onSubmit: (event) => {
					event.preventDefault();
					join(name);
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: "dsh-chatroom-close",
						"aria-label": "关闭",
						type: "button",
						onClick: close,
						children: "×"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: room.room?.title ?? "AI 聊天室" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "选择你在共享会话中显示的名字。进入后使用 Harness 原生对话界面。" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: "dsh-chatroom-name",
						"data-testid": "chatroom-identity-input",
						autoFocus: true,
						maxLength: 80,
						placeholder: "你的名字",
						value: name,
						onChange: (event) => {
							setName(event.target.value);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: "dsh-chatroom-button",
						"data-testid": "chatroom-join",
						type: "submit",
						disabled: name.trim() === "",
						children: "进入共享会话"
					}),
					room.error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-chatroom-error",
						role: "alert",
						children: room.error
					})
				]
			});
		}
		function StatusCard({ title, detail, action, onAction, close }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-chatroom-card",
				role: "status",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: "dsh-chatroom-close",
						"aria-label": "关闭",
						type: "button",
						onClick: close,
						children: "×"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: title }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: detail }),
					action !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: "dsh-chatroom-button",
						type: "button",
						onClick: () => {
							onAction?.();
						},
						children: action
					})
				]
			});
		}
		//#endregion
		//#region src/client/native-prompt.ts
		/** Prefix one native prompt with the browser participant visible to every room member. */
		function identifyPrompt(content, displayName) {
			let identified = false;
			const output = content.map((part) => {
				if (identified || part.type !== "text") return part;
				identified = true;
				return {
					...part,
					text: `${displayName}：${part.text}`
				};
			});
			return identified ? output : [{
				type: "text",
				text: `${displayName} 发送了一张图片。`
			}, ...output];
		}
		/** Route only the configured shared Session through the identity decorator. */
		function installNativePromptIdentity(api, store) {
			const original = api.sessions.prompt;
			const wrapped = (payload, signal) => {
				const room = store.getSnapshot();
				if (room.room === void 0 || String(payload.sessionId) !== room.room.sessionId) return original(payload, signal);
				if (room.identity === void 0) return Promise.reject(/* @__PURE__ */ new Error("请先选择聊天室身份。"));
				return original({
					...payload,
					content: identifyPrompt(payload.content, room.identity.displayName)
				}, signal);
			};
			api.sessions.prompt = wrapped;
			return () => {
				if (api.sessions.prompt === wrapped) api.sessions.prompt = original;
			};
		}
		//#endregion
		//#region src/client/RoomIdentityAction.tsx
		/** Show the current room identity and presence inside the native session header. */
		function RoomIdentityAction(props) {
			const room = props.useChatroom((snapshot) => snapshot);
			if (room.room === void 0 || String(props.sessionId) !== room.room.sessionId) return null;
			const identity = room.identity;
			const presence = room.connection === "online" ? `${room.online} 人在线` : "连接中";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				className: "dsh-chatroom-identity-action",
				type: "button",
				title: identity === void 0 ? "选择聊天室身份" : "切换聊天室身份",
				onClick: () => {
					identity === void 0 ? props.openRoom() : props.resetIdentity();
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-chatroom-presence-dot",
						"data-online": room.connection === "online"
					}),
					identity?.displayName ?? "选择身份",
					" · ",
					presence
				]
			});
		}
		//#endregion
		//#region src/routes.ts
		/** Canonical API prefix carried through the Host's existing plugin proxy route. */
		const CHATROOM_API_PREFIX = "/plugins/deepseek-harness-chatroom/api";
		//#endregion
		//#region src/client/store.ts
		/** React-free owner of room identity, presence, and native Session navigation. */
		var ChatroomClientStore = class {
			openSession;
			snapshot = {
				open: false,
				phase: "loading",
				connection: "offline",
				room: void 0,
				identity: void 0,
				online: 0,
				error: void 0
			};
			listeners = /* @__PURE__ */ new Set();
			eventSource;
			stopped = false;
			constructor(openSession = () => false) {
				this.openSession = openSession;
			}
			/** Current immutable room projection. */
			getSnapshot = () => this.snapshot;
			/** Subscribe to room projection changes. */
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			/** Resolve the persistent browser identity and start presence synchronization. */
			async start() {
				this.stopped = false;
				await this.loadSession();
			}
			/** Stop network activity and notification delivery. */
			stop() {
				this.stopped = true;
				this.closeEvents();
				this.listeners.clear();
			}
			/** Open the native shared Session or show the identity dialog first. */
			openRoom = () => {
				this.set({
					open: true,
					error: void 0
				});
				this.resumeOpen();
			};
			/** Close only the additive identity/status dialog. */
			closeRoom = () => {
				this.set({ open: false });
			};
			/** Retry pending navigation when the Host Session list changes. */
			resumeOpen = () => {
				const { open, phase, room, identity } = this.snapshot;
				if (!open || phase !== "ready" || room === void 0 || identity === void 0) return;
				if (this.openSession(room.sessionId)) this.set({
					open: false,
					error: void 0
				});
			};
			/** Create the first persistent browser identity, then enter the shared Session. */
			join = async (displayName) => {
				this.set({
					phase: "loading",
					error: void 0
				});
				try {
					const session = await requestJson(`${CHATROOM_API_PREFIX}/session`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ displayName })
					});
					if (session.identity === null) throw new Error("服务端没有返回聊天室身份。");
					this.set({
						phase: "ready",
						room: session.room,
						identity: session.identity,
						connection: "connecting",
						error: void 0
					});
					this.openEvents();
					this.resumeOpen();
				} catch (error) {
					this.set({
						phase: "identity-required",
						error: errorMessage(error)
					});
				}
			};
			/** Revoke the current identity and reopen the identity dialog. */
			resetIdentity = async () => {
				this.closeEvents();
				try {
					await requestEmpty(`${CHATROOM_API_PREFIX}/session`, { method: "DELETE" });
					this.set({
						open: true,
						phase: "identity-required",
						connection: "offline",
						identity: void 0,
						online: 0,
						error: void 0
					});
				} catch (error) {
					this.set({
						open: true,
						phase: "error",
						error: errorMessage(error)
					});
				}
			};
			/** Retry identity recovery and pending Session navigation. */
			retry = async () => {
				this.set({
					phase: "loading",
					error: void 0
				});
				await this.loadSession();
				this.resumeOpen();
			};
			async loadSession() {
				try {
					const session = await requestJson(`${CHATROOM_API_PREFIX}/session`);
					if (this.stopped) return;
					if (session.identity === null) {
						this.set({
							phase: "identity-required",
							connection: "offline",
							room: session.room,
							identity: void 0,
							online: 0,
							error: void 0
						});
						return;
					}
					this.set({
						phase: "ready",
						connection: "connecting",
						room: session.room,
						identity: session.identity,
						error: void 0
					});
					this.openEvents();
				} catch (error) {
					if (!this.stopped) this.set({
						phase: "error",
						connection: "offline",
						error: errorMessage(error)
					});
				}
			}
			openEvents() {
				this.closeEvents();
				if (this.stopped || this.snapshot.identity === void 0) return;
				this.set({ connection: "connecting" });
				const source = new EventSource(`${CHATROOM_API_PREFIX}/events`);
				this.eventSource = source;
				source.onopen = () => {
					if (this.eventSource === source) this.set({
						connection: "online",
						error: void 0
					});
				};
				source.onmessage = (event) => {
					if (this.eventSource !== source) return;
					try {
						this.receive(JSON.parse(event.data));
					} catch {
						this.set({ error: "收到无法识别的聊天室同步消息。" });
					}
				};
				source.onerror = () => {
					if (this.eventSource === source) this.set({ connection: "connecting" });
				};
			}
			closeEvents() {
				this.eventSource?.close();
				this.eventSource = void 0;
			}
			receive(event) {
				switch (event.type) {
					case "snapshot":
						this.set({
							phase: "ready",
							connection: "online",
							room: event.room,
							identity: event.identity,
							online: event.online,
							error: void 0
						});
						return;
					case "presence": this.set({ online: event.online });
				}
			}
			set(patch) {
				if (this.stopped) return;
				this.snapshot = {
					...this.snapshot,
					...patch
				};
				for (const listener of this.listeners) listener();
			}
		};
		var HttpError = class extends Error {
			status;
			constructor(status, message) {
				super(message);
				this.status = status;
			}
		};
		async function requestJson(url, init) {
			const response = await fetch(url, {
				...init,
				credentials: "same-origin"
			});
			if (!response.ok) throw await responseError(response);
			return await response.json();
		}
		async function requestEmpty(url, init) {
			const response = await fetch(url, {
				...init,
				credentials: "same-origin"
			});
			if (!response.ok) throw await responseError(response);
		}
		async function responseError(response) {
			let message = `聊天室请求失败（HTTP ${response.status}）。`;
			try {
				const body = await response.json();
				if (typeof body.error === "string" && body.error !== "") message = body.error;
			} catch {}
			return new HttpError(response.status, message);
		}
		function errorMessage(error) {
			return error instanceof Error ? error.message : String(error);
		}
		//#endregion
		//#region src/client/styles.ts
		/** Small additive surfaces around the Harness-owned conversation UI. */
		const CHATROOM_STYLES = `
.dsh-chatroom-launcher {
  pointer-events: auto;
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 40;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 999px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 12px 20px;
  font: inherit;
  font-weight: 600;
  box-shadow: 0 10px 30px rgb(0 0 0 / 10%);
  cursor: pointer;
}

.dsh-chatroom-dialog-layer {
  pointer-events: auto;
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(0 0 0 / 28%);
  backdrop-filter: blur(2px);
}

.dsh-chatroom-card {
  position: relative;
  width: min(420px, calc(100vw - 48px));
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 18px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 28px;
  box-shadow: 0 24px 70px rgb(0 0 0 / 18%);
}

.dsh-chatroom-card h2 { margin: 0 0 10px; font-size: 22px; }
.dsh-chatroom-card p { margin: 0 0 20px; color: var(--text-secondary, #6b7280); line-height: 1.6; }

.dsh-chatroom-close {
  position: absolute;
  top: 12px;
  right: 14px;
  border: 0;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  font: inherit;
  font-size: 24px;
  cursor: pointer;
}

.dsh-chatroom-name {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid var(--border-primary, #d1d5db);
  border-radius: 10px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 11px 13px;
  font: inherit;
  outline: none;
}

.dsh-chatroom-name:focus { border-color: var(--brand-primary, #4f7cff); }

.dsh-chatroom-button {
  width: 100%;
  margin-top: 14px;
  border: 0;
  border-radius: 10px;
  background: var(--brand-primary, #4f7cff);
  color: #fff;
  padding: 11px 16px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.dsh-chatroom-button:disabled { cursor: not-allowed; opacity: .45; }
.dsh-chatroom-error { margin-top: 12px; color: #d14343; font-size: 13px; }

.dsh-chatroom-identity-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 4px 6px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.dsh-chatroom-presence-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a0a7b2;
}

.dsh-chatroom-presence-dot[data-online="true"] { background: #20b26b; }
`;
		//#endregion
		//#region src/client/index.tsx
		const inject = [
			"connection",
			"sessions",
			"slots"
		];
		/** Add room identity and navigation around the existing Harness conversation UI. */
		function apply(ctx) {
			const connection = ctx.get("connection");
			if (connection === void 0) throw new Error("chatroom: client connection service unavailable");
			const sessions = ctx.get("sessions");
			if (sessions === void 0) throw new Error("chatroom: client sessions service unavailable");
			const store = new ChatroomClientStore((rawSessionId) => {
				const sessionId = rawSessionId;
				if (sessions.list.getSnapshot().byId[sessionId] === void 0) return false;
				sessions.open(sessionId);
				return true;
			});
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.dshChatroomStyles = "";
				style.textContent = CHATROOM_STYLES;
				document.head.append(style);
				const restorePrompt = installNativePromptIdentity(connection.api, store);
				const unsubscribeSessions = sessions.list.subscribe(store.resumeOpen);
				store.start();
				return () => {
					unsubscribeSessions();
					restorePrompt();
					store.stop();
					style.remove();
				};
			}, "chatroom: browser state and styles");
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "chatroom",
				order: 0,
				inject: () => ({
					hooks: { chatroom: store },
					openRoom: store.openRoom,
					closeRoom: store.closeRoom,
					join: store.join,
					retry: store.retry
				})
			}, ChatroomEntry));
			ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
				name: "conversation.session.header.actions",
				id: "chatroom-identity",
				order: -5,
				inject: () => ({
					hooks: { chatroom: store },
					openRoom: store.openRoom,
					resetIdentity: store.resetIdentity
				})
			}, RoomIdentityAction));
		}
		var client_default = {
			inject,
			apply
		};
		//#endregion
		exports.apply = apply;
		exports.default = client_default;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map