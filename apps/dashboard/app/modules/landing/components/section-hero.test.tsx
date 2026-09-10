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
    /(?:scrim|bg-gradient-|bg-linear-|from-(?:black|neutral|zinc|stone|background)\/|via-(?:black|neutral|zinc|stone|background)\/|to-(?:black|neutral|zinc|stone|background|transparent)\/)/i.test(
      heroSource
    ) ||
    /absolute[^"'`\n]*opacity|opacity-\d+[^"'`\n]*absolute/i.test(heroSource)

  expect(hasSoftScrim).toBe(true)
  expect(heroSource).toMatch(/from-black/)
})

test('section-hero brand, headline, and support use light text over media', () => {
  const brandClass = heroSource.match(
    /id=["']landing-brand["'][\s\S]*?className=["`]([^"`]+)["`]/
  )?.[1]
  expect(brandClass).toBeDefined()
  expect(brandClass!).toMatch(/\btext-white\b/)

  const headlineClass = heroSource.match(
    /<h1\b[^>]*className=["`]([^"`]+)["`][\s\S]*?t\(['"]hero\.headline['"]\)/
  )?.[1]
  expect(headlineClass).toBeDefined()
  expect(headlineClass!).toMatch(/\btext-white\b/)

  const supportClass = heroSource.match(
    /className=["`]([^"`]+)["`]\s*>\s*\{\s*t\(['"]hero\.support['"]\)/
  )?.[1]
  expect(supportClass).toBeDefined()
  expect(supportClass!).toMatch(/\btext-white(?:\/\d+)?\b/)
})

test('section-hero secondary CTA stays readable on dark media', () => {
  const secondaryCtaBlock = heroSource.match(
    /variant=["']([^"']+)["'][\s\S]{0,240}?t\(['"]hero\.ctaSecondary['"]\)/
  )
  const secondaryWithClass = heroSource.match(
    /className=["`]([^"`]+)["`][\s\S]{0,240}?t\(['"]hero\.ctaSecondary['"]\)/
  )

  const variant = secondaryCtaBlock?.[1]
  const className = secondaryWithClass?.[1] ?? ''

  const readableOnDark =
    variant === 'inverse' ||
    /\btext-white\b/.test(className) ||
    /\bborder-white\//.test(className)

  expect(readableOnDark).toBe(true)
})

test('section-hero pattern avoids neon purple/blue costume colors', () => {
  expect(heroSource).not.toMatch(/139,\s*92,\s*246/)
  expect(heroSource).not.toMatch(/59,\s*130,\s*246/)
  expect(heroSource).not.toMatch(/#8b5cf6/i)
  expect(heroSource).not.toMatch(/#3b82f6/i)
  expect(heroSource).not.toMatch(/#e5e7eb/i)
})
