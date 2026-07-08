import { and, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { owners } from '../../schema/owner.ts'
import { staffInvitations, type StaffInvitationSelect } from '../../schema/staff-invitation.ts'

export async function findStaffInvitationByDocumentIdForOwner(
  invitationDocumentId: string,
  ownerDocumentId: string
): Promise<StaffInvitationSelect | null> {
  const [row] = await db
    .select({ invitation: staffInvitations })
    .from(staffInvitations)
    .innerJoin(owners, eq(owners.id, staffInvitations.invitedByOwnerId))
    .where(
      and(
        eq(staffInvitations.documentId, invitationDocumentId),
        eq(owners.documentId, ownerDocumentId)
      )
    )
    .limit(1)

  return row?.invitation ?? null
}
