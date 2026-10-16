import type { WecomService } from './wecom.js';
/** Parsed Enterprise WeChat document URL accepted by the metadata resolver. */
export interface WecomDocumentReference {
    readonly url: string;
    readonly service: Extract<WecomService, 'doc' | 'sheet' | 'smartsheet' | 'smartpage'>;
    readonly documentType: 'doc' | 'sheet' | 'smartsheet' | 'smartpage';
    readonly source: 'tencent-docs' | 'wecom';
    readonly documentId: string;
}
/** Parse a Tencent Docs or Enterprise WeChat document URL without accepting arbitrary remote hosts. */
export declare function parseWecomDocumentUrl(value: string): WecomDocumentReference | undefined;
/** Extract a useful document title from trusted HTML metadata. */
export declare function documentTitleFromHtml(html: string): string | undefined;
/** Normalize one candidate title and reject provider-only placeholders. */
export declare function normalizeDocumentTitle(value: string): string | undefined;
/** Fetch one allowlisted Tencent Docs page without following redirects or blocking message delivery. */
export declare function fetchTencentDocumentTitle(value: string): Promise<string | undefined>;
//# sourceMappingURL=wecom-document.d.ts.map