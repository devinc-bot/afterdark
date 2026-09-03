import { createHmac } from 'node:crypto'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { CLIENT_APP, USER_ROLE, type UserRole } from '@repo/types'

const { createAccountSession, findOwnerStatusByDocumentId, hashValue } = vi.hoisted(() => ({
  createAccountSession: vi.fn(),
  findOwnerStatusByDocumentId: vi.fn(),
  hashValue: vi.fn(),
}))

vi.mock('@repo/db', () => ({
  accountExistsByEmail: vi.fn(),
  createAccountSession,
  findAuthAccountByEmail: vi.fn(),
  findOwnerStatusByDocumentId,
  findRoleByName: vi.fn(),
  registerAccount: vi.fn(),
}))

vi.mock('../../../common', () => ({ hashValue }))

import { AuthAccountService } from './auth-account.service.ts'

const METADATA = {
  ipAddress: '203.0.113.1',
  device: 'Chrome on Windows',
  userAgent: 'Mozilla/5.0',
  city: 'Buenos Aires',
  state: 'Buenos Aires',
  country: 'Argentina',
}

const SESSION = {
  documentId: '9f2ad9ee-7bb3-4b57-9435-e40ce65193e7',
  refreshTokenVersion: 0,
}

function createRow(role: UserRole = USER_ROLE.USER) {
  return {
    sub: '3226103c-e82c-4ed1-92cd-749fcc64cb45',
    account: { id: 7, email: 'user@example.com' },
    role: { name: role },
  }
}

describe('AuthAccountService.createSession', () => {
  beforeEach(() => {
    createAccountSession.mockResolvedValue(SESSION)
    findOwnerStatusByDocumentId.mockResolvedValue('approved')
    hashValue.mockResolvedValue('refresh-secret-hash')
  })

  test('persists a web session and signs an access token containing its public document ID', async () => {
    const signAsync = vi.fn().mockResolvedValue('access-token')
    const service = new AuthAccountService(
      { signAsync } as never,
      { translateError: vi.fn() } as never
    )

    const result = await service.createSession(createRow() as never, METADATA)

    expect(createAccountSession).toHaveBeenCalledWith({
      accountId: 7,
      clientApp: CLIENT_APP.WEB,
      refreshTokenHash: 'refresh-secret-hash',
      refreshTokenVersion: 0,
      expiresAt: expect.any(Date),
      ...METADATA,
    })
    expect(signAsync).toHaveBeenCalledWith({
      sub: '3226103c-e82c-4ed1-92cd-749fcc64cb45',
      email: 'user@example.com',
      role: USER_ROLE.USER,
      sessionDocumentId: SESSION.documentId,
    })
    expect(result).toMatchObject({ accessToken: 'access-token', clientApp: CLIENT_APP.WEB })

    const [documentId, version, secret, mac] = result.refreshToken.split('.')
    expect([documentId, version]).toEqual([SESSION.documentId, '0'])
    expect(Buffer.from(secret, 'base64url')).toHaveLength(32)
    expect(mac).toBe(
      createHmac('sha256', process.env.REFRESH_TOKEN_SECRET ?? '')
        .update(`${documentId}.${version}.${secret}`)
        .digest('base64url')
    )
  })

  test.each([
    [USER_ROLE.OWNER, CLIENT_APP.DASHBOARD],
    [USER_ROLE.STAFF, CLIENT_APP.DASHBOARD],
    [USER_ROLE.ADMIN, CLIENT_APP.ADMIN],
  ] as const)('maps %s sessions to %s', async (role, clientApp) => {
    const service = new AuthAccountService(
      { signAsync: vi.fn() } as never,
      {
        translateError: vi.fn(),
      } as never
    )

    await service.createSession(createRow(role) as never, METADATA)

    expect(createAccountSession).toHaveBeenLastCalledWith(expect.objectContaining({ clientApp }))
  })
})
