import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { userAccountsLnk } from '../../schema/user-account-lnk.ts'
import { users } from '../../schema/user.ts'

export async function findUserDocumentIdByAccountId(accountId: number): Promise<string | null> {
  const [row] = await db
    .select({ documentId: users.documentId })
    .from(userAccountsLnk)
    .innerJoin(users, eq(users.id, userAccountsLnk.userId))
    .where(eq(userAccountsLnk.accountId, accountId))
    .limit(1)

  return row?.documentId ?? null
}
