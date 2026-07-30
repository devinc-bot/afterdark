import { desc, eq } from 'drizzle-orm'
import { USER_ROLE } from '@repo/types'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { assets } from '../../schema/asset.ts'
import { locations } from '../../schema/location.ts'
import { owners } from '../../schema/owner.ts'
import { staff } from '../../schema/staff.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { staffLocationsLnk } from '../../schema/staff-location-lnk.ts'
import type { OwnerStaffPersonnelRow } from '@repo/types'

export async function findPersonnelByOwnerDocumentId(
  ownerDocumentId: string
): Promise<OwnerStaffPersonnelRow[]> {
  const rows = await db
    .select({
      staffDocumentId: staff.documentId,
      name: staff.name,
      lastName: staff.lastName,
      email: accounts.email,
      avatar: assets.url,
      staffStatus: staff.status,
      locationDocumentId: locations.documentId,
      locationName: locations.name,
      lastActiveAt: staff.updatedAt,
    })
    .from(staffLocationsLnk)
    .innerJoin(staff, eq(staff.id, staffLocationsLnk.staffId))
    .innerJoin(locations, eq(locations.id, staffLocationsLnk.locationId))
    .innerJoin(owners, eq(owners.id, locations.ownerId))
    .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.staffId, staff.id))
    .innerJoin(accounts, eq(accounts.id, staffAccountsLnk.accountId))
    .leftJoin(assets, eq(assets.id, staff.avatarId))
    .where(eq(owners.documentId, ownerDocumentId))
    .orderBy(desc(staff.updatedAt))

  return rows.map((row) => ({ ...row, role: USER_ROLE.STAFF }))
}
