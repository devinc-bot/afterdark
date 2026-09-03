import { createOrderSchema, type CreateOrderInput } from './order.ts'

/**
 * Purchase checkout currently accepts one ticket line, matching the legacy
 * order contract until the public API supports carts.
 */
export const createPurchaseSchema = createOrderSchema

export type CreatePurchaseInput = CreateOrderInput
