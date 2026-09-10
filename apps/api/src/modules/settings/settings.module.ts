import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { FilesModule } from '../files/files.module'
import { OwnerModule } from '../owner/owner.module'
import { StaffModule } from '../staff/staff.module'
import { UsersModule } from '../users/users.module'
import { GetSettingsUseCase } from './application/get-settings.use-case'
import { RemoveAvatarUseCase } from './application/remove-avatar.use-case'
import { UpdateSettingsUseCase } from './application/update-settings.use-case'
import { UploadAvatarUseCase } from './application/upload-avatar.use-case'
import { SettingsController } from './presentation/settings.controller'

@Module({
  imports: [AuthModule, FilesModule, OwnerModule, StaffModule, UsersModule],
  controllers: [SettingsController],
  providers: [
    GetSettingsUseCase,
    UpdateSettingsUseCase,
    UploadAvatarUseCase,
    RemoveAvatarUseCase,
    JwtAuthGuard,
  ],
})
export class SettingsModule {}
