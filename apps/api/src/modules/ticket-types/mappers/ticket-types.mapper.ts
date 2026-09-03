import type { TicketTypeSelect } from '@repo/db'
import type { TicketTypeResponse } from '@repo/types'

export function toTicketTypeResponse(ticketType: TicketTypeSelect): TicketTypeResponse {
  return { documentId: ticketType.documentId, name: ticketType.name }
}
