import { desc, eq } from 'drizzle-orm'
import type { StaffInvitationWithOrganizationRow } from '@repo/types'
import { db } from '../../client.ts'
import { organizations } from '../../schema/organization.ts'
import { staffInvitations } from '../../schema/staff-invitation.ts'
import { findSoleOrganizationByOwnerDocumentId } from '../organizations/find-sole-organization-by-owner-document-id.ts'

export async function findStaffInvitationsByOwnerDocumentId(
  ownerDocumentId: string
): Promise<StaffInvitationWithOrganizationRow[]> {
  const organization = await findSoleOrganizationByOwnerDocumentId(ownerDocumentId)
  if (!organization) return []

  const rows = await db
    .select({
      invitation: staffInvitations,
      organizationDocumentId: organizations.documentId,
      organizationName: organizations.name,
    })
    .from(staffInvitations)
    .innerJoin(organizations, eq(organizations.id, staffInvitations.organizationId))
    .where(eq(staffInvitations.organizationId, organization.id))
    .orderBy(desc(staffInvitations.createdAt))

  return rows
}
