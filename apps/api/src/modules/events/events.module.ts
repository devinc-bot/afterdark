import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { FilesModule } from '../files'
import { RealtimeModule } from '../realtime'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { CreateEventUseCase } from './application/create-event.use-case'
import { DeleteEventUseCase } from './application/delete-event.use-case'
import { GetEventByDocumentIdUseCase } from './application/get-event-by-document-id.use-case'
import { GetPublicEventByDocumentIdUseCase } from './application/get-public-event-by-document-id.use-case'
import { ListMyEventsUseCase } from './application/list-my-events.use-case'
import { ListPublicEventsUseCase } from './application/list-public-events.use-case'
import { UpdateEventUseCase } from './application/update-event.use-case'
import { EventImagesService } from './application/services/event-images.service'
import { EventsController } from './presentation/events.controller'

@Module({
  imports: [AuthModule, FilesModule, RealtimeModule],
  controllers: [EventsController],
  providers: [
    EventImagesService,
    ListPublicEventsUseCase,
    GetPublicEventByDocumentIdUseCase,
    ListMyEventsUseCase,
    GetEventByDocumentIdUseCase,
    CreateEventUseCase,
    UpdateEventUseCase,
    DeleteEventUseCase,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class EventsModule {}
