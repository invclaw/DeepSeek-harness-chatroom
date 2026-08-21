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
		/** Additive shared-session launcher, identity setup, and room directory. */
		function ChatroomEntry(props) {
			const room = props.useChatroom((snapshot) => snapshot);
			if (!room.open) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				className: "dsh-chatroom-launcher",
				"data-dsh-chatroom-entry": true,
				type: "button",
				onClick: props.openRoom,
				children: "◉ 共享会话"
			});
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
						title: "正在载入共享会话",
						detail: "正在恢复此浏览器的身份与会话目录…",
						close: props.closeRoom
					}),
					room.phase === "ready" && room.identity !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RoomStep, {
						room,
						selectRoom: props.selectRoom,
						createRoom: props.createRoom,
						resetIdentity: props.resetIdentity,
						close: props.closeRoom
					}),
					room.phase === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusCard, {
						title: "共享会话暂时不可用",
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "共享会话" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "选择你在共享会话中显示的名字。进入后继续使用 Harness 原生对话界面。" }),
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
						children: "继续"
					}),
					room.error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-chatroom-error",
						role: "alert",
						children: room.error
					})
				]
			});
		}
		function RoomStep({ room, selectRoom, createRoom, resetIdentity, close }) {
			const [title, setTitle] = (0, react.useState)("");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-chatroom-card dsh-chatroom-room-card",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: "dsh-chatroom-close",
						"aria-label": "关闭",
						type: "button",
						onClick: close,
						children: "×"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "共享会话" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
						"普通消息只在人类之间聊天；输入 ",
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "@AI" }),
						" 或 ",
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("code", { children: ["@", room.rooms[0]?.aiDisplayName ?? "DeepSeek"] }),
						" 才会触发 AI 回复。"
					] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-chatroom-room-list",
						"data-testid": "chatroom-room-list",
						children: room.rooms.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							className: "dsh-chatroom-room-item",
							"data-active": item.id === room.room?.id,
							"data-testid": `chatroom-room-${item.id}`,
							type: "button",
							onClick: () => {
								selectRoom(item.id);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: item.title }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: ["@", item.aiDisplayName] })]
						}, item.id))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						className: "dsh-chatroom-create",
						onSubmit: (event) => {
							event.preventDefault();
							if (title.trim() !== "") createRoom(title);
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "dsh-chatroom-name",
							"data-testid": "chatroom-title-input",
							maxLength: 160,
							placeholder: "新共享会话名称",
							value: title,
							onChange: (event) => {
								setTitle(event.target.value);
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "dsh-chatroom-create-button",
							"data-testid": "chatroom-create",
							type: "submit",
							disabled: title.trim() === "",
							children: "新建"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-chatroom-card-footer",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["当前身份：", room.identity?.displayName] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								resetIdentity();
							},
							children: "更换身份"
						})]
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
		/** Whether the native command dispatcher must retain ownership of this submission. */
		function isSlashCommand(content) {
			return content.find((part) => part.type === "text")?.text.trimStart().startsWith("/") ?? false;
		}
		//#endregion
		//#region src/client/ChatroomMessageNodeView.tsx
		/** Participant-specific display projection of one durable native user node. */
		function projectChatroomMessage(node, identity) {
			let own = false;
			let projected = false;
			let displayName;
			const content = node.data.content.map((block) => {
				if (projected || block.type !== "text") return block;
				projected = true;
				const marker = participantMarker(block.text);
				const visibleText = marker === void 0 ? block.text : block.text.slice(marker.length);
				const namePrefix = /^([^：]{1,80})：/.exec(visibleText);
				displayName = namePrefix?.[1];
				own = marker === void 0 ? displayName === identity.displayName : marker.participantId === identity.participantId;
				const messageText = namePrefix === null ? visibleText : visibleText.slice(namePrefix[0].length);
				return messageText === block.text ? block : {
					...block,
					text: messageText
				};
			});
			return {
				node: projected ? {
					...node,
					data: {
						...node.data,
						content
					}
				} : node,
				own,
				...displayName === void 0 ? {} : { displayName }
			};
		}
		/** Reuse Harness' native user renderer and move only peer user messages to the left. */
		const ChatroomUserMessageNodeView = (0, react.memo)(function ChatroomUserMessageNodeView(props) {
			const room = props.useChatroom((snapshot) => snapshot);
			const NativeView = props.nativeMessageView;
			if (!room.rooms.some((candidate) => String(props.sessionId) === candidate.sessionId) || room.identity === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NativeView, { ...props });
			const projection = projectChatroomMessage(props.node, room.identity);
			return participantMessage(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NativeView, {
				...props,
				node: projection.node
			}), projection);
		});
		/** Reuse Harness' native steering renderer and move only peer steering messages to the left. */
		const ChatroomSteeringMessageNodeView = (0, react.memo)(function ChatroomSteeringMessageNodeView(props) {
			const room = props.useChatroom((snapshot) => snapshot);
			const NativeView = props.nativeMessageView;
			if (!room.rooms.some((candidate) => String(props.sessionId) === candidate.sessionId) || room.identity === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NativeView, { ...props });
			const projection = projectChatroomMessage(props.node, room.identity);
			return participantMessage(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NativeView, {
				...props,
				node: projection.node
			}), projection);
		});
		function participantMessage(native, projection) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-chatroom-participant-message",
				"data-dsh-chatroom-own": projection.own,
				children: [projection.displayName !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-chatroom-display-name",
					children: projection.displayName
				}), native]
			});
		}
		function participantMarker(text) {
			if (!text.startsWith("⁣dsh-chatroom:")) return void 0;
			const end = text.indexOf("⁣", 14);
			if (end < 0) return void 0;
			const participantId = text.slice(14, end);
			if (participantId === "") return void 0;
			return {
				participantId,
				length: end + 1
			};
		}
		//#endregion
		//#region src/routes.ts
		/** Canonical API prefix carried through the Host's existing plugin proxy route. */
		const CHATROOM_API_PREFIX = "/plugins/deepseek-harness-chatroom/api";
		//#endregion
		//#region src/client/store.ts
		/** React-free owner of room identity, directory, presence, and native Session navigation. */
		var ChatroomClientStore = class {
			openSession;
			snapshot = {
				open: false,
				phase: "loading",
				connection: "offline",
				rooms: [],
				room: void 0,
				identity: void 0,
				online: 0,
				error: void 0
			};
			listeners = /* @__PURE__ */ new Set();
			eventSource;
			pendingOpenRoomId;
			stopped = false;
			constructor(openSession = () => false) {
				this.openSession = openSession;
			}
			/** Current immutable room projection. */
			getSnapshot = () => this.snapshot;
			/** Resolve room metadata for any native Session in the shared directory. */
			roomForSession(sessionId) {
				return this.snapshot.rooms.find((room) => room.sessionId === sessionId);
			}
			/** Subscribe to room projection changes. */
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			/** Resolve the persistent browser identity and shared room directory. */
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
			/** Show identity setup or the shared room directory. */
			openRoom = () => {
				this.set({
					open: true,
					error: void 0
				});
			};
			/** Close only the additive room dialog. */
			closeRoom = () => {
				this.set({ open: false });
			};
			/** Retry pending native navigation when the Host Session list changes. */
			resumeOpen = () => {
				const roomId = this.pendingOpenRoomId;
				if (roomId === void 0) return;
				const room = this.snapshot.rooms.find((candidate) => candidate.id === roomId);
				if (room === void 0 || !this.openSession(room.sessionId)) return;
				this.pendingOpenRoomId = void 0;
				this.set({
					open: false,
					error: void 0
				});
			};
			/** Track native navigation so presence follows the room currently on screen. */
			activateSession = (sessionId) => {
				const room = sessionId === void 0 ? void 0 : this.roomForSession(sessionId);
				if (room === void 0) {
					this.closeEvents();
					this.set({
						room: void 0,
						connection: "offline",
						online: 0
					});
					return;
				}
				if (this.snapshot.room?.id === room.id && this.eventSource !== void 0) return;
				this.set({
					room,
					connection: "connecting",
					online: 0
				});
				this.openEvents(room);
			};
			/** Create the persistent browser identity, then show the room directory. */
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
						rooms: session.rooms,
						room: void 0,
						identity: session.identity,
						connection: "offline",
						online: 0,
						error: void 0
					});
				} catch (error) {
					this.set({
						phase: "identity-required",
						error: errorMessage(error)
					});
				}
			};
			/** Activate and navigate to an existing shared room. */
			selectRoom = async (roomId) => {
				this.set({ error: void 0 });
				try {
					const response = await requestJson(`${CHATROOM_API_PREFIX}/rooms/select`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ roomId })
					});
					this.selectAndOpen(response.room);
				} catch (error) {
					this.set({
						phase: "ready",
						error: errorMessage(error)
					});
				}
			};
			/** Create, activate, and navigate to a new independent shared room. */
			createRoom = async (title) => {
				this.set({ error: void 0 });
				try {
					const response = await requestJson(`${CHATROOM_API_PREFIX}/rooms`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ title })
					});
					this.selectAndOpen(response.room);
				} catch (error) {
					this.set({
						phase: "ready",
						error: errorMessage(error)
					});
				}
			};
			/** Revoke the current identity and reopen identity setup. */
			resetIdentity = async () => {
				this.closeEvents();
				try {
					await requestEmpty(`${CHATROOM_API_PREFIX}/session`, { method: "DELETE" });
					this.set({
						open: true,
						phase: "identity-required",
						connection: "offline",
						room: void 0,
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
			/** Retry identity and directory recovery. */
			retry = async () => {
				this.set({
					phase: "loading",
					error: void 0
				});
				await this.loadSession();
			};
			selectAndOpen(room) {
				const rooms = this.snapshot.rooms.some((candidate) => candidate.id === room.id) ? this.snapshot.rooms.map((candidate) => candidate.id === room.id ? room : candidate) : [...this.snapshot.rooms, room];
				this.pendingOpenRoomId = room.id;
				this.set({
					phase: "ready",
					rooms,
					room,
					connection: "connecting",
					online: 0,
					error: void 0
				});
				this.openEvents(room);
				this.resumeOpen();
			}
			async loadSession() {
				try {
					const session = await requestJson(`${CHATROOM_API_PREFIX}/session`);
					if (this.stopped) return;
					if (session.identity === null) {
						this.closeEvents();
						this.set({
							phase: "identity-required",
							connection: "offline",
							rooms: session.rooms,
							room: void 0,
							identity: void 0,
							online: 0,
							error: void 0
						});
						return;
					}
					this.set({
						phase: "ready",
						connection: "offline",
						rooms: session.rooms,
						identity: session.identity,
						error: void 0
					});
				} catch (error) {
					if (!this.stopped) this.set({
						phase: "error",
						connection: "offline",
						error: errorMessage(error)
					});
				}
			}
			openEvents(room) {
				this.closeEvents();
				if (this.stopped || this.snapshot.identity === void 0) return;
				this.set({ connection: "connecting" });
				const source = new EventSource(`${CHATROOM_API_PREFIX}/events?roomId=${encodeURIComponent(room.id)}`);
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
		/** Submit one native composer payload through human-first room admission. */
		async function submitRoomPrompt(request, signal) {
			return await requestJson(`${CHATROOM_API_PREFIX}/prompt`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(request),
				...signal === void 0 ? {} : { signal }
			});
		}
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
		//#region src/client/native-prompt.ts
		/** Route shared room chat through human-first admission while preserving native slash commands. */
		function installNativePromptIdentity(api, store) {
			const original = api.sessions.prompt;
			const wrapped = async (payload, signal) => {
				const room = store.roomForSession(String(payload.sessionId));
				if (room === void 0) return await original(payload, signal);
				if (isSlashCommand(payload.content)) return await original(payload, signal);
				if (store.getSnapshot().identity === void 0) throw new Error("请先选择聊天室身份。");
				await submitRoomPrompt({
					roomId: room.id,
					mode: payload.mode,
					content: payload.content
				}, signal);
				return {
					rpcId: "chatroom-human-first",
					result: {
						ok: true,
						value: { accepted: true }
					}
				};
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
			const current = room.rooms.find((candidate) => String(props.sessionId) === candidate.sessionId);
			if (current === void 0) return null;
			const identity = room.identity;
			const selected = room.room?.id === current.id;
			const presence = selected && room.connection === "online" ? `${room.online} 人在线` : "共享会话";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				className: "dsh-chatroom-identity-action",
				type: "button",
				title: identity === void 0 ? "选择聊天室身份" : "切换共享会话",
				onClick: props.openRoom,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-chatroom-presence-dot",
						"data-online": selected && room.connection === "online"
					}),
					identity?.displayName ?? "选择身份",
					" · ",
					presence
				]
			});
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
.dsh-chatroom-card code { color: var(--text-primary, #111827); font-size: .92em; }

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

.dsh-chatroom-room-card { width: min(480px, calc(100vw - 48px)); }

.dsh-chatroom-room-list {
  display: grid;
  gap: 8px;
  max-height: min(340px, 42vh);
  overflow-y: auto;
}

.dsh-chatroom-room-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 10px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 11px 13px;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.dsh-chatroom-room-item:hover,
.dsh-chatroom-room-item[data-active="true"] {
  border-color: var(--brand-primary, #4f7cff);
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent);
}

.dsh-chatroom-room-item small { color: var(--text-secondary, #6b7280); }

.dsh-chatroom-create {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-top: 14px;
}

.dsh-chatroom-create-button {
  border: 0;
  border-radius: 10px;
  background: var(--brand-primary, #4f7cff);
  color: #fff;
  padding: 0 18px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.dsh-chatroom-create-button:disabled { cursor: not-allowed; opacity: .45; }

.dsh-chatroom-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  color: var(--text-secondary, #6b7280);
  font-size: 13px;
}

.dsh-chatroom-card-footer button {
  border: 0;
  background: transparent;
  color: var(--brand-primary, #4f7cff);
  padding: 0;
  font: inherit;
  cursor: pointer;
}

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

.dsh-chatroom-participant-message {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dsh-chatroom-display-name {
  max-width: min(525px, 82%);
  padding: 0 4px;
  overflow: hidden;
  color: var(--dsw-alias-label-secondary, var(--text-secondary, #6b7280));
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] > .dsh-chatroom-display-name {
  align-self: flex-end;
  text-align: right;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] > .dsh-chatroom-display-name {
  align-self: flex-start;
  text-align: left;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] > :last-child {
  align-items: flex-start !important;
  text-align: left;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] > :last-child > *:first-child,
.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] > :last-child > *:first-child > * {
  align-items: flex-start !important;
  align-self: flex-start !important;
}
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
				const list = sessions.list.getSnapshot();
				if (list.current === sessionId) return true;
				if (list.byId[sessionId] === void 0) return false;
				sessions.open(sessionId);
				return true;
			});
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.dshChatroomStyles = "";
				style.textContent = CHATROOM_STYLES;
				document.head.append(style);
				const restorePrompt = installNativePromptIdentity(connection.api, store);
				const syncSession = () => {
					store.resumeOpen();
					const current = sessions.list.getSnapshot().current;
					store.activateSession(current === void 0 ? void 0 : String(current));
				};
				const unsubscribeSessions = sessions.list.subscribe(syncSession);
				store.start().then(syncSession);
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
					selectRoom: store.selectRoom,
					createRoom: store.createRoom,
					resetIdentity: store.resetIdentity,
					retry: store.retry
				})
			}, ChatroomEntry));
			ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
				name: "conversation.session.header.actions",
				id: "chatroom-identity",
				order: -5,
				inject: () => ({
					hooks: { chatroom: store },
					openRoom: store.openRoom
				})
			}, RoomIdentityAction));
			ctx.slots.inject("conversation.chat.node", () => {
				const nativeEntry = ctx.slots.entries("conversation.chat.node").find((entry) => entry.options.key === "user" && (entry.options.priority ?? 0) === 0);
				if (nativeEntry === void 0) throw new Error("chatroom: native user message renderer unavailable");
				const nativeMessageView = nativeEntry.component;
				return ctx.slots.register({
					name: "conversation.chat.node",
					key: "user",
					priority: -10,
					locale: "conversation",
					inject: () => ({
						hooks: { chatroom: store },
						nativeMessageView
					})
				}, ChatroomUserMessageNodeView);
			});
			ctx.slots.inject("conversation.chat.node", () => {
				const nativeEntry = ctx.slots.entries("conversation.chat.node").find((entry) => entry.options.key === "steering" && (entry.options.priority ?? 0) === 0);
				if (nativeEntry === void 0) throw new Error("chatroom: native steering message renderer unavailable");
				const nativeMessageView = nativeEntry.component;
				return ctx.slots.register({
					name: "conversation.chat.node",
					key: "steering",
					priority: -10,
					locale: "conversation",
					inject: () => ({
						hooks: { chatroom: store },
						nativeMessageView
					})
				}, ChatroomSteeringMessageNodeView);
			});
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