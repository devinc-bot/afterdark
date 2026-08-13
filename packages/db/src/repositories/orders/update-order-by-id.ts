import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { orders, type OrderSelect } from '../../schema/orders.ts'
import type { PaymentStatus } from '@repo/types/enums'

export type UpdateOrderByIdInput = {
  status?: PaymentStatus
  externalOrderId?: string | null
  metadata?: Record<string, unknown> | null
  paidAt?: Date | null
}

export async function updateOrderById(
  orderId: number,
  input: UpdateOrderByIdInput
): Promise<OrderSelect | null> {
  const now = new Date()

  const [row] = await db
    .update(orders)
    .set({
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.externalOrderId !== undefined ? { externalOrderId: input.externalOrderId } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      ...(input.paidAt !== undefined ? { paidAt: input.paidAt } : {}),
      updatedAt: now,
    })
    .where(eq(orders.id, orderId))
    .returning()

  return row ?? null
}
