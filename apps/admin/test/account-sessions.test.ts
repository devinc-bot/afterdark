import { readFile } from 'node:fs/promises'
import { expect, test } from 'vitest'

const routeUrl = new URL('../app/routes/_app/settings.tsx', import.meta.url)
const viewUrl = new URL(
  '../app/modules/settings/components/account-sessions-view.tsx',
  import.meta.url
)
const shellUrl = new URL('../app/modules/common/components/app-shell.tsx', import.meta.url)
const sharedComponentUrl = new URL(
  '../../../packages/ui/src/components/account-sessions.tsx',
  import.meta.url
)

test('admin exposes protected settings with confirmed session management', async () => {
  const [route, view, shell, sharedComponent] = await Promise.all([
    readFile(routeUrl, 'utf8'),
    readFile(viewUrl, 'utf8'),
    readFile(shellUrl, 'utf8'),
    readFile(sharedComponentUrl, 'utf8'),
  ])

  expect(route).toContain("createFileRoute('/_app/settings')")
  expect(view).toContain('QUERY_KEYS.accountSessions()')
  expect(view).toContain('<AccountSessions')
  expect(view).toContain('onRevoke={mutation.mutateAsync}')
  expect(sharedComponent).toContain('!session.isCurrent')
  expect(sharedComponent).toContain('DialogContent')
  expect(shell).toContain('ADMIN_ROUTES.settings()')
})
