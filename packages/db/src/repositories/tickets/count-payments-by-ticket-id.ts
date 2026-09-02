import { count, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { purchaseItems } from '../../schema/purchase-item.ts'

export async function countPaymentsByTicketId(ticketId: number): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(purchaseItems)
    .where(eq(purchaseItems.ticketId, ticketId))

  return row?.total ?? 0
}
