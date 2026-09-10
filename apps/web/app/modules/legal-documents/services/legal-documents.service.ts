import { buildApiPath, QueryFactoryError, toApiServiceError } from '@repo/common'
import { i18n } from '@repo/i18n/client'
import {
  LEGAL_DOCUMENT_TYPE,
  type AcceptLegalDocumentsInput,
  type LegalDocumentType,
  type PendingLegalAcceptanceResponse,
  type PublicLegalDocumentResponse,
} from '@repo/types'
import { api, API_ROUTES } from '~/config/api'
import { WEB_ROUTES } from '~/modules/common/constants/routes'

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

export async function getPendingLegalAcceptance(): Promise<PendingLegalAcceptanceResponse> {
  const path = buildApiPath(
    API_ROUTES.legalDocuments,
    API_ROUTES.legalDocuments.path.getPendingAcceptance()
  )

  try {
    return await api.get<PendingLegalAcceptanceResponse>(path)
  } catch (error) {
    throw toApiServiceError(error, i18n.t('auth:legalAcceptance.loadError'))
  }
}

export async function acceptLegalDocuments(
  types: AcceptLegalDocumentsInput['types']
): Promise<PendingLegalAcceptanceResponse> {
  const path = buildApiPath(API_ROUTES.legalDocuments, API_ROUTES.legalDocuments.path.accept())

  try {
    return await api.post<PendingLegalAcceptanceResponse>(path, { types })
  } catch (error) {
    throw toApiServiceError(error, i18n.t('auth:legalAcceptance.submitError'))
  }
}

export async function resolvePostAuthPath(fallback: string): Promise<string> {
  try {
    const pending = await getPendingLegalAcceptance()
    if (pending.staleTypes.length > 0) {
      return WEB_ROUTES.legalAcceptance()
    }
    return fallback
  } catch {
    return fallback
  }
}
