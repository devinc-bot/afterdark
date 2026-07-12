import { Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  accountExistsByEmail,
  findAuthAccountByEmail,
  findAuthAccountByProviderAccount,
  findRoleByName,
  registerAccount,
} from '@afterdark/db'
import { AUTH_PROVIDER, AUTH_OAUTH_APP, type AuthOauthApp, type UserRole } from '@afterdark/types'
import {
  GOOGLE_OAUTH_ERROR,
  GOOGLE_OAUTH_STATE_PURPOSE,
  type GoogleOauthErrorCode,
} from '../auth.constants'
import type { GoogleOauthStatePayload } from './google-oauth-start.use-case'
import { AuthAccountService } from './services/auth-account.service'
import { GoogleOauthService } from './services/google-oauth.service'
import { buildAppAuthCallbackUrl, buildAppLoginErrorUrl } from '../utils/google-oauth.utils'

@Injectable()
export class GoogleOauthCallbackUseCase {
  private readonly logger = new Logger(GoogleOauthCallbackUseCase.name)

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(GoogleOauthService) private readonly googleOauth: GoogleOauthService,
    @Inject(AuthAccountService) private readonly accounts: AuthAccountService
  ) {}

  async execute(input: { code?: string; state?: string; error?: string }): Promise<string> {
    const fallbackApp = AUTH_OAUTH_APP.WEB

    if (input.error) {
      const app = await this.safeDecodeApp(input.state, fallbackApp)
      const code: GoogleOauthErrorCode =
        input.error === 'access_denied' ? GOOGLE_OAUTH_ERROR.CANCELLED : GOOGLE_OAUTH_ERROR.FAILED
      return buildAppLoginErrorUrl(app, code)
    }

    if (!input.code || !input.state) {
      return buildAppLoginErrorUrl(fallbackApp, GOOGLE_OAUTH_ERROR.FAILED)
    }

    let statePayload: GoogleOauthStatePayload
    try {
      const payload = await this.jwtService.verifyAsync<GoogleOauthStatePayload>(input.state)
      if (payload.purpose !== GOOGLE_OAUTH_STATE_PURPOSE) {
        throw new Error('Invalid state purpose')
      }
      statePayload = payload
    } catch {
      return buildAppLoginErrorUrl(fallbackApp, GOOGLE_OAUTH_ERROR.FAILED)
    }

    const { role, app } = statePayload

    try {
      const profile = await this.googleOauth.exchangeCodeForProfile(input.code)

      const existingOauth = await findAuthAccountByProviderAccount(
        AUTH_PROVIDER.GOOGLE,
        profile.providerAccountId
      )

      if (existingOauth) {
        if (existingOauth.role.name !== role) {
          return buildAppLoginErrorUrl(app, GOOGLE_OAUTH_ERROR.EMAIL_EXISTS)
        }
        const session = await this.accounts.createAccessToken(existingOauth)
        return buildAppAuthCallbackUrl(app, session.accessToken)
      }

      if (await accountExistsByEmail(profile.email)) {
        return buildAppLoginErrorUrl(app, GOOGLE_OAUTH_ERROR.EMAIL_EXISTS)
      }

      const dbRole = await findRoleByName(role as UserRole)
      if (!dbRole) {
        this.logger.error(`Role not configured: ${role}`)
        return buildAppLoginErrorUrl(app, GOOGLE_OAUTH_ERROR.FAILED)
      }

      await registerAccount({
        email: profile.email,
        hashedPassword: null,
        roleId: dbRole.id,
        roleName: role,
        provider: AUTH_PROVIDER.GOOGLE,
        providerAccountId: profile.providerAccountId,
        profile: {
          name: profile.name,
          lastName: profile.lastName,
          phone: '',
        },
      })

      const created = await findAuthAccountByEmail(profile.email)
      if (!created) {
        return buildAppLoginErrorUrl(app, GOOGLE_OAUTH_ERROR.FAILED)
      }

      const session = await this.accounts.createAccessToken(created)
      return buildAppAuthCallbackUrl(app, session.accessToken)
    } catch (error) {
      this.logger.error(
        'Google OAuth callback failed',
        error instanceof Error ? error.stack : undefined
      )
      return buildAppLoginErrorUrl(app, GOOGLE_OAUTH_ERROR.FAILED)
    }
  }

  private async safeDecodeApp(
    state: string | undefined,
    fallback: AuthOauthApp
  ): Promise<AuthOauthApp> {
    if (!state) return fallback
    try {
      const payload = await this.jwtService.verifyAsync<GoogleOauthStatePayload>(state)
      return payload.app ?? fallback
    } catch {
      return fallback
    }
  }
}
