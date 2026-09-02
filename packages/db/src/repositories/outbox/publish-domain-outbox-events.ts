import { sql } from 'drizzle-orm'
import { db } from '../../client.ts'
import type { DomainOutboxEventSelect } from '../../schema/domain-outbox-event.ts'

/**
 * Claims committed outbox rows with PostgreSQL row locks and marks them delivered.
 * SSE consumers still read the durable rows for catchup, so this is safe across API instances.
 */
export async function publishDomainOutboxEvents(
  now: Date,
  limit: number
): Promise<DomainOutboxEventSelect[]> {
  return db.transaction(async (tx) => {
    const claimed = await tx.execute<DomainOutboxEventSelect>(sql`
      with candidates as (
        select id
        from domain_outbox_events
        where published_at is null
        order by id
        for update skip locked
        limit ${limit}
      )
      update domain_outbox_events event
      set published_at = ${now},
          publish_attempts = event.publish_attempts + 1,
          locked_at = ${now},
          updated_at = ${now}
      from candidates
      where event.id = candidates.id
      returning event.*
    `)
    return claimed.rows
  })
}
