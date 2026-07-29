import { lt } from 'drizzle-orm'
import { db } from '../../client.ts'
import { ownerRegistrationTokens } from '../../schema/owner-registration-token.ts'

export async function deleteExpiredOwnerRegistrationTokens(): Promise<number> {
  const deleted = await db
    .delete(ownerRegistrationTokens)
    .where(lt(ownerRegistrationTokens.expiresAt, new Date()))
    .returning({ id: ownerRegistrationTokens.id })

  return deleted.length
}
