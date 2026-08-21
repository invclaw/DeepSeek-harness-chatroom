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
		//#region src/avatars.ts
		/** Fixed avatar choices shared by the Host identity validator and browser picker. */
		const CHATROOM_AVATARS = [
			{
				id: "whale",
				emoji: "🐳",
				label: "鲸鱼"
			},
			{
				id: "panda",
				emoji: "🐼",
				label: "熊猫"
			},
			{
				id: "fox",
				emoji: "🦊",
				label: "狐狸"
			},
			{
				id: "cat",
				emoji: "🐱",
				label: "猫咪"
			},
			{
				id: "dog",
				emoji: "🐶",
				label: "狗狗"
			},
			{
				id: "rabbit",
				emoji: "🐰",
				label: "兔子"
			},
			{
				id: "octopus",
				emoji: "🐙",
				label: "章鱼"
			},
			{
				id: "unicorn",
				emoji: "🦄",
				label: "独角兽"
			}
		];
		/** Whether an untrusted string names one built-in avatar. */
		function isChatroomAvatarId(value) {
			return typeof value === "string" && CHATROOM_AVATARS.some((avatar) => avatar.id === value);
		}
		/** Deterministic fallback for identities and old transcript markers without an avatar. */
		function fallbackAvatarId(seed) {
			let hash = 0;
			for (const character of seed) hash = hash * 31 + character.codePointAt(0) >>> 0;
			return CHATROOM_AVATARS[hash % CHATROOM_AVATARS.length].id;
		}
		/** Display metadata for one validated or historical avatar id. */
		function chatroomAvatar(value, seed) {
			const id = isChatroomAvatarId(value) ? value : fallbackAvatarId(seed);
			return CHATROOM_AVATARS.find((avatar) => avatar.id === id);
		}
		//#endregion
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
			const [avatarId, setAvatarId] = (0, react.useState)(CHATROOM_AVATARS[0].id);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
				className: "dsh-chatroom-card",
				onSubmit: (event) => {
					event.preventDefault();
					join(name, avatarId);
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "选择你在共享会话中显示的名字和头像。进入后继续使用 Harness 原生对话界面。" }),
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
						className: "dsh-chatroom-avatar-fieldset",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: "选择头像" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-chatroom-avatar-grid",
							role: "radiogroup",
							"aria-label": "选择头像",
							children: CHATROOM_AVATARS.map((avatar) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: "dsh-chatroom-avatar-choice",
								"data-avatar": avatar.id,
								"data-selected": avatar.id === avatarId,
								type: "button",
								role: "radio",
								"aria-checked": avatar.id === avatarId,
								"aria-label": avatar.label,
								onClick: () => {
									setAvatarId(avatar.id);
								},
								children: avatar.emoji
							}, avatar.id))
						})]
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
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["当前身份：", room.identity === void 0 ? "" : `${chatroomAvatar(room.identity.avatarId, room.identity.participantId).emoji} ${room.identity.displayName}`] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
		//#endregion
		//#region src/client/ChatroomAssistantReplyAction.tsx
		/** Reply action contributed to finalized AI messages in shared rooms. */
		function ChatroomAssistantReplyAction(props) {
			const room = props.useChatroom((snapshot) => snapshot.rooms.find((candidate) => candidate.sessionId === String(props.sessionId)));
			const assistant = props.useSession((snapshot) => snapshot.nodes.find((node) => node.kind === "assistant" && node.messageId === props.messageId));
			if (room === void 0 || assistant?.kind !== "assistant") return null;
			const text = assistant.blocks.flatMap((block) => block.kind === "text" ? [block.text] : []).join("").trim().replace(/\s+/gu, " ");
			const reply = {
				messageId: String(props.messageId),
				displayName: room.aiDisplayName,
				text: [...text || "AI 回复"].slice(0, 120).join("")
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				className: "dsh-chatroom-assistant-reply",
				type: "button",
				title: `回复 ${room.aiDisplayName}`,
				"aria-label": `回复 ${room.aiDisplayName}`,
				onClick: () => {
					props.setReply(room.id, reply);
				},
				children: "↩"
			});
		}
		//#endregion
		//#region src/client/ChatroomComposer.tsx
		/** Small file chooser inside the native composer tool row. */
		function ChatroomFileAction(props) {
			const active = props.useChatroom((snapshot) => snapshot).rooms.find((candidate) => candidate.sessionId === String(props.sessionId));
			const input = (0, react.useRef)(null);
			if (active === void 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				className: "dsh-chatroom-file-button",
				type: "button",
				title: "发送文件",
				"aria-label": "发送文件",
				onClick: () => {
					input.current?.click();
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					children: "📎"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "文件" })]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
				ref: input,
				className: "dsh-chatroom-file-input",
				"data-testid": "chatroom-file-input",
				type: "file",
				multiple: true,
				onChange: (event) => {
					const files = event.currentTarget.files;
					if (files !== null) props.addFiles(active.id, [...files]);
					event.currentTarget.value = "";
				}
			})] });
		}
		/** Reply quote and pending file rail above the native composer. */
		function ChatroomComposerDock(props) {
			const room = props.useChatroom((snapshot) => snapshot);
			const active = room.rooms.find((candidate) => candidate.sessionId === String(props.sessionId));
			if (active === void 0 || room.composerRoomId !== active.id) return null;
			const hasFiles = room.pendingFiles.length > 0;
			if (!hasFiles && room.reply === void 0 && room.composerError === void 0) return null;
			const canSendFilesOnly = hasFiles && props.input.draft.trim() === "" && props.input.imageIds.length === 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-chatroom-composer-dock",
				"data-testid": "chatroom-composer-dock",
				children: [
					room.reply !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReplyPreview, {
						reply: room.reply,
						clear: () => {
							props.clearReply(active.id);
						}
					}),
					hasFiles && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-chatroom-pending-files",
						children: [room.pendingFiles.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-chatroom-pending-file",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: "📎"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									title: item.file.name,
									children: item.file.name
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": `移除 ${item.file.name}`,
									onClick: () => {
										props.removeFile(active.id, item.id);
									},
									children: "×"
								})
							]
						}, item.id)), canSendFilesOnly ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "dsh-chatroom-send-files",
							type: "button",
							disabled: room.composerBusy,
							onClick: () => {
								props.sendFiles(active.id);
							},
							children: room.composerBusy ? "正在发送…" : "发送文件"
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", {
							className: "dsh-chatroom-file-hint",
							children: "文件将随当前消息发送"
						})]
					}),
					room.composerError !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-chatroom-composer-error",
						role: "alert",
						children: room.composerError
					})
				]
			});
		}
		function ReplyPreview({ reply, clear }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-chatroom-reply-preview",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: ["回复 ", reply.displayName] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: reply.text })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "取消回复",
					onClick: clear,
					children: "×"
				})]
			});
		}
		const FILE_MARKER_START = "⁣dsh-chatroom-file:";
		/** Parse a current or historical participant marker at the start of text. */
		function participantMarker(text) {
			if (!text.startsWith("⁣dsh-chatroom:")) return void 0;
			const end = text.indexOf("⁣", 14);
			if (end < 0) return void 0;
			const payload = text.slice(14, end);
			const separator = payload.indexOf("|");
			const participantId = separator < 0 ? payload : payload.slice(0, separator);
			if (participantId === "") return void 0;
			const candidate = separator < 0 ? void 0 : payload.slice(separator + 1);
			return {
				participantId,
				avatarId: isChatroomAvatarId(candidate) ? candidate : fallbackAvatarId(participantId),
				length: end + 1
			};
		}
		/** Project one leading reply marker back into a quote card and message body. */
		function projectReplyText(text) {
			if (!text.startsWith("⁣dsh-chatroom-reply:")) return { text };
			const end = text.indexOf("⁣", 20);
			if (end < 0) return { text };
			const reply = decodePayload(text.slice(20, end));
			if (!validReply(reply)) return { text };
			let visible = text.slice(end + 1);
			const prefix = replyPrefix(reply);
			if (visible.startsWith(prefix)) visible = visible.slice(prefix.length);
			return {
				text: visible,
				reply
			};
		}
		/** Remove file marker lines while collecting download cards for the browser. */
		function projectFileText(text) {
			const files = [];
			let visible = text;
			while (true) {
				const start = visible.indexOf(FILE_MARKER_START);
				if (start < 0) break;
				const end = visible.indexOf("⁣", start + 19);
				if (end < 0) break;
				const file = decodePayload(visible.slice(start + 19, end));
				if (!validFile(file)) break;
				files.push(file);
				const before = visible.slice(0, start).replace(/\n$/u, "");
				let after = visible.slice(end + 1);
				const prefix = filePrefix(file);
				if (after.startsWith(prefix)) after = after.slice(prefix.length);
				visible = `${before}${after}`;
			}
			return {
				text: visible,
				files
			};
		}
		/** Whether the native command dispatcher must retain ownership of this submission. */
		function isSlashCommand(content) {
			return content.find((part) => part.type === "text")?.text.trimStart().startsWith("/") ?? false;
		}
		function replyPrefix(reply) {
			return `回复 ${reply.displayName}「${reply.text}」\n`;
		}
		function filePrefix(file) {
			return `文件：${file.name}`;
		}
		function decodePayload(value) {
			try {
				return JSON.parse(decodeURIComponent(value));
			} catch {
				return;
			}
		}
		function validReply(value) {
			if (value === null || typeof value !== "object") return false;
			const item = value;
			return typeof item.messageId === "string" && typeof item.displayName === "string" && typeof item.text === "string";
		}
		function validFile(value) {
			if (value === null || typeof value !== "object") return false;
			const item = value;
			return typeof item.id === "string" && typeof item.name === "string" && typeof item.mediaType === "string" && typeof item.bytes === "number";
		}
		//#endregion
		//#region src/routes.ts
		/** Canonical API prefix carried through the Host's existing plugin proxy route. */
		const CHATROOM_API_PREFIX = "/plugins/deepseek-harness-chatroom/api";
		//#endregion
		//#region src/client/ChatroomMessageNodeView.tsx
		/** Participant-specific display projection of one durable native user node. */
		function projectChatroomMessage(node, identity) {
			let own = false;
			let identityProjected = false;
			let displayName;
			let avatarId;
			let reply;
			const files = [];
			const texts = [];
			const content = node.data.content.map((block) => {
				if (block.type !== "text") return block;
				let visibleText = block.text;
				if (!identityProjected) {
					identityProjected = true;
					const marker = participantMarker(visibleText);
					visibleText = marker === void 0 ? visibleText : visibleText.slice(marker.length);
					const namePrefix = /^([^：]{1,80})：/.exec(visibleText);
					displayName = namePrefix?.[1];
					own = marker === void 0 ? displayName === identity.displayName : marker.participantId === identity.participantId;
					avatarId = marker?.avatarId ?? fallbackAvatarId(displayName ?? identity.participantId);
					if (namePrefix !== null) visibleText = visibleText.slice(namePrefix[0].length);
					const replyProjection = projectReplyText(visibleText);
					visibleText = replyProjection.text;
					reply = replyProjection.reply;
				}
				const fileProjection = projectFileText(visibleText);
				visibleText = fileProjection.text;
				files.push(...fileProjection.files);
				if (visibleText.trim() !== "") texts.push(visibleText.trim());
				return visibleText === block.text ? block : {
					...block,
					text: visibleText
				};
			});
			return {
				node: identityProjected ? {
					...node,
					data: {
						...node.data,
						content
					}
				} : node,
				own,
				avatarId: avatarId ?? fallbackAvatarId(identity.participantId),
				files,
				text: texts.join("\n"),
				...displayName === void 0 ? {} : { displayName },
				...reply === void 0 ? {} : { reply }
			};
		}
		/** Reuse Harness' native user renderer and move only peer user messages to the left. */
		const ChatroomUserMessageNodeView = (0, react.memo)(function ChatroomUserMessageNodeView(props) {
			const room = props.useChatroom((snapshot) => snapshot);
			const NativeView = props.nativeMessageView;
			if (!room.rooms.some((candidate) => String(props.sessionId) === candidate.sessionId) || room.identity === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NativeView, { ...props });
			const projection = projectChatroomMessage(props.node, room.identity);
			const native = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NativeView, {
				...props,
				node: projection.node
			});
			const activeRoom = room.rooms.find((candidate) => String(props.sessionId) === candidate.sessionId);
			return participantMessage(native, projection, () => {
				props.setReply(activeRoom.id, replyTarget(props.node, projection));
			});
		});
		/** Reuse Harness' native steering renderer and move only peer steering messages to the left. */
		const ChatroomSteeringMessageNodeView = (0, react.memo)(function ChatroomSteeringMessageNodeView(props) {
			const room = props.useChatroom((snapshot) => snapshot);
			const NativeView = props.nativeMessageView;
			if (!room.rooms.some((candidate) => String(props.sessionId) === candidate.sessionId) || room.identity === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NativeView, { ...props });
			const projection = projectChatroomMessage(props.node, room.identity);
			const native = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NativeView, {
				...props,
				node: projection.node
			});
			const activeRoom = room.rooms.find((candidate) => String(props.sessionId) === candidate.sessionId);
			return participantMessage(native, projection, () => {
				props.setReply(activeRoom.id, replyTarget(props.node, projection));
			});
		});
		function participantMessage(native, projection, onReply) {
			const avatar = chatroomAvatar(projection.avatarId, projection.displayName ?? "");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-chatroom-participant-message",
				"data-dsh-chatroom-own": projection.own,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-chatroom-avatar",
					"data-avatar": avatar.id,
					title: avatar.label,
					"aria-hidden": true,
					children: avatar.emoji
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-chatroom-message-column",
					children: [
						projection.displayName !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-chatroom-display-name",
							children: projection.displayName
						}),
						projection.reply !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-chatroom-reply-quote",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: ["回复 ", projection.reply.displayName] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: projection.reply.text })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-chatroom-native-message",
							children: native
						}),
						projection.files.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileCard, { file }, file.id)),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "dsh-chatroom-reply-button",
							type: "button",
							onClick: onReply,
							children: "↩ 回复"
						})
					]
				})]
			});
		}
		function FileCard({ file }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("a", {
				className: "dsh-chatroom-file-card",
				href: `${CHATROOM_API_PREFIX}/files/${encodeURIComponent(file.id)}`,
				download: file.name,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-chatroom-file-icon",
						"aria-hidden": true,
						children: "📎"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dsh-chatroom-file-copy",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: file.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: formatFileSize(file.bytes) })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						children: "↓"
					})
				]
			});
		}
		function replyTarget(node, projection) {
			const fileText = projection.files.length === 0 ? "" : projection.files.map((file) => file.name).join("、");
			const text = (projection.text.trim() || fileText || "图片消息").replace(/\s+/gu, " ");
			return {
				messageId: `${node.kind}:${node.data.seq}`,
				displayName: projection.displayName ?? "参与者",
				text: [...text].slice(0, 120).join("")
			};
		}
		function formatFileSize(bytes) {
			if (bytes < 1024) return `${bytes} B`;
			if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
			return `${(bytes / 1048576).toFixed(1)} MB`;
		}
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
				error: void 0,
				composerRoomId: void 0,
				pendingFiles: [],
				reply: void 0,
				composerBusy: false,
				composerError: void 0
			};
			listeners = /* @__PURE__ */ new Set();
			eventSource;
			pendingOpenRoomId;
			stopped = false;
			compositionRevision = 0;
			pendingFileSequence = 0;
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
			join = async (displayName, avatarId) => {
				this.set({
					phase: "loading",
					error: void 0
				});
				try {
					const session = await requestJson(`${CHATROOM_API_PREFIX}/session`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							displayName,
							avatarId
						})
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
			/** Add browser files to the next submission in one shared room. */
			addFiles = (roomId, files) => {
				if (files.length === 0) return;
				const current = this.compositionFor(roomId);
				const pending = files.map((file) => ({
					id: `file-${++this.pendingFileSequence}`,
					file
				}));
				this.compositionRevision += 1;
				this.set({
					composerRoomId: roomId,
					pendingFiles: [...current.files, ...pending],
					reply: current.reply,
					composerError: void 0
				});
			};
			/** Remove one browser-owned pending file. */
			removeFile = (roomId, fileId) => {
				if (this.snapshot.composerRoomId !== roomId) return;
				const files = this.snapshot.pendingFiles.filter((file) => file.id !== fileId);
				if (files.length === this.snapshot.pendingFiles.length) return;
				this.compositionRevision += 1;
				this.set({
					pendingFiles: files,
					composerError: void 0
				});
			};
			/** Address the next room message as a reply to one durable participant message. */
			setReply = (roomId, reply) => {
				const current = this.compositionFor(roomId);
				this.compositionRevision += 1;
				this.set({
					composerRoomId: roomId,
					pendingFiles: current.files,
					reply,
					composerError: void 0
				});
			};
			/** Cancel the next-message reply without changing pending files. */
			clearReply = (roomId) => {
				if (this.snapshot.composerRoomId !== roomId || this.snapshot.reply === void 0) return;
				this.compositionRevision += 1;
				this.set({
					reply: void 0,
					composerError: void 0
				});
			};
			/** Capture files and reply metadata for one native prompt submission. */
			composition = (roomId) => {
				const current = this.compositionFor(roomId);
				return {
					roomId,
					revision: this.compositionRevision,
					files: current.files,
					reply: current.reply
				};
			};
			/** Clear only the composition that was successfully admitted. */
			completeComposition = (composition) => {
				if (this.snapshot.composerRoomId !== composition.roomId || this.compositionRevision !== composition.revision) {
					if (this.snapshot.composerBusy) this.set({ composerBusy: false });
					return;
				}
				this.compositionRevision += 1;
				this.set({
					composerRoomId: void 0,
					pendingFiles: [],
					reply: void 0,
					composerBusy: false,
					composerError: void 0
				});
			};
			/** Send selected files without requiring placeholder text in the native composer. */
			sendFiles = async (roomId) => {
				const composition = this.composition(roomId);
				if (composition.files.length === 0 || this.snapshot.composerBusy) return;
				this.set({
					composerBusy: true,
					composerError: void 0
				});
				try {
					await submitRoomPrompt({
						roomId,
						mode: "queue",
						content: await serializePendingFiles(composition.files),
						...composition.reply === void 0 ? {} : { reply: composition.reply }
					});
					this.completeComposition(composition);
				} catch (error) {
					this.set({
						composerBusy: false,
						composerError: errorMessage(error)
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
			compositionFor(roomId) {
				return this.snapshot.composerRoomId === roomId ? {
					files: this.snapshot.pendingFiles,
					reply: this.snapshot.reply
				} : {
					files: [],
					reply: void 0
				};
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
		/** Serialize browser Files only at submission time, keeping bytes out of observable state. */
		async function serializePendingFiles(files) {
			return await Promise.all(files.map(async ({ file }) => ({
				type: "file",
				name: file.name,
				mediaType: file.type === "" ? "application/octet-stream" : file.type,
				data: bytesToBase64(new Uint8Array(await file.arrayBuffer()))
			})));
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
		function bytesToBase64(bytes) {
			let binary = "";
			for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
			return btoa(binary);
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
				const composition = store.composition(room.id);
				const files = await serializePendingFiles(composition.files);
				await submitRoomPrompt({
					roomId: room.id,
					mode: payload.mode,
					content: [...payload.content, ...files],
					...composition.reply === void 0 ? {} : { reply: composition.reply }
				}, signal);
				store.completeComposition(composition);
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

.dsh-chatroom-avatar-fieldset {
  margin: 18px 0 0;
  padding: 0;
  border: 0;
}

.dsh-chatroom-avatar-fieldset legend {
  margin-bottom: 10px;
  color: var(--text-secondary, #6b7280);
  font-size: 13px;
}

.dsh-chatroom-avatar-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.dsh-chatroom-avatar-choice {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  min-width: 0;
  border: 2px solid transparent;
  border-radius: 13px;
  background: var(--bg-secondary, #f3f4f6);
  padding: 0;
  font-size: 23px;
  cursor: pointer;
}

.dsh-chatroom-avatar-choice[data-selected="true"] {
  border-color: var(--brand-primary, #4f7cff);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-primary, #4f7cff) 18%, transparent);
}

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
  align-items: flex-start;
  gap: 10px;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] {
  flex-direction: row-reverse;
}

.dsh-chatroom-avatar {
  display: grid;
  flex: 0 0 38px;
  place-items: center;
  width: 38px;
  height: 38px;
  margin-top: 20px;
  border: 1px solid rgb(255 255 255 / 70%);
  border-radius: 13px;
  background: linear-gradient(145deg, #eaf2ff, #cbdcff);
  box-shadow: 0 4px 14px rgb(15 23 42 / 10%);
  font-size: 21px;
}

.dsh-chatroom-avatar[data-avatar="panda"],
.dsh-chatroom-avatar[data-avatar="cat"] { background: linear-gradient(145deg, #f6f2ff, #ddd3ff); }
.dsh-chatroom-avatar[data-avatar="fox"],
.dsh-chatroom-avatar[data-avatar="dog"] { background: linear-gradient(145deg, #fff1db, #ffd29b); }
.dsh-chatroom-avatar[data-avatar="rabbit"],
.dsh-chatroom-avatar[data-avatar="unicorn"] { background: linear-gradient(145deg, #ffeaf4, #ffcde4); }
.dsh-chatroom-avatar[data-avatar="octopus"] { background: linear-gradient(145deg, #e8fff6, #bfead9); }

.dsh-chatroom-message-column {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  max-width: calc(100% - 48px);
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-message-column {
  align-items: flex-end;
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

.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-display-name {
  text-align: right;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] .dsh-chatroom-display-name {
  text-align: left;
}

.dsh-chatroom-native-message {
  width: 100%;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] .dsh-chatroom-native-message [data-time-hover-root] {
  align-items: flex-start !important;
  text-align: left;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] .dsh-chatroom-native-message [data-time-hover-root] > :first-child,
.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] .dsh-chatroom-native-message [data-time-hover-root] > :first-child > * {
  align-items: flex-start !important;
  align-self: flex-start !important;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-native-message [data-time-hover-root] {
  align-items: flex-end !important;
}

.dsh-chatroom-reply-quote {
  display: flex;
  flex-direction: column;
  max-width: min(525px, 82%);
  margin-bottom: 5px;
  border-left: 3px solid var(--brand-primary, #4f7cff);
  border-radius: 0 8px 8px 0;
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent);
  padding: 6px 10px;
  color: var(--text-secondary, #6b7280);
  font-size: 12px;
  line-height: 18px;
}

.dsh-chatroom-reply-quote span {
  max-width: 420px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dsh-chatroom-reply-button {
  border: 0;
  background: transparent;
  color: var(--text-secondary, #7b8491);
  padding: 3px 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  opacity: .72;
}

.dsh-chatroom-reply-button:hover { color: var(--brand-primary, #4f7cff); opacity: 1; }

.dsh-chatroom-assistant-reply {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary, #7b8491);
  padding: 0;
  font: inherit;
  font-size: 16px;
  cursor: pointer;
}

.dsh-chatroom-assistant-reply:hover { background: var(--bg-secondary, #f3f4f6); color: var(--brand-primary, #4f7cff); }

.dsh-chatroom-file-card {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(360px, 78vw);
  margin: 4px 0;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 14px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 10px 12px;
  text-decoration: none;
}

.dsh-chatroom-file-card:hover { border-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-file-icon { font-size: 20px; }
.dsh-chatroom-file-copy { display: flex; flex: 1; flex-direction: column; min-width: 0; }
.dsh-chatroom-file-copy strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-file-copy small { color: var(--text-secondary, #6b7280); font-size: 11px; }

.dsh-chatroom-file-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #59616d);
  padding: 5px 7px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.dsh-chatroom-file-button:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-file-input { display: none; }

.dsh-chatroom-composer-dock {
  display: grid;
  gap: 7px;
  width: 100%;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 12px;
  background: var(--bg-primary, #fff);
  padding: 9px 11px;
  box-shadow: 0 5px 18px rgb(15 23 42 / 6%);
}

.dsh-chatroom-reply-preview,
.dsh-chatroom-pending-files {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.dsh-chatroom-reply-preview > span { display: flex; flex: 1; flex-direction: column; min-width: 0; }
.dsh-chatroom-reply-preview strong { font-size: 12px; }
.dsh-chatroom-reply-preview small { overflow: hidden; color: var(--text-secondary, #6b7280); text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-reply-preview button,
.dsh-chatroom-pending-file button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); font: inherit; cursor: pointer; }

.dsh-chatroom-pending-file {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 240px;
  border-radius: 8px;
  background: var(--bg-secondary, #f3f4f6);
  padding: 5px 7px;
  font-size: 12px;
}

.dsh-chatroom-pending-file > span:nth-child(2) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-send-files { border: 0; border-radius: 8px; background: var(--brand-primary, #4f7cff); color: #fff; padding: 6px 10px; font: inherit; font-size: 12px; cursor: pointer; }
.dsh-chatroom-send-files:disabled { cursor: wait; opacity: .55; }
.dsh-chatroom-file-hint { color: var(--text-secondary, #6b7280); }
.dsh-chatroom-composer-error { color: #d14343; font-size: 12px; }

@media (max-width: 640px) {
  .dsh-chatroom-avatar-grid { grid-template-columns: repeat(4, 1fr); }
  .dsh-chatroom-avatar { flex-basis: 34px; width: 34px; height: 34px; font-size: 19px; }
  .dsh-chatroom-message-column { max-width: calc(100% - 44px); }
}
`;
		//#endregion
		//#region src/client/index.tsx
		const inject = [
			"connection",
			"inputTriggers",
			"sessions",
			"slots"
		];
		/** Add room identity and navigation around the existing Harness conversation UI. */
		function apply(ctx) {
			const connection = ctx.get("connection");
			if (connection === void 0) throw new Error("chatroom: client connection service unavailable");
			const sessions = ctx.get("sessions");
			if (sessions === void 0) throw new Error("chatroom: client sessions service unavailable");
			const inputTriggers = ctx.get("inputTriggers");
			if (inputTriggers === void 0) throw new Error("chatroom: input trigger service unavailable");
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
			const aiSource = createChatroomAiSource(store);
			ctx.effect(() => inputTriggers.registerSource(aiSource), "chatroom: @AI input source");
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
			ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "chatroom-files",
				order: -20,
				inject: () => ({
					hooks: { chatroom: store },
					addFiles: store.addFiles,
					removeFile: store.removeFile,
					clearReply: store.clearReply,
					sendFiles: store.sendFiles
				})
			}, ChatroomFileAction));
			ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "chatroom-composition",
				order: -20,
				inject: () => ({
					hooks: { chatroom: store },
					addFiles: store.addFiles,
					removeFile: store.removeFile,
					clearReply: store.clearReply,
					sendFiles: store.sendFiles
				})
			}, ChatroomComposerDock));
			ctx.slots.inject("conversation.chat.assistant-actions", () => ctx.slots.register({
				name: "conversation.chat.assistant-actions",
				id: "chatroom-reply",
				order: 5,
				inject: () => ({
					hooks: { chatroom: store },
					setReply: store.setReply
				})
			}, ChatroomAssistantReplyAction));
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
						nativeMessageView,
						setReply: store.setReply
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
						nativeMessageView,
						setReply: store.setReply
					})
				}, ChatroomSteeringMessageNodeView);
			});
		}
		/** Build the room-scoped source contributed to RC7's native @ menu. */
		function createChatroomAiSource(store) {
			return {
				trigger: "@",
				name: "AI",
				order: -100,
				candidates(session, { query }) {
					const room = store.roomForSession(String(session.sessionId));
					if (room === void 0) return Promise.resolve([]);
					const names = [.../* @__PURE__ */ new Set(["AI", room.aiDisplayName])];
					const needle = query.toLocaleLowerCase();
					return Promise.resolve(names.filter((name) => name.toLocaleLowerCase().includes(needle)).map((name) => ({
						name,
						icon: "✦",
						description: "提及后触发 AI 回复"
					})));
				},
				lexicon(session) {
					const room = store.roomForSession(String(session.sessionId));
					return room === void 0 ? [] : [.../* @__PURE__ */ new Set(["AI", room.aiDisplayName])];
				},
				subscribeLexicon(_session, listener) {
					return store.subscribe(listener);
				},
				onPick({ candidate }) {
					return { text: `@${candidate.name} ` };
				}
			};
		}
		var client_default = {
			inject,
			apply
		};
		//#endregion
		exports.apply = apply;
		exports.createChatroomAiSource = createChatroomAiSource;
		exports.default = client_default;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map