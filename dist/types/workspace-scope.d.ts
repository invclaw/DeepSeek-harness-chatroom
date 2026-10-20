/** Native directory selection stays inside the deployment's shared workspace tree. */
export declare class WorkspaceScope {
    private readonly cwd;
    constructor(cwd: string);
    resolve(path: unknown, root?: string): Promise<string>;
    contains(path: unknown, root?: string): Promise<boolean>;
}
//# sourceMappingURL=workspace-scope.d.ts.map