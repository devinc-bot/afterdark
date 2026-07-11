import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ENV } from '../common/config/env'
import { LoginUseCase } from './application/login.use-case'
import { RegisterOwnerUseCase } from './application/register-owner.use-case'
import { RegisterUserUseCase } from './application/register-user.use-case'
import { AuthAccountService } from './application/services/auth-account.service'
import { ACCESS_TOKEN_TTL } from './auth.constants'
import { AuthController } from './presentation/auth.controller'

@Module({
  imports: [
    JwtModule.register({
      secret: ENV.JWT_SECRET,
      signOptions: { expiresIn: ACCESS_TOKEN_TTL },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthAccountService, LoginUseCase, RegisterUserUseCase, RegisterOwnerUseCase],
  exports: [JwtModule],
})
export class AuthModule {}
