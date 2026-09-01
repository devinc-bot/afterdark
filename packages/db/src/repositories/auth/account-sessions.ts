import { and, asc, eq, gt, inArray, isNull, lte, or } from 'drizzle-orm'
import { db, type Transaction } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { accountRolesLnk } from '../../schema/account-role-lnk.ts'
import {
  accountSessions,
  type AccountSessionInsert,
  type AccountSessionSelect,
} from '../../schema/account-session.ts'
import { roles } from '../../schema/role.ts'

const MAXIMUM_ACTIVE_ACCOUNT_SESSIONS = 7

export type RotateAccountSessionInput = {
  documentId: string
  clientApp: AccountSessionInsert['clientApp']
  expectedRefreshTokenHash: string
  expectedRefreshTokenVersion: number
  refreshTokenHash: string
  expiresAt: Date
}

export type RevokeAccountSessionInput = {
  documentId: string
  clientApp: AccountSessionInsert['clientApp']
  expectedRefreshTokenHash: string
  expectedRefreshTokenVersion: number
}

export async function findAccountSessionForRefresh(
  documentId: string,
  clientApp: AccountSessionInsert['clientApp']
) {
  const [row] = await db
    .select({
      session: accountSessions,
      account: accounts,
      role: roles,
    })
    .from(accountSessions)
    .innerJoin(accounts, eq(accounts.id, accountSessions.accountId))
    .innerJoin(accountRolesLnk, eq(accountRolesLnk.accountId, accounts.id))
    .innerJoin(roles, eq(roles.id, accountRolesLnk.roleId))
    .where(
      and(eq(accountSessions.documentId, documentId), eq(accountSessions.clientApp, clientApp))
    )
    .limit(1)

  return row ?? null
}

export async function createAccountSession(
  input: AccountSessionInsert
): Promise<AccountSessionSelect> {
  return db.transaction(async (tx: Transaction) => {
    const lockedAccount = await tx
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.id, input.accountId))
      .for('update')

    if (lockedAccount.length === 0) {
      throw new Error('Account not found while creating session')
    }

    const now = new Date()
    const activeSessions = await tx
      .select({ id: accountSessions.id })
      .from(accountSessions)
      .where(
        and(
          eq(accountSessions.accountId, input.accountId),
          isNull(accountSessions.revokedAt),
          gt(accountSessions.expiresAt, now)
        )
      )
      .orderBy(asc(accountSessions.createdAt), asc(accountSessions.id))

    const sessionsToRevoke = activeSessions.slice(MAXIMUM_ACTIVE_ACCOUNT_SESSIONS - 1)
    if (sessionsToRevoke.length > 0) {
      await tx
        .update(accountSessions)
        .set({ revokedAt: now, updatedAt: now })
        .where(
          inArray(
            accountSessions.id,
            sessionsToRevoke.map((session) => session.id)
          )
        )
    }

    const [session] = await tx.insert(accountSessions).values(input).returning()
    if (!session) {
      throw new Error('Account session insert returned no row')
    }

    return session
  })
}

export async function rotateAccountSession(
  input: RotateAccountSessionInput
): Promise<AccountSessionSelect | null> {
  const now = new Date()
  const [session] = await db
    .update(accountSessions)
    .set({
      refreshTokenHash: input.refreshTokenHash,
      refreshTokenVersion: input.expectedRefreshTokenVersion + 1,
      expiresAt: input.expiresAt,
      updatedAt: now,
    })
    .where(
      and(
        eq(accountSessions.documentId, input.documentId),
        eq(accountSessions.clientApp, input.clientApp),
        eq(accountSessions.refreshTokenHash, input.expectedRefreshTokenHash),
        eq(accountSessions.refreshTokenVersion, input.expectedRefreshTokenVersion),
        isNull(accountSessions.revokedAt),
        gt(accountSessions.expiresAt, now)
      )
    )
    .returning()

  return session ?? null
}

export async function revokeAccountSessionForReplay(
  documentId: string,
  clientApp: AccountSessionInsert['clientApp'],
  presentedRefreshTokenVersion: number
): Promise<boolean> {
  const now = new Date()
  const revoked = await db
    .update(accountSessions)
    .set({ revokedAt: now, updatedAt: now })
    .where(
      and(
        eq(accountSessions.documentId, documentId),
        eq(accountSessions.clientApp, clientApp),
        gt(accountSessions.refreshTokenVersion, presentedRefreshTokenVersion),
        isNull(accountSessions.revokedAt)
      )
    )
    .returning({ id: accountSessions.id })

  return revoked.length > 0
}

export async function revokeAccountSession({
  documentId,
  clientApp,
  expectedRefreshTokenHash,
  expectedRefreshTokenVersion,
}: RevokeAccountSessionInput): Promise<boolean> {
  const now = new Date()
  const revoked = await db
    .update(accountSessions)
    .set({ revokedAt: now, updatedAt: now })
    .where(
      and(
        eq(accountSessions.documentId, documentId),
        eq(accountSessions.clientApp, clientApp),
        eq(accountSessions.refreshTokenHash, expectedRefreshTokenHash),
        eq(accountSessions.refreshTokenVersion, expectedRefreshTokenVersion),
        isNull(accountSessions.revokedAt)
      )
    )
    .returning({ id: accountSessions.id })

  return revoked.length > 0
}

export async function revokeAccountSessionsForPasswordReset(accountId: number): Promise<number> {
  const now = new Date()
  const revoked = await db
    .update(accountSessions)
    .set({ revokedAt: now, updatedAt: now })
    .where(and(eq(accountSessions.accountId, accountId), isNull(accountSessions.revokedAt)))
    .returning({ id: accountSessions.id })

  return revoked.length
}

export async function deleteExpiredOrRevokedAccountSessionsBefore(cutoff: Date): Promise<number> {
  const deleted = await db
    .delete(accountSessions)
    .where(or(lte(accountSessions.expiresAt, cutoff), lte(accountSessions.revokedAt, cutoff)))
    .returning({ id: accountSessions.id })

  return deleted.length
}
