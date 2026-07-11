import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { I18nModule } from '@afterdark/i18n/server'
import { CommonModule } from './modules/common/common.module'
import { AuthModule } from './modules/auth'
import { CategoriesModule } from './modules/categories'
import { ClubsModule } from './modules/clubs'
import { HealthModule } from './modules/health'
import { InvitationsModule } from './modules/invitations'
import { OrdersModule } from './modules/orders'
import { SessionModule } from './modules/session'
import { SettingsModule } from './modules/settings'
import { StaffModule } from './modules/staff'
import { TicketsModule } from './modules/tickets'
import { EventsModule } from './modules/events'
import { MailModule } from './modules/mail'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    I18nModule,
    CommonModule,
    AuthModule,
    CategoriesModule,
    ClubsModule,
    HealthModule,
    InvitationsModule,
    OrdersModule,
    SessionModule,
    SettingsModule,
    StaffModule,
    TicketsModule,
    EventsModule,
    MailModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
