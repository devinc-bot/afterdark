// @vitest-environment node
import { readFile } from 'node:fs/promises'
import { USER_ROLE } from '@repo/types'
import { expect, test } from 'vitest'
import { isRouteAllowedForRole } from '../app/modules/common/constants/role-routes'
import { DASHBOARD_ROUTES } from '../app/modules/common/constants/routes'

async function readSource(relativeFromTest: string) {
  return readFile(new URL(relativeFromTest, import.meta.url), 'utf8')
}

function sliceBetween(source: string, start: string, end: string) {
  const from = source.indexOf(start)
  const to = source.indexOf(end)
  return from >= 0 && to > from ? source.slice(from, to) : ''
}

test('dashboard legal reacceptance wires pending/accept, owner gate, and dedicated page', async () => {
  const [
    routes,
    roleRoutes,
    appLayout,
    pageRoute,
    page,
    service,
    queryKeys,
    gate,
    authMutations,
    callback,
  ] = await Promise.all([
    readSource('../app/modules/common/constants/routes.ts'),
    readSource('../app/modules/common/constants/role-routes.ts'),
    readSource('../app/routes/_app.tsx'),
    readSource('../app/routes/_app/legal-acceptance.tsx'),
    readSource('../app/modules/legal-documents/components/legal-acceptance-page.tsx'),
    readSource('../app/modules/legal-documents/services/legal-documents.service.ts'),
    readSource('../app/modules/common/constants/query-keys.ts'),
    readSource('../app/modules/legal-documents/components/require-current-legal-acceptance.tsx'),
    readSource('../app/modules/auth/mutations/use-auth-mutations.ts'),
    readSource('../app/routes/auth.callback.tsx'),
  ])

  expect(routes).toContain("legalAcceptance: () => '/legal-acceptance' as const")

  const ownerPrefixes = sliceBetween(
    roleRoutes,
    'export const OWNER_ALLOWED_PATH_PREFIXES',
    'const ROLE_ALLOWED_PATH_PREFIXES'
  )
  const staffPrefixes = sliceBetween(
    roleRoutes,
    'export const STAFF_ALLOWED_PATH_PREFIXES',
    'export const OWNER_ALLOWED_PATH_PREFIXES'
  )
  expect(ownerPrefixes).toContain('DASHBOARD_ROUTES.legalAcceptance()')
  expect(staffPrefixes).not.toContain('DASHBOARD_ROUTES.legalAcceptance()')

  expect(appLayout).toContain('RequireCurrentLegalAcceptance')
  expect(pageRoute).toContain("createFileRoute('/_app/legal-acceptance')")
  expect(page).toContain('LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD')
  expect(page).toContain('LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD')

  expect(service).toContain('API_ROUTES.legalDocuments.path.getPendingAcceptance()')
  expect(service).toContain('API_ROUTES.legalDocuments.path.accept()')
  expect(service).toContain('resolvePostAuthPath')
  expect(service).not.toContain('/api/legal-documents')
  expect(queryKeys).toContain('pendingLegalAcceptance')

  expect(gate).toContain('user?.role === USER_ROLE.OWNER')
  expect(gate).toContain('enabled: shouldGate')
  expect(gate).toContain('DASHBOARD_ROUTES.legalAcceptance()')
  expect(gate).not.toContain('USER_ROLE.STAFF')

  expect(sliceBetween(authMutations, 'export function useLogin', 'export function useRequestRegister')).toContain(
    'resolvePostAuthPath'
  )
  expect(
    sliceBetween(
      authMutations,
      'export function useConfirmOwnerRegistration',
      'export function useForgotPassword'
    )
  ).toContain('resolvePostAuthPath')
  expect(callback).toContain('resolvePostAuthPath')
})

test('owner may open legal-acceptance and staff may not', () => {
  expect(isRouteAllowedForRole(USER_ROLE.OWNER, DASHBOARD_ROUTES.legalAcceptance())).toBe(true)
  expect(isRouteAllowedForRole(USER_ROLE.STAFF, DASHBOARD_ROUTES.legalAcceptance())).toBe(false)
})
