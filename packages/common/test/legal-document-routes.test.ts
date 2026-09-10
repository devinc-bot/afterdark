import { expect, test } from 'vitest'
import { LEGAL_DOCUMENT_TYPE } from '@repo/types'
import { API_ROUTES, buildApiPath } from '../src/index.ts'

const RESERVED_LEGAL_DOCUMENT_SEGMENTS = new Set<string>([
  ...Object.values(LEGAL_DOCUMENT_TYPE),
  'public',
])

test('pending acceptance GET is /me/pending and does not collide with type or public paths', () => {
  expect(API_ROUTES.legalDocuments.path.getPendingAcceptance()).toBe('/me/pending')
  expect(API_ROUTES.legalDocuments.path.getPendingAcceptance()).not.toBe(
    API_ROUTES.legalDocuments.path.getByType('me')
  )
  expect(API_ROUTES.legalDocuments.path.getPendingAcceptance()).not.toBe(
    API_ROUTES.legalDocuments.path.getPublishedByType('pending')
  )

  const firstSegment = API_ROUTES.legalDocuments.path
    .getPendingAcceptance()
    .replace(/^\//, '')
    .split('/')[0]
  expect(RESERVED_LEGAL_DOCUMENT_SEGMENTS.has(firstSegment)).toBe(false)
  expect(
    buildApiPath(API_ROUTES.legalDocuments, API_ROUTES.legalDocuments.path.getPendingAcceptance())
  ).toBe('api/legal-documents/me/pending')
})

test('accept POST is /me/accept and does not collide with type or public paths', () => {
  expect(API_ROUTES.legalDocuments.path.accept()).toBe('/me/accept')
  expect(API_ROUTES.legalDocuments.path.accept()).not.toBe(
    API_ROUTES.legalDocuments.path.getByType('me')
  )
  expect(API_ROUTES.legalDocuments.path.accept()).not.toBe(
    API_ROUTES.legalDocuments.path.getPublishedByType('accept')
  )

  const firstSegment = API_ROUTES.legalDocuments.path.accept().replace(/^\//, '').split('/')[0]
  expect(RESERVED_LEGAL_DOCUMENT_SEGMENTS.has(firstSegment)).toBe(false)
  expect(buildApiPath(API_ROUTES.legalDocuments, API_ROUTES.legalDocuments.path.accept())).toBe(
    'api/legal-documents/me/accept'
  )
})
