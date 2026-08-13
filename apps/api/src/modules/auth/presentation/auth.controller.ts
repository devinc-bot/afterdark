import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Res,
} from '@nestjs/common'
import type { Response } from 'express'
import { API_ROUTES } from '@repo/common'
import {
  confirmUserRegistrationSchema,
  forgotPasswordSchema,
  googleOauthStartSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ConfirmUserRegistrationInput,
  type ForgotPasswordInput,
  type GoogleOauthStartInput,
  type LoginInput,
  type RegisterOwnerInput,
  type RegisterUserInput,
  type ResetPasswordInput,
} from '@repo/validators'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
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
import { GOOGLE_OAUTH_ERROR } from '../auth.constants'
import { buildAppLoginErrorUrl } from '../utils/google-oauth.utils'
import { AUTH_OAUTH_APP } from '@repo/types'

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
    private readonly googleOauthCallbackUseCase: GoogleOauthCallbackUseCase
  ) {}

  @Post(API_ROUTES.auth.path.login())
  @HttpCode(HttpStatus.OK)
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginInput) {
    return this.loginUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.registerUser())
  @HttpCode(HttpStatus.CREATED)
  registerUser(@Body(new ZodValidationPipe(registerSchema)) body: RegisterUserInput) {
    return this.registerUserUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.registerUserRequest())
  @HttpCode(HttpStatus.NO_CONTENT)
  requestUserRegistration(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterUserInput
  ) {
    return this.requestUserRegistrationUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.registerUserConfirm())
  @HttpCode(HttpStatus.OK)
  confirmUserRegistration(
    @Body(new ZodValidationPipe(confirmUserRegistrationSchema)) body: ConfirmUserRegistrationInput
  ) {
    return this.confirmUserRegistrationUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.registerOwner())
  @HttpCode(HttpStatus.CREATED)
  registerOwner(@Body(new ZodValidationPipe(registerSchema)) body: RegisterOwnerInput) {
    return this.registerOwnerUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.registerOwnerRequest())
  @HttpCode(HttpStatus.NO_CONTENT)
  requestOwnerRegistration(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterOwnerInput
  ) {
    return this.requestOwnerRegistrationUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.registerOwnerConfirm())
  @HttpCode(HttpStatus.OK)
  confirmOwnerRegistration(
    @Body(new ZodValidationPipe(confirmUserRegistrationSchema)) body: ConfirmUserRegistrationInput
  ) {
    return this.confirmOwnerRegistrationUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.forgotPassword())
  @HttpCode(HttpStatus.NO_CONTENT)
  forgotPassword(@Body(new ZodValidationPipe(forgotPasswordSchema)) body: ForgotPasswordInput) {
    return this.forgotPasswordUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.resetPassword())
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordInput) {
    return this.resetPasswordUseCase.execute(body)
  }

  @Get(API_ROUTES.auth.path.google())
  async googleStart(@Query() query: Record<string, string | undefined>, @Res() res: Response) {
    const parsed = googleOauthStartSchema.safeParse(query)
    if (!parsed.success) {
      return res.redirect(buildAppLoginErrorUrl(AUTH_OAUTH_APP.WEB, GOOGLE_OAUTH_ERROR.FAILED))
    }
    const url = await this.googleOauthStartUseCase.execute(parsed.data as GoogleOauthStartInput)
    return res.redirect(url)
  }

  @Get(API_ROUTES.auth.path.googleCallback())
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response
  ) {
    const url = await this.googleOauthCallbackUseCase.execute({ code, state, error })
    return res.redirect(url)
  }
}
