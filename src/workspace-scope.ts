import { realpath, stat } from 'node:fs/promises'
import { isAbsolute, relative, sep } from 'node:path'

/** Native directory selection stays inside the deployment's shared workspace tree. */
export class WorkspaceScope {
  constructor(private readonly cwd: string) {}

  async resolve(path: unknown, root?: string): Promise<string> {
    if (typeof path !== 'string' || !isAbsolute(path) || /[\u0000-\u001f\u007f]/u.test(path)) throw new Error('Invalid workspace directory')
    const canonicalRoot = root ?? await realpath(this.cwd)
    const canonical = await realpath(path)
    const child = relative(canonicalRoot, canonical)
    if (isAbsolute(child) || child === '..' || child.startsWith(`..${sep}`) || !(await stat(canonical)).isDirectory()) throw new Error('Workspace directory is outside the shared root')
    return canonical
  }

  async contains(path: unknown, root?: string): Promise<boolean> {
    try { await this.resolve(path, root); return true } catch { return false }
  }
}
