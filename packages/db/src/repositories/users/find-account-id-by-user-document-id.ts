import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { userAccountsLnk } from '../../schema/user-account-lnk.ts'
import { users } from '../../schema/user.ts'

export async function findAccountIdByUserDocumentId(documentId: string): Promise<number | null> {
  const [row] = await db
    .select({ accountId: userAccountsLnk.accountId })
    .from(users)
    .innerJoin(userAccountsLnk, eq(userAccountsLnk.userId, users.id))
    .where(eq(users.documentId, documentId))
    .limit(1)

  return row?.accountId ?? null
}
