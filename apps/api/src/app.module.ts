import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { I18nModule } from '@repo/i18n/server'
import { CommonModule } from './modules/common/common.module'
import { AuthModule } from './modules/auth'
import { CategoriesModule } from './modules/categories'
import { LocationsModule } from './modules/locations'
import { DashboardModule } from './modules/dashboard'
import { ErrorsModule } from './modules/errors'
import { HealthModule } from './modules/health'
import { InvitationsModule } from './modules/invitations'
import { OrdersModule } from './modules/orders'
import { SessionModule } from './modules/session'
import { SettingsModule } from './modules/settings'
import { StaffModule } from './modules/staff'
import { TicketsModule } from './modules/tickets'
import { EventsModule } from './modules/events'
import { MailModule } from './modules/mail'
import { GeoModule } from './modules/geo'
import { MercadoPagoModule } from './modules/mercado-pago'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    I18nModule,
    CommonModule,
    AuthModule,
    CategoriesModule,
    LocationsModule,
    DashboardModule,
    ErrorsModule,
    HealthModule,
    InvitationsModule,
    OrdersModule,
    SessionModule,
    SettingsModule,
    StaffModule,
    TicketsModule,
    EventsModule,
    MailModule,
    GeoModule,
    MercadoPagoModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
