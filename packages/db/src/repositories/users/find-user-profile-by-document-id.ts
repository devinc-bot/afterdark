import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { userAccountsLnk } from '../../schema/user-account-lnk.ts'
import { users } from '../../schema/user.ts'
import type { UserProfileRow } from '@afterdark/types'

export async function findUserProfileByDocumentId(
  documentId: string
): Promise<UserProfileRow | null> {
  const [row] = await db
    .select({
      documentId: users.documentId,
      name: users.name,
      lastName: users.lastName,
      phone: users.phone,
      avatar: users.avatar,
      email: accounts.email,
    })
    .from(users)
    .innerJoin(userAccountsLnk, eq(userAccountsLnk.userId, users.id))
    .innerJoin(accounts, eq(accounts.id, userAccountsLnk.accountId))
    .where(eq(users.documentId, documentId))
    .limit(1)

  return row ?? null
}
