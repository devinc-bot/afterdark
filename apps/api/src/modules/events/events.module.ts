import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { CreateEventUseCase } from './application/create-event.use-case'
import { DeleteEventUseCase } from './application/delete-event.use-case'
import { ListMyEventsUseCase } from './application/list-my-events.use-case'
import { UpdateEventUseCase } from './application/update-event.use-case'
import { EventsController } from './presentation/events.controller'

@Module({
  imports: [AuthModule],
  controllers: [EventsController],
  providers: [
    ListMyEventsUseCase,
    CreateEventUseCase,
    UpdateEventUseCase,
    DeleteEventUseCase,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class EventsModule {}
