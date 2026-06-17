import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ENV } from '../../shared/config/env'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { ACCESS_TOKEN_TTL } from './auth.constants'

@Module({
  imports: [
    JwtModule.register({
      secret: ENV.JWT_SECRET,
      signOptions: { expiresIn: ACCESS_TOKEN_TTL },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
