import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { AcceptStaffInvitationUseCase } from './application/accept-staff-invitation.use-case'
import { CreateStaffInvitationUseCase } from './application/create-staff-invitation.use-case'
import { DeleteStaffInvitationUseCase } from './application/delete-staff-invitation.use-case'
import { GetStaffInvitationByLinkUseCase } from './application/get-staff-invitation-by-link.use-case'
import { ListStaffInvitationsUseCase } from './application/list-staff-invitations.use-case'
import { InvitationsCleanupScheduler } from './application/services/invitations-cleanup.scheduler'
import { InvitationOwnerService } from './application/services/invitation-owner.service'
import { InvitationsController } from './presentation/invitations.controller'

@Module({
  imports: [AuthModule],
  controllers: [InvitationsController],
  providers: [
    CreateStaffInvitationUseCase,
    ListStaffInvitationsUseCase,
    DeleteStaffInvitationUseCase,
    AcceptStaffInvitationUseCase,
    GetStaffInvitationByLinkUseCase,
    InvitationOwnerService,
    InvitationsCleanupScheduler,
    JwtAuthGuard,
  ],
})
export class InvitationsModule {}
