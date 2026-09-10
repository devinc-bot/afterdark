import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const pageSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'landing-page.tsx'),
  'utf8'
)

const SECTION_ORDER = [
  'SectionHero',
  'SectionDemo',
  'SectionFeatures',
  'SectionHow',
  'SectionAudiences',
  'SectionValue',
  'SectionSocial',
  'SectionFaq',
  'SectionCta',
] as const

test('landing-page imports and renders SectionDemo after the hero', () => {
  expect(pageSource).toMatch(/SectionDemo/)
  expect(pageSource).toMatch(/from ['"]\.\/section-demo['"]/)

  const heroIndex = pageSource.indexOf('<SectionHero')
  const demoIndex = pageSource.indexOf('<SectionDemo')
  const featuresIndex = pageSource.indexOf('<SectionFeatures')

  expect(heroIndex).toBeGreaterThan(-1)
  expect(demoIndex).toBeGreaterThan(-1)
  expect(featuresIndex).toBeGreaterThan(-1)
  expect(demoIndex).toBeGreaterThan(heroIndex)
  expect(demoIndex).toBeLessThan(featuresIndex)
})

test('landing-page keeps SaaS product-hero composition order', () => {
  const indices = SECTION_ORDER.map((name) => {
    const index = pageSource.indexOf(`<${name}`)
    expect(index, `${name} should appear in landing-page.tsx`).toBeGreaterThan(-1)
    return { name, index }
  })

  for (let i = 1; i < indices.length; i += 1) {
    expect(
      indices[i].index,
      `${indices[i].name} should follow ${indices[i - 1].name}`
    ).toBeGreaterThan(indices[i - 1].index)
  }
})
