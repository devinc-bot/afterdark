import { desc, eq } from 'drizzle-orm'
import { USER_ROLE } from '@afterdark/types'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { clubs } from '../../schema/club.ts'
import { owners } from '../../schema/owner.ts'
import { staff } from '../../schema/staff.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { staffClubsLnk } from '../../schema/staff-club-lnk.ts'
import type { OwnerStaffPersonnelRow } from '@afterdark/types'

export async function findPersonnelByOwnerDocumentId(
  ownerDocumentId: string
): Promise<OwnerStaffPersonnelRow[]> {
  const rows = await db
    .select({
      staffDocumentId: staff.documentId,
      name: staff.name,
      lastName: staff.lastName,
      email: accounts.email,
      avatar: staff.avatar,
      staffStatus: staff.status,
      clubDocumentId: clubs.documentId,
      clubName: clubs.name,
      lastActiveAt: staff.updatedAt,
    })
    .from(staffClubsLnk)
    .innerJoin(staff, eq(staff.id, staffClubsLnk.staffId))
    .innerJoin(clubs, eq(clubs.id, staffClubsLnk.clubId))
    .innerJoin(owners, eq(owners.id, clubs.ownerId))
    .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.staffId, staff.id))
    .innerJoin(accounts, eq(accounts.id, staffAccountsLnk.accountId))
    .where(eq(owners.documentId, ownerDocumentId))
    .orderBy(desc(staff.updatedAt))

  return rows.map((row) => ({ ...row, role: USER_ROLE.STAFF }))
}
