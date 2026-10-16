/**
 * Mark the Chatroom settings row so its native fallback gear can be replaced
 * by the group icon in styles.ts. The DSH 0.1.x settings.section contract
 * carries no icon field, so this small DOM adapter is intentionally scoped to
 * the dialog navigation and tears down with the plugin fiber.
 */
export declare const CHATROOM_SETTINGS_NAV_MARKER = "data-dsh-chatroom-settings-nav";
/**
 * Keep the marker on the settings button whose visible label belongs to this
 * plugin. The label resolver is evaluated on every DOM/locale update so a
 * dialog mounted later or a live language switch is handled automatically.
 */
export declare function registerChatroomSettingsNavIcon(label: () => string): () => void;
//# sourceMappingURL=settings-nav-icon.d.ts.map