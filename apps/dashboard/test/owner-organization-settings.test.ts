import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const sectionModuleUrl = new URL(
  '../app/modules/owner/components/organization-settings-section.tsx',
  import.meta.url
)

test('owner settings always show organization fields without a type control', async () => {
  const source = await readFile(sectionModuleUrl, 'utf8')

  assert.equal(source.includes('Checkbox'), false)
  assert.equal(source.includes('isOrganization'), false)
  assert.equal(source.includes('name="organizationName"'), true)
  assert.equal(source.includes('name="taxId"'), true)
})
