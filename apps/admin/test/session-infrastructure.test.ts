import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const cookieModuleUrl = new URL('../app/modules/common/constants/cookies.ts', import.meta.url)
const apiModuleUrl = new URL('../app/config/api.ts', import.meta.url)
const signOutModuleUrl = new URL('../app/modules/auth/utils/sign-out.utils.ts', import.meta.url)
const requireAdminSessionModuleUrl = new URL(
  '../app/modules/common/components/require-admin-session.tsx',
  import.meta.url
)
const requireGuestModuleUrl = new URL(
  '../app/modules/common/components/require-guest.tsx',
  import.meta.url
)
const loginFormModuleUrl = new URL('../app/modules/auth/components/login-form.tsx', import.meta.url)
const loginMutationModuleUrl = new URL(
  '../app/modules/auth/mutations/use-auth-mutations.ts',
  import.meta.url
)
const homeRouteModuleUrl = new URL('../app/routes/index.tsx', import.meta.url)
const homeModuleUrl = new URL('../app/modules/home/components/admin-home.tsx', import.meta.url)
const adminLocaleEsUrl = new URL(
  '../../../packages/i18n/src/locales/admin/es.json',
  import.meta.url
)
const adminLocaleEnUrl = new URL(
  '../../../packages/i18n/src/locales/admin/en.json',
  import.meta.url
)

test('admin session infrastructure uses an isolated token and authenticated API client', async () => {
  const [cookieSource, apiSource] = await Promise.all([
    readFile(cookieModuleUrl, 'utf8'),
    readFile(apiModuleUrl, 'utf8'),
  ])

  assert.equal(cookieSource.includes("accessToken: 'eventflow.admin.auth.token'"), true)
  assert.equal(cookieSource.includes('repo.dashboard.auth.token'), false)
  assert.equal(apiSource.includes('getAccessToken: getAccessTokenSync'), true)
})

test('admin sign-out clears credentials, session state, and query cache', async () => {
  const source = await readFile(signOutModuleUrl, 'utf8')

  assert.equal(source.includes('clearAuthSession()'), true)
  assert.equal(source.includes('useSessionStore.getState().clearSession()'), true)
  assert.equal(source.includes('queryClient.clear()'), true)
})

test('admin route boundaries enforce the admin role and clear restored non-admin sessions', async () => {
  const [adminBoundarySource, guestBoundarySource] = await Promise.all([
    readFile(requireAdminSessionModuleUrl, 'utf8'),
    readFile(requireGuestModuleUrl, 'utf8'),
  ])

  assert.equal(adminBoundarySource.includes('isAdminSession(user)'), true)
  assert.equal(adminBoundarySource.includes('clearAuthenticatedState(queryClient)'), true)
  assert.equal(adminBoundarySource.includes('SESSION_STATUS.UNAUTHENTICATED'), true)
  assert.equal(guestBoundarySource.includes('isAdminSession(user)'), true)
  assert.equal(guestBoundarySource.includes('clearAuthenticatedState(queryClient)'), true)
})

test('admin login is password-only and rejects a session without the admin role', async () => {
  const [formSource, mutationSource] = await Promise.all([
    readFile(loginFormModuleUrl, 'utf8'),
    readFile(loginMutationModuleUrl, 'utf8'),
  ])

  assert.equal(formSource.includes('loginSchema'), true)
  assert.equal(formSource.includes('GoogleContinueButton'), false)
  assert.equal(formSource.includes('forgotPassword'), false)
  assert.equal(formSource.includes('createAccount'), false)
  assert.equal(mutationSource.includes('isAdminSession(useSessionStore.getState().user)'), true)
  assert.equal(mutationSource.includes('clearAuthenticatedState(queryClient)'), true)
})

test('admin home is protected and provides account controls without mock metrics', async () => {
  const [routeSource, homeSource] = await Promise.all([
    readFile(homeRouteModuleUrl, 'utf8'),
    readFile(homeModuleUrl, 'utf8'),
  ])

  assert.equal(routeSource.includes('<RequireAdminSession>'), true)
  assert.equal(homeSource.includes('<LanguageSwitcher />'), true)
  assert.equal(homeSource.includes('<ThemeToggle />'), true)
  assert.equal(homeSource.includes('user.email'), true)
  assert.equal(homeSource.includes('clearAuthenticatedState(queryClient)'), true)
  assert.equal(homeSource.includes('KPI'), false)
})

test('admin copy is provided in Spanish and English', async () => {
  const [esSource, enSource] = await Promise.all([
    readFile(adminLocaleEsUrl, 'utf8'),
    readFile(adminLocaleEnUrl, 'utf8'),
  ])

  assert.equal(esSource.includes('"accessDenied"'), true)
  assert.equal(enSource.includes('"accessDenied"'), true)
  assert.equal(esSource.includes('"home"'), true)
  assert.equal(enSource.includes('"home"'), true)
})
