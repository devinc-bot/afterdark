import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { OwnerModule } from '../owner/owner.module'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

@Module({
  imports: [AuthModule, OwnerModule],
  controllers: [SettingsController],
  providers: [SettingsService, JwtAuthGuard],
})
export class SettingsModule {}
