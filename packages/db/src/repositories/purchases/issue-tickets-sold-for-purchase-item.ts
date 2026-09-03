import { asc, eq, sql } from 'drizzle-orm'
import { INVENTORY_RESERVATION_STATUS, PURCHASE_STATUS } from '@repo/types'
import { type Transaction } from '../../client.ts'
import { purchaseItems } from '../../schema/purchase-item.ts'
import { ticketsSold, type TicketSoldSelect } from '../../schema/tickets_sold.ts'

function createQrCode(purchaseItemId: number, unitIndex: number): string {
  return `purchase-item-${purchaseItemId}-${unitIndex}-${crypto.randomUUID()}`
}

export async function issueTicketsSoldForPurchaseItem(
  purchaseItemId: number,
  tx: Transaction
): Promise<TicketSoldSelect[]> {
  const locked = await tx.execute<{ purchaseItemId: number }>(sql`
    select pi.id as "purchaseItemId"
    from purchase_items pi
    join purchases p on p.id = pi.purchase_id
    join inventory_reservations r on r.purchase_item_id = pi.id
    where pi.id = ${purchaseItemId}
      and p.status = ${PURCHASE_STATUS.CONFIRMED}
      and r.status = ${INVENTORY_RESERVATION_STATUS.CONSUMED}
    for update of pi, p, r
  `)
  if (locked.rows[0]?.purchaseItemId !== purchaseItemId) {
    throw new Error('Purchase item is not confirmed with a consumed reservation')
  }

  const [purchaseItem] = await tx
    .select()
    .from(purchaseItems)
    .where(eq(purchaseItems.id, purchaseItemId))
    .limit(1)
  if (!purchaseItem) throw new Error('Locked purchase item returned no row')

  const values = Array.from({ length: purchaseItem.quantity }, (_, unitIndex) => ({
    purchaseItemId,
    unitIndex,
    qrCode: createQrCode(purchaseItemId, unitIndex),
  }))

  await tx
    .insert(ticketsSold)
    .values(values)
    .onConflictDoNothing({
      target: [ticketsSold.purchaseItemId, ticketsSold.unitIndex],
      where: sql`${ticketsSold.purchaseItemId} is not null and ${ticketsSold.unitIndex} is not null`,
    })

  return tx
    .select()
    .from(ticketsSold)
    .where(eq(ticketsSold.purchaseItemId, purchaseItemId))
    .orderBy(asc(ticketsSold.unitIndex))
}
