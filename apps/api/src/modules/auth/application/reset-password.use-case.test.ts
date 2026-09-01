import { beforeEach, describe, expect, test, vi } from 'vitest'

const { completePasswordReset, findValidPasswordResetToken, hashValue } = vi.hoisted(() => ({
  completePasswordReset: vi.fn(),
  findValidPasswordResetToken: vi.fn(),
  hashValue: vi.fn(),
}))

vi.mock('@repo/db', () => ({ completePasswordReset, findValidPasswordResetToken }))
vi.mock('../../common', () => ({ hashValue }))

import { ResetPasswordUseCase } from './reset-password.use-case.ts'

const TOKEN = 'password-reset-token'
const ACCOUNT_ID = 7

describe('ResetPasswordUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    findValidPasswordResetToken.mockResolvedValue({ id: 1, accountId: ACCOUNT_ID })
    hashValue.mockResolvedValue('hashed-password')
    completePasswordReset.mockResolvedValue(true)
  })

  test('atomically updates the password, consumes the reset token, and revokes all sessions', async () => {
    const useCase = new ResetPasswordUseCase(
      {
        verifyAsync: vi
          .fn()
          .mockResolvedValue({ accountId: ACCOUNT_ID, purpose: 'password-reset' }),
      } as never,
      { translateError: vi.fn() } as never
    )

    await expect(
      useCase.execute({ token: TOKEN, password: 'new-password', confirmPassword: 'new-password' })
    ).resolves.toBeUndefined()

    expect(completePasswordReset).toHaveBeenCalledWith({
      accountId: ACCOUNT_ID,
      hashedPassword: 'hashed-password',
      tokenId: 1,
    })
  })

  test('rejects a reset token that cannot be consumed by the transaction', async () => {
    const translation = { translateError: vi.fn().mockReturnValue('Invalid reset token') }
    completePasswordReset.mockResolvedValue(false)
    const useCase = new ResetPasswordUseCase(
      {
        verifyAsync: vi
          .fn()
          .mockResolvedValue({ accountId: ACCOUNT_ID, purpose: 'password-reset' }),
      } as never,
      translation as never
    )

    await expect(
      useCase.execute({ token: TOKEN, password: 'new-password', confirmPassword: 'new-password' })
    ).rejects.toThrow('Invalid reset token')
  })
})
