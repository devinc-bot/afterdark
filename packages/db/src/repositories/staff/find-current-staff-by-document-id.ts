import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { staff } from '../../schema/staff.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import type { CurrentStaffRow } from '@afterdark/types'

export async function findCurrentStaffByDocumentId(
  documentId: string
): Promise<CurrentStaffRow | null> {
  const [row] = await db
    .select({
      documentId: staff.documentId,
      name: staff.name,
      lastName: staff.lastName,
      avatar: staff.avatar,
      phone: staff.phone,
      status: staff.status,
      email: accounts.email,
    })
    .from(staff)
    .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.staffId, staff.id))
    .innerJoin(accounts, eq(accounts.id, staffAccountsLnk.accountId))
    .where(eq(staff.documentId, documentId))
    .limit(1)

  return row ?? null
}
