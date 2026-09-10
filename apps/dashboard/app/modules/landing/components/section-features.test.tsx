import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const featuresPath = join(dirname(fileURLToPath(import.meta.url)), 'section-features.tsx')
const featuresSource = existsSync(featuresPath) ? readFileSync(featuresPath, 'utf8') : ''

test('section-features uses a hairline list pattern instead of an equal icon-card grid', () => {
  expect(existsSync(featuresPath)).toBe(true)
  expect(featuresSource).toMatch(/border-t border-hairline/)
  expect(featuresSource).toMatch(/flex list-none flex-col/)
  expect(featuresSource).not.toMatch(/sm:grid-cols-2/)
})
