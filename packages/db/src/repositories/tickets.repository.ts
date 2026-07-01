import { and, count, desc, eq, type SQL } from 'drizzle-orm'
import { db } from '../client.ts'
import { clubs, type ClubSelect } from '../schema/club.ts'
import { events, type EventSelect } from '../schema/event.ts'
import { owners } from '../schema/owner.ts'
import { payments } from '../schema/payment.ts'
import { tickets, type TicketSelect } from '../schema/ticket.ts'
import type { TicketStatus } from '@afterdark/types'

export type TicketWithRelations = {
  ticket: TicketSelect
  event: EventSelect | null
  club: ClubSelect | null
}

export type TicketUpsertInput = {
  name: string
  price: number
  quantity: number
  description: string
  status: TicketSelect['status']
  type: TicketSelect['type']
  saleStartsAt?: Date | null
  saleEndsAt?: Date | null
  eventId?: number | null
}

export type ListTicketsByOwnerParams = {
  ownerDocumentId: string
  page: number
  limit: number
  status?: TicketStatus
  clubDocumentId?: string
}

export type PaginatedTicketsResult = {
  rows: TicketWithRelations[]
  total: number
}

function buildOwnerTicketFilters({
  ownerDocumentId,
  status,
  clubDocumentId,
}: Omit<ListTicketsByOwnerParams, 'page' | 'limit'>): SQL | undefined {
  const filters: SQL[] = [eq(owners.documentId, ownerDocumentId)]

  if (status) {
    filters.push(eq(tickets.status, status))
  }

  if (clubDocumentId) {
    filters.push(eq(clubs.documentId, clubDocumentId))
  }

  return and(...filters)
}

function ticketRelationsQuery() {
  return db
    .select({
      ticket: tickets,
      event: events,
      club: clubs,
    })
    .from(tickets)
    .innerJoin(events, eq(events.id, tickets.eventId))
    .innerJoin(clubs, eq(clubs.id, events.clubId))
    .innerJoin(owners, eq(owners.id, clubs.ownerId))
}

export async function findTicketWithRelationsOwnedByOwner(
  ticketDocumentId: string,
  ownerDocumentId: string
): Promise<TicketWithRelations | null> {
  const [row] = await ticketRelationsQuery()
    .where(and(eq(tickets.documentId, ticketDocumentId), eq(owners.documentId, ownerDocumentId)))
    .limit(1)

  return row ?? null
}

export async function findTicketsPaginatedByOwner(
  params: ListTicketsByOwnerParams
): Promise<PaginatedTicketsResult> {
  const { page, limit } = params
  const offset = (page - 1) * limit
  const where = buildOwnerTicketFilters(params)

  const baseQuery = ticketRelationsQuery().where(where)

  const [rows, totalRows] = await Promise.all([
    baseQuery.orderBy(desc(tickets.createdAt)).limit(limit).offset(offset),
    db
      .select({ total: count() })
      .from(tickets)
      .innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(clubs, eq(clubs.id, events.clubId))
      .innerJoin(owners, eq(owners.id, clubs.ownerId))
      .where(where),
  ])

  return {
    rows,
    total: totalRows[0]?.total ?? 0,
  }
}

export async function createTicket(input: TicketUpsertInput): Promise<TicketWithRelations> {
  const now = new Date()

  const [ticket] = await db
    .insert(tickets)
    .values({
      name: input.name,
      price: input.price,
      quantity: input.quantity,
      description: input.description,
      status: input.status,
      type: input.type,
      saleStartsAt: input.saleStartsAt ?? null,
      saleEndsAt: input.saleEndsAt ?? null,
      eventId: input.eventId ?? null,
      updatedAt: now,
    })
    .returning()

  if (!ticket) {
    throw new Error('Ticket insert returned no row')
  }

  return findTicketRelationsByTicketId(ticket.id)
}

export async function updateTicketByDocumentId(
  documentId: string,
  input: TicketUpsertInput
): Promise<TicketWithRelations> {
  const now = new Date()

  const [ticket] = await db
    .update(tickets)
    .set({
      name: input.name,
      price: input.price,
      quantity: input.quantity,
      description: input.description,
      status: input.status,
      type: input.type,
      saleStartsAt: input.saleStartsAt ?? null,
      saleEndsAt: input.saleEndsAt ?? null,
      eventId: input.eventId ?? null,
      updatedAt: now,
    })
    .where(eq(tickets.documentId, documentId))
    .returning()

  if (!ticket) {
    throw new Error('Ticket update returned no row')
  }

  return findTicketRelationsByTicketId(ticket.id)
}

async function findTicketRelationsByTicketId(ticketId: number): Promise<TicketWithRelations> {
  const [row] = await db
    .select({
      ticket: tickets,
      event: events,
      club: clubs,
    })
    .from(tickets)
    .leftJoin(events, eq(events.id, tickets.eventId))
    .leftJoin(clubs, eq(clubs.id, events.clubId))
    .where(eq(tickets.id, ticketId))
    .limit(1)

  if (!row) {
    throw new Error('Ticket not found after upsert')
  }

  return row
}

export async function countPaymentsByTicketId(ticketId: number): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(payments)
    .where(eq(payments.ticketId, ticketId))

  return row?.total ?? 0
}

export async function deleteTicketByDocumentId(documentId: string): Promise<void> {
  const [deleted] = await db
    .delete(tickets)
    .where(eq(tickets.documentId, documentId))
    .returning({ id: tickets.id })

  if (!deleted) {
    throw new Error('Ticket delete returned no row')
  }
}
