import { and, eq, gt, isNull } from 'drizzle-orm'
import { db, type Transaction } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { accountSessions } from '../../schema/account-session.ts'
import { passwordResetTokens } from '../../schema/password-reset-token.ts'

export type CompletePasswordResetInput = {
  accountId: number
  hashedPassword: string
  tokenId: number
}

export async function completePasswordReset({
  accountId,
  hashedPassword,
  tokenId,
}: CompletePasswordResetInput): Promise<boolean> {
  return db.transaction(async (tx: Transaction) => {
    const now = new Date()
    const [consumedToken] = await tx
      .delete(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.id, tokenId),
          eq(passwordResetTokens.accountId, accountId),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now)
        )
      )
      .returning({ id: passwordResetTokens.id })

    if (!consumedToken) {
      return false
    }

    await tx
      .update(accounts)
      .set({ password: hashedPassword, updatedAt: now })
      .where(eq(accounts.id, accountId))

    await tx
      .update(accountSessions)
      .set({ revokedAt: now, updatedAt: now })
      .where(and(eq(accountSessions.accountId, accountId), isNull(accountSessions.revokedAt)))

    return true
  })
}
