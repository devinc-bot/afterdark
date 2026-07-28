import { and, count, eq, gte, gt, isNull } from 'drizzle-orm'
import { db } from '../../client.ts'
import {
  userRegistrationTokens,
  type UserRegistrationTokenInsert,
  type UserRegistrationTokenSelect,
} from '../../schema/user-registration-token.ts'

export async function createUserRegistrationToken(
  input: UserRegistrationTokenInsert
): Promise<UserRegistrationTokenSelect> {
  const [row] = await db.insert(userRegistrationTokens).values(input).returning()

  if (!row) {
    throw new Error('User registration token insert returned no row')
  }

  return row
}

export async function countUserRegistrationTokensForEmailSince(
  email: string,
  since: Date
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(userRegistrationTokens)
    .where(
      and(eq(userRegistrationTokens.email, email), gte(userRegistrationTokens.createdAt, since))
    )

  return row?.value ?? 0
}

export async function invalidatePendingUserRegistrationTokensForEmail(
  email: string
): Promise<void> {
  const now = new Date()
  await db
    .update(userRegistrationTokens)
    .set({ usedAt: now, updatedAt: now })
    .where(and(eq(userRegistrationTokens.email, email), isNull(userRegistrationTokens.usedAt)))
}

export async function findUserRegistrationTokenByToken(
  token: string
): Promise<UserRegistrationTokenSelect | null> {
  const [row] = await db
    .select()
    .from(userRegistrationTokens)
    .where(eq(userRegistrationTokens.token, token))
    .limit(1)

  return row ?? null
}

export async function findValidUserRegistrationToken(
  token: string
): Promise<UserRegistrationTokenSelect | null> {
  const now = new Date()
  const [row] = await db
    .select()
    .from(userRegistrationTokens)
    .where(
      and(
        eq(userRegistrationTokens.token, token),
        isNull(userRegistrationTokens.usedAt),
        gt(userRegistrationTokens.expiresAt, now)
      )
    )
    .limit(1)

  return row ?? null
}

export async function markUserRegistrationTokenUsed(id: number): Promise<void> {
  const now = new Date()
  await db
    .update(userRegistrationTokens)
    .set({ usedAt: now, updatedAt: now })
    .where(eq(userRegistrationTokens.id, id))
}
