import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { loginSchema, type LoginInput } from '@afterdark/validators'
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginInput) {
    return this.authService.login(body)
  }
}
