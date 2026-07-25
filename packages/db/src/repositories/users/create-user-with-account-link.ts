import type { Transaction } from '../../client.ts'
import { userAccountsLnk } from '../../schema/user-account-lnk.ts'
import { users } from '../../schema/user.ts'
import type { UserProfileSeed } from '@repo/types'

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
