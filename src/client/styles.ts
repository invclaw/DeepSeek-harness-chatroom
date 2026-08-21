/** Scoped stylesheet for the frame overlay; colors and type follow Harness theme tokens. */
export const CHATROOM_STYLES = String.raw`
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
`
