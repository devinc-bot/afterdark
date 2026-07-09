import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { TicketsController } from './tickets.controller'
import { TicketsService } from './tickets.service'

@Module({
  imports: [AuthModule],
  controllers: [TicketsController],
  providers: [TicketsService, JwtAuthGuard, RolesGuard],
  exports: [TicketsService],
})
export class TicketsModule {}
