import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ENV } from '../common/config/env'
import { MailModule } from '../mail'
import { ForgotPasswordUseCase } from './application/forgot-password.use-case'
import { GoogleOauthCallbackUseCase } from './application/google-oauth-callback.use-case'
import { GoogleOauthStartUseCase } from './application/google-oauth-start.use-case'
import { LoginUseCase } from './application/login.use-case'
import { RegisterOwnerUseCase } from './application/register-owner.use-case'
import { RegisterUserUseCase } from './application/register-user.use-case'
import { RequestUserRegistrationUseCase } from './application/request-user-registration.use-case'
import { ConfirmUserRegistrationUseCase } from './application/confirm-user-registration.use-case'
import { RequestOwnerRegistrationUseCase } from './application/request-owner-registration.use-case'
import { ConfirmOwnerRegistrationUseCase } from './application/confirm-owner-registration.use-case'
import { ResetPasswordUseCase } from './application/reset-password.use-case'
import { AuthAccountService } from './application/services/auth-account.service'
import { GoogleOauthService } from './application/services/google-oauth.service'
import { PasswordResetCleanupScheduler } from './application/services/password-reset-cleanup.scheduler'
import { UserRegistrationCleanupScheduler } from './application/services/user-registration-cleanup.scheduler'
import { OwnerRegistrationCleanupScheduler } from './application/services/owner-registration-cleanup.scheduler'
import { ACCESS_TOKEN_TTL } from './auth.constants'
import { AuthController } from './presentation/auth.controller'

@Module({
  imports: [
    JwtModule.register({
      secret: ENV.JWT_SECRET,
      signOptions: { expiresIn: ACCESS_TOKEN_TTL },
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthAccountService,
    GoogleOauthService,
    LoginUseCase,
    RegisterUserUseCase,
    RegisterOwnerUseCase,
    RequestUserRegistrationUseCase,
    ConfirmUserRegistrationUseCase,
    RequestOwnerRegistrationUseCase,
    ConfirmOwnerRegistrationUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    GoogleOauthStartUseCase,
    GoogleOauthCallbackUseCase,
    PasswordResetCleanupScheduler,
    UserRegistrationCleanupScheduler,
    OwnerRegistrationCleanupScheduler,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
