import type { ClubResponse } from '@afterdark/types'
import type { CreateClubInput, UpdateClubInput } from '@afterdark/validators'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { toApiServiceError } from '~/modules/common/utils/api-service-error.utils'

const CREATE_CLUB_FALLBACK_ERROR = 'No pudimos registrar el club. Intentá de nuevo en unos minutos.'
const LIST_CLUBS_FALLBACK_ERROR = 'No pudimos cargar los clubes. Intentá de nuevo en unos minutos.'
const UPDATE_CLUB_FALLBACK_ERROR =
  'No pudimos actualizar el club. Intentá de nuevo en unos minutos.'
const DELETE_CLUB_FALLBACK_ERROR = 'No pudimos eliminar el club. Intentá de nuevo en unos minutos.'

function clubsApiPath(path: string) {
  return `${API_ROUTES.clubs.prefix}${path}`
}

export async function fetchClubs(): Promise<ClubResponse[]> {
  try {
    return await api.get<ClubResponse[]>(clubsApiPath(API_ROUTES.clubs.path.list()))
  } catch (error) {
    throw toApiServiceError(error, LIST_CLUBS_FALLBACK_ERROR)
  }
}

export async function createClub(data: CreateClubInput): Promise<ClubResponse> {
  try {
    return await api.post<ClubResponse>(clubsApiPath(API_ROUTES.clubs.path.create()), data)
  } catch (error) {
    throw toApiServiceError(error, CREATE_CLUB_FALLBACK_ERROR)
  }
}

export async function updateClub(documentId: string, data: UpdateClubInput): Promise<ClubResponse> {
  try {
    return await api.patch<ClubResponse>(
      clubsApiPath(API_ROUTES.clubs.path.update(documentId)),
      data
    )
  } catch (error) {
    throw toApiServiceError(error, UPDATE_CLUB_FALLBACK_ERROR)
  }
}

export async function deleteClub(documentId: string): Promise<void> {
  try {
    await api.delete(clubsApiPath(API_ROUTES.clubs.path.delete(documentId)))
  } catch (error) {
    throw toApiServiceError(error, DELETE_CLUB_FALLBACK_ERROR)
  }
}
