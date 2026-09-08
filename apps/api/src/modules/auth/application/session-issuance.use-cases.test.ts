import { beforeEach, describe, expect, test, vi } from 'vitest'
import { API_ROUTES, buildApiPath, CLIENT_ROUTES } from '@repo/common'
import { LEGAL_DOCUMENT_ERROR_CODE } from '@repo/i18n'
import {
  AUTH_OAUTH_APP,
  CLIENT_APP,
  type AuthOauthApp,
  LEGAL_DOCUMENT_TYPE,
  USER_ROLE,
} from '@repo/types'
import { googleOauthStartSchema } from '@repo/validators'
import { ENV } from '../../../config/env.ts'
import {
  GOOGLE_OAUTH_ERROR,
  GOOGLE_OAUTH_STATE_PURPOSE,
  GOOGLE_OAUTH_STATE_TTL,
} from '../auth.constants.ts'
import { OWNER_REGISTRATION_PURPOSE } from '../utils/owner-registration.utils.ts'
import { USER_REGISTRATION_PURPOSE } from '../utils/user-registration.utils.ts'

const {
  accountExistsByEmail,
  findAuthAccountByEmail,
  findAuthAccountByProviderAccount,
  findLatestPublishedLegalDocumentByType,
  findOwnerRegistrationTokenByToken,
  findRoleByName,
  findUserRegistrationTokenByToken,
  insertAccountLegalAcceptances,
  markOwnerRegistrationTokenUsed,
  markUserRegistrationTokenUsed,
  registerAccount,
} = vi.hoisted(() => ({
  accountExistsByEmail: vi.fn(),
  findAuthAccountByEmail: vi.fn(),
  findAuthAccountByProviderAccount: vi.fn(),
  findLatestPublishedLegalDocumentByType: vi.fn(),
  findOwnerRegistrationTokenByToken: vi.fn(),
  findRoleByName: vi.fn(),
  findUserRegistrationTokenByToken: vi.fn(),
  insertAccountLegalAcceptances: vi.fn(),
  markOwnerRegistrationTokenUsed: vi.fn(),
  markUserRegistrationTokenUsed: vi.fn(),
  registerAccount: vi.fn(),
}))

vi.mock('@repo/db', () => ({
  accountExistsByEmail,
  findAuthAccountByEmail,
  findAuthAccountByProviderAccount,
  findLatestPublishedLegalDocumentByType,
  findOwnerRegistrationTokenByToken,
  findRoleByName,
  findUserRegistrationTokenByToken,
  insertAccountLegalAcceptances,
  insertExternalImageAsset: vi.fn(),
  markOwnerRegistrationTokenUsed,
  markUserRegistrationTokenUsed,
  registerAccount,
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
const translation = { translateError: vi.fn((code: string) => code) }

const CONFIRM_CASES = [
  {
    audience: 'user',
    findRegistrationToken: findUserRegistrationTokenByToken,
    markRegistrationTokenUsed: markUserRegistrationTokenUsed,
    purpose: USER_REGISTRATION_PURPOSE,
    roleName: USER_ROLE.USER,
    termsType: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    privacyType: LEGAL_DOCUMENT_TYPE.PRIVACY_WEB,
    termsId: 11,
    privacyId: 22,
  },
  {
    audience: 'owner',
    findRegistrationToken: findOwnerRegistrationTokenByToken,
    markRegistrationTokenUsed: markOwnerRegistrationTokenUsed,
    purpose: OWNER_REGISTRATION_PURPOSE,
    roleName: USER_ROLE.OWNER,
    termsType: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
    privacyType: LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD,
    termsId: 31,
    privacyId: 32,
  },
] as const

const GOOGLE_CASES = [
  {
    audience: 'user',
    app: AUTH_OAUTH_APP.WEB,
    role: USER_ROLE.USER,
    appUrl: ENV.WEB_URL,
    termsType: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    privacyType: LEGAL_DOCUMENT_TYPE.PRIVACY_WEB,
    termsId: 11,
    privacyId: 22,
  },
  {
    audience: 'owner',
    app: AUTH_OAUTH_APP.DASHBOARD,
    role: USER_ROLE.OWNER,
    appUrl: ENV.DASHBOARD_URL,
    termsType: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
    privacyType: LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD,
    termsId: 31,
    privacyId: 32,
  },
] as const

const googleProfile = {
  providerAccountId: 'google-account-id',
  email: account.account.email,
  name: 'User',
  lastName: 'Example',
  pictureUrl: null,
}

function createConfirmUseCase(
  audience: (typeof CONFIRM_CASES)[number]['audience'],
  jwtService: object = {}
) {
  return audience === 'user'
    ? new ConfirmUserRegistrationUseCase(
        jwtService as never,
        translation as never,
        accounts as never
      )
    : new ConfirmOwnerRegistrationUseCase(
        jwtService as never,
        translation as never,
        accounts as never
      )
}

function unusedRegistrationToken() {
  return {
    id: 1,
    email: account.account.email,
    name: 'Ada',
    lastName: 'Lovelace',
    passwordHash: 'hashed-password',
    usedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
  }
}

function registrationJwt(purpose: string) {
  return {
    verifyAsync: vi.fn().mockResolvedValue({
      purpose,
      email: account.account.email,
    }),
  }
}

function mockPublishedDocuments(input: {
  termsType: string
  privacyType: string
  termsId: number | null
  privacyId: number | null
  beforeResolve?: () => Promise<void>
}) {
  findLatestPublishedLegalDocumentByType.mockImplementation(async (type: string) => {
    await input.beforeResolve?.()
    if (type === input.termsType) {
      return input.termsId === null ? null : { id: input.termsId }
    }
    if (type === input.privacyType) {
      return input.privacyId === null ? null : { id: input.privacyId }
    }
    return null
  })
}

function googleAppOrigin(app: AuthOauthApp) {
  return app === AUTH_OAUTH_APP.WEB ? ENV.WEB_URL : ENV.DASHBOARD_URL
}

function expectRedirectError(redirectUrl: string, app: AuthOauthApp, path: string, error: string) {
  const url = new URL(redirectUrl)
  expect(url.origin).toBe(new URL(googleAppOrigin(app)).origin)
  expect(url.pathname).toBe(path)
  expect(url.searchParams.get('error')).toBe(error)
}

function createGoogleCallbackUseCase(state: {
  role: (typeof GOOGLE_CASES)[number]['role']
  app: AuthOauthApp
  legalAccepted?: boolean
}) {
  const jwtService = {
    verifyAsync: vi.fn().mockResolvedValue({
      purpose: GOOGLE_OAUTH_STATE_PURPOSE,
      role: state.role,
      app: state.app,
      ...(state.legalAccepted === undefined ? {} : { legalAccepted: state.legalAccepted }),
    }),
  }
  const googleOauth = {
    exchangeCodeForProfile: vi.fn().mockResolvedValue(googleProfile),
  }

  return {
    useCase: new GoogleOauthCallbackUseCase(
      jwtService as never,
      googleOauth as never,
      accounts as never
    ),
    googleOauth,
  }
}

describe('session issuance use cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    accounts.createSession.mockResolvedValue(session)
    accountExistsByEmail.mockResolvedValue(false)
    findAuthAccountByEmail.mockResolvedValue(account)
    findAuthAccountByProviderAccount.mockResolvedValue(null)
    insertAccountLegalAcceptances.mockResolvedValue(undefined)
    registerAccount.mockResolvedValue(undefined)
  })

  test('does not approve admin as a Google OAuth app', () => {
    expect(
      googleOauthStartSchema.safeParse({ app: CLIENT_APP.ADMIN, role: USER_ROLE.USER })
    ).toMatchObject({ success: false })
  })

  test.each(CONFIRM_CASES)(
    'creates a session only when a completed $audience registration is confirmed',
    async ({ audience, findRegistrationToken, markRegistrationTokenUsed }) => {
      findRegistrationToken.mockResolvedValue({
        id: 1,
        email: account.account.email,
        usedAt: new Date('2026-03-01T00:00:00.000Z'),
      })
      const useCase = createConfirmUseCase(audience)

      await expect(useCase.execute({ token: 'registration-token' }, metadata)).resolves.toEqual(
        session
      )

      expect(findLatestPublishedLegalDocumentByType).not.toHaveBeenCalled()
      expect(insertAccountLegalAcceptances).not.toHaveBeenCalled()
      expect(registerAccount).not.toHaveBeenCalled()
      expect(markRegistrationTokenUsed).not.toHaveBeenCalled()
      expect(accounts.createSession).toHaveBeenCalledWith(account, metadata)
    }
  )

  test.each(CONFIRM_CASES)(
    'records published legal acceptances on first-time $audience confirm',
    async ({
      audience,
      findRegistrationToken,
      markRegistrationTokenUsed,
      purpose,
      roleName,
      termsType,
      privacyType,
      termsId,
      privacyId,
    }) => {
      const sequence: string[] = []
      const legalDocumentIds = [termsId, privacyId] as const
      findRegistrationToken.mockResolvedValue(unusedRegistrationToken())
      findAuthAccountByEmail.mockResolvedValueOnce(null).mockResolvedValue(account)
      findRoleByName.mockResolvedValue({ id: 4, name: roleName })
      mockPublishedDocuments({
        termsType,
        privacyType,
        termsId,
        privacyId,
        beforeResolve: async () => {
          await Promise.resolve()
          sequence.push('load-docs')
        },
      })
      registerAccount.mockImplementation(async () => {
        sequence.push('registerAccount')
      })
      insertAccountLegalAcceptances.mockImplementation(async () => {
        sequence.push('insertAcceptances')
      })
      markRegistrationTokenUsed.mockImplementation(async () => {
        sequence.push('markTokenUsed')
      })
      accounts.createSession.mockImplementation(async () => {
        sequence.push('createSession')
        return session
      })
      const useCase = createConfirmUseCase(audience, registrationJwt(purpose))

      await expect(useCase.execute({ token: 'registration-token' }, metadata)).resolves.toEqual(
        session
      )

      expect(findLatestPublishedLegalDocumentByType).toHaveBeenCalledWith(termsType)
      expect(findLatestPublishedLegalDocumentByType).toHaveBeenCalledWith(privacyType)
      expect(findLatestPublishedLegalDocumentByType).toHaveBeenCalledTimes(2)
      expect(registerAccount).toHaveBeenCalled()
      expect(insertAccountLegalAcceptances).toHaveBeenCalledWith({
        accountId: account.account.id,
        legalDocumentIds: expect.arrayContaining([...legalDocumentIds]),
      })
      expect(insertAccountLegalAcceptances.mock.calls[0]?.[0]?.legalDocumentIds).toHaveLength(2)
      expect(markRegistrationTokenUsed).toHaveBeenCalledWith(1)
      expect(accounts.createSession).toHaveBeenCalledWith(account, metadata)
      expect(sequence).toEqual([
        'load-docs',
        'load-docs',
        'registerAccount',
        'insertAcceptances',
        'markTokenUsed',
        'createSession',
      ])
    }
  )

  test.each(
    CONFIRM_CASES.flatMap((confirmCase) =>
      (
        [
          ['terms', confirmCase.termsType],
          ['privacy', confirmCase.privacyType],
        ] as const
      ).map(([missingKind, missingType]) => ({ ...confirmCase, missingKind, missingType }))
    )
  )(
    'rejects first-time $audience confirm when published $missingKind is missing',
    async ({
      audience,
      findRegistrationToken,
      markRegistrationTokenUsed,
      purpose,
      roleName,
      termsType,
      privacyType,
      termsId,
      privacyId,
      missingType,
    }) => {
      findRegistrationToken.mockResolvedValue(unusedRegistrationToken())
      findAuthAccountByEmail.mockResolvedValueOnce(null).mockResolvedValue(account)
      findRoleByName.mockResolvedValue({ id: 4, name: roleName })
      mockPublishedDocuments({
        termsType,
        privacyType,
        termsId: missingType === termsType ? null : termsId,
        privacyId: missingType === privacyType ? null : privacyId,
      })
      const useCase = createConfirmUseCase(audience, registrationJwt(purpose))

      await expect(
        useCase.execute({ token: 'registration-token' }, metadata)
      ).rejects.toMatchObject({
        name: 'NotFoundException',
        message: LEGAL_DOCUMENT_ERROR_CODE.PUBLISHED_NOT_FOUND,
      })

      expect(registerAccount).not.toHaveBeenCalled()
      expect(insertAccountLegalAcceptances).not.toHaveBeenCalled()
      expect(markRegistrationTokenUsed).not.toHaveBeenCalled()
      expect(accounts.createSession).not.toHaveBeenCalled()
    }
  )

  test.each(CONFIRM_CASES)(
    'backfills legal acceptances when an existing $audience account has an unused token',
    async ({
      audience,
      findRegistrationToken,
      markRegistrationTokenUsed,
      termsType,
      privacyType,
      termsId,
      privacyId,
    }) => {
      const legalDocumentIds = [termsId, privacyId] as const
      findRegistrationToken.mockResolvedValue(unusedRegistrationToken())
      mockPublishedDocuments({ termsType, privacyType, termsId, privacyId })
      const useCase = createConfirmUseCase(audience)

      await expect(useCase.execute({ token: 'registration-token' }, metadata)).resolves.toEqual(
        session
      )

      expect(findLatestPublishedLegalDocumentByType).toHaveBeenCalledWith(termsType)
      expect(findLatestPublishedLegalDocumentByType).toHaveBeenCalledWith(privacyType)
      expect(registerAccount).not.toHaveBeenCalled()
      expect(insertAccountLegalAcceptances).toHaveBeenCalledWith({
        accountId: account.account.id,
        legalDocumentIds: expect.arrayContaining([...legalDocumentIds]),
      })
      expect(insertAccountLegalAcceptances.mock.calls[0]?.[0]?.legalDocumentIds).toHaveLength(2)
      expect(markRegistrationTokenUsed).toHaveBeenCalledWith(1)
      expect(accounts.createSession).toHaveBeenCalledWith(account, metadata)
      expect(insertAccountLegalAcceptances.mock.invocationCallOrder[0]).toBeLessThan(
        markRegistrationTokenUsed.mock.invocationCallOrder[0]
      )
      expect(markRegistrationTokenUsed.mock.invocationCallOrder[0]).toBeLessThan(
        accounts.createSession.mock.invocationCallOrder[0]
      )
    }
  )

  test.each(CONFIRM_CASES)(
    'rejects $audience backfill when a required published legal document is missing',
    async ({
      audience,
      findRegistrationToken,
      markRegistrationTokenUsed,
      termsType,
      privacyType,
      termsId,
    }) => {
      findRegistrationToken.mockResolvedValue(unusedRegistrationToken())
      mockPublishedDocuments({
        termsType,
        privacyType,
        termsId,
        privacyId: null,
      })
      const useCase = createConfirmUseCase(audience)

      await expect(
        useCase.execute({ token: 'registration-token' }, metadata)
      ).rejects.toMatchObject({
        name: 'NotFoundException',
        message: LEGAL_DOCUMENT_ERROR_CODE.PUBLISHED_NOT_FOUND,
      })

      expect(registerAccount).not.toHaveBeenCalled()
      expect(insertAccountLegalAcceptances).not.toHaveBeenCalled()
      expect(markRegistrationTokenUsed).not.toHaveBeenCalled()
      expect(accounts.createSession).not.toHaveBeenCalled()
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
    expect(findLatestPublishedLegalDocumentByType).not.toHaveBeenCalled()
    expect(insertAccountLegalAcceptances).not.toHaveBeenCalled()
    expect(registerAccount).not.toHaveBeenCalled()
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

  test('exposes Google register_required contract helpers', () => {
    expect(GOOGLE_OAUTH_ERROR.REGISTER_REQUIRED).toBe('register_required')
    expect(CLIENT_ROUTES.register()).toBe('/register')
  })

  test.each([
    {
      app: AUTH_OAUTH_APP.WEB,
      role: USER_ROLE.USER,
      inputAccepted: undefined,
      signedAccepted: false,
    },
    {
      app: AUTH_OAUTH_APP.WEB,
      role: USER_ROLE.USER,
      inputAccepted: true,
      signedAccepted: true,
    },
    {
      app: AUTH_OAUTH_APP.DASHBOARD,
      role: USER_ROLE.OWNER,
      inputAccepted: false,
      signedAccepted: false,
    },
  ] as const)(
    'signs legalAccepted=$signedAccepted into the $app Google OAuth state',
    async ({ app, role, inputAccepted, signedAccepted }) => {
      const jwtService = { signAsync: vi.fn().mockResolvedValue('signed-state') }
      const googleOauth = {
        isConfigured: vi.fn().mockReturnValue(true),
        buildAuthorizationUrl: vi.fn().mockReturnValue('https://accounts.google.com/authorization'),
      }
      const useCase = new GoogleOauthStartUseCase(jwtService as never, googleOauth as never)
      const input =
        inputAccepted === undefined ? { app, role } : { app, role, legalAccepted: inputAccepted }

      await useCase.execute(input as never)

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          purpose: GOOGLE_OAUTH_STATE_PURPOSE,
          role,
          app,
          legalAccepted: signedAccepted,
        },
        { expiresIn: GOOGLE_OAUTH_STATE_TTL }
      )
    }
  )

  test.each(GOOGLE_CASES)(
    'signs in an existing $audience Google account without recording legal acceptances',
    async ({ app, role }) => {
      findAuthAccountByProviderAccount.mockResolvedValue({
        ...account,
        role: { name: role },
      })
      const { useCase, googleOauth } = createGoogleCallbackUseCase({
        app,
        role,
        legalAccepted: true,
      })

      const result = await useCase.execute({ code: 'code', state: 'state' }, metadata)

      expect(googleOauth.exchangeCodeForProfile).toHaveBeenCalledWith('code', app)
      expect(findLatestPublishedLegalDocumentByType).not.toHaveBeenCalled()
      expect(insertAccountLegalAcceptances).not.toHaveBeenCalled()
      expect(registerAccount).not.toHaveBeenCalled()
      expect(accounts.createSession).toHaveBeenCalledWith(
        { ...account, role: { name: role } },
        metadata,
        app
      )
      expect(result).toEqual({
        redirectUrl: expect.not.stringContaining('access-token'),
        clientApp: AUTH_OAUTH_APP.WEB,
        refreshToken: 'refresh-token',
      })
    }
  )

  test.each(
    GOOGLE_CASES.flatMap((googleCase) =>
      ([undefined, false] as const).map((legalAccepted) => ({ ...googleCase, legalAccepted }))
    )
  )(
    'refuses first-time $audience Google login without legalAccepted=$legalAccepted',
    async ({ app, role, legalAccepted }) => {
      findRoleByName.mockResolvedValue({ id: 4, name: role })
      const { useCase } = createGoogleCallbackUseCase({ app, role, legalAccepted })

      const result = await useCase.execute({ code: 'code', state: 'state' }, metadata)

      expect(registerAccount).not.toHaveBeenCalled()
      expect(findLatestPublishedLegalDocumentByType).not.toHaveBeenCalled()
      expect(insertAccountLegalAcceptances).not.toHaveBeenCalled()
      expect(accounts.createSession).not.toHaveBeenCalled()
      expect(result.clientApp).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expectRedirectError(
        result.redirectUrl,
        app,
        CLIENT_ROUTES.register(),
        GOOGLE_OAUTH_ERROR.REGISTER_REQUIRED
      )
    }
  )

  test.each(GOOGLE_CASES)(
    'keeps email_exists for $audience Google when the email already has an account',
    async ({ app, role }) => {
      accountExistsByEmail.mockResolvedValue(true)
      const { useCase } = createGoogleCallbackUseCase({ app, role })

      const result = await useCase.execute({ code: 'code', state: 'state' }, metadata)

      expect(registerAccount).not.toHaveBeenCalled()
      expect(insertAccountLegalAcceptances).not.toHaveBeenCalled()
      expect(accounts.createSession).not.toHaveBeenCalled()
      expectRedirectError(
        result.redirectUrl,
        app,
        CLIENT_ROUTES.login(),
        GOOGLE_OAUTH_ERROR.EMAIL_EXISTS
      )
    }
  )

  test.each(GOOGLE_CASES)(
    'records published legal acceptances when Google creates a $audience account',
    async ({ app, role, termsType, privacyType, termsId, privacyId }) => {
      const sequence: string[] = []
      const legalDocumentIds = [termsId, privacyId] as const
      findRoleByName.mockResolvedValue({ id: 4, name: role })
      mockPublishedDocuments({
        termsType,
        privacyType,
        termsId,
        privacyId,
        beforeResolve: async () => {
          await Promise.resolve()
          sequence.push('load-docs')
        },
      })
      registerAccount.mockImplementation(async () => {
        sequence.push('registerAccount')
      })
      insertAccountLegalAcceptances.mockImplementation(async () => {
        sequence.push('insertAcceptances')
      })
      accounts.createSession.mockImplementation(async () => {
        sequence.push('createSession')
        return session
      })
      const { useCase } = createGoogleCallbackUseCase({ app, role, legalAccepted: true })

      const result = await useCase.execute({ code: 'code', state: 'state' }, metadata)

      expect(findLatestPublishedLegalDocumentByType).toHaveBeenCalledWith(termsType)
      expect(findLatestPublishedLegalDocumentByType).toHaveBeenCalledWith(privacyType)
      expect(findLatestPublishedLegalDocumentByType).toHaveBeenCalledTimes(2)
      expect(registerAccount).toHaveBeenCalled()
      expect(insertAccountLegalAcceptances).toHaveBeenCalledWith({
        accountId: account.account.id,
        legalDocumentIds: expect.arrayContaining([...legalDocumentIds]),
      })
      expect(insertAccountLegalAcceptances.mock.calls[0]?.[0]?.legalDocumentIds).toHaveLength(2)
      expect(accounts.createSession).toHaveBeenCalledWith(account, metadata, app)
      expect(result).toEqual({
        redirectUrl: expect.not.stringContaining('access-token'),
        clientApp: AUTH_OAUTH_APP.WEB,
        refreshToken: 'refresh-token',
      })
      expect(sequence).toEqual([
        'load-docs',
        'load-docs',
        'registerAccount',
        'insertAcceptances',
        'createSession',
      ])
    }
  )

  test.each(
    GOOGLE_CASES.flatMap((googleCase) =>
      (
        [
          ['terms', googleCase.termsType],
          ['privacy', googleCase.privacyType],
        ] as const
      ).map(([missingKind, missingType]) => ({ ...googleCase, missingKind, missingType }))
    )
  )(
    'does not create a $audience Google account when published $missingKind is missing',
    async ({ app, role, termsType, privacyType, termsId, privacyId, missingType }) => {
      findRoleByName.mockResolvedValue({ id: 4, name: role })
      mockPublishedDocuments({
        termsType,
        privacyType,
        termsId: missingType === termsType ? null : termsId,
        privacyId: missingType === privacyType ? null : privacyId,
      })
      const { useCase } = createGoogleCallbackUseCase({ app, role, legalAccepted: true })

      const result = await useCase.execute({ code: 'code', state: 'state' }, metadata)

      expect(registerAccount).not.toHaveBeenCalled()
      expect(insertAccountLegalAcceptances).not.toHaveBeenCalled()
      expect(accounts.createSession).not.toHaveBeenCalled()
      expect(result.clientApp).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expectRedirectError(result.redirectUrl, app, CLIENT_ROUTES.login(), GOOGLE_OAUTH_ERROR.FAILED)
    }
  )
})
