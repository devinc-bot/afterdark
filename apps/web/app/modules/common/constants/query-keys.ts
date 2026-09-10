import type { LegalDocumentType } from '@repo/types'

export const QUERY_KEYS = {
  publishedLegalDocument: (type: LegalDocumentType) =>
    ['published-legal-document', type] as const,
  pendingLegalAcceptance: ['pending-legal-acceptance'] as const,
} as const
