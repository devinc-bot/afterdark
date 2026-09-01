import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Sse,
  UseGuards,
} from '@nestjs/common'
import type { MessageEvent } from '@nestjs/common'
import { API_ROUTES } from '@repo/common'
import {
  USER_ROLE,
  type BuyerOrderSummaryResponse,
  type CreateOrderResponse,
  type JwtPayload,
  type OrderResponse,
  type PaginatedResponse,
} from '@repo/types'
import {
  createOrderSchema,
  listOrdersQuerySchema,
  uuidSchema,
  type CreateOrderInput,
  type ListOrdersQueryInput,
} from '@repo/validators'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { SseStreamsService } from '../../realtime/application/services/sse-streams.service'
import { CreatePendingOrderUseCase } from '../application/create-pending-order.use-case'
import { DeletePendingOrderUseCase } from '../application/delete-pending-order.use-case'
import { GetOrderByDocumentIdUseCase } from '../application/get-order-by-document-id.use-case'
import { ListMyOrdersUseCase } from '../application/list-my-orders.use-case'

function toAfterVersion(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0
}

@Controller(API_ROUTES.orders.prefix)
export class OrdersController {
  constructor(
    @Inject(CreatePendingOrderUseCase)
    private readonly createPendingOrderUseCase: CreatePendingOrderUseCase,
    @Inject(GetOrderByDocumentIdUseCase)
    private readonly getOrderByDocumentIdUseCase: GetOrderByDocumentIdUseCase,
    @Inject(ListMyOrdersUseCase) private readonly listMyOrdersUseCase: ListMyOrdersUseCase,
    @Inject(DeletePendingOrderUseCase)
    private readonly deletePendingOrderUseCase: DeletePendingOrderUseCase,
    @Inject(SseStreamsService) private readonly sseStreamsService: SseStreamsService
  ) {}

  @Get(API_ROUTES.orders.path.list())
  @Roles([USER_ROLE.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  list(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(listOrdersQuerySchema)) query: ListOrdersQueryInput
  ): Promise<PaginatedResponse<BuyerOrderSummaryResponse>> {
    return this.listMyOrdersUseCase.execute(user.sub, query)
  }

  @Delete(API_ROUTES.orders.path.delete(':documentId'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([USER_ROLE.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<void> {
    return this.deletePendingOrderUseCase.execute(user.sub, documentId)
  }

  @Post(API_ROUTES.orders.path.create())
  @HttpCode(HttpStatus.CREATED)
  @Roles([USER_ROLE.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createOrderSchema)) body: CreateOrderInput
  ): Promise<CreateOrderResponse> {
    return this.createPendingOrderUseCase.execute(user.sub, body)
  }

  @Get(API_ROUTES.orders.path.get(':documentId'))
  @Roles([USER_ROLE.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  get(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<OrderResponse> {
    return this.getOrderByDocumentIdUseCase.execute(user.sub, documentId)
  }

  @Sse(API_ROUTES.orders.path.stream(':documentId'))
  @Roles([USER_ROLE.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  stream(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Query('afterVersion') afterVersion?: string
  ): Promise<import('rxjs').Observable<MessageEvent>> {
    return this.sseStreamsService.createPurchaseStream(
      user.sub,
      documentId,
      toAfterVersion(afterVersion)
    )
  }
}
