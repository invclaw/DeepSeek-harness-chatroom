import Markdown from 'markdown-to-jsx'

/** Safe GFM renderer shared by every AI message inside a branch. */
export function ChatroomMarkdown({ text }: { readonly text: string }): JSX.Element {
  return (
    <Markdown options={{ disableParsingRawHTML: true, forceBlock: true }}>
      {text}
    </Markdown>
  )
}
