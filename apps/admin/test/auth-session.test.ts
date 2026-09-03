import { readFile } from 'node:fs/promises'
import { expect, test } from 'vitest'

const apiModuleUrl = new URL('../app/config/api.ts', import.meta.url)
const storeModuleUrl = new URL('../app/modules/common/stores/session.store.ts', import.meta.url)
const sessionServiceModuleUrl = new URL(
  '../app/modules/common/services/session.service.ts',
  import.meta.url
)
const appShellModuleUrl = new URL('../app/modules/common/components/app-shell.tsx', import.meta.url)

test('admin restores with its refresh cookie and clears local state after logout failures', async () => {
  const [api, store, service, appShell] = await Promise.all([
    readFile(apiModuleUrl, 'utf8'),
    readFile(storeModuleUrl, 'utf8'),
    readFile(sessionServiceModuleUrl, 'utf8'),
    readFile(appShellModuleUrl, 'utf8'),
  ])

  expect(api).toContain('onAuthenticationFailure: clearLocalSession')
  expect(store).toContain('registerSessionStateCleanup')
  expect(store).not.toContain('hasToken')
  expect(service).toContain('app: CLIENT_APP.ADMIN')
  expect(service).toContain('QueryFactoryAuthenticationError')
  expect(appShell).toContain('await logoutAuthSession()')
  expect(appShell.indexOf('await logoutAuthSession()')).toBeLessThan(
    appShell.indexOf('clearAuthenticatedState(queryClient)')
  )
})
