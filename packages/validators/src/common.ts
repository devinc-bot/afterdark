import { z } from 'zod'

export const uuidSchema = z.uuid()

/** Accepts empty string / null and coerces valid date strings; yields `undefined` when absent. */
export const optionalCoercedDateSchema = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return undefined
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length === 0 ? undefined : trimmed
  }

  return value
}, z.coerce.date().optional())

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

export type PaginationInput = z.infer<typeof paginationSchema>
