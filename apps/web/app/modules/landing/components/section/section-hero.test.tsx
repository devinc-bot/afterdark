import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const heroSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'section-hero.tsx'),
  'utf8'
)

test('section-hero uses static LANDING_IMAGES.hero only (no video media)', () => {
  expect(heroSource).toContain('LANDING_IMAGES')
  expect(heroSource).toMatch(/LANDING_IMAGES\.hero/)
  expect(heroSource).not.toContain('LANDING_VIDEOS')
  expect(heroSource).not.toMatch(/<video\b/)
  expect(heroSource).not.toMatch(/\bautoPlay\b/)
})

test('section-hero hero media is the static LANDING_IMAGES.hero image (reduced-motion safe)', () => {
  expect(heroSource).toMatch(/<img\b/)
  expect(heroSource).toMatch(/LANDING_IMAGES\.hero\.src/)
  // No alternate autoplaying media path that would need a reduced-motion fallback.
  expect(heroSource).not.toMatch(/<video\b/)
})
