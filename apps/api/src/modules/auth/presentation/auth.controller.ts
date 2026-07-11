import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common'
import { API_ROUTES } from '@afterdark/common'
import {
  forgotPasswordSchema,
  loginSchema,
  registerOwnerSchema,
  registerUserSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterOwnerInput,
  type RegisterUserInput,
  type ResetPasswordInput,
} from '@afterdark/validators'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { ForgotPasswordUseCase } from '../application/forgot-password.use-case'
import { LoginUseCase } from '../application/login.use-case'
import { RegisterOwnerUseCase } from '../application/register-owner.use-case'
import { RegisterUserUseCase } from '../application/register-user.use-case'
import { ResetPasswordUseCase } from '../application/reset-password.use-case'

@Controller(API_ROUTES.auth.prefix)
export class AuthController {
  constructor(
    @Inject(LoginUseCase) private readonly loginUseCase: LoginUseCase,
    @Inject(RegisterUserUseCase) private readonly registerUserUseCase: RegisterUserUseCase,
    @Inject(RegisterOwnerUseCase) private readonly registerOwnerUseCase: RegisterOwnerUseCase,
    @Inject(ForgotPasswordUseCase) private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    @Inject(ResetPasswordUseCase) private readonly resetPasswordUseCase: ResetPasswordUseCase
  ) {}

  @Post(API_ROUTES.auth.path.login())
  @HttpCode(HttpStatus.OK)
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginInput) {
    return this.loginUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.registerUser())
  @HttpCode(HttpStatus.CREATED)
  registerUser(@Body(new ZodValidationPipe(registerUserSchema)) body: RegisterUserInput) {
    return this.registerUserUseCase.execute(body)
  }

  @Post(API_ROUTES.auth.path.registerOwner())
  @HttpCode(HttpStatus.CREATED)
  registerOwner(@Body(new ZodValidationPipe(registerOwnerSchema)) body: RegisterOwnerInput) {
    return this.registerOwnerUseCase.execute(body)
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
}
