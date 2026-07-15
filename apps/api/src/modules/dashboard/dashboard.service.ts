import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findDashboardKpiByOwnerDocumentId } from '@afterdark/db'
import type { DashboardKpiResponse } from '@afterdark/types'
import type { DashboardKpiQueryInput } from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { resolveDashboardRevenueDateRange } from './utils/dashboard-date-range'

type DashboardOkResponse = {
  status: 'ok'
}

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

  getSalesAnalytics(): DashboardOkResponse {
    return { status: 'ok' }
  }
}
