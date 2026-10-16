/** Small monochrome actions matching the native Harness icon weight. */
export function MessageActionIcon({ name }: { readonly name: 'reply' | 'copy' | 'like' | 'branch' | 'forward' | 'more' | 'check' }): JSX.Element {
  return <svg className="dsh-chatroom-action-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'reply' && <path d="m9 5-6 6 6 6M3 11h10a7 7 0 0 1 7 7" />}
    {name === 'copy' && <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>}
    {name === 'like' && <><path d="M7 10h3l3-7c3 0 3 3 2 6h4a2 2 0 0 1 2 2l-2 8a2 2 0 0 1-2 2H7z" /><path d="M3 10h4v11H3z" /></>}
    {name === 'branch' && <><circle cx="6" cy="4" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="20" r="2" /><path d="M6 6v12M18 8v2a4 4 0 0 1-4 4H6" /></>}
    {name === 'forward' && <path d="m14 3 7 7-7 7v-4H9a6 6 0 0 0-6 6v-5a7 7 0 0 1 7-7h4z" />}
    {name === 'more' && <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>}
    {name === 'check' && <path d="m5 12 4 4L19 6" />}
  </svg>
}
