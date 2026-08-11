import { and, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { orders, type OrderSelect } from '../../schema/orders.ts'

export async function findOrderByDocumentIdAndUserId(
  documentId: string,
  userId: number
): Promise<OrderSelect | null> {
  const [row] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.documentId, documentId), eq(orders.userId, userId)))
    .limit(1)

  return row ?? null
}
