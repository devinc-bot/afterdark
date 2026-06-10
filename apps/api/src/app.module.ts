import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { SharedModule } from './shared/shared.module'
import { AuthModule } from './modules/auth'
import { CategoriesModule } from './modules/categories'
import { HealthModule } from './modules/health'
import { OrdersModule } from './modules/orders'
import { UsersModule } from './modules/users'

@Module({
  imports: [SharedModule, AuthModule, CategoriesModule, HealthModule, OrdersModule, UsersModule],
  controllers: [AppController],
})
export class AppModule {}
