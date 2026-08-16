import { eq } from 'drizzle-orm'
import { db, type Transaction } from '../../client.ts'
import { organizationAccountsLnk } from '../../schema/organization-account-lnk.ts'
import { organizations } from '../../schema/organization.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { owners } from '../../schema/owner.ts'
import type { OwnerUpdateInput } from '@repo/types'

export async function updateOwnerByDocumentId(
  documentId: string,
  input: OwnerUpdateInput
): Promise<void> {
  await db.transaction(async (tx: Transaction) => {
    const memberships = await tx
      .select({ ownerId: owners.id, organizationId: organizations.id })
      .from(owners)
      .innerJoin(ownerAccountsLnk, eq(ownerAccountsLnk.ownerId, owners.id))
      .innerJoin(
        organizationAccountsLnk,
        eq(organizationAccountsLnk.accountId, ownerAccountsLnk.accountId)
      )
      .innerJoin(organizations, eq(organizations.id, organizationAccountsLnk.organizationId))
      .where(eq(owners.documentId, documentId))
      .limit(2)

    if (memberships.length !== 1) {
      throw new Error('Owner organization membership must resolve to exactly one organization')
    }

    const membership = memberships[0]!
    const updatedAt = new Date()
    const organizationName =
      input.organizationName?.trim() || `${input.name} ${input.lastName}`.trim()

    await tx
      .update(owners)
      .set({
        name: input.name,
        lastName: input.lastName,
        phone: input.phone,
        birthday: input.birthday,
        nationalId: input.nationalId,
        updatedAt,
      })
      .where(eq(owners.id, membership.ownerId))

    await tx
      .update(organizations)
      .set({ name: organizationName, taxId: input.taxId, updatedAt })
      .where(eq(organizations.id, membership.organizationId))
  })
}
