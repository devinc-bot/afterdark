import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { CreateTicketTypeUseCase } from './application/create-ticket-type.use-case'
import { ListTicketTypesUseCase } from './application/list-ticket-types.use-case'
import { TicketTypesController } from './presentation/ticket-types.controller'

@Module({
  imports: [AuthModule],
  controllers: [TicketTypesController],
  providers: [CreateTicketTypeUseCase, ListTicketTypesUseCase, JwtAuthGuard, RolesGuard],
})
export class TicketTypesModule {}
