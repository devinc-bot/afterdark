import type { SessionResponse } from '@afterdark/types'
import { i18n } from '@afterdark/i18n/client'
import { api, API_ROUTES } from '~/config/api'
import { buildApiPath, toApiServiceError } from '@afterdark/common'

export function getSession() {
  return api.get<SessionResponse>(buildApiPath(API_ROUTES.session, API_ROUTES.session.path.me()))
}

export async function fetchSession(): Promise<SessionResponse> {
  try {
    return await getSession()
  } catch (error) {
    throw toApiServiceError(error, i18n.t('auth:session.loadFallback'))
  }
}
