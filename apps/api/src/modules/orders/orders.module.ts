import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { MercadoPagoModule } from '../mercado-pago'
import { CreatePendingOrderUseCase } from './application/create-pending-order.use-case'
import { GetOrderByDocumentIdUseCase } from './application/get-order-by-document-id.use-case'
import { PendingOrderCleanupScheduler } from './application/services/pending-order-cleanup.scheduler'
import { OrdersController } from './presentation/orders.controller'

@Module({
  imports: [AuthModule, MercadoPagoModule],
  controllers: [OrdersController],
  providers: [
    CreatePendingOrderUseCase,
    GetOrderByDocumentIdUseCase,
    PendingOrderCleanupScheduler,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class OrdersModule {}
