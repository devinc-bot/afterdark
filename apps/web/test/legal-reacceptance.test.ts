// @vitest-environment node
import { readFile } from 'node:fs/promises'
import { expect, test } from 'vitest'

async function readSource(relativeFromTest: string) {
  return readFile(new URL(relativeFromTest, import.meta.url), 'utf8')
}

test('web legal reacceptance wires pending/accept routes, gate, and dedicated page', async () => {
  const [routes, appLayout, pageRoute, service, queryKeys, authEs, authEn] = await Promise.all([
    readSource('../app/modules/common/constants/routes.ts'),
    readSource('../app/routes/_app.tsx'),
    readSource('../app/routes/_app/legal-acceptance.tsx'),
    readSource('../app/modules/legal-documents/services/legal-documents.service.ts'),
    readSource('../app/modules/common/constants/query-keys.ts'),
    readSource('../../../packages/i18n/src/locales/auth/es.json'),
    readSource('../../../packages/i18n/src/locales/auth/en.json'),
  ])

  expect(routes).toContain("legalAcceptance: () => '/legal-acceptance' as const")
  expect(appLayout).toContain('RequireCurrentLegalAcceptance')
  expect(pageRoute).toContain("createFileRoute('/_app/legal-acceptance')")
  expect(service).toContain('getPendingAcceptance')
  expect(service).toContain('path.accept()')
  expect(service).not.toContain('/api/legal-documents')
  expect(queryKeys).toContain('pendingLegalAcceptance')
  expect(authEs).toContain('"legalAcceptance"')
  expect(authEn).toContain('"legalAcceptance"')
})
