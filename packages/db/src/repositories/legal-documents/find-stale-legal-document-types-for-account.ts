import type { LegalDocumentType } from '@repo/types'
import { findAcceptedLegalDocumentIdsByAccountId } from './find-accepted-legal-document-ids-by-account-id.ts'
import { findLatestPublishedLegalDocumentByType } from './find-latest-published-legal-document-by-type.ts'

export async function findStaleLegalDocumentTypesForAccount(input: {
  accountId: number
  types: readonly LegalDocumentType[]
}): Promise<LegalDocumentType[]> {
  if (input.types.length === 0) {
    return []
  }

  const [acceptedIds, publishedDocuments] = await Promise.all([
    findAcceptedLegalDocumentIdsByAccountId(input.accountId),
    Promise.all(input.types.map((type) => findLatestPublishedLegalDocumentByType(type))),
  ])
  const acceptedIdSet = new Set(acceptedIds)

  return input.types.filter((type, index) => {
    const published = publishedDocuments[index]
    return published !== null && !acceptedIdSet.has(published.id)
  })
}
