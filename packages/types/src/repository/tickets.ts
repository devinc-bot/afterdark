import type { ClubSelect, EventSelect, TicketSelect } from '@afterdark/db/schema'
import type { TicketStatus, TicketType } from '../enums/ticket.ts'

export type TicketWithRelations = {
  ticket: TicketSelect
  event: EventSelect | null
  club: ClubSelect | null
}

export type TicketUpsertInput = {
  name: string
  price: number
  quantity: number
  description: string
  status: TicketStatus
  type: TicketType
  saleStartsAt?: Date | null
  saleEndsAt?: Date | null
  eventId?: number | null
}

export type ListTicketsByOwnerParams = {
  ownerDocumentId: string
  page: number
  limit: number
  status?: TicketStatus
  clubDocumentId?: string
}

export type PaginatedTicketsResult = {
  rows: TicketWithRelations[]
  total: number
}
