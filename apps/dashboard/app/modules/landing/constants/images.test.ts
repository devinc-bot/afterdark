import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { LANDING_IMAGES } from './images'

const publicLandingDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../public/landing'
)

function assertLocalLandingSrc(src: string, expectedPath: string) {
  expect(src).toBe(expectedPath)
  expect(src.startsWith('/landing/')).toBe(true)
  expect(src).not.toContain('unsplash')
  expect(src).not.toMatch(/^https?:\/\//)
  expect(existsSync(join(publicLandingDir, src.replace('/landing/', '')))).toBe(true)
}

function assertLocalLandingSrcSet(srcSet: string | undefined, expectedPath: string) {
  if (srcSet === undefined) {
    return
  }

  expect(srcSet).toContain(expectedPath)
  expect(srcSet).not.toContain('unsplash')
  expect(srcSet).not.toMatch(/https?:\/\/images\.unsplash\.com/)
}

test('LANDING_IMAGES points hero, audiences, value, and demo poster at local /landing assets', () => {
  expect(LANDING_IMAGES).toHaveProperty('hero')
  expect(LANDING_IMAGES).toHaveProperty('audiences')
  expect(LANDING_IMAGES).toHaveProperty('value')
  expect(LANDING_IMAGES).toHaveProperty('demoPoster')

  // Cast until implementation adds `hero`; keeps this file type-checkable under TDD.
  const hero = (LANDING_IMAGES as Record<string, { src: string; srcSet?: string }>).hero
  assertLocalLandingSrc(hero.src, '/landing/hero.png')
  assertLocalLandingSrcSet(hero.srcSet, '/landing/hero.png')

  assertLocalLandingSrc(LANDING_IMAGES.audiences.src, '/landing/audiences.jpg')
  assertLocalLandingSrcSet(LANDING_IMAGES.audiences.srcSet, '/landing/audiences.jpg')

  assertLocalLandingSrc(LANDING_IMAGES.value.src, '/landing/value.jpg')
  assertLocalLandingSrcSet(LANDING_IMAGES.value.srcSet, '/landing/value.jpg')

  assertLocalLandingSrc(LANDING_IMAGES.demoPoster.src, '/landing/owner-promo-poster.jpg')
  assertLocalLandingSrcSet(LANDING_IMAGES.demoPoster.srcSet, '/landing/owner-promo-poster.jpg')
})

test('LANDING_IMAGES has no remote Unsplash URLs', () => {
  const serialized = JSON.stringify(LANDING_IMAGES)
  expect(serialized).not.toContain('unsplash')
  expect(serialized).not.toContain('images.unsplash.com')
})
