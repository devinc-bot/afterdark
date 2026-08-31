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
const appLayoutRouteModuleUrl = new URL('../app/routes/_app.tsx', import.meta.url)
const appIndexRouteModuleUrl = new URL('../app/routes/_app/index.tsx', import.meta.url)
const usersRouteModuleUrl = new URL('../app/routes/_app/users.tsx', import.meta.url)
const errorsRouteModuleUrl = new URL('../app/routes/_app/errors.tsx', import.meta.url)
const legalDocumentsRouteModuleUrl = new URL(
  '../app/routes/_app/legal-documents.tsx',
  import.meta.url
)
const legalDocumentsViewModuleUrl = new URL(
  '../app/modules/legal-documents/components/legal-documents-view.tsx',
  import.meta.url
)
const legalDocumentSectionModuleUrl = new URL(
  '../app/modules/legal-documents/components/legal-document-section.tsx',
  import.meta.url
)
const appShellModuleUrl = new URL('../app/modules/common/components/app-shell.tsx', import.meta.url)
const appShellUserModuleUrl = new URL(
  '../app/modules/common/components/app-shell-user.tsx',
  import.meta.url
)
const appShellThemeModuleUrl = new URL(
  '../app/modules/common/components/app-shell-theme-switcher.tsx',
  import.meta.url
)
const appShellLanguageModuleUrl = new URL(
  '../app/modules/common/components/app-shell-language-switcher.tsx',
  import.meta.url
)
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

test('admin protected layout requires an admin session', async () => {
  const routeSource = await readFile(appLayoutRouteModuleUrl, 'utf8')

  assert.equal(routeSource.includes('<RequireAdminSession>'), true)
  assert.equal(routeSource.includes('<AppShell>'), true)
})

test('admin protected root redirects to users and exposes section routes', async () => {
  const [indexSource, usersSource, errorsSource, legalDocumentsSource] = await Promise.all([
    readFile(appIndexRouteModuleUrl, 'utf8'),
    readFile(usersRouteModuleUrl, 'utf8'),
    readFile(errorsRouteModuleUrl, 'utf8'),
    readFile(legalDocumentsRouteModuleUrl, 'utf8'),
  ])

  assert.equal(indexSource.includes('redirect('), true)
  assert.equal(indexSource.includes('ADMIN_ROUTES.users()'), true)
  assert.equal(usersSource.includes("createFileRoute('/_app/users')"), true)
  assert.equal(errorsSource.includes("createFileRoute('/_app/errors')"), true)
  assert.equal(legalDocumentsSource.includes("createFileRoute('/_app/legal-documents')"), true)
})

test('admin shell provides navigation, account identity, and sign-out without mock metrics', async () => {
  const [shellSource, userSource, themeSource, languageSource] = await Promise.all([
    readFile(appShellModuleUrl, 'utf8'),
    readFile(appShellUserModuleUrl, 'utf8'),
    readFile(appShellThemeModuleUrl, 'utf8'),
    readFile(appShellLanguageModuleUrl, 'utf8'),
  ])

  assert.equal(shellSource.includes('<AppSidebar'), true)
  assert.equal(shellSource.includes('ADMIN_ROUTES.users()'), true)
  assert.equal(shellSource.includes('ADMIN_ROUTES.errors()'), true)
  assert.equal(shellSource.includes('ADMIN_ROUTES.legalDocuments()'), true)
  assert.equal(shellSource.includes('clearAuthenticatedState(queryClient)'), true)
  assert.equal(shellSource.includes("t('nav.users')"), true)
  assert.equal(shellSource.includes("t('brand.subtitle')"), true)
  assert.equal(userSource.includes('user.email'), true)
  assert.equal(userSource.includes("t('nav.signOut')"), true)
  assert.equal(themeSource.includes('useTheme'), true)
  assert.equal(themeSource.includes("t('nav.theme')"), true)
  assert.equal(languageSource.includes('useLanguage'), true)
  assert.equal(shellSource.includes('KPI'), false)
})

test('admin legal documents provide organization and web editors without persistence actions', async () => {
  const [viewSource, sectionSource] = await Promise.all([
    readFile(legalDocumentsViewModuleUrl, 'utf8'),
    readFile(legalDocumentSectionModuleUrl, 'utf8'),
  ])

  assert.equal(viewSource.match(/<LegalDocumentSection/g)?.length, 2)
  assert.equal(sectionSource.match(/<RichEditor/g)?.length, 2)
  assert.equal(sectionSource.includes('setTermsContent'), true)
  assert.equal(sectionSource.includes('setPrivacyContent'), true)
  assert.equal(viewSource.includes('save'), false)
  assert.equal(sectionSource.includes('publish'), false)
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
  assert.equal(esSource.includes('"brand"'), true)
  assert.equal(enSource.includes('"brand"'), true)
  assert.equal(esSource.includes('"sections"'), true)
  assert.equal(enSource.includes('"sections"'), true)
  assert.equal(esSource.includes('"users"'), true)
  assert.equal(enSource.includes('"errors"'), true)
  assert.equal(esSource.includes('"theme"'), true)
  assert.equal(enSource.includes('"fallbackName"'), true)
  assert.equal(esSource.includes('"legalDocuments"'), true)
  assert.equal(enSource.includes('"legalDocuments"'), true)
})
