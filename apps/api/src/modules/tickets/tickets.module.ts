import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { CreateTicketUseCase } from './application/create-ticket.use-case'
import { DeleteTicketUseCase } from './application/delete-ticket.use-case'
import { GetTicketByDocumentIdUseCase } from './application/get-ticket-by-document-id.use-case'
import { ListMyTicketsUseCase } from './application/list-my-tickets.use-case'
import { ListPurchasedTicketsUseCase } from './application/list-purchased-tickets.use-case'
import { UpdateTicketUseCase } from './application/update-ticket.use-case'
import { TicketsController } from './presentation/tickets.controller'

@Module({
  imports: [AuthModule],
  controllers: [TicketsController],
  providers: [
    ListMyTicketsUseCase,
    ListPurchasedTicketsUseCase,
    GetTicketByDocumentIdUseCase,
    CreateTicketUseCase,
    UpdateTicketUseCase,
    DeleteTicketUseCase,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class TicketsModule {}
