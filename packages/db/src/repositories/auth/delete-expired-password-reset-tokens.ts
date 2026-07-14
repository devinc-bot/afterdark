import { lt } from 'drizzle-orm'
import { db } from '../../client.ts'
import { passwordResetTokens } from '../../schema/password-reset-token.ts'

export async function deleteExpiredPasswordResetTokens(): Promise<number> {
  const deleted = await db
    .delete(passwordResetTokens)
    .where(lt(passwordResetTokens.expiresAt, new Date()))
    .returning({ id: passwordResetTokens.id })

  return deleted.length
}
