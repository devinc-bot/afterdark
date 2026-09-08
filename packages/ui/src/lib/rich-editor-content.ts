import type { JSONContent } from '@tiptap/core'
import { generateHTML, generateJSON } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'

const RICH_EDITOR_EXTENSIONS = [StarterKit]

/** Restore list markers Tailwind preflight removes, matching the editor chrome. */
export const RICH_EDITOR_HTML_CLASS_NAME =
  'text-sm leading-relaxed text-on-surface [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_h1]:mb-2 [&_h1]:mt-0 [&_h1]:font-heading [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_li>p]:my-0 [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:text-on-surface-variant [&_strong]:font-semibold'

export function richEditorJsonToHtml(content: Record<string, unknown>): string {
  return generateHTML(content as JSONContent, RICH_EDITOR_EXTENSIONS)
}

export function richEditorHtmlToJson(html: string): Record<string, unknown> {
  return generateJSON(html.trim() === '' ? '<p></p>' : html, RICH_EDITOR_EXTENSIONS) as Record<
    string,
    unknown
  >
}
