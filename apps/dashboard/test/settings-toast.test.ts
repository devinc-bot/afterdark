import { readFile } from 'node:fs/promises'
import { expect, test } from 'vitest'

const settingsContextModuleUrl = new URL(
  '../app/modules/settings/hooks/settings-form-context.tsx',
  import.meta.url
)

test('settings save feedback uses shared dashboard toasts', async () => {
  const source = await readFile(settingsContextModuleUrl, 'utf8')

  expect(source.includes('toast.success')).toBe(true)
  expect(source.includes('toast.error')).toBe(true)
  expect(source.includes('saveMessage')).toBe(false)
})
