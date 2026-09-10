import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const valueSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'section-value.tsx'),
  'utf8'
)

test('section-value uses LANDING_IMAGES.value (no remote URLs inline)', () => {
  expect(valueSource).toContain('LANDING_IMAGES')
  expect(valueSource).toMatch(/LANDING_IMAGES\.value/)
  expect(valueSource).not.toContain('unsplash')
  expect(valueSource).not.toMatch(/https?:\/\/images\.unsplash\.com/)
})
