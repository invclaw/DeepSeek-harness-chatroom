import type { PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots';
import type { SessionReference } from '@deepseek-ai/dsh-api-session-controller/client';
import type { ChatroomForwardItem, ChatroomReplyReference, ChatroomSearchResult } from '../types.js';
import type { ChatroomReactionEmoji } from '../reactions.js';
import { type ChatroomAccountPanelProps } from './ChatroomAccountPanels.js';
interface ChatroomPanelsProps extends ChatroomAccountPanelProps, PropsRenderSlots<'chatroom.branch'> {
    retainBranch(sessionId: string): SessionReference;
    openBranchSession(sessionId: string): void;
    closeMembers(): void;
    renameRoom?(title: string): Promise<boolean>;
    setMemberRole?(participantId: string, role: 'admin' | 'member'): Promise<boolean>;
    addRoomMembers?(participantIds: readonly string[]): Promise<boolean>;
    setRoomAutoTrigger?(enabled: boolean): Promise<boolean>;
    closeThread(): void;
    setThreadReply(reply: ChatroomReplyReference): void;
    clearThreadReply(): void;
    sendThreadMessage(text: string): Promise<boolean>;
    enableSystemNotifications(): Promise<void>;
    dismissToast(id: string): void;
    toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void>;
    recallMessage(roomId: string, messageId: string): Promise<boolean>;
    openForward(roomId: string, message?: ChatroomForwardItem): void;
    closeForward(): void;
    forwardSelected(targetRoomId: string): Promise<boolean>;
    clearMessageSelection(): void;
    toggleMessageSelection(roomId: string, message: ChatroomForwardItem): void;
    closeSearch(): void;
    searchAll(query: string): Promise<void>;
    openSearchResult(result: ChatroomSearchResult): Promise<void>;
}
/** Persistent member management, branch conversation, and in-page alerts. */
export declare function ChatroomPanels(props: ChatroomPanelsProps): JSX.Element;
export {};
//# sourceMappingURL=ChatroomPanels.d.ts.map