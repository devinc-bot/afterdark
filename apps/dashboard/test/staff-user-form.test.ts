import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const formModuleUrl = new URL(
  '../app/modules/staff/components/staff-user-form.tsx',
  import.meta.url
)

test('staff invitation form has no location query or location field', async () => {
  const source = await readFile(formModuleUrl, 'utf8')

  assert.equal(source.includes('useLocations'), false)
  assert.equal(source.includes('use-locations-queries'), false)
  assert.equal(source.includes('locationId'), false)
})
