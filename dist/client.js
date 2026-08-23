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
		//#region src/client/ChatroomPanels.tsx
		/** Persistent member management, branch conversation, and in-page alerts. */
		function ChatroomPanels(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ToastStack, {
					toasts: props.room.toasts,
					dismiss: props.dismissToast
				}),
				props.room.membersOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MemberPanel, { ...props }),
				props.room.thread !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ThreadPanel, { ...props }),
				props.room.selectionRoomId !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectionBar, { ...props }),
				props.room.forwardOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ForwardPanel, { ...props })
			] });
		}
		function SelectionBar(props) {
			const sourceRoomId = props.room.selectionRoomId;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-chatroom-selection-bar",
				role: "toolbar",
				"aria-label": "消息多选",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [
						"已选择 ",
						props.room.selectedMessages.length,
						" 条消息"
					] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: props.room.selectedMessages.length === 0,
						onClick: () => {
							if (sourceRoomId !== void 0) props.openForward(sourceRoomId);
						},
						children: "合并转发"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: props.clearMessageSelection,
						children: "取消"
					})
				]
			});
		}
		function ForwardPanel(props) {
			const targets = props.room.rooms.filter((item) => item.id !== props.room.selectionRoomId);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-chatroom-dialog-layer dsh-chatroom-forward-layer",
				"data-testid": "chatroom-forward-dialog",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: "dsh-chatroom-card dsh-chatroom-forward-dialog",
					"aria-label": "转发到群聊",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "dsh-chatroom-close",
							"aria-label": "关闭转发",
							type: "button",
							onClick: props.closeForward,
							children: "×"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "转发到群聊" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
							"将选中的 ",
							props.room.selectedMessages.length,
							" 条消息合并成一张聊天记录卡片。"
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-chatroom-forward-targets",
							children: [targets.map((room) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: props.room.forwardBusy,
								onClick: () => {
									props.forwardSelected(room.id);
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "＃" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: room.title }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: ["@", room.aiDisplayName] })
								]
							}, room.id)), targets.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-chatroom-forward-empty",
								children: "请先新建另一个群聊，再进行转发。"
							})]
						}),
						props.room.forwardError !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-chatroom-error",
							role: "alert",
							children: props.room.forwardError
						})
					]
				})
			});
		}
		function ToastStack({ toasts, dismiss }) {
			if (toasts.length === 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-chatroom-toast-stack",
				role: "status",
				"aria-live": "polite",
				children: toasts.map((toast) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					className: "dsh-chatroom-toast",
					type: "button",
					onClick: () => {
						dismiss(toast.id);
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [
						toast.displayName,
						" ",
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [
							"· ",
							toast.roomTitle,
							toast.threadId === void 0 ? "" : " · 分支"
						] })
					] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: toast.text })]
				}, toast.id))
			});
		}
		function MemberPanel(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-chatroom-dialog-layer dsh-chatroom-member-layer",
				"data-testid": "chatroom-members",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: "dsh-chatroom-card dsh-chatroom-member-card",
					"aria-label": "群管理",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "dsh-chatroom-close",
							"aria-label": "关闭群管理",
							type: "button",
							onClick: props.closeMembers,
							children: "×"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "群管理" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
							props.room.room?.title,
							" · ",
							props.room.members.length,
							" 位成员 · ",
							props.room.online,
							" 人在线"
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-chatroom-member-list",
							children: props.room.members.map((member) => {
								const avatar = chatroomAvatar(member.avatarId, member.participantId);
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dsh-chatroom-member",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dsh-chatroom-member-avatar",
											"data-avatar": avatar.id,
											children: avatar.emoji
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: member.displayName }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: member.online ? "在线" : `最近活跃 ${formatRelative(member.lastSeenAt)}` })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { "data-online": member.online })
									]
								}, member.participantId);
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "dsh-chatroom-notification-button",
							type: "button",
							disabled: props.room.notificationsEnabled,
							onClick: () => {
								props.enableSystemNotifications();
							},
							children: props.room.notificationsEnabled ? "✓ 系统消息提醒已开启" : "开启系统消息提醒"
						})
					]
				})
			});
		}
		function ThreadPanel(props) {
			const [text, setText] = (0, react.useState)("");
			const [mention, setMention] = (0, react.useState)();
			const [mentionIndex, setMentionIndex] = (0, react.useState)(0);
			const endRef = (0, react.useRef)(null);
			const textareaRef = (0, react.useRef)(null);
			const thread = props.room.thread;
			const mentionCandidates = (0, react.useMemo)(() => {
				return [...[...new Set(["AI", props.room.room?.aiDisplayName].filter((name) => name !== void 0))].map((name) => ({
					name,
					description: "提及后在本分支触发 AI",
					ai: true
				})), ...props.room.members.filter((member) => member.participantId !== props.room.identity?.participantId).map((member) => ({
					name: member.displayName,
					description: member.online ? "在线成员" : "群成员",
					ai: false
				}))].filter((candidate, index, all) => all.findIndex((item) => item.name === candidate.name) === index);
			}, [
				props.room.identity?.participantId,
				props.room.members,
				props.room.room?.aiDisplayName
			]);
			const visibleMentions = mention === void 0 ? [] : mentionCandidates.filter((candidate) => candidate.name.toLocaleLowerCase().includes(mention.query.toLocaleLowerCase()));
			(0, react.useEffect)(() => {
				if (typeof endRef.current?.scrollIntoView === "function") endRef.current.scrollIntoView({ block: "end" });
			}, [props.room.threadMessages.length]);
			(0, react.useEffect)(() => {
				setMentionIndex(0);
			}, [mention?.query]);
			const updateMention = (value, cursor) => {
				setMention(activeThreadMention(value, cursor));
			};
			const pickMention = (name) => {
				if (mention === void 0) return;
				const cursor = textareaRef.current?.selectionStart ?? text.length;
				const next = `${text.slice(0, mention.start)}@${name} ${text.slice(cursor)}`;
				const nextCursor = mention.start + name.length + 2;
				setText(next);
				setMention(void 0);
				queueMicrotask(() => {
					textareaRef.current?.focus();
					textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				className: "dsh-chatroom-thread-panel",
				"data-testid": "chatroom-thread-panel",
				"aria-label": "分支回复",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "分支回复" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: props.room.room?.title })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						"aria-label": "关闭分支",
						type: "button",
						onClick: props.closeThread,
						children: "×"
					})] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-chatroom-thread-root",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: thread.root.displayName }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: thread.root.text })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-chatroom-thread-messages",
						children: [
							props.room.threadMessages.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
								className: "dsh-chatroom-thread-empty",
								children: [
									"从这里开始分支讨论。输入 ",
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "@AI" }),
									" 只会在本分支触发 AI。"
								]
							}),
							props.room.threadMessages.map((message) => {
								const own = message.participantId === props.room.identity?.participantId;
								const avatarId = message.avatarId ?? fallbackAvatarId(message.participantId);
								const avatar = message.role === "ai" ? {
									id: "ai",
									emoji: "✦"
								} : chatroomAvatar(avatarId, message.participantId);
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
									className: "dsh-chatroom-thread-message",
									"data-own": own,
									"data-role": message.role,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-chatroom-member-avatar",
										"data-avatar": avatar.id,
										children: avatar.emoji
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [message.displayName, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", { children: formatTime$1(message.createdAt) })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: message.text })] })]
								}, message.id);
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { ref: endRef })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						className: "dsh-chatroom-thread-composer",
						onSubmit: (event) => {
							event.preventDefault();
							const submitted = text.trim();
							if (submitted === "") return;
							props.sendThreadMessage(submitted).then((sent) => {
								if (sent) setText("");
							});
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								ref: textareaRef,
								rows: 3,
								placeholder: "回复分支；输入 @AI 让 AI 在本分支回答",
								value: text,
								"aria-expanded": visibleMentions.length > 0,
								"aria-controls": "dsh-chatroom-thread-mentions",
								onChange: (event) => {
									setText(event.target.value);
									updateMention(event.target.value, event.target.selectionStart);
								},
								onClick: (event) => {
									updateMention(event.currentTarget.value, event.currentTarget.selectionStart);
								},
								onKeyDown: (event) => {
									if (visibleMentions.length > 0) {
										if (event.key === "ArrowDown" || event.key === "ArrowUp") {
											event.preventDefault();
											const direction = event.key === "ArrowDown" ? 1 : -1;
											setMentionIndex((current) => (current + direction + visibleMentions.length) % visibleMentions.length);
											return;
										}
										if (event.key === "Escape") {
											event.preventDefault();
											setMention(void 0);
											return;
										}
										if (event.key === "Tab") {
											event.preventDefault();
											pickMention(visibleMentions[mentionIndex]?.name ?? visibleMentions[0].name);
											return;
										}
									}
									if (event.key !== "Enter" || event.shiftKey) return;
									if (visibleMentions.length > 0 && mention?.query === "") {
										event.preventDefault();
										pickMention(visibleMentions[mentionIndex]?.name ?? visibleMentions[0].name);
										return;
									}
									event.preventDefault();
									event.currentTarget.form?.requestSubmit();
								}
							}),
							visibleMentions.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-chatroom-thread-mentions",
								id: "dsh-chatroom-thread-mentions",
								role: "listbox",
								"aria-label": "提及成员",
								children: visibleMentions.map((candidate, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									role: "option",
									"aria-label": candidate.name,
									"aria-selected": index === mentionIndex,
									"data-active": index === mentionIndex,
									onMouseDown: (event) => {
										event.preventDefault();
									},
									onClick: () => {
										pickMention(candidate.name);
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { children: candidate.ai ? "✦" : "●" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: candidate.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: candidate.description })] })]
								}, candidate.name))
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: props.room.threadBusy || text.trim() === "",
								children: "发送"
							})
						]
					}),
					props.room.threadError !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-chatroom-error",
						role: "alert",
						children: props.room.threadError
					})
				]
			});
		}
		function activeThreadMention(text, cursor) {
			const prefix = text.slice(0, cursor);
			const match = /(?:^|\s)@([^\s@]*)$/u.exec(prefix);
			if (match === null) return void 0;
			return {
				start: prefix.length - match[1].length - 1,
				query: match[1]
			};
		}
		function formatRelative(time) {
			const minutes = Math.max(0, Math.floor((Date.now() - time) / 6e4));
			if (minutes < 1) return "刚刚";
			if (minutes < 60) return `${minutes} 分钟前`;
			if (minutes < 1440) return `${Math.floor(minutes / 60)} 小时前`;
			return `${Math.floor(minutes / 1440)} 天前`;
		}
		function formatTime$1(time) {
			return new Date(time).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		//#endregion
		//#region src/client/ChatroomEntry.tsx
		/** Additive shared-session launcher, identity setup, and room directory. */
		function ChatroomEntry(props) {
			const room = props.useChatroom((snapshot) => snapshot);
			const panels = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChatroomPanels, {
				room,
				...props
			});
			if (!room.open) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				className: "dsh-chatroom-launcher",
				"data-dsh-chatroom-entry": true,
				type: "button",
				onClick: props.openRoom,
				children: ["◉ 共享会话", room.unreadCount > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dsh-chatroom-unread",
					children: Math.min(room.unreadCount, 99)
				})]
			}), panels] });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
			}), panels] });
		}
		function IdentityStep({ room, join, close }) {
			const [name, setName] = (0, react.useState)(room.identity?.displayName ?? "");
			const [avatarId, setAvatarId] = (0, react.useState)(room.identity?.avatarId ?? CHATROOM_AVATARS[0].id);
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
		//#region src/reactions.ts
		/** Reactions offered by the room message menu. */
		const CHATROOM_REACTION_EMOJIS = [
			"👍",
			"❤️",
			"😂",
			"😮",
			"😢",
			"🎉"
		];
		//#endregion
		//#region src/client/ChatroomMessageTools.tsx
		/** Checkbox shown on every message while the room is in multi-select mode. */
		function ChatroomSelectionCheckbox({ tools }) {
			if (!tools.selecting) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: "dsh-chatroom-selection-checkbox",
				title: tools.selected ? "取消选择" : "选择消息",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					type: "checkbox",
					"aria-label": `${tools.selected ? "取消选择" : "选择"} ${tools.message.displayName} 的消息`,
					checked: tools.selected,
					onChange: () => {
						tools.toggleSelection(tools.roomId, tools.message);
					}
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					children: tools.selected ? "✓" : ""
				})]
			});
		}
		/** Local context-menu state for one native message row. */
		function useChatroomMessageMenu() {
			const [position, setPosition] = (0, react.useState)();
			(0, react.useEffect)(() => {
				if (position === void 0) return;
				const close = () => {
					setPosition(void 0);
				};
				const escape = (event) => {
					if (event.key === "Escape") close();
				};
				document.addEventListener("pointerdown", close);
				document.addEventListener("keydown", escape);
				return () => {
					document.removeEventListener("pointerdown", close);
					document.removeEventListener("keydown", escape);
				};
			}, [position]);
			return {
				position,
				open: (event) => {
					event.preventDefault();
					event.stopPropagation();
					setPosition({
						x: Math.max(8, Math.min(event.clientX, globalThis.innerWidth - 248)),
						y: Math.max(8, Math.min(event.clientY, globalThis.innerHeight - 168))
					});
				},
				close: () => {
					setPosition(void 0);
				}
			};
		}
		/** Persisted reaction chips shown below one message. */
		function ChatroomReactionBar(props) {
			const reactions = props.reactions.filter((item) => item.messageId === props.message.messageId && item.participantIds.length > 0);
			if (reactions.length === 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-chatroom-reaction-bar",
				children: reactions.map((reaction) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-label": `${reaction.emoji} ${reaction.participantIds.length}`,
					"aria-pressed": reaction.participantIds.includes(props.identity?.participantId ?? ""),
					disabled: props.identity === void 0,
					onClick: () => {
						props.toggleReaction(props.roomId, props.message.messageId, reaction.emoji);
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: reaction.emoji }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: reaction.participantIds.length })]
				}, reaction.emoji))
			});
		}
		/** Right-click menu shared by human and AI messages. */
		function ChatroomMessageContextMenu({ tools, position, close }) {
			if (position === void 0 || tools.identity === void 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-chatroom-context-menu",
				style: {
					left: position.x,
					top: position.y
				},
				role: "menu",
				onPointerDown: (event) => {
					event.stopPropagation();
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-chatroom-context-reactions",
						"aria-label": "贴表情",
						children: CHATROOM_REACTION_EMOJIS.map((emoji) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							title: `贴表情 ${emoji}`,
							onClick: () => {
								tools.toggleReaction(tools.roomId, tools.message.messageId, emoji);
								close();
							},
							children: emoji
						}, emoji))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "menuitem",
						onClick: () => {
							tools.openForward(tools.roomId, tools.message);
							close();
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							children: "↗"
						}), " 转发"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "menuitem",
						onClick: () => {
							tools.toggleSelection(tools.roomId, tools.message);
							close();
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								children: tools.selected ? "✓" : "☑"
							}),
							" ",
							tools.selected ? "取消选择" : "多选"
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/ChatroomThreadActivity.tsx
		/** Quiet, three-message branch activity summary placed beside its root message. */
		function ChatroomThreadActivity({ preview, open }) {
			if (preview === void 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				className: "dsh-chatroom-thread-activity",
				type: "button",
				"aria-label": `打开分支，${preview.totalMessages} 条回复`,
				disabled: open === void 0,
				onClick: open,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "dsh-chatroom-thread-activity-heading",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							children: "⑂"
						}),
						" 分支 · ",
						preview.totalMessages,
						" 条回复"
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dsh-chatroom-thread-activity-list",
					children: preview.recentMessages.map((message) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: message.displayName }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: message.text })] }, message.id))
				})]
			});
		}
		//#endregion
		//#region src/client/ChatroomAssistantReplyAction.tsx
		/** Reply action contributed to finalized AI messages in shared rooms. */
		function ChatroomAssistantReplyAction(props) {
			const view = props.useChatroom((snapshot) => snapshot);
			const room = view.rooms.find((candidate) => candidate.sessionId === String(props.sessionId));
			const assistant = props.useSession((snapshot) => snapshot.nodes.find((node) => node.kind === "assistant" && node.messageId === props.messageId));
			const rootRef = (0, react.useRef)(null);
			const menu = useChatroomMessageMenu();
			const selected = view.selectionRoomId === room?.id && view.selectedMessages.some((item) => item.messageId === String(props.messageId));
			const selecting = view.selectionRoomId === room?.id;
			(0, react.useEffect)(() => {
				const root = rootRef.current?.closest("[data-time-hover-root]");
				if (root === null || root === void 0 || room === void 0) return;
				const onContextMenu = (event) => {
					menu.open(event);
				};
				root.addEventListener("contextmenu", onContextMenu);
				root.toggleAttribute("data-dsh-chatroom-selected", selected);
				root.toggleAttribute("data-dsh-chatroom-selection-mode", selecting);
				return () => {
					root.removeEventListener("contextmenu", onContextMenu);
					root.removeAttribute("data-dsh-chatroom-selected");
					root.removeAttribute("data-dsh-chatroom-selection-mode");
				};
			}, [
				menu.open,
				room,
				selected,
				selecting
			]);
			if (room === void 0 || assistant?.kind !== "assistant") return null;
			const text = assistant.blocks.flatMap((block) => block.kind === "text" ? [block.text] : []).join("").trim().replace(/\s+/gu, " ");
			const reply = {
				messageId: String(props.messageId),
				displayName: room.aiDisplayName,
				text: [...text || "AI 回复"].slice(0, 120).join("")
			};
			const message = {
				...reply,
				role: "ai",
				createdAt: assistant.time
			};
			const tools = {
				roomId: room.id,
				message,
				reactions: view.reactions,
				identity: view.identity,
				selecting,
				selected,
				toggleReaction: props.toggleReaction,
				openForward: props.openForward,
				toggleSelection: props.toggleMessageSelection
			};
			const threadPreview = view.threadPreviews.find((preview) => preview.thread.root.messageId === message.messageId && preview.thread.root.role === "ai");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-chatroom-assistant-tools",
				ref: rootRef,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChatroomSelectionCheckbox, { tools }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-chatroom-assistant-actions",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChatroomReactionBar, { ...tools }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: "dsh-chatroom-assistant-reply",
								type: "button",
								title: `回复 ${room.aiDisplayName}`,
								"aria-label": `回复 ${room.aiDisplayName}`,
								onClick: () => {
									props.setReply(room.id, reply);
								},
								children: "↩"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: "dsh-chatroom-assistant-reply",
								type: "button",
								title: "发起分支",
								"aria-label": "发起分支",
								onClick: () => {
									props.openThread(room.id, {
										...reply,
										role: "ai"
									});
								},
								children: "⑂"
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChatroomThreadActivity, {
						preview: threadPreview,
						open: () => {
							props.openThread(room.id, {
								...reply,
								role: "ai"
							});
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChatroomMessageContextMenu, {
						tools,
						position: menu.position,
						close: menu.close
					})
				]
			});
		}
		//#endregion
		//#region src/client/ChatroomComposer.tsx
		const MESSAGE_EMOJIS = [
			"😀",
			"😄",
			"😂",
			"🥰",
			"😍",
			"🤔",
			"😮",
			"😭",
			"😡",
			"👍",
			"👏",
			"🙏",
			"🎉",
			"❤️",
			"🔥",
			"✨",
			"✅",
			"👀"
		];
		/** Small file chooser inside the native composer tool row. */
		function ChatroomFileAction(props) {
			const active = props.useChatroom((snapshot) => snapshot).rooms.find((candidate) => candidate.sessionId === String(props.sessionId));
			const input = (0, react.useRef)(null);
			const root = (0, react.useRef)(null);
			const [emojiOpen, setEmojiOpen] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (!emojiOpen) return;
				const close = (event) => {
					if (!root.current?.contains(event.target)) setEmojiOpen(false);
				};
				document.addEventListener("pointerdown", close);
				return () => {
					document.removeEventListener("pointerdown", close);
				};
			}, [emojiOpen]);
			if (active === void 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-chatroom-composer-actions",
				ref: root,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						className: "dsh-chatroom-file-button",
						type: "button",
						title: "发送表情",
						"aria-label": "发送表情",
						"aria-expanded": emojiOpen,
						onClick: () => {
							setEmojiOpen((open) => !open);
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							children: "☺"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "表情" })]
					}),
					emojiOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-chatroom-emoji-picker",
						role: "dialog",
						"aria-label": "选择表情",
						children: MESSAGE_EMOJIS.map((emoji) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `插入 ${emoji}`,
							onClick: () => {
								props.inputActions.setDraft(`${props.input.draft}${emoji}`);
								setEmojiOpen(false);
							},
							children: emoji
						}, emoji))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						className: "dsh-chatroom-file-button",
						type: "button",
						title: "发送图片或文件",
						"aria-label": "发送图片或文件",
						onClick: () => {
							input.current?.click();
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							children: "📎"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "附件" })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
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
					})
				]
			});
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
									children: item.file.type.startsWith("image/") ? "🖼️" : "📎"
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
							children: room.composerBusy ? "正在发送…" : "发送"
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
		/** Remove a merged-forward transcript while returning its browser card metadata. */
		function projectForwardText(text) {
			if (!text.startsWith("⁣dsh-chatroom-forward:")) return { text };
			const end = text.indexOf("⁣", 22);
			if (end < 0) return { text };
			const forward = decodePayload(text.slice(22, end));
			if (!validForward(forward)) return { text };
			let visible = text.slice(end + 1);
			const prefix = forwardPrefix(forward);
			if (visible.startsWith(prefix)) visible = visible.slice(prefix.length);
			return {
				text: visible,
				forward
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
		function forwardPrefix(bundle) {
			const lines = bundle.items.map((item) => `${item.displayName}：${item.text}`);
			return `合并转发（${bundle.items.length} 条）\n${lines.join("\n")}`;
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
		function validForward(value) {
			if (value === null || typeof value !== "object") return false;
			const bundle = value;
			if (typeof bundle.sourceRoomId !== "string" || typeof bundle.sourceRoomTitle !== "string" || !Array.isArray(bundle.items) || bundle.items.length === 0) return false;
			return bundle.items.every((raw) => {
				if (raw === null || typeof raw !== "object") return false;
				const item = raw;
				return typeof item.messageId === "string" && (item.role === "human" || item.role === "ai") && typeof item.displayName === "string" && typeof item.text === "string" && typeof item.createdAt === "number";
			});
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
			let forward;
			const files = [];
			const texts = [];
			const content = [];
			for (const block of node.data.content) {
				if (block.type !== "text") {
					content.push(block);
					continue;
				}
				let visibleText = block.text;
				if (!identityProjected) {
					identityProjected = true;
					const marker = participantMarker(visibleText);
					visibleText = marker === void 0 ? visibleText : visibleText.slice(marker.length);
					const namePrefix = /^([^：]{1,80})：/.exec(visibleText);
					displayName = namePrefix?.[1];
					own = identity !== void 0 && (marker === void 0 ? displayName === identity.displayName : marker.participantId === identity.participantId);
					avatarId = marker?.avatarId ?? fallbackAvatarId(displayName ?? marker?.participantId ?? "participant");
					if (namePrefix !== null) visibleText = visibleText.slice(namePrefix[0].length);
					const replyProjection = projectReplyText(visibleText);
					visibleText = replyProjection.text;
					reply = replyProjection.reply;
					const forwardProjection = projectForwardText(visibleText);
					visibleText = forwardProjection.text;
					forward = forwardProjection.forward;
				}
				const fileProjection = projectFileText(visibleText);
				visibleText = fileProjection.text;
				files.push(...fileProjection.files);
				if (visibleText.trim() !== "") texts.push(visibleText.trim());
				if (visibleText.trim() !== "") content.push(visibleText === block.text ? block : {
					...block,
					text: visibleText
				});
			}
			if ((files.length > 0 || content.some((block) => block.type === "image")) && texts.length === 1 && isLegacyAttachmentPlaceholder(texts[0])) {
				texts.length = 0;
				for (let index = content.length - 1; index >= 0; index -= 1) {
					const block = content[index];
					if (block?.type === "text" && isLegacyAttachmentPlaceholder(block.text.trim())) content.splice(index, 1);
				}
			}
			return {
				node: identityProjected ? {
					...node,
					data: {
						...node.data,
						content
					}
				} : node,
				own,
				avatarId: avatarId ?? fallbackAvatarId(identity?.participantId ?? "participant"),
				files,
				text: texts.join("\n"),
				...displayName === void 0 ? {} : { displayName },
				...reply === void 0 ? {} : { reply },
				...forward === void 0 ? {} : { forward }
			};
		}
		function isLegacyAttachmentPlaceholder(text) {
			return text === "发送了文件。" || text === "发送了一张图片。";
		}
		/** Reuse Harness' native user renderer and move only peer user messages to the left. */
		const ChatroomUserMessageNodeView = (0, react.memo)(function ChatroomUserMessageNodeView(props) {
			const room = props.useChatroom((snapshot) => snapshot);
			const NativeView = props.nativeMessageView;
			if (!room.rooms.some((candidate) => String(props.sessionId) === candidate.sessionId)) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NativeView, { ...props });
			const projection = projectChatroomMessage(props.node, room.identity);
			const native = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NativeView, {
				...props,
				node: projection.node
			});
			const activeRoom = room.rooms.find((candidate) => String(props.sessionId) === candidate.sessionId);
			const message = messageTarget(props.node, projection);
			const target = replyTarget(message);
			const tools = messageTools(props, room, activeRoom.id, message);
			const threadPreview = findThreadPreview(room.threadPreviews, message.messageId, "human");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ParticipantMessage, {
				native,
				projection,
				tools,
				threadPreview,
				onReply: room.identity === void 0 ? void 0 : () => {
					props.setReply(activeRoom.id, target);
				},
				onThread: room.identity === void 0 ? void 0 : () => {
					props.openThread(activeRoom.id, {
						...target,
						role: "human"
					});
				}
			});
		});
		/** Reuse Harness' native steering renderer and move only peer steering messages to the left. */
		const ChatroomSteeringMessageNodeView = (0, react.memo)(function ChatroomSteeringMessageNodeView(props) {
			const room = props.useChatroom((snapshot) => snapshot);
			const NativeView = props.nativeMessageView;
			if (!room.rooms.some((candidate) => String(props.sessionId) === candidate.sessionId)) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NativeView, { ...props });
			const projection = projectChatroomMessage(props.node, room.identity);
			const native = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NativeView, {
				...props,
				node: projection.node
			});
			const activeRoom = room.rooms.find((candidate) => String(props.sessionId) === candidate.sessionId);
			const message = messageTarget(props.node, projection);
			const target = replyTarget(message);
			const tools = messageTools(props, room, activeRoom.id, message);
			const threadPreview = findThreadPreview(room.threadPreviews, message.messageId, "human");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ParticipantMessage, {
				native,
				projection,
				tools,
				threadPreview,
				onReply: room.identity === void 0 ? void 0 : () => {
					props.setReply(activeRoom.id, target);
				},
				onThread: room.identity === void 0 ? void 0 : () => {
					props.openThread(activeRoom.id, {
						...target,
						role: "human"
					});
				}
			});
		});
		function ParticipantMessage({ native, projection, tools, threadPreview, onReply, onThread }) {
			const avatar = chatroomAvatar(projection.avatarId, projection.displayName ?? "");
			const menu = useChatroomMessageMenu();
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-chatroom-participant-message",
				"data-dsh-chatroom-own": projection.own,
				"data-dsh-chatroom-selection-mode": tools.selecting || void 0,
				"data-dsh-chatroom-selected": tools.selected || void 0,
				onContextMenu: menu.open,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChatroomSelectionCheckbox, { tools }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-chatroom-avatar",
						"data-avatar": avatar.id,
						title: avatar.label,
						"aria-hidden": true,
						children: avatar.emoji
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
							projection.node.data.content.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-chatroom-native-message",
								children: native
							}),
							projection.files.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileCard, { file }, file.id)),
							projection.forward !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ForwardCard, { forward: projection.forward }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChatroomReactionBar, { ...tools }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChatroomThreadActivity, {
								preview: threadPreview,
								open: onThread
							}),
							onReply !== void 0 && onThread !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-chatroom-message-actions",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "dsh-chatroom-reply-button",
									type: "button",
									onClick: onReply,
									children: "↩ 回复"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "dsh-chatroom-reply-button",
									type: "button",
									onClick: onThread,
									children: "⑂ 分支"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChatroomMessageContextMenu, {
						tools,
						position: menu.position,
						close: menu.close
					})
				]
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
		function ForwardCard({ forward }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
				className: "dsh-chatroom-forward-card",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("summary", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [
					"合并转发 · ",
					forward.items.length,
					" 条消息"
				] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: ["来自 ", forward.sourceRoomTitle] })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: forward.items.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [item.displayName, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", { children: formatTime(item.createdAt) })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: item.text })] }, item.messageId)) })]
			});
		}
		function messageTarget(node, projection) {
			const fileText = projection.files.length === 0 ? "" : projection.files.map((file) => file.name).join("、");
			const forwardText = projection.forward === void 0 ? "" : `合并转发 ${projection.forward.items.length} 条消息`;
			const text = (projection.text.trim() || fileText || forwardText || "图片消息").replace(/\s+/gu, " ");
			return {
				messageId: `${node.kind}:${node.data.seq}`,
				role: "human",
				displayName: projection.displayName ?? "参与者",
				text: [...text].slice(0, 120).join(""),
				createdAt: node.data.time
			};
		}
		function replyTarget(message) {
			return {
				messageId: message.messageId,
				displayName: message.displayName,
				text: message.text
			};
		}
		function messageTools(props, room, roomId, message) {
			return {
				roomId,
				message,
				reactions: room.reactions,
				identity: room.identity,
				selecting: room.selectionRoomId === roomId,
				selected: room.selectionRoomId === roomId && room.selectedMessages.some((item) => item.messageId === message.messageId),
				toggleReaction: props.toggleReaction,
				openForward: props.openForward,
				toggleSelection: props.toggleMessageSelection
			};
		}
		function findThreadPreview(previews, messageId, role) {
			return previews.find((preview) => preview.thread.root.messageId === messageId && preview.thread.root.role === role);
		}
		function formatTime(time) {
			return new Date(time).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit"
			});
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
				members: [],
				reactions: [],
				threadPreviews: [],
				membersOpen: false,
				error: void 0,
				composerRoomId: void 0,
				pendingFiles: [],
				reply: void 0,
				composerBusy: false,
				composerError: void 0,
				thread: void 0,
				threadMessages: [],
				threadBusy: false,
				threadError: void 0,
				unreadCount: 0,
				toasts: [],
				notificationsEnabled: notificationPermission() === "granted",
				selectionRoomId: void 0,
				selectedMessages: [],
				forwardOpen: false,
				forwardBusy: false,
				forwardError: void 0
			};
			listeners = /* @__PURE__ */ new Set();
			eventSource;
			notificationSource;
			pendingOpenRoomId;
			identityPromptedRoomId;
			stopped = false;
			compositionRevision = 0;
			pendingFileSequence = 0;
			originalTitle;
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
				if (typeof document !== "undefined") this.originalTitle = document.title;
				await this.loadSession();
			}
			/** Stop network activity and notification delivery. */
			stop() {
				this.stopped = true;
				this.closeEvents();
				this.closeNotifications();
				this.updateActiveDocumentRoom(false);
				this.updateDocumentTitle(0);
				this.listeners.clear();
			}
			/** Show identity setup or the shared room directory. */
			openRoom = () => {
				this.set({
					open: true,
					error: void 0
				});
			};
			/** Open group management for the active room. */
			openMembers = () => {
				if (this.snapshot.room !== void 0) this.set({
					membersOpen: true,
					thread: void 0,
					threadMessages: [],
					threadError: void 0
				});
			};
			/** Close group management without changing the active room. */
			closeMembers = () => {
				this.set({ membersOpen: false });
			};
			/** Close only the additive room dialog. */
			closeRoom = () => {
				this.set(this.snapshot.phase === "identity-required" && this.snapshot.identity !== void 0 ? {
					open: false,
					phase: "ready",
					error: void 0
				} : { open: false });
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
					this.identityPromptedRoomId = void 0;
					this.updateActiveDocumentRoom(false);
					this.set({
						room: void 0,
						connection: "offline",
						online: 0,
						members: [],
						reactions: [],
						threadPreviews: [],
						membersOpen: false,
						thread: void 0,
						threadMessages: [],
						selectionRoomId: void 0,
						selectedMessages: [],
						forwardOpen: false
					});
					return;
				}
				this.updateActiveDocumentRoom(true);
				if (this.snapshot.identity === void 0 && this.identityPromptedRoomId !== room.id) {
					this.identityPromptedRoomId = room.id;
					this.set({ open: true });
				}
				if (this.snapshot.room?.id === room.id && this.eventSource !== void 0) return;
				this.set({
					room,
					connection: "connecting",
					online: 0,
					members: [],
					reactions: [],
					threadPreviews: [],
					membersOpen: false,
					thread: void 0,
					threadMessages: [],
					selectionRoomId: void 0,
					selectedMessages: [],
					forwardOpen: false
				});
				this.clearUnread();
				this.openEvents(room);
			};
			/** Create the persistent browser identity, then show the room directory. */
			join = async (displayName, avatarId) => {
				const activeRoom = this.snapshot.room;
				const activeConnection = this.snapshot.connection;
				const activeOnline = this.snapshot.online;
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
					const resolvedRoom = activeRoom === void 0 ? void 0 : session.rooms.find((room) => room.id === activeRoom.id);
					this.set({
						phase: "ready",
						rooms: session.rooms,
						room: resolvedRoom,
						identity: session.identity,
						connection: resolvedRoom === void 0 ? "offline" : activeConnection,
						online: resolvedRoom === void 0 ? 0 : activeOnline,
						error: void 0
					});
					this.openNotifications();
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
			/** Toggle one reaction and replace the message summary immediately. */
			toggleReaction = async (roomId, messageId, emoji) => {
				try {
					const reaction = await requestJson(`${CHATROOM_API_PREFIX}/reactions/toggle`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							roomId,
							messageId,
							emoji
						})
					});
					this.replaceReaction(reaction);
				} catch (error) {
					this.set({ composerError: errorMessage(error) });
				}
			};
			/** Add or remove one message from the current room selection. */
			toggleMessageSelection = (roomId, message) => {
				const current = this.snapshot.selectionRoomId === roomId ? this.snapshot.selectedMessages : [];
				const selected = current.some((item) => item.messageId === message.messageId) ? current.filter((item) => item.messageId !== message.messageId) : [...current, message];
				this.set({
					selectionRoomId: roomId,
					selectedMessages: selected,
					forwardOpen: false,
					forwardError: void 0
				});
			};
			/** Open the target-room chooser for one message or the active selection. */
			openForward = (roomId, message) => {
				const selected = this.snapshot.selectionRoomId === roomId ? this.snapshot.selectedMessages : [];
				const messages = message === void 0 ? selected : selected.some((item) => item.messageId === message.messageId) ? selected : [message];
				if (messages.length === 0) return;
				this.set({
					selectionRoomId: roomId,
					selectedMessages: messages,
					forwardOpen: true,
					forwardError: void 0
				});
			};
			/** Cancel message selection and merged-forward composition. */
			clearMessageSelection = () => {
				this.set({
					selectionRoomId: void 0,
					selectedMessages: [],
					forwardOpen: false,
					forwardBusy: false,
					forwardError: void 0
				});
			};
			/** Close only the forward target chooser while retaining selected messages. */
			closeForward = () => {
				this.set({
					forwardOpen: false,
					forwardError: void 0
				});
			};
			/** Send the current selection to another shared room as one merged card. */
			forwardSelected = async (targetRoomId) => {
				const sourceRoomId = this.snapshot.selectionRoomId;
				if (sourceRoomId === void 0 || this.snapshot.selectedMessages.length === 0 || this.snapshot.forwardBusy) return false;
				this.set({
					forwardBusy: true,
					forwardError: void 0
				});
				try {
					await requestJson(`${CHATROOM_API_PREFIX}/forward`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							sourceRoomId,
							targetRoomId,
							messages: this.snapshot.selectedMessages
						})
					});
					this.clearMessageSelection();
					return true;
				} catch (error) {
					this.set({
						forwardBusy: false,
						forwardError: errorMessage(error)
					});
					return false;
				}
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
			/** Create or reopen a branch rooted at one main-room message. */
			openThread = async (roomId, root) => {
				this.set({
					membersOpen: false,
					threadBusy: true,
					threadError: void 0
				});
				try {
					const response = await requestJson(`${CHATROOM_API_PREFIX}/threads/open`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							roomId,
							root
						})
					});
					this.set({
						thread: response.thread,
						threadMessages: response.messages,
						...response.messages.length === 0 ? {} : { threadPreviews: replaceThreadPreview(this.snapshot.threadPreviews, {
							thread: response.thread,
							totalMessages: response.messages.length,
							recentMessages: response.messages.slice(-3)
						}) },
						threadBusy: false,
						threadError: void 0
					});
					this.clearUnread();
				} catch (error) {
					this.set({
						threadBusy: false,
						threadError: errorMessage(error)
					});
				}
			};
			/** Close the right-side branch panel. */
			closeThread = () => {
				this.set({
					thread: void 0,
					threadMessages: [],
					threadBusy: false,
					threadError: void 0
				});
			};
			/** Send one human-first branch message. */
			sendThreadMessage = async (text) => {
				const thread = this.snapshot.thread;
				if (thread === void 0 || this.snapshot.threadBusy || text.trim() === "") return false;
				this.set({
					threadBusy: true,
					threadError: void 0
				});
				try {
					await requestJson(`${CHATROOM_API_PREFIX}/threads/prompt`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							threadId: thread.id,
							text
						})
					});
					this.set({
						threadBusy: false,
						threadError: void 0
					});
					return true;
				} catch (error) {
					this.set({
						threadBusy: false,
						threadError: errorMessage(error)
					});
					return false;
				}
			};
			/** Request browser notification permission from an explicit user gesture. */
			enableSystemNotifications = async () => {
				if (typeof Notification === "undefined") return;
				const permission = await Notification.requestPermission();
				this.set({ notificationsEnabled: permission === "granted" });
			};
			/** Remove one in-page message alert. */
			dismissToast = (id) => {
				this.set({ toasts: this.snapshot.toasts.filter((toast) => toast.id !== id) });
			};
			/** Open identity editing without revoking the current identity. */
			resetIdentity = async () => {
				this.set({
					open: true,
					phase: "identity-required",
					error: void 0
				});
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
					members: [],
					reactions: [],
					threadPreviews: [],
					selectionRoomId: void 0,
					selectedMessages: [],
					forwardOpen: false,
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
					this.openNotifications();
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
			openNotifications() {
				if (this.stopped || this.snapshot.identity === void 0 || this.notificationSource !== void 0) return;
				const source = new EventSource(`${CHATROOM_API_PREFIX}/notifications`);
				this.notificationSource = source;
				source.onmessage = (event) => {
					if (this.notificationSource !== source) return;
					try {
						const parsed = JSON.parse(event.data);
						if (parsed.type === "notification") this.receiveNotification(parsed.notification);
					} catch {
						this.set({ error: "收到无法识别的消息提醒。" });
					}
				};
			}
			closeEvents() {
				this.eventSource?.close();
				this.eventSource = void 0;
			}
			closeNotifications() {
				this.notificationSource?.close();
				this.notificationSource = void 0;
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
							members: event.members,
							reactions: event.reactions,
							threadPreviews: event.threadPreviews,
							error: void 0
						});
						return;
					case "presence":
						this.set({
							online: event.online,
							members: event.members
						});
						return;
					case "thread-message":
						this.set({
							threadPreviews: replaceThreadPreview(this.snapshot.threadPreviews, event.preview),
							...this.snapshot.thread?.id !== event.message.threadId || this.snapshot.threadMessages.some((message) => message.id === event.message.id) ? {} : { threadMessages: [...this.snapshot.threadMessages, event.message] }
						});
						return;
					case "reaction":
						this.replaceReaction(event.reaction);
						return;
				}
			}
			replaceReaction(reaction) {
				if (this.snapshot.room?.id !== reaction.roomId) return;
				const without = this.snapshot.reactions.filter((item) => item.messageId !== reaction.messageId || item.emoji !== reaction.emoji);
				this.set({ reactions: reaction.participantIds.length === 0 ? without : [...without, reaction] });
			}
			receiveNotification(notification) {
				if (notification.participantId === this.snapshot.identity?.participantId) return;
				const toasts = [...this.snapshot.toasts.filter((item) => item.id !== notification.id), notification].slice(-4);
				const isVisible = typeof document !== "undefined" && document.visibilityState === "visible";
				const isCurrent = this.snapshot.room?.id === notification.roomId && (notification.threadId === void 0 || notification.threadId === this.snapshot.thread?.id);
				const unreadCount = isVisible && isCurrent ? this.snapshot.unreadCount : this.snapshot.unreadCount + 1;
				this.set({
					toasts,
					unreadCount
				});
				if (this.snapshot.notificationsEnabled && typeof Notification !== "undefined" && !isVisible) try {
					new Notification(`${notification.displayName} · ${notification.roomTitle}`, { body: notification.text });
				} catch (error) {
					this.set({
						notificationsEnabled: false,
						error: `系统消息提醒失败：${errorMessage(error)}`
					});
				}
				globalThis.setTimeout(() => {
					this.dismissToast(notification.id);
				}, 6e3);
			}
			clearUnread() {
				if (this.snapshot.unreadCount !== 0) this.set({ unreadCount: 0 });
			}
			updateDocumentTitle(unreadCount) {
				if (typeof document === "undefined" || this.originalTitle === void 0) return;
				document.title = unreadCount === 0 ? this.originalTitle : `(${unreadCount}) ${this.originalTitle}`;
			}
			updateActiveDocumentRoom(active) {
				if (typeof document === "undefined") return;
				document.documentElement.toggleAttribute("data-dsh-chatroom-active", active);
			}
			set(patch) {
				if (this.stopped) return;
				this.snapshot = {
					...this.snapshot,
					...patch
				};
				if (patch.unreadCount !== void 0) this.updateDocumentTitle(this.snapshot.unreadCount);
				for (const listener of this.listeners) listener();
			}
		};
		function replaceThreadPreview(previews, preview) {
			return [...previews.filter((item) => item.thread.id !== preview.thread.id), preview];
		}
		function notificationPermission() {
			return typeof Notification === "undefined" ? "unsupported" : Notification.permission;
		}
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
			return await Promise.all(files.map(async ({ file }) => {
				const data = bytesToBase64(new Uint8Array(await file.arrayBuffer()));
				if (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp" || file.type === "image/gif") return {
					type: "image",
					name: file.name,
					mediaType: file.type,
					data
				};
				return {
					type: "file",
					name: file.name,
					mediaType: file.type === "" ? "application/octet-stream" : file.type,
					data
				};
			}));
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "dsh-chatroom-header-actions",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
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
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					className: "dsh-chatroom-manage-action",
					type: "button",
					onClick: props.openMembers,
					children: "群管理"
				})]
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

.dsh-chatroom-unread {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  margin-left: 6px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  padding: 0 6px;
  font-size: 11px;
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

.dsh-chatroom-header-actions { display: inline-flex; align-items: center; gap: 4px; }
.dsh-chatroom-manage-action {
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 4px 8px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dsh-chatroom-manage-action:hover { color: var(--brand-primary, #4f7cff); border-color: var(--brand-primary, #4f7cff); }

.dsh-chatroom-presence-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a0a7b2;
}

.dsh-chatroom-presence-dot[data-online="true"] { background: #20b26b; }

.dsh-chatroom-participant-message {
  position: relative;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-selection-mode="true"],
[data-time-hover-root][data-dsh-chatroom-selection-mode] {
  box-sizing: border-box;
  position: relative;
  padding-left: 36px !important;
}

.dsh-chatroom-selection-checkbox {
  position: absolute;
  z-index: 3;
  top: 28px;
  left: 5px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  cursor: pointer;
}

.dsh-chatroom-selection-checkbox input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.dsh-chatroom-selection-checkbox > span {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: 19px;
  height: 19px;
  border: 1.5px solid var(--border-strong, #aeb5c0);
  border-radius: 6px;
  background: var(--bg-primary, #fff);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
.dsh-chatroom-selection-checkbox input:checked + span { border-color: var(--brand-primary, #4f7cff); background: var(--brand-primary, #4f7cff); }
.dsh-chatroom-selection-checkbox input:focus-visible + span { outline: 2px solid color-mix(in srgb, var(--brand-primary, #4f7cff) 35%, transparent); outline-offset: 2px; }

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

[data-dsh-chatroom-active] [data-time-hover-root] :is([class*="timeStart"], [class*="timeEnd"]) {
  opacity: 1 !important;
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
.dsh-chatroom-message-actions, .dsh-chatroom-assistant-actions { display: inline-flex; align-items: center; gap: 2px; }
.dsh-chatroom-assistant-tools { display: flex; flex-direction: column; align-items: flex-start; }

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

.dsh-chatroom-thread-activity {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: min(440px, 76vw);
  margin-top: 5px;
  border: 0;
  border-left: 2px solid color-mix(in srgb, var(--brand-primary, #4f7cff) 30%, transparent);
  border-radius: 0 8px 8px 0;
  background: color-mix(in srgb, var(--bg-secondary, #f3f4f6) 58%, transparent);
  padding: 7px 9px;
  color: var(--text-secondary, #6b7280);
  font: inherit;
  text-align: left;
  cursor: pointer;
  opacity: .82;
}
.dsh-chatroom-thread-activity:hover { background: var(--bg-secondary, #f3f4f6); opacity: 1; }
.dsh-chatroom-thread-activity:disabled { cursor: default; }
.dsh-chatroom-thread-activity-heading { font-size: 11px; font-weight: 600; }
.dsh-chatroom-thread-activity-list { display: grid; gap: 3px; }
.dsh-chatroom-thread-activity-list > span { display: grid; grid-template-columns: minmax(44px, 72px) minmax(0, 1fr); gap: 7px; font-size: 11px; line-height: 16px; }
.dsh-chatroom-thread-activity-list strong,
.dsh-chatroom-thread-activity-list > span > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.dsh-chatroom-toast-stack {
  pointer-events: auto;
  position: fixed;
  top: 76px;
  right: 24px;
  z-index: 75;
  display: grid;
  gap: 10px;
  width: min(360px, calc(100vw - 32px));
}

.dsh-chatroom-toast {
  display: grid;
  gap: 5px;
  width: 100%;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 14px;
  background: color-mix(in srgb, var(--bg-primary, #fff) 94%, transparent);
  color: var(--text-primary, #111827);
  padding: 13px 15px;
  box-shadow: 0 14px 40px rgb(15 23 42 / 16%);
  font: inherit;
  text-align: left;
  cursor: pointer;
  backdrop-filter: blur(14px);
}
.dsh-chatroom-toast strong { font-size: 13px; }
.dsh-chatroom-toast strong small { color: var(--text-secondary, #6b7280); font-weight: 400; }
.dsh-chatroom-toast > span { overflow: hidden; color: var(--text-secondary, #6b7280); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }

.dsh-chatroom-member-layer { z-index: 70; }
.dsh-chatroom-member-card { width: min(460px, calc(100vw - 48px)); }
.dsh-chatroom-member-list { display: grid; gap: 5px; max-height: min(440px, 55vh); overflow-y: auto; }
.dsh-chatroom-member {
  display: grid;
  grid-template-columns: 42px 1fr auto;
  align-items: center;
  gap: 11px;
  border-radius: 12px;
  padding: 8px 9px;
}
.dsh-chatroom-member:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-member > span:nth-child(2) { display: grid; gap: 2px; min-width: 0; }
.dsh-chatroom-member strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-member small { color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-member > i { width: 8px; height: 8px; border-radius: 50%; background: #c4c9d1; }
.dsh-chatroom-member > i[data-online="true"] { background: #20b26b; box-shadow: 0 0 0 3px rgb(32 178 107 / 14%); }
.dsh-chatroom-member-avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(145deg, #eaf2ff, #cbdcff);
  font-size: 20px;
}
.dsh-chatroom-notification-button {
  width: 100%;
  margin-top: 14px;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 10px;
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-primary, #111827);
  padding: 10px 14px;
  font: inherit;
  cursor: pointer;
}
.dsh-chatroom-notification-button:disabled { color: #20a466; cursor: default; }

.dsh-chatroom-thread-panel {
  pointer-events: auto;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 55;
  display: grid;
  grid-template-rows: auto auto 1fr auto auto;
  width: min(430px, 94vw);
  border-left: 1px solid var(--border-primary, #e5e7eb);
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  box-shadow: -18px 0 48px rgb(15 23 42 / 12%);
}
.dsh-chatroom-thread-panel > header { display: flex; align-items: center; justify-content: space-between; min-height: 64px; border-bottom: 1px solid var(--border-primary, #e5e7eb); padding: 0 18px; }
.dsh-chatroom-thread-panel > header div { display: grid; gap: 2px; }
.dsh-chatroom-thread-panel > header strong { font-size: 16px; }
.dsh-chatroom-thread-panel > header small { color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-thread-panel > header button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); font: inherit; font-size: 25px; cursor: pointer; }
.dsh-chatroom-thread-root { display: grid; gap: 5px; margin: 14px 16px 4px; border-left: 3px solid var(--brand-primary, #4f7cff); border-radius: 0 10px 10px 0; background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent); padding: 10px 12px; }
.dsh-chatroom-thread-root strong { font-size: 12px; }
.dsh-chatroom-thread-root span { color: var(--text-secondary, #6b7280); font-size: 13px; line-height: 1.5; }
.dsh-chatroom-thread-messages { overflow-y: auto; padding: 14px 16px 8px; }
.dsh-chatroom-thread-empty { margin: 18px; color: var(--text-secondary, #6b7280); font-size: 13px; line-height: 1.6; text-align: center; }
.dsh-chatroom-thread-message { display: flex; align-items: flex-start; gap: 9px; margin-bottom: 15px; }
.dsh-chatroom-thread-message[data-own="true"] { flex-direction: row-reverse; }
.dsh-chatroom-thread-message > div { display: grid; gap: 4px; max-width: calc(100% - 50px); }
.dsh-chatroom-thread-message[data-own="true"] > div { justify-items: end; }
.dsh-chatroom-thread-message strong { display: flex; gap: 7px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-thread-message time { font-weight: 400; opacity: .8; }
.dsh-chatroom-thread-message p { margin: 0; border-radius: 5px 15px 15px; background: var(--bg-secondary, #f3f4f6); padding: 9px 12px; font-size: 14px; line-height: 1.55; white-space: pre-wrap; word-break: break-word; }
.dsh-chatroom-thread-message[data-own="true"] p { border-radius: 15px 5px 15px 15px; background: color-mix(in srgb, var(--brand-primary, #4f7cff) 15%, var(--bg-primary, #fff)); }
.dsh-chatroom-thread-message[data-role="ai"] p { border: 1px solid color-mix(in srgb, var(--brand-primary, #4f7cff) 25%, transparent); background: color-mix(in srgb, var(--brand-primary, #4f7cff) 6%, var(--bg-primary, #fff)); }
.dsh-chatroom-thread-composer { position: relative; display: grid; grid-template-columns: 1fr auto; gap: 8px; border-top: 1px solid var(--border-primary, #e5e7eb); padding: 12px 14px; }
.dsh-chatroom-thread-composer textarea { resize: none; border: 1px solid var(--border-primary, #d1d5db); border-radius: 12px; background: var(--bg-primary, #fff); color: var(--text-primary, #111827); padding: 10px 11px; font: inherit; outline: none; }
.dsh-chatroom-thread-composer textarea:focus { border-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-thread-composer button { align-self: end; border: 0; border-radius: 10px; background: var(--brand-primary, #4f7cff); color: #fff; padding: 10px 14px; font: inherit; font-weight: 600; cursor: pointer; }
.dsh-chatroom-thread-composer button:disabled { opacity: .45; cursor: not-allowed; }
.dsh-chatroom-thread-mentions { position: absolute; right: 14px; bottom: calc(100% - 4px); left: 14px; z-index: 2; overflow: hidden; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 12px; background: var(--bg-primary, #fff); box-shadow: 0 12px 32px rgb(15 23 42 / 16%); }
.dsh-chatroom-thread-mentions > button { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; border-radius: 0; background: transparent; color: var(--text-primary, #111827); padding: 9px 11px; text-align: left; cursor: pointer; }
.dsh-chatroom-thread-mentions > button[data-active="true"], .dsh-chatroom-thread-mentions > button:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-thread-mentions i { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 8px; background: color-mix(in srgb, var(--brand-primary, #4f7cff) 12%, transparent); color: var(--brand-primary, #4f7cff); font-style: normal; }
.dsh-chatroom-thread-mentions span { display: grid; gap: 1px; }
.dsh-chatroom-thread-mentions strong { font-size: 13px; }
.dsh-chatroom-thread-mentions small { color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-thread-panel > .dsh-chatroom-error { margin: 0; padding: 0 16px 12px; }

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

.dsh-chatroom-composer-actions { position: relative; display: inline-flex; align-items: center; gap: 2px; }
.dsh-chatroom-emoji-picker {
  position: absolute;
  z-index: 80;
  bottom: 42px;
  left: 0;
  display: grid;
  grid-template-columns: repeat(6, 36px);
  gap: 4px;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 14px;
  background: var(--bg-primary, #fff);
  padding: 10px;
  box-shadow: 0 14px 36px rgb(15 23 42 / 18%);
}
.dsh-chatroom-emoji-picker button { display: grid; place-items: center; width: 36px; height: 36px; border: 0; border-radius: 9px; background: transparent; font-size: 20px; cursor: pointer; }
.dsh-chatroom-emoji-picker button:hover { background: var(--bg-secondary, #f3f4f6); }

.dsh-chatroom-participant-message[data-dsh-chatroom-selected="true"],
[data-time-hover-root][data-dsh-chatroom-selected] {
  border-radius: 12px;
  outline: 2px solid color-mix(in srgb, var(--brand-primary, #4f7cff) 45%, transparent);
  outline-offset: 5px;
}

.dsh-chatroom-reaction-bar { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 3px; }
.dsh-chatroom-reaction-bar button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 38px;
  height: 25px;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 13px;
  background: var(--bg-primary, #fff);
  padding: 1px 8px;
  font: inherit;
  cursor: pointer;
}
.dsh-chatroom-reaction-bar button[aria-pressed="true"] { border-color: var(--brand-primary, #4f7cff); background: color-mix(in srgb, var(--brand-primary, #4f7cff) 10%, transparent); }
.dsh-chatroom-reaction-bar small { color: var(--text-secondary, #6b7280); font-size: 11px; }

.dsh-chatroom-context-menu {
  position: fixed;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 228px;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 13px;
  background: var(--bg-primary, #fff);
  padding: 6px;
  box-shadow: 0 16px 42px rgb(15 23 42 / 22%);
}
.dsh-chatroom-context-menu > button { display: flex; align-items: center; gap: 9px; border: 0; border-radius: 8px; background: transparent; padding: 9px 10px; color: var(--text-primary, #111827); font: inherit; font-size: 13px; text-align: left; cursor: pointer; }
.dsh-chatroom-context-menu > button:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-context-reactions { display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px; margin-bottom: 5px; border-bottom: 1px solid var(--border-primary, #e5e7eb); padding-bottom: 6px; }
.dsh-chatroom-context-reactions button { display: grid; place-items: center; width: 34px; height: 34px; border: 0; border-radius: 8px; background: transparent; font-size: 18px; cursor: pointer; }
.dsh-chatroom-context-reactions button:hover { background: var(--bg-secondary, #f3f4f6); transform: scale(1.08); }

.dsh-chatroom-forward-card { width: min(460px, 82vw); margin-top: 6px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 13px; background: var(--bg-primary, #fff); overflow: hidden; }
.dsh-chatroom-forward-card summary { display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; cursor: pointer; list-style: none; }
.dsh-chatroom-forward-card summary::-webkit-details-marker { display: none; }
.dsh-chatroom-forward-card summary small { color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-forward-card > div { max-height: 360px; overflow-y: auto; border-top: 1px solid var(--border-primary, #e5e7eb); padding: 4px 14px; }
.dsh-chatroom-forward-card article { padding: 10px 0; border-bottom: 1px solid var(--border-primary, #e5e7eb); }
.dsh-chatroom-forward-card article:last-child { border-bottom: 0; }
.dsh-chatroom-forward-card article strong { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; }
.dsh-chatroom-forward-card article time { color: var(--text-secondary, #6b7280); font-weight: 400; }
.dsh-chatroom-forward-card article p { margin: 4px 0 0; color: var(--text-primary, #111827); font-size: 13px; line-height: 1.45; }

.dsh-chatroom-selection-bar { position: fixed; z-index: 170; bottom: 92px; left: 50%; display: flex; align-items: center; gap: 10px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 14px; background: var(--bg-primary, #fff); padding: 9px 12px; box-shadow: 0 12px 34px rgb(15 23 42 / 18%); transform: translateX(-50%); }
.dsh-chatroom-selection-bar strong { margin-right: 8px; font-size: 13px; }
.dsh-chatroom-selection-bar button { border: 0; border-radius: 8px; background: var(--bg-secondary, #f3f4f6); padding: 7px 10px; font: inherit; cursor: pointer; }
.dsh-chatroom-selection-bar button:first-of-type { background: var(--brand-primary, #4f7cff); color: #fff; }
.dsh-chatroom-selection-bar button:disabled { cursor: not-allowed; opacity: .45; }

.dsh-chatroom-forward-layer { z-index: 190; }
.dsh-chatroom-forward-dialog { width: min(440px, calc(100vw - 48px)); }
.dsh-chatroom-forward-targets { display: flex; flex-direction: column; gap: 7px; max-height: 360px; overflow-y: auto; }
.dsh-chatroom-forward-targets > button { display: grid; grid-template-columns: 28px 1fr auto; align-items: center; gap: 8px; width: 100%; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 10px; background: var(--bg-primary, #fff); padding: 10px; color: var(--text-primary, #111827); font: inherit; text-align: left; cursor: pointer; }
.dsh-chatroom-forward-targets > button:hover { border-color: var(--brand-primary, #4f7cff); background: color-mix(in srgb, var(--brand-primary, #4f7cff) 6%, transparent); }
.dsh-chatroom-forward-targets small { color: var(--text-secondary, #6b7280); }
.dsh-chatroom-forward-empty { border-radius: 10px; background: var(--bg-secondary, #f3f4f6); padding: 18px; color: var(--text-secondary, #6b7280); text-align: center; }

@media (max-width: 640px) {
  .dsh-chatroom-avatar-grid { grid-template-columns: repeat(4, 1fr); }
  .dsh-chatroom-avatar { flex-basis: 34px; width: 34px; height: 34px; font-size: 19px; }
  .dsh-chatroom-message-column { max-width: calc(100% - 44px); }
  .dsh-chatroom-context-menu { width: 216px; }
  .dsh-chatroom-selection-bar { bottom: 84px; width: calc(100vw - 28px); justify-content: center; }
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
					retry: store.retry,
					closeMembers: store.closeMembers,
					closeThread: store.closeThread,
					sendThreadMessage: store.sendThreadMessage,
					enableSystemNotifications: store.enableSystemNotifications,
					dismissToast: store.dismissToast,
					toggleReaction: store.toggleReaction,
					openForward: store.openForward,
					closeForward: store.closeForward,
					forwardSelected: store.forwardSelected,
					toggleMessageSelection: store.toggleMessageSelection,
					clearMessageSelection: store.clearMessageSelection
				})
			}, ChatroomEntry));
			ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
				name: "conversation.session.header.actions",
				id: "chatroom-identity",
				order: -5,
				inject: () => ({
					hooks: { chatroom: store },
					openRoom: store.openRoom,
					openMembers: store.openMembers
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
					setReply: store.setReply,
					openThread: store.openThread,
					toggleReaction: store.toggleReaction,
					openForward: store.openForward,
					toggleMessageSelection: store.toggleMessageSelection
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
						setReply: store.setReply,
						openThread: store.openThread,
						toggleReaction: store.toggleReaction,
						openForward: store.openForward,
						toggleMessageSelection: store.toggleMessageSelection
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
						setReply: store.setReply,
						openThread: store.openThread,
						toggleReaction: store.toggleReaction,
						openForward: store.openForward,
						toggleMessageSelection: store.toggleMessageSelection
					})
				}, ChatroomSteeringMessageNodeView);
			});
		}
		/** Build the room-scoped AI and member source contributed to RC7's native @ menu. */
		function createChatroomAiSource(store) {
			return {
				trigger: "@",
				name: "AI",
				order: -100,
				candidates(session, { query }) {
					const room = store.roomForSession(String(session.sessionId));
					if (room === void 0) return Promise.resolve([]);
					const snapshot = store.getSnapshot();
					const candidates = [...[.../* @__PURE__ */ new Set(["AI", room.aiDisplayName])].map((name) => ({
						name,
						icon: "✦",
						description: "提及后触发 AI 回复"
					})), ...snapshot.members.filter((member) => member.participantId !== snapshot.identity?.participantId).map((member) => ({
						name: member.displayName,
						icon: "●",
						description: member.online ? "在线成员" : "群成员"
					}))].filter((candidate, index, all) => all.findIndex((item) => item.name === candidate.name) === index);
					const needle = query.toLocaleLowerCase();
					return Promise.resolve(candidates.filter((candidate) => candidate.name.toLocaleLowerCase().includes(needle)));
				},
				lexicon(session) {
					const room = store.roomForSession(String(session.sessionId));
					if (room === void 0) return [];
					const snapshot = store.getSnapshot();
					return [.../* @__PURE__ */ new Set([
						"AI",
						room.aiDisplayName,
						...snapshot.members.filter((member) => member.participantId !== snapshot.identity?.participantId).map((member) => member.displayName)
					])];
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