import type { OrganizationSelect, StaffInvitationSelect } from '@repo/db'
import type { CreateStaffInvitationResponse } from '@repo/types'
import { ENV } from '../../../config/env'
import { buildStaffInvitationUrl } from '../utils/staff-invitation.utils'

export function toStaffInvitationResponse(
  invitation: StaffInvitationSelect,
  organization: Pick<OrganizationSelect, 'documentId' | 'name'>,
  invitedByOwnerDocumentId: string
): CreateStaffInvitationResponse {
  return {
    documentId: invitation.documentId,
    email: invitation.email,
    organizationId: organization.documentId,
    organizationName: organization.name,
    invitedByOwnerId: invitedByOwnerDocumentId,
    slug: invitation.slug,
    url: buildStaffInvitationUrl(ENV.DASHBOARD_URL, invitation.slug, invitation.token),
    expiresAt: invitation.expiresAt,
    hasSecurityWord: Boolean(invitation.securityWordHash),
    status: invitation.status,
    role: invitation.role,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
  }
}
