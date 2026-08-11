import { and, eq, sum } from 'drizzle-orm'
import { PAYMENT_STATUS } from '@repo/types/enums'
import { db } from '../../client.ts'
import { orders } from '../../schema/orders.ts'

/** Sum of `quantity` on completed orders for a ticket (units sold). */
export async function countCompletedSoldQuantityByTicketId(ticketId: number): Promise<number> {
  const [row] = await db
    .select({ total: sum(orders.quantity) })
    .from(orders)
    .where(and(eq(orders.ticketId, ticketId), eq(orders.status, PAYMENT_STATUS.COMPLETED)))

  const total = row?.total
  if (total === null || total === undefined) {
    return 0
  }

  return typeof total === 'number' ? total : Number(total)
}
