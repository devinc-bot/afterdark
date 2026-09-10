import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const localesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../packages/i18n/src/locales/dashboard-landing'
)

function readLocale(locale: 'es' | 'en') {
  return JSON.parse(readFileSync(join(localesDir, `${locale}.json`), 'utf8')) as {
    demo?: {
      headline?: string
      support?: string
      videoLabel?: string
    }
  }
}

test.each(['es', 'en'] as const)(
  'dashboard-landing %s locale exposes demo headline and videoLabel',
  (locale) => {
    const messages = readLocale(locale)

    expect(messages.demo).toBeDefined()
    expect(typeof messages.demo?.headline).toBe('string')
    expect(messages.demo?.headline?.trim().length).toBeGreaterThan(0)
    expect(typeof messages.demo?.videoLabel).toBe('string')
    expect(messages.demo?.videoLabel?.trim().length).toBeGreaterThan(0)
  }
)
