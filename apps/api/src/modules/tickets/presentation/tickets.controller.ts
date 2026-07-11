import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { API_ROUTES } from '@afterdark/common'
import type { JwtPayload, PaginatedResponse, TicketResponse } from '@afterdark/types'
import { USER_ROLE } from '@afterdark/types'
import {
  createTicketSchema,
  listTicketsQuerySchema,
  updateTicketSchema,
  uuidSchema,
  type CreateTicketInput,
  type ListTicketsQueryInput,
  type UpdateTicketInput,
} from '@afterdark/validators'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { CreateTicketUseCase } from '../application/create-ticket.use-case'
import { DeleteTicketUseCase } from '../application/delete-ticket.use-case'
import { ListMyTicketsUseCase } from '../application/list-my-tickets.use-case'
import { UpdateTicketUseCase } from '../application/update-ticket.use-case'

@Controller(API_ROUTES.tickets.prefix)
export class TicketsController {
  constructor(
    @Inject(ListMyTicketsUseCase) private readonly listMyTicketsUseCase: ListMyTicketsUseCase,
    @Inject(CreateTicketUseCase) private readonly createTicketUseCase: CreateTicketUseCase,
    @Inject(UpdateTicketUseCase) private readonly updateTicketUseCase: UpdateTicketUseCase,
    @Inject(DeleteTicketUseCase) private readonly deleteTicketUseCase: DeleteTicketUseCase
  ) {}

  @Get(API_ROUTES.tickets.path.list())
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  listMyTickets(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(listTicketsQuerySchema)) query: ListTicketsQueryInput
  ): Promise<PaginatedResponse<TicketResponse>> {
    return this.listMyTicketsUseCase.execute(user.sub, query)
  }

  @Post(API_ROUTES.tickets.path.create())
  @HttpCode(HttpStatus.CREATED)
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createTicketSchema)) body: CreateTicketInput
  ): Promise<TicketResponse> {
    return this.createTicketUseCase.execute(user.sub, body)
  }

  @Patch(API_ROUTES.tickets.path.update(':documentId'))
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Body(new ZodValidationPipe(updateTicketSchema)) body: UpdateTicketInput
  ): Promise<TicketResponse> {
    return this.updateTicketUseCase.execute(user.sub, documentId, body)
  }

  @Delete(API_ROUTES.tickets.path.delete(':documentId'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<void> {
    return this.deleteTicketUseCase.execute(user.sub, documentId)
  }
}
