const RESTORE_DRAFT_EVENT = 'dsh-chatroom:restore-draft'

interface RestoreDraftDetail {
  readonly sessionId: string
  readonly text: string
}

/** Ask the mounted native composer for one Session to restore editable text. */
export function restoreChatroomDraft(sessionId: string, text: string): void {
  globalThis.dispatchEvent(new CustomEvent<RestoreDraftDetail>(RESTORE_DRAFT_EVENT, {
    detail: { sessionId, text },
  }))
}

/** Subscribe a native composer to draft restorations initiated from message controls. */
export function subscribeChatroomDraftRestore(
  sessionId: string,
  restore: (text: string) => void,
): () => void {
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<RestoreDraftDetail>).detail
    if (detail?.sessionId === sessionId) restore(detail.text)
  }
  globalThis.addEventListener(RESTORE_DRAFT_EVENT, listener)
  return () => { globalThis.removeEventListener(RESTORE_DRAFT_EVENT, listener) }
}
