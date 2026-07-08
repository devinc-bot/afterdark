import { count, desc, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { clubs } from '../../schema/club.ts'
import { events } from '../../schema/event.ts'
import { owners } from '../../schema/owner.ts'
import { eventsByOwnerQuery } from './events-by-owner-query.ts'
import type { ListEventsByOwnerParams, PaginatedEventsResult } from '@afterdark/types'

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
