import type { ChatroomIdentity, ChatroomPromptContentPart } from './types.js';
import type { ChatroomFileReference, ChatroomReplyReference } from './types.js';
import { type ChatroomAvatarId } from './avatars.js';
export declare const PARTICIPANT_MARKER_START = "\u2063dsh-chatroom:";
export declare const PARTICIPANT_MARKER_END = "\u2063";
export declare const REPLY_MARKER_START = "\u2063dsh-chatroom-reply:";
export declare const FILE_MARKER_START = "\u2063dsh-chatroom-file:";
/** Add a durable, visually invisible participant id before the display name. */
export declare function identifyChatroomText(text: string, identity: ChatroomIdentity): string;
/** Add the room identity to the first text block without altering image order. */
export declare function identifyPrompt(content: readonly ChatroomPromptContentPart[], identity: ChatroomIdentity, reply?: ChatroomReplyReference): ChatroomPromptContentPart[];
/** Parse a current or historical participant marker at the start of text. */
export declare function participantMarker(text: string): {
    readonly participantId: string;
    readonly avatarId: ChatroomAvatarId;
    readonly length: number;
} | undefined;
/** Add reply metadata plus a readable quote line for the model transcript. */
export declare function identifyReplyText(text: string, reply: ChatroomReplyReference): string;
/** Project one leading reply marker back into a quote card and message body. */
export declare function projectReplyText(text: string): {
    text: string;
    reply?: ChatroomReplyReference;
};
/** Model-visible file line with an invisible rendering marker. */
export declare function identifyFileText(file: ChatroomFileReference): string;
/** Remove file marker lines while collecting download cards for the browser. */
export declare function projectFileText(text: string): {
    text: string;
    files: ChatroomFileReference[];
};
/** Whether visible room text explicitly mentions the generic or configured AI name. */
export declare function mentionsAi(content: readonly ChatroomPromptContentPart[], aiDisplayName: string): boolean;
/** Whether the native command dispatcher must retain ownership of this submission. */
export declare function isSlashCommand(content: readonly ChatroomPromptContentPart[]): boolean;
//# sourceMappingURL=message.d.ts.map