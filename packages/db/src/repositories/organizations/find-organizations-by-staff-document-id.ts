import { eq } from 'drizzle-orm'
import type { OrganizationRow } from '@repo/types'
import { db } from '../../client.ts'
import { organizationAccountsLnk } from '../../schema/organization-account-lnk.ts'
import { organizations } from '../../schema/organization.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { staff } from '../../schema/staff.ts'

export async function findOrganizationsByStaffDocumentId(
  staffDocumentId: string
): Promise<OrganizationRow[]> {
  return db
    .select({
      id: organizations.id,
      documentId: organizations.documentId,
      name: organizations.name,
      taxId: organizations.taxId,
    })
    .from(staff)
    .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.staffId, staff.id))
    .innerJoin(
      organizationAccountsLnk,
      eq(organizationAccountsLnk.accountId, staffAccountsLnk.accountId)
    )
    .innerJoin(organizations, eq(organizations.id, organizationAccountsLnk.organizationId))
    .where(eq(staff.documentId, staffDocumentId))
}
