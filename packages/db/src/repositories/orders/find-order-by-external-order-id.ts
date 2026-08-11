import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { orders, type OrderSelect } from '../../schema/orders.ts'

export async function findOrderByExternalOrderId(
  externalOrderId: string
): Promise<OrderSelect | null> {
  const [row] = await db
    .select()
    .from(orders)
    .where(eq(orders.externalOrderId, externalOrderId))
    .limit(1)

  return row ?? null
}
