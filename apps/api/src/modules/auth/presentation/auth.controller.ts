import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { API_ROUTES } from '@repo/common'
import {
  confirmUserRegistrationSchema,
  forgotPasswordSchema,
  googleOauthStartSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sessionClientAppSchema,
  type ConfirmUserRegistrationInput,
  type ForgotPasswordInput,
  type GoogleOauthStartInput,
  type LoginInput,
  type RegisterOwnerInput,
  type RegisterUserInput,
  type ResetPasswordInput,
  type RefreshSessionInput,
  type LogoutSessionInput,
} from '@repo/validators'
import { ApiRateLimit } from '../../common/decorators/api-rate-limit.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { RATE_LIMIT_PROFILE } from '../../../config/rate-limit.policy'
import { ConfirmUserRegistrationUseCase } from '../application/confirm-user-registration.use-case'
import { ConfirmOwnerRegistrationUseCase } from '../application/confirm-owner-registration.use-case'
import { ForgotPasswordUseCase } from '../application/forgot-password.use-case'
import { GoogleOauthCallbackUseCase } from '../application/google-oauth-callback.use-case'
import { GoogleOauthStartUseCase } from '../application/google-oauth-start.use-case'
import { LoginUseCase } from '../application/login.use-case'
import { RegisterOwnerUseCase } from '../application/register-owner.use-case'
import { RegisterUserUseCase } from '../application/register-user.use-case'
import { RequestUserRegistrationUseCase } from '../application/request-user-registration.use-case'
import { RequestOwnerRegistrationUseCase } from '../application/request-owner-registration.use-case'
import { ResetPasswordUseCase } from '../application/reset-password.use-case'
import { RefreshSessionUseCase } from '../application/refresh-session.use-case'
import { LogoutSessionUseCase } from '../application/logout-session.use-case'
import { GOOGLE_OAUTH_ERROR } from '../auth.constants'
import { buildAppLoginErrorUrl } from '../utils/google-oauth.utils'
import { AUTH_OAUTH_APP } from '@repo/types'
import type { ClientApp, LoginResponse } from '@repo/types'
import { TranslationService } from '@repo/i18n/server'
import { ENV } from '../../../config/env'
import {
  REFRESH_COOKIE_MAX_AGE_MS,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
  REFRESH_COOKIE_SAME_SITE,
} from '../auth.constants'
import type {
  AuthenticatedSession,
  SessionRequestMetadata,
} from '../application/services/auth-account.service'
import { SessionMetadataService } from '../application/services/session-metadata.service'

@Controller(API_ROUTES.auth.prefix)
export class AuthController {
  constructor(
    @Inject(LoginUseCase) private readonly loginUseCase: LoginUseCase,
    @Inject(RegisterUserUseCase) private readonly registerUserUseCase: RegisterUserUseCase,
    @Inject(RegisterOwnerUseCase) private readonly registerOwnerUseCase: RegisterOwnerUseCase,
    @Inject(RequestUserRegistrationUseCase)
    private readonly requestUserRegistrationUseCase: RequestUserRegistrationUseCase,
    @Inject(ConfirmUserRegistrationUseCase)
    private readonly confirmUserRegistrationUseCase: ConfirmUserRegistrationUseCase,
    @Inject(RequestOwnerRegistrationUseCase)
    private readonly requestOwnerRegistrationUseCase: RequestOwnerRegistrationUseCase,
    @Inject(ConfirmOwnerRegistrationUseCase)
    private readonly confirmOwnerRegistrationUseCase: ConfirmOwnerRegistrationUseCase,
    @Inject(ForgotPasswordUseCase) private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    @Inject(ResetPasswordUseCase) private readonly resetPasswordUseCase: ResetPasswordUseCase,
    @Inject(GoogleOauthStartUseCase)
    private readonly googleOauthStartUseCase: GoogleOauthStartUseCase,
    @Inject(GoogleOauthCallbackUseCase)
    private readonly googleOauthCallbackUseCase: GoogleOauthCallbackUseCase,
    @Inject(RefreshSessionUseCase) private readonly refreshSessionUseCase: RefreshSessionUseCase,
    @Inject(LogoutSessionUseCase) private readonly logoutSessionUseCase: LogoutSessionUseCase,
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(SessionMetadataService)
    private readonly sessionMetadata: SessionMetadataService
  ) {}

  @Post(API_ROUTES.auth.path.login())
  @HttpCode(HttpStatus.OK)
  @ApiRateLimit(RATE_LIMIT_PROFILE.LOGIN)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<LoginResponse> {
    return this.setSessionCookie(
      response,
      await this.loginUseCase.execute(body, await this.resolveMetadata(request))
    )
  }

  @Post(API_ROUTES.auth.path.registerUser())
  @HttpCode(HttpStatus.CREATED)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTH_SENSITIVE)
  registerUser(@Body(new ZodValidationPipe(registerSchema)) body: RegisterUserInput) {
    return this.registerUserUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.registerUserRequest())
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTH_SENSITIVE)
  requestUserRegistration(@Body(new ZodValidationPipe(registerSchema)) body: RegisterUserInput) {
    return this.requestUserRegistrationUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.registerUserConfirm())
  @HttpCode(HttpStatus.OK)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTH_CONFIRM)
  async confirmUserRegistration(
    @Body(new ZodValidationPipe(confirmUserRegistrationSchema)) body: ConfirmUserRegistrationInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<LoginResponse> {
    return this.setSessionCookie(
      response,
      await this.confirmUserRegistrationUseCase.execute(body, await this.resolveMetadata(request))
    )
  }

  @Post(API_ROUTES.auth.path.registerOwner())
  @HttpCode(HttpStatus.CREATED)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTH_SENSITIVE)
  registerOwner(@Body(new ZodValidationPipe(registerSchema)) body: RegisterOwnerInput) {
    return this.registerOwnerUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.registerOwnerRequest())
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTH_SENSITIVE)
  requestOwnerRegistration(@Body(new ZodValidationPipe(registerSchema)) body: RegisterOwnerInput) {
    return this.requestOwnerRegistrationUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.registerOwnerConfirm())
  @HttpCode(HttpStatus.OK)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTH_CONFIRM)
  async confirmOwnerRegistration(
    @Body(new ZodValidationPipe(confirmUserRegistrationSchema)) body: ConfirmUserRegistrationInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<LoginResponse> {
    return this.setSessionCookie(
      response,
      await this.confirmOwnerRegistrationUseCase.execute(body, await this.resolveMetadata(request))
    )
  }

  @Post(API_ROUTES.auth.path.forgotPassword())
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTH_SENSITIVE)
  forgotPassword(@Body(new ZodValidationPipe(forgotPasswordSchema)) body: ForgotPasswordInput) {
    return this.forgotPasswordUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.resetPassword())
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTH_CONFIRM)
  resetPassword(@Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordInput) {
    return this.resetPasswordUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.refreshToken())
  @HttpCode(HttpStatus.OK)
  @ApiRateLimit(RATE_LIMIT_PROFILE.REFRESH)
  async refresh(
    @Body(new ZodValidationPipe(sessionClientAppSchema)) body: RefreshSessionInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<LoginResponse> {
    this.assertRequestOrigin(request, body.app)
    const refreshToken = this.getRefreshCookie(request, body.app)
    if (!refreshToken) {
      throw new UnauthorizedException(this.ts.translateError('auth.REFRESH_TOKEN_INVALID'))
    }
    return this.setSessionCookie(
      response,
      await this.refreshSessionUseCase.execute(body.app, refreshToken)
    )
  }

  @Post(API_ROUTES.auth.path.logout())
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Body(new ZodValidationPipe(sessionClientAppSchema)) body: LogoutSessionInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    this.assertRequestOrigin(request, body.app)
    const refreshToken = this.getRefreshCookie(request, body.app, false)
    if (refreshToken) {
      try {
        await this.logoutSessionUseCase.execute(body.app, refreshToken)
      } catch (error) {
        if (!(error instanceof UnauthorizedException)) {
          throw error
        }
      }
    }
    this.clearRefreshCookie(response, body.app)
  }

  @Get(API_ROUTES.auth.path.google())
  @ApiRateLimit(RATE_LIMIT_PROFILE.LOGIN)
  async googleStart(@Query() query: Record<string, string | undefined>, @Res() res: Response) {
    const parsed = googleOauthStartSchema.safeParse(query)
    if (!parsed.success) {
      return res.redirect(buildAppLoginErrorUrl(AUTH_OAUTH_APP.WEB, GOOGLE_OAUTH_ERROR.FAILED))
    }
    const url = await this.googleOauthStartUseCase.execute(parsed.data as GoogleOauthStartInput)
    return res.redirect(url)
  }

  @Get(API_ROUTES.auth.path.googleCallback())
  @ApiRateLimit(RATE_LIMIT_PROFILE.LOGIN)
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Req() request: Request,
    @Res() res: Response
  ) {
    const result = await this.googleOauthCallbackUseCase.execute(
      { code, state, error },
      await this.resolveMetadata(request)
    )
    if (result.clientApp && result.refreshToken) {
      this.setRefreshCookie(res, result.clientApp, result.refreshToken)
    }
    return res.redirect(result.redirectUrl)
  }

  private async resolveMetadata(request: Request): Promise<SessionRequestMetadata> {
    return this.sessionMetadata.resolve(request.ip ?? null, request.get('user-agent') ?? null)
  }

  private setSessionCookie(response: Response, session: AuthenticatedSession): LoginResponse {
    this.setRefreshCookie(response, session.clientApp, session.refreshToken)
    return { accessToken: session.accessToken }
  }

  private setRefreshCookie(response: Response, app: ClientApp, refreshToken: string): void {
    response.cookie(REFRESH_COOKIE_NAME[app], refreshToken, this.getRefreshCookieOptions())
  }

  private clearRefreshCookie(response: Response, app: ClientApp): void {
    response.clearCookie(REFRESH_COOKIE_NAME[app], this.getRefreshCookieOptions())
  }

  /**
   * Keep these host-only options identical when setting and clearing refresh cookies.
   * The omitted domain attribute intentionally prevents sharing refresh credentials.
   */
  private getRefreshCookieOptions() {
    return {
      httpOnly: true,
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
      path: REFRESH_COOKIE_PATH,
      sameSite: REFRESH_COOKIE_SAME_SITE,
      secure: !ENV.isDevelopment,
    }
  }

  private assertRequestOrigin(request: Request, app: ClientApp): void {
    const origin = request.get('origin')
    if (origin !== this.getClientAppOrigin(app)) {
      throw new UnauthorizedException(this.ts.translateError('auth.REFRESH_TOKEN_ORIGIN_INVALID'))
    }
  }

  private getRefreshCookie(request: Request, app: ClientApp, required = true): string | null {
    const cookieValue = request.headers.cookie
      ?.split(';')
      .map((entry) => entry.trim().split('='))
      .find(([name]) => name === REFRESH_COOKIE_NAME[app])?.[1]

    if (!cookieValue && required) {
      throw new UnauthorizedException(this.ts.translateError('auth.REFRESH_TOKEN_INVALID'))
    }

    if (!cookieValue) {
      return null
    }

    try {
      return decodeURIComponent(cookieValue)
    } catch {
      if (required) {
        throw new UnauthorizedException(this.ts.translateError('auth.REFRESH_TOKEN_INVALID'))
      }
      return null
    }
  }

  private getClientAppOrigin(app: ClientApp): string {
    const origins = {
      web: ENV.WEB_URL,
      dashboard: ENV.DASHBOARD_URL,
      admin: ENV.ADMIN_URL,
    } as const satisfies Record<ClientApp, string>

    return new URL(origins[app]).origin
  }
}
