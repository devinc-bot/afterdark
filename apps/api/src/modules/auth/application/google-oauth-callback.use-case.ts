import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  accountExistsByEmail,
  findAuthAccountByEmail,
  findAuthAccountByProviderAccount,
  findRoleByName,
  GOOGLE_AVATAR_ASSET_NAME,
  insertExternalImageAsset,
  registerAccount,
  setProfileAvatarFromUrlIfEmpty,
} from '@repo/db'
import {
  AUTH_PROVIDER,
  AUTH_OAUTH_APP,
  type AuthOauthApp,
  type ClientApp,
  type UserRole,
} from '@repo/types'
import { googleOauthStartSchema } from '@repo/validators'
import {
  GOOGLE_OAUTH_ERROR,
  GOOGLE_OAUTH_STATE_PURPOSE,
  type GoogleOauthErrorCode,
} from '../auth.constants'
import type { GoogleOauthStatePayload } from './google-oauth-start.use-case'
import { AuthAccountService, type SessionRequestMetadata } from './services/auth-account.service'
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

  async execute(
    input: { code?: string; state?: string; error?: string },
    metadata: SessionRequestMetadata
  ): Promise<GoogleOauthCallbackResult> {
    const fallbackApp = AUTH_OAUTH_APP.WEB

    if (input.error) {
      const app = await this.safeDecodeApp(input.state, fallbackApp)
      const code: GoogleOauthErrorCode =
        input.error === 'access_denied' ? GOOGLE_OAUTH_ERROR.CANCELLED : GOOGLE_OAUTH_ERROR.FAILED
      return { redirectUrl: buildAppLoginErrorUrl(app, code) }
    }

    if (!input.code || !input.state) {
      return { redirectUrl: buildAppLoginErrorUrl(fallbackApp, GOOGLE_OAUTH_ERROR.FAILED) }
    }

    let statePayload: GoogleOauthStatePayload
    try {
      const payload = await this.jwtService.verifyAsync<GoogleOauthStatePayload>(input.state)
      if (payload.purpose !== GOOGLE_OAUTH_STATE_PURPOSE) {
        throw new Error('Invalid state purpose')
      }
      const parsedState = googleOauthStartSchema.safeParse({ role: payload.role, app: payload.app })
      if (!parsedState.success) {
        throw new Error('Invalid OAuth state')
      }
      statePayload = { purpose: payload.purpose, ...parsedState.data }
    } catch {
      return { redirectUrl: buildAppLoginErrorUrl(fallbackApp, GOOGLE_OAUTH_ERROR.FAILED) }
    }

    const { role, app } = statePayload

    try {
      const profile = await this.googleOauth.exchangeCodeForProfile(input.code, app)

      const existingOauth = await findAuthAccountByProviderAccount(
        AUTH_PROVIDER.GOOGLE,
        profile.providerAccountId
      )

      if (existingOauth) {
        if (existingOauth.role.name !== role) {
          return { redirectUrl: buildAppLoginErrorUrl(app, GOOGLE_OAUTH_ERROR.EMAIL_EXISTS) }
        }

        if (profile.pictureUrl) {
          try {
            // set profile avatar from url if empty
            await setProfileAvatarFromUrlIfEmpty({
              accountId: existingOauth.account.id,
              roleName: existingOauth.role.name as UserRole,
              pictureUrl: profile.pictureUrl,
            })
          } catch (error) {
            this.logger.warn(
              `Google avatar backfill failed: ${error instanceof Error ? error.message : String(error)}`
            )
          }
        }

        const session = await this.accounts.createSession(existingOauth, metadata, app)
        return this.createSuccessResult(app, session.clientApp, session.refreshToken)
      }

      if (await accountExistsByEmail(profile.email)) {
        return { redirectUrl: buildAppLoginErrorUrl(app, GOOGLE_OAUTH_ERROR.EMAIL_EXISTS) }
      }

      const dbRole = await findRoleByName(role as UserRole)
      if (!dbRole) {
        this.logger.error(`Role not configured: ${role}`)
        return { redirectUrl: buildAppLoginErrorUrl(app, GOOGLE_OAUTH_ERROR.FAILED) }
      }

      let avatarId: number | null = null
      if (profile.pictureUrl) {
        try {
          const asset = await insertExternalImageAsset({
            url: profile.pictureUrl,
            name: GOOGLE_AVATAR_ASSET_NAME,
          })
          avatarId = asset.id
        } catch (error) {
          this.logger.warn(
            `Google avatar asset create failed: ${error instanceof Error ? error.message : String(error)}`
          )
        }
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
          ...(avatarId !== null ? { avatarId } : {}),
        },
      })

      const created = await findAuthAccountByEmail(profile.email)
      if (!created) {
        return { redirectUrl: buildAppLoginErrorUrl(app, GOOGLE_OAUTH_ERROR.FAILED) }
      }

      const session = await this.accounts.createSession(created, metadata, app)
      return this.createSuccessResult(app, session.clientApp, session.refreshToken)
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return { redirectUrl: buildAppLoginErrorUrl(app, GOOGLE_OAUTH_ERROR.PENDING_APPROVAL) }
      }

      this.logger.error(
        'Google OAuth callback failed',
        error instanceof Error ? error.stack : undefined
      )
      return { redirectUrl: buildAppLoginErrorUrl(app, GOOGLE_OAUTH_ERROR.FAILED) }
    }
  }

  private async safeDecodeApp(
    state: string | undefined,
    fallback: AuthOauthApp
  ): Promise<AuthOauthApp> {
    if (!state) return fallback
    try {
      const payload = await this.jwtService.verifyAsync<GoogleOauthStatePayload>(state)
      if (payload.purpose !== GOOGLE_OAUTH_STATE_PURPOSE) return fallback
      const parsedState = googleOauthStartSchema.safeParse({ role: payload.role, app: payload.app })
      return parsedState.success ? parsedState.data.app : fallback
    } catch {
      return fallback
    }
  }

  private createSuccessResult(
    app: AuthOauthApp,
    clientApp: ClientApp,
    refreshToken: string
  ): GoogleOauthCallbackResult {
    return {
      redirectUrl: buildAppAuthCallbackUrl(app),
      clientApp,
      refreshToken,
    }
  }
}

type GoogleOauthCallbackResult = {
  redirectUrl: string
  clientApp?: ClientApp
  refreshToken?: string
}
