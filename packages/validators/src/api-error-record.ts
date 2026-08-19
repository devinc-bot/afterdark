import { z } from 'zod'
import { optionalCoercedDateSchema, paginationSchema } from './common.ts'

export const listApiErrorRecordsQuerySchema = paginationSchema
  .extend({
    statusCode: z.coerce.number().int().min(500).max(599).optional(),
    path: z.string().trim().min(1).max(255).optional(),
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

export type ListApiErrorRecordsQueryInput = z.infer<typeof listApiErrorRecordsQuerySchema>
