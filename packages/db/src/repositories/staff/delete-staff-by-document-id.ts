import { and, eq } from 'drizzle-orm'
import { db, type Transaction } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { accountRolesLnk } from '../../schema/account-role-lnk.ts'
import { organizationAccountsLnk } from '../../schema/organization-account-lnk.ts'
import { staff } from '../../schema/staff.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { findStaffOwnershipByDocumentId } from './find-staff-ownership-by-document-id.ts'

export async function deleteStaffByDocumentId(
  staffDocumentId: string,
  ownerDocumentId: string
): Promise<boolean> {
  const ownership = await findStaffOwnershipByDocumentId(staffDocumentId, ownerDocumentId)
  if (!ownership) return false

  await db.transaction(async (tx: Transaction) => {
    await tx
      .delete(organizationAccountsLnk)
      .where(
        and(
          eq(organizationAccountsLnk.accountId, ownership.accountId),
          eq(organizationAccountsLnk.organizationId, ownership.organizationId)
        )
      )

    const [remainingMembership] = await tx
      .select({ id: organizationAccountsLnk.id })
      .from(organizationAccountsLnk)
      .where(eq(organizationAccountsLnk.accountId, ownership.accountId))
      .limit(1)

    if (remainingMembership) return

    await tx.delete(accountRolesLnk).where(eq(accountRolesLnk.accountId, ownership.accountId))
    await tx.delete(staffAccountsLnk).where(eq(staffAccountsLnk.staffId, ownership.staffId))
    await tx.delete(staff).where(eq(staff.id, ownership.staffId))
    await tx.delete(accounts).where(eq(accounts.id, ownership.accountId))
  })

  return true
}
