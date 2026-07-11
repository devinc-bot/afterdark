import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common'
import { API_ROUTES } from '@afterdark/common'
import {
  loginSchema,
  registerOwnerSchema,
  registerUserSchema,
  type LoginInput,
  type RegisterOwnerInput,
  type RegisterUserInput,
} from '@afterdark/validators'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { LoginUseCase } from '../application/login.use-case'
import { RegisterOwnerUseCase } from '../application/register-owner.use-case'
import { RegisterUserUseCase } from '../application/register-user.use-case'

@Controller(API_ROUTES.auth.prefix)
export class AuthController {
  constructor(
    @Inject(LoginUseCase) private readonly loginUseCase: LoginUseCase,
    @Inject(RegisterUserUseCase) private readonly registerUserUseCase: RegisterUserUseCase,
    @Inject(RegisterOwnerUseCase) private readonly registerOwnerUseCase: RegisterOwnerUseCase
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
}
