import { and, asc, eq, gt } from 'drizzle-orm'
import { db } from '../../client.ts'
import { domainOutboxEvents } from '../../schema/domain-outbox-event.ts'

export type FindDomainOutboxEventsInput = {
  aggregateType: string
  aggregateDocumentId: string
  afterVersion: number
}

/** Reads durable aggregate events for SSE reconnection catchup. */
export async function findDomainOutboxEvents(input: FindDomainOutboxEventsInput) {
  return db
    .select()
    .from(domainOutboxEvents)
    .where(
      and(
        eq(domainOutboxEvents.aggregateType, input.aggregateType),
        eq(domainOutboxEvents.aggregateDocumentId, input.aggregateDocumentId),
        gt(domainOutboxEvents.aggregateVersion, input.afterVersion)
      )
    )
    .orderBy(asc(domainOutboxEvents.aggregateVersion))
}
