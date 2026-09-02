import { beforeEach, describe, expect, test, vi } from 'vitest'
import { AUTH_OAUTH_APP, USER_ROLE } from '@repo/types'

const {
  findAuthAccountByEmail,
  findAuthAccountByProviderAccount,
  findOwnerRegistrationTokenByToken,
  findUserRegistrationTokenByToken,
  markOwnerRegistrationTokenUsed,
  markUserRegistrationTokenUsed,
} = vi.hoisted(() => ({
  findAuthAccountByEmail: vi.fn(),
  findAuthAccountByProviderAccount: vi.fn(),
  findOwnerRegistrationTokenByToken: vi.fn(),
  findUserRegistrationTokenByToken: vi.fn(),
  markOwnerRegistrationTokenUsed: vi.fn(),
  markUserRegistrationTokenUsed: vi.fn(),
}))

vi.mock('@repo/db', () => ({
  accountExistsByEmail: vi.fn(),
  findAuthAccountByEmail,
  findAuthAccountByProviderAccount,
  findOwnerRegistrationTokenByToken,
  findRoleByName: vi.fn(),
  findUserRegistrationTokenByToken,
  insertExternalImageAsset: vi.fn(),
  markOwnerRegistrationTokenUsed,
  markUserRegistrationTokenUsed,
  registerAccount: vi.fn(),
  setProfileAvatarFromUrlIfEmpty: vi.fn(),
}))

import { ConfirmOwnerRegistrationUseCase } from './confirm-owner-registration.use-case.ts'
import { ConfirmUserRegistrationUseCase } from './confirm-user-registration.use-case.ts'
import { GoogleOauthCallbackUseCase } from './google-oauth-callback.use-case.ts'

const metadata = {
  ipAddress: '203.0.113.1',
  device: 'Chrome on Windows',
  userAgent: 'Mozilla/5.0',
  city: 'Buenos Aires',
  state: 'Buenos Aires',
  country: 'Argentina',
}

const account = {
  sub: '3226103c-e82c-4ed1-92cd-749fcc64cb45',
  account: { id: 7, email: 'user@example.com' },
  role: { name: USER_ROLE.USER },
}

const session = {
  accessToken: 'access-token',
  clientApp: AUTH_OAUTH_APP.WEB,
  refreshToken: 'refresh-token',
}

const accounts = { createSession: vi.fn().mockResolvedValue(session) }
const translation = { translateError: vi.fn() }

describe('session issuance use cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    accounts.createSession.mockResolvedValue(session)
    findAuthAccountByEmail.mockResolvedValue(account)
  })

  test.each([
    ['user', findUserRegistrationTokenByToken, markUserRegistrationTokenUsed],
    ['owner', findOwnerRegistrationTokenByToken, markOwnerRegistrationTokenUsed],
  ] as const)(
    'creates a session when an existing %s registration is confirmed',
    async (_role, findRegistrationToken, markRegistrationTokenUsed) => {
      findRegistrationToken.mockResolvedValue({
        id: 1,
        email: account.account.email,
        usedAt: null,
      })
      const useCase =
        findRegistrationToken === findUserRegistrationTokenByToken
          ? new ConfirmUserRegistrationUseCase({} as never, translation as never, accounts as never)
          : new ConfirmOwnerRegistrationUseCase(
              {} as never,
              translation as never,
              accounts as never
            )

      await expect(useCase.execute({ token: 'registration-token' }, metadata)).resolves.toEqual(
        session
      )

      expect(markRegistrationTokenUsed).toHaveBeenCalledWith(1)
      expect(accounts.createSession).toHaveBeenCalledWith(account, metadata)
    }
  )

  test('creates an OAuth session and redirects without an access token', async () => {
    const jwtService = {
      verifyAsync: vi.fn().mockResolvedValue({
        purpose: 'google_oauth',
        role: USER_ROLE.USER,
        app: AUTH_OAUTH_APP.WEB,
      }),
    }
    const googleOauth = {
      exchangeCodeForProfile: vi.fn().mockResolvedValue({
        providerAccountId: 'google-account-id',
        email: account.account.email,
        name: 'User',
        lastName: 'Example',
        pictureUrl: null,
      }),
    }
    findAuthAccountByProviderAccount.mockResolvedValue(account)
    const useCase = new GoogleOauthCallbackUseCase(
      jwtService as never,
      googleOauth as never,
      accounts as never
    )

    const result = await useCase.execute({ code: 'code', state: 'state' }, metadata)

    expect(accounts.createSession).toHaveBeenCalledWith(account, metadata, AUTH_OAUTH_APP.WEB)
    expect(result).toEqual({
      redirectUrl: expect.not.stringContaining('access-token'),
      clientApp: AUTH_OAUTH_APP.WEB,
      refreshToken: 'refresh-token',
    })
  })
})
