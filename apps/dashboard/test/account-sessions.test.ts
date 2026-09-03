import { readFile } from 'node:fs/promises'
import { expect, test } from 'vitest'

const sectionUrl = new URL(
  '../app/modules/settings/components/account-sessions-section.tsx',
  import.meta.url
)
const settingsViewUrl = new URL(
  '../app/modules/settings/components/settings-view.tsx',
  import.meta.url
)
const sharedComponentUrl = new URL(
  '../../../packages/ui/src/components/account-sessions.tsx',
  import.meta.url
)

test('dashboard settings render one shared confirmed session-management section', async () => {
  const [section, settingsView, sharedComponent] = await Promise.all([
    readFile(sectionUrl, 'utf8'),
    readFile(settingsViewUrl, 'utf8'),
    readFile(sharedComponentUrl, 'utf8'),
  ])

  expect(section).toContain('QUERY_KEYS.accountSessions()')
  expect(section).toContain('<AccountSessions')
  expect(section).toContain('<div className="mt-10 px-4 sm:px-8">\n      <AccountSessions')
  expect(section).toContain(
    'className="mx-auto w-full max-w-6xl border-t border-outline-variant/35 pt-8"'
  )
  expect(section).toContain('onRevoke={mutation.mutateAsync}')
  expect(sharedComponent).toContain('!session.isCurrent')
  expect(sharedComponent).toContain('DialogContent')
  expect(settingsView).toContain('<AccountSessionsSection />')
})
