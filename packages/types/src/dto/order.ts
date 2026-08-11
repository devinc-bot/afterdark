import type { PaymentProvider, PaymentStatus } from '../enums/payment.ts'

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
