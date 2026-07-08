import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { StaffController } from './staff.controller'
import { StaffService } from './staff.service'

@Module({
  imports: [AuthModule],
  controllers: [StaffController],
  providers: [StaffService, JwtAuthGuard, RolesGuard],
  exports: [StaffService],
})
export class StaffModule {}
