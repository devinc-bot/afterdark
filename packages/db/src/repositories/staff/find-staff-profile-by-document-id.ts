import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { assets } from '../../schema/asset.ts'
import { staff } from '../../schema/staff.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import type { StaffProfileRow } from '@repo/types'

export async function findStaffProfileByDocumentId(
  documentId: string
): Promise<StaffProfileRow | null> {
  const [row] = await db
    .select({
      documentId: staff.documentId,
      name: staff.name,
      lastName: staff.lastName,
      avatar: assets.url,
      email: accounts.email,
    })
    .from(staff)
    .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.staffId, staff.id))
    .innerJoin(accounts, eq(accounts.id, staffAccountsLnk.accountId))
    .leftJoin(assets, eq(assets.id, staff.avatarId))
    .where(eq(staff.documentId, documentId))
    .limit(1)

  return row ?? null
}
