import { and, eq, getTableColumns } from 'drizzle-orm'
import { db } from '../../client.ts'
import { orders, type OrderSelect } from '../../schema/orders.ts'
import { tickets } from '../../schema/ticket.ts'

export type OrderWithTicketDocumentId = OrderSelect & { ticketDocumentId: string }

export async function findOrderByDocumentIdAndUserId(
  documentId: string,
  userId: number
): Promise<OrderWithTicketDocumentId | null> {
  const [row] = await db
    .select({ ...getTableColumns(orders), ticketDocumentId: tickets.documentId })
    .from(orders)
    .innerJoin(tickets, eq(tickets.id, orders.ticketId))
    .where(and(eq(orders.documentId, documentId), eq(orders.userId, userId)))
    .limit(1)

  return row ?? null
}
