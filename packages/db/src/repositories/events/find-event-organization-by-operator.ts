import { and, eq } from 'drizzle-orm'
import { USER_ROLE, type UserRole } from '@repo/types/enums'
import type { OrganizationRow } from '@repo/types'
import { db } from '../../client.ts'
import { events } from '../../schema/event.ts'
import { organizationAccountsLnk } from '../../schema/organization-account-lnk.ts'
import { organizations } from '../../schema/organization.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { owners } from '../../schema/owner.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { staff } from '../../schema/staff.ts'

const organizationColumns = {
  id: organizations.id,
  documentId: organizations.documentId,
  name: organizations.name,
  taxId: organizations.taxId,
}

async function findOwnerEventOrganization(
  operatorDocumentId: string,
  eventDocumentId: string
): Promise<OrganizationRow | null> {
  const rows = await db
    .select(organizationColumns)
    .from(events)
    .innerJoin(organizations, eq(organizations.id, events.organizationId))
    .innerJoin(
      organizationAccountsLnk,
      eq(organizationAccountsLnk.organizationId, events.organizationId)
    )
    .innerJoin(ownerAccountsLnk, eq(ownerAccountsLnk.accountId, organizationAccountsLnk.accountId))
    .innerJoin(owners, eq(owners.id, ownerAccountsLnk.ownerId))
    .where(and(eq(events.documentId, eventDocumentId), eq(owners.documentId, operatorDocumentId)))
    .limit(1)

  return rows[0] ?? null
}

async function findStaffEventOrganization(
  operatorDocumentId: string,
  eventDocumentId: string
): Promise<OrganizationRow | null> {
  const rows = await db
    .select(organizationColumns)
    .from(events)
    .innerJoin(organizations, eq(organizations.id, events.organizationId))
    .innerJoin(
      organizationAccountsLnk,
      eq(organizationAccountsLnk.organizationId, events.organizationId)
    )
    .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.accountId, organizationAccountsLnk.accountId))
    .innerJoin(staff, eq(staff.id, staffAccountsLnk.staffId))
    .where(and(eq(events.documentId, eventDocumentId), eq(staff.documentId, operatorDocumentId)))
    .limit(1)

  return rows[0] ?? null
}

export async function findEventOrganizationByOperator(params: {
  operatorDocumentId: string
  operatorRole: UserRole
  eventDocumentId: string
}): Promise<OrganizationRow | null> {
  if (params.operatorRole === USER_ROLE.OWNER) {
    return findOwnerEventOrganization(params.operatorDocumentId, params.eventDocumentId)
  }

  if (params.operatorRole === USER_ROLE.STAFF) {
    return findStaffEventOrganization(params.operatorDocumentId, params.eventDocumentId)
  }

  return null
}
