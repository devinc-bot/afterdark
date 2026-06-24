import type { CurrentOwnerResponse, SessionResponse } from '@afterdark/types'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { QueryFactoryError } from '~/modules/common/utils/query-factory'

const CURRENT_OWNER_FALLBACK_ERROR =
  'No pudimos cargar tu perfil. Intentá de nuevo en unos minutos.'

function ownersApiPath(path: string) {
  return `${API_ROUTES.owners.prefix}${path}`
}

export function getCurrentOwner() {
  return api.get<CurrentOwnerResponse>(ownersApiPath(API_ROUTES.owners.path.details()))
}

export async function fetchCurrentOwner(): Promise<CurrentOwnerResponse> {
  try {
    return await getCurrentOwner()
  } catch (error) {
    if (error instanceof QueryFactoryError) {
      const apiMessage = error.body?.message
      throw new Error(typeof apiMessage === 'string' ? apiMessage : CURRENT_OWNER_FALLBACK_ERROR)
    }

    throw new Error(CURRENT_OWNER_FALLBACK_ERROR)
  }
}

export function toSessionUser(
  owner: Pick<CurrentOwnerResponse, 'sub' | 'name' | 'lastName' | 'email' | 'avatar'>
): SessionResponse {
  return {
    sub: owner.sub,
    name: owner.name,
    lastName: owner.lastName,
    email: owner.email,
    avatar: owner.avatar,
  }
}
