import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { staff } from '../../schema/staff.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'

export async function findStaffDocumentIdByAccountId(accountId: number): Promise<string | null> {
  const [row] = await db
    .select({ documentId: staff.documentId })
    .from(staffAccountsLnk)
    .innerJoin(staff, eq(staff.id, staffAccountsLnk.staffId))
    .where(eq(staffAccountsLnk.accountId, accountId))
    .limit(1)

  return row?.documentId ?? null
}
