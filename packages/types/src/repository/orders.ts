import type { PaymentProvider, PaymentStatus } from '../enums/payment.ts'
import type { TicketType } from '../enums/ticket.ts'

export type ListBuyerOrdersParams = {
  userDocumentId: string
  page: number
  limit: number
}

export type BuyerOrderSummaryRow = {
  documentId: string
  status: PaymentStatus | null
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

export type PaginatedBuyerOrdersResult = {
  rows: BuyerOrderSummaryRow[]
  total: number
}
