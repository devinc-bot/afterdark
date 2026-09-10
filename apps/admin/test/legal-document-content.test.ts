import { expect, test } from 'vitest'
import {
  editorValueToTipTapJson,
  tipTapJsonToEditorValue,
} from '../app/modules/legal-documents/utils/legal-document-content'

const structuredDoc = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Términos' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Bienvenido' }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Uno' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Dos' }],
            },
          ],
        },
      ],
    },
  ],
} as const

test('converts TipTap JSON with headings and lists to HTML without flattening', () => {
  const html = tipTapJsonToEditorValue(structuredDoc)

  expect(html).toContain('<h2>')
  expect(html).toContain('Términos')
  expect(html).toContain('<ul>')
  expect(html).toContain('Uno')
  expect(html).toContain('Dos')
  expect(html).not.toBe('<p>TérminosBienvenidoUnoDos</p>')
})

test('converts structured HTML back to TipTap JSON with headings and lists', () => {
  const json = editorValueToTipTapJson(
    '<h2>Términos</h2><p>Bienvenido</p><ul><li><p>Uno</p></li><li><p>Dos</p></li></ul>'
  )

  expect(json.type).toBe('doc')
  const html = tipTapJsonToEditorValue(json)
  expect(html).toContain('<h2>')
  expect(html).toContain('Términos')
  expect(html).toContain('<ul>')
  expect(html).toContain('Uno')
})
