import { and, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { staffInvitations, type StaffInvitationSelect } from '../../schema/staff-invitation.ts'
import { findSoleOrganizationByOwnerDocumentId } from '../organizations/find-sole-organization-by-owner-document-id.ts'

export async function findStaffInvitationByDocumentIdForOwner(
  invitationDocumentId: string,
  ownerDocumentId: string
): Promise<StaffInvitationSelect | null> {
  const organization = await findSoleOrganizationByOwnerDocumentId(ownerDocumentId)
  if (!organization) return null

  const [row] = await db
    .select({ invitation: staffInvitations })
    .from(staffInvitations)
    .where(
      and(
        eq(staffInvitations.documentId, invitationDocumentId),
        eq(staffInvitations.organizationId, organization.id)
      )
    )
    .limit(1)

  return row?.invitation ?? null
}
