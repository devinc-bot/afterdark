import { readFileSync } from 'node:fs'
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
  expect(aboutSource).toMatch(/backdrop-blur/)
  expect(aboutSource).not.toMatch(/rounded-\[1\./)
  expect(aboutSource).not.toMatch(/rounded-3xl/)
})

test('section-events wires live public preview to /events/$slug', () => {
  expect(eventsSource).toMatch(/id="eventos"/)
  expect(eventsSource).toContain('usePublicEventsInfiniteQuery')
  expect(eventsSource).toContain('/events/$slug')
  expect(eventsSource).toContain('LANDING_EVENTS_PREVIEW_LIMIT')
  expect(eventsSource).toMatch(/rounded-app/)
  expect(eventsSource).not.toContain('LANDING_IMAGES.events')
  expect(eventsSource).not.toMatch(/unsplash/)
  expect(eventsSource).not.toMatch(/aria-pressed/)
  expect(eventsSource).not.toMatch(/role="listbox"/)
})
