import { and, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { payments } from '../../schema/payment.ts'
import { purchaseItems } from '../../schema/purchase-item.ts'
import { purchases } from '../../schema/purchase.ts'
import { tickets } from '../../schema/ticket.ts'

export async function findPurchaseByDocumentIdAndUserId(documentId: string, userId: number) {
  const [row] = await db
    .select({
      purchase: purchases,
      purchaseItem: purchaseItems,
      payment: payments,
      ticketDocumentId: tickets.documentId,
    })
    .from(purchases)
    .innerJoin(purchaseItems, eq(purchaseItems.purchaseId, purchases.id))
    .innerJoin(payments, eq(payments.purchaseId, purchases.id))
    .innerJoin(tickets, eq(tickets.id, purchaseItems.ticketId))
    .where(and(eq(purchases.documentId, documentId), eq(purchases.userId, userId)))
    .limit(1)

  return row ?? null
}
