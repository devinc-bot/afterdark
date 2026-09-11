import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const demoPath = join(dirname(fileURLToPath(import.meta.url)), 'section-demo.tsx')
const demoSource = existsSync(demoPath) ? readFileSync(demoPath, 'utf8') : ''

test('section-demo module exists for the product demo embed', () => {
  expect(existsSync(demoPath)).toBe(true)
})

test('section-demo embeds LANDING_VIDEOS.promo with poster, no native controls', () => {
  expect(demoSource).toContain('LANDING_VIDEOS')
  expect(demoSource).toMatch(/LANDING_VIDEOS\.promo/)
  expect(demoSource).toMatch(/<video\b/)
  expect(demoSource).toMatch(/LANDING_IMAGES\.demoPoster/)
  expect(demoSource).toMatch(/\bposter=\{/)
  expect(demoSource).not.toMatch(/\bcontrols\b/)
})

test('section-demo autoplays in view via IntersectionObserver (not HTML autoPlay alone)', () => {
  // Playback is observer-driven — do not force via the HTML autoPlay attribute.
  expect(demoSource).not.toMatch(/\bautoPlay\b/)
  expect(demoSource).toMatch(/\bIntersectionObserver\b/)
  expect(demoSource).toMatch(/\.play\s*\(/)
  expect(demoSource).toMatch(/\.pause\s*\(/)
  expect(demoSource).toMatch(/\bisIntersecting\b/)
})

test('section-demo uses muted playsInline loop for silent promo autoplay policy', () => {
  expect(demoSource).toMatch(/\bmuted\b/)
  expect(demoSource).toMatch(/\bplaysInline\b/)
  expect(demoSource).toMatch(/\bloop\b/)
})

test('section-demo respects prefers-reduced-motion by skipping autoplay', () => {
  expect(demoSource).toMatch(/prefers-reduced-motion:\s*reduce|prefersReducedMotion/)
})

test('section-demo is not a full-bleed absolute backdrop video', () => {
  expect(demoSource).toMatch(/<section\b/)
  expect(demoSource).not.toMatch(/absolute inset-0[\s\S]*<video\b/)
})

test('section-demo exposes an accessible title/label from i18n', () => {
  expect(demoSource).toMatch(/useTranslation\(['"]dashboardLanding['"]\)/)
  expect(demoSource).toMatch(/t\(['"]demo\.videoLabel['"]\)/)
  expect(demoSource).toMatch(/aria-label=\{/)
  expect(demoSource).toMatch(/aria-labelledby=/)
})

test('section-demo uses an elevated product stage surface with spacing from the hero', () => {
  expect(demoSource).toMatch(/(?:^|[\s"'`])mt-(?:\d|\[)/m)
  expect(demoSource).not.toMatch(/(?:^|[\s"'`])-mt-/)
  expect(demoSource).toMatch(/rounded-app/)
  expect(demoSource).toMatch(/glass-panel|backdrop-blur/)
})
