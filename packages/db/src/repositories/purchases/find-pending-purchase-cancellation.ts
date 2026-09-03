import { and, eq } from 'drizzle-orm'
import { PURCHASE_STATUS } from '@repo/types'
import { db } from '../../client.ts'
import { inventoryReservations } from '../../schema/inventory-reservation.ts'
import { payments } from '../../schema/payment.ts'
import { purchaseItems } from '../../schema/purchase-item.ts'
import { purchases } from '../../schema/purchase.ts'

export async function findPendingPurchaseCancellation(documentId: string, userId: number) {
  const [row] = await db
    .select({ purchase: purchases, reservation: inventoryReservations, payment: payments })
    .from(purchases)
    .innerJoin(purchaseItems, eq(purchaseItems.purchaseId, purchases.id))
    .innerJoin(inventoryReservations, eq(inventoryReservations.purchaseItemId, purchaseItems.id))
    .innerJoin(payments, eq(payments.purchaseId, purchases.id))
    .where(
      and(
        eq(purchases.documentId, documentId),
        eq(purchases.userId, userId),
        eq(purchases.status, PURCHASE_STATUS.PENDING)
      )
    )
    .limit(1)

  return row ?? null
}
