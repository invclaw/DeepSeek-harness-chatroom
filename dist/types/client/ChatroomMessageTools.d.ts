import { type MouseEvent as ReactMouseEvent } from 'react';
import { type ChatroomReactionEmoji } from '../reactions.js';
import type { ChatroomForwardItem, ChatroomIdentity, ChatroomReaction } from '../types.js';
/** Compact copy action with transient success feedback. */
export declare function ChatroomCopyButton({ text }: {
    readonly text: string;
}): JSX.Element | null;
export interface ChatroomMessageToolsProps {
    readonly roomId: string;
    readonly message: ChatroomForwardItem;
    readonly reactions: readonly ChatroomReaction[];
    readonly identity: ChatroomIdentity | undefined;
    readonly selecting: boolean;
    readonly selected: boolean;
    readonly recalled: boolean;
    readonly canRecall: boolean;
    readonly copyText?: string;
    readonly onReply?: (() => void) | undefined;
    readonly onBranch?: (() => void) | undefined;
    toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void>;
    openForward(roomId: string, message: ChatroomForwardItem): void;
    toggleSelection(roomId: string, message: ChatroomForwardItem): void;
    recallMessage(roomId: string, messageId: string): Promise<boolean>;
}
/** Capability-driven actions reused by main-room and branch message rows. */
export declare function ChatroomInlineMessageActions({ tools, }: {
    readonly tools: ChatroomMessageToolsProps;
}): JSX.Element | null;
/** Checkbox shown on every message while the room is in multi-select mode. */
export declare function ChatroomSelectionCheckbox({ tools }: {
    tools: ChatroomMessageToolsProps;
}): JSX.Element | null;
/** Local context-menu state for one native message row. */
export declare function useChatroomMessageMenu(): {
    readonly position: {
        x: number;
        y: number;
    } | undefined;
    open(event: MouseEvent | ReactMouseEvent): void;
    close(): void;
};
/** Persisted reaction chips shown below one message. */
export declare function ChatroomReactionBar(props: ChatroomMessageToolsProps): JSX.Element | null;
/** Right-click menu shared by human and AI messages. */
export declare function ChatroomMessageContextMenu({ tools, position, close, }: {
    tools: ChatroomMessageToolsProps;
    position: {
        x: number;
        y: number;
    } | undefined;
    close(): void;
}): JSX.Element | null;
//# sourceMappingURL=ChatroomMessageTools.d.ts.map