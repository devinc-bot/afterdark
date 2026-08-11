import type { OrderSelect } from '@repo/db'
import type { OrderResponse, PaymentStatus } from '@repo/types'

export function toOrderResponse(order: OrderSelect): OrderResponse {
  return {
    documentId: order.documentId,
    ticketId: String(order.ticketId),
    status: order.status as PaymentStatus,
    amount: order.amount,
    quantity: order.quantity,
    provider: order.provider,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}
