import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { clubs } from '../../schema/club.ts'
import { staffInvitations } from '../../schema/staff-invitation.ts'
import type { StaffInvitationWithClubRow } from '@afterdark/types'

export async function findStaffInvitationByTokenWithClub(
  token: string
): Promise<StaffInvitationWithClubRow | null> {
  const [row] = await db
    .select({
      invitation: {
        id: staffInvitations.id,
        documentId: staffInvitations.documentId,
        createdAt: staffInvitations.createdAt,
        updatedAt: staffInvitations.updatedAt,
        email: staffInvitations.email,
        clubId: staffInvitations.clubId,
        invitedByOwnerId: staffInvitations.invitedByOwnerId,
        slug: staffInvitations.slug,
        token: staffInvitations.token,
        securityWordHash: staffInvitations.securityWordHash,
        expiresAt: staffInvitations.expiresAt,
        status: staffInvitations.status,
        role: staffInvitations.role,
        acceptedAt: staffInvitations.acceptedAt,
      },
      clubDocumentId: clubs.documentId,
      clubName: clubs.name,
    })
    .from(staffInvitations)
    .innerJoin(clubs, eq(clubs.id, staffInvitations.clubId))
    .where(eq(staffInvitations.token, token))
    .limit(1)

  if (!row) {
    return null
  }

  return {
    invitation: row.invitation,
    clubDocumentId: row.clubDocumentId,
    clubName: row.clubName,
  }
}
