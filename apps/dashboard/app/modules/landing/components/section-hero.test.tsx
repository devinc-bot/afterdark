import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const heroSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'section-hero.tsx'),
  'utf8'
)

test('section-hero uses static LANDING_IMAGES.hero full-bleed image (no video)', () => {
  expect(heroSource).toContain('LANDING_IMAGES')
  expect(heroSource).toMatch(/LANDING_IMAGES\.hero/)
  expect(heroSource).toMatch(/LANDING_IMAGES\.hero\.src/)
  expect(heroSource).toMatch(/<img\b/)
  expect(heroSource).toMatch(/\bobject-cover\b/)
  expect(heroSource).toContain("t('hero.imageAlt')")
  expect(heroSource).not.toContain('LANDING_VIDEOS')
  expect(heroSource).not.toMatch(/<video\b/)
  expect(heroSource).not.toMatch(/\bautoPlay\b/)
  expect(heroSource).not.toContain('unsplash')
  expect(heroSource).not.toMatch(/https?:\/\/images\.unsplash\.com/)
  expect(heroSource).not.toMatch(/https?:\/\//)
})

test('section-hero soft scrim overlay supports text contrast over media', () => {
  const hasSoftScrim =
    /(?:scrim|bg-gradient-|bg-linear-|from-(?:surface|black|neutral|zinc|stone|background)\/|via-(?:surface|black|neutral|zinc|stone|background)\/|to-(?:surface|black|neutral|zinc|stone|background|transparent)\/)/i.test(
      heroSource
    ) || /absolute[^"'`\n]*opacity|opacity-\d+[^"'`\n]*absolute/i.test(heroSource)

  expect(hasSoftScrim).toBe(true)
  expect(heroSource).toMatch(/from-surface/)
})

test('section-hero headline and support use on-surface ink over editorial scrim', () => {
  expect(heroSource).toMatch(/id=["']hero-heading["']/)
  expect(heroSource).toMatch(/text-on-surface/)
  expect(heroSource).toMatch(/text-on-surface-variant/)
  expect(heroSource).toContain("t('hero.headline')")
  expect(heroSource).toContain("t('hero.support')")
})

test('section-hero choreographs entrance without dock/ticker chrome', () => {
  expect(heroSource).toContain("t('hero.eyebrow')")
  expect(heroSource).toContain("t('hero.headline')")
  expect(heroSource).toMatch(/animate-hero-drift/)
  expect(heroSource).toMatch(/animate-landing-hero-in/)
  expect(heroSource).not.toContain("t('hero.dock.label')")
  expect(heroSource).not.toContain("t('hero.ticker.left')")
  expect(heroSource).not.toMatch(/<aside\b/)
  expect(heroSource).not.toMatch(/opacity-0/)
})

test('section-hero secondary CTA stays readable on editorial media', () => {
  expect(heroSource).toContain("t('hero.ctaSecondary')")
  expect(heroSource).toMatch(/LANDING_CTA_SECONDARY|bg-surface-container/)
})

test('section-hero pattern avoids neon purple/blue costume colors', () => {
  expect(heroSource).not.toMatch(/139,\s*92,\s*246/)
  expect(heroSource).not.toMatch(/59,\s*130,\s*246/)
  expect(heroSource).not.toMatch(/#8b5cf6/i)
  expect(heroSource).not.toMatch(/#3b82f6/i)
  expect(heroSource).not.toMatch(/#e5e7eb/i)
})
