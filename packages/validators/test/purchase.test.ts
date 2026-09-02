import { expect, test } from 'vitest'
import { createOrderSchema } from '../src/order.ts'
import { createPurchaseSchema } from '../src/purchase.ts'

test('purchase checkout keeps the legacy single-ticket validation contract', () => {
  const ticketId = '8d1d285f-9d21-4b42-b218-495b05b4f223'

  expect(createPurchaseSchema).toBe(createOrderSchema)
  expect(createPurchaseSchema.parse({ ticketId, quantity: '2' })).toEqual({ ticketId, quantity: 2 })
  expect(createPurchaseSchema.safeParse({ ticketId, quantity: 0 }).success).toBe(false)
})
