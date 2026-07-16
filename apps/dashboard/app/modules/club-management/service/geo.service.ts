import type { GeoIpLocateResult } from '@afterdark/types'
import { i18n } from '@afterdark/i18n/client'
import { api, API_ROUTES } from '~/config/api'
import { buildApiPath, toApiServiceError } from '@afterdark/common'

export async function fetchIpLocation(): Promise<GeoIpLocateResult> {
  try {
    const path = buildApiPath(API_ROUTES.geo, API_ROUTES.geo.path.ipLocate())
    return await api.get<GeoIpLocateResult>(path)
  } catch (error) {
    throw toApiServiceError(error, i18n.t('clubs:location.ipLocateError'))
  }
}
