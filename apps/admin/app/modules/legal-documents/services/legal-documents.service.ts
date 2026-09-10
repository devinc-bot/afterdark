import type {
  LegalDocumentByTypeResponse,
  LegalDocumentResponse,
  LegalDocumentType,
} from '@repo/types'
import type { SaveLegalDocumentDraftInput } from '@repo/validators'
import { i18n } from '@repo/i18n/client'
import { buildApiPath, toApiServiceError } from '@repo/common'
import { api, API_ROUTES } from '~/config/api'

export async function listLegalDocuments(): Promise<LegalDocumentByTypeResponse[]> {
  const path = buildApiPath(API_ROUTES.legalDocuments, API_ROUTES.legalDocuments.path.list())

  try {
    return await api.get<LegalDocumentByTypeResponse[]>(path)
  } catch (error) {
    throw toApiServiceError(error, i18n.t('admin:legalDocuments.loadError'))
  }
}

export async function saveDraft(
  type: LegalDocumentType,
  input: SaveLegalDocumentDraftInput
): Promise<LegalDocumentResponse> {
  const path = buildApiPath(
    API_ROUTES.legalDocuments,
    API_ROUTES.legalDocuments.path.saveDraft(type)
  )

  try {
    return await api.put<LegalDocumentResponse>(path, input)
  } catch (error) {
    throw toApiServiceError(error, i18n.t('admin:legalDocuments.saveError'))
  }
}

export async function publish(type: LegalDocumentType): Promise<LegalDocumentResponse> {
  const path = buildApiPath(API_ROUTES.legalDocuments, API_ROUTES.legalDocuments.path.publish(type))

  try {
    return await api.post<LegalDocumentResponse>(path, undefined)
  } catch (error) {
    throw toApiServiceError(error, i18n.t('admin:legalDocuments.publishError'))
  }
}
