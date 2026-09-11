import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { LANDING_IMAGES } from './images'

const publicLandingDir = join(dirname(fileURLToPath(import.meta.url)), '../../../../public/landing')

function assertLocalLandingSrc(src: string, expectedPath: string) {
  expect(src).toBe(expectedPath)
  expect(src.startsWith('/landing/')).toBe(true)
  expect(src).not.toContain('unsplash')
  expect(existsSync(join(publicLandingDir, src.replace('/landing/', '')))).toBe(true)
}

function assertLocalLandingSrcSet(srcSet: string | undefined, expectedPath: string) {
  if (srcSet === undefined) {
    return
  }

  expect(srcSet).toContain(expectedPath)
  expect(srcSet).not.toContain('unsplash')
}

test('LANDING_IMAGES points hero and about at local /landing assets', () => {
  assertLocalLandingSrc(LANDING_IMAGES.hero.src, '/landing/hero.png')
  assertLocalLandingSrcSet(LANDING_IMAGES.hero.srcSet, '/landing/hero.png')

  assertLocalLandingSrc(LANDING_IMAGES.about.src, '/landing/about.png')
  assertLocalLandingSrcSet(LANDING_IMAGES.about.srcSet, '/landing/about.png')
})

test('LANDING_IMAGES drops unused atmosphere, clarity, and events keys after slim composition', () => {
  expect(LANDING_IMAGES).not.toHaveProperty('atmosphere')
  expect(LANDING_IMAGES).not.toHaveProperty('clarity')
  expect(LANDING_IMAGES).not.toHaveProperty('events')
})
