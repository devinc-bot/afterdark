import { eq } from 'drizzle-orm'
import { db, type Transaction } from '../client.ts'
import { accounts } from '../schema/account.ts'
import { userAccountsLnk } from '../schema/user-account-lnk.ts'
import { users } from '../schema/user.ts'

export type UserProfileRow = {
  documentId: string
  name: string
  lastName: string
  avatar: string | null
  email: string
}

export type UserProfileSeed = {
  name: string
  lastName: string
  phone: string
}

export async function findUserDocumentIdByAccountId(accountId: number): Promise<string | null> {
  const [row] = await db
    .select({ documentId: users.documentId })
    .from(userAccountsLnk)
    .innerJoin(users, eq(users.id, userAccountsLnk.userId))
    .where(eq(userAccountsLnk.accountId, accountId))
    .limit(1)

  return row?.documentId ?? null
}

export async function findUserProfileByDocumentId(
  documentId: string
): Promise<UserProfileRow | null> {
  const [row] = await db
    .select({
      documentId: users.documentId,
      name: users.name,
      lastName: users.lastName,
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

export async function createUserWithAccountLink(
  tx: Transaction,
  accountId: number,
  profile: UserProfileSeed
): Promise<string> {
  const [user] = await tx.insert(users).values(profile).returning()

  if (!user) {
    throw new Error('User insert returned no row')
  }

  await tx.insert(userAccountsLnk).values({
    userId: user.id,
    accountId,
  })

  return user.documentId
}
