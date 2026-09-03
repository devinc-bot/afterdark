import type { Transaction } from '../../client.ts'
import { domainOutboxEvents } from '../../schema/domain-outbox-event.ts'

export type AppendDomainOutboxEventInput = {
  aggregateType: string
  aggregateDocumentId: string
  aggregateVersion: number
  eventType: string
  payload: Record<string, unknown>
  now: Date
}

/** Adds a domain event to the same transaction as its state transition. */
export async function appendDomainOutboxEvent(
  tx: Transaction,
  input: AppendDomainOutboxEventInput
): Promise<void> {
  await tx.insert(domainOutboxEvents).values({
    aggregateType: input.aggregateType,
    aggregateDocumentId: input.aggregateDocumentId,
    aggregateVersion: input.aggregateVersion,
    eventType: input.eventType,
    payload: input.payload,
    updatedAt: input.now,
  })
}
