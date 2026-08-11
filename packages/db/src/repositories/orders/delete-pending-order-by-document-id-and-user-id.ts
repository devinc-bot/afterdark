import { and, eq } from 'drizzle-orm'
import { PAYMENT_STATUS } from '@repo/types/enums'
import { db } from '../../client.ts'
import { orders } from '../../schema/orders.ts'

export async function deletePendingOrderByDocumentIdAndUserId(
  documentId: string,
  userId: number
): Promise<boolean> {
  const deleted = await db
    .delete(orders)
    .where(
      and(
        eq(orders.documentId, documentId),
        eq(orders.userId, userId),
        eq(orders.status, PAYMENT_STATUS.PENDING)
      )
    )
    .returning({ id: orders.id })

  return deleted.length === 1
}
