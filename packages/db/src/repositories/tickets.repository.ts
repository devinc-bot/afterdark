import { and, count, desc, eq, type SQL } from 'drizzle-orm'
import { db } from '../client.ts'
import { clubs, type ClubSelect } from '../schema/club.ts'
import { owners } from '../schema/owner.ts'
import { payments } from '../schema/payment.ts'
import { tickets, type TicketSelect } from '../schema/ticket.ts'
import type { TicketStatus } from '@afterdark/types'

export type TicketWithClub = {
  ticket: TicketSelect
  club: ClubSelect
}

export type TicketUpsertInput = {
  name: string
  price: number
  quantity: number
  description: string
  startDate: Date
  endDate: Date
  status: TicketSelect['status']
  type: TicketSelect['type']
}

export type ListTicketsByOwnerParams = {
  ownerDocumentId: string
  page: number
  limit: number
  status?: TicketStatus
  clubDocumentId?: string
}

export type PaginatedTicketsResult = {
  rows: TicketWithClub[]
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

export async function findClubOwnedByOwnerDocumentId(
  clubDocumentId: string,
  ownerDocumentId: string
): Promise<ClubSelect | null> {
  const [row] = await db
    .select({ club: clubs })
    .from(clubs)
    .innerJoin(owners, eq(owners.id, clubs.ownerId))
    .where(and(eq(clubs.documentId, clubDocumentId), eq(owners.documentId, ownerDocumentId)))
    .limit(1)

  return row?.club ?? null
}

export async function findTicketWithClubOwnedByOwner(
  ticketDocumentId: string,
  ownerDocumentId: string
): Promise<TicketWithClub | null> {
  const [row] = await db
    .select({
      ticket: tickets,
      club: clubs,
    })
    .from(tickets)
    .innerJoin(clubs, eq(clubs.id, tickets.clubId))
    .innerJoin(owners, eq(owners.id, clubs.ownerId))
    .where(and(eq(tickets.documentId, ticketDocumentId), eq(owners.documentId, ownerDocumentId)))
    .limit(1)

  if (!row) {
    return null
  }

  return row
}

export async function findTicketsPaginatedByOwner(
  params: ListTicketsByOwnerParams
): Promise<PaginatedTicketsResult> {
  const { page, limit } = params
  const offset = (page - 1) * limit
  const where = buildOwnerTicketFilters(params)

  const baseQuery = db
    .select({
      ticket: tickets,
      club: clubs,
    })
    .from(tickets)
    .innerJoin(clubs, eq(clubs.id, tickets.clubId))
    .innerJoin(owners, eq(owners.id, clubs.ownerId))
    .where(where)

  const [rows, totalRows] = await Promise.all([
    baseQuery.orderBy(desc(tickets.createdAt)).limit(limit).offset(offset),
    db
      .select({ total: count() })
      .from(tickets)
      .innerJoin(clubs, eq(clubs.id, tickets.clubId))
      .innerJoin(owners, eq(owners.id, clubs.ownerId))
      .where(where),
  ])

  return {
    rows,
    total: totalRows[0]?.total ?? 0,
  }
}

export async function createTicket(
  clubId: number,
  input: TicketUpsertInput
): Promise<TicketWithClub> {
  const now = new Date()

  const [ticket] = await db
    .insert(tickets)
    .values({
      name: input.name,
      price: input.price,
      quantity: input.quantity,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status,
      type: input.type,
      clubId,
      updatedAt: now,
    })
    .returning()

  if (!ticket) {
    throw new Error('Ticket insert returned no row')
  }

  const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId)).limit(1)

  if (!club) {
    throw new Error('Club not found after ticket insert')
  }

  return { ticket, club }
}

export async function updateTicketByDocumentId(
  documentId: string,
  input: TicketUpsertInput
): Promise<TicketWithClub> {
  const now = new Date()

  const [ticket] = await db
    .update(tickets)
    .set({
      name: input.name,
      price: input.price,
      quantity: input.quantity,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status,
      type: input.type,
      updatedAt: now,
    })
    .where(eq(tickets.documentId, documentId))
    .returning()

  if (!ticket) {
    throw new Error('Ticket update returned no row')
  }

  const [club] = await db.select().from(clubs).where(eq(clubs.id, ticket.clubId)).limit(1)

  if (!club) {
    throw new Error('Club not found after ticket update')
  }

  return { ticket, club }
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
