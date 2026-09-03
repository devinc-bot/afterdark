import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { GetCurrentSessionUseCase } from './application/get-current-session.use-case'
import { ListAccountSessionsUseCase } from './application/list-account-sessions.use-case'
import { RevokeAccountSessionUseCase } from './application/revoke-account-session.use-case'
import { SessionController } from './presentation/session.controller'

@Module({
  imports: [AuthModule],
  controllers: [SessionController],
  providers: [
    GetCurrentSessionUseCase,
    ListAccountSessionsUseCase,
    RevokeAccountSessionUseCase,
    JwtAuthGuard,
  ],
  exports: [GetCurrentSessionUseCase],
})
export class SessionModule {}
