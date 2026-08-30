/** Small additive surfaces around the Harness-owned conversation UI. */
export const CHATROOM_STYLES = `
/* Keep AI and people visually distinct in Harness's native @ menu. */
[role="listbox"] [data-source="AI 助手"] { color: var(--brand-primary, #4f7cff); font-weight: 600; }
[role="option"][id^="dsh-slash-option-AI 助手-"] > span:first-child {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: var(--brand-primary, #4f7cff);
  color: #fff;
  box-shadow: 0 4px 12px rgb(79 124 255 / 22%);
}
[role="option"][id^="dsh-slash-option-AI 助手-"] > span:nth-child(2) { color: var(--brand-primary, #4f7cff); font-weight: 600; }
[role="listbox"] [data-source="群聊成员"] { margin-top: 2px; border-top: 1px solid var(--border-primary, #e5e7eb); }
[role="option"][id^="dsh-slash-option-群聊成员-"] > .dsh-chatroom-native-mention-avatar {
  position: relative;
  overflow: hidden;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 8px;
}
[role="option"][id^="dsh-slash-option-群聊成员-"] > .dsh-chatroom-native-mention-avatar > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  cursor: default;
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
.dsh-chatroom-manage-action:disabled { cursor: wait; opacity: .58; }

[data-dsh-chatroom-room-row] {
  box-sizing: border-box;
  height: 48px !important;
  min-height: 48px;
  padding-block: 6px !important;
}

[data-dsh-chatroom-room-list],
[data-dsh-chatroom-workspace-categories] { display: flex !important; flex-direction: column; }
[data-dsh-chatroom-workspace-categories] > [data-dsh-chatroom-native-group-section] { display: contents !important; }
[data-dsh-chatroom-native-folder-wrapper][data-hidden="true"] { display: none !important; }
[data-dsh-chatroom-sidebar-category] { padding-left: 22px !important; }
[data-dsh-chatroom-branch-row] { padding-left: 60px !important; }
[data-dsh-chatroom-category-header] {
  box-sizing: border-box;
  width: 100%;
  min-height: 38px;
  padding: 2px 8px;
}
[data-dsh-chatroom-category-header] > button {
  display: grid;
  grid-template-columns: 14px 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 34px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 3px 7px;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
[data-dsh-chatroom-category-header] > button:hover { background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); }
[data-dsh-chatroom-category-header] strong { color: var(--text-primary, #111827); font-size: 13px; font-weight: 600; }
[data-dsh-chatroom-category-header] small { font-size: 11px; }
[data-dsh-chatroom-category-header] [data-folder-icon] { display: inline-flex; width: 17px; height: 17px; align-items: center; }
[data-dsh-chatroom-category-header] [data-folder-icon] svg { display: block; width: 16px; height: 16px; }
[data-dsh-chatroom-group-collapsed="true"] [data-dsh-chatroom-category-wrapper="group"],
[data-dsh-chatroom-solo-collapsed="true"] [data-dsh-chatroom-category-wrapper="solo"],
[data-dsh-chatroom-direct-collapsed="true"] > [data-dsh-chatroom-direct-row] { display: none !important; }

[data-dsh-chatroom-solo-avatar] {
  display: grid;
  flex: 0 0 32px;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-right: 6px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 11%, var(--bg-primary, #fff));
  color: var(--brand-primary, #4f7cff);
  font-size: 16px;
}
[data-dsh-chatroom-direct-row] { box-sizing: border-box; width: 100%; min-height: 48px; padding: 2px 8px 2px 14px; }
[data-dsh-chatroom-direct-row] > button {
  display: grid;
  grid-template-columns: 32px 16px minmax(0, 1fr);
  align-items: center;
  gap: 5px;
  width: 100%;
  min-height: 44px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--text-primary, #111827);
  padding: 5px 8px;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
[data-dsh-chatroom-direct-row] > button::before { content: ""; grid-column: 2; grid-row: 1; }
[data-dsh-chatroom-direct-row] > button:hover,
[data-dsh-chatroom-direct-row][data-active="true"] > button { background: var(--bg-secondary, #f3f4f6); }
[data-dsh-chatroom-direct-row] [data-avatar] {
  display: grid;
  grid-column: 1;
  grid-row: 1;
  place-items: center;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 10%, var(--bg-primary, #fff));
}
[data-dsh-chatroom-direct-row] [data-avatar] img { width: 100%; height: 100%; object-fit: cover; }
[data-dsh-chatroom-direct-row] button > span:last-child { display: grid; grid-column: 3; grid-row: 1; min-width: 0; }
[data-dsh-chatroom-direct-row] strong,
[data-dsh-chatroom-direct-row] small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
[data-dsh-chatroom-direct-row] strong { font-size: 13px; }
[data-dsh-chatroom-direct-row] small { color: var(--text-secondary, #6b7280); font-size: 11px; }
[data-dsh-chatroom-room-row][data-pinned="true"] [data-dsh-chatroom-group-avatar]::after {
  content: ""; position: absolute; top: -2px; right: -2px; width: 7px; height: 7px; border: 2px solid var(--bg-primary, #fff);
  border-radius: 50%; background: var(--brand-primary, #4f7cff);
}

[data-dsh-chatroom-group-avatar] {
  position: relative;
  display: grid;
  box-sizing: border-box;
  flex: 0 0 32px;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 32px;
  height: 32px;
  margin-right: 6px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--border-primary, #d8dde6) 82%, transparent);
  border-radius: 9px;
  background: var(--bg-secondary, #f3f4f6);
  box-shadow: 0 2px 7px rgb(15 23 42 / 8%);
}

[data-dsh-chatroom-group-avatar][data-count="1"] {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

[data-dsh-chatroom-group-avatar][data-count="2"] {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr;
}

[data-dsh-chatroom-group-avatar][data-count="3"],
[data-dsh-chatroom-group-avatar][data-count="4"] {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

[data-dsh-chatroom-group-avatar] > span {
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: color-mix(in srgb, var(--bg-primary, #fff) 82%, var(--brand-primary, #4f7cff));
  font-size: 8px;
  line-height: 1;
}

[data-dsh-chatroom-group-avatar] > span > img,
.dsh-chatroom-avatar > img,
.dsh-chatroom-member-avatar > img,
.dsh-chatroom-user-avatar > img,
.dsh-chatroom-direct-avatar > img,
.dsh-chatroom-inline-avatar > img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}

[data-dsh-chatroom-group-avatar][data-count="1"] > span { font-size: 18px; }
[data-dsh-chatroom-group-avatar][data-count="2"] > span { font-size: 12px; }
[data-dsh-chatroom-group-avatar][data-count="3"] > span,
[data-dsh-chatroom-group-avatar][data-count="4"] > span { font-size: 10px; }

/* Branch sessions are still native rows, but read as a nested Discord-style
   thread: a hook, compact branch badge, topic, and explicit parent context. */
[data-dsh-chatroom-branch-row] {
  position: relative;
  display: flex;
  box-sizing: border-box;
  width: auto !important;
  min-height: 46px !important;
  height: 46px !important;
  margin: 2px 8px 2px 30px !important;
  border: 1px solid transparent;
  border-radius: 10px !important;
  padding: 4px 8px !important;
  background: transparent;
  color: var(--dsw-alias-label-secondary, var(--text-secondary, #6b7280)) !important;
}

[data-dsh-chatroom-branch-row]:hover {
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 16%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 7%, var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-layer-2, var(--bg-secondary, #f3f4f6))));
}

[data-dsh-chatroom-branch-row][aria-selected="true"] {
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 32%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 13%, var(--dsw-alias-bg-layer-1, var(--bg-primary, #fff)));
  box-shadow: inset 2px 0 0 var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)), 0 2px 8px rgb(15 23 42 / 7%);
  color: var(--dsw-alias-label-primary, var(--text-primary, #111827)) !important;
}

[data-dsh-chatroom-branch-row]:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 48%, transparent);
  outline-offset: 1px;
}

[data-dsh-chatroom-branch-row]::before {
  position: absolute;
  top: 7px;
  left: -15px;
  width: 11px;
  height: 19px;
  border-bottom: 1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 28%, var(--dsw-alias-border-l2, var(--border-primary, #d8dde6)));
  border-left: 1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 28%, var(--dsw-alias-border-l2, var(--border-primary, #d8dde6)));
  border-bottom-left-radius: 7px;
  content: '';
  pointer-events: none;
}

[data-dsh-chatroom-branch-marker] {
  display: grid;
  flex: 0 0 22px;
  place-items: center;
  width: 22px;
  height: 22px;
  margin-right: 7px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 22%, transparent);
  border-radius: 7px;
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 10%, var(--dsw-alias-bg-layer-1, var(--bg-primary, #fff)));
  color: var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff));
  font-size: 15px;
  line-height: 1;
}

[data-dsh-chatroom-branch-surface] {
  display: grid;
  flex: 1 1 auto;
  align-content: center;
  min-width: 0;
  gap: 1px;
}

[data-dsh-chatroom-branch-heading] {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 6px;
}

[data-dsh-chatroom-branch-badge] {
  flex: none;
  border-radius: 5px;
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 13%, transparent);
  padding: 1px 5px;
  color: var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff));
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
}

[data-dsh-chatroom-branch-topic] {
  min-width: 0;
  overflow: hidden;
  color: inherit;
  font-size: 13px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-dsh-chatroom-branch-parent] {
  min-width: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary, var(--text-tertiary, #9ca3af));
  font-size: 11px;
  line-height: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-dsh-chatroom-native-branch-title] { display: none !important; }

[data-dsh-chatroom-has-branches] {
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 35%, transparent);
}

[data-dsh-chatroom-branch-count] {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 20px;
  margin-right: 4px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 9%, var(--dsw-alias-bg-layer-2, var(--bg-secondary, #f3f4f6)));
  color: var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff));
  font-size: 11px;
  line-height: 20px;
}

[data-dsh-chatroom-has-branches]:hover > [data-dsh-chatroom-branch-count],
[data-dsh-chatroom-has-branches]:focus-within > [data-dsh-chatroom-branch-count] {
  display: none;
}

.dsh-chatroom-group-setup {
  display: grid;
  gap: 12px;
  box-sizing: border-box;
  width: 100%;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 16px;
  background: color-mix(in srgb, var(--bg-primary, #fff) 96%, var(--brand-primary, #4f7cff));
  color: var(--text-primary, #111827);
  padding: 14px 16px;
  box-shadow: 0 12px 34px rgb(15 23 42 / 8%);
}
.dsh-chatroom-group-setup-collapsed {
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}
.dsh-chatroom-group-setup-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 12%, var(--bg-primary, #fff));
  font-size: 21px;
}
.dsh-chatroom-group-setup-collapsed > span:nth-child(2),
.dsh-chatroom-group-setup header > span:first-child { display: grid; gap: 3px; min-width: 0; }
.dsh-chatroom-group-setup strong { font-size: 14px; }
.dsh-chatroom-group-setup small { color: var(--text-secondary, #6b7280); font-size: 12px; line-height: 1.45; }
.dsh-chatroom-group-setup-collapsed > button,
.dsh-chatroom-group-setup-primary {
  border: 0;
  border-radius: 10px;
  background: var(--brand-primary, #4f7cff);
  color: #fff;
  padding: 9px 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.dsh-chatroom-group-setup header,
.dsh-chatroom-group-setup footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dsh-chatroom-group-setup header > span:last-child { flex: none; color: var(--brand-primary, #4f7cff); font-size: 12px; }
.dsh-chatroom-group-setup-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.dsh-chatroom-group-setup-fields label { display: grid; gap: 5px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-group-setup-fields input {
  min-width: 0;
  border: 1px solid var(--border-primary, #d1d5db);
  border-radius: 10px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 9px 11px;
  font: inherit;
  font-size: 13px;
  outline: none;
}
.dsh-chatroom-group-setup-fields input:focus { border-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-group-setup-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
  max-height: min(176px, 24vh);
  overflow-y: auto;
}
.dsh-chatroom-group-setup-list > label {
  display: grid;
  grid-template-columns: 18px 36px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  border-radius: 11px;
  padding: 6px 7px;
  cursor: pointer;
}
.dsh-chatroom-group-setup-list > label:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-group-setup-list input { width: 16px; height: 16px; margin: 0; accent-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-group-setup-list .dsh-chatroom-member-avatar { width: 36px; height: 36px; }
.dsh-chatroom-group-setup-list label > span:last-child { display: grid; min-width: 0; }
.dsh-chatroom-group-setup-list label strong,
.dsh-chatroom-group-setup-list label small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-group-setup-list > p { grid-column: 1 / -1; margin: 12px; color: var(--text-secondary, #6b7280); font-size: 12px; text-align: center; }
.dsh-chatroom-group-setup-secondary {
  border: 0;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 8px 4px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.dsh-chatroom-group-setup button:disabled { cursor: not-allowed; opacity: .45; }

.dsh-chatroom-new-mode { display: flex; justify-content: center; box-sizing: border-box; width: 100%; padding: 20px; }
[data-dsh-chatroom-new-session-hero] { gap: clamp(20px, 3vh, 30px) !important; }
[data-dsh-chatroom-new-session-hero] > :first-child {
  display: grid !important;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  justify-content: center;
  align-items: center;
  column-gap: 10px;
  row-gap: clamp(16px, 2.5vh, 24px);
  width: 100%;
  height: auto !important;
}
[data-dsh-chatroom-new-session-hero] > :first-child > :first-child {
  grid-column: 1 / -1;
  grid-row: 1;
  justify-self: center;
  width: 68px !important;
  height: 51px !important;
}
[data-dsh-chatroom-new-session-hero] > :first-child > :first-child svg { width: 68px !important; height: auto !important; }
[data-dsh-chatroom-new-session-hero] > :first-child > :nth-child(2) {
  grid-column: 1;
  grid-row: 2;
  font-size: clamp(28px, 3.4vw, 40px) !important;
  font-weight: 650 !important;
  letter-spacing: -.035em;
}
[data-dsh-chatroom-new-session-hero] > :first-child > :nth-child(3) {
  grid-column: 2;
  grid-row: 2;
}
[data-dsh-chatroom-new-session-switch-host] {
  display: flex !important;
  align-self: stretch !important;
  justify-content: center !important;
  box-sizing: border-box;
  width: 100% !important;
  max-width: none !important;
  padding-bottom: 18px;
}
.dsh-chatroom-new-mode-switch {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  box-sizing: border-box;
  width: min(560px, calc(100vw - 48px));
  margin-inline: auto;
  gap: 3px;
  border-radius: 999px;
  background: var(--bg-secondary, #f3f4f6);
  padding: 3px;
  isolation: isolate;
}
.dsh-chatroom-new-mode-switch::before {
  position: absolute;
  z-index: -1;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc(50% - 4.5px);
  border-radius: 999px;
  background: var(--bg-primary, #fff);
  box-shadow: 0 1px 3px rgb(15 23 42 / 8%), 0 8px 24px rgb(15 23 42 / 5%);
  content: '';
  transform: translateX(0);
  transition: transform 220ms cubic-bezier(.22, 1, .36, 1);
}
.dsh-chatroom-new-mode-switch[data-mode="solo"]::before { transform: translateX(calc(100% + 3px)); }
.dsh-chatroom-new-mode-switch > button {
  position: relative;
  z-index: 1;
  min-height: 52px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 8px 18px;
  font: inherit;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
.dsh-chatroom-new-mode-switch > button[data-active="true"],
.dsh-chatroom-new-mode-switch > button:hover {
  color: var(--text-primary, #111827);
}
@media (prefers-reduced-motion: reduce) { .dsh-chatroom-new-mode-switch::before { transition: none; } }

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
  overflow: hidden;
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
.dsh-chatroom-avatar img,
.dsh-chatroom-member-avatar img {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
  grid-area: 1 / 1;
}
.dsh-chatroom-avatar > span,
.dsh-chatroom-member-avatar > span { grid-area: 1 / 1; }
.dsh-chatroom-avatar img + span,
.dsh-chatroom-member-avatar img + span { visibility: hidden; }

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

.dsh-chatroom-native-message [data-ref-chip][title^="@"] > svg {
  display: none !important;
}

.dsh-chatroom-native-message [data-ref-chip][title^="@"] {
  gap: 0 !important;
}

.dsh-chatroom-native-message [data-ref-chip][title^="@"]::before {
  content: "@";
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

.dsh-chatroom-native-message [data-time-hover-root] > :last-child > button,
[data-dsh-chatroom-native-actions] > button {
  display: none !important;
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

.dsh-chatroom-message-actions > button {
  border: 0;
  background: transparent;
  color: var(--text-secondary, #7b8491);
  padding: 3px 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  opacity: .72;
}

.dsh-chatroom-message-actions > button:hover { color: var(--brand-primary, #4f7cff); opacity: 1; }
.dsh-chatroom-message-actions, .dsh-chatroom-assistant-actions { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 2px; }
.dsh-chatroom-message-actions { position: relative; }
.dsh-chatroom-inline-reaction-control { position: relative; display: inline-flex; }
.dsh-chatroom-inline-reaction-control > button {
  border: 0;
  background: transparent;
  color: var(--text-secondary, #7b8491);
  padding: 3px 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  opacity: .72;
}
.dsh-chatroom-inline-reaction-control > button:hover { color: var(--brand-primary, #4f7cff); opacity: 1; }
.dsh-chatroom-action-overflow {
  position: absolute;
  z-index: 18;
  bottom: calc(100% + 5px);
  left: 0;
  display: grid;
  min-width: 196px;
  overflow: hidden;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 12px;
  background: var(--bg-primary, #fff);
  padding: 5px;
  box-shadow: 0 12px 30px rgb(15 23 42 / 18%);
}
.dsh-chatroom-action-overflow > button { border: 0; border-radius: 8px; background: transparent; color: var(--text-primary, #111827); padding: 8px 9px; font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
.dsh-chatroom-action-overflow > button:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-inline-reactions {
  position: absolute;
  z-index: 12;
  bottom: calc(100% + 5px);
  left: 0;
  display: inline-flex;
  gap: 2px;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 12px;
  background: var(--bg-primary, #fff);
  padding: 5px;
  box-shadow: 0 12px 30px rgb(15 23 42 / 18%);
}
.dsh-chatroom-action-overflow > .dsh-chatroom-inline-reactions { position: static; box-sizing: border-box; width: 100%; border: 0; border-bottom: 1px solid var(--border-primary, #e5e7eb); border-radius: 0; box-shadow: none; }
.dsh-chatroom-inline-reactions > button { display: grid; place-items: center; width: 31px; height: 31px; border: 0; border-radius: 8px; background: transparent; font-size: 17px; cursor: pointer; }
.dsh-chatroom-inline-reactions > button:hover { background: var(--bg-secondary, #f3f4f6); transform: scale(1.06); }
.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-inline-reactions,
.dsh-chatroom-thread-message[data-own="true"] .dsh-chatroom-inline-reactions { right: 0; left: auto; }
.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-action-overflow { right: 0; left: auto; }
.dsh-chatroom-assistant-tools {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: min(440px, 76vw);
  padding-top: 8px;
}

html[data-dsh-chatroom-active] [data-dsh-chatroom-native-actions] {
  align-items: flex-start !important;
  height: auto !important;
  min-height: 0 !important;
  overflow: visible !important;
}

.dsh-chatroom-assistant-turn { display: flex; min-width: 0; flex-direction: column; gap: 16px; }
[data-dsh-chatroom-process-row][hidden] { display: none !important; }
.dsh-chatroom-process-toggle {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 7px;
  min-height: 26px;
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--text-secondary, #6b7280);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
}
.dsh-chatroom-process-toggle:hover { color: var(--text-primary, #111827); }
.dsh-chatroom-process-chevron { display: inline-block; color: var(--brand-primary, #4f7cff); transform: rotate(-90deg); transition: transform .16s ease; }
.dsh-chatroom-process-toggle[aria-expanded="true"] .dsh-chatroom-process-chevron { transform: rotate(0deg); }

.dsh-chatroom-thread-activity {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: min(440px, 100%);
  margin-top: 7px;
  border: 0;
  border-left: 2px solid color-mix(in srgb, var(--brand-primary, #4f7cff) 45%, transparent);
  border-radius: 0 8px 8px 0;
  background: color-mix(in srgb, var(--bg-secondary, light-dark(#f3f4f6, #1b1b1c)) 58%, transparent);
  padding: 7px 9px;
  color: var(--text-secondary, light-dark(#6b7280, #aeb0b4));
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.dsh-chatroom-assistant-tools > .dsh-chatroom-thread-activity { margin-top: 0; }
.dsh-chatroom-thread-activity:hover { background: var(--bg-secondary, light-dark(#f3f4f6, #2c2c2e)); }
.dsh-chatroom-thread-activity:disabled { cursor: default; }
.dsh-chatroom-thread-activity-heading { font-size: 11px; font-weight: 600; }
.dsh-chatroom-thread-activity-list { display: grid; gap: 3px; }
.dsh-chatroom-thread-activity-list > span { display: grid; grid-template-columns: 22px minmax(44px, 72px) minmax(0, 1fr); gap: 7px; font-size: 11px; line-height: 16px; }
.dsh-chatroom-thread-activity-list .dsh-chatroom-member-avatar { width: 22px; height: 22px; border-radius: 7px; font-size: 12px; }
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

.dsh-chatroom-member-card {
  pointer-events: auto;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 250;
  width: min(460px, 94vw);
  overflow-y: auto;
  box-sizing: border-box;
  border-left: 1px solid var(--border-primary, #e5e7eb);
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 28px 24px;
  box-shadow: -18px 0 48px rgb(15 23 42 / 14%);
}
.dsh-chatroom-member-card h2 { margin: 0 0 8px; }
.dsh-chatroom-member-card > p { margin: 0 0 18px; color: var(--text-secondary, #6b7280); }
.dsh-chatroom-invite { display: grid; gap: 10px; margin-bottom: 18px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 12px; padding: 12px; }
.dsh-chatroom-invite-heading { display: flex; align-items: start; justify-content: space-between; gap: 12px; }
.dsh-chatroom-invite-heading > div { display: grid; gap: 3px; }
.dsh-chatroom-invite-heading > span { flex: none; color: var(--brand-primary, #4f7cff); font-size: 12px; }
.dsh-chatroom-invite small { color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-invite > input { min-width: 0; border: 1px solid var(--border-primary, #d1d5db); border-radius: 9px; background: var(--bg-primary, #fff); color: var(--text-primary, #111827); padding: 8px 10px; font: inherit; }
.dsh-chatroom-invite-list { display: grid; gap: 3px; max-height: min(240px, 34vh); overflow-y: auto; }
.dsh-chatroom-invite-list > label { display: grid; grid-template-columns: 18px 38px minmax(0, 1fr); align-items: center; gap: 9px; border-radius: 10px; padding: 6px 7px; cursor: pointer; }
.dsh-chatroom-invite-list > label:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-invite-list > label > input { width: 16px; height: 16px; margin: 0; accent-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-invite-list > label > span:last-child { display: grid; min-width: 0; }
.dsh-chatroom-invite-list > label strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-invite-list > p { margin: 8px 0; color: var(--text-secondary, #6b7280); font-size: 12px; text-align: center; }
.dsh-chatroom-invite > button { border: 0; border-radius: 8px; background: var(--brand-primary, #4f7cff); padding: 9px 10px; color: #fff; font: inherit; font-size: 12px; cursor: pointer; }
.dsh-chatroom-invite > button:disabled { cursor: not-allowed; opacity: .45; }
.dsh-chatroom-manage-title { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-bottom: 14px; }
.dsh-chatroom-manage-title input { min-width: 0; border: 1px solid var(--border-primary, #d1d5db); border-radius: 9px; background: var(--bg-primary, #fff); color: var(--text-primary, #111827); padding: 8px 10px; font: inherit; }
.dsh-chatroom-manage-title button,
.dsh-chatroom-member-role { border: 1px solid var(--border-primary, #e5e7eb); border-radius: 8px; background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); padding: 6px 9px; font: inherit; font-size: 12px; cursor: pointer; }
.dsh-chatroom-manage-title button:disabled,
.dsh-chatroom-member-role:disabled { cursor: not-allowed; opacity: .45; }
.dsh-chatroom-auto-trigger {
  display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 14px;
  border: 1px solid var(--border-primary, #e5e7eb); border-radius: 12px; padding: 11px 12px;
}
.dsh-chatroom-auto-trigger > div { display: grid; gap: 3px; min-width: 0; }
.dsh-chatroom-auto-trigger small { color: var(--text-secondary, #6b7280); font-size: 12px; line-height: 18px; }
.dsh-chatroom-switch { position: relative; flex: 0 0 auto; width: 38px; height: 22px; cursor: pointer; }
.dsh-chatroom-switch input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.dsh-chatroom-switch span { display: block; width: 100%; height: 100%; border-radius: 999px; background: #cbd0d8; transition: background .16s; }
.dsh-chatroom-switch span::after { content: ""; display: block; width: 18px; height: 18px; border-radius: 50%; background: #fff; transform: translate(2px, 2px); transition: transform .16s; box-shadow: 0 1px 4px rgb(15 23 42 / 18%); }
.dsh-chatroom-switch input:checked + span { background: var(--brand-primary, #4f7cff); }
.dsh-chatroom-switch input:checked + span::after { transform: translate(18px, 2px); }
.dsh-chatroom-switch input:disabled + span { opacity: .5; }
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
.dsh-chatroom-member strong em { margin-left: 4px; color: var(--brand-primary, #4f7cff); font-size: 10px; font-style: normal; font-weight: 500; }
.dsh-chatroom-member small { color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-member > i { width: 8px; height: 8px; border-radius: 50%; background: #c4c9d1; }
.dsh-chatroom-member > i[data-online="true"] { background: #20b26b; box-shadow: 0 0 0 3px rgb(32 178 107 / 14%); }
.dsh-chatroom-member-avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(145deg, #eaf2ff, #cbdcff);
  font-size: 20px;
}
.dsh-chatroom-inline-avatar { display: inline-grid; width: 22px; height: 22px; place-items: center; overflow: hidden; border-radius: 7px; vertical-align: middle; }
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
  box-sizing: border-box;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 55;
  display: grid;
  grid-template-rows: auto 1fr auto;
  width: min(720px, 96vw);
  border-left: 1px solid var(--border-primary, light-dark(#e5e7eb, #343438));
  background: var(--bg-primary, light-dark(#fff, #151517));
  color: var(--text-primary, light-dark(#111827, #f9fafb));
  box-shadow: -18px 0 48px rgb(15 23 42 / 12%);
}
.dsh-chatroom-thread-panel[data-open="false"] { display: none; }
.dsh-chatroom-thread-frame-shell { position: relative; min-height: 0; }
.dsh-chatroom-thread-frame { display: block; width: 100%; height: 100%; border: 0; background: var(--bg-primary, light-dark(#fff, #151517)); }
.dsh-chatroom-thread-frame-status { position: absolute; inset: 0; display: grid; place-content: center; gap: 12px; background: var(--bg-primary, light-dark(#fff, #151517)); color: var(--text-secondary, light-dark(#6b7280, #aeb0b4)); font-size: 13px; text-align: center; }
.dsh-chatroom-thread-frame-status strong { color: var(--text-primary, light-dark(#111827, #f9fafb)); font-size: 14px; }
.dsh-chatroom-thread-frame-status small { color: var(--text-tertiary, light-dark(#9ca3af, #8e9095)); font-size: 11px; }
.dsh-chatroom-thread-frame-status button { border: 0; border-radius: 9px; background: var(--brand-primary, #4f7cff); color: #fff; padding: 8px 12px; font: inherit; cursor: pointer; }
.dsh-chatroom-thread-frame-error { display: grid; place-items: center; color: var(--text-secondary, light-dark(#6b7280, #aeb0b4)); }
.dsh-chatroom-thread-compatibility { display: grid; grid-template-rows: auto auto 1fr auto; min-height: 0; }
.dsh-chatroom-thread-compatibility-notice { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--border-primary, light-dark(#e5e7eb, #343438)); background: color-mix(in srgb, var(--brand-primary, #4f7cff) 6%, var(--bg-primary, light-dark(#fff, #151517))); padding: 9px 16px; color: var(--text-secondary, light-dark(#6b7280, #aeb0b4)); font-size: 12px; }
.dsh-chatroom-thread-compatibility-notice > span:last-child { display: flex; align-items: center; gap: 8px; flex: none; }
.dsh-chatroom-thread-compatibility-notice :is(a, button) { border: 0; border-radius: 8px; background: transparent; color: var(--brand-primary, #4f7cff); padding: 5px 7px; font: inherit; text-decoration: none; cursor: pointer; }
.dsh-chatroom-thread-compatibility-notice a { background: var(--brand-primary, #4f7cff); color: #fff; }
.dsh-chatroom-thread-panel > header { display: flex; align-items: center; justify-content: space-between; min-height: 64px; border-bottom: 1px solid var(--border-primary, light-dark(#e5e7eb, #343438)); background: var(--bg-primary, light-dark(#fff, #151517)); padding: 0 18px; }
.dsh-chatroom-thread-panel > header div { display: grid; gap: 2px; min-width: 0; }
.dsh-chatroom-thread-panel > header strong { font-size: 16px; }
.dsh-chatroom-thread-panel > header small { overflow: hidden; color: var(--text-secondary, light-dark(#6b7280, #aeb0b4)); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-thread-panel > header button { border: 0; background: transparent; color: var(--text-secondary, light-dark(#6b7280, #aeb0b4)); font: inherit; font-size: 25px; cursor: pointer; }
.dsh-chatroom-thread-root { display: grid; gap: 5px; margin: 14px 16px 4px; border-left: 3px solid var(--brand-primary, #4f7cff); border-radius: 0 10px 10px 0; background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent); padding: 10px 12px; }
.dsh-chatroom-thread-root strong { font-size: 12px; }
.dsh-chatroom-thread-root > div { color: var(--text-secondary, #6b7280); font-size: 13px; line-height: 1.5; }
.dsh-chatroom-thread-root p { margin: 0; }
.dsh-chatroom-thread-messages { overflow-y: auto; padding: 18px 24px 10px; }
.dsh-chatroom-thread-empty { margin: 18px; color: var(--text-secondary, #6b7280); font-size: 13px; line-height: 1.6; text-align: center; }
.dsh-chatroom-thread-message { position: relative; display: flex; align-items: flex-start; gap: 11px; margin-bottom: 20px; }
.dsh-chatroom-thread-message[data-dsh-chatroom-selection-mode="true"] { box-sizing: border-box; padding-left: 36px; }
.dsh-chatroom-thread-message[data-own="true"] { flex-direction: row-reverse; }
.dsh-chatroom-thread-message-column { display: grid; gap: 5px; width: fit-content; max-width: calc(100% - 54px); }
.dsh-chatroom-thread-message[data-own="true"] .dsh-chatroom-thread-message-column { justify-items: end; }
.dsh-chatroom-thread-message-column > strong { display: flex; gap: 7px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-thread-message time { font-weight: 400; opacity: .8; }
.dsh-chatroom-thread-message-body { max-width: 590px; border-radius: 5px 15px 15px; background: var(--bg-secondary, #f3f4f6); padding: 10px 13px; font-size: 14px; line-height: 1.58; overflow-wrap: anywhere; }
.dsh-chatroom-thread-message[data-own="true"] .dsh-chatroom-thread-message-body { border-radius: 15px 5px 15px 15px; background: color-mix(in srgb, var(--brand-primary, #4f7cff) 15%, var(--bg-primary, #fff)); }
.dsh-chatroom-thread-message[data-role="ai"] .dsh-chatroom-thread-message-body { border: 1px solid color-mix(in srgb, var(--brand-primary, #4f7cff) 25%, transparent); background: color-mix(in srgb, var(--brand-primary, #4f7cff) 6%, var(--bg-primary, #fff)); }
.dsh-chatroom-thread-message-body p:first-child { margin-top: 0; }
.dsh-chatroom-thread-message-body p:last-child { margin-bottom: 0; }
.dsh-chatroom-thread-literal-text { white-space: pre-wrap; }
.dsh-chatroom-thread-message-body :is(h1, h2, h3, h4) { margin: 1em 0 .45em; line-height: 1.3; }
.dsh-chatroom-thread-message-body h1 { font-size: 1.35em; }
.dsh-chatroom-thread-message-body h2 { font-size: 1.22em; }
.dsh-chatroom-thread-message-body h3 { font-size: 1.12em; }
.dsh-chatroom-thread-message-body :is(ul, ol) { margin: .55em 0; padding-left: 1.55em; }
.dsh-chatroom-thread-message-body li + li { margin-top: .22em; }
.dsh-chatroom-thread-message-body blockquote { margin: .7em 0; border-left: 3px solid var(--border-strong, #aeb5c0); padding-left: .8em; color: var(--text-secondary, #6b7280); }
.dsh-chatroom-thread-message-body :not(pre) > code { border-radius: 5px; background: color-mix(in srgb, var(--text-primary, #111827) 8%, transparent); padding: .12em .36em; font-size: .9em; }
.dsh-chatroom-thread-message-body pre { max-width: 100%; overflow-x: auto; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 10px; background: color-mix(in srgb, var(--text-primary, #111827) 6%, var(--bg-primary, #fff)); padding: 11px 13px; }
.dsh-chatroom-thread-message-body pre code { font-size: 12px; line-height: 1.55; white-space: pre; }
.dsh-chatroom-thread-message-body table { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; }
.dsh-chatroom-thread-message-body :is(th, td) { border: 1px solid var(--border-primary, #e5e7eb); padding: 6px 9px; text-align: left; }
.dsh-chatroom-thread-message-body a { color: var(--brand-primary, #4f7cff); text-decoration: underline; text-underline-offset: 2px; }
.dsh-chatroom-thread-reply-quote { display: grid; gap: 2px; max-width: 520px; border-left: 3px solid var(--brand-primary, #4f7cff); border-radius: 0 8px 8px 0; background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent); padding: 6px 9px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-thread-reply-quote span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-thread-composer { position: relative; display: grid; grid-template-columns: 1fr auto; gap: 8px; border-top: 1px solid var(--border-primary, #e5e7eb); padding: 12px 14px; }
.dsh-chatroom-thread-composer-reply { display: flex; grid-column: 1 / -1; align-items: center; gap: 8px; border-left: 3px solid var(--brand-primary, #4f7cff); border-radius: 0 8px 8px 0; background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent); padding: 7px 9px; }
.dsh-chatroom-thread-composer-reply span { display: flex; flex: 1; flex-direction: column; min-width: 0; overflow: hidden; color: var(--text-secondary, #6b7280); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-thread-composer-reply button { align-self: center; background: transparent; color: var(--text-secondary, #6b7280); padding: 2px 7px; }
.dsh-chatroom-thread-composer textarea { resize: none; border: 1px solid var(--border-primary, #d1d5db); border-radius: 12px; background: var(--bg-primary, #fff); color: var(--text-primary, #111827); padding: 10px 11px; font: inherit; outline: none; }
.dsh-chatroom-thread-composer textarea:focus { border-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-thread-composer button { align-self: end; border: 0; border-radius: 10px; background: var(--brand-primary, #4f7cff); color: #fff; padding: 10px 14px; font: inherit; font-weight: 600; cursor: pointer; }
.dsh-chatroom-thread-composer .dsh-chatroom-thread-composer-reply button { align-self: center; background: transparent; color: var(--text-secondary, #6b7280); padding: 2px 7px; }
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

.dsh-chatroom-pending-files {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.dsh-chatroom-reply-preview {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  margin: 8px 12px 0;
  border-radius: 8px;
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-secondary, #6b7280);
  padding: 6px 9px;
}

.dsh-chatroom-reply-preview > span { display: flex; flex: 1; align-items: baseline; min-width: 0; white-space: nowrap; }
.dsh-chatroom-reply-preview strong { flex: none; font-size: 12px; }
.dsh-chatroom-reply-preview small { overflow: hidden; color: inherit; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
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
.dsh-chatroom-thread-message[data-dsh-chatroom-selected="true"],
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
.dsh-chatroom-forward-text { white-space: pre-wrap; }
.dsh-chatroom-forward-image { display: block; width: min(100%, 360px); max-height: 320px; margin-top: 7px; border-radius: 10px; object-fit: contain; background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-forward-image-error { display: block; margin-top: 7px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-forward-reply { display: grid; gap: 2px; margin-top: 6px; border-left: 2px solid var(--brand-primary, #4f7cff); padding-left: 8px; color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-forward-reply span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-forward-reactions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 7px; }
.dsh-chatroom-forward-reactions span { border: 1px solid var(--border-primary, #e5e7eb); border-radius: 999px; padding: 2px 7px; font-size: 11px; }

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

.dsh-chatroom-auth-card { width: min(460px, calc(100vw - 32px)); padding: 32px; }
.dsh-chatroom-auth-card form, .dsh-chatroom-auth-card form > label { display: grid; gap: 7px; }
.dsh-chatroom-auth-card form { gap: 14px; }
.dsh-chatroom-auth-card input, .dsh-chatroom-admin-form input, .dsh-chatroom-admin-form select {
  width: 100%; box-sizing: border-box; border: 1px solid var(--border-primary, #d8dee9); border-radius: 10px;
  background: var(--bg-primary, #fff); padding: 10px 12px; color: var(--text-primary, #111827); font: inherit;
}
.dsh-chatroom-auth-brand { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid var(--border-primary, #e5e7eb); padding-bottom: 16px; }
.dsh-chatroom-auth-brand strong { font-size: 18px; }
.dsh-chatroom-auth-brand span, .dsh-chatroom-sso-list > span { color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-auth-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 14px; border-radius: 11px; background: var(--bg-secondary, #f3f4f6); padding: 4px; }
.dsh-chatroom-auth-tabs button { border: 0; border-radius: 8px; background: transparent; padding: 8px; font: inherit; cursor: pointer; }
.dsh-chatroom-auth-tabs button[data-active="true"] { background: var(--bg-primary, #fff); box-shadow: 0 1px 4px rgb(15 23 42 / 10%); }
.dsh-chatroom-sso-list { display: grid; gap: 8px; margin-top: 18px; text-align: center; }
.dsh-chatroom-sso-list a { border: 1px solid var(--border-primary, #d8dee9); border-radius: 10px; padding: 10px; color: var(--text-primary, #111827); text-decoration: none; }
.dsh-chatroom-card-footer > div { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }

.dsh-chatroom-settings {
  display: flex; min-width: 0; max-width: 720px; flex-direction: column; gap: 20px; width: 100%; box-sizing: border-box;
  padding-bottom: 32px; overflow-x: clip; color: var(--dsw-alias-label-primary);
}
.dsh-chatroom-settings-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.dsh-chatroom-settings-header > div { min-width: 0; }
.dsh-chatroom-settings-header h2, .dsh-chatroom-settings-header p { margin: 0; }
.dsh-chatroom-settings-header h2 { font-size: 16px; line-height: 24px; font-weight: 500; }
.dsh-chatroom-settings-header p { margin-top: 2px; color: var(--dsw-alias-label-tertiary); font-size: 14px; line-height: 22px; }
.dsh-chatroom-settings-header button {
  flex: none; height: 36px; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 18px;
  background: transparent; padding: 0 14px; color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; cursor: pointer;
}
.dsh-chatroom-settings-header button:hover { background: var(--dsw-alias-interactive-bg-hover-solid); }

.dsh-chatroom-account-layer { z-index: 255; }
.dsh-chatroom-account-card { width: min(460px, calc(100vw - 32px)); padding: 0; overflow: hidden; }
.dsh-chatroom-account-card > header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-primary, #e5e7eb); padding: 18px 22px; }
.dsh-chatroom-account-card > header h2, .dsh-chatroom-account-card > header p { margin: 0; }
.dsh-chatroom-account-card > header p { margin-top: 3px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-account-card > header button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); font-size: 25px; cursor: pointer; }
.dsh-chatroom-account-card > form { margin: 20px 22px; }
.dsh-chatroom-account-card > .dsh-chatroom-error { margin: 0 22px 20px; }

.dsh-chatroom-admin-layer { z-index: 260; }
.dsh-chatroom-admin-card { width: min(1080px, calc(100vw - 40px)); max-height: calc(100vh - 40px); padding: 0; overflow: hidden; }
.dsh-chatroom-admin-card > header, .dsh-chatroom-direct-panel > header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-primary, #e5e7eb); padding: 18px 22px; }
.dsh-chatroom-admin-card > header h2, .dsh-chatroom-admin-card > header p { margin: 0; }
.dsh-chatroom-admin-card > header p { margin-top: 3px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-admin-card > header button, .dsh-chatroom-direct-panel > header button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); font-size: 25px; cursor: pointer; }
.dsh-chatroom-admin-layout { display: grid; grid-template-columns: minmax(280px, .8fr) minmax(360px, 1.2fr); gap: 22px; max-height: calc(100vh - 122px); overflow-y: auto; padding: 20px 22px 28px; }
.dsh-chatroom-admin-layout section { min-width: 0; }
.dsh-chatroom-admin-layout h3 { margin: 10px 0 12px; font-size: 15px; }
.dsh-chatroom-admin-form { display: grid; gap: 9px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 13px; padding: 13px; }
.dsh-chatroom-admin-form > button, .dsh-chatroom-user-table button, .dsh-chatroom-provider-list button { border: 0; border-radius: 8px; background: var(--brand-primary, #4f7cff); padding: 8px 10px; color: #fff; font: inherit; cursor: pointer; }
.dsh-chatroom-toggle { display: flex; align-items: center; gap: 8px; color: var(--text-secondary, #6b7280); font-size: 13px; }
.dsh-chatroom-toggle input { width: auto; }
.dsh-chatroom-mini-avatars { display: flex; flex-wrap: wrap; gap: 4px; }
.dsh-chatroom-mini-avatars button { width: 31px; height: 31px; border: 1px solid transparent; border-radius: 8px; background: var(--bg-secondary, #f3f4f6); cursor: pointer; }
.dsh-chatroom-mini-avatars button[data-selected="true"] { border-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-user-table, .dsh-chatroom-provider-list { display: grid; gap: 7px; }
.dsh-chatroom-user-table > div { display: grid; grid-template-columns: 36px minmax(110px, 1fr) 118px auto; align-items: center; gap: 8px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 11px; padding: 8px 10px; }
.dsh-chatroom-user-table > div[data-disabled="true"] { opacity: .55; }
.dsh-chatroom-user-table > div > span:first-child { display: grid; place-items: center; width: 34px; height: 34px; overflow: hidden; border-radius: 9px; background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-user-table > div > span:nth-child(2) { display: grid; }
.dsh-chatroom-user-table small, .dsh-chatroom-provider-list small { color: var(--text-secondary, #6b7280); }
.dsh-chatroom-user-table select { min-width: 0; border: 1px solid var(--border-primary, #d8dee9); border-radius: 8px; background: var(--bg-primary, #fff); padding: 7px; }
.dsh-chatroom-user-table button, .dsh-chatroom-provider-list button { background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); }
.dsh-chatroom-provider-section { grid-column: 1 / -1; }
.dsh-chatroom-admin-field { display: grid; gap: 7px; max-width: 520px; color: var(--text-secondary, #6b7280); font-size: 13px; }
.dsh-chatroom-admin-field select { border: 1px solid var(--border-primary, #d8dee9); border-radius: 9px; background: var(--bg-primary, #fff); padding: 9px 11px; color: var(--text-primary, #111827); font: inherit; }
.dsh-chatroom-provider-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.dsh-chatroom-provider-form > button { grid-column: 1 / -1; }
.dsh-chatroom-callback { overflow-wrap: anywhere; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-provider-list { margin-top: 10px; }
.dsh-chatroom-provider-list > div { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 8px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 10px; padding: 9px 11px; }
.dsh-chatroom-provider-list span { display: grid; overflow: hidden; }
.dsh-chatroom-provider-list small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-panel-status { padding: 40px; color: var(--text-secondary, #6b7280); text-align: center; }

/* Native Settings section: one bounded column, the same label hierarchy,
   module fills, hairlines, and capsule actions as Models and Agent presets. */
.dsh-chatroom-settings > .dsh-chatroom-card {
  position: static; width: 100%; min-width: 0; max-height: none; box-sizing: border-box; border: 0; border-radius: 0;
  background: transparent; padding: 0; color: var(--dsw-alias-label-primary); box-shadow: none; overflow: visible;
}
.dsh-chatroom-settings .dsh-chatroom-automation-card > header,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header {
  border-bottom: 1px solid var(--dsw-alias-border-l2); padding-bottom: 12px;
}
.dsh-chatroom-settings .dsh-chatroom-automation-card > header h2,
.dsh-chatroom-settings .dsh-chatroom-automation-card > header p,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header h2,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header p { margin: 0; }
.dsh-chatroom-settings .dsh-chatroom-automation-card > header h2,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header h2 { font-size: 14px; line-height: 22px; font-weight: 500; }
.dsh-chatroom-settings .dsh-chatroom-automation-card > header p,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header p { margin-top: 1px; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.dsh-chatroom-automation-form { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 10px; padding-top: 12px; }
.dsh-chatroom-automation-form label { display: grid; gap: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.dsh-chatroom-automation-form select { min-width: 0; height: 38px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); padding: 0 10px; font: inherit; }
.dsh-chatroom-automation-form button { height: 38px; border: 0; border-radius: 9px; background: var(--dsw-alias-brand-primary); color: #fff; padding: 0 14px; font: inherit; cursor: pointer; }
.dsh-chatroom-automation-form button:disabled { cursor: default; opacity: .4; }
.dsh-chatroom-automation-form > small { grid-column: 1 / -1; color: var(--dsw-alias-label-tertiary); }
.dsh-chatroom-prompt-form { display: grid; gap: 14px; padding-top: 12px; }
.dsh-chatroom-prompt-form label { display: grid; gap: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.dsh-chatroom-prompt-form textarea {
  width: 100%; min-height: 116px; resize: vertical; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px;
  background: var(--dsw-alias-bg-layer-1); padding: 10px 11px; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; line-height: 20px; outline: none;
}
.dsh-chatroom-prompt-form textarea:focus { border-color: var(--dsw-alias-label-primary); box-shadow: 0 0 0 1px var(--dsw-alias-label-primary); }
.dsh-chatroom-prompt-form label small,
.dsh-chatroom-prompt-card > small { color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.dsh-chatroom-prompt-form > button {
  justify-self: start; height: 36px; border: 0; border-radius: 18px; background: var(--dsw-alias-button-primary-fill); padding: 0 15px;
  color: var(--dsw-alias-label-primary-foreground); font: inherit; font-size: 14px; cursor: pointer;
}
.dsh-chatroom-prompt-form > button:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
.dsh-chatroom-prompt-form > button:disabled { cursor: default; opacity: .4; }
.dsh-chatroom-settings .dsh-chatroom-account-card > header,
.dsh-chatroom-settings .dsh-chatroom-admin-card > header {
  align-items: flex-start; border: 0; border-bottom: 1px solid var(--dsw-alias-border-l2); padding: 0 0 12px;
}
.dsh-chatroom-settings .dsh-chatroom-account-card > header h2,
.dsh-chatroom-settings .dsh-chatroom-admin-card > header h2 {
  margin: 0; color: var(--dsw-alias-label-primary); font-size: 14px; line-height: 22px; font-weight: 500;
}
.dsh-chatroom-settings .dsh-chatroom-account-card > header p,
.dsh-chatroom-settings .dsh-chatroom-admin-card > header p {
  margin: 1px 0 0; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px;
}
.dsh-chatroom-settings .dsh-chatroom-account-card > form {
  margin: 12px 0 0;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout {
  display: flex; max-height: none; flex-direction: column; gap: 28px; overflow: visible; padding: 16px 0 0;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout > section {
  display: flex; min-width: 0; flex-direction: column; gap: 10px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout > section + section {
  border-top: 1px solid var(--dsw-alias-border-l2); padding-top: 24px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout h3 {
  margin: 0; color: var(--dsw-alias-label-primary); font-size: 14px; line-height: 22px; font-weight: 500;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout h3:not(:first-child) { margin-top: 10px; }
.dsh-chatroom-settings .dsh-chatroom-admin-form {
  display: grid; min-width: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 14px; border: 0;
  border-radius: 12px; background: var(--dsw-alias-bg-module-platform); padding: 14px 16px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-form > label:not(.dsh-chatroom-toggle) {
  display: flex; min-width: 0; flex-direction: column; gap: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 18px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-form input:not([type="checkbox"]),
.dsh-chatroom-settings .dsh-chatroom-admin-form select,
.dsh-chatroom-settings .dsh-chatroom-admin-field select,
.dsh-chatroom-settings .dsh-chatroom-user-table select {
  width: 100%; min-width: 0; height: 36px; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px;
  background: var(--dsw-alias-bg-layer-3); padding: 0 11px; color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; outline: none;
}
.dsh-chatroom-settings .dsh-chatroom-admin-form input:focus,
.dsh-chatroom-settings .dsh-chatroom-admin-form select:focus,
.dsh-chatroom-settings .dsh-chatroom-admin-field select:focus,
.dsh-chatroom-settings .dsh-chatroom-user-table select:focus {
  border-color: var(--dsw-alias-label-primary); box-shadow: 0 0 0 1px var(--dsw-alias-label-primary);
}
.dsh-chatroom-settings .dsh-chatroom-admin-form > button {
  justify-self: start; min-width: 92px; height: 36px; box-sizing: border-box; border: 0; border-radius: 18px;
  background: var(--dsw-alias-button-primary-fill); padding: 0 14px; color: var(--dsw-alias-label-primary-foreground); font: inherit; font-size: 14px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-form > button:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
.dsh-chatroom-settings .dsh-chatroom-admin-form > button:disabled { cursor: default; opacity: .4; }
.dsh-chatroom-settings .dsh-chatroom-toggle {
  min-width: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 20px;
}
.dsh-chatroom-settings .dsh-chatroom-toggle input { accent-color: var(--dsw-alias-brand-primary); }
.dsh-chatroom-settings-avatar-field { min-width: 0; margin: 0; border: 0; padding: 0; }
.dsh-chatroom-settings-avatar-field legend { margin-bottom: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 18px; }
.dsh-chatroom-settings .dsh-chatroom-mini-avatars button {
  border-radius: 8px; background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary);
}
.dsh-chatroom-settings .dsh-chatroom-mini-avatars button[data-selected="true"] {
  border-color: var(--dsw-alias-brand-primary); box-shadow: 0 0 0 1px var(--dsw-alias-brand-primary);
}
.dsh-chatroom-settings .dsh-chatroom-user-table,
.dsh-chatroom-settings .dsh-chatroom-provider-list { gap: 8px; }
.dsh-chatroom-settings .dsh-chatroom-user-table > div,
.dsh-chatroom-settings .dsh-chatroom-provider-list > div {
  min-width: 0; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px;
  background: transparent; padding: 10px 12px;
}
.dsh-chatroom-settings .dsh-chatroom-user-table > div {
  grid-template-columns: 36px minmax(0, 1fr) auto;
}
.dsh-chatroom-settings .dsh-chatroom-user-table > div > span:first-child { background: var(--dsw-alias-bg-module-platform); }
.dsh-chatroom-settings .dsh-chatroom-user-table > div > span:nth-child(2) { min-width: 0; }
.dsh-chatroom-settings .dsh-chatroom-user-table strong,
.dsh-chatroom-settings .dsh-chatroom-provider-list strong { font-size: 14px; line-height: 22px; font-weight: 500; }
.dsh-chatroom-settings .dsh-chatroom-user-table small,
.dsh-chatroom-settings .dsh-chatroom-provider-list small { color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.dsh-chatroom-user-actions, .dsh-chatroom-provider-actions { display: flex; align-items: center; gap: 6px; }
.dsh-chatroom-settings .dsh-chatroom-user-actions select { width: 118px; }
.dsh-chatroom-settings .dsh-chatroom-user-actions button,
.dsh-chatroom-settings .dsh-chatroom-provider-actions button {
  height: 28px; box-sizing: border-box; border: 0; border-radius: 14px; background: transparent; padding: 0 10px;
  color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; cursor: pointer;
}
.dsh-chatroom-settings .dsh-chatroom-user-actions button:hover,
.dsh-chatroom-settings .dsh-chatroom-provider-actions button:hover { background: var(--dsw-alias-interactive-bg-hover-solid); }
.dsh-chatroom-settings .dsh-chatroom-admin-field { max-width: none; color: var(--dsw-alias-label-secondary); }
.dsh-chatroom-settings .dsh-chatroom-callback {
  margin: 0; overflow-wrap: anywhere; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px;
}
.dsh-chatroom-settings .dsh-chatroom-callback code { color: var(--dsw-alias-label-secondary); }
.dsh-chatroom-settings .dsh-chatroom-provider-section { grid-column: auto; }
.dsh-chatroom-settings .dsh-chatroom-provider-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.dsh-chatroom-settings .dsh-chatroom-provider-form > button { grid-column: 1 / -1; }
.dsh-chatroom-settings .dsh-chatroom-provider-list > div { grid-template-columns: minmax(0, 1fr) auto; }
.dsh-chatroom-settings .dsh-chatroom-provider-list span { min-width: 0; }
.dsh-chatroom-settings .dsh-chatroom-provider-list small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-settings > .dsh-chatroom-error { color: var(--dsw-alias-state-error-primary); }

[data-dsh-chatroom-direct-host] { position: relative !important; overflow: hidden !important; }
[data-dsh-chatroom-direct-host] > :not(.dsh-chatroom-direct-panel) { visibility: hidden !important; pointer-events: none !important; }
.dsh-chatroom-direct-panel {
  position: fixed;
  z-index: 250;
  inset: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-width: 0;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
}
[data-dsh-chatroom-direct-host] > .dsh-chatroom-direct-panel { position: absolute; z-index: 5; }
.dsh-chatroom-direct-panel > header {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  min-height: 68px;
  border-bottom: 1px solid var(--border-primary, #e5e7eb);
  padding: 0 24px;
}
.dsh-chatroom-direct-panel > header > div { display: grid; gap: 1px; }
.dsh-chatroom-direct-panel > header strong { font-size: 15px; }
.dsh-chatroom-direct-panel > header small { overflow: hidden; color: var(--text-secondary, #6b7280); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-direct-panel > header button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); font-size: 25px; cursor: pointer; }
.dsh-chatroom-direct-header-avatar,
.dsh-chatroom-direct-message-avatar { display: grid; place-items: center; overflow: hidden; background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-direct-header-avatar { width: 38px; height: 38px; border-radius: 11px; }
.dsh-chatroom-direct-message-avatar { flex: 0 0 38px; width: 38px; height: 38px; border-radius: 12px; }
.dsh-chatroom-direct-header-avatar img,
.dsh-chatroom-direct-message-avatar img { width: 100%; height: 100%; object-fit: cover; }
.dsh-chatroom-direct-messages {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  min-height: 0;
  flex-direction: column;
  gap: 22px;
  overflow-y: auto;
  padding: 30px max(24px, calc((100% - 920px) / 2)) 120px;
}
.dsh-chatroom-direct-messages article { display: flex; align-items: flex-start; gap: 10px; max-width: min(76%, 720px); }
.dsh-chatroom-direct-messages article[data-own="true"] { align-self: flex-end; flex-direction: row-reverse; text-align: right; }
.dsh-chatroom-direct-messages article > div { display: grid; min-width: 0; }
.dsh-chatroom-direct-messages article strong,
.dsh-chatroom-direct-messages article time { color: var(--text-secondary, #6b7280); font-size: 11px; font-weight: 500; }
.dsh-chatroom-direct-messages article p {
  margin: 4px 0;
  border-radius: 16px;
  background: var(--bg-secondary, #f3f4f6);
  padding: 10px 14px;
  color: var(--text-primary, #111827);
  text-align: left;
  white-space: pre-wrap;
}
.dsh-chatroom-direct-messages article[data-own="true"] p { background: color-mix(in srgb, var(--brand-primary, #4f7cff) 14%, var(--bg-primary, #fff)); }
.dsh-chatroom-direct-media { display: grid; gap: 8px; margin: 4px 0; }
.dsh-chatroom-direct-media > a:not(.dsh-chatroom-direct-file) { display: block; overflow: hidden; border-radius: 14px; }
.dsh-chatroom-direct-media img { display: block; max-width: min(420px, 100%); max-height: 340px; object-fit: contain; }
.dsh-chatroom-direct-file {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-width: min(320px, 65vw);
  border: 1px solid var(--border-primary, #dfe3ea);
  border-radius: 13px;
  background: var(--bg-primary, #fff);
  padding: 10px 12px;
  color: var(--text-primary, #111827);
  text-align: left;
  text-decoration: none;
}
.dsh-chatroom-direct-file > span:nth-child(2) { display: grid; min-width: 0; }
.dsh-chatroom-direct-file strong { overflow: hidden; color: inherit !important; font-size: 13px !important; font-weight: 600 !important; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-direct-file small { color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-direct-composer {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  box-sizing: border-box;
  width: min(920px, calc(100% - 48px));
  min-height: 112px;
  margin: 0 auto 18px;
  border: 1px solid var(--border-primary, #dfe3ea);
  border-radius: 22px;
  background: var(--bg-primary, #fff);
  box-shadow: 0 8px 28px rgb(15 23 42 / 8%);
  padding: 13px 14px 10px 18px;
}
.dsh-chatroom-direct-composer textarea { width: 100%; min-height: 52px; resize: none; border: 0; outline: 0; background: transparent; padding: 4px 0; color: var(--text-primary, #111827); font: inherit; line-height: 1.5; }
.dsh-chatroom-direct-pending-files { display: flex; min-width: 0; flex-wrap: wrap; gap: 6px; }
.dsh-chatroom-direct-pending-files > span { display: inline-flex; max-width: 260px; align-items: center; gap: 5px; border-radius: 8px; background: var(--bg-secondary, #f3f4f6); padding: 5px 7px; font-size: 12px; }
.dsh-chatroom-direct-pending-files > span > span:nth-child(2) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-direct-pending-files button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); cursor: pointer; }
.dsh-chatroom-direct-composer-tools { display: flex; position: relative; align-items: center; gap: 6px; }
.dsh-chatroom-direct-composer-tools > button,
.dsh-chatroom-direct-emoji-root > button { border: 0; border-radius: 9px; background: transparent; padding: 7px 8px; color: var(--text-secondary, #6b7280); font: inherit; font-size: 13px; cursor: pointer; }
.dsh-chatroom-direct-composer-tools > button:hover,
.dsh-chatroom-direct-emoji-root > button:hover { background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); }
.dsh-chatroom-direct-composer-tools > input { display: none; }
.dsh-chatroom-direct-composer-tools > small { margin-left: 4px; color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-direct-emoji-root { position: relative; }
.dsh-chatroom-direct-emoji-picker {
  position: absolute;
  z-index: 20;
  bottom: calc(100% + 8px);
  left: 0;
  display: grid;
  grid-template-columns: repeat(6, 34px);
  gap: 3px;
  border: 1px solid var(--border-primary, #dfe3ea);
  border-radius: 13px;
  background: var(--bg-primary, #fff);
  box-shadow: 0 12px 38px rgb(15 23 42 / 14%);
  padding: 8px;
}
.dsh-chatroom-direct-emoji-picker button { display: grid; width: 34px; height: 34px; place-items: center; border: 0; border-radius: 8px; background: transparent; font-size: 20px; cursor: pointer; }
.dsh-chatroom-direct-emoji-picker button:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-direct-composer-tools .dsh-chatroom-direct-send {
  display: grid;
  width: 42px;
  height: 42px;
  margin-left: auto;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: var(--brand-primary, #4f7cff);
  padding: 0;
  color: #fff;
  font: inherit;
  font-size: 24px;
  cursor: pointer;
}
.dsh-chatroom-direct-composer-tools .dsh-chatroom-direct-send:hover { background: var(--brand-primary, #4f7cff); color: #fff; }
.dsh-chatroom-direct-composer button:disabled { opacity: .45; cursor: not-allowed; }
.dsh-chatroom-direct-empty { display: grid; place-items: center; min-height: 0; color: var(--text-secondary, #6b7280); }
.dsh-chatroom-direct-panel > .dsh-chatroom-error { margin: 0 24px 16px; }

html[data-dsh-chatroom-branch-frame] [data-shell-overlay] { display: none !important; }
html[data-dsh-chatroom-active] [data-conversation-scroll] {
  --dsh-chat-content-width: 100%;
  --dsh-composer-card-max-width: 100%;
  --dsh-composer-side-clearance: clamp(8px, 1.2vw, 16px);
}
html[data-dsh-chatroom-active] [data-time-hover-root] > :last-child > button { display: none !important; }
html[data-dsh-chatroom-branch-frame] [data-dsh-chatroom-branch-shell] {
  grid-template-columns: 0 minmax(0, 1fr) 0 !important;
}
html[data-dsh-chatroom-branch-frame] [data-dsh-chatroom-branch-shell] > :first-child,
html[data-dsh-chatroom-branch-frame] [data-dsh-chatroom-branch-shell] > :nth-child(3),
html[data-dsh-chatroom-branch-frame] [data-dsh-chatroom-branch-shell] > [data-side] { display: none !important; }
html[data-dsh-chatroom-branch-frame] [data-dsh-chatroom-branch-shell] > :nth-child(2) {
  grid-column: 2 !important;
  min-width: 0;
}

@media (max-width: 640px) {
  [data-dsh-chatroom-branch-row] {
    min-height: 44px !important;
    height: 44px !important;
    margin-inline-start: 18px !important;
  }
  [data-dsh-chatroom-branch-marker] {
    flex-basis: 20px;
    width: 20px;
    height: 20px;
    margin-right: 5px;
  }
  [data-dsh-chatroom-branch-badge] { padding-inline: 4px; }
  [data-dsh-chatroom-branch-parent] { font-size: 10px; }
  .dsh-chatroom-group-setup-collapsed { grid-template-columns: 38px minmax(0, 1fr); }
  .dsh-chatroom-group-setup-collapsed > button { grid-column: 1 / -1; width: 100%; }
  .dsh-chatroom-group-setup-fields,
  .dsh-chatroom-group-setup-list { grid-template-columns: 1fr; }
  .dsh-chatroom-avatar-grid { grid-template-columns: repeat(4, 1fr); }
  .dsh-chatroom-avatar { flex-basis: 34px; width: 34px; height: 34px; font-size: 19px; }
  .dsh-chatroom-message-column { max-width: calc(100% - 44px); }
  .dsh-chatroom-context-menu { width: 216px; }
  .dsh-chatroom-selection-bar { bottom: 84px; width: calc(100vw - 28px); justify-content: center; }
  .dsh-chatroom-action-label { display: none; }
  .dsh-chatroom-message-actions > button,
  .dsh-chatroom-inline-reaction-control > button { min-width: 30px; min-height: 30px; font-size: 14px; }
  .dsh-chatroom-thread-panel { width: 100vw; box-shadow: none; }
  .dsh-chatroom-member-card { width: 100vw; box-shadow: none; }
  .dsh-chatroom-thread-panel > header { min-height: 54px; padding: 0 12px; }
  .dsh-chatroom-action-overflow {
    position: fixed;
    right: 12px;
    bottom: 72px;
    left: 12px;
    min-width: 0;
    border-radius: 16px;
    padding: 8px;
    box-shadow: 0 18px 54px rgb(15 23 42 / 26%);
  }
  .dsh-chatroom-inline-reactions { justify-content: space-around; }
  .dsh-chatroom-admin-card { width: 100vw; max-height: 100vh; border-radius: 0; }
  .dsh-chatroom-settings > .dsh-chatroom-admin-card { width: 100%; max-height: none; border-radius: 14px; }
  .dsh-chatroom-admin-layout { grid-template-columns: 1fr; max-height: calc(100vh - 82px); }
  .dsh-chatroom-provider-section { grid-column: auto; }
  .dsh-chatroom-provider-form { grid-template-columns: 1fr; }
  .dsh-chatroom-provider-form > button { grid-column: auto; }
  .dsh-chatroom-user-table > div { grid-template-columns: 34px 1fr auto; }
  .dsh-chatroom-user-table select { grid-column: 2; }
  .dsh-chatroom-settings-header { flex-direction: column; }
  .dsh-chatroom-settings .dsh-chatroom-admin-form,
  .dsh-chatroom-settings .dsh-chatroom-provider-form { grid-template-columns: 1fr; }
  .dsh-chatroom-settings .dsh-chatroom-provider-form > button { grid-column: auto; }
  .dsh-chatroom-settings .dsh-chatroom-user-table > div { grid-template-columns: 34px minmax(0, 1fr); }
  .dsh-chatroom-settings .dsh-chatroom-user-actions { grid-column: 2; flex-wrap: wrap; }
  .dsh-chatroom-settings .dsh-chatroom-provider-list > div { grid-template-columns: 1fr; }
  .dsh-chatroom-settings .dsh-chatroom-provider-actions { justify-content: flex-end; }
  .dsh-chatroom-direct-messages { padding-inline: 16px; }
  .dsh-chatroom-direct-messages article { max-width: 88%; }
  .dsh-chatroom-direct-composer { width: calc(100% - 24px); margin-bottom: 10px; }
}
`
