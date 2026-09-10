import { expect, test } from 'vitest'
import {
  LANDING_CTA_GHOST_ON_MEDIA,
  LANDING_CTA_PRIMARY,
  LANDING_FOCUS_RING,
  LANDING_FOCUS_RING_ON_MEDIA,
} from './layout'

test('LANDING_CTA_PRIMARY uses citrus primary / on-primary tokens, not ink on-surface fill', () => {
  expect(LANDING_CTA_PRIMARY).toMatch(/\bbg-primary\b/)
  expect(LANDING_CTA_PRIMARY).toMatch(/\b(?:text-on-primary|text-primary-foreground)\b/)
  expect(LANDING_CTA_PRIMARY).toMatch(/\bhover:bg-primary(?:\/\d+)?\b/)

  expect(LANDING_CTA_PRIMARY).not.toMatch(/\bbg-on-surface\b/)
  expect(LANDING_CTA_PRIMARY).not.toMatch(/\btext-background\b/)
})

test('LANDING_CTA_PRIMARY has no light-theme primary-hover override', () => {
  // Shared tokens for both themes — light citrus alignment lives in CSS vars, not CTA class overrides.
  expect(LANDING_CTA_PRIMARY).not.toMatch(/\[\[data-theme=light\]_&\]:bg-primary-hover/)
  expect(LANDING_CTA_PRIMARY).not.toMatch(/\[\[data-theme=light\]_&\]:hover:bg-primary-hover/)
  expect(LANDING_CTA_PRIMARY).not.toMatch(/\bprimary-hover\b/)
  expect(LANDING_CTA_PRIMARY).not.toMatch(/data-theme=light/)
})

test('LANDING_CTA_PRIMARY keeps a usable touch target without introducing motion that ignores reduced-motion', () => {
  expect(LANDING_CTA_PRIMARY).toMatch(/\bmin-h-11\b/)

  const hasMotionClass = /\b(?:animate-|transition-|duration-|ease-|scale-|translate-)/.test(
    LANDING_CTA_PRIMARY
  )
  if (hasMotionClass) {
    expect(LANDING_CTA_PRIMARY).toMatch(/\bmotion-reduce:/)
  }
})

test('LANDING_CTA_GHOST_ON_MEDIA stays light for contrast over photography', () => {
  expect(LANDING_CTA_GHOST_ON_MEDIA).toMatch(/\btext-white\b/)
  expect(LANDING_CTA_GHOST_ON_MEDIA).toMatch(/\bborder-white\//)
  expect(LANDING_CTA_GHOST_ON_MEDIA).not.toMatch(/\bbg-primary\b/)
  expect(LANDING_CTA_GHOST_ON_MEDIA).not.toMatch(/\bbg-on-surface\b/)
})

test('landing focus rings remain defined for solid and on-media CTAs', () => {
  expect(LANDING_FOCUS_RING).toMatch(/focus-visible:ring-2/)
  expect(LANDING_FOCUS_RING).toMatch(/focus-visible:ring-ink|focus-visible:ring-primary/)

  expect(LANDING_FOCUS_RING_ON_MEDIA).toMatch(/focus-visible:ring-2/)
  expect(LANDING_FOCUS_RING_ON_MEDIA).toMatch(/focus-visible:ring-white/)
})
