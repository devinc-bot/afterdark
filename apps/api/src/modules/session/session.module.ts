import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { GetCurrentSessionUseCase } from './application/get-current-session.use-case'
import { SessionController } from './presentation/session.controller'

@Module({
  imports: [AuthModule],
  controllers: [SessionController],
  providers: [GetCurrentSessionUseCase, JwtAuthGuard],
  exports: [GetCurrentSessionUseCase],
})
export class SessionModule {}
