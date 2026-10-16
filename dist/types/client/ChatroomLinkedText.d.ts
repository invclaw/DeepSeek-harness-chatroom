/** One HTTP URL and its location in visible message text. */
export interface ChatroomTextLink {
    readonly url: string;
    readonly start: number;
    readonly end: number;
}
/** Find safe HTTP links while leaving trailing sentence punctuation outside anchors. */
export declare function chatroomTextLinks(text: string): readonly ChatroomTextLink[];
/** Render participant text with real anchors while preserving whitespace. */
export declare function ChatroomLinkedText({ text, className }: {
    readonly text: string;
    readonly className?: string;
}): JSX.Element;
/** Render cards for every Tencent Docs link not already represented by a durable card. */
export declare function ChatroomDocumentLinkCards({ text, existingUrls }: {
    readonly text: string;
    readonly existingUrls?: readonly string[];
}): JSX.Element | null;
//# sourceMappingURL=ChatroomLinkedText.d.ts.map