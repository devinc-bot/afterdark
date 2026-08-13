import type { PaymentProvider, PaymentStatus } from '../enums/payment.ts'
import type { TicketType } from '../enums/ticket.ts'

/** Buyer-facing order. */
export interface OrderResponse {
  documentId: string
  ticketId: string
  status: PaymentStatus
  amount: number
  quantity: number
  provider: PaymentProvider
  paidAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** Response after creating a pending order and Checkout Pro preference. */
export interface CreateOrderResponse extends OrderResponse {
  checkoutUrl: string
}

/** Buyer-facing order summary for paginated order history. */
export interface BuyerOrderSummaryResponse {
  documentId: string
  status: PaymentStatus
  amount: number
  quantity: number
  provider: PaymentProvider
  paidAt: Date | null
  createdAt: Date
  updatedAt: Date
  ticketId: string
  ticketName: string
  ticketType: TicketType
  eventId: string | null
  eventName: string | null
  eventStartsAt: Date | null
}
