import { and, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'

export type ConsumedTicketSoldRow = {
  documentId: string
  checkedIn: true
  usedAt: Date
}

export async function consumeTicketSoldById(params: {
  ticketSoldId: number
  usedAt: Date
}): Promise<ConsumedTicketSoldRow | null> {
  const row = await db
    .update(ticketsSold)
    .set({
      checkedIn: true,
      usedAt: params.usedAt,
      updatedAt: params.usedAt,
    })
    .where(and(eq(ticketsSold.id, params.ticketSoldId), eq(ticketsSold.checkedIn, false)))
    .returning({
      documentId: ticketsSold.documentId,
      checkedIn: ticketsSold.checkedIn,
      usedAt: ticketsSold.usedAt,
    })
    .get()

  if (!row?.checkedIn || !row.usedAt) {
    return null
  }

  return {
    documentId: row.documentId,
    checkedIn: true,
    usedAt: row.usedAt,
  }
}
