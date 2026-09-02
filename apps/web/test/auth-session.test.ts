import { readFile } from 'node:fs/promises'
import { expect, test } from 'vitest'

const apiModuleUrl = new URL('../app/config/api.ts', import.meta.url)
const storeModuleUrl = new URL('../app/modules/common/stores/session.store.ts', import.meta.url)
const sessionServiceModuleUrl = new URL(
  '../app/modules/common/services/session.service.ts',
  import.meta.url
)
const callbackRouteModuleUrl = new URL('../app/routes/auth.callback.tsx', import.meta.url)
const userMenuModuleUrl = new URL('../app/modules/common/components/user-menu.tsx', import.meta.url)

test('web restores with its refresh cookie and clears local state after logout failures', async () => {
  const [api, store, service, callback, userMenu] = await Promise.all([
    readFile(apiModuleUrl, 'utf8'),
    readFile(storeModuleUrl, 'utf8'),
    readFile(sessionServiceModuleUrl, 'utf8'),
    readFile(callbackRouteModuleUrl, 'utf8'),
    readFile(userMenuModuleUrl, 'utf8'),
  ])

  expect(api).toContain('onAuthenticationFailure: clearLocalSession')
  expect(store).toContain('registerSessionStateCleanup')
  expect(store).not.toContain('hasToken')
  expect(service).toContain('app: CLIENT_APP.WEB')
  expect(service).toContain('QueryFactoryAuthenticationError')
  expect(callback).toContain('saveAuthSession(await refreshAuthSession())')
  expect(callback).not.toContain('accessToken: token')
  expect(userMenu).toContain('await logoutAuthSession()')
  expect(userMenu.indexOf('await logoutAuthSession()')).toBeLessThan(
    userMenu.indexOf('clearAuthSession()')
  )
})
