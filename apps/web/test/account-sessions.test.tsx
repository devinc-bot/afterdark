import { readFile } from 'node:fs/promises'
import { expect, test } from 'vitest'

const sectionUrl = new URL(
  '../app/modules/settings/components/account-sessions-section.tsx',
  import.meta.url
)

test('web settings connect the shared session-management component to its query and mutation', async () => {
  const section = await readFile(sectionUrl, 'utf8')

  expect(section).toContain('ACCOUNT_SESSIONS_QUERY_KEY')
  expect(section).toContain('<AccountSessions')
  expect(section).toContain('onRevoke={mutation.mutateAsync}')
})
