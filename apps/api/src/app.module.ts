import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { CommonModule } from './common/common.module'
import { AuthModule } from './modules/auth'
import { CategoriesModule } from './modules/categories'
import { ClubsModule } from './modules/clubs'
import { HealthModule } from './modules/health'
import { InvitationsModule } from './modules/invitations'
import { OrdersModule } from './modules/orders'
import { OwnerModule } from './modules/owner'
import { SessionModule } from './modules/session'
import { StaffModule } from './modules/staff'

@Module({
  imports: [
    CommonModule,
    AuthModule,
    CategoriesModule,
    ClubsModule,
    HealthModule,
    InvitationsModule,
    OrdersModule,
    OwnerModule,
    SessionModule,
    StaffModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
