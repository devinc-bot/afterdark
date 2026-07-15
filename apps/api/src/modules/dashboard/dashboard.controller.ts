import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common'
import type { DashboardKpiResponse, JwtPayload } from '@afterdark/types'
import { USER_ROLE } from '@afterdark/types'
import { dashboardKpiQuerySchema, type DashboardKpiQueryInput } from '@afterdark/validators'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { DashboardService } from './dashboard.service'

@Controller('dashboard')
export class DashboardController {
  constructor(@Inject(DashboardService) private readonly dashboardService: DashboardService) {}

  @Get('kpidashboard')
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  getKpiDashboard(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(dashboardKpiQuerySchema)) query: DashboardKpiQueryInput
  ): Promise<DashboardKpiResponse> {
    return this.dashboardService.getKpiDashboard(user.sub, query)
  }

  @Get('sales/analytics')
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  getSalesAnalytics() {
    return this.dashboardService.getSalesAnalytics()
  }
}
