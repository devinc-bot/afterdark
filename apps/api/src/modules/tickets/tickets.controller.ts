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
import type { JwtPayload, PaginatedResponse, TicketResponse } from '@afterdark/types'
import {
  createTicketSchema,
  listTicketsQuerySchema,
  updateTicketSchema,
  uuidSchema,
  type CreateTicketInput,
  type ListTicketsQueryInput,
  type UpdateTicketInput,
} from '@afterdark/validators'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { OwnerRoleGuard } from '../common/guards/owner-role.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { TicketsService } from './tickets.service'

@Controller('tickets')
export class TicketsController {
  constructor(@Inject(TicketsService) private readonly ticketsService: TicketsService) {}

  @Get('my-tickets')
  @UseGuards(JwtAuthGuard, OwnerRoleGuard)
  listMyTickets(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(listTicketsQuerySchema)) query: ListTicketsQueryInput
  ): Promise<PaginatedResponse<TicketResponse>> {
    return this.ticketsService.listMyTickets(user.sub, query)
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, OwnerRoleGuard)
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createTicketSchema)) body: CreateTicketInput
  ): Promise<TicketResponse> {
    return this.ticketsService.createTicket(user.sub, body)
  }

  @Patch(':documentId')
  @UseGuards(JwtAuthGuard, OwnerRoleGuard)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Body(new ZodValidationPipe(updateTicketSchema)) body: UpdateTicketInput
  ): Promise<TicketResponse> {
    return this.ticketsService.updateTicket(user.sub, documentId, body)
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, OwnerRoleGuard)
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<void> {
    return this.ticketsService.deleteTicket(user.sub, documentId)
  }
}
