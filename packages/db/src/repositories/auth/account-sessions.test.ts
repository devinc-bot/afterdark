import { beforeEach, describe, expect, test, vi } from 'vitest'

const { transaction, insert, select, update, deleteRows, deleteWhere } = vi.hoisted(() => ({
  transaction: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  deleteRows: vi.fn(),
  deleteWhere: vi.fn(),
}))

vi.mock('../../client.ts', () => ({
  db: { transaction, update, delete: deleteRows },
}))

import {
  createAccountSession,
  deleteExpiredOrRevokedAccountSessionsBefore,
  revokeAccountSession,
  revokeAccountSessionForReplay,
  revokeAccountSessionsForPasswordReset,
  rotateAccountSession,
} from './account-sessions.ts'
import { completePasswordReset } from './complete-password-reset.ts'
import { deleteExpiredPasswordResetTokens } from './delete-expired-password-reset-tokens.ts'
import { passwordResetTokens } from '../../schema/password-reset-token.ts'

const SESSION = {
  id: 1,
  documentId: '9f2ad9ee-7bb3-4b57-9435-e40ce65193e7',
  accountId: 7,
  clientApp: 'web' as const,
  refreshTokenHash: 'initial-hash',
  refreshTokenVersion: 0,
  expiresAt: new Date('2026-09-29T00:00:00.000Z'),
  revokedAt: null,
  ipAddress: null,
  device: null,
  userAgent: null,
  city: null,
  state: null,
  country: null,
  createdAt: new Date('2026-08-30T00:00:00.000Z'),
  updatedAt: new Date('2026-08-30T00:00:00.000Z'),
}

function createTransactionMock() {
  return {
    delete: deleteRows,
    insert,
    select,
    update,
  }
}

function getSqlChunkValues(chunk: unknown): string[] {
  if (typeof chunk !== 'object' || chunk === null) {
    return []
  }

  const sqlChunk = chunk as { name?: unknown; queryChunks?: unknown[]; value?: unknown }
  const values = typeof sqlChunk.name === 'string' ? [sqlChunk.name] : []

  if (Array.isArray(sqlChunk.value)) {
    values.push(...sqlChunk.value.filter((value): value is string => typeof value === 'string'))
  }
  if (Array.isArray(sqlChunk.queryChunks)) {
    values.push(...sqlChunk.queryChunks.flatMap(getSqlChunkValues))
  }

  return values
}

beforeEach(() => {
  vi.clearAllMocks()
  transaction.mockImplementation(async (callback) => callback(createTransactionMock()))
  insert.mockReturnValue({
    values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([SESSION]) }),
  })
  select.mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ orderBy: vi.fn().mockResolvedValue([]) }),
    }),
  })
  update.mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([SESSION]) }),
    }),
  })
  deleteRows.mockReturnValue({
    where: deleteWhere.mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: SESSION.id }]),
    }),
  })
})

describe('account session repository', () => {
  test('serializes account session creation and revokes the oldest sessions over the limit', async () => {
    select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi
            .fn()
            .mockReturnValue({ for: vi.fn().mockResolvedValue([{ id: SESSION.accountId }]) }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(Array.from({ length: 10 }, () => SESSION)),
          }),
        }),
      })

    await expect(createAccountSession(SESSION)).resolves.toEqual(SESSION)

    expect(transaction).toHaveBeenCalledOnce()
    expect(update).toHaveBeenCalledOnce()
    expect(insert).toHaveBeenCalledOnce()
  })

  test('rejects session creation for an account that cannot be locked', async () => {
    select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ for: vi.fn().mockResolvedValue([]) }),
      }),
    })

    await expect(createAccountSession(SESSION)).rejects.toThrow(
      'Account not found while creating session'
    )
    expect(insert).not.toHaveBeenCalled()
  })

  test('rotates a session with an atomic version and hash comparison', async () => {
    await expect(
      rotateAccountSession({
        documentId: SESSION.documentId,
        clientApp: SESSION.clientApp,
        expectedRefreshTokenHash: SESSION.refreshTokenHash,
        expectedRefreshTokenVersion: SESSION.refreshTokenVersion,
        refreshTokenHash: 'replacement-hash',
        expiresAt: SESSION.expiresAt,
      })
    ).resolves.toEqual(SESSION)

    expect(update).toHaveBeenCalledOnce()
  })

  test('returns null when atomic rotation loses the version race or the session is terminal', async () => {
    update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }),
      }),
    })

    await expect(
      rotateAccountSession({
        documentId: SESSION.documentId,
        clientApp: SESSION.clientApp,
        expectedRefreshTokenHash: SESSION.refreshTokenHash,
        expectedRefreshTokenVersion: SESSION.refreshTokenVersion,
        refreshTokenHash: 'replacement-hash',
        expiresAt: SESSION.expiresAt,
      })
    ).resolves.toBeNull()
  })

  test('revokes a replayed stale credential only for its client app', async () => {
    await expect(
      revokeAccountSessionForReplay(SESSION.documentId, SESSION.clientApp, -1)
    ).resolves.toBe(true)
    expect(update).toHaveBeenCalledOnce()
  })

  test('revokes a session idempotently and revokes every active account session after password reset', async () => {
    await expect(
      revokeAccountSession({
        documentId: SESSION.documentId,
        clientApp: SESSION.clientApp,
        expectedRefreshTokenHash: SESSION.refreshTokenHash,
        expectedRefreshTokenVersion: SESSION.refreshTokenVersion,
      })
    ).resolves.toBe(true)
    await expect(revokeAccountSessionsForPasswordReset(SESSION.accountId)).resolves.toBe(1)

    expect(update).toHaveBeenCalledTimes(2)
  })

  test('deletes the reset token before updating the password and revoking sessions in one transaction', async () => {
    await expect(
      completePasswordReset({
        accountId: SESSION.accountId,
        hashedPassword: 'new-password-hash',
        tokenId: 4,
      })
    ).resolves.toBe(true)

    expect(transaction).toHaveBeenCalledOnce()
    expect(deleteRows).toHaveBeenCalledWith(passwordResetTokens)
    expect(update).toHaveBeenCalledTimes(2)
  })

  test('propagates a password update failure so the transaction rolls back token consumption', async () => {
    const passwordUpdateError = new Error('password update failed')
    deleteRows.mockReturnValueOnce({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 4 }]) }),
    })
    update.mockReturnValueOnce({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(passwordUpdateError),
      }),
    })

    await expect(
      completePasswordReset({
        accountId: SESSION.accountId,
        hashedPassword: 'new-password-hash',
        tokenId: 4,
      })
    ).rejects.toThrow(passwordUpdateError)

    expect(transaction).toHaveBeenCalledOnce()
    expect(deleteRows).toHaveBeenCalledWith(passwordResetTokens)
    expect(update).toHaveBeenCalledOnce()
  })

  test('deletes all expired reset tokens', async () => {
    await expect(deleteExpiredPasswordResetTokens()).resolves.toBe(1)

    expect(deleteRows).toHaveBeenCalledWith(passwordResetTokens)
    const predicate = deleteWhere.mock.calls[0]?.[0]
    expect(getSqlChunkValues(predicate)).toEqual(expect.arrayContaining(['expires_at']))
  })

  test('deletes sessions whose expiration or revocation retention period has elapsed', async () => {
    await expect(
      deleteExpiredOrRevokedAccountSessionsBefore(new Date('2026-08-01T00:00:00.000Z'))
    ).resolves.toBe(1)

    expect(deleteRows).toHaveBeenCalledOnce()
  })
})
