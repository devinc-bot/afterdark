import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const sectionDir = dirname(fileURLToPath(import.meta.url))
const aboutSource = readFileSync(join(sectionDir, 'section-about.tsx'), 'utf8')
const eventsSource = readFileSync(join(sectionDir, 'section-events.tsx'), 'utf8')

test('section-about is an elevated overlapping panel with local about image', () => {
  expect(aboutSource).toContain('about-heading')
  expect(aboutSource).toContain('LANDING_IMAGES.about')
  expect(aboutSource).toMatch(/-mt-/)
  expect(aboutSource).toMatch(/rounded-app/)
  expect(aboutSource).toMatch(/surface-container/)
  expect(aboutSource).not.toMatch(/rounded-\[1\./)
  expect(aboutSource).not.toMatch(/rounded-3xl/)
})

test('section-events is a pressed-button list plus featured preview', () => {
  expect(eventsSource).toMatch(/id="eventos"/)
  expect(eventsSource).toMatch(/aria-pressed/)
  expect(eventsSource).toContain('LANDING_IMAGES.events')
  expect(eventsSource).toMatch(/rounded-app/)
  expect(eventsSource).toMatch(/aria-live/)
  expect(eventsSource).not.toMatch(/unsplash/)
  expect(eventsSource).not.toMatch(/role="listbox"/)
  expect(eventsSource).not.toMatch(/border-left/)
})
