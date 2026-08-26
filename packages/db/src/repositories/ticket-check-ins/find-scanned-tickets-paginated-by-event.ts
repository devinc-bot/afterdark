import { and, count, desc, eq, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import type { PaginatedScannedTicketsResult, ScannedTicketHistoryRow } from '@repo/types'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { events } from '../../schema/event.ts'
import { orders } from '../../schema/orders.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { owners } from '../../schema/owner.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { staff } from '../../schema/staff.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketTypes } from '../../schema/ticket-type.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'
import { userAccountsLnk } from '../../schema/user-account-lnk.ts'
import { users } from '../../schema/user.ts'

const purchaserAccount = alias(accounts, 'purchaser_account')
const operatorAccount = alias(accounts, 'operator_account')

const operatorFullName = sql<string | null>`coalesce(
  ${owners.name} || ' ' || ${owners.lastName},
  ${staff.name} || ' ' || ${staff.lastName}
)`

export async function findScannedTicketsPaginatedByEvent(params: {
  eventDocumentId: string
  page: number
  limit: number
}): Promise<PaginatedScannedTicketsResult> {
  const offset = (params.page - 1) * params.limit
  const where = and(eq(ticketsSold.checkedIn, true), eq(events.documentId, params.eventDocumentId))

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        scannedAt: ticketsSold.usedAt,
        ticketTypeDocumentId: ticketTypes.documentId,
        ticketTypeName: ticketTypes.name,
        purchaser: {
          name: users.name,
          lastName: users.lastName,
          email: purchaserAccount.email,
          phone: users.phone,
        },
        operator: {
          accountId: ticketsSold.checkedInByAccountId,
          fullName: operatorFullName,
          email: operatorAccount.email,
          role: ticketsSold.checkedInByRole,
        },
      })
      .from(ticketsSold)
      .innerJoin(orders, eq(orders.id, ticketsSold.orderId))
      .innerJoin(tickets, eq(tickets.id, orders.ticketId))
      .innerJoin(ticketTypes, eq(ticketTypes.id, tickets.ticketTypeId))
      .innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(users, eq(users.id, orders.userId))
      .innerJoin(userAccountsLnk, eq(userAccountsLnk.userId, users.id))
      .innerJoin(purchaserAccount, eq(purchaserAccount.id, userAccountsLnk.accountId))
      .leftJoin(operatorAccount, eq(operatorAccount.id, ticketsSold.checkedInByAccountId))
      .leftJoin(ownerAccountsLnk, eq(ownerAccountsLnk.accountId, ticketsSold.checkedInByAccountId))
      .leftJoin(owners, eq(owners.id, ownerAccountsLnk.ownerId))
      .leftJoin(staffAccountsLnk, eq(staffAccountsLnk.accountId, ticketsSold.checkedInByAccountId))
      .leftJoin(staff, eq(staff.id, staffAccountsLnk.staffId))
      .where(where)
      .orderBy(desc(ticketsSold.usedAt), desc(ticketsSold.id))
      .limit(params.limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(ticketsSold)
      .innerJoin(orders, eq(orders.id, ticketsSold.orderId))
      .innerJoin(tickets, eq(tickets.id, orders.ticketId))
      .innerJoin(ticketTypes, eq(ticketTypes.id, tickets.ticketTypeId))
      .innerJoin(events, eq(events.id, tickets.eventId))
      .where(where),
  ])

  const typedRows: ScannedTicketHistoryRow[] = []
  for (const row of rows) {
    if (!row.scannedAt) continue
    typedRows.push({
      scannedAt: row.scannedAt,
      ticket: {
        ticketType: {
          documentId: row.ticketTypeDocumentId,
          name: row.ticketTypeName,
        },
      },
      purchaser: row.purchaser,
      operator: row.operator,
    })
  }

  return {
    rows: typedRows,
    total: totalRows[0]?.total ?? 0,
  }
}
