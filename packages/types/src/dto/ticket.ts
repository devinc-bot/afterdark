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
  eventName: string | null
  eventImageUrl: string | null
  locationId: string | null
  locationName: string | null
  /** Completed unit sales (`tickets_sold` via completed orders). */
  totalSold: number
  /** Sum of completed order amounts for this ticket. */
  revenue: number
  createdAt: Date
  updatedAt: Date
}

/** On-sale ticket offer on anonymous public event detail. */
export interface PublicPurchasableTicketResponse {
  documentId: string
  name: string
  price: number
  type: TicketType
  /** Units still available for purchase. */
  remainingQuantity: number
  saleStartsAt: Date | null
  saleEndsAt: Date | null
}

export interface PurchasedTicketResponse {
  documentId: string
  checkedIn: boolean
  usedAt: Date | null
  ticketName: string
  ticketType: TicketType
  eventName: string
  eventStartsAt: Date
  locationName: string
  eventImageUrl: string | null
}

export interface PurchasedTicketQrResponse {
  token: string
  expiresAt: Date
  ticket: PurchasedTicketResponse
}
