import { z } from 'zod'
import { optionalCoercedDateSchema } from './common.ts'

export const dashboardKpiQuerySchema = z
  .object({
    fromDate: optionalCoercedDateSchema,
    toDate: optionalCoercedDateSchema,
  })
  .refine(
    (data) => {
      if (!data.fromDate || !data.toDate) return true
      return data.toDate >= data.fromDate
    },
    {
      message: 'validation:field.dashboard.toDateAfterFrom' as const,
      path: ['toDate'],
    }
  )

export type DashboardKpiQueryInput = z.infer<typeof dashboardKpiQuerySchema>

export const dashboardSalesAnalyticsQuerySchema = dashboardKpiQuerySchema

export type DashboardSalesAnalyticsQueryInput = z.infer<typeof dashboardSalesAnalyticsQuerySchema>
