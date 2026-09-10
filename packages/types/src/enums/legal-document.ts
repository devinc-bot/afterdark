export const LEGAL_DOCUMENT_TYPE = {
  TERMS_DASHBOARD: 'termsDashboard',
  TERMS_WEB: 'termsWeb',
  PRIVACY_DASHBOARD: 'privacyDashboard',
  PRIVACY_WEB: 'privacyWeb',
} as const

export type LegalDocumentType = (typeof LEGAL_DOCUMENT_TYPE)[keyof typeof LEGAL_DOCUMENT_TYPE]
