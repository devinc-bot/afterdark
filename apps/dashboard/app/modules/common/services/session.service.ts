import type { SessionResponse } from '@afterdark/types'
import { i18n } from '@afterdark/i18n/client'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { toApiServiceError } from '~/modules/common/utils/api-service-error.utils'

function sessionApiPath(path: string) {
  return `${API_ROUTES.session.prefix}${path}`
}

export function getSession() {
  return api.get<SessionResponse>(sessionApiPath(API_ROUTES.session.path.me()))
}

export async function fetchSession(): Promise<SessionResponse> {
  try {
    return await getSession()
  } catch (error) {
    throw toApiServiceError(error, i18n.t('auth:session.loadFallback'))
  }
}
