import { type ReactNode, type Ref } from 'react';
import type { ChatroomReplyReference } from '../types.js';
import { type ChatroomMessageToolsProps } from './ChatroomMessageTools.js';
import { type ChatroomMessageGroupPosition } from './message-grouping.js';
/** Shared participant-message chrome used by Group, branch, and Direct transcripts. */
export declare function ChatroomMessageFrame({ rootRef, className, own, role, groupPosition, actionGroup, avatar, displayName, reply, body, footer, tools, }: {
    readonly rootRef?: Ref<HTMLDivElement> | undefined;
    readonly className?: string | undefined;
    readonly own: boolean;
    readonly role?: 'human' | 'ai' | undefined;
    readonly groupPosition?: ChatroomMessageGroupPosition | undefined;
    readonly actionGroup?: string | undefined;
    readonly avatar: ReactNode;
    readonly displayName?: string | undefined;
    readonly reply?: ChatroomReplyReference | undefined;
    readonly body: ReactNode;
    readonly footer?: ReactNode | undefined;
    readonly tools: ChatroomMessageToolsProps;
}): JSX.Element;
//# sourceMappingURL=ChatroomMessageFrame.d.ts.map