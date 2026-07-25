import type { LocationSelect, EventSelect, TicketSelect } from '@repo/db/schema'
import type { TicketSalesFilter, TicketStatus, TicketType } from '../enums/ticket.ts'

export type TicketWithRelations = {
  ticket: TicketSelect
  event: EventSelect | null
  location: LocationSelect | null
}

export type TicketWithRelationsAndSales = TicketWithRelations & {
  totalSold: number
  revenue: number
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
  locationDocumentId?: string
  salesFilter?: TicketSalesFilter
}

export type PaginatedTicketsResult = {
  rows: TicketWithRelationsAndSales[]
  total: number
}
