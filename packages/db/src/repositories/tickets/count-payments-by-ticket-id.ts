import { count, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { orders } from '../../schema/orders.ts'

export async function countPaymentsByTicketId(ticketId: number): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(orders)
    .where(eq(orders.ticketId, ticketId))

  return row?.total ?? 0
}
