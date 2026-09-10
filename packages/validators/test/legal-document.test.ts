import { expect, test } from 'vitest'
import {
  LEGAL_DOCUMENT_TYPE,
  acceptLegalDocumentsSchema,
  legalDocumentTypeSchema,
  pendingLegalAcceptanceResponseSchema,
  publishLegalDocumentSchema,
  saveLegalDocumentDraftSchema,
} from '../src/index.ts'

const TIPTAP_DOC = { type: 'doc', content: [] }

test('legal document type map exposes the four supported audiences', () => {
  expect(LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD).toBe('termsDashboard')
  expect(LEGAL_DOCUMENT_TYPE.TERMS_WEB).toBe('termsWeb')
  expect(LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD).toBe('privacyDashboard')
  expect(LEGAL_DOCUMENT_TYPE.PRIVACY_WEB).toBe('privacyWeb')
  expect(Object.keys(LEGAL_DOCUMENT_TYPE)).toHaveLength(4)
})

test('legal document type schema accepts only mapped values', () => {
  for (const type of Object.values(LEGAL_DOCUMENT_TYPE)) {
    expect(legalDocumentTypeSchema.parse(type)).toBe(type)
  }

  expect(legalDocumentTypeSchema.safeParse('terms').success).toBe(false)
  expect(legalDocumentTypeSchema.safeParse('privacyPolicy').success).toBe(false)
  expect(legalDocumentTypeSchema.safeParse('public').success).toBe(false)
})

test('save legal document draft trims title and accepts JSON object content', () => {
  const result = saveLegalDocumentDraftSchema.parse({
    title: '  Terms of use  ',
    content: TIPTAP_DOC,
  })

  expect(result.title).toBe('Terms of use')
  expect(result.content).toEqual(TIPTAP_DOC)
})

test('save legal document draft accepts an optional requiresAcceptance flag', () => {
  const result = saveLegalDocumentDraftSchema.parse({
    title: 'Privacy',
    content: TIPTAP_DOC,
    requiresAcceptance: false,
  })

  expect(result.requiresAcceptance).toBe(false)
})

test('save legal document draft rejects blank titles, overlong titles, and non-object content', () => {
  const valid = { title: 'Terms', content: TIPTAP_DOC }

  expect(saveLegalDocumentDraftSchema.safeParse({ ...valid, title: '' }).success).toBe(false)
  expect(saveLegalDocumentDraftSchema.safeParse({ ...valid, title: '   ' }).success).toBe(false)
  expect(saveLegalDocumentDraftSchema.safeParse({ ...valid, title: 'a'.repeat(256) }).success).toBe(
    false
  )
  expect(
    saveLegalDocumentDraftSchema.parse({ ...valid, title: 'a'.repeat(255) }).title
  ).toHaveLength(255)
  expect(saveLegalDocumentDraftSchema.safeParse({ title: 'Terms', content: [] }).success).toBe(
    false
  )
  expect(saveLegalDocumentDraftSchema.safeParse({ title: 'Terms', content: null }).success).toBe(
    false
  )
  expect(saveLegalDocumentDraftSchema.safeParse({ title: 'Terms', content: 'doc' }).success).toBe(
    false
  )
  expect(
    saveLegalDocumentDraftSchema.safeParse({ ...valid, requiresAcceptance: 'yes' }).success
  ).toBe(false)
})

test('publish legal document type is a path param, not a request body', () => {
  expect(publishLegalDocumentSchema.parse(LEGAL_DOCUMENT_TYPE.TERMS_WEB)).toBe(
    LEGAL_DOCUMENT_TYPE.TERMS_WEB
  )
  expect(publishLegalDocumentSchema.safeParse('unknown').success).toBe(false)
  expect(
    publishLegalDocumentSchema.safeParse({ type: LEGAL_DOCUMENT_TYPE.TERMS_WEB }).success
  ).toBe(false)
})

test('accept legal documents requires at least one unique mapped type', () => {
  expect(
    acceptLegalDocumentsSchema.parse({ types: [LEGAL_DOCUMENT_TYPE.TERMS_WEB] }).types
  ).toEqual([LEGAL_DOCUMENT_TYPE.TERMS_WEB])
  expect(
    acceptLegalDocumentsSchema.parse({
      types: [LEGAL_DOCUMENT_TYPE.TERMS_WEB, LEGAL_DOCUMENT_TYPE.PRIVACY_WEB],
    }).types
  ).toEqual([LEGAL_DOCUMENT_TYPE.TERMS_WEB, LEGAL_DOCUMENT_TYPE.PRIVACY_WEB])
  expect(
    acceptLegalDocumentsSchema.parse({
      types: [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD, LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD],
    }).types
  ).toEqual([LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD, LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD])
  expect(
    acceptLegalDocumentsSchema.parse({ types: [...Object.values(LEGAL_DOCUMENT_TYPE)] }).types
  ).toEqual(Object.values(LEGAL_DOCUMENT_TYPE))
})

test('accept legal documents rejects empty, duplicate, unknown, and non-array types', () => {
  expect(acceptLegalDocumentsSchema.safeParse({ types: [] }).success).toBe(false)
  expect(
    acceptLegalDocumentsSchema.safeParse({
      types: [LEGAL_DOCUMENT_TYPE.TERMS_WEB, LEGAL_DOCUMENT_TYPE.TERMS_WEB],
    }).success
  ).toBe(false)
  expect(acceptLegalDocumentsSchema.safeParse({ types: ['public'] }).success).toBe(false)
  expect(acceptLegalDocumentsSchema.safeParse({ types: ['me'] }).success).toBe(false)
  expect(acceptLegalDocumentsSchema.safeParse({ types: ['terms'] }).success).toBe(false)
  expect(
    acceptLegalDocumentsSchema.safeParse({ types: LEGAL_DOCUMENT_TYPE.TERMS_WEB }).success
  ).toBe(false)
  expect(acceptLegalDocumentsSchema.safeParse({}).success).toBe(false)
  expect(acceptLegalDocumentsSchema.safeParse({ types: null }).success).toBe(false)
})

test('pending legal acceptance response lists unique stale types and allows none', () => {
  expect(pendingLegalAcceptanceResponseSchema.parse({ staleTypes: [] })).toEqual({ staleTypes: [] })
  expect(
    pendingLegalAcceptanceResponseSchema.parse({ staleTypes: [LEGAL_DOCUMENT_TYPE.PRIVACY_WEB] })
  ).toEqual({ staleTypes: [LEGAL_DOCUMENT_TYPE.PRIVACY_WEB] })
  expect(
    pendingLegalAcceptanceResponseSchema.parse({
      staleTypes: [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD, LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD],
    }).staleTypes
  ).toEqual([LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD, LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD])
})

test('pending legal acceptance response rejects unknown or duplicate stale types', () => {
  expect(pendingLegalAcceptanceResponseSchema.safeParse({}).success).toBe(false)
  expect(pendingLegalAcceptanceResponseSchema.safeParse({ staleTypes: ['public'] }).success).toBe(
    false
  )
  expect(
    pendingLegalAcceptanceResponseSchema.safeParse({
      staleTypes: [LEGAL_DOCUMENT_TYPE.TERMS_WEB, LEGAL_DOCUMENT_TYPE.TERMS_WEB],
    }).success
  ).toBe(false)
})
