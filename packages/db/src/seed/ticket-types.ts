import { and, isNull, sql } from 'drizzle-orm'
import { ticketTypes } from '../schema/ticket-type.ts'
import { seedDb as db } from './client.ts'

const DEFAULT_TICKET_TYPE_NAMES = ['General', 'VIP'] as const

export async function seedDefaultTicketTypes(): Promise<void> {
  for (const name of DEFAULT_TICKET_TYPE_NAMES) {
    const [existing] = await db
      .select({ id: ticketTypes.id })
      .from(ticketTypes)
      .where(and(isNull(ticketTypes.ownerId), sql`lower(${ticketTypes.name}) = lower(${name})`))
      .limit(1)

    if (!existing) {
      await db.insert(ticketTypes).values({ name })
    }
  }
}

export async function findGlobalTicketTypeIdByName(name: string): Promise<number> {
  const [ticketType] = await db
    .select({ id: ticketTypes.id })
    .from(ticketTypes)
    .where(and(isNull(ticketTypes.ownerId), sql`lower(${ticketTypes.name}) = lower(${name})`))
    .limit(1)

  if (!ticketType) {
    throw new Error(`Global ticket type not found: ${name}`)
  }

  return ticketType.id
}
