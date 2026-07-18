import { desc, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { locations } from '../../schema/location.ts'
import { owners } from '../../schema/owner.ts'
import { staffInvitations } from '../../schema/staff-invitation.ts'
import type { StaffInvitationWithLocationRow } from '@afterdark/types'

export async function findStaffInvitationsByOwnerDocumentId(
  ownerDocumentId: string
): Promise<StaffInvitationWithLocationRow[]> {
  const rows = await db
    .select({
      invitation: {
        id: staffInvitations.id,
        documentId: staffInvitations.documentId,
        createdAt: staffInvitations.createdAt,
        updatedAt: staffInvitations.updatedAt,
        email: staffInvitations.email,
        locationId: staffInvitations.locationId,
        invitedByOwnerId: staffInvitations.invitedByOwnerId,
        slug: staffInvitations.slug,
        token: staffInvitations.token,
        securityWordHash: staffInvitations.securityWordHash,
        expiresAt: staffInvitations.expiresAt,
        status: staffInvitations.status,
        role: staffInvitations.role,
        acceptedAt: staffInvitations.acceptedAt,
      },
      locationDocumentId: locations.documentId,
      locationName: locations.name,
    })
    .from(staffInvitations)
    .innerJoin(owners, eq(owners.id, staffInvitations.invitedByOwnerId))
    .innerJoin(locations, eq(locations.id, staffInvitations.locationId))
    .where(eq(owners.documentId, ownerDocumentId))
    .orderBy(desc(staffInvitations.createdAt))

  return rows.map((row) => ({
    invitation: row.invitation,
    locationDocumentId: row.locationDocumentId,
    locationName: row.locationName,
  }))
}
