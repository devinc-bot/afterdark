import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { owners } from '../../schema/owner.ts'

export async function findOwnerDocumentIdByAccountId(accountId: number): Promise<string | null> {
  const [row] = await db
    .select({ documentId: owners.documentId })
    .from(ownerAccountsLnk)
    .innerJoin(owners, eq(owners.id, ownerAccountsLnk.ownerId))
    .where(eq(ownerAccountsLnk.accountId, accountId))
    .limit(1)

  return row?.documentId ?? null
}
