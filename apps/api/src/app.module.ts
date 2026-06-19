import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { CommonModule } from './common/common.module'
import { AuthModule } from './modules/auth'
import { CategoriesModule } from './modules/categories'
import { ClubsModule } from './modules/clubs'
import { HealthModule } from './modules/health'
import { OrdersModule } from './modules/orders'
import { UsersModule } from './modules/users'

@Module({
  imports: [
    CommonModule,
    AuthModule,
    CategoriesModule,
    ClubsModule,
    HealthModule,
    OrdersModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
