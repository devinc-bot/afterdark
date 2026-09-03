import type {
  ScannedTicketHistoryItem,
  ScannedTicketHistoryOperator,
  ScannedTicketHistoryRow,
} from '@repo/types'

export function toScannedTicketHistoryItem(row: ScannedTicketHistoryRow): ScannedTicketHistoryItem {
  const operator: ScannedTicketHistoryOperator | null = row.operator.accountId
    ? {
        fullName: row.operator.fullName,
        email: row.operator.email,
        role: row.operator.role,
      }
    : null

  return {
    purchaser: {
      fullName: `${row.purchaser.name} ${row.purchaser.lastName}`.trim(),
      email: row.purchaser.email,
      phone: row.purchaser.phone || null,
    },
    operator,
    ticket: {
      ticketType: row.ticket.ticketType,
    },
    scannedAt: row.scannedAt,
  }
}
