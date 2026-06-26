import type { ClubResponse } from '@afterdark/types'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { QueryFactoryError } from '~/modules/common/utils/query-factory'

const CREATE_CLUB_FALLBACK_ERROR = 'No pudimos registrar el club. Intentá de nuevo en unos minutos.'
const LIST_CLUBS_FALLBACK_ERROR = 'No pudimos cargar los clubes. Intentá de nuevo en unos minutos.'
const UPDATE_CLUB_FALLBACK_ERROR =
  'No pudimos actualizar el club. Intentá de nuevo en unos minutos.'
const DELETE_CLUB_FALLBACK_ERROR = 'No pudimos eliminar el club. Intentá de nuevo en unos minutos.'

function clubsApiPath(path: string) {
  return `${API_ROUTES.clubs.prefix}${path}`
}

function toClubServiceError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof QueryFactoryError) {
    const apiMessage = error.body?.message
    return new Error(typeof apiMessage === 'string' ? apiMessage : fallbackMessage)
  }

  return new Error(fallbackMessage)
}

export async function fetchClubs(): Promise<ClubResponse[]> {
  try {
    return await api.get<ClubResponse[]>(clubsApiPath(API_ROUTES.clubs.path.list()))
  } catch (error) {
    throw toClubServiceError(error, LIST_CLUBS_FALLBACK_ERROR)
  }
}

export async function createClub(formData: FormData): Promise<ClubResponse> {
  try {
    return await api.post<ClubResponse>(clubsApiPath(API_ROUTES.clubs.path.create()), formData)
  } catch (error) {
    throw toClubServiceError(error, CREATE_CLUB_FALLBACK_ERROR)
  }
}

export async function updateClub(documentId: string, formData: FormData): Promise<ClubResponse> {
  try {
    return await api.patch<ClubResponse>(
      clubsApiPath(API_ROUTES.clubs.path.update(documentId)),
      formData
    )
  } catch (error) {
    throw toClubServiceError(error, UPDATE_CLUB_FALLBACK_ERROR)
  }
}

export async function deleteClub(documentId: string): Promise<void> {
  try {
    await api.delete(clubsApiPath(API_ROUTES.clubs.path.delete(documentId)))
  } catch (error) {
    throw toClubServiceError(error, DELETE_CLUB_FALLBACK_ERROR)
  }
}
