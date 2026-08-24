import { and, eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { USER_ROLE, type UserRole } from '@repo/types/enums'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { locations } from '../../schema/location.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { owners } from '../../schema/owner.ts'
import { organizationAccountsLnk } from '../../schema/organization-account-lnk.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { staff } from '../../schema/staff.ts'

type TicketCheckInOperatorRole = typeof USER_ROLE.OWNER | typeof USER_ROLE.STAFF

const ownerOrganizationAccountsLnk = alias(
  organizationAccountsLnk,
  'owner_organization_accounts_lnk'
)

export type TicketCheckInOperatorRow = {
  accountId: number
  documentId: string
  name: string
  lastName: string
  email: string
  role: TicketCheckInOperatorRole
}

async function findOwnerOperatorForLocation(
  operatorDocumentId: string,
  locationId: number
): Promise<TicketCheckInOperatorRow | null> {
  const row = await db
    .select({
      accountId: accounts.id,
      documentId: owners.documentId,
      name: owners.name,
      lastName: owners.lastName,
      email: accounts.email,
    })
    .from(owners)
    .innerJoin(ownerAccountsLnk, eq(ownerAccountsLnk.ownerId, owners.id))
    .innerJoin(accounts, eq(accounts.id, ownerAccountsLnk.accountId))
    .innerJoin(locations, eq(locations.ownerId, owners.id))
    .where(and(eq(owners.documentId, operatorDocumentId), eq(locations.id, locationId)))
    .limit(1)

  return row[0] ? { ...row[0], role: USER_ROLE.OWNER } : null
}

async function findStaffOperatorForLocation(
  operatorDocumentId: string,
  locationId: number
): Promise<TicketCheckInOperatorRow | null> {
  const row = await db
    .select({
      accountId: accounts.id,
      documentId: staff.documentId,
      name: staff.name,
      lastName: staff.lastName,
      email: accounts.email,
    })
    .from(staff)
    .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.staffId, staff.id))
    .innerJoin(accounts, eq(accounts.id, staffAccountsLnk.accountId))
    .innerJoin(organizationAccountsLnk, eq(organizationAccountsLnk.accountId, accounts.id))
    .innerJoin(
      ownerOrganizationAccountsLnk,
      eq(ownerOrganizationAccountsLnk.organizationId, organizationAccountsLnk.organizationId)
    )
    .innerJoin(
      ownerAccountsLnk,
      eq(ownerAccountsLnk.accountId, ownerOrganizationAccountsLnk.accountId)
    )
    .innerJoin(owners, eq(owners.id, ownerAccountsLnk.ownerId))
    .innerJoin(locations, eq(locations.ownerId, owners.id))
    .where(and(eq(staff.documentId, operatorDocumentId), eq(locations.id, locationId)))
    .limit(1)

  return row[0] ? { ...row[0], role: USER_ROLE.STAFF } : null
}

export async function findTicketCheckInOperatorForLocation(params: {
  operatorDocumentId: string
  operatorRole: UserRole
  locationId: number
}): Promise<TicketCheckInOperatorRow | null> {
  if (params.operatorRole === USER_ROLE.OWNER) {
    return findOwnerOperatorForLocation(params.operatorDocumentId, params.locationId)
  }

  if (params.operatorRole === USER_ROLE.STAFF) {
    return findStaffOperatorForLocation(params.operatorDocumentId, params.locationId)
  }

  return null
}
