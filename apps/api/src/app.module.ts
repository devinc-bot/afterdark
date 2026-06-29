import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { I18nModule } from '@afterdark/i18n/server'
import { CommonModule } from './modules/common/common.module'
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
    I18nModule,
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
