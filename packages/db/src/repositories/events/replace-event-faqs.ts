import { eq } from 'drizzle-orm'
import type { Transaction } from '../../client.ts'
import { eventFaqs, type EventFaqSelect } from '../../schema/event-faq.ts'
import type { EventFaqInput } from '@repo/types'

export async function replaceEventFaqs(
  tx: Transaction,
  eventId: number,
  faqs: EventFaqInput[]
): Promise<EventFaqSelect[]> {
  await tx.delete(eventFaqs).where(eq(eventFaqs.eventId, eventId))

  if (faqs.length === 0) {
    return []
  }

  const now = new Date()

  return tx
    .insert(eventFaqs)
    .values(
      faqs.map((faq, index) => ({
        eventId,
        question: faq.question,
        answer: faq.answer,
        sortOrder: index,
        updatedAt: now,
      }))
    )
    .returning()
}
