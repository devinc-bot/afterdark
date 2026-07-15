import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  findDashboardKpiByOwnerDocumentId,
  findDashboardTicketsSoldSeriesByOwnerDocumentId,
} from '@afterdark/db'
import type { DashboardKpiResponse, DashboardSalesAnalyticsResponse } from '@afterdark/types'
import type {
  DashboardKpiQueryInput,
  DashboardSalesAnalyticsQueryInput,
} from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { resolveDashboardRevenueDateRange } from './utils/dashboard-date-range'
import {
  fillDashboardTicketsSoldSeries,
  resolveDashboardSeriesGranularity,
} from './utils/dashboard-tickets-sold-series'

@Injectable()
export class DashboardService {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async getKpiDashboard(
    ownerDocumentId: string,
    query: DashboardKpiQueryInput
  ): Promise<DashboardKpiResponse> {
    const { from, to } = resolveDashboardRevenueDateRange(query)

    try {
      const kpi = await findDashboardKpiByOwnerDocumentId({
        ownerDocumentId,
        revenueFromDate: from,
        revenueToDate: to,
      })

      return {
        publishedEventsCount: kpi.publishedEventsCount,
        ticketsSoldCount: kpi.ticketsSoldCount,
        totalRevenue: kpi.totalRevenue,
        revenueFromDate: from.toISOString(),
        revenueToDate: to.toISOString(),
      }
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('dashboard.KPI_FAILED'))
    }
  }

  async getSalesAnalytics(
    ownerDocumentId: string,
    query: DashboardSalesAnalyticsQueryInput
  ): Promise<DashboardSalesAnalyticsResponse> {
    const { from, to } = resolveDashboardRevenueDateRange(query)
    const seriesGranularity = resolveDashboardSeriesGranularity(from, to)

    try {
      const seriesRows = await findDashboardTicketsSoldSeriesByOwnerDocumentId({
        ownerDocumentId,
        fromDate: from,
        toDate: to,
        granularity: seriesGranularity,
      })

      return {
        fromDate: from.toISOString(),
        toDate: to.toISOString(),
        seriesGranularity,
        ticketsSoldSeries: fillDashboardTicketsSoldSeries({
          from,
          to,
          granularity: seriesGranularity,
          rows: seriesRows,
        }),
      }
    } catch {
      throw new InternalServerErrorException(
        this.ts.translateError('dashboard.SALES_ANALYTICS_FAILED')
      )
    }
  }
}
