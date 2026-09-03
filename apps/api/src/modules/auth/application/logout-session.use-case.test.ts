import { createHmac } from 'node:crypto'
import { describe, expect, test, vi } from 'vitest'
import { CLIENT_APP } from '@repo/types'

const { findAccountSessionForRefresh, revokeAccountSession, verifyValue } = vi.hoisted(() => ({
  findAccountSessionForRefresh: vi.fn(),
  revokeAccountSession: vi.fn(),
  verifyValue: vi.fn(),
}))

vi.mock('@repo/db', () => ({ findAccountSessionForRefresh, revokeAccountSession }))
vi.mock('../../common', () => ({ verifyValue }))

import { LogoutSessionUseCase } from './logout-session.use-case.ts'

const SESSION_DOCUMENT_ID = '9f2ad9ee-7bb3-4b57-9435-e40ce65193e7'

function createRefreshToken() {
  const value = `${SESSION_DOCUMENT_ID}.0.refresh-secret`
  const mac = createHmac('sha256', process.env.REFRESH_TOKEN_SECRET ?? '')
    .update(value)
    .digest('base64url')
  return `${value}.${mac}`
}

describe('LogoutSessionUseCase', () => {
  const session = {
    session: {
      refreshTokenVersion: 0,
      refreshTokenHash: 'refresh-secret-hash',
    },
  }

  test('validates the MAC before revoking the app-scoped session idempotently', async () => {
    findAccountSessionForRefresh.mockResolvedValue(session)
    verifyValue.mockResolvedValue(true)
    const useCase = new LogoutSessionUseCase({ translateError: vi.fn() } as never)

    await expect(useCase.execute(CLIENT_APP.WEB, createRefreshToken())).resolves.toBeUndefined()

    expect(revokeAccountSession).toHaveBeenCalledWith({
      documentId: SESSION_DOCUMENT_ID,
      clientApp: CLIENT_APP.WEB,
      expectedRefreshTokenHash: 'refresh-secret-hash',
      expectedRefreshTokenVersion: 0,
    })
  })

  test('does not revoke a session for an invalid MAC', async () => {
    const useCase = new LogoutSessionUseCase({ translateError: vi.fn() } as never)

    await expect(
      useCase.execute(CLIENT_APP.WEB, `${createRefreshToken()}invalid`)
    ).rejects.toThrow()

    expect(revokeAccountSession).not.toHaveBeenCalled()
  })

  test('does not revoke an active session for a stale or mismatched credential', async () => {
    findAccountSessionForRefresh.mockResolvedValue({
      session: { refreshTokenVersion: 1, refreshTokenHash: 'refresh-secret-hash' },
    })
    const useCase = new LogoutSessionUseCase({ translateError: vi.fn() } as never)

    await expect(useCase.execute(CLIENT_APP.WEB, createRefreshToken())).resolves.toBeUndefined()

    expect(revokeAccountSession).not.toHaveBeenCalled()
  })
})
