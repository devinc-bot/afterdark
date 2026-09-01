export const PURCHASE_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const

export type PurchaseStatus = (typeof PURCHASE_STATUS)[keyof typeof PURCHASE_STATUS]

export const INVENTORY_RESERVATION_STATUS = {
  ACTIVE: 'active',
  CONSUMED: 'consumed',
  RELEASED: 'released',
  EXPIRED: 'expired',
} as const

export type InventoryReservationStatus =
  (typeof INVENTORY_RESERVATION_STATUS)[keyof typeof INVENTORY_RESERVATION_STATUS]

export const PAYMENT_ATTEMPT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const

export type PaymentAttemptStatus =
  (typeof PAYMENT_ATTEMPT_STATUS)[keyof typeof PAYMENT_ATTEMPT_STATUS]

export const PAYMENT_WEBHOOK_EVENT_STATUS = {
  RECEIVED: 'received',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  FAILED: 'failed',
} as const

export type PaymentWebhookEventStatus =
  (typeof PAYMENT_WEBHOOK_EVENT_STATUS)[keyof typeof PAYMENT_WEBHOOK_EVENT_STATUS]

export const PAYMENT_RECONCILIATION_ERROR = {
  LATE_APPROVED_REQUIRES_MANUAL_REVIEW: 'late_approved_requires_manual_review',
  PROVIDER_FACT_MISMATCH: 'provider_fact_mismatch',
} as const

export type PaymentReconciliationError =
  (typeof PAYMENT_RECONCILIATION_ERROR)[keyof typeof PAYMENT_RECONCILIATION_ERROR]

export const CHECKOUT_RESERVATION_DURATION_MS = 15 * 60 * 1000

export const PAYMENT_CURRENCY = {
  ARS: 'ARS',
} as const

export type PaymentCurrency = (typeof PAYMENT_CURRENCY)[keyof typeof PAYMENT_CURRENCY]

export const OUTBOX_AGGREGATE_TYPE = {
  PURCHASE: 'purchase',
  EVENT_AVAILABILITY: 'event_availability',
} as const

export const OUTBOX_EVENT_TYPE = {
  PURCHASE_RESERVED: 'purchase.reserved',
  PURCHASE_RESERVATION_RELEASED: 'purchase.reservation_released',
  PURCHASE_PAYMENT_RECONCILED: 'purchase.payment_reconciled',
  PURCHASE_CONFIRMED: 'purchase.confirmed',
  EVENT_AVAILABILITY_UPDATED: 'event.availability.updated',
} as const
