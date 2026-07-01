import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { InvitationsController } from './invitations.controller'
import { InvitationsService } from './invitations.service'
import { InvitationsCleanupScheduler } from './invitations-cleanup.scheduler'

@Module({
  imports: [AuthModule],
  controllers: [InvitationsController],
  providers: [InvitationsService, JwtAuthGuard, InvitationsCleanupScheduler],
  exports: [InvitationsService],
})
export class InvitationsModule {}
