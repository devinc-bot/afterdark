import { readFile } from 'node:fs/promises'
import { expect, test } from 'vitest'

const sectionModuleUrl = new URL(
  '../app/modules/owner/components/organization-settings-section.tsx',
  import.meta.url
)

test('owner settings always show organization fields without a type control', async () => {
  const source = await readFile(sectionModuleUrl, 'utf8')

  expect(source.includes('Checkbox')).toBe(false)
  expect(source.includes('isOrganization')).toBe(false)
  expect(source.includes('name="organizationName"')).toBe(true)
  expect(source.includes('name="taxId"')).toBe(true)
})
