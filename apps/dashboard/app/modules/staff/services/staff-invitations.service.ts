import type { CreateStaffInvitationResponse, StaffInvitationPublicResponse } from '@afterdark/types'
import type { CreateStaffInvitationInput } from '@afterdark/validators'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { toApiServiceError } from '~/modules/common/utils/api-service-error.utils'
import { QueryFactoryError } from '~/modules/common/utils/query-factory'

const LIST_STAFF_INVITATIONS_FALLBACK_ERROR =
  'No pudimos cargar las invitaciones. Intentá de nuevo.'

const CREATE_STAFF_INVITATION_FALLBACK_ERROR = 'No se pudo crear la invitación.'

const DELETE_STAFF_INVITATION_FALLBACK_ERROR = 'No se pudo eliminar la invitación.'

const GET_STAFF_INVITATION_LINK_FALLBACK_ERROR = 'No se pudo obtener la invitación.'

function invitationsApiPath(path: string) {
  return `${API_ROUTES.invitations.prefix}${path}`
}

export async function fetchStaffInvitations(): Promise<CreateStaffInvitationResponse[]> {
  try {
    return await api.get<CreateStaffInvitationResponse[]>(
      invitationsApiPath(API_ROUTES.invitations.path.staff())
    )
  } catch (error) {
    throw toApiServiceError(error, LIST_STAFF_INVITATIONS_FALLBACK_ERROR)
  }
}

export async function postStaffInvitation(
  input: CreateStaffInvitationInput
): Promise<CreateStaffInvitationResponse> {
  try {
    return await api.post<CreateStaffInvitationResponse>(
      invitationsApiPath(API_ROUTES.invitations.path.staff()),
      input
    )
  } catch (error) {
    throw toApiServiceError(error, CREATE_STAFF_INVITATION_FALLBACK_ERROR)
  }
}

export async function deleteStaffInvitation(documentId: string): Promise<void> {
  try {
    await api.delete(invitationsApiPath(API_ROUTES.invitations.path.deleteStaff(documentId)))
  } catch (error) {
    throw toApiServiceError(error, DELETE_STAFF_INVITATION_FALLBACK_ERROR)
  }
}

export async function fetchStaffInvitationByLink(
  slug: string,
  token: string
): Promise<StaffInvitationPublicResponse> {
  try {
    return await api.get<StaffInvitationPublicResponse>(
      invitationsApiPath(API_ROUTES.invitations.path.staffByLink(slug, token))
    )
  } catch (error) {
    if (error instanceof QueryFactoryError) {
      throw error
    }

    throw toApiServiceError(error, GET_STAFF_INVITATION_LINK_FALLBACK_ERROR)
  }
}
