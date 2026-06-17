import type { CurrentUserResponse } from '@afterdark/types'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { QueryFactoryError } from '~/modules/shared/utils/query-factory'

const CURRENT_USER_FALLBACK_ERROR = 'No pudimos cargar tu perfil. Intentá de nuevo en unos minutos.'

function usersApiPath(path: string) {
  return `${API_ROUTES.users.prefix}${path}`
}

export function getCurrentUser() {
  return api.get<CurrentUserResponse>(usersApiPath(API_ROUTES.users.path.me()))
}

export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
  try {
    return await getCurrentUser()
  } catch (error) {
    if (error instanceof QueryFactoryError) {
      const apiMessage = error.body?.message
      throw new Error(typeof apiMessage === 'string' ? apiMessage : CURRENT_USER_FALLBACK_ERROR)
    }

    throw new Error(CURRENT_USER_FALLBACK_ERROR)
  }
}
