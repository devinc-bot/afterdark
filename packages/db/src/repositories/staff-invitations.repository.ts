import { desc, eq } from 'drizzle-orm'
import { db } from '../client.ts'
import { clubs } from '../schema/club.ts'
import { owners } from '../schema/owner.ts'
import {
  staffInvitations,
  type StaffInvitationInsert,
  type StaffInvitationSelect,
} from '../schema/staff-invitation.ts'

export async function createStaffInvitation(
  input: StaffInvitationInsert
): Promise<StaffInvitationSelect> {
  const [invitation] = await db.insert(staffInvitations).values(input).returning()

  if (!invitation) {
    throw new Error('Staff invitation insert returned no row')
  }

  return invitation
}

export type StaffInvitationWithClubRow = {
  invitation: StaffInvitationSelect
  clubDocumentId: string
  clubName: string
}

export async function findStaffInvitationsByOwnerDocumentId(
  ownerDocumentId: string
): Promise<StaffInvitationWithClubRow[]> {
  const rows = await db
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
    .innerJoin(owners, eq(owners.id, staffInvitations.invitedByOwnerId))
    .innerJoin(clubs, eq(clubs.id, staffInvitations.clubId))
    .where(eq(owners.documentId, ownerDocumentId))
    .orderBy(desc(staffInvitations.createdAt))

  return rows.map((row) => ({
    invitation: row.invitation,
    clubDocumentId: row.clubDocumentId,
    clubName: row.clubName,
  }))
}
