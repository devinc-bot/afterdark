import { and, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { events } from '../../schema/event.ts'
import { locations } from '../../schema/location.ts'
import { orders } from '../../schema/orders.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketTypes } from '../../schema/ticket-type.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'
import { userAccountsLnk } from '../../schema/user-account-lnk.ts'
import { users } from '../../schema/user.ts'

export type TicketCheckInContextRow = {
  ticketSold: {
    id: number
    documentId: string
    checkedIn: boolean
    usedAt: Date | null
  }
  order: {
    status: typeof orders.$inferSelect.status
  }
  ticket: {
    documentId: string
    ticketType: {
      documentId: string
      name: string
    }
  }
  event: {
    documentId: string
    name: string
    startsAt: Date
  }
  location: {
    id: number
    documentId: string
    name: string
  }
  purchaser: {
    documentId: string
    name: string
    lastName: string
    email: string
    phone: string
  }
}

export async function findTicketCheckInContextByClaims(params: {
  ticketSoldDocumentId: string
  eventDocumentId: string
  userDocumentId: string
  token: string
}): Promise<TicketCheckInContextRow | null> {
  const rows = await db
    .select({
      ticketSold: {
        id: ticketsSold.id,
        documentId: ticketsSold.documentId,
        checkedIn: ticketsSold.checkedIn,
        usedAt: ticketsSold.usedAt,
      },
      order: {
        status: orders.status,
      },
      ticket: {
        documentId: tickets.documentId,
      },
      ticketTypeDocumentId: ticketTypes.documentId,
      ticketTypeName: ticketTypes.name,
      event: {
        documentId: events.documentId,
        name: events.name,
        startsAt: events.startsAt,
      },
      location: {
        id: locations.id,
        documentId: locations.documentId,
        name: locations.name,
      },
      purchaser: {
        documentId: users.documentId,
        name: users.name,
        lastName: users.lastName,
        email: accounts.email,
        phone: users.phone,
      },
    })
    .from(ticketsSold)
    .innerJoin(orders, eq(orders.id, ticketsSold.orderId))
    .innerJoin(tickets, eq(tickets.id, orders.ticketId))
    .innerJoin(ticketTypes, eq(ticketTypes.id, tickets.ticketTypeId))
    .innerJoin(events, eq(events.id, tickets.eventId))
    .innerJoin(locations, eq(locations.id, events.locationId))
    .innerJoin(users, eq(users.id, orders.userId))
    .innerJoin(userAccountsLnk, eq(userAccountsLnk.userId, users.id))
    .innerJoin(accounts, eq(accounts.id, userAccountsLnk.accountId))
    .where(
      and(
        eq(ticketsSold.documentId, params.ticketSoldDocumentId),
        eq(ticketsSold.qrCode, params.token),
        eq(events.documentId, params.eventDocumentId),
        eq(users.documentId, params.userDocumentId)
      )
    )
    .limit(1)

  const row = rows[0]
  if (!row) return null

  return {
    ...row,
    ticket: {
      ...row.ticket,
      ticketType: {
        documentId: row.ticketTypeDocumentId,
        name: row.ticketTypeName,
      },
    },
  }
}
