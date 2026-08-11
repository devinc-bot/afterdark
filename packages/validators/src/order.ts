import { z } from 'zod'
import { uuidSchema } from './common.ts'

export const createOrderSchema = z.object({
  ticketId: uuidSchema,
  quantity: z.coerce.number().int().positive('validation:field.order.quantity'),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
