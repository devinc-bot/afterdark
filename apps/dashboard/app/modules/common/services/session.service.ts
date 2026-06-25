import type { SessionResponse } from '@afterdark/types'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { toApiServiceError } from '~/modules/common/utils/api-service-error.utils'

const SESSION_FALLBACK_ERROR = 'No pudimos cargar tu perfil. Intentá de nuevo en unos minutos.'

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
    throw toApiServiceError(error, SESSION_FALLBACK_ERROR)
  }
}
