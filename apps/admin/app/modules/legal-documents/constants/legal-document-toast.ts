import type { LegalDocumentType } from '@repo/types'

export const LEGAL_DOCUMENT_TOAST_ACTION = {
  SAVE_SUCCESS: 'saveSuccess',
  SAVE_ERROR: 'saveError',
  PUBLISH_SUCCESS: 'publishSuccess',
  PUBLISH_ERROR: 'publishError',
} as const

type LegalDocumentToastAction =
  (typeof LEGAL_DOCUMENT_TOAST_ACTION)[keyof typeof LEGAL_DOCUMENT_TOAST_ACTION]

const LEGAL_DOCUMENT_TOAST_I18N_PREFIX = 'legalDocuments.toast' as const

export function legalDocumentToastI18nKey(
  action: LegalDocumentToastAction,
  type: LegalDocumentType
) {
  return `${LEGAL_DOCUMENT_TOAST_I18N_PREFIX}.${action}.${type}` as const
}
