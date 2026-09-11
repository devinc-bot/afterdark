import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const featuresPath = join(dirname(fileURLToPath(import.meta.url)), 'section-features.tsx')
const featuresSource = existsSync(featuresPath) ? readFileSync(featuresPath, 'utf8') : ''

test('section-features uses numbered editorial rows with sticky anchor', () => {
  expect(existsSync(featuresPath)).toBe(true)
  expect(featuresSource).toMatch(/lg:sticky/)
  expect(featuresSource).toMatch(/flex list-none flex-col/)
  expect(featuresSource).toMatch(/rounded-app-xl/)
  expect(featuresSource).toContain("t('features.highlight")
  expect(featuresSource).not.toMatch(/sm:grid-cols-2 lg:grid-cols-4/)
})
