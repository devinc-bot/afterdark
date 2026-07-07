export const PAYMENT_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]
