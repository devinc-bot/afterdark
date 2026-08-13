import { eq } from 'drizzle-orm'
import { db, type Transaction } from '../../client.ts'
import { ticketsSold, type TicketSoldSelect } from '../../schema/tickets_sold.ts'

type DbLike = Transaction | typeof db

function createQrCode(orderId: number, unitIndex: number): string {
  return `order-${orderId}-${unitIndex}-${crypto.randomUUID()}`
}

/**
 * Issues one `tickets_sold` row per unit. Reconciliation is idempotent and
 * preserves every QR code already stored for the order.
 */
export async function issueTicketsSoldForOrder(
  orderId: number,
  quantity: number,
  tx: DbLike = db
): Promise<TicketSoldSelect[]> {
  const existingRows = await tx.select().from(ticketsSold).where(eq(ticketsSold.orderId, orderId))

  // QR codes are permanent ticket credentials. Never regenerate a code that
  // was already persisted, including when this reconciliation runs again.
  const rowsWithQrCodes = await Promise.all(
    existingRows.map(async (row, index) => {
      if (row.qrCode) return row

      const qrCode = createQrCode(orderId, index)
      const [updatedRow] = await tx
        .update(ticketsSold)
        .set({ qrCode, updatedAt: new Date() })
        .where(eq(ticketsSold.id, row.id))
        .returning()

      if (!updatedRow) throw new Error('tickets_sold QR code update returned no row')
      return updatedRow
    })
  )

  if (rowsWithQrCodes.length >= quantity) {
    return rowsWithQrCodes
  }

  const now = new Date()
  const values = Array.from({ length: quantity - rowsWithQrCodes.length }, (_, index) => ({
    orderId,
    qrCode: createQrCode(orderId, rowsWithQrCodes.length + index),
    updatedAt: now,
  }))

  const rows = await tx.insert(ticketsSold).values(values).returning()

  if (rows.length !== values.length) {
    throw new Error('tickets_sold insert returned unexpected row count')
  }

  return [...rowsWithQrCodes, ...rows]
}
