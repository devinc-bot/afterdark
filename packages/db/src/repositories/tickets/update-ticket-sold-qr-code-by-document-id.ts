import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'

export async function updateTicketSoldQrCodeByDocumentId(params: {
  ticketSoldDocumentId: string
  qrCode: string
}): Promise<void> {
  const now = new Date()

  await db
    .update(ticketsSold)
    .set({ qrCode: params.qrCode, updatedAt: now })
    .where(eq(ticketsSold.documentId, params.ticketSoldDocumentId))
}
