import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const landingDir = dirname(fileURLToPath(import.meta.url))
const pageSource = readFileSync(join(landingDir, 'landing-page.tsx'), 'utf8')
const claritySource = readFileSync(join(landingDir, 'section', 'section-clarity.tsx'), 'utf8')
const headerSource = readFileSync(
  join(landingDir, '../../common/components/landing-header.tsx'),
  'utf8'
)
const footerSource = readFileSync(join(landingDir, 'footer.tsx'), 'utf8')

test('landing-page does not import or render Atmosphere or Pulse sections', () => {
  expect(pageSource).not.toMatch(/SectionAtmosphere/)
  expect(pageSource).not.toMatch(/SectionPulse/)
  expect(pageSource).not.toMatch(/section-atmosphere/)
  expect(pageSource).not.toMatch(/section-pulse/)
})

test('landing-page keeps Hero, About, How, Clarity, Events, Closing, and Organizers', () => {
  expect(pageSource).toMatch(/SectionHero/)
  expect(pageSource).toMatch(/SectionAbout/)
  expect(pageSource).toMatch(/id="como-funciona"/)
  expect(pageSource).toMatch(/HowSteps/)
  expect(pageSource).toMatch(/SectionClarity/)
  expect(pageSource).toMatch(/SectionEvents/)
  expect(pageSource).toMatch(/SectionAreYouReady/)
  expect(pageSource).toMatch(/SectionOrganizers/)
})

test('landing main omits view-transition-name so about glass backdrop-blur can sample the hero', () => {
  expect(pageSource).not.toMatch(/vtStyle\s*\(\s*VT\.mainContent\s*\)/)
  expect(pageSource).toMatch(/No view-transition-name/)
})

test('header and footer anchors #como-funciona and #claridad still resolve to kept sections', () => {
  expect(headerSource).toContain("href: '#como-funciona'")
  expect(headerSource).toContain("href: '#claridad'")
  expect(footerSource).toContain("href: '#como-funciona'")
  expect(footerSource).toContain("href: '#claridad'")

  expect(pageSource).toMatch(/id="como-funciona"/)
  expect(claritySource).toMatch(/id="claridad"/)
})

test('unused Atmosphere and Pulse section modules are removed', () => {
  expect(existsSync(join(landingDir, 'section', 'section-atmosphere.tsx'))).toBe(false)
  expect(existsSync(join(landingDir, 'section', 'section-pulse.tsx'))).toBe(false)
})
