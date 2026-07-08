import { count, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { payments } from '../../schema/payment.ts'

export async function countPaymentsByTicketId(ticketId: number): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(payments)
    .where(eq(payments.ticketId, ticketId))

  return row?.total ?? 0
}
