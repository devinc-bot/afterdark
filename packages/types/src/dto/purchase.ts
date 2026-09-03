import type { PaymentProvider } from '../enums/payment.ts'
import type { PaymentAttemptStatus, PurchaseStatus } from '../enums/purchase.ts'

/** Immutable ticket line captured when a checkout reservation is created. */
export interface PurchaseItemResponse {
  documentId: string
  ticketId: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

/** Provider payment attempt associated with one purchase. */
export interface PaymentResponse {
  documentId: string
  provider: PaymentProvider
  status: PaymentAttemptStatus
  amount: number
  currency: string
  paidAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** Buyer-facing commercial purchase, independent from individual payment attempts. */
export interface PurchaseResponse {
  documentId: string
  status: PurchaseStatus
  totalAmount: number
  currency: string
  expiresAt: Date | null
  confirmedAt: Date | null
  items: PurchaseItemResponse[]
  payments: PaymentResponse[]
  createdAt: Date
  updatedAt: Date
}

/** Buyer-owned purchase state sent by the private purchase stream. */
export interface PurchaseStreamSnapshot {
  purchaseDocumentId: string
  status: PurchaseStatus
  paymentStatus: PaymentAttemptStatus
  version: number
  expiresAt: Date | null
}
