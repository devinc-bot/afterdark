import { desc, eq } from 'drizzle-orm'
import { USER_ROLE } from '@repo/types'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { assets } from '../../schema/asset.ts'
import { organizationAccountsLnk } from '../../schema/organization-account-lnk.ts'
import { organizations } from '../../schema/organization.ts'
import { staff } from '../../schema/staff.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import type { OwnerStaffPersonnelRow } from '@repo/types'
import { findSoleOrganizationByOwnerDocumentId } from '../organizations/find-sole-organization-by-owner-document-id.ts'

export async function findPersonnelByOwnerDocumentId(
  ownerDocumentId: string
): Promise<OwnerStaffPersonnelRow[]> {
  const organization = await findSoleOrganizationByOwnerDocumentId(ownerDocumentId)
  if (!organization) return []

  const rows = await db
    .select({
      staffDocumentId: staff.documentId,
      name: staff.name,
      lastName: staff.lastName,
      email: accounts.email,
      avatar: assets.url,
      staffStatus: staff.status,
      organizationDocumentId: organizations.documentId,
      organizationName: organizations.name,
      lastActiveAt: staff.updatedAt,
    })
    .from(organizationAccountsLnk)
    .innerJoin(organizations, eq(organizations.id, organizationAccountsLnk.organizationId))
    .innerJoin(accounts, eq(accounts.id, organizationAccountsLnk.accountId))
    .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.accountId, accounts.id))
    .innerJoin(staff, eq(staff.id, staffAccountsLnk.staffId))
    .leftJoin(assets, eq(assets.id, staff.avatarId))
    .where(eq(organizationAccountsLnk.organizationId, organization.id))
    .orderBy(desc(staff.updatedAt))

  return rows.map((row) => ({ ...row, role: USER_ROLE.STAFF }))
}
