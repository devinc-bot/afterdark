import { and, count, eq, gte, gt, isNull } from 'drizzle-orm'
import { db } from '../../client.ts'
import {
  passwordResetTokens,
  type PasswordResetTokenInsert,
  type PasswordResetTokenSelect,
} from '../../schema/password-reset-token.ts'

export async function createPasswordResetToken(
  input: PasswordResetTokenInsert
): Promise<PasswordResetTokenSelect> {
  const [row] = await db.insert(passwordResetTokens).values(input).returning()

  if (!row) {
    throw new Error('Password reset token insert returned no row')
  }

  return row
}

export async function countPasswordResetTokensForAccountSince(
  accountId: number,
  since: Date
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(passwordResetTokens)
    .where(
      and(eq(passwordResetTokens.accountId, accountId), gte(passwordResetTokens.createdAt, since))
    )

  return row?.value ?? 0
}

export async function invalidatePendingPasswordResetTokensForAccount(
  accountId: number
): Promise<void> {
  const now = new Date()
  await db
    .update(passwordResetTokens)
    .set({ usedAt: now, updatedAt: now })
    .where(and(eq(passwordResetTokens.accountId, accountId), isNull(passwordResetTokens.usedAt)))
}

export async function findValidPasswordResetToken(
  token: string
): Promise<PasswordResetTokenSelect | null> {
  const now = new Date()
  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now)
      )
    )
    .limit(1)

  return row ?? null
}

export async function markPasswordResetTokenUsed(id: number): Promise<void> {
  const now = new Date()
  await db
    .update(passwordResetTokens)
    .set({ usedAt: now, updatedAt: now })
    .where(eq(passwordResetTokens.id, id))
}
