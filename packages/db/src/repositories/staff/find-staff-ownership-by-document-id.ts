import { and, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { organizationAccountsLnk } from '../../schema/organization-account-lnk.ts'
import { staff } from '../../schema/staff.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { findSoleOrganizationByOwnerDocumentId } from '../organizations/find-sole-organization-by-owner-document-id.ts'

export async function findStaffOwnershipByDocumentId(
  staffDocumentId: string,
  ownerDocumentId: string
): Promise<{ staffId: number; accountId: number; organizationId: number } | null> {
  const organization = await findSoleOrganizationByOwnerDocumentId(ownerDocumentId)
  if (!organization) return null

  const [row] = await db
    .select({
      staffId: staff.id,
      accountId: accounts.id,
      organizationId: organizationAccountsLnk.organizationId,
    })
    .from(staff)
    .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.staffId, staff.id))
    .innerJoin(accounts, eq(accounts.id, staffAccountsLnk.accountId))
    .innerJoin(organizationAccountsLnk, eq(organizationAccountsLnk.accountId, accounts.id))
    .where(
      and(
        eq(staff.documentId, staffDocumentId),
        eq(organizationAccountsLnk.organizationId, organization.id)
      )
    )
    .limit(1)

  return row ?? null
}
