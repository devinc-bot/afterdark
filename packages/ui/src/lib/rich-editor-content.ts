import type { JSONContent } from '@tiptap/core'
import { generateHTML, generateJSON } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'

const RICH_EDITOR_EXTENSIONS = [StarterKit]

export function richEditorJsonToHtml(content: Record<string, unknown>): string {
  return generateHTML(content as JSONContent, RICH_EDITOR_EXTENSIONS)
}

export function richEditorHtmlToJson(html: string): Record<string, unknown> {
  return generateJSON(html.trim() === '' ? '<p></p>' : html, RICH_EDITOR_EXTENSIONS) as Record<
    string,
    unknown
  >
}
