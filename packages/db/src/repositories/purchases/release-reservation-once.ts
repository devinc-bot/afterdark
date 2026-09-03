import { and, eq, sql } from 'drizzle-orm'
import {
  INVENTORY_RESERVATION_STATUS,
  OUTBOX_AGGREGATE_TYPE,
  OUTBOX_EVENT_TYPE,
  PURCHASE_STATUS,
} from '@repo/types'
import { db } from '../../client.ts'
import { appendDomainOutboxEvent } from '../outbox/append-domain-outbox-event.ts'
import { appendEventAvailabilityOutboxEvent } from '../outbox/append-event-availability-outbox-event.ts'
import {
  inventoryReservations,
  type InventoryReservationSelect,
} from '../../schema/inventory-reservation.ts'
import { purchases, type PurchaseSelect } from '../../schema/purchase.ts'

export type ReleaseReservationOnceInput = {
  reservationDocumentId: string
  purchaseStatus: typeof PURCHASE_STATUS.CANCELLED | typeof PURCHASE_STATUS.EXPIRED
  reservationStatus:
    | typeof INVENTORY_RESERVATION_STATUS.RELEASED
    | typeof INVENTORY_RESERVATION_STATUS.EXPIRED
  now: Date
}

export type ReservationReleaseResult =
  | { transitioned: true; reservation: InventoryReservationSelect; purchase: PurchaseSelect }
  | { transitioned: false }

export async function releaseReservationOnce(
  input: ReleaseReservationOnceInput
): Promise<ReservationReleaseResult> {
  return db.transaction(async (tx) => {
    const locked = await tx.execute<{
      reservationId: number
      purchaseId: number
      ticketId: number
    }>(sql`
      select r.id as "reservationId", p.id as "purchaseId", pi.ticket_id as "ticketId"
      from inventory_reservations r
      join purchase_items pi on pi.id = r.purchase_item_id
      join purchases p on p.id = pi.purchase_id
      where r.document_id = ${input.reservationDocumentId}
        and r.status = ${INVENTORY_RESERVATION_STATUS.ACTIVE}
        and p.status = ${PURCHASE_STATUS.PENDING}
      for update of r, pi, p
    `)
    const candidate = locked.rows[0]
    if (!candidate) return { transitioned: false }

    const [reservation] = await tx
      .update(inventoryReservations)
      .set({
        status: input.reservationStatus,
        releasedAt: input.now,
        updatedAt: input.now,
      })
      .where(
        and(
          eq(inventoryReservations.id, candidate.reservationId),
          eq(inventoryReservations.status, INVENTORY_RESERVATION_STATUS.ACTIVE)
        )
      )
      .returning()
    if (!reservation) return { transitioned: false }

    const [purchase] = await tx
      .update(purchases)
      .set({
        status: input.purchaseStatus,
        ...(input.purchaseStatus === PURCHASE_STATUS.CANCELLED ? { cancelledAt: input.now } : {}),
        updatedAt: input.now,
        stateVersion: sql`${purchases.stateVersion} + 1`,
      })
      .where(
        and(eq(purchases.id, candidate.purchaseId), eq(purchases.status, PURCHASE_STATUS.PENDING))
      )
      .returning()
    if (!purchase) throw new Error('Reservation release did not transition its pending purchase')

    await appendDomainOutboxEvent(tx, {
      aggregateType: OUTBOX_AGGREGATE_TYPE.PURCHASE,
      aggregateDocumentId: purchase.documentId,
      aggregateVersion: purchase.stateVersion,
      eventType: OUTBOX_EVENT_TYPE.PURCHASE_RESERVATION_RELEASED,
      payload: {
        purchaseDocumentId: purchase.documentId,
        status: purchase.status,
        reservationStatus: reservation.status,
        version: purchase.stateVersion,
      },
      now: input.now,
    })
    await appendEventAvailabilityOutboxEvent(tx, candidate.ticketId, input.now)

    return { transitioned: true, reservation, purchase }
  })
}
