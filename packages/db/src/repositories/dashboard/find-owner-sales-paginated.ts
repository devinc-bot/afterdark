import { and, count, desc, eq, gte, lte, sql, type SQL } from 'drizzle-orm'
import { PAYMENT_STATUS } from '@afterdark/types/enums'
import type { ListOwnerSalesParams, PaginatedOwnerSalesResult } from '@afterdark/types'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { clubs } from '../../schema/club.ts'
import { events } from '../../schema/event.ts'
import { orders } from '../../schema/orders.ts'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'
import { users } from '../../schema/user.ts'
import { userAccountsLnk } from '../../schema/user-account-lnk.ts'

function buildOwnerSalesFilters(params: ListOwnerSalesParams): SQL {
  const conditions: SQL[] = [
    eq(owners.documentId, params.ownerDocumentId),
    eq(orders.status, PAYMENT_STATUS.COMPLETED),
  ]

  if (params.eventDocumentId) {
    conditions.push(eq(events.documentId, params.eventDocumentId))
  }

  if (params.clubDocumentId) {
    conditions.push(eq(clubs.documentId, params.clubDocumentId))
  }

  if (params.ticketType) {
    conditions.push(eq(tickets.type, params.ticketType))
  }

  if (params.from) {
    conditions.push(gte(orders.paidAt, params.from))
  }

  if (params.to) {
    conditions.push(lte(orders.paidAt, params.to))
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
        orderDocumentId: orders.documentId,
        buyerName: users.name,
        buyerLastName: users.lastName,
        buyerEmail: accounts.email,
        eventName: events.name,
        ticketName: tickets.name,
        ticketType: tickets.type,
        clubName: clubs.name,
        paidAt: orders.paidAt,
        quantity: orders.quantity,
        amount: orders.amount,
        status: orders.status,
      })
      .from(orders)
      .innerJoin(tickets, eq(tickets.id, orders.ticketId))
      .innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(clubs, eq(clubs.id, events.clubId))
      .innerJoin(owners, eq(owners.id, clubs.ownerId))
      .innerJoin(users, eq(users.id, orders.userId))
      .innerJoin(userAccountsLnk, eq(userAccountsLnk.userId, users.id))
      .innerJoin(accounts, eq(accounts.id, userAccountsLnk.accountId))
      .where(where)
      .orderBy(sql`${orders.paidAt} is null`, desc(orders.paidAt), desc(orders.id))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(orders)
      .innerJoin(tickets, eq(tickets.id, orders.ticketId))
      .innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(clubs, eq(clubs.id, events.clubId))
      .innerJoin(owners, eq(owners.id, clubs.ownerId))
      .innerJoin(users, eq(users.id, orders.userId))
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
      ticketName: row.ticketName,
      ticketType: row.ticketType,
      clubName: row.clubName,
      paidAt: row.paidAt,
      quantity: row.quantity,
      amount: row.amount,
      status: row.status ?? PAYMENT_STATUS.COMPLETED,
    })),
    total: totalRows[0]?.total ?? 0,
  }
}
