import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const heroSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'section-hero.tsx'),
  'utf8'
)

/** Brand display tracking must not be tighter than -0.04em (more negative = tighter). */
function brandDisplayTrackingEm(source: string): number | null {
  const brandBlock = source.match(
    /id=["']landing-brand["'][\s\S]*?className=["`]([^"`]+)["`]/
  )
  if (!brandBlock) {
    return null
  }

  const className = brandBlock[1]
  const arbitrary = className.match(/tracking-\[(-?\d*\.?\d+)em\]/)
  if (arbitrary) {
    return Number(arbitrary[1])
  }

  // Tailwind tracking utilities relative to 0 (none of these are tighter than -0.04em).
  if (/\b-?tracking-(?:tighter|tight|normal|wide|wider|widest)\b/.test(className)) {
    return 0
  }

  return null
}

test('section-hero is brand-first via landing-brand and nav.brand', () => {
  expect(heroSource).toMatch(/id=["']landing-brand["']/)
  expect(heroSource).toMatch(/aria-labelledby=["']landing-brand["']/)
  expect(heroSource).toContain("t('nav.brand')")

  const brandBlock = heroSource.match(
    /id=["']landing-brand["'][\s\S]*?className=["`]([^"`]+)["`]/
  )
  expect(brandBlock).not.toBeNull()
  const brandClass = brandBlock![1]
  expect(brandClass).toMatch(/\bfont-display\b/)
  // Flowform-scale display: fluid clamp or explicit 4xl+ utility on the brand.
  expect(
    /text-\[clamp\(/.test(brandClass) ||
      /\btext-(?:[4-9]xl|5xl|6xl|7xl|8xl|9xl)\b/.test(brandClass)
  ).toBe(true)
})

test('section-hero brand display tracking is not tighter than -0.04em', () => {
  const trackingEm = brandDisplayTrackingEm(heroSource)
  expect(trackingEm).not.toBeNull()
  expect(trackingEm!).toBeGreaterThanOrEqual(-0.04)
})

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

test('section-hero soft scrim overlay supports text contrast over media', () => {
  // Soft gradient / opacity overlay over the hero media (not a hard opaque panel).
  const hasSoftScrim =
    /(?:scrim|bg-gradient-|from-(?:black|neutral|zinc|stone|background)\/|via-(?:black|neutral|zinc|stone|background)\/|to-(?:black|neutral|zinc|stone|background|transparent)\/)/i.test(
      heroSource
    ) ||
    /absolute[^"'`\n]*opacity|opacity-\d+[^"'`\n]*absolute/i.test(heroSource)

  expect(hasSoftScrim).toBe(true)
})

test('section-hero still gates CTA children with showAuthCtas', () => {
  expect(heroSource).toMatch(/showAuthCtas\??\s*[:=]/)
  expect(heroSource).toMatch(/children\??\s*[:=]/)
  expect(heroSource).toMatch(/showAuthCtas\s*\?\s*children\s*:\s*null/)
})
