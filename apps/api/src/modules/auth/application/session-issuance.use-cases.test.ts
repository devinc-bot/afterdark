import { beforeEach, describe, expect, test, vi } from 'vitest'
import { API_ROUTES, buildApiPath } from '@repo/common'
import { AUTH_OAUTH_APP, CLIENT_APP, type AuthOauthApp, USER_ROLE } from '@repo/types'
import { googleOauthStartSchema } from '@repo/validators'
import { ENV } from '../../../config/env.ts'

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
import { GoogleOauthStartUseCase } from './google-oauth-start.use-case.ts'
import { GoogleOauthService } from './services/google-oauth.service.ts'

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

  test('does not approve admin as a Google OAuth app', () => {
    expect(
      googleOauthStartSchema.safeParse({ app: CLIENT_APP.ADMIN, role: USER_ROLE.USER })
    ).toMatchObject({ success: false })
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

    expect(googleOauth.exchangeCodeForProfile).toHaveBeenCalledWith('code', AUTH_OAUTH_APP.WEB)
    expect(accounts.createSession).toHaveBeenCalledWith(account, metadata, AUTH_OAUTH_APP.WEB)
    expect(result).toEqual({
      redirectUrl: expect.not.stringContaining('access-token'),
      clientApp: AUTH_OAUTH_APP.WEB,
      refreshToken: 'refresh-token',
    })
  })

  test.each([
    [AUTH_OAUTH_APP.WEB, USER_ROLE.USER],
    [AUTH_OAUTH_APP.DASHBOARD, USER_ROLE.OWNER],
  ] as const)('routes the %s OAuth callback through that app proxy', async (app, role) => {
    const state = `signed-${app}-state`
    const jwtService = { signAsync: vi.fn().mockResolvedValue(state) }
    const googleOauth = {
      isConfigured: vi.fn().mockReturnValue(true),
      buildAuthorizationUrl: vi.fn().mockReturnValue('https://accounts.google.com/authorization'),
    }
    const useCase = new GoogleOauthStartUseCase(jwtService as never, googleOauth as never)

    await expect(useCase.execute({ app, role })).resolves.toBe(
      'https://accounts.google.com/authorization'
    )

    expect(googleOauth.buildAuthorizationUrl).toHaveBeenCalledWith(state, app)
  })

  test.each([
    [AUTH_OAUTH_APP.WEB, ENV.WEB_URL],
    [AUTH_OAUTH_APP.DASHBOARD, ENV.DASHBOARD_URL],
  ] as const)('uses the %s app proxy callback rather than the API host', (app, appUrl) => {
    const service = new GoogleOauthService()
    const buildAuthorizationUrl = service.buildAuthorizationUrl as (
      state: string,
      app: AuthOauthApp
    ) => string
    const authorizationUrl = new URL(buildAuthorizationUrl.call(service, 'signed-state', app))
    const callbackUrl = authorizationUrl.searchParams.get('redirect_uri')
    const callbackPath = buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.googleCallback())

    expect(callbackUrl).toBe(new URL(callbackPath, appUrl).toString())
    expect(callbackUrl).not.toBe(new URL(callbackPath, ENV.API_PUBLIC_URL).toString())
  })
})
