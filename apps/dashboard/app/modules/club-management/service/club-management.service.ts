import type { ClubResponse } from '@afterdark/types'
import type { CreateClubInput } from '@afterdark/validators'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { QueryFactoryError } from '~/modules/common/utils/query-factory'

const CREATE_CLUB_FALLBACK_ERROR = 'No pudimos registrar el club. Intentá de nuevo en unos minutos.'

function clubsApiPath(path: string) {
  return `${API_ROUTES.clubs.prefix}${path}`
}

export async function createClub(data: CreateClubInput): Promise<ClubResponse> {
  try {
    return await api.post<ClubResponse>(clubsApiPath(API_ROUTES.clubs.path.create()), data)
  } catch (error) {
    if (error instanceof QueryFactoryError) {
      const apiMessage = error.body?.message
      throw new Error(typeof apiMessage === 'string' ? apiMessage : CREATE_CLUB_FALLBACK_ERROR)
    }

    throw new Error(CREATE_CLUB_FALLBACK_ERROR)
  }
}
