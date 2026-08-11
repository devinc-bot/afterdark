import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { orders, type OrderSelect } from '../../schema/orders.ts'

export async function findOrderByDocumentId(documentId: string): Promise<OrderSelect | null> {
  const [row] = await db.select().from(orders).where(eq(orders.documentId, documentId)).limit(1)

  return row ?? null
}
