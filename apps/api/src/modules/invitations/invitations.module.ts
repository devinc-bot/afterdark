import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { InvitationsController } from './invitations.controller'
import { InvitationsService } from './invitations.service'

@Module({
  imports: [AuthModule],
  controllers: [InvitationsController],
  providers: [InvitationsService, JwtAuthGuard],
  exports: [InvitationsService],
})
export class InvitationsModule {}
