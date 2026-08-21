/** Fixed avatar choices shared by the Host identity validator and browser picker. */
export declare const CHATROOM_AVATARS: readonly [{
    readonly id: "whale";
    readonly emoji: "🐳";
    readonly label: "鲸鱼";
}, {
    readonly id: "panda";
    readonly emoji: "🐼";
    readonly label: "熊猫";
}, {
    readonly id: "fox";
    readonly emoji: "🦊";
    readonly label: "狐狸";
}, {
    readonly id: "cat";
    readonly emoji: "🐱";
    readonly label: "猫咪";
}, {
    readonly id: "dog";
    readonly emoji: "🐶";
    readonly label: "狗狗";
}, {
    readonly id: "rabbit";
    readonly emoji: "🐰";
    readonly label: "兔子";
}, {
    readonly id: "octopus";
    readonly emoji: "🐙";
    readonly label: "章鱼";
}, {
    readonly id: "unicorn";
    readonly emoji: "🦄";
    readonly label: "独角兽";
}];
/** Stable id of one built-in chatroom avatar. */
export type ChatroomAvatarId = (typeof CHATROOM_AVATARS)[number]['id'];
/** Whether an untrusted string names one built-in avatar. */
export declare function isChatroomAvatarId(value: unknown): value is ChatroomAvatarId;
/** Deterministic fallback for identities and old transcript markers without an avatar. */
export declare function fallbackAvatarId(seed: string): ChatroomAvatarId;
/** Display metadata for one validated or historical avatar id. */
export declare function chatroomAvatar(value: string | undefined, seed: string): {
    readonly id: "whale";
    readonly emoji: "🐳";
    readonly label: "鲸鱼";
} | {
    readonly id: "panda";
    readonly emoji: "🐼";
    readonly label: "熊猫";
} | {
    readonly id: "fox";
    readonly emoji: "🦊";
    readonly label: "狐狸";
} | {
    readonly id: "cat";
    readonly emoji: "🐱";
    readonly label: "猫咪";
} | {
    readonly id: "dog";
    readonly emoji: "🐶";
    readonly label: "狗狗";
} | {
    readonly id: "rabbit";
    readonly emoji: "🐰";
    readonly label: "兔子";
} | {
    readonly id: "octopus";
    readonly emoji: "🐙";
    readonly label: "章鱼";
} | {
    readonly id: "unicorn";
    readonly emoji: "🦄";
    readonly label: "独角兽";
};
//# sourceMappingURL=avatars.d.ts.map