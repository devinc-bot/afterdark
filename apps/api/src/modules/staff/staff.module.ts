import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { DeleteStaffUseCase } from './application/delete-staff.use-case'
import { GetCurrentStaffUseCase } from './application/get-current-staff.use-case'
import { ListPersonnelForOwnerUseCase } from './application/list-personnel-for-owner.use-case'
import { UpdateCurrentStaffUseCase } from './application/update-current-staff.use-case'
import { UpdateStaffStatusUseCase } from './application/update-staff-status.use-case'
import { StaffController } from './presentation/staff.controller'

@Module({
  imports: [AuthModule],
  controllers: [StaffController],
  providers: [
    GetCurrentStaffUseCase,
    UpdateCurrentStaffUseCase,
    ListPersonnelForOwnerUseCase,
    DeleteStaffUseCase,
    UpdateStaffStatusUseCase,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [GetCurrentStaffUseCase, UpdateCurrentStaffUseCase],
})
export class StaffModule {}
