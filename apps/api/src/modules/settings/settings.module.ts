import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { OwnerModule } from '../owner/owner.module'
import { StaffModule } from '../staff/staff.module'
import { UsersModule } from '../users/users.module'
import { GetSettingsUseCase } from './application/get-settings.use-case'
import { UpdateSettingsUseCase } from './application/update-settings.use-case'
import { SettingsController } from './presentation/settings.controller'

@Module({
  imports: [AuthModule, OwnerModule, StaffModule, UsersModule],
  controllers: [SettingsController],
  providers: [GetSettingsUseCase, UpdateSettingsUseCase, JwtAuthGuard],
})
export class SettingsModule {}
