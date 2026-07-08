import { and, eq, type SQL } from 'drizzle-orm'
import { clubs } from '../../schema/club.ts'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'
import type { ListTicketsByOwnerParams } from '@afterdark/types'

export function buildOwnerTicketFilters({
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
