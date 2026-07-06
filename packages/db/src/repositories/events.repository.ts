import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '../client.ts'
import { clubs, type ClubSelect } from '../schema/club.ts'
import { events, type EventSelect } from '../schema/event.ts'
import { owners } from '../schema/owner.ts'
import { tickets } from '../schema/ticket.ts'

export type EventWithClub = {
  event: EventSelect
  club: ClubSelect
}

export type EventUpsertInput = {
  clubId: number
  name: string
  description: string
  startsAt: Date
  endsAt: Date
  status: EventSelect['status']
}

export type ListEventsByOwnerParams = {
  ownerDocumentId: string
  page: number
  limit: number
}

export type PaginatedEventsResult = {
  rows: EventWithClub[]
  total: number
}

export async function findEventOwnedByOwnerDocumentId(
  eventDocumentId: string,
  ownerDocumentId: string
): Promise<EventSelect | null> {
  const [row] = await db
    .select({ event: events })
    .from(events)
    .innerJoin(clubs, eq(clubs.id, events.clubId))
    .innerJoin(owners, eq(owners.id, clubs.ownerId))
    .where(and(eq(events.documentId, eventDocumentId), eq(owners.documentId, ownerDocumentId)))
    .limit(1)

  return row?.event ?? null
}

export async function findEventWithClubOwnedByOwnerDocumentId(
  eventDocumentId: string,
  ownerDocumentId: string
): Promise<EventWithClub | null> {
  const [row] = await eventsByOwnerQuery()
    .where(and(eq(events.documentId, eventDocumentId), eq(owners.documentId, ownerDocumentId)))
    .limit(1)

  return row ?? null
}

function eventsByOwnerQuery() {
  return db
    .select({
      event: events,
      club: clubs,
    })
    .from(events)
    .innerJoin(clubs, eq(clubs.id, events.clubId))
    .innerJoin(owners, eq(owners.id, clubs.ownerId))
}

export async function findEventsPaginatedByOwner(
  params: ListEventsByOwnerParams
): Promise<PaginatedEventsResult> {
  const { ownerDocumentId, page, limit } = params
  const offset = (page - 1) * limit
  const where = eq(owners.documentId, ownerDocumentId)

  const [rows, totalRows] = await Promise.all([
    eventsByOwnerQuery().where(where).orderBy(desc(events.startsAt)).limit(limit).offset(offset),
    db
      .select({ total: count() })
      .from(events)
      .innerJoin(clubs, eq(clubs.id, events.clubId))
      .innerJoin(owners, eq(owners.id, clubs.ownerId))
      .where(where),
  ])

  return {
    rows,
    total: totalRows[0]?.total ?? 0,
  }
}

export async function createEvent(input: EventUpsertInput): Promise<EventWithClub> {
  const now = new Date()

  const [event] = await db
    .insert(events)
    .values({
      clubId: input.clubId,
      name: input.name,
      description: input.description,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: input.status,
      updatedAt: now,
    })
    .returning()

  if (!event) {
    throw new Error('Event insert returned no row')
  }

  const [row] = await eventsByOwnerQuery().where(eq(events.id, event.id)).limit(1)

  if (!row) {
    throw new Error('Event not found after insert')
  }

  return row
}

export async function updateEventByDocumentId(
  documentId: string,
  input: EventUpsertInput
): Promise<EventWithClub> {
  const now = new Date()

  const [event] = await db
    .update(events)
    .set({
      clubId: input.clubId,
      name: input.name,
      description: input.description,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: input.status,
      updatedAt: now,
    })
    .where(eq(events.documentId, documentId))
    .returning()

  if (!event) {
    throw new Error('Event update returned no row')
  }

  const [row] = await eventsByOwnerQuery().where(eq(events.id, event.id)).limit(1)

  if (!row) {
    throw new Error('Event not found after update')
  }

  return row
}

export async function countTicketsByEventId(eventId: number): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(tickets)
    .where(eq(tickets.eventId, eventId))

  return row?.total ?? 0
}

export async function deleteEventByDocumentId(documentId: string): Promise<void> {
  const [deleted] = await db
    .delete(events)
    .where(eq(events.documentId, documentId))
    .returning({ id: events.id })

  if (!deleted) {
    throw new Error('Event delete returned no row')
  }
}
