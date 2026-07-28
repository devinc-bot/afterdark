import { and, count, eq, gte, gt, isNull } from 'drizzle-orm'
import { db } from '../../client.ts'
import {
  ownerRegistrationTokens,
  type OwnerRegistrationTokenInsert,
  type OwnerRegistrationTokenSelect,
} from '../../schema/owner-registration-token.ts'

export async function createOwnerRegistrationToken(
  input: OwnerRegistrationTokenInsert
): Promise<OwnerRegistrationTokenSelect> {
  const [row] = await db.insert(ownerRegistrationTokens).values(input).returning()

  if (!row) {
    throw new Error('Owner registration token insert returned no row')
  }

  return row
}

export async function countOwnerRegistrationTokensForEmailSince(
  email: string,
  since: Date
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(ownerRegistrationTokens)
    .where(
      and(eq(ownerRegistrationTokens.email, email), gte(ownerRegistrationTokens.createdAt, since))
    )

  return row?.value ?? 0
}

export async function invalidatePendingOwnerRegistrationTokensForEmail(
  email: string
): Promise<void> {
  const now = new Date()
  await db
    .update(ownerRegistrationTokens)
    .set({ usedAt: now, updatedAt: now })
    .where(and(eq(ownerRegistrationTokens.email, email), isNull(ownerRegistrationTokens.usedAt)))
}

export async function findOwnerRegistrationTokenByToken(
  token: string
): Promise<OwnerRegistrationTokenSelect | null> {
  const [row] = await db
    .select()
    .from(ownerRegistrationTokens)
    .where(eq(ownerRegistrationTokens.token, token))
    .limit(1)

  return row ?? null
}

export async function findValidOwnerRegistrationToken(
  token: string
): Promise<OwnerRegistrationTokenSelect | null> {
  const now = new Date()
  const [row] = await db
    .select()
    .from(ownerRegistrationTokens)
    .where(
      and(
        eq(ownerRegistrationTokens.token, token),
        isNull(ownerRegistrationTokens.usedAt),
        gt(ownerRegistrationTokens.expiresAt, now)
      )
    )
    .limit(1)

  return row ?? null
}

export async function markOwnerRegistrationTokenUsed(id: number): Promise<void> {
  const now = new Date()
  await db
    .update(ownerRegistrationTokens)
    .set({ usedAt: now, updatedAt: now })
    .where(eq(ownerRegistrationTokens.id, id))
}
