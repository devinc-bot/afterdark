import type { LegalDocumentType } from '@repo/types'

export const QUERY_KEYS = {
  publishedLegalDocument: (type: LegalDocumentType) =>
    ['published-legal-document', type] as const,
} as const
