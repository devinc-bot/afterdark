import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { OwnerRoleGuard } from '../common/guards/owner-role.guard'
import { StaffController } from './staff.controller'
import { StaffService } from './staff.service'

@Module({
  imports: [AuthModule],
  controllers: [StaffController],
  providers: [StaffService, JwtAuthGuard, OwnerRoleGuard],
  exports: [StaffService],
})
export class StaffModule {}
