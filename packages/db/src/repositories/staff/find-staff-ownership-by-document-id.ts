import { and, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { locations } from '../../schema/location.ts'
import { owners } from '../../schema/owner.ts'
import { staff } from '../../schema/staff.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { staffLocationsLnk } from '../../schema/staff-location-lnk.ts'

export async function findStaffOwnershipByDocumentId(
  staffDocumentId: string,
  ownerDocumentId: string
): Promise<{ staffId: number; accountId: number } | null> {
  const [row] = await db
    .select({ staffId: staff.id, accountId: accounts.id })
    .from(staff)
    .innerJoin(staffLocationsLnk, eq(staffLocationsLnk.staffId, staff.id))
    .innerJoin(locations, eq(locations.id, staffLocationsLnk.locationId))
    .innerJoin(owners, eq(owners.id, locations.ownerId))
    .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.staffId, staff.id))
    .innerJoin(accounts, eq(accounts.id, staffAccountsLnk.accountId))
    .where(and(eq(staff.documentId, staffDocumentId), eq(owners.documentId, ownerDocumentId)))
    .limit(1)

  return row ?? null
}
