import type { GeoIpLocateResult } from '@repo/types'
import { i18n } from '@repo/i18n/client'
import { api, API_ROUTES } from '~/config/api'
import { buildApiPath, toApiServiceError } from '@repo/common'

export async function fetchIpLocation(): Promise<GeoIpLocateResult> {
  try {
    const path = buildApiPath(API_ROUTES.geo, API_ROUTES.geo.path.ipLocate())
    return await api.get<GeoIpLocateResult>(path)
  } catch (error) {
    throw toApiServiceError(error, i18n.t('locations:map.ipLocateError'))
  }
}
