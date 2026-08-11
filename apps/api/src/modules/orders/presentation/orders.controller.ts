import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
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
import { CreatePendingOrderUseCase } from '../application/create-pending-order.use-case'
import { GetOrderByDocumentIdUseCase } from '../application/get-order-by-document-id.use-case'
import { ListMyOrdersUseCase } from '../application/list-my-orders.use-case'

@Controller(API_ROUTES.orders.prefix)
export class OrdersController {
  constructor(
    @Inject(CreatePendingOrderUseCase)
    private readonly createPendingOrderUseCase: CreatePendingOrderUseCase,
    @Inject(GetOrderByDocumentIdUseCase)
    private readonly getOrderByDocumentIdUseCase: GetOrderByDocumentIdUseCase,
    @Inject(ListMyOrdersUseCase) private readonly listMyOrdersUseCase: ListMyOrdersUseCase
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
}
