import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const settingsContextModuleUrl = new URL(
  '../app/modules/settings/hooks/settings-form-context.tsx',
  import.meta.url
)

test('settings save feedback uses shared dashboard toasts', async () => {
  const source = await readFile(settingsContextModuleUrl, 'utf8')

  assert.equal(source.includes('toast.success'), true)
  assert.equal(source.includes('toast.error'), true)
  assert.equal(source.includes('saveMessage'), false)
})
