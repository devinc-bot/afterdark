import { lt } from 'drizzle-orm'
import { db } from '../../client.ts'
import { userRegistrationTokens } from '../../schema/user-registration-token.ts'

export async function deleteExpiredUserRegistrationTokens(): Promise<number> {
  const deleted = await db
    .delete(userRegistrationTokens)
    .where(lt(userRegistrationTokens.expiresAt, new Date()))
    .returning({ id: userRegistrationTokens.id })

  return deleted.length
}
