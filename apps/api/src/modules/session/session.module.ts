import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { SessionController } from './session.controller'
import { SessionService } from './session.service'

@Module({
  imports: [AuthModule],
  controllers: [SessionController],
  providers: [SessionService, JwtAuthGuard],
  exports: [SessionService],
})
export class SessionModule {}
