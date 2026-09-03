import { and, asc, eq, lte } from 'drizzle-orm'
import { INVENTORY_RESERVATION_STATUS } from '@repo/types'
import { db } from '../../client.ts'
import { inventoryReservations } from '../../schema/inventory-reservation.ts'

export async function findExpiredActiveReservationDocumentIds(
  now: Date,
  limit: number
): Promise<string[]> {
  const rows = await db
    .select({ documentId: inventoryReservations.documentId })
    .from(inventoryReservations)
    .where(
      and(
        eq(inventoryReservations.status, INVENTORY_RESERVATION_STATUS.ACTIVE),
        lte(inventoryReservations.expiresAt, now)
      )
    )
    .orderBy(asc(inventoryReservations.expiresAt), asc(inventoryReservations.id))
    .limit(limit)

  return rows.map((row) => row.documentId)
}
