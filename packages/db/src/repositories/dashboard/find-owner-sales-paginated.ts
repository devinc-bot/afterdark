import { and, count, desc, eq, gte, lte, sql, type SQL } from 'drizzle-orm'
import { PAYMENT_STATUS, PURCHASE_STATUS } from '@repo/types/enums'
import type { ListOwnerSalesParams, PaginatedOwnerSalesResult } from '@repo/types'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { locations } from '../../schema/location.ts'
import { events } from '../../schema/event.ts'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketTypes } from '../../schema/ticket-type.ts'
import { users } from '../../schema/user.ts'
import { userAccountsLnk } from '../../schema/user-account-lnk.ts'
import { purchaseItems } from '../../schema/purchase-item.ts'
import { purchases } from '../../schema/purchase.ts'

function buildOwnerSalesFilters(params: ListOwnerSalesParams): SQL {
  const conditions: SQL[] = [
    eq(owners.documentId, params.ownerDocumentId),
    eq(purchases.status, PURCHASE_STATUS.CONFIRMED),
  ]

  if (params.eventDocumentId) {
    conditions.push(eq(events.documentId, params.eventDocumentId))
  }

  if (params.locationDocumentId) {
    conditions.push(eq(locations.documentId, params.locationDocumentId))
  }

  if (params.ticketTypeId) {
    conditions.push(eq(ticketTypes.documentId, params.ticketTypeId))
  }

  if (params.from) {
    conditions.push(gte(purchases.confirmedAt, params.from))
  }

  if (params.to) {
    conditions.push(lte(purchases.confirmedAt, params.to))
  }

  return and(...conditions)!
}

export async function findOwnerSalesPaginated(
  params: ListOwnerSalesParams
): Promise<PaginatedOwnerSalesResult> {
  const { page, limit } = params
  const offset = (page - 1) * limit
  const where = buildOwnerSalesFilters(params)

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        orderDocumentId: purchases.documentId,
        buyerName: users.name,
        buyerLastName: users.lastName,
        buyerEmail: accounts.email,
        eventName: events.name,
        ticketType: {
          documentId: ticketTypes.documentId,
          name: ticketTypes.name,
        },
        locationName: locations.name,
        paidAt: purchases.confirmedAt,
        quantity: purchaseItems.quantity,
        amount: purchaseItems.lineTotal,
      })
      .from(purchaseItems)
      .innerJoin(purchases, eq(purchases.id, purchaseItems.purchaseId))
      .innerJoin(tickets, eq(tickets.id, purchaseItems.ticketId))
      .innerJoin(ticketTypes, eq(ticketTypes.id, tickets.ticketTypeId))
      .innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(locations, eq(locations.id, events.locationId))
      .innerJoin(owners, eq(owners.id, locations.ownerId))
      .innerJoin(users, eq(users.id, purchases.userId))
      .innerJoin(userAccountsLnk, eq(userAccountsLnk.userId, users.id))
      .innerJoin(accounts, eq(accounts.id, userAccountsLnk.accountId))
      .where(where)
      .orderBy(
        sql`${purchases.confirmedAt} is null`,
        desc(purchases.confirmedAt),
        desc(purchases.id)
      )
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(purchaseItems)
      .innerJoin(purchases, eq(purchases.id, purchaseItems.purchaseId))
      .innerJoin(tickets, eq(tickets.id, purchaseItems.ticketId))
      .innerJoin(ticketTypes, eq(ticketTypes.id, tickets.ticketTypeId))
      .innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(locations, eq(locations.id, events.locationId))
      .innerJoin(owners, eq(owners.id, locations.ownerId))
      .innerJoin(users, eq(users.id, purchases.userId))
      .innerJoin(userAccountsLnk, eq(userAccountsLnk.userId, users.id))
      .innerJoin(accounts, eq(accounts.id, userAccountsLnk.accountId))
      .where(where),
  ])

  return {
    rows: rows.map((row) => ({
      orderDocumentId: row.orderDocumentId,
      buyerName: row.buyerName,
      buyerLastName: row.buyerLastName,
      buyerEmail: row.buyerEmail,
      eventName: row.eventName,
      ticketType: row.ticketType,
      locationName: row.locationName,
      paidAt: row.paidAt,
      quantity: row.quantity,
      amount: row.amount,
      status: PAYMENT_STATUS.COMPLETED,
    })),
    total: totalRows[0]?.total ?? 0,
  }
}
