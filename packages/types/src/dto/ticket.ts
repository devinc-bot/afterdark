import type { TicketStatus, TicketType } from '../enums/ticket.ts'

export interface TicketResponse {
  documentId: string
  name: string
  price: number
  quantity: number
  status: TicketStatus
  description: string
  type: TicketType
  saleStartsAt: Date | null
  saleEndsAt: Date | null
  eventId: string | null
  clubId: string | null
  clubName: string | null
  createdAt: Date
  updatedAt: Date
}
