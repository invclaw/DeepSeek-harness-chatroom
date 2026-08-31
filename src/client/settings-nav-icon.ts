/**
 * Mark the Chatroom settings row so its native fallback gear can be replaced
 * by the group icon in styles.ts. The DSH 0.1.x settings.section contract
 * carries no icon field, so this small DOM adapter is intentionally scoped to
 * the dialog navigation and tears down with the plugin fiber.
 */

export const CHATROOM_SETTINGS_NAV_MARKER = 'data-dsh-chatroom-settings-nav'

/**
 * Keep the marker on the settings button whose visible label belongs to this
 * plugin. The label resolver is evaluated on every DOM/locale update so a
 * dialog mounted later or a live language switch is handled automatically.
 */
export function registerChatroomSettingsNavIcon(label: () => string): () => void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return () => undefined

  let disposed = false
  const sync = (): void => {
    if (disposed) return
    const currentLabel = label().trim()
    const buttons = document.querySelectorAll<HTMLButtonElement>('[role="dialog"] nav button')
    for (const button of buttons) {
      const matches = currentLabel.length > 0 && button.textContent?.trim() === currentLabel
      if (matches) button.setAttribute(CHATROOM_SETTINGS_NAV_MARKER, '')
      else button.removeAttribute(CHATROOM_SETTINGS_NAV_MARKER)
    }
  }

  sync()
  const observer = new MutationObserver(sync)
  observer.observe(document.body ?? document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  })

  return () => {
    disposed = true
    observer.disconnect()
    document.querySelectorAll(`[${CHATROOM_SETTINGS_NAV_MARKER}]`).forEach(element => {
      element.removeAttribute(CHATROOM_SETTINGS_NAV_MARKER)
    })
  }
}
