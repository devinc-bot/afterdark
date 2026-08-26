import { db } from '../../client.ts'
import { ticketTypes, type TicketTypeSelect } from '../../schema/ticket-type.ts'
import type { CreateTicketTypeInput } from '@repo/types'

export async function createTicketType(input: CreateTicketTypeInput): Promise<TicketTypeSelect> {
  const [ticketType] = await db.insert(ticketTypes).values(input).returning()

  if (!ticketType) {
    throw new Error('Ticket type insert returned no row')
  }

  return ticketType
}
