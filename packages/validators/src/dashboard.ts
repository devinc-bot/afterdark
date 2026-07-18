import { z } from 'zod'
import { optionalCoercedDateSchema, paginationSchema } from './common.ts'
import { ticketTypeSchema } from './ticket.ts'

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

/** documentId may be UUID or seed-shaped string. */
const optionalDocumentIdSchema = z.string().trim().min(1).optional()

export const listOwnerSalesQuerySchema = paginationSchema
  .extend({
    eventId: optionalDocumentIdSchema,
    locationId: optionalDocumentIdSchema,
    ticketType: ticketTypeSchema.optional(),
    from: optionalCoercedDateSchema,
    to: optionalCoercedDateSchema,
  })
  .refine(
    (data) => {
      if (!data.from || !data.to) return true
      return data.to >= data.from
    },
    {
      message: 'validation:field.dashboard.toDateAfterFrom' as const,
      path: ['to'],
    }
  )

export type ListOwnerSalesQueryInput = z.infer<typeof listOwnerSalesQuerySchema>
