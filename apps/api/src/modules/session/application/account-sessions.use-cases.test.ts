import { describe, expect, test, vi } from 'vitest'
import { ACCOUNT_SESSION_STATUS, CLIENT_APP, USER_ROLE, type JwtPayload } from '@repo/types'

const { findAuthAccountByEmail, listAccountSessions, revokeManagedAccountSession } = vi.hoisted(
  () => ({
    findAuthAccountByEmail: vi.fn(),
    listAccountSessions: vi.fn(),
    revokeManagedAccountSession: vi.fn(),
  })
)

vi.mock('@repo/db', () => ({
  findAuthAccountByEmail,
  listAccountSessions,
  revokeManagedAccountSession,
}))

import {
  getAccountSessionStatus,
  ListAccountSessionsUseCase,
} from './list-account-sessions.use-case.ts'
import { RevokeAccountSessionUseCase } from './revoke-account-session.use-case.ts'

const CURRENT_SESSION_DOCUMENT_ID = '9f2ad9ee-7bb3-4b57-9435-e40ce65193e7'
const OTHER_SESSION_DOCUMENT_ID = 'fc1598c2-3a5f-49e5-815f-5ddb609252d8'
const PAYLOAD: JwtPayload = {
  sub: '1dbd7dc5-61ff-4e3d-b3b0-078aa18e2c37',
  email: 'user@example.com',
  role: USER_ROLE.USER,
  sessionDocumentId: CURRENT_SESSION_DOCUMENT_ID,
}

describe('account session management use cases', () => {
  test('returns the active, expired, or revoked session status', () => {
    const now = new Date('2026-09-02T00:00:00.000Z')

    expect(getAccountSessionStatus(null, new Date('2026-09-03T00:00:00.000Z'), now)).toBe(
      ACCOUNT_SESSION_STATUS.ACTIVE
    )
    expect(getAccountSessionStatus(null, new Date('2026-09-01T00:00:00.000Z'), now)).toBe(
      ACCOUNT_SESSION_STATUS.EXPIRED
    )
    expect(
      getAccountSessionStatus(
        new Date('2026-09-01T12:00:00.000Z'),
        new Date('2026-09-03T00:00:00.000Z'),
        now
      )
    ).toBe(ACCOUNT_SESSION_STATUS.REVOKED)
  })

  test('maps safe metadata, gives revoked status precedence, and lists the current session first', async () => {
    findAuthAccountByEmail.mockResolvedValue({ account: { id: 7 } })
    listAccountSessions.mockResolvedValue([
      {
        documentId: OTHER_SESSION_DOCUMENT_ID,
        clientApp: CLIENT_APP.WEB,
        device: null,
        ipAddress: null,
        city: null,
        state: null,
        country: null,
        createdAt: new Date('2026-09-01T00:00:00.000Z'),
        expiresAt: new Date('2026-09-02T00:00:00.000Z'),
        revokedAt: new Date('2026-09-01T12:00:00.000Z'),
      },
      {
        documentId: CURRENT_SESSION_DOCUMENT_ID,
        clientApp: CLIENT_APP.WEB,
        device: 'Chrome on Windows',
        ipAddress: '203.0.113.1',
        city: 'Buenos Aires',
        state: null,
        country: 'Argentina',
        createdAt: new Date('2026-08-31T00:00:00.000Z'),
        expiresAt: new Date('2099-09-02T00:00:00.000Z'),
        revokedAt: null,
      },
    ])

    const result = await new ListAccountSessionsUseCase().execute(PAYLOAD, CLIENT_APP.WEB)

    expect(listAccountSessions).toHaveBeenCalledWith({ accountId: 7, clientApp: CLIENT_APP.WEB })
    expect(result.sessions).toEqual([
      expect.objectContaining({
        documentId: CURRENT_SESSION_DOCUMENT_ID,
        isCurrent: true,
        locationLabel: 'Buenos Aires, Argentina',
        status: ACCOUNT_SESSION_STATUS.ACTIVE,
      }),
      expect.objectContaining({
        documentId: OTHER_SESSION_DOCUMENT_ID,
        isCurrent: false,
        status: ACCOUNT_SESSION_STATUS.REVOKED,
      }),
    ])
    expect(result.sessions[0]).not.toHaveProperty('userAgent')
  })

  test('returns an empty list when the JWT account no longer exists', async () => {
    findAuthAccountByEmail.mockResolvedValue(null)

    await expect(
      new ListAccountSessionsUseCase().execute(PAYLOAD, CLIENT_APP.WEB)
    ).resolves.toEqual({
      sessions: [],
    })
    expect(listAccountSessions).not.toHaveBeenCalled()
  })

  test('uses an account- and app-scoped atomic deletion and hides every failed predicate as not found', async () => {
    findAuthAccountByEmail.mockResolvedValue({ account: { id: 7 } })
    revokeManagedAccountSession.mockResolvedValue(false)
    const translateError = vi.fn().mockReturnValue('Session not found')
    const useCase = new RevokeAccountSessionUseCase({ translateError } as never)

    await expect(
      useCase.execute(PAYLOAD, CLIENT_APP.WEB, OTHER_SESSION_DOCUMENT_ID)
    ).rejects.toThrow('Session not found')
    expect(revokeManagedAccountSession).toHaveBeenCalledWith({
      accountId: 7,
      clientApp: CLIENT_APP.WEB,
      currentSessionDocumentId: CURRENT_SESSION_DOCUMENT_ID,
      documentId: OTHER_SESSION_DOCUMENT_ID,
    })
  })

  test('revokes an administrator remote session in the admin client app', async () => {
    const adminPayload = { ...PAYLOAD, role: USER_ROLE.ADMIN }
    findAuthAccountByEmail.mockResolvedValue({ account: { id: 7 } })
    revokeManagedAccountSession.mockResolvedValue(true)
    const useCase = new RevokeAccountSessionUseCase({ translateError: vi.fn() } as never)

    await expect(
      useCase.execute(adminPayload, CLIENT_APP.ADMIN, OTHER_SESSION_DOCUMENT_ID)
    ).resolves.toBeUndefined()

    expect(revokeManagedAccountSession).toHaveBeenCalledWith({
      accountId: 7,
      clientApp: CLIENT_APP.ADMIN,
      currentSessionDocumentId: CURRENT_SESSION_DOCUMENT_ID,
      documentId: OTHER_SESSION_DOCUMENT_ID,
    })
  })
})
