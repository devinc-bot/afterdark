import { eq } from 'drizzle-orm'
import type { StaffInvitationWithOrganizationRow } from '@repo/types'
import { db } from '../../client.ts'
import { organizations } from '../../schema/organization.ts'
import { staffInvitations } from '../../schema/staff-invitation.ts'

export async function findStaffInvitationByTokenWithOrganization(
  token: string
): Promise<StaffInvitationWithOrganizationRow | null> {
  const [row] = await db
    .select({
      invitation: staffInvitations,
      organizationDocumentId: organizations.documentId,
      organizationName: organizations.name,
    })
    .from(staffInvitations)
    .innerJoin(organizations, eq(organizations.id, staffInvitations.organizationId))
    .where(eq(staffInvitations.token, token))
    .limit(1)

  return row ?? null
}
