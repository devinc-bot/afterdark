import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { owners } from '../../schema/owner.ts'

export async function findAccountIdByOwnerDocumentId(documentId: string): Promise<number | null> {
  const [row] = await db
    .select({ accountId: ownerAccountsLnk.accountId })
    .from(owners)
    .innerJoin(ownerAccountsLnk, eq(ownerAccountsLnk.ownerId, owners.id))
    .where(eq(owners.documentId, documentId))
    .limit(1)

  return row?.accountId ?? null
}
