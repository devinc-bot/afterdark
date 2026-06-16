import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common'
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@afterdark/validators'
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginInput) {
    return this.authService.login(body)
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body(new ZodValidationPipe(registerSchema)) body: RegisterInput) {
    return this.authService.register(body)
  }
}
