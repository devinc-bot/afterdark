import type { LocationResponse } from '@afterdark/types'
import { i18n } from '@afterdark/i18n/client'
import { api, API_ROUTES } from '~/config/api'
import { buildApiPath, toApiServiceError } from '@afterdark/common'

export async function fetchLocations(): Promise<LocationResponse[]> {
  try {
    return await api.get<LocationResponse[]>(
      buildApiPath(API_ROUTES.locations, API_ROUTES.locations.path.list())
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('locations:registry.listError'))
  }
}

export async function createLocation(formData: FormData): Promise<LocationResponse> {
  try {
    return await api.post<LocationResponse>(
      buildApiPath(API_ROUTES.locations, API_ROUTES.locations.path.create()),
      formData
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('locations:formPage.toastCreateFallback'))
  }
}

export async function updateLocation(
  documentId: string,
  formData: FormData
): Promise<LocationResponse> {
  try {
    return await api.patch<LocationResponse>(
      buildApiPath(API_ROUTES.locations, API_ROUTES.locations.path.update(documentId)),
      formData
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('locations:formPage.toastEditFallback'))
  }
}

export async function deleteLocation(documentId: string): Promise<void> {
  try {
    await api.delete(
      buildApiPath(API_ROUTES.locations, API_ROUTES.locations.path.delete(documentId))
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('locations:registry.deleteFallback'))
  }
}
