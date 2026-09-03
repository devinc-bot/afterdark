import type { PaymentProvider, PaymentStatus } from '../enums/payment.ts'
import type { TicketTypeResponse } from '../dto/ticket-type.ts'

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
  ticketType: TicketTypeResponse
  eventId: string | null
  eventName: string | null
  eventStartsAt: Date | null
}

export type PaginatedBuyerOrdersResult = {
  rows: BuyerOrderSummaryRow[]
  total: number
}
