import { buildApiPath, QueryFactoryError, toApiServiceError } from '@repo/common'
import type { PublicOrganizationProfileResponse } from '@repo/types'
import { i18n } from '@repo/i18n/client'
import { api, API_ROUTES } from '~/config/api'

export async function fetchPublicOrganizationProfile(
  slug: string,
  page: number
): Promise<PublicOrganizationProfileResponse | null> {
  const path = buildApiPath(API_ROUTES.organizations, API_ROUTES.organizations.path.getPublic(slug))

  try {
    return await api.get<PublicOrganizationProfileResponse>(`${path}?page=${page}`)
  } catch (error) {
    if (error instanceof QueryFactoryError && error.status === 404) {
      return null
    }

    throw toApiServiceError(error, i18n.t('events:discover.organization.error'))
  }
}
