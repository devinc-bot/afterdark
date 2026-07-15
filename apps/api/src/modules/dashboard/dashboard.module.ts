import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'

@Module({
  imports: [AuthModule],
  controllers: [DashboardController],
  providers: [DashboardService, JwtAuthGuard, RolesGuard],
  exports: [DashboardService],
})
export class DashboardModule {}
