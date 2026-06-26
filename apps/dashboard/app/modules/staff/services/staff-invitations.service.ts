import type { CreateStaffInvitationResponse } from '@afterdark/types'
import type { CreateStaffInvitationInput } from '@afterdark/validators'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { toApiServiceError } from '~/modules/common/utils/api-service-error.utils'

const LIST_STAFF_INVITATIONS_FALLBACK_ERROR =
  'No pudimos cargar las invitaciones. Intentá de nuevo.'

const CREATE_STAFF_INVITATION_FALLBACK_ERROR = 'No se pudo crear la invitación.'

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
