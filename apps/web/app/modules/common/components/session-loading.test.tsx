import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'session-loading.tsx'),
  'utf8'
)

test('session loading label uses high-contrast body ink, not muted foreground', () => {
  // Exact utility class: text-ink / text-foreground — not text-ink-muted.
  expect(source).toMatch(/(?:^|[\s"'`])text-(?:foreground|ink)(?:[\s"'`]|$)/m)
  expect(source).not.toMatch(/\btext-muted-foreground\b/)
  expect(source).not.toMatch(/\btext-ink-muted\b/)
})
