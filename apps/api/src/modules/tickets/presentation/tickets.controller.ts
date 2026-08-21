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
import { API_ROUTES } from '@repo/common'
import type {
  JwtPayload,
  PaginatedResponse,
  PurchasedTicketQrResponse,
  PurchasedTicketResponse,
  ScannedTicketHistoryResponse,
  TicketCheckInResponse,
  TicketResponse,
} from '@repo/types'
import { USER_ROLE } from '@repo/types'
import {
  createTicketSchema,
  listPurchasedTicketsQuerySchema,
  listScannedTicketsQuerySchema,
  listTicketsQuerySchema,
  ticketSoldDocumentIdSchema,
  ticketCheckInSchema,
  updateTicketSchema,
  uuidSchema,
  type CreateTicketInput,
  type ListPurchasedTicketsQueryInput,
  type ListScannedTicketsQueryInput,
  type ListTicketsQueryInput,
  type TicketCheckInInput,
  type UpdateTicketInput,
} from '@repo/validators'
import { TranslationService } from '@repo/i18n/server'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { CreateTicketUseCase } from '../application/create-ticket.use-case'
import { CheckInTicketUseCase } from '../application/check-in-ticket.use-case'
import { DeleteTicketUseCase } from '../application/delete-ticket.use-case'
import { GetTicketByDocumentIdUseCase } from '../application/get-ticket-by-document-id.use-case'
import { ListMyTicketsUseCase } from '../application/list-my-tickets.use-case'
import { ListPurchasedTicketsUseCase } from '../application/list-purchased-tickets.use-case'
import { IssuePurchasedTicketQrUseCase } from '../application/issue-purchased-ticket-qr.use-case'
import { ListScannedTicketsHistoryUseCase } from '../application/list-scanned-tickets-history.use-case'
import { UpdateTicketUseCase } from '../application/update-ticket.use-case'
import { toTicketCheckInHttpResponse } from './ticket-check-in-http.mapper'

@Controller(API_ROUTES.tickets.prefix)
export class TicketsController {
  constructor(
    @Inject(ListMyTicketsUseCase) private readonly listMyTicketsUseCase: ListMyTicketsUseCase,
    @Inject(ListPurchasedTicketsUseCase)
    private readonly listPurchasedTicketsUseCase: ListPurchasedTicketsUseCase,
    @Inject(IssuePurchasedTicketQrUseCase)
    private readonly issuePurchasedTicketQrUseCase: IssuePurchasedTicketQrUseCase,
    @Inject(CheckInTicketUseCase)
    private readonly checkInTicketUseCase: CheckInTicketUseCase,
    @Inject(ListScannedTicketsHistoryUseCase)
    private readonly listScannedTicketsHistoryUseCase: ListScannedTicketsHistoryUseCase,
    @Inject(GetTicketByDocumentIdUseCase)
    private readonly getTicketByDocumentIdUseCase: GetTicketByDocumentIdUseCase,
    @Inject(CreateTicketUseCase) private readonly createTicketUseCase: CreateTicketUseCase,
    @Inject(UpdateTicketUseCase) private readonly updateTicketUseCase: UpdateTicketUseCase,
    @Inject(DeleteTicketUseCase) private readonly deleteTicketUseCase: DeleteTicketUseCase,
    @Inject(TranslationService) private readonly ts: TranslationService
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

  @Get(API_ROUTES.tickets.path.purchased())
  @Roles([USER_ROLE.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  listPurchasedTickets(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(listPurchasedTicketsQuerySchema))
    query: ListPurchasedTicketsQueryInput
  ): Promise<PaginatedResponse<PurchasedTicketResponse>> {
    return this.listPurchasedTicketsUseCase.execute(user.sub, query)
  }

  @Get(API_ROUTES.tickets.path.purchasedQr(':ticketSoldDocumentId'))
  @Roles([USER_ROLE.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  issuePurchasedTicketQr(
    @CurrentUser() user: JwtPayload,
    @Param('ticketSoldDocumentId', new ZodValidationPipe(ticketSoldDocumentIdSchema))
    ticketSoldDocumentId: string
  ): Promise<PurchasedTicketQrResponse> {
    return this.issuePurchasedTicketQrUseCase.execute(user.sub, ticketSoldDocumentId)
  }

  @Post(API_ROUTES.tickets.path.checkIns())
  @HttpCode(HttpStatus.OK)
  @Roles([USER_ROLE.OWNER, USER_ROLE.STAFF])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async checkInTicket(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(ticketCheckInSchema)) body: TicketCheckInInput
  ): Promise<TicketCheckInResponse> {
    const result = await this.checkInTicketUseCase.execute({
      operatorDocumentId: user.sub,
      operatorRole: user.role,
      token: body.token,
    })

    return toTicketCheckInHttpResponse(result, (code) => this.ts.translateError(code))
  }

  @Get(API_ROUTES.tickets.path.checkInHistory())
  @Roles([USER_ROLE.OWNER, USER_ROLE.STAFF])
  @UseGuards(JwtAuthGuard, RolesGuard)
  listScannedTicketsHistory(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(listScannedTicketsQuerySchema))
    query: ListScannedTicketsQueryInput
  ): Promise<ScannedTicketHistoryResponse> {
    return this.listScannedTicketsHistoryUseCase.execute(user.sub, user.role, query)
  }

  @Get(API_ROUTES.tickets.path.get(':documentId'))
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  getByDocumentId(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<TicketResponse> {
    return this.getTicketByDocumentIdUseCase.execute(user.sub, documentId)
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
