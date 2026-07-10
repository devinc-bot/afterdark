import type { ClubResponse } from '@afterdark/types'
import { i18n } from '@afterdark/i18n/client'
import { api, API_ROUTES } from '~/config/api'
import { buildApiPath, toApiServiceError } from '@afterdark/common'

export async function fetchClubs(): Promise<ClubResponse[]> {
  try {
    return await api.get<ClubResponse[]>(
      buildApiPath(API_ROUTES.clubs, API_ROUTES.clubs.path.list())
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('clubs:registry.listError'))
  }
}

export async function createClub(formData: FormData): Promise<ClubResponse> {
  try {
    return await api.post<ClubResponse>(
      buildApiPath(API_ROUTES.clubs, API_ROUTES.clubs.path.create()),
      formData
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('clubs:formPage.toastCreateFallback'))
  }
}

export async function updateClub(documentId: string, formData: FormData): Promise<ClubResponse> {
  try {
    return await api.patch<ClubResponse>(
      buildApiPath(API_ROUTES.clubs, API_ROUTES.clubs.path.update(documentId)),
      formData
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('clubs:formPage.toastEditFallback'))
  }
}

export async function deleteClub(documentId: string): Promise<void> {
  try {
    await api.delete(buildApiPath(API_ROUTES.clubs, API_ROUTES.clubs.path.delete(documentId)))
  } catch (error) {
    throw toApiServiceError(error, i18n.t('clubs:registry.deleteFallback'))
  }
}
