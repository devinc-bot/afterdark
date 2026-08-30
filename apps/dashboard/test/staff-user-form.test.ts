import { readFile } from 'node:fs/promises'
import { expect, test } from 'vitest'

const formModuleUrl = new URL(
  '../app/modules/staff/components/staff-user-form.tsx',
  import.meta.url
)

test('staff invitation form has no location query or location field', async () => {
  const source = await readFile(formModuleUrl, 'utf8')

  expect(source.includes('useLocations')).toBe(false)
  expect(source.includes('use-locations-queries')).toBe(false)
  expect(source.includes('locationId')).toBe(false)
})
