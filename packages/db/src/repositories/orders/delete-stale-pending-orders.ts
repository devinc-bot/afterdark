import { and, eq, lt } from 'drizzle-orm'
import { PAYMENT_STATUS } from '@repo/types/enums'
import { db } from '../../client.ts'
import { orders } from '../../schema/orders.ts'

export async function deleteStalePendingOrders(cutoff: Date): Promise<number> {
  const deleted = await db
    .delete(orders)
    .where(and(eq(orders.status, PAYMENT_STATUS.PENDING), lt(orders.createdAt, cutoff)))
    .returning({ id: orders.id })

  return deleted.length
}
