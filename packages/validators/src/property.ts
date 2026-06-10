import { z } from 'zod'
import { PROPERTY_STATUS } from '@afterdark/types'

export const createPropertySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).nullable().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  status: z
    .enum([PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.INACTIVE])
    .default(PROPERTY_STATUS.ACTIVE),
})

export const updatePropertySchema = createPropertySchema.partial()

export const filterPropertySchema = z.object({
  name: z.string().optional(),
  status: z.enum([PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.INACTIVE]).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
})

export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
export type FilterPropertyInput = z.infer<typeof filterPropertySchema>
