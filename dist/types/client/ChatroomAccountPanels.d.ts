import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ChatroomView } from './store.js';
import type { ChatroomForwardItem, ChatroomReplyReference } from '../types.js';
import type { ChatroomReactionEmoji } from '../reactions.js';
export interface ChatroomAccountPanelProps {
    readonly room: ChatroomView;
    closeAccount(): void;
    changePassword(currentPassword: string, newPassword: string): Promise<boolean>;
    closeAdmin(): void;
    openAdmin(): Promise<void>;
    adminCreateUser(input: {
        username: string;
        password: string;
        displayName: string;
        avatarId: string;
        role: 'super-admin' | 'admin' | 'member';
    }): Promise<boolean>;
    adminUpdateUser(userId: string, patch: {
        role?: 'super-admin' | 'admin' | 'member';
        status?: 'active' | 'disabled';
    }): Promise<boolean>;
    adminSetSelfRegistration(value: boolean): Promise<boolean>;
    adminSetAutoRedirectProvider(providerId?: string): Promise<boolean>;
    adminSaveProvider(input: {
        id: string;
        label: string;
        enabled: boolean;
        issuer: string;
        clientId: string;
        clientSecret?: string;
        scopes: string;
        usernameClaim: string;
        displayNameClaim: string;
        autoCreateUsers: boolean;
    }): Promise<boolean>;
    adminDeleteProvider(providerId: string): Promise<boolean>;
    loadAutomation?(): Promise<void>;
    saveAutomation?(provider: string, model: string, meetingSummaryProvider: string, meetingSummaryModel: string, mainAgentPrompt: string, controllerPrompt: string): Promise<boolean>;
    openDirect(peerId?: string): Promise<void>;
    closeDirect(): void;
    sendDirect(text: string, files?: readonly File[], reply?: ChatroomReplyReference): Promise<boolean>;
    toggleDirectReaction?(conversationId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void>;
    openForward?(conversationId: string, message?: ChatroomForwardItem): void;
    toggleMessageSelection?(conversationId: string, message: ChatroomForwardItem): void;
    quickDirectMeeting?(conversationId: string): Promise<boolean>;
    loadWecomAuthorization?(): Promise<ChatroomView['wecomAuthorization']>;
    startWecomAuthorization?(): Promise<boolean>;
    disconnectWecomAuthorization?(): Promise<boolean>;
    rebindWecomAuthorization?(): Promise<boolean>;
    closeWecomAuthorization(): void;
}
/** Super-administrator and private-message panels independent from native Agent Sessions. */
export declare function ChatroomAccountPanels(props: ChatroomAccountPanelProps): JSX.Element;
interface ChatroomSettingsInjected extends Omit<ChatroomAccountPanelProps, 'room'> {
    readonly hooks: {
        readonly chatroom: {
            readonly getSnapshot: () => ChatroomView;
            readonly subscribe: (listener: () => void) => () => void;
        };
    };
}
type ChatroomSettingsSectionProps = PropsRuntime<'settings.section'> & InjectFace<ChatroomSettingsInjected>;
/** Account, registration, and enterprise-login controls inside native Harness Settings. */
export declare function ChatroomSettingsSection(props: ChatroomSettingsSectionProps): JSX.Element;
export {};
//# sourceMappingURL=ChatroomAccountPanels.d.ts.map