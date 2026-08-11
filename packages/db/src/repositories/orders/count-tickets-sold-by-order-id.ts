import { count, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'

export async function countTicketsSoldByOrderId(orderId: number): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(ticketsSold)
    .where(eq(ticketsSold.orderId, orderId))

  return row?.total ?? 0
}
