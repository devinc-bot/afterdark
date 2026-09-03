import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common'
import type {
  DashboardKpiResponse,
  DashboardSalesAnalyticsResponse,
  JwtPayload,
  OwnerSaleResponse,
  PaginatedResponse,
} from '@repo/types'
import { USER_ROLE } from '@repo/types'
import {
  dashboardKpiQuerySchema,
  dashboardSalesAnalyticsQuerySchema,
  listOwnerSalesQuerySchema,
  type DashboardKpiQueryInput,
  type DashboardSalesAnalyticsQueryInput,
  type ListOwnerSalesQueryInput,
} from '@repo/validators'
import { ApiRateLimit } from '../common/decorators/api-rate-limit.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { RATE_LIMIT_PROFILE } from '../../config/rate-limit.policy'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { DashboardService } from './dashboard.service'

@Controller('dashboard')
@ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
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

  @Get('sales')
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  listSales(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(listOwnerSalesQuerySchema)) query: ListOwnerSalesQueryInput
  ): Promise<PaginatedResponse<OwnerSaleResponse>> {
    return this.dashboardService.listSales(user.sub, query)
  }

  @Get('sales/analytics')
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  getSalesAnalytics(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(dashboardSalesAnalyticsQuerySchema))
    query: DashboardSalesAnalyticsQueryInput
  ): Promise<DashboardSalesAnalyticsResponse> {
    return this.dashboardService.getSalesAnalytics(user.sub, query)
  }
}
