import { eq } from 'drizzle-orm'
import { db, type Transaction } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { staff } from '../../schema/staff.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { staffClubsLnk } from '../../schema/staff-club-lnk.ts'
import { findStaffOwnershipByDocumentId } from './find-staff-ownership-by-document-id.ts'

export async function deleteStaffByDocumentId(
  staffDocumentId: string,
  ownerDocumentId: string
): Promise<boolean> {
  const ownership = await findStaffOwnershipByDocumentId(staffDocumentId, ownerDocumentId)
  if (!ownership) return false

  await db.transaction(async (tx: Transaction) => {
    await tx.delete(staffClubsLnk).where(eq(staffClubsLnk.staffId, ownership.staffId))
    await tx.delete(staffAccountsLnk).where(eq(staffAccountsLnk.staffId, ownership.staffId))
    await tx.delete(staff).where(eq(staff.id, ownership.staffId))
    await tx.delete(accounts).where(eq(accounts.id, ownership.accountId))
  })

  return true
}
