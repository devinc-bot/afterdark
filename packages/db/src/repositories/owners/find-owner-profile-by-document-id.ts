import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { owners } from '../../schema/owner.ts'
import type { OwnerProfileRow } from '@repo/types'

export async function findOwnerProfileByDocumentId(
  documentId: string
): Promise<OwnerProfileRow | null> {
  const [row] = await db
    .select({
      documentId: owners.documentId,
      name: owners.name,
      lastName: owners.lastName,
      avatar: owners.avatar,
      email: accounts.email,
    })
    .from(owners)
    .innerJoin(ownerAccountsLnk, eq(ownerAccountsLnk.ownerId, owners.id))
    .innerJoin(accounts, eq(accounts.id, ownerAccountsLnk.accountId))
    .where(eq(owners.documentId, documentId))
    .limit(1)

  return row ?? null
}
