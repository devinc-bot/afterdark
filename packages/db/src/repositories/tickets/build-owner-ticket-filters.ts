import { and, eq, exists, not, sql, type SQL } from 'drizzle-orm'
import { PAYMENT_STATUS } from '@afterdark/types/enums'
import { TICKET_SALES_FILTER, type ListTicketsByOwnerParams } from '@afterdark/types'
import { db } from '../../client.ts'
import { clubs } from '../../schema/club.ts'
import { orders } from '../../schema/orders.ts'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'

function completedSalesExist(): SQL {
  return exists(
    db
      .select({ one: sql`1` })
      .from(ticketsSold)
      .innerJoin(orders, eq(orders.id, ticketsSold.orderId))
      .where(and(eq(orders.ticketId, tickets.id), eq(orders.status, PAYMENT_STATUS.COMPLETED)))
  )
}

export function buildOwnerTicketFilters({
  ownerDocumentId,
  status,
  clubDocumentId,
  salesFilter,
}: Omit<ListTicketsByOwnerParams, 'page' | 'limit'>): SQL | undefined {
  const filters: SQL[] = [eq(owners.documentId, ownerDocumentId)]

  if (status) {
    filters.push(eq(tickets.status, status))
  }

  if (clubDocumentId) {
    filters.push(eq(clubs.documentId, clubDocumentId))
  }

  if (salesFilter === TICKET_SALES_FILTER.SOLD) {
    filters.push(completedSalesExist())
  }

  if (salesFilter === TICKET_SALES_FILTER.UNSOLD) {
    filters.push(not(completedSalesExist()))
  }

  return and(...filters)
}
