import type { PropsRuntime, PropsRenderFactories } from '@deepseek-ai/dsh-client-ui-slots';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'chatroom.branch': {
            kind: 'single';
            scope: 'session';
        };
    }
}
declare module '@deepseek-ai/dsh-api-session-controller/client' {
    interface SessionReferenceSourceMap {
        chatroomBranch: unknown;
    }
}
/** Native transcript, tools, approvals and composer with an independent Session scope. */
export declare function NativeBranchContent(props: PropsRuntime<'chatroom.branch'> & PropsRenderFactories): JSX.Element;
//# sourceMappingURL=NativeBranchContent.d.ts.map