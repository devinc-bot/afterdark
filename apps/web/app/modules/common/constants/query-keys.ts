import type { LegalDocumentType } from '@repo/types'

export const QUERY_KEYS = {
  publishedLegalDocument: (type: LegalDocumentType) => ['published-legal-document', type] as const,
  pendingLegalAcceptance: ['pending-legal-acceptance'] as const,
  accountSessions: () => ['account-sessions'] as const,
} as const
