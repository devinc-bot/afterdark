import { TICKET_CHECK_IN_OUTCOME, type TicketCheckInResponse } from '@repo/types'
import type { TicketCheckInContextRow } from '@repo/db'

export function toTicketCheckInResponse(
  context: TicketCheckInContextRow,
  checkedInAt: Date
): TicketCheckInResponse {
  return {
    outcome: TICKET_CHECK_IN_OUTCOME.SUCCESS,
    checkedInAt,
    ticket: {
      documentId: context.ticket.documentId,
      name: context.ticket.name,
      type: context.ticket.type,
    },
    event: {
      documentId: context.event.documentId,
      name: context.event.name,
      startsAt: context.event.startsAt,
    },
    location: {
      documentId: context.location.documentId,
      name: context.location.name,
    },
    purchaser: {
      documentId: context.purchaser.documentId,
      fullName: `${context.purchaser.name} ${context.purchaser.lastName}`.trim(),
      email: context.purchaser.email,
      phone: context.purchaser.phone || null,
    },
  }
}
