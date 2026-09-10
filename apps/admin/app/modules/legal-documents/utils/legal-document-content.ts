import { richEditorHtmlToJson, richEditorJsonToHtml } from '@repo/ui'

export function tipTapJsonToEditorValue(
  content: Record<string, unknown> | null | undefined
): string {
  if (!content) return ''
  return richEditorJsonToHtml(content)
}

export function editorValueToTipTapJson(value: string): Record<string, unknown> {
  return richEditorHtmlToJson(value)
}
