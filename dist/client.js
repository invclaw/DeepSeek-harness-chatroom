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
		//#region src/client/ChatroomShell.tsx
		/** Frame-wide chatroom entry and full-screen one-to-many conversation surface. */
		function ChatroomShell(props) {
			const room = props.useChatroom((snapshot) => snapshot);
			if (!room.open) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				className: "dsh-chatroom-launcher",
				"data-dsh-chatroom-entry": true,
				type: "button",
				onClick: props.openRoom,
				children: "◉ 进入 AI 聊天室"
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dsh-chatroom-shell",
				"data-dsh-chatroom-entry": true,
				"data-testid": "chatroom-shell",
				children: [
					room.phase === "identity-required" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IdentityStep, {
						room,
						join: props.join
					}),
					room.phase === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusCard, {
						title: "正在进入聊天室",
						detail: "正在恢复此浏览器的身份与房间状态…"
					}),
					room.phase === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusCard, {
						title: "聊天室暂时不可用",
						detail: room.error ?? "请稍后重试。",
						action: "重试",
						onAction: props.retry
					}),
					room.phase === "ready" && room.identity !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RoomView, {
						room,
						closeRoom: props.closeRoom,
						resetIdentity: props.resetIdentity,
						send: props.send
					})
				]
			});
		}
		function IdentityStep({ room, join }) {
			const [name, setName] = (0, react.useState)("");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-chatroom-center",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
					className: "dsh-chatroom-card",
					onSubmit: (event) => {
						event.preventDefault();
						join(name);
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: room.room?.title ?? "AI 聊天室" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "第一次进入，请选择你在房间中显示的身份。此浏览器会在后续访问时自动恢复。" }),
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
							className: "dsh-chatroom-button primary",
							"data-testid": "chatroom-join",
							type: "submit",
							disabled: name.trim() === "",
							children: "进入聊天室"
						}),
						room.error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-chatroom-error",
							role: "alert",
							children: room.error
						})
					]
				})
			});
		}
		function RoomView({ room, closeRoom, resetIdentity, send }) {
			const [draft, setDraft] = (0, react.useState)("");
			const bottomRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				bottomRef.current?.scrollIntoView?.({ block: "end" });
			}, [room.messages.length]);
			const submit = async () => {
				const text = draft.trim();
				if (text === "") return;
				if (await send(text)) setDraft("");
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: "dsh-chatroom-header",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "dsh-chatroom-icon-button",
							title: "返回 Harness",
							type: "button",
							onClick: closeRoom,
							children: "‹"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-chatroom-heading",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
								className: "dsh-chatroom-title",
								children: room.room?.title ?? "AI 聊天室"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-chatroom-presence",
								children: [
									connectionLabel(room.connection),
									" · ",
									room.online,
									" 人在线"
								]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-chatroom-header-actions",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-chatroom-presence dsh-chatroom-identity-label",
								children: room.identity?.displayName
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: "dsh-chatroom-icon-button",
								title: "切换身份",
								type: "button",
								onClick: () => {
									resetIdentity();
								},
								children: "↻"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("main", {
					className: "dsh-chatroom-transcript",
					"data-testid": "chatroom-transcript",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-chatroom-column",
						children: [
							room.messages.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-chatroom-empty",
								children: "房间还没有消息，来打个招呼吧。"
							}),
							room.messages.map((message) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MessageRow, {
								message,
								own: message.participantId === room.identity?.participantId
							}, message.id)),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { ref: bottomRef })
						]
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
					className: "dsh-chatroom-composer-wrap",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-chatroom-composer",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
							className: "dsh-chatroom-textarea",
							"data-testid": "chatroom-composer",
							"aria-label": "发送聊天室消息",
							rows: 1,
							placeholder: "给房间里的大家发消息…",
							value: draft,
							onChange: (event) => {
								setDraft(event.target.value);
							},
							onKeyDown: (event) => {
								if (event.key === "Enter" && !event.shiftKey) {
									event.preventDefault();
									submit();
								}
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "dsh-chatroom-send",
							"data-testid": "chatroom-send",
							title: "发送",
							type: "button",
							disabled: draft.trim() === "" || room.sending,
							onClick: () => {
								submit();
							},
							children: "↑"
						})]
					}), room.error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-chatroom-error",
						role: "alert",
						children: room.error
					})]
				})
			] });
		}
		function MessageRow({ message, own }) {
			const ai = message.role === "ai";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
				className: `dsh-chatroom-row${own ? " own" : ""}`,
				"data-message-id": message.id,
				"data-message-side": own ? "right" : "left",
				children: [!own && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: `dsh-chatroom-avatar${ai ? "" : " human"}`,
					children: ai ? "AI" : firstGrapheme(message.displayName)
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-chatroom-message",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-chatroom-meta",
						children: [
							message.displayName,
							" · ",
							formatTime(message.createdAt)
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-chatroom-bubble",
						children: message.text
					})]
				})]
			});
		}
		function StatusCard({ title, detail, action, onAction }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-chatroom-center",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-chatroom-card",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: title }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: detail }),
						action !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "dsh-chatroom-button primary",
							type: "button",
							onClick: () => {
								onAction?.();
							},
							children: action
						})
					]
				})
			});
		}
		function connectionLabel(connection) {
			return connection === "online" ? "已同步" : connection === "connecting" ? "连接中" : "离线";
		}
		function firstGrapheme(value) {
			return [...value][0]?.toUpperCase() ?? "?";
		}
		function formatTime(timestamp) {
			return new Intl.DateTimeFormat("zh-CN", {
				hour: "2-digit",
				minute: "2-digit"
			}).format(timestamp);
		}
		//#endregion
		//#region src/routes.ts
		/** Canonical API prefix carried through the Host's existing plugin proxy route. */
		const CHATROOM_API_PREFIX = "/plugins/deepseek-harness-chatroom/api";
		//#endregion
		//#region src/client/store.ts
		/** React-free owner of room HTTP, SSE, navigation, and immutable UI state. */
		var ChatroomClientStore = class {
			snapshot = {
				open: true,
				phase: "loading",
				connection: "offline",
				room: void 0,
				identity: void 0,
				messages: [],
				online: 0,
				sending: false,
				error: void 0
			};
			listeners = /* @__PURE__ */ new Set();
			eventSource;
			stopped = false;
			/** Current immutable room projection. */
			getSnapshot = () => this.snapshot;
			/** Subscribe to room projection changes. */
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			/** Resolve the persistent browser identity and start live synchronization. */
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
			/** Open the full room overlay. */
			openRoom = () => {
				this.set({ open: true });
			};
			/** Return to Harness while retaining the persistent room identity. */
			closeRoom = () => {
				this.set({ open: false });
			};
			/** Create the first persistent browser identity. */
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
				} catch (error) {
					this.set({
						phase: "identity-required",
						error: errorMessage(error)
					});
				}
			};
			/** Revoke the current identity so this browser can choose another name. */
			resetIdentity = async () => {
				this.closeEvents();
				try {
					await requestEmpty(`${CHATROOM_API_PREFIX}/session`, { method: "DELETE" });
					this.set({
						phase: "identity-required",
						connection: "offline",
						identity: void 0,
						messages: [],
						online: 0,
						sending: false,
						error: void 0
					});
				} catch (error) {
					this.set({ error: errorMessage(error) });
				}
			};
			/** Persist one message; SSE remains the authoritative transcript path. */
			send = async (text) => {
				if (this.snapshot.sending || this.snapshot.phase !== "ready") return false;
				this.set({
					sending: true,
					error: void 0
				});
				try {
					await requestJson(`${CHATROOM_API_PREFIX}/messages`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ text })
					});
					this.set({ sending: false });
					return true;
				} catch (error) {
					if (error instanceof HttpError && error.status === 401) {
						this.closeEvents();
						this.set({
							phase: "identity-required",
							connection: "offline",
							identity: void 0,
							messages: [],
							online: 0,
							sending: false,
							error: "身份已失效，请重新选择。"
						});
					} else this.set({
						sending: false,
						error: errorMessage(error)
					});
					return false;
				}
			};
			/** Retry startup after the room API was temporarily unavailable. */
			retry = async () => {
				this.set({
					phase: "loading",
					error: void 0
				});
				await this.loadSession();
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
							messages: [],
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
							messages: sortMessages(event.messages),
							online: event.online,
							error: void 0
						});
						return;
					case "message": {
						const messages = this.snapshot.messages.filter((message) => message.id !== event.message.id);
						this.set({ messages: sortMessages([...messages, event.message]) });
						return;
					}
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
		function sortMessages(messages) {
			return [...messages].sort((left, right) => left.sequence - right.sequence);
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
		//#region src/client/styles.ts
		/** Scoped stylesheet for the frame overlay; colors and type follow Harness theme tokens. */
		const CHATROOM_STYLES = String.raw`
[data-dsh-chatroom-entry] { pointer-events: auto; }
.dsh-chatroom-launcher {
  position: fixed; right: 24px; bottom: 24px; z-index: 40;
  display: inline-flex; align-items: center; gap: 8px; height: 42px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 22px; padding: 0 16px;
  color: var(--dsw-alias-label-primary); background: var(--dsw-alias-button-floating-fill);
  box-shadow: var(--dsw-shadow-lv2); font: var(--dsw-font-s-strong-14); cursor: pointer;
}
.dsh-chatroom-launcher:hover { background: var(--dsw-alias-button-floating-hover); }
.dsh-chatroom-shell {
  position: fixed; inset: 0; z-index: 100; display: flex; flex-direction: column; min-width: 0;
  color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); pointer-events: auto;
}
.dsh-chatroom-header {
  flex: none; min-height: 58px; display: grid; grid-template-columns: 1fr auto 1fr;
  align-items: center; gap: 12px; padding: 0 18px; border-bottom: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
}
.dsh-chatroom-heading { min-width: 0; text-align: center; }
.dsh-chatroom-title { margin: 0; font: var(--dsw-font-m-strong-16); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dsh-chatroom-presence { margin-top: 2px; color: var(--dsw-alias-label-caption); font: var(--dsw-font-xs-13); }
.dsh-chatroom-header-actions { justify-self: end; display: flex; align-items: center; gap: 8px; }
.dsh-chatroom-button, .dsh-chatroom-icon-button {
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-layer-1); font: var(--dsw-font-s-strong-14); cursor: pointer;
}
.dsh-chatroom-button { min-height: 38px; padding: 0 16px; }
.dsh-chatroom-button.primary { border-color: var(--dsw-static-deepseek-500); color: #fff; background: var(--dsw-static-deepseek-500); }
.dsh-chatroom-button:disabled { opacity: .55; cursor: default; }
.dsh-chatroom-icon-button { width: 36px; height: 36px; padding: 0; font-size: 18px; line-height: 1; }
.dsh-chatroom-transcript { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 20px 24px 28px; }
.dsh-chatroom-column { width: 100%; max-width: var(--dsh-chat-content-width, 760px); margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }
.dsh-chatroom-empty { margin: auto; padding: 64px 20px; color: var(--dsw-alias-label-tertiary); text-align: center; }
.dsh-chatroom-row { display: flex; align-items: flex-start; gap: 10px; }
.dsh-chatroom-row.own { justify-content: flex-end; }
.dsh-chatroom-avatar {
  flex: 0 0 32px; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 50%;
  color: #fff; background: var(--dsw-static-deepseek-500); font: var(--dsw-font-s-strong-14);
}
.dsh-chatroom-avatar.human { color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-module-platform); }
.dsh-chatroom-message { max-width: min(76%, 640px); min-width: 0; }
.dsh-chatroom-meta { margin: 0 4px 5px; color: var(--dsw-alias-label-caption); font: var(--dsw-font-xs-13); }
.dsh-chatroom-row.own .dsh-chatroom-meta { text-align: right; }
.dsh-chatroom-bubble {
  border-radius: 10px; padding: 10px 13px; color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-module-platform); font: var(--dsw-font-s-14); line-height: 1.6;
  white-space: pre-wrap; overflow-wrap: anywhere;
}
.dsh-chatroom-row.own .dsh-chatroom-bubble { color: #fff; background: var(--dsw-static-deepseek-500); }
.dsh-chatroom-composer-wrap { flex: none; padding: 0 24px 22px; }
.dsh-chatroom-composer {
  width: 100%; max-width: calc(var(--dsh-chat-content-width, 760px) + 16px); margin: 0 auto;
  display: flex; align-items: flex-end; gap: 10px; border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 14px; padding: 10px; background: var(--dsw-alias-bg-layer-1); box-shadow: var(--dsw-shadow-lv2);
}
.dsh-chatroom-textarea {
  flex: 1 1 auto; min-width: 0; min-height: 24px; max-height: 150px; resize: none; border: 0; outline: 0;
  padding: 6px 8px; color: var(--dsw-alias-label-primary); background: transparent; font: var(--dsw-font-s-14); line-height: 1.5;
}
.dsh-chatroom-send { flex: none; width: 38px; height: 38px; border: 0; border-radius: 10px; color: #fff; background: var(--dsw-static-deepseek-500); font-size: 18px; cursor: pointer; }
.dsh-chatroom-send:disabled { opacity: .45; cursor: default; }
.dsh-chatroom-error { max-width: var(--dsh-chat-content-width, 760px); margin: 8px auto 0; color: var(--dsw-alias-state-error-primary); font: var(--dsw-font-xs-13); }
.dsh-chatroom-center { flex: 1 1 auto; min-height: 0; display: grid; place-items: center; padding: 24px; }
.dsh-chatroom-card {
  width: min(100%, 420px); border: 1px solid var(--dsw-alias-border-l2); border-radius: 16px; padding: 28px;
  background: var(--dsw-alias-bg-layer-1); box-shadow: var(--dsw-shadow-lv2); text-align: center;
}
.dsh-chatroom-card h2 { margin: 0 0 8px; font: var(--dsw-font-l-strong-18); }
.dsh-chatroom-card p { margin: 0 0 22px; color: var(--dsw-alias-label-secondary); font: var(--dsw-font-s-14); line-height: 1.6; }
.dsh-chatroom-name { box-sizing: border-box; width: 100%; height: 42px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px; padding: 0 12px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); font: var(--dsw-font-s-14); outline: none; }
.dsh-chatroom-name:focus { border-color: var(--dsw-static-deepseek-500); }
.dsh-chatroom-card .dsh-chatroom-button { width: 100%; margin-top: 12px; }
.dsh-chatroom-card .dsh-chatroom-error { margin-top: 12px; }
@media (max-width: 640px) {
  .dsh-chatroom-header { grid-template-columns: auto 1fr auto; padding: 0 10px; }
  .dsh-chatroom-transcript { padding: 16px 12px 24px; }
  .dsh-chatroom-composer-wrap { padding: 0 10px 10px; }
  .dsh-chatroom-message { max-width: 84%; }
  .dsh-chatroom-identity-label { display: none; }
}
`;
		//#endregion
		//#region src/client/index.tsx
		const inject = ["slots"];
		/** Register one additive frame overlay and start its React-free room client. */
		function apply(ctx) {
			const store = new ChatroomClientStore();
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.dshChatroomStyles = "";
				style.textContent = CHATROOM_STYLES;
				document.head.append(style);
				store.start();
				return () => {
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
					resetIdentity: store.resetIdentity,
					send: store.send,
					retry: store.retry
				})
			}, ChatroomShell));
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