export const PAYMENT_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export const PAYMENT_PROVIDER = {
  MERCADO_PAGO: 'mercado_pago',
} as const

export type PaymentProvider = (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER]

export const MERCADO_PAGO_NOTIFICATION_TYPE = {
  PAYMENT: 'payment',
} as const

export type MercadoPagoNotificationType =
  (typeof MERCADO_PAGO_NOTIFICATION_TYPE)[keyof typeof MERCADO_PAGO_NOTIFICATION_TYPE]
