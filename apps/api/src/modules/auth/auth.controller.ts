import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common'
import {
  loginSchema,
  registerOwnerSchema,
  registerUserSchema,
  type LoginInput,
  type RegisterOwnerInput,
  type RegisterUserInput,
} from '@afterdark/validators'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { AuthService } from './auth.service'
import { API_ROUTES } from '@afterdark/common'

@Controller(API_ROUTES.auth.prefix)
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post(API_ROUTES.auth.path.login())
  @HttpCode(HttpStatus.OK)
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginInput) {
    return this.authService.login(body)
  }

  @Post(API_ROUTES.auth.path.registerUser())
  @HttpCode(HttpStatus.CREATED)
  registerUser(@Body(new ZodValidationPipe(registerUserSchema)) body: RegisterUserInput) {
    return this.authService.registerUser(body)
  }

  @Post(API_ROUTES.auth.path.registerOwner())
  @HttpCode(HttpStatus.CREATED)
  registerOwner(@Body(new ZodValidationPipe(registerOwnerSchema)) body: RegisterOwnerInput) {
    return this.authService.registerOwner(body)
  }
}
