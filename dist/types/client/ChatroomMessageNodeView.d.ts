import { type ComponentType, type ReactNode } from 'react';
import type { ChatNode, ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { ChatroomIdentity } from '../types.js';
import type { ChatroomView } from './store.js';
type ParticipantNode = ChatNode<'user' | 'steering'>;
interface ChatroomMessageNodeInjected<Kind extends 'user' | 'steering'> {
    useChatroom<T>(selector: (snapshot: ChatroomView) => T): T;
    nativeMessageView: ComponentType<ChatNodeViewProps<Kind>>;
}
/** Props for the native user-message wrapper. */
export type ChatroomUserMessageNodeViewProps = ChatNodeViewProps<'user'> & ChatroomMessageNodeInjected<'user'>;
/** Props for the native steering-message wrapper. */
export type ChatroomSteeringMessageNodeViewProps = ChatNodeViewProps<'steering'> & ChatroomMessageNodeInjected<'steering'>;
/** Add a durable, visually invisible participant id before the display name. */
export declare function identifyChatroomText(text: string, identity: ChatroomIdentity): string;
/** Participant-specific display projection of one durable native user node. */
export declare function projectChatroomMessage(node: ParticipantNode, identity: ChatroomIdentity): {
    readonly node: ParticipantNode;
    readonly own: boolean;
    readonly displayName?: string;
};
/** Reuse Harness' native user renderer and move only peer user messages to the left. */
export declare const ChatroomUserMessageNodeView: import("react").MemoExoticComponent<(props: ChatroomUserMessageNodeViewProps) => string | number | boolean | import("react").JSX.Element | Iterable<ReactNode> | null | undefined>;
/** Reuse Harness' native steering renderer and move only peer steering messages to the left. */
export declare const ChatroomSteeringMessageNodeView: import("react").MemoExoticComponent<(props: ChatroomSteeringMessageNodeViewProps) => string | number | boolean | import("react").JSX.Element | Iterable<ReactNode> | null | undefined>;
export {};
//# sourceMappingURL=ChatroomMessageNodeView.d.ts.map