import { eq } from 'drizzle-orm'
import type { OrganizationRow } from '@repo/types'
import { db } from '../../client.ts'
import { organizationAccountsLnk } from '../../schema/organization-account-lnk.ts'
import { organizations } from '../../schema/organization.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { owners } from '../../schema/owner.ts'

export async function findSoleOrganizationByOwnerDocumentId(
  ownerDocumentId: string
): Promise<OrganizationRow | null> {
  const rows = await db
    .select({
      id: organizations.id,
      documentId: organizations.documentId,
      name: organizations.name,
      taxId: organizations.taxId,
    })
    .from(owners)
    .innerJoin(ownerAccountsLnk, eq(ownerAccountsLnk.ownerId, owners.id))
    .innerJoin(
      organizationAccountsLnk,
      eq(organizationAccountsLnk.accountId, ownerAccountsLnk.accountId)
    )
    .innerJoin(organizations, eq(organizations.id, organizationAccountsLnk.organizationId))
    .where(eq(owners.documentId, ownerDocumentId))
    .limit(2)

  return rows.length === 1 ? rows[0]! : null
}
