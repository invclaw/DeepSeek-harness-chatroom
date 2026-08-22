import { type MouseEvent as ReactMouseEvent } from 'react';
import { type ChatroomReactionEmoji } from '../reactions.js';
import type { ChatroomForwardItem, ChatroomIdentity, ChatroomReaction } from '../types.js';
export interface ChatroomMessageToolsProps {
    readonly roomId: string;
    readonly message: ChatroomForwardItem;
    readonly reactions: readonly ChatroomReaction[];
    readonly identity: ChatroomIdentity | undefined;
    readonly selected: boolean;
    toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void>;
    openForward(roomId: string, message: ChatroomForwardItem): void;
    toggleSelection(roomId: string, message: ChatroomForwardItem): void;
}
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