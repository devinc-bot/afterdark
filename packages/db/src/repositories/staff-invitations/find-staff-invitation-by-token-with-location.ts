import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { locations } from '../../schema/location.ts'
import { staffInvitations } from '../../schema/staff-invitation.ts'
import type { StaffInvitationWithLocationRow } from '@afterdark/types'

export async function findStaffInvitationByTokenWithLocation(
  token: string
): Promise<StaffInvitationWithLocationRow | null> {
  const [row] = await db
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
    .innerJoin(locations, eq(locations.id, staffInvitations.locationId))
    .where(eq(staffInvitations.token, token))
    .limit(1)

  if (!row) {
    return null
  }

  return {
    invitation: row.invitation,
    locationDocumentId: row.locationDocumentId,
    locationName: row.locationName,
  }
}
