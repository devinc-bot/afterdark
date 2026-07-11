import { Module } from '@nestjs/common'
import { OrdersController } from './presentation/orders.controller'

@Module({
  controllers: [OrdersController],
})
export class OrdersModule {}
