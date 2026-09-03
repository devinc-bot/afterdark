import { describe, expect, test, vi } from 'vitest'
import { UnauthorizedException } from '@nestjs/common'
import { CLIENT_APP } from '@repo/types'
import { REFRESH_COOKIE_MAX_AGE_MS, REFRESH_COOKIE_NAME } from '../auth.constants.ts'
import { AuthController } from './auth.controller.ts'

const METADATA = {
  ipAddress: '203.0.113.1',
  device: 'Chrome on Windows',
  userAgent: 'Mozilla/5.0',
  city: null,
  state: null,
  country: null,
}

function createResponse() {
  return {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
    redirect: vi.fn(),
  }
}

function createController(overrides: Record<string, unknown> = {}) {
  const loginUseCase = overrides.loginUseCase ?? { execute: vi.fn() }
  const confirmUserRegistrationUseCase = overrides.confirmUserRegistrationUseCase ?? {
    execute: vi.fn(),
  }
  const confirmOwnerRegistrationUseCase = overrides.confirmOwnerRegistrationUseCase ?? {
    execute: vi.fn(),
  }
  const googleOauthCallbackUseCase = overrides.googleOauthCallbackUseCase ?? { execute: vi.fn() }
  const refreshSessionUseCase = overrides.refreshSessionUseCase ?? { execute: vi.fn() }
  const logoutSessionUseCase = overrides.logoutSessionUseCase ?? { execute: vi.fn() }
  const sessionMetadata = (overrides.sessionMetadata ?? {
    resolve: vi.fn().mockResolvedValue(METADATA),
  }) as { resolve: ReturnType<typeof vi.fn> }

  return {
    controller: new AuthController(
      loginUseCase as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      confirmUserRegistrationUseCase as never,
      { execute: vi.fn() } as never,
      confirmOwnerRegistrationUseCase as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      googleOauthCallbackUseCase as never,
      refreshSessionUseCase as never,
      logoutSessionUseCase as never,
      { translateError: vi.fn() } as never,
      sessionMetadata as never
    ),
    loginUseCase,
    confirmUserRegistrationUseCase,
    confirmOwnerRegistrationUseCase,
    googleOauthCallbackUseCase,
    refreshSessionUseCase,
    logoutSessionUseCase,
    sessionMetadata,
  }
}

describe('AuthController session issuance', () => {
  test('passes controller request metadata to local login and sets the app-specific cookie', async () => {
    const loginUseCase = {
      execute: vi.fn().mockResolvedValue({
        accessToken: 'access-token',
        clientApp: CLIENT_APP.ADMIN,
        refreshToken: 'refresh-token',
      }),
    }
    const { controller, sessionMetadata } = createController({ loginUseCase })
    const response = createResponse()
    const request = { ip: '203.0.113.1', get: vi.fn().mockReturnValue('Mozilla/5.0') }

    await expect(
      controller.login(
        { email: 'admin@example.com', password: 'password' },
        request as never,
        response as never
      )
    ).resolves.toEqual({
      accessToken: 'access-token',
    })

    expect(sessionMetadata.resolve).toHaveBeenCalledWith('203.0.113.1', 'Mozilla/5.0')
    expect(loginUseCase.execute).toHaveBeenCalledWith(
      { email: 'admin@example.com', password: 'password' },
      METADATA
    )
    expect(response.cookie).toHaveBeenCalledWith(REFRESH_COOKIE_NAME.admin, 'refresh-token', {
      httpOnly: true,
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
      path: '/api/auth',
      sameSite: 'lax',
      secure: true,
    })
  })

  test('sets the OAuth refresh cookie before redirecting without an access token in the URL', async () => {
    const googleOauthCallbackUseCase = {
      execute: vi.fn().mockResolvedValue({
        clientApp: CLIENT_APP.DASHBOARD,
        refreshToken: 'refresh-token',
        redirectUrl: 'http://localhost:3002/auth/callback',
      }),
    }
    const { controller } = createController({ googleOauthCallbackUseCase })
    const response = createResponse()
    const request = { ip: '203.0.113.1', get: vi.fn().mockReturnValue(null) }

    await controller.googleCallback('code', 'state', undefined, request as never, response as never)

    expect(response.cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME.dashboard,
      'refresh-token',
      expect.any(Object)
    )
    expect(response.redirect).toHaveBeenCalledWith('http://localhost:3002/auth/callback')
  })
})

describe('AuthController refresh and logout boundaries', () => {
  test('checks the exact app origin before reading a refresh cookie', async () => {
    const refreshSessionUseCase = { execute: vi.fn() }
    const { controller } = createController({ refreshSessionUseCase })
    const response = createResponse()
    const request = {
      headers: { cookie: `${REFRESH_COOKIE_NAME.web}=web-refresh-token` },
      get: vi.fn().mockReturnValue(new URL(process.env.DASHBOARD_URL ?? '').origin),
    }

    await expect(
      controller.refresh({ app: CLIENT_APP.WEB }, request as never, response as never)
    ).rejects.toThrow()

    expect(
      (refreshSessionUseCase as { execute: ReturnType<typeof vi.fn> }).execute
    ).not.toHaveBeenCalled()
  })

  test('refreshes only the matching app cookie and rotates it with documented options', async () => {
    const refreshSessionUseCase = {
      execute: vi.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        clientApp: CLIENT_APP.WEB,
        refreshToken: 'new-refresh-token',
      }),
    }
    const { controller } = createController({ refreshSessionUseCase })
    const response = createResponse()
    const request = {
      headers: {
        cookie: `${REFRESH_COOKIE_NAME.dashboard}=dashboard-refresh-token; ${REFRESH_COOKIE_NAME.web}=web-refresh-token`,
      },
      get: vi.fn().mockReturnValue(new URL(process.env.WEB_URL ?? '').origin),
    }

    await expect(
      controller.refresh({ app: CLIENT_APP.WEB }, request as never, response as never)
    ).resolves.toEqual({
      accessToken: 'new-access-token',
    })

    expect(refreshSessionUseCase.execute).toHaveBeenCalledWith(CLIENT_APP.WEB, 'web-refresh-token')
    expect(response.cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME.web,
      'new-refresh-token',
      expect.objectContaining({ path: '/api/auth', sameSite: 'lax', httpOnly: true })
    )
  })

  test('logout is idempotent and clears only its matching app cookie', async () => {
    const logoutSessionUseCase = { execute: vi.fn().mockResolvedValue(undefined) }
    const { controller } = createController({ logoutSessionUseCase })
    const response = createResponse()
    const request = {
      headers: { cookie: undefined },
      get: vi.fn().mockReturnValue(new URL(process.env.ADMIN_URL ?? '').origin),
    }

    await expect(
      controller.logout({ app: CLIENT_APP.ADMIN }, request as never, response as never)
    ).resolves.toBeUndefined()

    expect(logoutSessionUseCase.execute).not.toHaveBeenCalled()
    expect(response.clearCookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME.admin,
      expect.objectContaining({ path: '/api/auth', sameSite: 'lax', httpOnly: true })
    )
  })

  test('clears its cookie when logout rejects an invalid credential', async () => {
    const logoutSessionUseCase = { execute: vi.fn().mockRejectedValue(new UnauthorizedException()) }
    const { controller } = createController({ logoutSessionUseCase })
    const response = createResponse()
    const request = {
      headers: { cookie: `${REFRESH_COOKIE_NAME.web}=invalid-refresh-token` },
      get: vi.fn().mockReturnValue(new URL(process.env.WEB_URL ?? '').origin),
    }

    await expect(
      controller.logout({ app: CLIENT_APP.WEB }, request as never, response as never)
    ).resolves.toBeUndefined()

    expect(response.clearCookie).toHaveBeenCalledWith(REFRESH_COOKIE_NAME.web, expect.any(Object))
  })

  test('treats malformed refresh-cookie encoding as an invalid refresh credential', async () => {
    const { controller, refreshSessionUseCase } = createController()
    const response = createResponse()
    const request = {
      headers: { cookie: `${REFRESH_COOKIE_NAME.web}=%` },
      get: vi.fn().mockReturnValue(new URL(process.env.WEB_URL ?? '').origin),
    }

    await expect(
      controller.refresh({ app: CLIENT_APP.WEB }, request as never, response as never)
    ).rejects.toThrow()

    expect(
      (refreshSessionUseCase as { execute: ReturnType<typeof vi.fn> }).execute
    ).not.toHaveBeenCalled()
  })
})
