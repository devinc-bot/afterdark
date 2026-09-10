import { beforeEach, describe, expect, test, vi } from 'vitest'
import { LEGAL_DOCUMENT_TYPE, type LegalDocumentType } from '@repo/types'

const { findLatestPublishedLegalDocumentByType, findAcceptedLegalDocumentIdsByAccountId } =
  vi.hoisted(() => ({
    findLatestPublishedLegalDocumentByType: vi.fn(),
    findAcceptedLegalDocumentIdsByAccountId: vi.fn(),
  }))

vi.mock('./find-latest-published-legal-document-by-type.ts', () => ({
  findLatestPublishedLegalDocumentByType,
}))

vi.mock('./find-accepted-legal-document-ids-by-account-id.ts', () => ({
  findAcceptedLegalDocumentIdsByAccountId,
}))

import { findStaleLegalDocumentTypesForAccount } from './find-stale-legal-document-types-for-account.ts'

const ACCOUNT_ID = 42

const USER_AUDIENCE: LegalDocumentType[] = [
  LEGAL_DOCUMENT_TYPE.TERMS_WEB,
  LEGAL_DOCUMENT_TYPE.PRIVACY_WEB,
]

const OWNER_AUDIENCE: LegalDocumentType[] = [
  LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
  LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD,
]

const PUBLISHED_ID = {
  [LEGAL_DOCUMENT_TYPE.TERMS_WEB]: 101,
  [LEGAL_DOCUMENT_TYPE.PRIVACY_WEB]: 202,
  [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD]: 303,
  [LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD]: 404,
} as const

const PREVIOUS_PUBLISHED_ID = {
  [LEGAL_DOCUMENT_TYPE.TERMS_WEB]: 11,
  [LEGAL_DOCUMENT_TYPE.PRIVACY_WEB]: 22,
  [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD]: 33,
  [LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD]: 44,
} as const

function mockPublished(idsByType: Partial<Record<LegalDocumentType, number>>) {
  findLatestPublishedLegalDocumentByType.mockImplementation(async (type: LegalDocumentType) => {
    const id = idsByType[type]
    return id === undefined ? null : { id }
  })
}

function resolvedAccountId(call: unknown[] | undefined): number | undefined {
  const [argument] = call ?? []
  if (typeof argument === 'number') {
    return argument
  }
  if (typeof argument === 'object' && argument !== null && 'accountId' in argument) {
    return (argument as { accountId: number }).accountId
  }
  return undefined
}

beforeEach(() => {
  findLatestPublishedLegalDocumentByType.mockReset()
  findAcceptedLegalDocumentIdsByAccountId.mockReset()
  findAcceptedLegalDocumentIdsByAccountId.mockResolvedValue([])
})

describe('findStaleLegalDocumentTypesForAccount', () => {
  test('marks a type stale when a newer published row exists than the accepted one', async () => {
    mockPublished({
      [LEGAL_DOCUMENT_TYPE.TERMS_WEB]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.TERMS_WEB],
      [LEGAL_DOCUMENT_TYPE.PRIVACY_WEB]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.PRIVACY_WEB],
    })
    findAcceptedLegalDocumentIdsByAccountId.mockResolvedValue([
      PREVIOUS_PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.TERMS_WEB],
      PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.PRIVACY_WEB],
    ])

    await expect(
      findStaleLegalDocumentTypesForAccount({ accountId: ACCOUNT_ID, types: USER_AUDIENCE })
    ).resolves.toEqual([LEGAL_DOCUMENT_TYPE.TERMS_WEB])
  })

  test('does not mark a type stale when the current published id is accepted', async () => {
    mockPublished({
      [LEGAL_DOCUMENT_TYPE.TERMS_WEB]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.TERMS_WEB],
      [LEGAL_DOCUMENT_TYPE.PRIVACY_WEB]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.PRIVACY_WEB],
    })
    findAcceptedLegalDocumentIdsByAccountId.mockResolvedValue([
      PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.TERMS_WEB],
      PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.PRIVACY_WEB],
    ])

    await expect(
      findStaleLegalDocumentTypesForAccount({ accountId: ACCOUNT_ID, types: USER_AUDIENCE })
    ).resolves.toEqual([])
  })

  test('does not mark a type stale when no published row exists for it', async () => {
    mockPublished({
      [LEGAL_DOCUMENT_TYPE.PRIVACY_WEB]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.PRIVACY_WEB],
    })

    await expect(
      findStaleLegalDocumentTypesForAccount({ accountId: ACCOUNT_ID, types: USER_AUDIENCE })
    ).resolves.toEqual([LEGAL_DOCUMENT_TYPE.PRIVACY_WEB])
  })

  test('treats every requested published type as stale when the account has no acceptances', async () => {
    mockPublished({
      [LEGAL_DOCUMENT_TYPE.TERMS_WEB]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.TERMS_WEB],
      [LEGAL_DOCUMENT_TYPE.PRIVACY_WEB]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.PRIVACY_WEB],
    })
    findAcceptedLegalDocumentIdsByAccountId.mockResolvedValue([])

    await expect(
      findStaleLegalDocumentTypesForAccount({ accountId: ACCOUNT_ID, types: USER_AUDIENCE })
    ).resolves.toEqual(USER_AUDIENCE)
  })

  test('keeps the original requested type order for stale results', async () => {
    const reversedUserAudience = [LEGAL_DOCUMENT_TYPE.PRIVACY_WEB, LEGAL_DOCUMENT_TYPE.TERMS_WEB]
    mockPublished({
      [LEGAL_DOCUMENT_TYPE.TERMS_WEB]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.TERMS_WEB],
      [LEGAL_DOCUMENT_TYPE.PRIVACY_WEB]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.PRIVACY_WEB],
    })

    await expect(
      findStaleLegalDocumentTypesForAccount({
        accountId: ACCOUNT_ID,
        types: reversedUserAudience,
      })
    ).resolves.toEqual(reversedUserAudience)
  })

  test('returns only owner audience types even when web documents would also be stale', async () => {
    mockPublished({
      [LEGAL_DOCUMENT_TYPE.TERMS_WEB]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.TERMS_WEB],
      [LEGAL_DOCUMENT_TYPE.PRIVACY_WEB]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.PRIVACY_WEB],
      [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD],
      [LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD],
    })
    findAcceptedLegalDocumentIdsByAccountId.mockResolvedValue([
      PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD],
    ])

    await expect(
      findStaleLegalDocumentTypesForAccount({ accountId: ACCOUNT_ID, types: OWNER_AUDIENCE })
    ).resolves.toEqual([LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD])

    const queriedTypes = findLatestPublishedLegalDocumentByType.mock.calls.map(
      ([type]) => type as LegalDocumentType
    )
    expect(new Set(queriedTypes)).toEqual(new Set(OWNER_AUDIENCE))
    expect(queriedTypes).not.toContain(LEGAL_DOCUMENT_TYPE.TERMS_WEB)
    expect(queriedTypes).not.toContain(LEGAL_DOCUMENT_TYPE.PRIVACY_WEB)
  })

  test('returns only user audience types even when dashboard documents would also be stale', async () => {
    mockPublished({
      [LEGAL_DOCUMENT_TYPE.TERMS_WEB]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.TERMS_WEB],
      [LEGAL_DOCUMENT_TYPE.PRIVACY_WEB]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.PRIVACY_WEB],
      [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD],
      [LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD],
    })
    findAcceptedLegalDocumentIdsByAccountId.mockResolvedValue([
      PREVIOUS_PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.TERMS_WEB],
      PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.PRIVACY_WEB],
    ])

    await expect(
      findStaleLegalDocumentTypesForAccount({ accountId: ACCOUNT_ID, types: USER_AUDIENCE })
    ).resolves.toEqual([LEGAL_DOCUMENT_TYPE.TERMS_WEB])

    const queriedTypes = findLatestPublishedLegalDocumentByType.mock.calls.map(
      ([type]) => type as LegalDocumentType
    )
    expect(new Set(queriedTypes)).toEqual(new Set(USER_AUDIENCE))
    expect(queriedTypes).not.toContain(LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD)
    expect(queriedTypes).not.toContain(LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD)
  })

  test('returns no stale types when the requested audience has nothing published', async () => {
    mockPublished({})

    await expect(
      findStaleLegalDocumentTypesForAccount({ accountId: ACCOUNT_ID, types: OWNER_AUDIENCE })
    ).resolves.toEqual([])
  })

  test('returns an empty list when no types are requested', async () => {
    await expect(
      findStaleLegalDocumentTypesForAccount({ accountId: ACCOUNT_ID, types: [] })
    ).resolves.toEqual([])
  })

  test('loads acceptances for the requested account', async () => {
    mockPublished({
      [LEGAL_DOCUMENT_TYPE.TERMS_WEB]: PUBLISHED_ID[LEGAL_DOCUMENT_TYPE.TERMS_WEB],
    })

    await findStaleLegalDocumentTypesForAccount({
      accountId: ACCOUNT_ID,
      types: [LEGAL_DOCUMENT_TYPE.TERMS_WEB],
    })

    expect(resolvedAccountId(findAcceptedLegalDocumentIdsByAccountId.mock.calls[0])).toBe(
      ACCOUNT_ID
    )
  })
})
