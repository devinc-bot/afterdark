import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  findDashboardKpiByOwnerDocumentId,
  findDashboardTicketsSoldSeriesByOwnerDocumentId,
  findOwnerSalesPaginated,
} from '@repo/db'
import type {
  DashboardKpiResponse,
  DashboardSalesAnalyticsResponse,
  OwnerSaleResponse,
  PaginatedResponse,
  PaymentStatus,
  TicketType,
} from '@repo/types'
import type {
  DashboardKpiQueryInput,
  DashboardSalesAnalyticsQueryInput,
  ListOwnerSalesQueryInput,
} from '@repo/validators'
import { TranslationService } from '@repo/i18n/server'
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

  async listSales(
    ownerDocumentId: string,
    query: ListOwnerSalesQueryInput
  ): Promise<PaginatedResponse<OwnerSaleResponse>> {
    try {
      const { rows, total } = await findOwnerSalesPaginated({
        ownerDocumentId,
        page: query.page,
        limit: query.limit,
        eventDocumentId: query.eventId,
        locationDocumentId: query.locationId,
        ticketType: query.ticketType,
        from: query.from,
        to: query.to,
      })

      const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)

      return {
        data: rows.map((row) => ({
          id: row.orderDocumentId,
          buyerName: `${row.buyerName} ${row.buyerLastName}`.trim(),
          buyerEmail: row.buyerEmail,
          eventName: row.eventName,
          ticketName: row.ticketName,
          ticketType: row.ticketType as TicketType,
          locationName: row.locationName,
          paidAt: row.paidAt ? row.paidAt.toISOString() : null,
          quantity: row.quantity,
          amount: row.amount,
          status: row.status as PaymentStatus,
        })),
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      }
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('dashboard.SALES_LIST_FAILED'))
    }
  }
}
