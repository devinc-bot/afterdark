import type { CreateStaffInvitationResponse, StaffInvitationPublicResponse } from '@repo/types'
import type { AcceptStaffInvitationInput, CreateStaffInvitationInput } from '@repo/validators'
import { i18n } from '@repo/i18n/client'
import { api, API_ROUTES } from '~/config/api'
import { buildApiPath, QueryFactoryError, toApiServiceError } from '@repo/common'

export async function fetchStaffInvitations(): Promise<CreateStaffInvitationResponse[]> {
  try {
    return await api.get<CreateStaffInvitationResponse[]>(
      buildApiPath(API_ROUTES.invitations, API_ROUTES.invitations.path.staff())
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('staff:invitationsTable.loadError'))
  }
}

export async function postStaffInvitation(
  input: CreateStaffInvitationInput
): Promise<CreateStaffInvitationResponse> {
  try {
    return await api.post<CreateStaffInvitationResponse>(
      buildApiPath(API_ROUTES.invitations, API_ROUTES.invitations.path.staff()),
      input
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('errors:invitation.CREATE_FAILED'))
  }
}

export async function deleteStaffInvitation(documentId: string): Promise<void> {
  try {
    await api.delete(
      buildApiPath(API_ROUTES.invitations, API_ROUTES.invitations.path.deleteStaff(documentId))
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('staff:invitationsTable.deleteError'))
  }
}

export async function acceptStaffInvitation(
  slug: string,
  token: string,
  input: Omit<AcceptStaffInvitationInput, 'confirmPassword'>
): Promise<{ message: string }> {
  try {
    return await api.post<{ message: string }>(
      buildApiPath(API_ROUTES.invitations, API_ROUTES.invitations.path.acceptStaff(slug, token)),
      input
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('staff:invitation.accept.error'))
  }
}

export async function fetchStaffInvitationByLink(
  slug: string,
  token: string
): Promise<StaffInvitationPublicResponse> {
  try {
    return await api.get<StaffInvitationPublicResponse>(
      buildApiPath(API_ROUTES.invitations, API_ROUTES.invitations.path.staffByLink(slug, token))
    )
  } catch (error) {
    if (error instanceof QueryFactoryError) {
      throw error
    }

    throw toApiServiceError(error, i18n.t('errors:invitation.PUBLIC_GET_FAILED'))
  }
}
