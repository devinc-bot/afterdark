import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const headerPath = join(dirname(fileURLToPath(import.meta.url)), 'landing-header.tsx')
const headerSource = existsSync(headerPath) ? readFileSync(headerPath, 'utf8') : ''

test('landing-header module exists', () => {
  expect(existsSync(headerPath)).toBe(true)
})

test('landing-header uses floating frosted glass chrome like web', () => {
  expect(headerSource).toMatch(/fixed/)
  expect(headerSource).toMatch(/rounded-app-lg/)
  expect(headerSource).toMatch(/bg-surface-container\//)
  expect(headerSource).toMatch(/backdrop-blur-xl/)
  expect(headerSource).toMatch(/shadow-glass/)
})

test('landing-header brand link exposes a focus-visible ring', () => {
  expect(headerSource).toMatch(/LANDING_FOCUS_RING/)
  expect(headerSource).toMatch(/to=["']\/["'][\s\S]*?LANDING_FOCUS_RING/)
})

test('landing-header auth and icon controls match web landing touch targets', () => {
  expect(headerSource).toMatch(/h-11 min-h-11/)
  expect(headerSource).toMatch(/size-11/)
  expect(headerSource).toMatch(/min-h-11/)
  expect(headerSource).toMatch(/\[&_svg\]:size-7/)
  expect(headerSource).not.toMatch(/size="sm"/)
})
