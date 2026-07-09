import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { EventsController } from './events.controller'
import { EventsService } from './events.service'

@Module({
  imports: [AuthModule],
  controllers: [EventsController],
  providers: [EventsService, JwtAuthGuard, RolesGuard],
  exports: [EventsService],
})
export class EventsModule {}
