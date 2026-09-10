import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const headerPath = join(dirname(fileURLToPath(import.meta.url)), 'landing-header.tsx')
const headerSource = existsSync(headerPath) ? readFileSync(headerPath, 'utf8') : ''

test('landing-header module exists', () => {
  expect(existsSync(headerPath)).toBe(true)
})

test('landing-header uses frosted sticky chrome without ghost-card shadow', () => {
  expect(headerSource).toMatch(/bg-background\/(?:55|70)/)
  expect(headerSource).toMatch(/backdrop-blur-xl/)
  expect(headerSource).toMatch(/backdrop-saturate/)
  expect(headerSource).not.toMatch(/shadow-\(--shadow-glass\)/)
})

test('landing-header brand link exposes a focus-visible ring', () => {
  expect(headerSource).toMatch(/focus-visible:ring-2/)
})

test('landing-header auth and icon controls match web landing touch targets', () => {
  expect(headerSource).toMatch(/h-11 min-h-11/)
  expect(headerSource).toMatch(/size-11/)
  expect(headerSource).toMatch(/min-h-11/)
  expect(headerSource).not.toMatch(/size="sm"/)
})
