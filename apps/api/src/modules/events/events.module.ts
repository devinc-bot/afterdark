import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { OwnerRoleGuard } from '../common/guards/owner-role.guard'
import { EventsController } from './events.controller'
import { EventsService } from './events.service'

@Module({
  imports: [AuthModule],
  controllers: [EventsController],
  providers: [EventsService, JwtAuthGuard, OwnerRoleGuard],
  exports: [EventsService],
})
export class EventsModule {}
