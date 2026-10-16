import { type ChatroomAvatarId } from '../avatars.js';
interface ChatroomAvatarViewProps {
    readonly participantId: string;
    readonly avatarId: ChatroomAvatarId;
    readonly avatarUrl?: string;
    readonly className: string;
    readonly title?: string;
}
/** Render a verified enterprise profile image with the deterministic cartoon avatar as its load fallback. */
export declare function ChatroomAvatarView(props: ChatroomAvatarViewProps): JSX.Element;
export {};
//# sourceMappingURL=ChatroomAvatarView.d.ts.map