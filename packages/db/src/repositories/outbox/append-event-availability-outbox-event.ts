import { sql } from 'drizzle-orm'
import { OUTBOX_AGGREGATE_TYPE, OUTBOX_EVENT_TYPE } from '@repo/types'
import type { Transaction } from '../../client.ts'
import { appendDomainOutboxEvent } from './append-domain-outbox-event.ts'

/** Increments the affected event version and records its public notification atomically. */
export async function appendEventAvailabilityOutboxEvent(
  tx: Transaction,
  ticketId: number,
  now: Date
): Promise<void> {
  const result = await tx.execute<{ documentId: string; availabilityVersion: number }>(sql`
    update events
    set availability_version = availability_version + 1,
        updated_at = ${now}
    where id = (select event_id from tickets where id = ${ticketId})
    returning document_id as "documentId", availability_version as "availabilityVersion"
  `)
  const event = result.rows[0]
  if (!event) return

  await appendDomainOutboxEvent(tx, {
    aggregateType: OUTBOX_AGGREGATE_TYPE.EVENT_AVAILABILITY,
    aggregateDocumentId: event.documentId,
    aggregateVersion: event.availabilityVersion,
    eventType: OUTBOX_EVENT_TYPE.EVENT_AVAILABILITY_UPDATED,
    payload: {
      eventDocumentId: event.documentId,
      version: event.availabilityVersion,
    },
    now,
  })
}
