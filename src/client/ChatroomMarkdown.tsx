import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const REMARK_PLUGINS = [remarkGfm]

/** Safe GFM renderer shared by every AI message inside a branch. */
export function ChatroomMarkdown({ text }: { readonly text: string }): JSX.Element {
  return <Markdown remarkPlugins={REMARK_PLUGINS}>{text}</Markdown>
}
