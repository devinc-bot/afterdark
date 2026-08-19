import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { GetAdminUserDetailUseCase } from './application/get-admin-user-detail.use-case'
import { GetCurrentUserUseCase } from './application/get-current-user.use-case'
import { ListAdminUsersUseCase } from './application/list-admin-users.use-case'
import { UpdateAdminUserStatusUseCase } from './application/update-admin-user-status.use-case'
import { UpdateCurrentUserUseCase } from './application/update-current-user.use-case'
import { UsersController } from './presentation/users.controller'

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [
    GetCurrentUserUseCase,
    UpdateCurrentUserUseCase,
    ListAdminUsersUseCase,
    GetAdminUserDetailUseCase,
    UpdateAdminUserStatusUseCase,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [GetCurrentUserUseCase, UpdateCurrentUserUseCase, ListAdminUsersUseCase],
})
export class UsersModule {}
