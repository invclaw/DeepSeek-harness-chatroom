export interface ChatroomAvatarProps {
    readonly avatarId?: string | undefined;
    readonly avatarUrl?: string | undefined;
    readonly seed: string;
    readonly className?: string;
    readonly title?: string;
}
/** One safe avatar surface shared by members, contacts, identities, and messages. */
export declare function ChatroomAvatar({ avatarId, avatarUrl, seed, className, title }: ChatroomAvatarProps): JSX.Element;
//# sourceMappingURL=ChatroomAvatar.d.ts.map