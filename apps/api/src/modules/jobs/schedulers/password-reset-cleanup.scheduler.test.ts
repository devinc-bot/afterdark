import { beforeEach, describe, expect, test, vi } from 'vitest'

const { deleteExpiredPasswordResetTokens } = vi.hoisted(() => ({
  deleteExpiredPasswordResetTokens: vi.fn(),
}))

vi.mock('@repo/db', () => ({ deleteExpiredPasswordResetTokens }))

import { PasswordResetCleanupScheduler } from './password-reset-cleanup.scheduler.ts'

describe('PasswordResetCleanupScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('deletes expired unused reset tokens through the daily cleanup repository operation', async () => {
    deleteExpiredPasswordResetTokens.mockResolvedValue(1)
    const scheduler = new PasswordResetCleanupScheduler()

    await expect(scheduler.cleanupExpiredTokens()).resolves.toBeUndefined()

    expect(deleteExpiredPasswordResetTokens).toHaveBeenCalledOnce()
  })
})
