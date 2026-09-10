import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const audiencesSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'section-audiences.tsx'),
  'utf8'
)

test('section-audiences uses LANDING_IMAGES.audiences (no remote URLs inline)', () => {
  expect(audiencesSource).toContain('LANDING_IMAGES')
  expect(audiencesSource).toMatch(/LANDING_IMAGES\.audiences/)
  expect(audiencesSource).not.toContain('unsplash')
  expect(audiencesSource).not.toMatch(/https?:\/\/images\.unsplash\.com/)
})
