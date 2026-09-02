import { and, eq, exists, not, sql, type SQL } from 'drizzle-orm'
import { PURCHASE_STATUS } from '@repo/types/enums'
import { TICKET_SALES_FILTER, type ListTicketsByOwnerParams } from '@repo/types'
import { db } from '../../client.ts'
import { locations } from '../../schema/location.ts'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'
import { purchaseItems } from '../../schema/purchase-item.ts'
import { purchases } from '../../schema/purchase.ts'

function completedSalesExist(): SQL {
  return exists(
    db
      .select({ one: sql`1` })
      .from(ticketsSold)
      .innerJoin(purchaseItems, eq(purchaseItems.id, ticketsSold.purchaseItemId))
      .innerJoin(purchases, eq(purchases.id, purchaseItems.purchaseId))
      .where(
        and(eq(purchaseItems.ticketId, tickets.id), eq(purchases.status, PURCHASE_STATUS.CONFIRMED))
      )
  )
}

export function buildOwnerTicketFilters({
  ownerDocumentId,
  status,
  locationDocumentId,
  salesFilter,
}: Omit<ListTicketsByOwnerParams, 'page' | 'limit'>): SQL | undefined {
  const filters: SQL[] = [eq(owners.documentId, ownerDocumentId)]

  if (status) {
    filters.push(eq(tickets.status, status))
  }

  if (locationDocumentId) {
    filters.push(eq(locations.documentId, locationDocumentId))
  }

  if (salesFilter === TICKET_SALES_FILTER.SOLD) {
    filters.push(completedSalesExist())
  }

  if (salesFilter === TICKET_SALES_FILTER.UNSOLD) {
    filters.push(not(completedSalesExist()))
  }

  return and(...filters)
}
