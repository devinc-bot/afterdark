import { buildApiPath, QueryFactoryError, toApiServiceError } from '@repo/common'
import { i18n } from '@repo/i18n/client'
import {
  LEGAL_DOCUMENT_TYPE,
  type LegalDocumentType,
  type PublicLegalDocumentResponse,
} from '@repo/types'
import { api, API_ROUTES } from '~/config/api'

const LEGAL_DOCUMENT_TYPES = new Set<string>(Object.values(LEGAL_DOCUMENT_TYPE))

export async function getPublishedLegalDocumentByType(
  type: LegalDocumentType
): Promise<PublicLegalDocumentResponse> {
  if (!LEGAL_DOCUMENT_TYPES.has(type)) {
    throw new Error(`Unknown legal document type: ${type}`)
  }

  const path = buildApiPath(
    API_ROUTES.legalDocuments,
    API_ROUTES.legalDocuments.path.getPublishedByType(type)
  )

  try {
    return await api.get<PublicLegalDocumentResponse>(path)
  } catch (error) {
    if (error instanceof QueryFactoryError && error.status === 404) {
      throw toApiServiceError(error, i18n.t('auth:register.legal.unavailable'))
    }

    throw toApiServiceError(error, i18n.t('auth:register.legal.unavailable'))
  }
}
