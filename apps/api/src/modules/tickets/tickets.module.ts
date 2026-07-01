import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { OwnerRoleGuard } from '../common/guards/owner-role.guard'
import { TicketsController } from './tickets.controller'
import { TicketsService } from './tickets.service'

@Module({
  imports: [AuthModule],
  controllers: [TicketsController],
  providers: [TicketsService, JwtAuthGuard, OwnerRoleGuard],
  exports: [TicketsService],
})
export class TicketsModule {}
