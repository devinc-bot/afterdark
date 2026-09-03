import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { MercadoPagoModule } from '../mercado-pago'
import { RealtimeModule } from '../realtime'
import { CreatePendingOrderUseCase } from './application/create-pending-order.use-case'
import { DeletePendingOrderUseCase } from './application/delete-pending-order.use-case'
import { GetOrderByDocumentIdUseCase } from './application/get-order-by-document-id.use-case'
import { ListMyOrdersUseCase } from './application/list-my-orders.use-case'
import { PendingOrderCleanupScheduler } from './application/services/pending-order-cleanup.scheduler'
import { PurchaseExpiryScheduler } from './application/services/purchase-expiry.scheduler'
import { OrdersController } from './presentation/orders.controller'

@Module({
  imports: [AuthModule, MercadoPagoModule, RealtimeModule],
  controllers: [OrdersController],
  providers: [
    CreatePendingOrderUseCase,
    DeletePendingOrderUseCase,
    GetOrderByDocumentIdUseCase,
    ListMyOrdersUseCase,
    PendingOrderCleanupScheduler,
    PurchaseExpiryScheduler,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class OrdersModule {}
