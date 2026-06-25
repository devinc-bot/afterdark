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

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginInput) {
    return this.authService.login(body)
  }

  @Post('register/user')
  @HttpCode(HttpStatus.CREATED)
  registerUser(@Body(new ZodValidationPipe(registerUserSchema)) body: RegisterUserInput) {
    return this.authService.registerUser(body)
  }

  @Post('register/owner')
  @HttpCode(HttpStatus.CREATED)
  registerOwner(@Body(new ZodValidationPipe(registerOwnerSchema)) body: RegisterOwnerInput) {
    return this.authService.registerOwner(body)
  }
}
