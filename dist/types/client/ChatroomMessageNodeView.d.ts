import { type ComponentType } from 'react';
import type { ChatNode, ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
import { type ChatroomAvatarId } from '../avatars.js';
import type { ChatroomFileReference, ChatroomForwardBundle, ChatroomForwardItem, ChatroomIdentity, ChatroomReplyReference, ChatroomRoomAvatar, ChatroomThreadRoot } from '../types.js';
import type { ChatroomReactionEmoji } from '../reactions.js';
import type { ChatroomView } from './store.js';
import type { ChatroomAgentTarget } from './store.js';
type ParticipantNode = ChatNode<'user' | 'steering'>;
export { identifyChatroomText } from '../message.js';
interface ChatroomMessageNodeInjected<Kind extends 'user' | 'steering'> {
    useChatroom<T>(selector: (snapshot: ChatroomView) => T): T;
    nativeMessageView: ComponentType<ChatNodeViewProps<Kind>>;
    resolveTarget?(sessionId: string): ChatroomAgentTarget | undefined;
    setReply(roomId: string, reply: ChatroomReplyReference): void;
    openThread(roomId: string, root: ChatroomThreadRoot): Promise<void>;
    toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void>;
    openForward(roomId: string, message: ChatroomForwardItem): void;
    toggleMessageSelection(roomId: string, message: ChatroomForwardItem): void;
}
/** Props for the native user-message wrapper. */
export type ChatroomUserMessageNodeViewProps = ChatNodeViewProps<'user'> & ChatroomMessageNodeInjected<'user'>;
/** Props for the native steering-message wrapper. */
export type ChatroomSteeringMessageNodeViewProps = ChatNodeViewProps<'steering'> & ChatroomMessageNodeInjected<'steering'>;
/** Participant-specific display projection of one durable native user node. */
export declare function projectChatroomMessage(node: ParticipantNode, identity: ChatroomIdentity | undefined, knownAvatars?: readonly ChatroomRoomAvatar[]): {
    readonly node: ParticipantNode;
    readonly own: boolean;
    readonly displayName?: string;
    readonly avatarId: ChatroomAvatarId;
    readonly participantId?: string;
    readonly reply?: ChatroomReplyReference;
    readonly files: readonly ChatroomFileReference[];
    readonly forward?: ChatroomForwardBundle;
    readonly text: string;
    readonly avatarUrl?: string | undefined;
};
/** Reuse Harness' native user renderer and move only peer user messages to the left. */
export declare const ChatroomUserMessageNodeView: import("react").MemoExoticComponent<(props: ChatroomUserMessageNodeViewProps) => import("react").JSX.Element>;
/** Reuse Harness' native steering renderer and move only peer steering messages to the left. */
export declare const ChatroomSteeringMessageNodeView: import("react").MemoExoticComponent<(props: ChatroomSteeringMessageNodeViewProps) => import("react").JSX.Element>;
//# sourceMappingURL=ChatroomMessageNodeView.d.ts.map