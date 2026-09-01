import { createHmac } from 'node:crypto'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { CLIENT_APP, USER_ROLE } from '@repo/types'

const {
  findAccountSessionForRefresh,
  findProfileDocumentId,
  hashValue,
  revokeAccountSession,
  revokeAccountSessionForReplay,
  rotateAccountSession,
  verifyValue,
} = vi.hoisted(() => ({
  findAccountSessionForRefresh: vi.fn(),
  findProfileDocumentId: vi.fn(),
  hashValue: vi.fn(),
  revokeAccountSession: vi.fn(),
  revokeAccountSessionForReplay: vi.fn(),
  rotateAccountSession: vi.fn(),
  verifyValue: vi.fn(),
}))

vi.mock('@repo/db', () => ({
  findAccountSessionForRefresh,
  findProfileDocumentId,
  revokeAccountSession,
  revokeAccountSessionForReplay,
  rotateAccountSession,
}))

vi.mock('../../common', () => ({ hashValue, verifyValue }))

import { RefreshSessionUseCase } from './refresh-session.use-case.ts'

const SESSION_DOCUMENT_ID = '9f2ad9ee-7bb3-4b57-9435-e40ce65193e7'
const SECRET = 'current-refresh-secret'
const SESSION = {
  session: {
    documentId: SESSION_DOCUMENT_ID,
    clientApp: CLIENT_APP.WEB,
    refreshTokenHash: 'secret-hash',
    refreshTokenVersion: 2,
  },
  account: { id: 7, email: 'user@example.com' },
  role: { name: USER_ROLE.USER },
}

function createRefreshToken(
  version = 2,
  secret = SECRET,
  macSecret = process.env.REFRESH_TOKEN_SECRET ?? ''
) {
  const value = `${SESSION_DOCUMENT_ID}.${version}.${secret}`
  const mac = createHmac('sha256', macSecret).update(value).digest('base64url')
  return `${value}.${mac}`
}

describe('RefreshSessionUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    findAccountSessionForRefresh.mockResolvedValue(SESSION)
    findProfileDocumentId.mockResolvedValue('3226103c-e82c-4ed1-92cd-749fcc64cb45')
    verifyValue.mockResolvedValue(true)
    hashValue.mockResolvedValue('replacement-hash')
    rotateAccountSession.mockResolvedValue({ documentId: SESSION_DOCUMENT_ID })
  })

  test('rotates only the app-scoped current credential and returns a new access token', async () => {
    const signAsync = vi.fn().mockResolvedValue('access-token')
    const useCase = new RefreshSessionUseCase(
      { signAsync } as never,
      { translateError: vi.fn() } as never
    )

    await expect(useCase.execute(CLIENT_APP.WEB, createRefreshToken())).resolves.toMatchObject({
      accessToken: 'access-token',
      clientApp: CLIENT_APP.WEB,
    })

    expect(findAccountSessionForRefresh).toHaveBeenCalledWith(SESSION_DOCUMENT_ID, CLIENT_APP.WEB)
    expect(rotateAccountSession).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: SESSION_DOCUMENT_ID,
        clientApp: CLIENT_APP.WEB,
        expectedRefreshTokenHash: 'secret-hash',
        expectedRefreshTokenVersion: 2,
      })
    )
    expect(signAsync).toHaveBeenCalledWith({
      sub: '3226103c-e82c-4ed1-92cd-749fcc64cb45',
      email: 'user@example.com',
      role: USER_ROLE.USER,
      sessionDocumentId: SESSION_DOCUMENT_ID,
    })
  })

  test('does not load or revoke a session when the credential MAC is invalid', async () => {
    const useCase = new RefreshSessionUseCase(
      { signAsync: vi.fn() } as never,
      {
        translateError: vi.fn(),
      } as never
    )

    await expect(
      useCase.execute(CLIENT_APP.WEB, `${createRefreshToken()}invalid`)
    ).rejects.toThrow()

    expect(findAccountSessionForRefresh).not.toHaveBeenCalled()
    expect(revokeAccountSessionForReplay).not.toHaveBeenCalled()
  })

  test('revokes only the app-scoped session when a valid-MAC stale credential is replayed', async () => {
    const useCase = new RefreshSessionUseCase(
      { signAsync: vi.fn() } as never,
      {
        translateError: vi.fn(),
      } as never
    )

    await expect(useCase.execute(CLIENT_APP.WEB, createRefreshToken(1))).rejects.toThrow()

    expect(revokeAccountSessionForReplay).toHaveBeenCalledWith(
      SESSION_DOCUMENT_ID,
      CLIENT_APP.WEB,
      1
    )
    expect(verifyValue).not.toHaveBeenCalled()
  })

  test('does not revoke the session when a current-version secret does not match', async () => {
    verifyValue.mockResolvedValue(false)
    const useCase = new RefreshSessionUseCase(
      { signAsync: vi.fn() } as never,
      {
        translateError: vi.fn(),
      } as never
    )

    await expect(useCase.execute(CLIENT_APP.WEB, createRefreshToken())).rejects.toThrow()

    expect(revokeAccountSessionForReplay).not.toHaveBeenCalled()
    expect(rotateAccountSession).not.toHaveBeenCalled()
  })

  test('revokes a credential that becomes stale while another refresh rotates it', async () => {
    rotateAccountSession.mockResolvedValue(null)
    const useCase = new RefreshSessionUseCase(
      { signAsync: vi.fn() } as never,
      { translateError: vi.fn() } as never
    )

    await expect(useCase.execute(CLIENT_APP.WEB, createRefreshToken())).rejects.toThrow()

    expect(revokeAccountSessionForReplay).toHaveBeenCalledWith(
      SESSION_DOCUMENT_ID,
      CLIENT_APP.WEB,
      2
    )
  })

  test('rejects a non-canonical MAC before looking up the session', async () => {
    const useCase = new RefreshSessionUseCase(
      { signAsync: vi.fn() } as never,
      { translateError: vi.fn() } as never
    )

    await expect(useCase.execute(CLIENT_APP.WEB, `${createRefreshToken()}!`)).rejects.toThrow()

    expect(findAccountSessionForRefresh).not.toHaveBeenCalled()
  })
})
